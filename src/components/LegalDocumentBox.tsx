import React, { useState, useRef, useEffect } from 'react';
import { FileText, X, Check } from 'lucide-react';

interface LegalDocumentBoxProps {
  title: string;
  content: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export default function LegalDocumentBox({ title, content, checked, onChange, label }: LegalDocumentBoxProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasScrolledToBottom(true);
      }
    }
  };

  useEffect(() => {
    if (isModalOpen && scrollRef.current) {
      if (scrollRef.current.scrollHeight <= scrollRef.current.clientHeight) {
        setHasScrolledToBottom(true);
      }
    }
  }, [isModalOpen]);

  return (
    <>
      <div className="border border-gray-200 rounded-xl bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${checked ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`text-xs font-bold ${checked ? 'text-emerald-900' : 'text-gray-800'}`}>{title}</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {checked ? 'Belge okundu ve onaylandı.' : 'Lütfen belgeyi okuyarak onaylayınız.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            checked 
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
              : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
          }`}
        >
          {checked ? (
            <>
              <Check className="w-3.5 h-3.5" /> Görüntüle
            </>
          ) : (
            'Metni Oku ve Onayla'
          )}
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                {title}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="p-6 overflow-y-auto flex-1 text-sm text-gray-700 space-y-4 leading-relaxed"
            >
              {content}
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <label className={`flex items-start gap-3 p-3 rounded-xl border ${hasScrolledToBottom ? 'bg-white border-emerald-200 cursor-pointer shadow-sm' : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    if (hasScrolledToBottom) {
                      onChange(e.target.checked);
                      if (e.target.checked) {
                        setTimeout(() => setIsModalOpen(false), 300);
                      }
                    }
                  }}
                  disabled={!hasScrolledToBottom}
                  className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5 accent-emerald-600 disabled:bg-gray-300 transition-all cursor-pointer"
                />
                <div className="flex-1">
                  <span className={`text-xs font-bold block ${hasScrolledToBottom ? 'text-gray-900' : 'text-gray-500'}`}>
                    {label}
                  </span>
                  {!hasScrolledToBottom && (
                    <span className="block text-2xs text-red-500 mt-1 font-bold flex items-center gap-1">
                      (Onaylayabilmek için lütfen metnin en altına kadar kaydırarak okuyunuz)
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
