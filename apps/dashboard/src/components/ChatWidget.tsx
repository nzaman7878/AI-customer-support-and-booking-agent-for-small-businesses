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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: 'Welcome to Apex Wellness Clinic. I am your autonomous health concierge. How can I assist your longevity and recovery journey today?'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          conversationId: 'widget_session_1',
          channel: 'web'
        })
      });

      const data = await res.json();

      let slots: any[] | undefined = undefined;
      if (data.detectedIntent === 'booking_request' || data.detectedIntent === 'reschedule') {
        slots = [
          { time: '2:00 PM', doctor: 'Dr. Marcus Vance', chamber: 'Cryo Suite A' },
          { time: '3:30 PM', doctor: 'Dr. Marcus Vance', chamber: 'Cryo Suite B' },
          { time: '4:15 PM', doctor: 'Dr. Ananya Ray', chamber: 'Aesthetics 1' }
        ];
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
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#818cf8] to-[#10b981] p-[1.5px] shadow-2xl shadow-[#6366f1]/40 hover:scale-105 transition-all duration-300 cursor-pointer group"
        >
          <div className="bg-[#030712] px-3.5 py-2 rounded-[14px] flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]"></span>
            </span>
            <Bot className="h-4 w-4 text-[#818cf8] group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-semibold text-white tracking-tight">
              Apex AI Concierge
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] h-[620px] max-h-[85vh] rounded-3xl bg-[#0b0f19]/95 border border-[#1e293b] shadow-2xl shadow-black/80 flex flex-col backdrop-blur-2xl overflow-hidden font-sans">
          {/* Header */}
          <div className="p-4 bg-[#0f131d]/90 border-b border-[#1e293b] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center">
                <Bot className="h-5 w-5 text-[#818cf8]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-xs font-bold text-white tracking-tight">Apex Concierge AI</h4>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></span>
                </div>
                <p className="text-[10px] text-[#908fa0]">Online • Avg reply &lt;1s</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#908fa0] hover:text-white hover:bg-[#1e293b] transition"
            >
              <X className="h-4 w-4" />
            </button>
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
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#6366f1] text-white rounded-tr-xs shadow-md shadow-[#6366f1]/20'
                        : 'bg-[#171b26] border border-[#1e293b] text-[#dfe2f1] rounded-tl-xs'
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
                      <span>Available Consultation Slots • Friday, Oct 2</span>
                    </div>
                    <div className="flex space-x-2 overflow-x-auto pb-1">
                      {m.slots.map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          className="min-w-[130px] p-2.5 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-[#6366f1]/60 transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">{slot.time}</div>
                            <div className="text-[9px] text-[#908fa0] mt-0.5">{slot.doctor}</div>
                          </div>
                          <button
                            onClick={() => handleSend(`I'll book the ${slot.time} slot with ${slot.doctor}.`)}
                            className="mt-2 w-full py-1 rounded-lg bg-[#6366f1] hover:bg-[#818cf8] text-white text-[10px] font-semibold transition cursor-pointer"
                          >
                            Book Slot
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Human Takeover Alert */}
                {m.requiresTakeover && (
                  <div className="p-2.5 rounded-xl bg-[#f43f5e]/15 border border-[#f43f5e]/30 text-[11px] text-[#ffb4ab] flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 shrink-0 text-[#ffb4ab]" />
                    <span>Human intervention requested. Our clinic director has been alerted.</span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#171b26] border border-[#1e293b] rounded-2xl rounded-tl-xs p-3 text-xs text-[#908fa0] flex items-center space-x-2">
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
          <div className="px-4 py-2 border-t border-[#1e293b]/60 flex space-x-1.5 overflow-x-auto bg-[#0a0e18]/40">
            {[
              'Book an appointment',
              'Check service pricing',
              'Rescheduling policy',
              'Speak to human'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#1e293b]/80 hover:bg-[#6366f1]/20 hover:border-[#6366f1]/50 border border-[#1e293b] text-[#dfe2f1] transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Bottom Input Dock */}
          <div className="p-3 border-t border-[#1e293b] bg-[#0f131d]/90">
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
                placeholder="Ask about treatments, pricing, or book a slot..."
                className="flex-1 bg-[#030712] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#908fa0] focus:outline-none focus:border-[#6366f1]"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-[#6366f1] hover:bg-[#818cf8] disabled:opacity-40 text-white rounded-xl transition cursor-pointer"
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
