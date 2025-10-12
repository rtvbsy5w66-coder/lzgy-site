// src/lib/api-client.ts - Centralized API Client with TypeScript & Error Handling

import { ApiResponse, ApiError } from '@/types/api';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiClientResponse<T> {
  data: T;
  message?: string;
  error?: string;
  success: boolean;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor(baseUrl: string = '/api', timeout: number = 10000, retries: number = 3) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
    this.defaultRetries = retries;
  }

  /**
   * Core request method with retry logic and timeout
   */
  private async request<T>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<ApiClientResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = this.defaultTimeout,
      retries = this.defaultRetries
    } = config;

    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
      ...(body && { body: JSON.stringify(body) }),
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`[ApiClient] ${method} ${url} - Attempt ${attempt + 1}`);
        
        const response = await fetch(url, requestConfig);
        clearTimeout(timeoutId);

        if (!response.ok) {
          // Handle HTTP errors
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }

          throw new ApiClientError(
            errorData.error || `Request failed with status ${response.status}`,
            response.status,
            errorData
          );
        }

        const result = await response.json();
        
        // Handle both new API format and legacy format
        if (this.isNewApiFormat(result)) {
          return {
            data: result.data,
            message: result.message,
            success: result.success,
          };
        } else {
          // Legacy format - direct data
          return {
            data: result,
            success: true,
          };
        }

      } catch (error) {
        clearTimeout(timeoutId);
        
        if (attempt === retries) {
          // Last attempt failed
          if (error instanceof ApiClientError) {
            throw error;
          }
          
          if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiClientError(
              `Request timeout after ${timeout}ms`,
              408
            );
          }

          throw new ApiClientError(
            `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            0,
            error
          );
        }

        // Wait before retry (exponential backoff)
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    throw new ApiClientError('Maximum retries exceeded', 500);
  }

  /**
   * Check if response is in new API format
   */
  private isNewApiFormat(data: any): data is ApiResponse {
    return data && typeof data === 'object' && 'success' in data && 'timestamp' in data;
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiClientResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Paginated GET request
   */
  async getPaginated<T>(
    endpoint: string,
    pagination: PaginationParams = {},
    filters?: Record<string, any>
  ): Promise<ApiClientResponse<T[]>> {
    const params = {
      ...pagination,
      ...filters,
    };
    return this.get<T[]>(endpoint, params);
  }
}

// Specific API methods for type safety
export class PostsApi {
  constructor(private client: ApiClient) {}

  async getAll(filters?: { status?: string; category?: string; limit?: number; page?: number }) {
    return this.client.get<any[]>('/posts', filters);
  }

  async getById(id: string) {
    return this.client.get<any>(`/posts/${id}`);
  }

  async create(data: any) {
    return this.client.post<any>('/posts', data);
  }

  async update(id: string, data: any) {
    return this.client.put<any>(`/posts/${id}`, data);
  }

  async delete(id: string) {
    return this.client.delete<any>(`/posts/${id}`);
  }
}

export class EventsApi {
  constructor(private client: ApiClient) {}

  async getAll(filters?: { status?: string; upcoming?: boolean; limit?: number }) {
    return this.client.get<any[]>('/events', filters);
  }

  async getById(id: string) {
    return this.client.get<any>(`/events/${id}`);
  }

  async create(data: any) {
    return this.client.post<any>('/events', data);
  }

  async update(id: string, data: any) {
    return this.client.put<any>(`/events/${id}`, data);
  }

  async delete(id: string) {
    return this.client.delete<any>(`/events/${id}`);
  }

  async register(id: string, data: any) {
    return this.client.post<any>(`/events/${id}/register`, data);
  }
}

export class MessagesApi {
  constructor(private client: ApiClient) {}

  async getAll() {
    return this.client.get<any[]>('/messages');
  }

  async getById(id: string) {
    return this.client.get<any>(`/messages/${id}`);
  }

  async create(data: any) {
    return this.client.post<any>('/messages', data);
  }

  async updateStatus(id: string, status: string) {
    return this.client.put<any>(`/messages/${id}`, { status });
  }

  async delete(id: string) {
    return this.client.delete<any>(`/messages/${id}`);
  }
}

// Main API client instance
export const apiClient = new ApiClient();

// Specific API instances
export const postsApi = new PostsApi(apiClient);
export const eventsApi = new EventsApi(apiClient);
export const messagesApi = new MessagesApi(apiClient);

// Hook for React components (optional)
export function useApiClient() {
  return {
    posts: postsApi,
    events: eventsApi,
    messages: messagesApi,
    client: apiClient,
  };
}