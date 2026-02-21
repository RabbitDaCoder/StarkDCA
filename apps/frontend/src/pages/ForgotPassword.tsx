// ─── Forgot Password Page ────────────────────────────────────────────
// Allows users to request a password reset link via email.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import starkDCALogo from '@/assets/starkDCA.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/landing/ThemeToggle';
import { authApi } from '@/services/api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
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
              Forgot Your
              <br />
              <span className="text-brand-orange">Password?</span>
            </h1>
            <p className="text-white/70 text-lg max-w-md">
              No worries — we'll send you a secure link to reset your password and get back to your
              account.
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
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
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
                Reset Password
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {sent
                  ? 'Check your inbox for the reset link'
                  : "Enter your email and we'll send you a reset link"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 px-8 pb-8">
              {sent ? (
                /* Success State */
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-foreground font-medium">Check your email</p>
                    <p className="text-sm text-muted-foreground">
                      If an account exists for <strong>{email}</strong>, you'll receive a password
                      reset link shortly.
                    </p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-muted-foreground">
                      Didn't receive the email? Check your spam folder or{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setSent(false);
                          setError('');
                        }}
                        className="text-brand-orange hover:underline font-medium"
                      >
                        try again
                      </button>
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center text-sm text-brand-orange hover:underline font-medium"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                      Back to Sign In
                    </Link>
                  </div>
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

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium text-sm">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        className="pl-10 h-11 rounded-xl border-border/50 bg-surface-elevated focus:border-brand-orange focus:ring-brand-orange/20 transition-colors"
                        required
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We'll send a reset link to this email address.
                    </p>
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
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>

            {!sent && (
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
