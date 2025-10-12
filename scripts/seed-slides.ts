import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedSlides() {
  console.log("🎯 Seeding slides...");

  // Delete existing slides
  await prisma.slide.deleteMany();

  const slides = [
    {
      type: "IMAGE",
      title: "Üdvözöljük a Mindenki Magyarországa Néppárt weboldalán!",
      subtitle: "Csatlakozzon hozzánk a változásért! Együtt építsük fel a jövő Magyarországát.",
      mediaUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1920&h=1080&fit=crop",
      ctaText: "Tudjon meg többet",
      ctaLink: "/program",
      order: 1,
      isActive: true
    },
    {
      type: "IMAGE",
      title: "Politikai Programom",
      subtitle: "Ismerje meg részletes terveimet az ország fejlesztésére és a problémák megoldására.",
      mediaUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=1080&fit=crop",
      ctaText: "Program megtekintése",
      ctaLink: "/program",
      order: 2,
      isActive: true
    },
    {
      type: "GRADIENT",
      title: "Csatlakozzon közösségünkhöz!",
      subtitle: "Legyen része a változásnak! Vegye fel velünk a kapcsolatot és mondja el véleményét.",
      gradientFrom: "#3b82f6",
      gradientTo: "#1d4ed8", 
      ctaText: "Kapcsolat",
      ctaLink: "/kapcsolat",
      order: 3,
      isActive: true
    }
  ];

  for (const slide of slides) {
    await prisma.slide.create({
      data: slide
    });
    console.log(`✓ Created slide: ${slide.title}`);
  }

  console.log("🎉 Slides seeded successfully!");
}

seedSlides()
  .catch((e) => {
    console.error("❌ Error seeding slides:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });