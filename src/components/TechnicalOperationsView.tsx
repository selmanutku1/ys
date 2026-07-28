import React, { useState } from 'react';
import { 
  Wrench, ClipboardList, TrendingUp, Sparkles, FileText, 
  MapPin, CheckCircle, Clock, AlertTriangle, AlertCircle, Phone, Smartphone, ImagePlus, History, FileImage, History as HistoryIcon 
} from 'lucide-react';
import { Task, ShiftAssignment, TechnicalIssue, SupplyRequest } from '../types';
import VoiceNoteButton from './VoiceNoteButton';

interface TechnicalOperationsViewProps {
  selectedCenterId: string;
  tasks: Task[];
  shifts: ShiftAssignment[];
  onUpdateTasks: (tasks: Task[]) => void;
  onUpdateShifts: (shifts: ShiftAssignment[]) => void;
  onAddLog: (action: string, details: string) => void;
  activeSubView?: 'dashboard' | 'issues' | 'requests' | 'ai-copilot' | 'reports' | 'areas' | 'vardiya';
  onChangeSubView?: (view: 'dashboard' | 'issues' | 'requests' | 'ai-copilot' | 'reports' | 'areas' | 'vardiya') => void;
}

export default function TechnicalOperationsView({
  selectedCenterId,
  tasks,
  shifts,
  onUpdateTasks,
  onUpdateShifts,
  onAddLog,
  activeSubView = 'dashboard',
  onChangeSubView
}: TechnicalOperationsViewProps) {
  const [activeTab, setActiveTab] = useState(activeSubView);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Orta' | 'Yüksek' | 'Kritik'>('Orta');
  const [newTaskDepartment, setNewTaskDepartment] = useState('Teknik');
  const [newTaskImage, setNewTaskImage] = useState('');
  const [expandedTaskHistoryId, setExpandedTaskHistoryId] = useState<string | null>(null);

  // Sync prop to state if it changes externally
  React.useEffect(() => {
    if (activeSubView) {
      setActiveTab(activeSubView);
    }
  }, [activeSubView]);

  const handleTabChange = (tab: typeof activeSubView) => {
    setActiveTab(tab);
    if (onChangeSubView) onChangeSubView(tab);
  };

  const techTasks = tasks.filter(t => t.department === 'Teknik');
  const pendingTasks = techTasks.filter(t => t.status !== 'Tamamlandı');
  const completedTasks = techTasks.filter(t => t.status === 'Tamamlandı');

  const handleUpdateStatus = (taskId: string, newStatus: 'Bekliyor' | 'Devam Ediyor' | 'Tamamlandı') => {
    const task = tasks.find(t => t.id === taskId);
    if (newStatus === 'Tamamlandı' && !task?.imageUrl) {
        alert('Tamamlama işlemi için görsel yüklenmesi zorunludur.');
        return;
    }
    onUpdateTasks(tasks.map(t => {
      if (t.id === taskId) {
        const h = t.history || [];
        return { 
          ...t, 
          status: newStatus,
          history: [...h, { date: new Date().toISOString(), user: 'Kullanıcı', action: `Durum güncellendi: ${newStatus}` }]
        };
      }
      return t;
    }));
    onAddLog('Teknik Görev', taskId + ' numaralı görev ' + newStatus + ' olarak işaretlendi.');
  };
  
  const handleDeleteTask = (taskId: string) => {
    if(confirm('Bu görevi silmek istediğinize emin misiniz?')) {
       onUpdateTasks(tasks.filter(t => t.id !== taskId));
       onAddLog('Teknik Görev', taskId + ' numaralı görev silindi.');
    }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskDesc.trim()) return;
    const newTask = {
      id: 'TSK-' + Math.floor(Math.random() * 10000),
      title: newTaskTitle,
      description: newTaskDesc,
      status: 'Bekliyor',
      priority: newTaskPriority,
      department: newTaskDepartment,
      assignedTo: 'Atanmadı',
      dueDate: new Date().toISOString().split('T')[0],
      imageUrl: newTaskImage || undefined,
      history: [{ date: new Date().toISOString(), user: 'Oluşturan', action: 'Kayıt Açıldı' }]
    };
    onUpdateTasks([...tasks, newTask as Task]);
    onAddLog('Yeni Görev', newTaskTitle + ' görevi oluşturuldu.');
    setShowAddForm(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskImage('');
    setNewTaskPriority('Orta');
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aktif Teknik Görevler</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{pendingTasks.length}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tamamlanan</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{completedTasks.length}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kritik Arızalar</p>
            <p className="text-3xl font-black text-rose-600 mt-1">
              {pendingTasks.filter(t => t.priority === 'Kritik').length}
            </p>
          </div>
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-extrabold text-gray-800 text-sm">Son Teknik Görevler</h3>
          <button onClick={() => handleTabChange('issues')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
            Tümünü Gör
          </button>
        </div>
        <div className="divide-y divide-gray-100">
        {showAddForm && (
          <div className="p-5 bg-gray-50 border-b border-gray-100 space-y-4">
            <h4 className="font-bold text-sm text-gray-800">Yeni Arıza / Görev Bildir</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Başlık</label>
                <input 
                  type="text" 
                  value={newTaskTitle} 
                  onChange={e => setNewTaskTitle(e.target.value)} 
                  placeholder="Örn: Elektrik Kesintisi" 
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Öncelik</label>
                <select 
                  value={newTaskPriority} 
                  onChange={e => setNewTaskPriority(e.target.value as any)} 
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  <option value="Orta">Normal</option>
                  <option value="Yüksek">Acil</option>
                  <option value="Kritik">Kritik</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-600">Açıklama / Detay</label>
                  <VoiceNoteButton onTranscript={(t) => setNewTaskDesc(prev => prev ? prev + ' ' + t : t)} />
                </div>
                <textarea 
                  value={newTaskDesc} 
                  onChange={e => setNewTaskDesc(e.target.value)} 
                  placeholder="Arıza detayı ve nerede olduğu..." 
                  className="w-full p-2 border rounded-lg text-sm h-20"
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Arıza Görseli (İsteğe Bağlı)</label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                     <input 
                       type="file" 
                       accept="image/*"
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       onChange={(e) => {
                         if(e.target.files && e.target.files[0]) {
                           const reader = new FileReader();
                           reader.onload = (event) => {
                             setNewTaskImage(event.target?.result as string);
                           };
                           reader.readAsDataURL(e.target.files[0]);
                         }
                       }}
                     />
                     <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition pointer-events-none">
                       <ImagePlus className="w-4 h-4" /> Görsel Yükle
                     </button>
                  </div>
                  {newTaskImage && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                      <img src={newTaskImage} alt="Önizleme" className="w-full h-full object-cover" />
                      <button onClick={() => setNewTaskImage('')} className="absolute top-0 right-0 bg-white/80 p-0.5 rounded-bl hover:bg-rose-100 text-rose-600 transition">✕</button>
                    </div>
                  )}
                </div>
              </div>

            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim() || !newTaskDesc.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm py-2 px-6 rounded-lg transition"
              >
                Kaydet
              </button>
            </div>
          </div>
        )}
          {techTasks.slice(0, 5).map(task => (
            <div key={task.id} className="p-4 hover:bg-gray-50 flex justify-between items-center transition">
              <div>
                <p className="font-bold text-gray-900 text-sm">{task.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  task.status === 'Tamamlandı' ? 'bg-emerald-50 text-emerald-700' :
                  task.status === 'Devam Ediyor' ? 'bg-amber-50 text-amber-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {task.status}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleUpdateStatus(task.id, 'Devam Ediyor')} className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">Müdahale Et</button>
                  <button onClick={() => handleUpdateStatus(task.id, 'Tamamlandı')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">Tamamla</button>
                  <button onClick={() => handleDeleteTask(task.id)} className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer">Sil</button>
                </div>
              </div>
            </div>
          ))}
          {techTasks.length === 0 && (
            <div className="p-8 text-center text-gray-400 font-medium text-sm">
              Görüntülenecek teknik görev bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );

    const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestType, setNewRequestType] = useState('Malzeme');
  const [newRequestPriority, setNewRequestPriority] = useState('Orta');
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleAddRequest = () => {
    if (!newRequestTitle.trim()) return;
    const newTask = {
      id: 'REQ-' + Math.floor(Math.random() * 10000),
      title: newRequestTitle,
      description: newRequestType + ' Talebi',
      status: 'Bekliyor',
      priority: newRequestPriority,
      department: 'Diğer',
      assignedTo: 'Atanmadı',
      dueDate: new Date().toISOString().split('T')[0]
    };
    onUpdateTasks([...tasks, newTask as any]);
    onAddLog('Yeni Talep', newRequestTitle + ' talebi oluşturuldu.');
    setShowRequestForm(false);
    setNewRequestTitle('');
  };

  const renderRequests = () => {
    const requestTasks = tasks.filter(t => t.department === 'Diğer' || t.id.startsWith('REQ-'));
    return (
      <div className="bg-white border border-gray-150 rounded-2xl shadow-xs overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-extrabold text-gray-800 text-sm">Malzeme ve Satın Alma Talepleri</h3>
            <p className="text-xs text-gray-500 mt-0.5">Tesis ihtiyaçları ve sarf malzeme istekleri.</p>
          </div>
          <button 
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-3 rounded-lg transition cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>{showRequestForm ? 'Vazgeç' : 'Yeni Talep Oluştur'}</span>
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {showRequestForm && (
            <div className="p-5 bg-gray-50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Talep İçeriği / Malzeme</label>
                  <input 
                    type="text" 
                    value={newRequestTitle} 
                    onChange={e => setNewRequestTitle(e.target.value)} 
                    placeholder="Örn: 5 Kutu A4 Kağıt" 
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Kategori</label>
                  <select 
                    value={newRequestType} 
                    onChange={e => setNewRequestType(e.target.value)} 
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    <option value="Malzeme">Sarf Malzeme</option>
                    <option value="Hizmet">Hizmet / Bakım</option>
                    <option value="Demirbaş">Demirbaş</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Öncelik</label>
                  <select 
                    value={newRequestPriority} 
                    onChange={e => setNewRequestPriority(e.target.value)} 
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    <option value="Orta">Normal</option>
                    <option value="Yüksek">Acil</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleAddRequest}
                  disabled={!newRequestTitle.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm py-2 px-6 rounded-lg transition"
                >
                  Talebi İlet
                </button>
              </div>
            </div>
          )}
          {requestTasks.length > 0 ? requestTasks.map(task => (
            <div key={task.id} className="p-5 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <ClipboardList className={`w-5 h-5 ${task.priority === 'Yüksek' ? 'text-rose-500' : 'text-blue-500'}`} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{task.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-2xs font-bold text-gray-400">Öncelik: <span className={task.priority === 'Yüksek' ? 'text-rose-600' : ''}>{task.priority}</span></span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                 <span className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-600`}>
                  {task.status}
                </span>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => handleUpdateStatus(task.id, 'Devam Ediyor')} className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">Onayla</button>
                  <button onClick={() => handleUpdateStatus(task.id, 'Tamamlandı')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">Teslim Edildi</button>
                  <button onClick={() => handleDeleteTask(task.id)} className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer">İptal</button>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="font-medium">Bekleyen talep bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderIssues = () => (
    <div className="bg-white border border-gray-150 rounded-2xl shadow-xs overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="font-extrabold text-gray-800 text-sm">Arıza ve Bakım Defteri</h3>
          <p className="text-xs text-gray-500 mt-0.5">Saha personeli tarafından girilen aktif arıza kayıtları.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-3 rounded-lg transition cursor-pointer"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Vazgeç' : 'Yeni Arıza Bildir'}</span>
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {showAddForm && (
          <div className="p-5 bg-gray-50 border-b border-gray-100 space-y-4">
            <h4 className="font-bold text-sm text-gray-800">Yeni Arıza / Görev Bildir</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Başlık</label>
                <input 
                  type="text" 
                  value={newTaskTitle} 
                  onChange={e => setNewTaskTitle(e.target.value)} 
                  placeholder="Örn: Elektrik Kesintisi" 
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Öncelik</label>
                <select 
                  value={newTaskPriority} 
                  onChange={e => setNewTaskPriority(e.target.value as any)} 
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  <option value="Orta">Normal</option>
                  <option value="Yüksek">Acil</option>
                  <option value="Kritik">Kritik</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-600">Açıklama / Detay</label>
                  <VoiceNoteButton onTranscript={(t) => setNewTaskDesc(prev => prev ? prev + ' ' + t : t)} />
                </div>
                <textarea 
                  value={newTaskDesc} 
                  onChange={e => setNewTaskDesc(e.target.value)} 
                  placeholder="Arıza detayı ve nerede olduğu..." 
                  className="w-full p-2 border rounded-lg text-sm h-20"
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Arıza Görseli (İsteğe Bağlı)</label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                     <input 
                       type="file" 
                       accept="image/*"
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       onChange={(e) => {
                         if(e.target.files && e.target.files[0]) {
                           const reader = new FileReader();
                           reader.onload = (event) => {
                             setNewTaskImage(event.target?.result as string);
                           };
                           reader.readAsDataURL(e.target.files[0]);
                         }
                       }}
                     />
                     <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition pointer-events-none">
                       <ImagePlus className="w-4 h-4" /> Görsel Yükle
                     </button>
                  </div>
                  {newTaskImage && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                      <img src={newTaskImage} alt="Önizleme" className="w-full h-full object-cover" />
                      <button onClick={() => setNewTaskImage('')} className="absolute top-0 right-0 bg-white/80 p-0.5 rounded-bl hover:bg-rose-100 text-rose-600 transition">✕</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim() || !newTaskDesc.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm py-2 px-6 rounded-lg transition"
              >
                Kaydet
              </button>
            </div>
          </div>
        )}
        {pendingTasks.length > 0 ? pendingTasks.map(task => (
          <React.Fragment key={task.id}>
          <div className="p-5 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <AlertTriangle className={`w-5 h-5 ${task.priority === 'Kritik' ? 'text-rose-500' : 'text-amber-500'}`} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{task.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-2xs font-bold text-gray-400">Öncelik: <span className={task.priority === 'Kritik' ? 'text-rose-600' : ''}>{task.priority}</span></span>
                  <span className="text-2xs font-bold text-gray-400">Bölge: {task.department}</span>
                </div>
              </div>
            </div>
            {task.imageUrl && (
              <div className="shrink-0 cursor-pointer hover:opacity-80 transition" onClick={() => window.open(task.imageUrl, '_blank')}>
                <img src={task.imageUrl} alt="Arıza Görseli" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
              </div>
            )}
            <div className="flex flex-col sm:items-end gap-2 shrink-0">
               <span className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700`}>
                {task.status}
              </span>
                            <div className="flex items-center gap-2">
                <button onClick={() => setExpandedTaskHistoryId(expandedTaskHistoryId === task.id ? null : task.id)} className="text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer flex items-center gap-1"><HistoryIcon className="w-3 h-3" /> Geçmiş</button>
                <button onClick={() => handleUpdateStatus(task.id, 'Devam Ediyor')} className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">Müdahale Et</button>
                <button onClick={() => handleUpdateStatus(task.id, 'Tamamlandı')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">Tamamla</button>
                <button onClick={() => handleDeleteTask(task.id)} className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer">Sil</button>
              </div>
            </div>
          </div>
          {expandedTaskHistoryId === task.id && task.history && task.history.length > 0 && (
            <div className="px-5 pb-5 bg-gray-50/30 text-xs">
              <h5 className="font-bold text-gray-700 mb-2 border-b border-gray-100 pb-1">İşlem Geçmişi</h5>
              <div className="space-y-2">
                {task.history.map((h, i) => (
                  <div key={i} className="flex gap-2 text-gray-600">
                    <span className="text-gray-400 w-24 shrink-0">{new Date(h.date).toLocaleDateString('tr-TR')} {new Date(h.date).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}</span>
                    <span className="font-medium text-gray-800">{h.user}:</span>
                    <span>{h.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </React.Fragment>
        )) : (
          <div className="p-12 text-center text-gray-400">
            <Wrench className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium">Bekleyen teknik arıza bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, desc: string, Icon: any) => (
    <div className="bg-white border border-gray-150 rounded-2xl shadow-xs overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-2">
          <Icon className="w-4 h-4 text-emerald-600" />
          {title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <div className="p-12 text-center text-gray-400">
        <p className="font-medium text-sm">Bu modül daha sade ve net bir deneyim için yenilenmektedir.</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Kontrol Paneli', icon: TrendingUp },
    { id: 'issues', label: 'Arıza Defteri', icon: Wrench },
    { id: 'requests', label: 'Talepler', icon: ClipboardList },
    { id: 'ai-copilot', label: 'AI Copilot', icon: Sparkles },
    { id: 'reports', label: 'Raporlar', icon: FileText },
  ] as const;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Tabs */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm overflow-x-auto hide-scrollbar">
        <div className="flex space-x-1 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-100/50' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="transition-all duration-300">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'issues' && renderIssues()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'ai-copilot' && renderPlaceholder('Yapay Zeka Teknik Copilot', 'Geçmiş arıza verilerini işleyerek kronik sorunları tespit eden asistan.', Sparkles)}
        {activeTab === 'reports' && renderPlaceholder('Teknik Raporlar', 'SLA özetleri ve departman performans karnesi.', FileText)}
        {activeTab === 'vardiya' && renderPlaceholder('Vardiya Yönetimi', 'Teknik personel vardiya çizelgesi.', Clock)}
      </div>
    </div>
  );
}
