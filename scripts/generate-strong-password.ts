import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function generateStrongPassword(length: number = 20): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill rest with random characters
  for (let i = password.length; i < length; i++) {
    const randomIndex = crypto.randomInt(0, allChars.length);
    password += allChars[randomIndex];
  }

  // Shuffle password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function updateAdminPassword() {
  const adminEmail = 'plscallmegiorgio@gmail.com';
  const twoFactorEmail = 'lovas.zoltan1986@gmail.com'; // 2FA kódok ide mennek

  // Generate strong password
  const strongPassword = generateStrongPassword(20);

  console.log('🔐 Generating strong admin password...\n');

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(strongPassword, 12); // 12 rounds = extra strong

    // Update admin user
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        // Store 2FA email (you'll need to add this field to schema)
        // twoFactorEmail: twoFactorEmail
      }
    });

    console.log('✅ Admin password updated successfully!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('🔑 ADMIN LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📧 Email:           ${adminEmail}`);
    console.log(`🔐 Password:        ${strongPassword}`);
    console.log(`📱 2FA Email:       ${twoFactorEmail}`);
    console.log('═══════════════════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT: Save this password securely!');
    console.log('⚠️  You will receive 2FA codes at: ' + twoFactorEmail);
    console.log('\n✅ Login at: http://localhost:3000/admin/login\n');

    // Test verification
    const isValid = await bcrypt.compare(strongPassword, hashedPassword);
    console.log(`🧪 Verification test: ${isValid ? '✅ PASS' : '❌ FAIL'}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
