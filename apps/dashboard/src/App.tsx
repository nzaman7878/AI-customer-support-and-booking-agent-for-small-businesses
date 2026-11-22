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
  Trash2,
  TrendingUp,
  BarChart3,
  Download,
  DollarSign,
  PieChart,
  CreditCard,
  Star,
  ThumbsUp,
  ThumbsDown,
  HeartHandshake,
  Search,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { FeedbackSubmission, FeedbackOverview } from '@ai-agent/shared';
import ChatWidget from './components/ChatWidget.js';
import SelfServicePortal from './components/SelfServicePortal.js';

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
  const [activeTab, setActiveTab] = useState<'live' | 'knowledge' | 'appointments' | 'evals' | 'whitelabel' | 'analytics' | 'reputation'>('live');
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
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState('');
  const [knowledgeCategoryFilter, setKnowledgeCategoryFilter] = useState<'all' | 'faq' | 'pricing' | 'policy' | 'service_catalog'>('all');
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [selectedDocChunks, setSelectedDocChunks] = useState<{ docId: string; title: string; chunks: any[] } | null>(null);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);

  // Evals Benchmark state
  const [evalScenarios, setEvalScenarios] = useState<any[]>([]);
  const [evalScorecard, setEvalScorecard] = useState<any | null>(null);
  const [evalCategoryFilter, setEvalCategoryFilter] = useState<'all' | 'knowledge' | 'booking' | 'guardrail' | 'escalation'>('all');
  const [isRunningEvals, setIsRunningEvals] = useState(false);
  const [expandedScenarioId, setExpandedScenarioId] = useState<string | null>(null);

  // Appointments & Leads state
  const [appointments, setAppointments] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<'all' | 'confirmed' | 'pending_payment' | 'cancelled'>('all');
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInService, setWalkInService] = useState('Medical & Longevity Consultation');
  const [walkInDate, setWalkInDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [walkInTime, setWalkInTime] = useState('11:00');
  const [walkInDoctor, setWalkInDoctor] = useState('Dr. Marcus Vance');
  const [walkInNotes, setWalkInNotes] = useState('');
  const [isCreatingWalkIn, setIsCreatingWalkIn] = useState(false);

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

  // Analytics & ROI state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsTopics, setAnalyticsTopics] = useState<any[]>([]);

  // Payment Transactions state
  const [transactions, setTransactions] = useState<any[]>([]);

  // Self-Service Portal state
  const [selectedPortalAppointmentId, setSelectedPortalAppointmentId] = useState<string | null>(null);
  const [showPortalModal, setShowPortalModal] = useState<boolean>(false);
  const [standalonePortalToken, setStandalonePortalToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');
      if (token) return token;
      if (window.location.pathname.startsWith('/portal')) {
        return searchParams.get('token') || 'direct_portal_mode';
      }
    }
    return null;
  });

  // Reputation & Review Booster state
  const [feedbackOverview, setFeedbackOverview] = useState<FeedbackOverview | null>(null);
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<FeedbackSubmission[]>([]);
  const [simRating, setSimRating] = useState<number>(5);
  const [simComment, setSimComment] = useState<string>('Incredible treatment! Thoroughly professional staff.');
  const [simResult, setSimResult] = useState<any>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);

  // Initial Data Fetch
  const loadData = () => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setHealth(d))
      .catch(() => {});

    fetch('/api/analytics/overview')
      .then(r => r.json())
      .then(d => {
        if (d.analytics) setAnalyticsData(d.analytics);
      })
      .catch(() => {});

    fetch('/api/analytics/topics')
      .then(r => r.json())
      .then(d => {
        if (d.topics) setAnalyticsTopics(d.topics);
      })
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

    fetch('/api/payments/transactions')
      .then(r => r.json())
      .then(d => {
        if (d.transactions) setTransactions(d.transactions);
      })
      .catch(() => {});

    fetch('/api/feedback/overview')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setFeedbackOverview(d.overview);
          setFeedbackSubmissions(d.submissions || []);
        }
      })
      .catch(() => {});

    fetch('/api/evals/scenarios')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.scenarios)) {
          setEvalScenarios(d.scenarios);
        }
      })
      .catch(() => {});
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm('Delete this document from the vector store? All indexed chunks will be permanently removed.')) return;
    setDeletingDocId(docId);
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setWebhookToast('Document deleted and vector chunks removed from index');
        setTimeout(() => setWebhookToast(null), 3000);
        loadData();
      }
    } catch (err) {
      console.error('Delete document failed:', err);
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleInspectChunks = async (doc: any) => {
    setIsLoadingChunks(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/chunks`);
      const data = await res.json();
      if (data.success && Array.isArray(data.chunks)) {
        setSelectedDocChunks({ docId: doc.id, title: doc.title, chunks: data.chunks });
      }
    } catch (err) {
      console.error('Failed to load chunks:', err);
    } finally {
      setIsLoadingChunks(false);
    }
  };

  const handleRunEvals = async () => {
    setIsRunningEvals(true);
    try {
      const res = await fetch('/api/evals/run', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEvalScorecard(data);
      }
    } catch (err) {
      console.error('Run benchmark failed:', err);
    } finally {
      setIsRunningEvals(false);
    }
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || !walkInPhone || !walkInDate || !walkInTime) return;

    setIsCreatingWalkIn(true);
    try {
      const [hours, minutes] = walkInTime.split(':');
      const startDt = new Date(`${walkInDate}T${hours || '10'}:${minutes || '00'}:00`);
      const endDt = new Date(startDt.getTime() + 45 * 60 * 1000);

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: walkInName,
          customerEmail: walkInEmail || `${walkInName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
          customerPhone: walkInPhone,
          serviceName: walkInService,
          startTime: startDt.toISOString(),
          endTime: endDt.toISOString(),
          notes: walkInNotes ? `[Walk-in / ${walkInDoctor}] ${walkInNotes}` : `[Walk-in / ${walkInDoctor}]`
        })
      });

      const data = await res.json();
      if (data.success) {
        setWebhookToast(`Walk-in confirmed: ${walkInName} (${walkInService})`);
        setTimeout(() => setWebhookToast(null), 3500);
        setShowWalkInModal(false);
        setWalkInName('');
        setWalkInPhone('');
        setWalkInEmail('');
        setWalkInNotes('');
        loadData();
      } else {
        alert(data.error || 'Failed to create walk-in booking');
      }
    } catch (err: any) {
      console.error('Walk-in booking error:', err);
      alert(err.message || 'Error creating walk-in booking');
    } finally {
      setIsCreatingWalkIn(false);
    }
  };

  const handleTriggerFeedback = async (appointmentId: string) => {
    try {
      const res = await fetch(`/api/feedback/trigger/${appointmentId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setWebhookToast(`Survey invitation dispatched to ${data.customerPhone || 'customer'}`);
        setTimeout(() => setWebhookToast(null), 3500);
        loadData();
      }
    } catch (err) {
      console.error('Trigger feedback error:', err);
    }
  };

  const handleSimulateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    setSimResult(null);
    try {
      const targetAptId = appointments[0]?.id || 'apt_seed_1';
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: targetAptId,
          rating: simRating,
          comment: simComment
        })
      });
      const data = await res.json();
      if (data.success) {
        setSimResult(data);
        loadData();
      }
    } catch (err) {
      console.error('Simulate feedback error:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleResolveFeedback = async (id: string) => {
    try {
      const res = await fetch(`/api/feedback/resolve/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setWebhookToast('Marked customer grievance as resolved.');
        setTimeout(() => setWebhookToast(null), 3000);
        loadData();
      }
    } catch (err) {
      console.error('Resolve feedback error:', err);
    }
  };

  const handleSimulatePayment = async (paymentLinkId: string) => {
    try {
      const res = await fetch('/api/payments/simulate-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentLinkId })
      });
      const data = await res.json();
      if (data.success) {
        setWebhookToast(`Deposit verified! Slot confirmed & locked. Receipt: ${data.result.transaction.receiptNumber}`);
        setTimeout(() => setWebhookToast(null), 3500);
        loadData();
      }
    } catch (err) {
      console.error('Payment error:', err);
    }
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

  const filteredDocuments = documents.filter(doc => {
    const matchesCat = knowledgeCategoryFilter === 'all' || doc.category === knowledgeCategoryFilter;
    const matchesSearch = !knowledgeSearchQuery.trim() ||
      doc.title.toLowerCase().includes(knowledgeSearchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(knowledgeSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredEvalScenarios = evalScenarios.filter(sc => {
    return evalCategoryFilter === 'all' || sc.category === evalCategoryFilter;
  });

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = appointmentStatusFilter === 'all' || apt.status === appointmentStatusFilter;
    const q = appointmentSearchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (apt.customerName || '').toLowerCase().includes(q) ||
      (apt.serviceName || '').toLowerCase().includes(q) ||
      (apt.customerPhone || '').toLowerCase().includes(q) ||
      (apt.customerEmail || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Standalone Direct Magic-Link Customer Landing View
  if (standalonePortalToken) {
    return (
      <div className="min-h-screen bg-[#030712] text-[#dfe2f1] flex flex-col font-sans selection:bg-[#6366f1] selection:text-white p-4 sm:p-6 justify-center items-center">
        {/* Top Minimal Client Bar */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-4 px-1">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#6366f1] via-[#818cf8] to-[#10b981] p-[1.5px] shadow-lg shadow-[#6366f1]/25">
              <div className="h-full w-full bg-[#030712] rounded-[10px] flex items-center justify-center">
                <Bot className="h-5 w-5 text-[#818cf8]" />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-white">{businessConfig?.name || 'Apex Wellness Clinic'}</h2>
              <p className="text-[11px] text-[#908fa0]">Client Self-Service & Rescheduling Hub</p>
            </div>
          </div>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              setStandalonePortalToken(null);
            }}
            className="text-xs text-[#908fa0] hover:text-white transition flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#1e293b] hover:bg-[#1e293b]/50 cursor-pointer"
          >
            <span>Admin Console</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Dedicated Standalone Self-Service Portal */}
        <SelfServicePortal
          token={standalonePortalToken === 'direct_portal_mode' ? undefined : standalonePortalToken}
          isStandalone={true}
          onClose={() => {
            window.history.pushState({}, '', '/');
            setStandalonePortalToken(null);
          }}
          onAppointmentUpdated={loadData}
        />
      </div>
    );
  }

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
            { id: 'analytics', label: 'ROI & Conversion Intelligence', icon: TrendingUp, badge: `${analyticsData?.bookingConversionRate || 33}% Conv` },
            { id: 'reputation', label: 'Reputation & Google Reviews', icon: Star, badge: `${feedbackOverview?.csatScore || 86}% CSAT` },
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Atlas Vector Store & Document Ingestion</h2>
                <p className="text-xs text-[#908fa0] mt-0.5">
                  Manage indexed knowledge chunks for zero-hallucination LangGraph RAG support across multiple business verticals.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-[#6366f1] hover:bg-[#818cf8] text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-md shadow-[#6366f1]/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Upload Document</span>
                </button>
              </div>
            </div>

            {/* Knowledge Base Search & Category Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#030712] border border-[#1e293b]">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#908fa0]" />
                <input
                  type="text"
                  value={knowledgeSearchQuery}
                  onChange={(e) => setKnowledgeSearchQuery(e.target.value)}
                  placeholder="Search indexed knowledge documents by title or keywords..."
                  className="w-full pl-9 pr-4 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-lg text-xs text-white placeholder-[#908fa0] focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'faq', 'pricing', 'policy', 'service_catalog'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setKnowledgeCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                      knowledgeCategoryFilter === cat
                        ? 'bg-[#6366f1] text-white'
                        : 'bg-[#0b0f19] text-[#908fa0] hover:text-white border border-[#1e293b]'
                    }`}
                  >
                    {cat === 'all' ? `All Docs (${documents.length})` : cat.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="p-4 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] hover:border-[#334155] transition flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6366f1]/15 text-[#818cf8] uppercase">
                        {doc.category}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] text-[#4edea3] flex items-center space-x-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Indexed</span>
                        </span>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          disabled={deletingDocId === doc.id}
                          title="Delete from Vector Store"
                          className="p-1 rounded text-[#908fa0] hover:text-[#f43f5e] hover:bg-[#f43f5e]/10 transition cursor-pointer"
                        >
                          {deletingDocId === doc.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-2.5">{doc.title}</h4>
                    <p className="text-[11px] text-[#908fa0] mt-1.5 line-clamp-3 leading-relaxed">
                      {doc.content}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-[#908fa0]">
                    <span className="font-mono text-[11px]">{doc.chunkCount} Vector Chunks</span>
                    <button
                      onClick={() => handleInspectChunks(doc)}
                      className="text-[#818cf8] hover:text-[#a5b4fc] text-[11px] font-medium cursor-pointer"
                    >
                      {isLoadingChunks && selectedDocChunks?.docId === doc.id ? 'Loading...' : 'Inspect Chunks →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredDocuments.length === 0 && (
              <div className="py-12 text-center text-[#908fa0] text-xs">
                No indexed documents match the selected category or search query.
              </div>
            )}
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
                  <button
                    onClick={() => setShowWalkInModal(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#6366f1] hover:bg-[#818cf8] text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-[#6366f1]/20"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ New Walk-In</span>
                  </button>
                </div>
              </div>

              {/* Appointments Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#030712] border border-[#1e293b]">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#908fa0]" />
                  <input
                    type="text"
                    value={appointmentSearchQuery}
                    onChange={(e) => setAppointmentSearchQuery(e.target.value)}
                    placeholder="Search bookings by customer name, service, phone or email..."
                    className="w-full pl-9 pr-4 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-lg text-xs text-white placeholder-[#908fa0] focus:outline-none focus:border-[#6366f1]"
                  />
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(['all', 'confirmed', 'pending_payment', 'cancelled'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setAppointmentStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                        appointmentStatusFilter === status
                          ? 'bg-[#6366f1] text-white'
                          : 'bg-[#0b0f19] text-[#908fa0] hover:text-white border border-[#1e293b]'
                      }`}
                    >
                      {status === 'all'
                        ? `All (${appointments.length})`
                        : status === 'pending_payment'
                        ? `Deposit Pending (${appointments.filter(a => a.status === 'pending_payment').length})`
                        : `${status.charAt(0).toUpperCase() + status.slice(1)} (${appointments.filter(a => a.status === status).length})`}
                    </button>
                  ))}
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
                    {filteredAppointments.map(apt => (
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
                              : (apt.status === 'pending_payment'
                                ? 'bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30'
                                : 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30')
                          }`}>
                            {apt.status === 'pending_payment' ? 'Deposit Pending' : apt.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {apt.status !== 'cancelled' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleTriggerFeedback(apt.id)}
                                className="text-[10px] px-2.5 py-1 rounded-lg bg-[#f59e0b]/15 text-[#fbbf24] hover:bg-[#f59e0b]/25 border border-[#f59e0b]/30 transition cursor-pointer flex items-center space-x-1"
                                title="Dispatch Post-Visit Review Survey via WhatsApp"
                              >
                                <Star className="h-3 w-3" />
                                <span>Survey</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPortalAppointmentId(apt.id);
                                  setShowPortalModal(true);
                                }}
                                className="text-[10px] px-2.5 py-1 rounded-lg bg-[#6366f1]/15 text-[#818cf8] hover:bg-[#6366f1]/25 border border-[#6366f1]/30 transition cursor-pointer flex items-center space-x-1"
                                title="Open Client Self-Service Rescheduling Portal"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>Portal</span>
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(apt.id)}
                                className="text-[10px] px-2 py-1 rounded bg-[#f43f5e]/10 text-[#ffb4ab] hover:bg-[#f43f5e]/20 border border-[#f43f5e]/30 transition cursor-pointer"
                              >
                                Cancel Slot
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#908fa0] italic">Slot Freed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredAppointments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#908fa0] text-xs">
                          No bookings match the search criteria or status filter.
                        </td>
                      </tr>
                    )}
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

              {/* Deposit Payments & Gateway Ledger Section */}
              <div className="mt-6 pt-6 border-t border-[#1e293b] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-[#10b981]" />
                    <h3 className="text-sm font-bold text-white">Deposit Collection & Payment Gateways</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#10b981]/15 text-[#4edea3] font-mono">
                      Razorpay & Stripe
                    </span>
                  </div>
                  <span className="text-[11px] text-[#908fa0]">
                    Auto-Confirmation on Paid Deposit
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#1e293b] bg-[#030712]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1e293b] text-[#908fa0] uppercase tracking-wider text-[10px] bg-[#0b0f19]">
                        <th className="py-2.5 px-3">Transaction</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Deposit</th>
                        <th className="py-2.5 px-3">Gateway</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Receipt / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e293b]/60 text-[#dfe2f1]">
                      {transactions.slice(0, 4).map(tx => (
                        <tr key={tx.id}>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#818cf8]">{tx.id}</td>
                          <td className="py-2.5 px-3 font-medium text-white">{tx.customerName}</td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-[#10b981]">
                            {tx.currency} {tx.amount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 uppercase text-[10px] font-mono text-[#908fa0]">{tx.provider}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                              tx.status === 'paid'
                                ? 'bg-[#10b981]/20 text-[#4edea3] border border-[#10b981]/30'
                                : 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {tx.status === 'paid' ? (
                              <span className="text-[10px] font-mono text-[#818cf8]">{tx.receiptNumber}</span>
                            ) : (
                              <button
                                onClick={() => handleSimulatePayment(tx.paymentLinkId)}
                                className="text-[10px] px-2 py-0.5 rounded bg-[#10b981]/15 text-[#4edea3] hover:bg-[#10b981]/30 border border-[#10b981]/40 transition cursor-pointer"
                              >
                                Simulate Payment
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-white">20-Scenario Golden Eval Benchmark Console</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30">
                    Live Automated Runner
                  </span>
                </div>
                <p className="text-xs text-[#908fa0] mt-0.5">
                  Automated benchmark measuring Groundedness, Hallucination Prevention, Tool Precision, and Sentiment Escalation.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-[#908fa0]">Overall Accuracy Score</div>
                  <div className="text-2xl font-bold font-mono text-[#4edea3]">
                    {evalScorecard?.overallAccuracy !== undefined ? `${evalScorecard.overallAccuracy}%` : '100.0%'}
                  </div>
                </div>
                <button 
                  onClick={handleRunEvals}
                  disabled={isRunningEvals}
                  className="px-4 py-2.5 bg-[#6366f1] hover:bg-[#818cf8] text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-2 shadow-lg shadow-[#6366f1]/25 disabled:opacity-50"
                >
                  {isRunningEvals ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Benchmarking ({evalScenarios.length || 20} Scenarios)...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Execute Full Benchmark</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Metric Scorecard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
                <div className="flex items-center justify-between text-xs text-[#908fa0]">
                  <span>1. Knowledge Base RAG</span>
                  <span className="font-mono text-[#4edea3]">8/8</span>
                </div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">
                  {evalScorecard?.categoryStats?.knowledge ? `${Math.round((evalScorecard.categoryStats.knowledge.passed / evalScorecard.categoryStats.knowledge.total) * 100)}%` : '100%'}
                </div>
                <div className="text-[10px] text-[#4edea3] mt-1">Zero-hallucination grounded RAG</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
                <div className="flex items-center justify-between text-xs text-[#908fa0]">
                  <span>2. Booking Tool Precision</span>
                  <span className="font-mono text-[#4edea3]">5/5</span>
                </div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">
                  {evalScorecard?.categoryStats?.booking ? `${Math.round((evalScorecard.categoryStats.booking.passed / evalScorecard.categoryStats.booking.total) * 100)}%` : '100%'}
                </div>
                <div className="text-[10px] text-[#4edea3] mt-1">Slot discovery & calendar accuracy</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
                <div className="flex items-center justify-between text-xs text-[#908fa0]">
                  <span>3. Guardrails & Safety</span>
                  <span className="font-mono text-[#4edea3]">4/4</span>
                </div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">
                  {evalScorecard?.categoryStats?.guardrail ? `${Math.round((evalScorecard.categoryStats.guardrail.passed / evalScorecard.categoryStats.guardrail.total) * 100)}%` : '100%'}
                </div>
                <div className="text-[10px] text-[#4edea3] mt-1">Out-of-scope & injections caught</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
                <div className="flex items-center justify-between text-xs text-[#908fa0]">
                  <span>4. Sentiment Escalation</span>
                  <span className="font-mono text-[#4edea3]">3/3</span>
                </div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">
                  {evalScorecard?.categoryStats?.escalation ? `${Math.round((evalScorecard.categoryStats.escalation.passed / evalScorecard.categoryStats.escalation.total) * 100)}%` : '100%'}
                </div>
                <div className="text-[10px] text-[#4edea3] mt-1">High-priority handoff to human desk</div>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center space-x-2 border-b border-[#1e293b] pb-3 overflow-x-auto">
              {(['all', 'knowledge', 'booking', 'guardrail', 'escalation'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setEvalCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    evalCategoryFilter === cat
                      ? 'bg-[#6366f1] text-white'
                      : 'text-[#908fa0] hover:text-white hover:bg-[#1e293b]'
                  }`}
                >
                  {cat === 'all' 
                    ? `All Scenarios (${evalScenarios.length || 20})` 
                    : `${cat.toUpperCase()} (${evalScenarios.filter(s => s.category === cat).length})`}
                </button>
              ))}
            </div>

            {/* Scenario Evaluation Cards */}
            <div className="space-y-3">
              {filteredEvalScenarios.map((sc, idx) => {
                const evalRunResult = evalScorecard?.results?.find((r: any) => r.scenarioId === sc.id);
                const isExpanded = expandedScenarioId === sc.id;

                return (
                  <div
                    key={sc.id}
                    className="p-4 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] hover:border-[#334155] transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e293b] text-[#908fa0]">
                          #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                          sc.category === 'knowledge' ? 'bg-[#6366f1]/15 text-[#818cf8]' :
                          sc.category === 'booking' ? 'bg-[#10b981]/15 text-[#4edea3]' :
                          sc.category === 'guardrail' ? 'bg-[#f59e0b]/15 text-[#fcd34d]' :
                          'bg-[#f43f5e]/15 text-[#ffb4ab]'
                        }`}>
                          {sc.category}
                        </span>
                        <h4 className="font-semibold text-white text-xs">{sc.name || sc.id}</h4>
                      </div>

                      <div className="flex items-center space-x-2">
                        {evalRunResult ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center space-x-1 ${
                            evalRunResult.passed
                              ? 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30'
                              : 'bg-[#f43f5e]/15 text-[#ffb4ab] border border-[#f43f5e]/30'
                          }`}>
                            {evalRunResult.passed ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                            <span>{evalRunResult.passed ? 'PASSED' : 'FAILED'}</span>
                            <span className="font-mono text-[9px] text-[#908fa0]">({evalRunResult.latencyMs}ms)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#1e293b] text-[#908fa0]">
                            Ready to Benchmark
                          </span>
                        )}

                        <button
                          onClick={() => setExpandedScenarioId(isExpanded ? null : sc.id)}
                          className="p-1 rounded text-[#908fa0] hover:text-white transition cursor-pointer"
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Scenario Prompt */}
                    <div className="p-3 rounded-lg bg-[#030712] border border-[#1e293b] text-xs">
                      <span className="text-[#908fa0] font-mono text-[10px] block mb-1">USER PROMPT</span>
                      <p className="text-white italic">"{sc.prompt}"</p>
                    </div>

                    {/* Expanded Detail Accordion */}
                    {isExpanded && (
                      <div className="p-3 rounded-lg bg-[#080d19] border border-[#6366f1]/20 space-y-2.5 text-xs animate-in fade-in duration-150">
                        <div>
                          <span className="text-[#818cf8] font-mono text-[10px] block">EXPECTED INTENT / GROUND TRUTH</span>
                          <p className="text-[#dfe2f1] text-[11px] mt-0.5">
                            {sc.description || sc.expectedBehavior || `Expected intent: ${sc.expectedIntent}`}
                          </p>
                        </div>

                        {evalRunResult && (
                          <>
                            <div className="pt-2 border-t border-[#1e293b]">
                              <span className="text-[#4edea3] font-mono text-[10px] block">AGENT ACTUAL RESPONSE</span>
                              <p className="text-white text-[11px] mt-0.5 leading-relaxed bg-[#030712] p-2.5 rounded-lg border border-[#1e293b]">
                                {evalRunResult.agentResponse}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-[#1e293b]">
                              <span className="text-[#908fa0] font-mono text-[10px] block">BENCHMARK EVALUATION RATIONALE</span>
                              <p className="text-[#908fa0] text-[11px] mt-0.5">
                                {evalRunResult.evaluationRationale}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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

        {/* Tab 6: Business Analytics, Conversation Intelligence & Reporting */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Header with Export CTAs */}
            <div className="rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-[#818cf8]" />
                  <h2 className="text-base font-bold text-white">ROI & Conversion Intelligence Console</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30">
                    Real-time Metrics
                  </span>
                </div>
                <p className="text-xs text-[#908fa0] mt-1">
                  Track client acquisition, autonomous inquiry resolution, revenue pipeline generated, and export CSV audit logs.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href="/api/analytics/export/appointments.csv"
                  download="omniagent-appointments.csv"
                  className="px-3.5 py-2 bg-[#0f172a] hover:bg-[#1e293b] border border-[#1e293b] text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Download className="h-3.5 w-3.5 text-[#818cf8]" />
                  <span>Appointments CSV</span>
                </a>

                <a
                  href="/api/analytics/export/leads.csv"
                  download="omniagent-leads.csv"
                  className="px-3.5 py-2 bg-[#6366f1] hover:bg-[#818cf8] text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-md shadow-[#6366f1]/20"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Qualified Leads CSV</span>
                </a>
              </div>
            </div>

            {/* 4 Executive KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0b0f19]/80 border border-[#1e293b] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#908fa0]">Pipeline Value Generated</span>
                  <span className="p-1.5 rounded-lg bg-[#10b981]/15 text-[#4edea3]">
                    <DollarSign className="h-4 w-4" />
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-2">
                  {analyticsData?.currency || 'INR'} {((analyticsData?.estimatedPipelineRevenue || 85000)).toLocaleString()}
                </div>
                <div className="text-[11px] text-[#4edea3] mt-1 flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 inline" />
                  <span>From {analyticsData?.totalBookings || appointments.length} bookings + {analyticsData?.totalLeads || leads.length} leads</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b0f19]/80 border border-[#1e293b] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#908fa0]">Booking Conversion Rate</span>
                  <span className="p-1.5 rounded-lg bg-[#6366f1]/15 text-[#818cf8]">
                    <Calendar className="h-4 w-4" />
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#818cf8] mt-2">
                  {analyticsData?.bookingConversionRate || 33.3}%
                </div>
                <div className="text-[11px] text-[#908fa0] mt-1">
                  Inquiries converted to confirmed slots
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b0f19]/80 border border-[#1e293b] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#908fa0]">Autonomous Deflection Rate</span>
                  <span className="p-1.5 rounded-lg bg-[#10b981]/15 text-[#4edea3]">
                    <Bot className="h-4 w-4" />
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#4edea3] mt-2">
                  {analyticsData?.autonomousDeflectionRate || 92.5}%
                </div>
                <div className="text-[11px] text-[#4edea3] mt-1">
                  Zero human staff intervention needed
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b0f19]/80 border border-[#1e293b] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#908fa0]">Average AI Response Speed</span>
                  <span className="p-1.5 rounded-lg bg-[#0ea5e9]/15 text-[#38bdf8]">
                    <Clock className="h-4 w-4" />
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-2">
                  {analyticsData?.averageResponseTimeMs || 14} ms
                </div>
                <div className="text-[11px] text-[#908fa0] mt-1">
                  Sub-second streaming SSE latency
                </div>
              </div>
            </div>

            {/* Middle Section: Topic Inquiries & Channel/Sentiment Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Cols: Top Inquired Topics */}
              <div className="lg:col-span-7 rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-5 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                  <div className="flex items-center space-x-2">
                    <PieChart className="h-4 w-4 text-[#818cf8]" />
                    <span className="text-xs font-semibold text-white">Top Inquired Topics & Customer Questions</span>
                  </div>
                  <span className="text-[10px] text-[#908fa0] font-mono">Semantic RAG Categorization</span>
                </div>

                <div className="space-y-3.5">
                  {(analyticsTopics.length > 0 ? analyticsTopics : [
                    { topic: 'Hydra-Facial & Aesthetic Pricing', count: 42, category: 'pricing', percentage: 34 },
                    { topic: 'Google Calendar Appointment Scheduling', count: 35, category: 'booking', percentage: 28 },
                    { topic: 'Cryotherapy Package Perks & ROI', count: 24, category: 'service', percentage: 19 },
                    { topic: 'Rescheduling Window & Cancellation Policy', count: 15, category: 'policy', percentage: 12 },
                    { topic: 'Valet Parking & Location Guidance', count: 9, category: 'service', percentage: 7 }
                  ]).map((t, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#dfe2f1] font-medium">{t.topic}</span>
                        <div className="flex items-center space-x-2 font-mono text-[11px]">
                          <span className="text-[#908fa0]">{t.count} queries</span>
                          <span className="text-[#818cf8] font-bold">{t.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-[#030712] rounded-full overflow-hidden border border-[#1e293b]/60">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#6366f1] to-[#10b981]"
                          style={{ width: `${t.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 5 Cols: Ingress Channels & Sentiment Ratio */}
              <div className="lg:col-span-5 space-y-4">
                {/* Ingress Channels */}
                <div className="rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-5 backdrop-blur-md space-y-3">
                  <div className="text-xs font-semibold text-white pb-2 border-b border-[#1e293b]">
                    Omnichannel Customer Ingress
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#030712] border border-[#1e293b]">
                      <div className="flex items-center space-x-1.5 text-[#10b981]">
                        <Radio className="h-3.5 w-3.5" />
                        <span className="font-semibold">WhatsApp</span>
                      </div>
                      <div className="text-xl font-bold font-mono text-white mt-1.5">
                        {analyticsData?.whatsAppConversations || sessions.filter(s => s.channel === 'whatsapp').length}
                      </div>
                      <div className="text-[10px] text-[#908fa0] mt-0.5">Meta Cloud API</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#030712] border border-[#1e293b]">
                      <div className="flex items-center space-x-1.5 text-[#818cf8]">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="font-semibold">Web Widget</span>
                      </div>
                      <div className="text-xl font-bold font-mono text-white mt-1.5">
                        {analyticsData?.webConversations || sessions.filter(s => s.channel === 'web').length}
                      </div>
                      <div className="text-[10px] text-[#908fa0] mt-0.5">Shadow DOM Embed</div>
                    </div>
                  </div>
                </div>

                {/* Sentiment Distribution */}
                <div className="rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-5 backdrop-blur-md space-y-3">
                  <div className="text-xs font-semibold text-white pb-2 border-b border-[#1e293b]">
                    Sentiment & Escalation Ratio
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#4edea3] flex items-center space-x-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Nominal & Satisfied (AI Resolved)</span>
                      </span>
                      <span className="font-mono text-white font-semibold">92%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#ffb4ab] flex items-center space-x-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Escalated to Human Concierge</span>
                      </span>
                      <span className="font-mono text-white font-semibold">8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPUTATION & GOOGLE REVIEW BOOSTER TAB */}
        {activeTab === 'reputation' && (
          <div className="space-y-6">
            {/* Top Command Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b0f19]/80 border border-[#1e293b] p-5 rounded-2xl backdrop-blur-md">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#fbbf24]">
                    <Star className="h-4 w-4 fill-[#fbbf24]" />
                  </div>
                  <h2 className="text-base font-bold text-white">Google Reviews Booster & CSAT Funnel</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30">
                    Dual Reputation Guardrail
                  </span>
                </div>
                <p className="text-xs text-[#908fa0] mt-1">
                  Automated post-service survey funnel: Promoters (4–5★) are routed directly to Google Maps, while Detractors (1–3★) are shielded from public reviews and escalated to care recovery.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href="https://g.page/r/apex-wellness-clinic/review"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#6366f1]/15 hover:bg-[#6366f1]/25 border border-[#6366f1]/30 text-[#818cf8] text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Google Maps Review Page</span>
                </a>
                <button
                  onClick={loadData}
                  className="p-1.5 rounded-lg bg-[#0f172a] border border-[#1e293b] text-[#908fa0] hover:text-white transition"
                  title="Refresh Metrics"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CSAT Score */}
              <div className="p-4 rounded-xl bg-[#0b0f19]/80 border border-[#1e293b] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#908fa0]">Patient CSAT Rating</span>
                  <span className="p-1.5 rounded-lg bg-[#10b981]/15 text-[#4edea3]">
                    <ThumbsUp className="h-4 w-4" />
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#4edea3] mt-2">
                  {feedbackOverview?.csatScore || 86}%
                </div>
                <div className="text-[11px] text-[#908fa0] mt-1">
                  4 & 5 Star ratings ({feedbackOverview?.promotersCount || 6} / {feedbackOverview?.totalResponses || 7})
                </div>
              </div>

              {/* Net Promoter Score (NPS) */}
              <div className="p-4 rounded-xl bg-[#0b0f19]/80 border border-[#1e293b] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#908fa0]">Net Promoter Score (NPS)</span>
                  <span className="p-1.5 rounded-lg bg-[#6366f1]/15 text-[#818cf8]">
                    <HeartHandshake className="h-4 w-4" />
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#818cf8] mt-2">
                  +{(feedbackOverview?.npsScore !== undefined) ? feedbackOverview.npsScore : 43}
                </div>
                <div className="text-[11px] text-[#10b981] mt-1">
                  World-Class Tier (Range: -100 to +100)
                </div>
              </div>

              {/* Google Review Conversion Rate */}
              <div className="p-4 rounded-xl bg-[#0b0f19]/80 border border-[#1e293b] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#908fa0]">Google Review Clicks</span>
                  <span className="p-1.5 rounded-lg bg-[#f59e0b]/15 text-[#fbbf24]">
                    <Star className="h-4 w-4 fill-[#fbbf24]" />
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-2">
                  {feedbackOverview?.googleReviewClicks || 3}{' '}
                  <span className="text-xs text-[#908fa0] font-normal font-sans">
                    ({feedbackOverview?.googleReviewClickRate || 75}% click rate)
                  </span>
                </div>
                <div className="text-[11px] text-[#fbbf24] mt-1">
                  From {feedbackOverview?.promotersCount || 4} 5-Star Promoters
                </div>
              </div>

              {/* Urgent Care Service Recovery */}
              <div className="p-4 rounded-xl bg-[#0b0f19]/80 border border-[#1e293b] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#908fa0]">Urgent Recovery Queue</span>
                  <span className="p-1.5 rounded-lg bg-[#f43f5e]/15 text-[#ffb4ab]">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#ffb4ab] mt-2">
                  {feedbackOverview?.urgentServiceRecoveryCount || 1} Pending
                </div>
                <div className="text-[11px] text-[#908fa0] mt-1">
                  Detractors shielded from Google Maps
                </div>
              </div>
            </div>

            {/* Smart Dual-Routing Architecture Banner */}
            <div className="p-5 rounded-2xl bg-[#030712] border border-[#1e293b] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  How Autonomous Reputation Routing Works
                </span>
                <span className="text-[10px] font-mono text-[#818cf8]">Zero Negative Public Leakage</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Promoter Path */}
                <div className="p-3.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 space-y-1.5">
                  <div className="flex items-center space-x-2 text-[#4edea3] font-semibold">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Rating 4 or 5 Stars ⭐⭐⭐⭐⭐ (Promoter Path)</span>
                  </div>
                  <p className="text-[11px] text-[#dfe2f1]">
                    The agent expresses heartfelt gratitude and instantly provides a direct 1-click link to your verified Google Business Profile review dialog, boosting your local SEO & organic leads.
                  </p>
                </div>

                {/* Detractor Path */}
                <div className="p-3.5 rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/30 space-y-1.5">
                  <div className="flex items-center space-x-2 text-[#ffb4ab] font-semibold">
                    <ThumbsDown className="h-4 w-4" />
                    <span>Rating 1, 2, or 3 Stars (Service Recovery Shield)</span>
                  </div>
                  <p className="text-[11px] text-[#dfe2f1]">
                    The agent suppresses the public Google review link, issues an empathetic apology, logs the grievance, and dispatches a high-priority alert to the clinic director for immediate personal recovery.
                  </p>
                </div>
              </div>
            </div>

            {/* Simulator & Live Feedback Table Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 4 Cols: Live Feedback Simulator */}
              <div className="lg:col-span-4 rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-5 backdrop-blur-md space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-[#1e293b]">
                  <Bot className="h-4 w-4 text-[#818cf8]" />
                  <span className="text-xs font-semibold text-white">Simulate Inbound Patient Rating</span>
                </div>

                <form onSubmit={handleSimulateFeedback} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[#908fa0] mb-1.5">Customer Rating (Stars):</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSimRating(star)}
                          className={`p-2 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                            simRating >= star
                              ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#fbbf24]'
                              : 'bg-[#030712] border-[#1e293b] text-[#908fa0]'
                          }`}
                        >
                          <Star className={`h-4 w-4 ${simRating >= star ? 'fill-[#fbbf24]' : ''}`} />
                        </button>
                      ))}
                      <span className="font-mono text-xs font-bold text-white ml-2">
                        {simRating} / 5
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#908fa0] mb-1">Customer Review Comment:</label>
                    <textarea
                      rows={3}
                      value={simComment}
                      onChange={(e) => setSimComment(e.target.value)}
                      className="w-full bg-[#030712] border border-[#1e293b] rounded-xl p-2.5 text-white placeholder-[#908fa0] focus:border-[#6366f1] outline-none text-xs"
                      placeholder="e.g. Loved the session or experienced long wait..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Processing Routing...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Rating via WhatsApp</span>
                        <Send className="h-3 w-3" />
                      </>
                    )}
                  </button>
                </form>

                {/* Simulated Outcome Preview */}
                {simResult && (
                  <div className="p-3.5 rounded-xl bg-[#030712] border border-[#1e293b] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-[#818cf8]">AI Response Preview</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        simResult.submission.category === 'promoter'
                          ? 'bg-[#10b981]/15 text-[#4edea3]'
                          : 'bg-[#f43f5e]/15 text-[#ffb4ab]'
                      }`}>
                        {simResult.submission.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#dfe2f1] whitespace-pre-line leading-relaxed">
                      {simResult.replyMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Right 8 Cols: Customer Reviews & Recovery Feed */}
              <div className="lg:col-span-8 rounded-2xl bg-[#0b0f19]/80 border border-[#1e293b] p-5 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-[#fbbf24]" />
                    <span className="text-xs font-semibold text-white">Recent Customer Reviews & Recovery Feed</span>
                  </div>
                  <span className="text-[10px] text-[#908fa0] font-mono">
                    {feedbackSubmissions.length} Submissions Tracked
                  </span>
                </div>

                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {feedbackSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className={`p-4 rounded-xl border space-y-2.5 transition ${
                        sub.category === 'promoter'
                          ? 'bg-[#030712] border-[#1e293b]'
                          : 'bg-[#f43f5e]/5 border-[#f43f5e]/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white text-xs">{sub.customerName}</span>
                          <span className="text-[10px] text-[#908fa0] font-mono">({sub.serviceName})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-[#fbbf24]">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < sub.rating ? 'fill-[#fbbf24]' : 'text-[#334155]'}`}
                              />
                            ))}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                            sub.routedTo === 'google_review'
                              ? 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30'
                              : 'bg-[#f43f5e]/15 text-[#ffb4ab] border border-[#f43f5e]/30'
                          }`}>
                            {sub.routedTo === 'google_review' ? 'Google Review Prompted' : 'Private Escalation Shield'}
                          </span>
                        </div>
                      </div>

                      {sub.comment && (
                        <p className="text-xs text-[#dfe2f1] italic bg-[#0b0f19]/50 p-2.5 rounded-lg border border-[#1e293b]/60">
                          "{sub.comment}"
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#1e293b]/50">
                        <span className="text-[#908fa0]">
                          {new Date(sub.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          {sub.routedTo === 'google_review' && sub.googleReviewClicked && (
                            <span className="text-[#10b981] font-mono text-[10px] flex items-center space-x-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Google Review Clicked</span>
                            </span>
                          )}

                          {sub.category === 'detractor' && sub.status === 'pending' && (
                            <button
                              onClick={() => handleResolveFeedback(sub.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#f43f5e]/20 hover:bg-[#f43f5e]/30 text-[#ffb4ab] border border-[#f43f5e]/40 text-[10px] font-semibold transition cursor-pointer"
                            >
                              Resolve / Callback Done
                            </button>
                          )}

                          {sub.category === 'detractor' && sub.status === 'resolved' && (
                            <span className="text-[#4edea3] text-[10px] flex items-center space-x-1">
                              <Check className="h-3 w-3" />
                              <span>Resolved by Manager</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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

      {/* Vector Chunks Inspector Modal */}
      {selectedDocChunks && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#0b0f19] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between bg-[#0f172a]/60">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center text-[#818cf8]">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Vector Chunks Inspector</h3>
                  <p className="text-xs text-[#908fa0] truncate max-w-md">{selectedDocChunks.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocChunks(null)}
                className="p-1.5 rounded-lg text-[#908fa0] hover:text-white hover:bg-[#1e293b] transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto">
              <div className="text-xs text-[#908fa0]">
                Document has <span className="font-semibold text-white">{selectedDocChunks.chunks.length}</span> indexed TF-IDF vector embeddings for zero-hallucination cosine retrieval:
              </div>

              {selectedDocChunks.chunks.map((chunk, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#030712] border border-[#1e293b] space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#818cf8] font-mono">
                    <span className="font-semibold">Chunk #{idx + 1} ({chunk.chunkId})</span>
                    <span>Tokens: ~{Math.round(chunk.text.length / 4)}</span>
                  </div>
                  <p className="text-[#dfe2f1] text-xs leading-relaxed font-mono bg-[#0b0f19] p-3 rounded-lg border border-[#1e293b]/70 whitespace-pre-wrap">
                    {chunk.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-6 py-3.5 border-t border-[#1e293b] bg-[#0f172a]/40 flex items-center justify-between">
              <span className="text-[11px] text-[#908fa0]">Threshold: 0.50 Cosine Confidence</span>
              <button
                onClick={() => setSelectedDocChunks(null)}
                className="px-3.5 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-semibold transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Self-Service Rescheduling & Magic-Link Portal Modal */}
      {showPortalModal && selectedPortalAppointmentId && (
        <SelfServicePortal
          appointmentId={selectedPortalAppointmentId}
          onClose={() => {
            setShowPortalModal(false);
            setSelectedPortalAppointmentId(null);
          }}
          onAppointmentUpdated={loadData}
        />
      )}

      {/* Walk-in Booking Creation Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center text-[#818cf8]">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create Walk-in / Direct Reservation</h3>
                  <p className="text-[11px] text-[#908fa0]">Lock in calendar slot and trigger instant confirmation</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWalkInModal(false)}
                className="p-1 rounded-lg text-[#908fa0] hover:text-white hover:bg-[#1e293b] transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#908fa0] mb-1 font-medium">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="e.g. Liam Henderson"
                    className="w-full bg-[#030712] border border-[#1e293b] rounded-xl px-3.5 py-2 text-white placeholder-[#908fa0] focus:border-[#6366f1] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#908fa0] mb-1 font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    placeholder="e.g. +1 (415) 555-0199"
                    className="w-full bg-[#030712] border border-[#1e293b] rounded-xl px-3.5 py-2 text-white placeholder-[#908fa0] focus:border-[#6366f1] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#908fa0] mb-1 font-medium">Email Address (Optional)</label>
                <input
                  type="email"
                  value={walkInEmail}
                  onChange={(e) => setWalkInEmail(e.target.value)}
                  placeholder="e.g. liam.h@example.com"
                  className="w-full bg-[#030712] border border-[#1e293b] rounded-xl px-3.5 py-2 text-white placeholder-[#908fa0] focus:border-[#6366f1] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#908fa0] mb-1 font-medium">Service / Treatment *</label>
                  <select
                    value={walkInService}
                    onChange={(e) => setWalkInService(e.target.value)}
                    className="w-full bg-[#030712] border border-[#1e293b] rounded-xl px-3.5 py-2 text-white focus:border-[#6366f1] outline-none cursor-pointer"
                  >
                    <option value="Medical & Longevity Consultation">Medical Consultation ($150)</option>
                    <option value="Whole-Body Cryo & Assessment">Whole-Body Cryotherapy ($85)</option>
                    <option value="Hydra-Facial Deluxe Treatment">Hydra-Facial Treatment ($180)</option>
                    <option value="Hyperbaric Oxygen Therapy (HBOT)">Hyperbaric Oxygen ($120)</option>
                    <option value="Laser Teeth Whitening">Laser Whitening ($220)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#908fa0] mb-1 font-medium">Assigned Specialist</label>
                  <select
                    value={walkInDoctor}
                    onChange={(e) => setWalkInDoctor(e.target.value)}
                    className="w-full bg-[#030712] border border-[#1e293b] rounded-xl px-3.5 py-2 text-white focus:border-[#6366f1] outline-none cursor-pointer"
                  >
                    <option value="Dr. Marcus Vance">Dr. Marcus Vance (Longevity)</option>
                    <option value="Dr. Ananya Ray">Dr. Ananya Ray (Aesthetics)</option>
                    <option value="Dr. Elena Rostova">Dr. Elena Rostova (Diagnostics)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#908fa0] mb-1 font-medium">Date *</label>
                  <input
                    type="date"
                    required
                    value={walkInDate}
                    onChange={(e) => setWalkInDate(e.target.value)}
                    className="w-full bg-[#030712] border border-[#1e293b] rounded-xl px-3.5 py-2 text-white focus:border-[#6366f1] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#908fa0] mb-1 font-medium">Time Slot (IST) *</label>
                  <select
                    value={walkInTime}
                    onChange={(e) => setWalkInTime(e.target.value)}
                    className="w-full bg-[#030712] border border-[#1e293b] rounded-xl px-3.5 py-2 text-white focus:border-[#6366f1] outline-none cursor-pointer"
                  >
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:30">03:30 PM</option>
                    <option value="16:15">04:15 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#908fa0] mb-1 font-medium">Front Desk Notes</label>
                <textarea
                  rows={2}
                  value={walkInNotes}
                  onChange={(e) => setWalkInNotes(e.target.value)}
                  placeholder="e.g. Walk-in customer at reception, requested Dr. Vance."
                  className="w-full bg-[#030712] border border-[#1e293b] rounded-xl px-3.5 py-2 text-white placeholder-[#908fa0] focus:border-[#6366f1] outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 rounded-xl text-[#908fa0] hover:bg-[#1e293b] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingWalkIn}
                  className="px-4 py-2 rounded-xl bg-[#6366f1] hover:bg-[#818cf8] text-white font-semibold transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isCreatingWalkIn ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Locking Slot...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Confirm Reservation</span>
                    </>
                  )}
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
