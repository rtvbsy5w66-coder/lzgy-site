import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPartners() {
  const partners = [
    {
      name: "GitHub",
      description: "Verziókezelő platform fejlesztőknek",
      imageUrl: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
      link: "https://github.com",
      category: "TECHNOLOGY" as const,
      width: 600,
      height: 200,
      sortOrder: 1,
      isActive: true
    },
    {
      name: "React",
      description: "JavaScript könyvtár felhasználói felületek építéséhez",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg", 
      link: "https://react.dev",
      category: "TECHNOLOGY" as const,
      width: 600,
      height: 200,
      sortOrder: 2,
      isActive: true
    },
    {
      name: "Next.js",
      description: "React framework modern webalkalmazásokhoz",
      imageUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
      link: "https://nextjs.org",
      category: "TECHNOLOGY" as const,
      width: 600,
      height: 200,
      sortOrder: 3,
      isActive: true
    },
    {
      name: "TypeScript",
      description: "Típusos JavaScript szuperset",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg",
      link: "https://typescriptlang.org",
      category: "TECHNOLOGY" as const,
      width: 600,
      height: 200,
      sortOrder: 4,
      isActive: true
    },
    {
      name: "Tailwind CSS",
      description: "Utility-first CSS framework",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
      link: "https://tailwindcss.com",
      category: "TECHNOLOGY" as const,
      width: 600,
      height: 200,
      sortOrder: 5,
      isActive: true
    },
    {
      name: "Vercel",
      description: "Platform modern webalkalmazások telepítéséhez",
      imageUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg",
      link: "https://vercel.com",
      category: "TECHNOLOGY" as const,
      width: 600,
      height: 200,
      sortOrder: 6,
      isActive: true
    }
  ];

  console.log('🌱 Partner adatok feltöltése...');

  for (const partner of partners) {
    const existing = await prisma.partner.findFirst({
      where: { name: partner.name }
    });

    if (!existing) {
      await prisma.partner.create({
        data: partner
      });
      console.log(`✅ ${partner.name} partner hozzáadva`);
    } else {
      console.log(`⚠️ ${partner.name} partner már létezik`);
    }
  }

  console.log('🎉 Partner adatok feltöltése befejezve!');
}

seedPartners()
  .catch((e) => {
    console.error('❌ Hiba a partner adatok feltöltése során:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });