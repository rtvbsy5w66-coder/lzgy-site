import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPetitionSignature() {
  try {
    const petitionId = 'cmg96dc9o0001orsgee26vy98';
    const userEmail = 'f1rstteamfcofficial@gmail.com';

    console.log('🔍 Checking petition signature...\n');
    console.log(`Petition ID: ${petitionId}`);
    console.log(`User Email: ${userEmail}\n`);

    // Check petition
    const petition = await prisma.petition.findUnique({
      where: { id: petitionId },
      include: {
        _count: {
          select: {
            signatures: true
          }
        }
      }
    });

    if (petition) {
      console.log(`✅ Petition found: ${petition.title}`);
      console.log(`   Status: ${petition.status}`);
      console.log(`   Is Active: ${petition.isActive}`);
      console.log(`   Is Public: ${petition.isPublic}`);
      console.log(`   Total signatures: ${petition._count.signatures}`);
      console.log(`   End Date: ${petition.endDate || 'No end date'}`);
    } else {
      console.log('❌ Petition NOT found');
      return;
    }

    // Check if user already signed
    console.log('\n🔍 Checking if user already signed...\n');

    const existingSignature = await prisma.signature.findFirst({
      where: {
        petitionId,
        email: userEmail,
        isAnonymous: false,
      },
    });

    if (existingSignature) {
      console.log('⚠️  USER ALREADY SIGNED THIS PETITION!');
      console.log(`   Signature ID: ${existingSignature.id}`);
      console.log(`   Name: ${existingSignature.firstName} ${existingSignature.lastName}`);
      console.log(`   Status: ${existingSignature.status}`);
      console.log(`   Email Verified: ${existingSignature.emailVerified}`);
      console.log(`   Signed at: ${existingSignature.createdAt}`);
      console.log('\n❌ This is why the petition signing returns 400 - USER ALREADY SIGNED!\n');
    } else {
      console.log('✅ User has NOT signed this petition yet');
    }

    // Show all signatures for this petition
    console.log('\n📝 All signatures for this petition:\n');
    const allSignatures = await prisma.signature.findMany({
      where: { petitionId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    for (const sig of allSignatures) {
      console.log(`- ${sig.firstName} ${sig.lastName} (${sig.email})`);
      console.log(`  Status: ${sig.status}, Verified: ${sig.emailVerified}`);
      console.log(`  Signed: ${sig.createdAt}`);
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPetitionSignature();
