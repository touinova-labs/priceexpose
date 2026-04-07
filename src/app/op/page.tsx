import React from 'react';
import { Search, ChevronLeft, ChevronRight, RefreshCw, Star, Clock, CheckCircle2, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

const App = () => {
  return (
    <div className="w-[1280px] h-[800px] bg-white flex flex-col font-sans overflow-hidden relative border border-slate-200">

      {/* 1. SECTION TITRE (HEADER) */}
      <div className="pt-5 pb-4 text-center px-4 bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-3xl font-extrabold text-[#1a2b4b] tracking-tight mb-1">
          Think You Found the Best Price? Think Again.
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          PriceExpose Reveals What Booking Sites Don’t
        </p>
      </div>

      {/* 2. LE NAVIGATEUR (BROWSER SIMULATION) */}
      <div className="mx-12 bg-white rounded-t-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-300 flex-grow flex flex-col overflow-hidden relative z-10">

        {/* Barre d'outils Chrome */}
        <div className="bg-[#e9ecef] p-2 flex items-center gap-2 border-b border-slate-300">
          <div className="flex gap-1.5 px-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <div className="bg-white rounded-full flex-grow h-7 flex items-center px-4 gap-2 border border-slate-300 ml-4 shadow-sm">
            <ShieldCheck size={12} className="text-green-600" />
            <span className="text-[11px] text-slate-400">https://</span>
            <span className="text-[11px] text-slate-700 font-medium italic">booking.com/hotel/paris...</span>
          </div>
          <div className="flex gap-4 px-4 text-slate-400">
            <RefreshCw size={12} />
            <div className="w-6 h-6 rounded-full bg-slate-300"></div>
          </div>
        </div>

        {/* Contenu de la page de réservation */}
        <div className="flex-grow bg-[#f8f9fa] flex overflow-hidden relative">

          <img src="/op.png" alt="Hotel Room" className="object-cover w-full" style={{ position: "absolute", top: "-125px" }} />

          <div
            className="absolute"
            style={{
              height: "100%",
              width: "66%",
              left: "0%",
              backdropFilter: "blur(2px)", // ✨ blur effect
            }}
          />

          <div
            className="absolute"
            style={{
              height: "100%",
              width: "66%",
              left: "0%",
              backdropFilter: "blur(2px)", // ✨ blur effect
            }}
          />

          <div
            className="absolute"
            style={{
              height: "4%",
              width: "10%",
              left: "68%",
              top: "38%",
              background: "white",
              color: "#666666",
              fontSize: "12px",
              textTransform: "uppercase",
              fontWeight: "800"
            }}
          >
            hotels.com
          </div>

          <div
            className="absolute"
            style={{
              height: "4%",
              width: "10%",
              left: "68%",
              top: "50%",
              background: "white",
              color: "#666666",
              fontSize: "12px",
              textTransform: "uppercase",
              fontWeight: "800"
            }}
          >
            opodo
          </div>


        </div>

        {/* 3. BANNIÈRE BASSE (BOTTOM BANNER) */}
        <div className="bg-[#f8f9fa] border-t border-slate-200 px-12 py-3 flex items-center justify-between relative z-50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center p-3">
              <Clock className="text-yellow-500" size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1a2b4b] leading-none mb-1">Built for travelers</h2>
              <p className="text-slate-500 font-semibold text-lg">
                We work for your wallet — no OTAs, no third parties
              </p>
            </div>
          </div>

          {/* LOGO REDESIGN (PriceExpose Logo) */}
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="PriceExpose Logo" className="w-18 h-18" />
          </div>
        </div>
      </div>
    </div >
  );
};

export default App;