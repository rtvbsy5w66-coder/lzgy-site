// __tests__/api/posts.test.ts
import { POST, GET } from '@/app/api/posts/route';

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

describe('/api/posts', () => {
  describe('GET /api/posts', () => {
    it('should return consistent response format', async () => {
      const response = await GET(new MockNextRequest('http://localhost:3000/api/posts'));
      const data = await response.json();
      
      // Check consistent API response format
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(typeof data.message).toBe('string');
      expect(typeof data.timestamp).toBe('string');
    });

    it('should return posts with proper structure', async () => {
      const response = await GET(new MockNextRequest('http://localhost:3000/api/posts'));
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      
      // Check post structure
      const post = data.data[0];
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('content');
      expect(post).toHaveProperty('slug');
      expect(post).toHaveProperty('status');
      expect(post).toHaveProperty('category');
    });

    it('should filter by status parameter', async () => {
      const response = await GET(
        new MockNextRequest('http://localhost:3000/api/posts?status=PUBLISHED')
      );
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.message).toContain('PUBLISHED');
      data.data.forEach(post => {
        expect(post.status).toBe('PUBLISHED');
      });
    });

    it('should filter by category parameter', async () => {
      const response = await GET(
        new MockNextRequest('http://localhost:3000/api/posts?category=Környezetvédelem')
      );
      const data = await response.json();

      expect(data.success).toBe(true);
      if (data.data.length > 0) {
        data.data.forEach(post => {
          expect(post.category).toBe('Környezetvédelem');
        });
      }
    });

    it('should filter by both status and category', async () => {
      const response = await GET(
        new MockNextRequest('http://localhost:3000/api/posts?status=PUBLISHED&category=Oktatás')
      );
      const data = await response.json();

      expect(data.success).toBe(true);
      if (data.data.length > 0) {
        data.data.forEach(post => {
          expect(post.status).toBe('PUBLISHED');
          expect(post.category).toBe('Oktatás');
        });
      }
    });
  });

  describe('POST /api/posts', () => {
    it('should create post with valid data', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is a test post content.',
        category: 'Környezetvédelem',
        status: 'DRAFT'
      };

      const response = await POST(
        new MockNextRequest('http://localhost:3000/api/posts', {
          method: 'POST',
          body: postData
        })
      );

      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.message).toBe('Sikeresen létrehozva');
      expect(data.data).toHaveProperty('title', 'Test Post');
      expect(data.data).toHaveProperty('content', 'This is a test post content.');
      expect(data.data).toHaveProperty('slug');
      expect(response.status).toBe(201);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: '' // Missing content, empty title
      };

      const response = await POST(
        new MockNextRequest('http://localhost:3000/api/posts', {
          method: 'POST',
          body: invalidData
        })
      );

      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validációs hibák találhatók');
      expect(data.details).toHaveProperty('validationErrors');
      expect(Array.isArray(data.details.validationErrors)).toBe(true);
      expect(response.status).toBe(400);
    });

    it('should return validation errors for missing fields', async () => {
      const invalidData = {}; // Completely empty

      const response = await POST(
        new MockNextRequest('http://localhost:3000/api/posts', {
          method: 'POST',
          body: invalidData
        })
      );

      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.details.validationErrors).toContain('title mező kötelező');
      expect(data.details.validationErrors).toContain('content mező kötelező');
    });

    it('should set default status to DRAFT when not provided', async () => {
      const postData = {
        title: 'Test Post Without Status',
        content: 'Content without explicit status.'
      };

      const response = await POST(
        new MockNextRequest('http://localhost:3000/api/posts', {
          method: 'POST',
          body: postData
        })
      );

      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('DRAFT');
    });
  });
});