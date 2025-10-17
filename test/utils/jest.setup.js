// jest.setup.js
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from 'util';

// Global polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Next.js API globals
Object.defineProperty(global, 'Request', {
  value: class Request {
    constructor(input, init = {}) {
      this.url = input;
      this.method = init.method || 'GET';
      this.headers = new Headers(init.headers);
      this.body = init.body;
    }
  }
});

Object.defineProperty(global, 'Response', {
  value: class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.headers = new Headers(init.headers);
    }
    
    async json() {
      return JSON.parse(this.body);
    }
  }
});

Object.defineProperty(global, 'Headers', {
  value: class Headers {
    constructor(init = {}) {
      this.map = new Map(Object.entries(init));
    }
    
    get(name) {
      return this.map.get(name.toLowerCase());
    }
    
    set(name, value) {
      this.map.set(name.toLowerCase(), value);
    }
  }
});

Object.defineProperty(global, 'FormData', {
  value: class FormData {
    constructor() {
      this.data = new Map();
    }
    
    append(name, value) {
      this.data.set(name, value);
    }
    
    get(name) {
      return this.data.get(name);
    }
  }
});

Object.defineProperty(global, 'File', {
  value: class File {
    constructor(bits, name, options = {}) {
      this.bits = bits;
      this.name = name;
      this.type = options.type || '';
      this.size = bits.reduce((acc, bit) => acc + bit.length, 0);
    }
    
    async arrayBuffer() {
      const uint8Array = new Uint8Array(this.size);
      let offset = 0;
      for (const bit of this.bits) {
        if (typeof bit === 'string') {
          const encoded = new TextEncoder().encode(bit);
          uint8Array.set(encoded, offset);
          offset += encoded.length;
        } else {
          uint8Array.set(bit, offset);
          offset += bit.length;
        }
      }
      return uint8Array.buffer;
    }
  }
});

// Mock Next.js routing
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: "",
      asPath: "",
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
  usePathname() {
    return "";
  },
}));

// Mock process.cwd()
process.cwd = () => "/fake/path";

// Mock fs promises
jest.mock("fs/promises", () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init = {}) => ({
      json: () => Promise.resolve(data),
      status: init.status || 200,
    })),
  },
}));

// Mock Prisma client for tests
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      create: jest.fn().mockResolvedValue({
        id: 'test-post-id',
        title: 'Test Post',
        content: 'This is a test post content.',
        slug: 'test-post',
        status: 'DRAFT',
        imageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    event: {
      create: jest.fn().mockResolvedValue({
        id: 'test-event-id',
        title: 'Test Event',
        description: 'Test event description',
        location: 'Test Location',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING',
        imageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    contact: {
      create: jest.fn().mockImplementation((args) => Promise.resolve({
        id: 'test-contact-id',
        name: args.data.name,
        email: args.data.email,
        subject: args.data.subject,
        message: args.data.message,
        phone: args.data.phone,
        district: args.data.district,
        preferredContact: args.data.preferredContact,
        newsletter: args.data.newsletter,
        status: args.data.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));

// Mock problematic modules
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

// Global setup
global.fetch = jest.fn();
