import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiEdit, FiFileText, FiMenu, FiX, FiSearch } from "react-icons/fi";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: FiHome },
    { path: "/generate", label: "Generate Paper", icon: FiEdit },
    { path: "/papers", label: "My Papers", icon: FiFileText },
    { path: "/scibot", label: "SciBot", icon: FiSearch },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/75 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-all">
              <FiFileText className="text-xl" />
            </div>
            <span className="text-lg font-black font-display tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
              Acadence AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1.5">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1.5 px-4.5 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                    active
                      ? "text-blue-600 bg-blue-50/60"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`text-base ${active ? "text-blue-600" : "text-gray-400"}`} />
                  <span>{label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <FiX size={22} className="rotate-90 transition-all duration-300" /> : <FiMenu size={22} className="transition-all duration-300" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-60 opacity-100 py-3 border-t border-gray-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1.5 pb-2">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/5"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`text-lg ${active ? "text-white" : "text-gray-400"}`} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
