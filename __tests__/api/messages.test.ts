// __tests__/api/messages.test.ts
import { POST, GET } from '@/app/api/messages/route';

// Mock NextRequest for testing
class MockNextRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map();
    this.body = options.body;
  }
  
  async json() {
    return this.body;
  }
}

describe('/api/messages', () => {
  describe('GET /api/messages', () => {
    it('should return consistent response format', async () => {
      const response = await GET();
      const data = await response.json();
      
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('POST /api/messages', () => {
    it('should create message with valid data', async () => {
      const messageData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
        phone: '123456789',
        district: 'XIII',
        preferredContact: 'email',
        newsletter: true
      };

      const response = await POST(
        new MockNextRequest('http://localhost:3000/api/messages', {
          method: 'POST',
          body: messageData
        })
      );

      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.message).toBe('Üzenet sikeresen elküldve');
      expect(data.data).toHaveProperty('name', 'John Doe');
      expect(data.data).toHaveProperty('email', 'john@example.com');
      expect(response.status).toBe(201);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'John Doe'
        // Missing email, subject, message
      };

      const response = await POST(
        new MockNextRequest('http://localhost:3000/api/messages', {
          method: 'POST',
          body: invalidData
        })
      );

      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validációs hibák találhatók');
      expect(data.details.validationErrors).toContain('email mező kötelező');
      expect(response.status).toBe(400);
    });

    it('should validate email format', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        subject: 'Test',
        message: 'Test message'
      };

      const response = await POST(
        new MockNextRequest('http://localhost:3000/api/messages', {
          method: 'POST',
          body: invalidData
        })
      );

      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error).toContain('email');
      expect(response.status).toBe(400);
    });

    it('should set default values for optional fields', async () => {
      const messageData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message'
        // No optional fields provided
      };

      const response = await POST(
        new MockNextRequest('http://localhost:3000/api/messages', {
          method: 'POST',
          body: messageData
        })
      );

      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('NEW');
      expect(data.data.preferredContact).toBe('email');
      expect(data.data.newsletter).toBe(false);
    });
  });
});