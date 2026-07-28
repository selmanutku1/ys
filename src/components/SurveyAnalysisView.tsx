import React, { useState } from 'react';
import { 
  FileText, Sparkles, X, Check, BarChart3, TrendingUp, Download, 
  Home, Utensils, BookOpen, Compass, ShieldCheck, Users, Info, 
  HelpCircle, MessageSquare, Printer, Send, Edit2, Trash2, Plus, 
  Eye, Settings, AlertCircle, ClipboardList
} from 'lucide-react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip 
} from 'recharts';
import KampSonuDegerlendirmeRaporu from './KampSonuDegerlendirmeRaporu';

import { SurveyResponse } from '../types';

interface SurveyAnalysisViewProps {
  participants: any[];
  periods: any[];
  surveys?: SurveyResponse[];
  questions: string[];
  setQuestions: React.Dispatch<React.SetStateAction<string[]>>;
  onNavigateToParticipant?: (participantId: string) => void;
  onAddLog?: (action: string, details: string) => void;
}


const categoryDetailsMap: { [key: string]: { label: string; key: string; description: string; icon: any; color: string; subMetrics: {name: string, score: number}[] } } = {
  'Tesis': { label: 'Tesis & Konaklama', key: 'tesis', description: 'Bungalovlar, yatak konforu, oda düzeni ve kampın fiziki altyapısı.', icon: Home, color: 'text-blue-500 bg-blue-50', subMetrics: [{name: 'Bungalov Temizliği', score: 4.2}, {name: 'Yatak Konforu', score: 4.5}, {name: 'Oda Düzeni', score: 4.1}] },
  'Yemek': { label: 'Yemekhane & Beslenme', key: 'yemek', description: 'Yemeklerin porsiyon miktarı, besleyicilik, sıcaklık, lezzet ve servis hijyeni.', icon: Utensils, color: 'text-orange-500 bg-orange-50', subMetrics: [{name: 'Lezzet', score: 4.3}, {name: 'Porsiyon', score: 4.0}, {name: 'Çeşitlilik', score: 3.8}] },
  'Eğitim': { label: 'Eğitim Faaliyetleri', key: 'egitim', description: 'Kişisel gelişim seminerleri, teknoloji atölyeleri ve farkındalık çalışmaları.', icon: BookOpen, color: 'text-indigo-500 bg-indigo-50', subMetrics: [{name: 'İçerik Kalitesi', score: 4.6}, {name: 'Eğitmen İletişimi', score: 4.8}, {name: 'Süre Yeterliliği', score: 4.2}] },
  'Etkinlik': { label: 'Sosyal Etkinlikler', key: 'etkinlik', description: 'Doğa yürüyüşleri, spor turnuvaları, istasyon oyunları ve akşam eğlenceleri.', icon: Compass, color: 'text-pink-500 bg-pink-50', subMetrics: [{name: 'Eğlence Düzeyi', score: 4.7}, {name: 'Çeşitlilik', score: 4.5}, {name: 'Katılım Oranı', score: 4.4}] },
  'Güvenlik': { label: 'Güvenlik Hizmetleri', key: 'guvenlik', description: 'Nöbetçi liderler, giriş-çıkış kontrolleri ve acil durumlara müdahale hazırlığı.', icon: ShieldCheck, color: 'text-red-500 bg-red-50', subMetrics: [{name: 'Nöbetçi Liderler', score: 4.9}, {name: 'Acil Durum Hazırlığı', score: 4.8}, {name: 'Giriş-Çıkış Kontrolü', score: 4.6}] },
  'Temizlik': { label: 'Temizlik & Hijyen', key: 'temizlik', description: 'Ortak kullanım alanları, tuvalet/duş temizliği ve genel hijyen koşulları.', icon: Sparkles, color: 'text-teal-500 bg-teal-50', subMetrics: [{name: 'Tuvalet/Duş', score: 3.9}, {name: 'Ortak Alanlar', score: 4.2}, {name: 'Genel Hijyen', score: 4.0}] },
  'Liderler': { label: 'Lider İletişimi', key: 'liderler', description: 'Grup liderlerinin güler yüzlülüğü, desteği, empati seviyesi ve rehberliği.', icon: Users, color: 'text-emerald-500 bg-emerald-50', subMetrics: [{name: 'İletişim & Empati', score: 4.9}, {name: 'Rehberlik', score: 4.8}, {name: 'Problem Çözme', score: 4.7}] }
};

export default function SurveyAnalysisView({ 
  participants, 
  periods, 
  surveys = [], 
  questions,
  setQuestions,
  onNavigateToParticipant, 
  onAddLog 
}: SurveyAnalysisViewProps) {
  const surveyData = surveys.map(s => {
    const participant = participants.find(p => p.id === s.participantId);
    
    // Normalize answers: use q5 if present, otherwise fallback to old fields
    const answers = s.answers?.q5 || {
      'Tesis': s.ratingBungalows,
      'Yemek': s.ratingMeals,
      'Eğitim': s.ratingTrainers,
      'Etkinlik': s.ratingActivities
    };
    
    const scores = Object.values(answers) as number[];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    return {
      id: s.id,
      participantId: s.participantId,
      name: participant?.name || 'Bilinmiyor',
      convoy: participant?.convoyName || 'Belirtilmemiş',
      camp: 'Belirtilmemiş',
      period: periods.find(p => p.id === s.campPeriodId)?.name || 'Belirtilmemiş',
      date: 'Tarih belirtilmemiş',
      genel: avg,
      answers,
      feedback: s.generalComment
    };
  });
  
  const [selectedConvoyFilter, setSelectedConvoyFilter] = useState('Tümü');
  const convoys = Array.from(new Set(surveyData.map(s => s.convoy)));
  
  const processedSurveyData = selectedConvoyFilter === 'Tümü' 
    ? surveyData 
    : surveyData.filter(s => s.convoy === selectedConvoyFilter);

  const [filterCamp, setFilterCamp] = useState('Tümü');
  const [selectedSurveyDetail, setSelectedSurveyDetail] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>('Tesis');
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [showPrintWarning, setShowPrintWarning] = useState(false);
  const [showReportView, setShowReportView] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]?.id || '');
  
  const uniqueConvoys = Array.from(new Set(participants?.map((p) => p.convoyName).filter((name): name is string => typeof name === 'string' && name.trim().length > 0) || []));
  const fallbackConvoys = ['İstanbul Pendik Genç Yeşilay Kafilesi', 'Ankara Keçiören Yeşilay Kulübü Kafilesi', 'İzmir Bornova Genç Yeşilay Grubu', 'Bursa İnegöl Sağlıklı Yaşam Grubu', 'Tüm Aktif Katılımcılar'];
  const availableConvoys = uniqueConvoys.length > 0 ? uniqueConvoys : fallbackConvoys;
  
  const [selectedConvoy, setSelectedConvoy] = useState<string>(availableConvoys[0] || 'İstanbul Pendik Genç Yeşilay Kafilesi');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState('');
  const [isSendingSurvey, setIsSendingSurvey] = useState(false);
  const [surveySendResult, setSurveySendResult] = useState<{ success: boolean; convoy: string; count: number } | null>(null);

  const handleSendSurvey = () => {
    if (questions.length === 0) {
      alert("Gönderilecek anket için en az 1 soru bulunmalıdır.");
      return;
    }
    setIsSendingSurvey(true);
    setSurveySendResult(null);
    setTimeout(() => {
      setIsSendingSurvey(false);
      let recipientCount = 15;
      if (selectedConvoy.toLowerCase().includes("tüm")) {
        recipientCount = participants?.length || 148;
      } else {
        const count = participants?.filter(p => p.convoyName === selectedConvoy).length || 0;
        recipientCount = count > 0 ? count : Math.floor(Math.random() * 8) + 12;
      }
      setSurveySendResult({ success: true, convoy: selectedConvoy, count: recipientCount });
      if (onAddLog) {
        onAddLog('Memnuniyet Anketi Gönderildi', `"${selectedConvoy}" grubundaki ${recipientCount} katılımcıya ${questions.length} soruluk memnuniyet anketi başarıyla gönderildi.`);
      }
    }, 1500);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    setQuestions([...questions, newQuestionText.trim()]);
    setNewQuestionText('');
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const saveEdit = (idx: number) => {
    if (!editingQuestionText.trim()) return;
    const newQs = [...questions];
    newQs[idx] = editingQuestionText;
    setQuestions(newQs);
    setEditingQuestionIndex(null);
  };

  const getChartData = () => {
    const allCategories = new Set<string>();
    processedSurveyData.forEach(s => Object.keys(s.answers).forEach(k => allCategories.add(k)));
    
    return Array.from(allCategories).map(cat => {
      const scores = processedSurveyData.map(s => s.answers[cat]).filter(v => typeof v === 'number');
      const sum = scores.reduce((acc, curr) => acc + (curr || 0), 0);
      const avg = scores.length > 0 ? (sum / scores.length).toFixed(1) : '0.0';
      return { name: cat, avg: parseFloat(avg) };
    });
  };

  const chartData = getChartData();
  const colors = ['#3b82f6', '#f97316', '#6366f1', '#ec4899'];

  const filteredSurveys = processedSurveyData;
  const overallAvg = (processedSurveyData.reduce((acc, curr) => acc + curr.genel, 0) / (processedSurveyData.length || 1)).toFixed(1);

  if (showReportView) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button onClick={() => setShowReportView(false)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition">
           <X className="w-4 h-4" /> Forma Dön
        </button>
        <KampSonuDegerlendirmeRaporu />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none"></div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md">Analiz Merkezi</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Kamp Sonu Değerlendirme Analizi</h2>
          <p className="text-sm font-medium text-gray-500">Öğrencilerin kamp sonrası geri bildirimleri, istatistikleri ve anket yönetimi.</p>
        </div>
        <div className="relative z-10 flex gap-3 flex-wrap">
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-emerald-200 transition-colors col-span-1 md:col-span-2 bg-gradient-to-r from-emerald-50 to-white">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Genel Memnuniyet Skoru</p>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-gray-900">{overallAvg}</p>
                <span className="text-sm font-bold text-gray-500">/ 5.0</span>
              </div>
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${parseFloat(overallAvg) >= 4.0 ? 'bg-emerald-500' : parseFloat(overallAvg) >= 3.0 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${(parseFloat(overallAvg) / 5) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-indigo-200 transition-colors">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Doldurulan Anket</p>
            <p className="text-2xl font-black text-gray-900">{filteredSurveys.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center hover:border-gray-300 transition-colors">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kafile/Grup Filtresi</p>
          <select 
            value={selectedConvoyFilter} 
            onChange={(e) => setSelectedConvoyFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="Tümü">Tüm Kafiler</option>
            {convoys.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center hover:border-gray-300 transition-colors">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kamp Merkezi Filtresi</p>
          <select 
            value={filterCamp} 
            onChange={(e) => setFilterCamp(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="Tümü">Tüm Kamp Merkezleri</option>
            <option value="Sarısu">Antalya / Sarısu Gençlik Kampı</option>
            <option value="Pamukova">Sakarya / Pamukova Gençlik Kampı</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">Kategori Bazlı Memnuniyet Ortalamaları</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} />
                  <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={60} onClick={(data) => setSelectedCategoryForModal(data.name)} style={{ cursor: 'pointer' }}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feedback List Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Son Değerlendirmeler</h3>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                {filteredSurveys.length} Kayıt
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredSurveys.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedSurveyDetail(item)}
                  className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 cursor-pointer transition-colors bg-white group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.camp} • {item.date}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-sm font-black text-gray-700">{item.genel}.0</span>
                    </div>
                  </div>
                  {item.feedback && (
                    <p className="text-sm text-gray-600 italic line-clamp-2 mt-2 leading-relaxed">
                      "{item.feedback}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Categories */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
            <div className="flex items-center gap-2 mb-6">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">Değerlendirme Kriterleri</h3>
            </div>
            <div className="space-y-3">
              {Object.keys(categoryDetailsMap).map(catKey => {
                const cat = categoryDetailsMap[catKey];
                const Icon = cat.icon;
                const fieldKey = cat.key as keyof typeof processedSurveyData[0];
                const sum = processedSurveyData.reduce((acc, curr) => acc + (curr[fieldKey] as number || 0), 0);
                const avg = processedSurveyData.length > 0 ? (sum / processedSurveyData.length).toFixed(1) : '0.0';
                const isActive = activeCategory === catKey;

                return (
                  <div 
                    key={catKey}
                    onClick={() => setSelectedCategoryForModal(catKey)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${isActive ? 'border-indigo-200 bg-indigo-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className={`font-bold text-sm ${isActive ? 'text-indigo-900' : 'text-gray-800'}`}>{cat.label}</h4>
                      </div>
                      <span className={`text-lg font-black ${parseFloat(avg) >= 4.5 ? 'text-emerald-600' : parseFloat(avg) >= 3.5 ? 'text-amber-600' : 'text-red-600'}`}>
                        {avg}
                      </span>
                    </div>
                    {isActive && (
                      <div className="mt-3 pt-3 border-t border-indigo-100/50 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs font-medium text-gray-500 leading-relaxed mb-3">
                          {cat.description}
                        </p>
                        <div className="space-y-2">
                          {cat.subMetrics && cat.subMetrics.map((sub, i) => (
                            <div key={i} className="flex flex-col gap-1">
                              <div className="flex justify-between items-center text-[10px] font-bold text-gray-600">
                                <span>{sub.name}</span>
                                <span className={sub.score >= 4.5 ? 'text-emerald-600' : sub.score >= 3.5 ? 'text-amber-500' : 'text-red-500'}>{sub.score.toFixed(1)}</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${sub.score >= 4.5 ? 'bg-emerald-500' : sub.score >= 3.5 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${(sub.score / 5) * 100}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

            {/* Category Detail Modal */}
      {selectedCategoryForModal && (() => {
        const cat = categoryDetailsMap[selectedCategoryForModal];
        const Icon = cat.icon;
        const fieldKey = cat.key as keyof typeof processedSurveyData[0];
        
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let total = 0;
        filteredSurveys.forEach(s => {
          const score = Math.round(s[fieldKey] as number);
          if (score >= 1 && score <= 5) {
            dist[score as keyof typeof dist]++;
            total++;
          }
        });

        const sum = filteredSurveys.reduce((acc, curr) => acc + (curr[fieldKey] as number || 0), 0);
        const avg = total > 0 ? (sum / total).toFixed(1) : '0.0';

        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedCategoryForModal(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/80">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight">{cat.label}</h3>
                    <p className="text-xs text-gray-500 font-medium">Kategori Detayları ve Puan Dağılımı</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCategoryForModal(null)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6 max-h-[70vh]">
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ortalama Puan</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-black text-gray-900">{avg}</p>
                      <span className="text-sm font-bold text-gray-400">/ 5.0</span>
                    </div>
                  </div>
                  <div className="flex-1">
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Toplam Yanıt</p>
                     <p className="text-3xl font-black text-gray-900">{total}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Puan Dağılımı</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = dist[star as keyof typeof dist];
                      const pct = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-600 w-12">{star} Puan</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="text-xs font-medium text-gray-500 w-12 text-right">{count} kişi</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Alt Metrikler</h4>
                  <div className="space-y-3">
                    {cat.subMetrics && cat.subMetrics.map((sub, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                          <span>{sub.name}</span>
                          <span className={sub.score >= 4.5 ? 'text-emerald-600' : sub.score >= 3.5 ? 'text-amber-500' : 'text-red-500'}>{sub.score.toFixed(1)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${sub.score >= 4.5 ? 'bg-emerald-500' : sub.score >= 3.5 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${(sub.score / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Survey Sending Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg">Yeni Anket Oluştur ve Gönder</h3>
                  <p className="text-xs text-gray-500 font-medium">Katılımcılara iletilecek anket sorularını düzenleyin</p>
                </div>
              </div>
              <button onClick={() => setIsPdfModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
              
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Hedef Kafile / Grup Seçimi</label>
                <select
                  value={selectedConvoy}
                  onChange={(e) => setSelectedConvoy(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {availableConvoys.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <label className="text-sm font-bold text-gray-700">Anket Soruları ({questions.length})</label>
                </div>
                
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={idx} className="flex gap-3 items-start group">
                      <div className="w-6 h-6 shrink-0 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold mt-1">
                        {idx + 1}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 p-1">
                        {editingQuestionIndex === idx ? (
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={editingQuestionText}
                              onChange={(e) => setEditingQuestionText(e.target.value)}
                              className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                              autoFocus
                            />
                            <button onClick={() => saveEdit(idx)} className="px-3 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">Kaydet</button>
                            <button onClick={() => setEditingQuestionIndex(null)} className="px-3 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300">İptal</button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start p-2">
                            <p className="text-sm text-gray-700 font-medium">{q}</p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => { setEditingQuestionIndex(idx); setEditingQuestionText(q); }}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              ><Edit2 className="w-4 h-4" /></button>
                              <button 
                                onClick={() => removeQuestion(idx)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              ><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddQuestion} className="flex gap-3 items-start pt-2">
                  <div className="w-6 h-6 shrink-0 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-xs font-bold mt-1">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input 
                      type="text"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="Yeni bir soru ekleyin..."
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
                    />
                    <button type="submit" disabled={!newQuestionText.trim()} className="px-4 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors">
                      Ekle
                    </button>
                  </div>
                </form>
              </div>

              {surveySendResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 animate-in fade-in">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">Anket Başarıyla Gönderildi!</h4>
                    <p className="text-sm text-emerald-700 mt-1">
                      <strong>{surveySendResult.convoy}</strong> grubundaki <strong className="font-black">{surveySendResult.count}</strong> katılımcıya değerlendirme anketi SMS ve e-posta ile iletildi.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsPdfModalOpen(false)} 
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Kapat
              </button>
              <button 
                onClick={handleSendSurvey}
                disabled={isSendingSurvey || questions.length === 0}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-md"
              >
                {isSendingSurvey ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Anketi Gönder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Detail Modal */}
      {selectedSurveyDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedSurveyDetail(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-lg uppercase">
                  {selectedSurveyDetail.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg leading-tight">{selectedSurveyDetail.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{selectedSurveyDetail.camp} • {selectedSurveyDetail.date}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSurveyDetail(null)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Genel Kamp Memnuniyeti</p>
                  <p className="text-sm font-medium text-amber-900">Katılımcının kamp sürecine dair genel puanı</p>
                </div>
                <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="text-2xl font-black text-amber-600">{selectedSurveyDetail.genel}.0</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Kategori Puanları (1-5)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(categoryDetailsMap).map(catKey => {
                    const cat = categoryDetailsMap[catKey];
                    const fieldKey = cat.key as keyof typeof selectedSurveyDetail;
                    const val = selectedSurveyDetail[fieldKey] as number;
                    return (
                      <div key={catKey} className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-700">{catKey}</span>
                        </div>
                        <span className={`text-base font-black ${val >= 4 ? 'text-emerald-600' : val >= 3 ? 'text-amber-500' : 'text-red-500'}`}>{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedSurveyDetail.feedback && (
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500" /> Açık Uçlu Yorum
                  </p>
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-sm text-indigo-900 leading-relaxed italic">"{selectedSurveyDetail.feedback}"</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedSurveyDetail(null)} 
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
