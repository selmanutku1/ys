import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Building2, 
  Home, 
  HeartHandshake, 
  UtensilsCrossed, 
  Wrench, 
  Lock, 
  User, 
  LogIn,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { LoginUser } from '../App';
import { hashPassword } from '../utils';

interface LoginViewProps {
  users: LoginUser[];
  onLogin: (user: LoginUser) => void;
}

export default function LoginView({ onLogin, users }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<LoginUser | null>(null);
  const [passcode, setPasscode] = useState('');
  const passcodeRef = useRef<HTMLInputElement>(null);
  const [passcodeError, setPasscodeError] = useState('');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-5 h-5 text-indigo-600" />;
      case 'mudur': return <Building2 className="w-5 h-5 text-emerald-600" />;
      case 'kayit': return <Home className="w-5 h-5 text-amber-600" />;
      case 'saglik': return <HeartHandshake className="w-5 h-5 text-rose-600" />;
      case 'yemekhane': return <UtensilsCrossed className="w-5 h-5 text-teal-600" />;
      case 'teknik': return <Wrench className="w-5 h-5 text-orange-600" />;
      case 'guvenlik': return <Shield className="w-5 h-5 text-slate-600" />;
      case 'gonullu': return <Users className="w-5 h-5 text-emerald-600" />;
      default: return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'mudur': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'kayit': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'saglik': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'yemekhane': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'teknik': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'guvenlik': return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'gonullu': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoleTabsDescription = (user: LoginUser) => {
    switch (user.role) {
      case 'admin': return 'Tüm kampüs modüllerine sınırsız tam yetkili erişim.';
      case 'mudur': return 'Müdür Onayları, Dashboard, Raporlar ve tüm modüller.';
      case 'kayit': return 'Yerleşim Planları, Katılımcı Listeleri, Ön Kayıt Formu ve Müracaat Havuzu.';
      case 'saglik': return 'Revir Kayıtları, Kronik Hastalıklar, İlaç Takibi ve Alerji Bilgileri.';
      case 'yemekhane': return 'Öğün Planlama, Günlük Menü ve Alerjen Katılımcı Filtreleme.';
      case 'teknik': return 'Arıza Talepleri, Sarf Malzemeleri ve Tesis Alanı Teknik Takibi.';
      case 'guvenlik': return 'Ziyaretçi Takibi, Nöbet Çizelgeleri, Olay Raporlama ve Güvenlik Kameraları.';
      case 'gonullu': return 'Gönüllü Yönetimi: Müracaat kayıtları ve kamp takvimi yönetimi.';
      default: return 'Kendi yetki alanındaki modüller.';
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const foundUser = users.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (!foundUser) {
        setError('Hatalı kullanıcı adı!');
        setIsLoading(false);
        return;
      }

      const hashedInput = await hashPassword(password);
      if (foundUser.password === hashedInput) {
        onLogin(foundUser);
      } else {
        setError('Hatalı Şifre!');
      }
      setIsLoading(false);
    }, 450);
  };

  const handlePresetClick = (user: LoginUser) => {
    setError('');
    setPendingUser(user);
    setPasscode('');
    setPasscodeError('');
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');

    const hashedInput = await hashPassword(passcode);
    if (pendingUser && hashedInput === pendingUser.password) {
      onLogin(pendingUser);
      setPendingUser(null);
    } else {
      setPasscodeError('Hatalı geçiş kodu! Lütfen doğru kodu giriniz.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-between font-sans select-none" id="kys-login-container">
      {/* Top spacing / Brand banner */}
      <div className="w-full bg-emerald-800 text-white py-3 px-6 text-center text-4xs font-bold tracking-widest uppercase flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span>TÜRKİYE YEŞİLAY CEMİYETİ • KAMP YÖNETİM SİSTEMİ (KYS) GİRİŞ PORTALI</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 py-8 lg:p-12 w-full max-w-7xl mx-auto">
        
        {/* Interactive Credential login & Presets */}
        <div className="w-full max-w-[550px] bg-white rounded-3xl border border-gray-200/80 shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center bg-white border border-gray-200 rounded-2xl p-2.5 shadow-xs w-fit mx-auto">
              <div className="w-14 h-14 flex items-center justify-center bg-emerald-50 rounded-xl">
                <svg viewBox="0 0 100 100" className="w-10 h-10">
                  <path
                    d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z"
                    fill="#00AB41"
                  />
                </svg>
              </div>
              <div className="h-12 w-[1px] bg-gray-200 mx-3.5" />
              <div className="pr-2 flex flex-col justify-center text-left">
                <span className="font-black text-[#0B3B24] tracking-tight text-xl leading-none">YEŞİLAY</span>
                <span className="text-[9px] text-[#00AB41] font-black uppercase tracking-[0.2em] mt-1.5 leading-none">KAMP YÖNETİM SİSTEMİ</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide">KYS Kullanıcı Girişi</h2>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-3xs text-rose-800 font-bold leading-relaxed animate-shake">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="text-4xs text-gray-400 font-black uppercase tracking-wider block mb-1">Kullanıcı Adı</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="örn. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-xs font-bold text-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="text-4xs text-gray-400 font-black uppercase tracking-wider block mb-1">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="•••• (Şifre)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 text-xs font-bold text-gray-850 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-450 hover:text-gray-700 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold block mt-1">Giriş için kullanıcı adınızı ve şifrenizi giriniz.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#00875A] hover:bg-[#00704a] text-white rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sistemde Oturum Aç</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Selector Grid */}
          <div className="pt-4 border-t border-gray-150 space-y-4">
            <span className="text-4xs text-gray-400 font-black uppercase tracking-widest block text-center">BİRİM GÖREVLİSİ HIZLI GİRİŞ SEÇENEKLERİ</span>
            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-4">
              
              {/* Sistem Yöneticisi Giriş Alanı */}
              <div className="space-y-2 mb-4 bg-indigo-50/50 p-2.5 rounded-2xl border border-indigo-100">
                <h3 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest pl-1">Sistem Yöneticisi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {users.filter(u => u.role === 'admin').map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handlePresetClick(user)}
                      disabled={isLoading}
                      className="p-3 border rounded-xl text-left transition flex items-start gap-3 group cursor-pointer hover:shadow-md focus:outline-none bg-white border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 shadow-sm"
                    >
                      <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg shrink-0 group-hover:scale-110 transition duration-150 shadow-3xs">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-black truncate leading-tight text-indigo-950 group-hover:text-indigo-800">{user.name}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 border rounded-md text-[8px] font-extrabold uppercase inline-block leading-none ${getRoleBadgeColor(user.role)}`}>
                          {user.roleName}
                        </span>
                        <p className="text-[9px] text-gray-500 font-medium leading-normal line-clamp-2">
                          {getRoleTabsDescription(user)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gönüllü Yönetimi Giriş Alanı */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Gönüllü Yönetimi</h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {users.filter(u => u.role === 'gonullu').map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handlePresetClick(user)}
                      disabled={isLoading}
                      className="p-3.5 border rounded-2xl text-left transition flex items-start gap-4 group cursor-pointer hover:shadow-md focus:outline-none bg-emerald-50/30 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50"
                    >
                      <div className="p-2 bg-white border border-emerald-200 rounded-xl shrink-0 group-hover:scale-110 transition duration-150 shadow-sm">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black truncate leading-tight text-emerald-950 group-hover:text-emerald-800">{user.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 border rounded-lg text-[9px] font-extrabold uppercase inline-block leading-none ${getRoleBadgeColor(user.role)}`}>
                          {user.roleName} PORTALI
                        </span>
                        <p className="text-[10px] text-emerald-900/70 font-semibold leading-relaxed">
                          {getRoleTabsDescription(user)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Yönetim Kategorisi */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Yönetim ve İdare</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {users.filter(u => ['mudur'].includes(u.role)).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handlePresetClick(user)}
                      disabled={isLoading}
                      className="p-3 border rounded-xl text-left transition flex items-start gap-3 group cursor-pointer hover:shadow-xs focus:outline-none bg-emerald-50/20 border-emerald-150 hover:border-emerald-400 hover:bg-emerald-50/40"
                    >
                      <div className="p-1.5 bg-white border border-gray-100 rounded-lg shrink-0 group-hover:scale-110 transition duration-150 shadow-3xs">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-black truncate leading-tight text-emerald-950 group-hover:text-emerald-750">{user.name}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 border rounded-md text-[8px] font-extrabold uppercase inline-block leading-none ${getRoleBadgeColor(user.role)}`}>
                          {user.roleName}
                        </span>
                        <p className="text-[9px] text-gray-400 font-medium leading-normal line-clamp-2">
                          {getRoleTabsDescription(user)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Operasyon Kategorisi */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Operasyon ve Kampüs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {users.filter(u => ['kayit', 'yemekhane', 'teknik'].includes(u.role)).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handlePresetClick(user)}
                      disabled={isLoading}
                      className="p-3 border rounded-xl text-left transition flex items-start gap-3 group cursor-pointer hover:shadow-xs focus:outline-none bg-emerald-50/20 border-emerald-150 hover:border-emerald-400 hover:bg-emerald-50/40"
                    >
                      <div className="p-1.5 bg-white border border-gray-100 rounded-lg shrink-0 group-hover:scale-110 transition duration-150 shadow-3xs">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-black truncate leading-tight text-emerald-950 group-hover:text-emerald-750">{user.name}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 border rounded-md text-[8px] font-extrabold uppercase inline-block leading-none ${getRoleBadgeColor(user.role)}`}>
                          {user.roleName}
                        </span>
                        <p className="text-[9px] text-gray-400 font-medium leading-normal line-clamp-2">
                          {getRoleTabsDescription(user)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sağlık ve Güvenlik Kategorisi */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Sağlık ve Güvenlik</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {users.filter(u => ['saglik', 'guvenlik'].includes(u.role)).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handlePresetClick(user)}
                      disabled={isLoading}
                      className="p-3 border rounded-xl text-left transition flex items-start gap-3 group cursor-pointer hover:shadow-xs focus:outline-none bg-emerald-50/20 border-emerald-150 hover:border-emerald-400 hover:bg-emerald-50/40"
                    >
                      <div className="p-1.5 bg-white border border-gray-100 rounded-lg shrink-0 group-hover:scale-110 transition duration-150 shadow-3xs">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-black truncate leading-tight text-emerald-950 group-hover:text-emerald-750">{user.name}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 border rounded-md text-[8px] font-extrabold uppercase inline-block leading-none ${getRoleBadgeColor(user.role)}`}>
                          {user.roleName}
                        </span>
                        <p className="text-[9px] text-gray-400 font-medium leading-normal line-clamp-2">
                          {getRoleTabsDescription(user)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {pendingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-150 p-6 shadow-2xl space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-650 border border-emerald-100">
                <Shield className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-gray-950">Geçiş Kodu Doğrulaması</h3>
              <p className="text-xs text-gray-500 leading-normal">
                <strong>{pendingUser.name} ({pendingUser.roleName})</strong> rolüyle giriş yapmak için lütfen 4 haneli geçiş kodunu giriniz.
              </p>
            </div>

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-4xs text-gray-400 font-black uppercase tracking-wider block">Geçiş Kodu</label>
                <input
                  ref={passcodeRef}
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPasscodeError('');
                  }}
                  className="w-full text-center tracking-widest text-lg font-extrabold py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none transition-all"
                  autoFocus
                />
                {passcodeError && (
                  <span className="text-[10px] text-rose-600 font-bold block text-center mt-1">{passcodeError}</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingUser(null);
                    setPasscode('');
                    setPasscodeError('');
                    if (passcodeRef.current) passcodeRef.current.value = '';
                  }}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md"
                >
                  Doğrula & Gir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="py-5 border-t border-gray-200 bg-white text-center text-xs text-gray-400 font-semibold space-y-1">
        <p>© 2026 Türkiye Yeşilay Cemiyeti • Kampüs Operasyonları ve Güvenli Erişim Altyapısı</p>
        <p className="text-[10px] text-gray-300">Bu sistem sadece yetkilendirilmiş personel kullanımına özeldir.</p>
      </footer>
    </div>
  );
}
