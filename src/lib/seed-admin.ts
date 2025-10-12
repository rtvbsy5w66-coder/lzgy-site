import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function createAdminUser(
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string; admin?: any }> {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingAdmin) {
      return {
        success: false,
        message: 'Admin user már létezik ezzel a felhasználónévvel vagy email címmel.'
      };
    }

    // Hash password with bcrypt
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const admin = await prisma.admin.create({
      data: {
        id: crypto.randomUUID(),
        username,
        email,
        passwordHash,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`✅ Admin user created successfully: ${username} (${email})`);

    return {
      success: true,
      message: 'Admin user sikeresen létrehozva.',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        createdAt: admin.createdAt
      }
    };

  } catch (error) {
    console.error('Error creating admin user:', error);
    return {
      success: false,
      message: 'Hiba történt az admin user létrehozásakor.'
    };
  }
}

export async function listAdminUsers(): Promise<any[]> {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return admins;
  } catch (error) {
    console.error('Error listing admin users:', error);
    return [];
  }
}

export async function deactivateAdminUser(
  identifier: string
): Promise<{ success: boolean; message: string }> {
  try {
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { id: identifier },
          { username: identifier },
          { email: identifier }
        ]
      }
    });

    if (!admin) {
      return {
        success: false,
        message: 'Admin user nem található.'
      };
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    });

    console.log(`🔒 Admin user deactivated: ${admin.username}`);

    return {
      success: true,
      message: 'Admin user sikeresen deaktiválva.'
    };

  } catch (error) {
    console.error('Error deactivating admin user:', error);
    return {
      success: false,
      message: 'Hiba történt az admin user deaktiválásakor.'
    };
  }
}