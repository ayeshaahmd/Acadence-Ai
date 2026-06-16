import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MathSymbolsBackground = () => {
  // Generate random math symbols with fixed positions to simulate the floating background
  const symbols = ['Δ', 'Σ', '≈', 'p', 't', 'ω', 'R', 'u', '6', 'M', 'd', 'z', 'e', 'v', 'ψ', 'Q', '3', 'k', 'φ', 'b', 'I', '∫', 'A', 'η', 's', 'r', 'E', 'Z', 'w', 'Π', 'y', 'u', 'L', 'A', 'd', 'v', 'α', 'x', 'ζ', 'b', 'v', 'F', 'ω', 'δ'];
  
  return (
    <div className="absolute right-0 top-0 bottom-0 w-64 overflow-hidden pointer-events-none opacity-40 select-none">
      {symbols.map((sym, i) => (
        <div 
          key={i} 
          className="absolute font-mono text-gray-400"
          style={{
            top: `${(i * 3.5) % 100}%`,
            left: `${(i * 17) % 80}%`,
            fontSize: `${Math.random() * 24 + 16}px`,
            opacity: Math.random() * 0.6 + 0.2,
            transform: `rotate(${Math.random() * 40 - 20}deg)`
          }}
        >
          {sym}
        </div>
      ))}
    </div>
  );
};

export default function SciBotHome() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/scibot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          context: "You are SciBot, an AI research assistant. Provide concise, accurate scientific answers. Format using Markdown."
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Error: ' + (data.error || 'Failed to connect to SciBot API.') }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error: Could not reach the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#2f3e46] font-mono relative overflow-x-hidden">
      
      {/* Decorative math background on the right */}
      <MathSymbolsBackground />

      <div className="max-w-[1200px] mx-auto px-8 py-16 flex flex-col md:flex-row gap-16 relative z-10">
        
        {/* LEFT COLUMN */}
        <div className="w-full md:w-[280px] flex flex-col shrink-0">
          
          <div className="flex items-start gap-4 mb-8">
            {/* Logo SVG matching the screenshot's raven holding a key */}
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-2">
              <path d="M80 30 C 80 15, 60 10, 45 15 C 30 20, 20 40, 30 60 C 40 80, 65 75, 75 60 C 80 50, 75 40, 80 30 Z" fill="#2d6a4f"/>
              <path d="M85 30 L 95 30 L 95 35 L 90 35 L 90 40 L 85 40 Z" fill="#2d6a4f"/>
              <circle cx="65" cy="35" r="3" fill="white"/>
            </svg>

            <div className="flex flex-col">
              <h1 className="text-[4rem] leading-[0.85] font-bold text-[#2d6a4f] tracking-tighter" style={{ fontFamily: 'monospace' }}>
                sci<br/>bot
              </h1>
            </div>
          </div>

          <p className="text-gray-500 text-xl tracking-widest text-center mb-16 leading-relaxed px-4">
            AI-powered<br/>research<br/>assistant
          </p>

          <div className="flex flex-col gap-3 w-32 ml-4">
            <button className="bg-[#2d6a4f] text-white py-2 rounded font-bold text-sm hover:bg-[#1b4332] transition-colors">
              Log in
            </button>
            <button className="border border-gray-300 text-gray-600 py-2 rounded font-bold text-sm hover:bg-gray-50 transition-colors">
              Register
            </button>
            
            <div className="border border-[#2d6a4f] rounded-xl p-4 flex flex-col items-center justify-center mt-4 mb-4">
              <span className="text-4xl font-bold text-[#2d6a4f]">218</span>
              <span className="text-xs text-gray-500 font-bold mt-1">queued</span>
            </div>

            <button className="bg-[#2d6a4f] text-white py-2 rounded font-bold text-sm hover:bg-[#1b4332] transition-colors">
              Donate
            </button>
          </div>

          <div className="fixed bottom-10 left-[260px] hidden md:block">
             <button className="w-12 h-12 bg-[#2d6a4f] text-white rounded-full flex items-center justify-center font-bold text-xl hover:bg-[#1b4332] transition-colors shadow-lg">
              ?
            </button>
          </div>
        </div>

        {/* MAIN COLUMN */}
        <div className="flex-1 max-w-[800px] pt-8">
          
          <form onSubmit={handleSearch} className="mb-12 relative flex items-end">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ask me anything"
              className="w-full text-5xl py-4 bg-transparent border-b border-gray-300 text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#2d6a4f] transition-colors font-mono"
            />
            <button type="submit" className="absolute right-0 bottom-4 text-6xl text-[#2d6a4f] hover:text-[#1b4332] transition-colors font-bold tracking-tighter">
              [▶]
            </button>
          </form>

          <div className="flex items-center gap-2 mb-16">
            <input type="radio" id="popular" name="mode" className="w-4 h-4 text-[#2d6a4f] bg-gray-100 border-gray-300 focus:ring-[#2d6a4f]" defaultChecked />
            <label htmlFor="popular" className="text-gray-500 text-sm tracking-wide">Popular science</label>
          </div>

          {messages.length === 0 ? (
            <div>
              <h2 className="text-lg font-bold text-[#2d6a4f] mb-6 tracking-wider">recently answered</h2>
              
              <div className="flex flex-col gap-4">
                {[
                  {
                    title: '"The New Intellectual Property: Celebrity, Fans and the Properties of the Entertainment Franchise" - Griffith Law...',
                    time: '2 min ago'
                  },
                  {
                    title: 'Act as an expert medical diagnostic AI connected to current scientific literature. Query the latest medical papers,...',
                    time: '13 min ago'
                  },
                  {
                    title: 'HPLC METHOD FOR BENZOIC ACID AND SORBIC ACID',
                    time: '17 min ago'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer bg-white">
                    <p className="text-gray-700 mb-4 leading-relaxed font-mono text-sm sm:text-base">
                      {item.title}
                    </p>
                    <p className="text-gray-400 text-xs tracking-wider">
                      {item.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 mb-12">
              {messages.map((msg, idx) => (
                <div key={idx} className={`p-5 rounded-xl ${msg.role === 'user' ? 'bg-gray-50 border border-gray-200' : 'bg-[#f0f7f4] border border-[#2d6a4f]/20'}`}>
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    {msg.role === 'user' ? 'You' : 'SciBot'}
                  </p>
                  <div className="text-gray-800 font-sans leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="p-5 rounded-xl bg-[#f0f7f4] border border-[#2d6a4f]/20 animate-pulse">
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">SciBot</p>
                  <div className="h-4 bg-[#2d6a4f]/20 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-[#2d6a4f]/20 rounded w-1/2"></div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
