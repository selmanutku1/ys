import React, { useState } from 'react';
import { CampPeriod, CampCenter, SystemLog, Participant, Staff } from '../types';
import { ExternalLink, Search, Sparkles, Calendar, Users, Edit2, Plus, Check, Share2, AlertTriangle, ShieldCheck, FileText, ChevronRight, CheckCircle2, ChevronDown, Trash2 } from 'lucide-react';

interface PeriodManagementViewProps {
  periods: CampPeriod[];
  onAddPeriod: (p: CampPeriod) => void;
  onUpdatePeriods: (updated: CampPeriod[]) => void;
  onAddLog: (action: string, details: string) => void;
  campCenters: CampCenter[];
  selectedCampCenterId: string;
  participants: Participant[];
  staff: Staff[];
  isEmbedded?: boolean;
}

export default function PeriodManagementView({
  periods,
  onAddPeriod,
  onUpdatePeriods,
  onAddLog,
  campCenters,
  selectedCampCenterId,
  participants,
  staff,
  isEmbedded = false
}: PeriodManagementViewProps) {
  const activeCenter = campCenters.find((c) => c.id === selectedCampCenterId) || campCenters[0];
  const totalCapacity = activeCenter?.capacity || 78;
  const inCampCount = participants.filter((p) => p.status === 'Kampta').length;
  const [newPeriodName, setNewPeriodName] = useState('');
  const [newPeriodStart, setNewPeriodStart] = useState('2026-08-01');
  const [newPeriodEnd, setNewPeriodEnd] = useState('2026-08-08');
  const [newPeriodQuota, setNewPeriodQuota] = useState(78);
  const [newPeriodGender, setNewPeriodGender] = useState<'Kadın' | 'Erkek' | 'Karışık/Aile'>('Karışık/Aile');
  const [newPeriodMinAge, setNewPeriodMinAge] = useState(11);
  const [newPeriodMaxAge, setNewPeriodMaxAge] = useState(14);
  const [newPeriodLeaderId, setNewPeriodLeaderId] = useState('');
  const [newPeriodCriteria, setNewPeriodCriteria] = useState('');

  const [editingPeriod, setEditingPeriod] = useState<CampPeriod | null>(null);
  const [copiedPeriodId, setCopiedPeriodId] = useState<string | null>(null);
  const [selectedPeriodDetail, setSelectedPeriodDetail] = useState<CampPeriod | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const activePeriods = periods.filter((p) => p.isActive);

  const checkQuotaWarning = (p: CampPeriod) => {
    // window.confirm is disabled in iframe sandbox
    return true;
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodName) return;

    const newPeriod: CampPeriod = {
      id: `P${Date.now()}`,
      campCenterId: selectedCampCenterId,
      name: newPeriodName,
      startDate: newPeriodStart,
      endDate: newPeriodEnd,
      maxQuota: newPeriodQuota,
      gender: newPeriodGender,
      minAge: newPeriodMinAge,
      maxAge: newPeriodMaxAge,
      leaderId: newPeriodLeaderId,
      criteria: newPeriodCriteria,
      isActive: false,
      status: 'Planlandı',
    };

    if (!checkQuotaWarning(newPeriod)) {
      return;
    }

    onAddPeriod(newPeriod);
    onAddLog(
      'Yeni Dönem Planlandı',
      `"${newPeriodName}" isimli kamp dönemi planlandı (Kota: ${newPeriodQuota}).`
    );

    setNewPeriodName('');
    setNewPeriodCriteria('');
  };

  const handleUpdatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPeriod) return;

    if (!checkQuotaWarning(editingPeriod)) {
      return;
    }

    const updated = periods.map((p) => (p.id === editingPeriod.id ? editingPeriod : p));
    onUpdatePeriods(updated);
    onAddLog('Dönem Güncellendi', `"${editingPeriod.name}" isimli dönem ayarları güncellendi.`);
    setEditingPeriod(null);
  };

  const handleActivatePeriod = (pId: string) => {
    const periodToActivate = periods.find(p => p.id === pId);
    if (!periodToActivate) return;
    
    

    const updated = periods.map((p) => {
      if (p.id === pId) {
        return { ...p, isActive: true, status: 'Aktif' as const };
      }
      return p;
    });
    onUpdatePeriods(updated);
    onAddLog('Dönem Aktifleştirildi', `"${periodToActivate.name}" dönemi aktif hale getirildi.`);
  };

  const handleDeletePeriod = (pId: string) => {
    const periodToDelete = periods.find(p => p.id === pId);
    if (!periodToDelete) return;
    
    const updated = periods.filter(p => p.id !== pId);
    onUpdatePeriods(updated);
    onAddLog('Dönem Silindi', `"${periodToDelete.name}" dönemi silindi.`);
    setEditingPeriod(null);
    setIsConfirmingDelete(false);
  };

  const handleDeactivatePeriod = (pId: string) => {
    const periodToDeactivate = periods.find(p => p.id === pId);
    if (!periodToDeactivate) return;
    
    

    const updated = periods.map((p) => {
      if (p.id === pId) {
        return { ...p, isActive: false, status: 'Tamamlandı' as const };
      }
      return p;
    });
    onUpdatePeriods(updated);
    onAddLog('Dönem Tamamlandı', `"${periodToDeactivate.name}" dönemi tamamlandı olarak işaretlendi.`);
  };

  const handleCopyPeriodLink = (periodId: string) => {
    const regLink = `${window.location.origin}${window.location.pathname}?portal=basvuru&periodId=${periodId}`;
    navigator.clipboard.writeText(regLink).then(() => {
      setCopiedPeriodId(periodId);
      setTimeout(() => setCopiedPeriodId(null), 2000);
    }).catch(() => {
      const tempInput = document.createElement('input');
      tempInput.value = regLink;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopiedPeriodId(periodId);
      setTimeout(() => setCopiedPeriodId(null), 2000);
    });
    onAddLog('Başvuru Bağlantısı Kopyalandı', `Dönem ID ${periodId} için online başvuru bağlantısı kopyalandı.`);
  };

  return (
    <div id={isEmbedded ? "" : "period-management-view"} className={isEmbedded ? "space-y-6" : "flex-1 overflow-y-auto bg-gray-50/50 p-6 space-y-6"}>
      {!isEmbedded && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-700" />
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Kamp Planlama ve Dönem Yönetimi</h1>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Yeni kamp dönemleri oluşturun, aktif dönemleri yönetin ve başvuruları organize edin.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="border-b pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Tesis Durumu ve Aktif Dönemler
            </span>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">
              {activePeriods.length > 0 ? activePeriods.map(p => p.name).join(', ') : 'Aktif kamp dönemi bulunmamaktadır.'}
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-100">
            Tesis Doluluğu: {inCampCount}/{totalCapacity} Dolu
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Quick Add period panel */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-3.5 text-xs h-fit">
            <h5 className="font-bold text-gray-800 flex items-center gap-1">
              <Plus className="w-4 h-4 text-emerald-700" />
              Yeni Dönem Planla
            </h5>
            <form onSubmit={handleCreatePeriod} className="space-y-3 text-3xs">
              <div>
                <input
                  type="text"
                  placeholder="Başlık (Örn: 4. Dönem Kampı)"
                  value={newPeriodName}
                  onChange={(e) => setNewPeriodName(e.target.value)}
                  className="w-full p-2 border border-gray-200 bg-white rounded-lg focus:outline-emerald-600 font-semibold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-0.5 font-bold uppercase">Başlangıç</label>
                  <input
                    type="date"
                    value={newPeriodStart}
                    onChange={(e) => setNewPeriodStart(e.target.value)}
                    className="w-full p-1.5 border border-gray-200 bg-white rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5 font-bold uppercase">Bitiş</label>
                  <input
                    type="date"
                    value={newPeriodEnd}
                    onChange={(e) => setNewPeriodEnd(e.target.value)}
                    className="w-full p-1.5 border border-gray-200 bg-white rounded-lg"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-0.5 font-bold uppercase">Kota</label>
                  <input
                    type="number"
                    value={newPeriodQuota}
                    onChange={(e) => setNewPeriodQuota(Number(e.target.value))}
                    className="w-full p-1.5 border border-gray-200 bg-white rounded-lg"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5 font-bold uppercase">Cinsiyet</label>
                  <select
                    value={newPeriodGender}
                    onChange={(e) => setNewPeriodGender(e.target.value as 'Kadın' | 'Erkek' | 'Karışık/Aile')}
                    className="w-full p-1.5 border border-gray-200 bg-white rounded-lg"
                  >
                    <option value="Karışık/Aile">Karışık/Aile</option>
                    <option value="Kadın">Kadın</option>
                    <option value="Erkek">Erkek</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-0.5 font-bold uppercase">Min Yaş</label>
                  <input
                    type="number"
                    value={newPeriodMinAge}
                    onChange={(e) => setNewPeriodMinAge(Number(e.target.value))}
                    className="w-full p-1.5 border border-gray-200 bg-white rounded-lg"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5 font-bold uppercase">Max Yaş</label>
                  <input
                    type="number"
                    value={newPeriodMaxAge}
                    onChange={(e) => setNewPeriodMaxAge(Number(e.target.value))}
                    className="w-full p-1.5 border border-gray-200 bg-white rounded-lg"
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-0.5 font-bold uppercase">Kamp Lideri</label>
                <select
                  value={newPeriodLeaderId}
                  onChange={(e) => setNewPeriodLeaderId(e.target.value)}
                  className="w-full p-1.5 border border-gray-200 bg-white rounded-lg"
                >
                  <option value="">Lider Seçin</option>
                  {(staff || []).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-0.5 font-bold uppercase">Kriterler / Uyarı</label>
                <textarea
                  placeholder="Başvuru sayfasında gösterilecek uyarılar..."
                  value={newPeriodCriteria}
                  onChange={(e) => setNewPeriodCriteria(e.target.value)}
                  className="w-full p-2 border border-gray-200 bg-white rounded-lg h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-lg transition"
              >
                Planı Kaydet
              </button>
            </form>
          </div>

          <div className="xl:col-span-2 space-y-4">
            <div className="flex justify-between items-center gap-2 flex-wrap mb-2">
              <h4 className="text-2xs font-extrabold text-gray-400 tracking-wider uppercase">Dönem Listesi</h4>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Dönem ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 pb-2">
              {periods.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((per) => (
                <div
                  key={per.id}
                  onClick={() => setSelectedPeriodDetail(per)}
                  className={`border rounded-xl p-3 bg-white hover:shadow-md transition-shadow relative cursor-pointer ${
                    per.isActive ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200'
                  }`}
                >
                  {per.isActive && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-xl rounded-tr-xl flex items-center gap-1 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      AKTİF DÖNEM
                    </div>
                  )}
                  <h5 className="font-extrabold text-gray-900 text-sm mb-1 line-clamp-1 pr-16" title={per.name}>
                    {per.name}
                  </h5>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(per.startDate).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })} -
                      {new Date(per.endDate).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      {per.maxQuota}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                      {per.gender}
                    </span>
                    <span className="text-[10px] font-bold bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-100">
                      {per.minAge}-{per.maxAge} Yaş
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPeriodLink(per.id);
                        }}
                        title="Bu kamp için başvuru formu bağlantısını kopyala"
                        className={`py-1 px-2 text-3xs font-bold rounded border transition-all flex items-center gap-1 ${
                          copiedPeriodId === per.id
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 animate-pulse'
                            : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-150'
                        }`}
                      >
                        {copiedPeriodId === per.id ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Kopyalandı!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Link Al</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`${window.location.origin}${window.location.pathname}?portal=basvuru&periodId=${per.id}`, '_blank');
                        }}
                        title="Başvuru formunu yeni sekmede aç"
                        className="py-1 px-2 text-3xs font-bold rounded border transition-all flex items-center gap-1 bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-150"
                      >
                        <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Aç</span>
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPeriod(per);
                      }}
                      className="bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-300 text-3xs font-bold px-2 py-1 rounded transition"
                    >
                      Düzenle
                    </button>

                    {per.isActive ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeactivatePeriod(per.id);
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-3xs font-bold px-2 py-1 rounded transition"
                      >
                        Bitir
                      </button>
                    ) : per.status !== 'Tamamlandı' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivatePeriod(per.id);
                        }}
                        className="bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-300 text-3xs font-bold px-2 py-1 rounded transition"
                      >
                        Aktif Yap
                      </button>
                    ) : (
                      <span className="text-3xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                        Tamamlandı
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm space-y-3">
            <h5 className="font-bold text-gray-800 flex items-center gap-1 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              Lider Eşleştirme
            </h5>
            <div className="space-y-2">
              {[...(staff || [])]
                .filter(s => s.role === 'Grup Lideri' || s.role === 'Kamp Koordinatörü')
                .sort((a,b) => (b.performanceScore || 0) - (a.performanceScore || 0))
                .slice(0, 8)
                .map(leader => (
                  <div key={leader.id} className="p-2 bg-gray-50 rounded-lg text-2xs flex items-center justify-between">
                    <div>
                      <p className="font-bold">{leader.name}</p>
                      <p className="text-gray-500 truncate w-32" title={leader.competencies}>{leader.competencies || '-'}</p>
                    </div>
                    <span className="font-bold text-emerald-700">{'★'.repeat(leader.performanceScore || 0)}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Editing Modal */}
      {editingPeriod && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="p-5 border-b border-gray-150 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                Dönem Düzenle
              </h2>
              <button
                onClick={() => {
                  setEditingPeriod(null);
                  setIsConfirmingDelete(false);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                kapat
              </button>
            </div>
            <form onSubmit={handleUpdatePeriod} className="p-5 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Dönem Adı</label>
                <input
                  type="text"
                  value={editingPeriod.name}
                  onChange={(e) => setEditingPeriod({ ...editingPeriod, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Başlangıç</label>
                  <input
                    type="date"
                    value={editingPeriod.startDate}
                    onChange={(e) => setEditingPeriod({ ...editingPeriod, startDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bitiş</label>
                  <input
                    type="date"
                    value={editingPeriod.endDate}
                    onChange={(e) => setEditingPeriod({ ...editingPeriod, endDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kota</label>
                  <input
                    type="number"
                    value={editingPeriod.maxQuota}
                    onChange={(e) => setEditingPeriod({ ...editingPeriod, maxQuota: Number(e.target.value) })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cinsiyet</label>
                  <select
                    value={editingPeriod.gender || 'Karışık/Aile'}
                    onChange={(e) => setEditingPeriod({ ...editingPeriod, gender: e.target.value as any })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl"
                  >
                    <option value="Karışık/Aile">Karışık/Aile</option>
                    <option value="Kadın">Kadın</option>
                    <option value="Erkek">Erkek</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Min Yaş</label>
                  <input
                    type="number"
                    value={editingPeriod.minAge || 11}
                    onChange={(e) => setEditingPeriod({ ...editingPeriod, minAge: Number(e.target.value) })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Max Yaş</label>
                  <input
                    type="number"
                    value={editingPeriod.maxAge || 14}
                    onChange={(e) => setEditingPeriod({ ...editingPeriod, maxAge: Number(e.target.value) })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Kriterler / Başvuru Uyarıları</label>
                <textarea
                  value={editingPeriod.criteria || ''}
                  onChange={(e) => setEditingPeriod({ ...editingPeriod, criteria: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl h-20 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-600 mr-1">Emin misiniz?</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePeriod(editingPeriod.id)}
                      className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
                    >
                      Evet, Sil
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-3 py-1.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="px-4 py-2 text-red-600 font-bold hover:bg-red-50 rounded-xl transition flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Dönemi Sil
                  </button>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPeriod(null);
                      setIsConfirmingDelete(false);
                    }}
                    className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Period Details Modal */}
      {selectedPeriodDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedPeriodDetail(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Dönem Detayları</h3>
              <button onClick={() => setSelectedPeriodDetail(null)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Dönem Adı</h4>
                <p className="font-semibold text-gray-900 text-lg">{selectedPeriodDetail.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tarih</h4>
                  <p className="font-semibold text-gray-800 text-sm">
                    {new Date(selectedPeriodDetail.startDate).toLocaleDateString('tr-TR')} - {new Date(selectedPeriodDetail.endDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Durum</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${selectedPeriodDetail.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span className="font-semibold text-gray-800 text-sm">{selectedPeriodDetail.status}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-800 border-b pb-2">Katılım Şartları</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-3xs text-gray-500 font-bold uppercase">Cinsiyet</p>
                      <p className="text-sm font-bold text-gray-800">{selectedPeriodDetail.gender || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-3xs text-gray-500 font-bold uppercase">Yaş Aralığı</p>
                      <p className="text-sm font-bold text-gray-800">{selectedPeriodDetail.minAge} - {selectedPeriodDetail.maxAge} Yaş</p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                  <p className="text-3xs text-emerald-600 font-bold uppercase mb-1">Kontenjan</p>
                  <p className="text-sm font-bold text-emerald-900">{selectedPeriodDetail.maxQuota} Kişi</p>
                </div>

                {selectedPeriodDetail.criteria && (
                  <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                    <p className="text-3xs text-amber-600 font-bold uppercase mb-1">Özel Kriterler</p>
                    <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">{selectedPeriodDetail.criteria}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                <p className="text-xs text-gray-500 font-bold mb-1">Hızlı İşlemler</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      handleCopyPeriodLink(selectedPeriodDetail.id);
                    }}
                    className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    {copiedPeriodId === selectedPeriodDetail.id ? 'Kopyalandı!' : 'Bağlantıyı Kopyala'}
                  </button>
                  <button 
                    onClick={() => {
                      window.open(`${window.location.origin}${window.location.pathname}?portal=basvuru&periodId=${selectedPeriodDetail.id}`, '_blank');
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2 shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Formu Aç
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
