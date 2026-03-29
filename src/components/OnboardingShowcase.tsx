"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

export function OnboardingShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "The Magic Badge",
      description: "When you see the Red Badge on Booking.com, it means we found a better price.",
      icon: "🎯",
    },
    {
      title: "Pin the Extension",
      description: "Pin PriceExpose to your toolbar so you never miss a deal. (Click the puzzle icon, then the pin!)",
      icon: "📌",
    },
    {
      title: "Real-Time Companion",
      description: "Our assistant follows you to the hotel site to make sure the price doesn't change at checkout. No surprises, just savings.",
      icon: "🚀",
    },
  ];

  return (
    <section className="w-full bg-gray-50 px-6 py-20 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            Your First 3 Steps: <span className="text-red-600">Onboarding</span>
          </h2>
          <p className="text-xl text-gray-700">
            This is what you'll see when you install PriceExpose
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-12 text-center min-h-96 flex flex-col justify-center">
            <div className="text-6xl mb-6">{slides[activeSlide].icon}</div>
            <h3 className="text-3xl font-bold text-black mb-4">
              {slides[activeSlide].title}
            </h3>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              {slides[activeSlide].description}
            </p>
          </div>

          <div className="bg-gray-100 px-8 py-6 flex items-center justify-between">
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`h-3 rounded-full transition-all ${
                    activeSlide === index ? "bg-red-600 w-8" : "bg-gray-300 w-3"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              {activeSlide === slides.length - 1 ? "Done" : "Next"}
              {activeSlide < slides.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
