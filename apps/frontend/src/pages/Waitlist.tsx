// ─── Waitlist Page ───────────────────────────────────────────────────
// Dual purpose: Authenticated users see their waitlist position + status.
// Unauthenticated visitors see the public waitlist signup form.

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  LogOut,
  Bell,
  Hash,
  Rocket,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import starkDCALogo from '@/assets/starkDCA.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { waitlistApi } from '@/services/api/waitlist';
import type { UserWaitlistInfo } from '@/services/api/waitlist';

// ─── Public Waitlist Stats ───────────────────────────────────────────
interface WaitlistStats {
  totalCount: number;
  recentSignups: Array<{ name: string; createdAt: string }>;
}

// ─── Animated Counter Component ──────────────────────────────────────
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span className={className}>{displayed.toLocaleString()}</span>;
}

// ─── Countdown Timer Component ───────────────────────────────────────
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
      const nextFriday = new Date(now);
      nextFriday.setDate(now.getDate() + daysUntilFriday);
      nextFriday.setHours(18, 0, 0, 0);

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

// ─── Authenticated Waitlist View ─────────────────────────────────────
function AuthenticatedWaitlist() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [waitlistInfo, setWaitlistInfo] = useState<UserWaitlistInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const info = await waitlistApi.getUserWaitlistInfo();
        setWaitlistInfo(info);
      } catch {
        // Silently handle
      } finally {
        setIsLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-gray flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your waitlist status...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'there';
  const position = waitlistInfo?.position || user?.waitlistPosition || 0;
  const totalUsers = waitlistInfo?.totalUsers || 0;

  return (
    <div className="min-h-screen bg-brand-gray">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-white border-b shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img src={starkDCALogo} alt="StarkDCA" className="h-9 w-auto" />
            <span className="font-heading text-xl font-bold text-brand-blue">StarkDCA</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-muted-foreground">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-brand-blue/20 hover:border-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-brand-blue pt-28 pb-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-orange/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-gold/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80 mb-8">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              Email Verified — You're on the list!
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Welcome, <span className="text-brand-gold">{firstName}!</span>
            </h1>

            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-12">
              We are currently finalizing our smart contract and dashboard system. You are
              officially on our waitlist.{' '}
              <span className="text-white/90 font-medium">
                We will notify you as soon as we launch.
              </span>
            </p>
          </motion.div>

          {/* Position Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 150 }}
            className="max-w-sm mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
              <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">
                Your Waitlist Position
              </p>
              <div className="text-6xl sm:text-7xl font-heading font-bold text-brand-orange mb-3">
                #<AnimatedNumber value={position} />
              </div>
              <p className="text-sm text-white/50">
                out of <AnimatedNumber value={totalUsers} className="text-white/80 font-semibold" />{' '}
                verified users
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative -mt-16 pb-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card className="border-0 shadow-xl h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="font-heading font-bold text-brand-blue text-lg mb-2">
                    Account Verified
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your email has been verified and your account is ready for launch day.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* What's Next Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Card className="border-0 shadow-xl h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-4">
                    <Clock className="h-7 w-7 text-brand-orange" />
                  </div>
                  <h3 className="font-heading font-bold text-brand-blue text-lg mb-2">
                    What's Next?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We're finalizing our smart contracts on Starknet. You'll get an email the moment
                    we're live.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Card className="border-0 shadow-xl h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-4">
                    <Bell className="h-7 w-7 text-brand-blue" />
                  </div>
                  <h3 className="font-heading font-bold text-brand-blue text-lg mb-2">
                    Get Notified
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We'll send a launch email to{' '}
                    <span className="font-medium text-brand-blue">{user?.email}</span> when the
                    dashboard is ready.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* What You'll Get Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-10"
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-heading text-2xl text-brand-blue flex items-center justify-center gap-3">
                  <Rocket className="h-6 w-6 text-brand-orange" />
                  What You'll Get at Launch
                </CardTitle>
                <CardDescription className="text-base">
                  Early access members enjoy exclusive benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                  {[
                    {
                      icon: Zap,
                      title: 'Automated DCA',
                      desc: 'Set-and-forget Bitcoin accumulation on Starknet',
                      color: 'text-brand-orange',
                      bg: 'bg-brand-orange/10',
                    },
                    {
                      icon: Shield,
                      title: 'Non-Custodial',
                      desc: 'Your keys, your crypto. Always in your control',
                      color: 'text-brand-blue',
                      bg: 'bg-brand-blue/10',
                    },
                    {
                      icon: Trophy,
                      title: 'Early Access Perks',
                      desc: 'First 3 months free for verified waitlist members',
                      color: 'text-brand-gold',
                      bg: 'bg-brand-gold/10',
                    },
                    {
                      icon: Hash,
                      title: 'Low Gas Fees',
                      desc: 'Powered by Starknet for minimal transaction costs',
                      color: 'text-green-600',
                      bg: 'bg-green-100',
                    },
                  ].map((feature, i) => (
                    <div key={i} className="text-center space-y-3">
                      <div
                        className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mx-auto`}
                      >
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <h4 className="font-heading font-semibold text-brand-blue">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
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

// ─── Public Waitlist View ────────────────────────────────────────────
function PublicWaitlist() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<WaitlistStats | null>(null);

  useEffect(() => {
    waitlistApi
      .getStats()
      .then(setStats)
      .catch(() => {});
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
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full gradient-glow opacity-30" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
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
              Join the waitlist today and be among the first to automate your Bitcoin
              wealth-building strategy on Starknet.
            </p>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-md mx-auto mb-8"
          >
            <p className="text-sm text-white/60 mb-4">Next Friday Launch Countdown</p>
            <CountdownTimer />
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative -mt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left: Stats Cards */}
            <div className="lg:col-span-2 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                        <Users className="h-7 w-7 text-brand-blue" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Joined</p>
                        <p className="text-3xl font-heading font-bold text-gold">
                          {stats ? stats.totalCount.toLocaleString() : '—'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6 space-y-6">
                    <h3 className="font-heading font-semibold text-brand-blue text-lg">
                      Early Access Benefits
                    </h3>

                    <div className="space-y-4">
                      {[
                        {
                          icon: Trophy,
                          title: 'Priority Access',
                          desc: 'Be first in line when we launch',
                        },
                        {
                          icon: Zap,
                          title: 'Zero Fees',
                          desc: 'First 3 months free for early members',
                        },
                        {
                          icon: Shield,
                          title: 'Exclusive Features',
                          desc: 'Access beta features before anyone',
                        },
                      ].map((benefit) => (
                        <div key={benefit.title} className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                            <benefit.icon className="h-5 w-5 text-brand-orange" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-brand-blue">{benefit.title}</h4>
                            <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Signups */}
              {stats?.recentSignups && stats.recentSignups.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
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
                </motion.div>
              )}
            </div>

            {/* Right: Signup Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="lg:col-span-3"
            >
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
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 space-y-6"
                      >
                        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
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
                          <Button
                            size="lg"
                            className="bg-brand-orange hover:bg-brand-orange/90 mt-4"
                          >
                            Create Account Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                      >
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
                      </motion.form>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
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

// ─── Main Export ─────────────────────────────────────────────────────
export default function Waitlist() {
  const { isAuthenticated, user } = useAuthStore();

  // If authenticated and email verified, show personalized waitlist
  if (isAuthenticated && user?.emailVerified) {
    return <AuthenticatedWaitlist />;
  }

  // If authenticated but not verified, redirect to verify page
  if (isAuthenticated && !user?.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray">
        <Card className="max-w-md shadow-xl border-0 text-center">
          <CardContent className="py-12 px-8">
            <Mail className="h-12 w-12 text-brand-orange mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-bold text-brand-blue mb-2">
              Verify Your Email First
            </h2>
            <p className="text-muted-foreground mb-6">
              Please verify your email address to see your waitlist position.
            </p>
            <Link to="/verify-email">
              <Button className="bg-brand-orange hover:bg-brand-orange/90">
                Verify Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Public view
  return <PublicWaitlist />;
}
