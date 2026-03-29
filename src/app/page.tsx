import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ValueProp } from "@/components/ValueProp";
import { SocialProof } from "@/components/SocialProof";
import { OnboardingShowcase } from "@/components/OnboardingShowcase";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-white">
      <Hero />
      <HowItWorks />
      <ValueProp />
      <SocialProof />
      <OnboardingShowcase />
      <Footer />
    </div>
  );
}
