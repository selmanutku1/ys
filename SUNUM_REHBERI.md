# Yeşilay Kampüs Operasyonları ve Güvenli Erişim Altyapısı - Sunum Rehberi

Bu doküman, projeyi tanıtmak amacıyla hazırlanacak bir PowerPoint/PDF sunumu için içerik rehberidir. Her slaytta kullanmanız gereken **ekran görüntüsü (görsel)**, **slayt başlığı** ve **vurgulanacak metinler (madde işaretleri)** detaylandırılmıştır.

---

## Slayt 1: Kapak
**Görsel:** Yeşilay logosu ve temiz bir arka plan (veya Login ekranının bulanık bir arka planı).
**Başlık:** Türkiye Yeşilay Cemiyeti
**Alt Başlık:** Kampüs Operasyonları ve Güvenli Erişim Altyapısı
**Sunucu/Tarih:** [Adınız/Tarih]

---

## Slayt 2: Projenin Amacı ve Kapsamı
**Görsel:** `DashboardView` ekranından genel bir görünüm (Grafikler ve özet kartları görülecek şekilde).
**Başlık:** Sisteme Genel Bakış
**Metinler:**
- Kampüs içi tüm operasyonların tek bir platformdan yönetilmesi.
- Kayıt, konaklama, yemekhane, sağlık ve güvenlik süreçlerinin dijitalleştirilmesi.
- Rol bazlı yetkilendirme ile veri gizliliği ve güvenliğin sağlanması.
- Anlık raporlama ve veri analizleriyle karar alma süreçlerinin hızlandırılması.

---

## Slayt 3: Giriş ve Güvenlik Altyapısı (Login & Screensaver)
**Görsel:** `LoginView` (Rol seçim ekranı) ve `Screensaver` (Güvenli Mod şifre ekranı) ekran görüntülerinden oluşan bir kolaj.
**Başlık:** Güvenli Erişim ve Kiosk Modu
**Metinler:**
- **Çoklu Rol Yönetimi:** Admin, Kayıt, Yemekhane, Teknik, Sağlık ve Güvenlik gibi farklı profillerle sisteme giriş.
- **PIN ile Hızlı Doğrulama:** Saha personeli için 4 haneli güvenli ve hızlı geçiş kodu.
- **Güvenli Mod (Screensaver):** Sistem belirli bir süre boşta kaldığında otomatik kilitlenme.
- **Gizli Şifre Girişi:** Meraklı gözlerden korunmak için şifre alanı yazarken `****` şeklinde gizlenir.

---

## Slayt 4: Yönetim Paneli ve Dashboard (Admin)
**Görsel:** `DashboardView` ekranından net bir ekran görüntüsü (İstatistik kartları, etkinlik takvimi, özet raporlar).
**Başlık:** Merkezi Yönetim Paneli
**Metinler:**
- Tüm kampüs istatistiklerinin anlık (real-time) takibi.
- Aktif etkinlikler, yaklaşan kamplar ve kapasite doluluk oranları.
- Kullanıcı dostu, yüksek kontrastlı ve modern arayüz tasarımı.

---

## Slayt 5: Kayıt ve Katılımcı Yönetimi
**Görsel:** `RegistrationView` veya `ParticipantView` ekranının görüntüsü.
**Başlık:** Kayıt, Muvafakatname ve Katılımcı Operasyonları
**Metinler:**
- Kampa gelen misafirlerin hızlı kayıt ve kabul süreçleri.
- **Dijital Muvafakatname (Canvas İmza):** Taahhütnamelerin dijital ekranda imza atılarak alınması (Kağıtsız kampüs).
- Katılımcı listeleri, demografik dağılımlar ve iletişim bilgileri.
- Bungalov/Oda atamalarının hızlıca yapılması (`BungalowView` entegrasyonu).

---

## Slayt 6: Konaklama ve Bungalov Yönetimi
**Görsel:** `BungalowView` (Odaların durumu, temizlik/dolu/boş göstergeleri) ekran görüntüsü.
**Başlık:** Konaklama ve Kapasite Yönetimi
**Metinler:**
- Bungalovların anlık durum takibi (Boş, Dolu, Temizlikte, Bakımda).
- Katılımcıların odalara sürükle-bırak veya tek tıkla atanması.
- Konaklama kapasitesinin görselleştirilmiş haritası.

---

## Slayt 7: Yemekhane ve Operasyonel Süreçler
**Görsel:** `YemekhaneView` ekran görüntüsü (Öğün planları, kişi sayıları).
**Başlık:** Yemekhane ve Günlük Planlama
**Metinler:**
- Günlük öğün planlaması ve menü takibi.
- Kampüs mevcuduna göre porsiyon tahmini ve israfın önlenmesi.
- Özel beslenme gereksinimlerinin (alerji, diyet vb.) takibi.

---

## Slayt 8: Sağlık ve Güvenlik Yönetimi
**Görsel:** `HealthView` ve `GuvenlikView` / `IncidentLogsView` (Vaka kayıtları) ekran görüntüsü.
**Başlık:** Sağlık, Güvenlik ve Vaka Takibi
**Metinler:**
- **Sağlık:** Revir işlemleri, katılımcıların sağlık geçmişleri ve kullanılan ilaçların kaydı.
- **Güvenlik & Vaka:** Kampüs içi ihlaller, giriş-çıkış kayıtları ve vaka (incident) raporlama sistemi.
- Acil durumlarda ilgili personelin hızlı reaksiyon göstermesini sağlayan uyarı altyapısı.

---

## Slayt 9: Teknik Operasyonlar
**Görsel:** `TechnicalOperationsView` ekran görüntüsü (Arıza talepleri, bakım süreçleri).
**Başlık:** Teknik Bakım ve Arıza Yönetimi
**Metinler:**
- Bungalov veya ortak alanlardaki arıza bildirimlerinin tek ekranda toplanması.
- İş emirlerinin oluşturulması ve teknisyenlere atanması.
- Bakım süreçlerinin SLA (hizmet seviyesi) takibi.

---

## Slayt 10: Raporlama, Finans ve Dijital Arşiv
**Görsel:** `CostAnalysisView` veya `DijitalArsivView` ekran görüntüsü.
**Başlık:** Maliyet Analizi ve Arşiv
**Metinler:**
- **Maliyet Analizi:** Etkinlik bazlı harcama raporları ve bütçe kullanımı.
- **Anket Analizi (`SurveyAnalysisView`):** Kamp sonu memnuniyet değerlendirmeleri.
- **Dijital Arşiv:** Geçmiş kampların verileri, resmi evraklar ve dökümantasyon (Paperless/Kağıtsız kampüs hedefi).

---

## Slayt 11: Genel Etkinlik Takvimi (Public Display)
**Görsel:** `PublicCalendarView` ekran görüntüsü.
**Başlık:** Ortak Alan Ekranları (Kiosk/TV)
**Metinler:**
- Kampüs içindeki TV ve kiosk ekranlarına yansıtılabilecek, salt okunur (read-only) takvim ekranı.
- Günlük etkinlik programı, yemek saatleri ve önemli duyuruların tüm kampüsle paylaşılması.
- Şık, okunabilirliği yüksek tam ekran (fullscreen) görünüm.

---

## Slayt 12: İletişim ve Otomatik Bildirim Altyapısı (WhatsApp)
**Görsel:** `SettingsView` içindeki WhatsApp panelinin veya katılımcı profilindeki WhatsApp gönderme butonunun görüntüsü.
**Başlık:** WhatsApp Bildirim Altyapısı
**Metinler:**
- Katılımcılara ve kafile sorumlularına otomatik WhatsApp mesajları.
- Etkinlik bildirimleri, başvuru onayları ve oda ataması hatırlatmaları.
- Katılımcı profilinden tek tıkla doğrudan WhatsApp Web başlatma yeteneği.

---

## Slayt 13: Teşekkür ve Kapanış
**Görsel:** Yeşilay Logosu ve ekibin bir fotoğrafı veya uygulamanın boş bir şık Dashboard ekranı.
**Başlık:** Teşekkürler
**Metinler:**
- Sorularınız?
- İletişim Bilgileri

---

**Not:** Bu sunumu hazırlarken, uygulamayı bilgisayarınızda (veya paylaşılan linkte) tam ekran yaparak (F11 tuşu ile) ekran görüntülerini (Print Screen / Snipping Tool) almanızı ve yukarıdaki metinlerle PowerPoint'e yerleştirmenizi tavsiye ederim.
