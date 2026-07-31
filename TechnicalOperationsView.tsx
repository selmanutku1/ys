import React, { useState } from 'react';
import { ClipboardList, Send, CheckCircle, BarChart3, X, Eye, Edit2, Trash2, Plus, Check, Star, Link, Download, MessageSquare } from 'lucide-react';
import { Participant, SurveyResponse, CampPeriod } from '../types';
import KampSonuDegerlendirmeRaporu from './KampSonuDegerlendirmeRaporu';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function SurveyManagementView({ 
  participants = [], 
  surveys = [], 
  questions = [], 
  setQuestions,
  setSurveys,
  campPeriods
}: { 
  participants?: Participant[], 
  surveys?: SurveyResponse[],
  questions: string[],
  setQuestions: React.Dispatch<React.SetStateAction<string[]>>,
  setSurveys: React.Dispatch<React.SetStateAction<SurveyResponse[]>>,
  campPeriods: CampPeriod[]
}) {
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('all');
  const [selectedConvoy, setSelectedConvoy] = useState<string>('all');
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'responses'>('dashboard');
  const [linkCopied, setLinkCopied] = useState(false);

  const convoys = Array.from(new Set(participants.map(p => p.convoyName).filter(Boolean)));
  const filteredParticipants = selectedConvoy === 'all' 
    ? participants 
    : participants.filter(p => p.convoyName === selectedConvoy);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + window.location.pathname + "?form=kamp-sonu-degerlendirme");
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const exportExcel = (data: SurveyResponse[], fileName: string, type: 'xlsx' | 'csv' = 'xlsx') => {
    const formattedData = data.map(s => {
      const row: any = {
        Katılımcı: participants.find(p => p.id === s.participantId)?.name || 'Bilinmiyor',
        KampDönemi: campPeriods.find(cp => cp.id === s.campPeriodId)?.name || 'Bilinmiyor',
      };
      
      // Flatten all answers
      if (s.answers) {
        Object.entries(s.answers).forEach(([key, val]) => {
          if (typeof val === 'object' && val !== null) {
            Object.entries(val).forEach(([subKey, subVal]) => {
              row[`${key} - ${subKey}`] = subVal;
            });
          } else {
            row[key] = val;
          }
        });
      }
      
      row['Yorum'] = s.generalComment;
      return row;
    });
    
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Anketler");
    
    if (type === 'csv') {
      XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: 'csv' });
    } else {
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }
  };

  const exportPDF = (data: SurveyResponse[], fileName: string) => {
    const doc = new jsPDF();
    doc.text("Anket Raporu", 14, 15);
    
    const headers = ['Katılımcı', 'Kamp Dönemi', ...questions, 'Yorum'];
    const body = data.map(s => [
      participants.find(p => p.id === s.participantId)?.name || 'Bilinmiyor',
      campPeriods.find(cp => cp.id === s.campPeriodId)?.name || 'Bilinmiyor',
      ...questions.map(q => s.answers?.q5?.[q] || '-'),
      s.generalComment
    ]);
    
    autoTable(doc, {
        head: [headers],
        body: body,
    });
    doc.save(`${fileName}.pdf`);
  };

  const filteredSurveys = surveys.filter(s => {
    const participant = participants.find(p => p.id === s.participantId);
    const matchesParticipant = selectedParticipantId === 'all' || s.participantId === selectedParticipantId;
    const matchesConvoy = selectedConvoy === 'all' || (participant && participant.convoyName === selectedConvoy);
    return matchesParticipant && matchesConvoy;
  });

  // Calculate stats from real surveys
  const totalSent = 150; 
  const receivedCount = surveys.length;
  const responseRate = totalSent > 0 ? ((receivedCount / totalSent) * 100).toFixed(0) : 0;
  const avgScore = receivedCount > 0 ? (surveys.reduce((acc, s) => {
    const vals = Object.values(s.answers?.q5 || {}) as number[];
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return acc + avg;
  }, 0) / receivedCount).toFixed(1) : '0.0';

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <ClipboardList className="w-6 h-6" /> Anket Yönetimi
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'dashboard', label: 'Genel Bakış' },
          { id: 'responses', label: 'Anket Yanıtları' },
          { id: 'form', label: 'Anket Formu' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Toplam Gönderim', val: totalSent, icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Yanıtlanan', val: receivedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Dönüş Oranı', val: `%${responseRate}`, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Ort. Puan', val: avgScore, icon: Star, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className={`${stat.bg} p-3 rounded-xl ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</p>
                  <p className="text-2xl font-black">{stat.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'responses' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Gelen Yanıtlar</h3>
              
              <div className="flex gap-4">
                <select
                  value={selectedConvoy}
                  onChange={(e) => {
                    setSelectedConvoy(e.target.value);
                    setSelectedParticipantId('all');
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tüm Kafiler</option>
                  {convoys.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={selectedParticipantId}
                  onChange={(e) => setSelectedParticipantId(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tüm Katılımcılar</option>
                  {filteredParticipants.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => exportExcel(filteredSurveys, 'AnketRaporu', 'xlsx')} 
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 bg-white px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Excel
                  </button>
                  <button 
                    onClick={() => exportExcel(filteredSurveys, 'AnketRaporu', 'csv')} 
                    className="text-sm font-semibold text-blue-700 hover:text-blue-900 bg-white px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" /> CSV
                  </button>
                  <button 
                    onClick={() => exportPDF(filteredSurveys, 'AnketRaporu')} 
                    className="text-sm font-semibold text-red-700 hover:text-red-900 bg-white px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSurveys.map(res => {
                const participant = participants.find(p => p.id === res.participantId);
                const q5Values = Object.values(res.answers?.q5 || {}) as number[];
                const avgScore = q5Values.length > 0 ? q5Values.reduce((a, b) => a + b, 0) / q5Values.length : 0;
                return (
                  <div key={res.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-gray-900 text-lg">{participant?.name || 'Bilinmiyor'}</p>
                        <span className="bg-indigo-50 text-indigo-700 font-black px-2.5 py-1 rounded-lg text-sm">
                          {avgScore.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-3 italic line-clamp-3">"{res.generalComment}"</p>
                    </div>
                    <button 
                      onClick={() => setSelectedSurvey(res)}
                      className="mt-5 w-full bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 py-2.5 rounded-xl transition-colors font-semibold text-sm"
                    >
                      Detayları İncele
                    </button>
                  </div>
                );
              })}
            </div>
        </div>
      )}

      {activeTab === 'form' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h3 className="text-xl font-black text-gray-900">Anket Formu</h3>
              <p className="text-sm text-gray-500 mt-1">Öğrencilerin kamp deneyimlerini ölçmek için kullanılan standart form.</p>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-sm font-bold transition-colors"
            >
              {linkCopied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Bağlantı Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Link className="w-4 h-4" />
                  <span>Form Bağlantısını Kopyala</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <KampSonuDegerlendirmeRaporu 
              questions={questions} 
              participants={participants}
              campPeriods={campPeriods}
              onSave={(response) => {
                const newSurvey: SurveyResponse = {
                  id: Date.now().toString(),
                  campPeriodId: response.campPeriodId,
                  ratingMeals: parseInt(response.answers.q5?.['Yemekhane ve beslenme'] || 3),
                  ratingActivities: parseInt(response.answers.q5?.['Etkinlik çeşitliliği'] || 3),
                  ratingBungalows: parseInt(response.answers.q5?.['Konaklama alanları'] || 3),
                  ratingTrainers: parseInt(response.answers.q5?.['Kamp çalışanlarının ilgisi'] || 3),
                  generalComment: response.comment,
                  answers: response.answers
                };
                setSurveys(prev => [...prev, newSurvey]);
              }}
            />
          </div>
        </div>
      )}


      {/* Detay Modal */}
      {selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Anket Detayları</h3>
              <div className="flex gap-2">
                <button onClick={() => exportExcel([selectedSurvey], `Anket_${selectedSurvey.id}`, 'xlsx')} className="text-sm font-semibold text-emerald-600 hover:text-emerald-800">Excel</button>
                <button onClick={() => exportExcel([selectedSurvey], `Anket_${selectedSurvey.id}`, 'csv')} className="text-sm font-semibold text-blue-600 hover:text-blue-800">CSV</button>
                <button onClick={() => exportPDF([selectedSurvey], `Anket_${selectedSurvey.id}`)} className="text-sm font-semibold text-red-600 hover:text-red-800">PDF</button>
                <button onClick={() => setSelectedSurvey(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              
              <p className="text-sm font-semibold text-gray-700">
                Katılımcı: <span className="font-bold text-gray-900">{participants.find(p => p.id === selectedSurvey.participantId)?.name}</span>
              </p>

              {/* Categorized View */}
              <div className="grid grid-cols-1 gap-4">
                {Object.entries({
                  "Yemek Puanı": selectedSurvey.ratingMeals,
                  "Aktivite Puanı": selectedSurvey.ratingActivities,
                  "Konaklama Puanı": selectedSurvey.ratingBungalows,
                  "Eğitmen Puanı": selectedSurvey.ratingTrainers,
                  ...(selectedSurvey.answers || {})
                }).map(([key, value]: [string, any], i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{key}</p>
                    <div className="mt-1">
                      {typeof value === 'object' && value !== null ? (
                        Object.entries(value).map(([label, val]: [string, any], j) => (
                          <div key={j} className="flex justify-between items-center py-1">
                            <span className="text-sm text-gray-700">{label}</span>
                            <span className="font-bold text-indigo-700">{val}</span>
                          </div>
                        ))
                      ) : (
                        <p className="font-bold text-gray-900">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <p className="font-bold mb-2">Genel Yorum:</p>
                <p className="bg-gray-50 p-3 rounded-lg text-gray-700 italic">"{selectedSurvey.generalComment}"</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

