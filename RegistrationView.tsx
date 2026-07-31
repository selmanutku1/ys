import { exportToExcel, exportToPdfTable } from "../utils/exportUtils";
import { generateWhatsAppLink, sendWhatsAppNotification } from '../utils/whatsappService';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Participant, Group, CampPeriod } from "../types";
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  FileCheck,
  Award,
  Heart,
  UserSquare2,
  X,
  FileSpreadsheet, FileText,
  TrendingUp,
  Printer,
  FileDown,
  Mail,
  MessageSquare,
  Send,
  Smartphone,
  UserPlus,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  MessageCircle,
} from "lucide-react";
import {
  exportToWord,
  exportToPdf,
  exportBulkBadgesToPdf,
} from "../utils/formExporter";

interface ParticipantViewProps {
  participants: Participant[];
  groups: Group[];
  periods: CampPeriod[];
  onUpdateParticipants: (updated: Participant[]) => void;
  onAddLog: (
    action: string,
    details: string,
    overrideUser?: any,
    undoData?: any,
  ) => void;
  externalSelectedParticipantId?: string | null;
  onClearExternalSelectedParticipantId?: () => void;
}

export default function ParticipantView({
  participants,
  groups,
  periods,
  onUpdateParticipants,
  onAddLog,
  externalSelectedParticipantId,
  onClearExternalSelectedParticipantId,
}: ParticipantViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [genderFilter, setGenderFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [attendanceTypeFilter, setAttendanceTypeFilter] = useState<
    "All" | "Current" | "Past"
  >("All");
  const [periodFilter, setPeriodFilter] = useState<string>("All");
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    string | null
  >(null);
  const [evaluationScore, setEvaluationScore] = useState<number>(85);
  const [evaluationNotes, setEvaluationNotes] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // SMS & E-posta Bilgilendirme States
  const [notifyMethod, setNotifyMethod] = useState<"all" | "whatsapp" | "sms" | "email">(
    "whatsapp",
  );
  const [notifyTemplate, setNotifyTemplate] = useState<string>("welcome");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);
  const [isListOpen, setIsListOpen] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(true);

  const getTemplateText = (templateKey: string, name: string) => {
    switch (templateKey) {
      case "welcome":
        return `Sayın Velimiz, ${name} isimli gönüllümüzün Yeşilay Kamp Katılım başvurusu onaylanmıştır. Kampa katılım için gerekli evrakları ve eşyaları getirmeyi unutmayınız. İyi günler dileriz.`;
      case "incident":
        return `Değerli Velimiz, ${name} isimli gönüllümüz kamp süresince hafif bir sağlık durumundan dolayı kamp revirimizde kontrole alınmıştır. Genel durumu iyidir, müdahale yapılmıştır.`;
      case "general":
        return `Kıymetli Yeşilay Gönüllüsü, ${name} isimli katılımcımızın bulunduğu kamp dönemi başarıyla devam etmektedir. Günlük fotoğraflar ve duyurular için mobil uygulamamızı takip edebilirsiniz.`;
      default:
        return "";
    }
  };

  useEffect(() => {
    if (externalSelectedParticipantId) {
      setSelectedParticipantId(externalSelectedParticipantId);
      if (onClearExternalSelectedParticipantId) {
        onClearExternalSelectedParticipantId();
      }
    }
  }, [externalSelectedParticipantId, onClearExternalSelectedParticipantId]);

  useEffect(() => {
    if (selectedParticipant) {
      setCustomMessage(
        getTemplateText(notifyTemplate, selectedParticipant.name),
      );
    }
  }, [selectedParticipantId, notifyTemplate]);

  const handleSendNotification = () => {
    if (!selectedParticipant) return;
    if (!customMessage.trim()) {
      alert("Lütfen göndermek üzere bir bilgilendirme mesajı yazın.");
      return;
    }

    const destinations: string[] = [];
    if (notifyMethod === "all" || notifyMethod === "sms") {
      destinations.push(`SMS (${selectedParticipant.phone || "Gsm Yok"})`);
    }
    if (notifyMethod === "all" || notifyMethod === "whatsapp") {
      destinations.push(`WhatsApp (${selectedParticipant.phone || "Gsm Yok"})`);
    }
    if (notifyMethod === "all" || notifyMethod === "email") {
      destinations.push(`E-Posta (${selectedParticipant.email || "Mail Yok"})`);
    }

    onAddLog(
      "Bilgilendirme Gönderildi",
      `'${selectedParticipant.name}' velisine ${destinations.join(" ve ")} kanalı üzerinden mesaj iletildi: "${customMessage}"`,
    );

    alert(
      `Başarılı: Bilgilendirme mesajı ${destinations.join(" ve ")} üzerinden başarıyla gönderildi ve arşive loglandı.`,
    );
  };

  const handleAdd100Participants = () => {
    const boyNames = [
      "Ahmet",
      "Mehmet",
      "Can",
      "Ali",
      "Mustafa",
      "Ömer",
      "Yusuf",
      "Selim",
      "Kerem",
      "Arda",
      "Ege",
      "Barış",
      "Sarp",
      "Yiğit",
      "Emre",
      "Burak",
      "Hakan",
      "Gökhan",
      "Fatih",
      "Alper",
      "Kaan",
      "Batuhan",
      "Umut",
      "Tuna",
      "Mert",
      "Görkem",
      "Serkan",
      "Bora",
      "Oğuz",
      "Deniz",
    ];
    const girlNames = [
      "Zeynep",
      "Elif",
      "Defne",
      "Eylül",
      "Ayşe",
      "Fatma",
      "Merve",
      "Selin",
      "Duru",
      "Yağmur",
      "Ada",
      "Beren",
      "Melis",
      "İpek",
      "Aslı",
      "Hazal",
      "Ceren",
      "Büşra",
      "Sude",
      "Sena",
      "Gamze",
      "Derya",
      "Buse",
      "Ebru",
      "İrem",
      "Ceyda",
      "Pelin",
      "Seda",
      "Damla",
      "Ece",
    ];
    const lastNames = [
      "Yılmaz",
      "Kaya",
      "Demir",
      "Şahin",
      "Çelik",
      "Yıldız",
      "Yıldırım",
      "Öztürk",
      "Aydın",
      "Özdemir",
      "Arslan",
      "Doğan",
      "Kılıç",
      "Aslan",
      "Çetin",
      "Kara",
      "Koç",
      "Kurt",
      "Özkan",
      "Şen",
      "Bulut",
      "Yalçın",
      "Güler",
      "Köse",
      "Polat",
      "Yiğit",
      "Avcı",
      "Aksoy",
      "Özcan",
      "Sarı",
    ];

    const newGenerated: Participant[] = [];
    const baseId = Date.now();

    for (let i = 0; i < 100; i++) {
      const isBoy = Math.random() > 0.5;
      const gender: "Erkek" | "Kadın" = isBoy ? "Erkek" : "Kadın";
      const firstName = isBoy
        ? boyNames[Math.floor(Math.random() * boyNames.length)]
        : girlNames[Math.floor(Math.random() * girlNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;

      // Simulate 11-digit Turkish National Identity Number
      const idPrefix = Math.floor(
        100000000 + Math.random() * 900000000,
      ).toString();
      const tcNumber = `${idPrefix}${Math.floor(10 + Math.random() * 90)}`;

      // Simulate birth year between 2009 and 2016 (age 10-17 as of 2026)
      const bYear = Math.floor(2009 + Math.random() * 8);
      const bMonth = String(Math.floor(1 + Math.random() * 12)).padStart(
        2,
        "0",
      );
      const bDay = String(Math.floor(1 + Math.random() * 28)).padStart(2, "0");
      const birthDate = `${bYear}-${bMonth}-${bDay}`;

      // Simulate mobile phone number
      const phoneOperators = ["0532", "0544", "0555", "0505", "0535", "0542"];
      const op =
        phoneOperators[Math.floor(Math.random() * phoneOperators.length)];
      const phoneDigits = Math.floor(
        1000000 + Math.random() * 9000000,
      ).toString();
      const phone = `${op} ${phoneDigits.substring(0, 3)} ${phoneDigits.substring(3, 5)} ${phoneDigits.substring(5)}`;

      // Simulate email address
      const turkishCharsMap: { [key: string]: string } = {
        ç: "c",
        ğ: "g",
        ı: "i",
        ö: "o",
        ş: "s",
        ü: "u",
        Ç: "c",
        Ğ: "g",
        İ: "i",
        Ö: "o",
        Ş: "s",
        Ü: "u",
      };
      const makeEmailFriendly = (str: string) => {
        return str
          .toLowerCase()
          .split("")
          .map((char) => turkishCharsMap[char] || char)
          .join("")
          .replace(/\s+/g, "");
      };
      const email = `${makeEmailFriendly(firstName)}.${makeEmailFriendly(lastName)}@gmail.com`;

      // Some health variety
      const healthRnd = Math.random();
      let allergies = "Yok";
      let chronicDiseases = "Yok";
      let medications = "Yok";
      let healthNote = "";

      if (healthRnd < 0.08) {
        allergies = "Gluten Alerjisi";
        healthNote = "Glütensiz yemek porsiyonu hazırlanmalıdır.";
      } else if (healthRnd < 0.15) {
        allergies = "Laktoz Hassasiyeti";
        healthNote = "Laktozsuz süt ürünleri veya muafiyet menüsü verilmeli.";
      } else if (healthRnd < 0.18) {
        allergies = "Polen ve Çilek Alerjisi";
      }

      const diseaseRnd = Math.random();
      if (diseaseRnd < 0.05) {
        chronicDiseases = "Astım";
        healthNote +=
          (healthNote ? " | " : "") +
          "Nefes darlığı durumunda fısfısları kontrol edilmeli.";
      } else if (diseaseRnd < 0.08) {
        chronicDiseases = "Tip 1 Diyabet";
        healthNote +=
          (healthNote ? " | " : "") + "Şeker ölçüm takibi yapılmalıdır.";
      }

      const age = 2026 - bYear;
      let genCategory:
        | "İlkokul"
        | "Ortaokul"
        | "Lise"
        | "Üniversite"
        | "Yetişkin"
        | "Kafile Sorumlusu"
        | "Şoför" = "Lise";
      if (age <= 10) genCategory = "İlkokul";
      else if (age <= 13) genCategory = "Ortaokul";
      else if (age <= 17) genCategory = "Lise";
      else genCategory = "Üniversite";

      // Assign adult / supervisor role to some
      const roleRnd = Math.random();
      if (roleRnd < 0.02) genCategory = "Kafile Sorumlusu";
      else if (roleRnd < 0.04) genCategory = "Şoför";
      else if (roleRnd < 0.06) genCategory = "Yetişkin";

      newGenerated.push({
        id: `PT-${baseId}-${i}`,
        name: fullName,
        identityNumber: tcNumber,
        birthDate: birthDate,
        gender: gender,
        category: genCategory,
        phone: phone,
        email: email,
        status: "Başvuru Yapıldı", // "deftere ekle ama yerleşim yapma" -> unassigned in groups/beds/bungalows!
        bungalowId: null,
        bedNumber: null,
        groupId: null,
        allergies: allergies,
        chronicDiseases: chronicDiseases,
        medications: medications,
        healthNote: healthNote,
        consentReceived: true,
        kvkkSigned: true,
        checkedIn: false,
      });
    }

    const updated = [...participants, ...newGenerated];
    onUpdateParticipants(updated);
    onAddLog(
      "Toplu Katılımcı Oluşturma",
      `Sistem simülasyon testi için karışık cinsiyetlerde temsili 100 yerleşimsiz yeni aday katılımcı başarıyla deftere eklendi.`,
      null,
      { stateKey: "participants", previousState: participants },
    );
    alert(
      "Temsili 100 katılımcı (karışık cinsiyette ve tamamen yerleşimsiz) başarıyla oluşturuldu ve deftere eklendi!",
    );
  };

  
  const getExportData = () => {
    if (filteredParticipants.length === 0) return null;
    
    const headers = [
      "T.C. Kimlik No", "Ad Soyad", "Kategori", "Cinsiyet", "Doğum Tarihi", 
      "Telefon", "E-Posta", "Kamp Dönemi", "Grup Adı", "Bungalov No", 
      "Yatak No", "Alerjiler", "Sağlık Notu", "Kayıt Durumu"
    ];

    const rows = filteredParticipants.map(p => {
      const periodName = periods.find((per) => per.id === p.campPeriodId)?.name || p.campPeriodId || 'Belirtilmedi';
      const groupName = groups.find((g) => g.id === p.groupId)?.name || 'Atanmadı';
      const bungalowName = p.bungalowId ? p.bungalowId : 'Atanmadı';

      return [
        p.identityNumber || '',
        p.name || '',
        p.category || '',
        p.gender || '',
        p.birthDate || '',
        p.phone || '',
        p.email || '',
        periodName,
        groupName,
        bungalowName,
        p.bedNumber ? p.bedNumber.toString() : 'Atanmadı',
        p.allergies || '',
        p.healthNote || '',
        p.status || ''
      ];
    });
    
    return { headers, rows };
  };

  const handleExportToExcel = () => {
    const data = getExportData();
    if (!data) {
      alert("Dışa aktarılacak katılımcı bulunamadı.");
      return;
    }
    
    const excelData = data.rows.map(row => {
      let obj = {};
      data.headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

    exportToExcel(excelData, 'katilimci_listesi');
    onAddLog('Excel Dışa Aktarımı', 'Katılımcı listesi Excel formatında dışa aktarıldı.');
  };

  const handleExportToPDF = () => {
    const data = getExportData();
    if (!data) {
      alert("Dışa aktarılacak katılımcı bulunamadı.");
      return;
    }
    exportToPdfTable(data.headers, data.rows, 'katilimci_listesi', 'Katılımcı Listesi');
    onAddLog('PDF Dışa Aktarımı', 'Katılımcı listesi PDF formatında dışa aktarıldı.');
  };


  const filteredParticipants = participants.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchLower) ||
      p.identityNumber.includes(searchTerm) ||
      (p.city && p.city.toLowerCase().includes(searchLower)) ||
      (p.district && p.district.toLowerCase().includes(searchLower)) ||
      (p.convoyName && p.convoyName.toLowerCase().includes(searchLower)) ||
      (p.duty && p.duty.toLowerCase().includes(searchLower)) ||
      (p.phone && p.phone.includes(searchTerm));
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesGender = genderFilter === "All" || p.gender === genderFilter;
    const matchesCategory =
      categoryFilter === "All" || p.category === categoryFilter;

    let matchesAttendanceType = true;
    const pPeriod = periods.find((per) => per.id === p.campPeriodId);
    if (attendanceTypeFilter === "Current") {
      matchesAttendanceType =
        pPeriod?.isActive === true && p.status !== "Ayrıldı";
    } else if (attendanceTypeFilter === "Past") {
      matchesAttendanceType =
        pPeriod?.isActive === false || p.status === "Ayrıldı";
    }

    const matchesPeriod =
      periodFilter === "All" || p.campPeriodId === periodFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesGender &&
      matchesCategory &&
      matchesAttendanceType &&
      matchesPeriod
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, genderFilter, categoryFilter, attendanceTypeFilter, periodFilter, participants.length]);

  const totalPages = Math.max(1, Math.ceil(filteredParticipants.length / itemsPerPage));
  const paginatedParticipants = filteredParticipants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selectedParticipant = participants.find(
    (p) => p.id === selectedParticipantId,
  );

  const participantGroup = useMemo(() => {
    if (!selectedParticipant || !selectedParticipant.groupId) return null;
    return groups.find((g) => g.id === selectedParticipant.groupId);
  }, [selectedParticipant, groups]);

  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [showPrintWarning, setShowPrintWarning] = useState(false);
  const [isBulkBadgeModalOpen, setIsBulkBadgeModalOpen] = useState(false);
  const [bulkBadgeConfig, setBulkBadgeConfig] = useState({
    badgeSize: "90x65", // "90x65" | "85x54" | "100x70" | "65x90" | "54x85" | "70x100"
    layoutGrid: "2x4",  // "2x4" | "2x3" | "1x1"
    hideIdentity: false,
    hideAccommodation: false,
    hideGroup: false,
    customTitle: "YEŞİLAY GENÇLİK KAMPI",
    showAllergiesWarning: true,
    showKvkkSeal: true,
    badgeColorTheme: "rainbow", // "rainbow" (group color) | "emerald" | "green" | "blue"
  });

  const handlePrintBadge = (
    p: Participant,
    groupName: string,
    groupColor: string,
  ) => {
    if (window.self !== window.top) {
      setShowPrintWarning(true);
      return;
    }
    const badgeHtml = `
          <style>
            #print-section {
              background-color: white;
              width: 100%;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
            #print-section * {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .badge-card {
              width: 320px;
              height: 500px;
              border: 3px solid #00AB41;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              display: flex;
              flex-direction: column;
              position: relative;
              box-sizing: border-box;
              background-color: #ffffff;
            }
            .badge-header {
              background-color: #0B3B24;
              color: #ffffff;
              padding: 15px;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              border-bottom: 4px solid #00AB41;
            }
            .badge-header svg {
              width: 28px;
              height: 28px;
            }
            .badge-header-text {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
            }
            .badge-header-title {
              font-size: 13px;
              font-weight: 900;
              letter-spacing: 0.1em;
            }
            .badge-header-subtitle {
              font-size: 8px;
              font-weight: 700;
              color: #00AB41;
              letter-spacing: 0.2em;
              margin-top: 2px;
            }
            .badge-body {
              flex: 1;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              text-align: center;
            }
            .avatar-container {
              width: 90px;
              height: 90px;
              border-radius: 50%;
              background-color: #f0fdf4;
              border: 3px solid #00AB41;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              font-weight: 800;
              color: #0B3B24;
              margin-top: 5px;
            }
            .participant-name {
              font-size: 18px;
              font-weight: 900;
              color: #0B3B24;
              margin: 10px 0 2px 0;
              text-transform: uppercase;
            }
            .participant-role {
              font-size: 10px;
              font-weight: 800;
              color: #00AB41;
              background-color: #e6f9ed;
              padding: 4px 12px;
              border-radius: 12px;
              letter-spacing: 0.05em;
              margin-bottom: 12px;
            }
            .info-grid {
              width: 100%;
              display: grid;
              grid-template-columns: 1fr;
              gap: 8px;
              margin-bottom: 12px;
            }
            .info-row {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 8px 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              font-weight: 700;
            }
            .info-label {
              color: #64748b;
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .info-value {
              color: #0f172a;
            }
            .group-indicator {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .group-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
            }
            .allergy-alert {
              width: 100%;
              background-color: #fef2f2;
              border: 1px solid #fee2e2;
              border-radius: 10px;
              padding: 8px;
              color: #991b1b;
              font-size: 10px;
              font-weight: 700;
              box-sizing: border-box;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            }
            .badge-footer {
              padding: 10px 20px;
              background-color: #f8fafc;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              align-items: center;
              height: 50px;
              box-sizing: border-box;
            }
            .badge-seals {
              display: flex;
              gap: 5px;
            }
            .seal-pill {
              font-size: 8px;
              font-weight: 800;
              color: #15803d;
              background-color: #dcfce7;
              padding: 2px 6px;
              border-radius: 4px;
              text-transform: uppercase;
            }
            .barcode-svg {
              height: 30px;
              width: 100px;
            }
          </style>
          <div class="badge-card">
            <div class="badge-header">
              <svg viewBox="0 0 100 100">
                <path d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z" fill="#00AB41" />
              </svg>
              <div class="badge-header-text">
                <span class="badge-header-title">YEŞİLAY ULUSLARARASI</span>
                <span class="badge-header-subtitle">KAMP MERKEZİ - KATILIM KARTI</span>
              </div>
            </div>
            
            <div class="badge-body">
              <div class="avatar-container">
                ${(p.name || "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              
              <div>
                <div class="participant-name">${p.name}</div>
                <span class="participant-role">${p.category ? `${p.category} ${["İlkokul", "Ortaokul", "Lise", "Üniversite"].includes(p.category) ? "ÖĞRENCİSİ" : ""}`.toUpperCase() : "KATILIMCI GÖNÜLLÜ"}</span>
              </div>
              
              <div class="info-grid">
                <div class="info-row">
                  <span class="info-label">Grup Adı</span>
                  <span class="info-value group-indicator">
                    <span class="group-dot" style="background-color: ${groupColor}"></span>
                    ${groupName}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Konaklama / Bungalov</span>
                  <span class="info-value">${p.bungalowId ? `${p.bungalowId} - Yatak ${p.bedNumber}` : "Oda Atanmadı"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Kimlik / TC</span>
                  <span class="info-value" style="font-family: monospace;">${p.identityNumber ? p.identityNumber.slice(0, 3) + "******" + p.identityNumber.slice(-2) : "GİRİLMEDİ"}</span>
                </div>
              </div>
            </div>
            
            <div class="badge-footer">
              <div class="badge-seals">
                <span class="seal-pill">KVKK ONAM</span>
                <span class="seal-pill">MUVAFFAKAT</span>
              </div>
              <!-- Mini Barcode SVG -->
              <svg class="barcode-svg" viewBox="0 0 100 30">
                <rect x="0" y="2" width="2" height="26" fill="#000" />
                <rect x="4" y="2" width="1" height="26" fill="#000" />
                <rect x="7" y="2" width="3" height="26" fill="#000" />
                <rect x="12" y="2" width="1" height="26" fill="#000" />
                <rect x="15" y="2" width="2" height="26" fill="#000" />
                <rect x="19" y="2" width="4" height="26" fill="#000" />
                <rect x="25" y="2" width="1" height="26" fill="#000" />
                <rect x="28" y="2" width="2" height="26" fill="#000" />
                <rect x="32" y="2" width="1" height="26" fill="#000" />
                <rect x="35" y="2" width="3" height="26" fill="#000" />
                <rect x="40" y="2" width="2" height="26" fill="#000" />
                <rect x="44" y="2" width="1" height="26" fill="#000" />
                <rect x="47" y="2" width="4" height="26" fill="#000" />
                <rect x="53" y="2" width="1" height="26" fill="#000" />
                <rect x="56" y="2" width="2" height="26" fill="#000" />
                <rect x="60" y="2" width="3" height="26" fill="#000" />
                <rect x="65" y="2" width="1" height="26" fill="#000" />
                <rect x="68" y="2" width="4" height="26" fill="#000" />
                <rect x="74" y="2" width="2" height="26" fill="#000" />
                <rect x="78" y="2" width="1" height="26" fill="#000" />
                <rect x="81" y="2" width="3" height="26" fill="#000" />
                <rect x="86" y="2" width="2" height="26" fill="#000" />
                <rect x="90" y="2" width="4" height="26" fill="#000" />
                <rect x="96" y="2" width="2" height="26" fill="#000" />
              </svg>
            </div>
          </div>
    `;

    // High reliability printing using print-section approach
    const printSection = document.createElement("div");
    printSection.id = "print-section";
    printSection.innerHTML = badgeHtml;
    document.body.appendChild(printSection);
    document.body.classList.add("printing-active");

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        if (printSection.parentNode) {
          document.body.removeChild(printSection);
        }
        document.body.classList.remove("printing-active");
      }, 1000);
    }, 250);
  };

  const handlePrintBulkBadges = () => {
    if (window.self !== window.top) {
      setShowPrintWarning(true);
      return;
    }
    const selectedParticipantsList = participants.filter((p) =>
      selectedForBulk.includes(p.id)
    );

    if (selectedParticipantsList.length === 0) return;

    let badgesHtml = "";
    const itemsPerPage = bulkBadgeConfig.layoutGrid === "2x4" ? 8 : bulkBadgeConfig.layoutGrid === "2x3" ? 6 : 1;

    selectedParticipantsList.forEach((p, index) => {
      const pGroup = groups.find((g) => g.id === p.groupId);
      const isNewPage = index > 0 && index % itemsPerPage === 0;

      const groupColor = pGroup?.color || "#cbd5e1";
      const groupName = pGroup?.name || "Grup Atanmamış";

      const initials = p.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      // Theme logic
      let headerBg = "#0B3B24";
      let borderColor = "#00AB41";
      let roleBg = "rgba(16, 185, 129, 0.1)";
      let roleTextColor = "#047857";

      if (bulkBadgeConfig.badgeColorTheme === "rainbow") {
        borderColor = groupColor;
        headerBg = groupColor;
        roleBg = `${groupColor}1a`;
        roleTextColor = groupColor;
      } else if (bulkBadgeConfig.badgeColorTheme === "emerald") {
        headerBg = "#047857";
        borderColor = "#10b981";
        roleBg = "rgba(16, 185, 129, 0.1)";
        roleTextColor = "#047857";
      } else if (bulkBadgeConfig.badgeColorTheme === "green") {
        headerBg = "#15803d";
        borderColor = "#22c55e";
        roleBg = "rgba(34, 197, 94, 0.1)";
        roleTextColor = "#15803d";
      } else if (bulkBadgeConfig.badgeColorTheme === "blue") {
        headerBg = "#1d4ed8";
        borderColor = "#3b82f6";
        roleBg = "rgba(59, 130, 246, 0.1)";
        roleTextColor = "#1d4ed8";
      }

      const formattedCategory = p.category
        ? `${p.category} ${["İlkokul", "Ortaokul", "Lise", "Üniversite"].includes(p.category) ? "Öğrencisi" : ""}`
        : "GÖNÜLLÜ KATILIMCI";

      badgesHtml += `
        ${isNewPage ? '<div style="page-break-before: always;"></div>' : ''}
        <div class="badge-card" style="border-color: ${borderColor};">
          <!-- Header -->
          <div class="badge-header" style="background-color: ${headerBg}; border-bottom-color: ${borderColor};">
            <div class="badge-header-content">
              <div class="logo-icon" style="background: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 100 100" style="width: 14px; height: 14px; fill: white;">
                  <path d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z" fill="${bulkBadgeConfig.badgeColorTheme === 'rainbow' ? 'white' : borderColor}" />
                </svg>
              </div>
              <div class="header-titles">
                <div class="camp-title" style="font-size: 8px; font-weight: 900; color: white !important; line-height: 1; letter-spacing: 0.5px;">${bulkBadgeConfig.customTitle}</div>
                <div class="sub-title" style="font-size: 6px; font-weight: 700; color: white !important; opacity: 0.8; margin-top: 2px; letter-spacing: 1px;">KAMP KATILIM KARTI</div>
              </div>
            </div>
          </div>

          <!-- Card Body -->
          <div class="badge-body" style="flex: 1; padding: 10px 12px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; box-sizing: border-box;">
            <!-- Initials Avatar -->
            <div class="avatar-circle" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid ${borderColor}; background-color: #f0fdf4 !important; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; color: ${headerBg};">
              ${initials}
            </div>

            <!-- Name -->
            <div class="name-container" style="margin-top: 4px; width: 100%;">
              <div class="name-text" style="font-size: 13px; font-weight: 900; color: #0b3b24 !important; text-transform: uppercase; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
              <div class="role-badge" style="display: inline-block; font-size: 7px; font-weight: 800; padding: 1px 6px; border-radius: 9999px; text-transform: uppercase; margin-top: 2px; letter-spacing: 0.5px; background-color: ${roleBg}; color: ${roleTextColor};">
                ${formattedCategory}
              </div>
            </div>

            <!-- Details -->
            <div class="details-section" style="width: 100%; margin-top: auto; display: flex; flex-direction: column; gap: 2px;">
              ${!bulkBadgeConfig.hideGroup ? `
              <div class="detail-item" style="display: flex; justify-content: space-between; align-items: center; font-size: 7.5px; border-bottom: 1px dashed #e5e7eb; padding-bottom: 1.5px;">
                <span class="detail-label" style="color: #9ca3af !important; font-weight: 800;">GRUP</span>
                <span class="detail-value" style="color: #374151 !important; display: flex; align-items: center; gap: 3px; font-weight: bold;">
                  <span class="color-dot" style="background-color: ${groupColor}; width: 5px; height: 5px; border-radius: 50%;"></span>
                  ${groupName}
                </span>
              </div>
              ` : ''}

              ${(!bulkBadgeConfig.hideAccommodation && p.bungalowId) ? `
              <div class="detail-item" style="display: flex; justify-content: space-between; align-items: center; font-size: 7.5px; border-bottom: 1px dashed #e5e7eb; padding-bottom: 1.5px;">
                <span class="detail-label" style="color: #9ca3af !important; font-weight: 800;">ODA / YATAK</span>
                <span class="detail-value" style="color: #374151 !important; font-weight: bold;">${p.bungalowId} - Yatak ${p.bedNumber}</span>
              </div>
              ` : ''}

              ${!bulkBadgeConfig.hideIdentity ? `
              <div class="detail-item" style="display: flex; justify-content: space-between; align-items: center; font-size: 7.5px; border-bottom: 1px dashed #e5e7eb; padding-bottom: 1.5px;">
                <span class="detail-label" style="color: #9ca3af !important; font-weight: 800;">T.C. KİMLİK</span>
                <span class="detail-value font-mono" style="color: #374151 !important;">${p.identityNumber.slice(0, 3)}******${p.identityNumber.slice(-2)}</span>
              </div>
              ` : ''}

              ${(bulkBadgeConfig.showAllergiesWarning && p.allergies) ? `
              <div class="warning-banner" style="color: #dc2626 !important; background-color: #fef2f2 !important; border: 1px solid #fee2e2; font-weight: 900; font-size: 7px; padding: 1px; border-radius: 4px; text-align: center; margin-top: 2px;">DİKKAT: Alerjisi Var</div>
              ` : ''}
            </div>
          </div>

          <!-- Card Footer -->
          <div class="badge-footer" style="background-color: #f9fafb !important; border-top: 1px solid #e5e7eb; padding: 4px 12px; display: flex; justify-content: space-between; align-items: center; height: 28px; box-sizing: border-box;">
            <div class="footer-seals" style="display: flex; gap: 2px;">
              ${bulkBadgeConfig.showKvkkSeal ? '<span class="seal-text" style="font-size: 5px; font-weight: 800; color: #166534 !important; background-color: #dcfce7 !important; padding: 1px 2px; border-radius: 2px;">KVKK</span>' : ''}
              ${bulkBadgeConfig.showKvkkSeal ? '<span class="seal-text" style="font-size: 5px; font-weight: 800; color: #166534 !important; background-color: #dcfce7 !important; padding: 1px 2px; border-radius: 2px;">TAAH</span>' : ''}
            </div>
            <!-- SVG Barcode -->
            <svg class="barcode-svg" style="height: 18px; width: 60px;" viewBox="0 0 100 30">
              <rect x="0" y="2" width="2" height="26" fill="#000" />
              <rect x="4" y="2" width="1" height="26" fill="#000" />
              <rect x="7" y="2" width="3" height="26" fill="#000" />
              <rect x="12" y="2" width="1" height="26" fill="#000" />
              <rect x="15" y="2" width="2" height="26" fill="#000" />
              <rect x="19" y="2" width="4" height="26" fill="#000" />
              <rect x="25" y="2" width="1" height="26" fill="#000" />
              <rect x="28" y="2" width="2" height="26" fill="#000" />
              <rect x="32" y="2" width="1" height="26" fill="#000" />
              <rect x="35" y="2" width="3" height="26" fill="#000" />
              <rect x="40" y="2" width="2" height="26" fill="#000" />
              <rect x="44" y="2" width="1" height="26" fill="#000" />
              <rect x="47" y="2" width="4" height="26" fill="#000" />
              <rect x="53" y="2" width="1" height="26" fill="#000" />
              <rect x="56" y="2" width="2" height="26" fill="#000" />
              <rect x="60" y="2" width="3" height="26" fill="#000" />
              <rect x="65" y="2" width="1" height="26" fill="#000" />
              <rect x="68" y="2" width="4" height="26" fill="#000" />
              <rect x="74" y="2" width="2" height="26" fill="#000" />
              <rect x="78" y="2" width="1" height="26" fill="#000" />
              <rect x="81" y="2" width="3" height="26" fill="#000" />
              <rect x="86" y="2" width="2" height="26" fill="#000" />
              <rect x="90" y="2" width="4" height="26" fill="#000" />
              <rect x="96" y="2" width="2" height="26" fill="#000" />
            </svg>
          </div>
        </div>
      `;
    });

    const badgeWidth = bulkBadgeConfig.badgeSize === "90x65" ? "90mm"
                     : bulkBadgeConfig.badgeSize === "85x54" ? "85mm"
                     : bulkBadgeConfig.badgeSize === "100x70" ? "100mm"
                     : bulkBadgeConfig.badgeSize === "65x90" ? "65mm"
                     : bulkBadgeConfig.badgeSize === "54x85" ? "54mm"
                     : bulkBadgeConfig.badgeSize === "70x100" ? "70mm"
                     : "90mm";

    const badgeHeight = bulkBadgeConfig.badgeSize === "90x65" ? "65mm"
                      : bulkBadgeConfig.badgeSize === "85x54" ? "54mm"
                      : bulkBadgeConfig.badgeSize === "100x70" ? "70mm"
                      : bulkBadgeConfig.badgeSize === "65x90" ? "90mm"
                      : bulkBadgeConfig.badgeSize === "54x85" ? "85mm"
                      : bulkBadgeConfig.badgeSize === "70x100" ? "100mm"
                      : "65mm";

    let gridCols = "repeat(2, 1fr)";
    let gridRows = "repeat(4, 1fr)";
    let gridGap = "5mm";

    if (bulkBadgeConfig.layoutGrid === "2x3") {
      gridCols = "repeat(2, 1fr)";
      gridRows = "repeat(3, 1fr)";
      gridGap = "8mm";
    } else if (bulkBadgeConfig.layoutGrid === "1x1") {
      gridCols = "1fr";
      gridRows = "1fr";
      gridGap = "0mm";
    }

    const htmlContent = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        #print-section {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 8mm;
          background-color: white !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .print-grid-container {
          display: grid;
          grid-template-columns: ${gridCols};
          grid-template-rows: ${gridRows};
          gap: ${gridGap};
          width: 100%;
          box-sizing: border-box;
        }

        .badge-card {
          width: ${badgeWidth};
          height: ${badgeHeight};
          background-color: white !important;
          border: 1px dashed #6b7280;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          page-break-inside: avoid;
          box-sizing: border-box;
          position: relative;
        }

        .badge-header {
          padding: 8px 12px;
          border-bottom: 2px solid;
          box-sizing: border-box;
        }

        .badge-header-content {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .logo-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
        }

        .header-titles {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .camp-title {
          font-size: 8px;
          font-weight: 900;
          color: white !important;
          line-height: 1;
          letter-spacing: 0.5px;
        }

        .sub-title {
          font-size: 6px;
          font-weight: 700;
          color: white !important;
          opacity: 0.8;
          margin-top: 2px;
          letter-spacing: 1px;
        }

        .badge-body {
          flex: 1;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          text-align: center;
          box-sizing: border-box;
        }

        .avatar-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid;
          background-color: #f0fdf4 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 14px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .name-container {
          margin-top: 4px;
          width: 100%;
        }

        .name-text {
          font-size: 13px;
          font-weight: 900;
          color: #0b3b24 !important;
          text-transform: uppercase;
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .role-badge {
          display: inline-block;
          font-size: 7px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 9999px;
          text-transform: uppercase;
          margin-top: 2px;
          letter-spacing: 0.5px;
        }

        .details-section {
          width: 100%;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 7.5px;
          border-bottom: 1px dashed #e5e7eb;
          padding-bottom: 1.5px;
        }

        .detail-label {
          color: #9ca3af !important;
          font-weight: 800;
        }

        .detail-value {
          color: #374151 !important;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .color-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .warning-banner {
          color: #dc2626 !important;
          background-color: #fef2f2 !important;
          border: 1px solid #fee2e2;
          font-weight: 900;
          font-size: 7px;
          padding: 1px;
          border-radius: 4px;
          text-align: center;
          margin-top: 2px;
        }

        .badge-footer {
          background-color: #f9fafb !important;
          border-top: 1px solid #e5e7eb;
          padding: 4px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 28px;
          box-sizing: border-box;
        }

        .footer-seals {
          display: flex;
          gap: 2px;
        }

        .seal-text {
          font-size: 5px;
          font-weight: 800;
          color: #166534 !important;
          background-color: #dcfce7 !important;
          padding: 1px 2px;
          border-radius: 2px;
        }

        .barcode-svg {
          height: 18px;
          width: 60px;
        }

        @media print {
          #print-section {
            padding: 8mm;
          }
          .badge-card {
            box-shadow: none !important;
          }
        }
      </style>
      <div class="print-grid-container">
        ${badgesHtml}
      </div>
    `;

    // Dynamic clean rendering and printing
    const printSection = document.createElement("div");
    printSection.id = "print-section";
    printSection.innerHTML = htmlContent;
    document.body.appendChild(printSection);
    document.body.classList.add("printing-active");

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        if (printSection.parentNode) {
          document.body.removeChild(printSection);
        }
        document.body.classList.remove("printing-active");
      }, 1000);
    }, 250);
  };

  
  const handleSendWhatsApp = async (p: Participant) => {
    if (!p.phone) {
      alert('Katılımcının telefon numarası bulunmuyor.');
      return;
    }
    const message = `Merhaba ${p.name}, Yeşilay Kampı bilgilendirme servisinden ulaşıyoruz.`;
    
    // Açık olan modal/drawer varsa bunu kapatmıyoruz, sadece linki yeni sekmede açıyoruz.
    const waLink = generateWhatsAppLink(p.phone, message);
    window.open(waLink, '_blank');
    
    onAddLog('WhatsApp Mesajı', `${p.name} adlı katılımcıya (${p.phone}) WhatsApp üzerinden manuel mesaj gönderildi.`);
  };

  const handleGenerateCertificate = (pId: string) => {
    const updated = participants.map((p) => {
      if (p.id === pId) {
        return { ...p, certificateId: `YEK-CERT-2026-${p.id}` };
      }
      return p;
    });

    onUpdateParticipants(updated);
    onAddLog(
      "Sertifika Basımı",
      `${selectedParticipant?.name} için dijital Katılım Sertifikası üretildi.`,
    );
    alert(
      "Katılım belgesi başarıyla oluşturuldu! Katılımcı mobil uygulamasından görüntüleyebilir.",
    );
  };

  return (
    <div className="space-y-6" id="participants-panel-root">
      {/* Upper bar filter */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-sans">
              <Users className="w-5 h-5 text-emerald-600" />
              Katılımcı Yönetimi &amp; Defteri
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Kampta kayıtlı gönüllülerin evrakları, sağlık durumu ve eğitmen
              değerlendirmeleri.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd100Participants}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-black text-2xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer shadow-2xs shrink-0 self-stretch sm:self-auto justify-center"
            title="Sisteme test amaçlı karışık cinsiyetlerde 100 yerleşimsiz temsili katılımcı ekler."
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
            Temsili 100 Katılımcı Ekle
          </button>
        </div>

        {/* Filters and View Toggles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-gray-100 pt-4">
          <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setAttendanceTypeFilter("All")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                attendanceTypeFilter === "All"
                  ? "bg-white shadow-sm text-emerald-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Tüm Katılımcılar
            </button>
            <button
              onClick={() => setAttendanceTypeFilter("Current")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                attendanceTypeFilter === "Current"
                  ? "bg-white shadow-sm text-emerald-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Mevcutta Konaklayanlar
            </button>
            <button
              onClick={() => setAttendanceTypeFilter("Past")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                attendanceTypeFilter === "Past"
                  ? "bg-white shadow-sm text-emerald-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Geçmiş Katılımcılar
            </button>
          </div>

          {/* View Mode & Export Controls */}
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white shadow-sm text-emerald-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Liste Görünümü"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-emerald-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Kart Görünümü"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

                        {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleExportToExcel}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg text-2xs font-extrabold transition-all duration-150 flex items-center gap-1.5 shadow-2xs cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500"
                title="Excel İndir"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Excel
              </button>
              <button
                onClick={handleExportToPDF}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg text-2xs font-extrabold transition-all duration-150 flex items-center gap-1.5 shadow-2xs cursor-pointer hover:border-red-500 dark:hover:border-red-500"
                title="PDF İndir"
              >
                <FileText className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                PDF
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="İsim veya T.C. Kimlik No ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-250 rounded-lg text-xs w-full focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="py-2 border border-gray-250 rounded-lg text-2xs w-full focus:outline-none focus:border-emerald-600"
            >
              <option value="All">Tüm Dönemler</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 border border-gray-250 rounded-lg text-2xs w-full focus:outline-none focus:border-emerald-600"
            >
              <option value="All">Tüm Durumlar</option>
              <option value="Kampta">Kampta Aktif</option>
              <option value="Onaylandı">Onaylandı (Giriş Bekliyor)</option>
              <option value="Başvuru Yapıldı">Başvuru Yapıldı</option>
              <option value="Yedek Listede">Yedek Listede</option>
              <option value="Ayrıldı">Ayrıldı</option>
            </select>
          </div>

          <div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="py-2 border border-gray-250 rounded-lg text-2xs w-full focus:outline-none focus:border-emerald-600"
            >
              <option value="All">Tüm Cinsiyetler</option>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 border border-gray-250 rounded-lg text-2xs w-full focus:outline-none focus:border-emerald-600 font-medium"
            >
              <option value="All">Tüm Kategoriler</option>
              <option value="İlkokul">Öğrenci: İlkokul</option>
              <option value="Ortaokul">Öğrenci: Ortaokul</option>
              <option value="Lise">Öğrenci: Lise</option>
              <option value="Üniversite">Öğrenci: Üniversite</option>
              <option value="Yetişkin">Yetişkin</option>
              <option value="Kafile Sorumlusu">Kafile Sorumlusu</option>
              <option value="Şoför">Şoför</option>
            </select>
          </div>
        </div>
      </div>
      {/* ---------------------------------------------------------
          Collapsible Accordion Panels for Participant View
         --------------------------------------------------------- */}
      <div className="space-y-5">
        {/* Accordion 1: Participant Ledger & Search Directory */}
        <div
          id="participant-acc-list"
          className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden"
        >
          <div
            onClick={() => setIsListOpen(!isListOpen)}
            className="flex justify-between items-center p-4 bg-gray-50/75 hover:bg-gray-50 cursor-pointer select-none transition duration-150"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
                <Users className="w-4 h-4 text-emerald-600" />
              </span>
              <div>
                <span className="font-extrabold text-xs text-gray-800 uppercase tracking-wider block">
                  Katılımcı Kayıt Defteri ({filteredParticipants.length} Kişi)
                </span>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5 normal-case font-sans">
                  Kampta kayıtlı tüm gönüllülerin, şoförlerin ve liderlerin
                  listesi.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-emerald-700 p-1"
            >
              {isListOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          {isListOpen && (
            <div className="p-5 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-150">
              {selectedForBulk.length > 0 && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between shadow-sm animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-md">
                      {selectedForBulk.length} Seçili
                    </div>
                    <span className="text-xs font-semibold text-emerald-800">
                      Toplu İşlemler:
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsBulkBadgeModalOpen(true);
                      }}
                      className="text-xs font-bold bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-3xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Yaka Kartı Yazdır / Önizle
                    </button>
                    <select
                      className="text-xs font-bold bg-white text-gray-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.value) {
                          const updated = participants.map((p) =>
                            selectedForBulk.includes(p.id)
                              ? { ...p, status: e.target.value as any }
                              : p,
                          );
                          onUpdateParticipants(updated);
                          onAddLog(
                            "Toplu Durum Güncellemesi",
                            `${selectedForBulk.length} katılımcının durumu "${e.target.value}" olarak güncellendi.`,
                          );
                          setSelectedForBulk([]);
                          e.target.value = "";
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Durum Değiştir...
                      </option>
                      <option value="Başvuru Yapıldı">Başvuru Yapıldı</option>
                      <option value="Onaylandı">Onaylandı</option>
                      <option value="Kampta">Kampta</option>
                      <option value="Ayrıldı">Ayrıldı</option>
                    </select>
                    <button
                      onClick={() => setSelectedForBulk([])}
                      className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {filteredParticipants.length === 0 ? (
                <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-sm">
                    Arama kriterlerinize uygun katılımcı bulunamadı.
                  </p>
                </div>
              ) : viewMode === "table" ? (
                <div className="overflow-x-auto border border-gray-150 rounded-xl bg-white shadow-3xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-150">
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedForBulk(
                                  paginatedParticipants.map((p) => p.id),
                                );
                              } else {
                                setSelectedForBulk([]);
                              }
                            }}
                            checked={
                              paginatedParticipants.length > 0 &&
                              paginatedParticipants.every(p => selectedForBulk.includes(p.id))
                            }
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                          />
                        </th>
                        <th className="p-3">Katılımcı / T.C. No</th>
                        <th className="p-3">Kamp Dönemi</th>
                        <th className="p-3">Kategori & Yaş</th>
                        <th className="p-3">Bungalov / Yatak</th>
                        <th className="p-3 text-center">Durum</th>
                        <th className="p-3 text-right pr-6">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedParticipants.map((p) => {
                        const pPeriod = periods.find(
                          (per) => per.id === p.campPeriodId,
                        );
                        const initials = p.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();

                        return (
                          <tr
                            key={p.id}
                            onClick={() => {
                              setSelectedParticipantId(p.id);
                              setEvaluationScore(p.performanceScore || 85);
                              setEvaluationNotes("");
                            }}
                            className={`hover:bg-gray-50/70 cursor-pointer transition-colors ${
                              selectedParticipantId === p.id
                                ? "bg-emerald-50/30"
                                : ""
                            }`}
                          >
                            <td
                              className="p-3 w-10 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={selectedForBulk.includes(p.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedForBulk([
                                      ...selectedForBulk,
                                      p.id,
                                    ]);
                                  } else {
                                    setSelectedForBulk(
                                      selectedForBulk.filter(
                                        (id) => id !== p.id,
                                      ),
                                    );
                                  }
                                }}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${p.gender === "Kadın" ? "bg-pink-400" : "bg-blue-400"}`}
                                >
                                  {initials}
                                </div>
                                <div>
                                  <p className="font-extrabold text-gray-900">
                                    {p.name}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                    <span className="text-3xs text-gray-400 font-mono">
                                      TC: {p.identityNumber.slice(0, 3)}****
                                    </span>
                                    {p.gender === "Kadın" ? (
                                      <span className="text-[10px] text-pink-600 font-bold">
                                        Kadın
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-blue-600 font-bold">
                                        Erkek
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span
                                className="text-3xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md block max-w-[150px] truncate"
                                title={pPeriod?.name || "Belirtilmemiş"}
                              >
                                {pPeriod?.name || "Belirtilmemiş"}
                              </span>
                            </td>
                            <td className="p-3">
                              <div>
                                <p className="font-semibold text-gray-700 capitalize">
                                  {p.category}{" "}
                                  {[
                                    "İlkokul",
                                    "Ortaokul",
                                    "Lise",
                                    "Üniversite",
                                  ].includes(p.category || "")
                                    ? "Öğrencisi"
                                    : ""}
                                </p>
                                <p className="text-3xs text-gray-400 font-mono mt-0.5">
                                  {new Date().getFullYear() -
                                    new Date(p.birthDate).getFullYear()}{" "}
                                  Yaş
                                </p>
                              </div>
                            </td>
                            <td className="p-3 font-mono">
                              {p.bungalowId ? (
                                <div className="text-xs text-gray-800">
                                  <span className="font-extrabold text-emerald-800">
                                    {p.bungalowId}
                                  </span>
                                  <span className="text-3xs font-semibold text-gray-400 ml-1">
                                    B.{p.bedNumber}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-3xs text-gray-400 italic">
                                  Oda Atanmamış
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-[10px] font-extrabold ${
                                  p.status === "Kampta"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : p.status === "Onaylandı"
                                      ? "bg-blue-100 text-blue-800"
                                      : p.status === "Yedek Listede"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-gray-150 text-gray-600"
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="p-3 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedParticipantId(p.id);
                                    setIsBadgeModalOpen(true);
                                  }}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Yaka Kartı Önizle / Oluştur"
                                >
                                  <Award className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                  {paginatedParticipants.map((p) => {
                    const pPeriod = periods.find(
                      (per) => per.id === p.campPeriodId,
                    );
                    const initials = p.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedParticipantId(p.id);
                          setEvaluationScore(p.performanceScore || 85);
                          setEvaluationNotes("");
                        }}
                        className={`bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${
                          selectedParticipantId === p.id
                            ? "border-emerald-500 ring-2 ring-emerald-100"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedForBulk.includes(p.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedForBulk([
                                      ...selectedForBulk,
                                      p.id,
                                    ]);
                                  } else {
                                    setSelectedForBulk(
                                      selectedForBulk.filter(
                                        (id) => id !== p.id,
                                      ),
                                    );
                                  }
                                }}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4 mt-1"
                              />
                            </div>
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${p.gender === "Kadın" ? "bg-pink-400" : "bg-blue-400"}`}
                            >
                              {initials}
                            </div>
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                              p.status === "Kampta"
                                ? "bg-emerald-100 text-emerald-800"
                                : p.status === "Onaylandı"
                                  ? "bg-blue-100 text-blue-800"
                                  : p.status === "Yedek Listede"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-150 text-gray-600"
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>

                        <div>
                          <h4
                            className="font-extrabold text-gray-900 truncate"
                            title={p.name}
                          >
                            {p.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 capitalize">
                            {p.category} •{" "}
                            {new Date().getFullYear() -
                              new Date(p.birthDate).getFullYear()}{" "}
                            Yaş
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                          <div className="font-mono">
                            {p.bungalowId ? (
                              <span className="text-gray-800">
                                <span className="font-extrabold text-emerald-700">
                                  {p.bungalowId}
                                </span>
                                <span className="text-gray-400 ml-1">
                                  B.{p.bedNumber}
                                </span>
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">
                                Oda Atanmamış
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setSelectedParticipantId(p.id);
                                setIsBadgeModalOpen(true);
                              }}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md border border-blue-100 bg-blue-50/50 transition cursor-pointer"
                              title="Yaka Kartı Önizle / Oluştur"
                            >
                              <Award className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {filteredParticipants.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 bg-white p-4 rounded-xl border border-gray-150 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 font-semibold">
                      Toplam <span className="font-extrabold text-gray-900">{filteredParticipants.length}</span> kayıttan <span className="font-extrabold text-gray-900">{filteredParticipants.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-extrabold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredParticipants.length)}</span> arası gösteriliyor.
                    </div>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="text-xs border border-gray-200 rounded p-1 bg-gray-50 text-gray-700 outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value={10}>10 satır</option>
                      <option value={15}>15 satır</option>
                      <option value={20}>20 satır</option>
                      <option value={50}>50 satır</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Önceki
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                            currentPage === page
                              ? 'bg-emerald-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>{" "}
      {/* Closes space-y-5 accordion list */}
      {/* Drawer: Selected Participant Detail */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedParticipantId(null)}
          />
          <div className="relative w-full max-w-lg md:max-w-xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-150 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm ${selectedParticipant.gender === "Kadın" ? "bg-pink-400" : "bg-blue-400"}`}
                >
                  {selectedParticipant.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
                    {selectedParticipant.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono font-semibold text-gray-500">
                      TC: {selectedParticipant.identityNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        selectedParticipant.status === "Kampta"
                          ? "bg-emerald-100 text-emerald-800"
                          : selectedParticipant.status === "Onaylandı"
                            ? "bg-blue-100 text-blue-800"
                            : selectedParticipant.status === "Yedek Listede"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-150 text-gray-600"
                      }`}
                    >
                      {selectedParticipant.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedParticipantId(null)}
                className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100 transition text-gray-500 shadow-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
              {/* Category & Contact Details */}
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-3xs">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <UserSquare2 className="w-4 h-4 text-emerald-600" /> Profil &
                  İletişim Bilgileri
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">
                      Kategori
                    </span>
                    <span className="font-bold text-gray-800">
                      {selectedParticipant.category}{" "}
                      {["İlkokul", "Ortaokul", "Lise", "Üniversite"].includes(
                        selectedParticipant.category || "",
                      )
                        ? "Öğrencisi"
                        : ""}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">
                      Yaş & Cinsiyet
                    </span>
                    <span className="font-bold text-gray-800 capitalize">
                      {new Date().getFullYear() -
                        new Date(
                          selectedParticipant.birthDate,
                        ).getFullYear()}{" "}
                      Yaş, {selectedParticipant.gender}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">
                      Telefon Numarası
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">
                        {selectedParticipant.phone || "Belirtilmedi"}
                      </span>
                      {selectedParticipant.phone && (
                        <button
                          onClick={() => handleSendWhatsApp(selectedParticipant)}
                          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 p-1 rounded-md transition-colors"
                          title="WhatsApp'tan Mesaj Gönder"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-semibold mb-0.5">
                      E-posta Adresi
                    </span>
                    <span className="font-bold text-gray-800">
                      {selectedParticipant.email || "Belirtilmedi"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Details */}
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-3xs">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Revir
                  & Sağlık Durumu
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                    <span className="font-bold text-gray-600 block mb-1 text-[10px] uppercase">
                      Şiddetli Alerjiler
                    </span>
                    <span className="text-red-800 font-medium">
                      {selectedParticipant.allergies || "Yok"}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl">
                    <span className="font-bold text-gray-600 block mb-1 text-[10px] uppercase">
                      Kronik Hastalıklar / İlaçlar
                    </span>
                    <span className="text-gray-800 font-medium">
                      {selectedParticipant.chronicDiseases || "Yok"}{" "}
                      {selectedParticipant.medications
                        ? `| İlaçlar: ${selectedParticipant.medications}`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notification & Communication */}
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-3xs">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" /> Veli Bilgilendirme
                  Servisi
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setNotifyMethod("all")}
                      className={`py-1.5 px-1 text-[10px] rounded-lg border font-black transition cursor-pointer text-center ${notifyMethod === "all" ? "border-blue-500 bg-blue-50 text-blue-900 shadow-3xs" : "border-gray-200 hover:border-gray-300 text-gray-500 bg-white"}`}
                    >
                      Tümü
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifyMethod("whatsapp")}
                      className={`py-1.5 px-1 text-[10px] rounded-lg border font-black transition cursor-pointer text-center ${notifyMethod === "whatsapp" ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-3xs" : "border-gray-200 hover:border-gray-300 text-gray-500 bg-white"}`}
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifyMethod("sms")}
                      className={`py-1.5 px-1 text-[10px] rounded-lg border font-black transition cursor-pointer text-center ${notifyMethod === "sms" ? "border-blue-500 bg-blue-50 text-blue-900 shadow-3xs" : "border-gray-200 hover:border-gray-300 text-gray-500 bg-white"}`}
                    >
                      SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifyMethod("email")}
                      className={`py-1.5 px-1 text-[10px] rounded-lg border font-black transition cursor-pointer text-center ${notifyMethod === "email" ? "border-blue-500 bg-blue-50 text-blue-900 shadow-3xs" : "border-gray-200 hover:border-gray-300 text-gray-500 bg-white"}`}
                    >
                      E-Posta
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold block">
                      Hızlı Şablon Seçimi
                    </label>
                    <select
                      value={notifyTemplate}
                      onChange={(e) => setNotifyTemplate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 focus:outline-blue-600 bg-gray-50 hover:bg-gray-100 transition text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                      <option value="welcome">
                        Açılış / Kamp Kabulü Bildirimi
                      </option>
                      <option value="incident">
                        Tıbbi Bilgilendirme (Revir Durumu)
                      </option>
                      <option value="general">
                        Genç Yeşilay Gelişim / Günlük Özet
                      </option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-gray-500 font-bold">
                        İleti İçeriği
                      </label>
                      <span className="text-[9px] text-gray-400 font-bold">
                        Karakter: {customMessage.length}
                      </span>
                    </div>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-3 focus:outline-blue-600 text-xs font-medium text-gray-800 bg-white shadow-3xs"
                      rows={3}
                      placeholder="İleti yazın..."
                    ></textarea>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendNotification}
                    className="w-full bg-blue-600 text-white font-extrabold text-xs py-2 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Bilgilendirmeyi Gönder
                  </button>
                </div>
              </div>

              {/* Actions & Documents */}
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-3xs mb-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-purple-600" /> Belgeler &
                  Kamp Kartı
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      exportToPdf(selectedParticipant);
                      onAddLog(
                        "Form İndirme",
                        `'${selectedParticipant.name}' için PDF indirildi.`,
                      );
                    }}
                    className="bg-white hover:bg-red-50 text-red-600 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-red-200 shadow-3xs"
                  >
                    <Printer className="w-4 h-4" /> Form İndir (PDF)
                  </button>
                  <button
                    onClick={() => {
                      exportToWord(selectedParticipant);
                      onAddLog(
                        "Form İndirme",
                        `'${selectedParticipant.name}' için Word indirildi.`,
                      );
                    }}
                    className="bg-white hover:bg-blue-50 text-blue-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-blue-200 shadow-3xs"
                  >
                    <FileDown className="w-4 h-4" /> Form İndir (Word)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBadgeModalOpen(true);
                      onAddLog(
                        "Katılımcı Kartı",
                        `'${selectedParticipant.name}' için Kamp Kartı oluşturuldu.`,
                      );
                    }}
                    className="col-span-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-sm transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Award className="w-4 h-4" /> Yaka Kartı Oluştur
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Kamp Katılımcı Kartı (Yaka Kartı) Modal */}
      {isBadgeModalOpen && selectedParticipant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative border border-gray-100 flex flex-col items-center">
            {/* Close button */}
            <button
              onClick={() => setIsBadgeModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-gray-800 self-start mb-4 uppercase tracking-wider">
              Kart Önizleme
            </h3>

            {/* Virtual physical badge card */}
            <div className="w-[300px] h-[460px] border-[3px] border-[#00AB41] rounded-2xl overflow-hidden flex flex-col bg-white shadow-lg relative select-none">
              {/* Green Header */}
              <div className="bg-[#0B3B24] p-3.5 flex items-center justify-center gap-2 border-b-2 border-[#00AB41]">
                <div className="w-7 h-7 flex items-center justify-center bg-white rounded-full">
                  <svg viewBox="0 0 100 100" className="w-5 h-5">
                    <path
                      d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z"
                      fill="#00AB41"
                    />
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-white leading-none tracking-wider">
                    YEŞİLAY GENÇLİK KAMPI
                  </span>
                  <span className="text-[7px] text-[#00AB41] font-bold leading-none uppercase tracking-widest mt-1">
                    KAMP KATILIM KARTI
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-4 flex flex-col items-center justify-between text-center bg-radial-at-t from-emerald-50/10 to-white">
                {/* Initials Avatar */}
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-[#00AB41] flex items-center justify-center text-2xl font-black text-[#0B3B24] shadow-2xs">
                  {(selectedParticipant.name || "K")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                {/* Name */}
                <div className="mt-2">
                  <p className="text-sm font-black text-[#0B3B24] tracking-tight uppercase leading-none">
                    {selectedParticipant.name}
                  </p>
                  <span className="inline-block bg-emerald-100/70 text-[#00875A] text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-1 border border-emerald-200/50">
                    {selectedParticipant.category
                      ? `${selectedParticipant.category} ${["İlkokul", "Ortaokul", "Lise", "Üniversite"].includes(selectedParticipant.category) ? "Öğrencisi" : ""}`
                      : "GÖNÜLLÜ KATILIMCI"}
                  </span>
                </div>

                {/* Grid Details */}
                <div className="w-full space-y-1.5 text-[10px]">
                  <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
                    <span className="text-gray-400 font-extrabold uppercase text-[8px]">
                      Grup
                    </span>
                    <span className="font-extrabold text-gray-800 flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: participantGroup?.color || "#cbd5e1",
                        }}
                      />
                      {participantGroup?.name || "Grup Atanmamış"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
                    <span className="text-gray-400 font-extrabold uppercase text-[8px]">
                      Konaklama
                    </span>
                    <span className="font-extrabold text-gray-800">
                      {selectedParticipant.bungalowId
                        ? `${selectedParticipant.bungalowId} - Yatak ${selectedParticipant.bedNumber}`
                        : "Oda Atanmamış"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
                    <span className="text-gray-400 font-extrabold uppercase text-[8px]">
                      T.C. Kimlik
                    </span>
                    <span className="font-mono text-gray-700">
                      {selectedParticipant.identityNumber.slice(0, 3)}******
                      {selectedParticipant.identityNumber.slice(-2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer with Seals & Fake Barcode */}
              <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 flex justify-between items-center h-12">
                <div className="flex gap-1">
                  <span className="text-[7px] font-extrabold text-green-800 bg-green-100 px-1 py-0.5 rounded-xs">
                    KVKK
                  </span>
                  <span className="text-[7px] font-extrabold text-green-800 bg-green-100 px-1 py-0.5 rounded-xs">
                    TAAH
                  </span>
                </div>
                {/* SVG Barcode */}
                <svg className="h-6 w-20" viewBox="0 0 100 30">
                  <rect x="0" y="2" width="2" height="26" fill="#000" />
                  <rect x="4" y="2" width="1" height="26" fill="#000" />
                  <rect x="7" y="2" width="3" height="26" fill="#000" />
                  <rect x="12" y="2" width="1" height="26" fill="#000" />
                  <rect x="15" y="2" width="2" height="26" fill="#000" />
                  <rect x="19" y="2" width="4" height="26" fill="#000" />
                  <rect x="25" y="2" width="1" height="26" fill="#000" />
                  <rect x="28" y="2" width="2" height="26" fill="#000" />
                  <rect x="32" y="2" width="1" height="26" fill="#000" />
                  <rect x="35" y="2" width="3" height="26" fill="#000" />
                  <rect x="40" y="2" width="2" height="26" fill="#000" />
                  <rect x="44" y="2" width="1" height="26" fill="#000" />
                  <rect x="47" y="2" width="4" height="26" fill="#000" />
                  <rect x="53" y="2" width="1" height="26" fill="#000" />
                  <rect x="56" y="2" width="2" height="26" fill="#000" />
                  <rect x="60" y="2" width="3" height="26" fill="#000" />
                  <rect x="65" y="2" width="1" height="26" fill="#000" />
                  <rect x="68" y="2" width="4" height="26" fill="#000" />
                  <rect x="74" y="2" width="2" height="26" fill="#000" />
                  <rect x="78" y="2" width="1" height="26" fill="#000" />
                  <rect x="81" y="2" width="3" height="26" fill="#000" />
                  <rect x="86" y="2" width="2" height="26" fill="#000" />
                  <rect x="90" y="2" width="4" height="26" fill="#000" />
                  <rect x="96" y="2" width="2" height="26" fill="#000" />
                </svg>
              </div>
            </div>

            {/* Print trigger button */}
            <button
              onClick={() =>
                handlePrintBadge(
                  selectedParticipant,
                  participantGroup?.name || "Grup Atanmamış",
                  participantGroup?.color || "#cbd5e1",
                )
              }
              className="mt-6 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Yazdır / PDF Olarak Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Bulk Badge Printing & Preview Center Modal */}
      {isBulkBadgeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden border border-gray-150 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-emerald-800 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-700/50 rounded-xl">
                  <Printer className="w-6 h-6 text-emerald-200" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base tracking-tight uppercase">
                    Toplu Yaka Kartı Yazdırma & Önizleme Merkezi
                  </h2>
                  <p className="text-[10px] text-emerald-100 font-semibold mt-0.5">
                    Seçili katılımcılarınız için profesyonel yerleşim planı oluşturun, yaka kartı şablonlarını özelleştirin ve tek tıkla yazdırın.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkBadgeModalOpen(false)}
                className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body: Two-Column Layout */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50/50">
              
              {/* Left Column: Settings Panel (Scrollable) */}
              <div className="w-full md:w-[380px] border-r border-gray-200 bg-white p-5 overflow-y-auto flex flex-col gap-5 shrink-0">
                
                {/* Section 1: Template and Layout Configuration */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-emerald-600 rounded-sm inline-block"></span>
                    Tasarım & Sayfa Yerleşimi
                  </h4>

                  {/* Custom Camp Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Kamp / Organizasyon Başlığı</label>
                    <input
                      type="text"
                      value={bulkBadgeConfig.customTitle}
                      onChange={(e) => setBulkBadgeConfig({ ...bulkBadgeConfig, customTitle: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                      placeholder="Örn: YEŞİLAY GENÇLİK KAMPI"
                    />
                  </div>

                  {/* Badge Color Theme */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Yaka Kartı Renk Teması</label>
                    <select
                      value={bulkBadgeConfig.badgeColorTheme}
                      onChange={(e) => setBulkBadgeConfig({ ...bulkBadgeConfig, badgeColorTheme: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                    >
                      <option value="rainbow">Grup Rengi (Dinamik Gökkuşağı)</option>
                      <option value="emerald">Zümrüt Yeşili (Yeşilay Standardı)</option>
                      <option value="green">Canlı Orman Yeşili</option>
                      <option value="blue">Deniz Mavisi</option>
                    </select>
                  </div>

                  {/* Layout Grid */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Sayfa Başına Kart Sayısı</label>
                    <select
                      value={bulkBadgeConfig.layoutGrid}
                      onChange={(e) => setBulkBadgeConfig({ ...bulkBadgeConfig, layoutGrid: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                    >
                      <option value="2x4">A4 Sayfada 8 Kart (2x4 Grid - Ekonomik)</option>
                      <option value="2x3">A4 Sayfada 6 Kart (2x3 Grid - Büyük Kartlar)</option>
                      <option value="1x1">Sayfa Başına Tek Kart (Özel Boyut)</option>
                    </select>
                  </div>

                  {/* Badge Size */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Yaka Kartı Ebatları</label>
                    <select
                      value={bulkBadgeConfig.badgeSize}
                      onChange={(e) => setBulkBadgeConfig({ ...bulkBadgeConfig, badgeSize: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                    >
                      <option value="90x65">90mm x 65mm (Yatay Standart)</option>
                      <option value="85x54">85mm x 54mm (Kredi Kartı Boyutu)</option>
                      <option value="100x70">100mm x 70mm (Geniş Yatay)</option>
                      <option value="65x90">65mm x 90mm (Dikey Standart)</option>
                      <option value="54x85">54mm x 85mm (Dikey Kredi Kartı)</option>
                      <option value="70x100">70mm x 100mm (Dikey Geniş)</option>
                    </select>
                  </div>
                </div>

                {/* Section 2: Content Visibility Toggles */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-emerald-600 rounded-sm inline-block"></span>
                    Kart İçerik Kontrolleri
                  </h4>

                  <div className="space-y-2.5">
                    {/* Hide Identity */}
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-700 select-none">
                      <input
                        type="checkbox"
                        checked={bulkBadgeConfig.hideIdentity}
                        onChange={(e) => setBulkBadgeConfig({ ...bulkBadgeConfig, hideIdentity: e.target.checked })}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>T.C. Kimlik Numarasını Gizle</span>
                    </label>

                    {/* Hide Accommodation */}
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-700 select-none">
                      <input
                        type="checkbox"
                        checked={bulkBadgeConfig.hideAccommodation}
                        onChange={(e) => setBulkBadgeConfig({ ...bulkBadgeConfig, hideAccommodation: e.target.checked })}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Bungalov / Oda Bilgisini Gizle</span>
                    </label>

                    {/* Hide Group */}
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-700 select-none">
                      <input
                        type="checkbox"
                        checked={bulkBadgeConfig.hideGroup}
                        onChange={(e) => setBulkBadgeConfig({ ...bulkBadgeConfig, hideGroup: e.target.checked })}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Grup İsmini ve Rengini Gizle</span>
                    </label>

                    {/* Show Allergies Warning */}
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-700 select-none">
                      <input
                        type="checkbox"
                        checked={bulkBadgeConfig.showAllergiesWarning}
                        onChange={(e) => setBulkBadgeConfig({ ...bulkBadgeConfig, showAllergiesWarning: e.target.checked })}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Alerjisi Olanlarda "Alerji Var" Uyarısı Ekle</span>
                    </label>

                    {/* Show KVKK Seals */}
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-700 select-none">
                      <input
                        type="checkbox"
                        checked={bulkBadgeConfig.showKvkkSeal}
                        onChange={(e) => setBulkBadgeConfig({ ...bulkBadgeConfig, showKvkkSeal: e.target.checked })}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Alt Kısımdaki KVKK & Taahhüt Mühürlerini Göster</span>
                    </label>
                  </div>
                </div>

                {/* Section 3: Selected Participants Queue */}
                <div className="space-y-2 flex-1 flex flex-col overflow-hidden min-h-[160px]">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-emerald-600 rounded-sm inline-block"></span>
                      Yazdırılacaklar Listesi ({selectedForBulk.length} Kişi)
                    </span>
                    {selectedForBulk.length > 0 && (
                      <button
                        onClick={() => setSelectedForBulk([])}
                        className="text-[10px] text-red-600 hover:text-red-800 font-extrabold cursor-pointer"
                      >
                        Temizle
                      </button>
                    )}
                  </h4>

                  <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50 bg-gray-50/50 p-1">
                    {selectedForBulk.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-4 text-center text-gray-400">
                        <Users className="w-8 h-8 opacity-40 mb-2" />
                        <p className="text-[10px] font-semibold">Listede katılımcı bulunmuyor.</p>
                      </div>
                    ) : (
                      participants
                        .filter((p) => selectedForBulk.includes(p.id))
                        .map((p) => {
                          const pGroup = groups.find((g) => g.id === p.groupId);
                          return (
                            <div key={p.id} className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors group">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: pGroup?.color || "#cbd5e1" }}
                                />
                                <div className="text-left overflow-hidden">
                                  <div className="text-[11px] font-bold text-gray-800 truncate" title={p.name}>
                                    {p.name}
                                  </div>
                                  <div className="text-[9px] text-gray-400 font-semibold">
                                    {p.category || "Kategori Yok"}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedForBulk(selectedForBulk.filter((id) => id !== p.id))}
                                className="p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer md:opacity-0 group-hover:opacity-100"
                                title="Listeden Çıkar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Dynamic Live Grid Preview Area */}
              <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center">
                
                {/* Info and Tips Banner */}
                <div className="w-full max-w-4xl mb-4 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-800 rounded-full p-1.5">
                    <Award className="w-4 h-4 text-emerald-700" />
                  </div>
                  <p className="text-2xs font-semibold text-emerald-900 text-left">
                    <strong>Canlı Tasarım Önizlemesi:</strong> Kartlar yazıcıya gönderilmeden önce aşağıda gerçek ölçekli olarak simüle edilmektedir. Ayarlar sütunundaki seçenekleri değiştirerek görünümü anında güncelleyebilirsiniz.
                  </p>
                </div>

                {/* Simulated A4 Paper */}
                <div className="w-full max-w-4xl bg-white border border-gray-300 shadow-xl rounded-2xl p-6 min-h-[500px] flex flex-col relative select-none">
                  {selectedForBulk.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
                      <Printer className="w-16 h-16 opacity-30 mb-4" />
                      <h4 className="font-bold text-gray-700">Seçili Katılımcı Yok</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm">
                        Yaka kartı önizlemesi ve yazdırma için lütfen soldaki kuyruğa katılımcı ekleyin veya bu paneli kapatıp ana listeden seçim yapın.
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-full">
                      {/* Grid representation */}
                      <div
                        className="grid w-full gap-4"
                        style={{
                          gridTemplateColumns: bulkBadgeConfig.layoutGrid === "2x4" || bulkBadgeConfig.layoutGrid === "2x3" ? "repeat(2, 1fr)" : "1fr",
                        }}
                      >
                        {participants
                          .filter((p) => selectedForBulk.includes(p.id))
                          .map((p) => {
                            const pGroup = groups.find((g) => g.id === p.groupId);
                            const groupColor = pGroup?.color || "#cbd5e1";
                            const groupName = pGroup?.name || "Grup Atanmamış";
                            const initials = p.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase();

                            // Theme logic
                            let headerBg = "#0B3B24";
                            let borderColor = "#00AB41";
                            let roleBg = "rgba(16, 185, 129, 0.1)";
                            let roleTextColor = "#047857";

                            if (bulkBadgeConfig.badgeColorTheme === "rainbow") {
                              borderColor = groupColor;
                              headerBg = groupColor;
                              roleBg = `${groupColor}1a`;
                              roleTextColor = groupColor;
                            } else if (bulkBadgeConfig.badgeColorTheme === "emerald") {
                              headerBg = "#047857";
                              borderColor = "#10b981";
                              roleBg = "rgba(16, 185, 129, 0.1)";
                              roleTextColor = "#047857";
                            } else if (bulkBadgeConfig.badgeColorTheme === "green") {
                              headerBg = "#15803d";
                              borderColor = "#22c55e";
                              roleBg = "rgba(34, 197, 94, 0.1)";
                              roleTextColor = "#15803d";
                            } else if (bulkBadgeConfig.badgeColorTheme === "blue") {
                              headerBg = "#1d4ed8";
                              borderColor = "#3b82f6";
                              roleBg = "rgba(59, 130, 246, 0.1)";
                              roleTextColor = "#1d4ed8";
                            }

                            const isVertical = ["65x90", "54x85", "70x100"].includes(bulkBadgeConfig.badgeSize);
                            let previewWidth = "100%";
                            let previewHeight = "170px";

                            if (bulkBadgeConfig.badgeSize === "90x65") {
                              previewHeight = "170px";
                            } else if (bulkBadgeConfig.badgeSize === "85x54") {
                              previewHeight = "150px";
                            } else if (bulkBadgeConfig.badgeSize === "100x70") {
                              previewHeight = "185px";
                            } else if (bulkBadgeConfig.badgeSize === "65x90") {
                              previewWidth = "180px";
                              previewHeight = "250px";
                            } else if (bulkBadgeConfig.badgeSize === "54x85") {
                              previewWidth = "150px";
                              previewHeight = "235px";
                            } else if (bulkBadgeConfig.badgeSize === "70x100") {
                              previewWidth = "190px";
                              previewHeight = "270px";
                            }

                            return (
                              <div
                                key={p.id}
                                className="bg-white border rounded-xl overflow-hidden flex flex-col shadow-xs relative transition-all mx-auto"
                                style={{
                                  borderColor: borderColor,
                                  borderWidth: "1.5px",
                                  width: previewWidth,
                                  height: previewHeight
                                }}
                              >
                                {/* Header */}
                                <div
                                  className="p-2 flex items-center gap-2 border-b-2 text-white shrink-0"
                                  style={{ backgroundColor: headerBg, borderBottomColor: borderColor }}
                                >
                                  <div className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full">
                                    <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 fill-white">
                                      <path d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z" fill={bulkBadgeConfig.badgeColorTheme === "rainbow" ? "white" : borderColor} />
                                    </svg>
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-[9px] font-black leading-none uppercase tracking-wide">
                                      {bulkBadgeConfig.customTitle}
                                    </span>
                                    <span className="text-[6px] opacity-80 font-bold tracking-widest uppercase mt-0.5 leading-none">
                                      KAMP KATILIM KARTI
                                    </span>
                                  </div>
                                </div>

                                {/* Body */}
                                <div className="flex-1 p-2.5 flex flex-col items-center justify-between text-center bg-radial-at-t from-emerald-50/10 to-white min-h-0">
                                  {/* Avatar */}
                                  <div
                                    className="w-9 h-9 rounded-full bg-emerald-50/50 border flex items-center justify-center text-xs font-black shadow-3xs shrink-0"
                                    style={{ borderColor: borderColor, color: headerBg }}
                                  >
                                    {initials}
                                  </div>

                                  {/* Name */}
                                  <div className="w-full mt-1 shrink-0">
                                    <p className="text-[11px] font-extrabold text-gray-800 leading-none truncate uppercase" title={p.name}>
                                      {p.name}
                                    </p>
                                    <span
                                      className="inline-block text-[6.5px] font-black px-1.5 py-0.5 rounded-full uppercase mt-1"
                                      style={{ backgroundColor: roleBg, color: roleTextColor }}
                                    >
                                      {p.category || "KATILIMCI"}
                                    </span>
                                  </div>

                                  {/* Details */}
                                  <div className="w-full space-y-0.5 text-[8.5px] mt-1 overflow-hidden shrink-0">
                                    {!bulkBadgeConfig.hideGroup && (
                                      <div className="flex justify-between items-center border-b border-dashed border-gray-100 py-0.5">
                                        <span className="text-gray-400 font-bold uppercase text-[7px]">Grup</span>
                                        <span className="font-bold text-gray-700 flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: groupColor }} />
                                          {groupName}
                                        </span>
                                      </div>
                                    )}
                                    {!bulkBadgeConfig.hideAccommodation && p.bungalowId && (
                                      <div className="flex justify-between items-center border-b border-dashed border-gray-100 py-0.5">
                                        <span className="text-gray-400 font-bold uppercase text-[7px]">Oda / Yatak</span>
                                        <span className="font-bold text-gray-700">
                                          {p.bungalowId} - Yat. {p.bedNumber}
                                        </span>
                                      </div>
                                    )}
                                    {!bulkBadgeConfig.hideIdentity && (
                                      <div className="flex justify-between items-center border-b border-dashed border-gray-100 py-0.5">
                                        <span className="text-gray-400 font-bold uppercase text-[7px]">T.C. Kimlik</span>
                                        <span className="font-mono text-gray-500">
                                          {p.identityNumber.slice(0, 3)}******{p.identityNumber.slice(-2)}
                                        </span>
                                      </div>
                                    )}
                                    {bulkBadgeConfig.showAllergiesWarning && p.allergies && (
                                      <div className="text-red-600 bg-red-50 border border-red-100 rounded text-[7px] font-bold py-0.5 mt-0.5 text-center">
                                        DİKKAT: Alerjisi Var
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Footer */}
                                <div className="bg-gray-50 border-t border-gray-150 px-2 py-1 flex justify-between items-center h-7 shrink-0">
                                  <div className="flex gap-0.5">
                                    {bulkBadgeConfig.showKvkkSeal && (
                                      <span className="text-[5px] font-extrabold text-green-800 bg-green-100 px-1 py-0.5 rounded-xs">
                                        KVKK
                                      </span>
                                    )}
                                    {bulkBadgeConfig.showKvkkSeal && (
                                      <span className="text-[5px] font-extrabold text-green-800 bg-green-100 px-1 py-0.5 rounded-xs">
                                        TAAH
                                      </span>
                                    )}
                                  </div>
                                  <svg className="h-4 w-12" viewBox="0 0 100 30">
                                    <rect x="0" y="2" width="2" height="26" fill="#000" />
                                    <rect x="5" y="2" width="3" height="26" fill="#000" />
                                    <rect x="11" y="2" width="1" height="26" fill="#000" />
                                    <rect x="15" y="2" width="4" height="26" fill="#000" />
                                    <rect x="22" y="2" width="2" height="26" fill="#000" />
                                    <rect x="28" y="2" width="1" height="26" fill="#000" />
                                    <rect x="33" y="2" width="3" height="26" fill="#000" />
                                    <rect x="40" y="2" width="2" height="26" fill="#000" />
                                    <rect x="46" y="2" width="4" height="26" fill="#000" />
                                    <rect x="52" y="2" width="1" height="26" fill="#000" />
                                    <rect x="56" y="2" width="2" height="26" fill="#000" />
                                    <rect x="62" y="2" width="3" height="26" fill="#000" />
                                    <rect x="68" y="2" width="4" height="26" fill="#000" />
                                    <rect x="75" y="2" width="2" height="26" fill="#000" />
                                    <rect x="80" y="2" width="1" height="26" fill="#000" />
                                    <rect x="85" y="2" width="3" height="26" fill="#000" />
                                  </svg>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 border-t border-gray-250 p-4 px-6 flex justify-between items-center shrink-0">
              <div className="text-left">
                {selectedForBulk.length > 0 ? (
                  <span className="text-[11px] font-bold text-gray-600">
                    Toplam {selectedForBulk.length} Kart | Tahmini Sayfa Sayısı:{" "}
                    {Math.ceil(
                      selectedForBulk.length /
                        (bulkBadgeConfig.layoutGrid === "2x4" ? 8 : bulkBadgeConfig.layoutGrid === "2x3" ? 6 : 1)
                    )}{" "}
                    A4 Sayfası
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-gray-400">Yazdırılacak kart seçilmedi</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsBulkBadgeModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-black border border-gray-300 bg-white hover:bg-gray-50 rounded-xl transition cursor-pointer"
                >
                  Vazgeç / Kapat
                </button>
                <button
                  disabled={selectedForBulk.length === 0}
                  onClick={() => {
                    handlePrintBulkBadges();
                    onAddLog(
                      "Toplu Yaka Kartı Yazdırma",
                      `${selectedForBulk.length} adet katılımcı için toplu yaka kartı yazdırıldı.`
                    );
                    setIsBulkBadgeModalOpen(false);
                  }}
                  className={`px-5 py-2 text-xs font-extrabold text-white rounded-xl flex items-center gap-2 shadow-md transition ${
                    selectedForBulk.length === 0
                      ? "bg-gray-300 cursor-not-allowed shadow-none"
                      : "bg-emerald-700 hover:bg-emerald-800 cursor-pointer"
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  Seçilenleri Toplu Yazdır / PDF Al
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Print Warning Modal for iframe */}
      {showPrintWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-gray-900">
              PDF Rapor / Kart Oluşturma
            </h3>
            <p className="text-sm text-gray-600">
              Uygulama şu anda önizleme modunda (iframe) çalışmaktadır. Belgeyi
              yazdırabilmek veya PDF olarak kaydedebilmek için lütfen uygulamayı{" "}
              <strong>yeni bir sekmede</strong> açınız.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowPrintWarning(false)}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-xl transition cursor-pointer"
              >
                Anladım, Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
