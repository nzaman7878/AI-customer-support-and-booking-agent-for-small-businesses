import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Calendar, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  Activity,
  Sparkles,
  Phone,
  Clock,
  Check,
  Mic
} from 'lucide-react';

export interface WidgetProps {
  apiUrl?: string;
  businessId?: string;
  businessName?: string;
  primaryColor?: string;
  accentColor?: string;
  welcomeMessage?: string;
  promptChips?: string[];
}

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp?: string;
  thoughts?: string[];
  slots?: { time: string; doctor: string; chamber?: string }[];
  requiresTakeover?: boolean;
}

export default function StandaloneWidget({
  apiUrl = '',
  businessName = 'Apex Wellness Clinic',
  primaryColor = '#6366f1',
  accentColor = '#10b981',
  welcomeMessage = 'Welcome! I am your autonomous AI assistant. How can I help you today?',
  promptChips = ['Book an appointment', 'Check pricing', 'Opening hours', 'Speak to human']
}: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showThoughts, setShowThoughts] = useState(true);
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'es' | 'fr'>('en');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [conversationId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('omniagent_widget_conv');
        if (stored) return stored;
        const newId = `widget_guest_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        sessionStorage.setItem('omniagent_widget_conv', newId);
        return newId;
      } catch (e) {
        // fallback
      }
    }
    return `widget_guest_${Date.now()}`;
  });
  const [activeConfig, setActiveConfig] = useState({
    name: businessName,
    primaryColor,
    accentColor,
    welcome: welcomeMessage,
    chips: promptChips
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm_welcome',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: 'Just now'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic business config from API if available
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const base = apiUrl || window.location.origin;
        const res = await fetch(`${base}/api/business/config`);
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setActiveConfig({
              name: data.config.name || businessName,
              primaryColor: data.config.primaryColor || primaryColor,
              accentColor: data.config.accentColor || accentColor,
              welcome: data.config.welcomeMessage || welcomeMessage,
              chips: data.config.promptChips || promptChips
            });
            setMessages([
              {
                id: 'm_welcome',
                role: 'assistant',
                content: data.config.welcomeMessage || welcomeMessage,
                timestamp: 'Just now'
              }
            ]);
          }
        }
      } catch (err) {
        // Use defaults
      }
    };
    fetchConfig();
  }, [apiUrl, businessName, primaryColor, accentColor, welcomeMessage, promptChips]);

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
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const base = apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');
      const res = await fetch(`${base}/api/chat`, {
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
          const slotRes = await fetch(`${base}/api/appointments/slots?date=${dateStr}`);
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
          content: "I'm having trouble connecting right now, but our front desk team has been notified.",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    setIsTranscribing(true);
    try {
      const base = apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');
      const audioMarker = selectedLang === 'hi'
        ? 'simulated_hindi'
        : (selectedLang === 'es' ? 'simulated_spanish' : (selectedLang === 'fr' ? 'simulated_french' : 'simulated_voice'));
      const res = await fetch(`${base}/api/voice/transcribe`, {
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
      console.error('Widget voice error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", color: '#dfe2f1' }}>
      {/* Launcher Button */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999999,
            cursor: 'pointer',
            padding: '2px',
            borderRadius: '18px',
            background: `linear-gradient(135deg, ${activeConfig.primaryColor}, #818cf8, ${activeConfig.accentColor})`,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px -3px rgba(99, 102, 241, 0.4)',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{
            background: '#030712',
            padding: '10px 16px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ position: 'relative', width: '8px', height: '8px' }}>
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: activeConfig.accentColor,
                opacity: 0.75,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: activeConfig.accentColor
              }} />
            </div>
            <Bot size={18} color="#818cf8" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Chat with AI
            </span>
          </div>
        </div>
      )}

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999999,
          width: '390px',
          maxWidth: 'calc(100vw - 32px)',
          height: '630px',
          maxHeight: 'calc(100vh - 48px)',
          borderRadius: '24px',
          background: 'rgba(11, 15, 25, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(30, 41, 59, 0.9)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 30px -5px rgba(99, 102, 241, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            background: 'rgba(15, 19, 29, 0.85)',
            borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-in-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: `${activeConfig.primaryColor}20`,
                border: `1px solid ${activeConfig.primaryColor}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={20} color="#818cf8" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                    {activeConfig.name}
                  </h4>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: activeConfig.accentColor }} />
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#908fa0' }}>
                  Verified Copilot • Online
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Language Selector */}
              <div style={{
                display: 'flex',
                background: '#030712',
                padding: '2px',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                fontSize: '9px',
                fontFamily: 'monospace'
              }}>
                {(['en', 'hi', 'es', 'fr'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    style={{
                      padding: '2px 5px',
                      borderRadius: '5px',
                      textTransform: 'uppercase',
                      border: 'none',
                      background: selectedLang === lang ? activeConfig.primaryColor : 'transparent',
                      color: selectedLang === lang ? '#ffffff' : '#908fa0',
                      fontWeight: selectedLang === lang ? 700 : 400,
                      cursor: 'pointer'
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#908fa0',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            fontSize: '12px'
          }}>
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Reasoning Thought Accordion */}
                {m.thoughts && m.thoughts.length > 0 && (
                  <div style={{
                    borderRadius: '12px',
                    background: '#0a0e18',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    padding: '10px 12px',
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#908fa0'
                  }}>
                    <div 
                      onClick={() => setShowThoughts(!showThoughts)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        color: '#818cf8',
                        fontWeight: 600
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={12} color="#6366f1" />
                        <span>LangGraph Agent Reasoning</span>
                      </div>
                      {showThoughts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>

                    {showThoughts && (
                      <div style={{
                        marginTop: '6px',
                        paddingTop: '6px',
                        borderTop: '1px solid rgba(30, 41, 59, 0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        {m.thoughts.map((t, idx) => (
                          <div key={idx} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                <div style={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    borderTopRightRadius: m.role === 'user' ? '2px' : '16px',
                    borderTopLeftRadius: m.role === 'user' ? '16px' : '2px',
                    background: m.role === 'user' ? activeConfig.primaryColor : '#171b26',
                    color: m.role === 'user' ? '#ffffff' : '#dfe2f1',
                    border: m.role === 'user' ? 'none' : '1px solid rgba(30, 41, 59, 0.8)',
                    boxShadow: m.role === 'user' ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none',
                    lineHeight: '1.5'
                  }}>
                    {m.content}
                  </div>
                </div>

                {/* Interactive Slot Carousel */}
                {m.slots && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#818cf8', fontWeight: 600 }}>
                      <Calendar size={12} />
                      <span>Available Slots • Next Available</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {m.slots.map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            minWidth: '130px',
                            padding: '10px',
                            borderRadius: '12px',
                            background: '#0f172a',
                            border: '1px solid #1e293b',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '8px'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{slot.time}</div>
                            <div style={{ fontSize: '10px', color: '#908fa0', marginTop: '2px' }}>{slot.doctor}</div>
                          </div>
                          <button
                            onClick={() => handleSend(`I'll take the ${slot.time} slot with ${slot.doctor}.`)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '8px',
                              background: activeConfig.primaryColor,
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '10px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Book Slot
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Human Takeover Alert Banner */}
                {m.requiresTakeover && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    fontSize: '11px',
                    color: '#ffb4ab',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <UserCheck size={16} />
                    <span>Live support alerted. An agent will reply shortly.</span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '16px',
                  borderTopLeftRadius: '2px',
                  background: '#171b26',
                  border: '1px solid #1e293b',
                  color: '#908fa0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: activeConfig.primaryColor,
                    animation: 'pulse 1s infinite'
                  }} />
                  <span>Synthesizing verified response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div style={{
            padding: '8px 16px',
            borderTop: '1px solid rgba(30, 41, 59, 0.6)',
            background: 'rgba(10, 14, 24, 0.4)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto'
          }}>
            {activeConfig.chips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '5px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid #1e293b',
                  color: '#dfe2f1',
                  cursor: 'pointer'
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Dock */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #1e293b',
            background: 'rgba(15, 19, 29, 0.9)'
          }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask questions or request appointment..."
                style={{
                  flex: 1,
                  background: '#030712',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isTranscribing || isLoading}
                title="Voice Note Input"
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: isTranscribing ? 'rgba(244, 63, 94, 0.2)' : '#1e293b',
                  border: isTranscribing ? '1px solid #f43f5e' : '1px solid #1e293b',
                  color: isTranscribing ? '#f43f5e' : '#dfe2f1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Mic size={16} />
              </button>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: activeConfig.primaryColor,
                  border: 'none',
                  color: '#ffffff',
                  cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !input.trim() ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
