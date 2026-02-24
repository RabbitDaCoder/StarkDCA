import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-card" />

      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-orange/5 blur-[150px]" />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
          Ready to Build Wealth
          <br />
          <span className="text-gradient">the Smart Way?</span>
        </h2>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Join the first wave of investors automating their Bitcoin accumulation strategy with
          institutional-grade smart contracts on Starknet.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-brand-orange hover:bg-brand-orange/90 text-white h-14 px-10 text-base font-semibold rounded-xl shadow-lg shadow-brand-orange/25 transition-all hover:shadow-brand-orange/40 hover:scale-[1.02]"
            asChild
          >
            <Link to="/login">
              Join Early Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">Free to join. No commitment required.</p>
      </div>
    </section>
  );
}
