import React, { useState } from 'react';
import { Sparkles, Hash, FileText, Cpu, CloudLightning, Zap, Copy, Check, History, Trash2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [inputType, setInputType] = useState('caption');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const handleGenerate = async () => {
    if (!inputText) return;
    setLoading(true);
    setResult(null);

    try {
      // ------------------------------------------------------
      // 🚀 REAL BACKEND CONNECTION (Now Active)
      // ------------------------------------------------------
      // This sends the data to your uvicorn server running on port 8000
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, type: inputType })
      });
      
      if (!response.ok) {
        throw new Error("Failed to connect to Python Backend");
      }
      
      const data = await response.json();
      setResult(data);
      
      // Add to History
      const newEntry = {
        id: Date.now(),
        text: inputText,
        type: inputType,
        result: data.result,
        source: data.source,
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory(prev => [newEntry, ...prev]);

    } catch (error) {
      console.error(error);
      setResult({ 
        result: "⚠️ Error: Could not connect to Backend. \n\n1. Check if 'uvicorn main:app' is running in your terminal.\n2. Make sure you are at http://localhost:8000/docs to verify.", 
        source: "Connection Error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              AI Content Architect
            </h1>
          </div>
          <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setActiveTab('generate')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'generate' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Generate
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              History
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        
        {activeTab === 'generate' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Create Viral Content</h2>
              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Local T5 Edge</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="flex items-center gap-1"><CloudLightning className="w-3 h-3" /> Gemini Cloud</span>
              </div>
            </div>

            {/* Input Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              
              {/* Type Selector */}
              <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
                {[
                  { id: 'caption', label: 'Caption', icon: Sparkles },
                  { id: 'hashtag', label: 'Hashtags', icon: Hash },
                  { id: 'summary', label: 'Summary', icon: FileText },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setInputType(type.id)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      inputType === type.id 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Text Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300 ml-1">
                  Input Context
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={inputType === 'hashtag' ? "Enter topic tags..." : "Describe your image or paste text..."}
                  className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none placeholder:text-slate-600 transition-all"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !inputText}
                className={`w-full mt-6 py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group
                  ${loading 
                    ? 'bg-slate-700 cursor-not-allowed opacity-70' 
                    : 'bg-white text-slate-900 hover:bg-indigo-50'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-600 border-t-slate-900 rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    Generate Content
                  </>
                )}
              </button>
            </div>

            {/* Results Section */}
            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                  {/* Result Header */}
                  <div className="bg-slate-900/50 px-6 py-3 border-b border-slate-700 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-400">Generated Output</span>
                    <div className="flex items-center gap-2 text-xs">
                      {result.source && result.source.includes('Local') ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                          <Cpu className="w-3 h-3" /> Edge Compute
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
                          <CloudLightning className="w-3 h-3" /> Cloud API
                        </span>
                      )}
                      <span className="text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{result.latency_ms ? Math.round(result.latency_ms) : 0}ms</span>
                    </div>
                  </div>
                  
                  {/* Result Content */}
                  <div className="p-6 relative group">
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-lg font-light">
                      {result.result}
                    </p>
                    <button 
                      onClick={() => copyToClipboard(result.result)}
                      className="absolute top-4 right-4 p-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // History Tab
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Generation History</h2>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors border border-transparent hover:border-red-400/20"
                >
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No history yet. Start generating content!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-indigo-500/30 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          item.type === 'caption' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          item.type === 'hashtag' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-xs text-slate-500">{item.timestamp}</span>
                      </div>
                      {item.source && item.source.includes('Local') ? (
                        <Cpu className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <CloudLightning className="w-3 h-3 text-amber-500" />
                      )}
                    </div>
                    <div className="mb-3">
                       <p className="text-xs text-slate-500 mb-1">Input</p>
                       <p className="text-sm text-slate-400 line-clamp-1 italic">"{item.text}"</p>
                    </div>
                    <div>
                       <p className="text-xs text-slate-500 mb-1">Output</p>
                       <p className="text-slate-200 font-medium text-sm">{item.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}