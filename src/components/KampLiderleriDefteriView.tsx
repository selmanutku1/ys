import React, { useState } from 'react';
import { Staff, CampPeriod } from '../types';
import { Users, Plus, Edit2, X, Eye, Download } from 'lucide-react';

interface KampLiderleriDefteriViewProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  periods: CampPeriod[];
}

export default function KampLiderleriDefteriView({ staff, setStaff, periods }: KampLiderleriDefteriViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'detay' | 'geçmiş'>('detay');
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<Staff | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const leaders = (staff || []).filter(s => s.role === 'Grup Lideri' || s.role === 'Kamp Koordinatörü');
  const filteredLeaders = leaders.filter(l =>
    l.name.toLowerCase().includes(filterName.toLowerCase()) &&
    (filterRole === '' || l.role === filterRole)
  );

  const topLeaders = [...leaders]
    .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
    .slice(0, 3)
    .filter(l => l.performanceScore && l.performanceScore > 0);

  const getSkillSummary = (leader: Staff) => {
    const count = (leader.trainings?.length || 0) + (leader.expertise?.length || 0) + (leader.certifications?.length || 0);
    const top = leader.expertise?.[0] || leader.trainings?.[0] || 'Genel';
    return { count, top };
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
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
      competencies: formData.get('competencies') as string,
      trainings: (formData.get('trainings') as string).split(',').map(s => s.trim()).filter(Boolean),
      expertise: (formData.get('expertise') as string).split(',').map(s => s.trim()).filter(Boolean),
      certifications: (formData.get('certifications') as string).split(',').map(s => s.trim()).filter(Boolean),
      campCenterId: editingStaff?.campCenterId || '',
      shiftHours: editingStaff?.shiftHours || '',
      isActive: editingStaff?.isActive ?? true,
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

  const leaderCamps = selectedLeader ? periods.filter(p => p.leaderId === selectedLeader.id) : [];

  const exportCSV = () => {
    const headers = ['Ad Soyad', 'Görevi', 'Telefon', 'Email', 'Kişisel Not', 'Puan', 'Yetkinlikler'];
    const rows = filteredLeaders.map(l => [l.name, l.role, l.phone, l.email, l.personalNote || '', l.performanceScore || '', l.competencies || '']);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kamp_liderleri.csv';
    a.click();
  };

  return (
    <div className="p-6 bg-gray-50/50 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Kamp Liderleri Defteri</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold"
          >
            <Download className="w-4 h-4" /> İndir
          </button>
          <button 
            onClick={() => { setEditingStaff(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Yeni Lider Ekle
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="İsim ile filtrele..." 
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="p-2 border border-gray-200 rounded-lg text-sm w-64"
        />
        <select 
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="p-2 border border-gray-200 rounded-lg text-sm w-64"
        >
          <option value="">Tüm Roller</option>
          <option value="Grup Lideri">Grup Lideri</option>
          <option value="Kamp Koordinatörü">Kamp Koordinatörü</option>
        </select>
      </div>

      {topLeaders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">En İyi Liderler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topLeaders.map((leader, index) => (
              <div key={leader.id} className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-sm">{leader.name}</p>
                  <p className="text-xs text-gray-500">{'★'.repeat(leader.performanceScore || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 text-xs font-bold text-gray-400 uppercase">Lider</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase">Görevi</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase">Telefon</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase">Email</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase">Kişisel Not</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase">Puan</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase">Yetkinlikler</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase">Yetenek</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaders.map(leader => (
              <tr key={leader.id} className="border-b border-gray-50">
                <td className="py-4 text-sm font-semibold text-gray-900 flex items-center gap-3">
                  {leader.profilePicture ? (
                    <img src={leader.profilePicture} alt={leader.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      {getInitials(leader.name)}
                    </div>
                  )}
                  {leader.name}
                </td>
                <td className="py-4 text-sm text-gray-600">{leader.role}</td>
                <td className="py-4 text-sm text-gray-600">{leader.phone}</td>
                <td className="py-4 text-sm text-gray-600">{leader.email}</td>
                <td className="py-4 text-sm text-gray-600">{leader.personalNote || '-'}</td>
                <td className="py-4 text-sm text-gray-600">{'★'.repeat(leader.performanceScore || 0)}</td>
                <td className="py-4 text-sm text-gray-600">{leader.competencies || '-'}</td>
                <td className="py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold">
                      {getSkillSummary(leader).top}
                    </span>
                    <span className="text-xs text-gray-400">+{getSkillSummary(leader).count}</span>
                  </div>
                </td>
                <td className="py-4 text-sm flex gap-2">
                  <button 
                    onClick={() => openProfile(leader)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Profili Görüntüle"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setEditingStaff(leader); setIsModalOpen(true); }}
                    className="text-emerald-600 hover:text-emerald-800"
                    title="Düzenle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{editingStaff ? 'Lideri Düzenle' : 'Yeni Lider Ekle'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input name="name" defaultValue={editingStaff?.name} placeholder="Ad Soyad" required className="col-span-2 p-2 border border-gray-200 rounded text-sm" />
              <select name="role" defaultValue={editingStaff?.role || 'Grup Lideri'} className="p-2 border border-gray-200 rounded text-sm">
                <option value="Grup Lideri">Grup Lideri</option>
                <option value="Kamp Koordinatörü">Kamp Koordinatörü</option>
              </select>
              <input name="performanceScore" type="number" min="1" max="5" defaultValue={editingStaff?.performanceScore} placeholder="Puan (1-5)" className="p-2 border border-gray-200 rounded text-sm" />
              <input name="phone" defaultValue={editingStaff?.phone} placeholder="Telefon" required className="p-2 border border-gray-200 rounded text-sm" />
              <input name="email" defaultValue={editingStaff?.email} type="email" placeholder="Email" required className="p-2 border border-gray-200 rounded text-sm" />
              <input name="competencies" defaultValue={editingStaff?.competencies} placeholder="Yetkinlikler (virgülle ayır)" className="col-span-2 p-2 border border-gray-200 rounded text-sm" />
              <input name="trainings" defaultValue={editingStaff?.trainings?.join(', ')} placeholder="Eğitimler (virgülle ayır)" className="col-span-2 p-2 border border-gray-200 rounded text-sm" />
              <input name="expertise" defaultValue={editingStaff?.expertise?.join(', ')} placeholder="Uzmanlıklar (virgülle ayır)" className="col-span-2 p-2 border border-gray-200 rounded text-sm" />
              <input name="certifications" defaultValue={editingStaff?.certifications?.join(', ')} placeholder="Sertifikalar (virgülle ayır)" className="col-span-2 p-2 border border-gray-200 rounded text-sm" />
              <textarea name="personalNote" defaultValue={editingStaff?.personalNote} placeholder="Kişisel Not" className="col-span-2 p-2 border border-gray-200 rounded text-sm h-20" />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Profil Resmi</label>
              <input type="file" onChange={handleFileChange} accept="image/*" className="w-full text-sm" />
            </div>
            <button type="submit" className="w-full mt-6 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 text-sm">Kaydet</button>
          </form>
        </div>
      )}

      {isProfileOpen && selectedLeader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              {selectedLeader.profilePicture ? (
                <img src={selectedLeader.profilePicture} alt={selectedLeader.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl">
                  {getInitials(selectedLeader.name)}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">{selectedLeader.name}</h2>
                <p className="text-gray-500">{selectedLeader.role}</p>
              </div>
              <button onClick={() => setIsProfileOpen(false)} className="ml-auto"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex border-b mb-6">
              <button 
                onClick={() => setActiveProfileTab('detay')}
                className={`py-2 px-4 font-bold text-sm ${activeProfileTab === 'detay' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
              >
                Profil Detayları
              </button>
              <button 
                onClick={() => setActiveProfileTab('geçmiş')}
                className={`py-2 px-4 font-bold text-sm ${activeProfileTab === 'geçmiş' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
              >
                Görev Geçmişi
              </button>
            </div>

            {activeProfileTab === 'detay' ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Telefon</p>
                    <p className="text-sm font-semibold">{selectedLeader.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                    <p className="text-sm font-semibold">{selectedLeader.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Toplam Kamp</p>
                    <p className="text-sm font-semibold">{leaderCamps.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Performans</p>
                    <p className="text-sm font-semibold">{'★'.repeat(selectedLeader.performanceScore || 0)}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-gray-500 uppercase font-bold">Kişisel Not</p>
                  <p className="text-sm">{selectedLeader.personalNote || '-'}</p>
                </div>
                
                <div className="mb-6">
                  <p className="text-xs text-gray-500 uppercase font-bold">Yetkinlikler</p>
                  <p className="text-sm">{selectedLeader.competencies || '-'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Eğitimler</p>
                    <p className="text-sm">{selectedLeader.trainings?.join(', ') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Uzmanlıklar</p>
                    <p className="text-sm">{selectedLeader.expertise?.join(', ') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Sertifikalar</p>
                    <p className="text-sm">{selectedLeader.certifications?.join(', ') || '-'}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {leaderCamps.length > 0 ? (
                  <ul className="space-y-3">
                    {leaderCamps.map(camp => (
                      <li key={camp.id} className="text-sm bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{camp.name}</p>
                          <p className="text-xs text-gray-500">Proje: {camp.projectId || 'Belirtilmemiş'}</p>
                        </div>
                        <span className="text-gray-500 text-xs bg-white px-2 py-1 rounded border">
                          {new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic p-4">Henüz görev geçmişi bulunmuyor.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
