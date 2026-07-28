import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  CalendarDays, 
  Activity, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X, 
  Sparkles, 
  Check, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  PackageSearch,
  ShoppingCart,
  Printer,
  FileText,
  Download,
  Clock,
  BookOpenText
} from 'lucide-react';
import { MealPlan, Participant, InventoryItem, DailyMenu, Task, ShiftAssignment } from '../types';
import { INITIAL_INVENTORY, INITIAL_WEEKLY_MENU } from '../data';
import ReferansMenulerView from './ReferansMenulerView';

interface YemekhaneViewProps {
  participants: Participant[];
  mealPlans: MealPlan[];
  tasks: Task[];
  shifts: ShiftAssignment[];
  onUpdateTasks: (tasks: Task[]) => void;
  onUpdateShifts: (shifts: ShiftAssignment[]) => void;
  onUpdateMealPlans: (updated: MealPlan[]) => void;
  onAddLog: (action: string, details: string) => void;
}

// Healthy pre-loaded menu templates that can be chosen quickly!
const HEALTHY_MENU_TEMPLATES = [
  {
    name: 'Geleneksel Türk Kahvaltısı',
    mealType: 'Kahvaltı' as const,
    menu: ['Haşlanmış Yumurta', 'Kaşar Peyniri', 'Beyaz Peynir', 'Siyah ve Yeşil Zeytin', 'Bal-Tereyağı', 'Domates-Salatalık Söğüş', 'Yeşilay Bitki Çayı'],
    vegetarianCount: 45,
    glutenFreeCount: 12
  },
  {
    name: 'Protein Deposu Kahvaltı',
    mealType: 'Kahvaltı' as const,
    menu: ['Dereotlu Sebzeli Omlet', 'Süzme Peynir', 'Mevsim Yeşillikleri', 'Muzlu Yulaf Lapası', 'Ceviz İçi & Kuru Kayısı', 'Şekersiz Bitki Çayı'],
    vegetarianCount: 50,
    glutenFreeCount: 15
  },
  {
    name: 'Akdeniz Lifli Öğle Menüsü',
    mealType: 'Öğle Yemeği' as const,
    menu: ['Süzme Mercimek Çorbası', 'Zeytinyağlı Enginar Dolması', 'Siyez Bulgur Pilavı', 'Ev Yapımı Cacık', 'Cevizli Mevsim Salatası'],
    vegetarianCount: 65,
    glutenFreeCount: 18
  },
  {
    name: 'Klasik Besleyici Öğle Menüsü',
    mealType: 'Öğle Yemeği' as const,
    menu: ['Ezogelin Çorbası', 'Fırınlanmış Patatesli İzmir Köfte', 'Tereyağlı Pirinç Pilavı', 'Çoban Salatası', 'Doğal Meyve Kompostosu'],
    vegetarianCount: 20,
    glutenFreeCount: 20
  },
  {
    name: 'Hafif & Dengeli Akşam Menüsü',
    mealType: 'Akşam Yemeği' as const,
    menu: ['Sıcacık Tarhana Çorbası', 'Zeytinyağlı Taze Fasulye', 'Fırında Sebzeli Kabak Mücveri', 'Naneli Ayran', 'Akdeniz Yeşillikleri'],
    vegetarianCount: 75,
    glutenFreeCount: 25
  },
  {
    name: 'Sağlıklı Protein Akşam Menüsü',
    mealType: 'Akşam Yemeği' as const,
    menu: ['Yayla Çorbası', 'Fırınlanmış Kekikli Tavuk Sote', 'Nohutlu Bulgur Pilavı', 'Mevsim Salatası', 'Ev Yapımı Yoğurt'],
    vegetarianCount: 15,
    glutenFreeCount: 28
  },
  {
    name: 'Vitamin Deposu Ara Öğün',
    mealType: 'Ara Öğün' as const,
    menu: ['Karışık Mevsim Meyveleri Tabağı', 'Çiğ Badem ve İç Fındık', 'Doğal Maden Suyu'],
    vegetarianCount: 80,
    glutenFreeCount: 30
  }
];

export default function YemekhaneView({
  participants,
  mealPlans,
  tasks,
  shifts,
  onUpdateTasks,
  onUpdateShifts,
  onUpdateMealPlans,
  onAddLog
}: YemekhaneViewProps) {
  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    mealType: 'Öğle Yemeği' as MealPlan['mealType'],
    menuInput: '',
    vegetarianCount: 15,
    glutenFreeCount: 8
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealFilter, setSelectedMealFilter] = useState<string>('Tümü');
  const [isDietReportOpen, setIsDietReportOpen] = useState(false);

  // New states for Inventory and Weekly Auto Menu
  const [activeTab, setActiveTab] = useState<'gunluk' | 'haftalik' | 'depo' | 'referans'>('gunluk');
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [weeklyMenu, setWeeklyMenu] = useState<DailyMenu[]>(INITIAL_WEEKLY_MENU);

  // New states for Allergen Report Modal
  const [isAllergenPdfModalOpen, setIsAllergenPdfModalOpen] = useState(false);
  const [showPrintWarning, setShowPrintWarning] = useState(false);

  // Calculates dynamically
  const activeInCamp = participants.filter((p) => p.status === 'Kampta');
  
  const glutenFreeCount = activeInCamp.filter(
    (p) => p.allergies.toLowerCase().includes('gluten') || p.healthNote.toLowerCase().includes('gluten')
  ).length;

  const lactoseFreeCount = activeInCamp.filter(
    (p) => p.allergies.toLowerCase().includes('laktoz') || 
           p.allergies.toLowerCase().includes('süt') || 
           p.healthNote.toLowerCase().includes('laktoz')
  ).length;

  const vegetarianCount = activeInCamp.filter(
    (p) => p.allergies.toLowerCase().includes('vejetaryen') || p.healthNote.toLowerCase().includes('vejetaryen') || p.healthNote.toLowerCase().includes('vejeteryan')
  ).length;

  const allergyDetails = activeInCamp.filter(
    (p) => p.allergies && p.allergies.toLowerCase() !== 'yok' && p.allergies.toLowerCase() !== 'belirtilmedi'
  );

  // Advanced allergy and diet detailed fields
  const glutenFreeNames = activeInCamp
    .filter((p) => p.allergies.toLowerCase().includes('gluten') || p.healthNote.toLowerCase().includes('gluten'))
    .map((p) => p.name)
    .join(', ');

  const lactoseFreeNames = activeInCamp
    .filter((p) => p.allergies.toLowerCase().includes('laktoz') || p.allergies.toLowerCase().includes('süt') || p.healthNote.toLowerCase().includes('laktoz'))
    .map((p) => p.name)
    .join(', ');

  const vegetarianNames = activeInCamp
    .filter((p) => p.allergies.toLowerCase().includes('vejetaryen') || p.healthNote.toLowerCase().includes('vejetaryen') || p.healthNote.toLowerCase().includes('vejeteryan'))
    .map((p) => p.name)
    .join(', ');

  const nutAllergyCount = activeInCamp.filter(
    (p) => p.allergies.toLowerCase().includes('fıstık') || 
           p.allergies.toLowerCase().includes('fındık') || 
           p.allergies.toLowerCase().includes('ceviz') || 
           p.allergies.toLowerCase().includes('badem') || 
           p.allergies.toLowerCase().includes('kuru yemiş')
  ).length;

  const nutAllergyNames = activeInCamp
    .filter((p) => 
      p.allergies.toLowerCase().includes('fıstık') || 
      p.allergies.toLowerCase().includes('fındık') || 
      p.allergies.toLowerCase().includes('ceviz') || 
      p.allergies.toLowerCase().includes('badem') || 
      p.allergies.toLowerCase().includes('kuru yemiş')
    )
    .map((p) => p.name)
    .join(', ');

  const otherAllergies = activeInCamp.filter(
    (p) => p.allergies && p.allergies.toLowerCase() !== 'yok' && p.allergies.toLowerCase() !== 'belirtilmedi' &&
           !p.allergies.toLowerCase().includes('gluten') &&
           !p.allergies.toLowerCase().includes('laktoz') &&
           !p.allergies.toLowerCase().includes('süt') &&
           !p.allergies.toLowerCase().includes('vejetaryen') &&
           !p.allergies.toLowerCase().includes('vejeteryan') &&
           !p.allergies.toLowerCase().includes('fıstık') &&
           !p.allergies.toLowerCase().includes('fındık') &&
           !p.allergies.toLowerCase().includes('ceviz') &&
           !p.allergies.toLowerCase().includes('badem')
  );

  const handleDownloadAllergenReport = () => {
    let csvContent = "\uFEFF";
    csvContent += "Kimlik No;İsim Soyisim;Kategori;Cinsiyet;Oda/Bungalov;Telefon;Alerjen / Sağlık Notu\n";

    allergyDetails.forEach(p => {
      const row = [
        p.identityNumber,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        p.gender,
        `"${p.bungalowId || 'Atanmadı'}"`,
        `"${(p.phone || '').replace(/"/g, '""')}"`,
        `"${(p.allergies || '').replace(/"/g, '""')} - ${(p.healthNote || '').replace(/"/g, '""')}"`
      ].join(";");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Alerjen_Bilgi_Raporu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateNewWeek = () => {
    // Basic random menu generator from existing pool
    const breakfastPool = INITIAL_WEEKLY_MENU.flatMap(m => m.breakfast);
    const lunchPool = INITIAL_WEEKLY_MENU.flatMap(m => m.lunch);
    const dinnerPool = INITIAL_WEEKLY_MENU.flatMap(m => m.dinner);
    const snacksPool = INITIAL_WEEKLY_MENU.flatMap(m => m.snacks);

    const getRandomItems = (pool: any[], count: number) => {
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    // Find the last date in the current weeklyMenu
    let lastDate = new Date();
    if (weeklyMenu.length > 0) {
      lastDate = new Date(weeklyMenu[weeklyMenu.length - 1].date);
    }
    
    const newWeek: DailyMenu[] = [];
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + i);
      
      newWeek.push({
        date: nextDate.toISOString().split('T')[0],
        breakfast: getRandomItems(breakfastPool, 3),
        lunch: getRandomItems(lunchPool, 3),
        dinner: getRandomItems(dinnerPool, 3),
        snacks: getRandomItems(snacksPool, 1),
        totalPortions: 120,
        veganPortions: 15,
        glutenFreePortions: 5,
        peanutFreePortions: 3
      });
    }

    setWeeklyMenu(newWeek);
  };

  // Dynamic Menu Allergen Matching Engine
  const getMenuAllergenAlerts = (menuList: string[]) => {
    const alerts: { type: string; icon: string; title: string; color: string; matchedFoods: string[]; count: number; names: string }[] = [];
    if (!menuList || menuList.length === 0) return alerts;

    // 1. Gluten matching
    const glutenFoods = menuList.filter(f => {
      const fl = f.toLowerCase();
      return fl.includes('çorba') || fl.includes('pilav') || fl.includes('ekmek') || fl.includes('makarna') || fl.includes('un') || fl.includes('börek') || fl.includes('mantı') || fl.includes('siyez') || fl.includes('bulgur') || fl.includes('şehriye') || fl.includes('pide') || fl.includes('kek');
    });
    if (glutenFoods.length > 0 && glutenFreeCount > 0) {
      alerts.push({
        type: 'gluten',
        icon: '🌾',
        title: 'Gluten Alerjeni',
        color: 'text-amber-800 bg-amber-50/70 border-amber-200/50',
        matchedFoods: glutenFoods,
        count: glutenFreeCount,
        names: glutenFreeNames
      });
    }

    // 2. Lactose matching
    const lactoseFoods = menuList.filter(f => {
      const fl = f.toLowerCase();
      return fl.includes('peynir') || fl.includes('süt') || fl.includes('yoğurt') || fl.includes('cacık') || fl.includes('ayran') || fl.includes('tereyağ') || fl.includes('krema') || fl.includes('puding') || fl.includes('püre') || fl.includes('omlet');
    });
    if (lactoseFoods.length > 0 && lactoseFreeCount > 0) {
      alerts.push({
        type: 'lactose',
        icon: '🥛',
        title: 'Süt/Laktoz Alerjeni',
        color: 'text-blue-850 bg-blue-50/70 border-blue-200/50',
        matchedFoods: lactoseFoods,
        count: lactoseFreeCount,
        names: lactoseFreeNames
      });
    }

    // 3. Vegetarian matching (Meat detect)
    const meatFoods = menuList.filter(f => {
      const fl = f.toLowerCase();
      return fl.includes('köfte') || fl.includes('sote') || fl.includes('tavuk') || fl.includes('et') || fl.includes('kıyma') || fl.includes('kebap') || fl.includes('döner') || fl.includes('sucuk') || fl.includes('salam') || fl.includes('kavurma') || fl.includes('balık');
    });
    if (meatFoods.length > 0 && vegetarianCount > 0) {
      alerts.push({
        type: 'vegetarian',
        icon: '🥗',
        title: 'Et Ürünü (Vejetaryen Alternatif)',
        color: 'text-emerald-850 bg-emerald-50/70 border-emerald-200/50',
        matchedFoods: meatFoods,
        count: vegetarianCount,
        names: vegetarianNames
      });
    }

    // 4. Nuts matching
    const nutFoods = menuList.filter(f => {
      const fl = f.toLowerCase();
      return fl.includes('fındık') || fl.includes('fıstık') || fl.includes('ceviz') || fl.includes('badem') || fl.includes('kaju') || fl.includes('çikolata') || fl.includes('helva');
    });
    if (nutFoods.length > 0 && nutAllergyCount > 0) {
      alerts.push({
        type: 'nuts',
        icon: '🥜',
        title: 'Kuruyemiş Alerjeni',
        color: 'text-rose-850 bg-rose-50/70 border-rose-200/50',
        matchedFoods: nutFoods,
        count: nutAllergyCount,
        names: nutAllergyNames
      });
    }

    return alerts;
  };

  // Filter meal plans
  const filteredMealPlans = mealPlans.filter(plan => {
    const matchesSearch = plan.menu.some(food => food.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          plan.mealType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plan.date.includes(searchQuery);
    const matchesMealType = selectedMealFilter === 'Tümü' || plan.mealType === selectedMealFilter;
    return matchesSearch && matchesMealType;
  });

  const handleOpenAddModal = () => {
    setEditingMealId(null);
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      mealType: 'Öğle Yemeği',
      menuInput: '',
      vegetarianCount: Math.max(10, vegetarianCount),
      glutenFreeCount: Math.max(5, glutenFreeCount)
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (meal: MealPlan) => {
    setEditingMealId(meal.id);
    setFormData({
      date: meal.date,
      mealType: meal.mealType,
      menuInput: meal.menu.join(', '),
      vegetarianCount: meal.vegetarianCount,
      glutenFreeCount: meal.glutenFreeCount
    });
    setIsModalOpen(true);
  };

  const handleSelectTemplate = (tpl: typeof HEALTHY_MENU_TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      mealType: tpl.mealType,
      menuInput: tpl.menu.join(', '),
      vegetarianCount: Math.max(tpl.vegetarianCount, vegetarianCount),
      glutenFreeCount: Math.max(tpl.glutenFreeCount, glutenFreeCount)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.menuInput.trim()) {
      alert('Lütfen menü içeriğini giriniz.');
      return;
    }

    const parsedMenu = formData.menuInput
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (editingMealId) {
      // Edit mode
      const updated = mealPlans.map(mp => {
        if (mp.id === editingMealId) {
          return {
            ...mp,
            date: formData.date,
            mealType: formData.mealType,
            menu: parsedMenu,
            vegetarianCount: Number(formData.vegetarianCount),
            glutenFreeCount: Number(formData.glutenFreeCount)
          };
        }
        return mp;
      });
      onUpdateMealPlans(updated);
      onAddLog(
        'Öğün Planı Güncellendi', 
        `Tarih: ${formData.date}, Öğün: ${formData.mealType} planı güncellendi. Menü: ${parsedMenu.slice(0, 3).join(', ')}...`
      );
    } else {
      // Add mode
      const newMeal: MealPlan = {
        id: `MP-${Date.now()}`,
        date: formData.date,
        mealType: formData.mealType,
        menu: parsedMenu,
        vegetarianCount: Number(formData.vegetarianCount),
        glutenFreeCount: Number(formData.glutenFreeCount)
      };
      
      // Sort meal plans by date descending
      const updated = [newMeal, ...mealPlans].sort((a, b) => b.date.localeCompare(a.date));
      onUpdateMealPlans(updated);
      onAddLog(
        'Yeni Öğün Planı Eklendi', 
        `Tarih: ${formData.date}, Öğün: ${formData.mealType} olarak yeni plan eklendi.`
      );
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, mealType: string, date: string) => {
    if (confirm(`${date} tarihli ${mealType} öğün planını silmek istediğinize emin misiniz?`)) {
      const updated = mealPlans.filter(mp => mp.id !== id);
      onUpdateMealPlans(updated);
      onAddLog(
        'Öğün Planı Silindi', 
        `${date} tarihli ${mealType} öğün planı kayıtlardan kaldırıldı.`
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="yemekhane-module">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-sans">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600 animate-pulse" />
            Yemekhane Yönetimi
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Mutfak operasyonları, depo yönetimi ve genel yemekhane işleyişi.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-sans">
            <CalendarDays className="w-5 h-5 text-emerald-600 animate-pulse" />
            Öğün Planlama
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gönüllü gıda alerjilerine, diyet tercihlerine göre porsiyon kontrolü ve dinamik menü yönetimi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsAllergenPdfModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer w-full sm:w-auto shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Alerjen Bilgi Raporu (PDF)
          </button>
          <button
            onClick={handleOpenAddModal}
            className="bg-emerald-850 hover:bg-emerald-950 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer w-full sm:w-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Yeni Öğün Planı Ekle
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('gunluk')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'gunluk' ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Manuel Menü & Servis Planı
        </button>
        <button
          onClick={() => setActiveTab('haftalik')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'haftalik' ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Otomatik Haftalık Menü
        </button>
        <button
          onClick={() => setActiveTab('depo')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'depo' ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <PackageSearch className="w-4 h-4" />
          Depo & Erzak Stok
        </button>
        <button
          onClick={() => setActiveTab('referans')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'referans' ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <BookOpenText className="w-4 h-4" />
          Referans Menüler
        </button>
      </div>

      {activeTab === 'referans' && <ReferansMenulerView />}

      {activeTab === 'gunluk' && (
        <>
          {/* Kitchen metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-xs">
          <span className="text-3xs font-extrabold text-gray-400 uppercase tracking-wide">Aktif Yemek Yiyen Katılımcı</span>
          <h3 className="text-lg font-bold text-gray-900 mt-1">{activeInCamp.length} Gönüllü</h3>
          <span className="text-4xs text-gray-400 mt-1 block">Saha yoklamasındaki "Kampta" durumu</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 border-l-4 border-l-amber-500 shadow-xs text-xs">
          <span className="text-3xs font-extrabold text-gray-400 uppercase tracking-wide">Glütensiz Porsiyon Talebi</span>
          <h3 className="text-lg font-bold text-amber-800 mt-1">{glutenFreeCount} Porsiyon</h3>
          <span className="text-4xs text-gray-400 mt-1 block">Sağlık beyanlarına göre otomatik</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 border-l-4 border-l-emerald-500 shadow-xs text-xs">
          <span className="text-3xs font-extrabold text-gray-400 uppercase tracking-wide">Laktoz Hassasiyeti Talebi</span>
          <h3 className="text-lg font-bold text-emerald-800 mt-1">{lactoseFreeCount} Süt/Laktozsuz</h3>
          <span className="text-4xs text-gray-400 mt-1 block">Özel alerjen süt ve süt ürünleri muafiyeti</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 border-l-4 border-l-emerald-600 shadow-xs text-xs">
          <span className="text-3xs font-extrabold text-gray-400 uppercase tracking-wide">Vejetaryen Porsiyon Talebi</span>
          <h3 className="text-lg font-bold text-emerald-800 mt-1">{vegetarianCount} Porsiyon</h3>
          <span className="text-4xs text-gray-400 mt-1 block">Beyan edilen beslenme listesi bazlı</span>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Menus Listing */}
        <div className="xl:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              Menü Günlüğü &amp; Planlar listesi
            </h3>

            {/* Micro Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Yemek veya tarih ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-gray-50 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500 w-full sm:w-48 placeholder-gray-450 font-medium"
                />
              </div>

              <select
                value={selectedMealFilter}
                onChange={(e) => setSelectedMealFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg py-1 px-2.5 text-xs text-gray-700 font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="Tümü">Öğünler: Tümü</option>
                <option value="Kahvaltı">Kahvaltı</option>
                <option value="Öğle Yemeği">Öğle Yemeği</option>
                <option value="Akşam Yemeği">Akşam Yemeği</option>
                <option value="Ara Öğün">Ara Öğün</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {filteredMealPlans.length > 0 ? (
              filteredMealPlans.map((meal) => (
                <div key={meal.id} className="p-4 rounded-xl bg-gray-50/70 border border-gray-200/80 hover:border-emerald-200/80 transition duration-200 shadow-3xs space-y-3 relative group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-4xs font-black uppercase tracking-wider shadow-4xs ${
                        meal.mealType === 'Kahvaltı' ? 'bg-amber-100 text-amber-800 border border-amber-200/50' :
                        meal.mealType === 'Öğle Yemeği' ? 'bg-teal-100 text-teal-800 border border-teal-200/50' :
                        meal.mealType === 'Akşam Yemeği' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50' :
                        'bg-purple-100 text-purple-800 border border-purple-200/50'
                      }`}>
                        {meal.mealType}
                      </span>
                      <span className="text-3xs font-mono text-gray-500 font-bold bg-white px-2 py-0.5 rounded border border-gray-150">
                        {meal.date}
                      </span>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(meal)}
                        className="p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-200 hover:text-emerald-700 transition cursor-pointer text-gray-400"
                        title="Öğün Planını Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(meal.id, meal.mealType, meal.date)}
                        className="p-1.5 hover:bg-white rounded border border-transparent hover:border-red-100 hover:text-red-700 transition cursor-pointer text-gray-400"
                        title="Öğün Planını Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Food components grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-gray-150 text-xs text-gray-700 font-medium">
                    {meal.menu.map((food, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-1.5 py-0.5">
                        <span className="text-emerald-500">✔</span>
                        <p>{food}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Dynamic allergen matching alert */}
                  {(() => {
                    const alerts = getMenuAllergenAlerts(meal.menu);
                    if (alerts.length === 0) return null;
                    return (
                      <div className="space-y-1.5 p-3 bg-red-50/25 border border-red-100/60 rounded-lg">
                        <span className="text-4xs font-black text-red-900 tracking-wider uppercase block flex items-center gap-1">
                          ⚠️ Kayıt Sistemi Alerjen &amp; Diyet Eşleşmesi:
                        </span>
                        <div className="space-y-1">
                          {alerts.map((alert, aIdx) => (
                            <div key={aIdx} className={`text-4xs font-bold px-2.5 py-1.5 rounded-lg border flex flex-col gap-0.5 leading-relaxed ${alert.color}`}>
                              <span className="font-extrabold flex items-center gap-1 uppercase tracking-wider text-[10px]">
                                {alert.icon} {alert.title} ({alert.count} Kişi)
                              </span>
                              <div className="text-[10px] text-gray-600 font-medium normal-case">
                                <span className="font-bold text-red-800">Uyumsuz Ögeler:</span> {alert.matchedFoods.join(', ')}
                              </div>
                              <div className="text-[10px] text-gray-500 font-medium normal-case truncate max-w-full">
                                <span className="font-bold text-gray-700">Etkilenenler:</span> {alert.names}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Dynamic required portions */}
                  <div className="flex flex-wrap gap-4 text-4xs uppercase tracking-wider text-gray-500 font-black pt-1 px-1">
                    <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50/60 px-2 py-0.5 rounded border border-emerald-100/30">
                      🥗 Vejetaryen Alternatif: {meal.vegetarianCount} Porsiyon
                    </span>
                    <span className="flex items-center gap-1 text-amber-800 bg-amber-50/60 px-2 py-0.5 rounded border border-amber-100/30">
                      🌾 Glutensiz Alternatif: {meal.glutenFreeCount} Porsiyon
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <UtensilsCrossed className="w-10 h-10 text-gray-300 mx-auto stroke-1" />
                <p className="text-xs text-gray-400 italic mt-3">Arama kriterlerine uygun hiçbir menü planı bulunamadı.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Dietary Warnings / Cooking Report */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div 
            onClick={() => setIsDietReportOpen(!isDietReportOpen)}
            className="pb-3 border-b flex justify-between items-center cursor-pointer select-none"
          >
            <div>
              <h3 className="font-bold text-sm text-red-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-red-650 animate-pulse" />
                Şef İçin Alerjik &amp; Diyet Raporu
              </h3>
              <p className="text-5xs text-gray-400 uppercase tracking-widest mt-1 font-bold">Aşçı ve mutfak ekibi ek gıda direktifleri</p>
            </div>
            <button type="button" className="text-gray-400 hover:text-red-600 p-1">
              {isDietReportOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {isDietReportOpen ? (
            <>
              {allergyDetails.length > 0 ? (
                <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {allergyDetails.map((student) => (
                    <div key={student.id} className="p-3 border rounded-xl text-xs space-y-1.5 bg-red-50/10 border-red-150 shadow-3xs hover:bg-red-50/20 transition duration-150">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-neutral-900">{student.name}</span>
                        <span className="font-mono text-emerald-850 font-black text-3xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/70">
                          {student.bungalowId ? `Oda: ${student.bungalowId}` : 'Odasız'}
                        </span>
                      </div>
                      <div className="pt-1 space-y-1">
                        <p className="text-3xs text-gray-600 leading-normal">
                          <strong className="text-red-700">Alerjiler:</strong> {student.allergies}
                        </p>
                        {student.chronicDiseases !== 'Yok' && (
                          <p className="text-3xs text-gray-600 leading-normal">
                            <strong>Kronik:</strong> {student.chronicDiseases}
                          </p>
                        )}
                        {student.healthNote && (
                          <div className="text-4xs text-amber-800 bg-amber-50/40 p-1.5 rounded border border-amber-100/40 font-semibold italic">
                            Mutfak Notu: {student.healthNote}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic py-6 text-center">Şu an kampta diyet gıda muafiyeti olan aktif gönüllü bulunmuyor.</p>
              )}
            </>
          ) : (
            <p className="text-3xs text-gray-400 italic text-center py-2">Diyet gereksinimi olan tüm kişileri listelemek için yukarıya tıklayıp açınız.</p>
          )}

          <div className="pt-4 border-t border-gray-55">
            <span className="text-5xs block text-gray-400 font-extrabold uppercase mb-2">Kurumsal standartlar</span>
            <a 
              href="https://kamplar.yesilay.org.tr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-between p-2.5 rounded bg-emerald-50/60 border border-emerald-100 text-5xs font-black uppercase tracking-wider text-emerald-800 hover:bg-emerald-100/80 transition"
            >
              <span>Yeşilay Menü Standartları Kılavuzu</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Unified Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-150 shadow-xl max-w-lg w-full overflow-hidden animate-zoom-in my-auto">
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-emerald-300" />
                <h4 className="font-extrabold text-sm font-sans tracking-tight">
                  {editingMealId ? 'Öğün Planını Düzenle' : 'Yeni Öğün Menüsü Oluştur'}
                </h4>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-semibold text-gray-700">
              
              {/* Quick Preset Selector - Only show in add mode or as preset prefiller */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-105/50 space-y-1.5">
                <span className="text-4xs uppercase tracking-wider text-emerald-800 font-black flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600 animate-spin" />
                  Hızlı Besleyici Yeşilay Şablonları
                </span>
                <p className="text-5xs font-medium text-gray-500 leading-normal">
                  Seçtiğiniz şablon içeriği, alerji kotaları ve mutfak ihtiyaçları doğrultusunda saniyeler içinde menüyü doldurur.
                </p>
                <div className="flex flex-wrap gap-1 pt-1.5 max-h-[100px] overflow-y-auto pr-1">
                  {HEALTHY_MENU_TEMPLATES.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className="bg-white hover:bg-emerald-50 text-[10px] text-gray-700 hover:text-emerald-900 border border-gray-200 hover:border-emerald-350 px-2.5 py-1 rounded transition cursor-pointer font-bold shrink-0 shadow-5xs"
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-4xs text-gray-400 font-extrabold uppercase block">Uygulama Tarihi</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-4xs text-gray-400 font-extrabold uppercase block">Öğün Türü</label>
                  <select
                    value={formData.mealType}
                    onChange={(e) => setFormData(prev => ({ ...prev, mealType: e.target.value as MealPlan['mealType'] }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="Kahvaltı">Kahvaltı</option>
                    <option value="Öğle Yemeği">Öğle Yemeği</option>
                    <option value="Akşam Yemeği">Akşam Yemeği</option>
                    <option value="Ara Öğün">Ara Öğün</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-4xs text-gray-400 font-extrabold uppercase block">Menü İçeriği (Yemekler)</label>
                  <span className="text-5xs text-gray-450 font-bold">Virgülle ayırarak yazınız</span>
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="örn: Süzme Mercimek Çorbası, Sebzeli İzmir Köfte, Pirinç Pilavı, Mevsim Salatası"
                  value={formData.menuInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, menuInput: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium placeholder-gray-400 focus:outline-none focus:border-emerald-600 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200/50">
                <div className="space-y-1">
                  <label className="text-4xs text-emerald-800 font-black uppercase block">🥗 Vejetaryen Kotası (Porsiyon)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.vegetarianCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, vegetarianCount: Number(e.target.value) }))}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-gray-400 font-medium block">Kamptaki toplam talep: {vegetarianCount}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-4xs text-amber-800 font-black uppercase block">🌾 Glutensiz Kotası (Porsiyon)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.glutenFreeCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, glutenFreeCount: Number(e.target.value) }))}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-gray-400 font-medium block">Kamptaki toplam talep: {glutenFreeCount}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs py-2 px-4 rounded-xl transition cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-2 px-4 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-3xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingMealId ? 'Değişiklikleri Kaydet' : 'Planı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}

      {activeTab === 'haftalik' && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Yapay Zeka Destekli Otomatik Haftalık Menü
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Besin değerleri ve alerjen uyarılarıyla birlikte tüm kamp dönemi için menü oluşturulur.
              </p>
            </div>
            <button 
              onClick={handleGenerateNewWeek}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-2 px-4 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Yeni Hafta Oluştur
            </button>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {weeklyMenu.map((menu, idx) => (
              <div key={idx} className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100 space-y-4">
                <h4 className="font-bold text-sm text-gray-900 border-b border-gray-200 pb-2">{menu.date} Menüsü</h4>
                
                <div className="space-y-4">
                  {['breakfast', 'lunch', 'dinner', 'snacks'].map(mealKey => (
                    <div key={mealKey} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                      <h5 className="text-xs font-bold text-emerald-800 capitalize mb-2 border-b border-gray-100 pb-1">
                        {mealKey === 'breakfast' ? 'Kahvaltı' : mealKey === 'lunch' ? 'Öğle Yemeği' : mealKey === 'dinner' ? 'Akşam Yemeği' : 'Ara Öğün'}
                      </h5>
                      <ul className="space-y-1.5">
                        {(menu as any)[mealKey].map((item: any, i: number) => (
                          <li key={i} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">{item.name}</span>
                              {item.allergens.length > 0 && (
                                <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 rounded-full font-bold">
                                  {item.allergens.join(', ')}
                                </span>
                              )}
                              {item.isVegan && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 rounded-full font-bold">Vegan</span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">{item.nutritionalInfo.calories} kcal</span>
                          </li>
                        ))}
                      </ul>

                      {/* Dynamic weekly menu allergen match warning */}
                      {(() => {
                        const mealItems = (menu as any)[mealKey].map((item: any) => item.name);
                        const alerts = getMenuAllergenAlerts(mealItems);
                        if (alerts.length === 0) return null;
                        return (
                          <div className="mt-2.5 space-y-1 pt-2 border-t border-gray-100">
                            <span className="text-[9px] uppercase tracking-wider text-rose-800 font-extrabold block">⚠️ Alerji Çakışma Uyarısı:</span>
                            {alerts.map((alert, aIdx) => (
                              <div key={aIdx} className={`text-[9px] font-bold px-2 py-1 rounded-lg border flex flex-col gap-0.5 leading-tight ${alert.color}`}>
                                <span className="flex items-center gap-1 font-extrabold uppercase tracking-wide">
                                  {alert.icon} {alert.title} ({alert.count} Kişi)
                                </span>
                                <span className="text-gray-500 font-medium normal-case text-3xs truncate max-w-full">
                                  Gönüllüler: {alert.names}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
                
                <div className="bg-emerald-800 p-3 rounded-lg flex justify-between items-center text-white text-xs font-bold">
                  <span>Toplam Porsiyon: {menu.totalPortions}</span>
                  <div className="flex gap-3 text-[10px]">
                    <span className="bg-emerald-900 px-2 py-1 rounded">Vejetaryen: {menu.veganPortions}</span>
                    <span className="bg-emerald-900 px-2 py-1 rounded">Glütensiz: {menu.glutenFreePortions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'depo' && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <PackageSearch className="w-5 h-5 text-emerald-600" />
                Depo ve Erzak Stok Takibi
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Güncel erzak durumu, kritik eşik uyarıları ve tüketim girişi.
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600">
                  <th className="p-3 uppercase">Ürün Kodu</th>
                  <th className="p-3 uppercase">Malzeme Adı</th>
                  <th className="p-3 uppercase">Kategori</th>
                  <th className="p-3 uppercase">Miktar</th>
                  <th className="p-3 uppercase">Durum</th>
                  <th className="p-3 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-800 font-medium">
                {inventory.map(item => {
                  const isCritical = item.quantity <= item.minThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-mono text-gray-500">{item.id}</td>
                      <td className="p-3 font-bold">{item.name}</td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3 font-mono">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-3">
                        {isCritical ? (
                          <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-[10px] font-bold">Kritik Stok</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-bold">Yeterli</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => {
                            if (item.quantity > 0) {
                              setInventory(prev => prev.map(i => i.id === item.id ? {...i, quantity: i.quantity - 1} : i));
                              onAddLog('Stok Düşümü', `${item.name} ürününden 1 ${item.unit} düşüldü.`);
                            }
                          }}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold text-[10px] transition"
                        >
                          Tüketim Düş (-1)
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Allergen & Diet Report Printable PDF Modal */}
      {isAllergenPdfModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-8 overflow-hidden flex flex-col relative print:p-0 print:shadow-none print:my-0">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 print:hidden bg-slate-50">
              <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 animate-pulse" />
                Mutfak Alerjen ve Özel Diyet Analiz Raporu
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Yazdır / PDF Kaydet
                </button>
                <button
                  onClick={handleDownloadAllergenReport}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Excel/CSV İndir
                </button>
                <button 
                  onClick={() => setIsAllergenPdfModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1.5 hover:bg-gray-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="p-8 overflow-y-auto max-h-[75vh] bg-gray-50/50 print:bg-white print:p-0 print:max-h-full print:overflow-visible flex justify-center">
              <div 
                id="printable-allergen-report" 
                className="w-[820px] min-h-[1100px] bg-white rounded-2xl p-10 border border-gray-200 shadow-lg print:border-none print:shadow-none print:rounded-none print:p-0"
              >
                {/* Print Styles */}
                <style>{`
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    #printable-allergen-report, #printable-allergen-report * {
                      visibility: visible !important;
                    }
                    #printable-allergen-report {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      border: none !important;
                      box-shadow: none !important;
                      padding: 0 !important;
                      margin: 0 !important;
                    }
                  }
                `}</style>

                {/* Report Header */}
                <div className="flex items-center justify-between border-b-4 border-emerald-600 pb-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                      <svg viewBox="0 0 100 100" className="w-14 h-14 object-contain">
                        <path
                          d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z"
                          fill="#00AB41"
                        />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-sm font-black text-emerald-800 tracking-wide uppercase leading-tight">T.C. TÜRKİYE YEŞİLAY CEMİYETİ</h1>
                      <h2 className="text-[11px] font-extrabold text-slate-700 tracking-wider mt-0.5">GENÇLİK KAMPLARI GENEL KOORDİNATÖRLÜĞÜ</h2>
                      <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">YEMEKHANE &amp; GIDA GÜVENLİĞİ BİRİMİ</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-block bg-emerald-50 text-emerald-800 text-[9px] font-black px-2.5 py-1 rounded-full border border-emerald-150 uppercase tracking-widest mb-1.5">
                      GIDA GÜVENLİĞİ RAPORU
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold">Döküman No: <span className="text-gray-700">YMK-2026-ALR</span></p>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">Tarih: <span className="text-gray-700">{new Date().toLocaleDateString('tr-TR')}</span></p>
                  </div>
                </div>

                {/* Subject Section */}
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-150 mb-6 text-center">
                  <h3 className="font-extrabold text-base text-slate-800 uppercase tracking-wider">
                    KAMP GRUBU DETAYLI ALERJEN &amp; ÖZEL DİYET ANALİZ RAPORU
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                    Bu rapor, sistemdeki onaylı ve kampta olan gönüllülerin kayıt formunda beyan ettikleri gıda alerjileri, diyet tercihleri ve sağlık durumlarına göre yemekhane birimi tarafından porsiyon planlaması yapılması amacıyla otomatik olarak üretilmiştir.
                  </p>
                </div>

                {/* Summary Metrics Grid */}
                <div className="grid grid-cols-6 gap-3 mb-8">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center col-span-1">
                    <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">NÜFUS</p>
                    <p className="text-lg font-black text-slate-800 mt-1">{activeInCamp.length}</p>
                    <span className="text-[9px] text-gray-500 font-bold">Gönüllü</span>
                  </div>
                  <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-200/50 text-center col-span-1">
                    <p className="text-[9px] font-extrabold text-amber-800 uppercase tracking-wider">🌾 GLUTEN</p>
                    <p className="text-lg font-black text-amber-700 mt-1">{glutenFreeCount}</p>
                    <span className="text-[9px] text-amber-600 font-bold">Glütensiz</span>
                  </div>
                  <div className="bg-blue-50/40 p-3 rounded-xl border border-blue-200/50 text-center col-span-1">
                    <p className="text-[9px] font-extrabold text-blue-800 uppercase tracking-wider">🥛 LAKTOZ</p>
                    <p className="text-lg font-black text-blue-700 mt-1">{lactoseFreeCount}</p>
                    <span className="text-[9px] text-blue-600 font-bold">Laktozsuz</span>
                  </div>
                  <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-200/50 text-center col-span-1">
                    <p className="text-[9px] font-extrabold text-rose-850 uppercase tracking-wider">🥜 K.YEMİŞ</p>
                    <p className="text-lg font-black text-rose-700 mt-1">{nutAllergyCount}</p>
                    <span className="text-[9px] text-rose-600 font-bold">Fındık/Fıstık</span>
                  </div>
                  <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-200/50 text-center col-span-1">
                    <p className="text-[9px] font-extrabold text-emerald-850 uppercase tracking-wider">🥗 VEJETARYEN</p>
                    <p className="text-lg font-black text-emerald-700 mt-1">{vegetarianCount}</p>
                    <span className="text-[9px] text-emerald-600 font-bold">Sebze Diye.</span>
                  </div>
                  <div className="bg-purple-50/40 p-3 rounded-xl border border-purple-200/50 text-center col-span-1">
                    <p className="text-[9px] font-extrabold text-purple-800 uppercase tracking-wider">🍒 DİĞER</p>
                    <p className="text-lg font-black text-purple-700 mt-1">{otherAllergies.length}</p>
                    <span className="text-[9px] text-purple-600 font-bold">Özel Gıda</span>
                  </div>
                </div>

                {/* Distribution Warning / Recommendation */}
                <div className="bg-amber-50/20 p-4 rounded-xl border border-amber-200/30 mb-8 text-xs leading-relaxed text-amber-900">
                  <h4 className="font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-amber-850 mb-1">
                    💡 MUTFAK ŞEFİ VE SERVİS PERSONELİ İÇİN ÖNEMLİ TALİMATLAR:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 font-medium">
                    <li>Öğünlerde hazırlanacak ana yemeklerin yanına mutlaka <strong>{vegetarianCount} porsiyon vejetaryen alternatif</strong> gıda ilave edilecektir.</li>
                    <li>Sıcak ekmek servisinde <strong>en az {glutenFreeCount} paket glütensiz ekmek</strong> ayrıca muhafaza edilmeli ve doğrudan hak sahiplerine teslim edilmelidir.</li>
                    <li>Sütlü tatlılar veya yoğurtlu garnitür ikramlarında laktoz duyarlılığı olan <strong>{lactoseFreeCount} kişi için laktozsuz alternatif</strong> (meyve tabağı veya laktozsuz süt ürünleri) hazırlanmalıdır.</li>
                    <li>Mutfak tezgahlarında çapraz bulaşmayı önlemek için glütensiz ürün hazırlığı öncesinde tüm çalışma alanları ve bıçaklar sterilize edilmelidir.</li>
                  </ul>
                </div>

                {/* Table Title */}
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1.5 flex justify-between items-center">
                  <span>Hassasiyeti Olan Katılımcı ve Personel Listesi</span>
                  <span className="text-[10px] text-gray-500 font-bold font-mono">Toplam {allergyDetails.length} Kayıt</span>
                </h4>

                {/* Table */}
                <div className="overflow-hidden border border-gray-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-gray-200 text-[10px] font-extrabold text-slate-700 uppercase">
                        <th className="p-3 w-12 text-center">No</th>
                        <th className="p-3 w-40">Adı Soyadı</th>
                        <th className="p-3 w-28">Kategori</th>
                        <th className="p-3 w-24">Bungalov / Oda</th>
                        <th className="p-3 w-48 text-rose-800">Alerjen Hassasiyeti</th>
                        <th className="p-3 w-48 text-slate-800">Kronik Rahatsızlık &amp; Not</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-[11px] text-gray-800 font-bold">
                      {allergyDetails.length > 0 ? (
                        allergyDetails.map((p, pIdx) => (
                          <tr key={p.id} className="hover:bg-gray-50/50">
                            <td className="p-3 text-center text-gray-400 font-mono">{pIdx + 1}</td>
                            <td className="p-3 font-extrabold text-slate-900">{p.name}</td>
                            <td className="p-3 text-slate-600 text-xs">{p.category || 'Katılımcı'}</td>
                            <td className="p-3 font-mono text-xs">{p.bungalowId ? p.bungalowId : 'Atanmadı'}</td>
                            <td className="p-3 text-rose-700 text-xs bg-rose-50/20">{p.allergies}</td>
                            <td className="p-3 text-gray-500 font-medium text-xs leading-relaxed">{p.healthNote || p.chronicDiseases || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400 italic font-medium">
                            Kamp içerisinde aktif herhangi bir gıda alerjisi beyan eden gönüllü bulunmamaktadır.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Official Signatures Section */}
                <div className="mt-16 flex justify-center text-center border-t border-gray-200 pt-8">
                  <div className="space-y-12 w-64">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Raporu Hazırlayan</p>
                    <div>
                      <p className="text-sm font-black text-slate-800">Selman UTKU</p>
                      <div className="mt-6 border-b border-dashed border-gray-300 w-40 mx-auto h-8"></div>
                      <p className="text-[9px] text-gray-400 italic mt-1">(İmza / Tarih)</p>
                    </div>
                  </div>
                </div>

                {/* Footer Notice */}
                <div className="mt-16 text-center text-[9px] text-gray-400 font-bold tracking-wider uppercase border-t border-gray-100 pt-4">
                  T.C. Yeşilay Cemiyeti Gençlik Kampları Bilgi İşlem Altyapısı © 2026
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-slate-50 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => setIsAllergenPdfModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition cursor-pointer"
              >
                Kapat
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Yazdır / PDF Olarak Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
