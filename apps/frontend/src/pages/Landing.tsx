import { Link } from 'react-router-dom';
import { ArrowRight, Repeat, BarChart3, Shield, Bitcoin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Repeat,
    title: 'Automated BTC Purchases',
    description:
      'Set your amount and frequency. The protocol handles execution automatically — no manual trading required.',
  },
  {
    icon: BarChart3,
    title: 'Multiple DCA Strategies',
    description:
      'Run multiple plans simultaneously with different amounts and intervals to diversify your accumulation strategy.',
  },
  {
    icon: Shield,
    title: 'On-Chain Execution',
    description:
      'All trades execute through verified smart contracts on Starknet. Non-custodial, transparent, and auditable.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Connect & Deposit',
    description: 'Connect your Starknet wallet and deposit USDT into the protocol.',
  },
  {
    step: '02',
    title: 'Create a Plan',
    description:
      'Choose your buy amount, frequency, and duration. Configure as many plans as you need.',
  },
  {
    step: '03',
    title: 'Accumulate BTC',
    description:
      'The protocol executes your buys on schedule. Monitor performance from your dashboard.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold">StarkDCA</span>
          </div>
          <Button asChild size="sm">
            <Link to="/dashboard">
              Launch App
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 pb-20 pt-24 text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Built on Starknet
            <ChevronRight className="h-3 w-3" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Dollar Cost Average
            <br />
            <span className="text-primary">into Bitcoin</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Automate your BTC accumulation strategy on Starknet. Deposit USDT, set your schedule,
            and let smart contracts handle the rest.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/dashboard">
                Launch App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                Documentation
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-card/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Why StarkDCA?</h2>
            <p className="mt-2 text-muted-foreground">Simple, non-custodial, and fully on-chain.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Three steps to automated BTC accumulation.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-mono text-sm font-bold text-primary-foreground">
                  {s.step}
                </div>
                <h3 className="mb-1 font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Bitcoin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">StarkDCA</span>
          </div>
          <p className="text-xs text-muted-foreground">Built on Starknet. Open source.</p>
        </div>
      </footer>
    </div>
  );
}
