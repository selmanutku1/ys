/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant } from '../types';

/**
 * Generates official, stylized HTML content representing the Green Crescent (Yeşilay) registration form.
 */
function generateFormHtml(p: Participant): string {
  const genderLabel = p.gender === 'Erkek' ? 'Erkek / Male' : 'Kadın / Female';
  const allergiesValue = p.allergies || 'Saptanamayan Alerji Yok / No Allergies';
  const chronicDiseasesValue = p.chronicDiseases || 'Yok / None';
  const medicationsValue = p.medications || 'Yok / None';
  const healthNoteValue = p.healthNote || 'Gözlem Notu Bulunmamaktadır.';
  const currentYear = new Date().getFullYear();

  return `
    <html>
    <head>
      <meta charset="utf-8">
      <title>Yeşilay Kamp Kayıt Formu - ${p.name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #1a3026;
          margin: 0;
          padding: 20px;
          line-height: 1.4;
          background: #ffffff;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          border: 2px solid #059669;
          padding: 30px;
          background: #ffffff;
          position: relative;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #059669;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #047857;
          font-size: 22px;
          margin: 5px 0;
          font-weight: bold;
          letter-spacing: 0.5px;
        }
        .header h2 {
          color: #374151;
          font-size: 14px;
          margin: 5px 0;
          font-weight: normal;
        }
        .logo-subtitle {
          font-size: 10px;
          color: #059669;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .section-title {
          background-color: #f0fdf4;
          border-left: 4px solid #059669;
          padding: 6px 12px;
          color: #065f46;
          font-size: 13px;
          font-weight: bold;
          margin-top: 20px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background-color: #f9fafb;
          color: #4b5563;
          width: 25%;
          font-weight: bold;
        }
        td {
          color: #111827;
        }
        .footer-note {
          margin-top: 30px;
          font-size: 9px;
          color: #6b7280;
          text-align: center;
          line-height: 1.5;
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
        }
        .decor-moon {
          position: absolute;
          top: 15px;
          right: 25px;
          font-size: 24px;
          color: #059669;
        }
        .signature-table th {
          width: 33.33%;
          text-align: center;
          padding: 6px;
        }
        .signature-table td {
          height: 70px;
          vertical-align: bottom;
          text-align: center;
          font-size: 11px;
          color: #4b5563;
        }
        .badge {
          float: right;
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #10b981;
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="decor-moon">🌙</div>
        <div class="header">
          <div class="logo-subtitle">T.C. TÜRKİYE YEŞİLAY CEMİYETİ</div>
          <h1>RESMİ KAMP KAYIT VE SAĞLIK BEYAN FORMU</h1>
          <h2>Yeşilay Gençlik Kampları Yönetim Bilgi Sistemi (KYS)</h2>
          <div style="font-size: 11px; color:#6b7280; margin-top: 8px;">
            Sistem Kayıt ID: <strong>${p.id}</strong> | Form Üretim Tarihi: ${new Date().toLocaleDateString('tr-TR')}
          </div>
        </div>

        <div class="section-title">1. Katılımcı Kimlik & Yetki Bilgileri</div>
        <table>
          <tr>
            <th>Adı Soyadı</th>
            <td><strong>${p.name}</strong> <span class="badge">${p.gender}</span></td>
            <th>T.C. Kimlik No</th>
            <td><code style="font-family: monospace; font-size:12px;">${p.identityNumber}</code></td>
          </tr>
          <tr>
            <th>Doğum Tarihi</th>
            <td>${new Date(p.birthDate).toLocaleDateString('tr-TR')}</td>
            <th>Cinsiyet Sınıfı</th>
            <td>${genderLabel}</td>
          </tr>
          <tr>
            <th>Kayıt Durumu</th>
            <td><span style="font-weight: bold; color: #047857;">${p.status}</span></td>
            <th>Yerleşim Ataması</th>
            <td>${p.bungalowId ? `Oda: ${p.bungalowId} / Yatak: ${p.bedNumber}` : 'Beklemede (Belirlenmedi)'}</td>
          </tr>
        </table>

        <div class="section-title">2. İletişim &amp; Acil Haberleşme Bilgileri</div>
        <table>
          <tr>
            <th>Ebeveyn Gsm (Gorevli)</th>
            <td>${p.phone || '-'}</td>
            <th>Müracaat E-Posta</th>
            <td>${p.email || '-'}</td>
          </tr>
        </table>

        <div class="section-title">3. Detaylı Sağlık Beyanı ve Tıbbi Geçmiş</div>
        <table>
          <tr>
            <th>Alerjiler & Reaksiyonlar</th>
            <td colspan="3" style="color: #b91c1c; font-weight: bold;">${allergiesValue}</td>
          </tr>
          <tr>
            <th>Kronik Rahatsızlıklar</th>
            <td colspan="3">${chronicDiseasesValue}</td>
          </tr>
          <tr>
            <th>Rutin Kullanılan İlaçlar</th>
            <td colspan="3">${medicationsValue}</td>
          </tr>
          <tr>
            <th>İdari / Tıbbi Gözlem Notu</th>
            <td colspan="3" style="italic">${healthNoteValue}</td>
          </tr>
        </table>

        <div class="section-title">4. Veli Muvafakatnameleri & Yasal Onamlar</div>
        <table style="font-size: 11px;">
          <tr>
            <th style="width: 40%">Yasal Taahhüt Tipi</th>
            <th style="width: 20%; text-align: center;">Onay Durumu</th>
            <th>Açıklama</th>
          </tr>
          <tr>
            <td><strong>KVKK Açık Rıza ve Onam Metni</strong></td>
            <td style="text-align: center; font-weight: bold; color: #047857;">${p.kvkkSigned ? 'ONAYLANDI (Dijital)' : 'ONAYSIZ'}</td>
            <td>Sağlık ve kimlik verilerinin Yeşilay cemiyeti veri bankasında saklanması.</td>
          </tr>
          <tr>
            <td><strong>Kamp Katılım Taahhüt Sözleşmesi</strong></td>
            <td style="text-align: center; font-weight: bold; color: #047857;">${p.consentReceived ? 'ONAYLANDI (Dijital)' : 'ONAYSIZ'}</td>
            <td>Kamp kurallarına tam uyum, etkinlik katılımları ve acil acil tıbbi protokol onayı.</td>
          </tr>
        </table>

        <div class="section-title">5. Islak İmza, Doğrulama ve Karar</div>
        <table class="signature-table">
          <thead>
            <tr>
              <th>Katılımcı / Veli</th>
              <th>Kamp Güvenlik / Kabul Birimi</th>
              <th>Kamp Müdürü Onayı</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Adı Soyadı:<br>
                İmza:<br><br>
                Tarih: .... / .... / ${currentYear}
              </td>
              <td>
                Kayıt Kontrol Sorumlusu:<br>
                Evrak Teslim Durumu: [ Evraklar Tam ]<br><br>
                İmza:
              </td>
              <td>
                Karar: <strong>KAMP KABULÜ UYGUNDUR</strong><br>
                İmza:<br><br>
                Yeşilay Kamp Direktörlüğü
              </td>
            </tr>
          </tbody>
        </table>

        <div class="footer-note">
          Bu belge T.C. Türkiye Yeşilay Cemiyeti Kamp Yönetim Sistemi (KYS) üzerinden üretilmiştir.<br>
          Formda beyan edilen tüm sağlık ve iletişim bilgileri velinin/gönüllünün şahsi taahhüdü altındadır. Olası acil durumlarda kamp revir hekimine ibraz edilecektir.<br>
          Yeşilay Genel Merkez / Sepetçiler Kasrı, Kennedy Cad. No: 3 Fatih, İstanbul | kys.yesilay.org.tr
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Downloads the specified participant's registration form as an MS Word Document (.doc).
 */
export function exportToWord(p: Participant): void {
  const htmlContent = generateFormHtml(p);
  
  // Compile MS Word compatible XML wrapped HTML
  const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(htmlContent);
  const fileDownload = document.createElement("a");
  
  document.body.appendChild(fileDownload);
  fileDownload.href = source;
  fileDownload.download = `Yesilay_Kamp_Kayit_Formu_${p.name.replace(/\s+/g, '_')}.doc`;
  fileDownload.click();
  document.body.removeChild(fileDownload);
}

/**
 * Prints the registration form layout seamlessly via a temporary browser iframe,
 * prompting the standard print dialog which allows "Save as PDF".
 */
export function exportToPdf(p: Participant): void {
  const htmlContent = generateFormHtml(p);
  
  // Create a temporary hidden iframe to contain the custom printable markup
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Give browsers a small timeout to load fonts or styles, and then summon the native printing experience
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Remove the element after the print dialog finishes
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 500);
    }, 250);
  }
}

/**
 * Prints multiple badges on a single page (8 badges per A4 page).
 */
export function exportBulkBadgesToPdf(participants: Participant[]): void {
  // We'll create an A4 layout using CSS grid or flexbox.
  // A4 size is roughly 210mm x 297mm.
  // If we want 8 badges per page, we can use a 2x4 grid.

  let badgesHtml = '';

  participants.forEach((p, index) => {
    // Generate HTML for a single badge
    // Page break every 8 badges
    const isNewPage = index > 0 && index % 8 === 0;
    
    badgesHtml += `
      ${isNewPage ? '<div style="page-break-before: always;"></div>' : ''}
      <div class="badge-card">
        <div class="badge-header">
          <div class="logo">AY KAMP</div>
          <div class="camp-title">GENÇLİK KAMPI</div>
        </div>
        <div class="badge-body">
          <div class="avatar">${p.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</div>
          <div class="name">${p.name}</div>
          <div class="role">${p.status === 'Kampta' ? 'KATILIMCI' : p.status.toUpperCase()}</div>
          
          <div class="details">
            <div class="detail-row"><span>Kategori:</span> <strong>${p.category}</strong></div>
            <div class="detail-row"><span>T.C.:</span> <strong>${p.identityNumber.slice(0,3)}******${p.identityNumber.slice(-2)}</strong></div>
            ${p.bungalowId ? `<div class="detail-row"><span>Konaklama:</span> <strong>${p.bungalowId} / Yatak ${p.bedNumber}</strong></div>` : ''}
            ${p.allergies ? `<div class="warning">DİKKAT: Alerjisi Var</div>` : ''}
          </div>
        </div>
        <div class="badge-footer">
          <div class="barcode">|| |||| | ||| || ||| | ||</div>
          <div class="id-text">ID: ${p.id.slice(0, 8)}</div>
        </div>
      </div>
    `;
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>Toplu Yaka Kartları</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 10mm;
          background-color: #f3f4f6;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .page-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(4, 1fr);
          gap: 5mm;
          height: 100%;
        }
        .badge-card {
          width: 85mm;
          height: 54mm; /* Standard CR80 badge size is 86x54, we use 85x54 or adjust for 8 per page (A4 is 210x297, so 85x54 fits easily in 2x4 with margins) */
          /* Wait, 2x4 of 85x54 is 170x216, A4 is 210x297. We can make it bigger! */
          /* Let's make it 90mm x 60mm */
          width: 90mm;
          height: 65mm;
          background-color: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          float: left;
          margin-right: 5mm;
          margin-bottom: 5mm;
          page-break-inside: avoid;
        }
        .badge-header {
          background-color: #047857; /* Emerald 700 */
          color: white;
          padding: 6px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 1px;
        }
        .camp-title {
          font-size: 10px;
          font-weight: 600;
          opacity: 0.9;
        }
        .badge-body {
          flex: 1;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #10b981;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          margin-bottom: 6px;
        }
        .name {
          font-size: 16px;
          font-weight: 900;
          color: #111827;
          line-height: 1.1;
          margin-bottom: 4px;
          max-width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .role {
          background-color: #d1fae5;
          color: #047857;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 12px;
          margin-bottom: 8px;
        }
        .details {
          width: 100%;
          font-size: 9px;
          color: #4b5563;
          text-align: left;
          margin-top: auto;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed #e5e7eb;
          padding-bottom: 2px;
          margin-bottom: 2px;
        }
        .warning {
          color: #dc2626;
          font-weight: 800;
          font-size: 9px;
          text-align: center;
          margin-top: 4px;
          background-color: #fef2f2;
          padding: 2px;
          border-radius: 4px;
        }
        .badge-footer {
          background-color: #f9fafb;
          border-top: 1px solid #e5e7eb;
          padding: 4px 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .barcode {
          font-family: 'Courier New', Courier, monospace;
          font-size: 16px;
          font-weight: bold;
          color: #374151;
          letter-spacing: -1px;
        }
        .id-text {
          font-size: 8px;
          color: #9ca3af;
          font-family: monospace;
        }
        
        @media print {
          body {
            background-color: white;
            padding: 0;
            margin: 10mm;
          }
          .badge-card {
            box-shadow: none;
            border: 1px dashed #9ca3af;
          }
        }
      </style>
    </head>
    <body>
      <div class="page-container">
        ${badgesHtml}
      </div>
    </body>
    </html>
  `;

  // High reliability printing using print-section approach
  const printSection = document.createElement('div');
  printSection.id = 'print-section';
  printSection.innerHTML = htmlContent;
  document.body.appendChild(printSection);
  document.body.classList.add('printing-active');

  setTimeout(() => {
    window.print();
    setTimeout(() => {
      if (printSection.parentNode) {
        document.body.removeChild(printSection);
      }
      document.body.classList.remove('printing-active');
    }, 1000);
  }, 250);
}
