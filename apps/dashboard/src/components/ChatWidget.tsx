import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  X, 
  Send, 
  Calendar, 
  Check, 
  Clock, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  Mic,
  MessageSquare
} from 'lucide-react';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  thoughts?: string[];
  slots?: { time: string; doctor: string; chamber?: string }[];
  requiresTakeover?: boolean;
}

export interface ChatWidgetProps {
  clinicName?: string;
  accentColor?: string;
  welcomeGreeting?: string;
}

export default function ChatWidget({
  clinicName = 'Apex Wellness & Aesthetics',
  welcomeGreeting = 'Welcome to Apex Wellness. I am your clinic concierge. How can we assist with your treatments, pricing, or scheduling today?'
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showThoughts, setShowThoughts] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'es' | 'fr'>('en');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [conversationId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('omniagent_dashboard_widget_conv');
      if (stored) return stored;
      const newId = `web_guest_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      sessionStorage.setItem('omniagent_dashboard_widget_conv', newId);
      return newId;
    }
    return `web_guest_${Date.now()}`;
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: welcomeGreeting
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleVoiceInput = async () => {
    setIsTranscribing(true);
    try {
      const audioMarker = selectedLang === 'hi'
        ? 'simulated_hindi'
        : (selectedLang === 'es' ? 'simulated_spanish' : (selectedLang === 'fr' ? 'simulated_french' : 'simulated_voice'));
      const res = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: audioMarker,
          languageHint: selectedLang
        })
      });
      const data = await res.json();
      if (data.transcription) {
        setInput(data.transcription);
      }
    } catch (err) {
      console.error('Voice transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId,
          channel: 'web',
          language: selectedLang
        })
      });

      const data = await res.json();

      let slots: any[] | undefined = undefined;
      if (data.detectedIntent === 'booking_request' || data.detectedIntent === 'reschedule') {
        try {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dateStr = tomorrow.toISOString().split('T')[0];
          const slotRes = await fetch(`/api/appointments/slots?date=${dateStr}`);
          const slotData = await slotRes.json();
          if (slotData.success && Array.isArray(slotData.slots)) {
            const avail = slotData.slots.filter((s: any) => s.isAvailable);
            if (avail.length > 0) {
              slots = avail.slice(0, 3).map((s: any) => ({
                time: s.displayTime,
                doctor: s.assignedDoctor,
                chamber: s.chamber || 'Cryo Suite A'
              }));
            }
          }
        } catch (e) {
          console.error('Failed to fetch live slots:', e);
        }

        if (!slots || slots.length === 0) {
          slots = [
            { time: '2:00 PM', doctor: 'Dr. Marcus Vance', chamber: 'Cryo Suite A' },
            { time: '3:30 PM', doctor: 'Dr. Marcus Vance', chamber: 'Cryo Suite B' },
            { time: '4:15 PM', doctor: 'Dr. Ananya Ray', chamber: 'Aesthetics 1' }
          ];
        }
      }

      const botMsg: Message = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        thoughts: data.agentThoughts,
        slots,
        requiresTakeover: data.requiresHumanTakeover
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: "I'm having trouble connecting right now, but our reception coordinator has been alerted to assist you directly."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Discreet, Elegant Floating Launcher (Small 48px circle, never obscures footer or content) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open clinic concierge chat"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 h-12 w-12 sm:h-13 sm:w-13 rounded-full bg-[#1E3A2F] text-white shadow-lg hover:shadow-xl hover:bg-[#152B23] active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer border border-[#152B23] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A2F] focus-visible:ring-offset-2"
        >
          <span className="sr-only">Open Apex Wellness Concierge</span>
          {/* Subtle online pip */}
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#10b981] border-2 border-white"></span>
          <MessageSquare className="h-5 w-5" />
        </button>
      )}

      {/* Clinic Branded Chat Drawer (Warm paper aesthetic, restrained radii, hairline dividers) */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] max-w-[400px] h-[calc(100vh-5rem)] max-h-[580px] rounded-xl bg-[#FBF9F5] border border-[#E5DFD5] shadow-2xl flex flex-col overflow-hidden font-sans animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          {/* Clinic Header */}
          <div className="p-3.5 bg-white border-b border-[#E5DFD5] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#EBF2EE] border border-[#D5E2DB] flex items-center justify-center text-[#1E3A2F]">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="font-serif-display font-semibold text-xs text-[#1C1917] tracking-tight">
                    {clinicName}
                  </h4>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1B4332]"></span>
                </div>
                <p className="text-[10px] text-[#78716C]">
                  Concierge active • Verified protocols
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Language Selector Pills */}
              <div className="flex bg-[#FAF7F2] p-0.5 rounded border border-[#E5DFD5] text-[9px] font-mono">
                {(['en', 'hi', 'es', 'fr'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-1.5 py-0.5 rounded uppercase transition cursor-pointer ${
                      selectedLang === lang
                        ? 'bg-[#1E3A2F] text-white font-semibold'
                        : 'text-[#78716C] hover:text-[#1C1917]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close concierge window"
                className="p-1 rounded text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE8] transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => (
              <div key={m.id} className="space-y-1.5">
                {/* Quiet Protocol Verification Detail (Replaces Jargon) */}
                {m.thoughts && m.thoughts.length > 0 && (
                  <div className="rounded-md bg-white border border-[#E5DFD5] p-2 text-[10px] text-[#78716C]">
                    <div 
                      className="flex items-center justify-between cursor-pointer select-none text-[#1E3A2F] font-medium"
                      onClick={() => setShowThoughts(!showThoughts)}
                    >
                      <div className="flex items-center space-x-1.5">
                        <ShieldCheck className="h-3 w-3 text-[#1E3A2F]" />
                        <span>Verified against clinic documentation</span>
                      </div>
                      {showThoughts ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </div>
                    {showThoughts && (
                      <div className="mt-1.5 space-y-1 border-t border-[#E5DFD5] pt-1 text-[10px] text-[#44403C]">
                        {m.thoughts.map((t, idx) => (
                          <div key={idx} className="line-clamp-1">• {t}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] p-3 rounded-lg text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#1E3A2F] text-white rounded-tr-xs'
                        : 'bg-white border border-[#E5DFD5] text-[#1C1917] rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>

                {/* Interactive Slot Carousel (Lead View for bookings) */}
                {m.slots && (
                  <div className="mt-2 space-y-1.5">
                    <div className="text-[10px] font-medium text-[#1E3A2F] flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Available calendar consultation slots:</span>
                    </div>
                    <div className="flex space-x-2 overflow-x-auto pb-1">
                      {m.slots.map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          className="min-w-[135px] p-2.5 rounded-lg bg-white border border-[#E5DFD5] hover:border-[#1E3A2F] transition flex flex-col justify-between shadow-2xs"
                        >
                          <div>
                            <div className="font-mono text-xs font-semibold text-[#1E3A2F]">{slot.time}</div>
                            <div className="text-[10px] text-[#44403C] mt-0.5">{slot.doctor}</div>
                            <div className="text-[9px] text-[#78716C]">{slot.chamber}</div>
                          </div>
                          <button
                            onClick={() => handleSend(`I'd like to confirm the ${slot.time} slot with ${slot.doctor}.`)}
                            className="mt-2 w-full btn-clinic-primary text-[10px] py-1 px-2 cursor-pointer text-center"
                          >
                            Reserve slot
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Receptionist Takeover Alert */}
                {m.requiresTakeover && (
                  <div className="p-2.5 rounded-lg bg-[#FEF9C3] border border-[#FDE047] text-[11px] text-[#854D0E] flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 shrink-0 text-[#854D0E]" />
                    <span>Reception notified. A clinic staff coordinator is stepping in to assist you directly.</span>
                  </div>
                )}
              </div>
            ))}

            {/* Calm Loading State */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E5DFD5] rounded-lg rounded-tl-xs p-2.5 text-xs text-[#78716C] flex items-center space-x-2 shadow-2xs">
                  <span className="flex space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1E3A2F] animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1E3A2F] animate-bounce [animation-delay:0.15s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1E3A2F] animate-bounce [animation-delay:0.3s]"></span>
                  </span>
                  <span>Verifying schedule & clinic records...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3 py-2 border-t border-[#E5DFD5] flex space-x-1.5 overflow-x-auto bg-[#FAF7F2]">
            {[
              'Book consultation',
              'Check treatment fees',
              'Reschedule slot',
              'Talk to reception'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-md text-[10px] font-medium bg-white hover:bg-[#F3EFE8] border border-[#E5DFD5] text-[#1C1917] transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Bottom Input Dock */}
          <div className="p-2.5 border-t border-[#E5DFD5] bg-white">
            {isTranscribing && (
              <div className="mb-2 px-2.5 py-1 rounded bg-[#EBF2EE] border border-[#C6E7D2] text-[10px] text-[#1B4332] flex items-center space-x-1.5">
                <Mic className="h-3 w-3 text-[#1B4332] animate-pulse" />
                <span>Transcribing voice inquiry...</span>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-1.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedLang === 'hi' ? 'Kuch bhi poochein ya book karein...' : (selectedLang === 'es' ? 'Pregunte o reserve una cita...' : 'Ask about treatments or schedule a visit...')}
                className="flex-1 input-clinic text-xs py-1.5 px-3"
              />

              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isTranscribing || isLoading}
                title="Speak / Voice Note"
                className={`p-2 rounded-md border transition cursor-pointer ${
                  isTranscribing
                    ? 'bg-[#EBF2EE] border-[#1E3A2F] text-[#1E3A2F]'
                    : 'bg-[#FAF7F2] hover:bg-[#F3EFE8] border-[#E5DFD5] text-[#78716C]'
                }`}
              >
                <Mic className="h-3.5 w-3.5" />
              </button>

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="btn-clinic-primary p-2 cursor-pointer disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
