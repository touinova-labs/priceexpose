import { Footer } from "@/components/Footer";
import { CheckCircle, Zap, Lock, AlertCircle, Play } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section - The Hook */}
      <section className="w-full bg-gradient-to-br from-red-600 via-red-500 to-red-700 px-6 py-20 sm:py-32 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6">
            <span className="inline-block bg-red-400 bg-opacity-30 text-red-100 px-4 py-2 rounded-full text-sm font-semibold">
              🎉 Extension Installée !
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            Vous venez de débloquer <span className="text-red-100">les tarifs secrets</span> des hôtels.
          </h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto leading-relaxed">
            PriceExpose scanne désormais le web en temps réel pour vous trouver le meilleur prix pendant que vous naviguez sur Booking.com et les autres plateformes de réservation.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <a
              href="https://www.booking.com/searchresults.html?ss=Paris"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-lg font-bold hover:bg-red-50 transition-colors text-lg"
            >
              <Play size={20} />
              Faire mon premier test →
            </a>
          </div>
        </div>
      </section>

      {/* 3-Step Guide */}
      <section className="w-full bg-white px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl sm:text-5xl font-bold text-center text-black mb-16">
            Comment ça marche en <span className="text-red-600">3 étapes</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                icon: "📌",
                title: "Épinglez l'extension",
                description:
                  "Cliquez sur l'icône puzzle 🧩 en haut à droite, puis sur la punaise 📌 à côté de PriceExpose pour nous voir en un clic.",
              },
              {
                number: "02",
                icon: "🏨",
                title: "Naviguez sur Booking",
                description:
                  "Cherchez un hôtel comme vous le faites d'habitude. Nous apparaissons automatiquement quand une économie est possible.",
              },
              {
                number: "03",
                icon: "💰",
                title: "Économisez & Réservez",
                description:
                  "Le badge rouge vous indique le montant économisé. Cliquez sur l'offre alternative et finalisez votre séjour.",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-4xl">{step.icon}</span>
                      </div>
                      <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">{step.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-red-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo CTA */}
      <section className="w-full bg-gray-50 px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-black mb-6">Voyez-le en action</h2>
          <p className="text-xl text-gray-700 mb-8">
            Prêt à voir PriceExpose trouver des économies réelles ? Testez-le maintenant sur Booking.com.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { city: "Paris", query: "Paris" },
              { city: "New York", query: "New%20York" },
              { city: "Tokyo", query: "Tokyo" },
            ].map((item, index) => (
              <a
                key={index}
                href={`https://www.booking.com/searchresults.html?ss=${item.query}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 bg-white border border-gray-200 rounded-lg hover:border-red-600 hover:shadow-lg transition-all group"
              >
                <div className="text-2xl mb-2">🏨</div>
                <h3 className="font-bold text-black group-hover:text-red-600 transition-colors">{item.city}</h3>
                <p className="text-sm text-gray-600 mt-2">Tester maintenant →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Transparency */}
      <section className="w-full bg-white px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center text-black mb-16">
            Confiance & <span className="text-red-600">Transparence</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-8 rounded">
              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-black mb-3">Pourquoi c'est gratuit ?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Nous recevons une commission lorsque vous réservez directement auprès d'un hôtel ou d'un partenaire. 
                    <strong> Vous payez exactement le même prix</strong> avec ou sans notre extension. Nous gagnons seulement 
                    si vous économisez de l'argent.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-8 rounded">
              <div className="flex gap-4">
                <Lock className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-black mb-3">Votre vie privée est protégée</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Nous ne lisons pas vos messages, nous ne stockons pas vos cartes bancaires, et nous ne vendons pas 
                    vos données. Nous lisons uniquement les prix des hôtels pour vous trouver les meilleures offres.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-600 p-8 rounded">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-black mb-3">100% certifié & sécurisé</h3>
                  <p className="text-gray-700 leading-relaxed">
                    PriceExpose est audité régulièrement pour la sécurité et la confidentialité. Toutes nos connexions 
                    sont chiffrées et conformes aux normes GDPR.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-600 p-8 rounded">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-black mb-3">Transparent sur les tarifs</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Nous vous montrons tous les frais applicables avant que vous réserviez. Pas de frais cachés, 
                    pas de surprises. Revoir notre <a href="/legal/affiliate-disclosure" className="text-red-600 hover:text-red-700 font-semibold">divulgation complète</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture CTA */}
      <section className="w-full bg-gradient-to-r from-red-600 to-red-700 px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Recevez des alertes intelligentes
          </h2>
          <p className="text-red-100 text-center mb-8">
            Nous vous notifierons quand les prix chutent de plus de 30% sur vos routes préférées.
          </p>

          <form className="space-y-4">
            <input
              type="email"
              placeholder="Entrez votre email"
              className="w-full px-6 py-4 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-red-600"
            />
            <button
              type="submit"
              className="w-full bg-white text-red-600 font-bold py-4 px-6 rounded-lg hover:bg-red-50 transition-colors"
            >
              Activer les alertes intelligentes
            </button>
          </form>

          <p className="text-red-100 text-sm text-center mt-4">
            Nous respectons votre vie privée. Vous pouvez vous désabonner à tout moment.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full bg-gray-50 px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-black mb-16">Questions fréquentes</h2>

          <div className="space-y-6">
            {[
              {
                q: "Que se passe-t-il si l'extension n'apparaît pas sur Booking.com ?",
                a: "Assurez-vous que l'extension est épingléeEt que vous êtes sur booking.com. Si vous avez des difficultés, consultez notre guide de dépannage ou contactez-nous à support@priceexpose.com.",
              },
              {
                q: "Vais-je payer plus cher en utilisant PriceExpose ?",
                a: "Non, jamais. Vous payez le même prix que si vous aviez réservé directement. Nous gagnons une commission seulement si vous économisez de l'argent.",
              },
              {
                q: "Qui reçoit ma commission — vous ou PriceExpose ?",
                a: "Une part de la commission va à PriceExpose pour financer le service, l'autre revient aux hôtels partenaires pour les aider à améliorer leurs services.",
              },
              {
                q: "L'extension fonctionne-t-elle sur mobile ?",
                a: "Pour l'instant, nous supportons les ordinateurs de bureau. Une version mobile est en développement.",
              },
            ].map((faq, index) => (
              <details key={index} className="group bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-red-600 transition-colors">
                <summary className="flex justify-between items-center cursor-pointer font-bold text-black group-open:text-red-600">
                  {faq.q}
                  <span className="transition-transform group-open:rotate-180">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </span>
                </summary>
                <p className="text-gray-700 mt-4 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full bg-black px-6 py-16 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Prêt à commencer ?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Votre extension est déjà installée. Allez sur Booking.com et découvrez vos premières économies.
          </p>
          <a
            href="https://www.booking.com/searchresults.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
          >
            Aller à Booking.com →
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
