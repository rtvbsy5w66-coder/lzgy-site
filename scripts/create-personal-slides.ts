import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createPersonalSlides() {
  console.log("🎯 Creating personal slides...");

  // Delete current slides
  await prisma.slide.deleteMany();

  const personalSlides = [
    {
      type: "VIDEO" as const,
      title: "Teszt videó",
      subtitle: "Teszt videó tartalom bemutató",
      order: 0,
      isActive: true,
      gradientFrom: null,
      gradientTo: null,
      mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Teszt videó URL
      ctaText: "Videó megtekintése",
      ctaLink: "/videos"
    },
    {
      type: "GRADIENT" as const,
      title: "Személyes profil",
      subtitle: "Lovas Zoltán György - személyes weboldal",
      order: 1,
      isActive: true,
      gradientFrom: "#6DAEF0",
      gradientTo: "#8DEBD1",
      mediaUrl: null,
      ctaText: "Rólam",
      ctaLink: "/rolam"
    },
    {
      type: "GRADIENT" as const,
      title: "Portfólió",
      subtitle: "Projektjeim és tapasztalataim",
      order: 2,
      isActive: true,
      gradientFrom: "#6D28D9",
      gradientTo: "#8B5CF6",
      mediaUrl: null,
      ctaText: "Munkáim",
      ctaLink: "/portfolio"
    },
    {
      type: "GRADIENT" as const,
      title: "Kapcsolat",
      subtitle: "Vegyük fel a kapcsolatot!",
      order: 3,
      isActive: true,
      gradientFrom: "#EA580C",
      gradientTo: "#FB923C",
      mediaUrl: null,
      ctaText: "Kapcsolat",
      ctaLink: "/kapcsolat"
    }
  ];

  for (const slide of personalSlides) {
    await prisma.slide.create({
      data: slide
    });
    console.log(`✓ Created slide: ${slide.title}`);
  }

  console.log("🎉 Personal slides created successfully!");
}

createPersonalSlides()
  .catch((e) => {
    console.error("❌ Error creating slides:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });