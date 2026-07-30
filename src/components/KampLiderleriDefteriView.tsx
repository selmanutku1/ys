import React, { useState, useMemo } from 'react';
import { Staff, CampPeriod } from '../types';
import { 
  Users, Plus, Edit2, X, Eye, Download, Star, Award, BookOpen, 
  Briefcase, GraduationCap, Phone, Mail, MapPin, Calendar, CheckCircle2, AlertCircle, ChevronRight, Search, Filter, ShieldCheck, Clock
, User
, ClipboardList, Sparkles } from 'lucide-react';

interface KampLiderleriDefteriViewProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  periods: CampPeriod[];
}

const PREDEFINED_EXPERTISE = [
  'Doğa Yürüyüşü', 'İzcilik', 'Tiyatro & Drama', 'Oyun Kurucu',
  'Müzik & Ritim', 'El Sanatları', 'Geleneksel Sporlar', 'Oryantiring'
];

const PREDEFINED_COMPETENCIES = [
  'Kriz Yönetimi', 'Etkili İletişim', 'Takım Çalışması', 'Çatışma Çözümü',
  'Liderlik & Motivasyon', 'İlkyardım & Acil Durum', 'Empati ve Gözlem'
];

const PREDEFINED_TRAININGS = [
  'Temel Liderlik Eğitimi', 'İletişim Becerileri', 'Bağımlılıkla Mücadele',
  'Etkileşimli Grup Çalışmaları', 'Pedagojik Formasyon', 'Kapsayıcı Yaklaşımlar'
];

const PREDEFINED_CERTIFICATIONS = [
  'İlk Yardım Sertifikası', 'İş Sağlığı ve Güvenliği', 'Arama Kurtarma Eğitimi',
  'Spor Eğitmenliği Sertifikası', 'İşaret Dili Sertifikası'
];

export default function KampLiderleriDefteriView({ staff, setStaff, periods }: KampLiderleriDefteriViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'detay' | 'geçmiş' | 'aktif_gorevler'>('detay');
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<Staff | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterExpertise, setFilterExpertise] = useState('');

  const [mainTab, setMainTab] = useState<'profiller' | 'gorevdagitimi'>('profiller');
  const [selectedTaskPeriodId, setSelectedTaskPeriodId] = useState<string>(periods.length > 0 ? periods[0].id : '');
  const [activityTasks, setActivityTasks] = useState<{ id: string, title: string, type: string, time: string, location: string, assignedLeaderIds: string[] }[]>([
    { id: 't1', title: 'Sabah Sporu ve Doğa Yürüyüşü', type: 'Spor', time: '08:00', location: 'Orman Parkuru', assignedLeaderIds: [] },
    { id: 't2', title: 'Liderlik ve İletişim Atölyesi', type: 'Atölye', time: '10:30', location: 'Ana Salon', assignedLeaderIds: [] },
    { id: 't3', title: 'Oryantiring ve Takım Oyunları', type: 'Atölye', time: '14:00', location: 'Kampüs Bahçesi', assignedLeaderIds: [] },
    { id: 't4', title: 'Akşam Ateşi ve Değerlendirme', type: 'Eğlence', time: '20:30', location: 'Kamp Ateşi Alanı', assignedLeaderIds: [] },
  ]);

  const handleAutoAssignTasks = () => {
    const period = periods.find(p => p.id === selectedTaskPeriodId);
    let availableLeaders = leaders;
    
    // Yalnızca bu döneme atanmış liderler
    if (period && (period.leaderIds?.length || period.leaderId)) {
        const pLeaderIds = period.leaderIds?.length ? period.leaderIds : (period.leaderId ? [period.leaderId] : []);
        availableLeaders = leaders.filter(l => pLeaderIds.includes(l.id));
    }
    
    if (availableLeaders.length === 0) return;

    setActivityTasks(prev => prev.map(task => {
        let bestLeader = availableLeaders[Math.floor(Math.random() * availableLeaders.length)];
        
        // Yetkinlik/Uzmanlık eşleştirme algoritması (basit)
        const taskKeywords = (task.title + " " + task.type).toLowerCase();
        const matchedLeader = availableLeaders.find(leader => 
            leader.expertise?.some(exp => taskKeywords.includes(exp.toLowerCase().split(' ')[0])) ||
            leader.competencies?.toLowerCase().includes('liderlik')
        );
        
        if (matchedLeader) bestLeader = matchedLeader;
        
        return { ...task, assignedLeaderIds: [bestLeader.id] };
    }));
  };

  const handleManualAssign = (taskId: string, leaderId: string) => {
    setActivityTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const current = t.assignedLeaderIds;
        const newIds = current.includes(leaderId) 
          ? current.filter(id => id !== leaderId) 
          : [...current, leaderId];
        return { ...t, assignedLeaderIds: newIds };
      }
      return t;
    }));
  };

  const leaders = useMemo(() => (staff || []).filter(s => s.role === 'Grup Lideri' || s.role === 'Kamp Koordinatörü'), [staff]);
  
  const filteredLeaders = useMemo(() => leaders.filter(l =>
    l.name.toLowerCase().includes(filterName.toLowerCase()) &&
    (filterRole === '' || l.role === filterRole) &&
    (filterExpertise === '' || (l.expertise && l.expertise.some(e => e.toLowerCase().includes(filterExpertise.toLowerCase()))))
  ), [leaders, filterName, filterRole, filterExpertise]);

  const topLeaders = useMemo(() => [...leaders]
    .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
    .slice(0, 3)
    .filter(l => l.performanceScore && l.performanceScore > 0), [leaders]);

  // Stats calculation
  const totalLeaders = leaders.length;
  const activeLeaders = leaders.filter(l => l.isActive !== false).length;
  const avgScore = leaders.length > 0 ? (leaders.reduce((sum, l) => sum + (l.performanceScore || 0), 0) / leaders.length).toFixed(1) : '0';
  const expertises = Array.from(new Set(leaders.flatMap(l => l.expertise || [])));

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-3.5 h-3.5 ${i < score ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'}`} 
      />
    ));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setProfilePicture(canvas.toDataURL('image/jpeg', 0.8));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStaff: Staff = {
      id: editingStaff ? editingStaff.id : Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      role: formData.get('role') as 'Grup Lideri' | 'Kamp Koordinatörü',
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      personalNote: formData.get('personalNote') as string,
      performanceScore: Number(formData.get('performanceScore')),
      competencies: (formData.getAll('competencies') as string[]).join(', '),
      trainings: formData.getAll('trainings') as string[],
      expertise: formData.getAll('expertise') as string[],
      certifications: formData.getAll('certifications') as string[],
      campCenterId: editingStaff?.campCenterId || '',
      shiftHours: editingStaff?.shiftHours || '',
      isActive: formData.get('isActive') === 'on',
      profilePicture: profilePicture || editingStaff?.profilePicture,
    };

    if (editingStaff) {
      setStaff(prev => prev.map(s => s.id === newStaff.id ? newStaff : s));
    } else {
      setStaff(prev => [...prev, newStaff]);
    }
    setIsModalOpen(false);
    setEditingStaff(null);
    setProfilePicture(null);
  };

  const openProfile = (leader: Staff) => {
    setSelectedLeader(leader);
    setActiveProfileTab('detay');
    setIsProfileOpen(true);
  };

  const exportCSV = () => {
    const headers = ['İsim', 'Rol', 'Telefon', 'E-posta', 'Performans', 'Durum', 'Yetkinlikler', 'Uzmanlıklar'];
    const csvContent = [
      headers.join(','),
      ...filteredLeaders.map(l => [
        l.name,
        l.role,
        l.phone,
        l.email,
        l.performanceScore || 0,
        l.isActive !== false ? 'Aktif' : 'Pasif',
        `"${l.competencies || ''}"`,
        `"${(l.expertise || []).join(', ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'kamp_liderleri.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const leaderCamps = selectedLeader ? periods.filter(p => 
    p.leaderId === selectedLeader.id || (p.leaderIds && p.leaderIds.includes(selectedLeader.id))
  ) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header Area */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit mx-auto mb-4">
        <button
          onClick={() => setMainTab('profiller')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mainTab === 'profiller' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Lider Profilleri</div>
        </button>
        <button
          onClick={() => setMainTab('gorevdagitimi')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mainTab === 'gorevdagitimi' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Görev Dağıtım Modülü</div>
        </button>
      </div>
      
      {mainTab === 'profiller' ? (
      <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700 rounded-xl shadow-sm border border-emerald-100/50">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Kamp Liderleri</h1>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Lider profilleri, performansları ve görev geçmişleri</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button 
            onClick={exportCSV}
            className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-bold shadow-sm"
          >
            <Download className="w-4 h-4" /> Dışa Aktar
          </button>
          <button 
            onClick={() => { setEditingStaff(null); setIsModalOpen(true); }}
            className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 hover:shadow-md transition-all text-sm font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Yeni Lider Ekle
          </button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Toplam</span>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{totalLeaders}</p>
            <p className="text-xs font-semibold text-gray-500">Kayıtlı Kamp Lideri</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Aktif</span>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{activeLeaders}</p>
            <p className="text-xs font-semibold text-gray-500">Görev Alabilir Durumda</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-700" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Kalite</span>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{avgScore}</p>
            <p className="text-xs font-semibold text-gray-500">Ortalama Performans</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Yetkinlik</span>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{expertises.length}</p>
            <p className="text-xs font-semibold text-gray-500">Farklı Uzmanlık Alanı</p>
          </div>
        </div>
      </div>

      {/* Top Leaders Showcase */}
      {topLeaders.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-400/20 rounded-lg border border-amber-400/30">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold tracking-wide">Öne Çıkan Liderler</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topLeaders.map((leader, index) => (
              <div key={leader.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4 hover:bg-white/20 transition cursor-pointer" onClick={() => openProfile(leader)}>
                <div className="relative">
                  {leader.profilePicture ? (
                    <img src={leader.profilePicture} alt={leader.name} className="w-14 h-14 rounded-full object-contain border-2 border-white/20" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-200 to-orange-400 text-amber-900 flex items-center justify-center font-black text-lg border-2 border-white/20">
                      {getInitials(leader.name)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-[10px] font-black">
                    #{index + 1}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-base line-clamp-1">{leader.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {renderStars(leader.performanceScore || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-2 md:p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Lider ismi ile ara..." 
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border-none bg-gray-50 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-gray-400" />
            </div>
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border-none bg-gray-50 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer text-gray-700"
            >
              <option value="">Tüm Roller</option>
              <option value="Grup Lideri">Grup Lideri</option>
              <option value="Kamp Koordinatörü">Kamp Koordinatörü</option>
            </select>
          </div>
          <div className="relative flex-1 md:w-48">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <BookOpen className="w-4 h-4 text-gray-400" />
            </div>
            <select 
              value={filterExpertise}
              onChange={(e) => setFilterExpertise(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border-none bg-gray-50 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer text-gray-700"
            >
              <option value="">Tüm Uzmanlıklar</option>
              {expertises.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leaders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredLeaders.length > 0 ? filteredLeaders.map((leader) => (
          <div 
            key={leader.id} 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all group flex flex-col cursor-pointer"
            onClick={() => openProfile(leader)}
          >
            {/* Card Header (Cover + Avatar) */}
            <div className="h-20 bg-gradient-to-r from-emerald-500 to-teal-400 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="absolute right-3 top-3">
                {leader.isActive === false ? (
                  <span className="px-2 py-1 bg-white/90 text-red-700 text-[9px] font-black rounded-lg uppercase shadow-sm flex items-center gap-1 backdrop-blur-sm">
                    <AlertCircle className="w-3 h-3" /> Pasif
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-white/90 text-emerald-700 text-[9px] font-black rounded-lg uppercase shadow-sm flex items-center gap-1 backdrop-blur-sm">
                    <CheckCircle2 className="w-3 h-3" /> Aktif
                  </span>
                )}
              </div>
            </div>
            
            <div className="px-5 pb-5 pt-0 flex-1 flex flex-col">
              <div className="flex justify-between items-start -mt-10 mb-3 relative z-10">
                {leader.profilePicture ? (
                  <img src={leader.profilePicture} alt={leader.name} className="w-20 h-20 rounded-2xl object-contain border-4 border-white shadow-sm bg-white" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-sm flex items-center justify-center font-black text-3xl text-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100">
                    {getInitials(leader.name)}
                  </div>
                )}
                <div className="mt-12 flex gap-1 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5">
                  {renderStars(leader.performanceScore || 0)}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-extrabold text-gray-900 text-lg leading-tight group-hover:text-emerald-700 transition-colors">{leader.name}</h3>
                <p className="text-xs font-bold text-gray-500 mt-0.5 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> {leader.role}
                </p>
              </div>

              <div className="space-y-3 flex-1">
                {leader.expertise && leader.expertise.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Uzmanlık</p>
                    <div className="flex flex-wrap gap-1.5">
                      {leader.expertise.slice(0, 3).map((e, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-50 border border-purple-100 text-purple-700 rounded-md text-[10px] font-bold">
                          {e}
                        </span>
                      ))}
                      {leader.expertise.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-md text-[10px] font-bold">
                          +{leader.expertise.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {leader.competencies && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Yetkinlikler</p>
                    <p className="text-xs font-medium text-gray-600 line-clamp-2 leading-relaxed">
                      {leader.competencies}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); openProfile(leader); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  <Eye className="w-4 h-4" /> Profili İncele
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingStaff(leader);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-transparent hover:border-emerald-100"
                  title="Düzenle"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
            <Users className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-900">Sonuç Bulunamadı</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md">Arama ve filtreleme kriterlerinize uygun lider bulunmamaktadır. Lütfen filtreleri temizleyip tekrar deneyin.</p>
            <button 
              onClick={() => { setFilterName(''); setFilterRole(''); setFilterExpertise(''); }}
              className="mt-4 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Leader Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                  {editingStaff ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">{editingStaff ? 'Lideri Düzenle' : 'Yeni Lider Ekle'}</h2>
                  <p className="text-xs font-medium text-gray-500">Lider bilgilerini ve uzmanlık alanlarını güncelleyin</p>
                </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); setProfilePicture(null); }} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="leader-form" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Personal Info Section */}
                <div className="col-span-full pb-2 border-b border-gray-100 mb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                    <User className="w-4 h-4 text-emerald-600" /> Kişisel Bilgiler
                  </h3>
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5">Ad Soyad</label>
                  <input name="name" defaultValue={editingStaff?.name} placeholder="Örn: Ahmet Yılmaz" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5">Rolü</label>
                  <select name="role" defaultValue={editingStaff?.role || 'Grup Lideri'} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none appearance-none bg-white">
                    <option value="Grup Lideri">Grup Lideri</option>
                    <option value="Kamp Koordinatörü">Kamp Koordinatörü</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5">Performans Puanı (1-5)</label>
                  <input name="performanceScore" type="number" min="1" max="5" defaultValue={editingStaff?.performanceScore} placeholder="Örn: 4" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5">Telefon</label>
                  <input name="phone" defaultValue={editingStaff?.phone} placeholder="5XX XXX XX XX" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5">E-posta</label>
                  <input name="email" defaultValue={editingStaff?.email} type="email" placeholder="ornek@yesilay.org.tr" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5">Profil Resmi (İsteğe Bağlı)</label>
                  <div className="flex items-center gap-4">
                    {(profilePicture || editingStaff?.profilePicture) ? (
                      <img src={profilePicture || editingStaff?.profilePicture} alt="Preview" className="w-16 h-16 rounded-xl object-contain border border-gray-200 shadow-sm shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 border-dashed flex items-center justify-center text-gray-400 shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <input type="file" onChange={handleFileChange} accept="image/*" className="w-full text-sm font-medium text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-gray-200 rounded-xl p-1" />
                  </div>
                </div>

                {/* Professional Info Section */}
                <div className="col-span-full pb-2 border-b border-gray-100 mt-4 mb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                    <Award className="w-4 h-4 text-emerald-600" /> Mesleki Gelişim ve Yetkinlikler
                  </h3>
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-extrabold text-gray-700 mb-2.5">Uzmanlık Alanları</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PREDEFINED_EXPERTISE.map(exp => (
                      <label key={exp} className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors bg-white">
                        <input type="checkbox" name="expertise" value={exp} defaultChecked={editingStaff?.expertise?.includes(exp)} className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
                        <span className="text-sm font-medium text-gray-700">{exp}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-extrabold text-gray-700 mb-2.5">Yetkinlikler</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PREDEFINED_COMPETENCIES.map(comp => (
                      <label key={comp} className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors bg-white">
                        <input type="checkbox" name="competencies" value={comp} defaultChecked={editingStaff?.competencies?.includes(comp)} className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
                        <span className="text-sm font-medium text-gray-700">{comp}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-extrabold text-gray-700 mb-2.5">Eğitimler</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PREDEFINED_TRAININGS.map(train => (
                      <label key={train} className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors bg-white">
                        <input type="checkbox" name="trainings" value={train} defaultChecked={editingStaff?.trainings?.includes(train)} className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
                        <span className="text-sm font-medium text-gray-700">{train}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="col-span-full">
                  <label className="block text-xs font-extrabold text-gray-700 mb-2.5">Sertifikalar</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PREDEFINED_CERTIFICATIONS.map(cert => (
                      <label key={cert} className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors bg-white">
                        <input type="checkbox" name="certifications" value={cert} defaultChecked={editingStaff?.certifications?.includes(cert)} className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
                        <span className="text-sm font-medium text-gray-700">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5">Kişisel Not & Değerlendirme</label>
                  <textarea name="personalNote" defaultValue={editingStaff?.personalNote} placeholder="Lider hakkında eklemek istedikleriniz, gözlemleriniz..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-24 resize-none" />
                </div>

                <div className="col-span-full flex items-center gap-3 mt-2 p-4 bg-gray-50/80 rounded-xl border border-gray-200">
                  <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                      <input type="checkbox" name="isActive" id="isActive" defaultChecked={editingStaff?.isActive ?? true} className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer" />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                      <label htmlFor="isActive" className="font-bold text-gray-900 cursor-pointer">Aktif Lider</label>
                      <p className="text-gray-500 text-xs">Bu işaret kaldırıldığında lider pasif duruma geçer ve yeni kamplara atanamaz.</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end shrink-0">
              <button 
                type="button" 
                onClick={() => { setIsModalOpen(false); setProfilePicture(null); }} 
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-sm"
              >
                İptal
              </button>
              <button 
                type="submit" 
                form="leader-form" 
                className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
              >
                {editingStaff ? 'Değişiklikleri Kaydet' : 'Sisteme Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leader Profile Modal (Full Redesign) */}
      {isProfileOpen && selectedLeader && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
            <div className="absolute top-4 right-4 z-50">
              <button 
                onClick={() => setIsProfileOpen(false)} 
                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-8 pb-8 pt-8 overflow-y-auto custom-scrollbar flex-1 relative">
              {/* Profile Main Info */}
              <div className="flex flex-col md:flex-row gap-6 items-start relative z-10 mb-8">
                {selectedLeader.profilePicture ? (
                  <img src={selectedLeader.profilePicture} alt={selectedLeader.name} className="w-28 h-28 rounded-2xl object-contain border-2 border-gray-100 shadow-md bg-white shrink-0" />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-100 shadow-md flex items-center justify-center font-black text-4xl text-emerald-600 shrink-0">
                    {getInitials(selectedLeader.name)}
                  </div>
                )}
                
                <div className="flex-1 md:pt-4 w-full">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        {selectedLeader.name}
                        {selectedLeader.isActive !== false ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg uppercase shadow-sm">Aktif</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-red-100 text-red-800 text-[10px] font-black rounded-lg uppercase shadow-sm">Pasif</span>
                        )}
                      </h2>
                      <p className="text-gray-500 font-bold text-sm mt-1 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" /> {selectedLeader.role}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Performans Puanı</span>
                        <div className="flex gap-1 mt-1">
                          {renderStars(selectedLeader.performanceScore || 0)}
                        </div>
                      </div>
                      <div className="h-8 w-px bg-gray-200"></div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Görev</span>
                        <span className="text-lg font-black text-gray-900">{leaderCamps.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 mb-6 gap-6">
                <button 
                  onClick={() => setActiveProfileTab('detay')}
                  className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeProfileTab === 'detay' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <User className="w-4 h-4" /> Genel Bakış ve Yetkinlikler
                </button>
                <button 
                  onClick={() => setActiveProfileTab('geçmiş')}
                  className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeProfileTab === 'geçmiş' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <Calendar className="w-4 h-4" /> Görev Geçmişi ({leaderCamps.length})
                </button>
                <button 
                  onClick={() => setActiveProfileTab('aktif_gorevler')}
                  className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeProfileTab === 'aktif_gorevler' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <ClipboardList className="w-4 h-4" /> Aktif Görevler
                </button>
              </div>

              {/* Tab Content */}
              {activeProfileTab === 'detay' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Contact & Notes */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">İletişim Bilgileri</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500"><Phone className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400">TELEFON</p>
                            <p className="text-sm font-bold text-gray-900">{selectedLeader.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500"><Mail className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400">E-POSTA</p>
                            <p className="text-sm font-bold text-gray-900">{selectedLeader.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                      <h3 className="text-xs font-black text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" /> Kişisel Not & Değerlendirme
                      </h3>
                      <p className="text-sm text-amber-900 font-medium leading-relaxed">
                        {selectedLeader.personalNote || 'Henüz bir değerlendirme notu eklenmemiş.'}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Skills, Trainings, Certs */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Uzmanlıklar */}
                      <div className="bg-white border border-gray-150 shadow-sm p-5 rounded-2xl">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-600" /> Uzmanlık Alanları
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedLeader.expertise && selectedLeader.expertise.length > 0 ? (
                            selectedLeader.expertise.map((e, i) => (
                              <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs font-bold shadow-sm">
                                {e}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm font-medium text-gray-400 italic">Bilgi girilmemiş</p>
                          )}
                        </div>
                      </div>

                      {/* Yetkinlikler */}
                      <div className="bg-white border border-gray-150 shadow-sm p-5 rounded-2xl">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Star className="w-4 h-4 text-emerald-600" /> Temel Yetkinlikler
                        </h3>
                        {selectedLeader.competencies ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedLeader.competencies.split(',').map((c, i) => (
                              <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold shadow-sm">
                                {c.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-gray-400 italic">Bilgi girilmemiş</p>
                        )}
                      </div>

                      {/* Eğitimler */}
                      <div className="bg-white border border-gray-150 shadow-sm p-5 rounded-2xl">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-600" /> Alınan Eğitimler
                        </h3>
                        <ul className="space-y-2">
                          {selectedLeader.trainings && selectedLeader.trainings.length > 0 ? (
                            selectedLeader.trainings.map((t, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm font-medium text-gray-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                <span>{t}</span>
                              </li>
                            ))
                          ) : (
                            <p className="text-sm font-medium text-gray-400 italic">Bilgi girilmemiş</p>
                          )}
                        </ul>
                      </div>

                      {/* Sertifikalar */}
                      <div className="bg-white border border-gray-150 shadow-sm p-5 rounded-2xl">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-amber-600" /> Sertifikalar
                        </h3>
                        <ul className="space-y-2">
                          {selectedLeader.certifications && selectedLeader.certifications.length > 0 ? (
                            selectedLeader.certifications.map((c, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm font-medium text-gray-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                <span>{c}</span>
                              </li>
                            ))
                          ) : (
                            <p className="text-sm font-medium text-gray-400 italic">Bilgi girilmemiş</p>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 min-h-[300px]">
                  {leaderCamps.length > 0 ? (
                    <div className="relative border-l-2 border-emerald-200 ml-4 space-y-8">
                      {leaderCamps.map((camp, idx) => (
                        <div key={camp.id} className="relative pl-6">
                          <div className="absolute -left-[9px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow-sm" />
                          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <div>
                                <h4 className="font-bold text-gray-900 text-base">{camp.name}</h4>
                                <p className="text-xs font-semibold text-gray-500 mt-1 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5" /> Proje Kodu: {camp.projectId || 'Belirtilmemiş'}
                                </p>
                              </div>
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase border border-emerald-100">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(camp.startDate).toLocaleDateString('tr-TR')} - {new Date(camp.endDate).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <Calendar className="w-8 h-8 text-gray-300" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">Görev Geçmişi Yok</h4>
                      <p className="text-gray-500 text-sm mt-1 max-w-sm">Bu lider henüz herhangi bir kampa atanmamış. Katılımcı yerleşimi sırasında görevlendirme yapabilirsiniz.</p>

              {activeProfileTab === 'aktif_gorevler' && (
                <div className="space-y-4">
                  {activityTasks.filter(t => t.assignedLeaderIds.includes(selectedLeader.id)).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activityTasks.filter(t => t.assignedLeaderIds.includes(selectedLeader.id)).map(task => (
                        <div key={task.id} className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                          <div className="flex justify-between items-start mb-2 pl-2">
                            <span className="text-3xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{task.type}</span>
                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {task.time}</span>
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm mb-1 pl-2">{task.title}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1 pl-2"><MapPin className="w-3 h-3" /> {task.location}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <CheckCircle2 className="w-8 h-8 text-gray-300" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">Aktif Görev Yok</h4>
                      <p className="text-gray-500 text-sm mt-1 max-w-sm">Bu liderin şu anda atanmış olduğu aktif bir etkinlik görevi bulunmuyor.</p>
                    </div>
                  )}
                </div>
              )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </>
      ) : (
        /* GÖREV DAĞITIM MODÜLÜ */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <ClipboardList className="w-6 h-6 text-emerald-600" />
                  Görev ve Etkinlik Dağıtımı
                </h2>
                <p className="text-sm text-gray-500 mt-1">Belirli bir kamp dönemi için etkinlik liderlerini atayın.</p>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={selectedTaskPeriodId}
                  onChange={e => setSelectedTaskPeriodId(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none min-w-[200px]"
                >
                  <option value="" disabled>Kamp Dönemi Seçiniz</option>
                  {periods.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleAutoAssignTasks}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors font-bold text-sm shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Otomatik Dağıtım Yap
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activityTasks.map(task => (
                <div key={task.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl"></div>
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <span className="text-3xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{task.type}</span>
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {task.time}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 pl-2">{task.title}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-4 pl-2"><MapPin className="w-3 h-3" /> {task.location}</p>
                  
                  <div className="pl-2 border-t border-gray-100 pt-3">
                    <p className="text-3xs font-bold text-gray-400 uppercase mb-2">Atanan Lider(ler)</p>
                    <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                      {task.assignedLeaderIds.length > 0 ? (
                        task.assignedLeaderIds.map(id => {
                          const l = leaders.find(x => x.id === id);
                          if (!l) return null;
                          return (
                            <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">
                              {l.name}
                              <button onClick={() => handleManualAssign(task.id, id)} className="hover:text-emerald-200 ml-1"><X className="w-3 h-3" /></button>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-md border border-amber-100 w-full flex items-center justify-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Lider atanmadı
                        </span>
                      )}
                    </div>
                    
                    {/* Hızlı Ekleme Menüsü */}
                    <select
                      value=""
                      onChange={e => {
                        if(e.target.value) handleManualAssign(task.id, e.target.value);
                      }}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">+ Manuel Lider Ekle</option>
                      {leaders.map(l => (
                        <option key={l.id} value={l.id} disabled={task.assignedLeaderIds.includes(l.id)}>{l.name} ({l.expertise?.[0] || 'Genel'})</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
