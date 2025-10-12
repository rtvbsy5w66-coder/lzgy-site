import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CreateSequenceData, SequenceStats } from "@/types/sequence";
import { SequenceStatus } from "@prisma/client";

// Initialize Prisma client locally to avoid import issues
const prisma = new PrismaClient();

// GET /api/admin/sequences - List all sequences with stats
export async function GET(request: Request) {
  try {
    console.log('🔍 Starting sequences GET request...');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Admin session verified for:', session.user.email);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as SequenceStatus | null;
    const targetAudience = searchParams.get('targetAudience');

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (targetAudience) where.targetAudience = targetAudience;

    console.log('🔎 Fetching sequences with where clause:', where);

    // Test Prisma connection first
    console.log('🔍 Prisma client check:');
    console.log('  - prisma exists:', !!prisma);
    console.log('  - prisma.campaignSequence exists:', !!(prisma && prisma.campaignSequence));
    
    if (prisma) {
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_'));
      console.log('  - Available models:', availableModels.slice(0, 10)); // Show first 10
      console.log('  - Total models:', availableModels.length);
      console.log('  - campaignSequence in models:', availableModels.includes('campaignSequence'));
    }
    
    if (!prisma || !prisma.campaignSequence) {
      console.error('❌ Prisma client or campaignSequence model not available');
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    const sequences = await prisma.campaignSequence.findMany({
      where,
      include: {
        emails: {
          orderBy: { order: 'asc' }
        },
        executions: {
          select: {
            id: true,
            status: true,
            currentStep: true,
            emailsSent: true,
            emailsOpened: true,
            emailsClicked: true,
            unsubscribed: true
          }
        },
        _count: {
          select: {
            emails: true,
            executions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${sequences.length} sequences`);

    // Calculate stats for each sequence
    const sequenceStats: SequenceStats[] = sequences.map(sequence => {
      const executions = sequence.executions;
      const activeExecutions = executions.filter(e => e.status === 'ACTIVE');
      const completedExecutions = executions.filter(e => e.status === 'COMPLETED');
      
      const totalEmailsSent = executions.reduce((sum, e) => sum + e.emailsSent, 0);
      const totalEmailsOpened = executions.reduce((sum, e) => sum + e.emailsOpened, 0);
      const totalEmailsClicked = executions.reduce((sum, e) => sum + e.emailsClicked, 0);
      const unsubscribedCount = executions.filter(e => e.unsubscribed).length;

      const openRate = totalEmailsSent > 0 ? (totalEmailsOpened / totalEmailsSent) * 100 : 0;
      const clickRate = totalEmailsSent > 0 ? (totalEmailsClicked / totalEmailsSent) * 100 : 0;
      const unsubscribeRate = executions.length > 0 ? (unsubscribedCount / executions.length) * 100 : 0;

      // Calculate current step stats
      const currentStepData = activeExecutions.reduce((acc, e) => {
        if (!acc[e.currentStep]) acc[e.currentStep] = 0;
        acc[e.currentStep]++;
        return acc;
      }, {} as Record<number, number>);

      const nextStep = Math.min(...Object.keys(currentStepData).map(Number)) || 1;

      return {
        id: sequence.id,
        name: sequence.name,
        status: sequence.status,
        totalSubscribers: executions.length,
        activeSubscribers: activeExecutions.length,
        completedSubscribers: completedExecutions.length,
        totalEmails: sequence._count.emails,
        emailsSent: totalEmailsSent,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        unsubscribeRate: Math.round(unsubscribeRate * 100) / 100,
        currentStep: {
          step: nextStep,
          dueCount: currentStepData[nextStep] || 0,
          nextSendDate: sequence.emails.find(e => e.order === nextStep)?.delayDays !== undefined 
            ? new Date(Date.now() + (sequence.emails.find(e => e.order === nextStep)?.delayDays || 0) * 24 * 60 * 60 * 1000)
            : undefined
        }
      };
    });

    console.log(`📊 Calculated stats for ${sequenceStats.length} sequences`);
    return NextResponse.json({ sequences: sequenceStats });

  } catch (error) {
    console.error('❌ Error fetching sequences:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to fetch sequences', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/admin/sequences - Create new sequence
export async function POST(request: Request) {
  try {
    console.log('🔍 Starting sequences POST request...');
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const sequenceData: CreateSequenceData = body.sequence;

    // Validate sequence data
    if (!sequenceData.name || !sequenceData.targetAudience || !sequenceData.startDate || !sequenceData.emails || sequenceData.emails.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email order sequence
    const orders = sequenceData.emails.map(e => e.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        return NextResponse.json(
          { error: `Email order must be sequential starting from 1. Missing order: ${i + 1}` },
          { status: 400 }
        );
      }
    }

    // Create sequence with emails
    const sequence = await prisma.campaignSequence.create({
      data: {
        name: sequenceData.name,
        description: sequenceData.description,
        targetAudience: sequenceData.targetAudience,
        audienceFilter: sequenceData.audienceFilter,
        startDate: new Date(sequenceData.startDate),
        totalDuration: sequenceData.totalDuration,
        autoEnroll: sequenceData.autoEnroll ?? true,
        createdBy: session.user.email || 'Unknown',
        emails: {
          create: sequenceData.emails.map(email => ({
            name: email.name,
            subject: email.subject,
            content: email.content,
            previewText: email.previewText,
            order: email.order,
            delayDays: email.delayDays,
            sendTime: email.sendTime,
            timezone: email.timezone || 'Europe/Budapest',
            conditions: email.conditions,
            isActive: email.isActive ?? true
          }))
        }
      },
      include: {
        emails: {
          orderBy: { order: 'asc' }
        }
      }
    });

    console.log(`✅ Created sequence: ${sequence.name} with ${sequence.emails.length} emails`);

    return NextResponse.json({ 
      sequence,
      message: 'Sequence created successfully' 
    });

  } catch (error) {
    console.error('❌ Error creating sequence:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to create sequence', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}