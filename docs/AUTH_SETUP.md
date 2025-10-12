# Authentication System Setup

## Overview

This application uses **NextAuth.js v4** with a custom database-based authentication system using **Prisma ORM** and **PostgreSQL**.

## Features

✅ **Dual Authentication Methods:**
- Google OAuth 2.0
- Email + Password (Credentials)

✅ **Role-Based Access Control (RBAC):**
- Admin role
- User role
- Editor role
- Moderator role

✅ **Session Management:**
- JWT-based sessions
- 24-hour session expiry
- Automatic session refresh

✅ **Security:**
- Bcrypt password hashing (10 salt rounds)
- Protected admin routes with middleware
- Email verification support

---

## Tech Stack

- **Next.js 14+** (App Router)
- **NextAuth.js v4.24.5**
- **Prisma ORM v6.16.3**
- **PostgreSQL** (via Neon)
- **bcryptjs v3.0.2**
- **TypeScript**

---

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-32-character-secret-here"
NEXTAUTH_URL="http://localhost:3000"  # or production URL

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Admin Emails (comma-separated)
ADMIN_EMAILS="admin@example.com,another@example.com"

# Admin User (for seed script)
ADMIN_EMAIL="plscallmegiorgio@gmail.com"
ADMIN_PASSWORD="admin123456"  # Change this!
ADMIN_NAME="Admin User"
```

### 2. Database Setup

The `User` model includes a `password` field for credentials authentication:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  password      String?   // Hashed password
  role          User_role @default(USER)
  // ... other fields
}
```

Push schema changes:

```bash
npx prisma db push
npx prisma generate
```

### 3. Create Admin User

Run the seed script to create an admin user:

```bash
npx tsx scripts/create-admin-user.ts
```

This will create an admin user with:
- **Email:** `plscallmegiorgio@gmail.com` (or from `ADMIN_EMAIL`)
- **Password:** `admin123456` (or from `ADMIN_PASSWORD`)
- **Role:** `ADMIN`

---

## Authentication Flow

### Google OAuth Flow

1. User clicks "Bejelentkezés Google-lal"
2. Redirected to Google consent screen
3. After approval, Google redirects back with code
4. NextAuth exchanges code for tokens
5. User session created with role from `ADMIN_EMAILS`

### Credentials Flow

1. User enters email + password
2. NextAuth calls `authorize()` function in CredentialsProvider
3. Password verified using `bcrypt.compare()`
4. If valid, user object returned and JWT token created
5. Session established with user role

---

## API Routes

### Login

**Google OAuth:**
```typescript
import { signIn } from "next-auth/react";

await signIn("google", {
  callbackUrl: "/admin",
  redirect: true
});
```

**Credentials:**
```typescript
await signIn("credentials", {
  email: "user@example.com",
  password: "password123",
  callbackUrl: "/admin",
  redirect: false
});
```

### Logout

```typescript
import { signOut } from "next-auth/react";

await signOut({ callbackUrl: "/" });
```

### Get Session (Client)

```typescript
import { useSession } from "next-auth/react";

function Component() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Please login</div>;

  return <div>Hello {session.user.email}!</div>;
}
```

### Get Session (Server)

```typescript
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return <div>Hello {session.user.email}!</div>;
}
```

---

## Route Protection

### Middleware Protection

Admin routes are automatically protected by [middleware.ts](../middleware.ts):

```typescript
// Protects all /admin/* routes except /admin/login
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
```

### Manual Protection (Server Component)

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return <div>Admin Content</div>;
}
```

### Manual Protection (Client Component)

```typescript
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return null;

  return <div>Admin Content</div>;
}
```

---

## User Management

### Creating Users Programmatically

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createUser(email: string, password: string, role: "USER" | "ADMIN") {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      emailVerified: new Date()
    }
  });

  return user;
}
```

### Updating User Password

```typescript
async function updatePassword(email: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });
}
```

---

## Security Best Practices

✅ **Password Hashing:**
- Using bcrypt with 10 salt rounds
- Never store plain-text passwords

✅ **Session Security:**
- JWT tokens signed with NEXTAUTH_SECRET
- 24-hour session expiry
- HTTP-only cookies

✅ **Environment Variables:**
- Never commit `.env` files
- Use different secrets for dev/prod
- Rotate secrets regularly

✅ **Role Checking:**
- Always verify user role on server-side
- Don't trust client-side role checks
- Use middleware for route protection

---

## Troubleshooting

### Login Loop Issue

If experiencing redirect loops:

1. Check `NEXTAUTH_URL` matches your domain
2. Verify `NEXTAUTH_SECRET` is set
3. Clear browser cookies
4. Check middleware configuration

### Google OAuth Errors

**redirect_uri_mismatch:**
- Add redirect URI to Google Console: `https://yourdomain.com/api/auth/callback/google`
- Ensure `NEXTAUTH_URL` matches domain

**Access Denied:**
- Check user email is in `ADMIN_EMAILS`
- Verify Google OAuth credentials

### Password Login Not Working

- Ensure user has `password` field set
- Check password is hashed with bcrypt
- Verify email exists in database
- Check console logs for detailed errors

---

## Testing

### Test Admin Login (Credentials)

```bash
# Visit http://localhost:3000/admin/login
# Click "Email és jelszó használata"
# Enter:
Email: plscallmegiorgio@gmail.com
Password: admin123456
```

### Test Google OAuth

```bash
# Visit http://localhost:3000/admin/login
# Click "Bejelentkezés Google-lal"
# Select Google account (must be in ADMIN_EMAILS)
```

---

## Migration from Old System

If migrating from a different auth system:

1. Export existing users
2. Hash passwords with bcrypt
3. Import to new User table
4. Update user role fields
5. Test login flows
6. Remove old auth code

---

## Deployment Checklist

- [ ] Set production `NEXTAUTH_URL`
- [ ] Generate new `NEXTAUTH_SECRET`
- [ ] Configure Google OAuth production redirect URIs
- [ ] Update `ADMIN_EMAILS` for production
- [ ] Test both login methods
- [ ] Verify admin route protection
- [ ] Check session persistence
- [ ] Monitor auth logs

---

## Further Documentation

- [NextAuth.js Docs](https://next-auth.js.org/)
- [Prisma Docs](https://www.prisma.io/docs)
- [bcrypt Docs](https://github.com/kelektiv/node.bcrypt.js)

---

**Created:** 2025-10-01
**Last Updated:** 2025-10-01
