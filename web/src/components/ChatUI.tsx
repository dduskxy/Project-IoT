'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';

export default function ChatUI() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice feature states
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition on client mount
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'th-TH'; // Thai language
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          // Automatically send after voice finishes
          handleVoiceSubmit(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const speakText = (text: string) => {
    if (!isSpeakingEnabled || !('speechSynthesis' in window)) return;
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 1.1; // Slightly faster for a cute personality
    utterance.pitch = 1.2; // Slightly higher pitch
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Dedicated function to handle submission directly from voice
  const handleVoiceSubmit = async (voiceText: string) => {
    if (!voiceText.trim()) return;
    await processMessage(voiceText.trim());
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await processMessage(input.trim());
  };

  const processMessage = async (userMessage: string) => {
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
      const replyText = data.reply || 'รับทราบคำสั่งค่ะ!';
      
      setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
      speakText(replyText); // Speak the AI's reply!

    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'แอ่ก... สัญญาณขาดหายค่ะ' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex flex-col h-full min-h-[500px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <span className="text-xl">🪴</span> Flaura AI
        </h2>
        
        {/* Toggle Voice Output Button */}
        <button 
          onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
          className={`p-2 rounded-full transition-colors ${isSpeakingEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
          title={isSpeakingEnabled ? "ปิดเสียงพูด" : "เปิดเสียงพูด"}
        >
          {isSpeakingEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="flex-1 bg-slate-50/50 rounded-3xl p-4 mb-6 overflow-y-auto max-h-[600px] flex flex-col gap-3 border border-slate-100/50">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 opacity-80">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="text-4xl">🪴</span>
            </div>
            <p className="text-center text-sm font-medium px-4 text-emerald-600/70">
              สวัสดีค่ะ! ฉันคือต้นไม้ของคุณ <br/>พิมพ์คุยหรือกดไมค์สั่งงานได้เลยนะคะ
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`px-5 py-3 rounded-2xl max-w-[85%] text-sm font-medium shadow-sm transition-all ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-white self-end rounded-br-md' 
                : 'bg-emerald-500 text-white self-start rounded-bl-md shadow-emerald-500/20'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="px-5 py-3 rounded-2xl bg-emerald-50 text-emerald-500 self-start rounded-bl-md shadow-sm border border-emerald-100 max-w-[85%] flex gap-2 items-center">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-75"></span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-150"></span>
          </div>
        )}
      </div>
      
      <form onSubmit={sendMessage} className="flex gap-2 relative">
        <button
          type="button"
          onClick={toggleListening}
          className={`absolute left-2 top-2 p-2.5 rounded-xl transition-all z-10 ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
              : 'bg-white text-gray-400 hover:text-emerald-500 hover:bg-slate-50'
          }`}
          title="กดเพื่อพูดคำสั่งเสียง"
        >
          {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "กำลังฟัง..." : "คุยกับน้องต้นไม้..."}
          className={`flex-1 bg-white border border-slate-200 rounded-2xl pl-14 pr-5 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium text-slate-700 placeholder-slate-400 shadow-sm transition-all ${isListening ? 'bg-red-50/50' : ''}`}
          disabled={isLoading || isListening}
        />
        <button 
          type="submit" 
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none active:scale-95"
          disabled={isLoading || !input.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
