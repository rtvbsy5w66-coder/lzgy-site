import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  const adminEmail = 'plscallmegiorgio@gmail.com';
  const adminPassword = 'admin123456';

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log(`✅ Admin user already exists: ${adminEmail}`);

      // Update password if needed
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          name: 'Admin User'
        }
      });
      console.log('✅ Admin password updated successfully');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN'
        }
      });
      console.log(`✅ Admin user created: ${adminEmail}`);
    }

    console.log('\n📋 Admin Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n✅ You can now login at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
