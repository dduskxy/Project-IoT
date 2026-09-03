'use client';
import { useState } from 'react';

export default function ChatUI() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, deviceId: 'esp32-device-01' }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่' }]);
        return;
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'รับทราบคำสั่งครับ' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex flex-col h-full min-h-[500px]">
      <h2 className="text-lg font-black text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-6">
        <span className="text-xl">💬</span> AI Assistant
      </h2>
      
      <div className="flex-1 bg-slate-50/50 rounded-3xl p-4 mb-6 overflow-y-auto max-h-[600px] flex flex-col gap-3 border border-slate-100/50">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60">
            <span className="text-3xl">🤖</span>
            <p className="text-center text-sm font-medium px-4">ทดลองพิมพ์ "เปิดไฟให้หน่อย" หรือ "รดน้ำต้นไม้ 5 วินาที"</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`px-5 py-3 rounded-2xl max-w-[85%] text-sm font-medium shadow-sm transition-all ${
              msg.role === 'user' 
                ? 'bg-emerald-500 text-white self-end rounded-br-md' 
                : 'bg-white text-slate-700 self-start rounded-bl-md border border-slate-100'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="px-5 py-3 rounded-2xl bg-white text-slate-400 self-start rounded-bl-md shadow-sm border border-slate-100 max-w-[85%] flex gap-2 items-center">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-75"></span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-150"></span>
          </div>
        )}
      </div>
      
      <form onSubmit={sendMessage} className="flex gap-3">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="สั่งงาน AI..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium text-slate-700 placeholder-slate-400 shadow-inner transition-all"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:shadow-none active:scale-95"
          disabled={isLoading || !input.trim()}
        >
          ส่ง
        </button>
      </form>
    </div>
  );
}
