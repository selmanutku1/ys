import React, { useState } from 'react';
import { Send, CheckCircle, MessageSquare, Star } from 'lucide-react';
import { Participant, CampPeriod } from '../types';

export default function KampSonuDegerlendirmeRaporu({ 
  questions = [], 
  participants = [],
  campPeriods = [],
  onSave 
}: { 
  questions?: string[], 
  participants?: Participant[],
  campPeriods?: CampPeriod[],
  onSave?: (response: any) => void 
}) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedCampPeriodId, setSelectedCampPeriodId] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampPeriodId) {
      alert("Lütfen bir kamp dönemi seçin.");
      return;
    }
    const response = {
      campPeriodId: selectedCampPeriodId,
      answers,
      comment
    };
    if (onSave) {
      onSave(response);
    }
    setSubmitted(true);
  };

  const handleRadioChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleGridChange = (questionId: string, item: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [item]: value
      }
    }));
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-emerald-100 animate-in fade-in">
        <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
        <h2 className="text-2xl font-black text-gray-900">Teşekkürler!</h2>
        <p className="text-gray-600 mt-2">Değerlendirmeniz başarıyla kaydedildi.</p>
      </div>
    );
  }

  const renderRadioGroup = (id: string, label: string, options: string[], showOther?: boolean) => (
    <div className="space-y-3 p-5 bg-gray-50 rounded-xl border border-gray-100">
      <p className="font-bold text-gray-800">{label}</p>
      <div className="space-y-2">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group" onClick={() => handleRadioChange(id, opt)}>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${answers[id] === opt ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300 bg-white group-hover:border-emerald-400'}`}>
              {answers[id] === opt && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <span className="text-sm text-gray-700 font-medium">{opt}</span>
          </label>
        ))}
        {showOther && (
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${answers[id]?.startsWith('Diğer:') ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300 bg-white group-hover:border-emerald-400'}`}>
              {answers[id]?.startsWith('Diğer:') && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <span className="text-sm text-gray-700 font-medium whitespace-nowrap">Diğer:</span>
            <input 
              type="text" 
              className="flex-1 border-b border-gray-300 bg-transparent focus:border-emerald-500 focus:outline-none text-sm px-1 py-0.5"
              onChange={(e) => handleRadioChange(id, `Diğer: ${e.target.value}`)}
              onClick={(e) => {
                if (!answers[id]?.startsWith('Diğer:')) {
                  handleRadioChange(id, 'Diğer: ');
                }
              }}
              value={answers[id]?.startsWith('Diğer:') ? answers[id].replace('Diğer: ', '') : ''}
            />
          </label>
        )}
      </div>
    </div>
  );

  const renderGrid = (id: string, label: string, items: string[], maxVal: number = 5) => (
    <div className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-100 overflow-x-auto">
      <p className="font-bold text-gray-800">{label}</p>
      <div className="min-w-[500px]">
        <div className="grid grid-cols-12 gap-2 mb-2 px-2">
          <div className="col-span-6"></div>
          {Array.from({length: maxVal}).map((_, i) => (
            <div key={i} className="col-span-1 text-center font-bold text-xs text-gray-500">{i + 1}</div>
          ))}
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={item} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg ${idx % 2 === 0 ? 'bg-white' : 'bg-transparent'}`}>
              <div className="col-span-6 text-sm font-medium text-gray-700 pr-4">{item}</div>
              {Array.from({length: maxVal}).map((_, i) => {
                const val = i + 1;
                const isSelected = answers[id]?.[item] === val;
                return (
                  <div key={i} className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleGridChange(id, item, val)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300 bg-white hover:border-emerald-400'}`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-10 h-10 fill-emerald-600">
              <path d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">Kamp Sonu<br/><span className="text-emerald-600">Değerlendirme Anketi</span></h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-100 space-y-2 col-span-2">
          <label className="font-bold text-gray-800">Kamp Dönemi Seçiniz:</label>
          <select 
            value={selectedCampPeriodId}
            onChange={(e) => setSelectedCampPeriodId(e.target.value)}
            className="w-full border border-indigo-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Bir kamp dönemi seçin...</option>
            {campPeriods.map(cp => (
              <option key={cp.id} value={cp.id}>{cp.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-black text-emerald-800 border-b-2 border-emerald-100 pb-2 inline-block">D. Ek Sorular</h3>
              {questions.map((q, i) => (
                <div key={i} className="p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <p className="font-bold text-gray-800">{q}</p>
                    <input 
                      type="text" 
                      className="w-full mt-2 border border-gray-300 rounded-lg p-2 focus:ring-emerald-500 focus:border-emerald-500" 
                      placeholder="Cevabınız..."
                      onChange={(e) => setAnswers(prev => ({ ...prev, [`dyn_${i}`]: e.target.value }))}
                    />
                </div>
              ))}
            </section>
        )}
        
        {/* A. Genel Bilgiler */}
        <section className="space-y-4">
          <h3 className="text-lg font-black text-emerald-800 border-b-2 border-emerald-100 pb-2 inline-block">A. Genel Bilgiler</h3>
          
          {renderRadioGroup(
            "q1",
            "1. Katıldığınız kamp programı türü nedir?",
            ["Çocuk Kampı", "Gençlik Kampı", "Aile Kampı", "Spor Kampı", "Eğitim / Seminer Kampı", "Uluslararası Kamp"],
            true
          )}

          {renderRadioGroup(
            "q2",
            "2. Daha önce Yeşilay Yaylagöl Kamp Merkezi'ni ziyaret ettiniz mi?",
            ["İlk ziyaretim", "2-3 kez", "4 ve üzeri"]
          )}

          {renderRadioGroup(
            "q3",
            "3. Kamp süreniz ne kadardı?",
            ["1-2 gün", "3-5 gün", "1 hafta ve üzeri"]
          )}
        </section>

        {/* B. Genel Memnuniyet Değerlendirmesi */}
        <section className="space-y-4">
          <h3 className="text-lg font-black text-emerald-800 border-b-2 border-emerald-100 pb-2 inline-block">B. Genel Memnuniyet Değerlendirmesi</h3>
          
          <div className="space-y-3 p-5 bg-gray-50 rounded-xl border border-gray-100">
            <p className="font-bold text-gray-800">4. Kamp deneyiminizi genel olarak nasıl değerlendirirsiniz?</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { val: 1, label: "Çok kötü", stars: 1 },
                { val: 2, label: "Kötü", stars: 2 },
                { val: 3, label: "Orta", stars: 3 },
                { val: 4, label: "İyi", stars: 4 },
                { val: 5, label: "Çok iyi", stars: 5 }
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => handleRadioChange("q4", opt.val.toString())}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all flex-1 min-w-[100px] ${answers["q4"] === opt.val.toString() ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 bg-white hover:border-emerald-300'}`}
                >
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({length: opt.stars}).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${answers["q4"] === opt.val.toString() ? 'fill-emerald-500 text-emerald-500' : 'fill-gray-300 text-gray-300'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-bold ${answers["q4"] === opt.val.toString() ? 'text-emerald-800' : 'text-gray-600'}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {renderGrid(
            "q5",
            "5. Aşağıdaki alanlardan memnuniyet düzeyinizi değerlendiriniz. (1-5 Puan)",
            [
              "Konaklama alanları",
              "Yemekhane ve beslenme",
              "Temizlik ve hijyen",
              "Kamp çalışanlarının ilgisi",
              "Güvenlik önlemleri",
              "Etkinlik çeşitliliği",
              "Spor imkanları",
              "Doğal alanların kullanımı"
            ]
          )}
        </section>

        {/* C. Doğa ve Çevre Deneyimi */}
        <section className="space-y-4">
          <h3 className="text-lg font-black text-emerald-800 border-b-2 border-emerald-100 pb-2 inline-block">C. Doğa ve Çevre Deneyimi</h3>

          {renderRadioGroup(
            "q6",
            "6. Kamp alanındaki doğal çevre deneyiminizi nasıl değerlendirirsiniz?",
            ["Çok yetersiz", "Yetersiz", "Orta", "İyi", "Çok iyi"]
          )}

          {renderGrid(
            "q7",
            "7. Kamp alanındaki göl alanı deneyiminiz nasıldı? (1-5 Puan)",
            [
              "Göl manzarası ve atmosfer",
              "Göl çevresi yürüyüş alanları",
              "Dinlenme noktaları",
              "Fotoğraf alanları",
              "Doğa ile etkileşim"
            ]
          )}

          {renderRadioGroup(
            "q8",
            "8. Kamp alanındaki orman ve ağaçlık alanların kullanımını nasıl değerlendirirsiniz?",
            ["Çok yetersiz", "Yetersiz", "Orta", "İyi", "Çok iyi"]
          )}
        </section>

        <div className="space-y-3 pt-4">
          <label className="font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Yorum ve Açıklamalarınız
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none min-h-[120px] bg-gray-50"
            placeholder="Eklemek istediğiniz diğer düşünceleriniz, önerileriniz veya şikayetleriniz..."
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mt-4"
        >
          <Send className="w-5 h-5" />
          Değerlendirmeyi Gönder
        </button>
      </form>
    </div>
  );
}
