import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Resend } from 'resend';

const prisma = new PrismaClient();

// Generate a strong random password
function generatePassword(length: number = 16): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}

async function resetAdminPassword() {
  try {
    const adminEmail = 'plscallmegiorgio@gmail.com';

    console.log('🔐 Resetting admin password...\n');

    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log(`✅ Admin found: ${admin.email}`);

    // Generate new password
    const newPassword = generatePassword(16);
    console.log(`\n🔑 New password generated: ${newPassword}\n`);

    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });

    console.log('✅ Password updated in database');

    // Send email with new password
    if (process.env.RESEND_API_KEY) {
      console.log('\n📧 Sending email...');

      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailResult = await resend.emails.send({
        from: 'Lovas Zoltán György <noreply@lovaszoltan.hu>',
        to: adminEmail,
        subject: 'Admin jelszó visszaállítva',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">Admin Jelszó Visszaállítva</h2>

                <p>Kedves Admin!</p>

                <p>Az admin jelszavad sikeresen vissza lett állítva.</p>

                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Email:</strong> ${adminEmail}</p>
                  <p style="margin: 10px 0 0 0;"><strong>Új jelszó:</strong></p>
                  <code style="display: block; background-color: #1f2937; color: #10b981; padding: 15px; border-radius: 4px; font-size: 18px; margin-top: 10px; word-break: break-all;">
                    ${newPassword}
                  </code>
                </div>

                <p><strong>⚠️ FONTOS:</strong></p>
                <ul>
                  <li>Jelentkezz be azonnal ezzel az új jelszóval</li>
                  <li>Változtasd meg a jelszót a bejelentkezés után a biztonság érdekében</li>
                  <li>Ne oszd meg senkivel ezt az emailt</li>
                </ul>

                <p style="margin-top: 30px;">
                  <a href="https://lovas-political-site-ten.vercel.app/admin/login"
                     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Bejelentkezés az Admin Felületre
                  </a>
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                <p style="font-size: 12px; color: #6b7280;">
                  Ez egy automatikus email a Lovas Zoltán György weboldalától.
                </p>
              </div>
            </body>
          </html>
        `,
      });

      console.log('✅ Email sent successfully!');
      console.log(`   Email ID: ${emailResult.data?.id}`);
    } else {
      console.log('\n⚠️  RESEND_API_KEY not found - email not sent');
      console.log('Please save this password manually:');
      console.log(`\n   Email: ${adminEmail}`);
      console.log(`   Password: ${newPassword}\n`);
    }

    console.log('\n✅ Admin password reset complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
