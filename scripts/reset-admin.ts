import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdmin() {
  const adminEmail = 'plscallmegiorgio@gmail.com';
  const adminPassword = 'admin123456';

  try {
    console.log('🗑️  Deleting existing admin user (if exists)...');

    // Delete existing admin
    await prisma.user.deleteMany({
      where: { email: adminEmail }
    });
    console.log('✅ Existing admin deleted');

    console.log('\n🔐 Creating fresh admin user...');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);

    // Create fresh bcrypt hash
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log(`   Bcrypt hash: ${hashedPassword.substring(0, 30)}...`);

    // Create new admin user
    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN'
      }
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`   ID: ${newAdmin.id}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Role: ${newAdmin.role}`);

    // Verify by reading back
    const verify = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    });

    console.log('\n🔍 Verification:');
    console.log(`   Password hash in DB: ${verify?.password?.substring(0, 30)}...`);

    // Test bcrypt comparison
    if (verify?.password) {
      const isMatch = await bcrypt.compare(adminPassword, verify.password);
      console.log(`   Bcrypt test: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }

    console.log('\n📋 Admin Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n✅ Login at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();
