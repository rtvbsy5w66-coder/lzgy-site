// Quick test to create a partner directly in the database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestPartner() {
  try {
    const partner = await prisma.partner.create({
      data: {
        name: "Quick Test Banner",
        description: "Test banner from script",
        imageUrl: "/uploads/banners/banner-c06514ef-74cb-467f-b05f-fd56b764fd2a.png", // Use existing uploaded file
        link: "https://example.com",
        category: "SPONSOR",
        width: 600,
        height: 200,
        sortOrder: 99,
        isActive: true
      }
    });

    console.log("✅ Test partner created:", partner);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPartner();