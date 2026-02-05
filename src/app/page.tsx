'use client';

import { useState, useRef, useEffect } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await res.json();
      const botMessage = { role: 'ai', content: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { role: 'ai', content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      
      {/* --- Animated Background Blobs --- */}
      <div className="blob blob-1 rounded-full"></div>
      <div className="blob blob-2 rounded-full"></div>
      <div className="blob blob-3 rounded-full"></div>

      {/* --- Glass Chat Container --- */}
      <div className="w-full max-w-4xl flex flex-col h-[90vh] sm:h-[85vh] bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/40 overflow-hidden z-10 transition-all duration-300 hover:shadow-indigo-500/20">
        
        {/* --- Header --- */}
        <div className="bg-white/60 backdrop-blur-md p-4 border-b border-white/50 flex items-center gap-4 shadow-sm z-20">
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            {/* Online Status Dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg tracking-tight">Sidat Assistant</h1>
            <p className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
              Powered by AI
            </p>
          </div>
        </div>

        {/* --- Chat Area --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-70 message-animate">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
              </div>
              <p className="text-sm font-medium">How can I help you with Sidat Technologies today?</p>
            </div>
          )}

          {messages.map((m, index) => (
            <div
              key={index}
              className={`flex w-full message-animate ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ${
                  m.role === 'user' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 'bg-white text-indigo-600'
                }`}>
                  {m.role === 'user' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/></svg>
                  )}
                </div>

                {/* Bubble */}
                <div className={`px-5 py-3 shadow-sm text-sm md:text-[15px] leading-relaxed relative group ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl rounded-tr-none' 
                    : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-white/60 rounded-2xl rounded-tl-none hover:bg-white transition-colors'
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start w-full message-animate">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-indigo-600"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/></svg>
                 </div>
                 <div className="bg-white/80 border border-white/60 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5">
                   <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                   <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                   <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* --- Input Area --- */}
        <div className="p-4 bg-white/60 backdrop-blur-md border-t border-white/50">
          <form onSubmit={sendMessage} className="relative flex items-center gap-3 max-w-3xl mx-auto">
            
            <input
              className="w-full bg-white/90 border-transparent text-gray-800 rounded-full pl-6 pr-14 py-4 shadow-lg shadow-indigo-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:shadow-indigo-500/20 transition-all placeholder:text-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about Sidat Technologies..."
              disabled={loading}
            />

            {/* Send Button with Explicit Cursor Pointer */}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`absolute right-2 p-2.5 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer ${
                input.trim() 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/40 hover:scale-110 active:scale-95' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 ml-0.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              )}
            </button>
          </form>
          <div className="text-center mt-3">
             <p className="text-[10px] uppercase tracking-widest text-indigo-400/80 font-semibold">Sidat AI • Secure Chat</p>
          </div>
        </div>
      </div>
    </div>
  );
}