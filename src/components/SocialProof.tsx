import { Star } from "lucide-react";

export function SocialProof() {
  const reviews = [
    {
      text: "Saved me $120 on my last trip! Game-changer for budget travelers.",
      author: "Sarah M.",
      rating: 5,
    },
    {
      text: "Finally, a tool that tells the truth about hotel prices. No more guessing.",
      author: "James K.",
      rating: 5,
    },
    {
      text: "The red badge feature is genius. Found a deal in literally 30 seconds.",
      author: "Emma L.",
      rating: 5,
    },
  ];

  return (
    <section className="w-full bg-gray-50 px-6 py-20 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <div className="inline-block bg-red-100 text-red-700 font-bold px-4 py-2 rounded-full mb-6">
            ★ Trusted by 10,000+ Smart Travelers
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">What Our Users Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-red-600 text-red-600" />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">"{review.text}"</p>
              <p className="font-semibold text-black">{review.author}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="#" className="text-red-600 font-semibold text-lg hover:text-red-700">
            Read more reviews →
          </a>
        </div>
      </div>
    </section>
  );
}
