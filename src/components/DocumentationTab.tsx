/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  Terminal, 
  ShieldCheck, 
  GitMerge, 
  Users, 
  SquarePlay, 
  FileText,
  Lock,
  Network,
  UtensilsCrossed
} from 'lucide-react';

export default function DocumentationTab() {
  const [subTab, setSubTab] = useState<'analiz' | 'veritabani_api' | 'matris_senaryo' | 'mimari_kvkk' | 'menu_standartlari'>('analiz');

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" id="yesilay-documentation-container">
      {/* Tab Header */}
      <div className="bg-emerald-800 text-white p-6 border-b border-emerald-900">
        <h2 className="text-2xl font-bold font-sans flex items-center gap-2">
          <BookOpen className="w-7 h-7" />
          KYS Sistem Tasarım ve Analiz Dokümantasyonu
        </h2>
        <p className="text-emerald-100/90 text-sm mt-1">
          Türkiye geneli Yeşilay Kamp Merkezleri (KYS) için hazırlanan kurumsal düzeyde mimari, güvenlik, entegrasyon ve yazılım analiz dokümanı.
        </p>

        {/* Sub-tabs Selectors */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setSubTab('analiz')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              subTab === 'analiz' ? 'bg-white text-emerald-900 shadow-sm' : 'bg-emerald-700/50 text-white hover:bg-emerald-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            1. Detaylı Modül Analizi
          </button>
          <button
            onClick={() => setSubTab('matris_senaryo')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              subTab === 'matris_senaryo' ? 'bg-white text-emerald-900 shadow-sm' : 'bg-emerald-700/50 text-white hover:bg-emerald-700'
            }`}
          >
            <Users className="w-4 h-4" />
            2. Yetki Matrisi & Senaryolar
          </button>
          <button
            onClick={() => setSubTab('veritabani_api')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              subTab === 'veritabani_api' ? 'bg-white text-emerald-900 shadow-sm' : 'bg-emerald-700/50 text-white hover:bg-emerald-700'
            }`}
          >
            <Database className="w-4 h-4" />
            3. Veritabanı ve API Tasarımı
          </button>
          <button
            onClick={() => setSubTab('mimari_kvkk')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              subTab === 'mimari_kvkk' ? 'bg-white text-emerald-900 shadow-sm' : 'bg-emerald-700/50 text-white hover:bg-emerald-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            4. Güvenlik, SaaS & KVKK
          </button>
          <button
            onClick={() => setSubTab('menu_standartlari')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              subTab === 'menu_standartlari' ? 'bg-white text-emerald-900 shadow-sm' : 'bg-emerald-700/50 text-white hover:bg-emerald-700'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            5. Menü Standartları
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* SUBTAB 1: DETAYLI MODUL ANALIZI */}
        {subTab === 'analiz' && (
          <div className="space-y-8 animate-fade-in text-gray-700 leading-relaxed font-sans">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <span className="w-2 h-6 bg-emerald-600 rounded-full inline-block"></span>
                Kamp Yönetim Sistemi (KYS) Ana Modül Analizleri
              </h3>
              <p className="text-gray-600 mb-4">
                Yeşilay Kamp Yönetim Sistemi (KYS), bağımlılıklarla mücadele kurgusuyla tasarlanan Yeşilay kamplarının operasyonel verimliliğini sıfır hata prensibiyle yürütmek için optimize edilmiştir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <span className="text-emerald-700 font-mono">1.</span> Dashboard &amp; Kontrol Paneli
                </h4>
                <p className="text-sm text-gray-650">
                  Kamp liderlerinden yöneticilere kadar her rolün login olduğunda karşılaştığı anlık operasyon merkezidir. Yatak bazlı doluluk oranı (lider/standart detaylı), aktif kamp dönemi, günün giriş/çıkış yapacak katılımcıları, bekleyen onaylar ve acil durum bildirim merkezi bu ekranda toplanır.
                </p>
              </div>

              <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <span className="text-emerald-700 font-mono">2.</span> Kamp Dönemleri Yönetimi
                </h4>
                <p className="text-sm text-gray-650">
                  Dönem kotaları, tarih aralıkları ve tematik kamp konseptlerinin (Teknoloji Bağımlılığı, Akran Zorbalığı, Sağlıklı Yaşam vb.) her kamp merkezi bazında tanımlanmasını sağlar. Dönem kapanışlarında gelişim ve performans raporları hazırlanır.
                </p>
              </div>

              <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <span className="text-emerald-700 font-mono">3.</span> Başvuru ve Kayıt Yönetimi
                </h4>
                <p className="text-sm text-gray-650">
                  Online ortamlardan gelen başvuruların ön değerlendirme, veli muvafakatnamesi, sağlık beyanı, aşı kartı ve KVKK onay kontrollerinin yapıldığı bölümdür. Onaylanan adaylar "Bekleme Listesi" veya direkt ilgili dönemin "Katılımcı Defterine" aktarılır.
                </p>
              </div>

              <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <span className="text-emerald-700 font-mono">4.</span> Bungalov ve Konaklama Yönetimi
                </h4>
                <p className="text-sm text-gray-650">
                  Tesislerin bungalov yapısına uygun olarak 3 Lider ve 30 standart (hepsi 4'er kişilik) bungalov yatak ölçeğinde konaklama planı sunar. Otomatik akıllı yerleştirme motoru katılımcıları yaşlarına, cinsiyetlerine ve varsa alerjen/sağlık risk koordinasyonlarına göre eşleştirir.
                </p>
              </div>

              <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <span className="text-emerald-700 font-mono">5.</span> Grup ve Personel Yönetimi
                </h4>
                <p className="text-sm text-gray-650">
                  Katılımcıların eğitmenler ve grup liderleri gözetiminde gruplara (Yeşil Hilal, Zümrüd-ü Anka vb.) dağıtılması, günlük nöbetçi personel takvimi oluşturulması ve personel vardiyalarının yönetildiği operasyon ekranıdır.
                </p>
              </div>

              <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <span className="text-emerald-700 font-mono">6.</span> Giriş-Çıkış ve Yoklama Modülü
                </h4>
                <p className="text-sm text-gray-650">
                  Kamptaki her katılımcının QR kod tabanlı kamp kimlik kartı bulunur. Turnike geçişleri, sabah yoklamaları ve etkinlik katılımları bu QR kodu okutularak real-time merkezi database'e yansıtılır. Devamsızlık anında grup liderinin ekranında alarm tetikler.
                </p>
              </div>

              <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <span className="text-emerald-700 font-mono">7.</span> Revir ve Sağlık Yönetimi
                </h4>
                <p className="text-sm text-gray-650">
                  Katılımcıların alerji, düzenli alınan ilaç takipleri ve anlık hastalık müdahaleleri Revir modülünde kayıt altına alınır. İlaç doz zamanı geldiğinde Sağlık Görevlisi'ne mobil push bildirim gönderilir. Kritik durumlarda sevk işlemleri başlatılır.
                </p>
              </div>

              <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <span className="text-emerald-700 font-mono">8.</span> Yemekhane ve Gıda Yönetimi
                </h4>
                <p className="text-sm text-gray-650">
                  Sağlık veritabanından alınan parametrelere göre (Glüten hassasiyeti, Laktoz intoleransı, Vejetaryen vb.) öğün porsiyon planlaması yapılır. Günlük gıda israfını engellemek amacıyla yoklama istatistikleri üzerinden öğün talep tahmin raporu üretilir.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-emerald-600" />
                Sistematik İş Akışları (Workflow Processes)
              </h4>
              <div className="border border-emerald-100 bg-emerald-50/20 p-6 rounded-xl space-y-4">
                <div>
                  <h5 className="font-bold text-emerald-900">A. Kayıt Kabul ve Yerleşim Akışı</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Veli Başvurusu &rarr; Ön Değerlendirme &rarr; Veli Muvafakat &amp; KVKK Islak/Dijital İmza &rarr; Sağlık Formu Kontrolü &rarr; Yönetici Onayı &rarr; Otomatik Odalandırma Motoru (Cinsiyet ve Yaş Uyumlu) &rarr; Kapı Girişinde QR Kod Baskısı / Dijital Aktivasyon.
                  </p>
                </div>
                <div className="border-t border-emerald-150 pt-4">
                  <h5 className="font-bold text-emerald-900">B. Revir Müdahale ve Acil Durum Hiyerarşisi</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Rahatsızlık Beyanı &rarr; Sağlık Görevlisi Muayenesi &rarr; Tanı ve Yerinde Müdahale &rarr; Ebeveyne Otomatik SMS/Mail/WhatsApp Bildirimi &rarr; Sevki Gereken Durum &rarr; Kamp Müdürü Onayı ile Ambulans Entegrasyonu &rarr; Sistemde Log Kaydı ve Tıbbi Form Arşivleme.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: YETKI MATRISI & SENARYOLAR */}
        {subTab === 'matris_senaryo' && (
          <div className="space-y-8 animate-fade-in text-gray-700 font-sans">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <span className="w-2 h-6 bg-emerald-600 rounded-full inline-block"></span>
                Kullanıcı Rolleri Yetkilendirme Matrisi
              </h3>
              <p className="text-sm text-gray-650 mb-4">
                Sistem RBAC (Role-Based Access Control) mimarisindedir. Her kullanıcının görebileceği menüler ve yapabileceği işlemler kesin çizgilerle çekilmiştir.
              </p>

              {/* Robust authority matrix table */}
              <div className="overflow-x-auto rounded-lg border border-gray-150">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-emerald-800 text-white font-semibold">
                      <th className="p-3 border">Rol / Yetki Modülü</th>
                      <th className="p-3 border text-center">Kamp Tanımları</th>
                      <th className="p-3 border text-center">Başvuru Onay</th>
                      <th className="p-3 border text-center">Oda Düzenleme</th>
                      <th className="p-3 border text-center">Grup Atama</th>
                      <th className="p-3 border text-center">Revir Giriş</th>
                      <th className="p-3 border text-center">Yemek Planlama</th>
                      <th className="p-3 border text-center">Yoklama Alma</th>
                      <th className="p-3 border text-center">Sistem Logları</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 bg-white">
                    <tr>
                      <td className="p-3 border font-semibold bg-gray-50 text-emerald-900">Sistem Yöneticisi</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-semibold bg-gray-50 text-emerald-900">Kamp Müdürü</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-gray-300">Görüntüle</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-semibold bg-gray-50 text-emerald-900">Kamp Koordinatörü</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-semibold bg-gray-50 text-emerald-900">Eğitmen</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-semibold bg-gray-50 text-emerald-900">Grup Lideri</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">Kısıtlı</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-semibold bg-gray-50 text-emerald-900">Sağlık Görevlisi</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-emerald-600 font-bold">✔ (Tam Yetki)</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-semibold bg-gray-50 text-emerald-900">Katılımcı / İletişim</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">Başvuru Yap</td>
                      <td className="p-3 border text-center text-gray-300">No (Oku)</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                      <td className="p-3 border text-center text-gray-300">Alerji Beyan</td>
                      <td className="p-3 border text-center text-gray-300">Oku</td>
                      <td className="p-3 border text-center text-gray-300">Qr Kod</td>
                      <td className="p-3 border text-center text-gray-300">➖</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <SquarePlay className="w-5 h-5 text-emerald-600" />
                Rol Bazlı Detaylı Kullanıcı Senaryoları (Use Cases)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                  <h5 className="font-bold text-emerald-800 mb-2">UC-01: Katılımcı Kayıt Kabul Senaryosu</h5>
                  <p className="text-gray-600">
                    <strong>Aktör:</strong> Katılımcı, Sistem Yöneticisi<br />
                    <strong>Akış:</strong> Katılımcı web portalını açar. KVKK ve Taahhütname metinlerini onaylar. Geçmiş sağlık ve alerji bilgisini beyan eder. Kamp yöneticisi evrakları onayladığında bir SMS, WhatsApp mesajı ve Davet QR Kodu katılımcıya iletilir.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                  <h5 className="font-bold text-emerald-800 mb-2">UC-02: Akıllı Oda Yerleştirme</h5>
                  <p className="text-gray-600">
                    <strong>Aktör:</strong> Kamp Koordinatörü<br />
                    <strong>Akış:</strong> Koordinatör sisteme yeni onaylı giren katılımcılar için 'Otomatik Odalandır' tuşuna basar. Arkaplandaki algoritmik yapı kadınları kadın odalarına, erkekleri erkek odalarına, yaş farkı maksimal 2 olacak şekilde ve kronik astım/alerjen durumlarını gruplayarak yataklara dağıtır.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                  <h5 className="font-bold text-emerald-800 mb-2">UC-03: QR Kod Yoklama ve Turnike Senaryosu</h5>
                  <p className="text-gray-600">
                    <strong>Aktör:</strong> Katılımcı, Grup Lideri<br />
                    <strong>Akış:</strong> Sabah içtima/spor veya yemekhanede gönüllü mobil uygulamasındaki dinamik QR kodunu okutur. Kamera/Barkod okuyucu kodu server-side deşifre eder. İlgili saat ve etkinliğe 'Mevcut' olarak işlenir. Katılmayanlar için liderine anlık SMS/WhatsApp/Push notification düşer.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                  <h5 className="font-bold text-emerald-800 mb-2">UC-04: Revir ve Tıbbi Müdahale</h5>
                  <p className="text-gray-600">
                    <strong>Aktör:</strong> Sağlık Görevlisi, Katılımcı<br />
                    <strong>Akış:</strong> Revire gelen gönüllüye ilaç verilir veya müdahale edilir. Hemşire sisteme ilaç dozu ve müdahale nedenini yazar. Katılımcının Yeşilay portalına "Size saat 14:30'da Baş Ağrısı nedeniyle minoset verilmiştir" şeklinde real-time şeffaf işlem logu eklenir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: VERITABANI VE API TASARIMI */}
        {subTab === 'veritabani_api' && (
          <div className="space-y-8 animate-fade-in text-gray-700 font-sans">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <span className="w-2 h-6 bg-emerald-600 rounded-full inline-block"></span>
                Veritabanı ER Diyagramı Şeması ve Tip Detayları
              </h3>
              <p className="text-sm text-gray-650 mb-4">
                SaaS mimarisini destekleyecek şekilde her tabloda <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600">camp_center_id</code> yabancı anahtarı (FK) konumlandırılmıştır.
              </p>

              {/* Graphical Schema layout */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 border border-emerald-100 bg-emerald-50/15 rounded-lg">
                  <div className="bg-emerald-800 text-white font-bold p-2 rounded -m-4 mb-3">
                    TABLE: camp_centers
                  </div>
                  <ul className="space-y-1 mt-6">
                    <li><strong className="text-emerald-700">id</strong> : VARCHAR(10) [PK]</li>
                    <li><strong>name</strong> : VARCHAR(100)</li>
                    <li><strong>city</strong> : VARCHAR(50)</li>
                    <li><strong>capacity</strong> : INT [Default: 78]</li>
                  </ul>
                </div>

                <div className="p-4 border border-emerald-100 bg-emerald-50/15 rounded-lg">
                  <div className="bg-emerald-800 text-white font-bold p-2 rounded -m-4 mb-3">
                    TABLE: camp_periods
                  </div>
                  <ul className="space-y-1 mt-6">
                    <li><strong className="text-emerald-700">id</strong> : VARCHAR(20) [PK]</li>
                    <li><strong>camp_center_id</strong> : VARCHAR(10) [FK]</li>
                    <li><strong>name</strong> : VARCHAR(150)</li>
                    <li><strong>start_date</strong> : DATE</li>
                    <li><strong>end_date</strong> : DATE</li>
                    <li><strong>status</strong> : VARCHAR(20)</li>
                  </ul>
                </div>

                <div className="p-4 border border-emerald-100 bg-emerald-50/15 rounded-lg">
                  <div className="bg-emerald-800 text-white font-bold p-2 rounded -m-4 mb-3">
                    TABLE: participants
                  </div>
                  <ul className="space-y-1 mt-6">
                    <li><strong className="text-emerald-700">id</strong> : VARCHAR(20) [PK]</li>
                    <li><strong>camp_center_id</strong> : VARCHAR(10) [FK]</li>
                    <li><strong>name</strong> : VARCHAR(100)</li>
                    <li><strong>tc_no</strong> : CHAR(11) [Encrypted]</li>
                    <li><strong>gender</strong> : VARCHAR(10)</li>
                    <li><strong>status</strong> : VARCHAR(25)</li>
                    <li><strong>bungalow_id</strong> : VARCHAR(15) [FK]</li>
                    <li><strong>bed_number</strong> : INT</li>
                  </ul>
                </div>

                <div className="p-4 border border-emerald-100 bg-emerald-50/15 rounded-lg">
                  <div className="bg-emerald-800 text-white font-bold p-2 rounded -m-4 mb-3">
                    TABLE: bungalows
                  </div>
                  <ul className="space-y-1 mt-6">
                    <li><strong className="text-emerald-700">id</strong> : VARCHAR(15) [PK]</li>
                    <li><strong>camp_center_id</strong> : VARCHAR(10) [FK]</li>
                    <li><strong>name</strong> : VARCHAR(50)</li>
                    <li><strong>type</strong> : VARCHAR(20) ["Lider" | "Standart"]</li>
                    <li><strong>capacity</strong> : INT [4 or 6]</li>
                  </ul>
                </div>

                <div className="p-4 border border-emerald-100 bg-emerald-50/15 rounded-lg">
                  <div className="bg-emerald-800 text-white font-bold p-2 rounded -m-4 mb-3">
                    TABLE: attendance_records
                  </div>
                  <ul className="space-y-1 mt-6">
                    <li><strong className="text-emerald-700">id</strong>: VARCHAR(30) [PK]</li>
                    <li><strong>participant_id</strong>: VARCHAR(20) [FK]</li>
                    <li><strong>date</strong>: DATE</li>
                    <li><strong>status</strong>: VARCHAR(15) ["Mevcut", "Izinli"...]</li>
                    <li><strong>scanned_qr</strong>: BOOLEAN</li>
                  </ul>
                </div>

                <div className="p-4 border border-emerald-100 bg-emerald-50/15 rounded-lg">
                  <div className="bg-emerald-800 text-white font-bold p-2 rounded -m-4 mb-3">
                    TABLE: health_incidents
                  </div>
                  <ul className="space-y-1 mt-6">
                    <li><strong className="text-emerald-700">id</strong>: VARCHAR(20) [PK]</li>
                    <li><strong>participant_id</strong>: VARCHAR(20) [FK]</li>
                    <li><strong>complaint</strong>: TEXT</li>
                    <li><strong>treatment</strong>: TEXT</li>
                    <li><strong>status</strong>: VARCHAR(25)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <Terminal className="w-5 h-5 text-emerald-600" />
                RESTful API Endpoints ve Payload Tasarımları
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Tüm API istekleri HTTP Bearer token ile korunur ve JSON tipinde haberleşme gerçekleştirir.
              </p>

              <div className="space-y-4 text-xs font-mono">
                {/* Endpoint 1 */}
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg shadow-inner">
                  <p className="text-emerald-400 font-bold">POST /api/v1/camp-centers/&#123;centerId&#125;/auto-allocate</p>
                  <p className="text-gray-400 text-2xs mt-1">// Kamptaki oda yerleşimi yapılmamış tüm katılımcıları akıllı yatak algoritmasına göre otomatik yerleştirir.</p>
                  <div className="mt-3">
                    <span className="text-blue-300">Request Headers:</span>
                    <pre className="text-gray-300">Authorization: Bearer &lt;JWT_TOKEN&gt;</pre>
                  </div>
                  <div className="mt-3">
                    <span className="text-yellow-300">Response (200 OK):</span>
                    <pre className="text-gray-300">{`{
  "status": "success",
  "allocatedCount": 4,
  "unallocatedRemaining": 0,
  "timestamp": "2026-06-18T10:15:30Z"
}`}</pre>
                  </div>
                </div>

                {/* Endpoint 2 */}
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg shadow-inner">
                  <p className="text-emerald-400 font-bold">POST /api/v1/check-in/scan</p>
                  <p className="text-gray-400 text-2xs mt-1">// Katılımcının mobil uygulamasındaki şifreli QR kodu okutarak anlık giriş check-in işlemini tamamlar.</p>
                  <div className="mt-3">
                    <span className="text-gray-400 font-bold">Body JSON Payload:</span>
                    <pre className="text-gray-300">{`{
  "qrPayload": "YEK-PROT-2026-P001-TOKEN_XYZ",
  "scannerStaffId": "S04",
  "location": "MAIN_GATE"
}`}</pre>
                  </div>
                  <div className="mt-2">
                    <span className="text-yellow-300">Response (200 OK):</span>
                    <pre className="text-gray-300">{`{
  "status": "success",
  "message": "Check-in successful",
  "participant": {
    "id": "P001",
    "name": "Batuhan Kara",
    "status": "Kampta",
    "checkInTime": "2026-06-18T10:17:15Z"
  }
}`}</pre>
                  </div>
                </div>

                {/* Endpoint 3 */}
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg shadow-inner">
                  <p className="text-emerald-400 font-bold">GET /api/v1/reports/camp-performance?campId=C01</p>
                  <p className="text-gray-400 text-2xs mt-1">// İlgili kamp merkezine ait anlık doluluk oranları, yaş dağılımı, cinsiyet dengesi ve yemek israfı tahmini parametrelerini döndürür.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: GUVENLIK, SAAS VE KVKK */}
        {subTab === 'mimari_kvkk' && (
          <div className="space-y-6 animate-fade-in text-gray-700 leading-relaxed font-sans">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <span className="w-2 h-6 bg-emerald-600 rounded-full inline-block"></span>
                Çoklu Kamp Merkezi &amp; Ölçeklenebilir SaaS Mimarisi
              </h3>
              <p className="text-sm text-gray-650">
                Yeşilay Kamp Yönetim Sistemi (KYS), gelecekte sadece Türkiye değil, uluslararası lokasyonlarda da hizmet verebilecek şekilde <strong>Multi-Tenant SaaS</strong> mimarisinde tasarlanmıştır.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <Network className="w-5 h-5 text-emerald-600" />
                  SaaS Dağıtık Veri İzolasyonu
                </h4>
                <p className="text-xs text-gray-650">
                  Veri tabanı katmanında şema bazlı veya kolon bazlı veri izolasyonu seçilebilir. Yeşilay KYS kolon bazlı izolasyonu ve PostgreSQL Row-Level Security (RLS) teknolojisini kullanır. Her SQL sorgusunda otomatik olarak aktif kampa bağlı tenant filtresi (<code className="bg-gray-100 text-red-650 px-1 font-mono">tenant_id</code>) uygulanarak veri sızıntıları donanımsal düzeyde engellenir.
                </p>
              </div>

              <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  KVKK ve Sağlık Verisi Güvenliği (HIPAA &amp; KVKK)
                </h4>
                <p className="text-xs text-gray-650">
                  Katılımcıların T.C. Kimlik Numarası, kişisel iletişim bilgileri ve çocukların hassas tıbbi sağlık bilgileri (Alerjiler, İlaçlar, Psikolog Notları) veritabanında tahrif edilmemiş <strong>AES-256</strong> şifreleme algoritmasıyla depolanır. Şifreleme anahtarları (Encryption Keys) Cloud KMS (Key Management Services) içerisinde tutulur ve kod tabanından ayrıştırılmıştır.
                </p>
              </div>
            </div>

            <div className="border border-red-50 p-5 rounded-xl bg-red-50/10 border-l-4 border-l-red-600">
              <h4 className="font-bold text-red-900 text-sm mb-2">Hukuki Altyapı ve Veri Saklama Koşulları</h4>
              <p className="text-xs text-gray-650">
                Ön başvuru ve katılım taahhütnameleri sisteme yüklenirken time-stamp (zaman damgası) ile damgalanmaktadır. Katılımcı kamptan ayrıldıktan veya dönem tamamlandıktan 2 yıl sonra KVKK Veri İmha Politikası kapsamında kişisel veriler anonimleştirilerek istatistiksel raporlarda saklanır, ham kişisel veriler tamamen imha edilir.
              </p>
            </div>
          </div>
        )}

        {/* SUBTAB 5: MENÜ STANDARTLARI */}
        {subTab === 'menu_standartlari' && (
          <div className="space-y-6 animate-fade-in text-gray-700 leading-relaxed font-sans">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <span className="w-2 h-6 bg-emerald-600 rounded-full inline-block"></span>
                Yeşilay Menü Standartları Kılavuzu
              </h3>
              <p className="text-sm text-gray-650">
                Yeşilay kamp merkezlerinde uygulanan beslenme standartları, katılımcıların sağlıklı gelişimini desteklemek, alerjen hassasiyetlerini yönetmek ve gıda israfını minimize etmek amacıyla oluşturulmuştur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                  Beslenme İlkeleri
                </h4>
                <p className="text-xs text-gray-650">
                  Her öğün; karbonhidrat, protein, yağ ve lif dengesini gözeterek planlanır. İşlenmiş gıdalardan kaçınılır, mevsimsel ve yerel ürün kullanımı teşvik edilir. Günlük kalori ihtiyacı yaş gruplarına göre optimize edilir.
                </p>
              </div>

              <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Alerjen Yönetimi
                </h4>
                <p className="text-xs text-gray-650">
                  Katılımcıların gıda alerjileri (glüten, laktoz, kuruyemiş vb.) sisteme işlenir. Yemekhane yönetimi, alerjik reaksiyon riskini sıfıra indirmek için etiketleme ve ayrı servis hatları kurallarına sıkı sıkıya bağlı kalır.
                </p>
              </div>
            </div>

            <div className="border border-emerald-50 p-5 rounded-xl bg-emerald-50/20">
              <h4 className="font-bold text-emerald-900 text-sm mb-2">Gıda İsrafını Önleme</h4>
              <p className="text-xs text-gray-650">
                Yoklama istatistikleri ve yemek talepleri eş zamanlı izlenerek, gereksiz porsiyon hazırlığı engellenir. "Önce İhtiyaç" ilkesiyle günlük üretim planı dinamik olarak güncellenir.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
