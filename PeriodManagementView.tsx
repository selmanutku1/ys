import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Loader2, Maximize2, Minimize2, Moon, Sun, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  action?: { type: string; payload: string };
  steps?: { id: number; text: string; status: 'running' | 'success' | 'error' }[];
}

interface YesilAiChatbotProps {
  onNavigate: (tab: any) => void;
  onFullscreen: (enable: boolean) => void;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onLockScreen: () => void;
  onDataAction?: (actionType: string, payload: any) => void;
}

export default function YesilAiChatbot({ onNavigate, onFullscreen, onThemeChange, onLockScreen, onDataAction }: YesilAiChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Merhaba! Ben YeşilAI. KYS üzerinde size nasıl yardımcı olabilirim? Örneğin "Kamp takvimini aç", "Yemekhaneye git", "Depoya bak", "Karanlık moda geç" veya "Tam ekran yap" diyebilirsiniz.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 5000);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent, directInput?: string) => {
    e?.preventDefault();
    const textToSend = directInput || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend };
    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: ChatMessage = {
      id: botMessageId,
      role: 'model',
      text: '',
      steps: [{ id: 1, text: 'Talebiniz analiz ediliyor...', status: 'running' }]
    };

    setMessages(prev => [...prev, userMessage, initialBotMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.filter(m => m.id !== '1').map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage.text, history })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'API Error');
      }
      const data = await res.json();
      
      setMessages(prev => prev.map(m => m.id === botMessageId ? {
        ...m,
        steps: [
          { id: 1, text: 'Talep analiz edildi', status: 'success' },
          { id: 2, text: 'Aksiyonlar belirleniyor...', status: 'running' }
        ]
      } : m));

      await new Promise(resolve => setTimeout(resolve, 600));

      const actionStepText = data.action ? 'Sistem işlemleri uygulanıyor...' : 'Yanıt hazırlanıyor...';
      
      setMessages(prev => prev.map(m => m.id === botMessageId ? {
        ...m,
        steps: [
          { id: 1, text: 'Talep analiz edildi', status: 'success' },
          { id: 2, text: 'Aksiyonlar belirlendi', status: 'success' },
          { id: 3, text: actionStepText, status: 'running' }
        ]
      } : m));

      await new Promise(resolve => setTimeout(resolve, 800));

      setMessages(prev => prev.map(m => m.id === botMessageId ? {
        ...m,
        text: data.text,
        action: data.action,
        steps: [
          { id: 1, text: 'Talep analiz edildi', status: 'success' },
          { id: 2, text: 'Aksiyonlar belirlendi', status: 'success' },
          { id: 3, text: data.action ? 'Sistem işlemleri uygulandı' : 'Yanıt hazırlandı', status: 'success' }
        ]
      } : m));

      if (data.action) {
        console.log('Chatbot received action:', data.action);
        const { type, payload } = data.action;
        const normalizedType = type?.toUpperCase().trim();
        
        console.log('Chatbot processing action type:', normalizedType, 'payload:', payload);
        
        if (normalizedType === 'NAVIGATE') onNavigate(payload);
        else if (normalizedType === 'FULLSCREEN') onFullscreen(payload === 'true');
        else if (normalizedType === 'THEME') onThemeChange(payload as any);
        else if (normalizedType === 'LOCK_SCREEN') onLockScreen();
        else if (normalizedType === 'DATA_ACTION' && onDataAction) {
          try {
            console.log('Chatbot DATA_ACTION payload before parse:', payload);
            const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
            console.log('Chatbot parsed DATA_ACTION:', parsed);
            onDataAction(parsed.actionName, parsed.data);
          } catch (e) {
            console.error("Failed to parse DATA_ACTION payload", payload, e);
          }
        }
      }

    } catch (err: any) {
      setMessages(prev => prev.map(m => m.id === botMessageId ? {
        ...m,
        text: err.message || 'Üzgünüm, şu anda bağlantı kuramıyorum. Lütfen daha sonra tekrar deneyin.',
        steps: [
          { id: 1, text: err.message || 'Bağlantı hatası oluştu', status: 'error' }
        ]
      } : m));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-emerald-600 dark:text-emerald-400 rounded-full shadow-2xl z-[999999] flex items-center justify-center border border-gray-100 dark:border-gray-700 print:hidden group"
            title="YeşilAI Asistanı"
          >
            <AnimatePresence>
              {showTooltip && !isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-full right-0 mb-4 w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-3 rounded-2xl rounded-br-sm shadow-xl border border-gray-100 dark:border-gray-700 pointer-events-none"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full shrink-0">
                      <svg viewBox="0 0 100 100" className="w-4 h-4 fill-emerald-600 dark:fill-emerald-400">
    <path d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z" />
  </svg>
                    </div>
                    <p className="text-sm font-medium leading-tight">Ben YeşilAI, "Kamp takvimini aç" veya "Yemekhaneye git" gibi komutları deneyebilirsiniz.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            
            {/* Custom Green Crescent Logo */}
            <svg viewBox="0 0 100 100" className="w-7 h-7 fill-emerald-600 dark:fill-emerald-400">
    <path d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z" />
  </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-3xl flex flex-col overflow-hidden z-[999999] border border-gray-200 dark:border-gray-700 print:hidden"
          >
            {/* Header */}
            <div className="bg-emerald-600 px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 text-white">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <svg viewBox="0 0 100 100" className="w-5 h-5 fill-white">
    <path d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z" />
  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">YeşilAI Asistan</h3>
                  <p className="text-[10px] text-emerald-100 font-medium mt-1">Sistem Komutları Aktif</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-gray-900/50 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                    }`}
                  >
                    {msg.text && <div className="mt-1 leading-relaxed">{msg.text}</div>}
                    {msg.steps && msg.steps.length > 0 && (
                      <div className="mt-2 space-y-1.5 p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        {msg.steps.map(step => (
                          <div key={step.id} className="flex items-center gap-2 text-[11px] font-medium">
                            {step.status === 'running' && <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />}
                            {step.status === 'success' && (
                              <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            )}
                            {step.status === 'error' && (
                              <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            )}
                            <span className={step.status === 'success' ? 'text-emerald-700 dark:text-emerald-400 opacity-90' : 'text-gray-700 dark:text-gray-300'}>{step.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.action && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {msg.action.type === 'NAVIGATE' && <MessageSquare className="w-3.5 h-3.5" />}
                        {msg.action.type === 'FULLSCREEN' && (msg.action.payload === 'true' ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />)}
                        {msg.action.type === 'THEME' && (msg.action.payload === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />)}
                        {msg.action.type === 'LOCK_SCREEN' && <Lock className="w-3.5 h-3.5" />}
                        Eylem gerçekleştirildi
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {/* Extra loader removed because steps cover the loading state */}
              <div ref={messagesEndRef} />
            </div>

            {/* Shortcuts Area */}
            <div className="px-3 pt-3 flex gap-2 overflow-x-auto scrollbar-thin">
              {[
                { label: 'Kamp Takvimi', cmd: 'Kamp takvimini aç' },
                { label: 'Yemekhane', cmd: 'Yemekhaneye git' },
                { label: 'Depo', cmd: 'Depoya bak' },
                { label: 'Teknik', cmd: 'Teknik işleri aç' }
              ].map((sc) => (
                <button
                  key={sc.cmd}
                  onClick={() => handleSend(undefined, sc.cmd)}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold whitespace-nowrap hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  {sc.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
              <form onSubmit={handleSend} className="flex items-end gap-2 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="YeşilAI'a bir komut verin..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all pr-12"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[9px] text-gray-400 font-medium">Gemini AI tarafından desteklenmektedir</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
