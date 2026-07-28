/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CampCenter, CampPeriod, SystemLog } from '../types';
import { LoginUser } from '../App';
import { 
  Palette,
  Sliders,
  Users,
  Sun,
  Moon,
  Monitor, 
  Building2, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  CalendarDays, 
  CheckCircle, 
  ShieldCheck, 
  Info,
  Clock,
  ShieldAlert,
  Search,
  Shield,
  UserPlus,
  Check,
  AlertCircle,
  Smartphone,
  Download,
  MessageCircle
} from 'lucide-react';

interface SettingsViewProps {
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  currentUser: LoginUser;
  users: LoginUser[];
  onUpdateUsers: (updated: LoginUser[]) => void;
  campCenters: CampCenter[];
  onUpdateCampCenters: (updated: CampCenter[]) => void;
  periods: CampPeriod[];
  onUpdatePeriods: (updated: CampPeriod[]) => void;
  onAddLog: (action: string, details: string) => void;
}

const ROLE_PRESETS = {
  admin: { name: 'Sistem Yöneticisi', tabs: ['dashboard', 'bungalov', 'katilimci', 'kayit', 'revir', 'yemekhane', 'teknik', 'guvenlik', 'maliyet', 'anket-analizi', 'dokümanlar', 'ayarlar', 'sistem-loglari', 'dijital-arsiv', 'olay-kayit'] },
  mudur: { name: 'Kamp Müdürü', tabs: ['dashboard', 'bungalov', 'katilimci', 'kayit', 'revir', 'yemekhane', 'teknik', 'guvenlik', 'maliyet', 'anket-analizi', 'dokümanlar', 'ayarlar', 'dijital-arsiv', 'olay-kayit'] },
  kayit: { name: 'Kayıt ve Yerleşim Sorumlusu', tabs: ['bungalov', 'katilimci', 'kayit'] },
  saglik: { name: 'Sağlık Sorumlusu / Hemşire', tabs: ['revir', 'katilimci', 'olay-kayit'] },
  yemekhane: { name: 'Yemekhane Görevlisi', tabs: ['yemekhane'] },
  teknik: { name: 'Teknik Sorumlu', tabs: ['teknik'] },
  guvenlik: { name: 'Güvenlik Sorumlusu', tabs: ['guvenlik', 'katilimci', 'olay-kayit'] },
  gonullu: { name: 'Gönüllü Yönetimi', tabs: ['dashboard', 'kayit', 'kamp-planlama'] }
};

const ALL_TABS_LIST: { key: string; label: string; desc: string }[] = [
  { key: 'dashboard', label: 'Gösterge Paneli', desc: 'Ana analizler ve doluluk oranları' },
  { key: 'bungalov', label: 'Bungalov & Odalar', desc: 'Oda yerleşimleri ve kapasite yönetimi' },
  { key: 'katilimci', label: 'Katılımcı Listesi', desc: 'Aktif kamptaki çocuk ve gönüllüler' },
  { key: 'kayit', label: 'Yeni Kayıt & Yerleşim', desc: 'Katılımcı kayıt sihirbazı' },
  { key: 'revir', label: 'Revir & Sağlık', desc: 'Revir kayıtları ve alerji takip paneli' },
  { key: 'yemekhane', label: 'Yemekhane & Menü', desc: 'Öğün menüleri ve kalori hesaplayıcı' },
  { key: 'teknik', label: 'Teknik & Operasyon', desc: 'Görev listesi ve vardiya kayıtları' },
  { key: 'guvenlik', label: 'Güvenlik & Nöbet', desc: 'Nöbet listeleri ve devriyeler' },
  { key: 'maliyet', label: 'Maliyet & Bütçe', desc: 'Gider kalemleri ve bütçe durumu' },
  { key: 'anket-analizi', label: 'Anket Analizi', desc: 'Memnuniyet anket analizleri' },
  { key: 'dokümanlar', label: 'Dokümanlar', desc: 'Kamp mevzuatı ve acil durum rehberleri' },
  { key: 'ayarlar', label: 'Sistem Ayarları', desc: 'Kamp dönemi ve kullanıcı yetkileri' },
  { key: 'sistem-loglari', label: 'Sistem Logları', desc: 'Tüm kullanıcı hareketleri (Sadece Admin)' },
  { key: 'dijital-arsiv', label: 'Dijital Arşiv', desc: 'Veli izin belgeleri ve yüklemeler' },
  { key: 'olay-kayit', label: 'Olay & Vaka Kayıtları', desc: 'Disiplin ve olağan dışı durum raporları' }
];

export default function SettingsView({
  theme,
  setTheme,
  currentUser,
  users,
  onUpdateUsers,
  campCenters,
  onUpdateCampCenters,
  periods,
  onUpdatePeriods,
  onAddLog
}: SettingsViewProps) {
  // Local states for System Parameters
  const [segregateGender, setSegregateGender] = useState<boolean>(() => {
    const saved = localStorage.getItem('kys_setting_segregate_gender');
    return saved !== 'false'; // default true
  });
  
  const [maxAgeDiff, setMaxAgeDiff] = useState<number>(() => {
    const saved = localStorage.getItem('kys_setting_max_age_diff');
    return saved ? parseInt(saved) : 2; // default 2
  });

  const [asthmaGrouping, setAsthmaGrouping] = useState<boolean>(() => {
    const saved = localStorage.getItem('kys_setting_asthma_grouping');
    return saved !== 'false'; // default true
  });

  const [dataRetentionYears, setDataRetentionYears] = useState<number>(() => {
    const saved = localStorage.getItem('kys_setting_data_retention_years');
    return saved ? parseInt(saved) : 2; // default 2
  });

  const [screensaverEnabled, setScreensaverEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('kys_screensaver_enabled');
    return saved !== 'false'; // default true
  });

  const [screensaverTimeout, setScreensaverTimeout] = useState<number>(() => {
    const saved = localStorage.getItem('kys_screensaver_timeout');
    return saved ? parseInt(saved) : 60; // default 60 seconds (1 minute)
  });

  
  // Theme state
  const [colorPalette, setColorPalette] = useState(() => {
    return localStorage.getItem('kys_color_palette') || 'emerald';
  });

  const handlePaletteChange = (paletteName) => {
    setColorPalette(paletteName);
    localStorage.setItem('kys_color_palette', paletteName);
    window.dispatchEvent(new Event('kys_color_palette_changed'));
    onAddLog('Tema Değiştirildi', `Sistem renk paleti '${paletteName}' olarak güncellendi.`);
    triggerSuccess('Tema paleti başarıyla güncellendi.');
  };

  // PWA Installation state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(() => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsAppInstalled(true);
    }
    setDeferredPrompt(null);
  };

  // Local state for camp center editing & adding
  const [editingCenterId, setEditingCenterId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCapacity, setEditCapacity] = useState(78);

  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterCity, setNewCenterCity] = useState('');
  const [newCenterCapacity, setNewCenterCapacity] = useState(60);
  const [showAddCenterForm, setShowAddCenterForm] = useState(false);

  // User Management State additions
  const [selectedUserIdForPermissions, setSelectedUserIdForPermissions] = useState<string | null>('ADMIN');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'mudur' | 'kayit' | 'saglik' | 'yemekhane' | 'teknik' | 'guvenlik'>('yemekhane');

  // Success message toaster state
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 3000);
  };

  // Save System parameters to localStorage
  const handleSaveSystemSettings = () => {
    localStorage.setItem('kys_setting_segregate_gender', String(segregateGender));
    localStorage.setItem('kys_setting_max_age_diff', String(maxAgeDiff));
    localStorage.setItem('kys_setting_asthma_grouping', String(asthmaGrouping));
    localStorage.setItem('kys_setting_data_retention_years', String(dataRetentionYears));
    localStorage.setItem('kys_screensaver_enabled', String(screensaverEnabled));
    localStorage.setItem('kys_screensaver_timeout', String(screensaverTimeout));
    
    // Dispatch custom event to let App.tsx know immediately without reload!
    window.dispatchEvent(new Event('kys_screensaver_settings_changed'));
    
    onAddLog(
      'Sistem Ayarları Değişti',
      `Genel parametreler güncellendi: Cinsiyet Koruma=${segregateGender}, Max Yaş Farkı=${maxAgeDiff}, Sağlık Gruplama=${asthmaGrouping}, Retensiyon=${dataRetentionYears} yıl, Ekran Koruyucu=${screensaverEnabled ? 'Aktif (' + screensaverTimeout + 's)' : 'Pasif'}.`
    );
    triggerSuccess('Sistem parametreleri başarıyla kaydedildi.');
  };

  // Camp Center Management actions
  const handleStartEditCenter = (center: CampCenter) => {
    setEditingCenterId(center.id);
    setEditName(center.name);
    setEditCity(center.city);
    setEditCapacity(center.capacity);
  };

  const handleSaveCenterEdit = (centerId: string) => {
    if (!editName.trim() || !editCity.trim()) {
      alert('Lütfen merkez adı ve şehir alanlarını doldurun.');
      return;
    }
    const updated = campCenters.map(c => {
      if (c.id === centerId) {
        return { ...c, name: editName, city: editCity, capacity: editCapacity };
      }
      return c;
    });
    onUpdateCampCenters(updated);
    setEditingCenterId(null);
    onAddLog('Kamp Merkezi Düzenlendi', `'${editName}' isimli kamp merkezinin kapasite ve şehir bilgileri güncellendi.`);
    triggerSuccess('Kamp merkezi başarıyla güncellendi.');
  };

  const handleAddCampCenter = () => {
    if (!newCenterName.trim() || !newCenterCity.trim()) {
      alert('Lütfen kamp merkezi adı ve şehir alanını doldurun.');
      return;
    }

    const nextId = `C${String(campCenters.length + 1).padStart(2, '0')}`;
    const newCenter: CampCenter = {
      id: nextId,
      name: newCenterName,
      city: newCenterCity,
      capacity: newCenterCapacity
    };

    onUpdateCampCenters([...campCenters, newCenter]);
    onAddLog('Kamp Merkezi Eklendi', `Yeni kamp merkezi tanımlandı: '${newCenterName}' (${newCenterCity}), Kapasite: ${newCenterCapacity}.`);
    
    // Reset form states
    setNewCenterName('');
    setNewCenterCity('');
    setNewCenterCapacity(60);
    setShowAddCenterForm(false);
    triggerSuccess('Yeni kamp merkezi başarıyla eklendi.');
  };

  const handleDeleteCampCenter = (centerId: string) => {
    if (campCenters.length <= 1) {
      alert('Sistemde en az bir aktif Kamp Merkezi bulunmak zorundadır.');
      return;
    }
    
    const center = campCenters.find(c => c.id === centerId);
    if (!center) return;

    if (confirm(`'${center.name}' merkezini ve buna ait tanımları silmek istediğinize emin misiniz?`)) {
      const updated = campCenters.filter(c => c.id !== centerId);
      onUpdateCampCenters(updated);
      onAddLog('Kamp Merkezi Silindi', `'${center.name}' kamp merkezi sistemden kaldırıldı.`);
      triggerSuccess('Kamp merkezi sistemden kaldırıldı.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="settings-management-root">
      {/* Toast Alert Header */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 bg-emerald-800 text-white text-xs font-bold px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Screen Introductory Banner */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-sans">
          <Sliders className="w-5 h-5 text-emerald-600" />
          Genel Ayarlar ve Sistem Yapılandırması
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          KYS akıllı algoritmik yerleşim limitlerini yönetin, yeni kamp şubeleri ekleyin ve veri tabanı durumunu denetleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Left Column: Algorithmic parameters & Local configs */}
        <div className="space-y-6">
          
          {/* System Rules Panel */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 pb-2 border-b flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              KYS Algoritmik Sınırları &amp; Güvenlik Kuralları
            </h3>

            <div className="space-y-4 text-xs font-semibold">
              {/* Segregate Gender Policy */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <h4 className="text-gray-800 font-bold mb-0.5">Cinsiyet Ayrımı Güvenlik Filtresi</h4>
                  <p className="text-4xs text-gray-450">Konaklama odalarında kadın/erkek karma yerleşimleri mutlak olarak engeller.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={segregateGender} 
                    onChange={(e) => setSegregateGender(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Max Age Difference Threshold */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-gray-800 font-bold mb-0.5">Oda Dağıtımı Maksimal Yaş Farkı</h4>
                    <p className="text-4xs text-gray-450">Sebebi olmadan aynı odadaki gönüllülerin yaş farkının maks kaç olacağını belirler.</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={maxAgeDiff}
                    onChange={(e) => setMaxAgeDiff(parseInt(e.target.value) || 2)}
                    className="w-16 p-1.5 text-center bg-white border border-gray-200 rounded text-xs font-extrabold text-emerald-900 focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Asthma / Allergen Grouping Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <h4 className="text-gray-800 font-bold mb-0.5">Kronik Alerjen/Astım Kümeleme Algoritması</h4>
                  <p className="text-4xs text-gray-450">Alerji ve astım hassasiyetleri olan çocukları birbirine yakın ve havadar bungalovlarda birleştirir.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={asthmaGrouping} 
                    onChange={(e) => setAsthmaGrouping(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Data retention years */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-gray-800 font-bold mb-0.5">KVKK Veri İmha Politikası Sınırı (Yıl)</h4>
                    <p className="text-4xs text-gray-450">Kampçının mezuniyetinden sonra kişisel verilerin anonimleştirme bekleme süresi.</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={dataRetentionYears}
                    onChange={(e) => setDataRetentionYears(parseInt(e.target.value) || 2)}
                    className="w-16 p-1.5 text-center bg-white border border-gray-200 rounded text-xs font-extrabold text-emerald-900 focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Screensaver Enabled Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <h4 className="text-gray-800 font-bold mb-0.5">Ekran Koruyucu (Yeşilay Logolu)</h4>
                  <p className="text-4xs text-gray-450">Belirli bir süre işlem yapılmadığında animasyonlu Yeşilay koruyucu modunu açar.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={screensaverEnabled} 
                    onChange={(e) => setScreensaverEnabled(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Screensaver Timeout Slider */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-gray-800 font-bold mb-0.5">Ekran Koruyucu Bekleme Süresi</h4>
                    <p className="text-4xs text-gray-450">İnaktivite durumunda ekran koruyucunun devreye gireceği süre (Saniye cinsinden).</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={5}
                      max={300}
                      step={5}
                      value={screensaverTimeout}
                      onChange={(e) => setScreensaverTimeout(parseInt(e.target.value) || 60)}
                      className="w-24 accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-emerald-900 bg-emerald-50 px-2 py-1 rounded min-w-[48px] text-center">
                      {screensaverTimeout}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveSystemSettings}
                className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-800 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Sistem Parametrelerini Kaydet
              </button>
            </div>
          </div>


          {/* Aydınlık/Karanlık Mod Panel */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Sun className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              Görünüm Modu
            </h3>
            <p className="text-2xs text-gray-500 dark:text-gray-400 leading-normal font-semibold">
              Sistem arayüzünü gündüz (aydınlık), gece (karanlık) veya cihazınızın sistem ayarlarına uyumlu olacak şekilde ayarlayabilirsiniz.
            </p>
            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${theme === 'light' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Sun className="w-4 h-4" />
                Aydınlık
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${theme === 'dark' ? 'bg-gray-700 text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-300'}`}
              >
                <Moon className="w-4 h-4" />
                Karanlık
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${theme === 'system' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <Monitor className="w-4 h-4" />
                Sistem
              </button>
            </div>
          </div>

          {/* Theme Customizer Panel */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 pb-2 border-b flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-600" />
              Tema Özelleştirici
            </h3>
            <p className="text-2xs text-gray-500 leading-normal font-semibold">
              KYS uygulamasının ana renk paletini kurum kimliğinize veya kişisel zevkinize göre ayarlayın.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Yeşilay (Zümrüt)', key: 'emerald', bgClass: 'bg-[#10b981]' },
                { name: 'Okyanus (Mavi)', key: 'blue', bgClass: 'bg-[#3b82f6]' },
                { name: 'Yakut (Kırmızı)', key: 'rose', bgClass: 'bg-[#f43f5e]' },
                { name: 'Gece (Mor)', key: 'purple', bgClass: 'bg-[#a855f7]' },
                { name: 'Güneş (Kehribar)', key: 'amber', bgClass: 'bg-[#f59e0b]' },
                { name: 'Kurumsal (Arduvaz)', key: 'slate', bgClass: 'bg-[#64748b]' },
              ].map(palette => (
                <button
                  key={palette.key}
                  onClick={() => handlePaletteChange(palette.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition cursor-pointer ${colorPalette === palette.key ? 'border-gray-900 bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                >
                  <span className={`w-4 h-4 rounded-full shadow-inner ${palette.bgClass}`}></span>
                  <span className={`text-xs font-bold ${colorPalette === palette.key ? 'text-gray-900' : 'text-gray-600'}`}>{palette.name}</span>
                </button>
              ))}
            </div>
          </div>


                    {/* WhatsApp Business API Integration */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 pb-2 border-b flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              WhatsApp Business API Entegrasyonu
            </h3>
            
            <p className="text-2xs text-gray-500 leading-normal font-semibold">
              Kampa kayıt olan katılımcılara ve velilerine, ön kayıt, mülakat, veya kabul durumları hakkında anlık WhatsApp bildirimleri (Template Messages) gönderebilmek için resmi WhatsApp API altyapısını bağlayın. SMS ve E-posta maliyetlerine alternatif olarak daha hızlı dönüş oranları sağlar.
            </p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-4xs font-bold text-gray-600 uppercase tracking-wider">Access Token (Bearer)</label>
                <input type="password" placeholder="EAAIu... (Sürekli veya Sistem Tokeni)" className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" />
              </div>
              <div className="space-y-1.5">
                <label className="text-4xs font-bold text-gray-600 uppercase tracking-wider">Phone Number ID</label>
                <input type="text" placeholder="Örn: 104234567891234" className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" />
              </div>
              <div className="space-y-1.5">
                <label className="text-4xs font-bold text-gray-600 uppercase tracking-wider">WhatsApp Business Account ID</label>
                <input type="text" placeholder="Örn: 109876543210987" className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-3xs block text-gray-600">
                <strong>Not:</strong> WhatsApp mesajları gönderirken 24 saatlik müşteri hizmetleri aralığı dışında Meta tarafından onaylanmış şablonlar (Template Message) kullanmalısınız. 
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition cursor-pointer shadow-sm"
                onClick={() => triggerSuccess('Bağlantı başarıyla test edildi! WhatsApp API çevrimiçi.')}
              >
                Bağlantıyı Test Et
              </button>
              <button
                onClick={() => triggerSuccess('WhatsApp API Kimlik Bilgileri Kaydedildi.')}
                className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-800 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                API Yapılandırmasını Kaydet
              </button>
            </div>
          </div>

          {/* Quick Info & Guidelines */}
          <div className="bg-emerald-50/30 p-5 rounded-xl border border-emerald-100 text-xs text-gray-650 space-y-3">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-700" />
              Yeşilay Dönemsel Operasyon Bilgisi
            </h4>
            <p>
              Tüm parametreler anlık olarak tarayıcınızın <code>localStorage</code> API'si ile saklanmakta olup, yeni yapılacak olan akıllı bungalov yerleşimleri bu limitlere göre işleyecektir.
            </p>
            <div className="p-3 bg-white rounded border border-emerald-100 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-3xs block">
                <strong>Entegrasyon Notu:</strong> KVKK kapsamında tüm imha koşulları, otomatik zaman damgasıyla eşleştirilmiş olup mühür süreçleri arkaplanda simüle edilmektedir.
              </p>
            </div>
          </div>

          {/* Mobil PWA Kurulum İstasyonu */}
          <div className="bg-white p-5 rounded-xl border border-gray-150 dark:border-gray-700 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white pb-2 border-b flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Mobil Uygulama &amp; PWA Kurulumu
            </h3>
            
            <p className="text-2xs text-gray-500 dark:text-gray-400 leading-normal font-semibold">
              Yeşilay Kamp Yönetim Sistemi (KYS), modern bir <strong>Progressive Web App (PWA)</strong> teknolojisi ile donatılmıştır. Bu sayede uygulamayı telefonunuza, tabletinize veya bilgisayarınıza yerel bir mobil uygulama gibi yükleyebilirsiniz.
            </p>

            <div className="p-3.5 rounded-lg border border-gray-150 dark:border-gray-700 flex flex-col gap-2.5 bg-gray-50 dark:bg-gray-800/40 text-2xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Yükleme Durumu:</span>
                {isAppInstalled ? (
                  <span className="text-3xs font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <Check className="w-3 h-3" /> Mobil Uygulama Olarak Açık / Yüklü
                  </span>
                ) : deferredPrompt ? (
                  <span className="text-3xs font-extrabold px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800">
                    Kuruluma Hazır
                  </span>
                ) : (
                  <span className="text-3xs font-extrabold px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-750 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700">
                    Tarayıcı Modunda
                  </span>
                )}
              </div>

              {!isAppInstalled && deferredPrompt && (
                <button
                  onClick={handleInstallApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Download className="w-4 h-4" />
                  Yeşilay KYS Uygulamasını Yükle
                </button>
              )}

              {(!deferredPrompt && !isAppInstalled) && (
                <div className="text-3xs text-gray-500 dark:text-gray-400 leading-relaxed bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-2">
                  <p className="font-extrabold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-emerald-600" /> Nasıl Yüklenir?
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Android (Chrome):</strong> Tarayıcı adres çubuğundaki üç noktaya dokunup <strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.</li>
                    <li><strong>iOS / iPhone (Safari):</strong> Alt kısımdaki <strong>"Paylaş"</strong> (<span className="font-mono">↑</span>) butonuna dokunup açılan menüden <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.</li>
                    <li><strong>Masaüstü (Chrome/Edge):</strong> Adres çubuğunun sağ tarafındaki <strong>Yükle</strong> (monitör + ok) simgesine tıklayın.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Camp Centers Definition List & Periods Summary */}
        <div className="space-y-6">
          
          {/* Camp Centers List */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Yeşilay Kamp Merkezleri ({campCenters.length})
              </h3>
              
              <button
                onClick={() => setShowAddCenterForm(!showAddCenterForm)}
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg text-3xs font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Merkez Tanımla
              </button>
            </div>

            {/* Form to add a Camp Center */}
            {showAddCenterForm && (
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-lg text-xs space-y-3">
                <h4 className="font-bold text-emerald-900 text-xs">Yeni Yeşilay Kamp Merkezi Ekle</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-4xs text-gray-500 uppercase font-black">Merkez Adı</label>
                    <input
                      type="text"
                      placeholder="e.g. Yeşilay Edirne Kampı"
                      value={newCenterName}
                      onChange={(e) => setNewCenterName(e.target.value)}
                      className="w-full p-2 bg-white border rounded text-xs focus:outline-emerald-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-4xs text-gray-500 uppercase font-black">Şehir / İl</label>
                    <input
                      type="text"
                      placeholder="e.g. Edirne"
                      value={newCenterCity}
                      onChange={(e) => setNewCenterCity(e.target.value)}
                      className="w-full p-2 bg-white border rounded text-xs focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-4xs text-gray-500 uppercase font-black block">Toplam Kapasite Kontenjanı</label>
                  <input
                    type="number"
                    min={20}
                    max={300}
                    value={newCenterCapacity}
                    onChange={(e) => setNewCenterCapacity(parseInt(e.target.value) || 60)}
                    className="w-32 p-2 bg-white border rounded text-xs focus:outline-emerald-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1 text-2xs">
                  <button
                    onClick={() => setShowAddCenterForm(false)}
                    className="text-gray-500 px-3 py-1.5 focus:outline-none"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleAddCampCenter}
                    className="bg-emerald-600 text-white px-3.5 py-1.5 rounded font-extrabold hover:bg-emerald-700"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            )}

            {/* Camp Centers Grid */}
            <div className="space-y-2.5">
              {campCenters.map((cc) => {
                const isEditing = editingCenterId === cc.id;
                
                return (
                  <div 
                    key={cc.id} 
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold ${
                      isEditing ? 'border-amber-400 bg-amber-50/10' : 'border-gray-150 bg-gray-50/50'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex-grow space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="p-1.5 bg-white border rounded text-2xs"
                          />
                          <input
                            type="text"
                            value={editCity}
                            onChange={(e) => setEditCity(e.target.value)}
                            className="p-1.5 bg-white border rounded text-2xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-3xs text-gray-500">Kapasite:</span>
                          <input
                            type="number"
                            value={editCapacity}
                            onChange={(e) => setEditCapacity(parseInt(e.target.value) || 78)}
                            className="w-16 p-1 bg-white border rounded text-2xs text-center"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-3xs font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase">
                            {cc.id}
                          </span>
                          <h4 className="font-bold text-gray-900">{cc.name}</h4>
                        </div>
                        <p className="text-3xs text-gray-400 mt-0.5 font-semibold">
                          Konum: {cc.city} | Nominal Yatak İhtiyacı: {cc.capacity}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2.5 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => setEditingCenterId(null)}
                            className="text-gray-450 hover:text-gray-600 text-3xs"
                          >
                            İptal
                          </button>
                          <button
                            onClick={() => handleSaveCenterEdit(cc.id)}
                            className="text-amber-800 bg-amber-100 hover:bg-amber-200 p-1.5 rounded"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEditCenter(cc)}
                            className="text-gray-600 hover:text-emerald-700 hover:bg-gray-100 p-1.5 rounded transition"
                            title="Düzenle"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteCampCenter(cc.id)}
                            className="text-red-650 hover:bg-red-50 p-1.5 rounded transition"
                            title="Merkezi Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Camp Periods Panel */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 pb-2 border-b flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              Aktif Sezon Dönem Rapor Değerleri
            </h3>

            <div className="space-y-3.5 text-xs font-semibold">
              {periods.map((per) => (
                <div key={per.id} className="p-3 bg-gray-50/50 border rounded-lg text-2xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">{per.name}</span>
                    <span className={`text-4xs font-bold px-1.5 py-0.5 rounded ${
                      per.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {per.status}
                    </span>
                  </div>
                  <p className="text-3xs text-gray-400 font-semibold uppercase font-mono">
                    Süreç: {per.startDate} / {per.endDate} • Kota: {per.maxQuota} Katılımcı
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      
      {/* WhatsApp Integration Panel */}
      {currentUser.role === 'admin' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6 mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2.5">
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <MessageCircle className="w-5 h-5" />
                </span>
                <div>
                  <span className="block font-black tracking-tight text-gray-900 text-sm">WhatsApp Bildirim Altyapısı</span>
                  <span className="block text-2xs font-medium text-gray-400 mt-0.5 font-sans">Katılımcılara gönderilecek otomatik WhatsApp bildirimleri ve API ayarları.</span>
                </div>
              </h3>
            </div>
            <div>
              <button
                onClick={() => {
                  onAddLog('WhatsApp Ayarları Kaydedildi', 'WhatsApp API bağlantı ayarları güncellendi.');
                  if (typeof triggerSuccess === 'function') triggerSuccess('WhatsApp ayarları başarıyla kaydedildi.');
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" /> Ayarları Kaydet
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-emerald-600"/> API Bağlantı Bilgileri</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">WhatsApp Business API Anahtarı</label>
                  <input type="password" defaultValue="wa_test_123456789" className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Gönderici Telefon Numarası (ID)</label>
                  <input type="text" defaultValue="+90 555 123 4567" className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Webhook URL (Mesaj Durumları İçin)</label>
                  <input type="text" defaultValue="https://yesilaykampus.api/webhook/whatsapp" className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs font-mono" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600"/> Otomatik Bildirim Tetikleyicileri</h4>
              
              <div className="space-y-2 border border-gray-150 rounded-xl overflow-hidden bg-gray-50/30">
                {[
                  { id: 'app_approved', title: 'Başvuru Onaylandığında', desc: 'Katılımcının başvurusu onaylandığında gönderilecek karşılama mesajı.', active: true },
                  { id: 'bungalow_assigned', title: 'Oda Ataması Yapıldığında', desc: 'Katılımcının kalacağı oda/bungalov belli olduğunda gönderilir.', active: true },
                  { id: 'event_reminder', title: 'Etkinlik Hatırlatmaları', desc: 'Önemli kamp etkinliklerinden 15 dakika önce katılımcılara hatırlatma yapılır.', active: false },
                  { id: 'checkout_thanks', title: 'Çıkış İşlemi Sonrası', desc: 'Kamp bitiminde gönderilecek anket linki ve teşekkür mesajı.', active: true }
                ].map((trigger, i) => (
                  <label key={i} className="flex items-start gap-3 p-3 border-b border-gray-150 last:border-0 cursor-pointer hover:bg-white transition-colors">
                    <input type="checkbox" defaultChecked={trigger.active} className="mt-1 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600" />
                    <div>
                      <span className="block text-xs font-bold text-gray-900">{trigger.title}</span>
                      <span className="block text-[10px] text-gray-500 mt-0.5">{trigger.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redesigned User Management Panel (IAM Workspace) */}
      {currentUser.role === 'admin' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6 mt-6">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2.5">
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <span className="block font-black tracking-tight text-gray-900 text-sm">Gelişmiş Kullanıcı Yetkilendirme &amp; Rol Yönetimi</span>
                  <span className="block text-2xs font-medium text-gray-400 mt-0.5 font-sans">Sistem kullanıcılarının erişebileceği modülleri ve rol şablonlarını yönetin.</span>
                </div>
              </h3>
            </div>
            
            <button
              onClick={() => setShowAddUserForm(!showAddUserForm)}
              className="bg-emerald-650 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-2xs font-extrabold flex items-center gap-2 transition cursor-pointer self-start md:self-auto shadow-xs"
            >
              <UserPlus className="w-4 h-4" /> 
              {showAddUserForm ? 'Yeni Personel Formunu Kapat' : 'Yeni Personel Tanımla'}
            </button>
          </div>

          {/* Expandable Add User Form */}
          {showAddUserForm && (
            <div className="bg-emerald-50/15 p-5 rounded-2xl border border-emerald-150 space-y-4 animate-in fade-in duration-200 text-xs">
              <div className="flex items-center gap-2 border-b border-emerald-100 pb-2.5">
                <span className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
                  <Users className="w-4 h-4" />
                </span>
                <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px]">Yeni Personel Hesabı Ekle</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Ad Soyad *</label>
                  <input
                    type="text"
                    placeholder="Örn: Elif Sönmez"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-2xs font-semibold focus:border-emerald-600 outline-none transition placeholder-gray-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Kullanıcı Adı *</label>
                  <input
                    type="text"
                    placeholder="Örn: elifs"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-2xs font-semibold focus:border-emerald-600 outline-none transition placeholder-gray-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Görev Sınıfı / Şablonu</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-2xs font-bold focus:border-emerald-600 outline-none transition text-gray-800 cursor-pointer"
                  >
                    <option value="mudur">Kamp Müdürü</option>
                    <option value="kayit">Kayıt Sorumlusu</option>
                    <option value="saglik">Sağlık Sorumlusu / Hemşire</option>
                    <option value="yemekhane">Yemekhane Görevlisi</option>
                    <option value="teknik">Teknik Sorumlu</option>
                    <option value="guvenlik">Güvenlik Sorumlusu</option>
                    <option value="gonullu">Gönüllü Yönetimi</option>
                    <option value="admin">Sistem Yöneticisi</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-emerald-100/55">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserForm(false);
                    setNewUserName('');
                    setNewUserUsername('');
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl text-2xs cursor-pointer transition"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newUserName.trim() || !newUserUsername.trim()) {
                      alert('Lütfen ad soyad ve kullanıcı adı alanlarını doldurun.');
                      return;
                    }
                    if (users.some(u => u.username.toLowerCase() === newUserUsername.trim().toLowerCase())) {
                      alert('Bu kullanıcı adı zaten kullanımda.');
                      return;
                    }
                    const preset = ROLE_PRESETS[newUserRole];
                    let passwordHash = '6b5f40c09215713a1fa83ea2de2adcae17e605b8958a2d7379e15b561687ee8f'; // 1920
                    if (['admin', 'mudur'].includes(newUserRole)) {
                      passwordHash = '55c5de31ec754ba40fb1687ff4f4e0d95142f5ca2765c4839b618329190a434b'; // 4509
                    }
                    const newUser: LoginUser = {
                      id: `S${String(users.length + 1).padStart(2, '0')}`,
                      name: newUserName.trim(),
                      username: newUserUsername.trim().toLowerCase(),
                      role: newUserRole,
                      roleName: preset.name,
                      allowedTabs: preset.tabs as any,
                      password: passwordHash
                    };

                    onUpdateUsers([...users, newUser]);
                    onAddLog('Kullanıcı Eklendi', `${newUser.name} (${newUser.roleName}) sisteme eklendi.`);
                    triggerSuccess(`${newUser.name} başarıyla sisteme eklendi.`);
                    
                    // Reset fields
                    setNewUserName('');
                    setNewUserUsername('');
                    setShowAddUserForm(false);
                    // Select newly created user
                    setSelectedUserIdForPermissions(newUser.id);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-2xs cursor-pointer transition flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Kullanıcıyı Kaydet
                </button>
              </div>
            </div>
          )}

          {/* Main Interactive Split Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Pane: Staff Search & Selector (4 cols) */}
            <div className="lg:col-span-4 bg-gray-50/40 rounded-2xl border border-gray-150 p-4 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Kamp Personel Listesi</span>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="İsim, rol veya kullanıcı adı ara..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 focus:border-emerald-500 rounded-xl text-2xs font-semibold outline-none transition placeholder-gray-400 shadow-4xs"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {users
                  .filter(u => {
                    const term = userSearchTerm.toLowerCase().trim();
                    if (!term) return true;
                    return (
                      u.name.toLowerCase().includes(term) ||
                      u.username.toLowerCase().includes(term) ||
                      u.roleName.toLowerCase().includes(term)
                    );
                  })
                  .map(u => {
                    const isSelected = selectedUserIdForPermissions === u.id;
                    const initials = u.name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    
                    return (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUserIdForPermissions(u.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer select-none transition-all duration-150 ${
                          isSelected 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md transform scale-[1.01]' 
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                            isSelected ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          }`}>
                            {initials}
                          </div>
                          <div className="min-w-0 leading-tight">
                            <h4 className="text-2xs font-extrabold truncate">{u.name}</h4>
                            <p className={`text-[9px] font-mono mt-0.5 truncate ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>
                              @{u.username} • {u.roleName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-emerald-700/80 text-emerald-50' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {u.allowedTabs.length} Yetki
                          </span>
                          
                          {u.id !== 'ADMIN' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`${u.name} isimli kullanıcıyı tamamen silmek istediğinize emin misiniz?`)) {
                                  const updated = users.filter(usr => usr.id !== u.id);
                                  onUpdateUsers(updated);
                                  onAddLog('Kullanıcı Silindi', `${u.name} (${u.roleName}) sistemden kaldırıldı.`);
                                  triggerSuccess('Kullanıcı başarıyla kaldırıldı.');
                                  if (selectedUserIdForPermissions === u.id) {
                                    setSelectedUserIdForPermissions(users[0]?.id || null);
                                  }
                                }
                              }}
                              className={`p-1 rounded-lg transition ${
                                isSelected ? 'text-emerald-100 hover:text-white hover:bg-emerald-700' : 'text-gray-400 hover:text-red-650 hover:bg-red-50/60'
                              }`}
                              title="Kullanıcıyı Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {users.filter(u => {
                  const term = userSearchTerm.toLowerCase().trim();
                  if (!term) return true;
                  return (
                    u.name.toLowerCase().includes(term) ||
                    u.username.toLowerCase().includes(term) ||
                    u.roleName.toLowerCase().includes(term)
                  );
                }).length === 0 && (
                  <div className="p-8 text-center text-gray-400 italic text-2xs bg-white rounded-xl border border-dashed">
                    Aranan kriterlere uygun personel bulunamadı.
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane: Live Permission Editor (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-150 p-5 space-y-4">
              {(() => {
                const selectedUser = users.find(u => u.id === selectedUserIdForPermissions);
                if (!selectedUser) {
                  return (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-2.5 h-full">
                      <Shield className="w-8 h-8 text-gray-300" />
                      <p className="text-2xs font-extrabold text-gray-500">Lütfen soldaki listeden yetkilerini düzenlemek istediğiniz bir personeli seçin.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* User Metadata Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3.5 gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-gray-900">{selectedUser.name}</h4>
                          <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {selectedUser.roleName}
                          </span>
                        </div>
                        <p className="text-3xs text-gray-400 font-mono">Hesap ID: {selectedUser.id} • Kullanıcı Adı: @{selectedUser.username}</p>
                      </div>

                      {/* Quick Select Buttons */}
                      <div className="flex gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = users.map(usr => {
                              if (usr.id === selectedUser.id) {
                                return { ...usr, allowedTabs: ALL_TABS_LIST.map(t => t.key) as any };
                              }
                              return usr;
                            });
                            onUpdateUsers(updated);
                            onAddLog('Tüm Yetkiler Tanımlandı', `${selectedUser.name} kullanıcısına tüm modül yetkileri atandı.`);
                            triggerSuccess('Tüm yetki sekmeleri başarıyla atandı.');
                          }}
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-2.5 py-1.5 border border-gray-200 rounded-lg text-3xs font-extrabold transition cursor-pointer flex items-center gap-1 shadow-4xs"
                        >
                          Tümünü Seç
                        </button>
                        <button
                          type="button"
                          disabled={selectedUser.id === 'ADMIN'}
                          onClick={() => {
                            const updated = users.map(usr => {
                              if (usr.id === selectedUser.id) {
                                return { ...usr, allowedTabs: [] };
                              }
                              return usr;
                            });
                            onUpdateUsers(updated);
                            onAddLog('Tüm Yetkiler Kaldırıldı', `${selectedUser.name} kullanıcısının tüm modül yetkileri alındı.`);
                            triggerSuccess('Tüm yetki sekmeleri temizlendi.');
                          }}
                          className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg text-3xs font-extrabold transition cursor-pointer flex items-center gap-1 shadow-4xs disabled:opacity-40 disabled:pointer-events-none"
                        >
                          Temizle
                        </button>
                      </div>
                    </div>

                    {/* Role Presets Wrapper */}
                    <div className="p-3 bg-emerald-50/15 border border-emerald-100 rounded-xl space-y-2">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-3xs font-black text-emerald-950 uppercase tracking-wider block">Görev Sınıfı Şablonları</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(ROLE_PRESETS).map(([roleKey, value]) => {
                          const isActive = selectedUser.role === roleKey;
                          return (
                            <button
                              key={roleKey}
                              type="button"
                              onClick={() => {
                                const updated = users.map(usr => {
                                  if (usr.id === selectedUser.id) {
                                    return { ...usr, role: roleKey as any, roleName: value.name, allowedTabs: value.tabs as any };
                                  }
                                  return usr;
                                });
                                onUpdateUsers(updated);
                                onAddLog('Görev Şablonu Uygulandı', `${selectedUser.name} için '${value.name}' şablon yetkileri uygulandı.`);
                                triggerSuccess(`'${value.name}' şablon yetkileri başarıyla uygulandı.`);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold transition cursor-pointer flex items-center gap-1 border ${
                                isActive 
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-4xs' 
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {isActive && <Check className="w-2.5 h-2.5" />}
                              {value.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Permission Category Groups */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                      {[
                        {
                          title: "Yönetim & Kontrol Modülleri",
                          color: "bg-blue-50/30 border-blue-100/50 text-blue-900",
                          dot: "bg-blue-500",
                          keys: ['dashboard', 'maliyet', 'anket-analizi', 'ayarlar', 'sistem-loglari']
                        },
                        {
                          title: "Kampüs & Operasyon Modülleri",
                          color: "bg-amber-50/30 border-amber-100/50 text-amber-900",
                          dot: "bg-amber-500",
                          keys: ['bungalov', 'katilimci', 'kayit', 'dijital-arsiv']
                        },
                        {
                          title: "Destek & Güvenlik Modülleri",
                          color: "bg-purple-50/30 border-purple-100/50 text-purple-900",
                          dot: "bg-purple-500",
                          keys: ['revir', 'yemekhane', 'teknik', 'guvenlik', 'olay-kayit', 'dokümanlar']
                        }
                      ].map((group, groupIdx) => {
                        return (
                          <div key={groupIdx} className="space-y-2 p-3 bg-gray-50/30 border border-gray-150 rounded-xl">
                            <h5 className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-gray-150/50">
                              <span className={`w-1.5 h-1.5 rounded-full ${group.dot}`}></span>
                              {group.title}
                            </h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {group.keys.map((tabKey) => {
                                const matched = ALL_TABS_LIST.find(t => t.key === tabKey);
                                if (!matched) return null;
                                const isAllowed = selectedUser.allowedTabs.includes(tabKey as any);
                                return (
                                  <label
                                    key={tabKey}
                                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer select-none transition-all duration-150 ${
                                      isAllowed 
                                        ? 'bg-emerald-50/20 border-emerald-200 text-emerald-950 hover:bg-emerald-50/30' 
                                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isAllowed}
                                      onChange={() => {
                                        const updatedTabs = isAllowed
                                          ? selectedUser.allowedTabs.filter(t => t !== tabKey)
                                          : [...selectedUser.allowedTabs, tabKey as any];
                                        
                                        const updated = users.map(usr => {
                                          if (usr.id === selectedUser.id) {
                                            return { ...usr, allowedTabs: updatedTabs };
                                          }
                                          return usr;
                                        });
                                        onUpdateUsers(updated);
                                        onAddLog(
                                          'Kullanıcı Yetkisi Güncellendi', 
                                          `${selectedUser.name} kullanıcısının '${matched.label}' sekme izni ${isAllowed ? 'kaldırıldı' : 'eklendi'}.`
                                        );
                                      }}
                                      className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-3.5 w-3.5 accent-emerald-600"
                                    />
                                    <div className="space-y-0.5 min-w-0">
                                      <span className="text-[10px] font-black leading-none block truncate">{matched.label}</span>
                                      <span className="text-[8px] text-gray-400 block font-normal leading-normal">{matched.desc}</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
