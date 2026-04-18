'use client';

import { Footer } from "@/components/Footer";
import { CheckCircle, Zap, Lock, AlertCircle, Play, Sparkles, TrendingDown, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const [formData, setFormData] = useState({
    email: '',
    favoriteRoute: '',
    consentGiven: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');


  useEffect(() => {
    // Track page view when component mounts
    const trackPageView = async () => {
      try {
        await fetch('/api/tracking/page-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pageName: 'welcome',
          }),
        });
        if (typeof (window as any).gtag === 'function') {
          (window as any).gtag('event', 'conversion', {
            send_to: 'AW-17950352927/T3BQCMu9sZ4cEJ_Msu9C'
          });
        }
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setSubmitMessage('✅ ' + data.message);
      setFormData({ email: '', favoriteRoute: '', consentGiven: false });

      // Clear message after 5 seconds
      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section - The Magic */}
      <section className="w-full bg-gradient-to-br from-[#cc0000] via-[#e60000] to-[#990000] px-6 py-20 sm:py-32 text-white relative overflow-hidden">
        {/* Decorative elements with subtle blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-400 opacity-20 rounded-full -ml-36 -mb-36 blur-2xl"></div>

        <div className="mx-auto max-w-4xl text-center relative z-10">
          <div className="mb-8 inline-block animate-fade-in">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold border border-white/20">
              <ShieldCheck size={16} className="text-green-400" />
              PriceExpose is officially live & active
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
            Stop Guessing. <br />
            <span className="text-red-200">Start Saving.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-red-50 max-w-3xl mx-auto leading-relaxed font-medium opacity-90">
            We’re now scanning <span className="font-bold text-white">100+ sites in real-time</span>. Browse hotels as usual—we’ll appear seamlessly the moment a cheaper rate is found.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mt-12">
            <a
              href="https://www.booking.com/searchresults.html?ss=Paris"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-white text-red-600 px-10 py-5 rounded-xl font-black hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all text-xl"
            >
              <TrendingDown size={24} />
              Start Your First Search
            </a>

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white/50 text-white px-10 py-5 rounded-xl font-bold hover:bg-white/10 hover:border-white transition-all text-xl"
            >
              See how it works
            </a>
          </div>

          {/* Social Proof / Trust indicator */}
          <div className="mt-12 flex items-center justify-center gap-2 text-red-100/70 text-sm font-medium">
            <CheckCircle size={14} />
            Verified by PriceExpose Technology • Free forever
          </div>
        </div>
      </section>

      {/* 3-Step Success */}
      <section id="how-it-works" className="w-full bg-white px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="inline-block text-red-600 font-semibold text-sm mb-3 tracking-wide uppercase">HOW IT WORKS</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-black">
              Three Steps to <span className="text-red-600">Maximum Savings</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                icon: "📌",
                title: "Pin the Extension",
                description:
                  "Click the puzzle icon in the top right, then pin PriceExpose for instant access.",
              },
              {
                number: "02",
                icon: "🔍",
                title: "Search as Normal",
                description:
                  "Browse Booking.com like you always do. We automatically analyze prices in the background.",
              },
              {
                number: "03",
                icon: "💰",
                title: "Save Instantly",
                description:
                  "See our red badge? We found a cheaper rate. Click to compare and book with confidence.",
              },
            ].map((step, index) => (
              <div key={index} className="relative group">
                <div className="relative h-full bg-white border border-gray-200 p-8 rounded-2xl hover:border-red-600 hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center group-hover:from-red-200 group-hover:to-red-100 transition-all duration-300">
                        <span className="text-4xl">{step.icon}</span>
                      </div>
                      <span className="absolute top-0 right-0 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3 text-center">{step.title}</h3>
                  <p className="text-gray-700 leading-relaxed text-center">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 items-center justify-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo CTA */}
      <section className="w-full bg-gradient-to-b from-gray-50 to-white px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-black mb-6">Ready to See Real Savings?</h2>
          <p className="text-xl text-gray-700 mb-12 font-light">
            Test PriceExpose on one of the world's most popular destinations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { city: "Paris", query: "Paris", emoji: "🗼" },
              { city: "New York", query: "New%20York", emoji: "🏙️" },
              { city: "Tokyo", query: "Tokyo", emoji: "🗾" },
            ].map((item, index) => (
              <a
                key={index}
                href={`https://www.booking.com/searchresults.html?ss=${item.query}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-red-600 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="font-bold text-lg text-black group-hover:text-red-600 transition-colors">{item.city}</h3>
                <p className="text-sm text-gray-600 mt-3 group-hover:text-red-500 transition-colors font-semibold">Test Now →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Transparency */}
      <section className="w-full bg-white px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="inline-block text-red-600 font-semibold text-sm mb-3 tracking-wide uppercase">Transparency First</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-black">
              Why You Can <span className="text-red-600">Trust PriceExpose</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600 p-8 rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-2">Why It's Completely Free</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    We earn a small commission when you book through partner channels. <strong>You always pay the same price</strong>—with or without our help. We only win when you save money.
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600 p-8 rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-2">Privacy Protected</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Zero data selling. Zero tracking. Zero fluff. We never touch your private info or payment details—we just find you cheaper hotels. That's it.                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600 p-8 rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-2">Secure & Certified</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    All connections are encrypted and GDPR compliant. We're regularly audited for security and privacy. Your trust matters to us.
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-600 p-8 rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-2">No Hidden Fees</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    We show all applicable fees upfront. No surprises, no fine print. Check our <a href="/legal/affiliate-disclosure" className="text-red-600 hover:text-red-700 font-semibold underline">full transparency report</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture CTA */}
      <section className="w-full bg-gradient-to-r from-red-600 to-red-700 px-6 py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>

        <div className="mx-auto max-w-2xl relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-3">
              Get Smart Price Alerts
            </h2>
            <p className="text-red-100 text-lg font-light">
              We'll notify you when fares drop 30% on your favorite routes.
            </p>
          </div>

          <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  required
                  className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Favorite Route</label>
                <input
                  type="text"
                  name="favoriteRoute"
                  value={formData.favoriteRoute}
                  onChange={handleInputChange}
                  placeholder="e.g., Paris to New York"
                  className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all"
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  name="consentGiven"
                  checked={formData.consentGiven}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5 accent-red-600 rounded cursor-pointer"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to receive email notifications about price drops and PriceExpose updates.
                </label>
              </div>

              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">{submitError}</p>
                </div>
              )}

              {submitMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">{submitMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg hover:scale-105 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Enabling...' : 'Enable Alerts'}
              </button>
            </form>

            <p className="text-gray-500 text-xs text-center mt-6">
              We respect your privacy. Unsubscribe anytime with one click.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full bg-gray-50 px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="inline-block text-red-600 font-semibold text-sm mb-3 tracking-wide uppercase">Questions?</span>
            <h2 className="text-4xl font-bold text-black">Frequently Asked</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Why isn't the extension showing up on Booking.com?",
                a: "Make sure the extension is pinned and you're browsing Booking.com. Try refreshing the page. Need help? Contact support@priceexpose.com or check our troubleshooting guide.",
              },
              {
                q: "Will I pay more using PriceExpose?",
                a: "Never. You pay exactly the same price you would booking directly. Our commission only kicks in if you actually save money.",
              },
              {
                q: "What happens to my data?",
                a: "We never store your payments, messages, or personal data. We only read hotel prices to find you better deals. Full privacy details are in our Privacy Policy.",
              },
              {
                q: "Does it work on mobile?",
                a: "Currently, PriceExpose works on desktop browsers. A mobile version is in development—stay tuned!",
              },
              {
                q: "How do you find cheaper prices?",
                a: "We scan hundreds of booking platforms simultaneously and compare prices in real-time. We also partners with hotels directly to find exclusive rates.",
              },
            ].map((faq, index) => (
              <details key={index} className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-red-600 hover:shadow-md transition-all duration-300 cursor-pointer">
                <summary className="flex justify-between items-center font-bold text-black group-open:text-red-600 group-open:mb-4">
                  {faq.q}
                  <span className="transition-transform group-open:rotate-180 text-red-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </span>
                </summary>
                <p className="text-gray-700 leading-relaxed text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full bg-gradient-to-br from-black to-gray-900 px-6 py-20 sm:py-32 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 opacity-10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-600 opacity-10 rounded-full -ml-36 -mb-36"></div>

        <div className="mx-auto max-w-3xl text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Save?</h2>
          <p className="text-lg text-gray-300 mb-10 font-light">
            Your extension is ready to work. Head to Booking.com and find your first deal.
          </p>
          <a
            href="https://www.booking.com/searchresults.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 hover:shadow-2xl hover:scale-105 text-white px-10 py-5 rounded-lg font-bold text-lg transition-all duration-300"
          >
            <TrendingDown size={20} />
            Go to Booking.com →
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
