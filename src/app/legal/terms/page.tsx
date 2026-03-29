import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section */}
      <section className="w-full bg-gray-100 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">Terms of Service</h1>
          <p className="text-gray-600 text-lg">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-black mb-4">1. Service Overview</h2>
              <p>
                PriceExpose is a comparison and transparency tool designed to help travelers find better hotel rates. 
                We search and display available options from various providers so you can make informed decisions about 
                where to book.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">2. What We Do & Don't Do</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>We do:</strong> Search, compare, and display hotel rates from multiple sources</li>
                <li><strong>We do:</strong> Provide transparency about available options and pricing</li>
                <li><strong>We do NOT:</strong> Process payments or handle credit card information</li>
                <li><strong>We do NOT:</strong> Store your personal booking data</li>
                <li><strong>We do NOT:</strong> Control the final prices shown by providers</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">3. Final Pricing</h2>
              <p>
                All final prices are determined by the provider (hotel, OTA, or booking platform). PriceExpose shows 
                estimated rates, but the actual price at checkout may vary due to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Real-time availability changes</li>
                <li>Taxes and fees applied at checkout</li>
                <li>Currency conversion rates</li>
                <li>Dynamic pricing updates</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">4. Affiliate Relationships</h2>
              <p>
                PriceExpose earns commissions when you book through our links. This is at no extra cost to you—
                you pay the same price whether you book directly or through us. See our Affiliate Disclosure for details.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">5. Accuracy & Reliability</h2>
              <p>
                We strive to provide accurate, up-to-date information. However, we:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Cannot guarantee real-time accuracy of all prices</li>
                <li>Are not responsible for provider website technical issues</li>
                <li>Are not responsible for booking platform errors or failures</li>
                <li>Cannot control availability or last-minute price changes</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">6. User Responsibilities</h2>
              <p>By using PriceExpose, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Use the service for personal, non-commercial purposes only</li>
                <li>Not scrape, crawl, or automate access to our platform</li>
                <li>Not reverse-engineer or attempt to copy our technology</li>
                <li>Review terms with booking providers before confirming payment</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">7. Limitation of Liability</h2>
              <p>
                PriceExpose is provided "as is." We are not responsible for losses, damages, or claims arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Booking decisions made through our platform</li>
                <li>Provider website or service failures</li>
                <li>Price discrepancies or booking errors</li>
                <li>Loss of booking confirmations or itineraries</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">8. Changes to Terms</h2>
              <p>
                We may update these terms at any time. Your continued use of PriceExpose constitutes acceptance 
                of updated terms. We will notify users of material changes via email or on our website.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">9. Contact & Support</h2>
              <p>
                For questions about these terms, please contact us at: <strong>legal@priceexpose.com</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
