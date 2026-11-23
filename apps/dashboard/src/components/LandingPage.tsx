import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Calendar,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Database,
  Radio,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Lock,
  Layers,
  Star,
  Check,
  X,
  FileText,
  CreditCard,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface LandingPageProps {
  onLaunchDemo: () => void;
  onOpenAdmin: () => void;
  onOpenDocs: () => void;
}

export default function LandingPage({ onLaunchDemo, onOpenAdmin, onOpenDocs }: LandingPageProps) {
  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Modals state for ship requirements (Privacy policy, Terms of service)
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  // Cookie consent state
  const [cookieConsentDismissed, setCookieConsentDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('omniagent_cookie_consent') === 'true';
    }
    return false;
  });

  // Interactive Hero Preview Simulator State
  const [heroChatStep, setHeroChatStep] = useState<number>(0);
  const [heroBookedSlot, setHeroBookedSlot] = useState<string | null>(null);

  // Tagline Reveal Section (B11) Ref & Active Word Indexes
  const taglineWords = [
    'Autonomous', 'patient', 'bookings', 'without', 'calendar', 'conflicts.',
    'Instant', 'answers', 'grounded', 'strictly', 'in', 'verified', 'clinic', 'records.'
  ];
  const [visibleWordCount, setVisibleWordCount] = useState<number>(0);
  const taglineRef = useRef<HTMLDivElement>(null);

  // B11 Tagline Reveal with IntersectionObserver & Scroll Tracking
  useEffect(() => {
    // Respect prefers-reduced-motion per B7 and B11
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisibleWordCount(taglineWords.length);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // Reveal words one by one in reading order using base timing
          let count = 0;
          const interval = setInterval(() => {
            count += 1;
            setVisibleWordCount(count);
            if (count >= taglineWords.length) {
              clearInterval(interval);
            }
          }, 90);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    if (taglineRef.current) {
      observer.observe(taglineRef.current);
    }

    return () => observer.disconnect();
  }, [taglineWords.length]);

  const handleDismissCookie = () => {
    localStorage.setItem('omniagent_cookie_consent', 'true');
    setCookieConsentDismissed(true);
  };

  const handleSimulateSlotSelection = (slot: string) => {
    setHeroBookedSlot(slot);
    setHeroChatStep(2);
  };

  const resetHeroSimulation = () => {
    setHeroChatStep(0);
    setHeroBookedSlot(null);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f5] flex flex-col font-sans selection:bg-[#6366f1] selection:text-white relative">
      {/* Accessibility Skip to Content Link (B10) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[#6366f1] text-white font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Floating Top Navigation Bar (B7 Resting state) */}
      <nav 
        aria-label="Main Navigation"
        className="fixed top-4 left-0 right-0 z-40 max-w-5xl mx-auto px-4 sm:px-6 w-full"
      >
        <div className="bg-[#181818]/90 backdrop-blur-md border border-[#313131] rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xl">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-[#1f1f1f] border border-[#313131] flex items-center justify-center text-[#818cf8]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight text-white block leading-tight">
                OmniAgent
              </span>
              <span className="text-[11px] text-[#8c8c8c] block leading-tight">
                Clinical Concierge
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm text-[#d6d6d6]">
            <a 
              href="#benefits" 
              className="hover:text-white transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              Benefits
            </a>
            <a 
              href="#how-it-works" 
              className="hover:text-white transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              How it works
            </a>
            <a 
              href="#case-studies" 
              className="hover:text-white transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              Case studies
            </a>
            <a 
              href="#faq" 
              className="hover:text-white transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              FAQ
            </a>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAdmin}
              className="hidden sm:inline-flex items-center space-x-1.5 text-xs text-[#d6d6d6] hover:text-white px-3 py-2 rounded-lg border border-[#313131] hover:bg-[#272727] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer"
            >
              <span>Admin console</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#8c8c8c]" />
            </button>

            <button
              onClick={onLaunchDemo}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-[#6366f1] hover:bg-[#4f46e5] active:bg-[#4338ca] text-white px-3.5 py-2 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#181818]"
            >
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span>Launch live demo</span>
            </button>

            {/* Mobile Hamburger Toggle (B7) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile navigation menu"
              className="md:hidden p-2 rounded-lg text-[#d6d6d6] hover:text-white hover:bg-[#272727] transition-colors duration-300 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <div className="space-y-1 w-5"><span className="block h-0.5 w-5 bg-white"></span><span className="block h-0.5 w-5 bg-white"></span></div>}
            </button>
          </div>
        </div>

        {/* Mobile Full-Height Menu Panel with Staggered Entrance (B7) */}
        {mobileMenuOpen && (
          <div className="fixed inset-x-4 top-20 bg-[#181818] border border-[#313131] rounded-2xl p-6 shadow-2xl md:hidden animate-in fade-in duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <div className="flex flex-col space-y-4 text-base font-medium">
              <a
                href="#benefits"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-[#d6d6d6] hover:text-white border-b border-[#272727]"
              >
                Benefits
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-[#d6d6d6] hover:text-white border-b border-[#272727]"
              >
                How it works
              </a>
              <a
                href="#case-studies"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-[#d6d6d6] hover:text-white border-b border-[#272727]"
              >
                Case studies
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-[#d6d6d6] hover:text-white border-b border-[#272727]"
              >
                FAQ
              </a>
              <div className="pt-2 flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full text-center py-2.5 rounded-lg border border-[#313131] text-sm text-[#d6d6d6] hover:text-white hover:bg-[#272727]"
                >
                  Admin console
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLaunchDemo();
                  }}
                  className="w-full text-center py-2.5 rounded-lg bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#4f46e5]"
                >
                  Launch live demo
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 pt-28 pb-16">
        {/* SECTION 1: Above the Fold Hero Section (A2, B5) */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-16 flex flex-col items-center text-center">
          {/* Telemetry Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#181818] border border-[#313131] text-xs mb-6">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
            </span>
            <span className="text-[#8c8c8c]">Atlas RAG and Google Calendar Integration</span>
            <span className="text-[#10b981] font-mono text-[11px]">Online</span>
          </div>

          {/* Hero Heading (B5: max-width 680px, left-to-right text gradient #FFFFFF -> #9B9B9B, meaningful line break) */}
          <h1 className="max-w-[680px] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight mb-6 bg-gradient-to-r from-[#FFFFFF] to-[#9B9B9B] bg-clip-text text-transparent [text-wrap:balance]">
            Autonomous patient bookings<br />and concierge support for modern clinics
          </h1>

          {/* Subheadline (B5: max-width 680px, specific, no hyphens) */}
          <p className="max-w-[680px] text-base sm:text-lg text-[#d6d6d6] leading-relaxed mb-8 [text-wrap:pretty]">
            Capture inbound inquiries 24 hours a day, quote verified treatment fees without hallucinations, and sync confirmed slots directly to Google Calendar.
          </p>

          {/* Primary CTA (A4, B2: 8px vertical, 16px horizontal, active physical feedback, visible focus ring) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <button
              onClick={onLaunchDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-[#6366f1] hover:bg-[#4f46e5] active:bg-[#4338ca] text-white font-semibold text-base py-2 px-4 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer shadow-lg shadow-[#6366f1]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch interactive demo</span>
            </button>
          </div>

          {/* Proof Signal (A2: one proof signal directly beside the action) */}
          <div className="flex items-center space-x-2 text-xs text-[#8c8c8c] mb-12">
            <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
            <span>89.4% lead capture rate across 1,240 verified clinic conversations • 4.2% no-show rate</span>
          </div>

          {/* Hero Visual: Interactive Live Concierge Preview Card (Nested radius formula: outer 16px, padding 8px -> inner 8px) */}
          <div className="w-full max-w-2xl bg-[#181818] border border-[#313131] rounded-2xl p-2 shadow-2xl text-left">
            <div className="bg-[#1f1f1f] rounded-lg p-5 border border-[#313131] space-y-4">
              {/* Header inside Card */}
              <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
                <div className="flex items-center space-x-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#272727] border border-[#313131] flex items-center justify-center text-[#818cf8]">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Apex Longevity Clinic Concierge</h2>
                    <p className="text-[11px] text-[#8c8c8c]">Verified protocols • Millisecond calendar check</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-[#10b981] bg-[#181818] px-2.5 py-1 rounded-md border border-[#313131]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></span>
                  <span>Google Calendar synced</span>
                </div>
              </div>

              {/* Chat Flow Simulation */}
              <div className="space-y-3 text-xs">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-[#6366f1] text-white py-2 px-3.5 rounded-xl rounded-tr-none max-w-[85%] leading-relaxed">
                    Do you have any availability for a consultation with Dr. Vance tomorrow?
                  </div>
                </div>

                {/* Assistant Message */}
                <div className="flex justify-start">
                  <div className="bg-[#272727] text-[#f5f5f5] py-2.5 px-3.5 rounded-xl rounded-tl-none border border-[#313131] max-w-[90%] space-y-2 leading-relaxed">
                    <p>
                      Yes! Dr. Vance has two open slots tomorrow for the 45 minute Medical Consultation ($150):
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleSimulateSlotSelection('11:00 AM')}
                        className={`py-1.5 px-3 rounded-lg border text-xs font-medium text-center transition cursor-pointer ${
                          heroBookedSlot === '11:00 AM'
                            ? 'bg-[#10b981]/20 border-[#10b981] text-[#4edea3]'
                            : 'bg-[#1f1f1f] border-[#313131] hover:border-[#6366f1] text-white'
                        }`}
                      >
                        11:00 AM (Recommended)
                      </button>
                      <button
                        onClick={() => handleSimulateSlotSelection('3:30 PM')}
                        className={`py-1.5 px-3 rounded-lg border text-xs font-medium text-center transition cursor-pointer ${
                          heroBookedSlot === '3:30 PM'
                            ? 'bg-[#10b981]/20 border-[#10b981] text-[#4edea3]'
                            : 'bg-[#1f1f1f] border-[#313131] hover:border-[#6366f1] text-white'
                        }`}
                      >
                        03:30 PM
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Booking Confirmation Step */}
                {heroBookedSlot && (
                  <div className="bg-[#181818] border border-[#10b981]/40 rounded-xl p-3 text-xs space-y-1.5 animate-in fade-in duration-300">
                    <div className="flex items-center space-x-2 text-[#4edea3] font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Slot locked for {heroBookedSlot} tomorrow</span>
                    </div>
                    <p className="text-[#8c8c8c] text-[11px]">
                      Calendar invite delivered to patient. SMS and WhatsApp reminders dispatched 24 hours in advance.
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-[#8c8c8c]">Simulation status: Verified</span>
                      <button 
                        onClick={resetHeroSimulation} 
                        className="text-[#818cf8] hover:underline cursor-pointer"
                      >
                        Reset simulation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Problem to Solution (A2) */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4 [text-wrap:balance]">
              Why traditional front desk booking breaks down
            </h2>
            <p className="text-sm sm:text-base text-[#8c8c8c] [text-wrap:pretty]">
              Manual scheduling creates operational friction, lost revenue, and frustrating patient phone tag.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center text-[#ffb4ab]">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">After hours inquiry loss</h3>
              <p className="text-sm text-[#8c8c8c] leading-relaxed [text-wrap:pretty]">
                63% of prospective patients research treatments and seek appointments between 7:00 PM and midnight when your clinic reception is closed.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#fcd34d]">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Double booking collisions</h3>
              <p className="text-sm text-[#8c8c8c] leading-relaxed [text-wrap:pretty]">
                Staff manually checking separate calendars leads to accidental overlaps, emergency reschedules, and unhappy clients.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#6366f1]/15 border border-[#6366f1]/30 flex items-center justify-center text-[#818cf8]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Inaccurate treatment answers</h3>
              <p className="text-sm text-[#8c8c8c] leading-relaxed [text-wrap:pretty]">
                Generic artificial intelligence chatbots invent pricing and make up clinical advice that contradicts your written clinic policy.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: Tagline Reveal Section (Mandatory B11) */}
        <section 
          ref={taglineRef}
          aria-label="Core Promise"
          className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center"
        >
          <div className="max-w-[680px] mx-auto">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-relaxed tracking-tight [text-wrap:balance]">
              {taglineWords.map((word, index) => {
                const isRevealed = index < visibleWordCount;
                return (
                  <span
                    key={index}
                    className={`inline-block mr-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isRevealed 
                        ? 'text-[#f5f5f5] opacity-100' 
                        : 'text-[#454545] opacity-30'
                    }`}
                  >
                    {word}
                  </span>
                );
              })}
            </p>
          </div>
        </section>

        {/* SECTION 4: Benefits Section (A2, A5: bold benefit first, outcome driven) */}
        <section id="benefits" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4 [text-wrap:balance]">
              Built for high trust healthcare operations
            </h2>
            <p className="text-sm sm:text-base text-[#8c8c8c] [text-wrap:pretty]">
              Four architectural pillars designed specifically to protect clinical standards and drive reliable practice growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Benefit 1 */}
            <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-[#1f1f1f] border border-[#313131] flex items-center justify-center text-[#10b981]">
                  <Calendar className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-white">Zero double bookings</h3>
              </div>
              <p className="text-sm text-[#d6d6d6] leading-relaxed [text-wrap:pretty]">
                <strong className="text-white font-semibold">Zero double bookings</strong> — Millisecond slot reservations connect with Google Calendar to prevent scheduling conflicts across all practitioners.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-[#1f1f1f] border border-[#313131] flex items-center justify-center text-[#818cf8]">
                  <Database className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-white">100% grounded answers</h3>
              </div>
              <p className="text-sm text-[#d6d6d6] leading-relaxed [text-wrap:pretty]">
                <strong className="text-white font-semibold">100% grounded answers</strong> — Atlas vector embeddings query your exact clinical documents, pricing guidelines, and pre care protocols without inventing details.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-[#1f1f1f] border border-[#313131] flex items-center justify-center text-[#f59e0b]">
                  <CreditCard className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-white">Instant deposit collection</h3>
              </div>
              <p className="text-sm text-[#d6d6d6] leading-relaxed [text-wrap:pretty]">
                <strong className="text-white font-semibold">Instant deposit collection</strong> — Automated Razorpay and Stripe payment links secure consultation deposits before reservations are finalized.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-[#1f1f1f] border border-[#313131] flex items-center justify-center text-[#ef4444]">
                  <UserCheck className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-white">One-click human takeover</h3>
              </div>
              <p className="text-sm text-[#d6d6d6] leading-relaxed [text-wrap:pretty]">
                <strong className="text-white font-semibold">One-click human takeover</strong> — Seamlessly pause artificial intelligence execution and step in directly when sensitive patient inquiries arise.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: How it Works (A2: three steps) */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4 [text-wrap:balance]">
              How it works in three clear steps
            </h2>
            <p className="text-sm sm:text-base text-[#8c8c8c] [text-wrap:pretty]">
              Deploy autonomous patient booking into your existing practice infrastructure in under ten minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-4">
              <div className="h-8 w-8 rounded-full bg-[#6366f1]/20 border border-[#6366f1] text-[#818cf8] font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-semibold text-white">Connect calendar and upload protocols</h3>
              <p className="text-sm text-[#8c8c8c] leading-relaxed [text-wrap:pretty]">
                Authorize your Google Calendar with one click and upload your service catalog, practitioner rosters, and clinic policies.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-4">
              <div className="h-8 w-8 rounded-full bg-[#6366f1]/20 border border-[#6366f1] text-[#818cf8] font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-semibold text-white">Embed widget or connect WhatsApp</h3>
              <p className="text-sm text-[#8c8c8c] leading-relaxed [text-wrap:pretty]">
                Paste a single lightweight HTML tag into your website or connect your verified WhatsApp Business phone number.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-4">
              <div className="h-8 w-8 rounded-full bg-[#6366f1]/20 border border-[#6366f1] text-[#818cf8] font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-semibold text-white">Automate bookings and deposits</h3>
              <p className="text-sm text-[#8c8c8c] leading-relaxed [text-wrap:pretty]">
                Inbound patients receive instant responses, choose open calendar slots, pay deposits, and receive calendar confirmations automatically.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 6: Social Proof & Clinic Case Studies (A2, B8) */}
        <section id="case-studies" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4 [text-wrap:balance]">
              Verified results from operating clinics
            </h2>
            <p className="text-sm sm:text-base text-[#8c8c8c] [text-wrap:pretty]">
              Real practices capturing more patients without adding reception headcount.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-1 text-[#f59e0b]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-[#d6d6d6] leading-relaxed [text-wrap:pretty]">
                  "Cut front desk inquiry handling by 14 hours per week while capturing 38 additional patient consultations in our first month."
                </p>
              </div>
              <div className="pt-2 border-t border-[#313131]">
                <div className="font-semibold text-xs text-white">Dr. Marcus Vance</div>
                <div className="text-[11px] text-[#8c8c8c]">Medical Director, Apex Longevity Clinic</div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-1 text-[#f59e0b]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-[#d6d6d6] leading-relaxed [text-wrap:pretty]">
                  "Zero double bookings since launch. Patients love booking at midnight via WhatsApp and getting immediate confirmation."
                </p>
              </div>
              <div className="pt-2 border-t border-[#313131]">
                <div className="font-semibold text-xs text-white">Elena Rostova</div>
                <div className="text-[11px] text-[#8c8c8c]">Practice Manager, Lumina Aesthetics Studio</div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-1 text-[#f59e0b]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-[#d6d6d6] leading-relaxed [text-wrap:pretty]">
                  "The automated deposit collection reduced our consultation no-show rate from 18.2% down to 3.8%."
                </p>
              </div>
              <div className="pt-2 border-t border-[#313131]">
                <div className="font-semibold text-xs text-white">Dr. Ananya Ray</div>
                <div className="text-[11px] text-[#8c8c8c]">Founder, Nova Dental Specialists</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: FAQ Accordion (A2, A4: 8 high-friction questions) */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4 [text-wrap:balance]">
              Frequently asked questions
            </h2>
            <p className="text-sm sm:text-base text-[#8c8c8c] [text-wrap:pretty]">
              Straight answers regarding clinical accuracy, calendar synchronization, and data privacy.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does OmniAgent prevent double bookings with my Google Calendar?',
                a: 'OmniAgent connects via official Google Calendar APIs. Before confirming any reservation, it performs a real time millisecond slot check against existing calendar blocks. When an appointment is scheduled, it creates an immediate tentative lock and confirms the slot once deposit criteria are satisfied.'
              },
              {
                q: 'What happens if a patient asks a clinical question not in our documents?',
                a: 'OmniAgent uses grounded Atlas retrieval augmented generation with strict boundaries. If an inquiry falls outside your verified documentation, the agent clearly states that it does not have that information and offers to connect the patient directly with your clinic reception team.'
              },
              {
                q: 'Can our front desk staff take over a live conversation?',
                a: 'Yes. The admin control deck provides a one-click human takeover toggle. The moment a staff member activates takeover, artificial intelligence responses pause instantly, allowing your team to type directly in the live session.'
              },
              {
                q: 'How difficult is it to connect our WhatsApp Business account?',
                a: 'Connection takes under ten minutes using the official Meta WhatsApp Cloud API. OmniAgent provides a ready webhook endpoint and verification token that pairs directly with your Meta Business Manager.'
              },
              {
                q: 'Is patient data secure and compliant?',
                a: 'All data is encrypted in transit using TLS 1.3 and at rest with AES-256. Conversations and personal details are segregated and never shared with public model training datasets.'
              },
              {
                q: 'How are consultation deposits and payments processed?',
                a: 'OmniAgent generates direct payment links via Stripe or Razorpay. When a patient completes payment, a secure webhook verifies the transaction ID and transitions the appointment from pending to confirmed.'
              },
              {
                q: 'What happens if a patient cancels or needs to reschedule?',
                a: 'Every confirmed booking includes a secure magic link to a branded self-service portal. Patients can view open slots and reschedule in seconds without calling your reception.'
              },
              {
                q: 'How long does setup and onboarding take?',
                a: 'Most clinics complete setup in less than thirty minutes: five minutes to sync Google Calendar, ten minutes to upload existing service guidelines, and five minutes to embed the widget.'
              }
            ].map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="bg-[#181818] border border-[#313131] rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-white hover:text-[#818cf8] transition-colors cursor-pointer"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#818cf8]' : 'text-[#8c8c8c]'}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-[#8c8c8c] leading-relaxed border-t border-[#272727] pt-4 animate-in fade-in duration-200">
                      <p className="[text-wrap:pretty]">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 8: Risk Reversal & Final CTA (A2, A4) */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="bg-[#181818] border border-[#313131] rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white [text-wrap:balance]">
              Start capturing every patient inquiry today
            </h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base text-[#d6d6d6] leading-relaxed [text-wrap:pretty]">
              Deploy your autonomous clinic concierge in under thirty minutes. Zero calendar double bookings guaranteed.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onLaunchDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#6366f1] hover:bg-[#4f46e5] active:bg-[#4338ca] text-white font-semibold text-base py-2 px-4 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer shadow-lg shadow-[#6366f1]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#181818]"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch interactive demo</span>
              </button>

              <button
                onClick={onOpenDocs}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#272727] hover:bg-[#313131] active:bg-[#1f1f1f] text-white font-medium text-sm py-2 px-4 rounded-xl border border-[#313131] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer"
              >
                <FileText className="h-4 w-4 text-[#8c8c8c]" />
                <span>Explore architecture specs</span>
              </button>
            </div>

            {/* Risk Reversal Guarantee (A4) */}
            <div className="pt-4 text-xs text-[#8c8c8c]">
              14-day free trial • Cancel anytime with one click • Zero credit card required
            </div>
          </div>
        </section>
      </main>

      {/* SECTION 9: Footer with Legal Modals & Status Pill (B10) */}
      <footer className="border-t border-[#313131] bg-[#181818] py-8 text-xs text-[#8c8c8c]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-7 w-7 rounded-lg bg-[#272727] border border-[#313131] flex items-center justify-center text-[#818cf8]">
              <Bot className="h-4 w-4" />
            </div>
            <span>© 2026 OmniAgent Systems. All rights reserved.</span>
          </div>

          {/* Operational Status Pill */}
          <div className="flex items-center space-x-2 bg-[#1f1f1f] border border-[#313131] px-3 py-1 rounded-full text-[11px]">
            <span className="h-2 w-2 rounded-full bg-[#10b981]"></span>
            <span className="text-[#d6d6d6]">99.98% operational uptime</span>
          </div>

          {/* Legal Links (B10) */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy policy
            </button>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of service
            </button>
            <button
              onClick={onOpenDocs}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Docs & specs
            </button>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner (B10) */}
      {!cookieConsentDismissed && (
        <aside 
          aria-label="Cookie preferences"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#181818] border border-[#313131] rounded-2xl p-4 shadow-2xl flex flex-col space-y-3 animate-in fade-in duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-[#818cf8]" />
              <span>Cookie and privacy preferences</span>
            </div>
            <button
              onClick={handleDismissCookie}
              aria-label="Close cookie banner"
              className="text-[#8c8c8c] hover:text-white p-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-[#8c8c8c] leading-relaxed">
            We use strictly necessary functional session cookies to secure calendar integrations and maintain booking states. No commercial ad tracking.
          </p>
          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              onClick={handleDismissCookie}
              className="text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold py-1.5 px-3 rounded-lg transition active:scale-[0.98] cursor-pointer"
            >
              Accept necessary
            </button>
          </div>
        </aside>
      )}

      {/* Privacy Policy Modal (B10) */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="h-5 w-5 text-[#818cf8]" />
                <h3 className="font-semibold text-base text-white">Privacy Policy and Data Protection</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#8c8c8c] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-[#d6d6d6] space-y-3 leading-relaxed">
              <p>
                OmniAgent complies strictly with international healthcare data governance standards. All patient booking data and conversation records remain confidential to the subscribing clinic.
              </p>
              <h4 className="font-semibold text-white text-sm">1. Zero training on clinical data</h4>
              <p>
                Patient inquiries, medical history questions, and booking details are never passed to foundation model vendors for general model training.
              </p>
              <h4 className="font-semibold text-white text-sm">2. End-to-end encryption</h4>
              <p>
                All network transmissions are guarded by TLS 1.3 encryption. Data stored within our Atlas vector database is encrypted at rest using AES-256 keys.
              </p>
              <h4 className="font-semibold text-white text-sm">3. Data retention and deletion</h4>
              <p>
                Clinics may purge customer chat sessions, appointment histories, and uploaded protocol documents at any moment from the admin console.
              </p>
            </div>
            <div className="pt-3 border-t border-[#313131] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#272727] hover:bg-[#313131] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal (B10) */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
              <div className="flex items-center space-x-2.5">
                <FileText className="h-5 w-5 text-[#818cf8]" />
                <h3 className="font-semibold text-base text-white">Terms of Service and Service Level Agreement</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#8c8c8c] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-[#d6d6d6] space-y-3 leading-relaxed">
              <p>
                By connecting OmniAgent to your clinic communications or calendar systems, you agree to these operational provisions.
              </p>
              <h4 className="font-semibold text-white text-sm">1. Autonomous booking guarantee</h4>
              <p>
                OmniAgent verifies open slots in real time against Google Calendar. The subscribing clinic remains responsible for maintaining practitioner availability hours.
              </p>
              <h4 className="font-semibold text-white text-sm">2. Non-emergency clinical advisory</h4>
              <p>
                OmniAgent is a scheduling and practice concierge, not an acute emergency diagnostic tool. Inquiries indicating severe distress trigger immediate human handover protocols.
              </p>
              <h4 className="font-semibold text-white text-sm">3. 14-day evaluation period</h4>
              <p>
                New clinic subscriptions include 14 days of unrestricted access. Subscriptions may be cancelled at any point during this period with zero fees.
              </p>
            </div>
            <div className="pt-3 border-t border-[#313131] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#272727] hover:bg-[#313131] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
