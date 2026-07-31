import React, { useState } from 'react';
import { Mail, MessageSquare, Plus, Edit2, Trash2, Save, FileText, CheckCircle2, ChevronRight, X } from 'lucide-react';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  variables: string[];
}

const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: 't1',
    name: 'Kayıt Onay Bildirimi',
    type: 'email',
    subject: 'Kampa Kaydınız Onaylandı!',
    content: 'Merhaba {{isim}},\n\nKampımıza kaydınız başarıyla onaylanmıştır. Sizi aramızda görmekten mutluluk duyuyoruz. Kamp tarihi yaklaştığında detaylı program sizinle paylaşılacaktır.\n\nSağlıcakla kalın,\nYeşilay Kamp Yönetimi',
    variables: ['{{isim}}', '{{kamp_adi}}', '{{baslangic_tarihi}}']
  },
  {
    id: 't2',
    name: 'Hatırlatma (Kampa 3 Gün Kala)',
    type: 'sms',
    content: 'Sayin {{isim}}, {{kamp_adi}} kampiniza sadece 3 gun kaldi! E-postaniza gonderilen hazirlik listesini gozden gecirmeyi unutmayin. Yesilay',
    variables: ['{{isim}}', '{{kamp_adi}}']
  },
  {
    id: 't3',
    name: 'Kamp Sonu Değerlendirme',
    type: 'email',
    subject: 'Kamp Deneyiminizi Değerlendirin',
    content: 'Değerli katılımcımız {{isim}},\n\n{{kamp_adi}} kampımızı tamamladınız. Deneyiminizi iyileştirmek için görüşleriniz bizim için çok önemli. Lütfen aşağıdaki bağlantıya tıklayarak anketimizi doldurunuz:\n\n{{anket_linki}}\n\nTeşekkür ederiz.',
    variables: ['{{isim}}', '{{kamp_adi}}', '{{anket_linki}}']
  }
];

export default function NotificationTemplatesView() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(DEFAULT_TEMPLATES);
  const [activeType, setActiveType] = useState<'all' | 'email' | 'sms'>('all');
  
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTemplates = activeType === 'all' 
    ? templates 
    : templates.filter(t => t.type === activeType);

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate({ ...template });
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingTemplate({
      id: `t${Date.now()}`,
      name: '',
      type: 'email',
      subject: '',
      content: '',
      variables: ['{{isim}}', '{{kamp_adi}}']
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu şablonu silmek istediğinize emin misiniz?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleSave = () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.content) {
      alert("Lütfen şablon adı ve içerik alanlarını doldurun.");
      return;
    }

    if (templates.find(t => t.id === editingTemplate.id)) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    } else {
      setTemplates([...templates, editingTemplate]);
    }
    
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-700 rounded-xl shadow-sm border border-indigo-100/50">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Bildirim Şablonları</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              E-posta ve SMS gönderimlerinde kullanılacak içerik şablonlarını yönetin.
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Şablon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex px-4 pt-4 gap-4">
            <button
              onClick={() => setActiveType('all')}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeType === 'all' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Tümü ({templates.length})
            </button>
            <button
              onClick={() => setActiveType('email')}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeType === 'email' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Mail className="w-4 h-4" /> E-posta ({templates.filter(t => t.type === 'email').length})
            </button>
            <button
              onClick={() => setActiveType('sms')}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeType === 'sms' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <MessageSquare className="w-4 h-4" /> SMS ({templates.filter(t => t.type === 'sms').length})
            </button>
          </div>
        </div>

        <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(template => (
            <div key={template.id} className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-colors bg-gray-50/50 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  template.type === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {template.type === 'email' ? <Mail className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                  {template.type.toUpperCase()}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(template)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(template.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="font-bold text-gray-900 text-lg mb-1">{template.name}</h3>
              {template.type === 'email' && template.subject && (
                <p className="text-xs text-gray-500 font-medium mb-3 line-clamp-1 border-b border-gray-200 pb-2">Konu: {template.subject}</p>
              )}
              
              <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4 flex-1">
                {template.content}
              </p>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 font-medium">
              Bu kategoride henüz bir şablon bulunmamaktadır.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/80">
              <h3 className="font-black text-gray-900 text-lg leading-tight flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                {templates.find(t => t.id === editingTemplate.id) ? 'Şablonu Düzenle' : 'Yeni Şablon'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row overflow-hidden flex-1">
              {/* Sol Taraf: Düzenleme */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5 border-r border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Şablon Adı</label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Örn: Kayıt Onay Bildirimi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Bildirim Türü</label>
                    <select
                      value={editingTemplate.type}
                      onChange={(e) => setEditingTemplate({...editingTemplate, type: e.target.value as 'email' | 'sms'})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="email">E-posta</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                </div>

                {editingTemplate.type === 'email' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">E-posta Konusu</label>
                    <input
                      type="text"
                      value={editingTemplate.subject || ''}
                      onChange={(e) => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="E-posta konu başlığı"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex justify-between items-center">
                    <span>İçerik</span>
                    {editingTemplate.type === 'sms' && (
                      <span className={`text-xs ${editingTemplate.content.length > 160 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {editingTemplate.content.length} karakter (1 SMS = 160 karakter)
                      </span>
                    )}
                  </label>
                  <textarea
                    value={editingTemplate.content}
                    onChange={(e) => setEditingTemplate({...editingTemplate, content: e.target.value})}
                    rows={12}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
                    placeholder="Mesaj içeriğini buraya yazın..."
                  />
                </div>
                
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-800 mb-2">Kullanılabilir Değişkenler</p>
                  <div className="flex flex-wrap gap-2">
                    {['{{isim}}', '{{kamp_adi}}', '{{baslangic_tarihi}}', '{{bitis_tarihi}}', '{{anket_linki}}'].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          const newContent = editingTemplate.content + v;
                          setEditingTemplate({...editingTemplate, content: newContent});
                        }}
                        className="px-2 py-1 bg-white border border-indigo-200 text-indigo-700 text-xs font-bold rounded-md hover:bg-indigo-100 transition-colors"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-indigo-500 mt-2">Değişkeni eklemek için üzerine tıklayın.</p>
                </div>
              </div>

              {/* Sağ Taraf: Ön İzleme */}
              <div className="w-full md:w-2/5 bg-gray-50 p-6 overflow-y-auto flex flex-col">
                <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Canlı Ön İzleme
                </h4>
                
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  {editingTemplate.type === 'email' ? (
                    <div className="flex flex-col h-full">
                      <div className="border-b border-gray-100 p-4 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-gray-500 w-12">Kimden:</span>
                          <span className="text-sm font-medium text-gray-900">Yeşilay Kamp Yönetimi &lt;noreply@yesilay.org.tr&gt;</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500 w-12">Konu:</span>
                          <span className="text-sm font-bold text-gray-900">{editingTemplate.subject || 'Konu Yok'}</span>
                        </div>
                      </div>
                      <div className="p-5 flex-1 bg-white overflow-y-auto">
                        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
                          {editingTemplate.content.replace(/{{isim}}/g, 'Ahmet Yılmaz')
                            .replace(/{{kamp_adi}}/g, 'Yaz Gençlik Kampı')
                            .replace(/{{baslangic_tarihi}}/g, '15 Ağustos 2026')
                            .replace(/{{bitis_tarihi}}/g, '20 Ağustos 2026')
                            .replace(/{{anket_linki}}/g, 'https://kamp.yesilay.org.tr/anket/123')
                            || <span className="text-gray-400 italic">Mesaj içeriği burada görünecektir...</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-100 h-full flex flex-col items-center justify-center">
                      <div className="w-[280px] bg-white rounded-3xl shadow-md overflow-hidden border-[6px] border-gray-800">
                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">Yeşilay</p>
                            <p className="text-[10px] text-gray-500">iMessage</p>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 min-h-[300px]">
                          <div className="bg-emerald-500 text-white rounded-2xl rounded-tl-sm p-3 text-sm whitespace-pre-wrap shadow-sm">
                            {editingTemplate.content.replace(/{{isim}}/g, 'Ahmet Yılmaz')
                              .replace(/{{kamp_adi}}/g, 'Yaz Gençlik Kampı')
                              .replace(/{{baslangic_tarihi}}/g, '15 Ağustos 2026')
                              .replace(/{{bitis_tarihi}}/g, '20 Ağustos 2026')
                              .replace(/{{anket_linki}}/g, 'https://kamp.yesilay.org.tr/anket/123')
                              || 'Mesajınız...'}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-2 text-right">Bugün 14:30</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
