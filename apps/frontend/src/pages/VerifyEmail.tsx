// ─── Verify Email Page ───────────────────────────────────────────────
// OTP verification screen after signup. Premium split-panel design.

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import starkDCALogo from '@/assets/starkDCA.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/services/api/auth';

const OTP_LENGTH = 6;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Already verified? Redirect to waitlist
  useEffect(() => {
    if (user?.emailVerified) {
      navigate('/waitlist', { replace: true });
    }
  }, [user?.emailVerified, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // take last char
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every((d) => d !== '') && newOtp.join('').length === OTP_LENGTH) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();

    if (newOtp.every((d) => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleVerify = async (code: string) => {
    setIsVerifying(true);
    setError('');

    try {
      const result = await authApi.verifyOtp(code);
      if (result.verified) {
        setVerifySuccess(true);
        setWaitlistPosition(result.waitlistPosition);
        updateUser({
          emailVerified: true,
          waitlistPosition: result.waitlistPosition,
        });

        // Redirect to waitlist after a brief celebration
        setTimeout(() => {
          navigate('/waitlist', { replace: true });
        }, 3000);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 'Invalid verification code. Please try again.',
      );
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError('');

    try {
      await authApi.resendOtp();
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/signup');
  };

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
            Almost There!
            <span className="text-brand-gold block">Verify Your Email</span>
          </h1>

          <p className="text-lg text-white/70 mb-10 max-w-md">
            We've sent a 6-digit verification code to your email address. Enter it to confirm your
            account and secure your spot on the waitlist.
          </p>

          {/* Security note */}
          <div className="flex items-start gap-4 bg-white/5 rounded-xl p-6">
            <ShieldCheck className="h-8 w-8 text-brand-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-white mb-1">Secure Verification</h3>
              <p className="text-sm text-white/60">
                The code expires in 10 minutes. Never share your verification code with anyone.
                StarkDCA will never ask for it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - OTP Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-brand-gray px-6 py-12">
        <AnimatePresence mode="wait">
          {verifySuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <Card className="w-full max-w-md shadow-xl border-0 text-center">
                <CardContent className="py-16 px-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-8"
                  >
                    <ShieldCheck className="h-12 w-12 text-green-600" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-3xl font-heading font-bold text-brand-blue mb-3">
                      Email Verified!
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Welcome aboard, {user?.name?.split(' ')[0] || 'there'}! You've been added to
                      our waitlist.
                    </p>
                  </motion.div>

                  {waitlistPosition && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-brand-gray rounded-2xl p-8 mb-6"
                    >
                      <p className="text-sm text-muted-foreground mb-2">Your Position</p>
                      <p className="text-5xl font-heading font-bold text-brand-orange">
                        #{waitlistPosition}
                      </p>
                    </motion.div>
                  )}

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-sm text-muted-foreground"
                  >
                    Redirecting to your waitlist page...
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <Card className="shadow-xl border-0">
                <CardHeader className="text-center pb-4">
                  {/* Mobile Logo */}
                  <div className="flex justify-center mb-4 lg:hidden">
                    <div className="flex items-center gap-2">
                      <img src={starkDCALogo} alt="StarkDCA" className="h-10 w-auto" />
                      <span className="text-2xl font-heading font-bold text-brand-blue">
                        StarkDCA
                      </span>
                    </div>
                  </div>

                  <div className="mx-auto w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-brand-blue" />
                  </div>

                  <CardTitle className="text-2xl font-heading text-brand-blue">
                    Check Your Email
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    We sent a 6-digit code to{' '}
                    <span className="font-semibold text-brand-blue">
                      {user?.email || 'your email'}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Error Display */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 text-center"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* OTP Input Grid */}
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className={`w-12 h-14 text-center text-2xl font-heading font-bold rounded-xl border-2 transition-all duration-200 outline-none
                          ${digit ? 'border-brand-orange bg-brand-orange/5 text-brand-blue' : 'border-gray-200 bg-white text-brand-blue'}
                          focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20
                          ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        disabled={isVerifying}
                        aria-label={`Digit ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Verify Button */}
                  <Button
                    onClick={() => handleVerify(otp.join(''))}
                    className="w-full h-12 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                    disabled={isVerifying || otp.some((d) => d === '')}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Email'
                    )}
                  </Button>

                  {/* Resend Section */}
                  <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || isResending}
                      className="text-brand-orange hover:text-brand-orange/80 hover:bg-brand-orange/5 font-semibold"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : resendCooldown > 0 ? (
                        `Resend in ${resendCooldown}s`
                      ) : (
                        'Resend Code'
                      )}
                    </Button>
                  </div>

                  {/* Back / Different Account */}
                  <div className="pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full text-muted-foreground hover:text-brand-blue"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Use a different account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
