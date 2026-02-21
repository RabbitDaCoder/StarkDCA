// ─── Reset Password Page ─────────────────────────────────────────────
// Allows users to set a new password using the token from their email.
// Works for both email/password users and Google OAuth users (first-time password setup).

import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import starkDCALogo from '@/assets/starkDCA.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/landing/ThemeToggle';
import { authApi } from '@/services/api/auth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validateForm = (): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)',
      );
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, formData.password);
      setSuccess(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-bold text-foreground">Invalid Reset Link</h1>
            <p className="text-muted-foreground">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              asChild
              className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl"
            >
              <Link to="/forgot-password">Request New Link</Link>
            </Button>
            <Link
              to="/login"
              className="inline-flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-blue relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-orange/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-gold/10 blur-[100px]" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={starkDCALogo} alt="StarkDCA" className="h-10 w-auto" />
            <span className="font-heading text-2xl font-bold text-white">StarkDCA</span>
          </Link>

          <div className="space-y-6">
            <h1 className="font-heading text-4xl font-bold text-white leading-tight">
              Set Your New
              <br />
              <span className="text-brand-orange">Password</span>
            </h1>
            <p className="text-white/70 text-lg max-w-md">
              Choose a strong password to keep your account secure.
            </p>
          </div>

          <p className="text-white/50 text-sm">
            &copy; {new Date().getFullYear()} StarkDCA. Built on Starknet.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Theme toggle */}
        <div className="absolute top-5 right-5">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile back link */}
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors lg:hidden"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sign In
          </Link>

          <div className="glass rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-2 pt-8 px-8">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="flex items-center gap-2.5">
                  <img src={starkDCALogo} alt="StarkDCA" className="h-10 w-auto" />
                  <span className="font-heading text-2xl font-bold text-foreground">StarkDCA</span>
                </div>
              </div>
              <CardTitle className="font-heading text-2xl text-foreground">
                {success ? 'Password Reset!' : 'New Password'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {success
                  ? 'Your password has been updated successfully'
                  : 'Enter your new password below'}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 px-8 pb-8">
              {success ? (
                /* Success State */
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-foreground font-medium">All set!</p>
                    <p className="text-sm text-muted-foreground">
                      Your password has been reset successfully. You can now sign in with your new
                      password.
                    </p>
                  </div>
                  <Button
                    className="w-full h-12 bg-brand-orange hover:bg-brand-orange/90 text-white text-base font-semibold rounded-xl shadow-lg shadow-brand-orange/20 transition-all hover:shadow-brand-orange/30"
                    onClick={() => navigate('/login')}
                  >
                    Go to Sign In
                  </Button>
                </div>
              ) : (
                /* Form State */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Error Display */}
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl flex items-center gap-3 border border-destructive/20">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium text-sm">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-10 h-11 rounded-xl border-border/50 bg-surface-elevated focus:border-brand-orange focus:ring-brand-orange/20 transition-colors"
                        required
                        autoComplete="new-password"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Min. 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-foreground font-medium text-sm"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 h-11 rounded-xl border-border/50 bg-surface-elevated focus:border-brand-orange focus:ring-brand-orange/20 transition-colors"
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-brand-orange hover:bg-brand-orange/90 text-white text-base font-semibold rounded-xl shadow-lg shadow-brand-orange/20 transition-all hover:shadow-brand-orange/30"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>

            {!success && (
              <div className="flex justify-center pb-8 px-8">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{' '}
                  <Link to="/login" className="text-brand-orange font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
