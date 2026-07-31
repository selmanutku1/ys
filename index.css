/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'Sistem Yöneticisi'
  | 'Kamp Müdürü'
  | 'Kamp Koordinatörü'
  | 'Eğitmen'
  | 'Grup Lideri'
  | 'Sağlık Görevlisi'
  | 'Psikolog'
  | 'Gönüllü'
  | 'Katılımcı';

export interface InfirmaryLog {
  id: string;
  participantId: string;
  date: string; // ISO date string
  complaint: string;
  treatment: string;
  notes?: string;
  medicName?: string;
}

export interface CampCenter {
  id: string;
  name: string;
  city: string;
  capacity: number;
}

export interface CampPeriod {
  id: string;
  campCenterId: string;
  name: string; // e.g. "1. Dönem: Teknoloji Bağımlılığı Mücadelesi"
  startDate: string;
  endDate: string;
  maxQuota: number;
  isActive: boolean;
  status: 'Planlandı' | 'Aktif' | 'Tamamlandı';
  leaderId?: string;
  leaderIds?: string[];
  assignedStaffIds?: string[];
  projectId?: string;
  gender?: 'Kadın' | 'Erkek' | 'Karışık/Aile';
  minAge?: number;
  maxAge?: number;
  criteria?: string;
}

export interface Participant {
  id: string;
  name: string;
  identityNumber: string;
  birthDate: string;
  gender: 'Erkek' | 'Kadın';
  phone?: string;
  email?: string;
  status: 'Başvuru Yapıldı' | 'Onaylandı' | 'Reddedildi' | 'Yedek Listede' | 'Kampta' | 'Ayrıldı';
  category?: 'İlkokul' | 'Ortaokul' | 'Lise' | 'Üniversite' | 'Yetişkin' | 'Kafile Sorumlusu' | 'Şoför';
  duty?: string;
  
  // Address info
  address?: string;
  city?: string;
  district?: string;
  campPeriodId?: string;
  
  // Convoy & Batch registration info
  convoyName?: string;
  isConvoyLeader?: boolean;
  convoyLeaderId?: string; // links participants to their Kafile Sorumlusu
  autoAllocate?: boolean; // user checkbox in form: True = auto-assign on approve, False = manual assignment
  preferredBungalowId?: string | null;
  preferredBedNumber?: number | null;

  // Bungalow assignment info
  bungalowId: string | null; // e.g. "LDR-1", "STD-4"
  bedNumber: number | null; // 1 to 4 for Lider, 1 to 6 for STD
  
  // Health records
  allergies: string;
  chronicDiseases: string;
  medications: string;
  healthNote: string;
  consentReceived: boolean; // Muvafakatname Onayı
  kvkkSigned: boolean; // KVKK Onayı
  
  // Group info
  groupId: string | null;
  performanceScore?: number; // 1-100 evaluation
  certificateId?: string; // Sertifika ID if finished
  
  // Attendance & Check-in
  checkedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;

  // Physical stats
  height?: number; // boy (cm)
  weight?: number; // kilo (kg)
  emergencyContact?: string; // Acil durum iletişim kişisi
}

export interface Bungalow {
  id: string; // LDR-1..3, STD-1..11
  name: string;
  type: 'Lider' | 'Standart';
  capacity: number; // 4 or 6
  campCenterId: string;
  isClosed?: boolean; // Geçici süre kapatma
  closedBeds?: number[]; // e.g. [5, 6]
}

export interface Group {
  id: string;
  campCenterId: string;
  name: string; // e.g. "Yeşil Hilal Grubu"
  leaderId: string; // Staff ID (Grup Lideri)
  color: string; // Hex color for badge
}

export interface Staff {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  campCenterId: string;
  shiftHours: string;
  isActive: boolean;
  profilePicture?: string;
  personalNote?: string;
  performanceScore?: number; // 1-5 yıldız
  competencies?: string; // Liderlik yetkinlikleri
  trainings?: string[]; // Alınan eğitimler
  expertise?: string[]; // Uzmanlık alanları
  certifications?: string[]; // Sertifikalar
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  participantId: string;
  status: 'Mevcut' | 'İzinli' | 'Devamsız';
  activityId?: string; // Optional if linked to a specific activity
  scannedViaQR: boolean;
}

export interface HealthIncident {
  id: string;
  participantId: string;
  staffId: string; // Treated by which staff (Sağlık Görevlisi)
  dateTime: string;
  complaint: string; // Şikayet
  treatment: string; // Uygulanan Tedavi
  prescription?: string; // Verilen İlaçlar
  status: 'Kontrol Altında' | 'Müşahade' | 'Sevk Edildi';
}

export interface MealPlan {
  id: string;
  date: string;
  mealType: 'Kahvaltı' | 'Öğle Yemeği' | 'Akşam Yemeği' | 'Ara Öğün';
  menu: string[]; // List of foods
  vegetarianCount: number;
  glutenFreeCount: number;
}

export interface CampActivity {
  id: string;
  campCenterId: string;
  title: string;
  type: 'Spor' | 'Atölye' | 'Eğitim' | 'Seminer' | 'Eğlence';
  dateTime: string;
  instructorId: string; // Staff ID
  location: string;
}

export interface CampIncident {
  id: string;
  type: 'disiplin' | 'saglik' | 'guvenlik';
  reporterId: string;
  reporterName: string;
  dateTime: string;
  title: string;
  description: string;
  relatedParticipantId?: string;
  actionTaken: string;
  status: 'Açık' | 'Çözüldü' | 'Sevk Edildi';
}

export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  timestamp: string;
  details: string;
  undoData?: {
    participants?: any;
    periods?: any;
    bungalows?: any;
    healthIncidents?: any;
    surveys?: any;
    campCenters?: any;
    mealPlans?: any;
    expenses?: any;
    tasks?: any;
    shifts?: any;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // Staff ID or "Grup"
  assignedToName: string; // Staff Name
  department: 'Güvenlik' | 'Mutfak' | 'Temizlik' | 'Teknik' | 'Sağlık' | 'Eğitim' | 'Diğer';
  date: string;
  dueDate: string; // Date and Time
  status: 'Bekliyor' | 'Devam Ediyor' | 'Tamamlandı';
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';
  imageUrl?: string;
  history?: { date: string; user: string; action: string; note?: string }[];
}

export interface ShiftAssignment {
  id: string;
  staffId: string;
  staffName: string;
  department: 'Güvenlik' | 'Mutfak' | 'Temizlik' | 'Teknik' | 'Sağlık' | 'Eğitim' | 'Diğer';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface SurveyResponse {
  id: string;
  participantId?: string;
  campPeriodId: string;
  ratingMeals: number; // 1-5
  ratingActivities: number; // 1-5
  ratingBungalows: number; // 1-5
  ratingTrainers: number; // 1-5
  generalComment: string;
  answers?: Record<string, any>;
}

export interface TechnicalStatusChange {
  status: 'Yeni Kayıt' | 'İnceleniyor' | 'İşleme Alındı' | 'Çözüldü' | 'Kapatıldı';
  timestamp: string;
  updatedBy: string;
}

export interface TechnicalActionLog {
  id: string;
  action: string;
  partsReplaced?: string;
  notes: string;
  cost?: number;
  creator: string;
  date: string;
}

export interface TechnicalIssue {
  id: string;
  dateTime: string;
  reporter: string;
  location: string;
  category: 'Elektrik' | 'Su / Tesisat' | 'İnternet / IT' | 'Mobilya / Donanım' | 'Güvenlik' | 'Temizlik' | 'Diğer';
  description: string;
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';
  photoUrl?: string;
  photoUrls?: string[];
  assignedTo: string; // e.g. "Teknik Departman", "Mehmet Kaya"
  status: 'Yeni Kayıt' | 'İnceleniyor' | 'İşleme Alındı' | 'Çözüldü' | 'Kapatıldı';
  statusHistory: TechnicalStatusChange[];
  actionLogs: TechnicalActionLog[];
  campCenterId: string;
}

export interface SupplyRequest {
  id: string;
  requester: string;
  department: string;
  title: string;
  details: string;
  quantity: number;
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';
  neededDate: string;
  status: 'Talep Oluşturuldu' | 'Yönetici Onayında' | 'Satın Alma Sürecinde' | 'Tedarik Edildi' | 'Teslim Edildi' | 'Tamamlandı' | 'Reddedildi';
  campCenterId: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MenuItem {
  name: string;
  nutritionalInfo: NutritionalInfo;
  allergens: string[];
  isVegan: boolean;
}

export interface DailyMenu {
  date: string;
  breakfast: MenuItem[];
  lunch: MenuItem[];
  dinner: MenuItem[];
  snacks: MenuItem[];
  totalPortions: number;
  veganPortions: number;
  glutenFreePortions: number;
  peanutFreePortions: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Kuru Gıda' | 'Sebze/Meyve' | 'Et/Tavuk' | 'Süt Ürünleri' | 'Temizlik' | 'Diğer';
  unit: 'kg' | 'L' | 'Adet' | 'Kutu' | 'Paket';
  quantity: number;
  minThreshold: number;
  lastUpdated: string;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'alert' | 'info' | 'warning';
  roles: string[];
  read: boolean;
  timestamp: string;
}

export interface Expense {
  id: string;
  name: string;
  category: string; // 'Konaklama', 'Yemek', 'Ulaşım', 'Aktivite', 'Personel', 'Genel Gider'
  type: 'Sabit' | 'Değişken';
  amount: number;
  date: string;
  description: string;
  recordedBy?: string; // Staff name/id
}
