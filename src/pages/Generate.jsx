import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiSearch, FiDollarSign, FiCpu, FiActivity, FiFeather, FiGlobe, FiBook, FiAward, FiBookOpen } from "react-icons/fi";
import { papersAPI, citationsAPI } from "../api/client";

export default function Generate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formats, setFormats] = useState([]);
  const [formData, setFormData] = useState({
    topic: "",
    wordCount: 8000,
    citationFormat: "APA",
    complexityLevel: "phd",
    domain: "general",
    journalTemplate: "Standard Academic",
  });

  // Cycling states for the loading animation screen
  const [loadStep, setLoadStep] = useState(0);
  const loadingMessages = [
    "Contacting academic databases (Google Scholar, arXiv, Semantic Scholar)...",
    "Filtering and scoring search relevances across 50+ publications...",
    "Formulating econometric methodologies and mathematical variables...",
    "Synthesizing LaTeX mathematical modeling parameters and matrices...",
    "Redacting professional academic paragraphs with natural research flows...",
    "Formatting bibliography and scholar citations in APA/IEEE standard...",
    "Assembling multi-format export suites (PDF template, DOCX grid, LaTeX code)...",
    "Finalizing sqlite database records and caching document bodies..."
  ];

  useEffect(() => {
    fetchFormats();
  }, []);

  // Cycle through messages while generating
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadStep(0);
      interval = setInterval(() => {
        setLoadStep((prev) => (prev + 1) % loadingMessages.length);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [loading, loadingMessages.length]);

  const fetchFormats = async () => {
    try {
      const response = await citationsAPI.getFormats();
      setFormats(response.data.data);
    } catch (error) {
      console.error("Error fetching formats:", error);
    }
  };

  const handleCardSelect = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getWordCountLabel = (count) => {
    if (count <= 5000) return "Undergraduate / University Paper";
    if (count <= 8000) return "Conference Paper";
    return "Journal / PhD-Level Paper";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    if (formData.wordCount < 2000 || formData.wordCount > 15000) {
      toast.error("Word count must be between 2,000 and 15,000");
      return;
    }

    setLoading(true);
    try {
      const response = await papersAPI.generate(
        formData.topic,
        formData.wordCount,
        formData.citationFormat,
        formData.complexityLevel,
        formData.domain
      );

      toast.success("Paper generated successfully!");
      navigate(`/papers/${response.data.data.paper_id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to generate paper");
      console.error("Generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const domainOptions = [
    { id: "general", label: "General", desc: "Standard multidisciplinary academic presets.", icon: FiBook, color: "text-gray-600 bg-gray-50 border-gray-200" },
    { id: "finance", label: "Finance & Econ", desc: "Injects CAPM models, volatilities, and econometrics.", icon: FiDollarSign, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { id: "stem", label: "STEM & CS", desc: "Formats computational algorithms, math parameters, and code bounds.", icon: FiCpu, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { id: "medicine", label: "Medicine", desc: "Summarizes cohort dynamics, treatment margins, and p-values.", icon: FiActivity, color: "text-rose-600 bg-rose-50 border-rose-100" },
    { id: "humanities", label: "Humanities", desc: "Focuses on text critiques, arguments, and narrative frameworks.", icon: FiFeather, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { id: "social_sciences", label: "Social Sciences", desc: "Draws qualitative matrices and questionnaire statistics.", icon: FiGlobe, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  ];

  const complexityOptions = [
    { id: "undergraduate", label: "Undergraduate", desc: "Structured conceptual summaries.", icon: FiAward, color: "border-blue-100 text-blue-700 bg-blue-50/50" },
    { id: "master", label: "Master's Level", desc: "Critical reviews, method depth.", icon: FiBookOpen, color: "border-indigo-100 text-indigo-700 bg-indigo-50/50" },
    { id: "phd", label: "PhD-Grade", desc: "Highly rigorous, LaTeX formulas, empirical results.", icon: FiCpu, color: "border-purple-100 text-purple-700 bg-purple-50/50" },
  ];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 animate-fade-in">
        <div className="card glass-card text-center py-12 px-6 md:px-12 space-y-8 shadow-xl border-blue-100/50">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <span className="absolute w-20 h-20 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
            <FiSearch className="text-3xl text-blue-600 animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-gray-900 font-display">Generating Research Paper</h2>
            <p className="text-gray-500 text-sm font-semibold tracking-wide uppercase">This can take up to 2-3 minutes</p>
          </div>

          {/* Progress message tracker */}
          <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 max-w-md mx-auto space-y-4">
            <div className="flex items-center gap-3 text-left">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <p className="text-sm font-bold text-gray-700 leading-snug">
                {loadingMessages[loadStep]}
              </p>
            </div>
            
            {/* Simple step meter */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${((loadStep + 1) / loadingMessages.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-gray-400 font-medium">
            Searching academic APIs & compiling empirical tables...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="card glass-card shadow-lg p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">Generate Academic Paper</h1>
          <p className="text-gray-500 text-sm mt-1 font-semibold">Define your research params and let Acadence AI build the draft</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Research Topic */}
          <div className="space-y-2">
            <label className="block text-sm font-extrabold text-gray-800 uppercase tracking-wider">
              Research Topic *
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., Empirical Risk Management in FinTech under Regime-Switching Volatility"
              className="input-field text-base font-medium"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-400 font-medium">
              Academic tip: Include descriptive parameters like econometric variables or cohort parameters.
            </p>
          </div>

          {/* Academic Domain Card Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-extrabold text-gray-800 uppercase tracking-wider">
              Academic Domain
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {domainOptions.map((opt) => {
                const active = formData.domain === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleCardSelect("domain", opt.id)}
                    className={`flex flex-col text-left p-4 rounded-2xl border transition-all relative outline-none ${
                      active
                        ? "border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/10 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className={`p-2 rounded-lg w-fit mb-3 ${opt.color}`}>
                      <Icon className="text-lg" />
                    </div>
                    <h3 className="text-sm font-extrabold text-gray-900 font-display">{opt.label}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-snug font-medium">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Complexity Level Card Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-extrabold text-gray-800 uppercase tracking-wider">
              Academic Level
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {complexityOptions.map((opt) => {
                const active = formData.complexityLevel === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleCardSelect("complexityLevel", opt.id)}
                    className={`flex flex-col text-left p-4.5 rounded-2xl border transition-all outline-none ${
                      active
                        ? "border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/10 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${opt.color}`}>
                        {opt.label}
                      </span>
                      <Icon className={`text-lg ${active ? "text-blue-600 animate-pulse" : "text-gray-400"}`} />
                    </div>
                    <p className="text-xs text-gray-500 leading-snug font-medium">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Word Count Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <label className="block text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                Target Length
              </label>
              <span className="text-xs font-black px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                {getWordCountLabel(formData.wordCount)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-200 shadow-inner">
              <input
                type="range"
                name="wordCount"
                min="2000"
                max="15000"
                step="500"
                value={formData.wordCount}
                onChange={handleChange}
                className="w-full sm:flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                disabled={loading}
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  name="wordCount"
                  value={formData.wordCount}
                  onChange={handleChange}
                  min="2000"
                  max="15000"
                  className="input-field py-2 text-center font-bold text-sm w-24 shrink-0 shadow-none border bg-white"
                  disabled={loading}
                />
                <span className="text-xs font-bold text-gray-400 uppercase">Words</span>
              </div>
            </div>
          </div>

          {/* Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Journal Template */}
            <div className="space-y-2">
              <label className="block text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                Journal Template
              </label>
              <select
                name="journalTemplate"
                value={formData.journalTemplate}
                onChange={handleChange}
                className="input-field text-sm font-semibold"
                disabled={loading}
              >
                <option value="Standard Academic">Standard Academic</option>
                <option value="Nature / Science">Nature / Science Format</option>
                <option value="IEEE Transactions">IEEE Transactions</option>
                <option value="Elsevier">Elsevier Journal Structure</option>
              </select>
            </div>

            {/* Citation Style */}
            <div className="space-y-2">
              <label className="block text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                Bibliography Format
              </label>
              <select
                name="citationFormat"
                value={formData.citationFormat}
                onChange={handleChange}
                className="input-field text-sm font-semibold"
                disabled={loading}
              >
                {formats.map((format) => (
                  <option key={format.name} value={format.name}>
                    {format.name} — {format.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-base py-3.5 shadow-lg shadow-blue-500/20"
          >
            <FiSearch className="text-lg" />
            Assemble Research Draft
          </button>
        </form>

        {/* Informative PhD guidelines */}
        <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 flex gap-4">
          <div className="p-2.5 bg-white text-blue-600 rounded-xl h-fit shadow-sm shrink-0">
            <FiBook className="text-lg animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-blue-900 text-sm">Academic Quality Guarantee:</h3>
            <ul className="text-xs text-blue-800 leading-relaxed space-y-1 list-disc pl-4 font-medium">
              <li>Scans academic APIs for peer-reviewed journal papers.</li>
              <li>Injects dynamic LaTeX block formulas based on the math models.</li>
              <li>Compiles structured Markdown grids for empirical and regression datasets.</li>
              <li>Generates full references formatted cleanly in {formData.citationFormat} style.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
