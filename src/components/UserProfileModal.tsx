import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Shield, 
  Key, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Award,
  Calendar,
  Lock,
  Compass,
  FileCheck2,
  LockKeyhole
} from 'lucide-react';
import { LoginUser } from '../App';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: LoginUser;
  onUpdateProfile: (updatedName: string, updatedUsername: string) => void;
  allUsers: LoginUser[];
}

const AVATAR_COLORS = [
  { name: 'Zümrüt', class: 'bg-emerald-600 dark:bg-emerald-500 hover:ring-emerald-300' },
  { name: 'Safir', class: 'bg-blue-600 dark:bg-blue-500 hover:ring-blue-300' },
  { name: 'İndigo', class: 'bg-indigo-600 dark:bg-indigo-500 hover:ring-indigo-300' },
  { name: 'Mor', class: 'bg-purple-600 dark:bg-purple-500 hover:ring-purple-300' },
  { name: 'Gül', class: 'bg-rose-600 dark:bg-rose-500 hover:ring-rose-300' },
  { name: 'Kehribar', class: 'bg-amber-600 dark:bg-amber-500 hover:ring-amber-300' },
];

const ALL_TABS_LIST: { key: string; label: string; desc: string; category: string }[] = [
  { key: 'dashboard', label: 'Gösterge Paneli', desc: 'Ana analizler ve doluluk oranları', category: 'Yönetim & Kontrol' },
  { key: 'maliyet', label: 'Maliyet & Bütçe', desc: 'Gider kalemleri ve bütçe durumu', category: 'Yönetim & Kontrol' },
  { key: 'anket-analizi', label: 'Anket Analizi', desc: 'Memnuniyet anket analizleri', category: 'Yönetim & Kontrol' },
  { key: 'ayarlar', label: 'Sistem Ayarları', desc: 'Kamp dönemi ve kullanıcı yetkileri', category: 'Yönetim & Kontrol' },
  { key: 'sistem-loglari', label: 'Sistem Logları', desc: 'Tüm kullanıcı hareketleri', category: 'Yönetim & Kontrol' },
  
  { key: 'bungalov', label: 'Bungalov & Odalar', desc: 'Oda yerleşimleri ve kapasite yönetimi', category: 'Kampüs & Operasyon' },
  { key: 'katilimci', label: 'Katılımcı Listesi', desc: 'Aktif kamptaki çocuk ve gönüllüler', category: 'Kampüs & Operasyon' },
  { key: 'kayit', label: 'Yeni Kayıt & Yerleşim', desc: 'Katılımcı kayıt sihirbazı', category: 'Kampüs & Operasyon' },
  { key: 'dijital-arsiv', label: 'Dijital Arşiv', desc: 'Veli izin belgeleri ve yüklemeler', category: 'Kampüs & Operasyon' },
  
  { key: 'revir', label: 'Revir & Sağlık', desc: 'Revir kayıtları ve alerji takip paneli', category: 'Destek & Güvenlik' },
  { key: 'yemekhane', label: 'Yemekhane & Menü', desc: 'Öğün menüleri ve kalori hesaplayıcı', category: 'Destek & Güvenlik' },
  { key: 'teknik', label: 'Teknik & Operasyon', desc: 'Görev listesi ve vardiya kayıtları', category: 'Destek & Güvenlik' },
  { key: 'guvenlik', label: 'Güvenlik & Nöbet', desc: 'Nöbet listeleri ve devriyeler', category: 'Destek & Güvenlik' },
  { key: 'olay-kayit', label: 'Olay & Vaka Kayıtları', desc: 'Disiplin ve olağan dışı durum raporları', category: 'Destek & Güvenlik' },
  { key: 'dokümanlar', label: 'Dokümanlar', desc: 'Kamp mevzuatı ve acil durum rehberleri', category: 'Destek & Güvenlik' },
];

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
  allUsers
}: UserProfileModalProps) {
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [selectedColor, setSelectedColor] = useState(() => {
    return localStorage.getItem(`kys_profile_color_${currentUser.id}`) || 'bg-emerald-600';
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showPasscodeSection, setShowPasscodeSection] = useState(false);
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [passcodeSuccess, setPasscodeSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setUsername(currentUser.username);
      setError(null);
      setSuccess(false);
      setShowPasscodeSection(false);
      setCurrentPasscode('');
      setNewPasscode('');
      setConfirmPasscode('');
      setPasscodeError(null);
      setPasscodeSuccess(false);
      setSelectedColor(localStorage.getItem(`kys_profile_color_${currentUser.id}`) || 'bg-emerald-600');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError('Ad Soyad alanı boş bırakılamaz.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setError('Kullanıcı Adı alanı boş bırakılamaz.');
      return;
    }

    if (!/^[a-z0-9._]+$/.test(cleanUsername)) {
      setError('Kullanıcı adı yalnızca küçük harf, rakam, nokta (.) ve alt çizgi (_) içerebilir.');
      return;
    }

    // Check uniqueness excluding current user
    const isTaken = allUsers.some(
      (u) => u.id !== currentUser.id && u.username.toLowerCase() === cleanUsername
    );
    if (isTaken) {
      setError('Bu kullanıcı adı başka bir personel tarafından kullanılmaktadır.');
      return;
    }

    // Save avatar color
    localStorage.setItem(`kys_profile_color_${currentUser.id}`, selectedColor);

    // trigger parent update
    onUpdateProfile(name.trim(), cleanUsername);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    setPasscodeSuccess(false);

    // Core validation
    if (!currentPasscode || !newPasscode || !confirmPasscode) {
      setPasscodeError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    // Validate active session passcode
    const savedPinKey = currentUser.role === 'admin' ? 'kys_admin_pin_fallback' : 'kys_staff_pin_fallback';
    const activePin = currentUser.role === 'admin' ? '1920' : '4509';
    // Let's check if there is custom override
    const currentStoredPin = localStorage.getItem(`kys_pin_override_${currentUser.id}`) || activePin;

    if (currentPasscode !== currentStoredPin) {
      setPasscodeError('Mevcut giriş şifreniz/kodunuz hatalı.');
      return;
    }

    if (newPasscode.length < 4) {
      setPasscodeError('Yeni şifre/kod en az 4 karakter uzunluğunda olmalıdır.');
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setPasscodeError('Yeni şifreler uyuşmuyor.');
      return;
    }

    // Save pin override
    localStorage.setItem(`kys_pin_override_${currentUser.id}`, newPasscode);
    setPasscodeSuccess(true);
    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    
    setTimeout(() => {
      setPasscodeSuccess(false);
    }, 3000);
  };

  const userInitials = name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="profile-management-modal">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-150 dark:border-gray-700 animate-fade-in">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 rounded-xl">
                <User className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white">Kullanıcı Profilini Düzenle</h3>
                <p className="text-3xs text-gray-400 dark:text-gray-500 mt-0.5">Kişisel bilgilerinizi ve giriş tercihlerinizi yönetin.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Upper Section: Avatar and Quick Metadata */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-gray-50 dark:bg-gray-850/50 rounded-2xl border border-gray-100 dark:border-gray-700/60">
              <div className="relative">
                <div className={`w-16 h-16 rounded-full text-white flex items-center justify-center font-black text-xl shadow-md transition-all duration-300 ${selectedColor}`}>
                  {userInitials}
                </div>
                <span className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm text-gray-400">
                  <Award className="w-4 h-4 text-emerald-600" />
                </span>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-sm font-black text-gray-900 dark:text-white leading-none">{currentUser.name}</h4>
                    <span className="text-[9px] font-black bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {currentUser.roleName}
                    </span>
                  </div>
                  <p className="text-3xs text-gray-400 dark:text-gray-500 mt-1 font-mono">Personel Sicil No: {currentUser.id} • @{currentUser.username}</p>
                </div>

                {/* Avatar Color Picker */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Profil Kartı Rengi</span>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    {AVATAR_COLORS.map((col) => {
                      const isActive = selectedColor === col.class.split(' ')[0];
                      return (
                        <button
                          key={col.name}
                          type="button"
                          title={col.name}
                          onClick={() => setSelectedColor(col.class.split(' ')[0])}
                          className={`w-5 h-5 rounded-full shrink-0 border border-white dark:border-gray-850 cursor-pointer hover:scale-110 hover:ring-2 transition-all duration-150 ${col.class.split(' ')[0]} ${
                            isActive ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-gray-800 scale-105' : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* General Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h5 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pb-1 border-b dark:border-gray-700">Profil Bilgileri</h5>
              
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/40 text-red-700 dark:text-red-400 rounded-xl text-2xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 rounded-xl text-2xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Profil bilgileriniz başarıyla güncellendi!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ad Soyad *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-emerald-500 rounded-xl text-xs font-semibold outline-none transition text-gray-900 dark:text-white"
                    placeholder="Adınız Soyadınız"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kullanıcı Adı *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-emerald-500 rounded-xl text-xs font-semibold outline-none transition text-gray-900 dark:text-white"
                    placeholder="kullanıcıadı"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl text-2xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  Profil Değişikliklerini Kaydet
                </button>
              </div>
            </form>

            {/* Passcode Reset Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b dark:border-gray-700 pb-1">
                <h5 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Giriş Şifre / Geçiş Kodu Değişimi</h5>
                <button
                  type="button"
                  onClick={() => setShowPasscodeSection(!showPasscodeSection)}
                  className="text-3xs text-emerald-650 dark:text-emerald-400 font-extrabold uppercase hover:underline"
                >
                  {showPasscodeSection ? 'Gizle' : 'Düzenle'}
                </button>
              </div>

              {showPasscodeSection ? (
                <form onSubmit={handleUpdatePasscode} className="space-y-3.5 p-4 bg-gray-50 dark:bg-gray-850/30 border border-gray-100 dark:border-gray-750 rounded-2xl animate-in slide-in-from-top-2 duration-150">
                  {passcodeError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/40 text-red-700 dark:text-red-400 rounded-xl text-2xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passcodeError}</span>
                    </div>
                  )}

                  {passcodeSuccess && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 rounded-xl text-2xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Giriş kodunuz başarıyla güncellendi! Bir sonraki girişte yeni kodunuz geçerli olacaktır.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Mevcut Şifre/Kod</label>
                      <input
                        type="password"
                        placeholder="Örn: 4509 veya 1920"
                        value={currentPasscode}
                        onChange={(e) => setCurrentPasscode(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-emerald-500 rounded-xl text-xs font-semibold outline-none transition text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Yeni Şifre/Kod</label>
                      <input
                        type="password"
                        placeholder="En az 4 karakter"
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-emerald-500 rounded-xl text-xs font-semibold outline-none transition text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Yeni Şifre (Yeniden)</label>
                      <input
                        type="password"
                        placeholder="Aynı şifreyi girin"
                        value={confirmPasscode}
                        onChange={(e) => setConfirmPasscode(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-emerald-500 rounded-xl text-xs font-semibold outline-none transition text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl text-2xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <LockKeyhole className="w-3.5 h-3.5" />
                      Giriş Kodunu Güncelle
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                  Giriş geçiş kodunuzu veya şifrenizi güvenliğiniz için periyodik olarak güncelleyin.
                </p>
              )}
            </div>

            {/* Read-only Permissions list */}
            <div className="space-y-3.5 pt-2">
              <h5 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pb-1 border-b dark:border-gray-700">Modül Erişim İzinleriniz</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Yönetim & Kontrol', 'Kampüs & Operasyon', 'Destek & Güvenlik'].map((cat) => {
                  const allowedInCategory = ALL_TABS_LIST.filter(
                    (tab) => tab.category === cat && currentUser.allowedTabs.includes(tab.key as any)
                  );

                  return (
                    <div key={cat} className="p-3 bg-gray-50/40 dark:bg-gray-850/20 border border-gray-150/60 dark:border-gray-700/50 rounded-2xl space-y-2">
                      <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">{cat}</span>
                      <div className="flex flex-col gap-1.5">
                        {allowedInCategory.map((tab) => (
                          <div key={tab.key} className="flex items-center gap-1.5 text-2xs font-semibold text-gray-750 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
                            <span className="truncate">{tab.label}</span>
                          </div>
                        ))}
                        {allowedInCategory.length === 0 && (
                          <span className="text-[10px] text-gray-400 italic font-medium">Bu grupta yetki yok</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-blue-50/25 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded-xl flex items-start gap-2.5 text-3xs text-blue-800 dark:text-blue-300">
                <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Erişim Yetkileri Bilgilendirmesi:</strong> Modül yetki sınırlarınız ve atanmış göreviniz, kampüs güvenliği gereği sadece <strong>Sistem Yöneticisi (Admin)</strong> tarafından güncellenebilir. Değişiklik talepleri için kamp müdürünüze veya sistem yöneticisine danışınız.
                </p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-850 px-6 py-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-250 dark:border-gray-650 font-bold rounded-xl text-2xs cursor-pointer transition shadow-3xs"
            >
              Kapat
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
