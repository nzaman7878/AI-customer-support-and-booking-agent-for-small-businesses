import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  FileText, 
  Check, 
  Copy, 
  ExternalLink, 
  Download, 
  ArrowLeft, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Terminal, 
  Server, 
  Database, 
  Code, 
  Rocket, 
  AlertCircle,
  Menu,
  X,
  Clock,
  Tag,
  ChevronRight
} from 'lucide-react';
import { DOCS_INDEX, DocFile } from '../data/docsData';

interface DocsViewerProps {
  initialDoc?: string;
}

export default function DocsViewer({ initialDoc = 'PRD.md' }: DocsViewerProps) {
  const [selectedFilename, setSelectedFilename] = useState<string>(initialDoc);
  const [searchQuery, setSearchQuery] = useState('');
  const [docContent, setDocContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeDoc = useMemo(() => {
    return DOCS_INDEX.find(d => d.filename.toLowerCase() === selectedFilename.toLowerCase()) || DOCS_INDEX[0];
  }, [selectedFilename]);

  // Load content from API or fetch
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    async function fetchDoc() {
      try {
        const res = await fetch(`/api/docs/${activeDoc.filename}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.content) {
            setDocContent(data.content);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fallback to static resolution if API is offline
      }

      if (!isCancelled) {
        // Fallback default message if loading fails
        setDocContent(`# ${activeDoc.title}\n\nLoading documentation from \`docs/${activeDoc.filename}\`...\n\n> [!NOTE]\n> Real-time content synchronized from the repository filesystem.`);
        setIsLoading(false);
      }
    }

    fetchDoc();
    return () => {
      isCancelled = true;
    };
  }, [activeDoc.filename]);

  // Filtered documents by search query
  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return DOCS_INDEX;
    const q = searchQuery.toLowerCase().trim();
    return DOCS_INDEX.filter(d => 
      d.title.toLowerCase().includes(q) ||
      d.filename.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Grouped documents for the sidebar
  const categories = useMemo(() => {
    const map: Record<string, { label: string; docs: DocFile[] }> = {
      specifications: { label: 'Core Specifications', docs: [] },
      api_integrations: { label: 'APIs, Integrations & Data', docs: [] },
      security_ops: { label: 'Security, Testing & Ops', docs: [] },
      production_dev: { label: 'Setup, Roadmap & Go-Live', docs: [] }
    };

    filteredDocs.forEach(d => {
      if (map[d.category]) {
        map[d.category].docs.push(d);
      }
    });

    return Object.entries(map).filter(([_, group]) => group.docs.length > 0);
  }, [filteredDocs]);

  // Current doc index for pagination
  const currentIndex = DOCS_INDEX.findIndex(d => d.filename === activeDoc.filename);
  const prevDoc = currentIndex > 0 ? DOCS_INDEX[currentIndex - 1] : null;
  const nextDoc = currentIndex < DOCS_INDEX.length - 1 ? DOCS_INDEX[currentIndex + 1] : null;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(docContent);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const handleDownloadDoc = () => {
    const blob = new Blob([docContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeDoc.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDocIcon = (category: string) => {
    switch (category) {
      case 'specifications': return Layers;
      case 'api_integrations': return Code;
      case 'security_ops': return ShieldCheck;
      case 'production_dev': return Rocket;
      default: return FileText;
    }
  };

  // Click handler for in-markdown cross document links
  const handleDocLinkClick = (filename: string) => {
    const target = DOCS_INDEX.find(d => 
      d.filename.toLowerCase() === filename.toLowerCase() || 
      filename.toLowerCase().includes(d.filename.toLowerCase())
    );
    if (target) {
      setSelectedFilename(target.filename);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Custom Lightweight Markdown Parser
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeLines: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeaders: string[] = [];
    let snippetCount = 0;

    const flushTable = (key: string) => {
      if (!inTable) return;
      elements.push(
        <div key={key} className="my-5 overflow-x-auto rounded-xl border border-[#1e293b] bg-[#0b0f19]">
          <table className="w-full text-left text-xs text-[#908fa0]">
            <thead className="bg-[#0f131d] text-white border-b border-[#1e293b]">
              <tr>
                {tableHeaders.map((th, i) => (
                  <th key={i} className="px-4 py-3 font-semibold tracking-wider border-r border-[#1e293b]/50 last:border-r-0">
                    {th.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/50">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#1e293b]/20 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 font-normal border-r border-[#1e293b]/30 last:border-r-0">
                      {parseInlineFormatting(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableRows = [];
      tableHeaders = [];
    };

    const flushCodeBlock = (key: string) => {
      if (!inCodeBlock) return;
      const codeSnippet = codeLines.join('\n');
      const currentSnippetIndex = snippetCount++;
      elements.push(
        <div key={key} className="my-5 rounded-xl border border-[#1e293b] bg-[#030712] overflow-hidden group">
          <div className="flex items-center justify-between px-4 py-2 bg-[#0f131d] border-b border-[#1e293b] text-[11px] text-[#908fa0] font-mono">
            <span className="flex items-center space-x-1.5 uppercase font-semibold text-[#818cf8]">
              <Terminal className="h-3 w-3" />
              <span>{codeLanguage || 'code'}</span>
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(codeSnippet);
                setCopiedSnippetIdx(currentSnippetIndex);
                setTimeout(() => setCopiedSnippetIdx(null), 2000);
              }}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#1e293b]/50 hover:bg-[#1e293b] text-white hover:text-[#818cf8] transition cursor-pointer"
            >
              {copiedSnippetIdx === currentSnippetIndex ? (
                <>
                  <Check className="h-3 w-3 text-[#10b981]" />
                  <span className="text-[10px] text-[#10b981]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-[#e2e8f0] overflow-x-auto leading-relaxed">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      );
      inCodeBlock = false;
      codeLanguage = '';
      codeLines = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code Block Detection
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock(`code_${i}`);
        } else {
          if (inTable) flushTable(`table_${i}`);
          inCodeBlock = true;
          codeLanguage = line.replace('```', '').trim();
          codeLines = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Markdown Table Detection
      if (line.includes('|') && line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const parts = line.split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (lines[i + 1] && lines[i + 1].includes('---')) {
          // Table header row
          flushTable(`table_pre_${i}`);
          inTable = true;
          tableHeaders = parts;
          i++; // Skip delimiter row
          continue;
        } else if (inTable) {
          tableRows.push(parts);
          continue;
        }
      } else if (inTable) {
        flushTable(`table_${i}`);
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1_${i}`} className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-8 mb-4 border-b border-[#1e293b] pb-3">
            {parseInlineFormatting(line.replace('# ', ''))}
          </h1>
        );
        continue;
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2_${i}`} className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-7 mb-3 flex items-center space-x-2">
            <span className="text-[#6366f1]">§</span>
            <span>{parseInlineFormatting(line.replace('## ', ''))}</span>
          </h2>
        );
        continue;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3_${i}`} className="text-base sm:text-lg font-semibold text-[#818cf8] mt-6 mb-2">
            {parseInlineFormatting(line.replace('### ', ''))}
          </h3>
        );
        continue;
      }

      // Blockquotes & GitHub Alerts
      if (line.startsWith('> [!NOTE]')) {
        const noteText = lines[i + 1]?.replace(/^>\s*/, '') || '';
        elements.push(
          <div key={`alert_note_${i}`} className="my-4 p-4 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/30 text-xs text-[#c7d2fe] flex items-start space-x-3">
            <AlertCircle className="h-4 w-4 text-[#818cf8] mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-[#818cf8] uppercase tracking-wider text-[10px] mb-0.5">Note</div>
              <div>{parseInlineFormatting(noteText)}</div>
            </div>
          </div>
        );
        i++;
        continue;
      }

      if (line.startsWith('> [!TIP]')) {
        const tipText = lines[i + 1]?.replace(/^>\s*/, '') || '';
        elements.push(
          <div key={`alert_tip_${i}`} className="my-4 p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-xs text-[#a7f3d0] flex items-start space-x-3">
            <Check className="h-4 w-4 text-[#10b981] mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-[#10b981] uppercase tracking-wider text-[10px] mb-0.5">Pro Tip</div>
              <div>{parseInlineFormatting(tipText)}</div>
            </div>
          </div>
        );
        i++;
        continue;
      }

      if (line.startsWith('> [!WARNING]')) {
        const warnText = lines[i + 1]?.replace(/^>\s*/, '') || '';
        elements.push(
          <div key={`alert_warn_${i}`} className="my-4 p-4 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-xs text-[#fde68a] flex items-start space-x-3">
            <AlertCircle className="h-4 w-4 text-[#f59e0b] mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-[#f59e0b] uppercase tracking-wider text-[10px] mb-0.5">Warning</div>
              <div>{parseInlineFormatting(warnText)}</div>
            </div>
          </div>
        );
        i++;
        continue;
      }

      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={`quote_${i}`} className="my-3 pl-4 border-l-2 border-[#6366f1] italic text-xs text-[#908fa0]">
            {parseInlineFormatting(line.replace('> ', ''))}
          </blockquote>
        );
        continue;
      }

      // Horizontal Rules
      if (line.trim() === '---') {
        elements.push(<hr key={`hr_${i}`} className="my-6 border-[#1e293b]" />);
        continue;
      }

      // Bullet Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().replace(/^[-*]\s+/, '');
        elements.push(
          <div key={`li_${i}`} className="flex items-start space-x-2 my-1.5 text-xs text-[#cbd5e1] leading-relaxed">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1] mt-1.5 shrink-0" />
            <span>{parseInlineFormatting(itemText)}</span>
          </div>
        );
        continue;
      }

      // Numbered Lists
      if (/^\d+\.\s/.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s+(.*)/);
        if (match) {
          elements.push(
            <div key={`oli_${i}`} className="flex items-start space-x-2 my-1.5 text-xs text-[#cbd5e1] leading-relaxed">
              <span className="font-mono text-[#818cf8] font-bold text-xs shrink-0">{match[1]}.</span>
              <span>{parseInlineFormatting(match[2])}</span>
            </div>
          );
          continue;
        }
      }

      // Regular Paragraphs
      if (line.trim()) {
        elements.push(
          <p key={`p_${i}`} className="my-2.5 text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
            {parseInlineFormatting(line)}
          </p>
        );
      }
    }

    if (inCodeBlock) flushCodeBlock('code_final');
    if (inTable) flushTable('table_final');

    return elements;
  };

  // Helper for inline styling: bold, inline code, cross-links
  const parseInlineFormatting = (text: string): React.ReactNode => {
    // Process markdown links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(parseSimpleTokens(text.substring(lastIdx, match.index)));
      }

      const linkLabel = match[1];
      const linkUrl = match[2];

      // Check if it's an internal doc link like ARCHITECTURE.md or file:///.../API.md
      const isInternalDoc = DOCS_INDEX.some(d => 
        linkUrl.toLowerCase().includes(d.filename.toLowerCase()) || 
        linkLabel.toLowerCase().includes(d.filename.toLowerCase())
      );

      if (isInternalDoc) {
        const matchedDoc = DOCS_INDEX.find(d => 
          linkUrl.toLowerCase().includes(d.filename.toLowerCase()) || 
          linkLabel.toLowerCase().includes(d.filename.toLowerCase())
        );
        parts.push(
          <button
            key={`link_${match.index}`}
            onClick={() => handleDocLinkClick(matchedDoc ? matchedDoc.filename : linkLabel)}
            className="text-[#818cf8] hover:text-white underline underline-offset-2 font-medium cursor-pointer transition inline-flex items-center space-x-0.5"
          >
            <span>{linkLabel}</span>
            <ExternalLink className="h-2.5 w-2.5 ml-0.5 opacity-70" />
          </button>
        );
      } else {
        parts.push(
          <a
            key={`ext_${match.index}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6366f1] hover:text-[#818cf8] underline underline-offset-2 transition inline-flex items-center space-x-0.5"
          >
            <span>{linkLabel}</span>
            <ExternalLink className="h-2.5 w-2.5 ml-0.5 opacity-70" />
          </a>
        );
      }

      lastIdx = linkRegex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(parseSimpleTokens(text.substring(lastIdx)));
    }

    return parts.length > 0 ? parts : parseSimpleTokens(text);
  };

  // Parses `inline code` and **bold**
  const parseSimpleTokens = (str: string): React.ReactNode => {
    // Split by code backticks `...`
    const codeTokens = str.split(/(`[^`]+`)/);
    return codeTokens.map((token, idx) => {
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={idx} className="font-mono text-[11px] text-[#818cf8] bg-[#6366f1]/10 border border-[#6366f1]/20 px-1.5 py-0.5 rounded">
            {token.slice(1, -1)}
          </code>
        );
      }
      
      // Parse **bold**
      const boldTokens = token.split(/(\*\*[^*]+\*\*)/);
      return boldTokens.map((bToken, bIdx) => {
        if (bToken.startsWith('**') && bToken.endsWith('**')) {
          return <strong key={bIdx} className="font-semibold text-white">{bToken.slice(2, -2)}</strong>;
        }
        return bToken;
      });
    });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)] gap-6 font-sans">
      {/* Mobile Drawer Trigger Bar */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-[#0b0f19] border border-[#1e293b] rounded-2xl">
        <div className="flex items-center space-x-2.5">
          <BookOpen className="h-4 w-4 text-[#818cf8]" />
          <span className="text-xs font-semibold text-white truncate">{activeDoc.title}</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg bg-[#1e293b] text-white hover:text-[#818cf8] transition cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Sidebar: Documentation Navigation */}
      <div className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block
        w-full lg:w-80 shrink-0 bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-4 flex flex-col h-fit lg:sticky lg:top-6
      `}>
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#313131]">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-[#818cf8]" />
            <span className="text-xs font-semibold text-white tracking-wide">Documentation navigation</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#272727] text-[#818cf8] border border-[#313131]">
            {DOCS_INDEX.length} Specs
          </span>
        </div>

        {/* Live Search Filter Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8c8c8c]" />
          <input
            type="text"
            placeholder="Search specs, APIs, guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1f1f1f] border border-[#313131] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#8c8c8c] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition"
          />
        </div>

        {/* Grouped Category Nav Lists */}
        <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {categories.map(([catKey, group]) => (
            <div key={catKey}>
              <div className="text-[10px] font-semibold text-[#8c8c8c] px-2 mb-1.5 flex items-center justify-between">
                <span>{group.label}</span>
                <span className="text-[9px] font-mono">{group.docs.length}</span>
              </div>
              <div className="space-y-0.5">
                {group.docs.map(doc => {
                  const Icon = getDocIcon(doc.category);
                  const isSelected = doc.filename === activeDoc.filename;
                  return (
                    <button
                      key={doc.filename}
                      onClick={() => {
                        setSelectedFilename(doc.filename);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] ${
                        isSelected
                          ? 'bg-[#272727] border border-[#313131] text-white font-medium'
                          : 'hover:bg-[#1f1f1f] text-[#8c8c8c] hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-[#818cf8]' : 'text-[#8c8c8c] group-hover:text-white'}`} />
                        <div className="truncate">
                          <div className={`text-xs truncate ${isSelected ? 'text-white' : ''}`}>
                            {doc.title.split('(')[0].trim()}
                          </div>
                          <div className="text-[10px] font-mono text-[#8c8c8c] opacity-80">
                            {doc.filename}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`h-3 w-3 shrink-0 ml-1 transition-transform ${isSelected ? 'text-[#818cf8] translate-x-0.5' : 'opacity-0 group-hover:opacity-100'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Document Content Pane */}
      <div className="flex-1 bg-[#181818] border border-[#313131] rounded-2xl p-6 sm:p-8 flex flex-col relative overflow-hidden">
        {/* Top Breadcrumb & Metadata Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#313131] gap-3">
          <div className="flex items-center space-x-2 text-xs text-[#8c8c8c]">
            <BookOpen className="h-3.5 w-3.5 text-[#818cf8]" />
            <span>Docs</span>
            <span>/</span>
            <span className="text-white font-medium">{activeDoc.categoryLabel}</span>
            <span>/</span>
            <span className="font-mono text-[#818cf8]">{activeDoc.filename}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 text-[11px] text-[#8c8c8c] bg-[#1f1f1f] px-2.5 py-1 rounded-md border border-[#313131]">
              <Clock className="h-3 w-3 text-[#818cf8]" />
              <span>{activeDoc.readTimeMinutes} min read</span>
            </span>
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#272727] hover:bg-[#313131] border border-[#313131] text-white text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
              title="Copy entire raw markdown"
            >
              {copiedDoc ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#10b981]" />
                  <span className="text-[#10b981]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#8c8c8c]" />
                  <span>Copy markdown</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadDoc}
              className="p-1.5 rounded-lg bg-[#272727] hover:bg-[#313131] border border-[#313131] text-white transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
              title="Download Markdown file"
            >
              <Download className="h-3.5 w-3.5 text-[#8c8c8c]" />
            </button>
          </div>
        </div>

        {/* Document Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#272727] text-[#818cf8] border border-[#313131] font-semibold">
            {activeDoc.badge || 'Document'}
          </span>
          {activeDoc.tags.map(t => (
            <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#030712] text-[#908fa0] border border-[#1e293b]">
              #{t}
            </span>
          ))}
        </div>

        {/* Rendered Document Body */}
        <div className="prose prose-invert max-w-none flex-1">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#908fa0] space-y-3">
              <div className="h-6 w-6 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
              <div className="text-xs">Loading specification from repository...</div>
            </div>
          ) : (
            renderMarkdown(docContent)
          )}
        </div>

        {/* Bottom Pagination Links */}
        <div className="mt-12 pt-6 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
          {prevDoc ? (
            <button
              onClick={() => {
                setSelectedFilename(prevDoc.filename);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto flex items-center space-x-3 p-3 rounded-xl bg-[#030712] border border-[#1e293b] hover:border-[#6366f1]/50 text-left transition group cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-[#908fa0] group-hover:text-[#818cf8] group-hover:-translate-x-1 transition-transform" />
              <div>
                <div className="text-[10px] uppercase font-bold text-[#908fa0] tracking-wider">Previous Specification</div>
                <div className="text-xs font-semibold text-white group-hover:text-[#818cf8]">{prevDoc.title}</div>
              </div>
            </button>
          ) : <div />}

          {nextDoc ? (
            <button
              onClick={() => {
                setSelectedFilename(nextDoc.filename);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto flex items-center justify-end space-x-3 p-3 rounded-xl bg-[#030712] border border-[#1e293b] hover:border-[#6366f1]/50 text-right transition group cursor-pointer"
            >
              <div>
                <div className="text-[10px] uppercase font-bold text-[#908fa0] tracking-wider">Next Specification</div>
                <div className="text-xs font-semibold text-white group-hover:text-[#818cf8]">{nextDoc.title}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#908fa0] group-hover:text-[#818cf8] group-hover:translate-x-1 transition-transform" />
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
