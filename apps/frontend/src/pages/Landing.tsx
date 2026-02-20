import {
  LandingHeader,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  OurStorySection,
  TeamSection,
  FAQSection,
  CTASection,
  LandingFooter,
  useTheme,
} from '@/components/landing';

export default function Landing() {
  // Initialize theme on mount
  useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <OurStorySection />
        <TeamSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
