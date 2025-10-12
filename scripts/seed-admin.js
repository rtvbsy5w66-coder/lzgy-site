#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    console.log('🔐 Admin User Seeding Script');
    console.log('==========================\n');

    // Default admin credentials (change these!)
    const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@lovasoldal.hu';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

    console.log(`Username: ${defaultUsername}`);
    console.log(`Email: ${defaultEmail}`);
    console.log(`Password: ${defaultPassword.replace(/./g, '*')}\n`);

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: defaultUsername },
          { email: defaultEmail }
        ]
      }
    });

    if (existingAdmin) {
      console.log('❌ Admin user már létezik ezzel a felhasználónévvel vagy email címmel.');
      console.log(`   Existing user: ${existingAdmin.username} (${existingAdmin.email})`);
      process.exit(1);
    }

    // Hash password
    console.log('🔒 Password hashing...');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await prisma.admin.create({
      data: {
        username: defaultUsername,
        email: defaultEmail,
        passwordHash,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Admin user sikeresen létrehozva!');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Created: ${admin.createdAt.toLocaleString('hu-HU')}`);

    console.log('\n🚨 BIZTONSÁGI FIGYELMEZTETÉS:');
    console.log('   - Jelentkezzen be és változtassa meg a jelszót!');
    console.log('   - Ne használja az alapértelmezett jelszót éles környezetben!');
    console.log(`   - Login URL: http://localhost:3000/admin/login\n`);

  } catch (error) {
    console.error('❌ Hiba történt az admin user létrehozásakor:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();