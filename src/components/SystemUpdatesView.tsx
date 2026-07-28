import React from 'react';
import { Sparkles, Mic, Calendar } from 'lucide-react';

export default function SystemUpdatesView() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          Sistem Güncellemeleri (v0.9.1 Beta)
        </h2>
        <p className="text-sm text-gray-500 mb-6">KYS platformuna eklenen en yeni özellikler ve iyileştirmeler.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Sesli Not ve Komut Asistanı</h4>
              <p className="text-xs text-gray-600 mt-1">Revir, teknik arıza bildirimleri ve olay tutanaklarında sesli not ile hızlı metin girişi eklendi. Sesinizi metne dökerek kayıt işlemlerini hızlandırabilirsiniz.</p>
            </div>
          </div>
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Gelişmiş Google Takvim Entegrasyonu</h4>
              <p className="text-xs text-gray-600 mt-1">Sistem takvimi ile Google Calendar arasında çift yönlü senkronizasyon ve ajanda görünümleri sağlandı. Artık etkinliklerinizi doğrudan Google hesabınızdan yönetebilirsiniz.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
