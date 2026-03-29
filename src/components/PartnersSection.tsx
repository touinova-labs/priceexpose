import { Check, TrendingUp, Zap } from "lucide-react";

export function PartnersSection() {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "For small & independent hotels",
      features: [
        "Your official site shown if it's the cheapest",
        "No cost, no catch",
        "Basic listing in results",
      ],
      cta: "Start Free",
      highlight: false,
    },
    {
      name: "Premium",
      price: "$49/mo",
      description: "For hotels serious about direct bookings",
      features: [
        '"Verified Official" gold badge (even if price matches)',
        "Featured placement above OTAs",
        "Analytics: See traveler clicks & interest",
        'Custom "Special Offer" badges',
        "Priority support",
      ],
      cta: "Upgrade to Premium",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For hotel chains & large groups",
      features: [
        "Full API access to monitor pricing",
        "Detect rogue wholesaler undercutting",
        "Custom reporting dashboard",
        "Dedicated account manager",
        "Advanced fraud detection",
      ],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <section className="w-full bg-white px-6 py-20 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            For Hotels: Get More <span className="text-red-600">Direct Bookings</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Tired of losing revenue to OTAs? PriceExpose puts your official site front and center when you offer the best deal—no more hidden undercutting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-lg p-8 transition-all ${
                plan.highlight
                  ? "bg-red-600 text-white shadow-lg scale-105"
                  : "bg-gray-50 text-black border border-gray-200"
              }`}
            >
              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? "text-white" : "text-black"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.highlight ? "text-red-100" : "text-gray-600"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-black"}`}>
                  {plan.price}
                </span>
                {plan.price !== "Custom" && (
                  <span className={`ml-2 ${plan.highlight ? "text-red-100" : "text-gray-600"}`}>
                    per month
                  </span>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex gap-3 items-start">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className={plan.highlight ? "text-red-50" : "text-gray-700"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                  plan.highlight
                    ? "bg-white text-red-600 hover:bg-gray-100"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
