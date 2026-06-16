import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBook, FiSearch, FiZap, FiSliders, FiDatabase, FiFileText } from "react-icons/fi";

export default function Dashboard() {
  return (
    <div className="space-y-16 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center py-12 max-w-3xl mx-auto space-y-6">
        <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest rounded-full border border-blue-100 inline-block animate-pulse-slow">
          🎓 Premium Scholarly Intelligence Workspace
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 leading-tight tracking-tight font-display">
          AI-Powered <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Research Paper Assistant
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-sans font-medium">
          Generate publication-ready academic papers on complex mathematical, STEM, financial, and medical topics. Complete with scholarly bibliographies, empirical statistics, and LaTeX notations.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/generate"
            className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base shadow-lg shadow-blue-500/20"
          >
            Start Writing <FiArrowRight className="text-lg" />
          </Link>
          <Link
            to="/papers"
            className="btn-secondary w-full sm:w-auto px-8 py-3.5 text-base"
          >
            Browse My Library
          </Link>
        </div>
      </div>

      {/* Core Scholarly Features */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 font-display">Engineered for Academic Rigor</h2>
          <p className="text-gray-500 mt-2 font-medium">Equipped with specialized engines to support dissertation-grade criteria</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={FiSearch}
            title="Database Crawling"
            description="Scans academic portals including Google Scholar and ArXiv to verify real scientific sources and publications."
            color="text-blue-600 bg-blue-50"
          />
          <FeatureCard
            icon={FiSliders}
            title="Domain Preservation"
            description="Custom styles matching STEM formulas, quantitative finance econometrics, medical cohorts, or humanities critique."
            color="text-indigo-600 bg-indigo-50"
          />
          <FeatureCard
            icon={FiZap}
            title="Scientific Typesetting"
            description="Compiles standard LaTeX math notations and structured Markdown regression/empirical data tables."
            color="text-purple-600 bg-purple-50"
          />
        </div>
      </div>

      {/* Ph.D. Pipeline Walkthrough */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-900 font-display">Under the Hood: The Research Pipeline</h2>
          <p className="text-gray-500 font-medium">How Acadence AI processes your topic from search queries to publication-grade files</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connecting lines for desktop */}
          <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-gray-100 -translate-y-10 z-0" />
          
          <PipelineStep
            number="1"
            icon={FiDatabase}
            title="Source Retrieval"
            description="Crawls research databases using dynamic query keyword expansions based on your topic and domain."
          />
          <PipelineStep
            number="2"
            icon={FiSliders}
            title="Depth Assessment"
            description="Tunes semantic parameters and technical depth to match the desired scholarly standards."
          />
          <PipelineStep
            number="3"
            icon={FiBook}
            title="Draft Redaction"
            description="Formulates high-density methodology equations, results grids, literature reviews, and formatted references."
          />
          <PipelineStep
            number="4"
            icon={FiFileText}
            title="Academic Export"
            description="Typesets documents into true DOCX, professional reportlab PDF, raw LaTeX source code, and clean plain text."
          />
        </div>
      </div>

      {/* Stats Counter */}
      <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-indigo-950/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
          <div className="pt-6 md:pt-0">
            <div className="text-4xl md:text-5xl font-black font-display tracking-tight text-blue-400">8k-10k</div>
            <p className="text-gray-400 mt-2 text-sm font-semibold uppercase tracking-wider">Words Per Draft</p>
          </div>
          <div className="pt-6 md:pt-0">
            <div className="text-4xl md:text-5xl font-black font-display tracking-tight text-indigo-400">50+</div>
            <p className="text-gray-400 mt-2 text-sm font-semibold uppercase tracking-wider">Academic Sources</p>
          </div>
          <div className="pt-6 md:pt-0">
            <div className="text-4xl md:text-5xl font-black font-display tracking-tight text-purple-400">100%</div>
            <p className="text-gray-400 mt-2 text-sm font-semibold uppercase tracking-wider">LaTeX & Table Support</p>
          </div>
          <div className="pt-6 md:pt-0">
            <div className="text-4xl md:text-5xl font-black font-display tracking-tight text-emerald-400">4</div>
            <p className="text-gray-400 mt-2 text-sm font-semibold uppercase tracking-wider">Export Formats</p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-14 text-white shadow-xl shadow-blue-500/10 space-y-6">
        <h2 className="text-3xl md:text-4xl font-extrabold font-display">Start Generating Your Research Paper</h2>
        <p className="text-base md:text-lg max-w-lg mx-auto opacity-90 font-medium">
          Simply input your research topic and let Acadence AI build your complete mathematical modeling, empirical results, and sources.
        </p>
        <Link
          to="/generate"
          className="inline-block bg-white text-blue-700 px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-xl hover:scale-105 active:scale-100 transition-all font-display"
        >
          Open Generation Console
        </Link>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }) {
  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col space-y-4 hover:-translate-y-1 transition-all duration-300">
      <div className={`p-3 rounded-xl w-fit ${color}`}>
        <Icon className="text-2xl" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed font-medium">{description}</p>
    </div>
  );
}

function PipelineStep({ number, icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 z-10">
      <div className="relative">
        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Icon className="text-xl" />
        </div>
        <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs font-black w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
          {number}
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 pt-1">{title}</h3>
      <p className="text-gray-500 text-xs leading-relaxed max-w-xs font-medium">{description}</p>
    </div>
  );
}
