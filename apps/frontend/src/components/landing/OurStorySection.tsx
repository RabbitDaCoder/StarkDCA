import { Lightbulb, AlertTriangle, Rocket } from 'lucide-react';

const storyBlocks = [
  {
    icon: Lightbulb,
    title: 'Why StarkDCA Was Created',
    content:
      'We started StarkDCA because we believed everyone deserves access to disciplined investment strategies — not just institutional players. Dollar cost averaging is one of the most proven wealth-building techniques in finance, yet in DeFi, executing it consistently is manual, expensive, and error-prone. We saw an opportunity to change that by building a protocol that makes automated DCA as seamless as sending a transaction.',
  },
  {
    icon: AlertTriangle,
    title: 'The Problem We Saw in DeFi',
    content:
      "DeFi promised financial freedom, but the reality is fragmented. Users juggle multiple platforms, pay excessive gas fees on L1, and rely on centralized exchanges to schedule recurring buys — defeating the purpose of decentralization. There was no trustless, truly non-custodial solution for automated accumulation. Most 'DCA tools' either custody your funds, operate off-chain, or charge prohibitive fees. The space needed something better.",
  },
  {
    icon: Rocket,
    title: "The Future We're Building",
    content:
      "StarkDCA is more than a tool — it's a primitive for programmable, trustless investment on Starknet. We're building toward a world where anyone can deploy sophisticated accumulation strategies from their wallet, verified by zero-knowledge proofs, with gas costs measured in fractions of a cent. Our roadmap includes multi-token strategies, limit conditions, portfolio rebalancing, and composability with the broader Starknet DeFi ecosystem. This is just the beginning.",
  },
];

export default function OurStorySection() {
  return (
    <section id="our-story" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-surface" />

      {/* Ambient orb */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-blue/3 dark:bg-brand-blue/8 blur-[120px] rounded-full" />

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange mb-3">
            Our Story
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
            Building the Future of DCA
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Born from frustration with the status quo, driven by a vision for accessible, trustless
            wealth building.
          </p>
        </div>

        {/* Story Blocks */}
        <div className="space-y-8">
          {storyBlocks.map((block, index) => (
            <div
              key={block.title}
              className="glass rounded-2xl p-8 lg:p-10 transition-all duration-300 hover:shadow-lg hover:shadow-brand-orange/5"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-brand-orange/10 dark:bg-brand-orange/15 flex items-center justify-center">
                    <block.icon className="h-6 w-6 text-brand-orange" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                    {block.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{block.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
