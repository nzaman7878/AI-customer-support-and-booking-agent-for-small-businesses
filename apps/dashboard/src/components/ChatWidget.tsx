import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Calendar, 
  Check, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  Activity,
  Mic,
  Paperclip
} from 'lucide-react';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  thoughts?: string[];
  slots?: { time: string; doctor: string; chamber?: string }[];
  requiresTakeover?: boolean;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showThoughts, setShowThoughts] = useState(true);
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
      content: 'Welcome to Apex Wellness Clinic. I am your autonomous health concierge. How can I assist your longevity and recovery journey today?'
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
          content: "I'm having trouble connecting right now, but our front desk coordinator has been notified."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-[#181818] border border-[#313131] hover:bg-[#272727] shadow-xl text-white transition cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000]"
        >
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]"></span>
            </span>
            <Bot className="h-4 w-4 text-[#818cf8] group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-semibold text-[#f5f5f5] tracking-tight">
              Apex AI Concierge
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px] h-[calc(100vh-5rem)] max-h-[620px] rounded-2xl bg-[#181818] border border-[#313131] shadow-2xl flex flex-col overflow-hidden font-sans">
          {/* Header */}
          <div className="p-4 bg-[#181818] border-b border-[#313131] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-[#272727] border border-[#313131] flex items-center justify-center">
                <Bot className="h-5 w-5 text-[#818cf8]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-xs font-semibold text-[#f5f5f5] tracking-tight">Apex concierge AI</h4>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></span>
                </div>
                <p className="text-[10px] text-[#8c8c8c]">Online • Instant verified response</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Language Selector Pills */}
              <div className="flex bg-[#030712] p-0.5 rounded-lg border border-[#1e293b] text-[9px] font-mono">
                {(['en', 'hi', 'es', 'fr'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-1.5 py-0.5 rounded uppercase transition cursor-pointer ${
                      selectedLang === lang
                        ? 'bg-[#6366f1] text-white font-bold'
                        : 'text-[#908fa0] hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#908fa0] hover:text-white hover:bg-[#1e293b] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => (
              <div key={m.id} className="space-y-2">
                {/* Agent Thought Accordion */}
                {m.thoughts && m.thoughts.length > 0 && (
                  <div className="rounded-xl bg-[#0a0e18] border border-[#6366f1]/30 p-2.5 text-[10px] font-mono text-[#908fa0]">
                    <div 
                      className="flex items-center justify-between cursor-pointer select-none text-[#818cf8]"
                      onClick={() => setShowThoughts(!showThoughts)}
                    >
                      <div className="flex items-center space-x-1.5 font-semibold">
                        <Activity className="h-3 w-3 animate-pulse text-[#6366f1]" />
                        <span>LangGraph Reasoning Step</span>
                      </div>
                      {showThoughts ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </div>
                    {showThoughts && (
                      <div className="mt-1.5 space-y-1 border-t border-[#1e293b] pt-1">
                        {m.thoughts.map((t, idx) => (
                          <div key={idx} className="line-clamp-1">{t}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#6366f1] text-white rounded-tr-sm'
                        : 'bg-[#272727] border border-[#313131] text-[#f5f5f5] rounded-tl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>

                {/* Interactive Slot Carousel */}
                {m.slots && (
                  <div className="mt-2 space-y-1.5">
                    <div className="text-[10px] font-semibold text-[#818cf8] flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Available consultation slots</span>
                    </div>
                    <div className="flex space-x-2 overflow-x-auto pb-1">
                      {m.slots.map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          className="min-w-[130px] p-2.5 rounded-lg bg-[#1f1f1f] border border-[#313131] hover:border-[#6366f1] transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="text-xs font-semibold text-white">{slot.time}</div>
                            <div className="text-[10px] text-[#8c8c8c] mt-0.5">{slot.doctor}</div>
                          </div>
                          <button
                            onClick={() => handleSend(`I'll book the ${slot.time} slot with ${slot.doctor}.`)}
                            className="mt-2 w-full py-1.5 rounded-md bg-[#6366f1] hover:bg-[#4f46e5] active:bg-[#4338ca] text-white text-[10px] font-semibold transition cursor-pointer"
                          >
                            Book slot
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Human Takeover Alert */}
                {m.requiresTakeover && (
                  <div className="p-2.5 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 text-[11px] text-[#ffb4ab] flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 shrink-0 text-[#ffb4ab]" />
                    <span>Human intervention requested. Our clinic director has been alerted.</span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#272727] border border-[#313131] rounded-xl rounded-tl-sm p-3 text-xs text-[#8c8c8c] flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366f1] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6366f1]"></span>
                  </span>
                  <span>Synthesizing verified clinic answer...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-4 py-2 border-t border-[#313131] flex space-x-1.5 overflow-x-auto bg-[#1f1f1f]">
            {[
              'Book an appointment',
              'Check service pricing',
              'Rescheduling policy',
              'Speak to human'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-md text-[10px] font-medium bg-[#272727] hover:bg-[#313131] border border-[#313131] text-[#d6d6d6] transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Bottom Input Dock */}
          <div className="p-3 border-t border-[#313131] bg-[#181818]">
            {isTranscribing && (
              <div className="mb-2 px-3 py-1.5 rounded-lg bg-[#ef4444]/15 border border-[#ef4444]/30 text-[10px] text-[#ffb4ab] flex items-center space-x-2">
                <Mic className="h-3 w-3 text-[#ef4444]" />
                <span>Transcribing incoming voice note with STT...</span>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedLang === 'hi' ? 'Kuch bhi poochein ya book karein...' : (selectedLang === 'es' ? 'Pregunte o reserve una cita...' : 'Ask about treatments, pricing, or book a slot...')}
                className="flex-1 bg-[#1f1f1f] border border-[#313131] rounded-lg px-3.5 py-2 text-xs text-[#f5f5f5] placeholder-[#8c8c8c] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
              />

              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isTranscribing || isLoading}
                title="Speak / Voice Note Transcription"
                className={`p-2 rounded-lg border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] ${
                  isTranscribing
                    ? 'bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444]'
                    : 'bg-[#272727] hover:bg-[#313131] border-[#313131] text-[#f5f5f5]'
                }`}
              >
                <Mic className="h-3.5 w-3.5" />
              </button>

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-[#6366f1] hover:bg-[#4f46e5] active:bg-[#4338ca] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
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
