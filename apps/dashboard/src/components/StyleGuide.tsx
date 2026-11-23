import React from 'react';
import { Button } from './ui/Button.js';
import { Badge } from './ui/Badge.js';
import { Skeleton } from './ui/Skeleton.js';
import { Check, Calendar, ArrowRight, Shield, Clock } from 'lucide-react';

export default function StyleGuide() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-12">
      <div>
        <h1 className="text-3xl font-serif-display font-medium text-[#1C1917]">Private Clinic Front Desk — Style System</h1>
        <p className="text-sm text-[#78716C] mt-1.5">
          Design tokens and base primitives for Apex Wellness & Aesthetics Clinic. Calm, paper-toned, and discreet.
        </p>
      </div>

      {/* Palette Tokens */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#1C1917] border-b border-[#E5DFD5] pb-2">1. Color Palette Tokens</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-[#E5DFD5] bg-[#FBF9F5]">
            <div className="font-semibold text-[#1C1917]">Canvas Base</div>
            <div className="text-[11px] text-[#78716C] font-mono mt-0.5">#FBF9F5</div>
            <div className="text-[10px] text-[#A8A29E] mt-2">Warm Ivory</div>
          </div>
          <div className="p-3 rounded-lg border border-[#E5DFD5] bg-[#FFFFFF]">
            <div className="font-semibold text-[#1C1917]">Card Paper</div>
            <div className="text-[11px] text-[#78716C] font-mono mt-0.5">#FFFFFF</div>
            <div className="text-[10px] text-[#A8A29E] mt-2">Pure Sheet</div>
          </div>
          <div className="p-3 rounded-lg border border-[#E5DFD5] bg-[#F3EFE8]">
            <div className="font-semibold text-[#1C1917]">Muted Surface</div>
            <div className="text-[11px] text-[#78716C] font-mono mt-0.5">#F3EFE8</div>
            <div className="text-[10px] text-[#A8A29E] mt-2">Bone Accent</div>
          </div>
          <div className="p-3 rounded-lg border border-[#1E3A2F] bg-[#1E3A2F] text-white">
            <div className="font-semibold">Deep Forest</div>
            <div className="text-[11px] text-[#C6E7D2] font-mono mt-0.5">#1E3A2F</div>
            <div className="text-[10px] text-[#EBF2EE] mt-2">Signature Brand</div>
          </div>
          <div className="p-3 rounded-lg border border-[#C6E7D2] bg-[#EBF2EE]">
            <div className="font-semibold text-[#1B4332]">Sage Wash</div>
            <div className="text-[11px] text-[#1B4332] font-mono mt-0.5">#EBF2EE</div>
            <div className="text-[10px] text-[#78716C] mt-2">Active Surface</div>
          </div>
          <div className="p-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2]">
            <div className="font-semibold text-[#991B1B]">Urgent Wash</div>
            <div className="text-[11px] text-[#991B1B] font-mono mt-0.5">#FEF2F2</div>
            <div className="text-[10px] text-[#78716C] mt-2">Human Alert</div>
          </div>
        </div>
      </section>

      {/* Typography Specimens */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#1C1917] border-b border-[#E5DFD5] pb-2">2. Typography Hierarchy</h2>
        <div className="space-y-4 bg-white p-6 rounded-lg border border-[#E5DFD5]">
          <div>
            <div className="text-[11px] font-mono text-[#78716C] uppercase">Display Serif — Newsreader</div>
            <div className="text-3xl font-serif-display font-medium text-[#1C1917] mt-1">
              Apex Longevity and Aesthetic Medicine
            </div>
          </div>
          <div className="pt-3 border-t border-[#E5DFD5]">
            <div className="text-[11px] font-mono text-[#78716C] uppercase">Humanist UI Sans — Figtree</div>
            <div className="text-sm text-[#44403C] mt-1 leading-relaxed">
              Dr. Marcus Vance has two open consultations tomorrow morning for full medical assessments.
            </div>
          </div>
          <div className="pt-3 border-t border-[#E5DFD5]">
            <div className="text-[11px] font-mono text-[#78716C] uppercase">Data Monospace (Strictly IDs & Times) — Geist Mono</div>
            <div className="text-xs font-mono text-[#1C1917] mt-1">
              APT_2026_LONGEVITY_049 • 11:00 AM IST • $150.00
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Controls & Buttons */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#1C1917] border-b border-[#E5DFD5] pb-2">3. Button Primitives</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Confirm Appointment</Button>
          <Button variant="secondary">View Schedule</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="urgent">Take Over (Pause Agent)</Button>
          <Button variant="primary" size="sm">Small Action</Button>
        </div>
      </section>

      {/* Badges and Indicators */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#1C1917] border-b border-[#E5DFD5] pb-2">4. Badges & Status Indicators</h2>
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="accent" dot>Agent Active</Badge>
          <Badge variant="urgent" dot>Needs Attention</Badge>
          <Badge variant="success" dot>Confirmed</Badge>
          <Badge variant="warning" dot>Deposit Pending</Badge>
          <Badge variant="neutral">WhatsApp</Badge>
          <Badge variant="neutral">VIP Client</Badge>
        </div>
      </section>

      {/* Skeletons */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#1C1917] border-b border-[#E5DFD5] pb-2">5. Skeleton Shimmer State</h2>
        <div className="p-4 bg-white rounded-lg border border-[#E5DFD5] space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </section>
    </div>
  );
}
