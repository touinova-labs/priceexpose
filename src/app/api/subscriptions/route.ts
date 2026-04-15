import { NextRequest, NextResponse } from 'next/server';
import { createPriceAlert, isEmailSubscribed } from '@/deal-finder/helpers/priceAlerts';

// Subscription API endpoint
// POST /api/subscriptions

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, favoriteRoute, consentGiven } = body;

    // Validation
    if (!email || !consentGiven) {
      return NextResponse.json(
        { error: 'Email and consent are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create or update subscription
    const result = await createPriceAlert({
      email,
      favoriteRoute: favoriteRoute || 'General',
      consentGiven,
    });

    console.log('✅ Price Alert Subscription:', {
      email,
      favoriteRoute,
      consentGiven,
      subscribedAt: new Date().toISOString(),
    });

    // TODO: Send confirmation email using SendGrid or similar
    // const confirmationEmail = await sendConfirmationEmail(email, result.subscriptionId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ Subscription Error:', error);

    return NextResponse.json(
      { 
        error: 'Failed to create subscription', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscription status
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // Check if email is subscribed
    const subscribed = await isEmailSubscribed(email);

    return NextResponse.json(
      {
        subscribed,
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Lookup Error:', error);

    return NextResponse.json(
      { error: 'Failed to lookup subscription' },
      { status: 500 }
    );
  }
}
