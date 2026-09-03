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
    <div className="p-6 border rounded-xl shadow-sm bg-white text-black flex flex-col min-h-[400px]">
      <h2 className="text-xl font-semibold mb-4">คุยกับน้องต้นไม้ 🌿</h2>
      <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto max-h-80 flex flex-col gap-3 border">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center text-sm my-auto">ลองพิมพ์ "เปิดไฟให้หน่อย" หรือ "รดน้ำต้นไม้"</p>
        )}
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
              msg.role === 'user' 
                ? 'bg-green-500 text-white self-end rounded-br-sm shadow-sm' 
                : 'bg-white text-gray-800 self-start rounded-bl-sm shadow-sm border'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="px-4 py-2 rounded-2xl bg-white text-gray-800 self-start rounded-bl-sm shadow-sm border max-w-[85%] text-sm flex gap-1 items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          </div>
        )}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์คำสั่งที่นี่..."
          className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm shadow-sm"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          disabled={isLoading || !input.trim()}
        >
          ส่ง
        </button>
      </form>
    </div>
  );
}
