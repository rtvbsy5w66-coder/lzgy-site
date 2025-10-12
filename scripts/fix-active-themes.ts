import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Javítom az aktív témákat...\n");

  // Deaktiváljunk minden GLOBAL témát
  const deactivated = await prisma.theme.updateMany({
    where: { type: "GLOBAL" },
    data: { isActive: false }
  });

  console.log(`⚪ ${deactivated.count} GLOBAL téma deaktiválva`);

  // Aktiváljuk csak a "Szeptemberi színek"-et
  const activated = await prisma.theme.updateMany({
    where: {
      type: "GLOBAL",
      name: "Szeptemberi színek"
    },
    data: { isActive: true }
  });

  console.log(`✅ ${activated.count} téma aktiválva: "Szeptemberi színek"\n`);

  // Ellenőrizzük
  const activeThemes = await prisma.theme.findMany({
    where: { type: "GLOBAL", isActive: true },
    select: { name: true }
  });

  console.log("Aktív GLOBAL témák:");
  activeThemes.forEach(t => console.log(`  ✅ ${t.name}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
