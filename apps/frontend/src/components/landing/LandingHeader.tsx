import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import starkDCALogo from '@/assets/starkDCA.png';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Our Story', href: '#our-story' },
  { label: 'Team', href: '#team' },
];

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768 && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header
      className={`fixed top-0 z-50 w-full overflow-x-hidden transition-all duration-300 ${
        scrolled
          ? 'border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Logo — shrinks on mobile */}
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2 group">
          <img
            src={starkDCALogo}
            alt="StarkDCA"
            className="h-7 sm:h-8 w-auto transition-transform group-hover:scale-105"
          />
          <span className="font-heading text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
            StarkDCA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap px-3 lg:px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-lg hover:bg-muted/50"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* CTA hidden below md — avoids crowding with hamburger */}
          <Button
            asChild
            size="sm"
            className="hidden md:inline-flex bg-brand-orange hover:bg-brand-orange/90 text-white font-medium rounded-lg shadow-lg shadow-brand-orange/20 transition-all hover:shadow-brand-orange/30 hover:scale-[1.02]"
          >
            <Link to="/waitlist">
              Join Early Access
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-surface-elevated text-foreground transition-colors hover:bg-muted"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay — full screen below header */}
      <div
        className={`md:hidden fixed inset-x-0 top-14 sm:top-16 bottom-0 bg-background/95 backdrop-blur-xl border-t border-border/50 transition-all duration-300 ${
          mobileOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col px-4 py-6 space-y-1 overflow-y-auto max-h-full">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className="px-4 py-3 text-base font-medium text-foreground rounded-lg hover:bg-muted active:bg-muted transition-colors"
            >
              {link.label}
            </a>
          ))}

          <div className="pt-4">
            <Button
              asChild
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-medium rounded-lg"
            >
              <Link to="/waitlist" onClick={closeMobile}>
                Join Early Access
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
