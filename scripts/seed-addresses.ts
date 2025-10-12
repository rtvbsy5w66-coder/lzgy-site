import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Budapest V. kerület főbb utcái és címei
const addressData = [
  // Váci utca
  { street: 'Váci', streetType: 'UTCA', houseNumber: '1', postalCode: '1052', lat: 47.4969, lng: 19.0508 },
  { street: 'Váci', streetType: 'UTCA', houseNumber: '3', postalCode: '1052', lat: 47.4970, lng: 19.0509 },
  { street: 'Váci', streetType: 'UTCA', houseNumber: '5', postalCode: '1052', lat: 47.4971, lng: 19.0510 },
  { street: 'Váci', streetType: 'UTCA', houseNumber: '7', postalCode: '1052', lat: 47.4972, lng: 19.0511 },
  { street: 'Váci', streetType: 'UTCA', houseNumber: '9', postalCode: '1052', lat: 47.4973, lng: 19.0512 },
  { street: 'Váci', streetType: 'UTCA', houseNumber: '11', postalCode: '1052', lat: 47.4974, lng: 19.0513 },
  { street: 'Váci', streetType: 'UTCA', houseNumber: '13', postalCode: '1052', lat: 47.4975, lng: 19.0514 },
  { street: 'Váci', streetType: 'UTCA', houseNumber: '15', postalCode: '1052', lat: 47.4976, lng: 19.0515 },
  { street: 'Váci', streetType: 'UTCA', houseNumber: '19', postalCode: '1052', lat: 47.4977, lng: 19.0516 },
  { street: 'Váci', streetType: 'UTCA', houseNumber: '21', postalCode: '1052', lat: 47.4978, lng: 19.0517 },
  
  // Alkotmány utca
  { street: 'Alkotmány', streetType: 'UTCA', houseNumber: '1', postalCode: '1054', lat: 47.5020, lng: 19.0450 },
  { street: 'Alkotmány', streetType: 'UTCA', houseNumber: '3', postalCode: '1054', lat: 47.5021, lng: 19.0451 },
  { street: 'Alkotmány', streetType: 'UTCA', houseNumber: '5', postalCode: '1054', lat: 47.5022, lng: 19.0452 },
  { street: 'Alkotmány', streetType: 'UTCA', houseNumber: '7', postalCode: '1054', lat: 47.5023, lng: 19.0453 },
  { street: 'Alkotmány', streetType: 'UTCA', houseNumber: '9', postalCode: '1054', lat: 47.5024, lng: 19.0454 },
  { street: 'Alkotmány', streetType: 'UTCA', houseNumber: '11', postalCode: '1054', lat: 47.5025, lng: 19.0455 },
  { street: 'Alkotmány', streetType: 'UTCA', houseNumber: '13', postalCode: '1054', lat: 47.5026, lng: 19.0456 },
  { street: 'Alkotmány', streetType: 'UTCA', houseNumber: '15', postalCode: '1054', lat: 47.5027, lng: 19.0457 },
  { street: 'Alkotmány', streetType: 'UTCA', houseNumber: '17', postalCode: '1054', lat: 47.5028, lng: 19.0458 },
  { street: 'Alkotmány', streetType: 'UTCA', houseNumber: '19', postalCode: '1054', lat: 47.5029, lng: 19.0459 },
  
  // Petőfi Sándor utca
  { street: 'Petőfi Sándor', streetType: 'UTCA', houseNumber: '2', postalCode: '1052', lat: 47.4950, lng: 19.0520 },
  { street: 'Petőfi Sándor', streetType: 'UTCA', houseNumber: '4', postalCode: '1052', lat: 47.4951, lng: 19.0521 },
  { street: 'Petőfi Sándor', streetType: 'UTCA', houseNumber: '6', postalCode: '1052', lat: 47.4952, lng: 19.0522 },
  { street: 'Petőfi Sándor', streetType: 'UTCA', houseNumber: '8', postalCode: '1052', lat: 47.4953, lng: 19.0523 },
  { street: 'Petőfi Sándor', streetType: 'UTCA', houseNumber: '10', postalCode: '1052', lat: 47.4954, lng: 19.0524 },
  { street: 'Petőfi Sándor', streetType: 'UTCA', houseNumber: '12', postalCode: '1052', lat: 47.4955, lng: 19.0525 },
  { street: 'Petőfi Sándor', streetType: 'UTCA', houseNumber: '14', postalCode: '1052', lat: 47.4956, lng: 19.0526 },
  { street: 'Petőfi Sándor', streetType: 'UTCA', houseNumber: '16', postalCode: '1052', lat: 47.4957, lng: 19.0527 },
  
  // Vörösmarty tér
  { street: 'Vörösmarty', streetType: 'TER', houseNumber: '1', postalCode: '1051', lat: 47.4961, lng: 19.0513 },
  { street: 'Vörösmarty', streetType: 'TER', houseNumber: '2', postalCode: '1051', lat: 47.4962, lng: 19.0514 },
  { street: 'Vörösmarty', streetType: 'TER', houseNumber: '3', postalCode: '1051', lat: 47.4963, lng: 19.0515 },
  { street: 'Vörösmarty', streetType: 'TER', houseNumber: '4', postalCode: '1051', lat: 47.4964, lng: 19.0516 },
  { street: 'Vörösmarty', streetType: 'TER', houseNumber: '7-8', postalCode: '1051', lat: 47.4965, lng: 19.0517 },
  
  // Ferenciek tere
  { street: 'Ferenciek', streetType: 'TER', houseNumber: '1', postalCode: '1053', lat: 47.4912, lng: 19.0533 },
  { street: 'Ferenciek', streetType: 'TER', houseNumber: '2', postalCode: '1053', lat: 47.4913, lng: 19.0534 },
  { street: 'Ferenciek', streetType: 'TER', houseNumber: '3', postalCode: '1053', lat: 47.4914, lng: 19.0535 },
  { street: 'Ferenciek', streetType: 'TER', houseNumber: '4', postalCode: '1053', lat: 47.4915, lng: 19.0536 },
  { street: 'Ferenciek', streetType: 'TER', houseNumber: '5', postalCode: '1053', lat: 47.4916, lng: 19.0537 },
  
  // Kossuth Lajos utca
  { street: 'Kossuth Lajos', streetType: 'UTCA', houseNumber: '1', postalCode: '1053', lat: 47.4900, lng: 19.0540 },
  { street: 'Kossuth Lajos', streetType: 'UTCA', houseNumber: '3', postalCode: '1053', lat: 47.4901, lng: 19.0541 },
  { street: 'Kossuth Lajos', streetType: 'UTCA', houseNumber: '5', postalCode: '1053', lat: 47.4902, lng: 19.0542 },
  { street: 'Kossuth Lajos', streetType: 'UTCA', houseNumber: '7', postalCode: '1053', lat: 47.4903, lng: 19.0543 },
  { street: 'Kossuth Lajos', streetType: 'UTCA', houseNumber: '8', postalCode: '1053', lat: 47.4904, lng: 19.0544 },
  { street: 'Kossuth Lajos', streetType: 'UTCA', houseNumber: '10', postalCode: '1053', lat: 47.4905, lng: 19.0545 },
  { street: 'Kossuth Lajos', streetType: 'UTCA', houseNumber: '12', postalCode: '1053', lat: 47.4906, lng: 19.0546 },
  
  // Szent István körút
  { street: 'Szent István', streetType: 'KORUT', houseNumber: '1', postalCode: '1051', lat: 47.5050, lng: 19.0480 },
  { street: 'Szent István', streetType: 'KORUT', houseNumber: '3', postalCode: '1051', lat: 47.5051, lng: 19.0481 },
  { street: 'Szent István', streetType: 'KORUT', houseNumber: '5', postalCode: '1051', lat: 47.5052, lng: 19.0482 },
  { street: 'Szent István', streetType: 'KORUT', houseNumber: '7', postalCode: '1051', lat: 47.5053, lng: 19.0483 },
  { street: 'Szent István', streetType: 'KORUT', houseNumber: '9', postalCode: '1051', lat: 47.5054, lng: 19.0484 },
  { street: 'Szent István', streetType: 'KORUT', houseNumber: '11', postalCode: '1051', lat: 47.5055, lng: 19.0485 },
  { street: 'Szent István', streetType: 'KORUT', houseNumber: '13', postalCode: '1051', lat: 47.5056, lng: 19.0486 },
  
  // Szabadság tér
  { street: 'Szabadság', streetType: 'TER', houseNumber: '1', postalCode: '1051', lat: 47.5020, lng: 19.0510 },
  { street: 'Szabadság', streetType: 'TER', houseNumber: '2', postalCode: '1051', lat: 47.5021, lng: 19.0511 },
  { street: 'Szabadság', streetType: 'TER', houseNumber: '3', postalCode: '1051', lat: 47.5022, lng: 19.0512 },
  { street: 'Szabadság', streetType: 'TER', houseNumber: '5', postalCode: '1051', lat: 47.5024, lng: 19.0514 },
  { street: 'Szabadság', streetType: 'TER', houseNumber: '12', postalCode: '1051', lat: 47.5030, lng: 19.0520 },
  
  // Bajcsy-Zsilinszky út
  { street: 'Bajcsy-Zsilinszky', streetType: 'UTCA', houseNumber: '1', postalCode: '1051', lat: 47.4980, lng: 19.0520 },
  { street: 'Bajcsy-Zsilinszky', streetType: 'UTCA', houseNumber: '3', postalCode: '1051', lat: 47.4981, lng: 19.0521 },
  { street: 'Bajcsy-Zsilinszky', streetType: 'UTCA', houseNumber: '5', postalCode: '1051', lat: 47.4982, lng: 19.0522 },
  { street: 'Bajcsy-Zsilinszky', streetType: 'UTCA', houseNumber: '7', postalCode: '1051', lat: 47.4983, lng: 19.0523 },
  { street: 'Bajcsy-Zsilinszky', streetType: 'UTCA', houseNumber: '9', postalCode: '1051', lat: 47.4984, lng: 19.0524 },
  { street: 'Bajcsy-Zsilinszky', streetType: 'UTCA', houseNumber: '11', postalCode: '1051', lat: 47.4985, lng: 19.0525 },
  { street: 'Bajcsy-Zsilinszky', streetType: 'UTCA', houseNumber: '12', postalCode: '1051', lat: 47.4986, lng: 19.0526 },
  
  // Október 6. utca
  { street: 'Október 6.', streetType: 'UTCA', houseNumber: '1', postalCode: '1051', lat: 47.4930, lng: 19.0540 },
  { street: 'Október 6.', streetType: 'UTCA', houseNumber: '3', postalCode: '1051', lat: 47.4931, lng: 19.0541 },
  { street: 'Október 6.', streetType: 'UTCA', houseNumber: '5', postalCode: '1051', lat: 47.4932, lng: 19.0542 },
  { street: 'Október 6.', streetType: 'UTCA', houseNumber: '7', postalCode: '1051', lat: 47.4933, lng: 19.0543 },
  { street: 'Október 6.', streetType: 'UTCA', houseNumber: '9', postalCode: '1051', lat: 47.4934, lng: 19.0544 },
  { street: 'Október 6.', streetType: 'UTCA', houseNumber: '11', postalCode: '1051', lat: 47.4935, lng: 19.0545 },
  { street: 'Október 6.', streetType: 'UTCA', houseNumber: '13', postalCode: '1051', lat: 47.4936, lng: 19.0546 },
  { street: 'Október 6.', streetType: 'UTCA', houseNumber: '15', postalCode: '1051', lat: 47.4937, lng: 19.0547 },
];

async function seedAddresses() {
  try {
    console.log('🌱 V. kerület címadatok beszúrása...');
    
    // Először létrehozzuk a V. kerületet
    const district = await prisma.district.upsert({
      where: { number: 5 },
      update: {},
      create: {
        number: 5,
        name: 'V. kerület',
        officialName: 'Belváros-Lipótváros'
      }
    });
    
    console.log(`✅ Kerület létrehozva: ${district.name}`);
    
    // Utcák és címek csoportosítása
    const streetGroups = new Map();
    
    addressData.forEach(addr => {
      const streetKey = `${addr.street}-${addr.streetType}`;
      if (!streetGroups.has(streetKey)) {
        streetGroups.set(streetKey, []);
      }
      streetGroups.get(streetKey)!.push(addr);
    });
    
    let totalAddresses = 0;
    
    // Utcák és címek létrehozása
    for (const [streetKey, addresses] of streetGroups) {
      const firstAddr = addresses[0];
      
      // Utca létrehozása
      const street = await prisma.street.upsert({
        where: {
          name_districtId: {
            name: firstAddr.street,
            districtId: district.id
          }
        },
        update: {},
        create: {
          name: firstAddr.street,
          streetType: firstAddr.streetType as any,
          districtId: district.id
        }
      });
      
      // Címek létrehozása ehhez az utcához
      for (const addrData of addresses) {
        const houseNumberInt = parseInt(addrData.houseNumber.replace(/\D/g, '')) || 0;
        
        await prisma.address.upsert({
          where: {
            streetId_houseNumber: {
              streetId: street.id,
              houseNumber: addrData.houseNumber
            }
          },
          update: {
            postalCode: addrData.postalCode,
            latitude: addrData.lat,
            longitude: addrData.lng,
            isActive: true
          },
          create: {
            streetId: street.id,
            houseNumber: addrData.houseNumber,
            houseNumberInt,
            postalCode: addrData.postalCode,
            latitude: addrData.lat,
            longitude: addrData.lng,
            isActive: true
          }
        });
        
        totalAddresses++;
      }
      
      console.log(`✅ ${street.name} ${street.streetType.toLowerCase()} - ${addresses.length} cím`);
    }
    
    console.log(`🎉 Összesen ${totalAddresses} cím beszúrva a V. kerülethez!`);
    
    // Statisztikák
    const stats = await prisma.address.groupBy({
      by: ['postalCode'],
      where: {
        street: {
          districtId: district.id
        }
      },
      _count: {
        id: true
      }
    });
    
    console.log('\n📊 Statisztikák irányítószámok szerint:');
    stats.forEach(stat => {
      console.log(`   ${stat.postalCode}: ${stat._count.id} cím`);
    });
    
  } catch (error) {
    console.error('❌ Hiba a címadatok beszúrása során:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Futtatás ha közvetlenül hívják
if (require.main === module) {
  seedAddresses()
    .then(() => {
      console.log('✅ Címadatok sikeresen beszúrva!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Címadatok beszúrása sikertelen:', error);
      process.exit(1);
    });
}

export { seedAddresses };