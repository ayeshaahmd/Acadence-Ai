import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiLoader, FiEye, FiTrash, FiPlus, FiSearch, FiDownload, FiInfo, FiFilter } from "react-icons/fi";
import { toast } from "react-toastify";
import { papersAPI } from "../api/client";
import { formatDistanceToNow } from "date-fns";

export default function MyPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedComplexity, setSelectedComplexity] = useState("all");

  const fetchPapers = useCallback(async () => {
    try {
      setLoading(true);
      // Fetching all papers so we can filter locally with search and pagination, or we can fetch paginated list.
      // To implement seamless instant local filtering, let's fetch a wider page size or handle it cleanly.
      // Let's fetch up to 100 papers for local fast searching, or fall back to API parameters.
      const response = await papersAPI.list(1, 100);
      setPapers(response.data.data);
    } catch (error) {
      toast.error("Failed to load papers");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this paper?")) return;

    try {
      await papersAPI.delete(id);
      toast.success("Paper deleted successfully");
      fetchPapers();
    } catch (error) {
      toast.error("Failed to delete paper");
    }
  };

  const handleQuickExport = async (id, title, format, e) => {
    e.preventDefault();
    e.stopPropagation();
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
        
        // Decode base64 to binary Array
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
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export paper");
      console.error("Export error:", error);
    }
  };

  const formatDomain = (domain) => {
    const map = {
      general: "General Academic",
      finance: "Finance & Econ",
      stem: "STEM & CS",
      medicine: "Medicine",
      humanities: "Humanities",
      social_sciences: "Social Sci",
    };
    return map[domain] || domain;
  };

  const formatComplexity = (level) => {
    const map = {
      undergraduate: "Undergrad",
      master: "Master's",
      phd: "PhD-Grade",
    };
    return map[level] || level;
  };

  // Local filtering logic for immediate responsive searches
  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.topic.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDomain = selectedDomain === "all" || paper.domain === selectedDomain;
    const matchesComplexity = selectedComplexity === "all" || paper.complexity_level === selectedComplexity;

    return matchesSearch && matchesDomain && matchesComplexity;
  });

  const domains = ["all", "general", "finance", "stem", "medicine", "humanities", "social_sciences"];
  const complexities = ["all", "undergraduate", "master", "phd"];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <FiLoader className="text-4xl animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">My Research Library</h1>
          <p className="text-gray-500 text-sm mt-1 font-semibold">Access and export your generated research files</p>
        </div>
        <Link to="/generate" className="btn-primary w-full sm:w-auto shadow-md">
          <FiPlus className="text-lg" /> New Paper
        </Link>
      </div>

      {/* Search & Filter Console */}
      <div className="card glass-card p-5 space-y-4">
        {/* Keyword Search Input */}
        <div className="relative">
          <FiSearch className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search by paper title or research topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-12 py-3"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-1 text-sm font-medium">
          {/* Domain Filters */}
          <div className="space-y-1.5 w-full">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <FiFilter /> Filter Domain:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {domains.map((dom) => (
                <button
                  key={dom}
                  onClick={() => setSelectedDomain(dom)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border outline-none ${
                    selectedDomain === dom
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {dom === "all" ? "All Domains" : formatDomain(dom)}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity Filters */}
          <div className="space-y-1.5 w-full md:w-fit shrink-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <FiFilter /> Filter Complexity:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {complexities.map((comp) => (
                <button
                  key={comp}
                  onClick={() => setSelectedComplexity(comp)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border outline-none ${
                    selectedComplexity === comp
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {comp === "all" ? "All Levels" : formatComplexity(comp)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Library Grid Cards */}
      {filteredPapers.length === 0 ? (
        <div className="text-center py-16 card glass-card max-w-md mx-auto space-y-6">
          <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl w-fit mx-auto text-gray-400">
            <FiInfo className="text-3xl" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 font-display">No Papers Match Criteria</h2>
            <p className="text-gray-500 text-sm font-medium">
              We couldn't find matches. Try adjusting filters or search spelling.
            </p>
          </div>
          {papers.length === 0 ? (
            <Link to="/generate" className="btn-primary inline-flex shadow-sm">
              <FiPlus /> Start Generation
            </Link>
          ) : (
            <button 
              onClick={() => { setSearchQuery(""); setSelectedDomain("all"); setSelectedComplexity("all"); }}
              className="btn-secondary inline-flex text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <Link 
              to={`/papers/${paper.id}`}
              key={paper.id}
              className="glass-card rounded-2xl border border-gray-150 p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  {/* Status badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-2xs font-extrabold uppercase tracking-widest border ${
                      paper.status === "completed"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : paper.status === "completed_fallback"
                        ? "bg-violet-50 border-violet-100 text-violet-700"
                        : "bg-amber-50 border-amber-100 text-amber-700"
                    }`}
                  >
                    {paper.status === "completed_fallback" ? "Demo Draft" : paper.status}
                  </span>
                  
                  {/* Created timestamp */}
                  <span className="text-2xs font-bold text-gray-400">
                    {formatDistanceToNow(new Date(paper.created_at), { addSuffix: true })}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 font-display group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {paper.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium line-clamp-1 italic">
                    Topic: {paper.topic}
                  </p>
                </div>

                {/* Meta Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 bg-blue-50/50 text-blue-700 text-2xs font-bold rounded-lg border border-blue-100">
                    📚 {formatDomain(paper.domain)}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-50/50 text-purple-700 text-2xs font-bold rounded-lg border border-purple-100">
                    🎓 {formatComplexity(paper.complexity_level)}
                  </span>
                </div>

                {/* Length and Citations stats */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50/70 border border-gray-100 rounded-xl text-center text-xs font-semibold">
                  <div>
                    <p className="text-3xs text-gray-400 font-bold uppercase tracking-wider">Length</p>
                    <p className="text-gray-800 font-extrabold">{paper.word_count?.toLocaleString() || "N/A"} words</p>
                  </div>
                  <div>
                    <p className="text-3xs text-gray-400 font-bold uppercase tracking-wider">Citations</p>
                    <p className="text-gray-800 font-extrabold">{paper.citation_format}</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col gap-2 pt-5 mt-5 border-t border-gray-100">
                {/* Export Dropdown bar */}
                <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                  <span className="text-3xs font-black text-gray-400 uppercase tracking-widest px-2 shrink-0">Export:</span>
                  <div className="flex items-center justify-between w-full">
                    <button
                      onClick={(e) => handleQuickExport(paper.id, paper.title, "pdf", e)}
                      className="px-2 py-1 text-2xs font-bold bg-white text-rose-600 rounded-lg shadow-2xs hover:bg-rose-50 transition-colors shrink-0"
                    >
                      PDF
                    </button>
                    <button
                      onClick={(e) => handleQuickExport(paper.id, paper.title, "docx", e)}
                      className="px-2 py-1 text-2xs font-bold bg-white text-blue-600 rounded-lg shadow-2xs hover:bg-blue-50 transition-colors shrink-0"
                    >
                      DOCX
                    </button>
                    <button
                      onClick={(e) => handleQuickExport(paper.id, paper.title, "latex", e)}
                      className="px-2 py-1 text-2xs font-bold bg-white text-teal-600 rounded-lg shadow-2xs hover:bg-teal-50 transition-colors shrink-0"
                    >
                      LaTeX
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-extrabold text-xs"
                  >
                    <FiEye /> Read Workspace
                  </span>
                  <button
                    onClick={(e) => handleDelete(paper.id, e)}
                    className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    title="Delete Paper"
                  >
                    <FiTrash />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
