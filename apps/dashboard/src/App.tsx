import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  CheckCircle2, 
  Sliders, 
  Activity, 
  PhoneCall, 
  ShieldCheck, 
  Sparkles,
  Zap,
  RefreshCw,
  ExternalLink
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHealth(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('API health check error:', err);
        // Fallback for standalone visual preview
        setHealth({
          status: 'ready',
          version: '1.0.0',
          database: { connected: false, mode: 'local-simulation' },
          business: 'Apex Wellness Clinic'
        });
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar with glassmorphism */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Bot className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  OmniAgent Studio
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v1.0 Pro
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI Customer Support & Booking Copilot for Small Businesses
              </p>
            </div>
          </div>

          {/* System & DB Status Badge */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300">
                {health?.business || 'Apex Wellness Clinic'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                {health?.database.mode || 'Atlas Engine'}
              </span>
            </div>

            <button 
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 cursor-pointer"
              onClick={() => alert('Widget preview modal opening...')}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Test Widget</span>
            </button>
          </div>
        </div>

        {/* Tab Sub-Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto border-t border-slate-800/40">
          {[
            { id: 'live', label: 'Live Conversations & Takeover', icon: MessageSquare, badge: 'Live' },
            { id: 'knowledge', label: 'Knowledge Base (RAG)', icon: BookOpen },
            { id: 'appointments', label: 'Bookings & Calendar', icon: Calendar },
            { id: 'evals', label: '20-Scenario Eval Benchmark', icon: ShieldCheck, badge: '98%' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    tab.badge === 'Live' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation Feed */}
            <div className="lg:col-span-1 rounded-2xl bg-slate-900/50 border border-slate-800/80 p-4 flex flex-col h-[78vh]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-slate-200">Active Threads</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 font-mono">3</span>
                </div>
                <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1">
                  <RefreshCw className="h-3 w-3" />
                  <span>Sync</span>
                </button>
              </div>

              <div className="mt-3 space-y-2 overflow-y-auto flex-1">
                {[
                  {
                    id: '1',
                    name: 'Rajesh Sharma',
                    channel: 'whatsapp',
                    snippet: 'Can I reschedule my dental consultation to Friday 4 PM?',
                    time: '2m ago',
                    sentiment: 'neutral',
                    status: 'AI Handled'
                  },
                  {
                    id: '2',
                    name: 'Priya Mehta',
                    channel: 'web',
                    snippet: 'What is the price of the hydra-facial package?',
                    time: '12m ago',
                    sentiment: 'positive',
                    status: 'AI Handled'
                  },
                  {
                    id: '3',
                    name: 'Vikram Joshi',
                    channel: 'whatsapp',
                    snippet: 'Nobody answered my call earlier, I need to speak to someone right now!',
                    time: '18m ago',
                    sentiment: 'upset',
                    status: 'Handoff Requested'
                  }
                ].map(thread => (
                  <div
                    key={thread.id}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      thread.id === '1'
                        ? 'bg-indigo-600/10 border-indigo-500/40'
                        : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-200">{thread.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          thread.channel === 'whatsapp' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {thread.channel.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{thread.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{thread.snippet}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className={`font-medium ${
                        thread.status === 'Handoff Requested' ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {thread.status}
                      </span>
                      {thread.sentiment === 'upset' && (
                        <span className="text-rose-400 font-medium">⚠️ Upset Customer</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation Active Window */}
            <div className="lg:col-span-2 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col h-[78vh]">
              {/* Header */}
              <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/30 rounded-t-2xl">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-sm text-slate-200">Rajesh Sharma</h3>
                    <span className="text-xs text-slate-500">• +91 98201 12345 (WhatsApp)</span>
                  </div>
                  <p className="text-xs text-slate-400">Context: Inquiry about dental consultation slot</p>
                </div>

                {/* Human Takeover Button */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Agent Active</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition cursor-pointer">
                    Take Over (Pause AI)
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="flex justify-start">
                  <div className="max-w-md bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-tl-sm p-3.5 text-xs text-slate-200">
                    Hello, I have an appointment on Thursday. Can I reschedule my dental consultation to Friday 4 PM instead?
                    <div className="text-[10px] text-slate-500 mt-1">10:42 AM</div>
                  </div>
                </div>

                {/* Agent Thought / Tool invocation trace */}
                <div className="flex justify-center">
                  <div className="max-w-lg w-full bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 text-[11px] font-mono text-indigo-300 space-y-1">
                    <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold">
                      <Activity className="h-3.5 w-3.5 animate-pulse" />
                      <span>Agent Thought Trace (LangGraph)</span>
                    </div>
                    <div>1. Intent detected: <span className="text-white">reschedule_appointment</span></div>
                    <div>2. Calling Google Calendar Tool: <span className="text-white">check_availability("2026-10-02T16:00:00+05:30")</span></div>
                    <div>3. Result: <span className="text-emerald-400">Slot Available (Doctor: Dr. Ananya)</span></div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-md bg-indigo-600 rounded-2xl rounded-tr-sm p-3.5 text-xs text-white shadow-md shadow-indigo-600/20">
                    Certainly Mr. Sharma! I checked Dr. Ananya's schedule for Friday, October 2nd. The 4:00 PM slot is currently open. 
                    <br /><br />
                    Would you like me to confirm this move and send the updated invite to your registered email?
                    <div className="text-[10px] text-indigo-200 mt-1 text-right">10:43 AM • AI Auto-Reply</div>
                  </div>
                </div>
              </div>

              {/* Reply Input Bar */}
              <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 rounded-b-2xl">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type a manual response to take over, or prompt the AI..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition cursor-pointer">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Knowledge Base & RAG Ingestion</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload FAQs, price lists, clinic policies, and service menus. Chunked and indexed in MongoDB Atlas Vector Search.
                </p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition">
                + Upload Document
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Clinic Consultation Pricing & Packages 2026', type: 'pricing', chunks: 14, status: 'Indexed' },
                { title: 'Cancellation & Rescheduling Policies', type: 'policy', chunks: 8, status: 'Indexed' },
                { title: 'Pre & Post Treatment FAQ Guidelines', type: 'faq', chunks: 22, status: 'Indexed' },
              ].map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 uppercase">
                      {doc.type}
                    </span>
                    <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{doc.status}</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200 mt-2">{doc.title}</h4>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{doc.chunks} Vector Chunks</span>
                    <button className="text-indigo-400 hover:underline text-[11px]">Inspect Chunks</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Calendar Bookings & Leads</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronized in real-time with Google Calendar API.
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                Timezone: Asia/Kolkata (IST)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-100">Rajesh Sharma</td>
                    <td className="py-3 px-4">Dental Consultation</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">Fri, Oct 2 • 4:00 PM</td>
                    <td className="py-3 px-4"><span className="text-emerald-400">WhatsApp</span></td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Confirmed</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-100">Sunita Rao</td>
                    <td className="py-3 px-4">Aesthetic Skin Assessment</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">Sat, Oct 3 • 11:30 AM</td>
                    <td className="py-3 px-4"><span className="text-blue-400">Website Widget</span></td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Confirmed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'evals' && (
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100">20-Scenario Golden Evaluation Suite</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated benchmark measuring Groundedness, Hallucination Prevention, Tool Precision, and Sentiment Escalation.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Overall Accuracy</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">95.0%</div>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition flex items-center space-x-1.5">
                  <PlayIcon className="h-3.5 w-3.5" />
                  <span>Run Benchmark Suite</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-slate-400">Knowledge RAG Accuracy</div>
                <div className="text-2xl font-bold text-slate-100 mt-1 font-mono">100%</div>
                <div className="text-[10px] text-emerald-400 mt-1">8/8 scenarios passed</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-slate-400">Booking Tool Precision</div>
                <div className="text-2xl font-bold text-slate-100 mt-1 font-mono">100%</div>
                <div className="text-[10px] text-emerald-400 mt-1">5/5 slots handled</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-slate-400">Safety & Guardrails</div>
                <div className="text-2xl font-bold text-slate-100 mt-1 font-mono">100%</div>
                <div className="text-[10px] text-emerald-400 mt-1">4/4 zero-hallucinations</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-slate-400">Handoff & Escalations</div>
                <div className="text-2xl font-bold text-slate-100 mt-1 font-mono">100%</div>
                <div className="text-[10px] text-emerald-400 mt-1">3/3 triggered handoff</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}
