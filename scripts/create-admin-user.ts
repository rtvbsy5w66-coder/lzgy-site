import { PrismaClient, User_role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log("🔐 Creating admin user...");

  const email = process.env.ADMIN_EMAIL || "plscallmegiorgio@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "admin123456";
  const name = process.env.ADMIN_NAME || "Admin User";

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log(`✅ Admin user already exists: ${email}`);
      console.log(`   Role: ${existingAdmin.role}`);

      // Update password if provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            role: User_role.ADMIN
          }
        });
        console.log(`✅ Password updated for: ${email}`);
      }

      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: User_role.ADMIN,
        emailVerified: new Date() // Mark as verified
      }
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Password: ${password}`);
    console.log(`\n🔑 You can now login at: /admin/login`);

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
