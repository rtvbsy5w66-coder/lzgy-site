import NextAuth, { DefaultSession } from "next-auth"
import { User_role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: User_role
    } & DefaultSession["user"]
  }

  interface User {
    role: User_role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: User_role
  }
}