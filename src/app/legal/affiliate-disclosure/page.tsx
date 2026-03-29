import { Footer } from "@/components/Footer";

export default function AffiliateDisclosurePage() {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section */}
      <section className="w-full bg-gray-100 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">Affiliate Disclosure</h1>
          <p className="text-gray-600 text-lg">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-black mb-4">Transparency About Our Business Model</h2>
              <p>
                At PriceExpose, we believe in complete transparency. We want you to understand how we operate 
                and how we make money, so you can trust our recommendations.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">How PriceExpose Makes Money</h2>
              <p>
                PriceExpose is free for users because we earn commissions when you book through our links. 
                Here's the important part: <strong>You pay the exact same price whether you book directly or through us.</strong>
              </p>
              <p className="mt-4">
                When you click a booking link on PriceExpose and complete a reservation, hotels, OTAs, or booking 
                platforms pay us a small commission. This is a standard industry practice and does not increase your costs.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">Affiliate Relationships</h2>
              <p>
                PriceExpose has affiliate relationships with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Hotel Booking Platforms:</strong> Booking.com, Expedia, Agoda, Hotels.com, etc.</li>
                <li><strong>Direct Hotel Programs:</strong> Hotel chain loyalty programs and direct booking partnerships</li>
                <li><strong>Payment Gateways:</strong> Various payment processors for premium hotel subscriptions</li>
              </ul>
              <p className="mt-4">
                Commission rates vary by provider and booking type, typically ranging from 5% to 15%. These rates 
                are determined by each partner and do not affect the price you pay.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">Our Independence</h2>
              <p>
                Despite these affiliate relationships, we maintain independence in our recommendations:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>We display ALL relevant options, not just high-commission providers</li>
                <li>We rank results by price and value, not commission potential</li>
                <li>We highlight if your direct hotel booking is the cheapest option</li>
                <li>We do NOT suppress or hide lower-commission alternatives</li>
                <li>Our hotel partners cannot pay for better placement in search results</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">Premium Hotel Partnerships</h2>
              <p>
                Our Premium and Enterprise hotel programs generate additional revenue:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Premium Plan:</strong> Hotels pay for "Verified Official" badging and featured placement</li>
                <li><strong>Enterprise Plan (Custom):</strong> Hotels pay for API access, monitoring tools, and dedicated support</li>
              </ul>
              <p className="mt-4">
                These programs help hotels promote their official websites and reduce OTA dependency. They do not affect 
                the pricing or options shown to travelers.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">FTC & Advertising Standards Compliance</h2>
              <p>
                PriceExpose complies with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>FTC Endorsement Guidelines:</strong> All affiliate relationships are clearly disclosed</li>
                <li><strong>EU Advertising Standards:</strong> Affiliate links are marked where required</li>
                <li><strong>ASA UK Code:</strong> We follow advertising standards for UK users</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">Potential Conflicts & How We Manage Them</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-2">Conflict: Higher commissions might tempt biased recommendations</h3>
                  <p><strong>How we manage it:</strong> Our algorithm prioritizes price and traveler value, not commission size. All options are displayed equally.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-2">Conflict: Hotel partners might request favorable placement</h3>
                  <p><strong>How we manage it:</strong> Placement is based on search relevance and price, not sponsorship. Premium hotel plans include badging, not search manipulation.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-2">Conflict: We might hide cheaper direct options to earn commissions</h3>
                  <p><strong>How we manage it:</strong> We explicitly show when booking directly with a hotel is cheaper and encourage it.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">What This Means For You</h2>
              <p>
                As a PriceExpose user, you can trust that:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>You're seeing transparent, unbiased hotel comparisons</li>
                <li>You will never pay more because of our affiliate relationships</li>
                <li>If booking directly is cheaper, we'll show you that option</li>
                <li>Our recommendations are based on YOUR best value, not our commission</li>
                <li>All our business relationships are disclosed here and throughout our site</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-4">Questions About Our Business Model?</h2>
              <p>
                We're happy to explain our affiliate relationships and business practices. Contact us at:
              </p>
              <p className="mt-4">
                <strong>Email:</strong> transparency@priceexpose.com<br />
                <strong>Subject:</strong> Affiliate & Business Model Questions
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Disclosure Summary</h3>
              <p className="text-blue-800">
                "PriceExpose receives affiliate commissions when you book through our links. This supports our free 
                service but does not affect your booking price. We maintain editorial independence and always show you 
                the option that provides the best value—whether that's through our links or a direct hotel booking."
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
