// ─── Signup Page ─────────────────────────────────────────────────────
// New user registration with email/password or Google OAuth.
// Premium split-panel design with brand colors

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Zap,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import starkDCALogo from '@/assets/starkDCA.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/services/api/auth';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    clearError();
    setValidationError('');
  };

  const validateForm = (): boolean => {
    if (formData.name.length < 2) {
      setValidationError('Name must be at least 2 characters');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setValidationError(
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      );
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await signup(formData.name, formData.email, formData.password);
      navigate('/verify-email');
    } catch {
      // Error handled by store
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = authApi.getGoogleAuthUrl();
  };

  const benefits = [
    { icon: Shield, text: 'Bank-grade security' },
    { icon: Zap, text: 'Automated DCA execution' },
    { icon: TrendingUp, text: 'Real-time portfolio tracking' },
    { icon: CheckCircle, text: 'No hidden fees' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-blue relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-brand-orange blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-brand-gold blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img src={starkDCALogo} alt="StarkDCA" className="h-14 w-auto" />
            <span className="text-3xl font-heading font-bold">StarkDCA</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-heading font-bold mb-6 leading-tight">
            Start Building Your
            <span className="text-brand-gold block">Bitcoin Fortune</span>
          </h1>

          <p className="text-lg text-white/70 mb-10 max-w-md">
            Join thousands of investors who trust StarkDCA to automate their Bitcoin accumulation
            strategy.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <benefit.icon className="h-5 w-5 text-brand-gold" />
                </div>
                <span className="text-white/90">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-white/10 flex gap-12">
            <div>
              <div className="text-3xl font-heading font-bold text-brand-gold">$12M+</div>
              <div className="text-sm text-white/60">Volume processed</div>
            </div>
            <div>
              <div className="text-3xl font-heading font-bold text-brand-gold">5,000+</div>
              <div className="text-sm text-white/60">Active investors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-brand-gray px-6 py-12">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            {/* Mobile Logo */}
            <div className="flex justify-center mb-4 lg:hidden">
              <div className="flex items-center gap-2">
                <img src={starkDCALogo} alt="StarkDCA" className="h-10 w-auto" />
                <span className="text-2xl font-heading font-bold text-brand-blue">StarkDCA</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-heading text-brand-blue">
              Create an account
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Start automating your Bitcoin investments today
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Display */}
              {(error || validationError) && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                  {error || validationError}
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 h-12 border-2 focus:border-brand-orange focus:ring-brand-orange/20"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-12 border-2 focus:border-brand-orange focus:ring-brand-orange/20"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 h-12 border-2 focus:border-brand-orange focus:ring-brand-orange/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-blue transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Min. 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 h-12 border-2 focus:border-brand-orange focus:ring-brand-orange/20"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-2 hover:bg-gray-50 hover:border-brand-blue transition-all"
              onClick={handleGoogleSignup}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium">Continue with Google</span>
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-orange font-semibold hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-brand-blue hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-brand-blue hover:underline">
                Privacy Policy
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
