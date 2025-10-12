import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { performPrivacyCleanup } from '@/lib/privacy-compliance';
import { applySecurityMiddleware, SECURITY_CONFIGS } from '@/lib/security-middleware';

// This endpoint should be called by a scheduled job (cron) for automatic cleanup
export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Apply admin security measures
  const securityResult = await applySecurityMiddleware(request, SECURITY_CONFIGS.ADMIN_API);
  if (securityResult) return securityResult;

  try {
    // Verify this is a scheduled job or admin request
    const authHeader = request.headers.get('authorization');
    const internalApiKey = process.env.INTERNAL_API_KEY;
    
    if (!authHeader || !internalApiKey || authHeader !== `Bearer ${internalApiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting privacy cleanup job...');
    const result = await performPrivacyCleanup();

    return NextResponse.json({
      success: true,
      message: 'Privacy cleanup completed successfully',
      deletedSignatures: result.deletedSignatures,
      deletedVotes: result.deletedVotes,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Privacy cleanup job failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Privacy cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check cleanup status and privacy settings
export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Apply admin security measures
  const securityResult = await applySecurityMiddleware(request, SECURITY_CONFIGS.ADMIN_API);
  if (securityResult) return securityResult;

  try {
    const { privacyManager } = await import('@/lib/privacy-compliance');
    
    return NextResponse.json({
      complianceSummary: privacyManager.getComplianceSummary(),
      lastCleanup: process.env.LAST_PRIVACY_CLEANUP || 'Never',
      nextScheduledCleanup: 'Daily at 2:00 AM UTC',
      status: 'Active'
    });

  } catch (error) {
    console.error('Error getting privacy status:', error);
    
    return NextResponse.json(
      { error: 'Failed to get privacy status' },
      { status: 500 }
    );
  }
}