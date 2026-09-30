import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  CheckCircle2, 
  Sliders, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  Zap,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Send,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Database,
  Radio,
  FileText,
  Clock,
  Check,
  X,
  Play
} from 'lucide-react';

interface SystemHealth {
  status: string;
  version: string;
  database: {
    connected: boolean;
    mode: string;
  };
  business: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'knowledge' | 'appointments' | 'evals'>('live');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isHumanTakeover, setIsHumanTakeover] = useState(false);
  const [showThoughtDetails, setShowThoughtDetails] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState('1');
  const [chatInput, setChatInput] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'web'>('all');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(() => {
        setHealth({
          status: 'ready',
          version: '1.0.0',
          database: { connected: false, mode: 'in-memory-simulation' },
          business: 'Apex Wellness & Aesthetics'
        });
      });
  }, []);

  const threads = [
    {
      id: '1',
      name: 'Elena Rostova',
      phone: '+1 (415) 892-0192',
      channel: 'whatsapp' as const,
      snippet: 'Can I reschedule my Cryotherapy session to tomorrow at 3 PM?',
      time: '2m ago',
      sentiment: 'warning',
      sentimentText: 'Booking pending',
      vip: 'Gold Member'
    },
    {
      id: '2',
      name: 'Marcus Sterling',
      phone: '+1 (212) 555-0144',
      channel: 'web' as const,
      snippet: 'I was charged twice for the skin revitalization package. Please resolve this.',
      time: '8m ago',
      sentiment: 'critical',
      sentimentText: 'Upset customer - needs review',
      vip: 'Standard'
    },
    {
      id: '3',
      name: 'Dr. Sarah Lin',
      phone: '+1 (650) 412-9901',
      channel: 'whatsapp' as const,
      snippet: 'What are the post-IV therapy hydration care instructions?',
      time: '14m ago',
      sentiment: 'nominal',
      sentimentText: 'FAQ resolved',
      vip: 'Platinum'
    },
    {
      id: '4',
      name: 'Chloe Davenport',
      phone: '+1 (310) 902-3341',
      channel: 'web' as const,
      snippet: 'Do you offer couples hyperbaric oxygen chambers on weekends?',
      time: '32m ago',
      sentiment: 'info',
      sentimentText: 'Sales inquiry',
      vip: 'Prospective Lead'
    }
  ];

  const filteredThreads = threads.filter(t => channelFilter === 'all' || t.channel === channelFilter);
  const activeThread = threads.find(t => t.id === selectedThreadId) || threads[0];

  return (
    <div className="min-h-screen bg-[#030712] text-[#dfe2f1] flex flex-col font-sans selection:bg-[#6366f1] selection:text-white">
      {/* Top Command Deck Header */}
      <header className="border-b border-[#1e293b] bg-[#0b0f19]/80 backdrop-blur-xl sticky top-0 z-50">
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
                  Apex Wellness Clinic
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30">
                  AI Agent v2.4 (Active)
                </span>
              </div>
              <p className="text-[11px] text-[#908fa0]">
                Obsidian Autonomous Command • RAG & Booking Orchestrator
              </p>
            </div>
          </div>

          {/* Telemetry Chips */}
          <div className="flex items-center space-x-3">
            {/* Atlas Vector Store */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-[#1e293b] text-xs">
              <Database className="h-3.5 w-3.5 text-[#10b981]" />
              <span className="text-[#908fa0]">Atlas Vector:</span>
              <span className="text-[#10b981] font-mono text-[11px]">Synced (12,480 chunks)</span>
            </div>

            {/* WhatsApp Webhook Status */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-[#1e293b] text-xs">
              <Radio className="h-3.5 w-3.5 text-[#10b981]" />
              <span className="text-[#908fa0]">WhatsApp Cloud API:</span>
              <span className="text-white font-mono text-[11px]">24ms ping</span>
            </div>

            {/* Autonomous Mode Pill */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              isHumanTakeover 
                ? 'bg-[#f43f5e]/15 border-[#f43f5e]/40 text-[#ffb4ab]' 
                : 'bg-[#10b981]/15 border-[#10b981]/40 text-[#4edea3]'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isHumanTakeover ? 'bg-[#f43f5e]' : 'bg-[#10b981]'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isHumanTakeover ? 'bg-[#f43f5e]' : 'bg-[#10b981]'
                }`}></span>
              </span>
              <span>{isHumanTakeover ? 'Human Takeover Mode' : 'AI Autonomous Mode'}</span>
            </div>
          </div>
        </div>

        {/* Modular Navigation Tabs */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex space-x-1 overflow-x-auto border-t border-[#1e293b]/60">
          {[
            { id: 'live', label: 'Live Conversations & Takeover', icon: MessageSquare, badge: '4 Active' },
            { id: 'knowledge', label: 'Knowledge Base (Atlas RAG)', icon: BookOpen },
            { id: 'appointments', label: 'Bookings & Calendar Matrix', icon: Calendar },
            { id: 'evals', label: '20-Scenario Eval Benchmark', icon: ShieldCheck, badge: '98% Pass' },
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
        {activeTab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-140px)] min-h-[680px]">
            {/* Left 3 Cols: Omnichannel Ingress & Threads */}
            <div className="lg:col-span-3 rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-3.5 flex flex-col backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-white">Omnichannel Inbox</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1e293b] text-[#908fa0] font-mono">
                    {filteredThreads.length}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {(['all', 'whatsapp', 'web'] as const).map(ch => (
                    <button
                      key={ch}
                      onClick={() => setChannelFilter(ch)}
                      className={`text-[10px] px-2 py-0.5 rounded capitalize transition ${
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
                {filteredThreads.map(thread => {
                  const isSelected = thread.id === activeThread.id;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#6366f1]/10 border-[#6366f1]/50 shadow-sm shadow-[#6366f1]/10'
                          : 'bg-[#0f172a]/50 border-[#1e293b]/80 hover:border-[#334155]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-white">{thread.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono ${
                            thread.channel === 'whatsapp' 
                              ? 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30' 
                              : 'bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30'
                          }`}>
                            {thread.channel}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#908fa0]">{thread.time}</span>
                      </div>
                      <p className="text-[11px] text-[#908fa0] mt-1.5 line-clamp-2 leading-relaxed">
                        {thread.snippet}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          thread.sentiment === 'critical'
                            ? 'bg-[#f43f5e]/15 text-[#ffb4ab] border border-[#f43f5e]/30'
                            : thread.sentiment === 'warning'
                            ? 'bg-[#f59e0b]/15 text-[#ffb95f] border border-[#f59e0b]/30'
                            : 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30'
                        }`}>
                          {thread.sentimentText}
                        </span>
                        <span className="text-[#908fa0]">{thread.vip}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center 6 Cols: Active Conversation & LangGraph Thought Stream */}
            <div className="lg:col-span-6 rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] flex flex-col backdrop-blur-md">
              {/* Header */}
              <div className="p-3.5 border-b border-[#1e293b] flex items-center justify-between bg-[#0f131d]/60 rounded-t-2xl">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-sm text-white">{activeThread.name}</h3>
                    <span className="text-xs text-[#908fa0]">• {activeThread.phone}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e293b] text-[#818cf8]">
                      #sess_89a0f4
                    </span>
                  </div>
                  <p className="text-[11px] text-[#908fa0] mt-0.5">
                    Context: Cryotherapy & Longevity Consultation Reschedule
                  </p>
                </div>

                {/* Instant Human Takeover Toggle */}
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setIsHumanTakeover(!isHumanTakeover)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-md ${
                      isHumanTakeover
                        ? 'bg-[#10b981] hover:bg-[#10b981]/90 text-[#030712]'
                        : 'bg-[#f43f5e]/20 hover:bg-[#f43f5e]/30 text-[#ffb4ab] border border-[#f43f5e]/50'
                    }`}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>{isHumanTakeover ? 'Resume AI Agent' : 'Take Over (Pause AI)'}</span>
                  </button>
                </div>
              </div>

              {/* Takeover Active Banner */}
              {isHumanTakeover && (
                <div className="px-4 py-2 bg-[#f43f5e]/15 border-b border-[#f43f5e]/30 text-xs text-[#ffb4ab] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-[#ffb4ab]" />
                    <span>AI Autonomous Execution is <strong>PAUSED</strong>. You are typing directly to the customer as Dr. Marcus Vance.</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#ffb4ab]">Shortcut: ⌥ + Space</span>
                </div>
              )}

              {/* Chat Thread Stream */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* User Message */}
                <div className="flex justify-start">
                  <div className="max-w-md bg-[#171b26] border border-[#1e293b] rounded-2xl rounded-tl-sm p-3.5 text-xs text-[#dfe2f1] shadow-sm">
                    {activeThread.snippet}
                    <div className="text-[10px] text-[#908fa0] mt-1.5 flex items-center justify-between">
                      <span>2:14 PM • via WhatsApp</span>
                      <span className="text-[#10b981]">Delivered</span>
                    </div>
                  </div>
                </div>

                {/* LangGraph Agent Thought Card */}
                <div className="rounded-xl bg-[#0a0e18] border border-[#6366f1]/30 p-3.5 shadow-lg shadow-[#6366f1]/5 text-xs">
                  <div 
                    className="flex items-center justify-between cursor-pointer select-none"
                    onClick={() => setShowThoughtDetails(!showThoughtDetails)}
                  >
                    <div className="flex items-center space-x-2 text-[#818cf8] font-semibold text-[11px]">
                      <Activity className="h-3.5 w-3.5 animate-pulse text-[#6366f1]" />
                      <span>LangGraph Agent Thought Stream</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#6366f1]/15 text-[#818cf8] font-mono">
                        Latency: 142ms
                      </span>
                    </div>
                    {showThoughtDetails ? <ChevronDown className="h-4 w-4 text-[#908fa0]" /> : <ChevronRight className="h-4 w-4 text-[#908fa0]" />}
                  </div>

                  {showThoughtDetails && (
                    <div className="mt-2.5 space-y-2 border-t border-[#1e293b]/80 pt-2 font-mono text-[11px] text-[#908fa0]">
                      <div className="flex items-start space-x-2">
                        <span className="text-[#6366f1] font-bold">1.</span>
                        <div>
                          <span className="text-white font-medium">[Intent Triage]</span>: Detected <span className="text-[#4edea3]">APPOINTMENT_RESCHEDULE</span> (Confidence: 0.982)
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-[#6366f1] font-bold">2.</span>
                        <div>
                          <span className="text-white font-medium">[Vector RAG]</span>: Queried collection <span className="text-[#818cf8]">clinic_policies_v3</span>. Score: 0.89 cosine match. Policy: Reschedules &gt;4h permitted free.
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-[#6366f1] font-bold">3.</span>
                        <div>
                          <span className="text-white font-medium">[Calendar Tool]</span>: Invoked <span className="text-white">check_availability("2026-10-02T15:00:00")</span>. Dr. Vance Cryo Chamber B is <span className="text-[#4edea3]">AVAILABLE</span>.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Auto-Reply Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-md bg-[#6366f1] rounded-2xl rounded-tr-sm p-3.5 text-xs text-white shadow-lg shadow-[#6366f1]/20">
                    Hi Elena! I can certainly help with that. Rescheduling within your policy window is free of charge. I have Cryo Chamber B open tomorrow (Friday) at 3:00 PM with Dr. Vance.
                    <br /><br />
                    Would you like me to go ahead and confirm this move and send the updated calendar invite to your registered email?
                    <div className="text-[10px] text-indigo-200 mt-2 text-right flex items-center justify-end space-x-1">
                      <span>2:15 PM • Autonomous AI Reply</span>
                      <Check className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Input Area */}
              <div className="p-3 border-t border-[#1e293b] bg-[#0f131d]/60 rounded-b-2xl">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatInput.trim()) return;
                    setChatInput('');
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      isHumanTakeover 
                        ? 'Type a message as Human Agent (AI will remain paused)...' 
                        : 'Simulate customer message or send manual override...'
                    }
                    className="flex-1 bg-[#030712] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#6366f1] placeholder-[#908fa0]"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2.5 bg-[#6366f1] hover:bg-[#818cf8] text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>Send</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right 3 Cols: RAG Inspector & Upcoming Schedule */}
            <div className="lg:col-span-3 space-y-4 flex flex-col">
              {/* RAG Knowledge Match Inspector */}
              <div className="rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-4 backdrop-blur-md">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1e293b]">
                  <span className="font-semibold text-xs text-white">Active RAG Grounding</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10b981]/15 text-[#4edea3]">
                    89% Cosine
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-white">
                    Rescheduling & Cancellation Policy v2.1
                  </div>
                  <div className="mt-1 text-[11px] text-[#908fa0] leading-relaxed bg-[#030712] p-2.5 rounded-lg border border-[#1e293b] font-mono">
                    "...Patients may reschedule recovery and cryotherapy sessions up to 4 hours in advance at zero penalty. Slot reassignments automatically lock associated chamber equipment..."
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#908fa0]">
                    <span>Source: Apex_Ops_Manual_2025.pdf#p14</span>
                    <button className="text-[#818cf8] hover:underline">View Source</button>
                  </div>
                </div>
              </div>

              {/* Mini Calendar Schedule */}
              <div className="flex-1 rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-4 backdrop-blur-md flex flex-col">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1e293b]">
                  <span className="font-semibold text-xs text-white">Schedule • Friday, Oct 2</span>
                  <span className="text-[10px] text-[#908fa0]">Dr. Vance</span>
                </div>
                <div className="mt-3 space-y-2 flex-1 overflow-y-auto">
                  <div className="p-2.5 rounded-lg bg-[#0f172a] border border-[#1e293b] text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">Hyperbaric Therapy</span>
                      <span className="text-[#908fa0]">2:00 PM</span>
                    </div>
                    <div className="text-[10px] text-[#908fa0] mt-0.5">Booked • Alex P.</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#6366f1]/15 border border-[#6366f1]/40 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#818cf8]">Cryo Chamber B (Pending)</span>
                      <span className="text-[#818cf8]">3:00 PM</span>
                    </div>
                    <div className="text-[10px] text-white mt-0.5">Hold for Elena Rostova</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0f172a] border border-[#1e293b] text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">Consultation</span>
                      <span className="text-[#908fa0]">4:15 PM</span>
                    </div>
                    <div className="text-[10px] text-[#908fa0] mt-0.5">Booked • Maya T.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Knowledge Base & RAG Ingestion */}
        {activeTab === 'knowledge' && (
          <div className="rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-6 space-y-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Atlas Vector Store & Document Ingestion</h2>
                <p className="text-xs text-[#908fa0] mt-0.5">
                  Small business documents are automatically converted into 500-token chunks with 50-token overlap and indexed into MongoDB Atlas `$vectorSearch`.
                </p>
              </div>
              <button className="px-4 py-2 bg-[#6366f1] hover:bg-[#818cf8] text-white text-xs font-semibold rounded-xl transition cursor-pointer">
                + Upload New Policy / FAQ
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Clinic Service Menu & Pricing 2026', type: 'pricing', chunks: 14, matchScore: '94%', updated: 'Today' },
                { title: 'Cancellation & Rescheduling Policies', type: 'policy', chunks: 8, matchScore: '89%', updated: 'Yesterday' },
                { title: 'Pre & Post Treatment FAQ Guidelines', type: 'faq', chunks: 22, matchScore: '96%', updated: '3 days ago' },
              ].map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] hover:border-[#334155] transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6366f1]/15 text-[#818cf8] uppercase">
                      {doc.type}
                    </span>
                    <span className="text-[11px] text-[#4edea3] flex items-center space-x-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Indexed</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-2.5">{doc.title}</h4>
                  <div className="mt-3 flex items-center justify-between text-xs text-[#908fa0]">
                    <span>{doc.chunks} Atlas Chunks</span>
                    <span className="text-[#4edea3] font-mono">{doc.matchScore} Accuracy</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Bookings & Calendar Matrix */}
        {activeTab === 'appointments' && (
          <div className="rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-6 space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Google Calendar Sync & Bookings Table</h2>
                <p className="text-xs text-[#908fa0] mt-0.5">
                  Synchronized in real-time via Google Calendar FreeBusy and Events API.
                </p>
              </div>
              <span className="text-xs font-mono text-[#818cf8] bg-[#6366f1]/15 px-3 py-1.5 rounded-lg border border-[#6366f1]/30">
                Timezone: Asia/Kolkata (IST)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1e293b] text-[#908fa0] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Scheduled Slot</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Calendar Event ID</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]/70 text-[#dfe2f1]">
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-white">Elena Rostova</td>
                    <td className="py-3.5 px-4">Whole-Body Cryo & Assessment</td>
                    <td className="py-3.5 px-4 font-mono text-[#818cf8]">Fri, Oct 2 • 3:00 PM</td>
                    <td className="py-3.5 px-4"><span className="text-[#4edea3]">WhatsApp</span></td>
                    <td className="py-3.5 px-4 font-mono text-[#908fa0]">gcal_event_8192a</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30">
                        Confirmed
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-white">Sunita Rao</td>
                    <td className="py-3.5 px-4">Aesthetic Skin Assessment</td>
                    <td className="py-3.5 px-4 font-mono text-[#818cf8]">Sat, Oct 3 • 11:30 AM</td>
                    <td className="py-3.5 px-4"><span className="text-[#818cf8]">Web Widget</span></td>
                    <td className="py-3.5 px-4 font-mono text-[#908fa0]">gcal_event_7391b</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30">
                        Confirmed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
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
                  Regression test suite validating RAG groundedness, calendar tool accuracy, and human handoff escalation thresholds.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-xs text-[#908fa0]">Overall Accuracy Score</div>
                  <div className="text-2xl font-bold font-mono text-[#4edea3]">98.0%</div>
                </div>
                <button className="px-4 py-2 bg-[#6366f1] hover:bg-[#818cf8] text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-1.5">
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
      </main>
    </div>
  );
}
