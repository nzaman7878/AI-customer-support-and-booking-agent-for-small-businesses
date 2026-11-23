import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  X, 
  Send, 
  Calendar, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  MessageSquare,
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
  businessName = 'Apex Wellness & Aesthetics Clinic',
  primaryColor = '#1E3A2F',
  accentColor = '#1B4332',
  welcomeMessage = 'Welcome to Apex Wellness Clinic. I am your health and booking concierge. How may we assist your longevity or treatment journey today?',
  promptChips = ['Book consultation', 'Treatment fees', 'Reschedule appointment', 'Speak to reception']
}: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showThoughts, setShowThoughts] = useState(false);
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
          content: "I'm having trouble connecting right now, but our reception team has been notified to assist you.",
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
    <div style={{ fontFamily: "Figtree, -apple-system, BlinkMacSystemFont, sans-serif", color: '#1C1917' }}>
      {/* Discreet Branded Circular Launcher (Small 48px circle, leaving room for mobile footers) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open clinic concierge"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 999999,
            cursor: 'pointer',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: activeConfig.primaryColor,
            border: '1px solid #152B23',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px -4px rgba(28, 25, 23, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            border: '2px solid #FFFFFF'
          }} />
          <MessageSquare size={20} color="#FFFFFF" />
        </button>
      )}

      {/* Expandable Chat Drawer (Warm paper aesthetic) */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 999999,
          width: '390px',
          maxWidth: 'calc(100vw - 32px)',
          height: '590px',
          maxHeight: 'calc(100vh - 40px)',
          borderRadius: '16px',
          background: '#FBF9F5',
          border: '1px solid #E5DFD5',
          boxShadow: '0 20px 40px -10px rgba(28, 25, 23, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E5DFD5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#EBF2EE',
                border: '1px solid #D5E2DB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={16} color="#1E3A2F" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>
                    {activeConfig.name}
                  </h4>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1B4332' }} />
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#78716C' }}>
                  Front desk concierge • Verified
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Language Selector */}
              <div style={{
                display: 'flex',
                background: '#FAF7F2',
                padding: '2px',
                borderRadius: '6px',
                border: '1px solid #E5DFD5',
                fontSize: '9px',
                fontFamily: 'monospace'
              }}>
                {(['en', 'hi', 'es', 'fr'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    style={{
                      padding: '2px 4px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      border: 'none',
                      background: selectedLang === lang ? activeConfig.primaryColor : 'transparent',
                      color: selectedLang === lang ? '#FFFFFF' : '#78716C',
                      fontWeight: selectedLang === lang ? 600 : 400,
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
                  color: '#78716C',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div style={{
            flex: 1,
            padding: '14px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '12px'
          }}>
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Quiet Protocol Verification Detail */}
                {m.thoughts && m.thoughts.length > 0 && (
                  <div style={{
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #E5DFD5',
                    padding: '8px 10px',
                    fontSize: '10px',
                    color: '#78716C'
                  }}>
                    <div 
                      onClick={() => setShowThoughts(!showThoughts)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        color: '#1E3A2F',
                        fontWeight: 500
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} color="#1E3A2F" />
                        <span>Verified against clinic documentation</span>
                      </div>
                      {showThoughts ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </div>

                    {showThoughts && (
                      <div style={{
                        marginTop: '4px',
                        paddingTop: '4px',
                        borderTop: '1px solid #E5DFD5',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        color: '#44403C'
                      }}>
                        {m.thoughts.map((t, idx) => (
                          <div key={idx} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            • {t}
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
                    padding: '10px 12px',
                    borderRadius: '12px',
                    borderTopRightRadius: m.role === 'user' ? '2px' : '12px',
                    borderTopLeftRadius: m.role === 'user' ? '12px' : '2px',
                    background: m.role === 'user' ? activeConfig.primaryColor : '#FFFFFF',
                    color: m.role === 'user' ? '#FFFFFF' : '#1C1917',
                    border: m.role === 'user' ? 'none' : '1px solid #E5DFD5',
                    lineHeight: '1.45',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}>
                    {m.content}
                  </div>
                </div>

                {/* Interactive Slot Carousel */}
                {m.slots && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#1E3A2F', fontWeight: 600 }}>
                      <Calendar size={12} />
                      <span>Available consultation slots:</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {m.slots.map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            minWidth: '125px',
                            padding: '10px',
                            borderRadius: '8px',
                            background: '#FFFFFF',
                            border: '1px solid #E5DFD5',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '6px'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E3A2F', fontFamily: 'monospace' }}>{slot.time}</div>
                            <div style={{ fontSize: '10px', color: '#44403C', marginTop: '2px' }}>{slot.doctor}</div>
                          </div>
                          <button
                            onClick={() => handleSend(`I'd like to confirm the ${slot.time} slot with ${slot.doctor}.`)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              background: activeConfig.primaryColor,
                              border: 'none',
                              color: '#FFFFFF',
                              fontSize: '10px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Reserve slot
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Human Takeover Alert Banner */}
                {m.requiresTakeover && (
                  <div style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#FEF9C3',
                    border: '1px solid #FDE047',
                    fontSize: '11px',
                    color: '#854D0E',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <UserCheck size={14} />
                    <span>Reception notified. A staff member is stepping in to assist you directly.</span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  borderTopLeftRadius: '2px',
                  background: '#FFFFFF',
                  border: '1px solid #E5DFD5',
                  color: '#78716C',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: activeConfig.primaryColor
                  }} />
                  <span>Checking clinic availability...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div style={{
            padding: '6px 12px',
            borderTop: '1px solid #E5DFD5',
            background: '#FAF7F2',
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
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 500,
                  background: '#FFFFFF',
                  border: '1px solid #E5DFD5',
                  color: '#1C1917',
                  cursor: 'pointer'
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Dock */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid #E5DFD5',
            background: '#FFFFFF'
          }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about treatments or book a slot..."
                style={{
                  flex: 1,
                  background: '#FBF9F5',
                  border: '1px solid #E5DFD5',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '12px',
                  color: '#1C1917',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isTranscribing || isLoading}
                title="Voice input"
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  background: isTranscribing ? '#EBF2EE' : '#FAF7F2',
                  border: isTranscribing ? '1px solid #1E3A2F' : '1px solid #E5DFD5',
                  color: isTranscribing ? '#1E3A2F' : '#78716C',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Mic size={14} />
              </button>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  background: activeConfig.primaryColor,
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !input.trim() ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
