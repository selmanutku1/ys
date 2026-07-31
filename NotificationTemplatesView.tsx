import { FileSpreadsheet, FileText } from "lucide-react";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { exportToExcel, exportToPdfTable } from '../utils/exportUtils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Participant, HealthIncident } from '../types';
import { 
  HeartHandshake, 
  AlertOctagon, 
  Plus, 
  Stethoscope, 
  ShieldAlert, 
  User, 
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Activity,
  Heart,
  FileDown
} from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';
import VoiceNoteButton from './VoiceNoteButton';

interface HealthViewProps {
  participants: Participant[];
  healthIncidents: HealthIncident[];
  onAddHealthIncident: (incident: HealthIncident) => void;
  onAddLog: (action: string, details: string) => void;
}

export default function HealthView({
  participants,
  healthIncidents,
  onAddHealthIncident,
  onAddLog,
}: HealthViewProps) {
  const [selectedPatId, setSelectedPatId] = useState('');
  const [complaint, setComplaint] = useState('');
  const [treatment, setTreatment] = useState('');
  const [prescription, setPrescription] = useState('');
  const [status, setStatus] = useState<'Kontrol Altında' | 'Müşahade' | 'Sevk Edildi'>('Kontrol Altında');
  const [searchTerm, setSearchTerm] = useState("");
  
  // Collapsible accordion states
  const [isAllergyTrackerOpen, setIsAllergyTrackerOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);

  const activeInCamp = participants.filter((p) => p.status === 'Kampta');

  // Filter out health incidents based on search term
  const filteredHealthIncidents = healthIncidents.filter((hi) => {
    const pName = (participants.find(p => p.id === hi.participantId)?.name || "Bilinmeyen Katılımcı").toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      pName.includes(searchLower) ||
      hi.complaint.toLowerCase().includes(searchLower) ||
      hi.treatment.toLowerCase().includes(searchLower) ||
      (hi.prescription && hi.prescription.toLowerCase().includes(searchLower))
    );
  });

  const hazardousParticipants = activeInCamp.filter(
    (p) => 
      (p.allergies && p.allergies.toLowerCase() !== 'yok' && p.allergies.toLowerCase() !== 'belirtilmedi' && p.allergies.toLowerCase() !== 'saptanamayan alerji yok') || 
      (p.chronicDiseases && p.chronicDiseases.toLowerCase() !== 'yok' && p.chronicDiseases.toLowerCase() !== 'belirtilmedi')
  );

  const trToEn = (str: string) => {
    return str
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C');
  };

  const handleDownloadPersonalPDF = (incident: HealthIncident) => {
    const doc = new jsPDF();
    const patient = participants.find(p => p.id === incident.participantId);
    
    const pName = patient ? patient.name : 'Bilinmeyen Katilimci';
    const pBungalow = patient?.bungalowId || 'Oda Atanmamis';
    const pId = patient?.id || 'ID Belirtilmedi';
    
    // Dynamic age calculation from birthDate
    const calculateAge = (bDateStr?: string) => {
      if (!bDateStr) return 'Belirtilmedi';
      try {
        const birthYear = new Date(bDateStr).getFullYear();
        const currentYear = new Date().getFullYear();
        if (isNaN(birthYear)) return 'Belirtilmedi';
        return `${currentYear - birthYear} Yas`;
      } catch (e) {
        return 'Belirtilmedi';
      }
    };
    const pAge = patient ? calculateAge(patient.birthDate) : 'Belirtilmedi';
    
    const pGender = patient?.gender || 'Belirtilmedi';
    const pAllergies = patient?.allergies || 'Yok';
    const pChronic = patient?.chronicDiseases || 'Yok';
    const pMedications = patient?.medications || 'Yok';
    
    // Header banner green accent
    doc.setFillColor(5, 150, 105); // Emerald-600
    doc.rect(0, 0, 210, 12, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(trToEn('YESILAY GENCLIK KAMPLARI SAGLIK SEFI'), 105, 8, { align: 'center' });
    
    // Document Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39); // Gray-900
    doc.text(trToEn('KISISEL REVIR MUDAHALE RAPORU'), 105, 25, { align: 'center' });
    
    // Sub-title / ID
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text(trToEn(`Protokol / Kayit No: ${incident.id}   |   Tarih: ${new Date(incident.dateTime).toLocaleString('tr-TR')}`), 105, 31, { align: 'center' });
    
    // Decorative divider line
    doc.setDrawColor(209, 213, 219); // Gray-300
    doc.setLineWidth(0.5);
    doc.line(15, 37, 195, 37);
    
    // SECTION 1: HASTA BILGILERI (PATIENT INFORMATION)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(5, 150, 105);
    doc.text(trToEn('1. HASTA / KATILIMCI BILGILERI'), 15, 45);
    
    const patientData = [
      [trToEn('Ad Soyad'), trToEn(pName), trToEn('Bungalov / Oda'), trToEn(pBungalow)],
      [trToEn('Katilimci No'), trToEn(pId), trToEn('Yas / Cinsiyet'), trToEn(`${pAge} / ${pGender}`)],
      [trToEn('Alerjiler'), trToEn(pAllergies), trToEn('Kronik Hastaliklar'), trToEn(pChronic)]
    ];
    
    autoTable(doc, {
      startY: 48,
      body: patientData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, font: 'Helvetica' },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [243, 244, 246], cellWidth: 40 },
        1: { cellWidth: 50 },
        2: { fontStyle: 'bold', fillColor: [243, 244, 246], cellWidth: 40 },
        3: { cellWidth: 50 }
      }
    });
    
    // SECTION 2: KLINIK MUDAHALE & TEDAVI (CLINICAL INTERVENTION)
    const nextY1 = (doc as any).lastAutoTable.finalY + 12;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(5, 150, 105);
    doc.text(trToEn('2. TIBBI MUDAHALE VE GUNCEL DURUM'), 15, nextY1);
    
    const interventionData = [
      [trToEn('Hastanin Sikayeti / Belirtiler'), trToEn(incident.complaint)],
      [trToEn('Uygulanan Tedavi / Girisim'), trToEn(incident.treatment)],
      [trToEn('Recete Edilen Ilaclar'), trToEn(incident.prescription || 'Bulunmuyor')],
      [trToEn('Guncel Saglik Durumu'), trToEn(incident.status)]
    ];
    
    autoTable(doc, {
      startY: nextY1 + 3,
      body: interventionData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, font: 'Helvetica' },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [243, 244, 246], cellWidth: 50 },
        1: { cellWidth: 130 }
      }
    });
    
    // SECTION 3: RECTETELI ILAC TAKIBI & NOTLAR (IF ROUTINE MEDS EXIST)
    let nextY2 = (doc as any).lastAutoTable.finalY + 12;
    if (pMedications && pMedications.toLowerCase() !== 'yok' && pMedications.toLowerCase() !== 'belirtilmedi') {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(5, 150, 105);
      doc.text(trToEn('3. RUTIN ILAC TAKIP BILGISI'), 15, nextY2);
      
      const routineMedsData = [
        [trToEn('Katilimcinin Rutin Kullandigi Ilaclar'), trToEn(pMedications)]
      ];
      
      autoTable(doc, {
        startY: nextY2 + 3,
        body: routineMedsData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4, font: 'Helvetica' },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [243, 244, 246], cellWidth: 60 },
          1: { cellWidth: 120 }
        }
      });
      nextY2 = (doc as any).lastAutoTable.finalY + 12;
    }
    
    // SIGNATURE SECTION
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81); // Gray-700
    
    // Signature lines
    doc.line(15, nextY2 + 25, 80, nextY2 + 25);
    doc.line(130, nextY2 + 25, 195, nextY2 + 25);
    
    doc.text(trToEn('Mudahele Eden Saglik Personeli'), 15, nextY2 + 30);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(trToEn('Hemsire Elif Aslan'), 15, nextY2 + 35);
    doc.text(trToEn('Diploma / Tescil No: 182372'), 15, nextY2 + 39);
    doc.text(trToEn('Imza / Kase'), 15, nextY2 + 45);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(trToEn('Kamp Muduru / Kamp Lideri'), 130, nextY2 + 30);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(trToEn('Selman Utku Marmara'), 130, nextY2 + 35);
    doc.text(trToEn('Kamp Yonetim Merkezi Onayi'), 130, nextY2 + 39);
    doc.text(trToEn('Imza / Muhur'), 130, nextY2 + 45);
    
    // Bottom Footer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // Gray-400
    doc.text(trToEn('Isbu belge Yesilay Kamp Yonetim Bilgi Sistemi (KYS) tarafindan dijital olarak uretilmistir.'), 105, 282, { align: 'center' });
    doc.text(trToEn('Guvenli veri koruma ve revir gizliligi kurallarina tabidir.'), 105, 286, { align: 'center' });
    
    // Save report
    const safeFilename = pName.replace(/\s+/g, '_');
    doc.save(`Revir_Raporu_${safeFilename}_${incident.id}.pdf`);
    
    onAddLog(
      'Kisisel Revir Raporu Alindi',
      `${pName} (${incident.id}) icin PDF saglik raporu uretildi.`
    );
  };

  
  const getExportData = () => {
    if (filteredHealthIncidents.length === 0) return null;
    
    const headers = [
      "Kayıt No", "Tarih/Saat", "Ad Soyad", "T.C. Kimlik No", "Kategori",
      "Şikayet / Teşhis", "Uygulanan Tedavi", "Verilen İlaçlar", "Gözlem/Notlar", "Durum"
    ];

    const rows = filteredHealthIncidents.map(hi => {
      const p = participants.find(p => p.id === hi.participantId);
      return [
        hi.id,
        new Date(hi.dateTime).toLocaleString(),
        p ? p.name : 'Silinmiş Kayıt',
        p ? p.identityNumber : '-',
        p ? p.category : '-',
        hi.complaint,
        hi.treatment,
        hi.prescription || 'Yok',
        '',
        hi.status
      ];
    });
    
    return { headers, rows };
  };

  const handleExportToExcel = () => {
    const data = getExportData();
    if (!data) {
      alert("Dışa aktarılacak revir kaydı bulunamadı.");
      return;
    }
    
    const excelData = data.rows.map(row => {
      let obj = {};
      data.headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

    exportToExcel(excelData, 'revir_defteri');
    onAddLog('Excel Dışa Aktarımı', 'Revir defteri kayıtları Excel formatında dışa aktarıldı.');
  };

  const handleExportToPDF = () => {
    const data = getExportData();
    if (!data) {
      alert("Dışa aktarılacak revir kaydı bulunamadı.");
      return;
    }
    exportToPdfTable(data.headers, data.rows, 'revir_defteri', 'Revir Defteri Kayıtları');
    onAddLog('PDF Dışa Aktarımı', 'Revir defteri kayıtları PDF formatında dışa aktarıldı.');
  };

  const handleCreateIncident = (e: React.FormEvent) => {

    e.preventDefault();

    if (!selectedPatId || !complaint || !treatment) {
      alert('Lütfen gönüllü, şikayet ve uygulanan tedavi alanlarını doldurunuz.');
      return;
    }

    const patient = participants.find((p) => p.id === selectedPatId);
    if (!patient) return;

    const newIncident: HealthIncident = {
      id: `H0${healthIncidents.length + 1}`,
      participantId: selectedPatId,
      staffId: 'S06', // Hemşire Elif Aslan
      dateTime: new Date().toISOString().slice(0, 19),
      complaint,
      treatment,
      prescription,
      status,
    };

    onAddHealthIncident(newIncident);
    onAddLog(
      'Sağlık Müdahalesi',
      `Revirde ${patient.name} için müdahale yapıldı. Şikayet: ${complaint}. Durum: ${status}`
    );

    // Clear form
    setSelectedPatId('');
    setComplaint('');
    setTreatment('');
    setPrescription('');
    setStatus('Kontrol Altında');

    alert('Sağlık müdahale kaydı revir defterine başarıyla işlendi!');
  };

  // Helper numbers for visual KPIs
  const totalIncidents = healthIncidents.length;
  const observationCount = healthIncidents.filter(h => h.status === 'Müşahade').length;
  const dispatchCount = healthIncidents.filter(h => h.status === 'Sevk Edildi').length;
  const riskCount = hazardousParticipants.length;

  return (
    <div className="space-y-6" id="health-revir-component-root">
      {/* Top Welcome & Header banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 tracking-tight">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            Revir &amp; Sağlık Takip Merkezi
            <HelpTooltip content="Kamptaki hastaların revir kayıtları, ilaç takipleri ve riskli (alerjik/kronik) vaka kayıtları bu modülde yer alır." />
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Gönüllü ve çocukların alerji beyanları, günlük revir defteri kayıtları ve acil durum protokolleri.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 bg-emerald-50 rounded-xl text-emerald-850 border border-emerald-150 text-2xs font-extrabold uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          Revir Aktif • Kesintisiz Destek
        </div>
      </div>

      {/* Modern Dashboard KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Toplam Müdahale</span>
            <span className="text-base font-black text-gray-900 font-mono mt-0.5 block">{totalIncidents} Vaka</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Müşahade Altında</span>
            <span className="text-base font-black text-gray-900 font-mono mt-0.5 block">{observationCount} Kişi</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 rounded-xl text-rose-700">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Hastane Sevk</span>
            <span className="text-base font-black text-gray-900 font-mono mt-0.5 block">{dispatchCount} Sevk</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-red-50 rounded-xl text-red-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Kritik Alerjen/Risk</span>
            <span className="text-base font-black text-red-700 font-mono mt-0.5 block">{riskCount} Gönüllü</span>
          </div>
        </div>
      </div>

      {/* Critical allergy monitor alerts box - simplified, high-fidelity design */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        <div 
          onClick={() => setIsAllergyTrackerOpen(!isAllergyTrackerOpen)}
          className="p-4 bg-red-50/20 hover:bg-red-50/40 border-b border-gray-150 flex justify-between items-center cursor-pointer select-none transition"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-100 text-red-700 rounded-lg">
              <AlertOctagon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-2">
                Alerji ve Kronik Rahatsızlık Kritik Takip Paneli
                <span className="bg-red-650 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  {riskCount} Aktif Risk
                </span>
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Yemekhane ve operasyon personeli için kritik gıda/çevre alerjen uyarıları.</p>
            </div>
          </div>
          <button type="button" className="text-gray-400 hover:text-gray-700 p-1">
            {isAllergyTrackerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isAllergyTrackerOpen && (
          <div className="p-5 bg-white border-t border-gray-100 animate-in fade-in duration-200">
            {hazardousParticipants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {hazardousParticipants.map((hp) => (
                  <div
                    key={hp.id}
                    className="p-3.5 rounded-xl border border-red-150 bg-red-50/10 text-2xs space-y-2.5 relative overflow-hidden transition hover:shadow-2xs"
                  >
                    <div className="absolute top-0 right-0 w-1 bg-red-600 h-full"></div>
                    <div className="flex gap-2 items-start">
                      <span className="font-black text-red-800 font-mono bg-red-100 px-1.5 py-0.5 rounded text-[10px]">
                        {hp.bungalowId || 'Oda Yok'}
                      </span>
                      <div>
                        <p className="font-extrabold text-gray-900 text-xs leading-tight">{hp.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">Acil Tel: {hp.phone || 'Belirtilmedi'}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-red-100 text-gray-750">
                      <div>
                        <span className="text-[9px] font-black text-red-800 uppercase block tracking-wider">⚠️ Alerji Bilgisi</span>
                        <p className="font-bold text-gray-900 mt-0.5">{hp.allergies}</p>
                      </div>
                      {hp.chronicDiseases && hp.chronicDiseases.toLowerCase() !== 'yok' && (
                        <div>
                          <span className="text-[9px] font-extrabold text-amber-800 uppercase block tracking-wider">📋 Kronik Hastalık</span>
                          <p className="font-semibold text-gray-800 mt-0.5">{hp.chronicDiseases}</p>
                        </div>
                      )}
                      {hp.medications && (
                        <div>
                          <span className="text-[9px] font-extrabold text-teal-800 uppercase block tracking-wider">💊 Rutin İlaçlar</span>
                          <p className="font-medium text-gray-600 mt-0.5">{hp.medications}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-4">Kampta aktif olarak kayıtlı kritik alerjen veya kronik rahatsızlık beyanı olan katılımcı bulunmuyor.</p>
            )}
          </div>
        )}
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8/12 - 2/3 width) - Active Revir Defteri Kayıtları */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-150">
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Stethoscope className="w-4 h-4 text-emerald-600 animate-pulse" />
                Aktif Revir Defteri &amp; Müdahaleler
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold">Tüm tedavi, ilaç ve gözlem geçmişi kayıtları.</p>
            </div>
            
            
            <div className="flex items-center gap-2">
              <div className="flex gap-2 mr-2">
                <button
                  onClick={handleExportToExcel}
                  className="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-2xs font-extrabold transition-all duration-150 flex items-center gap-1.5 shadow-2xs hover:border-emerald-500 cursor-pointer"
                  title="Excel İndir"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  Excel
                </button>
                <button
                  onClick={handleExportToPDF}
                  className="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-2xs font-extrabold transition-all duration-150 flex items-center gap-1.5 shadow-2xs hover:border-red-500 cursor-pointer"
                  title="PDF İndir"
                >
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  PDF
                </button>
              </div>
<div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="İsim, şikayet veya ilaç ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white focus:border-emerald-600 outline-none transition font-semibold"
              />
            </div>
            </div>
          </div>

                  {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-150">
            <table className="w-full text-left border-collapse text-2xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 font-extrabold uppercase tracking-wider">
                  <th className="p-3 w-32">Tarih / Saat</th>
                  <th className="p-3 w-40">Katılımcı / Oda</th>
                  <th className="p-3">Şikayet / Belirtiler</th>
                  <th className="p-3">Uygulanan Tedavi &amp; Reçete</th>
                  <th className="p-3 text-center w-28">Güncel Durum</th>
                  <th className="p-3 text-center w-20">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredHealthIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 italic">Aranan kriterlere uygun revir kaydı bulunamadı.</td>
                  </tr>
                ) : (
                  filteredHealthIncidents.map((hi) => {
                    const patient = participants.find(p => p.id === hi.participantId);
                    return (
                      <tr key={hi.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 whitespace-nowrap">
                          <span className="block font-bold text-gray-900">{new Date(hi.dateTime).toLocaleDateString("tr-TR")}</span>
                          <span className="text-gray-400 text-3xs font-mono block mt-0.5">{new Date(hi.dateTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </td>
                        <td className="p-3">
                          <span className="block font-extrabold text-emerald-950 text-xs">{patient?.name || "Bilinmeyen Katılımcı"}</span>
                          <span className="inline-block bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-4xs font-bold mt-1 font-mono">
                            {patient?.bungalowId || 'Oda Atanmamış'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 font-medium leading-relaxed max-w-xs break-words">{hi.complaint}</td>
                        <td className="p-3 text-gray-600 leading-relaxed max-w-xs">
                          <span className="block font-medium">{hi.treatment}</span>
                          {hi.prescription && (
                            <span className="text-3xs text-red-600 font-extrabold mt-1.5 inline-block bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg font-mono">
                              💊 Reçete: {hi.prescription}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-4xs font-black uppercase tracking-wider ${
                              hi.status === "Kontrol Altında" 
                                ? "bg-green-100 text-green-800" 
                                : hi.status === "Müşahade" 
                                  ? "bg-amber-100 text-amber-800" 
                                  : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {hi.status}
                          </span>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDownloadPersonalPDF(hi)}
                            className="p-1.5 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-gray-200 hover:border-emerald-200 rounded-lg transition cursor-pointer inline-flex items-center gap-1 shadow-3xs"
                            title="Kişisel Rapor PDF İndir"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-extrabold">PDF Al</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (Responsive, avoids table squeezing on phones) */}
          <div className="block md:hidden space-y-3">
            {filteredHealthIncidents.length === 0 ? (
              <div className="text-center py-8 text-gray-400 italic text-2xs bg-gray-50 rounded-xl border border-dashed border-gray-150">
                Herhangi bir revir kaydı bulunamadı.
              </div>
            ) : (
              filteredHealthIncidents.map((hi) => {
                const patient = participants.find(p => p.id === hi.participantId);
                return (
                  <div key={hi.id} className="bg-gray-50/60 p-4 rounded-xl border border-gray-150 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-xs">{patient?.name || "Bilinmeyen Katılımcı"}</h4>
                        <p className="text-gray-400 text-[10px] font-mono mt-0.5">
                          {patient?.bungalowId || 'Oda Yok'} • {new Date(hi.dateTime).toLocaleDateString("tr-TR")} {new Date(hi.dateTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                            hi.status === "Kontrol Altında" 
                              ? "bg-green-100 text-green-800" 
                              : hi.status === "Müşahade" 
                                ? "bg-amber-100 text-amber-800" 
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {hi.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownloadPersonalPDF(hi)}
                          className="p-1 px-2 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-gray-200 rounded-lg transition cursor-pointer flex items-center gap-1 text-[9px] font-bold"
                          title="PDF Raporu Al"
                        >
                          <FileDown className="w-3 h-3 text-emerald-650" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-2xs">
                      <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mb-0.5">Şikayet &amp; Belirtiler</span>
                        <p className="text-gray-700 font-medium leading-relaxed">{hi.complaint}</p>
                      </div>
                      
                      <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mb-0.5">Uygulanan Tedavi</span>
                        <p className="text-gray-700 font-medium leading-relaxed">{hi.treatment}</p>
                        {hi.prescription && (
                          <div className="mt-1.5 pt-1.5 border-t border-dashed border-gray-150 flex items-center gap-1">
                            <span className="text-[9px] font-black text-rose-700 uppercase tracking-wider shrink-0">İlaç Reçetesi:</span>
                            <span className="text-[10px] font-bold text-gray-800 font-mono">{hi.prescription}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (4/12 - 1/3 width) - Forms & Protocols */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Always Visible, Elegant Add Entry Form */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                <Plus className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider block">Yeni Revir Kaydı Ekle</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Muayene ve tedavi detaylarını anlık kaydedin.</p>
              </div>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-3xs font-extrabold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Katılımcı / Çocuk Seçin *
                </label>
                <select
                  value={selectedPatId}
                  onChange={(e) => setSelectedPatId(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-semibold text-gray-800"
                  required
                >
                  <option value="">-- Kamptaki Gönüllüyü Seç --</option>
                  {activeInCamp.map((ac) => (
                    <option key={ac.id} value={ac.id}>
                      {ac.name} ({ac.bungalowId || 'Oda Yok'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-3xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Şikayet ve Belirtiler *
                  </label>
                  <VoiceNoteButton onTranscript={(t) => setComplaint(prev => prev ? prev + ' ' + t : t)} />
                </div>
                <textarea
                  placeholder="Ateş (38.2°C), karın ağrısı vb..."
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold text-gray-800"
                  rows={2}
                  required
                ></textarea>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-3xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Uygulanan Tedavi &amp; İlaç *
                  </label>
                  <VoiceNoteButton onTranscript={(t) => setTreatment(prev => prev ? prev + ' ' + t : t)} />
                </div>
                <textarea
                  placeholder="1 ölçek Calpol verildi, dinlendirildi..."
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold text-gray-800"
                  rows={2}
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-3xs font-extrabold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Reçete Edilen Ekstra İlaçlar (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Minoset 500mg, Günde 2 kez"
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-3xs font-extrabold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Güncel Sağlık Durumu *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-emerald-600 font-extrabold text-gray-800"
                >
                  <option value="Kontrol Altında">Kontrol Altında (Dinleniyor)</option>
                  <option value="Müşahade">Müşahade (Revirde Gözetimde)</option>
                  <option value="Sevk Edildi">Sevk Edildi (Devlet Hastanesine)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 px-4 rounded-xl cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Revir Defterine İşle
              </button>
            </form>
          </div>

          {/* Emergency Action Protocol Cheat Sheet - simplified and high-contrast */}
          <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
            <div 
              onClick={() => setIsProtocolOpen(!isProtocolOpen)}
              className="p-4 bg-gray-50 hover:bg-gray-100/70 flex justify-between items-center cursor-pointer select-none transition border-b border-gray-100"
            >
              <h3 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
                Acil Durum Protokolü (Kılavuz)
              </h3>
              <button type="button" className="text-gray-400 hover:text-gray-700 p-1">
                {isProtocolOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isProtocolOpen ? (
              <div className="p-4 bg-white space-y-3 text-2xs leading-relaxed text-gray-650 pt-3 animate-in fade-in duration-200">
                <div className="p-3 border border-red-150 bg-red-50/5 rounded-xl space-y-1">
                  <h4 className="font-extrabold text-red-900 flex items-center gap-1">
                    <span>1.</span> Şiddetli Reaksiyon (Anafilaksi)
                  </h4>
                  <p className="text-gray-600 font-medium">
                    Hemen revirdeki <strong>adrenalin oto-enjektörünü</strong> bacağa uygulayın. Zamanı not edin ve derhal 112'yi arayarak ambulans talep edin.
                  </p>
                </div>

                <div className="p-3 border border-amber-150 bg-amber-50/5 rounded-xl space-y-1">
                  <h4 className="font-extrabold text-amber-900">
                    <span>2.</span> Güneş &amp; Isı Aşımı (Isı Çarpması)
                  </h4>
                  <p className="text-gray-600 font-medium">
                    Hastayı serin ve gölge bir odaya taşıyın. Islak soğuk bezlerle alın ve gövdeye kompres yapın. Ateş düşürücü ilaç vermeyin, yavaş yavaş sıvı almasını sağlayın.
                  </p>
                </div>

                <div className="p-3 border border-emerald-150 bg-emerald-50/5 rounded-xl space-y-1">
                  <h4 className="font-extrabold text-emerald-900">
                    <span>3.</span> Astım Atakları
                  </h4>
                  <p className="text-gray-600 font-medium">
                    Katılımcının yanındaki mavi astım fısfısını (salbütamol) 2-4 puf kullandırın. Rahat nefes pozisyonuna getirin. 10 dakika içinde düzelme olmazsa ambulans çağırın.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[10px] font-semibold text-gray-400 italic text-center py-3 bg-white">İncelemek için tıklayıp protokolü açınız.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
