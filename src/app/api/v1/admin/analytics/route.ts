import { NextRequest, NextResponse } from 'next/server';
import { getAdminAnalytics } from '@/core/domain/admin/mutations';

export async function GET(request: NextRequest) {
  try {
    const analytics = await getAdminAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Failed to fetch admin analytics:', error);
    return NextResponse.json(
      { totalViews: 0, totalInquiries: 0, researchImpact: 0 },
      { status: 200 } // Return 200 with default values on error to allow graceful degradation
    );
  }
}

// Prevent static generation for this route
export const dynamic = 'force-dynamic';
