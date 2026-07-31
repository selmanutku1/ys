import React, { useState, useMemo } from 'react';
import { SystemLog, Expense, Participant, CampCenter, Task, CampIncident, HealthIncident, CampActivity, SurveyResponse, CampPeriod } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Filter, Calendar, MapPin, Download, RefreshCw, BarChart2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsViewProps {
  logs: SystemLog[];
  expenses: Expense[];
  participants: Participant[];
  campCenters: CampCenter[];
  tasks?: Task[];
  incidents?: CampIncident[];
  healthIncidents?: HealthIncident[];
  activities?: CampActivity[];
  surveys?: SurveyResponse[];
  periods?: CampPeriod[];
}

export default function ReportsView({ 
  logs, 
  expenses, 
  participants, 
  campCenters, 
  tasks = [], 
  incidents = [], 
  healthIncidents = [],
  activities = [],
  surveys = [],
  periods = []
}: ReportsViewProps) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedCenter, setSelectedCenter] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSummaryPeriod, setSelectedSummaryPeriod] = useState<string>('');
  const itemsPerPage = 15;

  const filteredData = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let combined: any[] = [];

    // System Logs
    if (reportType === 'all' || reportType === 'logs') {
      const fLogs = logs.filter(log => {
        const d = new Date(log.timestamp);
        return d >= start && d <= end;
      }).map(l => ({ type: 'log', date: l.timestamp, details: l.details, user: l.userName, action: l.action }));
      combined = [...combined, ...fLogs];
    }

    // Expenses
    if (reportType === 'all' || reportType === 'expenses') {
      const fExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      }).map(e => ({ type: 'expense', date: e.date, details: `${e.category}: ${e.amount} ₺ - ${e.description}`, user: 'Sistem', action: 'Masraf Eklendi' }));
      combined = [...combined, ...fExpenses];
    }

    // Participants
    if (reportType === 'all' || reportType === 'participants') {
      const fParticipants = participants.filter(p => {
        const d = new Date(p.checkInTime || new Date().toISOString());
        const isDateValid = d >= start && d <= end;
        const isCenterValid = selectedCenter === 'all' || p.campPeriodId === selectedCenter;
        return isDateValid && isCenterValid;
      }).map(p => ({ type: 'participant', date: (p.checkInTime || new Date().toISOString()), details: `${p.name} (${p.identityNumber}) sisteme eklendi.`, user: 'Kayıt Birimi', action: 'Yeni Katılımcı' }));
      combined = [...combined, ...fParticipants];
    }

    // Tasks
    if (reportType === 'all' || reportType === 'tasks') {
      const fTasks = tasks.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      }).map(t => ({ type: 'task', date: t.date, details: `[${t.department}] ${t.title} - ${t.status}`, user: t.assignedToName, action: 'Görev' }));
      combined = [...combined, ...fTasks];
    }

    // Incidents
    if (reportType === 'all' || reportType === 'incidents') {
      const fIncidents = incidents.filter(i => {
        const d = new Date(i.dateTime);
        return d >= start && d <= end;
      }).map(i => ({ type: 'incident', date: i.dateTime, details: `[${i.type}] ${i.title} - ${i.status}`, user: i.reporterName, action: 'Olay/Tutanak' }));
      combined = [...combined, ...fIncidents];
    }

    // Health Incidents
    if (reportType === 'all' || reportType === 'health') {
      const fHealth = healthIncidents.filter(h => {
        const d = new Date(h.dateTime);
        return d >= start && d <= end;
      }).map(h => ({ type: 'health', date: h.dateTime, details: `Şikayet: ${h.complaint} - Durum: ${h.status}`, user: 'Sağlık Birimi', action: 'Revir Kaydı' }));
      combined = [...combined, ...fHealth];
    }

    // Activities
    if (reportType === 'all' || reportType === 'activities') {
      const fActivities = activities.filter(a => {
        const d = new Date(a.dateTime);
        return d >= start && d <= end;
      }).map(a => ({ type: 'activity', date: a.dateTime, details: `${a.title} (${a.type}) - Lokasyon: ${a.location}`, user: 'Eğitim Birimi', action: 'Kamp Aktivitesi' }));
      combined = [...combined, ...fActivities];
    }

    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return combined;
  }, [logs, expenses, participants, tasks, incidents, healthIncidents, activities, startDate, endDate, selectedCenter, reportType]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const summaryData = useMemo(() => {
    const counts = { log: 0, expense: 0, participant: 0, task: 0, incident: 0, health: 0, activity: 0 };
    filteredData.forEach(d => {
      if (counts[d.type as keyof typeof counts] !== undefined) {
        counts[d.type as keyof typeof counts]++;
      }
    });

    return [
      { name: 'Sistem Logları', value: counts.log, color: '#3b82f6' },
      { name: 'Masraflar', value: counts.expense, color: '#f59e0b' },
      { name: 'Kayıtlar', value: counts.participant, color: '#10b981' },
      { name: 'Görevler', value: counts.task, color: '#8b5cf6' },
      { name: 'Olaylar', value: counts.incident, color: '#ef4444' },
      { name: 'Revir', value: counts.health, color: '#ec4899' },
      { name: 'Aktiviteler', value: counts.activity, color: '#06b6d4' }
    ].filter(d => d.value > 0);
  }, [filteredData]);

  // Pagination Change handler that also ensures page is valid
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredData, currentPage, totalPages]);


  

  const downloadSummaryPDF = () => {
    if (!selectedSummaryPeriod) {
      alert('Lütfen özetini almak istediğiniz kamp dönemini seçiniz.');
      return;
    }

    try {
      const doc = new jsPDF();
      
      const period = periods.find(p => p.id === selectedSummaryPeriod);
      const periodName = period ? period.name : 'Secilen Donem';
      const safePeriodName = periodName.replace(/[^a-zA-Z0-9 -]/g, '');

      // Check dates
      const start = period ? new Date(period.startDate) : new Date(0);
      const end = period ? new Date(period.endDate) : new Date(8640000000000000);
      end.setHours(23, 59, 59, 999);

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('DONEM KAPANIS OZETI', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Kamp Donemi: ${safePeriodName}`, 105, 28, { align: 'center' });

      let currentY = 40;

      // 1. Health Incidents
      const pHealth = healthIncidents.filter(h => {
        const d = new Date(h.dateTime);
        return d >= start && d <= end;
      });
      doc.setFont('helvetica', 'bold');
      doc.text('1. Saglik Olaylari', 14, currentY);
      currentY += 8;

      if (pHealth.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Tarih', 'Ogrenci TC', 'Durum', 'Sikayet', 'Tedavi']],
          body: pHealth.map(h => [
            new Date(h.dateTime).toLocaleDateString('tr-TR'),
            h.participantId.slice(-4),
            h.status,
            h.complaint.substring(0, 30),
            h.treatment.substring(0, 30)
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [220, 38, 38] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Bu donemde kaydedilmis saglik olayi bulunmamaktadir.', 14, currentY);
        currentY += 15;
      }

      // 2. Technical Tasks
      const pTasks = tasks.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('2. Teknik Talepler ve Operasyon', 14, currentY);
      currentY += 8;

      if (pTasks.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Tarih', 'Departman', 'Baslik', 'Durum']],
          body: pTasks.map(t => [
            new Date(t.date).toLocaleDateString('tr-TR'),
            t.department,
            t.title.substring(0, 30),
            t.status
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [147, 51, 234] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Bu donemde kaydedilmis teknik gorev/talep bulunmamaktadir.', 14, currentY);
        currentY += 15;
      }

      // 3. Surveys
      const pSurveys = surveys.filter(s => s.campPeriodId === selectedSummaryPeriod);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('3. Katilimci Anket Sonuclari (Ortalamalar)', 14, currentY);
      currentY += 8;

      if (pSurveys.length > 0) {
        const avgMeals = (pSurveys.reduce((sum, s) => sum + s.ratingMeals, 0) / pSurveys.length).toFixed(1);
        const avgActivities = (pSurveys.reduce((sum, s) => sum + s.ratingActivities, 0) / pSurveys.length).toFixed(1);
        const avgBungalows = (pSurveys.reduce((sum, s) => sum + s.ratingBungalows, 0) / pSurveys.length).toFixed(1);
        const avgTrainers = (pSurveys.reduce((sum, s) => sum + s.ratingTrainers, 0) / pSurveys.length).toFixed(1);

        autoTable(doc, {
          startY: currentY,
          head: [['Kriter', 'Ortalama Puan (5 uzerinden)']],
          body: [
            ['Yemekhane ve Ogunler', avgMeals],
            ['Egitim ve Aktiviteler', avgActivities],
            ['Bungalov ve Temizlik', avgBungalows],
            ['Egitmenler ve Ilgi', avgTrainers]
          ],
          styles: { fontSize: 10 },
          headStyles: { fillColor: [5, 150, 105] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Bu donem icin doldurulmus anket bulunmamaktadir.', 14, currentY);
      }

      doc.save(`donem_kapani_ozeti_${safePeriodName}.pdf`);

    } catch (err) {
      console.error(err);
      alert('Ozet PDF olusturulurken bir hata olustu.');
    }
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('KAMP YONETIM SISTEMI', 105, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('Genel Faaliyet Raporu', 105, 28, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tarih Araligi: ${new Date(startDate).toLocaleDateString('tr-TR')} - ${new Date(endDate).toLocaleDateString('tr-TR')}`, 105, 34, { align: 'center' });
      doc.text(`Toplam Islem: ${filteredData.length}`, 105, 40, { align: 'center' });

      autoTable(doc, {
        startY: 50,
        head: [['Tarih', 'Islem Tipi', 'Kullanici', 'Detaylar']],
        body: filteredData.map(row => [
          new Date(row.date).toLocaleDateString('tr-TR') + ' ' + new Date(row.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}),
          row.action,
          row.user,
          row.details
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [5, 150, 105] },
        columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 }, 3: { cellWidth: 'auto' } }
      });

      doc.save('faaliyet_raporu.pdf');
    } catch (e) {
      console.error(e);
      alert('Rapor PDF olarak indirilirken bir hata oluştu. Lütfen yeni sekmede açın.');
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'log': return 'bg-blue-50 text-blue-700';
      case 'expense': return 'bg-amber-50 text-amber-700';
      case 'participant': return 'bg-emerald-50 text-emerald-700';
      case 'task': return 'bg-purple-50 text-purple-700';
      case 'incident': return 'bg-red-50 text-red-700';
      case 'health': return 'bg-pink-50 text-pink-700';
      case 'activity': return 'bg-cyan-50 text-cyan-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'log': return 'Sistem';
      case 'expense': return 'Finans';
      case 'participant': return 'Kayıt';
      case 'task': return 'Operasyon';
      case 'incident': return 'Güvenlik';
      case 'health': return 'Sağlık';
      case 'activity': return 'Eğitim';
      default: return 'Diğer';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-emerald-600" />
            Genel Faaliyet Raporları
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Sistemdeki tüm birimlerin ve süreçlerin detaylı raporu.</p>
        </div>
        <button 
          onClick={downloadPDF}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          Tümünü PDF İndir
        </button>
      </div>

      
      {/* Dönem Kapanış Özeti Paneli */}
      <div className="bg-emerald-50/50 p-4 sm:p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-emerald-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Dönem Kapanış Özeti
          </h3>
          <p className="text-xs text-emerald-700 mt-1">
            Seçilen kamp dönemine ait sağlık, teknik ve anket sonuçlarını içeren özet raporu oluşturun.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={selectedSummaryPeriod}
            onChange={(e) => setSelectedSummaryPeriod(e.target.value)}
            className="p-2.5 border border-emerald-200 rounded-xl text-sm font-semibold bg-white focus:outline-emerald-500 w-full md:w-56"
          >
            <option value="">-- Dönem Seçin --</option>
            {periods.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={downloadSummaryPDF}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Özet PDF Al
          </button>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">

        <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="font-bold text-gray-700">Filtreler</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Başlangıç Tarihi</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Bitiş Tarihi</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Kamp Merkezi (Sadece Kayıtlar İçin)</label>
            <select 
              value={selectedCenter} 
              onChange={e => setSelectedCenter(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">Tüm Merkezler</option>
              {campCenters.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Veri Türü / Süreç</label>
            <select 
              value={reportType} 
              onChange={e => {
                setReportType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">Tüm Süreçler</option>
              <option value="logs">Sistem Logları</option>
              <option value="expenses">Masraflar</option>
              <option value="participants">Yeni Kayıtlar</option>
              <option value="tasks">Teknik/Operasyon Görevleri</option>
              <option value="incidents">Güvenlik/Disiplin Olayları</option>
              <option value="health">Revir/Sağlık Kayıtları</option>
              <option value="activities">Eğitim/Aktivite Planları</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Süreç Hareketleri</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg whitespace-nowrap">
              Toplam {filteredData.length} Kayıt
            </span>
          </div>
          
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-3 font-bold w-36">Tarih</th>
                  <th className="p-3 font-bold w-24">Birim</th>
                  <th className="p-3 font-bold w-36">Aksiyon</th>
                  <th className="p-3 font-bold">Detaylar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="p-3 whitespace-nowrap text-gray-500">
                      {new Date(row.date).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getBadgeColor(row.type)}`}>
                        {getBadgeLabel(row.type)}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-gray-900">{row.action}</td>
                    <td className="p-3 text-gray-600 truncate max-w-sm" title={row.details}>{row.details}</td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 font-medium">
                      Bu kriterlere uygun kayıt bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                Sayfa {currentPage} / {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Süreç Dağılımı</h3>
          </div>
          <div className="p-4 flex-grow flex items-center justify-center min-h-[350px]">
            {summaryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={summaryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {summaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value + ' İşlem', '']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm font-medium">Grafik için veri yok</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
