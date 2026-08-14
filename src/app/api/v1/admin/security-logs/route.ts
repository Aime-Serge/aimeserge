import { NextRequest, NextResponse } from 'next/server';
import { getSecurityLogs } from '@/core/domain/admin/mutations';

export async function GET(request: NextRequest) {
  try {
    const result = await getSecurityLogs();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch security logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch security logs' },
      { status: 500 }
    );
  }
}

// Prevent static generation for this route
export const dynamic = 'force-dynamic';
