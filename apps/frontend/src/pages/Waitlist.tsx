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
  ArrowLeft,
  Trophy,
  Sparkles,
  LogOut,
  Bell,
  Hash,
  Rocket,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import starkDCALogo from '@/assets/starkDCA.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/landing/ThemeToggle';
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
    <div className="grid grid-cols-4 gap-3 sm:gap-4">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Minutes' },
        { value: timeLeft.seconds, label: 'Seconds' },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="glass rounded-xl p-3 sm:p-4 mb-2">
            <span className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              {item.value.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Shared Header ───────────────────────────────────────────────────
function WaitlistHeader({ rightContent }: { rightContent?: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={starkDCALogo}
            alt="StarkDCA"
            className="h-8 w-auto transition-transform group-hover:scale-105"
          />
          <span className="font-heading text-lg font-bold text-foreground tracking-tight">
            StarkDCA
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {rightContent}
        </div>
      </div>
    </header>
  );
}

// ─── Shared Footer ───────────────────────────────────────────────────
function WaitlistFooter() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <img src={starkDCALogo} alt="StarkDCA" className="h-7 w-auto" />
            <span className="font-heading text-sm font-bold text-foreground">StarkDCA</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} StarkDCA. Built on Starknet.
          </p>
        </div>
      </div>
    </footer>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading your waitlist status...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'there';
  const position = waitlistInfo?.position || user?.waitlistPosition || 0;
  const totalUsers = waitlistInfo?.totalUsers || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <WaitlistHeader
        rightContent={
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-xs border-border/50 hover:border-destructive/50 hover:text-destructive transition-colors"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Sign Out
          </Button>
        }
      />

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-orange/5 blur-[120px] animate-pulse-slow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-blue/5 dark:bg-brand-blue/10 blur-[100px] animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        />

        <div className="relative mx-auto max-w-4xl px-6 pt-16 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface-elevated/80 backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground shadow-sm mb-8">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Email Verified — You're on the list</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Welcome back, <span className="text-gradient">{firstName}!</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              We're finalizing our smart contracts and dashboard. You're officially on the waitlist.{' '}
              <span className="text-foreground font-medium">
                We'll notify you the moment we launch.
              </span>
            </p>
          </motion.div>

          {/* Position Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 150 }}
            className="max-w-xs mx-auto"
          >
            <div className="glass rounded-2xl p-8">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest font-medium">
                Your Position
              </p>
              <div className="text-5xl sm:text-6xl font-heading font-bold text-gradient mb-2">
                #<AnimatedNumber value={position} />
              </div>
              <p className="text-sm text-muted-foreground">
                out of{' '}
                <AnimatedNumber value={totalUsers} className="text-foreground font-semibold" />{' '}
                verified users
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="relative pb-24">
        <div className="absolute inset-0 bg-surface" />

        <div className="relative mx-auto max-w-5xl px-6 -mt-2 pt-12">
          <div className="grid md:grid-cols-3 gap-5">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="glass rounded-2xl p-6 h-full text-center transition-all duration-300 hover:shadow-lg hover:shadow-brand-orange/5 hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="font-heading font-semibold text-foreground text-base mb-2">
                  Account Verified
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your email is confirmed and your account is ready for launch day.
                </p>
              </div>
            </motion.div>

            {/* What's Next Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="glass rounded-2xl p-6 h-full text-center transition-all duration-300 hover:shadow-lg hover:shadow-brand-orange/5 hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-xl bg-brand-orange/10 dark:bg-brand-orange/15 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-brand-orange" />
                </div>
                <h3 className="font-heading font-semibold text-foreground text-base mb-2">
                  What's Next?
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We're finalizing smart contracts on Starknet. You'll get an email the moment we're
                  live.
                </p>
              </div>
            </motion.div>

            {/* Notification Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <div className="glass rounded-2xl p-6 h-full text-center transition-all duration-300 hover:shadow-lg hover:shadow-brand-orange/5 hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 dark:bg-blue-500/15 flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-6 w-6 text-brand-blue dark:text-blue-400" />
                </div>
                <h3 className="font-heading font-semibold text-foreground text-base mb-2">
                  Get Notified
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We'll send a launch email to{' '}
                  <span className="font-medium text-foreground">{user?.email}</span>.
                </p>
              </div>
            </motion.div>
          </div>

          {/* What You'll Get Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8"
          >
            <div className="glass rounded-2xl p-8 lg:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 mb-3">
                  <Rocket className="h-5 w-5 text-brand-orange" />
                  <h2 className="font-heading font-bold text-xl text-foreground">
                    What You'll Get at Launch
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Early access members enjoy exclusive benefits
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: Zap,
                    title: 'Automated DCA',
                    desc: 'Set-and-forget Bitcoin accumulation on Starknet',
                  },
                  {
                    icon: Shield,
                    title: 'Non-Custodial',
                    desc: 'Your keys, your crypto — always in your control',
                  },
                  {
                    icon: Trophy,
                    title: 'Early Access Perks',
                    desc: 'First 3 months free for verified waitlist members',
                  },
                  {
                    icon: Hash,
                    title: 'Low Gas Fees',
                    desc: 'Powered by Starknet for minimal transaction costs',
                  },
                ].map((feature, i) => (
                  <div key={i} className="text-center space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-orange/10 dark:bg-brand-orange/15 flex items-center justify-center mx-auto">
                      <feature.icon className="h-5 w-5 text-brand-orange" />
                    </div>
                    <h4 className="font-heading font-semibold text-sm text-foreground">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <WaitlistFooter />
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <WaitlistHeader
        rightContent={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              <Link to="/login">Sign In</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-medium rounded-lg shadow-lg shadow-brand-orange/20"
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        }
      />

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-brand-orange/5 blur-[120px] animate-pulse-slow" />
        <div
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-blue/5 dark:bg-brand-blue/10 blur-[100px] animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        />

        <div className="relative mx-auto max-w-4xl px-6 pt-16 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back link */}
            <div className="mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to home
              </Link>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface-elevated/80 backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground shadow-sm mb-8">
              <Sparkles className="h-3.5 w-3.5 text-brand-orange" />
              <span>Exclusive Early Access</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              The Future of Bitcoin DCA
              <br />
              <span className="text-gradient">Launches Soon</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Join the waitlist and be among the first to automate your Bitcoin accumulation
              strategy on Starknet.
            </p>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-sm mx-auto mb-8"
          >
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest font-medium">
              Launch Countdown
            </p>
            <CountdownTimer />
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pb-24">
        <div className="absolute inset-0 bg-surface" />

        <div className="relative mx-auto max-w-6xl px-6 pt-12">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left: Stats & Benefits */}
            <div className="lg:col-span-2 space-y-5">
              {/* Total Joined */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-orange/10 dark:bg-brand-orange/15 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-brand-orange" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Joined</p>
                      <p className="text-2xl font-heading font-bold text-gradient">
                        {stats ? stats.totalCount.toLocaleString() : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Early Access Benefits */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="glass rounded-2xl p-6 space-y-5">
                  <h3 className="font-heading font-semibold text-foreground text-base">
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
                        <div className="w-9 h-9 rounded-lg bg-brand-orange/10 dark:bg-brand-orange/15 flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="h-4 w-4 text-brand-orange" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">{benefit.title}</h4>
                          <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Recent Signups */}
              {stats?.recentSignups && stats.recentSignups.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-heading font-semibold text-foreground text-base mb-4">
                      Recently Joined
                    </h3>
                    <div className="space-y-3">
                      {stats.recentSignups.slice(0, 5).map((signup, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-brand-orange/10 dark:bg-brand-orange/15 flex items-center justify-center">
                              <span className="text-brand-orange text-xs font-bold">
                                {signup.name?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <span className="text-sm text-foreground">
                              {signup.name} <span className="text-muted-foreground">joined</span>
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(signup.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
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
              <div className="glass rounded-2xl overflow-hidden">
                {/* Form header */}
                <div className="border-b border-border/50 p-6 sm:p-8 pb-5 sm:pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-brand-orange flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="font-heading font-bold text-xl text-foreground">
                      Join the Waitlist
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Secure your spot and get notified when we launch
                  </p>
                </div>

                {/* Form body */}
                <div className="p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8 space-y-6"
                      >
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-heading text-xl font-bold text-foreground">
                            Welcome, {formData.name.split(' ')[0]}!
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            You're officially on the list! Check your email for confirmation and
                            exclusive updates.
                          </p>
                        </div>
                        <div className="glass rounded-xl p-5 max-w-xs mx-auto">
                          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">
                            Your Position
                          </p>
                          <p className="text-3xl font-heading font-bold text-gradient">
                            #{(stats?.totalCount || 0) + 1}
                          </p>
                        </div>
                        <Link to="/signup">
                          <Button
                            size="lg"
                            className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-xl shadow-lg shadow-brand-orange/20 mt-2"
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
                        className="space-y-5"
                      >
                        {error && (
                          <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl border border-destructive/20">
                            {error}
                          </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-foreground text-sm font-medium">
                              Full Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                className="pl-10 h-11 rounded-xl border-border/50 bg-surface-elevated focus:border-brand-orange focus:ring-brand-orange/20 transition-colors"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground text-sm font-medium">
                              Email Address
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-10 h-11 rounded-xl border-border/50 bg-surface-elevated focus:border-brand-orange focus:ring-brand-orange/20 transition-colors"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full h-12 bg-brand-orange hover:bg-brand-orange/90 text-white text-base font-semibold rounded-xl shadow-lg shadow-brand-orange/20 transition-all hover:shadow-brand-orange/30 hover:scale-[1.01]"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Securing Your Spot...
                            </>
                          ) : (
                            <>
                              Join the Waitlist
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                          We respect your privacy. No spam, ever.
                        </p>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <WaitlistFooter />
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass rounded-2xl max-w-md text-center p-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 dark:bg-brand-orange/15 flex items-center justify-center mx-auto mb-5">
            <Mail className="h-7 w-7 text-brand-orange" />
          </div>
          <h2 className="text-xl font-heading font-bold text-foreground mb-2">
            Verify Your Email First
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Please verify your email address to see your waitlist position.
          </p>
          <Link to="/verify-email">
            <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-medium rounded-xl shadow-lg shadow-brand-orange/20">
              Verify Email
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Public view
  return <PublicWaitlist />;
}
