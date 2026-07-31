/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CampCenter,
  CampPeriod,
  Bungalow,
  Participant,
  Staff,
  Group,
  HealthIncident,
  MealPlan,
  CampActivity,
  SystemLog,
  SurveyResponse,
  TechnicalIssue,
  SupplyRequest,
  InventoryItem,
  DailyMenu,
  AppNotification,
  Expense,
  Task,
  ShiftAssignment
} from './types';

export const INITIAL_TASKS: Task[] = [
  { id: 'TSK-001', title: 'Yemekhane Dezenfeksiyonu', description: 'Öğle yemeği sonrası tüm masaların ve zeminlerin standart prosedüre uygun dezenfekte edilmesi.', assignedTo: 'STF-01', assignedToName: 'Ahmet Temizkan', department: 'Temizlik', date: '2026-06-16', dueDate: '2026-06-16T14:30', status: 'Bekliyor', priority: 'Yüksek', history: [{ date: '2026-06-15T10:00', user: 'Sistem', action: 'Kayıt Açıldı' }] },
  { id: 'TSK-002', title: 'Gece Devriyesi', description: 'Bungalov alanları ve ormanlık sınır bölgesinin gece termal kameralarla kontrol edilmesi.', assignedTo: 'STF-02', assignedToName: 'Mehmet Güven', department: 'Güvenlik', date: '2026-06-16', dueDate: '2026-06-16T23:59', status: 'Bekliyor', priority: 'Kritik', history: [{ date: '2026-06-15T11:00', user: 'Sistem', action: 'Kayıt Açıldı' }] },
  { id: 'TSK-003', title: 'Klima Arızası (Bungalov 5)', description: 'Bungalov 5 kliması soğutmuyor, filtre kontrolü ve gaz basımı gerekiyor.', assignedTo: 'Atanmadı', assignedToName: '', department: 'Teknik', date: '2026-06-16', dueDate: '2026-06-16T18:00', status: 'Bekliyor', priority: 'Yüksek', history: [{ date: '2026-06-16T08:30', user: 'Ahmet Temizkan', action: 'Kayıt Açıldı' }] },
  { id: 'TSK-004', title: 'Elektrik Kesintisi', description: 'B blok genel aydınlatmalarında sigorta atması sorunu var.', assignedTo: 'STF-03', assignedToName: 'Hasan Yılmaz', department: 'Teknik', date: '2026-06-16', dueDate: '2026-06-16T10:00', status: 'Devam Ediyor', priority: 'Kritik', history: [{ date: '2026-06-16T09:00', user: 'Sistem', action: 'Kayıt Açıldı' }, { date: '2026-06-16T09:15', user: 'Hasan Yılmaz', action: 'Durum güncellendi: Devam Ediyor' }] },
  { id: 'TSK-005', title: 'Lavabo Sızıntısı', description: 'Yemekhane ana tuvalet erkek bölümündeki 2. lavabo damlatıyor.', assignedTo: 'Atanmadı', assignedToName: '', department: 'Teknik', date: '2026-06-16', dueDate: '2026-06-17T12:00', status: 'Bekliyor', priority: 'Orta', history: [{ date: '2026-06-16T07:45', user: 'Mehmet Güven', action: 'Kayıt Açıldı' }] },
  { id: 'REQ-001', title: '5 Kutu A4 Fotokopi Kağıdı', description: 'Malzeme Talebi: Ofis kullanımları için bitmek üzere olan kağıt ihtiyacı.', assignedTo: 'Atanmadı', assignedToName: '', department: 'Diğer', date: '2026-06-16', dueDate: '2026-06-18T17:00', status: 'Bekliyor', priority: 'Orta', history: [{ date: '2026-06-16T10:30', user: 'Ayşe Yıldız', action: 'Talep Açıldı' }] },
  { id: 'REQ-002', title: 'Matkap ve Dübel Seti', description: 'Demirbaş Talebi: Atölye için yedek parça ihtiyacı.', assignedTo: 'Atanmadı', assignedToName: '', department: 'Diğer', date: '2026-06-15', dueDate: '2026-06-17T17:00', status: 'Devam Ediyor', priority: 'Yüksek', history: [{ date: '2026-06-15T14:20', user: 'Hasan Yılmaz', action: 'Talep Açıldı' }, { date: '2026-06-15T15:00', user: 'Sistem', action: 'Durum güncellendi: Devam Ediyor' }] },
  { id: 'REQ-003', title: 'Temizlik Eldiveni (L Beden)', description: 'Sarf Malzeme Talebi: Temizlik personeli için eldiven stoku tükendi.', assignedTo: 'Atanmadı', assignedToName: '', department: 'Diğer', date: '2026-06-16', dueDate: '2026-06-16T12:00', status: 'Bekliyor', priority: 'Kritik', history: [{ date: '2026-06-16T08:10', user: 'Ahmet Temizkan', action: 'Talep Açıldı' }] }
];

export const INITIAL_SHIFTS: ShiftAssignment[] = [
  { id: 'SHF-001', staffId: 'STF-01', staffName: 'Ahmet Temizkan', department: 'Temizlik', date: '2026-06-16', startTime: '08:00', endTime: '16:00', location: 'Ana Bina ve Yemekhane' },
  { id: 'SHF-002', staffId: 'STF-02', staffName: 'Mehmet Güven', department: 'Güvenlik', date: '2026-06-16', startTime: '16:00', endTime: '00:00', location: 'Nizamiye ve Çevre Kontrol' },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'EXP-001', name: 'Bungalov Yatak Takımları ve Çarşaf Değişimi', category: 'Konaklama', amount: 15200, type: 'Değişken', date: '2026-06-16', description: 'Dönem başında tüm odalar için hijyenik çarşaf tedariği.' },
  { id: 'EXP-002', name: 'Bungalov Tesisat ve Klima Bakımları', category: 'Konaklama', amount: 8500, type: 'Sabit', date: '2026-06-15', description: 'Genel elektrik/klima yıllık ve periyodik bakımı.' },
  { id: 'EXP-003', name: 'Odalar Temizlik Malzemeleri', category: 'Konaklama', amount: 4200, type: 'Değişken', date: '2026-06-16', description: 'Oda hijyeni için dezenfektan ve deterjan alımı.' },
  { id: 'EXP-004', name: 'Öğün Yemek İaşesi (Tedarikçi Firma)', category: 'Yemek', amount: 52000, type: 'Değişken', date: '2026-06-18', description: 'Ana öğünler için gıda hammadde alımı.' },
  { id: 'EXP-005', name: 'Günlük Ara Öğün ve Meyve Suyu Tedariği', category: 'Yemek', amount: 9800, type: 'Değişken', date: '2026-06-17', description: 'Katılımcı ikramları ve içecek bütçesi.' },
  { id: 'EXP-006', name: 'Arıtma Su Filtre Değişimleri', category: 'Yemek', amount: 3500, type: 'Sabit', date: '2026-06-15', description: 'Yemekhane sebil filtrelerinin yenilenmesi.' },
  { id: 'EXP-007', name: 'Beykoz-Sarıyer Katılımcı Transfer Servisi', category: 'Ulaşım', amount: 18000, type: 'Değişken', date: '2026-06-15', description: 'Katılımcıların transferini sağlayan otobüs kiralama.' },
  { id: 'EXP-008', name: 'Hizmet Aracı Yakıt Gideri', category: 'Ulaşım', amount: 7200, type: 'Değişken', date: '2026-06-17', description: 'Kamp içi operasyonel araç yakıtı.' },
  { id: 'EXP-009', name: 'Okçuluk ve Doğa Sporları Malzemeleri', category: 'Aktivite', amount: 9000, type: 'Sabit', date: '2026-06-16', description: 'Spor sahası hedef tahtası ve yay alımları.' },
  { id: 'EXP-010', name: 'Turnuva Madalya ve Katılım Sertifikaları', category: 'Aktivite', amount: 4500, type: 'Değişken', date: '2026-06-18', description: 'Final etkinlikleri için ödül setleri.' },
  { id: 'EXP-011', name: 'İdari ve Koordinasyon Personeli Maaşları', category: 'Personel', amount: 45000, type: 'Sabit', date: '2026-06-15', description: 'Dönemlik atanmış personel ve lider hakedişleri.' },
  { id: 'EXP-012', name: 'Gece Güvenlik Ekibi Hakedişi', category: 'Personel', amount: 18000, type: 'Sabit', date: '2026-06-15', description: 'Saha güvenliği gece vardiyası dış hizmet alımı.' },
  { id: 'EXP-013', name: 'Kamp Alanı Elektrik Faturası (Dönemlik)', category: 'Genel Gider', amount: 22000, type: 'Sabit', date: '2026-06-19', description: 'Saha aydınlatmaları ve genel kullanım bedeli.' },
  { id: 'EXP-014', name: 'Atık Yönetim ve Çöp Transfer Vergisi', category: 'Genel Gider', amount: 2500, type: 'Sabit', date: '2026-06-16', description: 'Çevre birimi evsel atık imha harcı.' }
];

export const INITIAL_CAMP_CENTERS: CampCenter[] = [
  { id: 'C01', name: 'Düzce Yaylagöl Uluslararası Kamp Merkezi', city: 'Düzce', capacity: 132 }
];

export const INITIAL_BUNGALOWS: Bungalow[] = [
  // Standard Bungalows (6 pax each, 30 Bungalows)
  { id: 'STD-1', name: 'Sağlıklı Nesil (STD 1)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-2', name: 'Temiz Gelecek (STD 2)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-3', name: 'Bağımsızlık (STD 3)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-4', name: 'Farkındalık (STD 4)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-5', name: 'Benim Kulübüm (STD 5)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-6', name: 'Temiz Nefes (STD 6)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-7', name: 'Zinde Gençlik (STD 7)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-8', name: 'Kardelen (STD 8)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-9', name: 'Ulu Çınar (STD 9)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-10', name: 'Berrak Zihin (STD 10)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-11', name: 'Özgür İrade (STD 11)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-12', name: 'Esenlik (STD 12)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-13', name: 'Umut Baharı (STD 13)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-14', name: 'İyilik Hareketi (STD 14)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-15', name: 'Gönüllü Elçi (STD 15)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-16', name: 'Yaşam Becerileri (STD 16)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-17', name: 'Temiz Sayfa (STD 17)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-18', name: 'Köklü Çınar (STD 18)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-19', name: 'Fidan (STD 19)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-20', name: 'Sağlık Çemberi (STD 20)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-21', name: 'Sağlıklı Yaşam (STD 21)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-22', name: 'Bilge Çınar (STD 22)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-23', name: 'Yeşil Orman (STD 23)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-24', name: 'Doğal İstasyon (STD 24)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-25', name: 'Karakter Okulu (STD 25)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-26', name: 'Akran Savunuculuğu (STD 26)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-27', name: 'Sevgi ve Saygı (STD 27)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-28', name: 'Bilgi Bahçesi (STD 28)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-29', name: 'Kamp Ateşi (STD 29)', type: 'Standart', capacity: 6, campCenterId: 'C01' },
  { id: 'STD-30', name: 'Mavi Gelecek (STD 30)', type: 'Standart', capacity: 6, campCenterId: 'C01' }
];

export const INITIAL_STAFF: Staff[] = [
  { id: 'S01', name: 'Özcan Demir', role: 'Kamp Müdürü', phone: '+90 532 111 22 33', email: 'ahmet.yilmaz@yesilay.org.tr', campCenterId: 'C01', shiftHours: '08:00 - 18:00', isActive: true },
  { id: 'S02', name: 'Özcan Demir', role: 'Kamp Koordinatörü', phone: '+90 533 222 33 44', email: 'canan.ozdemir@yesilay.org.tr', campCenterId: 'C01', shiftHours: '09:00 - 18:00', isActive: true },
  { id: 'S03', name: 'Mahmut ÇELİK', role: 'Eğitmen', phone: '+90 544 333 44 55', email: 'bulent.kaya@yesilay.org.tr', campCenterId: 'C01', shiftHours: '09:00 - 17:00', isActive: true },
  { id: 'S04', name: 'İnan BAYRAMOĞLU', role: 'Grup Lideri', phone: '+90 545 444 55 66', email: 'derya.demir@yesilay.org.tr', campCenterId: 'C01', shiftHours: '08:00 - 20:00', isActive: true },
  { id: 'S05', name: 'isimsiz katılımcı', role: 'Grup Lideri', phone: '+90 535 555 66 77', email: 'emre.sen@yesilay.org.tr', campCenterId: 'C01', shiftHours: '08:00 - 20:00', isActive: true },
  { id: 'S06', name: 'Özcan Demir', role: 'Sağlık Görevlisi', phone: '+90 536 666 77 88', email: 'elif.aslan@yesilay.org.tr', campCenterId: 'C01', shiftHours: '08:00 - 08:00 (24s)', isActive: true },
  { id: 'S07', name: 'Özcan Demir', role: 'Psikolog', phone: '+90 542 777 88 99', email: 'melis.kurt@yesilay.org.tr', campCenterId: 'C01', shiftHours: '09:00 - 17:00', isActive: true },
  { id: 'S08', name: 'Mahmut ÇELİK', role: 'Gönüllü', phone: '+90 555 888 99 00', email: 'serkan.bulut@gmail.com', campCenterId: 'C01', shiftHours: '10:00 - 18:00', isActive: true }
];

export const INITIAL_GROUPS: Group[] = [
  { id: 'G01', campCenterId: 'C01', name: 'Yeşil Hilal Grubu', leaderId: 'S04', color: '#10B981' }, // emerald
  { id: 'G02', campCenterId: 'C01', name: 'Zümrüd-ü Anka Grubu', leaderId: 'S05', color: '#3B82F6' }, // blue
  { id: 'G03', campCenterId: 'C01', name: 'Hilal-i Ahmer Kahramanları', leaderId: 'S08', color: '#EF4444' } // red
];

export const INITIAL_CAMP_PERIODS: CampPeriod[] = [
  { id: 'P01', campCenterId: 'C01', name: '1. Dönem: Teknoloji Bağımlılığı ile Mücadele Kampı', startDate: '2026-06-15', endDate: '2026-06-22', maxQuota: 78, isActive: true, status: 'Aktif' },
  { id: 'P02', campCenterId: 'C01', name: '2. Dönem: Akran Baskısı ve Sağlıklı Yaşam Kampı', startDate: '2026-07-01', endDate: '2026-07-08', maxQuota: 78, isActive: false, status: 'Planlandı' },
  { id: 'P03', campCenterId: 'C01', name: '3. Dönem: Tütün ve Madde Bağımlılığından Korunma', startDate: '2026-07-15', endDate: '2026-07-22', maxQuota: 78, isActive: false, status: 'Planlandı' }
];

const generateDummyParticipants = (count: number): Participant[] => {
  const names = ['Selman UTKU', 'Özcan Demir', 'Mahmut ÇELİK', 'İnan BAYRAMOĞLU', 'isimsiz katılımcı'];
  return Array.from({ length: count }).map((_, i) => {
    const participant: Participant = {
      id: `DUMMY-${i + 1}`,
      name: names[i % names.length],
      identityNumber: `100000${i.toString().padStart(5, '0')}`,
      birthDate: '2010-01-01',
      gender: i % 2 === 0 ? 'Erkek' : 'Kadın',
      category: 'Lise',
      phone: '+90 555 000 00 00',
      email: `test${i + 1}@example.com`,
      status: 'Onaylandı',
      bungalowId: null,
      bedNumber: null,
      allergies: 'Yok',
      chronicDiseases: 'Yok',
      medications: 'Yok',
      healthNote: 'Yok',
      consentReceived: true,
      kvkkSigned: true,
      groupId: null,
      checkedIn: false
    };
    return participant;
  });
};

export const INITIAL_PARTICIPANTS: Participant[] = [
  // Already in Camp (Checked In & assigned to rooms)
  {
    id: 'P000',
    name: 'Selman UTKU',
    identityNumber: '11122233344',
    birthDate: '1995-04-12',
    gender: 'Erkek',
    category: 'Yetişkin',
    phone: '+90 555 555 55 55',
    email: 'selmanutku@gmail.com',
    status: 'Kampta',
    bungalowId: 'STD-2',
    bedNumber: 4,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: 'G01',
    performanceScore: 100,
    checkedIn: true,
    checkInTime: '2026-06-15T09:00:00'
  },
  {
    id: 'P001',
    name: 'Özcan Demir',
    identityNumber: '10293847562',
    birthDate: '2012-05-14',
    gender: 'Erkek',
    category: 'Ortaokul',
    phone: '+90 533 123 45 67',
    email: 'batuhan@gmail.com',
    status: 'Kampta',
    bungalowId: 'STD-2',
    bedNumber: 1,
    allergies: 'Fıstık alerjisi var.',
    chronicDiseases: 'Astım',
    medications: 'Ventolin inhaler (Gerekirse)',
    healthNote: 'Ağır efor gerektiren sporlarda dinlendirilmeli.',
    consentReceived: true,
    kvkkSigned: true,
    groupId: 'G01',
    performanceScore: 88,
    checkedIn: true,
    checkInTime: '2026-06-15T09:12:00'
  },
  {
    id: 'P002',
    name: 'Mahmut ÇELİK',
    identityNumber: '29384756102',
    birthDate: '2016-02-18',
    gender: 'Erkek',
    category: 'İlkokul',
    phone: '+90 542 555 12 34',
    email: 'mustafa@gmail.com',
    status: 'Kampta',
    bungalowId: 'STD-2',
    bedNumber: 2,
    allergies: 'Yok',
    chronicDiseases: 'Belirtilmedi',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: 'G01',
    performanceScore: 92,
    checkedIn: true,
    checkInTime: '2026-06-15T09:24:00'
  },
  {
    id: 'P003',
    name: 'İnan BAYRAMOĞLU',
    identityNumber: '48201938562',
    birthDate: '2012-08-30',
    gender: 'Erkek',
    category: 'Ortaokul',
    phone: '+90 541 333 44 55',
    email: 'ozturk@gmail.com',
    status: 'Kampta',
    bungalowId: 'STD-2',
    bedNumber: 3,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: 'G01',
    checkedIn: true,
    checkInTime: '2026-06-15T10:05:00'
  },
  {
    id: 'P004',
    name: 'isimsiz katılımcı',
    identityNumber: '58291039482',
    birthDate: '2013-11-05',
    gender: 'Kadın',
    category: 'Ortaokul',
    phone: '+90 505 111 22 33',
    email: 'hakan.kaya@gmail.com',
    status: 'Kampta',
    bungalowId: 'STD-1',
    bedNumber: 1,
    allergies: 'Glüten duyarlılığı',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Glütensiz yemek yemeli.',
    consentReceived: true,
    kvkkSigned: true,
    groupId: 'G02',
    performanceScore: 95,
    checkedIn: true,
    checkInTime: '2026-06-15T09:15:00'
  },
  {
    id: 'P005',
    name: 'Selman UTKU',
    identityNumber: '11223344556',
    birthDate: '2012-12-12',
    gender: 'Kadın',
    category: 'Ortaokul',
    phone: '+90 506 222 33 44',
    email: 'ayse.y@outlook.com',
    status: 'Kampta',
    bungalowId: 'STD-1',
    bedNumber: 2,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: 'G02',
    checkedIn: true,
    checkInTime: '2026-06-15T09:30:00'
  },
  {
    id: 'P006',
    name: 'Özcan Demir',
    identityNumber: '22334455667',
    birthDate: '2013-04-15',
    gender: 'Kadın',
    category: 'Ortaokul',
    phone: '+90 507 333 44 55',
    email: 'kadir@gmail.com',
    status: 'Kampta',
    bungalowId: 'STD-1',
    bedNumber: 3,
    allergies: 'Çilek Alerjisi',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Çilek verilmemeli.',
    consentReceived: true,
    kvkkSigned: true,
    groupId: 'G02',
    checkedIn: true,
    checkInTime: '2026-06-15T09:45:00'
  },
  
  // Onaylandı - Bungalow Ataması bekleyenler (Automated assignment demo can use these!)
  {
    id: 'P007',
    name: 'Mahmut ÇELİK',
    identityNumber: '33445566778',
    birthDate: '2008-01-20',
    gender: 'Erkek',
    category: 'Lise',
    phone: '+90 531 444 55 66',
    email: 'suat.k@gmail.com',
    status: 'Onaylandı',
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P008',
    name: 'İnan BAYRAMOĞLU',
    identityNumber: '44556677889',
    birthDate: '2009-09-09',
    gender: 'Erkek',
    category: 'Lise',
    phone: '+90 532 555 66 77',
    email: 'melek@hotmail.com',
    status: 'Onaylandı',
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P009',
    name: 'isimsiz katılımcı',
    identityNumber: '55667788990',
    birthDate: '2005-06-30',
    gender: 'Kadın',
    category: 'Üniversite',
    phone: '+90 533 666 77 88',
    email: 'murat.cetin@gmail.com',
    status: 'Onaylandı',
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P010',
    name: 'Selman UTKU',
    identityNumber: '66778899001',
    birthDate: '2006-03-24',
    gender: 'Kadın',
    category: 'Üniversite',
    phone: '+90 534 777 88 99',
    email: 'leyla.yildiz@gmail.com',
    status: 'Onaylandı',
    bungalowId: null,
    bedNumber: null,
    allergies: 'Toz alerjisi',
    chronicDiseases: 'Alerjik Astım',
    medications: 'Antihistaminik hap',
    healthNote: 'Tozlu ortamlarda bulunmamalı.',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  
  // Başvuru yapılmış olanlar (Pending review)
  {
    id: 'P011',
    name: 'Özcan Demir',
    identityNumber: '77889900112',
    birthDate: '1988-07-15',
    gender: 'Erkek',
    category: 'Kafile Sorumlusu',
    phone: '+90 535 888 99 00',
    email: 'faruk.aksoy@gmail.com',
    status: 'Başvuru Yapıldı',
    bungalowId: null,
    bedNumber: null,
    allergies: 'Arı Sokması Alerjisi',
    chronicDiseases: 'Belirtilmedi',
    medications: 'Acil durum adrenalin oto-enjektörü var.',
    healthNote: 'Arı sokmalarına karşı aşırı hassas, yanındaki enjektör taşınmalı.',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P012',
    name: 'Mahmut ÇELİK',
    identityNumber: '88990011223',
    birthDate: '1990-10-10',
    gender: 'Kadın',
    category: 'Şoför',
    phone: '+90 536 999 00 11',
    email: 'sibel.ozer@gmail.com',
    status: 'Başvuru Yapıldı',
    bungalowId: null,
    bedNumber: null,
    allergies: 'Laktoz intoleransı',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Süt ve süt ürünlerinden kaçınmalı veya laktozsuz tüketmeli.',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  
  // Temsili Kafile Başvurusu (İstanbul Pendik Genç Yeşilay Kafilesi - 1 Lider, 15 Katılımcı)
  {
    id: 'P100',
    name: 'İnan BAYRAMOĞLU',
    identityNumber: '30192837465',
    birthDate: '1985-05-15',
    gender: 'Erkek',
    category: 'Kafile Sorumlusu',
    phone: '+90 535 111 22 33',
    email: 'zeki.karahan@yesilaypendik.org',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    isConvoyLeader: true,
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Sorumlu lider.',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P101',
    name: 'isimsiz katılımcı',
    identityNumber: '10928374651',
    birthDate: '2009-04-12',
    gender: 'Erkek',
    category: 'Lise',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Polen Alerjisi',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P102',
    name: 'Selman UTKU',
    identityNumber: '21092837465',
    birthDate: '2008-11-20',
    gender: 'Erkek',
    category: 'Lise',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P103',
    name: 'Özcan Demir',
    identityNumber: '32109283746',
    birthDate: '2009-08-05',
    gender: 'Erkek',
    category: 'Lise',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Çilek Alerjisi',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P104',
    name: 'Mahmut ÇELİK',
    identityNumber: '43210928374',
    birthDate: '2008-03-15',
    gender: 'Erkek',
    category: 'Lise',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Astım',
    medications: 'Fısfıs (Gerektiğinde)',
    healthNote: 'Astım hastası, yorucu aktivitelerde dikkat edilmeli.',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P105',
    name: 'İnan BAYRAMOĞLU',
    identityNumber: '54321092837',
    birthDate: '2009-01-22',
    gender: 'Erkek',
    category: 'Lise',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P106',
    name: 'isimsiz katılımcı',
    identityNumber: '65432109283',
    birthDate: '2011-05-30',
    gender: 'Erkek',
    category: 'Ortaokul',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P107',
    name: 'Selman UTKU',
    identityNumber: '76543210928',
    birthDate: '2011-09-18',
    gender: 'Erkek',
    category: 'Ortaokul',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Fındık Alerjisi',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Fındık yememeli.',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P108',
    name: 'Özcan Demir',
    identityNumber: '87654321092',
    birthDate: '2008-07-04',
    gender: 'Erkek',
    category: 'Lise',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P109',
    name: 'Mahmut ÇELİK',
    identityNumber: '98765432109',
    birthDate: '2009-02-14',
    gender: 'Kadın',
    category: 'Lise',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P110',
    name: 'İnan BAYRAMOĞLU',
    identityNumber: '19876543210',
    birthDate: '2009-06-25',
    gender: 'Kadın',
    category: 'Lise',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Arı Alerjisi',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Arılara karşı hassas.',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P111',
    name: 'isimsiz katılımcı',
    identityNumber: '20987654321',
    birthDate: '2008-10-05',
    gender: 'Kadın',
    category: 'Lise',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P112',
    name: 'Selman UTKU',
    identityNumber: '31098765432',
    birthDate: '2009-09-12',
    gender: 'Kadın',
    category: 'Lise',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Gluten Hassasiyeti',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Glutensiz ürünler tercih ediyor.',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P113',
    name: 'Özcan Demir',
    identityNumber: '42109876543',
    birthDate: '2011-03-08',
    gender: 'Kadın',
    category: 'Ortaokul',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P114',
    name: 'Mahmut ÇELİK',
    identityNumber: '53210987654',
    birthDate: '2011-07-19',
    gender: 'Kadın',
    category: 'Ortaokul',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  },
  {
    id: 'P115',
    name: 'İnan BAYRAMOĞLU',
    identityNumber: '64321098765',
    birthDate: '2008-12-01',
    gender: 'Kadın',
    category: 'Lise',
    status: 'Başvuru Yapıldı',
    address: 'Pendik Yeşilay Şubesi Merkez Ofisi',
    city: 'İstanbul',
    district: 'Pendik',
    campPeriodId: 'P01',
    convoyName: 'İstanbul Pendik Genç Yeşilay Kafilesi',
    convoyLeaderId: 'P100',
    autoAllocate: true,
    bungalowId: null,
    bedNumber: null,
    allergies: 'Yok',
    chronicDiseases: 'Yok',
    medications: 'Yok',
    healthNote: 'Yok',
    consentReceived: true,
    kvkkSigned: true,
    groupId: null,
    checkedIn: false
  }
];

const generated = generateDummyParticipants(100);
export const INITIAL_PARTICIPANTS_COMBINED: Participant[] = [...INITIAL_PARTICIPANTS, ...generated];

export const INITIAL_HEALTH_INCIDENTS: HealthIncident[] = [
  {
    id: 'H01',
    participantId: 'P001',
    staffId: 'S06',
    dateTime: '2026-06-16T14:30:00',
    complaint: 'Güneş altında fazla kalma sonucu hafif baş ağrısı ve halsizlik.',
    treatment: 'Ateş ölçümü yapıldı (36.8°C). Soğuk kompres uygulandı, bol sıvı alması sağlandı ve 2 saat revirde dinlendirildi.',
    status: 'Kontrol Altında'
  },
  {
    id: 'H02',
    participantId: 'P004',
    staffId: 'S06',
    dateTime: '2026-06-17T11:00:00',
    complaint: 'Voleybol maçı esnasında sağ ayak bileğinde hafif burkulma ve ağrı.',
    treatment: 'Buz tedavisi (RICE protokolü) uygulandı. Merhem sürüldü, elastik bandaj ile sabitleme yapıldı. İstirahat önerildi.',
    status: 'Müşahade'
  }
];

export const INITIAL_MEAL_PLANS: MealPlan[] = [
  {
    id: 'M01',
    date: '2026-06-18',
    mealType: 'Kahvaltı',
    menu: ['Yeşil Zeytin / Siyah Zeytin', 'Beyaz Peynir / Kaşar Peynir', 'Haşlanmış Yumurta', 'Yeşilay Bitki Çayı', 'Tereyağ ve Bal'],
    vegetarianCount: 2,
    glutenFreeCount: 1
  },
  {
    id: 'M02',
    date: '2026-06-18',
    mealType: 'Öğle Yemeği',
    menu: ['Mercimek Çorbası', 'Tavuk Sote', 'Sade Pirinç Pilavı', 'Mevsim Salatası', 'Ayran / Meyve'],
    vegetarianCount: 2,
    glutenFreeCount: 1
  },
  {
    id: 'M03',
    date: '2026-06-18',
    mealType: 'Akşam Yemeği',
    menu: ['Yayla Çorbası', 'Zeytinyağlı Kuru Fasulye', 'Bulgur Pilavı', 'Cacık', 'Kemalpaşa Tatlısı'],
    vegetarianCount: 3,
    glutenFreeCount: 1
  }
];

export const INITIAL_ACTIVITIES: CampActivity[] = [
  { id: 'A01', campCenterId: 'C01', title: 'Sabah Sporu ve Isınma Hareketleri', type: 'Spor', dateTime: '2026-06-18T07:30:00', instructorId: 'S04', location: 'Merkez Spor Sahası' },
  { id: 'A02', campCenterId: 'C01', title: 'Teknolojisiz Yaşam ve Bilinçli Medya Atölyesi', type: 'Eğitim', dateTime: '2026-06-18T10:00:00', instructorId: 'S03', location: 'Açık Hava Çardak Atölyeleri' },
  { id: 'A03', campCenterId: 'C01', title: 'Doğa Yürüyüşü ve Çevre Temizliği Bilinci', type: 'Spor', dateTime: '2026-06-18T14:30:00', instructorId: 'S05', location: 'Beykoz Orman Parkuru' },
  { id: 'A04', campCenterId: 'C01', title: 'Sağlıklı Yaşam ve Akran Zorbalığı Semineri', type: 'Seminer', dateTime: '2026-06-18T16:30:00', instructorId: 'S07', location: 'Konferans Salonu' },
  { id: 'A05', campCenterId: 'C01', title: 'Geleneksel Sokak Oyunları ve Kamp Ateşi', type: 'Eğlence', dateTime: '2026-06-18T20:30:00', instructorId: 'S08', location: 'Kamp Ateşi Alanı' }
];

import { CampIncident } from './types';

export const INITIAL_INCIDENTS: CampIncident[] = [
  {
    id: 'INC-001',
    type: 'disiplin',
    reporterId: 'S01',
    reporterName: 'İnan BAYRAMOĞLU',
    dateTime: '2026-06-16T15:30:00',
    title: 'Kurallara Uymama',
    description: 'Etkinlik saatinde kamp alanından izinsiz ayrılma girişimi.',
    relatedParticipantId: 'P03',
    actionTaken: 'Sözlü uyarı yapıldı.',
    status: 'Çözüldü'
  },
  {
    id: 'INC-002',
    type: 'guvenlik',
    reporterId: 'S11',
    reporterName: 'Ahmet Güvenlik',
    dateTime: '2026-06-17T22:15:00',
    title: 'Çevre Çit Kontrolü',
    description: 'Kuzey cephesindeki çitlerde hasar tespit edildi.',
    actionTaken: 'Geçici önlem alındı, onarım talebi açıldı.',
    status: 'Açık'
  }
];

export const INITIAL_LOGS: SystemLog[] = [
  { id: 'L01', userId: 'S01', userName: 'Ahmet Yılmaz', userRole: 'Kamp Müdürü', action: 'Kayıt Kabul Onayı', timestamp: '2026-06-15T09:15:00', details: 'Batuhan Kara için evraklar kontrol edildi ve Kampta durumuna güncellendi.' },
  { id: 'L02', userId: 'S02', userName: 'Canan Özdemir', userRole: 'Kamp Koordinatörü', action: 'Bungalov Ataması', timestamp: '2026-06-15T10:20:00', details: 'Yiğit Şahin STD-2 nolu Bungalov, 2 nolu yatağa yerleştirildi.' },
  { id: 'L03', userId: 'S06', userName: 'Elif Aslan', userRole: 'Sağlık Görevlisi', action: 'Sağlık Müdahalesi Kaydı', timestamp: '2026-06-16T14:35:00', details: 'Batuhan Kara için baş ağrısı şikayeti ile ilgili tedavi kartı oluşturuldu.' },
  { id: 'L04', userId: 'S01', userName: 'Ahmet Yılmaz', userRole: 'Kamp Müdürü', action: 'Dönem Aktivasyonu', timestamp: '2026-06-14T10:00:00', details: '1. Dönem Teknoloji Bağımlılığı Kampı aktif hale getirildi.' }
];

export const INITIAL_SURVEYS: SurveyResponse[] = [
  { id: 'SU01', participantId: 'P001', campPeriodId: 'P01', ratingMeals: 5, ratingActivities: 4, ratingBungalows: 5, ratingTrainers: 5, generalComment: 'Kamp liderlerimiz harika, çok eğleniyoruz ve telefonu hiç aramadım!' },
  { id: 'SU02', participantId: 'P004', campPeriodId: 'P01', ratingMeals: 4, ratingActivities: 5, ratingBungalows: 4, ratingTrainers: 5, generalComment: 'Glütensiz yemek seçeneği sunulması çok ince bir davranıştı, her şey için teşekkürler.' }
];

export const INITIAL_TECHNICAL_ISSUES: TechnicalIssue[] = [
  {
    id: 'AR-2026-0001',
    dateTime: '2026-06-18T08:30:00',
    reporter: 'Emre Şen',
    location: 'Bungalov STD-5',
    category: 'Su / Tesisat',
    description: 'Banyoda sıcak su gelmiyor, termosifon vanası sızdırıyor.',
    priority: 'Yüksek',
    assignedTo: 'Teknik Departman (Murat Usta)',
    status: 'İşleme Alındı',
    statusHistory: [
      { status: 'Yeni Kayıt', timestamp: '2026-06-18T08:30:00', updatedBy: 'Emre Şen' },
      { status: 'İnceleniyor', timestamp: '2026-06-18T09:15:00', updatedBy: 'Canan Özdemir' },
      { status: 'İşleme Alındı', timestamp: '2026-06-18T10:00:00', updatedBy: 'Murat Usta' }
    ],
    actionLogs: [
      {
        id: 'AL-001',
        action: 'İlk İnceleme ve Vana Sıkma',
        partsReplaced: 'Yarım parmak pirinç vana',
        notes: 'Sızıntı geçici olarak durduruldu fakat conta tamamen aşınmış. Yeni vana takıldı.',
        cost: 150,
        creator: 'Murat Usta',
        date: '2026-06-18T10:15:00'
      }
    ],
    campCenterId: 'C01'
  },
  {
    id: 'AR-2026-0002',
    dateTime: '2026-06-18T09:45:00',
    reporter: 'Hemşire Elif Aslan',
    location: 'Revir Binası',
    category: 'İnternet / IT',
    description: 'Revirdeki masaüstü bilgisayar Yeşilay KYS ağına bağlanamıyor. IP adresi alınamadı hatası var.',
    priority: 'Kritik',
    assignedTo: 'IT Ekibi (Serhat Bey)',
    status: 'Çözüldü',
    statusHistory: [
      { status: 'Yeni Kayıt', timestamp: '2026-06-18T09:45:00', updatedBy: 'Elif Aslan' },
      { status: 'İşleme Alındı', timestamp: '2026-06-18T10:05:00', updatedBy: 'Serhat Bey' },
      { status: 'Çözüldü', timestamp: '2026-06-18T10:30:00', updatedBy: 'Serhat Bey' }
    ],
    actionLogs: [
      {
        id: 'AL-002',
        action: 'RJ45 Konnektör Yenileme & DHCP Reset',
        partsReplaced: 'CAT6 Konnektör (1 adet)',
        notes: 'Saha switch odasından revir hattı test edildi, kablo ucundaki konnektör oksitlenmişti. Yenisi çakıldı ve internet bağlantısı sağlandı.',
        cost: 20,
        creator: 'Serhat Bey',
        date: '2026-06-18T10:30:00'
      }
    ],
    campCenterId: 'C01'
  },
  {
    id: 'AR-2026-0003',
    dateTime: '2026-06-18T11:15:00',
    reporter: 'Bülent Kaya',
    location: 'Konferans Salonu',
    category: 'Elektrik',
    description: 'Projeksiyon cihazının lambası çalışmıyor, sunumlar yapılamıyor.',
    priority: 'Yüksek',
    assignedTo: 'Teknik Departman (Murat Usta)',
    status: 'Çözüldü',
    statusHistory: [
      { status: 'Yeni Kayıt', timestamp: '2026-06-18T11:15:00', updatedBy: 'Bülent Kaya' },
      { status: 'İşleme Alındı', timestamp: '2026-06-18T14:00:00', updatedBy: 'Murat Usta' },
      { status: 'Çözüldü', timestamp: '2026-06-18T16:30:00', updatedBy: 'Murat Usta' }
    ],
    actionLogs: [
      {
        id: 'AL-003',
        action: 'Projeksiyon Lamba Değişimi',
        partsReplaced: 'Epson ELPLP96 Orijinal Lamba',
        notes: 'Cihaz sökülerek mercek ve lamba yuvası temizlendi. Yeni lamba montajı yapıldı, parlaklık test edildi.',
        cost: 3200,
        creator: 'Murat Usta',
        date: '2026-06-18T16:30:00'
      }
    ],
    campCenterId: 'C01'
  },
  {
    id: 'AR-2026-0004',
    dateTime: '2026-06-18T05:20:00',
    reporter: 'Derya Demir',
    location: 'Göl Kenarı İskelesi & Çevre Çiti',
    category: 'Su / Tesisat',
    description: 'İskele korkuluklarında kırılma var ve kıyı su pompası filtresi tıkanmış.',
    priority: 'Orta',
    assignedTo: 'Teknik Departman (Ahmet Usta)',
    status: 'Çözüldü',
    statusHistory: [
      { status: 'Yeni Kayıt', timestamp: '2026-06-18T05:20:00', updatedBy: 'Derya Demir' },
      { status: 'İşleme Alındı', timestamp: '2026-06-18T09:00:00', updatedBy: 'Ahmet Usta' },
      { status: 'Çözüldü', timestamp: '2026-06-18T11:30:00', updatedBy: 'Ahmet Usta' }
    ],
    actionLogs: [
      {
        id: 'AL-004',
        action: 'İskele Ahşap Korkuluk Onarımı & Pompa Temizliği',
        partsReplaced: 'Emprenyeli Çam Kereste (2m), 1-1/2 Süzgeç',
        notes: 'Kırılan korkuluk parçaları değiştirilip boyandı. Tıkanan gölet su pompası filtresi temizlendi ve çalıştırıldı.',
        cost: 650,
        creator: 'Ahmet Usta',
        date: '2026-06-18T11:30:00'
      }
    ],
    campCenterId: 'C01'
  },
  {
    id: 'AR-2026-0005',
    dateTime: '2026-06-19T09:15:00',
    reporter: 'Seda Korkmaz',
    location: 'Yemekhane / Mutfak',
    category: 'Su / Tesisat',
    description: 'Yemekhane ana sebil filtresi ömrünü tamamladı, su akışı çok zayıfladı.',
    priority: 'Yüksek',
    assignedTo: 'Teknik Departman (Murat Usta)',
    status: 'Çözüldü',
    statusHistory: [
      { status: 'Yeni Kayıt', timestamp: '2026-06-19T09:15:00', updatedBy: 'Seda Korkmaz' },
      { status: 'İşleme Alındı', timestamp: '2026-06-19T10:00:00', updatedBy: 'Murat Usta' },
      { status: 'Çözüldü', timestamp: '2026-06-19T11:45:00', updatedBy: 'Murat Usta' }
    ],
    actionLogs: [
      {
        id: 'AL-005',
        action: 'Sebil Filtre Kartuş Değişimi',
        partsReplaced: 'Karbon ve Membran Filtre Seti (3lü)',
        notes: 'Sebilin 3lü filtre seti yenilendi, dezenfeksiyonu yapıldı. Su tazyiki ve tadı normale döndü.',
        cost: 850,
        creator: 'Murat Usta',
        date: '2026-06-19T11:45:00'
      }
    ],
    campCenterId: 'C01'
  },
  {
    id: 'AR-2026-0006',
    dateTime: '2026-06-19T14:30:00',
    reporter: 'Beden Eğitimi Lideri Hakan',
    location: 'Spor Tesisleri (Basketbol & Futbol)',
    category: 'Mobilya / Donanım',
    description: 'Basketbol potası filesi yırtılmış, halı saha kale filesi gevşemiş.',
    priority: 'Düşük',
    assignedTo: 'Saha Personeli',
    status: 'Çözüldü',
    statusHistory: [
      { status: 'Yeni Kayıt', timestamp: '2026-06-19T14:30:00', updatedBy: 'Hakan' },
      { status: 'İşleme Alındı', timestamp: '2026-06-19T15:00:00', updatedBy: 'Saha Personeli' },
      { status: 'Çözüldü', timestamp: '2026-06-19T16:00:00', updatedBy: 'Saha Personeli' }
    ],
    actionLogs: [
      {
        id: 'AL-006',
        action: 'Potası ve Kale Filesi Değişimi',
        partsReplaced: 'Dokuma zincirli pota filesi, polyamid kale filesi',
        notes: 'Yırtılan ve sarkan fileler tamamen sökülerek mukavemetli dış saha fileleri ile değiştirildi.',
        cost: 350,
        creator: 'Saha Personeli',
        date: '2026-06-19T16:00:00'
      }
    ],
    campCenterId: 'C01'
  },
  {
    id: 'AR-2026-0007',
    dateTime: '2026-06-20T11:00:00',
    reporter: 'Canan Özdemir',
    location: 'Bungalov STD-12',
    category: 'Mobilya / Donanım',
    description: 'Bungalov giriş kapısının bareli sıkışıyor, anahtar zor dönüyor.',
    priority: 'Orta',
    assignedTo: 'Teknik Departman (Murat Usta)',
    status: 'Çözüldü',
    statusHistory: [
      { status: 'Yeni Kayıt', timestamp: '2026-06-20T11:00:00', updatedBy: 'Canan Özdemir' },
      { status: 'İşleme Alındı', timestamp: '2026-06-20T13:00:00', updatedBy: 'Murat Usta' },
      { status: 'Çözüldü', timestamp: '2026-06-20T13:30:00', updatedBy: 'Murat Usta' }
    ],
    actionLogs: [
      {
        id: 'AL-007',
        action: 'Bareli Değişimi & Kilit Yağlama',
        partsReplaced: 'Kale Bilyalı Silindir Barel',
        notes: 'Arızalı kilit silindiri söküldü, yeni bilyalı barel takılarak 3 adet yedek anahtarı grup liderine teslim edildi.',
        cost: 280,
        creator: 'Murat Usta',
        date: '2026-06-20T13:30:00'
      }
    ],
    campCenterId: 'C01'
  },
  {
    id: 'AR-2026-0008',
    dateTime: '2026-06-21T10:15:00',
    reporter: 'Grup Lideri Fatih',
    location: 'Bungalov STD-3',
    category: 'Elektrik',
    description: 'Tavan aydınlatması pırpır ediyor ve lamba duyu aşırı ısınıyor.',
    priority: 'Düşük',
    assignedTo: 'Teknik Departman (Ahmet Usta)',
    status: 'Çözüldü',
    statusHistory: [
      { status: 'Yeni Kayıt', timestamp: '2026-06-21T10:15:00', updatedBy: 'Fatih' },
      { status: 'İşleme Alındı', timestamp: '2026-06-21T11:00:00', updatedBy: 'Ahmet Usta' },
      { status: 'Çözüldü', timestamp: '2026-06-21T11:45:00', updatedBy: 'Ahmet Usta' }
    ],
    actionLogs: [
      {
        id: 'AL-008',
        action: 'Tavan LED Panel & Duy Değişimi',
        partsReplaced: 'E27 Porselen Duy & 15W Philips LED Ampul',
        notes: 'Hasarlı plastik duy sökülerek ısıya dayanıklı porselen duyla değiştirildi. LED ampul yenilendi.',
        cost: 180,
        creator: 'Ahmet Usta',
        date: '2026-06-21T11:45:00'
      }
    ],
    campCenterId: 'C01'
  },
  {
    id: 'AR-2026-0009',
    dateTime: '2026-06-21T19:30:00',
    reporter: 'Saha Personeli Kemal',
    location: 'Spor Tesisleri Halı Saha',
    category: 'Elektrik',
    description: 'Gece maçları için 2 nolu aydınlatma direğindeki ana projektör patlamış.',
    priority: 'Yüksek',
    assignedTo: 'Teknik Departman (Ahmet Usta)',
    status: 'Çözüldü',
    statusHistory: [
      { status: 'Yeni Kayıt', timestamp: '2026-06-21T19:30:00', updatedBy: 'Kemal' },
      { status: 'İşleme Alındı', timestamp: '2026-06-22T09:00:00', updatedBy: 'Ahmet Usta' },
      { status: 'Çözüldü', timestamp: '2026-06-22T10:30:00', updatedBy: 'Ahmet Usta' }
    ],
    actionLogs: [
      {
        id: 'AL-009',
        action: '400W Halojen Projektör Değişimi',
        partsReplaced: '400W Osram Halojen Projektör Ampulü ve Balast',
        notes: 'Sepetli vinç yardımıyla direğe çıkıldı. Patlayan ampul ve arızalı balast kiti yenisi ile değiştirildi. Test edildi, çalışıyor.',
        cost: 1450,
        creator: 'Ahmet Usta',
        date: '2026-06-22T10:30:00'
      }
    ],
    campCenterId: 'C01'
  },
  {
    id: 'AR-2026-0010',
    dateTime: '2026-06-22T08:00:00',
    reporter: 'Mutfak Şefi Ahmet Bey',
    location: 'Yemekhane / Mutfak',
    category: 'Mobilya / Donanım',
    description: 'Endüstriyel bulaşık makinesinin kapak menteşesi gevşemiş ve yıkama esnasında su sızdırıyor.',
    priority: 'Yüksek',
    assignedTo: 'Teknik Departman (Murat Usta)',
    status: 'Çözüldü',
    statusHistory: [
      { status: 'Yeni Kayıt', timestamp: '2026-06-22T08:00:00', updatedBy: 'Ahmet Bey' },
      { status: 'İşleme Alındı', timestamp: '2026-06-22T13:00:00', updatedBy: 'Murat Usta' },
      { status: 'Çözüldü', timestamp: '2026-06-22T14:45:00', updatedBy: 'Murat Usta' }
    ],
    actionLogs: [
      {
        id: 'AL-010',
        action: 'Mutfak Bulaşık Makinesi Conta & Menteşe Onarımı',
        partsReplaced: 'EPDM Kapak Contası (Özel Boy) & Paslanmaz Çelik Menteşe Takımı',
        notes: 'Aşınmış kapak contası söküldü. Menteşe civataları sıkıştırılıp ayarlandı, yeni conta takılarak sızdırmazlık sağlandı.',
        cost: 920,
        creator: 'Murat Usta',
        date: '2026-06-22T14:45:00'
      }
    ],
    campCenterId: 'C01'
  },
  {
    id: 'AR-2026-0011',
    dateTime: '2026-06-22T15:20:00',
    reporter: 'Cankurtaran Serkan',
    location: 'Göl Kenarı İskelesi',
    category: 'Mobilya / Donanım',
    description: 'Nöbetçi cankurtaran kulesinin ahşap basamakları gevşemiş, çıkarken sallanıyor ve tehlike arz ediyor.',
    priority: 'Kritik',
    assignedTo: 'Teknik Departman (Ahmet Usta)',
    status: 'Çözüldü',
    statusHistory: [
      { status: 'Yeni Kayıt', timestamp: '2026-06-22T15:20:00', updatedBy: 'Serkan' },
      { status: 'İşleme Alındı', timestamp: '2026-06-23T09:00:00', updatedBy: 'Ahmet Usta' },
      { status: 'Çözüldü', timestamp: '2026-06-23T10:15:00', updatedBy: 'Ahmet Usta' }
    ],
    actionLogs: [
      {
        id: 'AL-011',
        action: 'Cankurtaran Kulesi Basamak Güçlendirmesi',
        partsReplaced: 'Paslanmaz M8 civata (12 adet), Marin L-Profil Çelik (2 adet)',
        notes: 'Çürüyen ahşap alt destekler yerine marin sınıfı paslanmaz L-profil montajı yapıldı. Civatalar kilitli somunla sıkılandı.',
        cost: 450,
        creator: 'Ahmet Usta',
        date: '2026-06-23T10:15:00'
      }
    ],
    campCenterId: 'C01'
  },
  {
    id: 'AR-2026-0012',
    dateTime: '2026-06-23T09:30:00',
    reporter: 'Eğitim Lideri Seda',
    location: 'Konferans Salonu amfisi',
    category: 'İnternet / IT',
    description: 'UHF telsiz mikrofon alıcısının adaptörü aşırı ısınıp bozuldu, hoparlörlerden parazit sesi geliyor.',
    priority: 'Orta',
    assignedTo: 'Teknik Departman (Murat Usta)',
    status: 'Çözüldü',
    statusHistory: [
      { status: 'Yeni Kayıt', timestamp: '2026-06-23T09:30:00', updatedBy: 'Seda' },
      { status: 'İşleme Alındı', timestamp: '2026-06-23T10:00:00', updatedBy: 'Murat Usta' },
      { status: 'Çözüldü', timestamp: '2026-06-23T10:30:00', updatedBy: 'Murat Usta' }
    ],
    actionLogs: [
      {
        id: 'AL-012',
        action: 'UHF Kablosuz Alıcı Güç Kaynağı Değişimi',
        partsReplaced: '12V 2A Regüleli Parazit Filtreli Güç Adaptörü',
        notes: 'Arızalı adaptör test edildi, voltaj dalgalanması yaptığı görüldü. Parazit filtreli yüksek kaliteli adaptör takılarak ses kalitesi düzeltildi.',
        cost: 300,
        creator: 'Murat Usta',
        date: '2026-06-23T10:30:00'
      }
    ],
    campCenterId: 'C01'
  },
  {
    id: 'AR-2026-0013',
    dateTime: '2026-06-24T08:45:00',
    reporter: 'Nöbetçi Güvenlik Ali',
    location: 'İdari Bina & Kamp Giriş Turnikeleri',
    category: 'Elektrik',
    description: 'Katılımcı giriş turnikesindeki Mifare kart okuyucu modül bazen kartları algılamıyor ve yığılmaya sebep oluyor.',
    priority: 'Orta',
    assignedTo: 'IT Ekibi (Serhat Bey)',
    status: 'Çözüldü',
    statusHistory: [
      { status: 'Yeni Kayıt', timestamp: '2026-06-24T08:45:00', updatedBy: 'Ali' },
      { status: 'İşleme Alındı', timestamp: '2026-06-24T11:00:00', updatedBy: 'Serhat Bey' },
      { status: 'Çözüldü', timestamp: '2026-06-24T12:00:00', updatedBy: 'Serhat Bey' }
    ],
    actionLogs: [
      {
        id: 'AL-013',
        action: 'Giriş Turnikesi Mifare Kart Okuyucu Değişimi',
        partsReplaced: '13.56MHz Mifare Wiegand Okuyucu Panel',
        notes: 'Turnike içi söküldü, gevşeyen data kabloları sıkılandı ve ömrünü tamamlamış olan temassız okuyucu modül yenisiyle değiştirilerek test edildi.',
        cost: 1150,
        creator: 'Serhat Bey',
        date: '2026-06-24T12:00:00'
      }
    ],
    campCenterId: 'C01'
  }
];

export const INITIAL_SUPPLY_REQUESTS: SupplyRequest[] = [
  {
    id: 'TL-2026-0001',
    requester: 'Hemşire Elif Aslan',
    department: 'Sağlık / Revir',
    title: 'Acil İlkyardım Sarf Malzemesi Tedariği',
    details: 'Spunç, rulo sargı bezi, steril eldiven ve alkollü mendil stokları kritik düzeydedir.',
    quantity: 50,
    priority: 'Kritik',
    neededDate: '2026-06-20',
    status: 'Satın Alma Sürecinde',
    campCenterId: 'C01'
  },
  {
    id: 'TL-2026-0002',
    requester: 'Canan Özdemir',
    department: 'Koordinasyon',
    title: 'Açık Hava Etkinlikleri İçin Megafon',
    details: 'Sabah içtimalarında ve orman yürüyüşlerinde ses kontrolü için 1 adet şarj edilebilir el megafonu.',
    quantity: 1,
    priority: 'Orta',
    neededDate: '2026-06-25',
    status: 'Yönetici Onayında',
    campCenterId: 'C01'
  },
  {
    id: 'TL-2026-0003',
    requester: 'Bülent Kaya',
    department: 'Eğitim',
    title: 'Atölyeler İçin Akrilik Boya ve Fırça Seti',
    details: 'Sanat ve el becerileri atölyesinde kullanılmak üzere 12 renkli büyük boy akrilik boyalar.',
    quantity: 15,
    priority: 'Düşük',
    neededDate: '2026-06-30',
    status: 'Tedarik Edildi',
    campCenterId: 'C01'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'INV-001', name: 'Domates', category: 'Sebze/Meyve', unit: 'kg', quantity: 45, minThreshold: 20, lastUpdated: '2026-06-19' },
  { id: 'INV-002', name: 'Ayçiçek Yağı', category: 'Kuru Gıda', unit: 'L', quantity: 15, minThreshold: 10, lastUpdated: '2026-06-18' },
  { id: 'INV-003', name: 'Kuru Fasulye', category: 'Kuru Gıda', unit: 'kg', quantity: 25, minThreshold: 15, lastUpdated: '2026-06-15' },
  { id: 'INV-004', name: 'Tavuk Göğsü', category: 'Et/Tavuk', unit: 'kg', quantity: 30, minThreshold: 15, lastUpdated: '2026-06-20' },
  { id: 'INV-005', name: 'Süt', category: 'Süt Ürünleri', unit: 'L', quantity: 40, minThreshold: 20, lastUpdated: '2026-06-20' },
  { id: 'INV-006', name: 'Glutensiz Ekmek', category: 'Kuru Gıda', unit: 'Paket', quantity: 10, minThreshold: 5, lastUpdated: '2026-06-19' },
];

export const INITIAL_WEEKLY_MENU: DailyMenu[] = [
  {
    date: '2026-06-21',
    breakfast: [
      { name: 'Haşlanmış Yumurta', nutritionalInfo: { calories: 78, protein: 6, carbs: 1, fat: 5 }, allergens: ['Yumurta'], isVegan: false },
      { name: 'Beyaz Peynir', nutritionalInfo: { calories: 90, protein: 5, carbs: 1, fat: 7 }, allergens: ['Süt'], isVegan: false },
      { name: 'Domates & Salatalık', nutritionalInfo: { calories: 20, protein: 1, carbs: 4, fat: 0 }, allergens: [], isVegan: true },
    ],
    lunch: [
      { name: 'Mercimek Çorbası', nutritionalInfo: { calories: 150, protein: 8, carbs: 22, fat: 3 }, allergens: ['Gluten'], isVegan: true },
      { name: 'Tavuk Sote', nutritionalInfo: { calories: 250, protein: 25, carbs: 5, fat: 12 }, allergens: [], isVegan: false },
      { name: 'Bulgur Pilavı', nutritionalInfo: { calories: 180, protein: 5, carbs: 35, fat: 2 }, allergens: ['Gluten'], isVegan: true },
    ],
    dinner: [
      { name: 'Etli Kuru Fasulye', nutritionalInfo: { calories: 280, protein: 18, carbs: 30, fat: 10 }, allergens: [], isVegan: false },
      { name: 'Pirinç Pilavı', nutritionalInfo: { calories: 210, protein: 4, carbs: 45, fat: 3 }, allergens: [], isVegan: true },
      { name: 'Cacık', nutritionalInfo: { calories: 80, protein: 4, carbs: 6, fat: 4 }, allergens: ['Süt'], isVegan: false },
    ],
    snacks: [
      { name: 'Mevsim Meyvesi', nutritionalInfo: { calories: 60, protein: 1, carbs: 15, fat: 0 }, allergens: [], isVegan: true },
    ],
    totalPortions: 115,
    veganPortions: 5,
    glutenFreePortions: 4,
    peanutFreePortions: 2
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-001',
    message: 'Yeni kritik arıza kaydı: Ana pano sigorta atması.',
    type: 'alert',
    roles: ['admin', 'mudur', 'teknik'],
    read: false,
    timestamp: '2026-06-21T08:15:00'
  },
  {
    id: 'NOTIF-002',
    message: 'Acil durum revir girişi yapıldı (Yüksek ateş).',
    type: 'warning',
    roles: ['admin', 'mudur', 'saglik'],
    read: false,
    timestamp: '2026-06-21T09:30:00'
  },
  {
    id: 'NOTIF-003',
    message: 'Domates stoğu kritik seviyeye (20kg) yaklaştı.',
    type: 'info',
    roles: ['admin', 'mudur', 'yemekhane'],
    read: true,
    timestamp: '2026-06-20T16:00:00'
  }
];

