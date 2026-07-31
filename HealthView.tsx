import React, { useState, useMemo, useCallback } from 'react';
import { exportToExcel, exportToPdfTable } from '../utils/exportUtils';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Info,
  Sliders,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
  Calendar,
  Users,
  Percent,
  DollarSign,
  Briefcase,
  Layers,
  Utensils,
  Home,
  Truck,
  Activity,
  UserCheck,
  ChevronRight,
  Download,
  Lightbulb,
  ShieldCheck,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  PieChart,
  BookOpen,
  Edit2,
  FileSpreadsheet,
  FileText,
  Wrench,
  HeartPulse
} from 'lucide-react';
import { Participant, CampPeriod, Expense, SystemLog } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface CostAnalysisViewProps {
  participants: Participant[];
  periods: CampPeriod[];
  expenses: Expense[];
  onUpdateExpenses: (expenses: Expense[]) => void;
  onAddLog: (action: string, details: string, overrideUser?: any, undoData?: SystemLog['undoData']) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Gıda': return <Utensils className="w-4 h-4 text-emerald-500" />;
    case 'Teknik': return <Wrench className="w-4 h-4 text-amber-500" />;
    case 'Personel': return <Users className="w-4 h-4 text-blue-500" />;
    case 'Sağlık': return <HeartPulse className="w-4 h-4 text-rose-500" />;
    default: return <Layers className="w-4 h-4 text-gray-400" />;
  }
};

export default function CostAnalysisView({ participants, periods, expenses, onUpdateExpenses, onAddLog }: CostAnalysisViewProps) {
  // Period Selection State
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(() => {
    const active = periods.find(p => p.isActive) || periods[0];
    return active ? active.id : '';
  });

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'distribution' | 'ledger' | 'simulator'>('overview');

  // New expense form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    name: '',
    category: 'Konaklama' as Expense['category'],
    amount: '',
    type: 'Sabit' as Expense['type'],
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Base Simulation Parameters (Default and User Interactive)
  const [simulationParticipants, setSimulationParticipants] = useState<number>(100);
  const [simulationDays, setSimulationDays] = useState<number>(7);
  const [simulationPricePerPeriod, setSimulationPricePerPeriod] = useState<number>(2500); // Package pricing per period
  const [optFoodAgreement, setOptFoodAgreement] = useState(false);
  const [optStaffAgreement, setOptStaffAgreement] = useState(false);

  // Dynamic Camp Duration Calculation Function (start to end date days count)
  const calculateCampDurationDays = useCallback((startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 7;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 7;
  }, []);

  const selectedPeriod = useMemo(() => {
    return periods.find(p => p.id === selectedPeriodId) || periods[0];
  }, [periods, selectedPeriodId]);

  const campDurationDays = useMemo(() => {
    if (!selectedPeriod) return 7;
    return calculateCampDurationDays(selectedPeriod.startDate, selectedPeriod.endDate);
  }, [selectedPeriod, calculateCampDurationDays]);

  const campCapacity = useMemo(() => {
    return selectedPeriod?.maxQuota || 120;
  }, [selectedPeriod]);

  const simulationOccupancy = Math.round((simulationParticipants / campCapacity) * 100);

  const activeParticipantsCount = useMemo(() => {
    if (!selectedPeriodId) {
      const kamptaCount = participants.filter(p => p.status === 'Kampta').length;
      return kamptaCount > 0 ? kamptaCount : 74;
    }
    // Filter participants belonging to this specific period
    const periodParticipants = participants.filter(p => p.campPeriodId === selectedPeriodId);
    if (periodParticipants.length > 0) {
      return periodParticipants.length;
    }
    const kamptaCount = participants.filter(p => p.status === 'Kampta').length;
    return kamptaCount > 0 ? kamptaCount : 74; // Fallback to realistic active count
  }, [participants, selectedPeriodId]);

  const occupancyRate = useMemo(() => {
    return Math.round((activeParticipantsCount / campCapacity) * 100);
  }, [activeParticipantsCount, campCapacity]);

  // Toplam Katılımcı Gün = Toplam Katılımcı × Ortalama Kalış Süresi
  const totalParticipantDays = useMemo(() => {
    return activeParticipantsCount * campDurationDays;
  }, [activeParticipantsCount, campDurationDays]);

  // Actual Expense Calculations
  const metrics = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const fixed = expenses.filter(e => e.type === 'Sabit').reduce((sum, e) => sum + e.amount, 0);
    const variable = expenses.filter(e => e.type === 'Değişken').reduce((sum, e) => sum + e.amount, 0);

    // Kişi başı günlük hesaplamaları
    const fixedPerPersonDay = totalParticipantDays > 0 ? fixed / totalParticipantDays : 0;
    const variablePerPersonDay = totalParticipantDays > 0 ? variable / totalParticipantDays : 0;
    const totalPerPersonDay = fixedPerPersonDay + variablePerPersonDay;

    // Kişi başı toplam dönemlik maliyetler (GÜN SAYISI ÇARPANLI)
    const fixedPerPersonPeriod = fixedPerPersonDay * campDurationDays;
    const variablePerPersonPeriod = variablePerPersonDay * campDurationDays;
    const totalPerPersonPeriod = totalPerPersonDay * campDurationDays;

    // Günlük toplam operasyonel maliyet
    const dailyOpCost = total / campDurationDays;

    return {
      total,
      fixed,
      variable,
      fixedPerPersonDay,
      variablePerPersonDay,
      totalPerPersonDay,
      fixedPerPersonPeriod,
      variablePerPersonPeriod,
      totalPerPersonPeriod,
      dailyOpCost
    };
  }, [expenses, totalParticipantDays, campDurationDays]);

  // Category Based aggregation
  const categoryStats = useMemo(() => {
    const categories: Expense['category'][] = ['Konaklama', 'Yemek', 'Ulaşım', 'Aktivite', 'Personel', 'Genel Gider'];
    
    return categories.map(cat => {
      const catExpenses = expenses.filter(e => e.category === cat);
      const totalAmount = catExpenses.reduce((sum, e) => sum + e.amount, 0);
      const percentage = metrics.total > 0 ? Math.round((totalAmount / metrics.total) * 100) : 0;
      const perPersonDay = totalParticipantDays > 0 ? totalAmount / totalParticipantDays : 0;

      return {
        category: cat,
        totalAmount,
        percentage,
        perPersonDay
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount); // Sort from highest to lowest
  }, [expenses, metrics.total, totalParticipantDays]);

  // Smart Advisory Engine Comments
  const smartInsights = useMemo(() => {
    const insights: { text: string; type: 'warning' | 'info' | 'success'; category: string }[] = [];

    // Rule 1: Eğer bir kategori toplam maliyetin %30’unu geçerse
    categoryStats.forEach(stat => {
      if (stat.percentage > 30) {
        insights.push({
          text: `"${stat.category}" harcamaları toplam bütçenin %${stat.percentage}'ine ulaştı. Bu kategori yüksek maliyetli, optimizasyon veya alternatif tedarikçiler önerilir.`,
          type: 'warning',
          category: stat.category
        });
      }
    });

    // Rule 2: Eğer yemek maliyeti kişi başı hedef bütçeyi (örn: 350 TL) aşarsa
    const yemekStat = categoryStats.find(s => s.category === 'Yemek');
    if (yemekStat && yemekStat.perPersonDay > 350) {
      insights.push({
        text: `Kişi başı günlük yemek maliyeti (${Math.round(yemekStat.perPersonDay)} TL), belirlenen 350 TL hedef bütçesinin üzerindedir. Toplu gıda alımı anlaşmaları veya menü optimizasyonu önerilir.`,
        type: 'warning',
        category: 'Yemek'
      });
    } else if (yemekStat) {
      insights.push({
        text: `Yemek maliyetleri kişi başı günlük ${Math.round(yemekStat.perPersonDay)} TL ile dengeli seyretmektedir.`,
        type: 'success',
        category: 'Yemek'
      });
    }

    // Rule 3: Eğer doluluk %70 altındaysa
    if (occupancyRate < 70) {
      insights.push({
        text: `Mevcut kamp doluluk oranı (%${occupancyRate}) %70 hedefinin altındadır. Sabit gider yükü (kişi başına düşen pay) yüksek kalmaktadır. Kapasiteyi verimli kullanmak adına kampanya veya okul işbirlikleri oluşturulması tavsiye edilir.`,
        type: 'warning',
        category: 'Doluluk'
      });
    } else {
      insights.push({
        text: `Kamp doluluk oranı (%${occupancyRate}) verimli düzeydedir. Sabit giderlerin katılımcı başına dağılımı optimize edilmiştir.`,
        type: 'success',
        category: 'Doluluk'
      });
    }

    // Rule 4: Eğer personel maliyeti %20’yi aşarsa
    const personelStat = categoryStats.find(s => s.category === 'Personel');
    if (personelStat && personelStat.percentage > 20) {
      insights.push({
        text: `Personel giderleri toplam bütçenin %${personelStat.percentage}'sini oluşturmaktadır (%20 sınırı aşılmıştır). Gönüllü entegrasyonu ve esnek vardiya planlamaları gözden geçirilmelidir.`,
        type: 'warning',
        category: 'Personel'
      });
    }

    return insights;
  }, [categoryStats, occupancyRate]);

  // Scenario Simulator calculations
  const simulatedMetrics = useMemo(() => {
    // Simulated Participant Day Count
    const simTotalParticipantDays = simulationParticipants * simulationDays;

    // Sabit giderler aynen kalır, değişken giderler katılımcı sayısına göre ölçeklenir
    // (Mevcut değişken giderleri aktif katılımcı gün sayısına bölüp yeni katılımcı gün ile çarpıyoruz)
    let adjustedVariable = metrics.variable;
    let adjustedFixed = metrics.fixed;

    // Apply simulation-only optimizations if toggled
    if (optFoodAgreement) {
      // Food variable cost is reduced by 15%
      const foodVariableExpenses = expenses.filter(e => e.category === 'Yemek' && e.type === 'Değişken').reduce((sum, e) => sum + e.amount, 0);
      adjustedVariable -= foodVariableExpenses * 0.15;
    }
    if (optStaffAgreement) {
      // Staff expenses reduced by 10%
      const staffFixed = expenses.filter(e => e.category === 'Personel' && e.type === 'Sabit').reduce((sum, e) => sum + e.amount, 0);
      const staffVariable = expenses.filter(e => e.category === 'Personel' && e.type === 'Değişken').reduce((sum, e) => sum + e.amount, 0);
      adjustedFixed -= staffFixed * 0.10;
      adjustedVariable -= staffVariable * 0.10;
    }

    const originalVariablePerPersonDay = totalParticipantDays > 0 
      ? adjustedVariable / totalParticipantDays 
      : (expenses.length === 0 ? 120 : 0);
    
    // Fixed costs scale with the number of simulated days (assuming original fixed is for 7 days)
    const originalFixedPerDay = adjustedFixed / campDurationDays;
    const simulatedFixed = originalFixedPerDay * simulationDays;

    const simulatedVariable = originalVariablePerPersonDay * simTotalParticipantDays;
    const simulatedTotal = simulatedFixed + simulatedVariable;

    // Kişi başı günlük maliyet
    const simFixedPerPersonDay = simTotalParticipantDays > 0 ? simulatedFixed / simTotalParticipantDays : 0;
    const simVariablePerPersonDay = simTotalParticipantDays > 0 ? simulatedVariable / simTotalParticipantDays : 0;
    const simTotalPerPersonDay = simFixedPerPersonDay + simVariablePerPersonDay;

    // Kişi başı toplam simüle dönemlik maliyet (GÜN SAYISI ÇARPANLI)
    const simTotalPerPersonPeriod = simTotalPerPersonDay * simulationDays;

    // Gelir & Kâr/Zarar
    // Kişi başı günlük gelir: dönemlik paket ücretinin standart dönem gününe (campDurationDays) bölünmesiyle hesaplanır.
    const dailyPricePerPerson = simulationPricePerPeriod / campDurationDays;
    
    // Simüle edilen gün süresine göre güncellenmiş kişi başı paket ücreti
    const simulatedPackagePrice = dailyPricePerPerson * simulationDays;

    const estimatedRevenue = simulationParticipants * simulatedPackagePrice;
    const estimatedProfitLoss = estimatedRevenue - simulatedTotal;

    // Başa baş noktası doluluk hesabı (Sadece sabit giderleri karşılamak için gereken asgari katılımcı sayısı)
    // Gelir/Gün - DeğişkenGider/Gün > 0 ise, her katılımcı sabit gideri kapatmaya katkı sağlar
    const marginPerPersonDay = dailyPricePerPerson - originalVariablePerPersonDay;
    const isBreakEvenPossible = marginPerPersonDay > 0;
    
    const breakEvenParticipants = isBreakEvenPossible ? Math.ceil(originalFixedPerDay / marginPerPersonDay) : 0;
    const breakEvenOccupancy = isBreakEvenPossible ? Math.round((breakEvenParticipants / campCapacity) * 100) : 0;

    return {
      total: simulatedTotal,
      perPersonDay: simTotalPerPersonDay,
      simTotalPerPersonPeriod,
      revenue: estimatedRevenue,
      profitLoss: estimatedProfitLoss,
      breakEvenParticipants,
      breakEvenOccupancy,
      isBreakEvenPossible,
      originalVariablePerPersonDay,
      marginPerPersonDay,
      simulatedPackagePrice
    };
  }, [simulationParticipants, simulationDays, simulationPricePerPeriod, metrics, totalParticipantDays, campCapacity, campDurationDays, optFoodAgreement, optStaffAgreement, expenses]);

  // Handle adding new expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.name || !newExpense.amount) return;

    if (editingExpenseId) {
      const updatedExpenses = expenses.map(expense => {
        if (expense.id === editingExpenseId) {
          return {
            ...expense,
            name: newExpense.name,
            category: newExpense.category,
            amount: parseFloat(newExpense.amount),
            type: newExpense.type,
            date: newExpense.date,
            description: newExpense.description || 'Gider kaydı'
          };
        }
        return expense;
      });
      onUpdateExpenses(updatedExpenses);
      onAddLog(
        'Gider Güncellendi', 
        `"${newExpense.name}" isimli gider güncellendi. Yeni tutar: ${newExpense.amount} TL.`, 
        null, 
        { expenses: expenses }
      );
    } else {
      const added: Expense = {
        id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
        name: newExpense.name,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        type: newExpense.type,
        date: newExpense.date,
        description: newExpense.description || 'Gider kaydı'
      };
      const updatedExpenses = [added, ...expenses];
      onUpdateExpenses(updatedExpenses);
      onAddLog(
        'Yeni Gider Eklendi', 
        `"${added.name}" isimli yeni ${added.type.toLowerCase()} gider sisteme işlendi. Tutar: ${added.amount} TL.`, 
        null, 
        { expenses: expenses }
      );
    }

    setIsAddModalOpen(false);
    setEditingExpenseId(null);
    // Reset form
    setNewExpense({
      name: '',
      category: 'Konaklama',
      amount: '',
      type: 'Sabit',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setNewExpense({
      name: expense.name,
      category: expense.category,
      amount: expense.amount.toString(),
      type: expense.type,
      date: expense.date,
      description: expense.description || ''
    });
    setIsAddModalOpen(true);
  };

  // Handle deleting expense
  const handleDeleteExpense = (id: string) => {
    try {
      const expenseToDelete = expenses.find(e => e.id === id);
      if (window.self !== window.top) {
        const updatedExpenses = expenses.filter(e => e.id !== id);
        onUpdateExpenses(updatedExpenses);
        if (expenseToDelete) {
          onAddLog('Gider Silindi', `"${expenseToDelete.name}" isimli gider sistemden silindi.`, null, { expenses: expenses });
        }
      } else {
        if (window.confirm('Bu maliyet kalemini silmek istediğinize emin misiniz?')) {
          const updatedExpenses = expenses.filter(e => e.id !== id);
          onUpdateExpenses(updatedExpenses);
          if (expenseToDelete) {
            onAddLog('Gider Silindi', `"${expenseToDelete.name}" isimli gider sistemden silindi.`, null, { expenses: expenses });
          }
        }
      }
    } catch (e) {
      const updatedExpenses = expenses.filter(ex => ex.id !== id);
      onUpdateExpenses(updatedExpenses);
    }
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
      const matchesType = typeFilter === 'All' || e.type === typeFilter;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [expenses, searchTerm, categoryFilter, typeFilter]);

  // Color mappings helper for categories
  const getCategoryColor = (cat: Expense['category']) => {
    switch (cat) {
      case 'Konaklama': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', hex: '#10B981' };
      case 'Yemek': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', hex: '#F59E0B' };
      case 'Ulaşım': return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', hex: '#0EA5E9' };
      case 'Aktivite': return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', hex: '#F43F5E' };
      case 'Personel': return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', hex: '#14B8A6' };
      case 'Genel Gider': return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', hex: '#9CA3AF' };
    }
  };

  
  const getExportData = () => {
    if (filteredExpenses.length === 0) return null;
    
    const headers = [
      "Tarih", "Gider Adı", "Kategori", "Tür", "Tutar (TL)", "Açıklama"
    ];

    const rows = filteredExpenses.map(e => [
      new Date(e.date).toLocaleDateString('tr-TR'),
      e.name,
      e.category,
      e.type,
      e.amount.toLocaleString('tr-TR'),
      e.description || '-'
    ]);
    
    return { headers, rows };
  };

  const handleExportToExcel = () => {
    const data = getExportData();
    if (!data) {
      alert("Dışa aktarılacak gider kaydı bulunamadı.");
      return;
    }
    
    const excelData = data.rows.map((row) => {
      let obj = {};
      data.headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

    exportToExcel(excelData, 'maliyet_analizi');
    onAddLog('Excel Dışa Aktarımı', 'Maliyet analiz listesi Excel formatında dışa aktarıldı.');
  };

  const handleExportToPDF = () => {
    const data = getExportData();
    if (!data) {
      alert("Dışa aktarılacak gider kaydı bulunamadı.");
      return;
    }
    exportToPdfTable(data.headers, data.rows, 'maliyet_analizi', 'Maliyet Analiz Raporu');
    onAddLog('PDF Dışa Aktarımı', 'Maliyet analiz listesi PDF formatında dışa aktarıldı.');
  };

  return (

    <div id="cost-analysis-module" className="flex-1 overflow-y-auto bg-gray-50/50 p-6 space-y-6">
      
      {/* Module Title & Quick Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-emerald-700" />
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Katılımcı Maliyet Analiz Modülü</h1>
          </div>
          <p className="text-gray-500 text-xs mt-1">
            Mevcut kampın kişi başı ve kategori bazlı tüm operasyonel giderlerini izleyin, simülasyonlar ile kârlılık analizi yapın.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleExportToExcel}
              className="px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center gap-1.5 shadow-xs hover:border-emerald-500 cursor-pointer"
              title="Excel İndir"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Excel
            </button>
            <button
              onClick={handleExportToPDF}
              className="px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center gap-1.5 shadow-xs hover:border-red-500 cursor-pointer"
              title="PDF İndir"
            >
              <FileText className="w-4 h-4 text-red-600" />
              PDF
            </button>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Gider Girişi</span>
          </button>
        </div>
      </div>

      {/* Period Selection & Dynamic Duration Header */}
      <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Aktif Dönem:</span>
          </div>
          <select
            value={selectedPeriodId}
            onChange={(e) => {
              const pId = e.target.value;
              setSelectedPeriodId(pId);
              const p = periods.find(x => x.id === pId);
              if (p) {
                onAddLog('Dönem Değiştirildi', `Maliyet analizi için "${p.name}" seçildi. Hesaplamalar dinamik olarak güncellendi.`);
              }
            }}
            className="text-xs font-extrabold border border-gray-250 bg-white rounded-xl px-3 py-2 text-gray-800 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-500 cursor-pointer min-w-[280px]"
          >
            {periods.map(period => {
              const days = calculateCampDurationDays(period.startDate, period.endDate);
              return (
                <option key={period.id} value={period.id}>
                  {period.name} ({days} Gün)
                </option>
              );
            })}
          </select>
        </div>

        {selectedPeriod && (
          <div className="text-2xs font-extrabold text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-150 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Dinamik Kamp Süresi: <strong className="font-mono text-emerald-950">{campDurationDays} Gün</strong></span>
            </div>
            <div>
              Tarihler: <span className="text-gray-700 font-mono font-bold">{selectedPeriod.startDate} / {selectedPeriod.endDate}</span>
            </div>
            <div>
              Maksimum Kota: <span className="text-gray-700 font-mono font-bold">{selectedPeriod.maxQuota} Kişi</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sub-navigation Sidebar/Tabs */}
        <div className="lg:col-span-3 bg-white p-3.5 rounded-2xl border border-gray-150 shadow-xs flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSubTab('overview')}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 w-full shrink-0 cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-emerald-50 text-emerald-800 border-l-0 lg:border-l-4 lg:border-emerald-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Genel Bakış</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSubTab('distribution')}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 w-full shrink-0 cursor-pointer ${
              activeSubTab === 'distribution'
                ? 'bg-emerald-50 text-emerald-800 border-l-0 lg:border-l-4 lg:border-emerald-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <PieChart className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Bütçe Dağılımı &amp; Analiz</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('simulator')}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 w-full shrink-0 cursor-pointer ${
              activeSubTab === 'simulator'
                ? 'bg-emerald-50 text-emerald-800 border-l-0 lg:border-l-4 lg:border-emerald-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Senaryo Simülatörü</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ledger')}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 w-full shrink-0 cursor-pointer ${
              activeSubTab === 'ledger'
                ? 'bg-emerald-50 text-emerald-800 border-l-0 lg:border-l-4 lg:border-emerald-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Detaylı Gider Kaydı</span>
          </button>
        </div>

        {/* Right Active View Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* OVERVIEW TAB */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* KPI Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Toplam Gider Card */}
                <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Toplam Gider</span>
                    <span className="text-xl font-black text-gray-800 font-mono block mt-1">
                      {metrics.total.toLocaleString('tr-TR')} <span className="text-xs text-gray-500">TL</span>
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] font-semibold text-gray-500">
                    <span>Sabit: {metrics.fixed.toLocaleString('tr-TR')} TL</span>
                    <span>Değişken: {metrics.variable.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="absolute top-3 right-3 p-1.5 bg-emerald-50 rounded-xl">
                    <Coins className="w-4 h-4 text-emerald-700" />
                  </div>
                </div>

                {/* Kişi Başı Dönemlik Maliyet Card */}
                <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Kişi Başı Dönemlik Maliyet</span>
                    <span className="text-xl font-black text-[#00875A] font-mono block mt-1" title={`${campDurationDays} gün için toplam maliyet`}>
                      {metrics.totalPerPersonPeriod.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} <span className="text-xs text-emerald-700">TL</span>
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] font-semibold text-gray-500" title="Kişi başı sabit ve değişken dönemlik maliyetler">
                    <span>S: {metrics.fixedPerPersonPeriod.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} TL</span>
                    <span>D: {metrics.variablePerPersonPeriod.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} TL</span>
                  </div>
                  <div className="absolute top-3 right-3 p-1.5 bg-emerald-50 rounded-xl flex flex-col items-center">
                    <TrendingUp className="w-4 h-4 text-[#00875A]" />
                    <span className="text-[8px] font-black text-[#00875A] mt-0.5" title="Kişi başı günlük maliyet">{metrics.totalPerPersonDay.toFixed(0)}₺/G</span>
                  </div>
                </div>

                {/* Doluluk & Gün Sayısı Card */}
                <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Doluluk &amp; Katılımcı</span>
                    <span className="text-xl font-black text-gray-800 font-mono block mt-1">
                      %{occupancyRate} <span className="text-xs text-gray-500">({activeParticipantsCount} Katılımcı)</span>
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] font-semibold text-gray-400">
                    <span>Kapasite: {campCapacity} Kişi</span>
                    <span className="text-gray-500 font-bold">Süre: {campDurationDays} Gün</span>
                  </div>
                  <div className="absolute top-3 right-3 p-1.5 bg-emerald-50 rounded-xl">
                    <Users className="w-4 h-4 text-emerald-700" />
                  </div>
                </div>

                {/* Günlük Toplam Operasyon Maliyeti Card */}
                <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Günlük Kamp Gideri</span>
                    <span className="text-xl font-black text-amber-700 font-mono block mt-1">
                      {Math.round(metrics.dailyOpCost).toLocaleString('tr-TR')} <span className="text-xs text-gray-500">TL / Gün</span>
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] font-semibold text-gray-500 text-center">
                    Toplam Katılımcı Gün: <span className="font-mono text-gray-700 font-bold">{totalParticipantDays}</span>
                  </div>
                  <div className="absolute top-3 right-3 p-1.5 bg-amber-50 rounded-xl">
                    <Layers className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Advanced Charts: Timeline and Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs h-[300px] flex flex-col">
                  <span className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                    <TrendingUp className="w-4 h-4 text-emerald-700" /> Zaman İçinde Gider Dağılımı
                  </span>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={Object.entries(expenses.reduce((acc, curr) => {
                          acc[curr.date] = (acc[curr.date] || 0) + curr.amount;
                          return acc;
                        }, {} as Record<string, number>))
                        .map(([date, total]) => ({ date, total }))
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" tick={{fontSize: 10, fill: '#6B7280'}} tickMargin={10} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10, fill: '#6B7280'}} tickFormatter={(value) => `${value.toLocaleString('tr-TR')} ₺`} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value.toLocaleString('tr-TR')} TL`, 'Toplam Maliyet']}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="total" stroke="#047857" strokeWidth={3} dot={{r: 4, fill: '#047857', strokeWidth: 0}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs h-[300px] flex flex-col">
                  <span className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                    <PieChart className="w-4 h-4 text-blue-700" /> Kategori Bazlı Maliyet Özeti
                  </span>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryStats.map(stat => ({ name: stat.category, value: stat.totalAmount }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6B7280'}} tickMargin={10} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10, fill: '#6B7280'}} tickFormatter={(value) => `${(value/1000).toLocaleString('tr-TR')}k ₺`} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value.toLocaleString('tr-TR')} TL`, 'Maliyet']}
                          cursor={{fill: '#F3F4F6'}}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Overview Secondary Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Overview Welcome & Info Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
                  <span className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-700" /> Kamp Finansal Karnesi
                  </span>
                  
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Bu modül, kampın kişi başı operasyonel bütçesini, gider tipolojilerini ve kârlılık durumunu analiz etmek için geliştirilmiştir. Sol menüyü kullanarak detaylı bütçe kırılımlarını görebilir, senaryo simülatörünü çalıştırabilir veya gider defterini yönetebilirsiniz.
                  </p>

                  <div className="border-t border-gray-100 pt-4 space-y-2 text-xs font-semibold text-gray-600">
                    <div className="flex justify-between items-center py-1">
                      <span>Aktif Kamp Doluluk Durumu</span>
                      <span className="font-bold text-gray-900">%{occupancyRate}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span>Kişi Başı Sabit Gider Yükü (Dönemlik)</span>
                      <span className="font-mono font-bold text-gray-900">{metrics.fixedPerPersonPeriod.toFixed(2)} TL <span className="text-3xs text-gray-400 font-normal">({metrics.fixedPerPersonDay.toFixed(2)} TL/Gün)</span></span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span>Kişi Başı Değişken Gider (Dönemlik)</span>
                      <span className="font-mono font-bold text-emerald-700">{metrics.variablePerPersonPeriod.toFixed(2)} TL <span className="text-3xs text-emerald-500 font-normal">({metrics.variablePerPersonDay.toFixed(2)} TL/Gün)</span></span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-gray-100 pt-2 text-gray-800 font-extrabold">
                      <span>Toplam Kişi Başı Dönem Maliyeti ({campDurationDays} Gün)</span>
                      <span className="font-mono text-emerald-800">{metrics.totalPerPersonPeriod.toFixed(2) } TL <span className="text-3xs text-emerald-700 font-normal">({metrics.totalPerPersonDay.toFixed(2)} TL/Gün)</span></span>
                    </div>
                  </div>
                </div>

                {/* AI Advisor Panel */}
                <div className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-900 shadow-md space-y-4">
                  <div className="flex justify-between items-center border-b border-emerald-800 pb-3">
                    <span className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" /> Akıllı Analiz &amp; Karar Destek
                    </span>
                    <span className="text-[9px] bg-emerald-800 text-emerald-200 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                      Gerçek Zamanlı
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                    {smartInsights.map((insight, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-xl border flex gap-2 text-xs font-medium leading-relaxed ${
                          insight.type === 'warning' 
                            ? 'bg-amber-950/70 border-amber-800 text-amber-150' 
                            : 'bg-emerald-900/65 border-emerald-800 text-emerald-100'
                        }`}
                      >
                        {insight.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <span className="font-extrabold text-[9px] uppercase tracking-wider block text-gray-300">
                            {insight.category} Analizi
                          </span>
                          <p className="text-3xs sm:text-2xs">{insight.text}</p>
                        </div>
                      </div>
                    ))}

                    {smartInsights.length === 0 && (
                      <div className="text-center py-6 text-emerald-200 text-xs italic">
                        Bütçe anomalisi tespit edilmemiştir. Tüm maliyetler optimum sınırlardadır.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DISTRIBUTION TAB */}
          {activeSubTab === 'distribution' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
              {/* Visual Progress Charts */}
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-700" /> Kategori Bazlı Maliyet Dağılımı
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Yüzde Dağılımı</span>
                </div>

                {/* Custom Horizontal Visual Bar Representation */}
                <div className="space-y-4">
                  {categoryStats.map(stat => {
                    const colors = getCategoryColor(stat.category);
                    return (
                      <div key={stat.category} className="space-y-1.5">
                        <div className="flex justify-between items-center text-2xs font-bold text-gray-700">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.hex }} />
                            <span>{stat.category}</span>
                          </div>
                          <div className="font-mono space-x-1 sm:space-x-2 text-right flex items-center justify-end gap-1.5">
                            <span className="text-gray-400">%{stat.percentage}</span>
                            <span className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-medium">({(stat.perPersonDay * campDurationDays).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} TL / Dönem)</span>
                            <span className="text-gray-900 font-black">{stat.totalAmount.toLocaleString('tr-TR')} TL</span>
                          </div>
                        </div>
                        {/* Visual Progress Bar */}
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${stat.percentage}%`,
                              backgroundColor: colors.hex
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Visual Donut Grid Representation (Visual Mini Charts) */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                  <div className="p-3 bg-gray-50/75 rounded-xl border border-gray-100 text-center space-y-1">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">Sabit Payı</span>
                    <span className="text-sm font-black font-mono text-emerald-700">
                      %{metrics.total > 0 ? Math.round((metrics.fixed / metrics.total) * 100) : 0}
                    </span>
                    <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600" 
                        style={{ width: `${metrics.total > 0 ? (metrics.fixed / metrics.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50/75 rounded-xl border border-gray-100 text-center space-y-1">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">Değişken Payı</span>
                    <span className="text-sm font-black font-mono text-amber-700">
                      %{metrics.total > 0 ? Math.round((metrics.variable / metrics.total) * 100) : 0}
                    </span>
                    <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-600" 
                        style={{ width: `${metrics.total > 0 ? (metrics.variable / metrics.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50/75 rounded-xl border border-gray-100 text-center space-y-1">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">Günlük Ort.</span>
                    <span className="text-sm font-black font-mono text-[#00875A]">
                      {Math.round(metrics.dailyOpCost).toLocaleString('tr-TR')} TL
                    </span>
                    <div className="text-[8px] text-gray-400 font-bold leading-none mt-1">İşletim Gideri</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Box */}
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <span className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
                    <Lightbulb className="w-4 h-4 text-emerald-700" /> Bütçe Optimizasyon Senaryoları (Simüle)
                  </span>
                  <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                    Aşağıdaki aksiyonları etkinleştirerek simüle edilmiş bütçe üzerindeki anlık tasarrufları ve gelir değişimlerini görebilirsiniz. Bu işlem gerçek bütçe verilerinizi bozmaz.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Food Agreement Toggle Switch */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-150 bg-gray-50/70 hover:bg-emerald-50/30 transition cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-2xs font-extrabold text-gray-800 block">Gıda Toplu Satın Alma Anlaşması</span>
                      <span className="text-[10px] font-bold text-gray-400">Yemek tedarik maliyetinde %15 tasarruf sağlar.</span>
                    </div>
                    <input 
                      type="checkbox"
                      checked={optFoodAgreement}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setOptFoodAgreement(checked);
                        onAddLog('Simülatör Optimizasyonu', `Gıda Toplu Satın Alma Anlaşması ${checked ? 'etkinleştirildi (%15 tasarruf)' : 'devre dışı bırakıldı'}.`);
                      }}
                      className="w-4 h-4 rounded text-emerald-700 accent-emerald-700 cursor-pointer"
                    />
                  </label>

                  {/* Staff Agreement Toggle Switch */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-150 bg-gray-50/70 hover:bg-emerald-50/30 transition cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-2xs font-extrabold text-gray-800 block">Personel Vardiya Optimizasyonu</span>
                      <span className="text-[10px] font-bold text-gray-400">Personel bütçesinde %10 tasarruf sağlar.</span>
                    </div>
                    <input 
                      type="checkbox"
                      checked={optStaffAgreement}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setOptStaffAgreement(checked);
                        onAddLog('Simülatör Optimizasyonu', `Personel Vardiya Optimizasyonu ${checked ? 'etkinleştirildi (%10 tasarruf)' : 'devre dışı bırakıldı'}.`);
                      }}
                      className="w-4 h-4 rounded text-emerald-700 accent-emerald-700 cursor-pointer"
                    />
                  </label>

                  {/* Occupancy Preset Trigger */}
                  <button 
                    type="button"
                    onClick={() => {
                      setSimulationParticipants(115); // ~95%
                      setActiveSubTab('simulator');
                      onAddLog('Simülatör Optimizasyonu', 'Mevsimlik Doluluk Kampanyası (%95 Doluluk) simülatöre uygulandı.');
                    }}
                    className="w-full bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-900 py-2.5 px-3 rounded-xl border border-gray-150 hover:border-emerald-250 flex items-center justify-between transition cursor-pointer text-2xs font-extrabold"
                  >
                    <div className="text-left space-y-0.5">
                      <span className="block">Mevsimlik Doluluk Kampanyası (%95 Doluluk)</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Simülatör Katılımcı Sayısını 115 Yapar</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </button>

                  {/* Pricing Preset Trigger */}
                  <button 
                    type="button"
                    onClick={() => {
                      setSimulationPricePerPeriod(3000);
                      setActiveSubTab('simulator');
                      onAddLog('Simülatör Fiyat Revizyonu', 'Paket Fiyatlandırma Revizyonu (Dönemlik 3.000 TL) simülatöre uygulandı.');
                    }}
                    className="w-full bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-900 py-2.5 px-3 rounded-xl border border-gray-150 hover:border-emerald-250 flex items-center justify-between transition cursor-pointer text-2xs font-extrabold"
                  >
                    <div className="text-left space-y-0.5">
                      <span className="block">Paket Fiyatlandırma Revizyonu (3.000 TL)</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dönemlik paket ücretini 3.000 TL yapar</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR TAB */}
          {activeSubTab === 'simulator' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
              {/* Senaryo Simülasyon Paneli */}
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-5">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-700" /> Senaryo Simülatörü (Interactive)
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Gelecek Projeksiyonu</span>
                </div>

                <p className="text-gray-500 text-2xs leading-relaxed">
                  Farklı katılımcı sayıları ve doluluk durumlarında kampın kârlılığını, tahmini gider ve gelir trendlerini anlık olarak simüle edin.
                </p>

                {/* Quick Presets Buttons */}
                {/* Quick Presets Buttons */}
                <div className="space-y-2">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">Hazır Senaryo Şablonları</span>
                  <div className="grid grid-cols-3 gap-1.5 text-3xs font-extrabold">
                    <button 
                      type="button"
                      onClick={() => {
                        setSimulationParticipants(50);
                        onAddLog('Simülatör Şablonu', 'Hazır senaryo uygulandı: 50 Katılımcı (%42 Doluluk).');
                      }}
                      className={`py-1.5 px-2 rounded-lg border transition text-center cursor-pointer ${
                        simulationParticipants === 50 
                          ? 'bg-emerald-700 text-white border-emerald-700' 
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                      }`}
                    >
                      50 Katılımcı (%42)
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setSimulationParticipants(100);
                        onAddLog('Simülatör Şablonu', 'Hazır senaryo uygulandı: 100 Katılımcı (%83 Doluluk).');
                      }}
                      className={`py-1.5 px-2 rounded-lg border transition text-center cursor-pointer ${
                        simulationParticipants === 100 
                          ? 'bg-emerald-700 text-white border-emerald-700' 
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                      }`}
                    >
                      100 Katılımcı (%83)
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setSimulationParticipants(250);
                        setSimulationDays(10);
                        onAddLog('Simülatör Şablonu', 'Hazır senaryo uygulandı: 250 Katılımcı (Lider Kampı, 10 Gün).');
                      }}
                      className={`py-1.5 px-2 rounded-lg border transition text-center cursor-pointer ${
                        simulationParticipants === 250 
                          ? 'bg-emerald-700 text-white border-emerald-700' 
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                      }`}
                    >
                      250 Katılımcı (Lider)
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-3xs font-extrabold pt-1">
                    <button 
                      type="button"
                      onClick={() => {
                        setSimulationParticipants(60);
                        onAddLog('Simülatör Şablonu', 'Hazır senaryo uygulandı: %50 Nominal Doluluk (60 Katılımcı).');
                      }}
                      className={`py-1.5 px-2 rounded-lg border transition text-center cursor-pointer ${
                        simulationOccupancy === 50 
                          ? 'bg-indigo-700 text-white border-indigo-700' 
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                      }`}
                    >
                      %50 Doluluk
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setSimulationParticipants(96);
                        onAddLog('Simülatör Şablonu', 'Hazır senaryo uygulandı: %80 Nominal Doluluk (96 Katılımcı).');
                      }}
                      className={`py-1.5 px-2 rounded-lg border transition text-center cursor-pointer ${
                        simulationOccupancy === 80 
                          ? 'bg-indigo-700 text-white border-indigo-700' 
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                      }`}
                    >
                      %80 Doluluk
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setSimulationParticipants(120);
                        onAddLog('Simülatör Şablonu', 'Hazır senaryo uygulandı: %100 Tam Doluluk (120 Katılımcı).');
                      }}
                      className={`py-1.5 px-2 rounded-lg border transition text-center cursor-pointer ${
                        simulationOccupancy === 100 
                          ? 'bg-indigo-700 text-white border-indigo-700' 
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                      }`}
                    >
                      %100 Doluluk
                    </button>
                  </div>
                </div>

                {/* Live Slider inputs */}
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-2xs font-extrabold text-gray-600">
                      <span>Simüle Edilen Katılımcı Sayısı</span>
                      <span className="text-gray-900 font-mono">{simulationParticipants} Kişi</span>
                    </div>
                    <input 
                      type="range"
                      min="20"
                      max="300"
                      value={simulationParticipants}
                      onChange={(e) => setSimulationParticipants(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-full accent-emerald-700 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-2xs font-extrabold text-gray-600">
                      <span>Kişi Başı Dönemlik Paket Ücreti (Gelir)</span>
                      <span className="text-emerald-700 font-mono">{simulationPricePerPeriod.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <input 
                      type="range"
                      min="500"
                      max="10000"
                      step="100"
                      value={simulationPricePerPeriod}
                      onChange={(e) => setSimulationPricePerPeriod(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-full accent-emerald-700 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-2xs font-extrabold text-gray-600">
                      <span>Kamp Süresi</span>
                      <span className="text-gray-900 font-mono">{simulationDays} Gün</span>
                    </div>
                    <input 
                      type="range"
                      min="3"
                      max="21"
                      value={simulationDays}
                      onChange={(e) => setSimulationDays(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-full accent-emerald-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Simulation Results Output Box */}
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
                <span className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
                  <Coins className="w-4 h-4 text-emerald-700" /> Tahmini Simülasyon Sonuçları
                </span>
                
                <div className="p-4 rounded-xl border bg-gray-50 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2.5 bg-white rounded-lg border border-gray-150 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Kişi Başı Dönemlik Maliyet</span>
                        <span className="text-xs sm:text-sm font-extrabold text-gray-800 font-mono mt-0.5 block">
                          {simulatedMetrics.simTotalPerPersonPeriod.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} TL
                        </span>
                      </div>
                      <span className="text-[8px] text-gray-400 font-medium block mt-1">({simulatedMetrics.perPersonDay.toFixed(1)} TL/Gün × {simulationDays} Gün)</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-gray-150">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Toplam Gider</span>
                      <span className="text-xs sm:text-sm font-extrabold text-gray-800 font-mono">
                        {Math.round(simulatedMetrics.total).toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2.5 bg-white rounded-lg border border-gray-150">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Tahmini Gelir</span>
                      <span className="text-xs sm:text-sm font-extrabold text-indigo-700 font-mono">
                        {Math.round(simulatedMetrics.revenue).toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-gray-150">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Tahmini Kâr / Zarar</span>
                      <span className={`text-xs sm:text-sm font-black font-mono ${
                        simulatedMetrics.profitLoss >= 0 ? 'text-[#00875A]' : 'text-rose-700'
                      }`}>
                        {simulatedMetrics.profitLoss >= 0 ? '+' : ''}
                        {Math.round(simulatedMetrics.profitLoss).toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                  </div>

                  {/* Break-Even (Başa Baş Noktası) Widget */}
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-extrabold text-gray-500 uppercase">
                      <span>Başa Baş Noktası (Break-Even)</span>
                      <span className="text-[#00875A]">Paket Fiyatı ({simulationDays} Gün): {Math.round(simulatedMetrics.simulatedPackagePrice).toLocaleString('tr-TR')} TL</span>
                    </div>
                    
                    {!simulatedMetrics.isBreakEvenPossible ? (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-150">
                          <span>Asgari Doluluk</span>
                          <span className="font-mono">Kâr Elde Edilemez ⚠️</span>
                        </div>
                        <p className="text-[10px] text-rose-600/90 leading-relaxed bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                          <strong>Kritik Hata:</strong> Günlük paket ücreti, kişi başı günlük değişken giderden ({simulatedMetrics.originalVariablePerPersonDay.toFixed(2)} TL) daha düşüktür. Bu fiyatlandırma seviyesinde ne kadar çok katılımcı kaydolursa zarar o kadar artar! Lütfen paket fiyatını yükseltin veya değişken giderleri kısın.
                        </p>
                      </div>
                    ) : simulatedMetrics.breakEvenParticipants > campCapacity ? (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-150">
                          <span>Asgari Doluluk</span>
                          <span className="font-mono">%{simulatedMetrics.breakEvenOccupancy} doluluk (Kapasite Yetersiz ⚠️)</span>
                        </div>
                        <p className="text-[10px] text-amber-600/95 leading-relaxed bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                          Sabit giderleri amorti etmek için bu kampta en az <strong className="font-mono">{simulatedMetrics.breakEvenParticipants} katılımcı</strong> bulunmalıdır. Ancak bu sayı, kampın maksimum nominal kapasitesi olan <strong className="font-mono">{campCapacity} kişinin</strong> üzerindedir. Kamp bütçesi mevcut şartlarda kâr getiremez. Sabit giderleri optimize etmeyi veya paket ücretini artırmayı deneyin.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-emerald-800 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                          <span>Asgari Doluluk</span>
                          <span className="font-mono text-emerald-800">%{simulatedMetrics.breakEvenOccupancy} doluluk</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Sabit ve değişken maliyetleri sıfırlayabilmek için bu kampta en az <strong className="text-gray-600 font-mono">{simulatedMetrics.breakEvenParticipants} katılımcı</strong> bulunmalıdır.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 text-blue-800 text-[10px] rounded-xl border border-blue-100">
                  💡 <span className="font-extrabold">Ölçek Ekonomisi:</span> Katılımcı sayısı arttıkça, kişi başına düşen sabit gider yükü azalarak kârlılığı katlar.
                </div>

                {/* Formulas & Calculation Methodology Panel */}
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 space-y-2">
                  <span className="font-extrabold uppercase tracking-wider block">📐 Finansal Formüller ve Metodoloji</span>
                  <div className="space-y-1 text-emerald-800 leading-normal">
                    <div>• <strong>Kişi Başı Günlük Maliyet:</strong> Toplam Gider / (Katılımcı Sayısı × Gün Sayısı)</div>
                    <div>• <strong>Sabit Gider (Fixed Cost):</strong> Katılımcı sayısından bağımsız, zamana bağlı giderler (örn. İdari Personel, Arıtma Bakımı, Genel Elektrik). Günlük olarak hesaplanır ve dönem süresince sabit kalır.</div>
                    <div>• <strong>Değişken Gider (Variable Cost):</strong> Katılımcı başı tüketilen, kişi sayısı ile doğrudan ölçeklenen giderler (örn. Yemek İaşesi, Çarşaf Değişimi, Katılım Sertifikaları).</div>
                    <div>• <strong>Katılımcı Başı Günlük Katkı Payı:</strong> Günlük Paket Ücreti - Kişi Başı Günlük Değişken Gider.</div>
                    <div>• <strong>Başa Baş Noktası (Break-Even):</strong> Günlük Toplam Sabit Gider / Katılımcı Başı Günlük Katkı Payı. Bu sayı, tüm operasyonel giderleri sıfırlamak için gereken asgari katılımcı sayısını gösterir.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEDGER TAB */}
          {activeSubTab === 'ledger' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                <span className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-700" /> Detaylı Gider Kayıt Defteri ({filteredExpenses.length} Kalem)
                </span>
                
                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-48 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Gider ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-2xs pl-8 pr-3 py-1.5 border border-gray-200 rounded-xl focus:outline-emerald-600 bg-white font-medium"
                    />
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                  </div>

                  {/* Category select filter */}
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="text-2xs pl-7 pr-3 py-1.5 border border-gray-200 rounded-xl bg-white focus:outline-emerald-600 cursor-pointer font-bold"
                    >
                      <option value="All">Tüm Kategoriler</option>
                      <option value="Konaklama">Konaklama</option>
                      <option value="Yemek">Yemek</option>
                      <option value="Ulaşım">Ulaşım</option>
                      <option value="Aktivite">Aktivite / Spor</option>
                      <option value="Personel">Personel</option>
                      <option value="Genel Gider">Genel Gider</option>
                    </select>
                    <Filter className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Type filter */}
                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="text-2xs pl-7 pr-3 py-1.5 border border-gray-200 rounded-xl bg-white focus:outline-emerald-600 cursor-pointer font-bold"
                    >
                      <option value="All">Tüm Gider Tipleri</option>
                      <option value="Sabit">Sabit Gider</option>
                      <option value="Değişken">Değişken Gider</option>
                    </select>
                    <Filter className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Ledger - Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-2xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 font-extrabold uppercase">
                      <th className="p-3">Gider Adı</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Gider Tipi</th>
                      <th className="p-3">Tarih</th>
                      <th className="p-3">Açıklama</th>
                      <th className="p-3 text-right">Tutar (TL)</th>
                      <th className="p-3 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                    {filteredExpenses.map(expense => {
                      const colors = getCategoryColor(expense.category);
                      return (
                        <tr key={expense.id} className="hover:bg-gray-50/50 transition">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                               {getCategoryIcon(expense.category)}
                               <div className="font-bold text-gray-900">{expense.name}</div>
                             </div>
                            <div className="text-gray-400 text-3xs font-mono ml-6">{expense.id}</div>
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-3xs font-extrabold border ${colors.bg} ${colors.text} ${colors.border}`}>
                              {expense.category}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-3xs font-extrabold ${
                              expense.type === 'Sabit' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {expense.type}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500 font-mono">{expense.date}</td>
                          <td className="p-3 max-w-xs truncate text-gray-500 font-medium" title={expense.description}>
                            {expense.description}
                          </td>
                          <td className="p-3 text-right font-black font-mono text-gray-900">
                            {expense.amount.toLocaleString('tr-TR')} TL
                          </td>
                          <td className="p-3 flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditExpense(expense)}
                              className="p-1 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded transition cursor-pointer"
                              title="Gideri Düzenle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-1 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded transition cursor-pointer"
                              title="Gideri Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredExpenses.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400 italic">
                          Filtrelere uygun herhangi bir gider kaydı bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50/75 border-t border-gray-200">
                    <tr className="font-black text-gray-900">
                      <td className="p-3" colSpan={4}>Filtrelenmiş Toplam Gider Kalemi</td>
                      <td className="p-3 text-right text-emerald-800 font-black" colSpan={2}>
                        {filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('tr-TR')} TL
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Ledger - Mobile Card List */}
              <div className="block md:hidden space-y-3">
                {filteredExpenses.map(expense => {
                  const colors = getCategoryColor(expense.category);
                  return (
                    <div key={expense.id} className="bg-gray-50/70 p-4 rounded-xl border border-gray-150 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs leading-tight">{expense.name}</h4>
                          <p className="text-gray-400 text-[10px] font-mono mt-0.5">{expense.id} • {expense.date}</p>
                        </div>
                        <span className="text-xs sm:text-sm font-black font-mono text-emerald-800 shrink-0">
                          {expense.amount.toLocaleString('tr-TR')} TL
                        </span>
                      </div>
                      
                      {expense.description && (
                        <p className="text-gray-500 text-3xs font-semibold leading-normal bg-white p-2 rounded-lg border border-gray-100">
                          {expense.description}
                        </p>
                      )}

                      <div className="flex justify-between items-center pt-2.5 border-t border-gray-150/50">
                        <div className="flex flex-wrap gap-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${colors.bg} ${colors.text} ${colors.border}`}>
                            {expense.category}
                          </span>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                            expense.type === 'Sabit' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {expense.type}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditExpense(expense)}
                            className="p-1.5 bg-white hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 border border-gray-200 rounded-lg transition cursor-pointer"
                            title="Gideri Düzenle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-1.5 bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-600 border border-gray-200 rounded-lg transition cursor-pointer"
                            title="Gideri Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredExpenses.length === 0 && (
                  <div className="text-center py-8 text-gray-400 italic text-2xs bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Filtrelere uygun herhangi bir gider kaydı bulunamadı.
                  </div>
                )}

                <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 flex justify-between items-center text-xs font-black text-emerald-950">
                  <span>Filtrelenmiş Toplam Gider:</span>
                  <span className="font-mono text-emerald-800">
                    {filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('tr-TR')} TL
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Add New Expense Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-150 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-150 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-sm text-gray-900">
                  {editingExpenseId ? 'Gider Kaydını Düzenle' : 'Yeni Gider Giriş Kartı'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingExpenseId(null);
                }}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddExpense} className="p-5 space-y-4 text-3xs font-extrabold text-gray-500 uppercase">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-gray-500">Gider Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Yemekhane Sebze Alımı, Çit Onarımı vb."
                  value={newExpense.name}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-xs font-semibold uppercase"
                />
              </div>

              {/* Category and Type Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-gray-500">Kategori *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value as Expense['category'] }))}
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-xs font-semibold cursor-pointer"
                  >
                    <option value="Konaklama">Konaklama</option>
                    <option value="Yemek">Yemek</option>
                    <option value="Ulaşım">Ulaşım</option>
                    <option value="Aktivite">Aktivite / Spor</option>
                    <option value="Personel">Personel</option>
                    <option value="Genel Gider">Genel Gider</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-500">Gider Tipi *</label>
                  <select
                    value={newExpense.type}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, type: e.target.value as Expense['type'] }))}
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-xs font-semibold cursor-pointer"
                  >
                    <option value="Sabit">Sabit Gider</option>
                    <option value="Değişken">Değişken Gider</option>
                  </select>
                </div>
              </div>

              {/* Amount and Date Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-gray-500">Gider Tutarı (TL) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Tutar girin"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-xs font-semibold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-500">Kayıt Tarihi *</label>
                  <input
                    type="date"
                    required
                    value={newExpense.date}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-xs font-semibold font-mono cursor-pointer"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-gray-500">Açıklama</label>
                <textarea
                  placeholder="Gider detayları ve fatura/ödeme bilgileri..."
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-xs font-semibold"
                  rows={3}
                ></textarea>
              </div>

              {/* Form Actions */}
              <div className="pt-4 flex justify-end gap-2 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingExpenseId(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer text-xs font-bold transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl cursor-pointer text-xs font-bold shadow-xs transition"
                >
                  {editingExpenseId ? 'Güncelle' : 'Kaydet & Hesapla'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
