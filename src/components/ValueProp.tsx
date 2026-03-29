import { Shield, Eye, Zap, DollarSign } from "lucide-react";

export function ValueProp() {
  const values = [
    {
      icon: Shield,
      title: "No Hidden Fees",
      description: "We search and display alternatives so you can find the best deals without any hidden charges. You pay directly with your chosen provider.",
    },
    {
      icon: Eye,
      title: "Complete Transparency",
      description: "We show you every option side-by-side, so you can make the smartest choice.",
    },
    {
      icon: Zap,
      title: "Real-Time Companion",
      description: "Our Companion Bar follows you to the hotel site to ensure the price stays real all the way to checkout.",
    },
    {
      icon: DollarSign,
      title: "Le Vrai Prix Net",
      description: "Nous analysons les petits caractères (taxes, petit-déjeuner, Genius) que les autres comparateurs ignorent pour vous donner le vrai prix net.",
    },
  ];

  return (
    <section className="w-full bg-white px-6 py-20 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            No Hidden Fees. No Surprises.
            <br />
            <span className="text-red-600">Just Savings.</span>
          </h2>
          <p className="text-xl text-gray-700 mt-6 max-w-2xl mx-auto">
            PriceExpose is your travel sidekick—transparent, unbiased, and always on your side.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-red-100 rounded-full">
                    <Icon className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">{value.title}</h3>
                <p className="text-gray-700 text-lg leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
