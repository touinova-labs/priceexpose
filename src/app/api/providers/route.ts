import { NextRequest, NextResponse } from 'next/server';
import { getAllProviders } from '@/deal-finder/helpers/dealClicks';

export async function GET(request: NextRequest) {
  try {
    const providers = await getAllProviders();
    
    return NextResponse.json(
      {
        success: true,
        providers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching providers:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch providers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
