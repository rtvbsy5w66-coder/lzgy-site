import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🎨 Seeding themes...");

  const themes = [
    // GLOBAL themes - Szezonális témák (csak egy lehet aktív egyszerre)
    {
      name: "Szeptemberi színek",
      description: "Őszi, meleg színvilág - barna-narancs átmenet",
      fromColor: "#d97706", // Amber
      toColor: "#92400e", // Dark brown
      textColor: "#ffffff",
      type: "GLOBAL",
      isActive: true, // Ez lesz az alapértelmezett
    },
    {
      name: "Halloween",
      description: "Narancssárga-lila rémisztő téma",
      fromColor: "#f97316", // Orange
      toColor: "#7c2d12", // Dark orange-brown
      textColor: "#ffffff",
      type: "GLOBAL",
      isActive: false,
    },
    {
      name: "Mikulás",
      description: "Piros-fehér téli téma",
      fromColor: "#dc2626", // Red
      toColor: "#7f1d1d", // Dark red
      textColor: "#ffffff",
      type: "GLOBAL",
      isActive: false,
    },
    {
      name: "Karácsony",
      description: "Zöld-piros ünnepi téma",
      fromColor: "#16a34a", // Green
      toColor: "#dc2626", // Red
      textColor: "#ffffff",
      type: "GLOBAL",
      isActive: false,
    },
    {
      name: "Újév",
      description: "Arany-kék elegáns téma",
      fromColor: "#eab308", // Gold
      toColor: "#1e40af", // Blue
      textColor: "#ffffff",
      type: "GLOBAL",
      isActive: false,
    },
    {
      name: "Kampány",
      description: "Erőteljes sárga-vörös kampány téma",
      fromColor: "#facc15", // Bright yellow
      toColor: "#dc2626", // Red
      textColor: "#ffffff",
      type: "GLOBAL",
      isActive: false,
    },

    // FIX themes - Ezek NEM módosíthatók az admin felületen!
    {
      name: "Hírek",
      description: "Fix szín - hírek kategória jelölésére (NEM MÓDOSÍTHATÓ)",
      fromColor: "#10b981",
      toColor: "#059669",
      textColor: "#ffffff",
      type: "NEWS",
      isActive: true,
    },
    {
      name: "Események",
      description: "Fix szín - események kategória jelölésére (NEM MÓDOSÍTHATÓ)",
      fromColor: "#f59e0b",
      toColor: "#d97706",
      textColor: "#ffffff",
      type: "EVENTS",
      isActive: true,
    },
    {
      name: "Program",
      description: "Fix szín - program kategória jelölésére (NEM MÓDOSÍTHATÓ)",
      fromColor: "#8b5cf6",
      toColor: "#7c3aed",
      textColor: "#ffffff",
      type: "PROGRAM",
      isActive: true,
    },
  ];

  for (const theme of themes) {
    // Check if theme with same name already exists
    const existing = await prisma.theme.findFirst({
      where: {
        name: theme.name,
        type: theme.type as any,
      },
    });

    if (existing) {
      console.log(`✓ ${theme.name} already exists`);
      continue;
    }

    await prisma.theme.create({
      data: theme as any,
    });

    console.log(`✓ Created ${theme.name}`);
  }

  console.log("✅ Themes seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding themes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
