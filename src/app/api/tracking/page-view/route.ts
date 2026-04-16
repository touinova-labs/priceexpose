import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/deal-finder/db';

interface PageViewRequest {
  pageName: string;
}

/**
 * Get client IP address from request headers
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Track a page view by IP + User Agent combination
 * POST /api/tracking/page-view
 */
export async function POST(request: NextRequest) {
  try {
    const body: PageViewRequest = await request.json();
    const { pageName } = body;

    if (!pageName || typeof pageName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid page name' },
        { status: 400 }
      );
    }

    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const client = await pool.connect();

    try {
      // Try to insert the page visit
      // If it already exists (unique constraint), it will be ignored
      // and we'll update the visited_at timestamp instead
      const result = await client.query(
        `
        INSERT INTO page_visits (page_name, ip_address, user_agent, visited_at)
        VALUES ($1, $2::inet, $3, NOW())
        ON CONFLICT (page_name, ip_address, user_agent) 
        DO UPDATE SET visited_at = NOW()
        RETURNING id, page_name, ip_address, user_agent, visited_at;
        `,
        [pageName, ipAddress, userAgent]
      );

      const visit = result.rows[0];

      return NextResponse.json(
        {
          success: true,
          message: 'Page view tracked successfully',
          data: {
            visitId: visit.id,
            pageName: visit.page_name,
            ipAddress: visit.ip_address,
            visitedAt: visit.visited_at,
          },
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}
