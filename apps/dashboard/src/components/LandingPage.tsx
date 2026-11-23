import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Star,
  Check,
  X,
  FileText,
  CreditCard,
  UserCheck,
  RefreshCw,
  MessageSquare,
  Building2,
  Lock
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

  // Real Product Moment: Interactive WhatsApp & Google Calendar Reschedule Simulator
  const [simStep, setSimStep] = useState<number>(1); // 0: initial, 1: options presented, 2: confirmed
  const [selectedSlot, setSelectedSlot] = useState<string>('Thursday, 3:30 PM');
  const [isSyncingCalendar, setIsSyncingCalendar] = useState<boolean>(false);

  // Core Promise Reveal Words
  const taglineWords = [
    'Autonomous', 'patient', 'bookings', 'without', 'calendar', 'conflicts.',
    'Instant', 'answers', 'grounded', 'strictly', 'in', 'your', 'verified', 'clinic', 'protocols.'
  ];
  const [visibleWordCount, setVisibleWordCount] = useState<number>(0);
  const taglineRef = useRef<HTMLDivElement>(null);

  // Tagline Reveal with IntersectionObserver & Scroll Tracking
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisibleWordCount(taglineWords.length);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          let count = 0;
          const interval = setInterval(() => {
            count += 1;
            setVisibleWordCount(count);
            if (count >= taglineWords.length) {
              clearInterval(interval);
            }
          }, 85);
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

  const handleSelectSimSlot = (slot: string) => {
    setIsSyncingCalendar(true);
    setSelectedSlot(slot);
    setSimStep(2);
    setTimeout(() => {
      setIsSyncingCalendar(false);
    }, 600);
  };

  const handleResetSimulation = () => {
    setSimStep(1);
    setSelectedSlot('Thursday, 3:30 PM');
    setIsSyncingCalendar(false);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] flex flex-col font-sans selection:bg-[#1E3A2F] selection:text-white relative">
      {/* Accessibility Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[#1E3A2F] text-white font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A2F]"
      >
        Skip to main content
      </a>

      {/* Clean Top Navigation Bar (Calm Masthead, not a floating pill) */}
      <header className="sticky top-0 z-40 w-full bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#E5DFD5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Clinic Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-[#EBF2EE] border border-[#D5E2DB] flex items-center justify-center text-[#1E3A2F]">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <span className="font-serif-display font-semibold text-base tracking-tight text-[#1C1917] block leading-tight">
                OmniAgent
              </span>
              <span className="text-[11px] text-[#78716C] block leading-tight">
                Clinical Concierge for Practices
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-8 text-xs font-medium text-[#78716C]">
            <a href="#how-it-works" className="hover:text-[#1C1917] transition-colors">
              How it works
            </a>
            <a href="#capabilities" className="hover:text-[#1C1917] transition-colors">
              Capabilities
            </a>
            <a href="#case-studies" className="hover:text-[#1C1917] transition-colors">
              Practice results
            </a>
            <a href="#faq" className="hover:text-[#1C1917] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAdmin}
              className="text-xs font-medium text-[#44403C] hover:text-[#1C1917] px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              Sign in
            </button>

            <button
              onClick={onLaunchDemo}
              className="btn-clinic-primary text-xs py-2 px-3.5 flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <span>See it handle a conversation</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile navigation menu"
              className="md:hidden p-1.5 rounded-md text-[#44403C] hover:bg-[#F3EFE8] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <div className="space-y-1 w-5"><span className="block h-0.5 w-5 bg-[#1C1917]"></span><span className="block h-0.5 w-5 bg-[#1C1917]"></span></div>}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#E5DFD5] bg-[#FFFFFF] px-6 py-4 space-y-3 shadow-md animate-in fade-in duration-150">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#44403C] hover:text-[#1C1917] py-1"
            >
              How it works
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#44403C] hover:text-[#1C1917] py-1"
            >
              Capabilities
            </a>
            <a
              href="#case-studies"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#44403C] hover:text-[#1C1917] py-1"
            >
              Practice results
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#44403C] hover:text-[#1C1917] py-1"
            >
              FAQ
            </a>
            <div className="pt-2 border-t border-[#E5DFD5] flex flex-col space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full text-center py-2 rounded-md border border-[#E5DFD5] text-xs font-medium text-[#1C1917] hover:bg-[#F3EFE8]"
              >
                Sign in to console
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLaunchDemo();
                }}
                className="w-full text-center py-2 rounded-md btn-clinic-primary text-xs font-semibold"
              >
                See it handle a conversation
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1">
        {/* SECTION 1: Editorial Asymmetric Hero with Live WhatsApp & Calendar Reschedule Mock */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* Left Column: Editorial Headline, Calm Copy, Trust Statement */}
            <div className="lg:col-span-6 space-y-6 pt-2">
              {/* Calm Clinic Practice Pill */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EBF2EE] border border-[#D5E2DB] text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1E3A2F]"></span>
                <span className="text-[#1E3A2F] font-medium">Apex Wellness & Aesthetics Concierge</span>
                <span className="text-[#78716C]">• Live in-clinic</span>
              </div>

              {/* Display Serif Headline (No gradients, pure deep stone ink) */}
              <h1 className="font-serif-display font-medium text-4xl sm:text-5xl lg:text-[52px] leading-[1.12] text-[#1C1917] tracking-tight [text-wrap:balance]">
                The quiet 24/7 concierge for high-trust aesthetic and wellness clinics.
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-[#44403C] leading-relaxed [text-wrap:pretty]">
                Capture patient inquiries the moment they arrive, quote verified treatment fees without hallucinations, and lock confirmed slots into Google Calendar without double bookings.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={onLaunchDemo}
                  className="btn-clinic-primary text-sm py-3 px-6 flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                >
                  <span>See it handle a conversation</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={onOpenAdmin}
                  className="btn-clinic-secondary text-sm py-3 px-5 text-center cursor-pointer"
                >
                  <span>Sign in</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-[#E5DFD5] grid grid-cols-3 gap-4 text-xs text-[#78716C]">
                <div>
                  <div className="font-semibold text-sm text-[#1C1917]">100%</div>
                  <div className="mt-0.5 leading-tight">Verified clinic docs</div>
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#1C1917]">0</div>
                  <div className="mt-0.5 leading-tight">Double bookings</div>
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#1C1917]">Instant</div>
                  <div className="mt-0.5 leading-tight">Staff takeover</div>
                </div>
              </div>
            </div>

            {/* Right Column: THE REAL PRODUCT MOMENT (WhatsApp Cryotherapy Reschedule + Live Calendar Sync) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Product Moment Header */}
              <div className="flex items-center justify-between text-xs text-[#78716C] px-1">
                <span className="font-medium text-[#1C1917]">Live Patient Scenario</span>
                <span className="font-mono text-[11px]">Rescheduling Cryotherapy</span>
              </div>

              <div className="bg-white border border-[#E5DFD5] rounded-xl shadow-md overflow-hidden">
                {/* 1. WhatsApp Dialogue Card */}
                <div className="p-4 sm:p-5 border-b border-[#E5DFD5] bg-[#FDFCFB] space-y-3.5">
                  {/* WhatsApp Reception Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD5]/80">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8 w-8 rounded-full bg-[#1E3A2F] text-white flex items-center justify-center text-xs font-semibold">
                        AW
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-[#1C1917] flex items-center space-x-1.5">
                          <span>Apex Wellness Concierge</span>
                          <span className="text-[10px] bg-[#EBF2EE] text-[#1B4332] px-1.5 py-0.2 rounded font-medium">WhatsApp</span>
                        </div>
                        <div className="text-[11px] text-[#78716C]">Dr. Marcus Vance's Schedule</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] text-[#1B4332] font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#1B4332]"></span>
                      <span>Online</span>
                    </div>
                  </div>

                  {/* Thread Dialogue */}
                  <div className="space-y-3 text-xs">
                    {/* Patient Message */}
                    <div className="flex justify-end">
                      <div className="bg-[#EBF2EE] text-[#1C1917] py-2 px-3.5 rounded-xl rounded-tr-none max-w-[88%] leading-relaxed border border-[#D5E2DB]">
                        <p>Hi, I need to reschedule my cryotherapy session tomorrow from 2:00 PM to Thursday afternoon. Is Dr. Vance available?</p>
                        <span className="block text-[10px] text-[#78716C] text-right mt-1 font-mono">10:14 AM</span>
                      </div>
                    </div>

                    {/* Agent Response */}
                    <div className="flex justify-start">
                      <div className="bg-white text-[#1C1917] py-2.5 px-3.5 rounded-xl rounded-tl-none max-w-[92%] leading-relaxed border border-[#E5DFD5] shadow-xs space-y-2">
                        <p>
                          Hello Sarah! Dr. Vance has two open slots this Thursday, Nov 27 for Whole-Body Cryotherapy ($85):
                        </p>

                        {/* Interactive Slot Selection */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleSelectSimSlot('Thursday, 3:30 PM')}
                            className={`py-1.5 px-3 rounded-lg border text-xs font-medium text-center transition cursor-pointer ${
                              selectedSlot === 'Thursday, 3:30 PM'
                                ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                                : 'bg-[#FAF7F2] border-[#E5DFD5] text-[#1C1917] hover:border-[#1E3A2F]'
                            }`}
                          >
                            03:30 PM (Recommended)
                          </button>
                          <button
                            onClick={() => handleSelectSimSlot('Thursday, 4:15 PM')}
                            className={`py-1.5 px-3 rounded-lg border text-xs font-medium text-center transition cursor-pointer ${
                              selectedSlot === 'Thursday, 4:15 PM'
                                ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                                : 'bg-[#FAF7F2] border-[#E5DFD5] text-[#1C1917] hover:border-[#1E3A2F]'
                            }`}
                          >
                            04:15 PM
                          </button>
                        </div>
                        <span className="block text-[10px] text-[#78716C] font-mono">10:14 AM • Verified against clinic schedule</span>
                      </div>
                    </div>

                    {/* Confirmation Message */}
                    {simStep >= 2 && (
                      <div className="flex justify-start animate-in fade-in duration-200">
                        <div className="bg-[#EBF2EE] text-[#1C1917] py-2.5 px-3.5 rounded-xl rounded-tl-none max-w-[92%] leading-relaxed border border-[#C6E7D2] space-y-1">
                          <div className="flex items-center space-x-1.5 text-[#1B4332] font-semibold text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Confirmed for {selectedSlot}</span>
                          </div>
                          <p className="text-[11px] text-[#44403C]">
                            Your Google Calendar invite is updated. Pre-cryo hydration guidelines remain the same. See you Thursday!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Live Synchronized Google Calendar View */}
                <div className="p-4 sm:p-5 bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E5DFD5]">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3.5 w-3.5 text-[#1E3A2F]" />
                      <span className="font-semibold text-[#1C1917]">Google Calendar Sync Status</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#78716C]">
                      {isSyncingCalendar ? 'Updating API...' : 'Synced in 140ms'}
                    </span>
                  </div>

                  {/* Calendar Matrix Rows */}
                  <div className="space-y-2 text-xs">
                    {/* Wednesday slot (previous) */}
                    <div className="p-2.5 rounded-md border border-[#E5DFD5] bg-[#FAF7F2] flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-[11px] text-[#78716C] w-14">Wed 2:00p</span>
                        <div className="space-y-0.5">
                          <span className="text-xs line-through text-[#78716C]">Sarah Chen • Cryotherapy</span>
                          <span className="text-[10px] block text-[#1B4332] font-medium">Slot released back to clinic availability</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#F3EFE8] text-[#78716C]">
                        Open slot
                      </span>
                    </div>

                    {/* Thursday slot (new) */}
                    <div className="p-2.5 rounded-md border border-[#C6E7D2] bg-[#EAF5EE] flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-[11px] text-[#1B4332] font-semibold w-14">Thu 3:30p</span>
                        <div className="space-y-0.5">
                          <span className="font-semibold text-xs text-[#1C1917]">Sarah Chen • Whole-Body Cryo ($85)</span>
                          <span className="text-[10px] block text-[#78716C]">Dr. Marcus Vance • Suite 302</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#1B4332] text-white">
                        Confirmed
                      </span>
                    </div>
                  </div>

                  {/* Reset Control */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-[#78716C]">
                    <span>Interactive preview</span>
                    <button
                      onClick={handleResetSimulation}
                      className="text-[#1E3A2F] hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Replay scenario</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 2: Why Clinics Reject Generic Chatbots (Asymmetric Editorial List) */}
        <section id="capabilities" className="border-t border-[#E5DFD5] bg-[#FFFFFF] py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column (5 cols): Serif Editorial Thesis */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs uppercase tracking-wider text-[#78716C] font-semibold">Clinical Integrity</span>
                <h2 className="font-serif-display font-medium text-3xl sm:text-4xl text-[#1C1917] tracking-tight leading-tight [text-wrap:balance]">
                  Why premier wellness practices refuse generic AI chatbots.
                </h2>
                <p className="text-sm text-[#44403C] leading-relaxed [text-wrap:pretty]">
                  Patients seeking medical consultations or aesthetics treatments demand discreet, reliable guidance. A bot that hallucinates prices or allows double bookings irreparably harms practice reputation.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onLaunchDemo}
                    className="btn-clinic-secondary text-xs py-2 px-4 inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Test our clinical guardrails</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column (7 cols): 3 Hairline Numbered Editorial Rows */}
              <div className="lg:col-span-7 divide-y divide-[#E5DFD5] border-y lg:border-y-0 border-[#E5DFD5]">
                {/* Point 1 */}
                <div className="py-5 space-y-2">
                  <div className="flex items-baseline space-x-3">
                    <span className="font-mono text-xs font-semibold text-[#1E3A2F]">01</span>
                    <h3 className="font-semibold text-base text-[#1C1917]">Zero double-booking guarantee</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#44403C] pl-7 leading-relaxed">
                    OmniAgent queries real Google Calendar availability via millisecond atomic locks. It never promises a slot unless it is physically open on the practitioner's master roster.
                  </p>
                </div>

                {/* Point 2 */}
                <div className="py-5 space-y-2">
                  <div className="flex items-baseline space-x-3">
                    <span className="font-mono text-xs font-semibold text-[#1E3A2F]">02</span>
                    <h3 className="font-semibold text-base text-[#1C1917]">Strictly grounded in written protocols</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#44403C] pl-7 leading-relaxed">
                    Answers derive solely from your uploaded service sheets, doctor profiles, and fee schedules. If a patient asks an unverified medical question, the concierge gracefully defers to your human staff.
                  </p>
                </div>

                {/* Point 3 */}
                <div className="py-5 space-y-2">
                  <div className="flex items-baseline space-x-3">
                    <span className="font-mono text-xs font-semibold text-[#1E3A2F]">03</span>
                    <h3 className="font-semibold text-base text-[#1C1917]">Instant human takeover with zero friction</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#44403C] pl-7 leading-relaxed">
                    Receptionists can review incoming chats in real time. One click pauses automated responses so your front desk can type directly into the conversation.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3: Tagline Promise Reveal (Refined Serif Statement) */}
        <section 
          ref={taglineRef}
          aria-label="Core Promise"
          className="border-t border-[#E5DFD5] bg-[#FBF9F5] py-20 sm:py-24 text-center"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
            <span className="text-xs uppercase tracking-wider text-[#78716C] font-semibold">The OmniAgent Standard</span>
            <p className="font-serif-display font-medium text-2xl sm:text-3xl lg:text-4xl text-[#1C1917] leading-relaxed tracking-tight [text-wrap:balance]">
              {taglineWords.map((word, index) => {
                const isRevealed = index < visibleWordCount;
                return (
                  <span
                    key={index}
                    className={`inline-block mr-2 transition-all duration-400 ${
                      isRevealed 
                        ? 'text-[#1C1917] opacity-100' 
                        : 'text-[#A8A29E] opacity-35'
                    }`}
                  >
                    {word}
                  </span>
                );
              })}
            </p>
          </div>
        </section>

        {/* SECTION 4: Three-Step Implementation (How It Works) */}
        <section id="how-it-works" className="border-t border-[#E5DFD5] bg-[#FFFFFF] py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs uppercase tracking-wider text-[#78716C] font-semibold">Effortless Setup</span>
              <h2 className="font-serif-display font-medium text-3xl sm:text-4xl text-[#1C1917] tracking-tight [text-wrap:balance]">
                Live in your clinic in under thirty minutes
              </h2>
              <p className="text-sm text-[#44403C] [text-wrap:pretty]">
                No complex IT engineering. Connect your existing schedule and documents in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-xl border border-[#E5DFD5] bg-[#FBF9F5] space-y-3">
                <div className="h-8 w-8 rounded-full bg-[#1E3A2F] text-white font-mono text-xs font-semibold flex items-center justify-center">
                  1
                </div>
                <h3 className="font-semibold text-base text-[#1C1917]">Sync Google Calendar & Doctors</h3>
                <p className="text-xs text-[#44403C] leading-relaxed">
                  Authorize your clinic's existing calendar. Practitioners' working hours and buffer times sync immediately.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-xl border border-[#E5DFD5] bg-[#FBF9F5] space-y-3">
                <div className="h-8 w-8 rounded-full bg-[#1E3A2F] text-white font-mono text-xs font-semibold flex items-center justify-center">
                  2
                </div>
                <h3 className="font-semibold text-base text-[#1C1917]">Upload Treatment Guidelines</h3>
                <p className="text-xs text-[#44403C] leading-relaxed">
                  Drag and drop your consultation fees, FAQ sheets, and pre-care instructions. The concierge indexes them into verified knowledge.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-xl border border-[#E5DFD5] bg-[#FBF9F5] space-y-3">
                <div className="h-8 w-8 rounded-full bg-[#1E3A2F] text-white font-mono text-xs font-semibold flex items-center justify-center">
                  3
                </div>
                <h3 className="font-semibold text-base text-[#1C1917]">Enable Web & WhatsApp Concierge</h3>
                <p className="text-xs text-[#44403C] leading-relaxed">
                  Embed our lightweight patient widget on your website and link your WhatsApp Business line to handle after-hours inquiries automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Verified Clinic Case Studies & Real Results */}
        <section id="case-studies" className="border-t border-[#E5DFD5] bg-[#FAF7F2] py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs uppercase tracking-wider text-[#78716C] font-semibold">Proven in Practice</span>
              <h2 className="font-serif-display font-medium text-3xl sm:text-4xl text-[#1C1917] tracking-tight [text-wrap:balance]">
                Trusted by operating clinic directors
              </h2>
              <p className="text-sm text-[#44403C] [text-wrap:pretty]">
                Real medical aesthetic practices capturing after-hours demand while liberating reception staff.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-[#1E3A2F]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="font-serif-display italic text-sm text-[#1C1917] leading-relaxed [text-wrap:pretty]">
                    "Cut front desk inquiry handling by 14 hours per week while capturing 38 additional patient consultations in our first month."
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E5DFD5]">
                  <div className="font-semibold text-xs text-[#1C1917]">Dr. Marcus Vance</div>
                  <div className="text-[11px] text-[#78716C]">Medical Director, Apex Longevity Clinic</div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-[#1E3A2F]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="font-serif-display italic text-sm text-[#1C1917] leading-relaxed [text-wrap:pretty]">
                    "Zero double bookings since launch. Patients love inquiring at midnight via WhatsApp and receiving confirmed calendar invites instantly."
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E5DFD5]">
                  <div className="font-semibold text-xs text-[#1C1917]">Elena Rostova</div>
                  <div className="text-[11px] text-[#78716C]">Practice Manager, Lumina Aesthetics Studio</div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-[#1E3A2F]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="font-serif-display italic text-sm text-[#1C1917] leading-relaxed [text-wrap:pretty]">
                    "The automated deposit collection reduced our consultation no-show rate from 18.2% down to 3.8%."
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E5DFD5]">
                  <div className="font-semibold text-xs text-[#1C1917]">Dr. Ananya Ray</div>
                  <div className="text-[11px] text-[#78716C]">Founder, Nova Dental & Aesthetics</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: FAQ Accordion (Clean Hairline Treatment) */}
        <section id="faq" className="border-t border-[#E5DFD5] bg-[#FFFFFF] py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs uppercase tracking-wider text-[#78716C] font-semibold">Common Inquiries</span>
              <h2 className="font-serif-display font-medium text-3xl sm:text-4xl text-[#1C1917] tracking-tight [text-wrap:balance]">
                Frequently asked questions
              </h2>
              <p className="text-sm text-[#44403C] [text-wrap:pretty]">
                Straightforward answers regarding clinical accuracy, calendar synchronization, and patient privacy.
              </p>
            </div>

            <div className="divide-y divide-[#E5DFD5] border-y border-[#E5DFD5]">
              {[
                {
                  q: 'How does OmniAgent prevent double bookings with Google Calendar?',
                  a: 'OmniAgent connects directly to official Google Calendar APIs. Before presenting or confirming any slot, it runs a millisecond verification check against existing calendar blocks. When an appointment is scheduled, it places an instant atomic lock to guarantee zero conflicts.'
                },
                {
                  q: 'What happens if a patient asks a clinical question not in our documents?',
                  a: 'OmniAgent operates within strict retrieval guardrails. If a query falls outside your clinic documentation, the concierge clearly states that it does not have that specific information and offers to connect the patient directly with your reception team.'
                },
                {
                  q: 'Can front desk staff take over a live patient conversation?',
                  a: 'Yes. The reception console includes an instant "Step in & reply directly" toggle. The moment a staff member steps in, AI responses pause immediately, letting your team chat directly in the session.'
                },
                {
                  q: 'How difficult is it to connect our WhatsApp Business line?',
                  a: 'Connection takes under ten minutes using Meta WhatsApp Cloud API webhooks. OmniAgent provides a dedicated webhook endpoint and token that pairs directly with your Meta Business Manager.'
                },
                {
                  q: 'Is patient data secure and private?',
                  a: 'All data is encrypted in transit via TLS 1.3 and at rest with AES-256. Conversations and patient details remain confidential to your practice and are never used for public AI model training.'
                },
                {
                  q: 'How are consultation deposits collected?',
                  a: 'OmniAgent generates direct payment links via Stripe or Razorpay. When a patient completes payment, a secure webhook automatically confirms the reservation and issues an official receipt.'
                },
                {
                  q: 'What happens when a patient needs to reschedule?',
                  a: 'Every confirmed booking includes a secure link to our branded self-service portal. Patients can view open slots and reschedule in seconds without calling reception.'
                }
              ].map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="py-4">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full text-left flex items-center justify-between text-sm sm:text-base font-semibold text-[#1C1917] hover:text-[#1E3A2F] transition-colors cursor-pointer"
                    >
                      <span className="pr-4">{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-[#78716C] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1E3A2F]' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="pt-3 pb-1 text-xs sm:text-sm text-[#44403C] leading-relaxed animate-in fade-in duration-150">
                        <p className="[text-wrap:pretty]">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 7: Warm Final Call to Action */}
        <section className="border-t border-[#E5DFD5] bg-[#FBF9F5] py-20 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
            <h2 className="font-serif-display font-medium text-3xl sm:text-4xl text-[#1C1917] tracking-tight [text-wrap:balance]">
              Deliver a five-star front desk experience to every patient.
            </h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base text-[#44403C] leading-relaxed [text-wrap:pretty]">
              Deploy your practice concierge in under thirty minutes. Experience zero double bookings and 24/7 patient responsiveness.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onLaunchDemo}
                className="btn-clinic-primary text-sm py-3 px-6 flex items-center space-x-2 shadow-xs cursor-pointer"
              >
                <span>See it handle a conversation</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onOpenDocs}
                className="btn-clinic-secondary text-sm py-3 px-5 cursor-pointer"
              >
                <span>Explore architecture specs</span>
              </button>
            </div>

            <div className="pt-3 text-xs text-[#78716C]">
              14-day evaluation • Cancel anytime with one click • Zero credit card required
            </div>
          </div>
        </section>
      </main>

      {/* SECTION 8: Clean Footer */}
      <footer className="border-t border-[#E5DFD5] bg-[#FFFFFF] py-8 text-xs text-[#78716C]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-6 w-6 rounded bg-[#EBF2EE] border border-[#D5E2DB] flex items-center justify-center text-[#1E3A2F]">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <span>© 2026 OmniAgent Systems. Crafted for modern medical practices.</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] bg-[#FAF7F2] border border-[#E5DFD5] px-3 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-[#1B4332]"></span>
            <span className="text-[#1C1917]">Google Calendar & WhatsApp Cloud Active</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              Privacy policy
            </button>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              Terms of service
            </button>
            <button
              onClick={onOpenDocs}
              className="hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              Docs & specs
            </button>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {!cookieConsentDismissed && (
        <aside 
          aria-label="Cookie preferences"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white border border-[#E5DFD5] rounded-xl p-4 shadow-lg flex flex-col space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#1C1917]">
              <ShieldCheck className="h-4 w-4 text-[#1E3A2F]" />
              <span>Cookie and privacy preferences</span>
            </div>
            <button
              onClick={handleDismissCookie}
              aria-label="Close cookie banner"
              className="text-[#78716C] hover:text-[#1C1917] p-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-[#78716C] leading-relaxed">
            We use strictly necessary functional session cookies to secure calendar integrations and maintain booking states. No commercial ad tracking.
          </p>
          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              onClick={handleDismissCookie}
              className="btn-clinic-primary text-xs py-1.5 px-3 cursor-pointer"
            >
              Accept necessary
            </button>
          </div>
        </aside>
      )}

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD5]">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="h-5 w-5 text-[#1E3A2F]" />
                <h3 className="font-serif-display font-medium text-base text-[#1C1917]">Privacy Policy & Clinical Data Governance</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#78716C] hover:text-[#1C1917] p-1 rounded cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-[#44403C] space-y-3 leading-relaxed">
              <p>
                OmniAgent complies strictly with healthcare data governance standards. All patient booking data and conversation records remain confidential to the subscribing clinic.
              </p>
              <h4 className="font-semibold text-[#1C1917] text-xs">1. Zero training on clinical conversations</h4>
              <p>
                Patient inquiries, medical history questions, and booking details are never passed to external parties or used for public foundation model training.
              </p>
              <h4 className="font-semibold text-[#1C1917] text-xs">2. End-to-end encryption</h4>
              <p>
                All network transmissions are guarded by TLS 1.3 encryption. Data stored within our database is encrypted at rest using AES-256 keys.
              </p>
              <h4 className="font-semibold text-[#1C1917] text-xs">3. Data retention and deletion</h4>
              <p>
                Clinics may purge customer chat sessions, appointment histories, and uploaded protocol documents at any moment from the admin console.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E5DFD5] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="btn-clinic-secondary text-xs py-1.5 px-4 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD5]">
              <div className="flex items-center space-x-2.5">
                <FileText className="h-5 w-5 text-[#1E3A2F]" />
                <h3 className="font-serif-display font-medium text-base text-[#1C1917]">Terms of Service & Clinical SLA</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#78716C] hover:text-[#1C1917] p-1 rounded cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-[#44403C] space-y-3 leading-relaxed">
              <p>
                By connecting OmniAgent to your clinic communications or calendar systems, you agree to these operational provisions.
              </p>
              <h4 className="font-semibold text-[#1C1917] text-xs">1. Autonomous booking guarantee</h4>
              <p>
                OmniAgent verifies open slots in real time against Google Calendar. The subscribing clinic remains responsible for maintaining practitioner availability hours.
              </p>
              <h4 className="font-semibold text-[#1C1917] text-xs">2. Non-emergency clinical advisory</h4>
              <p>
                OmniAgent is a scheduling and practice concierge, not an acute emergency diagnostic tool. Inquiries indicating severe distress trigger immediate human handover protocols.
              </p>
              <h4 className="font-semibold text-[#1C1917] text-xs">3. 14-day evaluation period</h4>
              <p>
                New clinic subscriptions include 14 days of unrestricted access. Subscriptions may be cancelled at any point during this period with zero fees.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E5DFD5] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="btn-clinic-secondary text-xs py-1.5 px-4 cursor-pointer"
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
