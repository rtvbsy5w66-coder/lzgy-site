import { prisma } from '../src/lib/prisma';

async function main() {
  const cats = await prisma.newsCategory.findMany();
  console.log('Categories in database:');
  cats.forEach(c => {
    console.log(`- ${c.name}: color="${c.color}"`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
