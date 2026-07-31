import React, { useState } from 'react';
import { Archive, Upload, Filter, FileText, Image as ImageIcon, FileSpreadsheet, Search, Download, Trash2, FolderOpen, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface ArchiveFile {
  id: string;
  name: string;
  category: 'mali' | 'teknik' | 'saglik' | 'resmi-evrak' | 'fotograf' | 'diger';
  type: 'pdf' | 'image' | 'doc' | 'xls';
  uploadDate: string;
  uploadedBy: string;
  size: string;
  period: string;
}

const MOCK_FILES: ArchiveFile[] = [
  { id: '1', name: '2023_Yaz_Kampi_Maliyet_Raporu.pdf', category: 'mali', type: 'pdf', uploadDate: '2023-08-15', uploadedBy: 'Selman UTKU', size: '2.4 MB', period: '2023 Yaz Dönemi' },
  { id: '2', name: 'Riva_Tesis_Bakim_Sozlesmesi.pdf', category: 'teknik', type: 'pdf', uploadDate: '2023-05-10', uploadedBy: 'Mehmet Teknik', size: '1.1 MB', period: 'Genel' },
  { id: '3', name: 'Kamp_Katilimcilari_Saglik_Beyanlari.pdf', category: 'saglik', type: 'pdf', uploadDate: '2023-07-02', uploadedBy: 'Hemşire Elif', size: '5.6 MB', period: '2023 Yaz Dönemi' },
  { id: '4', name: 'Valilik_Kamp_Izin_Yazisi.pdf', category: 'resmi-evrak', type: 'pdf', uploadDate: '2023-06-01', uploadedBy: 'İnan BAYRAMOĞLU', size: '850 KB', period: '2023 Yaz Dönemi' },
  { id: '5', name: 'Kamp_Atesi_Etkinligi.jpg', category: 'fotograf', type: 'image', uploadDate: '2023-07-15', uploadedBy: 'Selman UTKU', size: '4.2 MB', period: '2023 Yaz Dönemi' },
  { id: '6', name: 'Erzak_Alim_Faturalari.xls', category: 'mali', type: 'xls', uploadDate: '2023-07-20', uploadedBy: 'Adem Usta', size: '1.8 MB', period: '2023 Yaz Dönemi' },
];

export default function DijitalArsivView({ onAddLog }: { onAddLog: (action: string, details: string) => void }) {
  const [files, setFiles] = useState<ArchiveFile[]>(MOCK_FILES);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<ArchiveFile['category']>('diger');
  const [uploadPeriod, setUploadPeriod] = useState('Genel');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deletedFile, setDeletedFile] = useState<{file: ArchiveFile, index: number} | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'undo'} | null>(null);
  const [undoTimeoutId, setUndoTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToConfirmDelete, setFileToConfirmDelete] = useState<{id: string, fileName: string} | null>(null);
  
  const showNotification = (message: string, type: 'success' | 'info' | 'undo' = 'info') => {
    setNotification({ message, type });
    if (type !== 'undo') {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showNotification('Lütfen bir dosya seçin.', 'info');
      return;
    }
    
    let type: ArchiveFile['type'] = 'diger' as any;
    const nameLower = selectedFile.name.toLowerCase();
    if (nameLower.endsWith('.pdf')) type = 'pdf';
    else if (nameLower.endsWith('.jpg') || nameLower.endsWith('.png') || nameLower.endsWith('.jpeg')) type = 'image';
    else if (nameLower.endsWith('.xls') || nameLower.endsWith('.xlsx')) type = 'xls';
    else if (nameLower.endsWith('.doc') || nameLower.endsWith('.docx')) type = 'doc';

    const newFile: ArchiveFile = {
      id: Date.now().toString(),
      name: selectedFile.name,
      category: uploadCategory,
      type: type,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Mevcut Kullanıcı',
      size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
      period: uploadPeriod
    };
    setFiles([newFile, ...files]);
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    showNotification('Dosya başarıyla yüklendi', 'success');
    onAddLog('Dosya Arşivelendi', `"${newFile.name}" dosyası '${getCategoryName(newFile.category)}' kategorisinde arşive yüklendi.`);
  };

  const handleDownload = (fileName: string) => {
    // Gerçek bir dosya indirme simülasyonu
    const content = `Bu ${fileName} dosyasının içeriğidir.\nİndirilen Dosya: ${fileName}\nTarih: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(`${fileName} başarıyla indirildi.`, 'success');
    onAddLog('Arşivden İndirme', `"${fileName}" dosyası arşivden indirildi.`);
  };

  const handleDeleteClick = (id: string, fileName: string) => {
    setFileToConfirmDelete({ id, fileName });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (fileToConfirmDelete) {
      const fileIndex = files.findIndex(f => f.id === fileToConfirmDelete.id);
      if (fileIndex > -1) {
        const fileToDelete = files[fileIndex];
        const newFiles = [...files];
        newFiles.splice(fileIndex, 1);
        setFiles(newFiles);
        setDeletedFile({ file: fileToDelete, index: fileIndex });
        
        showNotification(`${fileToConfirmDelete.fileName} silindi.`, 'undo');
        onAddLog('Arşivden Silme', `"${fileToConfirmDelete.fileName}" dosyası sistem arşivinden silindi.`);
        
        if (undoTimeoutId) clearTimeout(undoTimeoutId);
        const timeoutId = setTimeout(() => {
          setNotification(null);
          setDeletedFile(null);
        }, 5000);
        setUndoTimeoutId(timeoutId);
      }
      setIsDeleteModalOpen(false);
      setFileToConfirmDelete(null);
    }
  };

  const handleUndoDelete = () => {
    if (deletedFile) {
      const newFiles = [...files];
      newFiles.splice(deletedFile.index, 0, deletedFile.file);
      setFiles(newFiles);
      const restoredFileName = deletedFile.file.name;
      setDeletedFile(null);
      if (undoTimeoutId) clearTimeout(undoTimeoutId);
      showNotification('Dosya geri yüklendi.', 'success');
      onAddLog('Arşiv Silme Geri Alındı', `Silinen "${restoredFileName}" dosyası başarıyla geri yüklendi.`);
    }
  };

  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'mali', name: 'Mali' },
    { id: 'teknik', name: 'Teknik' },
    { id: 'saglik', name: 'Sağlık' },
    { id: 'resmi-evrak', name: 'Resmi Evrak' },
    { id: 'fotograf', name: 'Fotoğraflar' }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-rose-500" />;
      case 'image': return <ImageIcon className="w-8 h-8 text-emerald-500" />;
      case 'xls': return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
      case 'doc': return <FileText className="w-8 h-8 text-blue-500" />;
      default: return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'mali': return 'bg-amber-100 text-amber-800';
      case 'teknik': return 'bg-orange-100 text-orange-800';
      case 'saglik': return 'bg-rose-100 text-rose-800';
      case 'resmi-evrak': return 'bg-blue-100 text-blue-800';
      case 'fotograf': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getCategoryName = (category: string) => {
    return categories.find(c => c.id === category)?.name || 'Diğer';
  };

  const filteredFiles = files.filter(f => {
    const matchCategory = filterCategory === 'all' || f.category === filterCategory;
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        f.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 relative">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 font-bold text-sm ${notification.type === 'success' ? 'bg-emerald-600 text-white' : notification.type === 'undo' ? 'bg-gray-800 text-white' : 'bg-emerald-600 text-white'}`}>
          <CheckCircle className="w-4 h-4" />
          <span>{notification.message}</span>
          {notification.type === 'undo' && (
            <button 
              onClick={handleUndoDelete}
              className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md text-white text-xs font-bold transition cursor-pointer"
            >
              Geri Al
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
            <Archive className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Dijital Arşiv</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">Tüm resmi belgeler, fotoğraflar ve teknik dökümanlar.</p>
          </div>
        </div>
        <button 
          onClick={handleOpenUploadModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-xs cursor-pointer w-full md:w-auto justify-center"
        >
          <Upload className="w-5 h-5" />
          Yeni Dosya Yükle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterCategory === cat.id 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Dosya adı veya yükleyen..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <div key={file.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  {getFileIcon(file.type)}
                </div>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-md ${getCategoryBadge(file.category)}`}>
                  {getCategoryName(file.category)}
                </span>
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 break-all" title={file.name}>
                  {file.name}
                </h3>
                <div className="mt-2 space-y-1">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    <span className="font-semibold">Dönem:</span> {file.period}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    <span className="font-semibold">Yükleyen:</span> {file.uploadedBy}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400">{file.size} • {file.uploadDate}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownload(file.name)}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer" title="İndir"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(file.id, file.name)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer" title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Dosya Bulunamadı</h3>
            <p className="text-sm text-gray-500">Seçili kriterlere uygun evrak veya dosya arşivde mevcut değil.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                Yeni Dosya Yükle
              </h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                <select 
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-2.5 text-sm"
                  required
                >
                  <option value="resmi-evrak">Resmi Evrak</option>
                  <option value="mali">Mali Analiz ve Fatura</option>
                  <option value="teknik">Teknik Döküm</option>
                  <option value="saglik">Sağlık Raporu</option>
                  <option value="fotograf">Fotoğraf ve Medya</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Dönem Bilgisi</label>
                <select 
                  value={uploadPeriod}
                  onChange={(e) => setUploadPeriod(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-2.5 text-sm"
                  required
                >
                  <option value="Genel">Genel (Dönemden Bağımsız)</option>
                  <option value="2023 Yaz Dönemi">2023 Yaz Dönemi</option>
                  <option value="2023 Kış Dönemi">2023 Kış Dönemi</option>
                  <option value="2024 İlkbahar Dönemi">2024 İlkbahar Dönemi</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Dosya Seç</label>
                <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
                  <input type="file" className="hidden" onChange={handleFileChange} required />
                  {selectedFile ? (
                    <>
                      <FileText className="w-8 h-8 text-indigo-500 mb-2" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-center px-4 truncate w-full">{selectedFile.name}</span>
                      <span className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Tıklayın veya Sürükleyin</span>
                      <span className="text-xs text-gray-400 mt-1">PDF, Excel, JPG, PNG (Max: 10MB)</span>
                    </>
                  )}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition cursor-pointer"
                >
                  Dosyayı Yükle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Dosyayı Sil</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-300">"{fileToConfirmDelete?.fileName}"</span><br/>
                isimli dosyayı silmek istediğinize emin misiniz? Bu işlem geri alınabilir.
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition cursor-pointer flex-1"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition cursor-pointer flex-1"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

