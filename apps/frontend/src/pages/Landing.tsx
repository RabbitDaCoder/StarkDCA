import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Repeat,
  Shield,
  ChevronRight,
  Users,
  DollarSign,
  Trophy,
  Clock,
  Twitter,
  Linkedin,
  Github,
  ChevronDown,
  Zap,
  BarChart3,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import starkDCALogo from '@/assets/starkDCA.png';
import { waitlistApi } from '@/services/api/waitlist';

// Team members data
const teamMembers = [
  {
    name: 'Alex Chen',
    role: 'CEO & Co-founder',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    twitter: '#',
    linkedin: '#',
  },
  {
    name: 'Sarah Williams',
    role: 'CTO',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    twitter: '#',
    linkedin: '#',
  },
  {
    name: 'Michael Torres',
    role: 'Head of Product',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    twitter: '#',
    linkedin: '#',
  },
  {
    name: 'Emily Zhang',
    role: 'Lead Engineer',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    twitter: '#',
    linkedin: '#',
  },
];

// Blog posts
const blogPosts = [
  {
    title: 'Understanding Dollar Cost Averaging in Crypto',
    description:
      'Learn why DCA is one of the most effective strategies for building long-term wealth in volatile markets.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop',
    date: 'Feb 10, 2026',
  },
  {
    title: 'Why Starknet is the Future of DeFi',
    description:
      "Explore how Starknet's zero-knowledge technology enables secure, low-cost transactions.",
    image: 'https://images.unsplash.com/photo-1642104704074-907c0698b98d?w=400&h=250&fit=crop',
    date: 'Feb 5, 2026',
  },
  {
    title: 'Security Best Practices for DCA Strategies',
    description:
      'How to protect your investments with non-custodial solutions and smart contract security.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop',
    date: 'Jan 28, 2026',
  },
];

// FAQ data
const faqs = [
  {
    question: 'What is Dollar Cost Averaging (DCA)?',
    answer:
      'Dollar Cost Averaging is an investment strategy where you invest a fixed amount of money at regular intervals, regardless of the asset price. This helps reduce the impact of volatility and removes the emotional aspect of trying to time the market.',
  },
  {
    question: 'Is StarkDCA non-custodial?',
    answer:
      'Yes, StarkDCA is completely non-custodial. Your funds are always in your control through smart contracts on Starknet. We never have access to your private keys or funds.',
  },
  {
    question: 'What are the fees?',
    answer:
      "StarkDCA charges a small 0.5% fee per execution to cover gas costs and platform maintenance. Starknet's low gas fees make DCA strategies more cost-effective than ever.",
  },
  {
    question: 'How often can I execute DCA purchases?',
    answer:
      'You can set up daily, weekly, or monthly DCA plans. Our smart contracts execute your purchases automatically based on your chosen schedule.',
  },
  {
    question: 'What tokens are supported?',
    answer:
      'Currently, we support BTC accumulation using USDT. We plan to add support for more token pairs in future updates.',
  },
];

// Features data
const features = [
  {
    icon: Repeat,
    title: 'Automated Execution',
    description:
      'Set your schedule and let smart contracts handle the rest. No manual intervention needed.',
  },
  {
    icon: Shield,
    title: 'Non-Custodial Security',
    description:
      'Your funds stay in your control. Verified smart contracts ensure transparent operations.',
  },
  {
    icon: Zap,
    title: 'Low Gas Fees',
    description: 'Built on Starknet L2 for minimal transaction costs, making frequent DCA viable.',
  },
];

// Steps data
const steps = [
  {
    step: '01',
    title: 'Join Waitlist',
    description: 'Sign up with your email to get early access and exclusive benefits.',
  },
  {
    step: '02',
    title: 'Fund Account',
    description: 'Connect your Starknet wallet and deposit USDT into the protocol.',
  },
  {
    step: '03',
    title: 'Smart Contract Executes',
    description:
      'Our contracts automatically buy BTC on your schedule. Track everything in real-time.',
  },
];

// Mock leaderboard data
const leaderboardData = [
  { rank: 1, name: 'whale_acc...', invested: '$125,450', btc: '2.847' },
  { rank: 2, name: 'hodler_42...', invested: '$98,200', btc: '2.234' },
  { rank: 3, name: 'stack_sat...', invested: '$87,650', btc: '1.995' },
  { rank: 4, name: 'dca_mast...', invested: '$76,300', btc: '1.738' },
  { rank: 5, name: 'btc_bull_...', invested: '$65,890', btc: '1.501' },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number>(0);

  // Fetch real user count from API
  useEffect(() => {
    waitlistApi
      .getStats()
      .then((data) => setUserCount(data.totalCount))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img src={starkDCALogo} alt="StarkDCA" className="h-9 w-auto" />
            <span className="font-heading text-xl font-bold text-brand-blue">StarkDCA</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-brand-blue transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-brand-blue transition-colors"
            >
              How It Works
            </a>
            <a
              href="#leaderboard"
              className="text-sm font-medium text-muted-foreground hover:text-brand-blue transition-colors"
            >
              Leaderboard
            </a>
            <a
              href="#team"
              className="text-sm font-medium text-muted-foreground hover:text-brand-blue transition-colors"
            >
              Team
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-muted-foreground hover:text-brand-blue transition-colors"
            >
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
              <Link to="/waitlist">
                Join Waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-brand-blue pt-16">
        {/* Gradient glow behind CTA */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full gradient-glow opacity-50" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Built on Starknet
                <ChevronRight className="h-4 w-4" />
              </div>

              <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Build Wealth Through
                <br />
                <span className="text-brand-orange">Smart DCA</span>
              </h1>

              <p className="max-w-xl text-lg text-white/70 leading-relaxed">
                Automate your Bitcoin accumulation with institutional-grade smart contracts.
                Non-custodial, secure, and built on Starknet's zero-knowledge technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-brand-orange hover:bg-brand-orange/90 animate-glow h-12 px-8 text-base"
                  asChild
                >
                  <Link to="/waitlist">
                    Get Early Access
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 h-12 px-8 text-base"
                  asChild
                >
                  <a href="#how-it-works">Learn More</a>
                </Button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {Array.from({ length: Math.min(userCount, 5) }, (_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-orange to-brand-gold flex items-center justify-center border-2 border-brand-blue"
                    >
                      <span className="text-white text-xs font-bold">
                        {userCount > 5 ? i + 1 : i + 1}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {userCount > 0 ? `${userCount.toLocaleString()}+` : '—'} Investors
                  </p>
                  <p className="text-white/60 text-sm">Already on the waitlist</p>
                </div>
              </div>
            </div>

            {/* Right: Dashboard Preview */}
            <div className="relative hidden lg:block animate-float">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/20 to-brand-gold/20 rounded-2xl blur-3xl" />
              <Card className="relative shadow-2xl border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <img src={starkDCALogo} alt="StarkDCA" className="h-6 w-auto" />
                      <span className="font-heading font-semibold">Dashboard Preview</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Live Demo</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-lg bg-brand-gray p-4">
                      <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
                      <p className="text-2xl font-bold text-gold">$12,450</p>
                    </div>
                    <div className="rounded-lg bg-brand-gray p-4">
                      <p className="text-xs text-muted-foreground mb-1">BTC Accumulated</p>
                      <p className="text-2xl font-bold text-gold">0.283</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-gray">
                      <span className="text-sm font-medium">Weekly Plan</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-gray">
                      <span className="text-sm font-medium">Next Buy</span>
                      <span className="text-sm text-muted-foreground">2h 34m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100H1440V0C1440 0 1140 80 720 80C300 80 0 0 0 0V100Z" fill="#F4F4F4" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-gray py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-blue/10 mb-4">
                <Users className="h-6 w-6 text-brand-blue" />
              </div>
              <p className="text-3xl font-heading font-bold text-gold">
                {userCount > 0 ? userCount.toLocaleString() : '—'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Users</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-blue/10 mb-4">
                <DollarSign className="h-6 w-6 text-brand-blue" />
              </div>
              <p className="text-3xl font-heading font-bold text-gold">$0.00M</p>
              <p className="text-sm text-muted-foreground mt-1">Total Funded</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-blue/10 mb-4">
                <Trophy className="h-6 w-6 text-brand-blue" />
              </div>
              <p className="text-3xl font-heading font-bold text-gold">Top 100</p>
              <p className="text-sm text-muted-foreground mt-1">Leaderboard Preview</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-blue/10 mb-4">
                <Clock className="h-6 w-6 text-brand-blue" />
              </div>
              <p className="text-3xl font-heading font-bold text-gold">Coming Soon</p>
              <p className="text-sm text-muted-foreground mt-1">Launch Countdown</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-brand-blue sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to automated Bitcoin accumulation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, index) => (
              <div
                key={s.step}
                className="relative group text-center p-8 rounded-2xl bg-brand-gray hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-brand-orange text-white flex items-center justify-center font-heading font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                  {s.step}
                </div>
                <div className="pt-8">
                  <h3 className="font-heading font-semibold text-xl text-brand-blue mb-3">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-brand-orange">
                    <ChevronRight className="h-8 w-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-brand-gray">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-brand-blue sm:text-4xl">
              Why Choose StarkDCA?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built for serious investors who demand security and reliability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-orange/10 mb-6">
                    <f.icon className="h-7 w-7 text-brand-orange" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-brand-blue mb-3">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section id="leaderboard" className="py-24 bg-brand-blue">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Leaderboard Preview
            </h2>
            <p className="mt-4 text-lg text-white/70">Top performers in the StarkDCA community</p>
          </div>

          <Card className="overflow-hidden border-0 shadow-2xl">
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-brand-gray">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brand-blue">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brand-blue">
                      User
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-brand-blue">
                      Invested
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-brand-blue">
                      BTC
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leaderboardData.map((row) => (
                    <tr
                      key={row.rank}
                      className={`${row.rank === 1 ? 'bg-brand-gold/10' : 'bg-white'} hover:bg-brand-gray/50 transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                            row.rank === 1
                              ? 'bg-brand-gold text-white'
                              : row.rank === 2
                                ? 'bg-gray-300 text-gray-700'
                                : row.rank === 3
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-gray-100 text-gray-600'
                          } font-bold text-sm`}
                        >
                          {row.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{row.name}</td>
                      <td className="px-6 py-4 text-right font-semibold text-gold">
                        {row.invested}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-brand-orange">
                        {row.btc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <Link to="/waitlist">
                Join to Compete
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-brand-blue sm:text-4xl">
              Meet the Team
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Experienced builders passionate about DeFi and financial freedom
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <Card
                key={member.name}
                className="group border-0 shadow-lg hover:shadow-xl hover:border-brand-orange transition-all duration-300 overflow-hidden"
              >
                <CardContent className="p-6 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden group-hover:ring-4 group-hover:ring-brand-orange/30 transition-all">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-brand-blue">
                    {member.name}
                  </h3>
                  <p className="text-gold text-sm font-medium mt-1">{member.role}</p>
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <a
                      href={member.twitter}
                      className="text-muted-foreground hover:text-brand-orange transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                    <a
                      href={member.linkedin}
                      className="text-muted-foreground hover:text-brand-orange transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-24 bg-brand-gray">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-brand-blue sm:text-4xl">
              Latest Insights
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Learn about DCA strategies and the future of DeFi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card
                key={post.title}
                className="group border-0 shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <p className="text-xs text-muted-foreground mb-2">{post.date}</p>
                  <h3 className="font-heading font-semibold text-lg text-brand-blue mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {post.description}
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center text-sm font-medium text-brand-orange hover:underline"
                  >
                    Read More
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-brand-blue sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about StarkDCA
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-brand-gray/50 transition-colors"
                >
                  <span className="font-heading font-semibold text-brand-blue pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-brand-orange flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-brand-blue">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Build Wealth
            <br />
            <span className="text-brand-orange">the Smart Way?</span>
          </h2>
          <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto">
            Join thousands of smart investors who are automating their Bitcoin accumulation strategy
            with StarkDCA.
          </p>
          <div className="mt-10">
            <Button
              size="lg"
              className="bg-brand-orange hover:bg-brand-orange/90 animate-glow h-14 px-10 text-lg"
              asChild
            >
              <Link to="/waitlist">
                Join the Waitlist Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-blue border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src={starkDCALogo} alt="StarkDCA" className="h-9 w-auto" />
                <span className="font-heading text-xl font-bold text-white">StarkDCA</span>
              </div>
              <p className="text-white/60 max-w-sm">
                Automate your Bitcoin accumulation with institutional-grade smart contracts on
                Starknet.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <a href="#" className="text-white/60 hover:text-brand-orange transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-white/60 hover:text-brand-orange transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-white/60 hover:text-brand-orange transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-white/60 hover:text-brand-orange transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-white/60 hover:text-brand-orange transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-white/60 hover:text-brand-orange transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#team"
                    className="text-white/60 hover:text-brand-orange transition-colors"
                  >
                    Team
                  </a>
                </li>
                <li>
                  <a
                    href="#blog"
                    className="text-white/60 hover:text-brand-orange transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-brand-orange transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">© 2026 StarkDCA. All rights reserved.</p>
            <p className="text-white/40 text-sm">Built on Starknet. Open source.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
