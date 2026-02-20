import { Repeat, Shield, Zap, BarChart3, Wallet, Lock } from 'lucide-react';

const features = [
  {
    icon: Repeat,
    title: 'Automated Execution',
    description:
      'Set your DCA schedule and smart contracts handle every purchase. No manual intervention, no missed buys.',
  },
  {
    icon: Shield,
    title: 'Non-Custodial Security',
    description:
      'Your funds remain under your control at all times. Verified on-chain contracts ensure fully transparent operations.',
  },
  {
    icon: Zap,
    title: 'Ultra-Low Gas Fees',
    description:
      'Built on Starknet L2, leveraging zero-knowledge proofs for minimal transaction costs that make frequent DCA viable.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Track your portfolio performance, average cost basis, and accumulation progress with a comprehensive dashboard.',
  },
  {
    icon: Wallet,
    title: 'Multi-Token Support',
    description:
      'Start with BTC/USDT and expand into more token pairs as we grow. Flexible strategies for any allocation.',
  },
  {
    icon: Lock,
    title: 'Audited Contracts',
    description:
      'Every smart contract is open-source and undergoes rigorous security audits to protect your investments.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-surface" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-orange/3 dark:bg-brand-orange/5 blur-[100px] rounded-full" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange mb-3">
            Features
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
            Why Choose StarkDCA?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for serious investors who demand security, transparency, and performance from
            their DCA infrastructure.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group glass rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-brand-orange/5 dark:hover:shadow-brand-orange/10 hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-orange/10 dark:bg-brand-orange/15 mb-5 transition-transform group-hover:scale-110">
                <f.icon className="h-6 w-6 text-brand-orange" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
