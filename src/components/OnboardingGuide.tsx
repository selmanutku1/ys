import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';

interface Step {
  title: string;
  description: string;
}

interface OnboardingGuideProps {
  role: string;
  onComplete: () => void;
}

export function OnboardingGuide({ role, onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const roleGuides: Record<string, Step[]> = {
    'admin': [
      { title: 'Sisteme Hoş Geldiniz', description: 'Kamp Yönetim Sistemi (KYS) tüm operasyonları tek merkezden yönetmenizi sağlar.' },
      { title: 'Dashboard', description: 'Kapasite, doluluk, revir, teknik durum ve yemekhane gibi tüm modülleri buradan özet olarak takip edebilirsiniz.' },
      { title: 'Rol Bazlı Yönetim', description: 'Sistemde her personelin sadece kendi yetki alanını görebileceği bir yapı mevcuttur.' },
    ],
    'kayit': [
      { title: 'Kayıt ve Kabul Masası', description: 'Kampçılar kampa geldiğinde kayıt ve onay işlemlerini buradan yapacaksınız.' },
      { title: 'QR Kodlu Geçiş', description: 'Kabul işlemlerini tamamladığınız katılımcıların yaka kartı ve barkodlarını üretebilirsiniz.' },
    ],
    'saglik': [
      { title: 'Revir Modülü', description: 'Kampa gelen katılımcıların sağlık kayıtlarını, vizitelerini ve kullanılan ilaçları bu ekrandan yönetebilirsiniz.' },
      { title: 'Risk Takibi', description: 'Alerji veya kronik rahatsızlığı olan katılımcıları risk panosundan anlık izleyebilirsiniz.' },
    ],
    'teknik': [
      { title: 'Teknik ve Bakım', description: 'Kamp içindeki arıza taleplerini, tesisat sorunlarını ve malzeme ihtiyaçlarını buradan yönetebilirsiniz.' },
      { title: 'SLA Takibi', description: 'Açık arıza kayıtlarını önem derecesine göre listeleyip müdahale sürelerini izleyin.' },
    ],
    'yemekhane': [
      { title: 'Yemekhane Operasyonları', description: 'Günlük kamp nüfusuna göre yemek planlaması, menü yönetimi ve dağıtım takibi yapabilirsiniz.' },
      { title: 'Diyet Listeleri', description: 'Özel beslenme ihtiyacı (alerji, diyet) olan katılımcı listelerini sistem otomatik oluşturur.' },
    ],
    'guvenlik': [
      { title: 'Güvenlik ve Ziyaretçi', description: 'Kamp giriş çıkışlarını, ziyaretçileri ve kayıp eşya durumlarını buradan kaydedin.' },
      { title: 'Ziyaretçi Kartı', description: 'Yeni gelen ziyaretçilere QR kodlu giriş kartları yazdırabilirsiniz.' },
    ]
  };

  const defaultGuide: Step[] = [
    { title: 'Kamp Yönetim Sistemi', description: 'Sisteme başarıyla giriş yaptınız. Yetkili olduğunuz modüller sol menüde listelenmiştir.' },
    { title: 'Hızlı Başlangıç', description: 'İşlemlerinizi üst kısımdaki hızlı menülerden veya detaylı sekmelerden yapabilirsiniz.' }
  ];

  const steps = roleGuides[role] || defaultGuide;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#00AB41] to-emerald-400"></div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#00AB41]">
              <Sparkles className="w-6 h-6" />
            </div>
            <button onClick={onComplete} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-8 min-h-[120px]">
            <div className="inline-block px-2 py-1 bg-emerald-50 text-[#00AB41] text-xs font-bold rounded-lg mb-3">
              Adım {currentStep + 1} / {steps.length}
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">{steps[currentStep].title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              {steps[currentStep].description}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-6 bg-[#00AB41]' : 'w-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button 
                onClick={handleNext}
                className="px-5 h-10 flex items-center justify-center gap-2 rounded-xl bg-[#00AB41] hover:bg-emerald-600 text-white font-bold transition shadow-md shadow-emerald-200"
              >
                {currentStep === steps.length - 1 ? (
                  <>Başla <Check className="w-4 h-4" /></>
                ) : (
                  <>İleri <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
