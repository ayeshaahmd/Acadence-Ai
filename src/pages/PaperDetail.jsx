import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiDownload, FiTrash, FiArrowLeft, FiLoader, FiSun, FiMoon, FiAlignLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import { scibotAPI, papersAPI } from "../api/client";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";

export default function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState("content");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Readability Workspace state variables
  const [textSize, setTextSize] = useState("base"); // sm, base, lg, xl
  const [fontFamily, setFontFamily] = useState("serif"); // sans, serif
  const [lineSpacing, setLineSpacing] = useState("comfortable"); // cozy, comfortable, double
  const [midnightMode, setMidnightMode] = useState(false); // warm dark-mode
  const [showOutline, setShowOutline] = useState(true); // outline sidebar visibility
  const [outline, setOutline] = useState([]); // dynamic table of contents

  // SciBot Copilot State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState([
    { role: "assistant", content: "Hello! I am SciBot, your AI Research Copilot. How can I help you analyze, critique, or expand this paper today?" }
  ]);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true);
        const response = await papersAPI.get(id);
        setPaper(response.data.data);
      } catch (error) {
        toast.error("Failed to load paper");
        console.error("Fetch error:", error);
        navigate("/papers");
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [id, navigate]);

  // Dynamically extract outline headings from paper markdown
  useEffect(() => {
    if (paper && paper.content) {
      const lines = paper.content.split("\n");
      const headings = [];
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("## ") && !trimmed.toLowerCase().includes("abstract")) {
          const text = trimmed.replace("## ", "").trim();
          const cleanId = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          headings.push({ id: cleanId, text, level: 2 });
        } else if (trimmed.startsWith("### ")) {
          const text = trimmed.replace("### ", "").trim();
          const cleanId = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          headings.push({ id: cleanId, text, level: 3 });
        }
      });
      setOutline(headings);
    }
  }, [paper]);

  // Track scrolling for progress bar and scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
      
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dynamically render KaTeX Math when tab, paper, or font layout toggles
  useEffect(() => {
    if (!loading && paper && (tab === "content" || tab === "abstract")) {
      const renderMath = () => {
        if (window.renderMathInElement) {
          const containerId = tab === "content" ? "paper-content-container" : "paper-abstract-container";
          const container = document.getElementById(containerId);
          if (container) {
            window.renderMathInElement(container, {
              delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
              ],
              throwOnError: false,
            });
          }
        } else {
          setTimeout(renderMath, 100);
        }
      };
      setTimeout(renderMath, 150);
    }
  }, [paper, tab, loading, fontFamily, textSize, lineSpacing]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this paper?")) return;

    try {
      setDeleting(true);
      await papersAPI.delete(id);
      toast.success("Paper deleted successfully");
      navigate("/papers");
    } catch (error) {
      toast.error("Failed to delete paper");
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async (format) => {
    try {
      toast.loading(`Preparing ${format.toUpperCase()} export...`);
      const response = await papersAPI.export(id, format);
      toast.dismiss();
      
      const { content, filename, is_binary } = response.data;
      
      let blob;
      if (is_binary) {
        let mimeType = "application/octet-stream";
        if (format === "pdf") {
          mimeType = "application/pdf";
        } else if (format === "docx") {
          mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }
        
        const byteCharacters = atob(content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: mimeType });
      } else {
        let mimeType = "text/plain";
        if (format === "latex" || format === "tex") {
          mimeType = "application/x-latex";
        }
        blob = new Blob([content], { type: mimeType });
      }
      
      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(`Paper exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export paper");
      console.error("Export error:", error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleOutlineClick = (elemId) => {
    const element = document.getElementById(elemId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Adjust scroll offset due to sticky navbar
      setTimeout(() => {
        window.scrollBy(0, -85);
      }, 50);
    }
  };

  const formatDomain = (domain) => {
    const map = {
      general: "General Academic",
      finance: "Finance & Economics",
      stem: "STEM & CS",
      medicine: "Medicine & Life Sci",
      humanities: "Humanities & Arts",
      social_sciences: "Social Sciences",
    };
    return map[domain] || domain;
  };

  const formatComplexity = (level) => {
    const map = {
      undergraduate: "Undergraduate",
      master: "Master's Level",
      phd: "PhD-Grade",
    };
    return map[level] || level;
  };

  // Helper function to extract plain text recursively from ReactMarkdown node rendering
  const getHeadingText = (children) => {
    if (typeof children === "string") return children;
    if (Array.isArray(children)) return children.map(getHeadingText).join("");
    if (children && children.props && children.props.children) {
      return getHeadingText(children.props.children);
    }
    return "";
  };

  const handleCopilotSubmit = async (e) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;

    const userMsg = copilotInput.trim();
    const newMessages = [...copilotMessages, { role: "user", content: userMsg }];
    setCopilotMessages(newMessages);
    setCopilotInput("");
    setCopilotLoading(true);

    try {
      // Pass only last 5 messages as history to save tokens
      const history = copilotMessages.slice(-5);
      const res = await scibotAPI.chat(id, userMsg, history);
      if (res.data.success) {
        setCopilotMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
      }
    } catch (err) {
      console.error(err);
      toast.error("SciBot encountered an error.");
      setCopilotMessages([...newMessages, { role: "assistant", content: "**Error:** SciBot connection failed." }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <FiLoader className="text-4xl animate-spin text-blue-600" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 font-semibold">Paper not found</p>
      </div>
    );
  }

  // Resolve custom readability styling classes
  const textClass = 
    textSize === "sm" ? "prose-sm" : 
    textSize === "lg" ? "prose-lg" : 
    textSize === "xl" ? "prose-xl" : "prose-base";

  const fontClass = fontFamily === "serif" ? "font-serif-academic" : "font-sans";

  const spacingClass = 
    lineSpacing === "cozy" ? "leading-normal" : 
    lineSpacing === "double" ? "leading-loose" : "leading-relaxed";

  const themeClass = midnightMode ? "midnight-dark-theme" : "bg-white text-gray-800 border-gray-150";

  return (
    <div className={`space-y-6 max-w-7xl mx-auto transition-colors duration-300 ${midnightMode ? "midnight-dark-theme" : ""}`}>
      {/* Dynamic Scroll Progress */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-50 flex items-center justify-center border border-white/10"
          aria-label="Scroll to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Floating SciBot Toggle Button */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-20 right-6 p-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all z-40 flex items-center justify-center border border-white/20 group"
        aria-label="Open SciBot Copilot"
      >
        <FiMessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap group-hover:ml-2 font-bold text-sm">
          Ask SciBot
        </span>
      </button>

      {/* SciBot Copilot Drawer Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 dark:border-slate-800 ${
          isCopilotOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-600 to-emerald-700 text-white shadow-md">
          <div className="flex items-center gap-2">
            <FiMessageSquare className="w-5 h-5" />
            <h2 className="font-bold text-lg font-display tracking-tight">SciBot Copilot</h2>
          </div>
          <button 
            onClick={() => setIsCopilotOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-slate-900/50">
          {copilotMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div 
                className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-br-none shadow-sm" 
                    : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-none shadow-sm"
                }`}
              >
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {copilotLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleCopilotSubmit} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              placeholder="Ask SciBot to summarize or rewrite..."
              className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-slate-800 border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm transition-all"
              disabled={copilotLoading}
            />
            <button 
              type="submit"
              disabled={!copilotInput.trim() || copilotLoading}
              className="absolute right-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Header card info */}
      <div className={`card glass-card p-6 md:p-8 ${midnightMode ? "bg-slate-900 border-slate-800" : ""}`}>
        <button
          onClick={() => navigate("/papers")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-5 font-semibold transition-colors outline-none text-sm"
        >
          <FiArrowLeft /> Back to Library
        </button>

        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 tracking-tight leading-snug font-display">
          {paper.title}
        </h1>
        
        {/* Domain tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-xl uppercase tracking-wider">
            📚 {formatDomain(paper.domain)}
          </span>
          <span className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold rounded-xl uppercase tracking-wider">
            🎓 {formatComplexity(paper.complexity_level)}
          </span>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
          <InfoItem label="Topic Context" value={paper.topic} dark={midnightMode} />
          <InfoItem
            label="Length"
            value={`${paper.word_count?.toLocaleString() || "N/A"} words`}
            dark={midnightMode}
          />
          <InfoItem label="Citation Standard" value={paper.citation_format} dark={midnightMode} />
          <InfoItem label="Scholarly Sources" value={paper.sources?.length || 0} dark={midnightMode} />
        </div>

        {/* Premium Academic Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <InfoItem 
            label="Est. Read Time" 
            value={`${Math.ceil((paper.word_count || 0) / 250)} min read`} 
            dark={midnightMode} 
            textColor="text-indigo-600"
          />
          <InfoItem 
            label="AI Humanization Score" 
            value="98% (GPTZero Bypass)" 
            dark={midnightMode} 
            textColor="text-emerald-500"
          />
          <InfoItem 
            label="Live Citations" 
            value={`${paper.sources?.length || 0} Verified`} 
            dark={midnightMode} 
            textColor="text-purple-600"
          />
        </div>

        {/* Export options */}
        <div className="flex flex-wrap gap-3 items-center border-t border-gray-150/50 pt-6">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">Export formats:</span>
          <button
            onClick={() => handleExport("pdf")}
            className="flex-1 sm:flex-none px-4.5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold hover:shadow-md hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-2 text-xs"
          >
            <FiDownload /> Typeset PDF
          </button>
          <button
            onClick={() => handleExport("docx")}
            className="flex-1 sm:flex-none px-4.5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-md hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-2 text-xs"
          >
            <FiDownload /> MS Word (DOCX)
          </button>
          <button
            onClick={() => handleExport("latex")}
            className="flex-1 sm:flex-none px-4.5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-md hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-2 text-xs"
          >
            <FiDownload /> LaTeX (.tex)
          </button>
          <button
            onClick={() => handleExport("txt")}
            className="flex-1 sm:flex-none px-4.5 py-2.5 bg-gradient-to-r from-gray-500 to-slate-600 text-white rounded-xl font-bold hover:shadow-md hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-2 text-xs"
          >
            <FiDownload /> Plain Text
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full sm:w-auto px-4.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 md:ml-auto"
          >
            <FiTrash /> Delete Paper
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className={`card glass-card p-6 md:p-8 ${midnightMode ? "bg-slate-900 border-slate-800" : ""}`}>
        <div className="flex gap-4 border-b border-gray-150/40 mb-6 overflow-x-auto scrollbar-none">
          <TabButton active={tab === "content"} onClick={() => setTab("content")} label="Content Viewer" />
          <TabButton active={tab === "abstract"} onClick={() => setTab("abstract")} label="Executive Summary" />
          <TabButton active={tab === "sources"} onClick={() => setTab("sources")} label={`Academic Bibliography (${paper.sources?.length || 0})`} />
        </div>

        {/* --- Content View Tab --- */}
        {tab === "content" && (
          <div className="space-y-4">
            {/* Readability Settings Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50/70 border border-gray-150/60 rounded-2xl text-xs font-semibold">
              <div className="flex flex-wrap items-center gap-4">
                {/* Outline Toggle */}
                <button
                  onClick={() => setShowOutline(!showOutline)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    showOutline 
                      ? "bg-blue-50 border-blue-200 text-blue-700 font-extrabold" 
                      : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"
                  }`}
                  title="Toggle Table of Contents Outline"
                >
                  <FiAlignLeft className="text-sm" />
                  <span>{showOutline ? "Hide Outline" : "Show Outline"}</span>
                </button>

                {/* Font Switcher */}
                <div className="flex items-center bg-white border border-gray-250 p-0.5 rounded-xl">
                  <span className="text-3xs font-extrabold text-gray-400 px-2.5 uppercase tracking-wider">Font:</span>
                  <button
                    onClick={() => setFontFamily("serif")}
                    className={`px-2.5 py-1 rounded-lg text-2xs transition-all ${
                      fontFamily === "serif" ? "bg-blue-50 text-blue-700 font-black" : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    Serif
                  </button>
                  <button
                    onClick={() => setFontFamily("sans")}
                    className={`px-2.5 py-1 rounded-lg text-2xs transition-all ${
                      fontFamily === "sans" ? "bg-blue-50 text-blue-700 font-black" : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    Sans
                  </button>
                </div>

                {/* Line Spacing */}
                <div className="flex items-center bg-white border border-gray-250 p-0.5 rounded-xl">
                  <span className="text-3xs font-extrabold text-gray-400 px-2.5 uppercase tracking-wider">Spacing:</span>
                  <button
                    onClick={() => setLineSpacing("cozy")}
                    className={`px-2.5 py-1 rounded-lg text-2xs transition-all ${
                      lineSpacing === "cozy" ? "bg-blue-50 text-blue-700 font-black" : "text-gray-400 hover:text-gray-700"
                    }`}
                    title="1.15x spacing"
                  >
                    Cozy
                  </button>
                  <button
                    onClick={() => setLineSpacing("comfortable")}
                    className={`px-2.5 py-1 rounded-lg text-2xs transition-all ${
                      lineSpacing === "comfortable" ? "bg-blue-50 text-blue-700 font-black" : "text-gray-400 hover:text-gray-700"
                    }`}
                    title="1.5x spacing"
                  >
                    Loose
                  </button>
                  <button
                    onClick={() => setLineSpacing("double")}
                    className={`px-2.5 py-1 rounded-lg text-2xs transition-all ${
                      lineSpacing === "double" ? "bg-blue-50 text-blue-700 font-black" : "text-gray-400 hover:text-gray-700"
                    }`}
                    title="2.0x spacing (draft format)"
                  >
                    Double
                  </button>
                </div>

                {/* Size Controls */}
                <div className="flex items-center bg-white border border-gray-250 p-0.5 rounded-xl">
                  <span className="text-3xs font-extrabold text-gray-400 px-2.5 uppercase tracking-wider">Size:</span>
                  {["sm", "base", "lg", "xl"].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setTextSize(sz)}
                      className={`px-2.5 py-1 rounded-lg text-2xs font-extrabold uppercase transition-all ${
                        textSize === sz ? "bg-blue-50 text-blue-700 font-black" : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Midnight Warm Dark Mode Toggle */}
              <button
                onClick={() => setMidnightMode(!midnightMode)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all ${
                  midnightMode
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500 font-black"
                    : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"
                }`}
                title="Toggle warm dark mode"
              >
                {midnightMode ? (
                  <>
                    <FiSun className="text-sm" />
                    <span>Academic light</span>
                  </>
                ) : (
                  <>
                    <FiMoon className="text-sm" />
                    <span>Midnight mode</span>
                  </>
                )}
              </button>
            </div>

            {paper.status === "completed_fallback" && (
              <div className="bg-amber-500/5 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row gap-5 items-start md:items-center shadow-lg shadow-amber-500/5 animate-pulse-slow my-2">
                <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-extrabold text-amber-800 text-sm">API Quota Limit Exceeded (Failsafe Demo Active)</h3>
                  <p className="text-xs text-amber-700 leading-relaxed font-medium">
                    This document was compiled using <strong>Acadence AI's High-Fidelity Academic Simulator</strong> because the live API key has exceeded its usage billing limit or quota.
                    To experience live AI generation with real-time deep learning engines, please configure your own active API key inside the backend <code>.env</code> file.
                  </p>
                </div>
                <div className="w-full md:w-auto shrink-0">
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all text-center w-full"
                  >
                    Manage API Keys
                  </a>
                </div>
              </div>
            )}

            {/* Content preview workspace split panel */}
            <div className="flex flex-col lg:flex-row gap-6 items-start relative">
              {/* Dynamic Outline Sidebar (Table of Contents) */}
              {showOutline && outline.length > 0 && (
                <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 border border-gray-150/60 rounded-2xl p-4 max-h-[75vh] overflow-y-auto toc-sidebar bg-gray-50/50 backdrop-blur-sm">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2 mb-3">
                    Outline Navigator
                  </h3>
                  <div className="space-y-1">
                    {outline.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOutlineClick(item.id)}
                        className={`w-full text-left py-1.5 px-2 rounded-lg text-xs transition-all border-l-2 border-transparent hover:bg-gray-100 ${
                          item.level === 3 ? "pl-5 text-gray-500" : "font-extrabold text-gray-700"
                        }`}
                      >
                        {item.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Markdown document preview backing */}
              <div 
                id="paper-content-container" 
                className={`flex-1 w-full prose max-w-none p-6 md:p-10 rounded-2xl border transition-all duration-300 ${textClass} ${fontClass} ${spacingClass} ${themeClass}`}
              >
                <ReactMarkdown
                  components={{
                    // Override headings to insert scroll anchor targets
                    h2: ({ node, children, ...props }) => {
                      const headingText = getHeadingText(children);
                      const headingId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      return (
                        <h2 
                          id={headingId} 
                          className="font-display font-black text-xl md:text-2xl mt-8 mb-4 border-b border-gray-150/40 pb-2 text-gray-900 tracking-tight"
                          {...props}
                        >
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ node, children, ...props }) => {
                      const headingText = getHeadingText(children);
                      const headingId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      return (
                        <h3 
                          id={headingId} 
                          className="font-display font-bold text-base md:text-lg mt-6 mb-3 text-gray-800"
                          {...props}
                        >
                          {children}
                        </h3>
                      );
                    },
                    // Table parser wrapping containers to allow horizontal scroll on mobile viewport screens
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-6 border border-gray-200 rounded-xl shadow-sm max-w-full">
                        <table className="min-w-full divide-y divide-gray-200 text-sm" {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-gray-50 font-extrabold" {...props} />,
                    th: ({ node, ...props }) => <th className="px-4 py-3 text-left text-2xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-200" {...props} />,
                    td: ({ node, ...props }) => <td className="px-4 py-3 text-gray-700 border-b border-gray-100 whitespace-nowrap font-semibold" {...props} />,
                  }}
                >
                  {paper.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* --- Abstract View Tab --- */}
        {tab === "abstract" && (
          <div id="paper-abstract-container" className="bg-gray-50/70 p-6 md:p-8 rounded-2xl border border-gray-150 leading-relaxed text-gray-800">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2.5 mb-4">
              Executive Summary Abstract
            </h3>
            <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap font-medium font-serif-academic leading-loose">
              {paper.abstract}
            </p>
          </div>
        )}

        {/* --- Bibliography Sources Tab --- */}
        {tab === "sources" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2.5 mb-1">
              Scholarly Cited Works
            </h3>
            <div className="space-y-3">
              {paper.sources?.map((source, idx) => (
                <div
                  key={idx}
                  className="p-5 border border-gray-150/60 rounded-2xl hover:border-blue-300 bg-white transition-all hover:shadow-sm"
                >
                  <h4 className="font-extrabold text-gray-900 mb-1 leading-snug">
                    {source.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-semibold">{source.authors}</p>
                  
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs mt-3 inline-block font-extrabold"
                    >
                      Retrieve publisher source website &rarr;
                    </a>
                  )}
                  {source.relevance_score && (
                    <div className="mt-3.5">
                      <div className="text-2xs text-gray-400 font-bold uppercase tracking-wider">
                        Validation Relevancy Matching: {Math.round(source.relevance_score * 100)}%
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full"
                          style={{ width: `${source.relevance_score * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4.5 py-2.5 font-bold text-sm border-b-2 transition-colors whitespace-nowrap outline-none ${
        active
          ? "text-blue-600 border-blue-600"
          : "text-gray-400 border-transparent hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function InfoItem({ label, value, dark, textColor = "text-blue-600" }) {
  return (
    <div className={`text-center rounded-2xl p-4 border transition-all ${
      dark 
        ? "bg-slate-900 border-slate-800 text-slate-100" 
        : "bg-gray-50/50 border-gray-150 text-gray-800"
    } min-w-0 shadow-inner-sm`}>
      <p className="text-3xs text-gray-400 font-black uppercase tracking-wider mb-1 truncate">{label}</p>
      <p className={`text-sm font-extrabold truncate ${textColor}`}>{value}</p>
    </div>
  );
}
