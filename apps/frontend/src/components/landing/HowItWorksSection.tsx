import { Wallet, Settings, Cpu } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Wallet,
    title: 'Connect Wallet',
    description:
      'Link your Starknet wallet to the protocol. Your keys, your crypto — always non-custodial.',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Create Strategy',
    description:
      'Define your DCA parameters: investment amount, frequency, and target token. Customize exactly how you accumulate.',
  },
  {
    number: '03',
    icon: Cpu,
    title: 'Automate & Relax',
    description:
      'Smart contracts execute your strategy on schedule. Track performance in real-time from your dashboard.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-background" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange mb-3">
            How It Works
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
            Three Steps to Automated DCA
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Get from zero to automated Bitcoin accumulation in under five minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-8 lg:gap-12">
          {/* Connection line (desktop only) */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Step number circle */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-surface-elevated border border-border/50 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:border-brand-orange/30 transition-all duration-300">
                  <step.icon className="h-8 w-8 text-brand-orange" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {step.number}
                </div>
              </div>

              {/* Content */}
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
