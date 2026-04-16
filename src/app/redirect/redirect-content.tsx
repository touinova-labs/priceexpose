'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield } from 'lucide-react';

interface DealClickParams {
  providerId: number;
  selectedProviderId: number;
  selectedProviderPrice: number;
  propertyId: string;
  travelSettings: string;
  bookingPrice: number;
  currency: string;
  url: string;
}

export default function RedirectContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const hasLogged = useRef(false);

  // Extract all deal click parameters from URL
  const dealClickParams: DealClickParams | null = (() => {
    try {
      const providerId = searchParams.get('providerId');
      const selectedProviderId = searchParams.get('selectedProviderId');
      const selectedProviderPrice = searchParams.get('selectedProviderPrice');
      const propertyId = searchParams.get('propertyId');
      const travelSettings = searchParams.get('travelSettings');
      const bookingPrice = searchParams.get('bookingPrice');
      const currency = searchParams.get('currency');
      const url = searchParams.get('url');

      if (
        !providerId ||
        !selectedProviderId ||
        !selectedProviderPrice ||
        !propertyId ||
        !travelSettings ||
        !bookingPrice ||
        !currency ||
        !url
      ) {
        return null;
      }

      return {
        providerId: parseInt(providerId, 10),
        selectedProviderId: parseInt(selectedProviderId, 10),
        selectedProviderPrice: parseFloat(selectedProviderPrice),
        propertyId,
        travelSettings,
        bookingPrice: parseFloat(bookingPrice),
        currency,
        url,
      };
    } catch (error) {
      console.error('Error parsing deal click parameters:', error);
      return null;
    }
  })();

  const dealUrl = dealClickParams?.url;

  useEffect(() => {
    if(hasLogged.current) return;
    hasLogged.current = true;
    // Validate required parameters
    if (!dealUrl || !dealClickParams) {
      setErrorMessage('Invalid redirect link. Missing required parameters.');
      setIsLoading(false);
      return;
    }

    // Failsafe timer: redirect anyway after 2 seconds
    const failsafeTimer = setTimeout(() => {
      console.log('Failsafe timeout - redirecting to:', dealUrl);
      window.location.replace(dealUrl);
    }, 10_000);

    // Log the click to the database
    const logClick = async () => {
      try {
        // Make API call to log the click with all deal information
        const response = await fetch('/api/deals/log-click', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            providerId: dealClickParams.providerId,
            selectedProviderId: dealClickParams.selectedProviderId,
            selectedProviderPrice: dealClickParams.selectedProviderPrice,
            propertyId: dealClickParams.propertyId,
            travelSettings: dealClickParams.travelSettings,
            bookingPrice: dealClickParams.bookingPrice,
            currency: dealClickParams.currency,
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
          }),
        });

        // Clear failsafe timer on successful response
        if (response.ok) {
          clearTimeout(failsafeTimer);
          setTimeout(() => {
            window.location.replace(dealUrl);
          }, 300);
        } else {
          // If API fails, still redirect after brief delay
          clearTimeout(failsafeTimer);
          setTimeout(() => {
            window.location.replace(dealUrl);
          }, 500);
        }
      } catch (error) {
        console.error('Error logging click:', error);
        // On error, clear timer and redirect
        clearTimeout(failsafeTimer);
        setTimeout(() => {
          window.location.replace(dealUrl);
        }, 500);
      }
    };

    logClick();

    return () => clearTimeout(failsafeTimer);
  }, [dealUrl, dealClickParams]);

  if (errorMessage) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Oops, something went wrong</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <a
            href="/"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full opacity-20 blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-100 rounded-full opacity-20 blur-3xl -ml-48 -mb-48"></div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-md">
        {/* Logo & Header */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-6">
            <img src="/logo.png" alt="PriceExpose" className="w-12 h-12 shadow-lg" />
            <span className="text-2xl font-bold text-black">PriceExpose</span>
          </div>
        </div>

        {/* Pulse Loader */}
        <div className="mb-10">
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              {/* Outer ring pulse */}
              <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-pulse"></div>

              {/* Middle ring */}
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-red-600 border-r-red-600 animate-spin"></div>

              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Text Status */}
        <div className="space-y-4 mb-10">
          <h1 className="text-3xl font-black text-black leading-tight">
            Securing Your <br />
            <span className="text-red-600">Exclusive Rate</span>
          </h1>

          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-800">
              Verifying your booking...
            </p>
            <p className="text-sm text-gray-600 font-medium">
              Processing deal for {dealClickParams?.propertyId}
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-12 space-y-2">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full animate-pulse" style={{
              width: '60%',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}></div>
          </div>
          <p className="text-xs text-gray-500 font-medium">Redirecting...</p>
        </div>

        {/* Trust badge */}
        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-red-100 shadow-sm">
          <div className="flex items-start gap-3">
            <Shield size={16} className="text-green-600 flex-shrink-0 mt-1" />
            <p className="text-xs text-gray-700 font-medium text-left">
              PriceExpose works with partners to ensure you get the lowest price. You are being safely redirected.
            </p>
          </div>
        </div>

        {/* Additional reassurance */}
        <p className="text-xs text-gray-500 mt-8 font-medium">
          If you are not redirected in a few seconds,{' '}
          <a
            href={dealUrl || '#'}
            className="text-red-600 hover:text-red-700 font-semibold underline"
          >
            click here
          </a>
        </p>
      </div>
    </div>
  );
}
