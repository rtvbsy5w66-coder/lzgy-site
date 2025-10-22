# CSRF Védelem - Frontend Implementációs Útmutató

## 📋 Miért Szükséges?

A CSRF (Cross-Site Request Forgery) támadás során egy rossz személyű harmadik fél
azt kényszeríti ki, hogy a bejelentkezett felhasználó nevében végezzen műveleteket.

**Példa támadás:**
```html
<!-- Rossz oldal: evil.com -->
<form action="https://lovas-site.com/api/petition/sign" method="POST">
  <input type="hidden" name="petitionId" value="123" />
</form>
<script>
  document.forms[0].submit(); // Automatikus submit
</script>
```

Ha nincs CSRF védelem, ez aláírja a petíciót a felhasználó nevében!

**Megoldás:** CSRF token - csak az eredeti oldal ismeri.

---

## 🚀 Implementáció

### 1. useCSRF Hook Használat

#### Alapvető Példa

```tsx
'use client';

import { useCSRF } from '@/hooks/useCSRF';
import { useState } from 'react';

export function LoginForm() {
  const { csrfToken, loading, error } = useCSRF();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken, // ← CSRF token header
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Login failed:', error);
      return;
    }

    const data = await response.json();
    console.log('Login success:', data);
  };

  if (loading) {
    return <div>Töltés...</div>;
  }

  if (error) {
    return <div>Hiba a token betöltése során: {error.message}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Jelszó"
        required
      />
      <button type="submit">Bejelentkezés</button>
    </form>
  );
}
```

#### withCSRFToken Helper Használat

```tsx
'use client';

import { useCSRF, withCSRFToken } from '@/hooks/useCSRF';

export function PetitionSignForm({ petitionId }: { petitionId: string }) {
  const { csrfToken } = useCSRF();

  const handleSign = async () => {
    const headers = withCSRFToken(
      {
        'Content-Type': 'application/json',
      },
      csrfToken
    );

    await fetch(`/api/petitions/${petitionId}/sign`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'John Doe' }),
    });
  };

  return <button onClick={handleSign}>Aláírás</button>;
}
```

---

### 2. Server Actions (Next.js 14+)

```tsx
'use client';

import { useCSRF } from '@/hooks/useCSRF';
import { useState } from 'react';

export function ContactForm() {
  const { csrfToken } = useCSRF();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(formData: FormData) {
    // Hozzáadjuk a CSRF tokent a form data-hoz
    formData.append('csrfToken', csrfToken);

    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData,
    });

    // ...handle response
  }

  return (
    <form action={handleSubmit}>
      <input
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Küldés</button>
    </form>
  );
}
```

**Backend handling:**

```typescript
// src/app/api/contact/route.ts
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const csrfToken = formData.get('csrfToken') as string;

  // CSRF validation automatikusan történik a security middleware-ben
  // De ha manuálisan kell:
  if (!validateCSRFToken(csrfToken)) {
    return NextResponse.json(
      { error: 'Érvénytelen CSRF token' },
      { status: 403 }
    );
  }

  // ...rest of logic
}
```

---

### 3. Axios/Custom Fetch Wrapper

```typescript
// src/lib/api-client.ts
import { useCSRF } from '@/hooks/useCSRF';

/**
 * CSRF-védett API client
 */
export function useApiClient() {
  const { csrfToken } = useCSRF();

  async function post<T>(
    url: string,
    data: unknown
  ): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async function put<T>(
    url: string,
    data: unknown
  ): Promise<T> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async function del<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  return { post, put, del };
}

// Használat
export function MyComponent() {
  const api = useApiClient();

  const handleSubmit = async () => {
    await api.post('/api/petitions/123/sign', {
      name: 'John Doe',
    });
  };

  return <button onClick={handleSubmit}>Aláírás</button>;
}
```

---

### 4. React Query Integration

```typescript
// src/hooks/usePetitionSign.ts
import { useMutation } from '@tanstack/react-query';
import { useCSRF } from '@/hooks/useCSRF';

export function usePetitionSign(petitionId: string) {
  const { csrfToken } = useCSRF();

  return useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const response = await fetch(`/api/petitions/${petitionId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Petition sign failed');
      }

      return response.json();
    },
  });
}

// Komponens
export function PetitionSignButton({ petitionId }: { petitionId: string }) {
  const { mutate, isPending } = usePetitionSign(petitionId);

  return (
    <button
      onClick={() => mutate({ name: 'John', email: 'john@example.com' })}
      disabled={isPending}
    >
      {isPending ? 'Aláírás...' : 'Aláírás'}
    </button>
  );
}
```

---

## 🧪 Tesztelés

### Unit Test (useCSRF hook)

```typescript
// __tests__/useCSRF.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useCSRF } from '@/hooks/useCSRF';

global.fetch = jest.fn();

describe('useCSRF', () => {
  it('should fetch CSRF token on mount', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'test-token-123',
        expires: Date.now() + 30 * 60 * 1000,
      }),
    });

    const { result } = renderHook(() => useCSRF());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.csrfToken).toBe('test-token-123');
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCSRF());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.csrfToken).toBe('');
  });
});
```

### Integration Test

```typescript
// __tests__/csrf-protection.test.ts
import { POST } from '@/app/api/petitions/[id]/sign/route';
import { NextRequest } from 'next/server';

describe('CSRF Protection', () => {
  it('should reject requests without CSRF token', async () => {
    const req = new NextRequest('http://localhost/api/petitions/123/sign', {
      method: 'POST',
      body: JSON.stringify({ name: 'John' }),
    });

    const response = await POST(req, { params: { id: '123' } });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.code).toBe('CSRF_TOKEN_MISSING');
  });

  it('should accept requests with valid CSRF token', async () => {
    const validToken = generateCSRFToken(); // Helper function

    const req = new NextRequest('http://localhost/api/petitions/123/sign', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': validToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'John' }),
    });

    const response = await POST(req, { params: { id: '123' } });

    expect(response.status).not.toBe(403);
  });
});
```

---

## 🔒 Best Practices

### 1. **Mindig használj CSRF tokent POST/PUT/DELETE kéréseknél**

```tsx
// ❌ ROSSZ - Nincs CSRF védelem
await fetch('/api/petition/sign', {
  method: 'POST',
  body: JSON.stringify(data),
});

// ✅ JÓ - CSRF token használat
const { csrfToken } = useCSRF();
await fetch('/api/petition/sign', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(data),
});
```

### 2. **Token auto-refresh**

A `useCSRF` hook automatikusan frissíti a tokent lejárat előtt 5 perccel.
Ha manuális refresh kell:

```tsx
const { csrfToken, refresh } = useCSRF();

// Manuális refresh gomb
<button onClick={refresh}>Token frissítése</button>
```

### 3. **Error Handling**

```tsx
const { csrfToken, error } = useCSRF();

if (error) {
  // Token fetch hiba kezelése
  return (
    <div className="error">
      <p>Biztonsági token betöltése sikertelen.</p>
      <button onClick={() => window.location.reload()}>
        Oldal újratöltése
      </button>
    </div>
  );
}
```

### 4. **Loading State**

```tsx
const { csrfToken, loading } = useCSRF();

if (loading) {
  return <Spinner />;
}

// Form csak akkor jelenik meg, ha a token betöltődött
return <MyForm csrfToken={csrfToken} />;
```

---

## 🐛 Troubleshooting

### Probléma: 403 Forbidden "CSRF token hiányzik"

**Megoldás:**
```tsx
// Ellenőrizd, hogy a header név helyes-e
headers: {
  'X-CSRF-Token': csrfToken, // ✅ Kisbetűs x, nagybetűs CSRF
}
```

### Probléma: 403 Forbidden "Érvénytelen CSRF token"

**Okok:**
1. Token lejárt (30 perc múlva)
2. CSRF_SECRET változott a szerveren
3. Token másolás hiba

**Megoldás:**
```tsx
const { refresh } = useCSRF();

// Token refresh próbálkozás
try {
  await api.post('/api/endpoint', data);
} catch (error) {
  if (error.code === 'CSRF_TOKEN_INVALID') {
    await refresh(); // Új token kérése
    await api.post('/api/endpoint', data); // Retry
  }
}
```

### Probléma: useCSRF loading örökké tart

**Megoldás:**
```bash
# Ellenőrizd az API endpoint-ot
curl http://localhost:3000/api/csrf-token

# Várható válasz:
# {"token":"...","expires":...}
```

---

## ✅ Checklist

- [ ] `useCSRF` hook implementálva minden form komponensben
- [ ] `X-CSRF-Token` header minden POST/PUT/DELETE kérésben
- [ ] Error handling implementálva
- [ ] Loading state kezelve
- [ ] Unit tesztek írva
- [ ] Integration tesztek írva
- [ ] Token auto-refresh működik

**Ha minden ✅ → CSRF Protection ACTIVE! 🔒**

