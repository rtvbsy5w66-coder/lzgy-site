// __tests__/api/upload.test.ts
import { POST } from '@/app/api/upload/route';
import { promises as fs } from 'fs';
import path from 'path';

// Mock @vercel/blob
jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({
    url: 'https://blob.vercel-storage.com/test-file-abc123.jpg',
    pathname: 'test-file-abc123.jpg',
  }),
}));

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  },
  constants: {
    F_OK: 0,
  },
}));

// Mock NextRequest for testing
class MockNextRequest {
  public url: string;
  public method: string;
  public headers: Map<string, string>;
  public body: any;

  constructor(url: string, options: any = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map();
    this.body = options.body;
  }
  
  async formData() {
    return this.body;
  }
}

describe('Upload API', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock fs.access to throw (directory doesn't exist)
    (fs.access as jest.Mock).mockRejectedValue(new Error('ENOENT'));
    
    // Mock fs.mkdir to succeed
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    
    // Mock fs.writeFile to succeed
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Basic File Upload Validation', () => {
    it('should reject request without file', async () => {
      const formData = new FormData();

      const response = await POST(
        new MockNextRequest('http://localhost:3000/api/upload', {
          method: 'POST',
          body: formData
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Nincs feltöltött fájl');
    });

    it('should accept valid image file', async () => {
      // Valid JPEG file content
      const content = new Uint8Array([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, // JPEG header
        ...new Array(100).fill(0) // Image data
      ]);

      const fakeFile = new File([content], 'valid.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', fakeFile);

      const response = await POST(
        new MockNextRequest('http://localhost:3000/api/upload', {
          method: 'POST',
          body: formData
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('Kép sikeresen feltöltve');
      expect(data.type).toBe('image');
      expect(data.url).toContain('blob.vercel-storage.com');
    });

    it('should accept valid video file', async () => {
      const content = new Uint8Array([
        // MP4 header
        0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
        ...new Array(100).fill(0) // Video data
      ]);

      const fakeFile = new File([content], 'valid.mp4', { type: 'video/mp4' });
      const formData = new FormData();
      formData.append('file', fakeFile);

      const response = await POST(
        new MockNextRequest('http://localhost:3000/api/upload', {
          method: 'POST',
          body: formData
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('Videó sikeresen feltöltve');
      expect(data.type).toBe('video');
      expect(data.url).toContain('blob.vercel-storage.com');
    });

    it('should reject unsupported file types', async () => {
      const fakeFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', fakeFile);

      const response = await POST(
        new MockNextRequest('http://localhost:3000/api/upload', {
          method: 'POST',
          body: formData
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Csak kép vagy videó fájlok tölthetők fel');
    });
  });
});