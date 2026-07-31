import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceNoteButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  isListening?: boolean;
}

export default function VoiceNoteButton({ onTranscript, className = '' }: VoiceNoteButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'tr-TR';
      rec.continuous = true;
      rec.interimResults = true;
      
      rec.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      rec.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          alert('Mikrofon erişimi reddedildi veya bu ortamda izin verilmiyor (Yeni sekmede açmayı deneyin).');
        } else {
          console.warn('Speech recognition warning:', event.error);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, [onTranscript]);

  const toggleRecording = () => {
    if (!recognition) {
      alert('Tarayıcınız ses tanıma özelliğini desteklemiyor. (Lütfen Chrome veya Safari kullanın)');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Could not start speech recognition', err);
        setIsRecording(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleRecording}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
        isRecording 
          ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
      } ${className}`}
      title="Sesli Not Ekle"
    >
      {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
      {isRecording ? 'Dinleniyor...' : 'Sesli Not'}
    </button>
  );
}
