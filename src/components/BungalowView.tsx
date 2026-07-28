/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Bungalow, Participant, CampPeriod } from "../types";
import { 
  Home,
  UserMinus,
  UserPlus,
  Sparkles,
  User,
  ShieldAlert,
  Trash2,
  Plus,
  BookOpen,
  ChevronRight,
  X,
  Check,
  ArrowUpDown,
  GripVertical,
  Printer,
  FileText,
  Search,
  Lock, AlertTriangle } from "lucide-react";
import { INITIAL_BUNGALOWS, INITIAL_GROUPS } from "../data";

interface BungalowViewProps {
  bungalows: Bungalow[];
  periods: CampPeriod[];
  selectedCenterId: string;
  onUpdateBungalows: (updated: Bungalow[]) => void;
  participants: Participant[];
  onUpdateParticipants: (updated: Participant[]) => void;
  onAddLog: (action: string, details: string) => void;
  onNavigateToParticipant?: (participantId: string) => void;
}

const analyzeBungalowRisks = (occupants: Participant[]): string[] => {
  if (occupants.length < 2) return [];

  const risks: string[] = [];
  
  // 1. Cinsiyet Uyumsuzluğu
  const genders = new Set(occupants.map(o => o.gender));
  if (genders.size > 1) {
    risks.push("Kritik Risk: Karşı cinsiyetten katılımcılar aynı odada bulunuyor!");
  }

  // 2. Yaş / Kategori Uyumsuzluğu (Minors vs Adults/Older)
  const categories = occupants.map(o => o.category).filter(Boolean) as string[];
  if (categories.length > 0) {
    const hasMinors = categories.some(c => c === 'İlkokul' || c === 'Ortaokul');
    const hasAdults = categories.some(c => c === 'Yetişkin' || c === 'Üniversite' || c === 'Şoför' || c === 'Kafile Sorumlusu');
    if (hasMinors && hasAdults) {
      // Check if the adult is their convoy leader
      const hasConvoyLeader = occupants.some(o => o.category === 'Kafile Sorumlusu' || o.isConvoyLeader);
      if (!hasConvoyLeader) {
         risks.push("Yaş/Kategori Riski: Küçük yaş grubu (İlkokul/Ortaokul) ile yetişkin/büyük yaş grubu aynı odada.");
      }
    }
  }

  // 3. Kafile (Grup) Uyumsuzluğu
  const convoys = new Set(occupants.map(o => o.convoyName).filter(Boolean));
  if (convoys.size > 1) {
    risks.push("Uyum Riski: Farklı kamp gruplarından/kafilelerden katılımcılar bir arada.");
  }

  return risks;
};

export default function BungalowView({
  bungalows,
  periods,
  selectedCenterId,
  onUpdateBungalows,
  participants,
  onUpdateParticipants,
  onAddLog,
  onNavigateToParticipant,
}: BungalowViewProps) {
  const [selectedBungalowId, setSelectedBungalowId] = useState<string | null>(
    null,
  );
  const [filterType, setFilterType] = useState<"All" | "Lider" | "Standart">(
    "All",
  );
  const [showOnlyWithEmptyBeds, setShowOnlyWithEmptyBeds] = useState(false);
  const [assignTarget, setAssignTarget] = useState<{
    bungalowId: string;
    bedNumber: number;
  } | null>(null);
  const [participantSearchTerm, setParticipantSearchTerm] = useState("");
  const [accommodationSearchTerm, setAccommodationSearchTerm] = useState("");

  const isParticipantMatched = (p: Participant) => {
    if (!accommodationSearchTerm.trim()) return false;
    const term = accommodationSearchTerm.toLowerCase();
    const nameMatches = p.name.toLowerCase().includes(term);
    const group = INITIAL_GROUPS.find((g) => g.id === p.groupId);
    const groupMatches = group ? group.name.toLowerCase().includes(term) : false;
    const convoyMatches = p.convoyName ? p.convoyName.toLowerCase().includes(term) : false;
    return nameMatches || groupMatches || convoyMatches;
  };

  // Participant Ledger States
  const [showLedger, setShowLedger] = useState(false);
  const [ledgerPeriodId, setLedgerPeriodId] = useState<string>("All");

  // Mass empty states
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [emptyPeriodId, setEmptyPeriodId] = useState<string>("All");

  // New Bungalow additions form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBungalowName, setNewBungalowName] = useState("");
  const [newBungalowType, setNewBungalowType] = useState<"Lider" | "Standart">(
    "Standart",
  );
  const [newBungalowCapacity, setNewBungalowCapacity] = useState<number>(6);

  // Bungalow Deletion Mode states
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedBungalowIds, setSelectedBungalowIds] = useState<string[]>([]);

  // Bed movement / swapping state inside selected bungalow
  const [movingParticipantId, setMovingParticipantId] = useState<string | null>(null);

  // Drag and drop states for beds
  const [draggedParticipantId, setDraggedParticipantId] = useState<string | null>(null);
  const [dragOverBedNum, setDragOverBedNum] = useState<number | null>(null);

  // Robust double-click and double-tap detection
  const lastBungalowClickRef = useRef<{ id: string; time: number } | null>(null);
  const clickTimeoutRef = useRef<any>(null);
  const [previewBungalowId, setPreviewBungalowId] = useState<string | null>(null);

  // Assignment Conflict Modal state
  const [conflictInfo, setConflictInfo] = useState<{
    participantName: string;
    participantGender: string;
    bungalowName: string;
    message: string;
  } | null>(null);

    const [bulkCapacityConfirm, setBulkCapacityConfirm] = useState<{
    isOpen: boolean;
    newCapacity: number;
    modifiedBungalowCount: number;
    ejectedParticipantCount: number;
    updatedParticipants: any[];
    updatedBungalows: any[];
  } | null>(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Yerleşim düzeni print / PDF states
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printBungalowId, setPrintBungalowId] = useState<string | null>(null);
  const [printPeriodId, setPrintPeriodId] = useState<string>("All");
  const [printCustomTitle, setPrintCustomTitle] = useState("KAMP GRUBU BUNGALOV YERLEŞİM PLANI");
  const [selectedPrintBungalowIds, setSelectedPrintBungalowIds] = useState<string[]>([]);
  const [printPageBreak, setPrintPageBreak] = useState(false);

  // Smart Allocation Wizard
  const [showSmartAllocationModal, setShowSmartAllocationModal] = useState(false);
  const [smartRules, setSmartRules] = useState({
    groupTogether: true, // Aynı kamp grubundakiler beraber kalsın
    schoolTogether: false, // Aynı okuldan/şehirden gelenler birlikte kalsın
    noiseSensitivity: false, // Gürültü hassasiyeti olanlar ayrı yerleştirilsin
    separatePrevious: false, // Daha önce birlikte kalanları dağıt
    mixExperience: false, // İlk kez gelenler deneyimlilerle eşleşsin
  });
  const [isAllocating, setIsAllocating] = useState(false);

  const generatePrintHtml = (bungalowIdsToRender: string[]) => {
    const dateStr = new Date().toLocaleDateString('tr-TR');
    const periodName = printPeriodId === "All" ? "Tüm Dönemler" : periods.find(p => p.id === printPeriodId)?.name || "";
    
    const totalOccupied = bungalowIdsToRender.reduce((sum, id) => sum + getOccupants(id).length, 0);
    const totalCapacity = bungalowIdsToRender.reduce((sum, id) => sum + (bungalows.find(b => b.id === id)?.capacity || 0), 0);

    const bungalowsHtml = bungalowIdsToRender.map((bgId) => {
      const bg = bungalows.find(b => b.id === bgId);
      if (!bg) return "";
      
      const occupants = getOccupants(bg.id);
      const girlsCount = occupants.filter(o => o.gender === "Kadın").length;
      const boysCount = occupants.filter(o => o.gender === "Erkek").length;
      let genderLabel = "";
      if (girlsCount > 0 && boysCount === 0) {
        genderLabel = "Kadın Odası";
      } else if (girlsCount > 0 && boysCount > 0) {
        genderLabel = "Karma Oda";
      } else if (boysCount > 0 && girlsCount === 0) {
        genderLabel = "Erkek Odası";
      }

      const tableRows = Array.from({ length: bg.capacity }).map((_, idx) => {
        const bedNum = idx + 1;
        const occupier = occupants.find((o) => o.bedNumber === bedNum);
        const occupierName = occupier ? occupier.name : "BOŞ YATAK";
        const occupierDuty = occupier ? (occupier.duty || "Katılımcı") : "-";
        const occupierGender = occupier ? occupier.gender : "-";
        const occupierCategory = occupier ? (occupier.category || "Katılımcı") : "-";
        const occupierPeriod = occupier ? (periods.find(p => p.id === occupier.campPeriodId)?.name || "-") : "-";

        return `
          <tr class="${occupier ? "" : "italic text-gray-400 bg-gray-50/20"} border-b border-gray-200">
            <td class="py-2 px-3 text-center border-r border-gray-200 w-16">
              <span class="w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-[10px] ${
                occupier ? "bg-gray-100 text-gray-800 border border-gray-300" : "bg-gray-50 text-gray-400 border border-gray-250 border-dashed"
              }">
                ${bedNum}
              </span>
            </td>
            <td class="py-2 px-3 font-bold text-gray-900">${occupierName}</td>
            <td class="py-2 px-3 text-gray-750 font-semibold text-[10px]">${occupierDuty}</td>
            <td class="py-2 px-3 text-center text-[10px]">${occupierGender}</td>
            <td class="py-2 px-3 text-gray-500 text-[10px]">
              <span class="font-bold text-gray-700">${occupierCategory}</span>
              ${occupier ? `<span class="block text-[8px] text-gray-400 font-medium">${occupierPeriod}</span>` : ""}
            </td>
          </tr>
        `;
      }).join("");

      return `
        <div class="border border-gray-300 rounded-lg p-5 bg-white space-y-3 print-bungalow-card mb-6 break-inside-avoid relative">
          <div class="flex justify-between items-center border-b border-gray-200 pb-2">
            <div>
              <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">${bg.name}</h3>
              <div class="flex items-center gap-2 text-[10px] text-gray-500 font-semibold">
                <span>${bg.type} Blok</span>
                <span>•</span>
                <span>Yatak Kapasitesi: ${bg.capacity}</span>
              </div>
            </div>
            <div class="text-right flex flex-col items-end gap-1">
              ${genderLabel ? `
                <span class="text-[9px] font-bold uppercase px-2 py-0.5 rounded border bg-gray-50 border-gray-200 text-gray-600">
                  ${genderLabel}
                </span>
              ` : ""}
              <div class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                Doluluk: ${occupants.length} / ${bg.capacity}
              </div>
            </div>
          </div>
          <div class="overflow-hidden border border-gray-200 rounded-md font-sans">
            <table class="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-250 font-black text-gray-500 uppercase tracking-wider text-[9px]">
                  <th class="py-2 px-3 text-center w-16">Yatak No</th>
                  <th class="py-2 px-3">Katılımcı Adı Soyadı</th>
                  <th class="py-2 px-3 w-28">Kamp Görevi</th>
                  <th class="py-2 px-3 w-20 text-center">Cinsiyet</th>
                  <th class="py-2 px-3 w-32">Kategori / Dönem</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 font-medium text-gray-800">
                ${tableRows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${printCustomTitle || "Bungalov Yerlesim Plani"}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background-color: white;
            color: black;
            margin: 0;
            padding: 1.5cm;
          }
          @media print {
            body {
              padding: 1.2cm;
              margin: 0;
            }
            .no-print {
              display: none !important;
            }
            ${printPageBreak ? `
            .print-bungalow-card {
              page-break-after: always !important;
              break-after: page !important;
              margin-bottom: 0 !important;
              border-bottom: none !important;
            }
            ` : `
            .print-bungalow-card {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            `}
          }
        </style>
      </head>
      <body class="text-xs leading-normal">
        <div class="max-w-[21cm] mx-auto flex flex-col min-h-screen">
          <!-- Paper Header Block -->
          <div class="border-b-2 border-emerald-800 pb-4 mb-5 flex justify-between items-start">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-3xs">
                <svg viewBox="0 0 100 100" class="w-8 h-8">
                  <path d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z" fill="#00AB41" />
                </svg>
              </div>
              <div class="space-y-0.5">
                <span class="text-[10px] font-black tracking-widest text-emerald-800 uppercase block leading-none">T.C. YEŞİLAY CEMİYETİ</span>
                <h1 class="text-xs font-black text-gray-900 uppercase mt-0.5">
                  ${printCustomTitle || "KAMP GRUBU BUNGALOV YERLEŞİM PLANI"}
                </h1>
                <span class="text-[9px] font-bold text-gray-500 uppercase block tracking-wider mt-0.5">
                  Yeşilay Uluslararası Kamp Merkezi
                </span>
              </div>
            </div>
            <div class="text-right text-[9px] font-bold uppercase text-gray-500 space-y-0.5 shrink-0">
              <div>Rapor Tarihi: ${dateStr}</div>
              <div>Dönem: ${periodName}</div>
              <div>Evrak Türü: Yerleşim Düzeni Dökümü</div>
            </div>
          </div>

          <!-- Summary / Stats for the sheet -->
          <div class="grid grid-cols-3 gap-3 p-3 bg-gray-50 border border-gray-150 rounded-lg mb-6 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            <div>
              YAZDIRILACAK BUNGALOV: <span class="text-gray-900 text-xs font-black">${bungalowIdsToRender.length} Adet</span>
            </div>
            <div>
              DOLU YATAK SAYISI: <span class="text-blue-700 text-xs font-black">${totalOccupied} Kişi</span>
            </div>
            <div>
              TOPLAM KAPASİTE: <span class="text-emerald-700 text-xs font-black">${totalCapacity} Yatak</span>
            </div>
          </div>

          <!-- Bungalow list for printing -->
          <div class="space-y-6 flex-1">
            ${bungalowsHtml || `
              <div class="flex flex-col items-center justify-center py-20 text-gray-400 space-y-2">
                <p class="font-semibold text-xs">Yazdırılacak Bungalov Seçilmedi</p>
              </div>
            `}
          </div>

          <!-- Paper Footer Block -->
          <div class="border-t border-gray-300 pt-3 mt-6 flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-auto">
            <span>Yeşil Hilal KYS Yerleşim Sistemi</span>
            <span>Sayfa Sonu</span>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintLayout = () => {
    const itemsToPrint = printBungalowId ? [printBungalowId] : selectedPrintBungalowIds;
    if (itemsToPrint.length === 0) {
      alert("Lütfen baskı almak için en az 1 adet bungalov seçiniz.");
      return;
    }

    const htmlContent = generatePrintHtml(itemsToPrint);

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 500);
      }, 500);
    }
  };

  const handleAddBungalowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBungalowName.trim()) {
      alert("Lütfen Bungalov Adı giriniz.");
      return;
    }

    // Generate next prefix-ID based on existing ones
    const prefix = newBungalowType === "Lider" ? "LDR" : "STD";
    const existingIds = bungalows
      .filter(
        (b) => b.id.startsWith(prefix) && b.campCenterId === selectedCenterId,
      )
      .map((b) => {
        const match = b.id.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      });
    const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const generatedId = `${prefix}-${nextNum}-${selectedCenterId}`;

    const newBung: Bungalow = {
      id: generatedId,
      name: newBungalowName,
      type: newBungalowType,
      capacity: newBungalowCapacity,
      campCenterId: selectedCenterId,
    };

    onUpdateBungalows([...bungalows, newBung]);
    onAddLog(
      "Bungalov Eklendi",
      `Yeni bungalov kütüğe eklendi: '${newBung.name}' (${newBung.type}, Yatak: ${newBung.capacity}).`,
    );

    // Reset Form
    setNewBungalowName("");
    setShowAddForm(false);
  };

  const handleToggleBungalowStatus = (bungalowId: string) => {
    const bg = bungalows.find((b) => b.id === bungalowId);
    if (!bg) return;
    
    const occupants = getOccupants(bungalowId);
    
    if (bg.isClosed) {
      // Re-open
      onUpdateBungalows(bungalows.map((b) => b.id === bungalowId ? { ...b, isClosed: false } : b));
      onAddLog("Bungalov Aktif Edildi", `'${bg.name}' bungalovu yeniden kullanıma açıldı.`);
      return;
    }

    // Attempting to close
    let warningMsg = `'${bg.name}' bungalovunu geçici süreyle kullanıma kapatmak istediğinize emin misiniz?`;
    if (occupants.length > 0) {
      warningMsg = `'${bg.name}' bungalovunda şu an ${occupants.length} katılımcı kalıyor. Kapatma işlemi yapıldığında katılımcıların yerleşimi otomatik iptal edilecektir. Devam etmek istiyor musunuz?`;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Bungalov Kapatma Onayı",
      message: warningMsg,
      confirmText: "Kapat",
      isDanger: true,
      onConfirm: () => {
        if (occupants.length > 0) {
          const updated = participants.map((p) => {
            if (p.bungalowId === bungalowId) {
              return { ...p, bungalowId: null, bedNumber: null };
            }
            return p;
          });
          onUpdateParticipants(updated);
        }

        onUpdateBungalows(bungalows.map((b) => b.id === bungalowId ? { ...b, isClosed: true } : b));
        setSelectedBungalowId(null);
        setPreviewBungalowId(null);
        onAddLog(
          "Bungalov Kapatıldı",
          `'${bg.name}' bungalovu geçici olarak kullanıma kapatıldı. ${occupants.length > 0 ? `Bungalovdaki ${occupants.length} katılımcının yerleşimi iptal edildi.` : ""}`
        );
      }
    });
  };

  const handleDeleteBungalow = (bungalowId: string) => {
    const occupants = getOccupants(bungalowId);
    const cell = bungalows.find((b) => b.id === bungalowId);
    if (!cell) return;

    let warningMsg = `'${cell.name}' bungalovunu envanterden tamamen silmek istediğinize emin misiniz?`;
    if (occupants.length > 0) {
      warningMsg = `'${cell.name}' bungalovunda şu an ${occupants.length} kayıtlı katılımcı kalmaktadır. Odayı sildiğinizde bu katılımcıların yerleşimleri otomatik olarak iptal edilecektir. Devam etmek istiyor musunuz?`;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Bungalov Silme Onayı",
      message: warningMsg,
      confirmText: "Odayı Sil",
      isDanger: true,
      onConfirm: () => {
        if (occupants.length > 0) {
          const updated = participants.map((p) => {
            if (p.bungalowId === bungalowId) {
              return { ...p, bungalowId: null, bedNumber: null };
            }
            return p;
          });
          onUpdateParticipants(updated);
        }

        onUpdateBungalows(bungalows.filter((b) => b.id !== bungalowId));
        setSelectedBungalowId(null);
        setPreviewBungalowId(null);
        onAddLog(
          "Bungalov Silindi",
          `'${cell.name}' odası envanter kontrolünden silindi. ${occupants.length > 0 ? `Odadaki ${occupants.length} katılımcının yerleşimi otomatik iptal edildi.` : ""}`,
        );
      }
    });
  };

  const handleDeleteSpecificBed = (bungalowId: string, bedNum: number) => {
    const bg = bungalows.find((b) => b.id === bungalowId);
    if (!bg) return;

    if (bg.capacity <= 1) {
      alert("Bungalov kapasitesi 1'den az olamaz. Bungalovu tamamen silmek için 'Bungalovu Sil' butonunu kullanabilirsiniz.");
      return;
    }

    const occupants = getOccupants(bungalowId);
    const occupant = occupants.find((o) => o.bedNumber === bedNum);

    let warningMsg = `${bg.name} - ${bedNum}. yatağı silmek ve oda kapasitesini ${bg.capacity - 1} kişiye düşürmek istediğinize emin misiniz?`;
    if (occupant) {
      warningMsg = `${bg.name} - ${bedNum}. yatakta '${occupant.name}' yerleşmiş durumda. Bu yatağı sildiğinizde katılımcının yerleşimi otomatik olarak iptal edilecek ve oda kapasitesi düşürülecektir. Devam etmek istiyor musunuz?`;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Yatak Silme Onayı",
      message: warningMsg,
      confirmText: "Yatağı Sil",
      isDanger: true,
      onConfirm: () => {
        let updatedParts = participants;
        if (occupant) {
          // Vacate the occupant of the deleted bed
          updatedParts = updatedParts.map((p) =>
            p.id === occupant.id ? { ...p, bungalowId: null, bedNumber: null } : p
          );
        }

        // Shift other occupants who have bedNumber > bedNum down by 1
        updatedParts = updatedParts.map((p) => {
          if (p.bungalowId === bg.id && p.bedNumber !== null && p.bedNumber > bedNum) {
            return { ...p, bedNumber: p.bedNumber - 1 };
          }
          return p;
        });

        onUpdateParticipants(updatedParts);

        // Update bungalow capacity
        onUpdateBungalows(
          bungalows.map((b) => (b.id === bg.id ? { ...b, capacity: b.capacity - 1 } : b))
        );

        onAddLog(
          "Yatak Silindi",
          `'${bg.name}' odasından ${bedNum}. yatak silindi. Yeni kapasite: ${bg.capacity - 1}.`
        );
      }
    });
  };

  const handleDeleteSelectedBungalows = () => {
    if (selectedBungalowIds.length === 0) return;

    // Get occupants across all selected bungalows
    const occupants = participants.filter(
      (p) => p.bungalowId && selectedBungalowIds.includes(p.bungalowId)
    );

    let warningMsg = `Seçilen ${selectedBungalowIds.length} bungalovu envanterden tamamen silmek istediğinize emin misiniz?`;
    if (occupants.length > 0) {
      warningMsg = `Seçilen bungalovlarda şu an toplam ${occupants.length} kayıtlı katılımcı kalmaktadır. Bu odaları sildiğinizde katılımcıların yerleşimleri otomatik olarak iptal edilecektir. Devam etmek istiyor musunuz?`;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Toplu Bungalov Silme Onayı",
      message: warningMsg,
      confirmText: "Bungalovları Sil",
      isDanger: true,
      onConfirm: () => {
        if (occupants.length > 0) {
          const updated = participants.map((p) => {
            if (p.bungalowId && selectedBungalowIds.includes(p.bungalowId)) {
              return { ...p, bungalowId: null, bedNumber: null };
            }
            return p;
          });
          onUpdateParticipants(updated);
        }

        onUpdateBungalows(
          bungalows.filter((b) => !selectedBungalowIds.includes(b.id))
        );

        // If selected bungalow was deleted, reset selection
        if (selectedBungalowId && selectedBungalowIds.includes(selectedBungalowId)) {
          setSelectedBungalowId(null);
        }

        onAddLog(
          "Bungalov Toplu Silme",
          `Seçilen ${selectedBungalowIds.length} bungalov envanter kontrolünden silindi. ${occupants.length > 0 ? `Odalardaki ${occupants.length} katılımcının yerleşimi otomatik iptal edildi.` : ""}`
        );

        setSelectedBungalowIds([]);
        setIsDeleteMode(false);
      }
    });
  };

  // Specific Bungalows for ONLY the selected Center
  const bungalowsToUse = bulkCapacityConfirm ? bulkCapacityConfirm.updatedBungalows : bungalows;
  const centerBungalows = bungalowsToUse.filter(
    (b) => b.campCenterId === selectedCenterId,
  );

  // Get occupants for a specific bungalow
  const getOccupants = (bungalowId: string, customParticipants?: Participant[]) => {
    const list = customParticipants || participants;
    return list.filter((p) => p.bungalowId === bungalowId);
  };

  const canAssignToBungalow = (
    pat: Participant,
    bungalowId: string,
    customParticipants?: Participant[]
  ): { allowed: boolean; message?: string } => {
    const bung = bungalows.find((b) => b.id === bungalowId);
    if (!bung) return { allowed: false, message: "Bungalov bulunamadı." };

    if (bung.isClosed) {
      return { allowed: false, message: "Bu oda geçici olarak kullanıma kapatılmıştır." };
    }

    const list = customParticipants || participants;

    // Get the participant's camp period
    const patPeriod = periods.find((p) => p.id === pat.campPeriodId);
    const patIsFamily = patPeriod?.gender === "Karışık/Aile";

    // 1. CAMP-WIDE PERIOD GENDER CONSTRAINT:
    // If the camp period is not "Karışık/Aile" (i.e. it is a gender-segregated/single-gender time interval),
    // then the entire camp area cannot have both female and male participants accommodated at the same time (for this period).
    if (!patIsFamily) {
      const activeOccupantsOfSamePeriod = list.filter(
        (p) => p.campPeriodId === pat.campPeriodId && p.bungalowId !== null && p.id !== pat.id
      );
      const oppositeGenderOccupant = activeOccupantsOfSamePeriod.find(
        (p) => p.gender !== pat.gender
      );

      if (oppositeGenderOccupant) {
        return {
          allowed: false,
          message: `Güvenlik Kısıtlaması: Aile dışı kamp dönemlerinde aynı dönemde hem kadın hem erkek katılımcı konaklayamaz. Bu dönemde ("${patPeriod?.name || 'Belirtilmemiş'}") aktif olarak yerleştirilmiş ${oppositeGenderOccupant.gender} katılımcı(lar) bulunmaktadır (Örn: ${oppositeGenderOccupant.name}).`,
        };
      }
    }

    // 2. BUNGALOW-LEVEL GENDER CONSTRAINT:
    const currentOccupants = getOccupants(bungalowId, customParticipants);
    if (currentOccupants.length > 0) {
      // Find any occupant of a different gender
      const differentGenderOccupant = currentOccupants.find((occ) => occ.gender !== pat.gender);

      if (differentGenderOccupant) {
        // If different genders exist, it is ONLY allowed if BOTH pat and ALL current occupants are in a family/mixed period
        const allAreFamily = patIsFamily && currentOccupants.every((occ) => {
          const occPeriod = periods.find((p) => p.id === occ.campPeriodId);
          return occPeriod?.gender === "Karışık/Aile";
        });

        if (!allAreFamily) {
          return {
            allowed: false,
            message: `Güvenlik Uyarısı: Bu bungalovda şu an ${differentGenderOccupant.gender} katılımcılar kalmaktadır. Aynı bungalova farklı cinsiyetten (${pat.gender}) katılımcı yerleştirilemez!`,
          };
        }
      }
    }

    return { allowed: true };
  };

  // Get unassigned but approved/waiting participants who can be assigned to bungalows
  const unassignedParticipants = participants.filter(
    (p) =>
      !p.bungalowId &&
      (p.status === "Onaylandı" || p.status === "Başvuru Yapıldı" || p.status === "Kampta"),
  );

  const fillCurrentBungalow = () => {
    if (!selectedBungalowId) return;
    const bung = bungalows.find((b) => b.id === selectedBungalowId);
    if (!bung) return;

    const currentOccupants = getOccupants(selectedBungalowId);
    const filledBeds = currentOccupants.map((o) => o.bedNumber);
    const emptyBeds = Array.from(
      { length: bung.capacity },
      (_, i) => i + 1,
    ).filter((b) => !filledBeds.includes(b));

    if (emptyBeds.length === 0) {
      alert("Bu bungalov zaten tamamen dolu.");
      return;
    }

    let targetGender =
      currentOccupants.length > 0 ? currentOccupants[0].gender : null;
    let newUpdatedParticipants = [...participants];
    let assignedCount = 0;

    for (const bedNum of emptyBeds) {
      // Find an available participant who is allowed to be placed in this room
      const participantIdx = newUpdatedParticipants.findIndex(
        (p) =>
          !p.bungalowId &&
          (p.status === "Onaylandı" || p.status === "Başvuru Yapıldı" || p.status === "Kampta") &&
          canAssignToBungalow(p, selectedBungalowId, newUpdatedParticipants).allowed,
      );

      if (participantIdx !== -1) {
        const participant = newUpdatedParticipants[participantIdx];

        newUpdatedParticipants[participantIdx] = {
          ...participant,
          bungalowId: bung.id,
          bedNumber: bedNum,
        };
        assignedCount++;
      } else {
        break; // No more matching unassigned participants
      }
    }

    if (assignedCount > 0) {
      onUpdateParticipants(newUpdatedParticipants);
      onAddLog(
        "Toplu Yerleştirme",
        `${bung.name} odasındaki kalan ${assignedCount} boş yatağa uygun katılımcılar yerleştirildi.`,
      );
      alert(`${assignedCount} adet boş yatak otomatik olarak dolduruldu!`);
    } else {
      alert(
        "Bu odaya yerleştirilebilecek uygun cinsiyette bekleyen katılımcı bulunamadı.",
      );
    }
  };

  const emptyCurrentBungalow = () => {
    if (!selectedBungalowId) return;
    const bung = bungalows.find((b) => b.id === selectedBungalowId);
    if (!bung) return;

    const currentOccupants = getOccupants(selectedBungalowId);
    if (currentOccupants.length === 0) {
      alert("Bu bungalov zaten boş.");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Odayı Boşalt",
      message: `${bung.name} odasındaki tüm katılımcıların yerleşimini iptal etmek istediğinize emin misiniz?`,
      confirmText: "Boşalt",
      isDanger: true,
      onConfirm: () => {
        const newUpdatedParticipants = participants.map((p) => {
          if (p.bungalowId === selectedBungalowId) {
            return { ...p, bungalowId: null, bedNumber: null };
          }
          return p;
        });

        onUpdateParticipants(newUpdatedParticipants);
        onAddLog(
          "Toplu Boşaltma",
          `${bung.name} odasındaki tüm katılımcıların yerleşimi iptal edildi.`,
        );
      }
    });
  };

  // Filter bungalows based on tab selection and empty beds option
  const filteredBungalows = centerBungalows.filter((b) => {
    const matchesType = filterType === "All" || b.type === filterType;
    const matchesEmpty = !showOnlyWithEmptyBeds || getOccupants(b.id).length < b.capacity;
    return matchesType && matchesEmpty;
  });

  // Handle participant removal from a bed
  const handleRemoveParticipant = (participantId: string) => {
    const target = participants.find((p) => p.id === participantId);
    if (!target) return;

    const updated = participants.map((p) => {
      if (p.id === participantId) {
        return {
          ...p,
          bungalowId: null,
          bedNumber: null,
          status: "Onaylandı" as const,
        };
      }
      return p;
    });

    onUpdateParticipants(updated);
    onAddLog(
      "Konaklama İptal",
      `${target.name} kişisi ${target.bungalowId}-Yatak ${target.bedNumber} konumundan çıkarıldı.`,
    );
  };

  // Handle manual bed assignment of a participant
  const handleAssignParticipant = (
    participantId: string,
    bungalowId: string,
    bedNumber: number,
  ) => {
    const pat = participants.find((p) => p.id === participantId);
    if (!pat) return;

    const bung = bungalows.find((b) => b.id === bungalowId);
    if (!bung) return;

    // Strict validation: Verify gender consistency in standard room
    const checkResult = canAssignToBungalow(pat, bungalowId);
    if (!checkResult.allowed) {
      setConflictInfo({
        participantName: pat.name,
        participantGender: pat.gender,
        bungalowName: bung.name,
        message: checkResult.message || "Güvenlik/Yerleşim Kuralı İhlali: Bu yerleşime izin verilmiyor."
      });
      return;
    }

    const updated = participants.map((p) => {
      if (p.id === participantId) {
        return {
          ...p,
          bungalowId,
          bedNumber,
          status: "Kampta" as const,
          checkedIn: true,
          checkInTime: new Date().toISOString().slice(0, 19),
        };
      }
      return p;
    });

    onUpdateParticipants(updated);
    setAssignTarget(null);
    onAddLog(
      "Konaklama Ataması",
      `${pat.name} isimli katılımcı el ile ${bungalowId} (Yatak ${bedNumber}) hücresine yerleştirildi.`,
    );
  };

  // Move or swap beds inside the same bungalow
  const handleMoveBed = (participantId: string, targetBedNumber: number) => {
    const pat = participants.find((p) => p.id === participantId);
    if (!pat || !pat.bungalowId) return;

    // Is there already an occupant at target bed?
    const occupantAtTarget = participants.find(
      (p) => p.bungalowId === pat.bungalowId && p.bedNumber === targetBedNumber
    );

    const updated = participants.map((p) => {
      if (p.id === participantId) {
        return { ...p, bedNumber: targetBedNumber };
      }
      if (occupantAtTarget && p.id === occupantAtTarget.id) {
        return { ...p, bedNumber: pat.bedNumber };
      }
      return p;
    });

    onUpdateParticipants(updated);
    setMovingParticipantId(null);
    onAddLog(
      "Yatak Değişikliği",
      `${pat.name} isimli katılımcı ${pat.bungalowId} odasında Yatak ${pat.bedNumber} konumundan Yatak ${targetBedNumber} konumuna ${occupantAtTarget ? `(${occupantAtTarget.name} ile takas edilerek) ` : ""}taşındı.`
    );
  };

  // Smart Auto-allocation motor honoring gender segregation for security/KVKK guidelines!
  const executeSmartAllocation = async () => {
    setIsAllocating(true);
    
    // Simulate complex rule processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    let unassigned = participants.filter(
      (p) => !p.bungalowId && (p.status === "Onaylandı" || p.status === "Başvuru Yapıldı" || p.status === "Kampta"),
    );
    
    if (unassigned.length === 0) {
      alert("Yerleştirilecek bekleyen katılımcı bulunamadı.");
      setIsAllocating(false);
      setShowSmartAllocationModal(false);
      return;
    }

    const updatedParticipants = [...participants];
    let count = 0;

    // A basic implementation of "groupTogether" rule: sort unassigned by convoyName first
    if (smartRules.groupTogether) {
      unassigned.sort((a, b) => (a.convoyName || '').localeCompare(b.convoyName || ''));
    }

    // Loop through each bungalow to find vacant beds
    for (const bg of centerBungalows) {
      const bOccupants = updatedParticipants.filter(
        (p) => p.bungalowId === bg.id,
      );

      const filledBeds = bOccupants.map((o) => o.bedNumber);

      for (let bed = 1; bed <= bg.capacity; bed++) {
        if (!filledBeds.includes(bed)) {
          // Find candidates matching room gender constraint and camp period rules
          let candidateIndex = -1;
          
          if (smartRules.groupTogether && bOccupants.length > 0) {
            // try to find someone from same group as existing occupants
            const currentGroups = new Set(bOccupants.map(o => o.convoyName).filter(Boolean));
            candidateIndex = unassigned.findIndex((cand) => {
              return canAssignToBungalow(cand, bg.id, updatedParticipants).allowed && 
                     cand.convoyName && currentGroups.has(cand.convoyName);
            });
          }
          
          // Fallback if no matching group or rule not applied
          if (candidateIndex === -1) {
            candidateIndex = unassigned.findIndex((cand) => {
              return canAssignToBungalow(cand, bg.id, updatedParticipants).allowed;
            });
          }

          if (candidateIndex !== -1) {
            const candidate = unassigned[candidateIndex];

            // Apply assignment
            const pIdx = updatedParticipants.findIndex(
              (p) => p.id === candidate.id,
            );
            updatedParticipants[pIdx] = {
              ...updatedParticipants[pIdx],
              bungalowId: bg.id,
              bedNumber: bed,
              status: "Kampta",
              checkedIn: true,
              checkInTime: new Date().toISOString().slice(0, 19),
            };
            unassigned.splice(candidateIndex, 1);
            count++;
          }
        }
      }
    }

    onUpdateParticipants(updatedParticipants);
    onAddLog(
      "Akıllı Yerleştirme",
      `Seçili kurallara göre ${count} katılımcı otomatik olarak odalara yerleştirildi.`,
    );
    
    setIsAllocating(false);
    setShowSmartAllocationModal(false);
  };

  const handleExecuteMassEmpty = () => {
    let emptyCount = 0;
    const updatedParticipants = participants.map((p) => {
      // Is this participant assigned to a bungalow in the current center?
      if (!p.bungalowId) return p;
      const bung = bungalows.find((b) => b.id === p.bungalowId);
      if (bung?.campCenterId !== selectedCenterId) return p; // not in this center

      // If we are filtering by period
      if (emptyPeriodId !== "All" && p.campPeriodId !== emptyPeriodId) {
        return p; // skip if doesn't match the selected period
      }

      emptyCount++;
      return { ...p, bungalowId: null, bedNumber: null };
    });

    if (emptyCount === 0) {
      alert("Seçilen kritere uygun boşaltılacak kayıt bulunamadı.");
      return;
    }

    onUpdateParticipants(updatedParticipants);
    setShowEmptyModal(false);
    onAddLog(
      "Toplu Boşaltma",
      `${emptyCount} kişinin bungalow yerleşimi iptal edildi.`,
    );
  };

  const handleBulkCapacityChange = (targetCapacity: number) => {
    let updatedParticipants = [...participants];
    let updatedBungalows = [...bungalows];
    let modifiedBungalowCount = 0;
    let ejectedParticipantCount = 0;

    updatedBungalows = updatedBungalows.map(bg => {
      if (bg.campCenterId !== selectedCenterId || bg.type !== 'Standart') return bg;
      
      const newCapacity = targetCapacity;
      const newClosedBeds = targetCapacity === 4 ? [5, 6] : [];

      if (bg.capacity !== newCapacity || bg.closedBeds?.toString() !== newClosedBeds.toString()) {
        
        // Find participants to eject if we are closing beds
        const occupantsToEject = updatedParticipants.filter(p => p.bungalowId === bg.id && p.bedNumber && newClosedBeds.includes(p.bedNumber));
        if (occupantsToEject.length > 0) {
          ejectedParticipantCount += occupantsToEject.length;
          updatedParticipants = updatedParticipants.map(p => {
            if (p.bungalowId === bg.id && p.bedNumber && newClosedBeds.includes(p.bedNumber)) {
              return { ...p, bungalowId: null, bedNumber: null };
            }
            return p;
          });
        }
        
        modifiedBungalowCount++;
        return { ...bg, capacity: newCapacity, closedBeds: newClosedBeds };
      }
      return bg;
    });

    if (modifiedBungalowCount > 0) {
      setBulkCapacityConfirm({
        isOpen: true,
        newCapacity: targetCapacity, // For display
        modifiedBungalowCount,
        ejectedParticipantCount,
        updatedParticipants,
        updatedBungalows
      });
    } else {
      alert("Odalar zaten bu kapasitede.");
    }
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

      newGenerated.push({
        id: `DUMMY-${baseId}-${i}`,
        name: fullName,
        identityNumber: tcNumber,
        birthDate: birthDate,
        gender: gender,
        category: "Lise",
        phone: "+90 555 000 00 00",
        email: `test${i}@example.com`,
        status: "Onaylandı",
        bungalowId: null,
        bedNumber: null,
        allergies: "Yok",
        chronicDiseases: "Yok",
        medications: "Yok",
        healthNote: "Yok",
        consentReceived: true,
        kvkkSigned: true,
        groupId: null,
        checkedIn: false,
      });
    }

    onUpdateParticipants([...participants, ...newGenerated]);
    onAddLog(
      "Sistem Testi",
      `Bungalov yerleşim algoritması testi için 100 adet onaylanmış temsili katılımcı sisteme eklendi.`,
    );
    alert(
      "100 temsili katılımcı başarıyla eklendi! Artık Akıllı Otomatik Yerleştirme ile bu kişileri odalara dağıtabilirsiniz.",
    );
  };

  const selectedBungalow = bungalows.find((b) => b.id === selectedBungalowId);
  const selectedOccupants = selectedBungalowId
    ? getOccupants(selectedBungalowId)
    : [];

  const centerOccupantsCount = participants.filter(
    (p) => p.bungalowId && centerBungalows.some((b) => b.id === p.bungalowId),
  ).length;

  const totalCapacity = centerBungalows.reduce((sum, b) => {
    const closedCount = b.closedBeds ? b.closedBeds.length : 0;
    const capacity = b.capacity - closedCount;
    return sum + capacity;
  }, 0);
  const emptyBedsCount = totalCapacity - centerOccupantsCount;

  return (
    <div className="space-y-6" id="bungalow-management-root">
      {/* Header and Smart Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-sans">
            <Home className="w-5 h-5 text-emerald-600" />
            Bungalov Konaklama Kontrolü
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-gray-500 mt-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Kapasite: <span className="text-gray-900 font-extrabold">{totalCapacity}</span>
            </span>
            <span className="text-gray-300 hidden xs:inline">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Dolu: <span className="text-blue-700 font-extrabold">{centerOccupantsCount}</span>
            </span>
            <span className="text-gray-300 hidden xs:inline">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Boş: <span className="text-emerald-700 font-extrabold">{emptyBedsCount}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 self-stretch sm:self-auto shrink-0">
          <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1 mr-1">
            <button
              onClick={() => handleBulkCapacityChange(4)}
              className="px-3 py-1.5 rounded-md text-xs font-bold text-gray-700 hover:bg-white hover:shadow-sm transition"
              title="Tüm bungalovları 4 yataklı düzene geçirir"
            >
              4'lü Düzen
            </button>
            <button
              onClick={() => handleBulkCapacityChange(6)}
              className="px-3 py-1.5 rounded-md text-xs font-bold text-gray-700 hover:bg-white hover:shadow-sm transition"
              title="Tüm bungalovları 6 yataklı düzene geçirir"
            >
              6'lı Düzen
            </button>
          </div>
          {isDeleteMode ? (
            <>
              <button
                onClick={() => {
                  if (selectedBungalowIds.length === 0) {
                    alert("Lütfen silmek istediğiniz bungalovları aşağıdaki bungalov gridinden tıklayarak seçiniz.");
                    return;
                  }
                  handleDeleteSelectedBungalows();
                }}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm ${
                  selectedBungalowIds.length === 0
                    ? "bg-gray-100 text-gray-400 hover:bg-gray-200 border border-gray-200"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Seçilen Bungalovları Sil ({selectedBungalowIds.length})
              </button>

              <button
                onClick={() => {
                  setIsDeleteMode(false);
                  setSelectedBungalowIds([]);
                }}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer border border-gray-200"
              >
                Vazgeç
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleAdd100Participants}
                className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                title="100 Onaylı Temsili Katılımcı Ekle"
              >
                <UserPlus className="w-4 h-4" />
                100 Test Katılımcı Ekle
              </button>

              <div className="flex items-center rounded-lg border border-emerald-200 shadow-3xs overflow-hidden">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-emerald-50 text-emerald-750 hover:bg-emerald-100 px-3 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border-r border-emerald-200"
                  title="Yeni Bungalov Ekle"
                >
                  <Plus className="w-4 h-4" />
                  Ekle
                </button>
                <button
                  onClick={() => setIsDeleteMode(true)}
                  className="bg-emerald-50 text-emerald-750 hover:bg-emerald-100 hover:text-red-700 px-3 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Bungalov Sil"
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </button>
              </div>

              <button
                onClick={() => {
                  setPrintBungalowId(null);
                  setSelectedPrintBungalowIds(centerBungalows.map(b => b.id));
                  setIsPrintModalOpen(true);
                }}
                className="bg-emerald-50 text-emerald-750 hover:bg-emerald-100 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border border-emerald-200 shadow-3xs"
                title="Bungalov Yerleşim Düzeni"
              >
                <Printer className="w-4 h-4" />
                Yerleşim Düzeni
              </button>

              <button
                onClick={() => setShowEmptyModal(true)}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 cursor-pointer shadow-sm"
              >
                <UserMinus className="w-4 h-4" />
                Toplu Boşalt
              </button>

              <button
                onClick={() => setShowSmartAllocationModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:from-emerald-700 hover:to-teal-700 flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                Akıllı Otomatik Yerleştirme
              </button>
            </>
          )}
        </div>
      </div>

      {/* Arama Çubuğu (Search Bar) */}
      <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-emerald-600" />
          </div>
          <input
            type="text"
            placeholder="İsme ve kamp grubuna (kafileye) göre konaklama araması yapın..."
            value={accommodationSearchTerm}
            onChange={(e) => setAccommodationSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-gray-400"
          />
          {accommodationSearchTerm && (
            <button
              onClick={() => setAccommodationSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition cursor-pointer"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {accommodationSearchTerm && (() => {
          const matchedCount = participants.filter(p => p.bungalowId && isParticipantMatched(p)).length;
          return (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg shrink-0 animate-pulse">
              {matchedCount} eşleşen yatak bulundu
            </span>
          );
        })()}
      </div>

      {/* Bungalow Occupants Preview Modal (Single Click) */}
      {previewBungalowId && (() => {
        const bg = bungalows.find((b) => b.id === previewBungalowId);
        if (!bg) return null;
        const occupants = getOccupants(bg.id);
        const filledCount = occupants.length;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-205">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-205">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-none">
                      {bg.name} Sakinleri
                    </h3>
                    <p className="text-3xs text-gray-500 mt-1 font-semibold">
                      Kapasite: {bg.capacity} Kişi | Konum: {bg.type} Blok
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewBungalowId(null)}
                  className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase">
                    YATAK YERLEŞİM LİSTESİ
                  </span>
                  <span className="text-2xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                    {filledCount} / {bg.capacity} Dolu
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {bg.isClosed ? <div className="col-span-3 text-[7px] font-bold text-center text-gray-400 py-1">KULLANIM DIŞI</div> : Array.from({ length: bg.capacity }).map((_, idx) => {
                    const bedNum = idx + 1;
                    if (bg.closedBeds?.includes(bedNum)) return null;
                    const occupier = occupants.find((o) => o.bedNumber === bedNum);

                    return (
                      <div
                        key={bedNum}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 text-xs bg-gray-50/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-3xs ${
                              occupier
                                ? occupier.gender === "Kadın"
                                  ? "bg-pink-100 text-pink-700"
                                  : "bg-blue-100 text-blue-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {bedNum}
                          </span>
                          <div>
                            {occupier ? (
                              <div>
                                <p className="font-bold text-gray-800 leading-tight">
                                  {occupier.name}
                                </p>
                                <p className="text-3xs font-mono text-gray-400 mt-0.5">
                                  {occupier.gender} | T.C.: {occupier.identityNumber.slice(0, 3)}****
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Boş Yatak</span>
                            )}
                          </div>
                        </div>

                        {occupier && (
                          <span className="text-4xs font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-sm">
                            {periods.find((p) => p.id === occupier.campPeriodId)?.name || occupier.campPeriodId}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => {
                    setPrintBungalowId(bg.id);
                    setIsPrintModalOpen(true);
                  }}
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-lg transition text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-emerald-150 shadow-3xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Yerleşim Düzeni
                </button>

                <button
                  onClick={() => setPreviewBungalowId(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition text-xs cursor-pointer ml-auto"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Mass Empty Modal */}
      {showEmptyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <UserMinus className="w-4 h-4 text-red-600" />
                Toplu Boşaltma İşlemi
              </h3>
              <button
                onClick={() => setShowEmptyModal(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-gray-700">
              <p>
                Hangi döneme ait katılımcıların oda yerleşimlerini iptal etmek
                istiyorsunuz?
              </p>

              <div className="space-y-1">
                <label className="text-4xs text-gray-400 font-black uppercase block">
                  Kamp Dönemi Seçimi
                </label>
                <select
                  value={emptyPeriodId}
                  onChange={(e) => setEmptyPeriodId(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-250 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                >
                  <option value="All">Tüm Dönemleri Boşalt</option>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed">
                  Bu işlem seçili kritere uyan tüm katılımcıları odalardan
                  çıkaracaktır. İşlem geri alınamaz.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setShowEmptyModal(false)}
                className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-lg transition text-xs"
              >
                İptal
              </button>
              <button
                onClick={handleExecuteMassEmpty}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow-sm hover:bg-red-700 transition flex items-center gap-1.5 text-xs"
              >
                Boşaltmayı Başlat
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* Bulk Capacity Confirmation Modal */}
      {bulkCapacityConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Düzen Değişikliği Onayı</h3>
            <p className="text-sm text-gray-600 mb-4">
              {bulkCapacityConfirm.modifiedBungalowCount} bungalovun kapasitesi {bulkCapacityConfirm.newCapacity}'e düşürüldü.
              {bulkCapacityConfirm.ejectedParticipantCount > 0 && (
                <span className="block mt-2 text-red-600 font-bold">
                  ⚠️ {bulkCapacityConfirm.ejectedParticipantCount} katılımcı yerinden çıkarıldı!
                </span>
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setBulkCapacityConfirm(null)}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  onUpdateBungalows(bulkCapacityConfirm.updatedBungalows);
                  onUpdateParticipants(bulkCapacityConfirm.updatedParticipants);
                  setBulkCapacityConfirm(null);
                }}
                className="px-4 py-2 text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition"
              >
                Onayla ve Uygula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print / PDF Export Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200 no-print">
          {/* Dynamic print style injection */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              .print-document-container, .print-document-container * {
                visibility: visible !important;
              }
              .print-document-container {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 1.2cm !important;
                background: white !important;
                color: black !important;
                z-index: 999999 !important;
                box-shadow: none !important;
              }
              ${printPageBreak ? `
              .print-bungalow-card {
                page-break-after: always !important;
                break-after: page !important;
                margin-bottom: 0 !important;
                border-bottom: none !important;
              }
              ` : `
              .print-bungalow-card {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              `}
              .no-print {
                display: none !important;
              }
            }
          `}} />

          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 overflow-hidden border border-gray-150 animate-in zoom-in-95 duration-200 flex flex-col h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-150 bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base leading-none">
                    Yerleşim Düzeni Baskı & PDF Paneli
                  </h3>
                  <p className="text-3xs text-gray-500 mt-1 font-semibold">
                    Yazıcı dostu sayfa düzeni hazırlayabilir, PDF olarak kaydedebilir veya doğrudan yazdırabilirsiniz.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPrintModalOpen(false);
                  setPrintBungalowId(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content (Split Screen) */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              
              {/* Left Panel: Settings & Control (1/3 width) */}
              <div className="w-full md:w-80 bg-gray-50/70 p-4 border-r border-gray-150 overflow-y-auto space-y-4 shrink-0 flex flex-col">
                <div className="space-y-3.5 flex-1">
                  
                  {/* Custom Title Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                      Kamp Grubu Adı / Başlık
                    </label>
                    <input
                      type="text"
                      value={printCustomTitle}
                      onChange={(e) => setPrintCustomTitle(e.target.value)}
                      placeholder="Örn: 2026 YEŞİL HİLAY YAZ KAMPI"
                      className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-bold text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Period Filter Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                      Kamp Dönemi Filtresi
                    </label>
                    <select
                      value={printPeriodId}
                      onChange={(e) => setPrintPeriodId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-255 bg-white rounded-lg text-xs font-bold text-gray-700 focus:outline-none"
                    >
                      <option value="All">Tüm Dönemler</option>
                      {periods.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Page Break Option */}
                  <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-700">Her Bungalov Yeni Sayfada</span>
                      <button
                        type="button"
                        onClick={() => setPrintPageBreak(!printPageBreak)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                          printPageBreak ? "bg-emerald-600" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                            printPageBreak ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-[9px] text-gray-400 font-medium leading-normal">
                      Aktif edildiğinde, her bir bungalov için yazıcıda ayrı bir A4 sayfası ayrılır. Pasif durumda ise ardışık olarak yazdırılır.
                    </p>
                  </div>

                  {/* Selection Mode & Bungalow Checklist (if printing multiple) */}
                  {printBungalowId === null && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          Baskı Alınacak Odalar
                        </label>
                        <div className="flex gap-1.5 text-[9px] font-extrabold text-emerald-700">
                          <button
                            type="button"
                            onClick={() => setSelectedPrintBungalowIds(centerBungalows.map(b => b.id))}
                            className="hover:underline cursor-pointer"
                          >
                            Tümünü Seç
                          </button>
                          <span>|</span>
                          <button
                            type="button"
                            onClick={() => setSelectedPrintBungalowIds([])}
                            className="hover:underline cursor-pointer"
                          >
                            Kaldır
                          </button>
                        </div>
                      </div>

                      {/* Filter Quick Buttons */}
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const withOccupants = centerBungalows.filter(b => getOccupants(b.id).length > 0).map(b => b.id);
                            setSelectedPrintBungalowIds(withOccupants);
                          }}
                          className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-[9px] font-bold text-gray-600 rounded cursor-pointer"
                        >
                          Sadece Dolu Odalar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const stds = centerBungalows.filter(b => b.type === 'Standart').map(b => b.id);
                            setSelectedPrintBungalowIds(stds);
                          }}
                          className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-[9px] font-bold text-gray-600 rounded cursor-pointer"
                        >
                          Sadece Standartlar
                        </button>
                      </div>

                      {/* Scrollable list */}
                      <div className="border border-gray-250 bg-white rounded-lg max-h-[180px] overflow-y-auto p-1.5 space-y-1">
                        {centerBungalows.map((bg) => {
                          const occCount = getOccupants(bg.id).length;
                          const isChecked = selectedPrintBungalowIds.includes(bg.id);
                          return (
                            <label
                              key={bg.id}
                              className={`flex items-center justify-between p-1.5 rounded-md text-[11px] font-semibold cursor-pointer transition ${
                                isChecked ? "bg-emerald-50/55 text-emerald-950" : "hover:bg-gray-50 text-gray-600"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPrintBungalowIds([...selectedPrintBungalowIds, bg.id]);
                                    } else {
                                      setSelectedPrintBungalowIds(selectedPrintBungalowIds.filter(id => id !== bg.id));
                                    }
                                  }}
                                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 shrink-0"
                                />
                                <span className="truncate">{bg.name}</span>
                              </div>
                              <span className="text-3xs font-bold text-gray-400 shrink-0">
                                {occCount} / {bg.capacity} Yatak
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>

                {/* Print Action Buttons */}
                <div className="pt-3 border-t border-gray-200 space-y-2 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrintLayout}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition duration-150 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    PDF Kaydet / Yazdır
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPrintModalOpen(false);
                      setPrintBungalowId(null);
                    }}
                    className="w-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
                  >
                    Kapat
                  </button>
                </div>

              </div>

              {/* Right Panel: Live Document PDF Preview (2/3 width) */}
              <div className="flex-1 bg-gray-200 p-6 overflow-y-auto flex justify-center">
                
                {/* Visual A4 Sheet Paper Preview */}
                <div className="bg-white text-gray-900 w-full max-w-[21cm] p-[1.5cm] rounded-lg shadow-xl border border-gray-300 min-h-[29.7cm] flex flex-col print-document-container text-xs leading-normal">
                  
                  {/* Paper Header Block */}
                  <div className="border-b-2 border-emerald-800 pb-4 mb-5 flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-3xs">
                        <svg viewBox="0 0 100 100" className="w-8 h-8">
                          <path d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z" fill="#00AB41" />
                        </svg>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black tracking-widest text-emerald-800 uppercase block leading-none">T.C. YEŞİLAY CEMİYETİ</span>
                        <h1 className="text-xs font-black text-gray-900 uppercase mt-0.5">
                          {printCustomTitle || "KAMP GRUBU BUNGALOV YERLEŞİM PLANI"}
                        </h1>
                        <span className="text-[9px] font-bold text-gray-500 uppercase block tracking-wider mt-0.5">
                          Yeşilay Uluslararası Kamp Merkezi
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-[9px] font-bold uppercase text-gray-500 space-y-0.5 shrink-0">
                      <div>Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</div>
                      <div>Dönem: {printPeriodId === "All" ? "Tüm Dönemler" : periods.find(p => p.id === printPeriodId)?.name}</div>
                      <div>Evrak Türü: Yerleşim Düzeni Dökümü</div>
                    </div>
                  </div>

                  {/* Summary / Stats for the sheet */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 border border-gray-150 rounded-lg mb-6 text-[10px] font-bold text-gray-600 uppercase tracking-wider no-print">
                    <div>
                      YAZDIRILACAK BUNGALOV: <span className="text-gray-900 text-xs font-black">{printBungalowId ? 1 : selectedPrintBungalowIds.length} Adet</span>
                    </div>
                    <div>
                      DOLU YATAK SAYISI: <span className="text-blue-700 text-xs font-black">
                        {(() => {
                          const list = printBungalowId ? [printBungalowId] : selectedPrintBungalowIds;
                          return list.reduce((sum, id) => sum + getOccupants(id).length, 0);
                        })()} Kişi
                      </span>
                    </div>
                    <div>
                      TOPLAM KAPASİTE: <span className="text-emerald-700 text-xs font-black">
                        {(() => {
                          const list = printBungalowId ? [printBungalowId] : selectedPrintBungalowIds;
                          return list.reduce((sum, id) => sum + (bungalows.find(b => b.id === id)?.capacity || 0), 0);
                        })()} Yatak
                      </span>
                    </div>
                  </div>

                  {/* Bungalow list for printing */}
                  <div className="space-y-6 flex-1">
                    {(() => {
                      const bungalowIdsToRender = printBungalowId ? [printBungalowId] : selectedPrintBungalowIds;
                      
                      if (bungalowIdsToRender.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-2">
                            <FileText className="w-12 h-12 stroke-[1.5]" />
                            <p className="font-semibold text-xs">Yazdırılacak Bungalov Seçilmedi</p>
                            <p className="text-[10px]">Sol taraftaki listeden bungalovları seçerek yatak planını görüntüleyebilirsiniz.</p>
                          </div>
                        );
                      }

                      return bungalowIdsToRender.map((bgId) => {
                        const bg = bungalows.find(b => b.id === bgId);
                        if (!bg) return null;
                        
                        const occupants = getOccupants(bg.id);
                        
                        // Determine predominant gender for visual cues
                        const girlsCount = occupants.filter(o => o.gender === "Kadın").length;
                        const boysCount = occupants.filter(o => o.gender === "Erkek").length;
                        let genderLabel = "";
                        if (girlsCount > 0 && boysCount === 0) {
                          genderLabel = "Kadın Odası";
                        } else if (girlsCount > 0 && boysCount > 0) {
                          genderLabel = "Karma Oda";
                        }

                        return (
                          <div
                            key={bg.id}
                            className="border border-gray-300 rounded-lg p-4 bg-white space-y-3 print-bungalow-card break-inside-avoid relative"
                          >
                            {/* Bungalow Header */}
                            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                              <div className="space-y-0.5">
                                <h3 className="text-sm font-black text-gray-900 uppercase">
                                  {bg.name}
                                </h3>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-semibold">
                                  <span>{bg.type} Blok</span>
                                  <span>•</span>
                                  <span>Yatak Kapasitesi: {bg.capacity}</span>
                                </div>
                              </div>
                              
                              <div className="text-right flex flex-col items-end gap-1">
                                {genderLabel && (
                                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded border bg-gray-50 border-gray-200 text-gray-600">
                                    {genderLabel}
                                  </span>
                                )}
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                  Doluluk: {occupants.length} / {bg.capacity}
                                </div>
                              </div>
                            </div>

                            {/* Beds Detail Table */}
                            <div className="overflow-hidden border border-gray-200 rounded-md font-sans">
                              <table className="w-full text-left border-collapse text-[11px]">
                                <thead>
                                  <tr className="bg-gray-50 border-b border-gray-250 font-black text-gray-500 uppercase tracking-wider text-[9px]">
                                    <th className="py-2 px-3 w-16 text-center">Yatak No</th>
                                    <th className="py-2 px-3">Katılımcı Adı Soyadı</th>
                                    <th className="py-2 px-3 w-28">Kamp Görevi</th>
                                    <th className="py-2 px-3 w-20 text-center">Cinsiyet</th>
                                    <th className="py-2 px-3 w-32">Kategori / Dönem</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 font-medium text-gray-800">
                                  {bg.isClosed ? (
                                    <tr>
                                      <td colSpan={5} className="py-4 text-center text-xs font-bold text-gray-400 bg-gray-50/50">
                                        KULLANIM DIŞI
                                      </td>
                                    </tr>
                                  ) : Array.from({ length: bg.capacity }).map((_, idx) => {
                                    const bedNum = idx + 1;
                                    const occupier = occupants.find((o) => o.bedNumber === bedNum);

                                    return (
                                      <tr
                                        key={bedNum}
                                        className={occupier ? "hover:bg-gray-50/50" : "bg-gray-50/20 italic text-gray-400"}
                                      >
                                        <td className="py-2 px-3 text-center border-r border-gray-200">
                                          <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-[10px] ${
                                            occupier
                                              ? "bg-gray-100 text-gray-800 border border-gray-300"
                                              : "bg-gray-50 text-gray-400 border border-gray-200 border-dashed"
                                          }`}>
                                            {bedNum}
                                          </span>
                                        </td>
                                        <td className="py-2 px-3 font-bold text-gray-900">
                                          {occupier ? occupier.name : "BOŞ YATAK"}
                                        </td>
                                        <td className="py-2 px-3 text-gray-700 font-semibold text-[10px]">
                                          {occupier ? (occupier.duty || "Katılımcı") : "-"}
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                          {occupier ? (
                                            <span className="text-[10px] font-semibold text-gray-700">
                                              {occupier.gender}
                                            </span>
                                          ) : "-"}
                                        </td>
                                        <td className="py-2 px-3 text-gray-500 truncate max-w-[120px] text-[10px]">
                                          {occupier ? (
                                            <div className="space-y-0.5">
                                              <span className="font-bold text-gray-700">{occupier.category || "Katılımcı"}</span>
                                              <span className="block text-[8px] font-medium text-gray-400 truncate">
                                                {periods.find(p => p.id === occupier.campPeriodId)?.name || "Dönem Belirtilmemiş"}
                                              </span>
                                            </div>
                                          ) : "-"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Paper Footer Block */}
                  <div className="border-t border-gray-300 pt-3 mt-6 flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    <span>Yeşil Hilal KYS Yerleşim Sistemi</span>
                    <span>Sayfa Sonu</span>
                    <span>İmza Sorumlusu: .......................</span>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Inline Bungalow Addition Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddBungalowSubmit}
          className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4 animate-fade-in text-xs"
        >
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Yeni Odalı Bungalov Tanımla (Kamp: {selectedCenterId})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 font-extrabold text-xs"
            >
              Kapat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-4xs text-gray-400 font-black uppercase block">
                Bungalov / Oda Adı
              </label>
              <input
                type="text"
                placeholder="Örn: STD-31"
                value={newBungalowName}
                onChange={(e) => setNewBungalowName(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded text-xs focus:outline-emerald-600 font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-4xs text-gray-400 font-black uppercase block">
                Yatak Kapasitesi (Kişi)
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={newBungalowCapacity}
                onChange={(e) =>
                  setNewBungalowCapacity(parseInt(e.target.value) || 6)
                }
                className="w-full p-2 border border-gray-200 rounded text-xs font-bold focus:outline-emerald-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:underline text-2xs cursor-pointer font-bold"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-2xs font-extrabold hover:bg-emerald-800 transition shadow-xs cursor-pointer"
            >
              Odayı Envantere Ekle
            </button>
          </div>
        </form>
      )}

      <div
        className={`grid grid-cols-1 gap-6 ${showLedger ? "xl:grid-cols-4 lg:grid-cols-3" : "w-full"}`}
      >
        {/* Room Grid Column */}
        <div
          className={
            showLedger
              ? "xl:col-span-3 lg:col-span-2 space-y-4"
              : "w-full space-y-4"
          }
        >
          {/* Filter Row */}
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-3xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowOnlyWithEmptyBeds(!showOnlyWithEmptyBeds)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-3xs font-bold transition-all cursor-pointer ${
                  showOnlyWithEmptyBeds
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-3xs"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                }`}
                title="Sadece boş yatağı olan odaları göster"
              >
                <span className={`w-1.5 h-1.5 rounded-full bg-current ${showOnlyWithEmptyBeds ? "" : "animate-pulse"}`}></span>
                Sadece Boş Yataklılar ({emptyBedsCount} Boş Yatak)
                {showOnlyWithEmptyBeds && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
              </button>
            </div>
          </div>

          {(() => {
            const emptyBungalowsCount = centerBungalows.filter(
              (bg) => getOccupants(bg.id).length < bg.capacity,
            ).length;
            if (emptyBungalowsCount <= 2 && emptyBungalowsCount > 0) {
              return (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-xs font-bold border border-red-200 shadow-sm animate-pulse">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  Uyarı: Kamp merkezinde yerleşime uygun sadece{" "}
                  {emptyBungalowsCount} adet boş/kısmi boş bungalov kaldı!
                </div>
              );
            }
            if (emptyBungalowsCount === 0 && centerBungalows.length > 0) {
              return (
                <div className="bg-red-600 text-white p-3 rounded-lg flex items-center gap-2 text-xs font-bold shadow-sm">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  Kamp merkezindeki tüm bungalovlar tamamen dolu!
                </div>
              );
            }
            return null;
          })()}

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10 gap-1.5">
            {filteredBungalows.map((bg) => {
              const occupants = getOccupants(bg.id);
              const filledCount = occupants.length;
              const risks = analyzeBungalowRisks(occupants);
              const hasRisks = risks.length > 0;
              const isFull = filledCount === bg.capacity;
              const hasMatchedOccupant = occupants.some((o) => isParticipantMatched(o));

              // Determine gender color indicator of the room
              let roomGenderTheme = "border-gray-200 bg-white";
              if (bg.isClosed) {
                roomGenderTheme = "border-gray-400 bg-gray-200 opacity-60 text-gray-500 shadow-inner";
              } else if (isFull) {
                roomGenderTheme =
                  "border-red-600 bg-red-500 text-white shadow-sm";
              } else if (filledCount > 0) {
                const firstUser = occupants[0];
                roomGenderTheme =
                  firstUser.gender === "Kadın"
                    ? "border-pink-200 bg-pink-50/20"
                    : "border-blue-200 bg-blue-50/20";
              }

              return (
                <div
                   key={bg.id}
                   onClick={() => {
                     if (isDeleteMode) {
                       if (selectedBungalowIds.includes(bg.id)) {
                         setSelectedBungalowIds(selectedBungalowIds.filter((id) => id !== bg.id));
                       } else {
                         setSelectedBungalowIds([...selectedBungalowIds, bg.id]);
                       }
                     } else {
                       const now = Date.now();
                       const lastClick = lastBungalowClickRef.current;
                       
                       if (lastClick && lastClick.id === bg.id) {
                         const diff = now - lastClick.time;
                         if (diff < 80) {
                           // Ignore ghost/duplicate click event from touch translation
                           return;
                         }
                         if (diff < 350) {
                           // Real double click detected!
                           if (clickTimeoutRef.current) {
                             window.clearTimeout(clickTimeoutRef.current);
                             clickTimeoutRef.current = null;
                           }
                           setSelectedBungalowId(bg.id);
                           setAssignTarget(null);
                           setPreviewBungalowId(null);
                           lastBungalowClickRef.current = null;
                           return;
                         }
                       }
                       
                       // Single click candidate
                       lastBungalowClickRef.current = { id: bg.id, time: now };
                       if (clickTimeoutRef.current) {
                         window.clearTimeout(clickTimeoutRef.current);
                       }
                       clickTimeoutRef.current = window.setTimeout(() => {
                         clickTimeoutRef.current = null;
                         setPreviewBungalowId(bg.id);
                       }, 250);
                     }
                   }}
                   onDoubleClick={() => {
                     if (!isDeleteMode) {
                       if (clickTimeoutRef.current) {
                         window.clearTimeout(clickTimeoutRef.current);
                         clickTimeoutRef.current = null;
                       }
                       setSelectedBungalowId(bg.id);
                       setAssignTarget(null);
                       setPreviewBungalowId(null);
                     }
                   }}
                   title={isDeleteMode ? "Seçmek için tıklayın" : "Sakinleri görmek için tıklayın, Yatak düzeni için çift tıklayın"}
                   className={`p-1.5 rounded-[4px] border cursor-pointer transition-all hover:scale-[1.02] relative ${roomGenderTheme} ${
                     isDeleteMode
                       ? selectedBungalowIds.includes(bg.id)
                         ? "ring-2 ring-red-500 shadow-md bg-red-50/10 border-red-500"
                         : "opacity-75 hover:opacity-100"
                       : hasMatchedOccupant
                         ? "ring-2 ring-green-500 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)] animate-pulse"
                         : selectedBungalowId === bg.id
                           ? "ring-2 ring-emerald-500 shadow-md"
                           : ""
                   }`}
                 >
                   <div className="flex justify-between items-center mb-1">
                     <div className="flex items-center gap-1 min-w-0">
                       {isDeleteMode && (
                         <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border transition ${
                           selectedBungalowIds.includes(bg.id)
                             ? "bg-red-600 border-red-600 text-white"
                             : "border-gray-350 bg-white"
                         }`}>
                           {selectedBungalowIds.includes(bg.id) && (
                             <Check className="w-2.5 h-2.5 stroke-[4px]" />
                           )}
                         </div>
                       )}
                       <span
                         className={`font-bold text-[8px] ${bg.isClosed ? "text-gray-500" : isFull && !hasMatchedOccupant ? "text-white" : "text-gray-800"} leading-none truncate`}
                       >
                         {bg.id}
                       </span>
                       {hasRisks && <AlertTriangle className="w-2.5 h-2.5 text-amber-500 ml-0.5 shrink-0" />}
                     </div>
                     <span
                       className={`text-[7px] font-bold ${isFull && !hasMatchedOccupant ? "text-red-100" : "text-gray-500"} font-mono shrink-0`}
                     >
                       {bg.isClosed ? "KAPALI" : `${filledCount}/${bg.capacity}`}
                     </span>
                   </div>
 
                   {/* Bed visual bubbles */}
                   <div className="grid grid-cols-3 gap-0.5 mt-1">
                     {bg.isClosed ? <div className="col-span-3 text-[7px] font-bold text-center text-gray-400 py-1">KULLANIM DIŞI</div> : Array.from({ length: bg.capacity }).map((_, idx) => {
                       const bedNum = idx + 1;
                       const occupier = occupants.find(
                         (o) => o.bedNumber === bedNum,
                       );
                       const isMatched = occupier ? isParticipantMatched(occupier) : false;
                       return (
                         <div
                           key={bedNum}
                           className={`aspect-square rounded-[2px] flex items-center justify-center text-[6px] font-bold ${
                             isMatched
                               ? "bg-green-500 text-white shadow-[0_0_8px_#22c55e] border border-green-600 font-black animate-pulse"
                               : occupier
                                 ? isFull
                                   ? "bg-red-700 text-red-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
                                   : occupier.gender === "Kadın"
                                     ? "bg-pink-500 text-white"
                                     : "bg-blue-500 text-white"
                                 : isFull
                                   ? "bg-red-400 text-red-200 border border-dashed border-red-300"
                                   : "bg-gray-100 text-gray-300 border border-dashed border-gray-200"
                           }`}
                           title={
                             occupier
                               ? `${bedNum}. Yatak: ${occupier.name}${isMatched ? " (Aranan Katılımcı)" : ""}`
                               : `${bedNum}. Yatak Boş`
                           }
                         >
                           {bedNum}
                         </div>
                       );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Guides and Policy (Placed under the grid for reference) */}
          <div className="mt-4 bg-white p-4 rounded-xl border border-gray-100 shadow-3xs text-3xs text-gray-500 space-y-2">
            <span className="font-bold text-gray-600 block uppercase tracking-wider text-2xs">
              Bungalov Renk Kodları ve Kuralları
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-pink-500 inline-block"></span>
                <span className="font-semibold text-gray-700">Kadın Katılımcı Oturumu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block"></span>
                <span className="font-semibold text-gray-700">Erkek Katılımcı Oturumu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded border border-dashed border-gray-300 bg-white inline-block"></span>
                <span className="font-semibold text-gray-700">Boş ve Müsait Yatak</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-red-600 inline-block"></span>
                <span className="font-semibold text-gray-700">Bungalov Tamamen Dolu</span>
              </div>
            </div>
            <p className="text-[10px] text-emerald-800 font-medium bg-emerald-50/50 p-2 rounded border border-emerald-100 flex items-start gap-1.5 mt-2">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Güvenlik İlkesi:</strong> Standart odalarda karma cinsiyet kesinlikle engellenir. Bir yatağa yerleşim veya taşıma yapıldığında otomatik olarak mevcut oda sakinleri ile cinsiyet kontrolü yapılır.
              </span>
            </p>
          </div>
        </div>

        {/* Selected Bungalow Cabin Details Column - Removed inline and moved to modal */}
        {false && (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm self-start">
          {selectedBungalow ? (
            <div className="space-y-4">
              <div className="border-b pb-3 border-gray-150 flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-gray-400 prose">
                    Seçili Bungalov
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-0.5">
                    {selectedBungalow.name}
                  </h3>
                  <p className="text-2xs text-gray-500 mt-1 font-semibold flex items-center gap-1">
                    Kapasite: {selectedBungalow.capacity} Kişilik | Konum:{" "}
                    {selectedBungalow.type} Blok
                  </p>
                </div>
              </div>

              {/* Beds list */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-2xs font-extrabold text-gray-400 tracking-wider uppercase">
                    Yerleşim Düzeni ve Katılımcılar
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowLedger(!showLedger)}
                      className={`text-[9px] px-2 py-1 rounded font-bold transition flex items-center gap-1 ${showLedger ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      title="Katılımcı Defterini Aç/Kapat"
                    >
                      <BookOpen className="w-3 h-3" /> Defter
                    </button>
                    <button
                      onClick={fillCurrentBungalow}
                      className="text-[9px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded font-bold transition flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" /> Tümünü Yerleştir
                    </button>
                  </div>
                </div>

                {movingParticipantId && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-3xs text-amber-800 flex items-center justify-between font-semibold animate-pulse">
                    <span>
                      ⚠️ Yatak Değiştirme Aktif: Taşımak istediğiniz hedef yatağı veya takas etmek istediğiniz katılımcıyı seçin.
                    </span>
                    <button 
                      onClick={() => setMovingParticipantId(null)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold transition ml-2 shrink-0 cursor-pointer"
                    >
                      Vazgeç
                    </button>
                  </div>
                )}

                {Array.from({ length: selectedBungalow.capacity }).map(
                  (_, idx) => {
                    const bedNum = idx + 1;
                    const occupant = selectedOccupants.find(
                      (o) => o.bedNumber === bedNum,
                    );

                    return (
                      <div
                        key={bedNum}
                        data-bed-number={bedNum}
                        draggable={!!occupant}
                        onDragStart={(e) => {
                          if (occupant) {
                            setDraggedParticipantId(occupant.id);
                            e.dataTransfer.effectAllowed = "move";
                          }
                        }}
                        onDragEnd={() => {
                          setDraggedParticipantId(null);
                          setDragOverBedNum(null);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (draggedParticipantId) {
                            setDragOverBedNum(bedNum);
                          }
                        }}
                        onDragLeave={() => {
                          if (dragOverBedNum === bedNum) {
                            setDragOverBedNum(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedParticipantId) {
                            handleMoveBed(draggedParticipantId, bedNum);
                          }
                          setDraggedParticipantId(null);
                          setDragOverBedNum(null);
                        }}
                        onTouchStart={() => {
                          if (occupant) {
                            setDraggedParticipantId(occupant.id);
                          }
                        }}
                        onTouchMove={(e) => {
                          if (!draggedParticipantId) return;
                          const touch = e.touches[0];
                          const element = document.elementFromPoint(touch.clientX, touch.clientY);
                          const bedElement = element?.closest("[data-bed-number]");
                          if (bedElement) {
                            const targetBedNum = parseInt(bedElement.getAttribute("data-bed-number") || "0", 10);
                            if (targetBedNum > 0) {
                              setDragOverBedNum(targetBedNum);
                            }
                          } else {
                            setDragOverBedNum(null);
                          }
                        }}
                        onTouchEnd={() => {
                          if (draggedParticipantId && dragOverBedNum) {
                            handleMoveBed(draggedParticipantId, dragOverBedNum);
                          }
                          setDraggedParticipantId(null);
                          setDragOverBedNum(null);
                        }}
                        style={{ touchAction: draggedParticipantId ? "none" : "auto" }}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all duration-150 ${
                          draggedParticipantId === occupant?.id
                            ? "border-emerald-400 bg-emerald-50/20 opacity-50 scale-95"
                            : dragOverBedNum === bedNum
                              ? "border-emerald-500 bg-emerald-100/50 scale-[1.01] shadow-xs"
                              : movingParticipantId === occupant?.id
                                ? "border-amber-300 bg-amber-50/30"
                                : "border-gray-100 bg-gray-50/50"
                        } ${occupant ? "cursor-grab active:cursor-grabbing hover:border-emerald-200" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          {occupant && (
                            <GripVertical className="w-3.5 h-3.5 text-gray-400 hover:text-emerald-500 shrink-0 cursor-grab" />
                          )}
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-3xs ${
                              occupant
                                ? occupant.gender === "Kadın"
                                  ? "bg-pink-100 text-pink-700"
                                  : "bg-blue-100 text-blue-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {bedNum}
                          </span>
                          <div>
                            {occupant ? (
                              <div>
                                <p
                                  className="font-bold text-gray-800 leading-snug hover:text-emerald-600 hover:underline cursor-pointer transition-colors"
                                  onClick={() =>
                                    onNavigateToParticipant &&
                                    onNavigateToParticipant(occupant.id)
                                  }
                                >
                                  {occupant.name}
                                </p>
                                <p className="text-3xs font-mono text-gray-400 mt-0.5">
                                  {occupant.gender} | T.C.:{" "}
                                  {occupant.identityNumber.slice(0, 3)}****
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">
                                Boş / Yerleştirilmeyi bekliyor
                              </span>
                            )}
                          </div>
                        </div>

                        {occupant ? (
                          <div className="flex items-center gap-1">
                            {movingParticipantId && movingParticipantId !== occupant.id ? (
                              <button
                                onClick={() => handleMoveBed(movingParticipantId, bedNum)}
                                className="bg-amber-500 text-white hover:bg-amber-600 px-2 py-1 rounded text-3xs font-extrabold flex items-center gap-1 transition cursor-pointer"
                                title="Yatakları Karşılıklı Değiştir"
                              >
                                <ArrowUpDown className="w-2.5 h-2.5" />
                                Takas Et
                              </button>
                            ) : movingParticipantId === occupant.id ? (
                              <button
                                onClick={() => setMovingParticipantId(null)}
                                className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-1 rounded text-3xs font-bold transition cursor-pointer"
                              >
                                Vazgeç
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => setMovingParticipantId(occupant.id)}
                                  className="text-amber-600 hover:bg-amber-50 p-1.5 rounded transition cursor-pointer"
                                  title="Yatak Değiştir"
                                >
                                  <ArrowUpDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveParticipant(occupant.id)}
                                  className="text-red-600 hover:bg-red-50 p-1.5 rounded transition cursor-pointer"
                                  title="Yataktan Çıkar"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            {movingParticipantId ? (
                              <button
                                onClick={() => handleMoveBed(movingParticipantId, bedNum)}
                                className="bg-blue-600 text-white hover:bg-blue-700 px-2.5 py-1 rounded text-3xs font-extrabold flex items-center gap-1 transition cursor-pointer animate-pulse"
                                title="Bu Boş Yatağa Taşı"
                              >
                                <ArrowUpDown className="w-2.5 h-2.5" />
                                Buraya Taşı
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setAssignTarget({
                                    bungalowId: selectedBungalow.id,
                                    bedNumber: bedNum,
                                  })
                                }
                                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 p-1.5 rounded-lg transition font-semibold text-3xs flex items-center gap-1 cursor-pointer"
                              >
                                <UserPlus className="w-3 h-3" /> Yerleştir
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>

              {/* Manual Assign Selector Panel */}
              {assignTarget && (
                <div className="p-3.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs space-y-2">
                  <h4 className="font-bold text-yellow-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Katılımcı Seç (Yatak {assignTarget.bedNumber})
                  </h4>

                  <input
                    type="text"
                    placeholder="İsim veya T.C. ile ara..."
                    value={participantSearchTerm}
                    onChange={(e) => setParticipantSearchTerm(e.target.value)}
                    className="w-full p-1.5 border border-yellow-300 rounded text-xs bg-white/70 focus:outline-yellow-500 font-semibold"
                  />

                  {unassignedParticipants.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {unassignedParticipants
                        .filter(
                          (up) =>
                            up.name
                              .toLowerCase()
                              .includes(participantSearchTerm.toLowerCase()) ||
                            up.identityNumber.includes(participantSearchTerm),
                        )
                        .map((up) => (
                          <button
                            key={up.id}
                            onClick={() =>
                              handleAssignParticipant(
                                up.id,
                                assignTarget.bungalowId,
                                assignTarget.bedNumber,
                              )
                            }
                            className="w-full text-left p-1.5 rounded bg-white hover:bg-gray-100 text-2xs flex items-center justify-between border border-yellow-150"
                          >
                            <div>
                              <span className="font-bold text-gray-800">
                                {up.name}
                              </span>
                              <span className="text-[10px] text-gray-400 block">
                                {up.gender} • T.C.:{" "}
                                {up.identityNumber.slice(0, 3)}...
                              </span>
                            </div>
                            <span className="text-3xs font-semibold text-emerald-700 px-1.5 py-0.5 rounded bg-emerald-50">
                              Seç
                            </span>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <p className="text-3xs text-yellow-700 italic">
                      Yerleştirilebilecek yeni onaylanmış katılımcı bulunmuyor.
                    </p>
                  )}
                  <button
                    onClick={() => setAssignTarget(null)}
                    className="text-gray-400 hover:text-gray-600 text-[10px] block font-bold"
                  >
                    Vazgeç
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <Home className="w-12 h-12 text-gray-200 stroke-1 mb-2" />
              <p className="text-xs font-semibold">
                Detayları İncelemek İçin Bir Bungalov Seçin
              </p>
              <p className="text-3xs mt-1">
                Soldaki bento bungalov gridinden merak ettiğiniz bir odayı
                haritadan tıklayabilirsiniz.
              </p>
            </div>
          )}

          {/* Color Guides */}
          <div className="mt-6 border-t pt-4 text-3xs text-gray-500 space-y-1.5">
            <span className="font-bold text-gray-400 block uppercase tracking-wider">
              Renk Kodları ve Kurallar
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-pink-500 inline-block"></span>
              <span>Kadın Katılımcı Oturumu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block"></span>
              <span>Erkek Katılımcı Oturumu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-dashed border-gray-300 bg-white inline-block"></span>
              <span>Boş ve Müsait Yatak</span>
            </div>
            <p className="text-[10px] text-emerald-800 font-medium bg-emerald-50/50 p-2 rounded border border-emerald-100 flex items-start gap-1 mt-3">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Güvenlik İlkesi:</strong> Standart odalarda karma
                cinsiyet kesinlikle engellenir. Bir yatak seçimi yapıldığında
                otomatik olarak mevcut oda sakini ile cinsiyet kontrolü yapılır.
              </span>
            </p>
          </div>
        </div>
        )}

        {/* Ledger Panel */}
        {showLedger && (
          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm self-start lg:col-span-1 xl:col-span-1 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b pb-3 border-gray-150 mb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Katılımcı Defteri
                </h3>
                <p className="text-3xs text-gray-500 mt-0.5">
                  Yerleşim bekleyenler
                </p>
              </div>
              <button
                onClick={() => setShowLedger(false)}
                className="text-gray-400 hover:text-red-500 bg-gray-50 p-1.5 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-3 space-y-2 shrink-0">
              <select
                value={ledgerPeriodId}
                onChange={(e) => setLedgerPeriodId(e.target.value)}
                className="w-full py-1.5 px-2 border border-gray-250 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-gray-50 text-gray-700"
              >
                <option value="All">Tüm Dönemler</option>
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="İsim veya T.C. ile ara..."
                value={participantSearchTerm}
                onChange={(e) => setParticipantSearchTerm(e.target.value)}
                className="w-full p-1.5 border border-gray-250 rounded-lg text-xs bg-gray-50 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {unassignedParticipants
                .filter(
                  (up) =>
                    (ledgerPeriodId === "All" ||
                      up.campPeriodId === ledgerPeriodId) &&
                    (up.name
                      .toLowerCase()
                      .includes(participantSearchTerm.toLowerCase()) ||
                      up.identityNumber.includes(participantSearchTerm)),
                )
                .map((up) => (
                  <div
                    key={up.id}
                    className="p-2.5 border border-gray-200 rounded-lg bg-white shadow-xs hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div
                          className="font-bold text-gray-800 leading-tight text-xs truncate"
                          title={up.name}
                        >
                          {up.name}
                        </div>
                        <div className="text-[9px] text-gray-500 mt-0.5 font-mono">
                          {up.gender} | T.C.: {up.identityNumber.slice(0, 3)}***
                        </div>
                        <div className="text-[9px] font-semibold text-gray-400 mt-0.5 truncate">
                          {periods.find((p) => p.id === up.campPeriodId)
                            ?.name || "Dönem Belirtilmemiş"}
                        </div>
                      </div>
                      {assignTarget ? (
                        <button
                          onClick={() =>
                            handleAssignParticipant(
                              up.id,
                              assignTarget.bungalowId,
                              assignTarget.bedNumber,
                            )
                          }
                          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-2 py-1.5 rounded-md shadow-sm font-bold text-[9px] shrink-0 whitespace-nowrap transition-colors"
                        >
                          Yatak {assignTarget.bedNumber}'e Ata
                        </button>
                      ) : (
                        <div className="text-[9px] text-gray-400 italic text-right whitespace-nowrap px-1">
                          Oda Seçiniz
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              {unassignedParticipants.filter(
                (up) =>
                  ledgerPeriodId === "All" ||
                  up.campPeriodId === ledgerPeriodId,
              ).length === 0 && (
                <div className="text-xs text-gray-400 text-center italic py-4">
                  Bu dönem için uygun katılımcı bulunamadı.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Bed Layout Modification Modal (Double Click) */}
      {selectedBungalowId && (() => {
        const bg = bungalows.find((b) => b.id === selectedBungalowId);
        if (!bg) return null;
        const occupants = getOccupants(bg.id);
        const filledCount = occupants.length;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 flex flex-col h-[85vh]">
              
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <ArrowUpDown className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm md:text-base leading-none">
                      {bg.name} - Yerleşim Düzenleme Paneli
                    </h3>
                    <p className="text-3xs md:text-2xs text-gray-500 mt-1 font-semibold">
                      Kapasite: {bg.capacity} Kişi | Konum: {bg.type} Blok | {filledCount} / {bg.capacity} Dolu
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedBungalowId(null);
                    setAssignTarget(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {analyzeBungalowRisks(occupants).length > 0 && (
                <div className="bg-amber-50 p-3 border-b border-amber-200 shrink-0 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-amber-900 text-xs">Uyumsuzluk Riski Tespit Edildi!</h4>
                  </div>
                  <ul className="list-disc pl-5 text-xs text-amber-800 space-y-0.5 font-medium">
                    {analyzeBungalowRisks(occupants).map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Grid content inside modal */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                
                {/* Left Panel: Beds (3/5 space) */}
                <div className="md:col-span-3 p-5 overflow-y-auto space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase">
                      Yataklar ve Yerleşim Durumu (Sürükle-Bırak Aktif)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={fillCurrentBungalow}
                        className="text-3xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded font-extrabold transition flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Tümünü Yerleştir
                      </button>
                    </div>
                  </div>

                  {movingParticipantId && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-3xs text-amber-800 flex items-center justify-between font-semibold animate-pulse">
                      <span>
                        ⚠️ Yatak Değiştirme Aktif: Taşımak istediğiniz hedef yatağı veya takas etmek istediğiniz katılımcıyı seçin.
                      </span>
                      <button 
                        onClick={() => setMovingParticipantId(null)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold transition ml-2 shrink-0 cursor-pointer"
                      >
                        Vazgeç
                      </button>
                    </div>
                  )}

                  {/* Capacity & Bungalow Deletion Controls inside the Edit panel */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-150 rounded-xl shadow-3xs">
                    <div className="flex items-center gap-2">
                      <span className="text-3xs font-extrabold text-gray-500 uppercase tracking-wider">
                        Kapasiteyi Düzenle:
                      </span>
                      <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden shadow-3xs">
                        <button
                          type="button"
                          onClick={() => {
                            if (bg.capacity <= 1) {
                              alert("Bungalov kapasitesi 1'den az olamaz. Bungalovu silmek için yanındaki 'Sil' butonunu kullanabilirsiniz.");
                              return;
                            }
                            const targetBedNum = bg.capacity;
                            const occupantInTargetBed = occupants.find(o => o.bedNumber === targetBedNum);
                            if (occupantInTargetBed) {
                              setConfirmDialog({
                                isOpen: true,
                                title: "Kapasite Azaltma Onayı",
                                message: `${targetBedNum}. yatakta kayıtlı olan '${occupantInTargetBed.name}' adlı katılımcının yerleşimi iptal edilecektir. Kapasiteyi düşürmek istediğinize emin misiniz?`,
                                confirmText: "Kapasiteyi Düşür",
                                isDanger: true,
                                onConfirm: () => {
                                  const updatedParts = participants.map(p => 
                                    p.id === occupantInTargetBed.id 
                                      ? { ...p, bungalowId: null, bedNumber: null } 
                                      : p
                                  );
                                  onUpdateParticipants(updatedParts);
                                  onUpdateBungalows(bungalows.map(b => b.id === bg.id ? { ...b, capacity: b.capacity - 1 } : b));
                                  onAddLog("Bungalov Kapasitesi Azaltıldı", `'${bg.name}' odasının kapasitesi ${bg.capacity - 1} olarak güncellendi. ${targetBedNum}. yataktaki ${occupantInTargetBed.name} çıkarıldı.`);
                                }
                              });
                            } else {
                              onUpdateBungalows(bungalows.map(b => b.id === bg.id ? { ...b, capacity: b.capacity - 1 } : b));
                              onAddLog("Bungalov Kapasitesi Azaltıldı", `'${bg.name}' odasının kapasitesi ${bg.capacity - 1} olarak güncellendi.`);
                            }
                          }}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold transition text-xs border-r border-gray-150 cursor-pointer"
                          title="Kapasiteyi Azalt"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-black text-xs text-gray-800">
                          {bg.capacity} Yatak
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (bg.capacity >= 12) {
                              alert("Maksimum bungalov kapasitesi 12'dir.");
                              return;
                            }
                            onUpdateBungalows(bungalows.map(b => b.id === bg.id ? { ...b, capacity: b.capacity + 1 } : b));
                            onAddLog("Bungalov Kapasitesi Arttırıldı", `'${bg.name}' odasının kapasitesi ${bg.capacity + 1} olarak güncellendi.`);
                          }}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold transition text-xs border-l border-gray-150 cursor-pointer"
                          title="Yeni Yatak Ekle"
                        >
                          +
                        </button>
                      </div>
                    </div>


                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBungalowStatus(bg.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          bg.isClosed
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        {bg.isClosed ? "Bungalov'u Kullanıma Aç" : "Bungalov'u Kapat"}
                      </button>
                    </div>


                  </div>
                  
                  {bg.isClosed ? (
                    <div className="flex flex-col items-center justify-center p-10 bg-gray-50 border border-gray-200 border-dashed rounded-xl h-48">
                      <Lock className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 font-bold text-sm">Bu bungalov geçici olarak kullanıma kapatılmıştır.</p>
                      <p className="text-gray-400 text-xs mt-1 text-center">Bungalova yerleşim yapmak için önce bungalovu kullanıma açmalısınız.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Array.from({ length: bg.capacity }).map((_, idx) => {
                        const bedNum = idx + 1;
                        const isClosedBed = bg.closedBeds?.includes(bedNum);
                        if (isClosedBed) return null;
                        const occupant = occupants.find((o) => o.bedNumber === bedNum);
                        const isMatched = occupant ? isParticipantMatched(occupant) : false;

                        return (
                        <div
                          key={bedNum}
                          data-bed-number={bedNum}
                          draggable={!!occupant}
                          onDragStart={(e) => {
                            if (occupant) {
                              setDraggedParticipantId(occupant.id);
                              e.dataTransfer.effectAllowed = "move";
                            }
                          }}
                          onDragEnd={() => {
                            setDraggedParticipantId(null);
                            setDragOverBedNum(null);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (draggedParticipantId) {
                              setDragOverBedNum(bedNum);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverBedNum === bedNum) {
                              setDragOverBedNum(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedParticipantId) {
                              const pat = participants.find((p) => p.id === draggedParticipantId);
                              if (pat) {
                                  if (pat.bungalowId) {
                                    // Already in the bungalow, so move bed
                                    handleMoveBed(draggedParticipantId, bedNum);
                                  } else {
                                    // Not in bungalow yet, assign it
                                    handleAssignParticipant(draggedParticipantId, bg.id, bedNum);
                                  }
                              }
                            }
                            setDraggedParticipantId(null);
                            setDragOverBedNum(null);
                          }}
                          onTouchStart={() => {
                            if (occupant) {
                              setDraggedParticipantId(occupant.id);
                            }
                          }}
                          onTouchMove={(e) => {
                            if (!draggedParticipantId) return;
                            const touch = e.touches[0];
                            const element = document.elementFromPoint(touch.clientX, touch.clientY);
                            const bedElement = element?.closest("[data-bed-number]");
                            if (bedElement) {
                              const targetBedNum = parseInt(bedElement.getAttribute("data-bed-number") || "0", 10);
                              if (targetBedNum > 0) {
                                setDragOverBedNum(targetBedNum);
                              }
                            } else {
                              setDragOverBedNum(null);
                            }
                          }}
                          onTouchEnd={() => {
                            if (draggedParticipantId && dragOverBedNum) {
                              const pat = participants.find((p) => p.id === draggedParticipantId);
                              if (pat) {
                                if (pat.bungalowId) {
                                  handleMoveBed(draggedParticipantId, dragOverBedNum);
                                } else {
                                  handleAssignParticipant(draggedParticipantId, bg.id, dragOverBedNum);
                                }
                              }
                            }
                            setDraggedParticipantId(null);
                            setDragOverBedNum(null);
                          }}
                          style={{ touchAction: draggedParticipantId ? "none" : "auto" }}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all duration-150 ${
                            isMatched
                              ? "border-green-500 bg-green-50 shadow-[0_0_10px_rgba(34,197,94,0.15)] ring-1 ring-green-400 font-medium"
                              : draggedParticipantId === occupant?.id
                                ? "border-emerald-400 bg-emerald-50/20 opacity-50 scale-95"
                                : dragOverBedNum === bedNum
                                  ? "border-emerald-500 bg-emerald-100/50 scale-[1.01] shadow-xs"
                                  : movingParticipantId === occupant?.id
                                    ? "border-amber-300 bg-amber-50/30"
                                    : "border-gray-100 bg-gray-50/50"
                          } ${occupant ? "cursor-grab active:cursor-grabbing hover:border-emerald-200" : ""}`}
                        >
                          <div className="flex items-center gap-2.5">
                            {occupant && (
                              <GripVertical className="w-4 h-4 text-gray-400 hover:text-emerald-500 shrink-0 cursor-grab" />
                            )}
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-3xs ${
                                isMatched
                                  ? "bg-green-600 text-white animate-pulse font-black"
                                  : occupant
                                    ? occupant.gender === "Kadın"
                                      ? "bg-pink-100 text-pink-700"
                                      : "bg-blue-100 text-blue-700"
                                    : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {bedNum}
                            </span>
                            <div>
                              {occupant ? (
                                <div>
                                  <p
                                    className="font-bold text-gray-800 leading-snug hover:text-emerald-600 hover:underline cursor-pointer transition-colors"
                                    onClick={() => {
                                      if (onNavigateToParticipant) {
                                        onNavigateToParticipant(occupant.id);
                                        setSelectedBungalowId(null);
                                      }
                                    }}
                                  >
                                    {occupant.name}
                                  </p>
                                  <p className="text-3xs font-mono text-gray-400 mt-0.5">
                                    {occupant.gender} | T.C.: {occupant.identityNumber.slice(0, 3)}****
                                  </p>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">Boş / Yerleştirilmeyi bekliyor</span>
                              )}
                            </div>
                          </div>

                          {occupant ? (
                            <div className="flex items-center gap-1">
                              {movingParticipantId && movingParticipantId !== occupant.id ? (
                                <button
                                  onClick={() => handleMoveBed(movingParticipantId, bedNum)}
                                  className="bg-amber-500 text-white hover:bg-amber-600 px-2 py-1 rounded text-3xs font-extrabold flex items-center gap-1 transition cursor-pointer"
                                  title="Yatakları Karşılıklı Değiştir"
                                >
                                  <ArrowUpDown className="w-2.5 h-2.5" />
                                  Takas Et
                                </button>
                              ) : movingParticipantId === occupant.id ? (
                                <button
                                  onClick={() => setMovingParticipantId(null)}
                                  className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-1 rounded text-3xs font-bold transition cursor-pointer"
                                >
                                  Vazgeç
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setMovingParticipantId(occupant.id)}
                                    className="text-amber-600 hover:bg-amber-50 p-1.5 rounded transition cursor-pointer"
                                    title="Yatak Değiştir"
                                  >
                                    <ArrowUpDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveParticipant(occupant.id)}
                                    className="text-red-600 hover:bg-red-50 p-1.5 rounded transition cursor-pointer"
                                    title="Yataktan Çıkar"
                                  >
                                    <UserMinus className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSpecificBed(bg.id, bedNum)}
                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded transition cursor-pointer"
                                    title="Bu Yatağı Tamamen Sil (Kapasiteyi Düşür)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              {movingParticipantId ? (
                                <button
                                  onClick={() => handleMoveBed(movingParticipantId, bedNum)}
                                  className="bg-blue-600 text-white hover:bg-blue-700 px-2.5 py-1 rounded text-3xs font-extrabold flex items-center gap-1 transition cursor-pointer animate-pulse"
                                  title="Bu Boş Yatağa Taşı"
                                >
                                  <ArrowUpDown className="w-2.5 h-2.5" />
                                  Buraya Taşı
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() =>
                                      setAssignTarget({
                                        bungalowId: bg.id,
                                        bedNumber: bedNum,
                                      })
                                    }
                                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 p-1.5 rounded-lg transition font-semibold text-3xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <UserPlus className="w-3 h-3" /> Yerleştir
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSpecificBed(bg.id, bedNum)}
                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded transition cursor-pointer"
                                    title="Bu Boş Yatağı Tamamen Sil (Kapasiteyi Düşür)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  )}
                </div>

                {/* Right Panel: Unassigned ledger (2/5 space) */}
                <div className="md:col-span-2 p-5 bg-gray-50/50 flex flex-col overflow-hidden">
                  <div className="mb-3 shrink-0">
                    <h4 className="text-2xs font-extrabold text-gray-400 tracking-wider uppercase mb-1 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      Yatak Bekleyen Defteri
                    </h4>
                    <p className="text-3xs text-gray-500 font-semibold">
                      Katılımcıları odaya doğrudan veya sürükleyerek yerleştirin
                    </p>
                  </div>

                  {assignTarget && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-2xs space-y-2 mb-3 shrink-0">
                      <h4 className="font-bold text-yellow-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        Katılımcı Seç (Yatak {assignTarget.bedNumber})
                      </h4>
                      <input
                        type="text"
                        placeholder="İsim veya T.C. ile ara..."
                        value={participantSearchTerm}
                        onChange={(e) => setParticipantSearchTerm(e.target.value)}
                        className="w-full p-1.5 border border-yellow-300 rounded text-3xs bg-white focus:outline-yellow-500 font-semibold"
                      />
                      {unassignedParticipants.length > 0 ? (
                        <div className="space-y-1 max-h-36 overflow-y-auto font-semibold">
                          {unassignedParticipants
                            .filter(
                              (up) =>
                                up.name
                                  .toLowerCase()
                                  .includes(participantSearchTerm.toLowerCase()) ||
                                up.identityNumber.includes(participantSearchTerm),
                            )
                            .map((up) => (
                              <button
                                key={up.id}
                                onClick={() => {
                                  handleAssignParticipant(
                                    up.id,
                                    assignTarget.bungalowId,
                                    assignTarget.bedNumber,
                                  );
                                  setAssignTarget(null);
                                }}
                                className="w-full text-left p-1.5 rounded bg-white hover:bg-gray-100 text-3xs flex items-center justify-between border border-yellow-150"
                              >
                                <div>
                                  <span className="font-bold text-gray-800">
                                    {up.name}
                                  </span>
                                  <span className="text-4xs text-gray-400 block">
                                    {up.gender} • T.C.: {up.identityNumber.slice(0, 3)}...
                                  </span>
                                </div>
                                <span className="text-4xs font-semibold text-emerald-700 px-1.5 py-0.5 rounded bg-emerald-50 font-extrabold">
                                  Yerleştir
                                </span>
                              </button>
                            ))}
                        </div>
                      ) : (
                        <p className="text-4xs text-yellow-700 italic font-semibold">
                          Yerleştirilebilecek yeni onaylanmış katılımcı bulunmuyor.
                        </p>
                      )}
                      <button
                        onClick={() => setAssignTarget(null)}
                        className="text-gray-400 hover:text-gray-600 text-4xs font-bold underline cursor-pointer block"
                      >
                        Vazgeç
                      </button>
                    </div>
                  )}

                  <div className="mb-3 space-y-2 shrink-0">
                    <select
                      value={ledgerPeriodId}
                      onChange={(e) => setLedgerPeriodId(e.target.value)}
                      className="w-full py-1.5 px-2 border border-gray-200 rounded-lg text-3xs font-semibold focus:outline-none focus:border-blue-600 bg-white text-gray-700"
                    >
                      <option value="All">Tüm Dönemler</option>
                      {periods.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Defterde ara..."
                      value={participantSearchTerm}
                      onChange={(e) => setParticipantSearchTerm(e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded-lg text-3xs bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Scrollable draggable participants list */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {unassignedParticipants
                      .filter(
                        (up) =>
                          (ledgerPeriodId === "All" ||
                            up.campPeriodId === ledgerPeriodId) &&
                          (up.name
                            .toLowerCase()
                            .includes(participantSearchTerm.toLowerCase()) ||
                            up.identityNumber.includes(participantSearchTerm)),
                      )
                      .map((up) => (
                        <div
                          key={up.id}
                          draggable={true}
                          onDragStart={(e) => {
                            setDraggedParticipantId(up.id);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={() => {
                            setDraggedParticipantId(null);
                            setDragOverBedNum(null);
                          }}
                          className="p-2 border border-gray-150 rounded-lg bg-white shadow-3xs hover:border-blue-300 transition-colors text-3xs cursor-grab active:cursor-grabbing flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-gray-800 leading-tight truncate flex items-center gap-1">
                              <GripVertical className="w-3 h-3 text-gray-300" />
                              {up.name}
                            </div>
                            <div className="text-4xs text-gray-500 mt-0.5 ml-4">
                              {up.gender} | T.C.: {up.identityNumber.slice(0, 3)}***
                            </div>
                            <div className="text-4xs font-semibold text-gray-400 mt-0.5 ml-4 truncate">
                              {periods.find((p) => p.id === up.campPeriodId)?.name || "Dönem Belirtilmemiş"}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              onClick={() => {
                                // Find first empty bed
                                const emptyBedIdx = Array.from({ length: bg.capacity })
                                  .map((_, i) => i + 1)
                                  .find((num) => !occupants.some((o) => o.bedNumber === num));
                                
                                if (emptyBedIdx !== undefined) {
                                  handleAssignParticipant(up.id, bg.id, emptyBedIdx);
                                } else {
                                  alert("Bu bungalovda boş yatak bulunmuyor! Lütfen önce bir yer açın veya takas yapın.");
                                }
                              }}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded font-extrabold text-[9px] transition cursor-pointer"
                            >
                              Oto Yerleştir
                            </button>
                            <button
                              onClick={() => setAssignTarget({ bungalowId: bg.id, bedNumber: 1 })}
                              className="text-gray-400 hover:text-gray-600 text-[8px] underline text-center cursor-pointer"
                            >
                              Yatak Seç
                            </button>
                          </div>
                        </div>
                      ))}
                    {unassignedParticipants.filter(
                      (up) =>
                        ledgerPeriodId === "All" ||
                        up.campPeriodId === ledgerPeriodId,
                    ).length === 0 && (
                      <div className="text-[10px] text-gray-400 text-center italic py-4">
                        Yerleşim bekleyen katılımcı bulunamadı.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedBungalowId(null);
                    setAssignTarget(null);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-lg transition text-xs cursor-pointer shadow-sm"
                >
                  Değişiklikleri Kaydet ve Kapat
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Yerleşim Çakışması Modal */}
      {conflictInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-red-100 animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-red-50 bg-red-50/50">
              <div className="flex items-center gap-2 text-red-700">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold text-sm md:text-base leading-none">
                  Yerleşim Kuralı Çakışması
                </h3>
              </div>
              <button
                onClick={() => setConflictInfo(null)}
                className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-full hover:bg-red-100/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="bg-red-50/70 border border-red-100 rounded-xl p-4 text-xs space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-3xs font-extrabold text-red-500 uppercase tracking-wider block">
                      Hedef Bungalov
                    </span>
                    <span className="font-bold text-gray-800 text-sm">
                      {conflictInfo.bungalowName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xs font-extrabold text-red-500 uppercase tracking-wider block">
                      Katılımcı
                    </span>
                    <span className="font-bold text-gray-800 text-sm">
                      {conflictInfo.participantName} ({conflictInfo.participantGender})
                    </span>
                  </div>
                </div>

                <div className="border-t border-red-100/65 my-2"></div>

                <p className="text-red-800 leading-relaxed font-semibold text-xs bg-white/60 p-3 rounded-lg border border-red-50">
                  {conflictInfo.message}
                </p>
              </div>

              {/* Informative text about the rules */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3.5 text-3xs text-gray-500 leading-normal">
                <p className="font-medium">
                  <strong className="text-gray-700">Çözüm Önerisi:</strong> Katılımcıyı yerleştirmeden önce odadaki mevcut katılımcıları boşaltabilir ya da bu katılımcı için uygun cinsiyetteki başka bir bungalov seçebilirsiniz.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setConflictInfo(null)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg transition text-xs cursor-pointer shadow-xs"
              >
                Anladım, Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Genel Onay / Uyarı Dialogu (ConfirmDialog) */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Header */}
            <div className={`flex justify-between items-center p-4 border-b ${confirmDialog.isDanger ? 'border-red-50 bg-red-50/50 text-red-700' : 'border-indigo-50 bg-indigo-50/50 text-indigo-700'}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold text-sm md:text-base leading-none">
                  {confirmDialog.title}
                </h3>
              </div>
              <button
                onClick={() => setConfirmDialog(null)}
                className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-lg transition text-xs cursor-pointer shadow-3xs"
              >
                {confirmDialog.cancelText || "İptal"}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className={`px-5 py-2 text-white font-black rounded-lg transition text-xs cursor-pointer shadow-xs ${
                  confirmDialog.isDanger 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-indigo-650 hover:bg-indigo-700"
                }`}
              >
                {confirmDialog.confirmText || "Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Allocation Modal */}
      {showSmartAllocationModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center gap-3 relative shrink-0">
              <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm shadow-inner">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-black text-white tracking-wide">
                Akıllı Otomatik Yerleştirme
              </h2>
              <button
                onClick={() => setShowSmartAllocationModal(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition p-1.5 hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 bg-gray-50/50 overflow-y-auto">
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Bekleyen katılımcılar seçili kurallara göre dağıtılacaktır. Lütfen kuralları seçin:
              </p>
              
              <div className="grid grid-cols-1 gap-2.5">
                <label className="flex items-start gap-3 p-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-emerald-300 transition shadow-sm">
                  <div className="flex items-center h-4 mt-0.5">
                    <input 
                      type="checkbox" 
                      checked={smartRules.groupTogether}
                      onChange={(e) => setSmartRules({...smartRules, groupTogether: e.target.checked})}
                      className="w-3.5 h-3.5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-600" 
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Grupları Birlikte Tut</span>
                    <span className="block text-[10px] text-gray-500 mt-0.5 leading-tight">Aynı kafiledeki katılımcılar aynı odaya öncelikli atanır.</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-emerald-300 transition shadow-sm opacity-80">
                  <div className="flex items-center h-4 mt-0.5">
                    <input 
                      type="checkbox" 
                      checked={smartRules.schoolTogether}
                      onChange={(e) => setSmartRules({...smartRules, schoolTogether: e.target.checked})}
                      className="w-3.5 h-3.5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-600" 
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Aynı Okuldan Gelenleri Grupla</span>
                    <span className="block text-[10px] text-gray-500 mt-0.5 leading-tight">Benzer lokasyon veya okul bilgisine sahip kişileri bir araya getirir.</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-emerald-300 transition shadow-sm opacity-80">
                  <div className="flex items-center h-4 mt-0.5">
                    <input 
                      type="checkbox" 
                      checked={smartRules.noiseSensitivity}
                      onChange={(e) => setSmartRules({...smartRules, noiseSensitivity: e.target.checked})}
                      className="w-3.5 h-3.5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-600" 
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Gürültü Hassasiyeti</span>
                    <span className="block text-[10px] text-gray-500 mt-0.5 leading-tight">Sessizlik isteyenleri daha sakin konumlardaki odalara yerleştirir.</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-emerald-300 transition shadow-sm opacity-80">
                  <div className="flex items-center h-4 mt-0.5">
                    <input 
                      type="checkbox" 
                      checked={smartRules.separatePrevious}
                      onChange={(e) => setSmartRules({...smartRules, separatePrevious: e.target.checked})}
                      className="w-3.5 h-3.5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-600" 
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Geçmişte Birlikte Kalanları Dağıt</span>
                    <span className="block text-[10px] text-gray-500 mt-0.5 leading-tight">Daha önce odayı paylaşmış katılımcıları kaynaşma için ayırır.</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-emerald-300 transition shadow-sm opacity-80">
                  <div className="flex items-center h-4 mt-0.5">
                    <input 
                      type="checkbox" 
                      checked={smartRules.mixExperience}
                      onChange={(e) => setSmartRules({...smartRules, mixExperience: e.target.checked})}
                      className="w-3.5 h-3.5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-600" 
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Deneyim Karması</span>
                    <span className="block text-[10px] text-gray-500 mt-0.5 leading-tight">İlk kez katılanları deneyimlilerle eşleştirerek uyumu artırır.</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowSmartAllocationModal(false)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition text-xs cursor-pointer"
                disabled={isAllocating}
              >
                İptal
              </button>
              <button
                onClick={executeSmartAllocation}
                disabled={isAllocating}
                className={`cursor-pointer px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg transition text-xs flex items-center gap-2 shadow-sm ${isAllocating ? 'opacity-70 cursor-not-allowed' : 'hover:from-emerald-700 hover:to-teal-700'}`}
              >
                {isAllocating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Hesaplanıyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Başlat
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}