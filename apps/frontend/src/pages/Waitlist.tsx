// ─── Waitlist Page ───────────────────────────────────────────────────
// Premium waitlist page with countdown and personalized experience.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  User,
  Loader2,
  CheckCircle2,
  Users,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Trophy,
  Sparkles,
} from 'lucide-react';
import starkDCALogo from '@/assets/starkDCA.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { waitlistApi } from '@/services/api/waitlist';

interface WaitlistStats {
  totalCount: number;
  recentSignups: Array<{ name: string; createdAt: string }>;
}

// Calculate next Friday
const getNextFriday = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
  const nextFriday = new Date(now);
  nextFriday.setDate(now.getDate() + daysUntilFriday);
  nextFriday.setHours(18, 0, 0, 0);
  return nextFriday;
};

// Countdown timer component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const nextFriday = getNextFriday();
      const now = new Date();
      const diff = nextFriday.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-6">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Minutes' },
        { value: timeLeft.seconds, label: 'Seconds' },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-2">
            <span className="text-2xl sm:text-4xl font-heading font-bold text-brand-blue">
              {item.value.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-white/70">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Waitlist() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<WaitlistStats | null>(null);

  // Fetch waitlist stats on mount
  useEffect(() => {
    waitlistApi
      .getStats()
      .then(setStats)
      .catch(() => {
        // Silently fail - stats are optional
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await waitlistApi.join(formData.name, formData.email, 'landing');
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to join waitlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-brand-gray">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-brand-blue border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={starkDCALogo} alt="StarkDCA" className="h-9 w-auto" />
            <span className="font-heading text-xl font-bold text-white">StarkDCA</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Countdown */}
      <section className="relative bg-brand-blue pt-24 pb-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full gradient-glow opacity-30" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80 mb-8">
            <Sparkles className="h-4 w-4 text-brand-gold" />
            Exclusive Early Access
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            The Future of Bitcoin DCA
            <br />
            <span className="text-brand-orange">Launches Soon</span>
          </h1>

          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-12">
            Join the waitlist today and be among the first to automate your Bitcoin wealth-building
            strategy on Starknet.
          </p>

          {/* Countdown Timer */}
          <div className="max-w-md mx-auto mb-8">
            <p className="text-sm text-white/60 mb-4">Next Friday Launch Countdown</p>
            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative -mt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left: Stats Cards */}
            <div className="lg:col-span-2 space-y-4">
              {/* Total Users Card */}
              <Card className="border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                      <Users className="h-7 w-7 text-brand-blue" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Joined</p>
                      <p className="text-3xl font-heading font-bold text-gold">
                        {stats?.totalCount?.toLocaleString() || '2,847'}+
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits Cards */}
              <Card className="border-0 shadow-xl">
                <CardContent className="p-6 space-y-6">
                  <h3 className="font-heading font-semibold text-brand-blue text-lg">
                    Early Access Benefits
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                        <Trophy className="h-5 w-5 text-brand-orange" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-blue">Priority Access</h4>
                        <p className="text-sm text-muted-foreground">
                          Be first in line when we launch
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-5 w-5 text-brand-orange" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-blue">Zero Fees</h4>
                        <p className="text-sm text-muted-foreground">
                          First 3 months free for early members
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-5 w-5 text-brand-orange" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-blue">Exclusive Features</h4>
                        <p className="text-sm text-muted-foreground">
                          Access beta features before anyone
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Signups */}
              {stats?.recentSignups && stats.recentSignups.length > 0 && (
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="font-heading font-semibold text-brand-blue mb-4">
                      Recently Joined
                    </h3>
                    <div className="space-y-3">
                      {stats.recentSignups.slice(0, 5).map((signup, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-brand-gold flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {signup.name?.[0] || '?'}
                              </span>
                            </div>
                            <span className="text-sm font-medium">{signup.name} joined</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(signup.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Signup Form */}
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-2xl">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="flex items-center gap-3 font-heading text-2xl text-brand-blue">
                    <div className="w-10 h-10 rounded-lg bg-brand-orange flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    Join the Waitlist
                  </CardTitle>
                  <CardDescription className="text-base">
                    Secure your spot and get notified when we launch
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  {isSuccess ? (
                    <div className="text-center py-12 space-y-6">
                      <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-fade-in">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-heading text-2xl font-bold text-brand-blue">
                          Welcome, {formData.name.split(' ')[0]}!
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          You're officially on the list! Check your email for confirmation and
                          exclusive updates.
                        </p>
                      </div>
                      <div className="bg-brand-gray rounded-xl p-6 max-w-sm mx-auto">
                        <p className="text-sm text-muted-foreground mb-3">Your Position</p>
                        <p className="text-4xl font-heading font-bold text-gold">
                          #{(stats?.totalCount || 2847) + 1}
                        </p>
                      </div>
                      <Link to="/signup">
                        <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 mt-4">
                          Create Account Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                          {error}
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-brand-blue font-medium">
                            Full Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={handleChange}
                              className="pl-12 h-12 border-2 focus:border-brand-orange focus:ring-brand-orange"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-brand-blue font-medium">
                            Email Address
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="john@example.com"
                              value={formData.email}
                              onChange={handleChange}
                              className="pl-12 h-12 border-2 focus:border-brand-orange focus:ring-brand-orange"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 bg-brand-orange hover:bg-brand-orange/90 text-lg font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Securing Your Spot...
                          </>
                        ) : (
                          <>
                            Join the Waitlist
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>

                      <p className="text-sm text-muted-foreground text-center">
                        We respect your privacy. No spam, ever. Unsubscribe at any time.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-blue border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={starkDCALogo} alt="StarkDCA" className="h-8 w-auto" />
              <span className="font-heading font-bold text-white">StarkDCA</span>
            </div>
            <p className="text-sm text-white/60">© 2026 StarkDCA. Built on Starknet.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
