import { useState } from 'react';
import { CampIncident } from '../types';
import { AlertOctagon, ShieldAlert, FileWarning, Plus, Trash2, CheckCircle, Search, Printer, Download, FileDown } from 'lucide-react';
import VoiceNoteButton from "./VoiceNoteButton";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const turkishToSafeLatin = (str: string): string => {
  if (!str) return '';
  const mapping: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'I': 'I', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };
  return str.replace(/[çÇğĞıIİöÖşŞüÜ]/g, (match) => mapping[match] || match);
};

interface IncidentLogsViewProps {
  incidents: CampIncident[];
  onUpdateIncidents: (incidents: CampIncident[]) => void;
  onAddLog: (action: string, details: string) => void;
  currentUserId: string;
  currentUserName: string;
}

export default function IncidentLogsView({
  incidents,
  onUpdateIncidents,
  onAddLog,
  currentUserId,
  currentUserName
}: IncidentLogsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState<'disiplin' | 'saglik' | 'guvenlik'>('disiplin');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newActionTaken, setNewActionTaken] = useState('');
  const [incidentToPrint, setIncidentToPrint] = useState<CampIncident | null>(null);
  
  const handleAddIncident = () => {
    if (!newTitle || !newDescription) return;
    
    const newIncident: CampIncident = {
      id: `INC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      type: newType,
      reporterId: currentUserId,
      reporterName: currentUserName,
      dateTime: new Date().toISOString().substring(0, 16),
      title: newTitle,
      description: newDescription,
      actionTaken: newActionTaken,
      status: 'Açık'
    };
    
    onUpdateIncidents([newIncident, ...incidents]);
    onAddLog('Olay Kaydı Eklendi', `${newType} türünde yeni olay eklendi: ${newTitle}`);
    setShowAddForm(false);
    setNewTitle('');
    setNewDescription('');
    setNewActionTaken('');
  };
  
  const handleResolveIncident = (id: string) => {
    onUpdateIncidents(incidents.map(inc => 
      inc.id === id ? { ...inc, status: 'Çözüldü' } : inc
    ));
    onAddLog('Olay Çözüldü', `${id} numaralı olay çözüldü olarak işaretlendi.`);
  };
  
  
  const handlePrintSingleIncident = (incident: CampIncident) => {
    setIncidentToPrint(incident);
  };

  const handleExportAllToPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Outer border or frame
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287);

    // Document title
    doc.setTextColor(190, 24, 24); // Red-700 for alert/incident vibe
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(turkishToSafeLatin('KAMP YONETIM SISTEMI (KYS)'), 105, 18, { align: 'center' });
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.text(turkishToSafeLatin('OLAY VE VAKA KAYIT TOPLU RAPORU'), 105, 24, { align: 'center' });

    // Decorative line
    doc.setDrawColor(190, 24, 24);
    doc.setLineWidth(1);
    doc.line(15, 28, 195, 28);

    // Metadata block
    doc.setTextColor(80, 80, 80);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    
    const filterInfo = filterType === 'all' 
      ? 'Tum Kategoriler' 
      : filterType === 'disiplin' 
        ? 'Sadece Disiplin' 
        : filterType === 'saglik' 
          ? 'Sadece Saglik' 
          : 'Sadece Guvenlik';

    doc.text(turkishToSafeLatin(`Rapor Tarihi: ${new Date().toLocaleString('tr-TR')}`), 15, 35);
    doc.text(turkishToSafeLatin(`Raporlayan: ${currentUserName} (Sicil: ${currentUserId})`), 15, 40);
    doc.text(turkishToSafeLatin(`Aktif Filtre: ${filterInfo}`), 15, 45);
    doc.text(turkishToSafeLatin(`Toplam Kayit Sayisi: ${filteredIncidents.length} vaka`), 15, 50);

    // Table data
    const tableHeaders = [['Belge No', 'Tur', 'Baslik', 'Detay & Aciklama', 'Bildiren', 'Tarih', 'Durum']];
    const tableRows = filteredIncidents.map(inc => [
      inc.id,
      inc.type === 'disiplin' ? 'Disiplin' : inc.type === 'saglik' ? 'Saglik' : 'Guvenlik',
      inc.title,
      inc.description + (inc.actionTaken ? `\n(Aksiyon: ${inc.actionTaken})` : ''),
      inc.reporterName,
      new Date(inc.dateTime).toLocaleString('tr-TR'),
      inc.status
    ].map(val => turkishToSafeLatin(val)));

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      startY: 56,
      theme: 'striped',
      headStyles: {
        fillColor: [190, 24, 24], // Red-700
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 16, fontStyle: 'bold', fontSize: 7.5, halign: 'center' }, // ID
        1: { cellWidth: 16, fontSize: 8, halign: 'center' }, // Type
        2: { cellWidth: 25, fontStyle: 'bold', fontSize: 8 }, // Title
        3: { cellWidth: 65, fontSize: 7.5 }, // Description & Action
        4: { cellWidth: 20, fontSize: 7.5 }, // Reporter
        5: { cellWidth: 24, fontSize: 7 }, // Date
        6: { cellWidth: 14, fontSize: 7.5, halign: 'center', fontStyle: 'bold' } // Status
      },
      styles: {
        overflow: 'linebreak',
        font: 'Helvetica',
        cellPadding: 2,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      margin: { left: 15, right: 15, bottom: 20 },
      didDrawPage: (data) => {
        // Footer on each page
        doc.setFontSize(7.5);
        doc.setTextColor(150, 150, 150);
        doc.text(
          turkishToSafeLatin('Kamp Yonetim Sistemi (KYS) - Resmi Belge Niteligindedir.'), 
          15, 
          282
        );
        doc.text(
          `Sayfa ${data.pageNumber}`, 
          195, 
          282, 
          { align: 'right' }
        );
      }
    });

    doc.save(`Olay_Kayit_Raporu_${new Date().toISOString().substring(0, 10)}.pdf`);
    onAddLog('PDF Raporu Indirildi', `Tum olay kayitlari (${filteredIncidents.length} vaka) toplu PDF raporu olarak indirildi.`);
  };

  const handleExportSingleToPDF = (inc: CampIncident) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(8, 8, 194, 281);

    // Header Badge Vibe
    doc.setFillColor(245, 245, 245);
    doc.rect(10, 10, 190, 15, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.line(10, 25, 200, 25);

    doc.setTextColor(190, 24, 24); // Alert Red
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(turkishToSafeLatin('T.C. GENCLIK KAMPI YONETIM SISTEMI'), 105, 17, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(turkishToSafeLatin('RESMI OLAY TUTANAK BELGESI'), 105, 22, { align: 'center' });

    // Header Meta
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(turkishToSafeLatin(`Tutanak No: ${inc.id}`), 15, 34);
    doc.text(turkishToSafeLatin(`Tarih: ${new Date(inc.dateTime).toLocaleString('tr-TR')}`), 195, 34, { align: 'right' });

    // Divider line
    doc.setDrawColor(220, 220, 220);
    doc.line(15, 37, 195, 37);

    // Metadata Table / Grid
    const gridY = 42;
    doc.setFillColor(252, 252, 252);
    doc.rect(15, gridY, 180, 30, 'FD');
    doc.setDrawColor(220, 220, 220);
    
    // Grid lines
    doc.line(15, gridY + 15, 195, gridY + 15); // horizontal
    doc.line(105, gridY, 105, gridY + 30); // vertical

    // Cell content
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(110, 110, 110);
    doc.text(turkishToSafeLatin('OLAY TURU'), 18, gridY + 5);
    doc.text(turkishToSafeLatin('RAPORLAYAN PERSONEL'), 108, gridY + 5);
    doc.text(turkishToSafeLatin('VAKA DURUMU'), 18, gridY + 20);
    doc.text(turkishToSafeLatin('DUZENLEME TARIHI'), 108, gridY + 20);

    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    
    const typeLabel = inc.type === 'disiplin' ? 'DISIPLIN IHLALI' : inc.type === 'saglik' ? 'SAGLIK OLAYI' : 'GUVENLIK IHLALI';
    doc.text(turkishToSafeLatin(typeLabel), 18, gridY + 11);
    doc.text(turkishToSafeLatin(inc.reporterName), 108, gridY + 11);
    doc.text(turkishToSafeLatin(inc.status.toUpperCase()), 18, gridY + 26);
    doc.text(turkishToSafeLatin(new Date().toLocaleString('tr-TR')), 108, gridY + 26);

    // Section 1: Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(190, 24, 24);
    doc.text(turkishToSafeLatin('OLAY BASLIGI'), 15, 82);
    doc.setDrawColor(190, 24, 24);
    doc.setLineWidth(0.3);
    doc.line(15, 84, 195, 84);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.text(turkishToSafeLatin(inc.title), 15, 90);

    // Section 2: Details
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(190, 24, 24);
    doc.text(turkishToSafeLatin('OLAY DETAYLARI VE ACIKLAMA'), 15, 105);
    doc.line(15, 107, 195, 107);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9.5);
    
    // Split text into multi-line using splitTextToSize
    const descLines = doc.splitTextToSize(turkishToSafeLatin(inc.description), 175);
    doc.text(descLines, 15, 113);

    // Section 3: Action Taken
    const actionY = 113 + (descLines.length * 5) + 12;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(190, 24, 24);
    doc.text(turkishToSafeLatin('ALINAN AKSIYON / YAPILAN ISLEMLER'), 15, actionY);
    doc.line(15, actionY + 2, 195, actionY + 2);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9.5);
    
    const actionText = inc.actionTaken || 'Bu olay hakkinda henuz alinmis bir aksiyon kaydi girilmemistir.';
    const actionLines = doc.splitTextToSize(turkishToSafeLatin(actionText), 175);
    doc.text(actionLines, 15, actionY + 8);

    // Signatures
    const sigY = 230;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, sigY, 195, sigY);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(turkishToSafeLatin('BILDIREN PERSONEL'), 45, sigY + 6, { align: 'center' });
    doc.text(turkishToSafeLatin('KAMP MUDURU / YONETICI ONAYI'), 155, sigY + 6, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9.5);
    doc.text(turkishToSafeLatin(inc.reporterName), 45, sigY + 14, { align: 'center' });
    doc.text(turkishToSafeLatin('Imza / Kase'), 155, sigY + 14, { align: 'center' });

    // Bottom info footer
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text(turkishToSafeLatin('* Isbu tutanak dijital olarak onaylanmis ve KYS veritabanina kaydedilmistir.'), 15, 276);
    doc.text(turkishToSafeLatin('Kamp Yonetim Sistemi (KYS) Evrak Havuzu'), 105, 282, { align: 'center' });

    doc.save(`Olay_Tutanagi_${inc.id}.pdf`);
    onAddLog('Vaka PDF Tutunagi Indirildi', `${inc.id} numarali vakaya ait olay tutanagi resmi PDF olarak indirildi.`);
  };

  const handleDeleteIncident = (id: string) => {
    if(confirm('Bu olay kaydını silmek istediğinize emin misiniz?')) {
      onUpdateIncidents(incidents.filter(inc => inc.id !== id));
      onAddLog('Olay Silindi', `${id} numaralı olay kaydı silindi.`);
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = inc.title.toLowerCase().includes(searchLower) || 
                          inc.description.toLowerCase().includes(searchLower) ||
                          inc.reporterName.toLowerCase().includes(searchLower) ||
                          inc.actionTaken?.toLowerCase().includes(searchLower) ||
                          inc.id.toLowerCase().includes(searchLower) ||
                          inc.type.toLowerCase().includes(searchLower);
    const matchesType = filterType === 'all' || inc.type === filterType;
    return matchesSearch && matchesType;
  });

  const getIcon = (type: string) => {
    if (type === 'disiplin') return <FileWarning className="w-4 h-4 text-amber-600" />;
    if (type === 'saglik') return <AlertOctagon className="w-4 h-4 text-red-600" />;
    return <ShieldAlert className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className={`p-4 lg:p-8 space-y-6 ${incidentToPrint ? 'print:hidden' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-7 h-7 text-red-600" />
            Olay Kayıt Sistemi
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-semibold">
            Disiplin, sağlık ve güvenlik ihlallerinin takibi
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleExportAllToPDF}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
            title="Mevcut filtrelenmiş tüm olayları resmi PDF belgesi olarak indir"
          >
            <Download className="w-4 h-4" />
            Toplu PDF Raporu İndir
          </button>
          <button
            onClick={() => window.print()}
            className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-gray-50 transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Yazdır
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-red-700 transition shadow-sm"
          >
            {showAddForm ? 'Vazgeç' : <><Plus className="w-4 h-4" /> Yeni Olay Bildir</>}
          </button>
        </div>
      </div>
      
      {showAddForm && (
        <div className="no-print">

        <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-800 border-b pb-2">Yeni Olay Tutanağı</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Olay Türü</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full p-2 border rounded-lg text-sm bg-gray-50"
              >
                <option value="disiplin">Disiplin İhlali</option>
                <option value="saglik">Sağlık Olayı</option>
                <option value="guvenlik">Güvenlik İhlali</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Olay Başlığı</label>
              <input
                type="text"
                placeholder="Örn: Kurallara Uymama"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm bg-gray-50"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-600">Olayın Detayları</label>
                <VoiceNoteButton onTranscript={(t) => setNewDescription(prev => prev ? prev + ' ' + t : t)} />
              </div>
              <textarea
                placeholder="Neler yaşandı? Kimler dahil oldu?"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm bg-gray-50 h-20"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-600">Alınan Aksiyon (Varsa)</label>
                <VoiceNoteButton onTranscript={(t) => setNewActionTaken(prev => prev ? prev + ' ' + t : t)} />
              </div>
              <input
                type="text"
                placeholder="Örn: Tutanak tutuldu, sözlü uyarı yapıldı"
                value={newActionTaken}
                onChange={(e) => setNewActionTaken(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm bg-gray-50"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleAddIncident}
              className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold text-xs hover:bg-red-700"
            >
              Kaydet ve Bildir
            </button>
          </div>
        </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-150 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between bg-gray-50/50 no-print">
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Olay başlığı veya detaylarda ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-red-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-red-500"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="disiplin">Sadece Disiplin</option>
            <option value="saglik">Sadece Sağlık</option>
            <option value="guvenlik">Sadece Güvenlik</option>
          </select>
        </div>

        <div className="hidden print:block mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 border-b pb-4">Olay Kayıt Raporu</h1>
          <p className="text-gray-500 mt-2 text-sm">Yazdırma Tarihi: {new Date().toLocaleString('tr-TR')}</p>
        </div>
        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto print:max-h-none">
          {filteredIncidents.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm font-semibold">
              Kritere uygun olay kaydı bulunamadı.
            </div>
          ) : (
            filteredIncidents.map(inc => (
              <div key={inc.id} className="p-4 hover:bg-gray-50 transition flex flex-col md:flex-row gap-4">
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-2">
                    {getIcon(inc.type)}
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                      {inc.type} İhlali
                    </span>
                    <span className="text-3xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                      {inc.id}
                    </span>
                    <span className={`text-3xs font-bold px-2 py-0.5 rounded uppercase ${
                      inc.status === 'Açık' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-800">{inc.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{inc.description}</p>
                  
                  {inc.actionTaken && (
                    <div className="bg-gray-100 p-2 rounded text-xs text-gray-700 border-l-2 border-gray-400">
                      <span className="font-bold">Alınan Aksiyon: </span> {inc.actionTaken}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-3xs font-mono text-gray-400 pt-1">
                    <span>Bildiren: {inc.reporterName}</span>
                    <span>•</span>
                    <span>{new Date(inc.dateTime).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
                
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 no-print">
                  {inc.status === 'Açık' && (
                    <button
                      onClick={() => handleResolveIncident(inc.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                      title="Çözüldü olarak işaretle"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handlePrintSingleIncident(inc)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Olay Tutanağını Yazdır / PDF İndir"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteIncident(inc.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Kaydı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tekli Olay Yazdırma Modalı */}
      {incidentToPrint && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm animate-in fade-in duration-200 print:absolute print:inset-0 print:bg-white print:z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] print:max-h-none print:border-none print:shadow-none print:w-full print:max-w-none print:mx-0">
            {/* Modal Header (No print) */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 no-print">
              <h2 className="font-bold text-gray-800">Olay Tutanağı Yazdır</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportSingleToPDF(incidentToPrint)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
                  title="Resmi olay tutanağını PDF olarak indir"
                >
                  <Download className="w-4 h-4" />
                  Resmi PDF İndir
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-gray-50 transition shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  Yazdır
                </button>
                <button
                  onClick={() => setIncidentToPrint(null)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-lg transition"
                >
                  Kapat
                </button>
              </div>
            </div>

            {/* Print Content */}
            <div className="p-8 overflow-y-auto print:overflow-visible print:p-0">
              <div className="text-center mb-10 border-b-2 border-gray-200 pb-5">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">RESMİ OLAY TUTANAĞI</h1>
                <p className="text-sm text-gray-500 mt-2">Belge No: {incidentToPrint.id} | Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
              </div>

              <div className="flex justify-between mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100 print:bg-transparent print:p-0 print:border-none">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Olay Türü</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">{incidentToPrint.type.toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Olay Tarihi ve Saati</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">{new Date(incidentToPrint.dateTime).toLocaleString('tr-TR')}</div>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Durum</div>
                    <div className="mt-1">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                        incidentToPrint.status === 'Açık' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {incidentToPrint.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Raporlayan (Bildiren)</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">{incidentToPrint.reporterName}</div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Olay Başlığı</h2>
                <div className="text-base font-semibold text-gray-900">{incidentToPrint.title}</div>
              </div>

              <div className="mb-8">
                <h2 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Olayın Detayları (Açıklama)</h2>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-4 border border-gray-200 rounded-xl print:p-0 print:border-none">
                  {incidentToPrint.description}
                </div>
              </div>

              {incidentToPrint.actionTaken && (
                <div className="mb-8">
                  <h2 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Alınan Aksiyon / Sonuç</h2>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-4 border border-gray-200 rounded-xl print:p-0 print:border-none">
                    {incidentToPrint.actionTaken}
                  </div>
                </div>
              )}

              <div className="mt-20 pt-8 border-t border-gray-200 flex justify-between text-center">
                <div className="w-1/2 px-4">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-16">Bildiren Yetkili</div>
                  <div className="text-sm font-bold text-gray-900 border-t border-gray-400 pt-2 inline-block min-w-[200px]">
                    {incidentToPrint.reporterName}
                  </div>
                </div>
                <div className="w-1/2 px-4">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-16">Kamp Yöneticisi / Onay</div>
                  <div className="text-sm font-bold text-gray-900 border-t border-gray-400 pt-2 inline-block min-w-[200px]">
                    İmza
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
