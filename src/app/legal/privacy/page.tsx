import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section */}
      <section className="w-full bg-gray-100 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">Privacy Policy</h1>
          <p className="text-gray-600 text-lg">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-black mb-4">Data Protection at PriceExpose</h2>
              <p>
                Your privacy is important to us. This policy explains how we collect, use, and protect your data 
                when you use PriceExpose.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">1. What Data We Collect</h2>
              <h3 className="text-xl font-semibold text-black mt-4 mb-3">We DO NOT collect:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Credit card numbers or full payment information</li>
                <li>Complete booking confirmations or itineraries</li>
                <li>Passport numbers or government IDs</li>
                <li>Passwords from other websites or services</li>
              </ul>
              <h3 className="text-xl font-semibold text-black mt-6 mb-3">We MAY collect:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Search queries (destinations, dates, preferences)</li>
                <li>Device information (browser type, operating system)</li>
                <li>IP address and location data</li>
                <li>Cookies and tracking identifiers</li>
                <li>Usage analytics (pages visited, time spent, clicks)</li>
                <li>Email address (only if you voluntarily provide it)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">2. How We Use Your Data</h2>
              <p>We use collected data to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Provide and improve our search and comparison service</li>
                <li>Personalize your experience</li>
                <li>Track analytics and service performance</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
                <li>Send service updates (only with your consent)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">3. Data Security</h2>
              <p>
                We protect your data using industry-standard encryption and security measures:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>All data transmission uses HTTPS/TLS encryption</li>
                <li>Sensitive data is encrypted at rest</li>
                <li>Regular security audits and penetration testing</li>
                <li>Restricted access to personal data (staff only when necessary)</li>
                <li>Compliance with GDPR, CCPA, and international standards</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">4. Data Sharing</h2>
              <p>
                We do NOT sell your personal data to third parties. However, we may share data with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Service providers:</strong> Analytics, hosting, and security partners (under confidentiality agreements)</li>
                <li><strong>Hotel partners:</strong> Limited data only if you explicitly book through us</li>
                <li><strong>Legal authorities:</strong> If required by law or court order</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">5. Cookies & Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Remember your preferences and settings</li>
                <li>Track usage patterns for service improvement</li>
                <li>Detect fraudulent activity</li>
                <li>Show relevant advertisements</li>
              </ul>
              <p className="mt-4">
                You can disable cookies in your browser settings, though this may limit some features of our service.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your data (right to be forgotten)</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at: <strong>privacy@priceexpose.com</strong>
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">7. Data Retention</h2>
              <p>
                We retain your data only as long as necessary to provide our service:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Search history: Deleted after 90 days (or per your preference)</li>
                <li>Account data: Retained while you use PriceExpose</li>
                <li>Analytics data: Aggregated and anonymized after 12 months</li>
                <li>Legal/compliance data: Retained as required by law</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">8. GDPR Compliance</h2>
              <p>
                For users in the EU/EEA, we comply with the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>We only process your data with your explicit consent</li>
                <li>We have a Data Protection Officer available upon request</li>
                <li>You have the right to lodge a complaint with your local DPA</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">9. Policy Updates</h2>
              <p>
                We may update this privacy policy to reflect changes in our practices or legal requirements. 
                We will notify you of material changes via email or on our website.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">10. Contact Us</h2>
              <p>
                For privacy questions or to exercise your rights, please contact:
              </p>
              <p className="mt-4">
                <strong>Privacy Team</strong><br />
                Email: <strong>privacy@priceexpose.com</strong><br />
                Address: [Your Company Address]
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
