import { PartnersSection } from "@/components/PartnersSection";
import { Footer } from "@/components/Footer";
import { TrendingUp, Users, Shield } from "lucide-react";

export default function HotelsPage() {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-red-600 to-red-700 px-6 py-20 sm:py-32 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            Take Control of Your <span className="text-red-100">Direct Bookings</span>
          </h1>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Stop losing revenue to OTAs. PriceExpose connects you directly with travelers who value booking directly with you.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full bg-white px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl sm:text-5xl font-bold text-center text-black mb-16">
            Why Hotels Choose <span className="text-red-600">PriceExpose</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Increase Direct Bookings",
                description: "Get featured placement when your official site offers the best rate. Reduce OTA dependency and boost revenue.",
              },
              {
                icon: Users,
                title: "Connect with Conscious Travelers",
                description: "Reach guests who actively seek out better deals—people ready to book directly without middlemen.",
              },
              {
                icon: Shield,
                title: "Protect Your Brand",
                description: 'Detect undercutting by unreliable third parties. Our "Verified Official" badge builds trust and authority.',
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-100 rounded-full">
                      <Icon className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">{benefit.title}</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <PartnersSection />

      {/* CTA Section */}
      <section className="w-full bg-gray-900 px-6 py-20 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Boost Direct Bookings?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of hotels already gaining more direct revenue with PriceExpose.
          </p>
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
            Get Started Today
          </button>
        </div>
      </section>

      {/* Legal Section */}
      <section className="w-full bg-gray-50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-black mb-12">Hotel Partnership Terms</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold text-black mb-4">For Hotel Partners</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Premium & Enterprise plans are billed monthly—cancel anytime, no long-term contracts</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Your hotel data and booking information are encrypted and never shared with third parties</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>We comply with GDPR and international hospitality industry standards</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Full refund policy available for monthly subscriptions within 14 days</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold text-black mb-4">Legal Documents</h3>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <a href="/legal/terms" className="text-red-600 hover:text-red-700 font-semibold transition-colors">
                    → Terms of Service (CGU)
                  </a>
                  <p className="text-sm text-gray-600 mt-1">Review our general terms and conditions</p>
                </li>
                <li>
                  <a href="/legal/privacy" className="text-red-600 hover:text-red-700 font-semibold transition-colors">
                    → Privacy Policy
                  </a>
                  <p className="text-sm text-gray-600 mt-1">See how we protect your data</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
