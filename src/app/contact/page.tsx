import { Footer } from "@/components/Footer";
import { Mail, MessageSquare, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-red-600 to-red-700 px-6 py-20 sm:py-32 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            Questions, feedback, or partnership inquiries? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="w-full bg-white px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Mail,
                title: "Email",
                description: "For general inquiries and support",
                contact: "hello@priceexpose.com",
              },
              {
                icon: MessageSquare,
                title: "Support",
                description: "Technical issues or account help",
                contact: "support@priceexpose.com",
              },
              {
                icon: Mail,
                title: "Partnerships",
                description: "Hotel partnerships and integrations",
                contact: "partnerships@priceexpose.com",
              },
            ].map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                  <Icon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-black mb-2">{method.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{method.description}</p>
                  <a href={`mailto:${method.contact}`} className="text-red-600 hover:text-red-700 font-semibold">
                    {method.contact}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">Send us a Message</h2>
            <form className="space-y-6 bg-gray-50 p-8 rounded-lg">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  rows={6}
                  placeholder="Tell us what's on your mind..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                ></textarea>
              </div>

              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full bg-gray-50 px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-black mb-16">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: "How can I get in touch with customer support?",
                a: "Email us at support@priceexpose.com and we'll get back to you within 24 hours.",
              },
              {
                q: "Are you looking for hotel partnerships?",
                a: "Yes! Hotels interested in our Premium or Enterprise plans should contact partnerships@priceexpose.com.",
              },
              {
                q: "How can I provide feedback about PriceExpose?",
                a: "We love feedback. Use the contact form above or email us directly at hello@priceexpose.com.",
              },
              {
                q: "Can I sponsor or integrate with PriceExpose?",
                a: "Absolutely. For partnership opportunities, reach out to partnerships@priceexpose.com.",
              },
              {
                q: "What's your response time?",
                a: "We aim to respond to all inquiries within 24 business hours.",
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-3">{faq.q}</h3>
                <p className="text-gray-700">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-red-600 px-6 py-16 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-red-100 mb-8">
            Have questions before signing up? Our team is here to help.
          </p>
          <a href="mailto:hello@priceexpose.com" className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors">
            Contact Us Today
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
