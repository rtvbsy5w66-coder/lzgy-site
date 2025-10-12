import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function restoreOriginalSlides() {
  console.log("🔄 Restoring original slides...");

  // Delete current slides
  await prisma.slide.deleteMany();

  const originalSlides = [
    {
      id: '4712444a-ce6c-11ef-8049-a8eeb1a93d37',
      type: "GRADIENT" as const,
      title: "Építsük együtt a jövő Magyarországát",
      subtitle: "Modern megoldások, átlátható kormányzás, fenntartható fejlődés",
      order: 0,
      isActive: true,
      gradientFrom: "#6DAEF0",
      gradientTo: "#8DEBD1",
      mediaUrl: null,
      ctaText: "Programom megismerése",
      ctaLink: "/program"
    },
    {
      id: '4ab06a82-ce6c-11ef-8049-a8eeb1a93d37',
      type: "IMAGE" as const,
      title: "Közösségi találkozók",
      subtitle: "Találkozzunk személyesen és beszéljük meg a jövőt!",
      order: 1,
      isActive: true,
      gradientFrom: null,
      gradientTo: null,
      mediaUrl: "https://picsum.photos/1920/1080",
      ctaText: "Események",
      ctaLink: "/esemenyek"
    },
    {
      id: '4ab0863e-ce6c-11ef-8049-a8eeb1a93d37',
      type: "IMAGE" as const,
      title: "Fejlődő városok",
      subtitle: "Együtt egy modernebb Magyarországért",
      order: 2,
      isActive: true,
      gradientFrom: null,
      gradientTo: null,
      mediaUrl: "https://picsum.photos/1920/1080?random=2",
      ctaText: "Tervek",
      ctaLink: "/program"
    }
  ];

  for (const slide of originalSlides) {
    await prisma.slide.create({
      data: slide
    });
    console.log(`✓ Restored slide: ${slide.title}`);
  }

  console.log("🎉 Original slides restored successfully!");
}

restoreOriginalSlides()
  .catch((e) => {
    console.error("❌ Error restoring slides:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });