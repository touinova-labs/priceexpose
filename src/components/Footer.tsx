export function Footer() {
  return (
    <footer className="w-full bg-black text-white px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-red-600">PriceExpose</h3>
            <p className="text-gray-400">
              Find cheaper hotel rates with confidence. Transparent. Unbiased. Always on your side.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Download
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/hotels" className="hover:text-white transition-colors">
                  For Hotels
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/about" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/legal/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/legal/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/legal/affiliate-disclosure" className="hover:text-white transition-colors">
                  Affiliate Disclosure
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div id="legal" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h5 className="font-semibold text-white mb-3">Terms of Service (CGU)</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  • PriceExpose is a comparison tool. Final prices are determined by the provider.
                </li>
                <li>
                  • We do not store your personal booking data or credit card numbers.
                </li>
                <li>
                  • By using PriceExpose, you agree to our terms and privacy policy.
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-3">General Terms of Sale (CGV)</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  • Some links may earn us a commission—at no extra cost to you.
                </li>
                <li>
                  • We strive for accuracy, but cannot guarantee real-time prices or availability.
                </li>
                <li>
                  • For hotels: Subscription fees are billed monthly, cancel anytime.
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-3">Data & Privacy</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  • PriceExpose uses encrypted connections to protect your data.
                </li>
                <li>
                  • We comply with GDPR and international data protection standards.
                </li>
                <li>
                  • Your browsing data is never sold to third parties.
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2026 PriceExpose. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0 text-gray-500 text-sm">
              <a href="/legal/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/legal/terms" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="/contact" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
