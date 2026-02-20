import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What is Dollar Cost Averaging (DCA)?',
    answer:
      'Dollar Cost Averaging is an investment strategy where you invest a fixed amount at regular intervals, regardless of price. This smooths out volatility impact and eliminates the emotional pitfalls of trying to time the market — widely regarded as one of the most effective long-term wealth-building strategies.',
  },
  {
    question: 'Is StarkDCA non-custodial?',
    answer:
      'Yes, completely. Your funds are held in verified smart contracts on Starknet that only you control. We never have access to your private keys or assets. You can withdraw at any time.',
  },
  {
    question: 'What are the fees?',
    answer:
      "StarkDCA charges a flat 0.5% fee per execution to cover gas costs and protocol maintenance. Because we're built on Starknet's L2, gas costs are a fraction of what they'd be on Ethereum mainnet — making frequent DCA strategies economically viable for the first time.",
  },
  {
    question: 'How often can I execute DCA purchases?',
    answer:
      'You can configure daily, weekly, or monthly DCA plans. Our smart contracts execute your purchases automatically based on your chosen schedule. Custom intervals will be available in a future release.',
  },
  {
    question: 'What tokens are supported?',
    answer:
      'At launch, we support BTC accumulation using USDT. Our roadmap includes support for additional token pairs including ETH, STRK, and other major assets on the Starknet ecosystem.',
  },
  {
    question: 'How do I get started?',
    answer:
      "Join our early access waitlist to be among the first users when we launch. Once live, you'll connect your Starknet wallet, deposit funds, configure your DCA strategy, and the protocol handles the rest automatically.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-surface" />

      <div className="relative mx-auto max-w-3xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange mb-3">
            FAQ
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
            Got Questions?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about StarkDCA and automated DCA on Starknet.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass rounded-xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-muted/30"
              >
                <span className="font-heading font-semibold text-sm sm:text-base text-foreground pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180 text-brand-orange' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
