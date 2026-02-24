import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-grid animate-grid-fade opacity-40" />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-orange/5 blur-[120px] animate-pulse-slow" />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-blue/5 dark:bg-brand-blue/10 blur-[100px] animate-pulse-slow"
        style={{ animationDelay: '2s' }}
      />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32 lg:pt-32 lg:pb-40">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="animate-fade-in mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface-elevated/80 backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-brand-orange" />
              <span>Powered by Starknet Zero-Knowledge Technology</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl max-w-4xl">
            <span className="text-foreground">Automate Your</span>
            <br />
            <span className="text-gradient">Bitcoin Accumulation</span>
          </h1>

          {/* Sub-headline */}
          <p
            className="animate-fade-in-up mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl"
            style={{ animationDelay: '0.1s' }}
          >
            Institutional-grade dollar cost averaging on Starknet. Non-custodial smart contracts
            execute your strategy automatically — so you can build wealth without watching charts.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-in-up flex flex-col sm:flex-row items-center gap-4 mt-10"
            style={{ animationDelay: '0.2s' }}
          >
            <Button
              size="lg"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white h-12 px-8 text-base font-semibold rounded-xl shadow-lg shadow-brand-orange/25 transition-all hover:shadow-brand-orange/40 hover:scale-[1.02]"
              asChild
            >
              <Link to="/login">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base font-medium rounded-xl border-border hover:bg-muted/50 transition-all"
              asChild
            >
              <a href="#how-it-works">Learn More</a>
            </Button>
          </div>

          {/* Animated Stats */}
          <div
            className="animate-fade-in-up mt-20 w-full max-w-3xl"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="glass rounded-2xl p-1">
              <div className="grid grid-cols-3 divide-x divide-border/50">
                <div className="px-6 py-5 text-center">
                  <p className="text-2xl sm:text-3xl font-heading font-bold text-gradient">0.5%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Per Execution</p>
                </div>
                <div className="px-6 py-5 text-center">
                  <p className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
                    24/7
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Automated Execution
                  </p>
                </div>
                <div className="px-6 py-5 text-center">
                  <p className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
                    100%
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Non-Custodial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
