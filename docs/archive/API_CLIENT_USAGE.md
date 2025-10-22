# API Client Developer Guide

## Overview
This project uses a centralized API client (`src/lib/api-client.ts`) for all frontend-backend communication, providing consistent error handling, retry logic, and type safety.

## Quick Start

### Import API Client
```typescript
import { postsApi, eventsApi, messagesApi, ApiClientError } from '@/lib/api-client';
```

### Basic Usage Examples

#### Posts API
```typescript
// Get all published posts with limit
const response = await postsApi.getAll({ 
  status: 'PUBLISHED', 
  limit: 3 
});
const posts = response.data;

// Get single post
const post = await postsApi.getById('post-id');

// Create new post
const newPost = await postsApi.create({
  title: 'New Post',
  content: 'Content here',
  status: 'DRAFT'
});

// Update post
await postsApi.update('post-id', { title: 'Updated Title' });

// Delete post
await postsApi.delete('post-id');
```

#### Events API
```typescript
// Get upcoming events
const events = await eventsApi.getAll({ 
  status: 'UPCOMING', 
  limit: 5 
});

// Create event
const newEvent = await eventsApi.create({
  title: 'Town Hall Meeting',
  startDate: '2024-12-01T19:00:00Z',
  location: 'City Hall'
});
```

#### Messages API
```typescript
// Get all messages
const messages = await messagesApi.getAll();

// Update message status
await messagesApi.updateStatus('message-id', 'IN_PROGRESS');
```

## Error Handling

### Standard Pattern
```typescript
try {
  const response = await postsApi.getAll();
  console.log('Success:', response.data);
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(`API Error (${error.statusCode}): ${error.message}`);
    // Handle specific HTTP status codes
    if (error.statusCode === 404) {
      // Handle not found
    } else if (error.statusCode >= 500) {
      // Handle server errors
    }
  } else {
    console.error('Network error:', error);
  }
}
```

### Error Types
- **ApiClientError**: HTTP errors with status codes
- **Network errors**: Timeout, connection failures
- **Validation errors**: 400 Bad Request with details

## Built-in Features

### Automatic Retry
- **3 retries** by default for failed requests
- **Exponential backoff**: 1s, 2s, 4s delays
- **Configurable** per request

### Timeout Handling
- **10 second** default timeout
- Automatic **AbortController** cleanup
- Clear timeout error messages

### Request Logging
All requests are logged with context:
```
[ApiClient] GET /api/posts - Attempt 1
[ApiClient] POST /api/events - Attempt 1
```

### Response Format
Standardized response structure:
```typescript
interface ApiClientResponse<T> {
  data: T;           // Your actual data
  message?: string;  // Success message
  success: boolean;  // Always true for successful responses
}
```

## Migration from fetch()

### Before (Old Pattern)
```typescript
const response = await fetch('/api/posts');
if (!response.ok) throw new Error('Failed');
const apiResponse = await response.json();
const data = apiResponse.success ? apiResponse.data : apiResponse;
setPosts(data);
```

### After (New Pattern)
```typescript
const response = await postsApi.getAll();
setPosts(response.data);
```

## Performance Benefits

1. **Reduced Boilerplate**: ~70% less code per API call
2. **Consistent Error Handling**: No more scattered try-catch blocks
3. **Type Safety**: Full TypeScript support with autocomplete
4. **Network Resilience**: Built-in retry and timeout handling
5. **Debugging**: Centralized logging for all API calls

## Advanced Configuration

### Custom API Client
```typescript
import { ApiClient } from '@/lib/api-client';

const customClient = new ApiClient('/api/v2', 15000, 5); // custom baseUrl, timeout, retries
```

### Direct Client Usage
```typescript
import { apiClient } from '@/lib/api-client';

// For custom endpoints not covered by specific APIs
const response = await apiClient.get('/custom-endpoint', { param: 'value' });
const result = await apiClient.post('/another-endpoint', { data: 'value' });
```

## Integration Checklist

When integrating API client into a new component:

- [ ] Remove old `fetch()` calls
- [ ] Import required APIs: `postsApi`, `eventsApi`, `messagesApi`
- [ ] Import `ApiClientError` for error handling
- [ ] Update error handling to use `instanceof ApiClientError`
- [ ] Remove backward compatibility code: `apiResponse.success ? apiResponse.data : apiResponse`
- [ ] Add console.log statements for debugging
- [ ] Test error scenarios (network failure, server errors)

## Files Using API Client

### Components
- `src/components/HirekSzekcio.tsx` - Homepage news section
- `src/app/admin/(withLayout)/posts/page.tsx` - Admin posts management
- `src/app/admin/(withLayout)/events/page.tsx` - Admin events management  
- `src/app/admin/(withLayout)/messages/page.tsx` - Admin messages management

### Benefits Achieved
- **Consistency**: All components use same error handling pattern
- **Maintainability**: Centralized API logic easy to update
- **Reliability**: Built-in retry logic reduces user-facing errors
- **Developer Experience**: Type-safe, autocomplete-enabled API calls

---

*Last updated: 2024-09 | API Client v1.0*