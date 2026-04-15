import { NextRequest, NextResponse } from 'next/server';
import { logDealClick } from '@/deal-finder/helpers/dealClicks';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      providerId,
      selectedProviderId,
      selectedProviderPrice,
      propertyId,
      travelSettings,
      bookingPrice,
      currency,
      userAgent,
    } = body;

    // Validate required fields
    if (
      !providerId ||
      !selectedProviderId ||
      selectedProviderPrice === undefined ||
      !propertyId ||
      !travelSettings ||
      bookingPrice === undefined ||
      !currency
    ) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: [
            'providerId',
            'selectedProviderId',
            'selectedProviderPrice',
            'propertyId',
            'travelSettings',
            'bookingPrice',
            'currency',
          ],
        },
        { status: 400 }
      );
    }

    // Validate pricing
    const price = parseFloat(String(bookingPrice));
    const selectedPrice = parseFloat(String(selectedProviderPrice));
    
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: 'Invalid booking price' },
        { status: 400 }
      );
    }
    
    if (isNaN(selectedPrice) || selectedPrice < 0) {
      return NextResponse.json(
        { error: 'Invalid selected provider price' },
        { status: 400 }
      );
    }

    // Validate provider IDs
    const provId = parseInt(String(providerId), 10);
    const selProvId = parseInt(String(selectedProviderId), 10);
    
    if (isNaN(provId) || provId <= 0 || isNaN(selProvId) || selProvId <= 0) {
      return NextResponse.json(
        { error: 'Invalid provider IDs' },
        { status: 400 }
      );
    }

    // Get IP address from request headers
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('cf-connecting-ip') || undefined;

    // Log click to database
    const result = await logDealClick({
      providerId: provId,
      selectedProviderId: selProvId,
      selectedProviderPrice: selectedPrice,
      propertyId: String(propertyId),
      travelSettings: String(travelSettings),
      bookingPrice: price,
      currency: String(currency).toUpperCase(),
      userAgent: userAgent ? String(userAgent) : 'unknown',
      ipAddress,
    });

    console.log('📊 Deal Click Logged:', {
      providerId: provId,
      selectedProviderId: selProvId,
      selectedPrice,
      propertyId: String(propertyId),
      price,
      currency: String(currency).toUpperCase(),
      ipAddress,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ Error logging click:', error);

    return NextResponse.json(
      {
        error: 'Failed to log click',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
