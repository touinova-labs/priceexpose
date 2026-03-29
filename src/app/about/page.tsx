import { Footer } from "@/components/Footer";
import { Lightbulb, Target, Users, TrendingUp } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-red-600 to-red-700 px-6 py-20 sm:py-32 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            About <span className="text-red-100">PriceExpose</span>
          </h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            We're on a mission to make hotel booking transparent, fair, and rewarding for travelers and hoteliers alike.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="w-full bg-white px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-black mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                To give travelers the transparency they deserve when booking hotels. We expose hidden OTA markups, 
                highlight direct booking opportunities, and help you find the best deals with confidence.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We believe travelers shouldn't be trapped by OTA algorithms or inflated prices. PriceExpose puts 
                you in control.
              </p>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-black mb-6">Our Vision</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                To create a global hospitality ecosystem where hotels can compete fairly on price and quality, 
                and travelers can book with complete confidence.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                A world where direct bookings thrive, OTA dominance is challenged, and everyone—hotels and guests—
                gets a better deal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Started */}
      <section className="w-full bg-gray-50 px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center text-black mb-12">Why We Started</h2>
          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              PriceExpose was born from frustration. We saw travelers paying vastly different prices for the same 
              hotel room, often paying more through OTAs when booking directly would have been cheaper. We saw hotels 
              losing control of their own pricing, held hostage by OTA commissions and algorithms.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The hotel industry needed transparency. Travelers needed power. That's why we built PriceExpose—
              a free comparison tool that shows you every option, every price, and helps you make the smartest 
              choice for your wallet.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Today, we're helping thousands of travelers save money and thousands of hotels gain back control of 
              their direct bookings. This is just the beginning.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="w-full bg-white px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center text-black mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Target,
                title: "Transparency Above All",
                description:
                  "We show you every price, every option, and how much we earn. No hidden fees, no surprises.",
              },
              {
                icon: Users,
                title: "Travelers First",
                description:
                  "Every feature we build is designed to help you save money and book with confidence.",
              },
              {
                icon: Lightbulb,
                title: "Hotel Empowerment",
                description:
                  "Hotels deserve tools to compete fairly and regain control of their direct sales.",
              },
              {
                icon: TrendingUp,
                title: "Fair Competition",
                description:
                  "We believe in a hospitality market where quality and value win, not OTA dominance.",
              },
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Icon className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2">{value.title}</h3>
                      <p className="text-gray-700">{value.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Highlight */}
      <section className="w-full bg-gray-50 px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-bold text-black mb-6">Built by Travel Enthusiasts</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Our team comes from diverse backgrounds in travel, technology, and hospitality. We're passionate about 
            solving real problems for real travelers.
          </p>
          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <p className="text-gray-700 italic">
              "We've all felt the frustration of paying too much for a hotel room. PriceExpose exists because we 
              wanted to change that—for ourselves and millions of others."
            </p>
            <p className="text-gray-900 font-semibold mt-4">
              — The PriceExpose Team
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
