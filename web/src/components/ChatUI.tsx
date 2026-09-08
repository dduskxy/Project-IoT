'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';

export default function ChatUI() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice feature states
  const [isWakeWordEnabled, setIsWakeWordEnabled] = useState(true); // Standby for wake word
  const [isManualListening, setIsManualListening] = useState(false); // Clicked the mic button
  const [isWaitingForCommand, setIsWaitingForCommand] = useState(false); // Waiting after wake word
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(false); // Track if TTS is currently playing

  // Store the state in a ref so the event listener can access the latest value without rebinding
  const waitingRef = useRef(isWaitingForCommand);
  useEffect(() => {
    waitingRef.current = isWaitingForCommand;
  }, [isWaitingForCommand]);

    useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        if (!recognitionRef.current) {
          recognitionRef.current = new SpeechRecognition();
        }
        
        recognitionRef.current.continuous = false; // Set to false to force restart loop (more reliable on Chrome)
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'th-TH';
        
        recognitionRef.current.onresult = (event: any) => {
          if (isSpeakingRef.current) return; // Ignore any sounds if the system is currently speaking

          // Since continuous is false, the result is always at index 0
          const transcript = event.results[0][0].transcript.trim().toLowerCase();
          
          console.log("Heard:", transcript, " | Manual:", (window as any).isManualListeningActive, " | Waiting:", waitingRef.current);

          if ((window as any).isManualListeningActive) {
            setInput(transcript);
            handleVoiceSubmit(transcript);
            (window as any).isManualListeningActive = false;
            setIsManualListening(false);
            return;
          }

          const wakeWords = ['hey ต้นไม้', 'เฮ้ต้นไม้', 'เฮ้ ต้นไม้', 'สวัสดีต้นไม้', 'สวัสดี ต้นไม้', 'hi ต้นไม้', 'ต้นไม้'];
          let isWakeWordDetected = false;
          let command = transcript;

          for (const word of wakeWords) {
            if (transcript.includes(word)) {
              isWakeWordDetected = true;
              command = transcript.split(word)[1]?.trim() || '';
              break;
            }
          }

          if (isWakeWordDetected) {
            if (command.length > 2) {
              setInput(command);
              handleVoiceSubmit(command);
              setIsWaitingForCommand(false);
            } else {
              speakText('ระบบพร้อมรับคำสั่ง');
              setIsWaitingForCommand(true);
            }
          } else if (waitingRef.current) {
             setInput(transcript);
             handleVoiceSubmit(transcript);
             setIsWaitingForCommand(false);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.error("Speech recognition error", event.error);
          }
          if (event.error === 'not-allowed') {
            setIsWakeWordEnabled(false);
          }
        };

        recognitionRef.current.onend = () => {
          if (isSpeakingRef.current) return; // Do not automatically restart if the system is speaking

          if (isWakeWordEnabled || (window as any).isManualListeningActive) {
             try {
               recognitionRef.current?.start();
             } catch(e) {}
          } else {
             setIsManualListening(false);
          }
        };
      }
      
      if (isWakeWordEnabled && recognitionRef.current && !isSpeakingRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      } else if (!isWakeWordEnabled && !isManualListening && recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isWakeWordEnabled]);

  const startManualListening = () => {
    (window as any).isManualListeningActive = true;
    setIsManualListening(true);
    if (!isWakeWordEnabled && !isSpeakingRef.current) {
      try {
        recognitionRef.current?.start();
      } catch (e) {}
    }
  };

  const stopManualListening = () => {
    (window as any).isManualListeningActive = false;
    setIsManualListening(false);
    if (!isWakeWordEnabled) {
      recognitionRef.current?.stop();
    }
  };

  const toggleManualListening = () => {
    if (isManualListening) stopManualListening();
    else startManualListening();
  };

  const speakText = (text: string) => {
    if (!isSpeakingEnabled) return;
    
    isSpeakingRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }

    // First try our Next.js TTS proxy (bypasses browser blocking & uses Google's best Thai voice)
    try {
      const ts = new Date().getTime();
      const url = `/api/tts?text=${encodeURIComponent(text)}&t=${ts}`;
      const audio = new Audio(url);
      
      audio.onended = () => {
        isSpeakingRef.current = false;
        if (isWakeWordEnabled && recognitionRef.current) {
           try { recognitionRef.current.start(); } catch(e) {}
        }
      };

      audio.play().catch(e => {
        console.error("Audio play failed, falling back to OS voice:", e);
        playFallbackVoice(text);
      });
    } catch (e) {
      playFallbackVoice(text);
    }
  };

  const playFallbackVoice = (text: string) => {
    if (!('speechSynthesis' in window)) {
       isSpeakingRef.current = false;
       return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    
    utterance.onend = () => {
      isSpeakingRef.current = false;
      if (isWakeWordEnabled && recognitionRef.current) {
         try { recognitionRef.current.start(); } catch(e) {}
      }
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
    };

    // Force find any Thai voice
    const voices = window.speechSynthesis.getVoices();
    const thaiVoice = voices.find(v => v.lang === 'th-TH' || v.lang === 'th' || v.lang.includes('th'));
    if (thaiVoice) utterance.voice = thaiVoice;
    
    utterance.rate = 1.1;
    utterance.pitch = 1.2;
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
      
      if (!res.ok) {
        let errorMsg = 'ระบบขัดข้องชั่วคราวค่ะ';
        try {
          const errorData = await res.json();
          if (errorData.error) errorMsg = errorData.error;
        } catch (e) {
          errorMsg = `เกิดข้อผิดพลาด (${res.status})`;
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        speakText(errorMsg);
        return;
      }
      
      const data = await res.json();
      const replyText = data.reply || 'รับทราบคำสั่งค่ะ!';
      
      setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
      speakText(replyText); // Speak the AI's reply!

    } catch (error) {
      const fallbackMsg = 'แอ่ก... สัญญาณขาดหายค่ะ';
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackMsg }]);
      speakText(fallbackMsg);
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
              <span className="text-4xl">🤖</span>
            </div>
            <p className="text-center text-sm font-medium px-4 text-emerald-600/70">
              สถานะ: ระบบพร้อมทำงาน <br/>กรุณาป้อนคำสั่งผ่านข้อความหรือไมโครโฟน
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
          onClick={toggleManualListening}
          className={`absolute left-2 top-2 p-2.5 rounded-xl transition-all z-10 ${
            isManualListening 
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
              : 'bg-white text-gray-400 hover:text-emerald-500 hover:bg-slate-50'
          }`}
          title="กดเพื่อพูดคำสั่งเสียง"
        >
          {isManualListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isManualListening ? "กำลังฟัง..." : isWaitingForCommand ? "พร้อมรับคำสั่ง..." : "ป้อนคำสั่งที่นี่..."}
          className={`flex-1 bg-white border border-slate-200 rounded-2xl pl-14 pr-5 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium text-slate-700 placeholder-slate-400 shadow-sm transition-all ${isManualListening || isWaitingForCommand ? 'bg-red-50/50 border-red-200' : ''}`}
          disabled={isLoading || isManualListening}
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
