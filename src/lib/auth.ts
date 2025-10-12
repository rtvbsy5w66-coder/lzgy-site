import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { User_role } from "@prisma/client";
import { validateAuthEnvironment } from "./env-validation";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "./email";

const prisma = new PrismaClient();

// Environment variables validálás
validateAuthEnvironment();

// NextAuth.js configuration
export const authOptions: NextAuthOptions = {
  // DEBUG KONFIGURÁCIÓ
  debug: process.env.NODE_ENV === "development" || process.env.NEXTAUTH_DEBUG === "true",

  logger: {
    error(code, metadata) {
      console.error(`[NextAuth Error] ${new Date().toISOString()} - ${code}:`, metadata);
    },
    warn(code) {
      console.warn(`[NextAuth Warning] ${new Date().toISOString()} - ${code}`);
    },
    debug(code, metadata) {
      if (process.env.NEXTAUTH_DEBUG === "true") {
        console.log(`[NextAuth Debug] ${new Date().toISOString()} - ${code}:`, metadata);
      }
    }
  },

  // NOTE: Adapter removed because we're using JWT strategy for Credentials provider
  // adapter: PrismaAdapter(prisma) as any,

  providers: [
    // Google OAuth Provider (CSAK USEREKNEK - automatikus regisztráció + login)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
          access_type: "offline"
        }
      }
    }),

    // Credentials Provider (Email + Password - CSAK ADMINOKNAK!)
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[Credentials] Missing email or password');
          return null;
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            console.log('[Credentials] User not found or no password set');
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log('[Credentials] Invalid password');
            return null;
          }

          console.log(`[Credentials] Login successful: ${user.email}`);

          // Return user object (will be passed to JWT callback)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image
          };
        } catch (error) {
          console.error('[Credentials] Authorization error:', error);
          return null;
        }
      }
    }),

    // Passwordless Provider (Email + 6-digit Code - USEREKNEK!)
    CredentialsProvider({
      id: "passwordless",
      name: "Email Code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          console.log('[Passwordless] Missing email or code');
          return null;
        }

        try {
          const normalizedEmail = credentials.email.toLowerCase().trim();
          const normalizedCode = credentials.code.trim();

          // Find verification token
          const token = await prisma.verificationToken.findFirst({
            where: {
              email: normalizedEmail,
              code: normalizedCode,
              used: false,
              expiresAt: {
                gte: new Date(),
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          if (!token) {
            console.log(`[Passwordless] Invalid or expired code for ${normalizedEmail}`);
            return null;
          }

          // Mark code as used
          await prisma.verificationToken.update({
            where: { id: token.id },
            data: {
              used: true,
              usedAt: new Date(),
            },
          });

          // Find or create user
          let user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!user) {
            console.log(`[Passwordless] Creating new user for ${normalizedEmail}`);
            user = await prisma.user.create({
              data: {
                email: normalizedEmail,
                name: normalizedEmail.split('@')[0],
                role: 'USER',
              },
            });
          }

          console.log(`[Passwordless] ✅ Login successful: ${user.email}`);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image
          };
        } catch (error) {
          console.error('[Passwordless] Authorization error:', error);
          return null;
        }
      }
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log(`[SignIn Callback] Starting validation for: ${user.email}`);
      console.log(`[SignIn Callback] Provider: ${account?.provider}`);

      // Check if this is first-time login and send welcome email
      if (user.email && user.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { welcomeEmailSent: true, name: true, email: true }
          });

          if (dbUser && !dbUser.welcomeEmailSent) {
            console.log(`[SignIn Callback] First-time login detected for: ${user.email}`);

            // Send welcome email in the background (don't wait for it)
            sendWelcomeEmail(
              dbUser.email || user.email,
              dbUser.name || user.name || 'Kedves Felhasználó'
            ).then((result) => {
              if (result.success) {
                console.log(`[Welcome Email] Successfully sent to: ${user.email}`);
                // Mark as sent in database
                prisma.user.update({
                  where: { id: user.id },
                  data: { welcomeEmailSent: true }
                }).catch(err => console.error('[Welcome Email] Failed to update flag:', err));
              } else {
                console.error(`[Welcome Email] Failed to send to: ${user.email}`);
              }
            }).catch(err => console.error('[Welcome Email] Error:', err));
          }
        } catch (error) {
          console.error('[SignIn Callback] Error checking/sending welcome email:', error);
          // Continue with login even if welcome email fails
        }
      }

      // Allow Google OAuth sign-ins
      if (account?.provider === 'google' && user.email) {
        console.log(`[SignIn Callback] APPROVED - Google login: ${user.email}`);
        return true;
      }

      // Allow Credentials provider sign-ins (admin login)
      if (account?.provider === 'credentials' && user.email) {
        console.log(`[SignIn Callback] APPROVED - Credentials login: ${user.email}`);
        return true;
      }

      // Allow Passwordless provider sign-ins (email code)
      if (account?.provider === 'passwordless' && user.email) {
        console.log(`[SignIn Callback] APPROVED - Passwordless login: ${user.email}`);
        return true;
      }

      console.log(`[SignIn Callback] REJECTED - Invalid provider or missing email`);
      return false;
    },

    async session({ session, token }) {
      console.log(`[Session Callback] Creating session from token:`, {
        sessionEmail: session.user?.email,
        tokenId: token.id,
        tokenRole: token.role
      });

      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as User_role;

        // Fetch fresh user data for displayName and phoneNumber
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              displayName: true,
              phoneNumber: true,
              role: true,
              name: true,
              email: true,
              image: true
            }
          });

          if (freshUser) {
            (session.user as any).displayName = freshUser.displayName;
            (session.user as any).phoneNumber = freshUser.phoneNumber;
            session.user.role = freshUser.role;
            session.user.name = freshUser.name;
            session.user.email = freshUser.email;
            session.user.image = freshUser.image;
          }
        } catch (error) {
          console.error('[Session Callback] Error fetching fresh user data:', error);
        }

        console.log(`[Session Callback] Session created for: ${session.user.email} with role: ${session.user.role}`);
      }

      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        
        // Determine role: check if user is admin, otherwise assign USER role  
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [
          'admin@lovaszoltan.hu',
          'plscallmegiorgio@gmail.com'
        ];
        
        if (adminEmails.includes(token.email || '')) {
          token.role = User_role.ADMIN;
        } else {
          token.role = user.role || User_role.USER;
        }
        
        console.log(`[JWT Callback] JWT token updated for user: ${user.id} with role: ${token.role}`);
      }
      return token;
    }
  },

  session: {
    strategy: "jwt", // Changed from "database" to support Credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 days - hosszú session
    updateAge: 24 * 60 * 60, // Frissítés naponta egyszer
  },

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 nap
      },
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  }
};

import NextAuth, { getServerSession } from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Helper function to get session on server side (App Router)
export const auth = () => getServerSession(authOptions);
