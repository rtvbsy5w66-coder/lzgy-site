import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEventRegistrations() {
  try {
    console.log('🔍 Checking events and registrations...\n');

    // Check if there are any events
    const events = await prisma.event.findMany({
      include: {
        registrations: true,
        _count: {
          select: {
            registrations: true
          }
        }
      }
    });

    console.log(`📅 Found ${events.length} events in database:\n`);

    for (const event of events) {
      console.log(`Event: ${event.title} (${event.id})`);
      console.log(`  Status: ${event.status}`);
      console.log(`  Start: ${event.startDate}`);
      console.log(`  Registrations: ${event._count.registrations}`);
      console.log('');
    }

    // Check the specific user
    const userId = 'cmgc866lq0001jx04l9pke340';
    const userEmail = 'f1rstteamfcofficial@gmail.com';

    console.log(`\n👤 Checking user: ${userEmail} (${userId})\n`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        eventRegistrations: {
          include: {
            event: {
              select: {
                title: true,
                startDate: true
              }
            }
          }
        }
      }
    });

    if (user) {
      console.log(`✅ User found: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Event registrations: ${user.eventRegistrations.length}`);

      if (user.eventRegistrations.length > 0) {
        console.log('\n   Registrations:');
        for (const reg of user.eventRegistrations) {
          console.log(`   - Event: ${reg.event.title}`);
          console.log(`     Status: ${reg.status}`);
          console.log(`     Registered: ${reg.createdAt}`);
        }
      }
    } else {
      console.log(`❌ User NOT found with ID: ${userId}`);
    }

    // Check all registrations
    console.log('\n\n📝 All event registrations:\n');
    const allRegistrations = await prisma.eventRegistration.findMany({
      include: {
        event: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    for (const reg of allRegistrations) {
      console.log(`Registration ID: ${reg.id}`);
      console.log(`  Event: ${reg.event.title}`);
      console.log(`  Name: ${reg.name}`);
      console.log(`  Email: ${reg.email}`);
      console.log(`  UserId: ${reg.userId || 'NULL ❌'}`);
      console.log(`  User in DB: ${reg.user ? `${reg.user.email} ✅` : 'Not linked ❌'}`);
      console.log(`  Status: ${reg.status}`);
      console.log(`  Created: ${reg.createdAt}`);
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEventRegistrations();
