import { PrismaClient, ProgramStatus } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_PROGRAM_POINTS = [
  // SZOCIÁLPOLITIKA (8 pont)
  {
    title: "Családi támogatások bővítése",
    category: "Szociálpolitika",
    description: "Átfogó családtámogatási rendszer létrehozása.",
    details: "Gyermekgondozási díj emelése, ingyenes bölcsődei ellátás, családi adókedvezmények kiterjesztése minden családtípusra.",
    priority: 1,
    status: "PLANNED" as ProgramStatus,
    imageUrl: "/images/programs/family-support.jpg",
    sortOrder: 1
  },
  {
    title: "Szociális lakhatás program",
    category: "Szociálpolitika",
    description: "Elérhető lakhatás biztosítása rászorulóknak.",
    details: "Önkormányzati bérlakás építés, lakhatási támogatás kiterjesztése, hajléktalanság elleni program.",
    priority: 1,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 2
  },
  {
    title: "Munkanélküliség elleni program",
    category: "Szociálpolitika",
    description: "Aktív foglalkoztatáspolitikai intézkedések.",
    details: "Átképzési programok, vállalkozóvá válás támogatása, munkahely-teremtési pályázatok.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    imageUrl: "/images/programs/employment.jpg",
    sortOrder: 3
  },
  {
    title: "Fogyatékossággal élők támogatása",
    category: "Szociálpolitika",
    description: "Akadálymentes társadalom építése.",
    details: "Akadálymentesítési program, foglalkoztatási kvóta, támogató szolgáltatások bővítése.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 4
  },
  {
    title: "Gyermekszegénység felszámolása",
    category: "Szociálpolitika",
    description: "Minden gyermek számára méltó életkörülmények.",
    details: "Ingyenes tanszerek, étkeztetés kiterjesztése, szabadidős programok támogatása.",
    priority: 1,
    status: "PLANNED" as ProgramStatus,
    imageUrl: "/images/programs/child-poverty.jpg",
    sortOrder: 5
  },
  {
    title: "Idősek otthoni ellátása",
    category: "Szociálpolitika",
    description: "Méltóságteljes időskor otthon.",
    details: "Házi segítségnyújtás bővítése, nappali ellátás, családi gondozók támogatása.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 6
  },
  {
    title: "Roma integráció program",
    category: "Szociálpolitika",
    description: "Társadalmi felzárkóztatás és integráció.",
    details: "Oktatási, foglalkoztatási és lakhatási programok, kulturális sokszínűség támogatása.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 7
  },
  {
    title: "Női egyenjogúság és védelem",
    category: "Szociálpolitika",
    description: "Nők társadalmi helyzetének javítása.",
    details: "Családon belüli erőszak elleni védelmi rendszer, egyenlő bérezés, karriertámogatás.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    imageUrl: "/images/programs/women-rights.jpg",
    sortOrder: 8
  },

  // OKTATÁSPOLITIKA (8 pont)
  {
    title: "Digitális oktatási forradalom",
    category: "Oktatáspolitika",
    description: "21. századi készségek fejlesztése minden iskolában.",
    details: "Interaktív táblák, laptopok diákoknak, programozás oktatás, digitális kompetencia fejlesztés.",
    priority: 1,
    status: "PLANNED" as ProgramStatus,
    imageUrl: "/images/programs/digital-education.jpg",
    sortOrder: 9
  },
  {
    title: "Pedagógus béremelés és presztízs",
    category: "Oktatáspolitika",
    description: "Tanári pálya vonzóvá tétele.",
    details: "50%-os béremelés 3 év alatt, szakmai fejlődési lehetőségek, nyugdíj-előtakarékosság.",
    priority: 1,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 10
  },
  {
    title: "Ingyenes felsőoktatás kiterjesztése",
    category: "Oktatáspolitika",
    description: "Elérhető egyetemi és főiskolai képzés.",
    details: "Államilag finanszírozott helyek számának duplázása, ösztöndíjrendszer bővítése.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    imageUrl: "/images/programs/higher-education.jpg",
    sortOrder: 11
  },
  {
    title: "Szakképzés modernizációja",
    category: "Oktatáspolitika",
    description: "Munkaerő-piaci igényekhez igazított képzés.",
    details: "Duális képzési rendszer, modern műhelyek, vállalati partnerségek erősítése.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 12
  },
  {
    title: "Hátrányos helyzetű gyermekek támogatása",
    category: "Oktatáspolitika",
    description: "Egyenlő esélyek biztosítása az oktatásban.",
    details: "Felzárkóztató programok, mentorálás, extra órai támogatás, ingyenes korrepetálás.",
    priority: 1,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 13
  },
  {
    title: "Tehetséggondozás és kiválóság",
    category: "Oktatáspolitika",
    description: "Kiemelkedő képességek fejlesztése.",
    details: "Tehetségközpontok, nemzetközi versenyek támogatása, kutatási lehetőségek diákoknak.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    imageUrl: "/images/programs/talent-development.jpg",
    sortOrder: 14
  },
  {
    title: "Iskolaépületek felújítása",
    category: "Oktatáspolitika",
    description: "Korszerű tanulási környezet minden gyermeknek.",
    details: "Energetikai felújítás, akadálymentesítés, modern laboratóriumok, sportlétesítmények.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 15
  },
  {
    title: "Élethosszig tartó tanulás",
    category: "Oktatáspolitika",
    description: "Felnőttkori képzési lehetőségek bővítése.",
    details: "Távoktatási platformok, szakmai átképzések, nyelvi kurzusok, számítógépes ismeretek.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 16
  },

  // EGÉSZSÉGÜGY (8 pont)
  {
    title: "Várólisták teljes felszámolása",
    category: "Egészségügy",
    description: "Sürgős ellátás minden beteg számára.",
    details: "Kapacitásbővítés, több orvos és ápoló, modern berendezések, hatékonyabb működés.",
    priority: 1,
    status: "PLANNED" as ProgramStatus,
    imageUrl: "/images/programs/healthcare-waiting.jpg",
    sortOrder: 17
  },
  {
    title: "Egészségügyi dolgozók béremelése",
    category: "Egészségügy",
    description: "Méltó fizetés az egészségügyben dolgozóknak.",
    details: "Orvosi és ápolói bérek európai szintre emelése, szakdolgozói pótlékok növelése.",
    priority: 1,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 18
  },
  {
    title: "Megelőzés és egészségfejlesztés",
    category: "Egészségügy",
    description: "A betegségek megelőzése a gyógyításnál.",
    details: "Ingyenes szűrővizsgálatok, egészséges életmód programok, sport és táplálkozási tanácsadás.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    imageUrl: "/images/programs/prevention.jpg",
    sortOrder: 19
  },
  {
    title: "Vidéki egészségügyi ellátás",
    category: "Egészségügy",
    description: "Egyenlő hozzáférés az egész országban.",
    details: "Körzeti orvosi rendelők korszerűsítése, mobil egészségügyi szolgáltatások, távdiagnosztika.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 20
  },
  {
    title: "Mentálhigiénés szolgáltatások",
    category: "Egészségügy",
    description: "Lelki egészség támogatása minden korosztálynak.",
    details: "Pszichológiai tanácsadás bővítése, krízisintervenciós szolgálatok, stressz-kezelési programok.",
    priority: 1,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 21
  },
  {
    title: "Gyógyszerár-támogatás bővítése",
    category: "Egészségügy",
    description: "Elérhető gyógyszerek minden beteg számára.",
    details: "Újabb gyógyszerek támogatott listára vétele, krónikus betegek extra támogatása.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    imageUrl: "/images/programs/medicine-support.jpg",
    sortOrder: 22
  },
  {
    title: "Kórházi infrastruktúra fejlesztés",
    category: "Egészségügy",
    description: "Korszerű egészségügyi létesítmények.",
    details: "MR és CT készülékek, műtők modernizálása, betegszállítás fejlesztése, parkolási problémák megoldása.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 23
  },
  {
    title: "Digitális egészségügy",
    category: "Egészségügy",
    description: "Technológia az egészségügy szolgálatában.",
    details: "Elektronikus egészségügyi karton, online időpontfoglalás, telemedicina szolgáltatások.",
    priority: 2,
    status: "PLANNED" as ProgramStatus,
    sortOrder: 24
  }
];

async function main() {
  console.log('🌱 Starting program points seed...');

  // Check if data already exists
  const existingCount = await prisma.programPoint.count();
  if (existingCount > 0) {
    console.log(`⚠️  Database already has ${existingCount} program points. Skipping seed.`);
    console.log('   If you want to re-seed, delete all program points first.');
    return;
  }

  // Insert seed data
  let created = 0;
  for (const point of SEED_PROGRAM_POINTS) {
    await prisma.programPoint.create({
      data: {
        ...point,
        isActive: true
      }
    });
    created++;
    console.log(`  ✓ Created: ${point.title}`);
  }

  console.log(`\n✅ Successfully seeded ${created} program points!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
