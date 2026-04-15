import { Smartphone, Apple } from "lucide-react";

export function Hero() {
  return (
    <section className="w-full bg-white px-6 py-20 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="space-y-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-black leading-tight">
            Unlock Cheaper Hotel Rates—<span className="text-red-600">Instantly.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Stop overpaying on Booking.com. PriceExpose finds the real lowest price—direct from hotels and top providers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <a
              href="https://chromewebstore.google.com/detail/priceexpose-%E2%80%93-stop-overpa/mnokglibfjmpbedpkhiplggpfpgifmed?authuser=0&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-lg"
            >
              <Smartphone className="w-5 h-5" />
              Download for Chrome
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-black text-black font-semibold rounded-lg hover:bg-black hover:text-white transition-colors text-lg"
            >
              <Apple className="w-5 h-5" />
              Download for Safari
            </a>
          </div>

          <p className="text-sm text-gray-600 pt-4">
            Free • No signup required • Works immediately
          </p>
        </div>
      </div>
    </section>
  );
}
