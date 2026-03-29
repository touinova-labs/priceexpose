import { Download, Globe, AlertCircle } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Install PriceExpose",
      description: "Add the extension in seconds—no signup required.",
      icon: Download,
    },
    {
      number: 2,
      title: "Browse Booking.com",
      description: "Shop as usual. We work quietly in the background.",
      icon: Globe,
    },
    {
      number: 3,
      title: "Spot the Red Badge",
      description: "See our Red Badge? That's your cue: we found a better deal. Click to compare and save.",
      icon: AlertCircle,
    },
  ];

  return (
    <section className="w-full bg-gray-50 px-6 py-20 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">How It Works</h2>
          <p className="text-lg text-gray-700">Three simple steps to finding better deals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-6">
                  <Icon className="w-7 h-7 text-red-600" />
                </div>
                <div className="inline-block bg-red-600 text-white font-bold px-3 py-1 rounded-full text-sm mb-4">
                  Step {step.number}
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">{step.title}</h3>
                <p className="text-gray-700 text-lg leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
