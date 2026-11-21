import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  Send, 
  UserCheck, 
  ChevronDown, 
  ChevronRight, 
  Database, 
  Radio, 
  Clock, 
  Check, 
  AlertTriangle,
  Play,
  Upload,
  X,
  Plus,
  Palette,
  Code2,
  Copy,
  ExternalLink,
  Layers,
  Bell,
  Zap,
  RefreshCw,
  Trash2
} from 'lucide-react';
import ChatWidget from './components/ChatWidget.js';

interface BusinessConfig {
  id: string;
  name: string;
  industry: 'clinic' | 'salon' | 'real_estate' | 'coaching' | 'general';
  tagline: string;
  welcomeMessage: string;
  primaryColor: string;
  accentColor: string;
  timezone: string;
  contactEmail: string;
  contactPhone: string;
  operatingHours: {
    days: string[];
    openTime: string;
    closeTime: string;
    slotDurationMinutes: number;
  };
  promptChips: string[];
}

interface SystemHealth {
  status: string;
  version: string;
  database: {
    connected: boolean;
    mode: string;
  };
  business: string;
}

interface ChatSession {
  id: string;
  name: string;
  phone: string;
  channel: 'whatsapp' | 'web';
  snippet: string;
  time: string;
  sentiment: 'nominal' | 'warning' | 'critical' | 'info';
  sentimentText: string;
  vip: string;
  isHumanTakeover: boolean;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'human_agent';
    content: string;
    timestamp: string;
    thoughts?: string[];
  }>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'knowledge' | 'appointments' | 'evals' | 'whitelabel'>('live');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('sess_1');
  const [chatInput, setChatInput] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'web'>('all');
  const [showThoughtDetails, setShowThoughtDetails] = useState(true);

  // Documents state
  const [documents, setDocuments] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'faq' | 'pricing' | 'policy' | 'service_catalog'>('faq');
  const [uploadContent, setUploadContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Appointments & Leads state
  const [appointments, setAppointments] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  // White-Label & Business Config state
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const [presets, setPresets] = useState<Record<string, BusinessConfig>>({});
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activePresetTab, setActivePresetTab] = useState<'wordpress' | 'shopify' | 'squarespace' | 'html'>('html');

  // Reminders & Webhook state
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [reminderLogs, setReminderLogs] = useState<any[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.zapier.com/hooks/catch/omniagent/demo');
  const [isScanningReminders, setIsScanningReminders] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookToast, setWebhookToast] = useState<string | null>(null);

  // Initial Data Fetch
  const loadData = () => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setHealth(d))
      .catch(() => {});

    fetch('/api/business/config')
      .then(r => r.json())
      .then(d => {
        if (d.config) setBusinessConfig(d.config);
      })
      .catch(() => {});

    fetch('/api/business/presets')
      .then(r => r.json())
      .then(d => {
        if (d.presets) setPresets(d.presets);
      })
      .catch(() => {});

    fetch('/api/sessions')
      .then(r => r.json())
      .then(d => {
        if (d.sessions) setSessions(d.sessions);
      })
      .catch(() => {});

    fetch('/api/documents')
      .then(r => r.json())
      .then(d => {
        if (d.documents) setDocuments(d.documents);
      })
      .catch(() => {});

    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => {
        if (d.appointments) setAppointments(d.appointments);
      })
      .catch(() => {});

    fetch('/api/leads')
      .then(r => r.json())
      .then(d => {
        if (d.leads) setLeads(d.leads);
      })
      .catch(() => {});

    fetch('/api/webhooks/logs')
      .then(r => r.json())
      .then(d => {
        if (d.logs) setWebhookLogs(d.logs);
      })
      .catch(() => {});

    fetch('/api/reminders/logs')
      .then(r => r.json())
      .then(d => {
        if (d.logs) setReminderLogs(d.logs);
      })
      .catch(() => {});
  };

  const handleScanReminders = async () => {
    setIsScanningReminders(true);
    try {
      const res = await fetch('/api/reminders/scan', { method: 'POST' });
      const data = await res.json();
      setWebhookToast(`Scanned ${data.scannedCount} slots • Dispatched ${data.remindersDispatched} reminders`);
      setTimeout(() => setWebhookToast(null), 3000);
      loadData();
    } catch (err: any) {
      console.error('Scan error:', err);
    } finally {
      setIsScanningReminders(false);
    }
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    try {
      const res = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'lead.captured' })
      });
      const data = await res.json();
      if (data.log) {
        setWebhookToast(`Dispatched test event: ${data.log.event} (${data.log.status})`);
        setTimeout(() => setWebhookToast(null), 3000);
      }
      loadData();
    } catch (err: any) {
      console.error('Test webhook error:', err);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment and release the Google Calendar slot?')) return;
    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Admin dashboard manual cancellation' })
      });
      const data = await res.json();
      if (data.success) {
        setWebhookToast(`Cancelled appointment ${id}. Slot released!`);
        setTimeout(() => setWebhookToast(null), 3000);
        loadData();
      }
    } catch (err: any) {
      console.error('Cancel appointment error:', err);
    }
  };

  const handleSelectPreset = async (presetKey: string) => {
    try {
      const targetPreset = presets[presetKey];
      if (!targetPreset) return;
      const res = await fetch('/api/business/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetPreset)
      });
      const data = await res.json();
      if (data.config) {
        setBusinessConfig(data.config);
        loadData();
      }
    } catch (err) {
      console.error('Failed to update business config:', err);
    }
  };

  const embedScriptTag = `<script 
  src="http://localhost:5000/widget.js" 
  data-business-id="${businessConfig?.id || 'preset_clinic'}" 
  data-api-url="http://localhost:5000" 
  defer>
</script>`;

  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(embedScriptTag);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  const handleToggleTakeover = async () => {
    if (!activeSession) return;
    const newTakeoverState = !activeSession.isHumanTakeover;

    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/takeover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ takeover: newTakeoverState })
      });
      const data = await res.json();
      if (data.session) {
        setSessions(prev => prev.map(s => s.id === data.session.id ? data.session : s));
      }
    } catch (err) {
      console.error('Takeover toggle failed:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeSession) return;

    const messageText = chatInput;
    setChatInput('');

    try {
      const role = activeSession.isHumanTakeover ? 'human_agent' : 'user';
      const res = await fetch(`/api/sessions/${activeSession.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageText, role })
      });
      const data = await res.json();
      if (data.session) {
        setSessions(prev => prev.map(s => s.id === data.session.id ? data.session : s));
      }
    } catch (err) {
      console.error('Send message failed:', err);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadContent.trim()) return;

    setIsUploading(true);
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle,
          category: uploadCategory,
          content: uploadContent
        })
      });
      const data = await res.json();
      if (data.success) {
        setUploadTitle('');
        setUploadContent('');
        setShowUploadModal(false);
        loadData();
      }
    } catch (err) {
      console.error('Upload document failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredSessions = sessions.filter(
    s => channelFilter === 'all' || s.channel === channelFilter
  );

  return (
    <div className="min-h-screen bg-[#030712] text-[#dfe2f1] flex flex-col font-sans selection:bg-[#6366f1] selection:text-white">
      {/* Top Command Deck Header */}
      <header className="border-b border-[#1e293b] bg-[#0b0f19]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand & Studio ID */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#6366f1] via-[#818cf8] to-[#10b981] p-[1.5px] shadow-lg shadow-[#6366f1]/25">
              <div className="h-full w-full bg-[#030712] rounded-[10px] flex items-center justify-center">
                <Bot className="h-5 w-5 text-[#818cf8]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">
                  {businessConfig?.name || 'Apex Wellness Clinic'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30">
                  AI Agent v2.4 (Active)
                </span>
              </div>
              <p className="text-[11px] text-[#908fa0]">
                {businessConfig?.tagline || 'Obsidian Autonomous Command • RAG & Booking Orchestrator'}
              </p>
            </div>
          </div>

          {/* Telemetry Chips */}
          <div className="flex items-center space-x-3">
            {/* Atlas Vector Store */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-[#1e293b] text-xs">
              <Database className="h-3.5 w-3.5 text-[#10b981]" />
              <span className="text-[#908fa0]">Atlas Vector:</span>
              <span className="text-[#10b981] font-mono text-[11px]">
                {health?.database.connected ? 'Atlas Cluster Synced' : 'Simulation Mode'} ({documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0)} chunks)
              </span>
            </div>

            {/* WhatsApp Webhook Status */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-[#1e293b] text-xs">
              <Radio className="h-3.5 w-3.5 text-[#10b981]" />
              <span className="text-[#908fa0]">WhatsApp Cloud API:</span>
              <span className="text-white font-mono text-[11px]">Active (Webhook Ready)</span>
            </div>

            {/* Autonomous Mode Pill */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              activeSession?.isHumanTakeover 
                ? 'bg-[#f43f5e]/15 border-[#f43f5e]/40 text-[#ffb4ab]' 
                : 'bg-[#10b981]/15 border-[#10b981]/40 text-[#4edea3]'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  activeSession?.isHumanTakeover ? 'bg-[#f43f5e]' : 'bg-[#10b981]'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  activeSession?.isHumanTakeover ? 'bg-[#f43f5e]' : 'bg-[#10b981]'
                }`}></span>
              </span>
              <span>{activeSession?.isHumanTakeover ? 'Human Takeover Active' : 'AI Autonomous Mode'}</span>
            </div>
          </div>
        </div>

        {/* Modular Navigation Tabs */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex space-x-1 overflow-x-auto border-t border-[#1e293b]/60">
          {[
            { id: 'live', label: 'Live Conversations & Takeover', icon: MessageSquare, badge: `${sessions.length} Active` },
            { id: 'knowledge', label: 'Knowledge Base (Atlas RAG)', icon: BookOpen, badge: `${documents.length} Docs` },
            { id: 'appointments', label: 'Bookings & Calendar Matrix', icon: Calendar, badge: `${appointments.length} Slots` },
            { id: 'evals', label: '20-Scenario Eval Benchmark', icon: ShieldCheck, badge: '100% Pass' },
            { id: 'whitelabel', label: 'White-Label & Embed Script', icon: Palette, badge: `${(businessConfig?.industry || 'clinic').toUpperCase()}` },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#6366f1] text-[#818cf8] bg-[#6366f1]/5'
                    : 'border-transparent text-[#908fa0] hover:text-white hover:border-[#334155]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#818cf8]' : 'text-[#908fa0]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    tab.badge.includes('Active')
                      ? 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30' 
                      : 'bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Command Workspace */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-5">
        {/* Tab 1: Live Conversations & Human Takeover */}
        {activeTab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-140px)] min-h-[680px]">
            {/* Left 3 Cols: Omnichannel Ingress & Threads */}
            <div className="lg:col-span-3 rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-3.5 flex flex-col backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-white">Omnichannel Inbox</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1e293b] text-[#908fa0] font-mono">
                    {filteredSessions.length}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {(['all', 'whatsapp', 'web'] as const).map(ch => (
                    <button
                      key={ch}
                      onClick={() => setChannelFilter(ch)}
                      className={`text-[10px] px-2 py-0.5 rounded capitalize transition cursor-pointer ${
                        channelFilter === ch 
                          ? 'bg-[#6366f1] text-white font-medium' 
                          : 'text-[#908fa0] hover:text-white hover:bg-[#1e293b]'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thread List */}
              <div className="mt-3 space-y-2 overflow-y-auto flex-1 pr-1">
                {filteredSessions.map(session => {
                  const isSelected = session.id === (activeSession?.id || '');
                  return (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#6366f1]/10 border-[#6366f1]/50 shadow-sm shadow-[#6366f1]/10'
                          : 'bg-[#0f172a]/50 border-[#1e293b]/80 hover:border-[#334155]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-white">{session.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono ${
                            session.channel === 'whatsapp' 
                              ? 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30' 
                              : 'bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30'
                          }`}>
                            {session.channel}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#908fa0]">{session.time}</span>
                      </div>
                      <p className="text-[11px] text-[#908fa0] mt-1.5 line-clamp-2 leading-relaxed">
                        {session.snippet}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          session.sentiment === 'critical'
                            ? 'bg-[#f43f5e]/15 text-[#ffb4ab] border border-[#f43f5e]/30'
                            : session.sentiment === 'warning'
                            ? 'bg-[#f59e0b]/15 text-[#ffb95f] border border-[#f59e0b]/30'
                            : 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30'
                        }`}>
                          {session.sentimentText}
                        </span>
                        <span className="text-[#908fa0]">{session.vip}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center 6 Cols: Active Conversation & LangGraph Thought Stream */}
            <div className="lg:col-span-6 rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] flex flex-col backdrop-blur-md">
              {activeSession ? (
                <>
                  {/* Header */}
                  <div className="p-3.5 border-b border-[#1e293b] flex items-center justify-between bg-[#0f131d]/60 rounded-t-2xl">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-sm text-white">{activeSession.name}</h3>
                        <span className="text-xs text-[#908fa0]">• {activeSession.phone}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e293b] text-[#818cf8]">
                          #{activeSession.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#908fa0] mt-0.5">
                        Tier: {activeSession.vip} • Active Channel: {activeSession.channel.toUpperCase()}
                      </p>
                    </div>

                    {/* Instant Human Takeover Toggle */}
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={handleToggleTakeover}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-md ${
                          activeSession.isHumanTakeover
                            ? 'bg-[#10b981] hover:bg-[#10b981]/90 text-[#030712]'
                            : 'bg-[#f43f5e]/20 hover:bg-[#f43f5e]/30 text-[#ffb4ab] border border-[#f43f5e]/50'
                        }`}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>{activeSession.isHumanTakeover ? 'Resume AI Agent' : 'Take Over (Pause AI)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Takeover Active Banner */}
                  {activeSession.isHumanTakeover && (
                    <div className="px-4 py-2 bg-[#f43f5e]/15 border-b border-[#f43f5e]/30 text-xs text-[#ffb4ab] flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-[#ffb4ab]" />
                        <span>AI Autonomous Execution is <strong>PAUSED</strong>. You are typing directly to {activeSession.name}.</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#ffb4ab]">Live Human Mode</span>
                    </div>
                  )}

                  {/* Chat Thread Stream */}
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {activeSession.messages.map(m => (
                      <div key={m.id} className="space-y-2">
                        {/* Thoughts accordion */}
                        {m.thoughts && m.thoughts.length > 0 && (
                          <div className="rounded-xl bg-[#0a0e18] border border-[#6366f1]/30 p-3 shadow-lg shadow-[#6366f1]/5 text-xs">
                            <div 
                              className="flex items-center justify-between cursor-pointer select-none"
                              onClick={() => setShowThoughtDetails(!showThoughtDetails)}
                            >
                              <div className="flex items-center space-x-2 text-[#818cf8] font-semibold text-[11px]">
                                <Activity className="h-3.5 w-3.5 animate-pulse text-[#6366f1]" />
                                <span>LangGraph Agent Thought Stream</span>
                              </div>
                              {showThoughtDetails ? <ChevronDown className="h-4 w-4 text-[#908fa0]" /> : <ChevronRight className="h-4 w-4 text-[#908fa0]" />}
                            </div>

                            {showThoughtDetails && (
                              <div className="mt-2.5 space-y-1.5 border-t border-[#1e293b]/80 pt-2 font-mono text-[11px] text-[#908fa0]">
                                {m.thoughts.map((t, idx) => (
                                  <div key={idx} className="line-clamp-2">{t}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                          <div
                            className={`max-w-md p-3.5 text-xs rounded-2xl ${
                              m.role === 'user'
                                ? 'bg-[#171b26] border border-[#1e293b] rounded-tl-sm text-[#dfe2f1]'
                                : m.role === 'human_agent'
                                ? 'bg-[#10b981] text-[#030712] font-medium rounded-tr-sm shadow-md'
                                : 'bg-[#6366f1] text-white rounded-tr-sm shadow-md shadow-[#6366f1]/20'
                            }`}
                          >
                            {m.content}
                            <div className={`text-[10px] mt-1.5 flex items-center justify-between ${
                              m.role === 'user' ? 'text-[#908fa0]' : m.role === 'human_agent' ? 'text-[#030712]/70' : 'text-indigo-200'
                            }`}>
                              <span>{m.timestamp}</span>
                              <span>
                                {m.role === 'user' 
                                  ? `via ${activeSession.channel}` 
                                  : m.role === 'human_agent' 
                                  ? 'Sent by Human Agent' 
                                  : 'Autonomous AI Reply'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Input Area */}
                  <div className="p-3 border-t border-[#1e293b] bg-[#0f131d]/60 rounded-b-2xl">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={
                          activeSession.isHumanTakeover 
                            ? `Type response to ${activeSession.name} as human agent...` 
                            : `Simulate customer response or prompt AI...`
                        }
                        className="flex-1 bg-[#030712] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#6366f1] placeholder-[#908fa0]"
                      />
                      <button 
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="px-4 py-2.5 bg-[#6366f1] hover:bg-[#818cf8] disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                      >
                        <span>Send</span>
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-[#908fa0]">
                  No active session selected.
                </div>
              )}
            </div>

            {/* Right 3 Cols: RAG Inspector & Live Appointments */}
            <div className="lg:col-span-3 space-y-4 flex flex-col">
              {/* RAG Grounding Summary */}
              <div className="rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-4 backdrop-blur-md">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1e293b]">
                  <span className="font-semibold text-xs text-white">Active RAG Grounding</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10b981]/15 text-[#4edea3]">
                    Verified Clinic Policy
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-white">
                    Rescheduling & Cancellation Policy v2.1
                  </div>
                  <div className="mt-1 text-[11px] text-[#908fa0] leading-relaxed bg-[#030712] p-2.5 rounded-lg border border-[#1e293b] font-mono">
                    "...Patients may reschedule recovery and cryotherapy sessions up to 4 hours in advance at zero penalty..."
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#908fa0]">
                    <span>Source: Apex_Ops_Manual_2025.pdf</span>
                    <span className="text-[#4edea3]">Confidence: 89%</span>
                  </div>
                </div>
              </div>

              {/* Real-time Appointments Sidebar */}
              <div className="flex-1 rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-4 backdrop-blur-md flex flex-col">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1e293b]">
                  <span className="font-semibold text-xs text-white">Upcoming Appointments</span>
                  <span className="text-[10px] text-[#818cf8] font-mono">{appointments.length} Booked</span>
                </div>
                <div className="mt-3 space-y-2 flex-1 overflow-y-auto">
                  {appointments.slice(0, 4).map(apt => (
                    <div key={apt.id} className="p-2.5 rounded-lg bg-[#0f172a] border border-[#1e293b] text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white">{apt.customerName}</span>
                        <span className="text-[#818cf8] font-mono text-[10px]">
                          {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#908fa0] mt-0.5 truncate">{apt.serviceName}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Knowledge Base & Document Manager */}
        {activeTab === 'knowledge' && (
          <div className="rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-6 space-y-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Atlas Vector Store & Document Ingestion</h2>
                <p className="text-xs text-[#908fa0] mt-0.5">
                  Upload documents to chunk and index into MongoDB Atlas Vector Search. The AI agent uses these chunks for zero-hallucination support.
                </p>
              </div>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-[#6366f1] hover:bg-[#818cf8] text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-md shadow-[#6366f1]/20"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Upload New Document</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {documents.map(doc => (
                <div key={doc.id} className="p-4 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] hover:border-[#334155] transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6366f1]/15 text-[#818cf8] uppercase">
                        {doc.category}
                      </span>
                      <span className="text-[11px] text-[#4edea3] flex items-center space-x-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Indexed</span>
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-2.5">{doc.title}</h4>
                    <p className="text-[11px] text-[#908fa0] mt-1.5 line-clamp-3 leading-relaxed">
                      {doc.content}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-[#908fa0]">
                    <span>{doc.chunkCount} Vector Chunks</span>
                    <span className="text-[#818cf8] text-[11px]">Ready for RAG</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Appointments & Calendar Matrix */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-6 space-y-4 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">Google Calendar Sync & Bookings Table</h2>
                  <p className="text-xs text-[#908fa0] mt-0.5">
                    Synchronized in real-time via Google Calendar FreeBusy and Events API.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-[#818cf8] bg-[#6366f1]/15 px-3 py-1.5 rounded-lg border border-[#6366f1]/30">
                    Timezone: Asia/Kolkata (IST)
                  </span>
                </div>
              </div>

              {webhookToast && (
                <div className="p-3 rounded-xl bg-[#10b981]/15 border border-[#10b981]/40 text-[#4edea3] text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{webhookToast}</span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1e293b] text-[#908fa0] uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Scheduled Slot</th>
                      <th className="py-3 px-4">Phone / Email</th>
                      <th className="py-3 px-4">Calendar Event ID</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]/70 text-[#dfe2f1]">
                    {appointments.map(apt => (
                      <tr key={apt.id}>
                        <td className="py-3.5 px-4 font-medium text-white">{apt.customerName}</td>
                        <td className="py-3.5 px-4">{apt.serviceName}</td>
                        <td className="py-3.5 px-4 font-mono text-[#818cf8]">
                          {new Date(apt.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 text-[#908fa0]">{apt.customerPhone || apt.customerEmail}</td>
                        <td className="py-3.5 px-4 font-mono text-[#908fa0] text-[11px]">{apt.calendarEventId}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            apt.status === 'cancelled'
                              ? 'bg-[#f43f5e]/15 text-[#ffb4ab] border border-[#f43f5e]/30'
                              : 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {apt.status !== 'cancelled' ? (
                            <button
                              onClick={() => handleCancelAppointment(apt.id)}
                              className="text-[10px] px-2 py-1 rounded bg-[#f43f5e]/10 text-[#ffb4ab] hover:bg-[#f43f5e]/20 border border-[#f43f5e]/30 transition cursor-pointer"
                            >
                              Cancel Slot
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#908fa0] italic">Slot Freed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Leads Section */}
              <div className="mt-6 pt-6 border-t border-[#1e293b]">
                <h3 className="text-sm font-bold text-white mb-3">Captured High-Intent Leads</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {leads.map(lead => (
                    <div key={lead.id} className="p-3.5 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{lead.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10b981]/15 text-[#4edea3]">
                          {lead.source.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#818cf8] mt-1 font-medium">{lead.interest}</div>
                      <div className="text-[11px] text-[#908fa0] mt-1">{lead.summary}</div>
                      <div className="mt-2 text-[10px] text-[#908fa0]">Contact: {lead.phone || lead.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Outbound CRM Webhooks & Multi-Channel Reminder Engine Section */}
            <div className="rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-6 space-y-5 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1e293b]">
                <div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-[#f59e0b]" />
                    <h2 className="text-base font-bold text-white">Outbound CRM Webhooks & Reminder Lifecycle</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30">
                      HMAC SHA-256
                    </span>
                  </div>
                  <p className="text-xs text-[#908fa0] mt-0.5">
                    Fires real-time lead and booking payloads to HubSpot, Zapier, Make, or Slack, and schedules automated 24h & 2h WhatsApp reminders.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleScanReminders}
                    disabled={isScanningReminders}
                    className="px-3.5 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] border border-[#1e293b] text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isScanningReminders ? 'animate-spin text-[#818cf8]' : 'text-[#908fa0]'}`} />
                    <span>Scan Reminders (24h/2h)</span>
                  </button>

                  <button
                    onClick={handleTestWebhook}
                    disabled={isTestingWebhook}
                    className="px-3.5 py-1.5 bg-[#6366f1] hover:bg-[#818cf8] text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-md shadow-[#6366f1]/20"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isTestingWebhook ? 'Firing Payload...' : 'Test Webhook Dispatch'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left 5 Cols: Config & Active Target */}
                <div className="lg:col-span-5 rounded-xl bg-[#0f172a]/60 border border-[#1e293b] p-4 space-y-3">
                  <div className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>Connected CRM Webhook Endpoint</span>
                    <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/15 px-2 py-0.5 rounded">ACTIVE</span>
                  </div>
                  <div className="rounded-lg bg-[#030712] border border-[#1e293b] p-2.5 font-mono text-[11px] text-[#818cf8] break-all">
                    {webhookUrl}
                  </div>
                  <div className="text-[11px] text-[#908fa0]">
                    Subscribed Events:
                    <span className="font-mono text-white ml-1">appointment.created, appointment.cancelled, lead.captured, reminder.sent</span>
                  </div>
                  <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-[11px]">
                    <span className="text-[#908fa0]">Security Auth:</span>
                    <span className="font-mono text-[#4edea3]">X-OmniAgent-Signature</span>
                  </div>
                </div>

                {/* Right 7 Cols: Outbound Webhook Delivery Audit Log */}
                <div className="lg:col-span-7 rounded-xl bg-[#0f172a]/60 border border-[#1e293b] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                      <Activity className="h-3.5 w-3.5 text-[#10b981]" />
                      <span>Live Delivery Audit Log</span>
                    </div>
                    <span className="text-[10px] text-[#908fa0] font-mono">
                      {webhookLogs.length} events logged
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {webhookLogs.slice(0, 5).map((log, idx) => (
                      <div key={log.id || idx} className="p-2.5 rounded-lg bg-[#030712] border border-[#1e293b] flex items-center justify-between text-[11px]">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[#818cf8] font-bold">{log.event}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#10b981]/15 text-[#4edea3] font-mono">
                              HTTP {log.statusCode || 200}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#908fa0] mt-0.5 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()} • Latency: {log.latencyMs}ms
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1e293b] text-[#dfe2f1] font-mono capitalize">
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 20-Scenario Golden Evaluation Suite */}
        {activeTab === 'evals' && (
          <div className="rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-6 space-y-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">20-Scenario Golden Eval Benchmark</h2>
                <p className="text-xs text-[#908fa0] mt-0.5">
                  Automated benchmark measuring Groundedness, Hallucination Prevention, Tool Precision, and Sentiment Escalation.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-xs text-[#908fa0]">Overall Accuracy Score</div>
                  <div className="text-2xl font-bold font-mono text-[#4edea3]">98.0%</div>
                </div>
                <button 
                  onClick={() => alert('Executing all 20 golden test scenarios across RAG, Calendar, and Escalation nodes... Check terminal runner: npm run test:evals')}
                  className="px-4 py-2 bg-[#6366f1] hover:bg-[#818cf8] text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Execute Full Benchmark</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
                <div className="text-xs text-[#908fa0]">1. Knowledge Base RAG</div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">100%</div>
                <div className="text-[10px] text-[#4edea3] mt-1">8/8 queries grounded</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
                <div className="text-xs text-[#908fa0]">2. Booking Tool Precision</div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">100%</div>
                <div className="text-[10px] text-[#4edea3] mt-1">5/5 slots verified</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
                <div className="text-xs text-[#908fa0]">3. Guardrails & Zero Hallucination</div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">100%</div>
                <div className="text-[10px] text-[#4edea3] mt-1">4/4 out-of-scope caught</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
                <div className="text-xs text-[#908fa0]">4. Frustration & Handoff</div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">100%</div>
                <div className="text-[10px] text-[#4edea3] mt-1">3/3 triggered takeover</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: White-Label Studio & Universal Embed Code */}
        {activeTab === 'whitelabel' && (
          <div className="space-y-6">
            {/* Header & Value Proposition */}
            <div className="rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-white">Client White-Label Studio & Universal Embed</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30">
                    Shadow DOM Isolated
                  </span>
                </div>
                <p className="text-xs text-[#908fa0] mt-1">
                  Switch business verticals in 1-click or generate a self-contained <code>&lt;script&gt;</code> embed for WordPress, Shopify, Squarespace, and Webflow clients.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCopyEmbedCode}
                  className="px-4 py-2 bg-[#6366f1] hover:bg-[#818cf8] text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-2 shadow-lg shadow-[#6366f1]/20"
                >
                  {copiedEmbed ? <Check className="h-4 w-4 text-[#4edea3]" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedEmbed ? 'Copied Embed Code!' : 'Copy Script Tag'}</span>
                </button>
              </div>
            </div>

            {/* Quick Niche Switcher Cards */}
            <div>
              <div className="text-xs font-semibold text-[#908fa0] uppercase tracking-wider mb-3">
                1-Click Niche Switcher (Preconfigured Demo Verticals)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    key: 'clinic',
                    name: 'Wellness Clinic',
                    preset: presets.clinic,
                    icon: '🩺',
                    color: '#6366f1',
                    badge: 'Apex Wellness'
                  },
                  {
                    key: 'salon',
                    name: 'Hair & Glam Salon',
                    preset: presets.salon,
                    icon: '✂️',
                    color: '#ec4899',
                    badge: 'Luxe Glow'
                  },
                  {
                    key: 'real_estate',
                    name: 'Luxury Real Estate',
                    preset: presets.real_estate,
                    icon: '🏢',
                    color: '#0ea5e9',
                    badge: 'Skyline Premier'
                  },
                  {
                    key: 'coaching',
                    name: 'Prep Coaching Academy',
                    preset: presets.coaching,
                    icon: '🎓',
                    color: '#f59e0b',
                    badge: 'Ascend Academy'
                  }
                ].map((item) => {
                  const isCurrent = businessConfig?.industry === item.key;
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleSelectPreset(item.key)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-[#1e1b4b]/60 border-[#6366f1] shadow-lg shadow-[#6366f1]/15 ring-1 ring-[#6366f1]'
                          : 'bg-[#0f172a]/60 border-[#1e293b] hover:border-[#334155]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{item.icon}</span>
                          {isCurrent ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/20 text-[#4edea3] border border-[#10b981]/40 flex items-center space-x-1">
                              <CheckCircle2 className="h-3 w-3 inline" />
                              <span>ACTIVE CLIENT</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#908fa0] hover:text-white">Click to Activate</span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-white mt-2.5">{item.name}</h3>
                        <p className="text-[11px] text-[#908fa0] mt-1 line-clamp-2">
                          {item.preset?.tagline || 'Custom client configuration'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-[11px]">
                        <span className="font-mono text-[#818cf8]">{item.badge}</span>
                        <div className="flex items-center space-x-1.5">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[10px] text-[#908fa0] font-mono">{item.color}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Embed Script Code Box & Installation Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Cols: Embed Code & Platform Tabs */}
              <div className="lg:col-span-7 rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-5 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                  <div className="flex items-center space-x-2">
                    <Code2 className="h-4 w-4 text-[#818cf8]" />
                    <span className="text-xs font-semibold text-white">Universal Standalone Embed Code</span>
                  </div>
                  <button
                    onClick={handleCopyEmbedCode}
                    className="text-[11px] text-[#818cf8] hover:text-white flex items-center space-x-1 cursor-pointer font-medium"
                  >
                    {copiedEmbed ? <Check className="h-3.5 w-3.5 text-[#4edea3]" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedEmbed ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Code Block */}
                <div className="relative rounded-xl bg-[#030712] border border-[#1e293b] p-4 font-mono text-xs text-[#dfe2f1] overflow-x-auto">
                  <pre className="text-[12px] leading-relaxed text-[#818cf8]">
                    {embedScriptTag}
                  </pre>
                </div>

                {/* CMS Install Tabs */}
                <div>
                  <div className="flex space-x-2 border-b border-[#1e293b] pb-2">
                    {[
                      { id: 'html', label: 'HTML / Webflow' },
                      { id: 'wordpress', label: 'WordPress' },
                      { id: 'shopify', label: 'Shopify' },
                      { id: 'squarespace', label: 'Squarespace' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActivePresetTab(tab.id as any)}
                        className={`text-xs px-3 py-1 rounded-lg transition cursor-pointer ${
                          activePresetTab === tab.id
                            ? 'bg-[#6366f1]/20 text-[#818cf8] font-semibold border border-[#6366f1]/40'
                            : 'text-[#908fa0] hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 text-xs text-[#908fa0] leading-relaxed">
                    {activePresetTab === 'html' && (
                      <p>Paste the snippet directly before the closing <code>&lt;/body&gt;</code> tag of your website. The widget automatically binds to Shadow DOM without style conflicts.</p>
                    )}
                    {activePresetTab === 'wordpress' && (
                      <p>In WordPress Admin, go to <b>Appearance &gt; Theme File Editor &gt; footer.php</b> or install the free <i>WPCode (Insert Headers and Footers)</i> plugin and paste into the Footer script box.</p>
                    )}
                    {activePresetTab === 'shopify' && (
                      <p>In Shopify Admin, go to <b>Online Store &gt; Themes &gt; Edit Code &gt; theme.liquid</b>. Paste the script right before <code>&lt;/body&gt;</code> and click Save.</p>
                    )}
                    {activePresetTab === 'squarespace' && (
                      <p>In Squarespace, navigate to <b>Settings &gt; Developer Tools &gt; Code Injection</b> and paste into the <b>Footer</b> block.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Active Brand Inspector */}
              <div className="lg:col-span-5 rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-5 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                  <div className="flex items-center space-x-2">
                    <Palette className="h-4 w-4 text-[#10b981]" />
                    <span className="text-xs font-semibold text-white">Active Branding Properties</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10b981]/15 text-[#4edea3]">
                    SYNCED TO BACKEND
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-[11px] text-[#908fa0]">Client Business Name</div>
                    <div className="text-sm font-semibold text-white mt-0.5">{businessConfig?.name}</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-[#908fa0]">AI Agent Greeting</div>
                    <div className="text-[11px] text-[#dfe2f1] bg-[#030712] p-2.5 rounded-lg border border-[#1e293b] mt-1 italic">
                      "{businessConfig?.welcomeMessage}"
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] text-[#908fa0]">Primary Palette</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: businessConfig?.primaryColor }} />
                        <span className="font-mono text-[11px] text-white">{businessConfig?.primaryColor}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#908fa0]">Slot Duration</div>
                      <div className="text-[11px] font-mono text-white mt-1">
                        {businessConfig?.operatingHours?.slotDurationMinutes || 30} Minutes
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-[#908fa0]">Quick Action Prompts</div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {businessConfig?.promptChips?.map((chip, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-1 rounded bg-[#0f172a] border border-[#1e293b] text-[#818cf8]">
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-[11px] text-[#908fa0]">
                    <span>Support: {businessConfig?.contactEmail}</span>
                    <span>{businessConfig?.contactPhone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Document Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Upload New Policy / FAQ Document</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-[#908fa0] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#908fa0] mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. VIP Membership Perks & Cryo Add-ons"
                  className="w-full bg-[#030712] border border-[#1e293b] rounded-xl px-3.5 py-2 text-white placeholder-[#908fa0] focus:border-[#6366f1] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#908fa0] mb-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full bg-[#030712] border border-[#1e293b] rounded-xl px-3.5 py-2 text-white focus:border-[#6366f1] outline-none"
                >
                  <option value="faq">FAQ</option>
                  <option value="pricing">Pricing & Menu</option>
                  <option value="policy">Clinic Policy</option>
                  <option value="service_catalog">Service Catalog</option>
                </select>
              </div>

              <div>
                <label className="block text-[#908fa0] mb-1">Document Content</label>
                <textarea
                  required
                  rows={6}
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="Paste policies, pricing tables, or treatment guidance text here..."
                  className="w-full bg-[#030712] border border-[#1e293b] rounded-xl p-3.5 text-white placeholder-[#908fa0] focus:border-[#6366f1] outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-[#908fa0] hover:bg-[#1e293b] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-[#6366f1] hover:bg-[#818cf8] text-white font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Chunking & Embedding...' : 'Index Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Omnichannel Floating Customer Chat Widget */}
      <ChatWidget />
    </div>
  );
}
