import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateModernThemes() {
  console.log('🎨 Updating themes with modern, vibrant colors...\n');

  try {
    // Modern GLOBAL themes with beautiful gradients
    const modernThemes = [
      {
        name: 'Alapértelmezett',
        description: 'Modern kék-lila átmenet - professzionális, tiszta megjelenés',
        fromColor: '#3b82f6', // blue-500
        toColor: '#8b5cf6',   // violet-500
        type: 'GLOBAL',
      },
      {
        name: 'Őszi Színek',
        description: 'Meleg narancs-vörös árnyalatok - barátságos, energikus hangulat',
        fromColor: '#f97316', // orange-500
        toColor: '#dc2626',   // red-600
        type: 'GLOBAL',
      },
      {
        name: 'Halloween',
        description: 'Élénk narancs-lila kombináció - figyelemfelkeltő, ünnepi téma',
        fromColor: '#ff6b00', // vibrant orange
        toColor: '#9333ea',   // purple-600
        type: 'GLOBAL',
      },
      {
        name: 'Téli Elegancia',
        description: 'Hideg kék-ciánkék átmenet - modern, nyugodt atmoszféra',
        fromColor: '#0ea5e9', // sky-500
        toColor: '#06b6d4',   // cyan-500
        type: 'GLOBAL',
      },
      {
        name: 'Karácsony',
        description: 'Mély piros-zöld ünnepvárás - klasszikus ünnepi hangulat',
        fromColor: '#dc2626', // red-600
        toColor: '#16a34a',   // green-600
        type: 'GLOBAL',
      },
      {
        name: 'Arany Újév',
        description: 'Luxus arany-sárga csillogás - elegáns, ünnepélyes design',
        fromColor: '#fbbf24', // amber-400
        toColor: '#f59e0b',   // amber-500
        type: 'GLOBAL',
      },
      {
        name: 'Tavaszi Frissesség',
        description: 'Élénkzöld-limezöld varázs - természetes, felfrissülés',
        fromColor: '#10b981', // emerald-500
        toColor: '#84cc16',   // lime-500
        type: 'GLOBAL',
      },
      {
        name: 'Nyári Energia',
        description: 'Vibráló sárga-narancs fény - optimista, dinamikus stílus',
        fromColor: '#eab308', // yellow-500
        toColor: '#f97316',   // orange-500
        type: 'GLOBAL',
      },
      {
        name: 'Kampány Erő',
        description: 'Tűzpiros-pink hatalom - figyelemfelkeltő, motiváló',
        fromColor: '#dc2626', // red-600
        toColor: '#ec4899',   // pink-500
        type: 'GLOBAL',
      },
      {
        name: 'Midnight Blue',
        description: 'Mély kék-indigó éjszaka - komoly, higgadt jelenlét',
        fromColor: '#1e40af', // blue-800
        toColor: '#4f46e5',   // indigo-600
        type: 'GLOBAL',
      },
    ];

    // Delete old GLOBAL themes first
    const deleteResult = await prisma.theme.deleteMany({
      where: { type: 'GLOBAL' }
    });
    console.log(`✅ Deleted ${deleteResult.count} old GLOBAL themes\n`);

    // Create new modern themes
    for (const theme of modernThemes) {
      const created = await prisma.theme.create({
        data: {
          ...theme,
          textColor: '#ffffff',
          isActive: theme.name === 'Alapértelmezett', // Set default as active
        }
      });
      console.log(`✨ Created: ${created.name}`);
    }

    console.log('\n🎉 Successfully updated all GLOBAL themes with modern colors!');
    console.log('\n📊 Theme Summary:');

    const allGlobalThemes = await prisma.theme.findMany({
      where: { type: 'GLOBAL' },
      orderBy: { name: 'asc' }
    });

    allGlobalThemes.forEach(theme => {
      console.log(`  ${theme.isActive ? '✓' : ' '} ${theme.name.padEnd(25)} ${theme.fromColor} → ${theme.toColor}`);
    });

  } catch (error) {
    console.error('❌ Error updating themes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateModernThemes();
