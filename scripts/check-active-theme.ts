import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const themes = await prisma.theme.findMany({
    where: { type: "GLOBAL" },
    select: { name: true, isActive: true, fromColor: true, toColor: true },
    orderBy: { name: "asc" }
  });

  console.log("\n🎨 GLOBAL témák státusza:\n");
  themes.forEach(t => {
    const status = t.isActive ? "✅ AKTÍV" : "⚪ Inaktív";
    console.log(`${status}  ${t.name}`);
    console.log(`         ${t.fromColor} → ${t.toColor}\n`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
