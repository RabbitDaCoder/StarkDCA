// ─── Login Page ──────────────────────────────────────────────────────
// Premium user authentication with email/password or Google OAuth.

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
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

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Check for OAuth error from callback
  const oauthError = searchParams.get('error');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      // Fetch full profile to determine redirect
      const { fetchProfile } = useAuthStore.getState();
      await fetchProfile();
      const user = useAuthStore.getState().user;

      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else if (!user?.emailVerified) {
        navigate('/verify-email');
      } else if (!user?.launchAccessGranted) {
        navigate('/waitlist');
      } else {
        navigate('/dashboard');
      }
    } catch {
      // Error handled by store
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authApi.getGoogleAuthUrl();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-blue relative overflow-hidden">
        <div className="absolute inset-0 gradient-glow opacity-30" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <img src={starkDCALogo} alt="StarkDCA" className="h-10 w-auto" />
            <span className="font-heading text-2xl font-bold text-white">StarkDCA</span>
          </Link>

          <div className="space-y-6">
            <h1 className="font-heading text-4xl font-bold text-white leading-tight">
              Build Wealth Through
              <br />
              <span className="text-brand-orange">Smart DCA</span>
            </h1>
            <p className="text-white/70 text-lg max-w-md">
              Join thousands of investors automating their Bitcoin accumulation with
              institutional-grade smart contracts.
            </p>
          </div>

          <p className="text-white/50 text-sm">© 2026 StarkDCA. Built on Starknet.</p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center bg-brand-gray px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile back link */}
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-brand-blue mb-8 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>

          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="flex items-center gap-2">
                  <img src={starkDCALogo} alt="StarkDCA" className="h-10 w-auto" />
                  <span className="font-heading text-2xl font-bold text-brand-blue">StarkDCA</span>
                </div>
              </div>
              <CardTitle className="font-heading text-2xl text-brand-blue">Welcome back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Display */}
                {(error || oauthError) && (
                  <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg flex items-center gap-3 border border-destructive/20">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    {error || 'Google authentication failed. Please try again.'}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-brand-blue font-medium">
                    Email
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
                      className="pl-12 h-12 border-2 focus:border-brand-orange"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-brand-blue font-medium">
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-brand-orange hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-12 pr-12 h-12 border-2 focus:border-brand-orange"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-blue transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-brand-orange hover:bg-brand-orange/90 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Google OAuth */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 hover:border-brand-blue hover:bg-brand-blue/5"
                onClick={handleGoogleLogin}
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
                Continue with Google
              </Button>
            </CardContent>

            <CardFooter className="flex justify-center pb-8">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-brand-orange font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
