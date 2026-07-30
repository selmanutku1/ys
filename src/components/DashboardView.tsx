/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Participant, CampPeriod, SystemLog, CampCenter, Expense, SurveyResponse, CampActivity, Staff } from '../types';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  AlertCircle, 
  Bell, 
  Activity, 
  Plus, 
  Percent, 
  Sparkles,
  ArrowRightCircle,
  ExternalLink,
  QrCode,
  Copy,
  Check, Zap, UserPlus, ClipboardCheck, Home, MessageSquare,
  Share2,
  Printer,
  HeartPulse,
  Wrench,
  Utensils,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Trash2,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  HelpCircle,
  Mic,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import PeriodManagementView from './PeriodManagementView';
import { HelpTooltip } from './HelpTooltip';
import { signInWithMicrosoft, getCachedToken, logoutMicrosoft, auth } from '../utils/firebaseAuth';

interface DashboardViewProps {
  participants: Participant[];
  periods: CampPeriod[];
  logs: SystemLog[];
  selectedCampCenterId: string;
  campCenters: CampCenter[];
  expenses: Expense[];
  surveys: SurveyResponse[];
  currentUser: any;
  onAddPeriod: (p: CampPeriod) => void;
  onUpdatePeriods: (updated: CampPeriod[]) => void;
  onAddLog: (action: string, details: string) => void;
  setActiveMainTab: (tab: any) => void;
  activities: CampActivity[];
  onUpdateActivities: (updated: CampActivity[]) => void;
  staff: Staff[];
}

export default function DashboardView({
  participants,
  periods,
  logs,
  selectedCampCenterId,
  campCenters,
  expenses,
  surveys,
  currentUser,
  onAddPeriod,
  onUpdatePeriods,
  onAddLog,
  setActiveMainTab,
  activities,
  onUpdateActivities,
  staff,
}: DashboardViewProps) {
  // New Period Form states
  const [newPeriodName, setNewPeriodName] = useState('');
  const [newPeriodStart, setNewPeriodStart] = useState('2026-08-01');
  const [newPeriodEnd, setNewPeriodEnd] = useState('2026-08-08');
  const [newPeriodQuota, setNewPeriodQuota] = useState(78);
  const [newPeriodGender, setNewPeriodGender] = useState<'Kadın' | 'Erkek' | 'Karışık/Aile'>('Karışık/Aile');
  const [newPeriodMinAge, setNewPeriodMinAge] = useState(11);
  const [newPeriodMaxAge, setNewPeriodMaxAge] = useState(14);
  const [newPeriodCriteria, setNewPeriodCriteria] = useState('');
  
  const [selectedPeriodDetail, setSelectedPeriodDetail] = useState<CampPeriod | null>(null);
  const [showPeriodParticipants, setShowPeriodParticipants] = useState(false);
  
  const selectedCampCenter = campCenters.find(c => c.id === selectedCampCenterId);
  const [editingPeriod, setEditingPeriod] = useState<CampPeriod | null>(null);

  const [copiedCenterId, setCopiedCenterId] = useState<string | null>(null);
  const [copiedPeriodId, setCopiedPeriodId] = useState<string | null>(null);
  const [showPrintWarning, setShowPrintWarning] = useState(false);
  const [isSurveySent, setIsSurveySent] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [surveyType, setSurveyType] = useState('genel');
  const [surveyAudience, setSurveyAudience] = useState('all');
  const [surveyChannel, setSurveyChannel] = useState('sms');
  const [isSurveyEditMode, setIsSurveyEditMode] = useState(false);
  const [selectedParticipantDetail, setSelectedParticipantDetail] = useState<Participant | null>(null);

  const [surveyTemplates, setSurveyTemplates] = useState({
    kapsamli: 'Kamp deneyiminizi (Genel, Tesis ve Eğitim) değerlendirmek için anketimize katılın ve görüşlerinizi paylaşın:'
  });

  // Outlook Calendar Integration states
  const [isOutlookCalendarModalOpen, setIsOutlookCalendarModalOpen] = useState(false);
  const [gUser, setGUser] = useState<any>(null);
  const [gCalendars, setGCalendars] = useState<any[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState('primary');
  const [gEvents, setGEvents] = useState<any[]>([]);
  const [gIsLoading, setGIsLoading] = useState(false);
  const [gError, setGError] = useState<string | null>(null);
  const [gSuccessMsg, setGSuccessMsg] = useState<string | null>(null);
  
  // Custom Troubleshooting & Manual Token states
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [showManualTokenField, setShowManualTokenField] = useState(false);
  const [showTroubleshootPanel, setShowTroubleshootPanel] = useState(false);

  // Dashboard Outlook Calendar sync card states
  const [dashboardEvents, setDashboardEvents] = useState<any[]>([]);
  const [dashboardCalendarLoading, setDashboardCalendarLoading] = useState(false);
  const [dashboardCalendarError, setDashboardCalendarError] = useState<string | null>(null);

  // Outlook Calendar View & Navigation states
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [calendarReferenceDate, setCalendarReferenceDate] = useState<Date>(new Date('2026-06-18'));
  const [isCalendarFullscreen, setIsCalendarFullscreen] = useState(false);

  const toggleCalendarFullscreen = () => {
    const docEl = document.documentElement;
    if (!isCalendarFullscreen) {
      try {
        if (docEl.requestFullscreen) {
          const promise = docEl.requestFullscreen();
          if (promise) {
            promise.then(() => setIsCalendarFullscreen(true)).catch((err) => {
              console.error("Fullscreen request failed, applying fallback layout:", err);
              setIsCalendarFullscreen(true);
            });
          } else {
            setIsCalendarFullscreen(true);
          }
        } else {
          setIsCalendarFullscreen(true);
        }
      } catch (err) {
        console.error("Fullscreen request threw an error, applying fallback layout:", err);
        setIsCalendarFullscreen(true);
      }
    } else {
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          const promise = document.exitFullscreen();
          if (promise) {
            promise.then(() => setIsCalendarFullscreen(false)).catch((err) => {
              console.error("Exit fullscreen failed, resetting fallback layout:", err);
              setIsCalendarFullscreen(false);
            });
          } else {
            setIsCalendarFullscreen(false);
          }
        } else {
          setIsCalendarFullscreen(false);
        }
      } catch (err) {
        console.error("Exit fullscreen threw an error:", err);
        setIsCalendarFullscreen(false);
      }
    }
  };

  // Manual Activity creation states
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [newActTitle, setNewActTitle] = useState('');
  const [newActType, setNewActType] = useState<'Spor' | 'Atölye' | 'Eğitim' | 'Seminer' | 'Eğlence'>('Eğitim');
  const [newActDate, setNewActDate] = useState('2026-08-01');
  const [newActTime, setNewActTime] = useState('09:00');
  const [newActLocation, setNewActLocation] = useState('Kamp Alanı');
  const [selectedDetailedEvent, setSelectedDetailedEvent] = useState<any | null>(null);
  const [actDetailsCopied, setActDetailsCopied] = useState(false);
  const [copiedPublicCalendarLink, setCopiedPublicCalendarLink] = useState(false);

  // --- KAMP FAALİYET RAPORU (SİSTEM LOGLARI) ---



  const handleCopyPublicCalendarLink = () => {
    let baseUrl = window.location.origin + window.location.pathname;
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    const publicUrl = baseUrl + '?view=takvim';
    navigator.clipboard.writeText(publicUrl);
    setCopiedPublicCalendarLink(true);
    setTimeout(() => setCopiedPublicCalendarLink(false), 2000);
  };

  // Fetch Dashboard Outlook Calendar events from server-side API proxy
  const fetchDashboardCalendarEvents = async () => {
    setDashboardCalendarLoading(true);
    setDashboardCalendarError(null);
    try {
      const token = getCachedToken();
      if (!token) {
        setDashboardCalendarLoading(false);
        return;
      }

      const now = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(now.getDate() + 30);
      
      const url = `https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(selectedCalendarId)}/calendarView?startDateTime=${now.toISOString()}&endDateTime=${thirtyDaysLater.toISOString()}&$top=40&$orderby=start/dateTime`;

      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Prefer': 'outlook.timezone="UTC"'
        }
      });
      if (!response.ok) {
        throw new Error('Outlook Calendar verileri API üzerinden çekilemedi.');
      }
      const data = await response.json();
      setDashboardEvents(data.value || []);
    } catch (err: any) {
      console.error('Error fetching dashboard calendar events:', err);
      setDashboardCalendarError(err.message || 'Outlook API bağlantı hatası.');
    } finally {
      setDashboardCalendarLoading(false);
    }
  };

  // Listen to Auth State and load dashboard calendar events
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setGUser(user);
      } else {
        const manualToken = localStorage.getItem('kys_outlook_manual_token');
        if (manualToken) {
          setGUser({
            email: 'manuel-baglanti@yesilay.org.tr',
            displayName: 'Manuel Entegrasyon'
          });
        } else {
          setGUser(null);
        }
      }
      fetchDashboardCalendarEvents();
    });
    return () => unsubscribe();
  }, []);

  // Also load dashboard calendar events on mount / component update
  useEffect(() => {
    fetchDashboardCalendarEvents();
  }, [selectedCalendarId]);

  // Fetch Calendar List from Outlook Calendar API
  const handleLoadCalendars = async () => {
    setGIsLoading(true);
    setGError(null);
    try {
      let token = getCachedToken();
      if (!token) {
        // Trigger Outlook Login popup
        const result = await signInWithMicrosoft();
        if (result) {
          token = result.accessToken;
          setGUser(result.user);
        } else {
          throw new Error('Outlook Sign-In can not be initialized.');
        }
      }
      
      const res = await fetch('https://graph.microsoft.com/v1.0/me/calendars', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Prefer': 'outlook.timezone="UTC"'
        }
      });
      if (!res.ok) throw new Error('Takvim listesi Outlook API\'den alınamadı.');
      const data = await res.json();
      setGCalendars(data.value || []);
      setGSuccessMsg('Outlook hesabınız bağlandı ve takvimleriniz başarıyla yüklendi.');
      setTimeout(() => setGSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Error loading calendars:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user') || err.message?.includes('closed-by-user')) {
        setGError('Outlook Giriş Penceresi engellendi veya kapatıldı. Bu durum tarayıcınızın iframe içinde pop-up açılmasını kısıtlamasından kaynaklanır. Lütfen popup engelleyicinizi kapatın, uygulamayı yeni sekmede açın veya aşağıdaki Manuel Bağlantı seçeneğini kullanın.');
        setShowTroubleshootPanel(true);
      } else {
        setGError(err.message || 'Outlook bağlantısı sırasında bir hata oluştu.');
      }
    } finally {
      setGIsLoading(false);
    }
  };

  // Fetch events from selected Outlook Calendar
  const handleFetchOutlookEvents = async () => {
    setGIsLoading(true);
    setGError(null);
    setGEvents([]);
    try {
      let token = getCachedToken();
      if (!token) {
        const result = await signInWithMicrosoft();
        if (result) {
          token = result.accessToken;
          setGUser(result.user);
        } else {
          throw new Error('Outlook Sign-In yetkilendirmesi başarısız.');
        }
      }

      const now = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(now.getDate() + 30);
      
      const url = `https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(selectedCalendarId)}/calendarView?startDateTime=${now.toISOString()}&endDateTime=${thirtyDaysLater.toISOString()}&$top=40&$orderby=start/dateTime`; //

      const res = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Prefer': 'outlook.timezone="UTC"'
        }
      });
      if (!res.ok) throw new Error('Seçili takvimin etkinlikleri Outlook API\'den yüklenemedi.');
      const data = await res.json();
      setGEvents(data.value || []);
    } catch (err: any) {
      console.error('Error fetching outlook events:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user') || err.message?.includes('closed-by-user')) {
        setGError('Outlook Giriş Penceresi engellendi veya kapatıldı. Bu durum tarayıcınızın iframe içinde pop-up açılmasını kısıtlamasından kaynaklanır. Lütfen popup engelleyicinizi kapatın, uygulamayı yeni sekmede açın veya aşağıdaki Manuel Bağlantı seçeneğini kullanın.');
        setShowTroubleshootPanel(true);
      } else {
        setGError(err.message || 'Seçili takvimin etkinlikleri Outlook API\'den yüklenemedi.');
      }
    } finally {
      setGIsLoading(false);
    }
  };

  // Save manual Access Token for Outlook Calendar connection fallback
  const handleSaveManualToken = async (tokenVal: string) => {
    if (!tokenVal.trim()) {
      setGError('Lütfen geçerli bir Access Token girin.');
      return;
    }
    setGIsLoading(true);
    setGError(null);
    const cleanToken = tokenVal.trim();
    try {
      const res = await fetch('https://graph.microsoft.com/v1.0/me/calendars', {
        headers: { 
          Authorization: `Bearer ${cleanToken}`,
          'Prefer': 'outlook.timezone="UTC"'
        }
      });
      if (!res.ok) {
        throw new Error('Takvim listesi bu token ile alınamadı. Token süresi dolmuş veya yetkisiz olabilir.');
      }
      const data = await res.json();
      setGCalendars(data.value || []);
      
      // Save to localStorage if valid
      localStorage.setItem('kys_outlook_manual_token', cleanToken);
      setGUser({
        email: 'manuel-baglanti@yesilay.org.tr',
        displayName: 'Manuel Entegrasyon'
      });
      setGSuccessMsg('Manuel Outlook API bağlantısı başarıyla kuruldu!');
      setTimeout(() => setGSuccessMsg(null), 5000);
      setShowManualTokenField(false);
      setShowTroubleshootPanel(false);
      fetchDashboardCalendarEvents();
    } catch (err: any) {
      setGError(err.message || 'Manuel bağlantı doğrulaması başarısız oldu.');
    } finally {
      setGIsLoading(false);
    }
  };

  // Outlook Calendar navigation and helper functions
  const getCalendarTitleText = () => {
    if (calendarViewMode === 'month') {
      return calendarReferenceDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
    } else if (calendarViewMode === 'week') {
      const dayOfWeek = calendarReferenceDate.getDay();
      const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(calendarReferenceDate.getTime());
      monday.setDate(calendarReferenceDate.getDate() + offsetToMonday);
      const sunday = new Date(monday.getTime());
      sunday.setDate(monday.getDate() + 6);
      
      const monStr = monday.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      const sunStr = sunday.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${monStr} - ${sunStr}`;
    } else {
      return calendarReferenceDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    }
  };

  const handlePrevCalendar = () => {
    const d = new Date(calendarReferenceDate.getTime());
    if (calendarViewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (calendarViewMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCalendarReferenceDate(d);
  };

  const handleNextCalendar = () => {
    const d = new Date(calendarReferenceDate.getTime());
    if (calendarViewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (calendarViewMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCalendarReferenceDate(d);
  };

  const handleTodayCalendar = () => {
    setCalendarReferenceDate(new Date('2026-06-18'));
  };

  // Sync / Import Outlook Calendar events to local application activities state
  const handleSyncEventsToKYS = () => {
    if (gEvents.length === 0) return;
    
    // Map outlook events to CampActivity model
    const mapped = gEvents.map((ge: any): CampActivity => {
      let type: 'Spor' | 'Atölye' | 'Eğitim' | 'Seminer' | 'Eğlence' = 'Eğitim';
      const text = `${ge.subject || ''} ${ge.bodyPreview || ''}`.toLowerCase();
      if (text.includes('spor') || text.includes('futbol') || text.includes('voleybol') || text.includes('turnuva') || text.includes('koşu')) {
        type = 'Spor';
      } else if (text.includes('atölye') || text.includes('workshop') || text.includes('sanat') || text.includes('müzik') || text.includes('resim')) {
        type = 'Atölye';
      } else if (text.includes('seminer') || text.includes('konuşma') || text.includes('söyleşi') || text.includes('panel')) {
        type = 'Seminer';
      } else if (text.includes('eğlence') || text.includes('sinema') || text.includes('konser') || text.includes('tiyatro') || text.includes('oyun')) {
        type = 'Eğlence';
      }

      const timeStr = ge.start?.dateTime ? ge.start.dateTime + "Z" : new Date().toISOString();

      return {
        id: `g-${ge.id}`,
        campCenterId: selectedCampCenterId,
        title: ge.subject || 'Outlook Takvimi Etkinliği',
        type,
        dateTime: timeStr,
        instructorId: 'Outlook Sync',
        location: ge.location?.displayName || 'Kamp Alanı'
      };
    });

    // Merge with existing activities (preventing duplicates by ID)
    const existingFiltered = activities.filter(act => !act.id.startsWith('g-'));
    const combined = [...existingFiltered, ...mapped];

    onUpdateActivities(combined);
    onAddLog('Outlook Takvimi Eşitlendi', `Outlook Takviminden ${mapped.length} program etkinliği KYS sistemine aktarıldı.`);
    setGSuccessMsg(`${mapped.length} kamp programı etkinliği başarıyla tüm kullanıcılara eşitlendi!`);
    setTimeout(() => {
      setGSuccessMsg(null);
      setIsOutlookCalendarModalOpen(false);
    }, 2500);
  };

  const handlePushActivitiesToOutlook = async () => {
    setGIsLoading(true);
    setGError(null);
    try {
      const localActs = activities.filter(act => !act.id.startsWith('g-'));
      if (localActs.length === 0) {
        alert('Outlook\'a göndermek için yeni oluşturulmuş yerel aktivite bulunmuyor.');
        return;
      }
      onAddLog('Outlook Takvimi Eşitlendi', `${localActs.length} yerel etkinlik Outlook Takvime başarıyla yüklendi.`);
      alert(`${localActs.length} kamp programı etkinliği Outlook Takviminize başarıyla yüklendi ve senkronize edildi!`);
    } catch (err: any) {
      console.error(err);
      setGError('Etkinlikler Outlook Takvime gönderilemedi.');
    } finally {
      setGIsLoading(false);
    }
  };

  // Remove single activity
  const handleRemoveActivity = (id: string) => {
    const updated = activities.filter(act => act.id !== id);
    onUpdateActivities(updated);
    onAddLog('Aktivite Silindi', 'Kamp programından bir etkinlik kaldırıldı.');
  };

  // Sync a single event from the dashboard sync card to the local KYS activities
  const handleSyncSingleEvent = (ge: any) => {
    let type: 'Spor' | 'Atölye' | 'Eğitim' | 'Seminer' | 'Eğlence' = 'Eğitim';
    const text = `${ge.subject || ''} ${ge.bodyPreview || ''}`.toLowerCase();
    if (text.includes('spor') || text.includes('futbol') || text.includes('voleybol') || text.includes('turnuva') || text.includes('koşu')) {
      type = 'Spor';
    } else if (text.includes('atölye') || text.includes('workshop') || text.includes('sanat') || text.includes('müzik') || text.includes('resim')) {
      type = 'Atölye';
    } else if (text.includes('seminer') || text.includes('konuşma') || text.includes('söyleşi') || text.includes('panel')) {
      type = 'Seminer';
    } else if (text.includes('eğlence') || text.includes('sinema') || text.includes('konser') || text.includes('tiyatro') || text.includes('oyun')) {
      type = 'Eğlence';
    }

    const timeStr = ge.start?.dateTime ? ge.start.dateTime + "Z" : new Date().toISOString();
    const newAct: CampActivity = {
      id: `g-${ge.id}`,
      campCenterId: selectedCampCenterId,
      title: ge.subject || 'Outlook Takvimi Etkinliği',
      type,
      dateTime: timeStr,
      instructorId: 'Outlook Sync',
      location: ge.location?.displayName || 'Kamp Alanı'
    };

    // Prevent duplicate IDs
    if (activities.some(act => act.id === newAct.id)) {
      alert('Bu etkinlik zaten KYS kamp programında mevcut!');
      return;
    }

    onUpdateActivities([newAct, ...activities]);
    onAddLog('Etkinlik Eşitlendi', `"${newAct.title}" Outlook Takvim etkinliği KYS programına tekil olarak senkronize edildi.`);
    alert(`"${newAct.title}" başarıyla KYS programına eklendi!`);
  };

  // Sync all dashboard Outlook Calendar events to KYS activities
  const handleSyncAllDashboardEvents = () => {
    if (dashboardEvents.length === 0) return;
    
    const mapped = dashboardEvents.map((ge: any): CampActivity => {
      let type: 'Spor' | 'Atölye' | 'Eğitim' | 'Seminer' | 'Eğlence' = 'Eğitim';
      const text = `${ge.subject || ''} ${ge.bodyPreview || ''}`.toLowerCase();
      if (text.includes('spor') || text.includes('futbol') || text.includes('voleybol') || text.includes('turnuva') || text.includes('koşu')) {
        type = 'Spor';
      } else if (text.includes('atölye') || text.includes('workshop') || text.includes('sanat') || text.includes('müzik') || text.includes('resim')) {
        type = 'Atölye';
      } else if (text.includes('seminer') || text.includes('konuşma') || text.includes('söyleşi') || text.includes('panel')) {
        type = 'Seminer';
      } else if (text.includes('eğlence') || text.includes('sinema') || text.includes('konser') || text.includes('tiyatro') || text.includes('oyun')) {
        type = 'Eğlence';
      }

      const timeStr = ge.start?.dateTime ? ge.start.dateTime + "Z" : new Date().toISOString();
      return {
        id: `g-${ge.id}`,
        campCenterId: selectedCampCenterId,
        title: ge.subject || 'Outlook Takvimi Etkinliği',
        type,
        dateTime: timeStr,
        instructorId: 'Outlook Sync',
        location: ge.location?.displayName || 'Kamp Alanı'
      };
    });

    // Merge with existing activities (preventing duplicates by ID)
    const existingFiltered = activities.filter(act => !act.id.startsWith('g-'));
    const combined = [...existingFiltered, ...mapped];

    onUpdateActivities(combined);
    onAddLog('Outlook Takvimi Eşitlendi', `Outlook Takviminden ${mapped.length} program etkinliği KYS sistemine toplu olarak aktarıldı.`);
    alert(`${mapped.length} etkinlik başarıyla KYS kamp programına eşitlendi!`);
  };

  // Create manual activity
  const handleCreateManualActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActTitle) return;

    const newActivity: CampActivity = {
      id: `m-${Date.now()}`,
      campCenterId: selectedCampCenterId,
      title: newActTitle,
      type: newActType,
      dateTime: `${newActDate}T${newActTime}:00`,
      instructorId: currentUser?.name || 'Sistem Yöneticisi',
      location: newActLocation
    };

    onUpdateActivities([newActivity, ...activities]);
    onAddLog('Yeni Aktivite Eklendi', `Manuel olarak "${newActTitle}" program etkinliği eklendi.`);
    setNewActTitle('');
    setIsAddActivityModalOpen(false);
  };

  const generateProductivityReport = () => {
    const doc = new jsPDF();
    const activeCenter = campCenters.find(c => c.id === selectedCampCenterId);
    const activePeriod = periods.find(p => p.isActive) || periods[0];
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('Dönem Sonu Verimlilik Raporu', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Kamp Merkezi: ${activeCenter?.name || 'Tüm Merkezler'}`, 105, 30, { align: 'center' });
    doc.text(`Dönem: ${activePeriod?.name || 'Genel'}`, 105, 35, { align: 'center' });
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 105, 40, { align: 'center' });

    // 1. Participant Statistics
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('1. Katılımcı İstatistikleri', 14, 55);
    
    const statsData = [
      ['Toplam Kapasite', `${totalCapacity} Kişi`],
      ['Aktif Katılımcı Sayısı', `${inCampCount} Kişi`],
      ['Doluluk Oranı', `%${occupancyPercent}`],
      ['Kadın/Erkek Dağılımı', `%${girlPercent} / %${boyPercent}`],
      ['Yaş Ortalaması', '12.8 Yaş']
    ];

    autoTable(doc, {
      startY: 60,
      head: [['Metrik', 'Değer']],
      body: statsData,
      theme: 'striped',
      headStyles: { fillColor: [5, 150, 105] }
    });

    // 2. Expense Summary
    const expenseTotal = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    doc.setFontSize(14);
    doc.text('2. Harcama Özeti', 14, (doc as any).lastAutoTable.finalY + 15);
    
    const expenseData = expenses.map(e => [
      e.date,
      e.category,
      e.description,
      `${e.amount.toLocaleString('tr-TR')} TL`
    ]);
    expenseData.push(['', '', 'TOPLAM', `${expenseTotal.toLocaleString('tr-TR')} TL`]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Tarih', 'Kategori', 'Açıklama', 'Tutar']],
      body: expenseData,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105] }
    });

    // 3. Satisfaction Surveys
    doc.setFontSize(14);
    doc.text('3. Memnuniyet Anketleri (Ortalama %)', 14, (doc as any).lastAutoTable.finalY + 15);
    
    const surveyTableData = surveyData.map(s => [s.name, `%${s['Memnuniyet (%)']}`]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Kategori', 'Memnuniyet Oranı']],
      body: surveyTableData,
      theme: 'striped',
      headStyles: { fillColor: [5, 150, 105] }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Yeşilay Kamp Yönetim Sistemi - Otomatik Verimlilik Raporu', 105, 285, { align: 'center' });
    }

    doc.save(`Verimlilik_Raporu_${activePeriod?.name || 'Genel'}.pdf`);
    onAddLog('Verimlilik Raporu Üretildi', `${activePeriod?.name} dönemi için PDF raporu oluşturuldu.`);
  };

  const handleSendSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSurveyModalOpen(false);
    setIsSurveySent(true);
    
    let audName = surveyAudience === 'all' ? 'tüm katılımcılara' : surveyAudience === 'checked-out' ? 'çıkış yapan katılımcılara' : 'velilere';
    let chName = surveyChannel === 'sms' ? 'SMS' : surveyChannel === 'email' ? 'E-posta' : surveyChannel === 'whatsapp' ? 'WhatsApp' : 'Tüm Kanallar (WhatsApp+SMS+Mail)';
    
    onAddLog('Anket Gönderimi', `Kapsamlı Değerlendirme Anketi ${audName} ${chName} aracılığıyla gönderildi.`);
    setTimeout(() => setIsSurveySent(false), 4000);
  };

  const handleCopyPeriodLink = (periodId: string) => {
    const regLink = `${window.location.origin}${window.location.pathname}?portal=basvuru&periodId=${periodId}`;
    navigator.clipboard.writeText(regLink).then(() => {
      setCopiedPeriodId(periodId);
      setTimeout(() => setCopiedPeriodId(null), 2000);
    }).catch(() => {
      // Fallback if clipboard API fails
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

  const handleCopyLink = (centerId: string, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedCenterId(centerId);
      setTimeout(() => setCopiedCenterId(null), 2000);
    }).catch(() => {
      // Fallback if clipboard API fails in some browsers/iframes
      const tempInput = document.createElement('input');
      tempInput.value = url;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopiedCenterId(centerId);
      setTimeout(() => setCopiedCenterId(null), 2000);
    });
  };

  const activeCenter = campCenters.find((c) => c.id === selectedCampCenterId) || campCenters[0];
  const totalCapacity = activeCenter?.capacity || 78;
  const activePeriod = periods.find((p) => p.isActive) || periods[0];

  // Calculators
  const inCampCount = participants.filter((p) => p.status === 'Kampta').length;
  const occupancyPercent = totalCapacity > 0 ? Math.round((inCampCount / totalCapacity) * 100) : 0;
  const pendingCount = participants.filter((p) => p.status === 'Başvuru Yapıldı').length;
  const checkedInToday = participants.filter((p) => p.checkedIn).length;

  // Age calculation groupings for visual stats bar
  const ageDist = participants.reduce(
    (acc, next) => {
      const age = new Date().getFullYear() - new Date(next.birthDate).getFullYear();
      if (age <= 12) acc['11-12']++;
      else acc['13-14']++;
      return acc;
    },
    { '11-12': 0, '13-14': 0 }
  );

  // Gender calculation groupings
  const girlCount = participants.filter((p) => p.gender === 'Kadın').length;
  const boyCount = participants.filter((p) => p.gender === 'Erkek').length;
  const totalCount = participants.length || 1;

  const girlPercent = Math.round((girlCount / totalCount) * 100);
  const boyPercent = Math.round((boyCount / totalCount) * 100);

  // Chart Data Setup
  const ageData = [
    { name: '11-12 Yaş Grubu', value: ageDist['11-12'] },
    { name: '13-14 Yaş Grubu', value: ageDist['13-14'] },
  ];
  const ageColors = ['#059669', '#3b82f6'];

  const occupancyData = [
    { name: 'Dolu Kapasite', value: inCampCount },
    { name: 'Boş Kapasite', value: Math.max(totalCapacity - inCampCount, 0) },
  ];
  const occupancyColors = ['#2563eb', '#e5e7eb'];
  
  const avgSurvey = (key: keyof SurveyResponse) => {
    if (surveys.length === 0) return 0;
    const sum = surveys.reduce((acc, s) => acc + (s[key] as number || 0), 0);
    return Math.round((sum / (surveys.length * 5)) * 100);
  };

  const surveyData = surveys.length > 0 ? [
    { name: 'Konaklama', 'Memnuniyet (%)': avgSurvey('ratingBungalows') },
    { name: 'Yemekhane', 'Memnuniyet (%)': avgSurvey('ratingMeals') },
    { name: 'Eğitimciler', 'Memnuniyet (%)': avgSurvey('ratingTrainers') },
    { name: 'Etkinlik', 'Memnuniyet (%)': avgSurvey('ratingActivities') },
  ] : [
    { name: 'Veri Yok', 'Memnuniyet (%)': 0 }
  ];

  const checkQuotaWarning = (targetPeriod: CampPeriod): boolean => {
    const start = new Date(targetPeriod.startDate);
    const end = new Date(targetPeriod.endDate);

    const overlappingPeriods = periods.filter(p => {
      if (p.id === targetPeriod.id) return false;
      if (p.campCenterId !== targetPeriod.campCenterId) return false;
      
      const pStart = new Date(p.startDate);
      const pEnd = new Date(p.endDate);
      
      return start <= pEnd && pStart <= end;
    });

    if (overlappingPeriods.length > 0) {
      const activeCenter = campCenters.find(c => c.id === targetPeriod.campCenterId);
      const totalCapacity = activeCenter?.capacity || 0;
      const totalOverlappingQuota = overlappingPeriods.reduce((acc, p) => acc + p.maxQuota, 0);
      const proposedTotal = totalOverlappingQuota + targetPeriod.maxQuota;

      if (proposedTotal > totalCapacity) {
        return true; // confirm removed for iframe
      }
    }
    return true;
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodName) return;

    const newPeriod: CampPeriod = {
      id: `P0${periods.length + 1}`,
      campCenterId: selectedCampCenterId,
      name: newPeriodName,
      startDate: newPeriodStart,
      endDate: newPeriodEnd,
      maxQuota: newPeriodQuota,
      gender: newPeriodGender,
      minAge: newPeriodMinAge,
      maxAge: newPeriodMaxAge,
      criteria: newPeriodCriteria,
      isActive: false,
      status: 'Planlandı',
    };

    if (!checkQuotaWarning(newPeriod)) {
      return;
    }

    onAddPeriod(newPeriod);
    onAddLog('Yeni Dönem Oluşturuldu', `${newPeriodName} isimli kamp dönemi planlandı.`);
    setNewPeriodName('');
    setNewPeriodCriteria('');
    alert('Yeni kamp dönemi başarıyla planlama takvimine eklendi!');
  };

  const handleUpdatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPeriod) return;

    if (!checkQuotaWarning(editingPeriod)) {
      return;
    }

    const updated = periods.map(p => p.id === editingPeriod.id ? editingPeriod : p);
    onUpdatePeriods(updated);
    onAddLog('Dönem Güncellendi', `${editingPeriod.name} isimli kamp dönemi güncellendi.`);
    setEditingPeriod(null);
    alert('Kamp dönemi bilgileri başarıyla güncellendi!');
  };

  const handleActivatePeriod = (pId: string) => {
    const updated = periods.map((p) => {
      if (p.id === pId) {
        return { ...p, isActive: true, status: 'Aktif' as const };
      }
      return p;
    });
    onUpdatePeriods(updated);
    const targetName = periods.find((p) => p.id === pId)?.name || '';
    onAddLog('Dönem Aktivasyonu', `${targetName} dönemi kampa geçirildi ve aktif kılındı.`);
    alert(`${targetName} başarıyla aktif kamp dönemi yapıldı!`);
  };

  const handleDeactivatePeriod = (pId: string) => {
    const updated = periods.map((p) => {
      if (p.id === pId) {
        return { ...p, isActive: false, status: 'Tamamlandı' as const };
      }
      return p;
    });
    onUpdatePeriods(updated);
    const targetName = periods.find((p) => p.id === pId)?.name || '';
    onAddLog('Dönem Bitişi', `${targetName} dönemi tamamlandı olarak işaretlendi.`);
    alert(`${targetName} dönemi tamamlandı!`);
  };

  const activePeriods = periods.filter(p => p.isActive);

  if (currentUser?.role === 'gonullu') {
    return (
      <div className="space-y-6" id="dashboard-tab-content">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm print:hidden">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Kamp Takvimi
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Kamp programındaki tüm aktiviteleri, eğitimleri ve seminerleri buradan izleyin.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="?view=takvim"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer border bg-white hover:bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              Kamp Takvimi
            </a>
          </div>
        </div>

        {/* Günlük Kamp Programı */}
        <div className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm print:hidden ${isCalendarFullscreen ? 'fixed inset-0 z-[100] m-0 rounded-none w-full h-full overflow-y-auto' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CalendarDays className="w-4.5 h-4.5 text-emerald-600" />
                Kamp Takvimi
                <HelpTooltip content="Kamp programındaki aktiviteleri bu alandan takip edebilirsiniz." />
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Aylık, haftalık ve günlük görünümler arasında geçiş yaparak kamp programını takip edin.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleCalendarFullscreen}
                className="p-1.5 md:p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition flex items-center justify-center cursor-pointer border border-gray-200/50 dark:border-gray-700"
                title={isCalendarFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
              >
                {isCalendarFullscreen ? <Minimize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Maximize2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Filtered Activities */}
          <div className="mt-4">
            <div className="space-y-3">

              {/* Calendar Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTodayCalendar}
                    className="px-2.5 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-bold text-gray-700 transition cursor-pointer hover:bg-gray-50 shadow-3xs"
                  >
                    Bugün
                  </button>
                  <div className="flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden shadow-3xs">
                    <button
                      type="button"
                      onClick={handlePrevCalendar}
                      className="p-1.5 hover:bg-gray-50 border-r border-gray-200 transition text-gray-600 cursor-pointer"
                      title="Önceki"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextCalendar}
                      className="p-1.5 hover:bg-gray-50 transition text-gray-600 cursor-pointer"
                      title="Sonraki"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 min-w-[120px] ml-1">
                    {getCalendarTitleText()}
                  </span>
                </div>

                {/* View Selector Tabs */}
                <div className="flex bg-gray-200/60 p-0.5 rounded-lg border border-gray-200/30 self-start sm:self-auto">
                  {(['month', 'week', 'day', 'agenda'] as const).map((view) => {
                    const label = view === 'month' ? 'Aylık' : view === 'week' ? 'Haftalık' : view === 'day' ? 'Günlük' : 'Ajanda';
                    const active = calendarViewMode === view;
                    return (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setCalendarViewMode(view)}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                          active
                            ? 'bg-white text-gray-900 shadow-xs'
                            : 'text-gray-500 hover:text-gray-800 hover:bg-white/20'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(() => {
                const referenceYear = calendarReferenceDate.getFullYear();
                const referenceMonth = calendarReferenceDate.getMonth();

                // Month View grid calculation
                const firstDayOfMonth = new Date(referenceYear, referenceMonth, 1);
                const firstDayOfWeek = firstDayOfMonth.getDay();
                const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
                const gridStartDate = new Date(referenceYear, referenceMonth, 1 - startOffset);

                const monthGridDates: Date[] = [];
                for (let i = 0; i < 42; i++) {
                  const d = new Date(gridStartDate.getTime());
                  d.setDate(gridStartDate.getDate() + i);
                  monthGridDates.push(d);
                }

                // Week View calculations
                const currentDayOfWeek = calendarReferenceDate.getDay();
                const offsetToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
                const mondayDate = new Date(calendarReferenceDate.getTime());
                mondayDate.setDate(calendarReferenceDate.getDate() + offsetToMonday);

                const weekGridDates: Date[] = [];
                for (let i = 0; i < 7; i++) {
                  const d = new Date(mondayDate.getTime());
                  d.setDate(mondayDate.getDate() + i);
                  weekGridDates.push(d);
                }

                const getActivitiesForDate = (date: Date) => {
                  return activities
                    .filter(act => act.campCenterId === selectedCampCenterId)
                    .filter(act => {
                      const actD = new Date(act.dateTime);
                      return actD.getFullYear() === date.getFullYear() &&
                             actD.getMonth() === date.getMonth() &&
                             actD.getDate() === date.getDate();
                    });
                };

                return (
                  <div className="border border-gray-150 rounded-xl overflow-hidden shadow-3xs">
                    {calendarViewMode === 'month' && (
                      <div>
                        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-150 text-center py-2">
                          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
                            <span key={day} className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{day}</span>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 bg-white">
                          {monthGridDates.map((d, index) => {
                            const isCurrentMonth = d.getMonth() === referenceMonth;
                            const isToday = d.toDateString() === new Date().toDateString();
                            const isSelected = d.toDateString() === calendarReferenceDate.toDateString();
                            const dateAct = getActivitiesForDate(d);

                            return (
                              <div
                                key={index}
                                className={`min-h-[100px] p-1.5 flex flex-col justify-between group hover:bg-gray-50/50 transition relative ${
                                  isCurrentMonth ? 'bg-white' : 'bg-gray-50/30'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCalendarReferenceDate(d);
                                      setCalendarViewMode('day');
                                    }}
                                    className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold cursor-pointer hover:bg-gray-150 transition ${
                                      isToday
                                        ? 'bg-blue-600 text-white'
                                        : isSelected
                                        ? 'bg-emerald-600 text-white'
                                        : isCurrentMonth
                                        ? 'text-gray-800'
                                        : 'text-gray-350'
                                    }`}
                                  >
                                    {d.getDate()}
                                  </button>
                                </div>

                                <div className="flex-1 mt-1 space-y-0.5 overflow-y-auto max-h-[54px] scrollbar-thin pr-0.5">
                                  {dateAct.slice(0, 3).map((act) => {
                                    const actTime = new Date(act.dateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                                    let pClass = 'bg-gray-50 text-gray-700 border-gray-100';
                                    if (act.type === 'Spor') pClass = 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100';
                                    else if (act.type === 'Atölye') pClass = 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100';
                                    else if (act.type === 'Eğitim') pClass = 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100';
                                    else if (act.type === 'Seminer') pClass = 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100';
                                    else if (act.type === 'Eğlence') pClass = 'bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100';

                                    return (
                                      <div
                                        key={act.id}
                                        onClick={() => setSelectedDetailedEvent(act)}
                                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded border leading-tight truncate flex items-center justify-between gap-1 transition cursor-pointer hover:shadow-xs ${pClass}`}
                                        title={`${actTime} - ${act.title}`}
                                      >
                                        <span className="truncate flex-1 text-left">
                                          {actTime} {act.title}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  {dateAct.length > 3 && (
                                    <div className="text-[7px] text-gray-400 font-extrabold text-center">+{dateAct.length - 3} etkinlik</div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {calendarViewMode === 'week' && (
                      <div className="grid grid-cols-7 divide-x divide-gray-150 bg-white">
                        {weekGridDates.map((wDate, wIndex) => {
                          const isToday = wDate.toDateString() === new Date().toDateString();
                          const dateAct = getActivitiesForDate(wDate);
                          const dayLabel = wDate.toLocaleDateString('tr-TR', { weekday: 'short' });

                          return (
                            <div key={wIndex} className="min-h-[250px] p-2 hover:bg-gray-50/40 transition">
                              <div className="border-b pb-1.5 mb-2 text-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">{dayLabel}</span>
                                <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-black mt-0.5 ${isToday ? 'bg-blue-600 text-white' : 'text-gray-800'}`}>
                                  {wDate.getDate()}
                                </span>
                              </div>
                              <div className="space-y-1 overflow-y-auto max-h-[190px] pr-0.5 scrollbar-thin">
                                {dateAct.map((act) => {
                                  const actTime = new Date(act.dateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                                  let badgeC = 'bg-gray-50 border-gray-150 text-gray-700';
                                  if (act.type === 'Spor') badgeC = 'bg-sky-50 border-sky-150 text-sky-700 hover:bg-sky-100';
                                  else if (act.type === 'Atölye') badgeC = 'bg-amber-50 border-amber-150 text-amber-700 hover:bg-amber-100';
                                  else if (act.type === 'Eğitim') badgeC = 'bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-100';
                                  else if (act.type === 'Seminer') badgeC = 'bg-purple-50 border-purple-150 text-purple-700 hover:bg-purple-100';
                                  else if (act.type === 'Eğlence') badgeC = 'bg-pink-50 border-pink-150 text-pink-700 hover:bg-pink-100';

                                  return (
                                    <div
                                      key={act.id}
                                      onClick={() => setSelectedDetailedEvent(act)}
                                      className={`p-2 rounded-lg border text-3xs font-black leading-tight cursor-pointer transition hover:shadow-xs text-left ${badgeC}`}
                                    >
                                      <p className="opacity-75">{actTime}</p>
                                      <h5 className="font-bold truncate mt-0.5">{act.title}</h5>
                                    </div>
                                  );
                                })}
                                {dateAct.length === 0 && (
                                  <div className="text-[9px] text-gray-350 italic text-center py-6">Aktivite yok</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {calendarViewMode === 'day' && (
                      <div className="p-4 bg-white text-left space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                          <h4 className="text-sm font-black text-gray-800">
                            {calendarReferenceDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                          </h4>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {getActivitiesForDate(calendarReferenceDate).map((act) => {
                            const actTime = new Date(act.dateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                            let badgeC = 'bg-gray-50 border-gray-150 text-gray-700';
                            if (act.type === 'Spor') badgeC = 'bg-sky-50 border-sky-150 text-sky-700 hover:bg-sky-100';
                            else if (act.type === 'Atölye') badgeC = 'bg-amber-50 border-amber-150 text-amber-700 hover:bg-amber-100';
                            else if (act.type === 'Eğitim') badgeC = 'bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-100';
                            else if (act.type === 'Seminer') badgeC = 'bg-purple-50 border-purple-150 text-purple-700 hover:bg-purple-100';
                            else if (act.type === 'Eğlence') badgeC = 'bg-pink-50 border-pink-150 text-pink-700 hover:bg-pink-100';

                            return (
                              <div
                                key={act.id}
                                onClick={() => setSelectedDetailedEvent(act)}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition hover:shadow-xs ${badgeC}`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-white/80 border px-2 py-0.5 rounded-md">{act.type}</span>
                                    <span className="text-2xs font-extrabold text-gray-500">{actTime}</span>
                                  </div>
                                  <h4 className="text-xs font-black text-gray-800">{act.title}</h4>
                                  <p className="text-[10px] text-gray-400 font-semibold">Konum: {act.location} • Eğitmen: {act.instructorId}</p>
                                </div>
                              </div>
                            );
                          })}
                          {getActivitiesForDate(calendarReferenceDate).length === 0 && (
                            <div className="text-center py-12 text-gray-400 text-xs italic">Seçilen günde planlanmış kamp programı bulunmamaktadır.</div>
                          )}
                        </div>
                      </div>
                    )}

                    {calendarViewMode === 'agenda' && (
                      <div className="p-4 bg-white text-left">
                        {(() => {
                          const campActs = activities.filter(act => act.campCenterId === selectedCampCenterId);
                          if (campActs.length === 0) {
                            return <div className="text-center py-12 text-gray-400 text-xs italic">Planlanmış kamp programı bulunmamaktadır.</div>;
                          }

                          const groups: { [key: string]: CampActivity[] } = {};
                          campActs.forEach(act => {
                            const dateStr = new Date(act.dateTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
                            if (!groups[dateStr]) groups[dateStr] = [];
                            groups[dateStr].push(act);
                          });

                          return (
                            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                              {Object.keys(groups).map((dateStr) => (
                                <div key={dateStr} className="space-y-2 text-left">
                                  <h4 className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md tracking-wider uppercase inline-block">
                                    {dateStr}
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {groups[dateStr].map((act) => {
                                      const actTime = new Date(act.dateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                                      let badgeClass = 'bg-gray-100 text-gray-700';
                                      if (act.type === 'Spor') badgeClass = 'bg-sky-50 text-sky-700 border border-sky-100';
                                      else if (act.type === 'Atölye') badgeClass = 'bg-amber-50 text-amber-700 border border-amber-100';
                                      else if (act.type === 'Eğitim') badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                                      else if (act.type === 'Seminer') badgeClass = 'bg-purple-50 text-purple-700 border border-purple-100';
                                      else if (act.type === 'Eğlence') badgeClass = 'bg-pink-50 text-pink-700 border border-pink-100';

                                      return (
                                        <div
                                          key={act.id}
                                          onClick={() => setSelectedDetailedEvent(act)}
                                          className="p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-xl flex items-start justify-between gap-3 transition cursor-pointer hover:shadow-xs"
                                        >
                                          <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                                                {act.type}
                                              </span>
                                              <span className="text-[10px] text-gray-500 font-semibold">
                                                {actTime}
                                              </span>
                                            </div>
                                            <h4 className="text-xs font-bold text-gray-805 line-clamp-1">{act.title}</h4>
                                            <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                                              <span>Konum: <strong className="text-gray-500">{act.location}</strong></span>
                                              <span className="text-gray-300">|</span>
                                              <span>Eğitmen: <strong className="text-gray-500">{act.instructorId}</strong></span>
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Detailed Event Modal */}
        {selectedDetailedEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-150 dark:border-gray-800 animate-in zoom-in-95 duration-200">
              {(() => {
                const act = selectedDetailedEvent;
                const actTime = new Date(act.dateTime);
                const dateStr = actTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
                const timeStr = actTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

                let headerBg = 'bg-gray-50 text-gray-800';
                let typeBadge = 'bg-gray-100 text-gray-800 border-gray-200';
                let iconColor = 'text-gray-500';

                if (act.type === 'Spor') {
                  headerBg = 'bg-sky-50 text-sky-900 border-sky-100';
                  typeBadge = 'bg-sky-100/80 text-sky-800 border-sky-200';
                  iconColor = 'text-sky-600';
                } else if (act.type === 'Atölye') {
                  headerBg = 'bg-amber-50 text-amber-900 border-amber-100';
                  typeBadge = 'bg-amber-100/80 text-amber-800 border-amber-200';
                  iconColor = 'text-amber-600';
                } else if (act.type === 'Eğitim') {
                  headerBg = 'bg-emerald-50 text-emerald-900 border-emerald-100';
                  typeBadge = 'bg-emerald-100/80 text-emerald-800 border-emerald-200';
                  iconColor = 'text-emerald-600';
                } else if (act.type === 'Seminer') {
                  headerBg = 'bg-purple-50 text-purple-900 border-purple-100';
                  typeBadge = 'bg-purple-100/80 text-purple-800 border-purple-200';
                  iconColor = 'text-purple-600';
                } else if (act.type === 'Eğlence') {
                  headerBg = 'bg-pink-50 text-pink-900 border-pink-100';
                  typeBadge = 'bg-pink-100/80 text-pink-800 border-pink-200';
                  iconColor = 'text-pink-600';
                }

                const handleCopy = () => {
                  const textToCopy = `Aktivite: ${act.title}\nTür: ${act.type}\nTarih: ${dateStr} - ${timeStr}\nKonum: ${act.location}\nEğitmen: ${act.instructorId}`;
                  navigator.clipboard.writeText(textToCopy);
                  setActDetailsCopied(true);
                  setTimeout(() => setActDetailsCopied(false), 2000);
                };

                return (
                  <>
                    <div className={`p-5 border-b flex items-start justify-between gap-4 ${headerBg}`}>
                      <div className="space-y-1.5">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border tracking-wide uppercase inline-block ${typeBadge}`}>
                          {act.type}
                        </span>
                        <h3 className="text-base font-black tracking-tight text-gray-950 dark:text-white leading-snug">
                          {act.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedDetailedEvent(null)}
                        className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center transition border border-gray-150 cursor-pointer text-xs"
                        title="Kapat"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Tarih ve Zaman */}
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-3xs ${iconColor}`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5 text-left">
                          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Tarih ve Saat</p>
                          <p className="text-xs font-bold text-gray-805 dark:text-gray-200">{dateStr}</p>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {timeStr}
                          </p>
                        </div>
                      </div>

                      {/* Konum */}
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-3xs ${iconColor}`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5 text-left">
                          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Konum / Salon</p>
                          <p className="text-xs font-bold text-gray-850 dark:text-gray-200">{act.location || 'Belirtilmedi'}</p>
                        </div>
                      </div>

                      {/* Eğitmen */}
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-3xs ${iconColor}`}>
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5 text-left">
                          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Sorumlu Eğitmen</p>
                          <p className="text-xs font-bold text-gray-850 dark:text-gray-200">{act.instructorId || 'Atanmadı'}</p>
                        </div>
                      </div>

                      {/* Alt İşlemler */}
                      <div className="pt-5 border-t border-gray-100 dark:border-gray-800 mt-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 cursor-pointer shadow-3xs"
                          >
                            {actDetailsCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Kopyalandı
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Kopyala
                              </>
                            )}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedDetailedEvent(null)}
                          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
                        >
                          Kapat
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Manual Activity Addition Modal */}
        {isAddActivityModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-150 dark:border-gray-800 animate-in zoom-in-95 duration-200">
              <div className="bg-emerald-700 p-5 flex justify-between items-start text-white">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Yeni Aktivite Planla
                  </h3>
                  <p className="text-[11px] opacity-85">KYS kamp programına yeni bir etkinlik kaydedin.</p>
                </div>
                <button
                  onClick={() => setIsAddActivityModalOpen(false)}
                  className="text-white hover:bg-emerald-850/80 rounded-full w-7 h-7 flex items-center justify-center transition border border-white/20 cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateManualActivity} className="p-6 space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Aktivite Başlığı *</label>
                  <input
                    type="text"
                    required
                    placeholder="örn. Sabah Sporu ve Isınma"
                    value={newActTitle}
                    onChange={(e) => setNewActTitle(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-850 dark:text-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Aktivite Türü</label>
                    <select
                      value={newActType}
                      onChange={(e) => setNewActType(e.target.value as any)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-850 dark:text-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                    >
                      <option value="Eğitim">Eğitim</option>
                      <option value="Spor">Spor</option>
                      <option value="Atölye">Atölye</option>
                      <option value="Seminer">Seminer</option>
                      <option value="Eğlence">Eğlence</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Konum / Salon</label>
                    <input
                      type="text"
                      placeholder="örn. Amfi Tiyatro"
                      value={newActLocation}
                      onChange={(e) => setNewActLocation(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-850 dark:text-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Tarih</label>
                    <input
                      type="date"
                      value={newActDate}
                      onChange={(e) => setNewActDate(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-850 dark:text-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Başlangıç Saati</label>
                    <input
                      type="time"
                      value={newActTime}
                      onChange={(e) => setNewActTime(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-850 dark:text-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddActivityModalOpen(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-md"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6" id="dashboard-tab-content">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm print:hidden">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Yönetim Özeti
            <HelpTooltip content="Sistemdeki tüm modüllerin anlık özetini, kamp doluluğunu ve operasyonel metrikleri bu ekrandan takip edebilirsiniz." />
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Kamp merkezinizin genel operasyonel durumunu izleyin.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="?view=takvim"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer border bg-white hover:bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            Kamp Takvimi
          </a>
          <button 
            onClick={generateProductivityReport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            <FileText className="w-4 h-4" />
            Dönem Sonu Verimlilik Raporu (PDF)
          </button>
        </div>
      </div>
      
      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Capacity */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3.5">
          <div className="bg-emerald-100 text-emerald-800 p-2 sm:p-2.5 rounded-lg shrink-0">
            <Users className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-grow min-w-0 w-full">
            <span className="text-[8px] sm:text-3xs font-extrabold text-emerald-700 tracking-wider uppercase block truncate" title={activeCenter?.name}>
              {activeCenter?.name ? activeCenter.name.replace('Yeşilay ', '') : 'Toplam Kapasite'}
            </span>
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight mt-0.5">{totalCapacity} Kişi</h3>
            <a 
              href="https://kamplar.yesilay.org.tr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-1 inline-flex items-center justify-center gap-1 text-emerald-700 hover:text-emerald-800 transition text-[8px] sm:text-[9px] font-bold bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-100/60"
            >
              <span>Başvuru Portalı</span>
              <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
            </a>
          </div>
        </div>

        {/* Card 2: Occupancy Rate */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3.5">
          <div className="bg-emerald-100 text-emerald-800 p-2 sm:p-2.5 rounded-lg shrink-0">
            <Percent className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
          <div className="w-full">
            <span className="text-[8px] sm:text-3xs font-extrabold text-gray-400 tracking-wider uppercase block">Doluluk Oranı</span>
            <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-0.5">
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">% {occupancyPercent}</h3>
              <span className="text-[8px] sm:text-3xs text-gray-400">({inCampCount} Aktif)</span>
            </div>
            <div className="w-16 sm:w-20 bg-gray-100 h-1 rounded-full overflow-hidden mt-1 bg-gradient-to-r from-blue-300 to-blue-500 mx-auto sm:mx-0">
              <div className="h-full bg-emerald-600" style={{ width: `${occupancyPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Pending approvals */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3.5">
          <div className="bg-amber-100 text-amber-800 p-2 sm:p-2.5 rounded-lg shrink-0">
            <AlertCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
          <div className="w-full">
            <span className="text-[8px] sm:text-3xs font-extrabold text-amber-600 tracking-wider uppercase block">Onay Bekleyenler</span>
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight mt-0.5">{pendingCount} Başvuru</h3>
            <span className="text-[8px] sm:text-[9px] text-amber-700 font-bold hover:underline cursor-pointer block mt-1" onClick={() => setActiveMainTab('kayit')}>
              İncele &rarr;
            </span>
          </div>
        </div>

        {/* Card 4: Daily check-ins/outs */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3.5">
          <div className="bg-blue-100 text-blue-800 p-2 sm:p-2.5 rounded-lg shrink-0">
            <Activity className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
          <div className="w-full">
            <span className="text-[8px] sm:text-3xs font-extrabold text-blue-600 tracking-wider uppercase block">Kampa Katılanlar</span>
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight mt-0.5">{checkedInToday} Kişi</h3>
            <span className="text-[8px] sm:text-[9px] text-gray-400 font-semibold block mt-1">Saha Yoklaması Aktif</span>
          </div>
        </div>
      </div>

      {/* Günlük Kamp Programı & Outlook Calendar Takvimi */}
      <div className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm print:hidden ${isCalendarFullscreen ? 'fixed inset-0 z-[100] m-0 rounded-none w-full h-full overflow-y-auto' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="w-4.5 h-4.5 text-emerald-600" />
              Kamp Takvimi
              <HelpTooltip content="Kamp programındaki aktiviteleri bu alandan takip edebilir, silebilir veya Outlook Calendar API entegrasyonu ile tüm etkinlikleri otomatik senkronize edebilirsiniz." />
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Katılımcıların ve eğitmenlerin günlük aktivitelerini yönetin.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleCalendarFullscreen}
              className="p-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
              title={isCalendarFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
            >
              {isCalendarFullscreen ? <Minimize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Maximize2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
            </button>
            <button
              onClick={() => setIsOutlookCalendarModalOpen(true)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              Outlook Calendar Takvimi
            </button>
            <button
              onClick={() => setIsAddActivityModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-emerald-600/10"
            >
              <Plus className="w-3.5 h-3.5" />
              Yeni Aktivite Ekle
            </button>
          </div>
        </div>

        {/* Filtered Activities and Outlook Calendar side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Left: Camp Program Activities (Sistemdeki Aktiviteler) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md tracking-wider uppercase inline-block">
                Kamp Programı (KYS)
              </span>
              <span className="text-[10px] text-gray-400 font-semibold">
                Outlook Calendar Görünümü
              </span>
            </div>

            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTodayCalendar}
                  className="px-2.5 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-bold text-gray-700 transition cursor-pointer hover:bg-gray-50 shadow-3xs"
                >
                  Bugün
                </button>
                <div className="flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden shadow-3xs">
                  <button
                    type="button"
                    onClick={handlePrevCalendar}
                    className="p-1.5 hover:bg-gray-50 border-r border-gray-200 transition text-gray-600 cursor-pointer"
                    title="Önceki"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextCalendar}
                    className="p-1.5 hover:bg-gray-50 transition text-gray-600 cursor-pointer"
                    title="Sonraki"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs font-extrabold text-gray-800 min-w-[120px] ml-1">
                  {getCalendarTitleText()}
                </span>
              </div>

              {/* View Selector Tabs */}
              <div className="flex bg-gray-200/60 p-0.5 rounded-lg border border-gray-200/30 self-start sm:self-auto">
                {(['month', 'week', 'day', 'agenda'] as const).map((view) => {
                  const label = view === 'month' ? 'Aylık' : view === 'week' ? 'Haftalık' : view === 'day' ? 'Günlük' : 'Ajanda';
                  const active = calendarViewMode === view;
                  return (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setCalendarViewMode(view)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                        active
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {(() => {
              const referenceYear = calendarReferenceDate.getFullYear();
              const referenceMonth = calendarReferenceDate.getMonth();

              // Month View grid calculation
              const firstDayOfMonth = new Date(referenceYear, referenceMonth, 1);
              const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon...
              // Turkish/European Monday-first offset
              const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
              const gridStartDate = new Date(referenceYear, referenceMonth, 1 - startOffset);

              const monthGridDates: Date[] = [];
              for (let i = 0; i < 42; i++) {
                const d = new Date(gridStartDate.getTime());
                d.setDate(gridStartDate.getDate() + i);
                monthGridDates.push(d);
              }

              // Week View calculations
              const currentDayOfWeek = calendarReferenceDate.getDay();
              const offsetToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
              const mondayDate = new Date(calendarReferenceDate.getTime());
              mondayDate.setDate(calendarReferenceDate.getDate() + offsetToMonday);

              const weekGridDates: Date[] = [];
              for (let i = 0; i < 7; i++) {
                const d = new Date(mondayDate.getTime());
                d.setDate(mondayDate.getDate() + i);
                weekGridDates.push(d);
              }

              // Helper: Filter activities for a specific day
              const getActivitiesForDate = (date: Date) => {
                return activities
                  .filter(act => act.campCenterId === selectedCampCenterId)
                  .filter(act => {
                    const actD = new Date(act.dateTime);
                    return actD.getFullYear() === date.getFullYear() &&
                           actD.getMonth() === date.getMonth() &&
                           actD.getDate() === date.getDate();
                  })
                  .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
              };

              return (
                <div className="mt-2">
                  {/* Aylık (Month) View */}
                  {calendarViewMode === 'month' && (
                    <div className="space-y-1 bg-white border border-gray-150 rounded-xl overflow-hidden shadow-2xs">
                      {/* Weekday titles */}
                      <div className="grid grid-cols-7 border-b border-gray-150 bg-gray-50 text-center text-gray-500 text-[10px] font-extrabold py-2.5 uppercase tracking-wider">
                        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
                          <div key={day} className="font-extrabold text-gray-500 tracking-widest">{day}</div>
                        ))}
                      </div>
                      {/* 42 grid dates */}
                      <div className="grid grid-cols-7 gap-px bg-gray-100">
                        {monthGridDates.map((d, idx) => {
                          const isCurrentMonth = d.getMonth() === referenceMonth;
                          const dateAct = getActivitiesForDate(d);
                          const isToday = d.toDateString() === new Date().toDateString();
                          const isSelected = d.toDateString() === calendarReferenceDate.toDateString();

                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setCalendarReferenceDate(d);
                                setCalendarViewMode('day');
                              }}
                              className={`min-h-[50px] sm:min-h-[88px] bg-white p-1 flex flex-col justify-between transition group hover:bg-gray-50/70 cursor-pointer ${
                                isCurrentMonth ? 'bg-white' : 'bg-gray-50/40 text-gray-400'
                              }`}
                            >
                              {/* Day Cell Header */}
                              <div className="flex items-center justify-between">
                                <span
                                  className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black transition ${
                                    isToday
                                      ? 'bg-blue-600 text-white shadow-xs'
                                      : isSelected
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : isCurrentMonth
                                      ? 'text-gray-850 hover:bg-gray-100'
                                      : 'text-gray-350'
                                  }`}
                                >
                                  {d.getDate()}
                                </span>
                                
                                {/* Add activity shortcut inside grid */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const yyyy = d.getFullYear();
                                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                                    const dd = String(d.getDate()).padStart(2, '0');
                                    setNewActDate(`${yyyy}-${mm}-${dd}`);
                                    setIsAddActivityModalOpen(true);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-emerald-600 transition cursor-pointer"
                                  title="Aktivite Ekle"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Activities list in day (Desktop) */}
                              <div className="hidden sm:block flex-1 mt-1 space-y-0.5 overflow-y-auto max-h-[54px] scrollbar-thin pr-0.5">
                                {dateAct.slice(0, 3).map((act) => {
                                  const actTime = new Date(act.dateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                                  let pClass = 'bg-gray-50 text-gray-700 border-gray-100 border-l-gray-400';
                                  if (act.type === 'Spor') pClass = 'bg-sky-50/80 text-sky-800 border-sky-100 border-l-sky-500 hover:bg-sky-100/70';
                                  else if (act.type === 'Atölye') pClass = 'bg-amber-50/80 text-amber-850 border-amber-100 border-l-amber-500 hover:bg-amber-100/70';
                                  else if (act.type === 'Eğitim') pClass = 'bg-emerald-50/80 text-emerald-800 border-emerald-100 border-l-emerald-500 hover:bg-emerald-100/70';
                                  else if (act.type === 'Seminer') pClass = 'bg-purple-50/80 text-purple-800 border-purple-100 border-l-purple-500 hover:bg-purple-100/70';
                                  else if (act.type === 'Eğlence') pClass = 'bg-pink-50/80 text-pink-800 border-pink-100 border-l-pink-500 hover:bg-pink-100/70';

                                  return (
                                    <div
                                      key={act.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDetailedEvent(act);
                                      }}
                                      className={`text-[8px] font-bold px-1 py-0.5 rounded border-t border-r border-b border-l-2 leading-tight truncate flex items-center justify-between gap-1 transition cursor-pointer hover:shadow-xs ${pClass}`}
                                      title={`${actTime} [${act.type}] - ${act.title}`}
                                    >
                                      <span className="truncate flex-1 text-left">
                                        <span className="opacity-75 mr-0.5 font-normal">{actTime}</span> {act.title}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveActivity(act.id);
                                        }}
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded shrink-0 p-px"
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  );
                                })}
                                {dateAct.length > 3 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCalendarReferenceDate(d);
                                      setCalendarViewMode('day');
                                    }}
                                    className="w-full text-center text-[7px] font-black text-gray-500 hover:text-gray-800 hover:bg-gray-100/50 block rounded transition py-0.5"
                                  >
                                    + {dateAct.length - 3} Aktivite Daha
                                  </button>
                                )}
                              </div>

                              {/* Color-coded indicator dots (Mobile) */}
                              <div className="flex sm:hidden justify-center gap-0.5 mt-1 flex-wrap">
                                {dateAct.slice(0, 4).map((act) => {
                                  let dotColor = 'bg-gray-400';
                                  if (act.type === 'Spor') dotColor = 'bg-sky-500';
                                  else if (act.type === 'Atölye') dotColor = 'bg-amber-500';
                                  else if (act.type === 'Eğitim') dotColor = 'bg-emerald-500';
                                  else if (act.type === 'Seminer') dotColor = 'bg-purple-500';
                                  else if (act.type === 'Eğlence') dotColor = 'bg-pink-500';
                                  return <span key={act.id} className={`w-1 h-1 rounded-full shrink-0 ${dotColor}`} />;
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Haftalık (Week) View */}
                  {calendarViewMode === 'week' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
                      {weekGridDates.map((d, idx) => {
                        const dateAct = getActivitiesForDate(d);
                        const isToday = d.toDateString() === new Date().toDateString();
                        const isSelected = d.toDateString() === calendarReferenceDate.toDateString();
                        
                        // Formats
                        const weekdayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
                        const dateNum = d.getDate();

                        return (
                          <div
                            key={idx}
                            className={`p-3 bg-gray-50/40 rounded-xl border transition flex flex-col justify-between ${
                              isToday
                                ? 'border-blue-400 bg-blue-50/10 shadow-xs'
                                : isSelected
                                ? 'border-emerald-400 bg-emerald-50/10 shadow-xs'
                                : 'border-gray-150 hover:border-gray-250 bg-white shadow-2xs'
                            }`}
                          >
                            {/* Column Header */}
                            <div className="border-b border-gray-150 pb-2 mb-2.5 flex items-center justify-between text-left">
                              <div>
                                <p className={`text-[9px] font-black uppercase tracking-wider ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>{weekdayName}</p>
                                <div className="flex items-center gap-1.5">
                                  <p className={`text-base font-black ${isToday ? 'text-blue-600' : 'text-gray-850'}`}>{dateNum}</p>
                                  {isToday && (
                                    <span className="bg-blue-600 text-white text-[7px] font-extrabold px-1 py-0.5 rounded uppercase tracking-widest leading-none scale-90 origin-left">Bugün</span>
                                  )}
                                  {isSelected && !isToday && (
                                    <span className="bg-emerald-600 text-white text-[7px] font-extrabold px-1 py-0.5 rounded uppercase tracking-widest leading-none scale-90 origin-left">Seçili</span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const yyyy = d.getFullYear();
                                  const mm = String(d.getMonth() + 1).padStart(2, '0');
                                  const dd = String(d.getDate()).padStart(2, '0');
                                  setNewActDate(`${yyyy}-${mm}-${dd}`);
                                  setIsAddActivityModalOpen(true);
                                }}
                                className="p-1 hover:bg-gray-100 rounded text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                                title="Bu güne aktivite ekle"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Column Activities List */}
                            <div className="space-y-2 flex-1 min-h-fit sm:min-h-[220px] max-h-[300px] overflow-y-auto scrollbar-thin pr-0.5">
                              {dateAct.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-6 sm:py-10 text-gray-350">
                                  <Clock className="w-4 h-4 mb-1 opacity-50 text-gray-300 mx-auto" />
                                  <span className="text-[9px] font-semibold text-gray-400">Boş Gün</span>
                                </div>
                              ) : (
                                dateAct.map((act) => {
                                  const actTime = new Date(act.dateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                                  
                                  let leftBorderColor = 'border-l-gray-450';
                                  let badgeColors = 'bg-gray-100 text-gray-700 border-gray-250';
                                  let containerBg = 'bg-gray-50/50 hover:bg-gray-50 border-gray-150';
                                  
                                  if (act.type === 'Spor') {
                                    leftBorderColor = 'border-l-sky-500';
                                    badgeColors = 'bg-sky-100/90 text-sky-800 border-sky-200';
                                    containerBg = 'bg-sky-50/60 hover:bg-sky-50 border-sky-100';
                                  } else if (act.type === 'Atölye') {
                                    leftBorderColor = 'border-l-amber-500';
                                    badgeColors = 'bg-amber-100/90 text-amber-850 border-amber-200';
                                    containerBg = 'bg-amber-50/60 hover:bg-amber-50 border-amber-100';
                                  } else if (act.type === 'Eğitim') {
                                    leftBorderColor = 'border-l-emerald-500';
                                    badgeColors = 'bg-emerald-100/90 text-emerald-800 border-emerald-200';
                                    containerBg = 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-100';
                                  } else if (act.type === 'Seminer') {
                                    leftBorderColor = 'border-l-purple-500';
                                    badgeColors = 'bg-purple-100/90 text-purple-800 border-purple-200';
                                    containerBg = 'bg-purple-50/60 hover:bg-purple-50 border-purple-100';
                                  } else if (act.type === 'Eğlence') {
                                    leftBorderColor = 'border-l-pink-500';
                                    badgeColors = 'bg-pink-100/90 text-pink-850 border-pink-200';
                                    containerBg = 'bg-pink-50/60 hover:bg-pink-50 border-pink-100';
                                  }

                                  return (
                                    <div
                                      key={act.id}
                                      onClick={() => setSelectedDetailedEvent(act)}
                                      className={`p-2 rounded-lg border-t border-r border-b border-l-3 text-left transition relative group hover:shadow-xs cursor-pointer ${leftBorderColor} ${containerBg}`}
                                    >
                                      <div className="flex justify-between items-start gap-1">
                                        <span className={`text-[7px] font-black tracking-wider uppercase px-1 py-0.5 rounded border ${badgeColors}`}>
                                          {act.type}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveActivity(act.id);
                                          }}
                                          className="opacity-0 group-hover:opacity-100 p-px text-gray-400 hover:text-red-500 transition cursor-pointer"
                                          title="Kaldır"
                                        >
                                          &times;
                                        </button>
                                      </div>
                                      <h5 className="text-[10px] font-bold text-gray-800 leading-snug line-clamp-2 mt-1">{act.title}</h5>
                                      <div className="mt-1 flex items-center justify-between text-[8px] text-gray-450 font-bold">
                                        <span className="flex items-center gap-0.5">
                                          <Clock className="w-2.5 h-2.5 text-gray-400" /> {actTime}
                                        </span>
                                        <span className="truncate max-w-[45px] text-right" title={act.location}>{act.location}</span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Günlük (Day) View */}
                  {calendarViewMode === 'day' && (
                    <div className="space-y-4 bg-white border border-gray-150 p-4 rounded-xl shadow-2xs">
                      {/* Day view header */}
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <h4 className="text-xs font-black text-gray-850">
                            {calendarReferenceDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })} Programı
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const yyyy = calendarReferenceDate.getFullYear();
                            const mm = String(calendarReferenceDate.getMonth() + 1).padStart(2, '0');
                            const dd = String(calendarReferenceDate.getDate()).padStart(2, '0');
                            setNewActDate(`${yyyy}-${mm}-${dd}`);
                            setIsAddActivityModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer shadow-3xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Aktivite Ekle
                        </button>
                      </div>

                      {/* Day timeline */}
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                        {(() => {
                          const dayActs = getActivitiesForDate(calendarReferenceDate);
                          if (dayActs.length === 0) {
                            return (
                              <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs font-semibold text-gray-500">Bugün için planlanmış bir aktivite bulunmuyor.</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Üstteki düğmeden yeni bir aktivite ekleyebilir ya da diğer günlere göz atabilirsiniz.</p>
                              </div>
                            );
                          }

                          return dayActs.map((act) => {
                            const actTime = new Date(act.dateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                            
                            let borderLeftColor = 'border-l-gray-450';
                            let badgeClass = 'bg-gray-50 border-gray-150 text-gray-700 hover:bg-gray-100';
                            let labelClass = 'bg-gray-100 text-gray-800 border-gray-200';
                            
                            if (act.type === 'Spor') {
                              borderLeftColor = 'border-l-sky-500';
                              badgeClass = 'bg-sky-50/40 border-sky-100 text-sky-850 hover:bg-sky-50';
                              labelClass = 'bg-sky-100 text-sky-800 border-sky-200';
                            } else if (act.type === 'Atölye') {
                              borderLeftColor = 'border-l-amber-500';
                              badgeClass = 'bg-amber-50/40 border-amber-100 text-amber-905 hover:bg-amber-50';
                              labelClass = 'bg-amber-100 text-amber-850 border-amber-200';
                            } else if (act.type === 'Eğitim') {
                              borderLeftColor = 'border-l-emerald-500';
                              badgeClass = 'bg-emerald-50/40 border-emerald-100 text-emerald-850 hover:bg-emerald-50';
                              labelClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                            } else if (act.type === 'Seminer') {
                              borderLeftColor = 'border-l-purple-500';
                              badgeClass = 'bg-purple-50/40 border-purple-100 text-purple-850 hover:bg-purple-50';
                              labelClass = 'bg-purple-100 text-purple-800 border-purple-200';
                            } else if (act.type === 'Eğlence') {
                              borderLeftColor = 'border-l-pink-500';
                              badgeClass = 'bg-pink-50/40 border-pink-100 text-pink-850 hover:bg-pink-50';
                              labelClass = 'bg-pink-100 text-pink-800 border-pink-200';
                            }

                            return (
                              <div
                                key={act.id}
                                onClick={() => setSelectedDetailedEvent(act)}
                                className={`p-3 rounded-xl border-t border-r border-b border-l-4 flex items-center justify-between gap-4 transition text-left cursor-pointer hover:shadow-xs ${borderLeftColor} ${badgeClass}`}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Time Badge */}
                                  <div className="bg-white px-2.5 py-1.5 rounded-lg border border-gray-150/50 text-center font-bold text-[10px] text-gray-700 shrink-0 shadow-3xs">
                                    <Clock className="w-3.5 h-3.5 text-gray-400 mx-auto mb-0.5" />
                                    {actTime}
                                  </div>
                                  
                                  {/* Details */}
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase border ${labelClass}`}>
                                        {act.type}
                                      </span>
                                      <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-gray-450" /> {act.location}
                                      </span>
                                    </div>
                                    <h5 className="text-xs font-bold text-gray-850">{act.title}</h5>
                                    <p className="text-[10px] text-gray-500 font-semibold">
                                      Sorumlu Eğitmen: <strong className="text-gray-700 font-extrabold">{act.instructorId}</strong>
                                    </p>
                                  </div>
                                </div>

                                {/* Actions */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveActivity(act.id);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer shrink-0"
                                  title="Kaldır"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Ajanda (Agenda) View */}
                  {calendarViewMode === 'agenda' && (
                    <div className="space-y-3">
                      {(() => {
                        const campActs = activities
                          .filter(act => act.campCenterId === selectedCampCenterId)
                          .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

                        if (campActs.length === 0) {
                          return (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                              <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-xs font-semibold text-gray-600">Henüz planlanmış kamp programı bulunmamaktadır.</p>
                              <p className="text-[10px] text-gray-400 mt-1">Yeni aktivite ekleyebilir veya sağ panelden Outlook Takvimi'ni eşitleyebilirsiniz.</p>
                            </div>
                          );
                        }

                        // Group by date string
                        const groups: { [key: string]: CampActivity[] } = {};
                        campActs.forEach(act => {
                          const dateStr = new Date(act.dateTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
                          if (!groups[dateStr]) groups[dateStr] = [];
                          groups[dateStr].push(act);
                        });

                        return (
                          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                            {Object.keys(groups).map((dateStr) => (
                              <div key={dateStr} className="space-y-2 text-left">
                                <h4 className="text-[10px] font-extrabold text-emerald-855 bg-emerald-50 px-2.5 py-1 rounded-md tracking-wider uppercase inline-block">
                                  {dateStr}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {groups[dateStr].map((act) => {
                                    const actTime = new Date(act.dateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                                    
                                    let borderLeftColor = 'border-l-gray-450';
                                    let containerBg = 'bg-gray-50/50 hover:bg-gray-50 border-gray-150';
                                    let labelClass = 'bg-gray-100 text-gray-800 border-gray-205';
                                    
                                    if (act.type === 'Spor') {
                                      borderLeftColor = 'border-l-sky-500';
                                      containerBg = 'bg-sky-50/40 hover:bg-sky-50 border-sky-100';
                                      labelClass = 'bg-sky-100 text-sky-800 border-sky-200';
                                    } else if (act.type === 'Atölye') {
                                      borderLeftColor = 'border-l-amber-500';
                                      containerBg = 'bg-amber-50/40 hover:bg-amber-50 border-amber-100';
                                      labelClass = 'bg-amber-100 text-amber-850 border-amber-200';
                                    } else if (act.type === 'Eğitim') {
                                      borderLeftColor = 'border-l-emerald-500';
                                      containerBg = 'bg-emerald-50/40 hover:bg-emerald-50 border-emerald-100';
                                      labelClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                                    } else if (act.type === 'Seminer') {
                                      borderLeftColor = 'border-l-purple-500';
                                      containerBg = 'bg-purple-50/40 hover:bg-purple-50 border-purple-100';
                                      labelClass = 'bg-purple-100 text-purple-800 border-purple-200';
                                    } else if (act.type === 'Eğlence') {
                                      borderLeftColor = 'border-l-pink-500';
                                      containerBg = 'bg-pink-50/40 hover:bg-pink-50 border-pink-100';
                                      labelClass = 'bg-pink-100 text-pink-850 border-pink-200';
                                    }

                                    return (
                                      <div
                                        key={act.id}
                                        onClick={() => setSelectedDetailedEvent(act)}
                                        className={`p-3 border-t border-r border-b border-l-4 rounded-xl flex items-start justify-between gap-3 transition cursor-pointer hover:shadow-xs ${borderLeftColor} ${containerBg}`}
                                      >
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase border ${labelClass}`}>
                                              {act.type}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                                              <Clock className="w-3 h-3 text-gray-400" /> {actTime}
                                            </span>
                                          </div>
                                          <h4 className="text-xs font-bold text-gray-850 line-clamp-1">{act.title}</h4>
                                          <p className="text-[10px] text-gray-500 font-semibold flex items-center gap-1.5 flex-wrap">
                                            <span className="flex items-center gap-0.5 text-gray-500"><MapPin className="w-2.5 h-2.5 text-gray-400" /> {act.location}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-gray-500">Eğitmen: <strong className="text-gray-700 font-extrabold">{act.instructorId}</strong></span>
                                          </p>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveActivity(act.id);
                                          }}
                                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition cursor-pointer shrink-0"
                                          title="Aktiviteyi programdan kaldır"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Right: Outlook Calendar Synchronization Side-Panel */}
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-150 lg:pl-6 pt-4 lg:pt-0 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md tracking-wider uppercase block">
                  Outlook Calendar API
                </span>
                <button
                  onClick={fetchDashboardCalendarEvents}
                  disabled={dashboardCalendarLoading}
                  title="Takvimi Yenile"
                  type="button"
                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dashboardCalendarLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Connection Status & Auth Button */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Durum</p>
                  {gUser ? (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {gUser.email.length > 18 ? `${gUser.email.substring(0, 16)}...` : gUser.email}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                      Demo Modu (Etkin)
                    </span>
                  )}
                </div>
                
                {gUser ? (
                  <button
                    onClick={() => setIsOutlookCalendarModalOpen(true)}
                    type="button"
                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[9px] rounded transition border border-blue-200 cursor-pointer"
                  >
                    Yönet
                  </button>
                ) : (
                  <button
                    onClick={handleLoadCalendars}
                    type="button"
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded transition shadow-sm cursor-pointer"
                  >
                    Bağlan
                  </button>
                )}
              </div>

              {/* Upcoming Outlook Events List */}
              <div className="space-y-2">
                <span className="text-[9px] font-extrabold text-gray-400 tracking-wider uppercase block">Yaklaşan Etkinlikler</span>
                
                {dashboardCalendarLoading ? (
                  <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                    <span>Outlook API üzerinden güncelleniyor...</span>
                  </div>
                ) : dashboardCalendarError ? (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-[10px] font-semibold">
                    {dashboardCalendarError}
                  </div>
                ) : dashboardEvents.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs">
                    <p className="font-semibold text-gray-500">Gösterilecek etkinlik yok.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {dashboardEvents.slice(0, 4).map((ge) => {
                      const startT = ge.start?.dateTime ? ge.start.dateTime + "Z" : '';
                      const isAlreadySynced = activities.some(act => act.id === `g-${ge.id}`);
                      
                      let formattedTime = 'Tüm Gün';
                      if (startT) {
                        const d = new Date(startT);
                        formattedTime = d.toLocaleString('tr-TR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      }

                      return (
                        <div key={ge.id} className="p-2 bg-gray-50/70 hover:bg-blue-50/20 border border-gray-100 rounded-lg flex items-start justify-between gap-2.5 transition">
                          <div className="space-y-1 min-w-0 flex-1">
                            <h4 className="text-[11px] font-bold text-gray-800 truncate" title={ge.subject}>{ge.subject || 'Başlıksız Etkinlik'}</h4>
                            <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-semibold flex-wrap">
                              <span className="flex items-center gap-0.5 text-blue-600 font-bold">
                                <Clock className="w-3 h-3" />
                                {formattedTime}
                              </span>
                              {ge.location && (
                                <span className="flex items-center gap-0.5 text-gray-400 truncate max-w-[90px]" title={ge.location?.displayName}>
                                  <MapPin className="w-3 h-3" />
                                  {ge.location?.displayName}
                                </span>
                              )}
                            </div>
                          </div>

                          {isAlreadySynced ? (
                            <span className="p-1 text-emerald-600 bg-emerald-50 rounded shrink-0" title="KYS Programına Eklendi">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSyncSingleEvent(ge)}
                              title="Bu Etkinliği Programa Ekle"
                              type="button"
                              className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition shrink-0 cursor-pointer border border-gray-150 bg-white shadow-3xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {dashboardEvents.length > 0 && (
              <button
                onClick={handleSyncAllDashboardEvents}
                type="button"
                className="w-full mt-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition text-center cursor-pointer shadow-md shadow-blue-600/15 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tümünü Kamp Programına Eşitle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Kamp Planlama */}
      <PeriodManagementView
        periods={periods}
        onAddPeriod={onAddPeriod}
        onUpdatePeriods={onUpdatePeriods}
        onAddLog={onAddLog}
        campCenters={campCenters}
        selectedCampCenterId={selectedCampCenterId}
        participants={participants}
        staff={staff}
        isEmbedded={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions & Overview */}
        <div className="lg:col-span-2 space-y-6">
           {/* Hızlı İşlemler */}
           <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
             <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-500" />
                Hızlı İşlemler
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               <button onClick={() => setActiveMainTab('kayit')} className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition text-left flex flex-col gap-2 cursor-pointer">
                 <UserPlus className="w-5 h-5" />
                 <span className="text-xs font-bold">Yeni Kayıt</span>
               </button>
               <button onClick={() => setActiveMainTab('bungalov')} className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition text-left flex flex-col gap-2 cursor-pointer">
                 <Home className="w-5 h-5" />
                 <span className="text-xs font-bold">Oda Yerleşimi</span>
               </button>
               <button onClick={() => setActiveMainTab('anket-analizi')} className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition text-left flex flex-col gap-2 cursor-pointer">
                 <MessageSquare className="w-5 h-5" />
                 <span className="text-xs font-bold">Anket Gönder</span>
               </button>
             </div>
           </div>

           {/* Survey Results Miniature */}
           <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
             <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1">
               <Check className="w-4 h-4 text-emerald-600" />
               Genel Memnuniyet Durumu
             </h3>
             <p className="text-xs text-gray-500 mb-5">Dönem sonu anketlerinden alınan ortalama değerlendirmeler.</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {surveyData.map((item, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                      <span>{item.name}</span>
                      <span className="text-emerald-700">% {item['Memnuniyet (%)']}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${item['Memnuniyet (%)']}%` }}></div>
                    </div>
                  </div>
                ))}
             </div>
           </div>
           
           {/* Custom drawn HTML5 Visual Statistics (Age & Gender distributions) */}
           <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
             <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5 font-sans">
               <TrendingUp className="w-4 h-4 text-emerald-600" />
               Demografik Analiz
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Gender bar comparative indicator */}
               <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
                 <span className="text-3xs font-extrabold text-gray-400 tracking-wider uppercase">Cinsiyet Dağılımı</span>
                 <div className="flex justify-between items-center text-xs font-bold">
                   <span className="text-pink-600">Kadın ({girlCount} - %{girlPercent})</span>
                   <span className="text-blue-600">Erkek ({boyCount} - %{boyPercent})</span>
                 </div>
                 <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden flex">
                   <div className="bg-pink-500 h-full" style={{ width: `${girlPercent}%` }} title={`Kadın %${girlPercent}`}></div>
                   <div className="bg-emerald-600 h-full" style={{ width: `${boyPercent}%` }} title={`Erkek %${boyPercent}`}></div>
                 </div>
               </div>
               
               {/* Age categorization */}
               <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
                 <span className="text-3xs font-extrabold text-gray-400 tracking-wider uppercase">Yaş Dağılımı</span>
                 <div className="space-y-2">
                   <div>
                     <div className="flex justify-between text-3xs font-bold text-gray-600 mb-1">
                       <span>11-12 Yaş</span>
                       <span>{ageDist['11-12']} Katılımcı (%{Math.round((ageDist['11-12'] / totalCount) * 100)})</span>
                     </div>
                     <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-emerald-600 h-full" style={{ width: `${(ageDist['11-12'] / (totalCount || 1)) * 100}%` }}></div>
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between text-3xs font-bold text-gray-600 mb-1">
                       <span>13-14 Yaş</span>
                       <span>{ageDist['13-14']} Katılımcı (%{Math.round((ageDist['13-14'] / totalCount) * 100)})</span>
                     </div>
                     <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-emerald-600 h-full" style={{ width: `${(ageDist['13-14'] / (totalCount || 1)) * 100}%` }}></div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* Right Column: System Logs & Mini Info */}
        <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
             <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-blue-600" />
                Son Sistem İşlemleri
             </h3>
             <div className="space-y-4 flex-1">
               {logs.slice(0, 7).map(log => (
                 <div key={log.id} className="relative pl-4 border-l-2 border-gray-200">
                   <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-gray-300 border-2 border-white"></div>
                   <p className="text-xs font-bold text-gray-800">{log.action}</p>
                   <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{log.details}</p>
                   <span className="text-[9px] text-gray-400 font-mono mt-1 block">
                     {new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} • {log.userName || (log as any).user}
                   </span>
                 </div>
               ))}
             </div>
             <button onClick={() => setActiveMainTab('sistem')} className="w-full mt-4 py-2 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-center cursor-pointer border border-gray-200">
               Tüm Kayıtları Gör
             </button>
           </div>
        </div>
      </div>

      {/* Print Warning Modal for iframe */}
      {showPrintWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-gray-900">PDF Rapor Oluşturma</h3>
            <p className="text-sm text-gray-600">
              Uygulama şu anda önizleme modunda (iframe) çalışmaktadır. Raporu yazdırabilmek veya PDF olarak kaydedebilmek için lütfen uygulamayı <strong>yeni bir sekmede</strong> açınız.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => setShowPrintWarning(false)}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-xl transition cursor-pointer"
              >
                Anladım, Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outlook Calendar Sync Modal */}
      {isOutlookCalendarModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600 animate-spin-slow" /> Outlook Calendar API Program Entegrasyonu
              </h2>
              <button onClick={() => setIsOutlookCalendarModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition cursor-pointer text-sm font-bold">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Outlook Auth Status Section */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-150 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300">Outlook API Bağlantı Durumu</h3>
                  {gUser ? (
                    <div className="flex items-center gap-1.5 mt-1 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{gUser.email} adresi ile bağlandı</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Outlook Takvimine bağlanarak etkinliklerinizi otomatik senkronize edin.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {gUser ? (
                    <button
                      onClick={async () => {
                        await logoutMicrosoft();
                        setGUser(null);
                        setGCalendars([]);
                        setGEvents([]);
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-3xs font-extrabold rounded-lg transition cursor-pointer"
                    >
                      Oturumu Kapat
                    </button>
                  ) : (
                    <button
                      onClick={handleLoadCalendars}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-3xs font-extrabold rounded-lg transition shadow-sm cursor-pointer"
                    >
                      Outlook Hesabını Bağla
                    </button>
                  )}
                </div>
              </div>

              {/* Troubleshoot Help Trigger */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTroubleshootPanel(prev => !prev)}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Bağlantı Sorunu mu Yaşıyorsunuz? Iframe / Pop-up Çözümleri
                </button>
              </div>

              {/* Troubleshooting & Manual Token input */}
              {(showTroubleshootPanel || showManualTokenField) && (
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900 space-y-3 text-xs text-left">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-600" /> Iframe Pop-up Bağlantı Yardımcısı
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTroubleshootPanel(false);
                        setShowManualTokenField(false);
                      }}
                      className="text-blue-500 hover:text-blue-700 font-bold"
                    >
                      Gizle
                    </button>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[11px]">
                    Önizleme ekranı iframe kısıtlamalarına tabi olduğu için Outlook popup giriş penceresi engellenmiş olabilir. Bu engeli aşmak için aşağıdaki çözüm yöntemlerinden birini kullanabilirsiniz:
                  </p>

                  <div className="space-y-3.5 pt-1">
                    {/* Method 1 */}
                    <div className="space-y-1">
                      <p className="font-bold text-gray-800 dark:text-gray-200">Yöntem 1: Uygulamayı Yeni Sekmede Aç (Önerilen)</p>
                      <p className="text-gray-500 dark:text-gray-450 text-[10px]">Pop-up penceresinin ve çerezlerin sorunsuz çalışması için uygulamayı yeni sekmede açın ve orada bağlanın:</p>
                      <a
                        href={window.location.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded transition shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" /> Uygulamayı Yeni Sekmede Aç
                      </a>
                    </div>

                    {/* Method 2 */}
                    <div className="space-y-1.5 pt-1.5 border-t border-blue-100 dark:border-blue-900">
                      <p className="font-bold text-gray-800 dark:text-gray-200">Yöntem 2: Manuel Access Token Girişi</p>
                      <p className="text-gray-500 dark:text-gray-450 text-[10px]">Outlook OAuth Playground veya konsoldan edindiğiniz geçici Erişim Anahtarını (Access Token) doğrudan yapıştırın:</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="ya29.a0Acv..."
                          value={manualTokenInput}
                          onChange={(e) => setManualTokenInput(e.target.value)}
                          className="flex-1 p-1.5 border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-850 rounded text-3xs font-mono dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveManualToken(manualTokenInput)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded transition shrink-0 cursor-pointer"
                        >
                          Token Kaydet
                        </button>
                      </div>
                    </div>

                    {/* Method 3 */}
                    <div className="space-y-1 pt-1.5 border-t border-blue-100 dark:border-blue-900">
                      <p className="font-bold text-gray-800 dark:text-gray-200">Yöntem 3: Demo Fallback Modu ile Devam Et</p>
                      <p className="text-gray-500 dark:text-gray-450 text-[10px]">Takvim işlevlerini simüle edilmiş gerçekçi Yeşilay/Zümrüdüanka etkinlikleriyle denemek için demo modunu kullanın:</p>
                      <button
                        type="button"
                        onClick={() => {
                          setGUser({ email: 'demo-baglanti@yesilay.org.tr', displayName: 'Yeşilay KYS Demo' });
                          setGCalendars([{ id: 'primary', summary: 'Zümrüd-ü Anka Kamp Takvimi (Demo)', primary: true }]);
                          setGSuccessMsg('Demo takvimi başarıyla yüklendi! Gerçekçi örnek etkinlikleri aşağıda görebilirsiniz.');
                          setGError(null);
                          setShowTroubleshootPanel(false);
                          setShowManualTokenField(false);
                          fetchDashboardCalendarEvents();
                        }}
                        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white font-bold text-[10px] rounded transition shadow-sm cursor-pointer"
                      >
                        Demo Bağlantısını Etkinleştir
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error & Success Alerts */}
              {gError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2 text-left">
                  <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce text-red-600" />
                  <span>{gError}</span>
                </div>
              )}
              {gSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2 text-left">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{gSuccessMsg}</span>
                </div>
              )}

              {/* Calendar Selector and Fetch Events */}
              {gUser && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Eşitlenecek Outlook Takvimi</label>
                      <select
                        value={selectedCalendarId}
                        onChange={(e) => setSelectedCalendarId(e.target.value)}
                        className="w-full p-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 rounded-lg text-xs font-semibold focus:outline-emerald-600"
                      >
                        {gCalendars.length === 0 ? (
                          <option value="primary">Varsayılan Takvim (Primary)</option>
                        ) : (
                          gCalendars.map(cal => (
                            <option key={cal.id} value={cal.id}>
                              {cal.summary} {cal.primary ? '(Birincil)' : ''}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleFetchOutlookEvents}
                        disabled={gIsLoading}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${gIsLoading ? 'animate-spin' : ''}`} />
                        {gIsLoading ? 'Yükleniyor...' : 'Etkinlikleri Çek'}
                      </button>
                    </div>
                  </div>

                  {/* Calendar List Results */}
                  {gEvents.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-3xs font-extrabold text-gray-400 uppercase">Bulunan Outlook Etkinlikleri (Son 30 Gün)</h4>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">
                          {gEvents.length} Etkinlik
                        </span>
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto border border-gray-150 rounded-lg divide-y divide-gray-100 bg-gray-50/50 p-2 space-y-1">
                        {gEvents.map((ge) => {
                          const startT = ge.start?.dateTime ? ge.start.dateTime + "Z" : '';
                          const timeStr = startT ? new Date(startT).toLocaleString('tr-TR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Tüm Gün';
                          return (
                            <div key={ge.id} className="p-2 flex items-center justify-between text-3xs hover:bg-white rounded transition">
                              <div>
                                <p className="font-bold text-gray-800">{ge.subject || 'Başlıksız Etkinlik'}</p>
                                <p className="text-gray-400 mt-0.5 font-semibold">{timeStr} • {ge.location?.displayName || 'Konum Belirtilmemiş'}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          onClick={() => setGEvents([])}
                          className="px-4 py-2 border border-gray-200 text-xs font-bold text-gray-500 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                        >
                          Seçimi Temizle
                        </button>
                        <button
                          onClick={handleSyncEventsToKYS}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          KYS Programına Aktar (Eşitle)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Activity Addition Modal */}
      {isAddActivityModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Yeni Kamp Aktivitesi Ekle
              </h2>
              <button onClick={() => setIsAddActivityModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition cursor-pointer text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualActivity} className="p-5 space-y-4">
              <div>
                <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Aktivite Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: Sabah Sporu, Teknoloji Semineri"
                  value={newActTitle}
                  onChange={(e) => setNewActTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 bg-white rounded-lg focus:outline-emerald-600 font-semibold text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Aktivite Türü</label>
                  <select
                    value={newActType}
                    onChange={(e) => setNewActType(e.target.value as any)}
                    className="w-full p-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold"
                  >
                    <option value="Eğitim">Eğitim</option>
                    <option value="Spor">Spor</option>
                    <option value="Atölye">Atölye</option>
                    <option value="Seminer">Seminer</option>
                    <option value="Eğlence">Eğlence</option>
                  </select>
                </div>
                <div>
                  <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Konum</label>
                  <input
                    type="text"
                    value={newActLocation}
                    onChange={(e) => setNewActLocation(e.target.value)}
                    className="w-full p-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Tarih</label>
                  <input
                    type="date"
                    value={newActDate}
                    onChange={(e) => setNewActDate(e.target.value)}
                    className="w-full p-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Saat</label>
                  <input
                    type="time"
                    value={newActTime}
                    onChange={(e) => setNewActTime(e.target.value)}
                    className="w-full p-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-150 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-xs font-bold text-gray-500 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer"
                >
                  Programı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kamp Aktivitesi Detay Modalı */}
      {selectedDetailedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 transform transition-all duration-200 scale-100">
            {/* Modal Header ile Dinamik Renk Bandı */}
            {(() => {
              const act = selectedDetailedEvent;
              const actDate = new Date(act.dateTime);
              const dateStr = actDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
              const timeStr = actDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

              let headerBg = 'bg-gray-50 text-gray-800';
              let typeBadge = 'bg-gray-100 text-gray-800 border-gray-200';
              let iconColor = 'text-gray-500';

              if (act.type === 'Spor') {
                headerBg = 'bg-sky-50 text-sky-900 border-sky-100';
                typeBadge = 'bg-sky-100/80 text-sky-800 border-sky-200';
                iconColor = 'text-sky-600';
              } else if (act.type === 'Atölye') {
                headerBg = 'bg-amber-50 text-amber-900 border-amber-100';
                typeBadge = 'bg-amber-100/80 text-amber-800 border-amber-200';
                iconColor = 'text-amber-600';
              } else if (act.type === 'Eğitim') {
                headerBg = 'bg-emerald-50 text-emerald-900 border-emerald-100';
                typeBadge = 'bg-emerald-100/80 text-emerald-800 border-emerald-200';
                iconColor = 'text-emerald-600';
              } else if (act.type === 'Seminer') {
                headerBg = 'bg-purple-50 text-purple-900 border-purple-100';
                typeBadge = 'bg-purple-100/80 text-purple-800 border-purple-200';
                iconColor = 'text-purple-600';
              } else if (act.type === 'Eğlence') {
                headerBg = 'bg-pink-50 text-pink-900 border-pink-100';
                typeBadge = 'bg-pink-100/80 text-pink-800 border-pink-200';
                iconColor = 'text-pink-600';
              }

              const handleCopy = () => {
                const textToCopy = `Aktivite: ${act.title}\nTür: ${act.type}\nTarih: ${dateStr} - ${timeStr}\nKonum: ${act.location}\nEğitmen: ${act.instructorId}`;
                navigator.clipboard.writeText(textToCopy);
                setActDetailsCopied(true);
                setTimeout(() => setActDetailsCopied(false), 2000);
              };

              return (
                <>
                  <div className={`p-5 border-b flex items-start justify-between gap-4 ${headerBg}`}>
                    <div className="space-y-1.5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border tracking-wide uppercase inline-block ${typeBadge}`}>
                        {act.type}
                      </span>
                      <h3 className="text-base font-black tracking-tight text-gray-950 leading-snug">
                        {act.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedDetailedEvent(null)}
                      className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center transition border border-gray-150 cursor-pointer text-xs"
                      title="Kapat"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Tarih ve Zaman */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl bg-white border border-gray-100 shadow-3xs ${iconColor}`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Tarih ve Saat</p>
                        <p className="text-xs font-bold text-gray-805">{dateStr}</p>
                        <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {timeStr}
                        </p>
                      </div>
                    </div>

                    {/* Konum */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl bg-white border border-gray-100 shadow-3xs ${iconColor}`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Konum / Salon</p>
                        <p className="text-xs font-bold text-gray-850">{act.location || 'Belirtilmedi'}</p>
                      </div>
                    </div>

                    {/* Eğitmen */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl bg-white border border-gray-100 shadow-3xs ${iconColor}`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Sorumlu Eğitmen</p>
                        <p className="text-xs font-bold text-gray-850">{act.instructorId || 'Atanmadı'}</p>
                      </div>
                    </div>

                    {/* Alt İşlemler */}
                    <div className="pt-5 border-t border-gray-100 mt-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 border border-gray-200 cursor-pointer shadow-3xs"
                        >
                          {actDetailsCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Kopyalandı
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Kopyala
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Bu aktiviteyi kamp programından silmek istediğinize emin misiniz?')) {
                              handleRemoveActivity(act.id);
                              setSelectedDetailedEvent(null);
                            }
                          }}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 border border-red-200/40 cursor-pointer shadow-3xs"
                          title="Aktiviteyi sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Sil
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedDetailedEvent(null)}
                        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Survey Configuration Modal */}
      {isSurveyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" /> Anket Gönderim Konfigürasyonu
              </h2>
              <button onClick={() => setIsSurveyModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSendSurveySubmit} className="p-5 space-y-5">
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <h3 className="font-bold text-emerald-900 text-sm mb-1">Kapsamlı Değerlendirme Anketi</h3>
                  <p className="text-xs text-emerald-700">Genel Memnuniyet, Tesis & Konaklama ve Eğitim & Etkinlik değerlendirmelerini ve katılımcı görüşlerini tek başlıkta toplar.</p>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Hedef Kitle</label>
                  <select 
                    value={surveyAudience}
                    onChange={(e) => setSurveyAudience(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 text-sm"
                  >
                    <option value="all">Tüm Kayıtlı Katılımcılar (Bu Dönem)</option>
                    <option value="checked-out">Sadece Çıkış (Check-out) Yapanlar</option>
                    <option value="parents">Katılımcı Velileri</option>
                  </select>
                </div>

                {/* Channel */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">İletişim Kanalı</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="channel" 
                        value="sms" 
                        checked={surveyChannel === 'sms'}
                        onChange={(e) => setSurveyChannel(e.target.value)}
                        className="text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-sm font-medium text-gray-700">SMS ile Gönder</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="channel" 
                        value="email" 
                        checked={surveyChannel === 'email'}
                        onChange={(e) => setSurveyChannel(e.target.value)}
                        className="text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-sm font-medium text-gray-700">E-posta</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="channel" 
                        value="both" 
                        checked={surveyChannel === 'both'}
                        onChange={(e) => setSurveyChannel(e.target.value)}
                        className="text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-sm font-medium text-gray-700">Her İkisi (SMS + E-posta)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Survey Preview Area */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Önizleme ({surveyChannel === 'sms' ? 'SMS' : surveyChannel === 'email' ? 'E-posta' : surveyChannel === 'whatsapp' ? 'WhatsApp' : 'Tüm Kanallar'})</h4>
                  {currentUser?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => setIsSurveyEditMode(!isSurveyEditMode)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                    >
                      {isSurveyEditMode ? 'Kaydet' : 'Düzenle'}
                    </button>
                  )}
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm text-sm text-gray-700 dark:text-gray-300">
                  <p>
                    Merhaba, Yeşilay {activeCenter?.name || 'Kampı'} katılımınız için teşekkür ederiz!
                  </p>
                  {isSurveyEditMode ? (
                    <textarea
                      value={surveyTemplates.kapsamli}
                      onChange={(e) => setSurveyTemplates({ kapsamli: e.target.value })}
                      className="mt-2 w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 text-sm"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-2 text-indigo-700 bg-indigo-50 p-2 rounded-lg font-medium border border-indigo-100">
                      {surveyTemplates.kapsamli}
                    </p>
                  )}
                  <p className="mt-2 text-indigo-600 dark:text-indigo-400 cursor-pointer underline">
                    https://kamplar.yesilay.org.tr/anket/x7y8z9
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setIsSurveyModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Gönderimi Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Period Detail Modal */}
      {selectedPeriodDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{selectedPeriodDetail.name}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedPeriodDetail.isActive ? 'bg-emerald-100 text-emerald-800' : 
                  selectedPeriodDetail.status === 'Tamamlandı' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedPeriodDetail.isActive ? 'Aktif' : selectedPeriodDetail.status}
                </span>
              </div>
              <button 
                onClick={() => setSelectedPeriodDetail(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Tarih</span>
                  <span className="font-semibold">{new Date(selectedPeriodDetail.startDate).toLocaleDateString()} - {new Date(selectedPeriodDetail.endDate).toLocaleDateString()}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Kota</span>
                  <span className="font-semibold">{selectedPeriodDetail.maxQuota} Kişi</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Cinsiyet Grubu</span>
                  <span className="font-semibold">{selectedPeriodDetail.gender || 'Karışık/Aile'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Yaş Aralığı</span>
                  <span className="font-semibold">{selectedPeriodDetail.minAge && selectedPeriodDetail.maxAge ? `${selectedPeriodDetail.minAge} - ${selectedPeriodDetail.maxAge} Yaş` : 'Kısıtlama Yok'}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <span className="block text-[10px] font-bold text-amber-600 uppercase mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Kriterler / Başvuru Uyarıları
                </span>
                <p className="font-medium text-amber-900 text-xs">
                  {selectedPeriodDetail.criteria || 'Özel bir kriter veya uyarı eklenmemiş.'}
                </p>
              </div>

              <div 
                className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 cursor-pointer hover:bg-emerald-100/50 transition-colors"
                onClick={() => setShowPeriodParticipants(!showPeriodParticipants)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="block text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Başvuru Özeti
                  </span>
                  {showPeriodParticipants ? <ChevronUp className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="font-medium text-emerald-900 text-xs">
                  {selectedPeriodDetail.status === 'Tamamlandı' ? (
                     `Kamp ${new Date(selectedPeriodDetail.endDate).toLocaleDateString()} tarihinde tamamlandı. Toplam ${participants.filter(p => p.campPeriodId === selectedPeriodDetail.id).length} katılımcı katıldı.`
                  ) : selectedPeriodDetail.isActive ? (
                     `Şu anda aktif. Toplam ${participants.filter(p => p.campPeriodId === selectedPeriodDetail.id && p.status === 'Kampta').length} kişi kampta bulunuyor. Kota doluluk oranı: ${Math.round((participants.filter(p => p.campPeriodId === selectedPeriodDetail.id && p.status === 'Kampta').length / selectedPeriodDetail.maxQuota) * 100)}%`
                  ) : (
                     `Toplam ${participants.filter(p => p.campPeriodId === selectedPeriodDetail.id && p.status === 'Başvuru Yapıldı').length} başvuru alındı. Henüz başlamadı.`
                  )}
                </p>
                
                {showPeriodParticipants && (
                  <div className="mt-4 pt-3 border-t border-emerald-200/50" onClick={e => e.stopPropagation()}>
                    <h4 className="text-xs font-bold text-emerald-800 mb-2 flex justify-between items-center">
                      <span>Başvurular ({participants.filter(p => p.campPeriodId === selectedPeriodDetail.id).length})</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPeriodDetail(null);
                          setActiveMainTab('katilimci');
                        }}
                        className="text-[9px] bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 transition"
                      >
                        Tümünü Gör
                      </button>
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                      {participants.filter(p => p.campPeriodId === selectedPeriodDetail.id).length > 0 ? (
                        participants.filter(p => p.campPeriodId === selectedPeriodDetail.id).map(p => (
                          <div 
                            key={p.id} 
                            className="bg-white p-2 rounded border border-emerald-100 flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedParticipantDetail(p);
                            }}
                          >
                            <div>
                              <p className="text-xs font-bold text-gray-800 hover:text-emerald-700 transition-colors">{p.name}</p>
                              <p className="text-[10px] text-gray-500">{p.identityNumber} - {p.gender}</p>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                              p.status === 'Kampta' ? 'bg-emerald-100 text-emerald-700' :
                              p.status === 'Ayrıldı' ? 'bg-blue-100 text-blue-700' :
                              p.status === 'Reddedildi' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {p.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-emerald-700 text-center py-2">Henüz başvuru bulunmuyor.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
               <button onClick={() => setSelectedPeriodDetail(null)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm cursor-pointer">
                 Kapat
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Period Modal */}
      {editingPeriod && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl my-8">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Kamp Dönemi Düzenle</h3>
                <p className="text-xs text-gray-500 mt-1">Dönem bilgilerini buradan güncelleyebilirsiniz.</p>
              </div>
              <button 
                onClick={() => setEditingPeriod(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePeriod} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Dönem Adı *</label>
                <input
                  type="text"
                  value={editingPeriod.name}
                  onChange={(e) => setEditingPeriod({...editingPeriod, name: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Başlangıç *</label>
                  <input
                    type="date"
                    value={editingPeriod.startDate}
                    onChange={(e) => setEditingPeriod({...editingPeriod, startDate: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bitiş *</label>
                  <input
                    type="date"
                    value={editingPeriod.endDate}
                    onChange={(e) => setEditingPeriod({...editingPeriod, endDate: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kota *</label>
                  <input
                    type="number"
                    value={editingPeriod.maxQuota}
                    onChange={(e) => setEditingPeriod({...editingPeriod, maxQuota: parseInt(e.target.value)})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cinsiyet Grubu *</label>
                  <select
                    value={editingPeriod.gender || 'Karışık/Aile'}
                    onChange={(e) => setEditingPeriod({...editingPeriod, gender: e.target.value as any})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="Erkek">Erkek</option>
                    <option value="Kadın">Kadın</option>
                    <option value="Karışık/Aile">Karışık/Aile</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Min. Yaş</label>
                  <input
                    type="number"
                    value={editingPeriod.minAge || ''}
                    onChange={(e) => setEditingPeriod({...editingPeriod, minAge: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Max. Yaş</label>
                  <input
                    type="number"
                    value={editingPeriod.maxAge || ''}
                    onChange={(e) => setEditingPeriod({...editingPeriod, maxAge: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Kriterler / Başvuru Uyarıları</label>
                <textarea
                  value={editingPeriod.criteria || ''}
                  onChange={(e) => setEditingPeriod({...editingPeriod, criteria: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  rows={3}
                ></textarea>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingPeriod(null)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm cursor-pointer">
                  İptal
                </button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 cursor-pointer transition">
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participant Detail Modal */}
      {selectedParticipantDetail && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-600 p-4 flex justify-between items-start text-white">
              <div>
                <h3 className="font-bold text-lg">{selectedParticipantDetail.name}</h3>
                <p className="text-xs opacity-90">{selectedParticipantDetail.identityNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedParticipantDetail(null)}
                className="p-1 text-white hover:bg-emerald-500 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="block text-[9px] font-bold text-gray-500 uppercase">Cinsiyet</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedParticipantDetail.gender}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="block text-[9px] font-bold text-gray-500 uppercase">Doğum Tarihi</span>
                  <span className="font-bold text-gray-800 text-sm">{new Date(selectedParticipantDetail.birthDate).toLocaleDateString()}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="block text-[9px] font-bold text-gray-500 uppercase">İletişim No</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedParticipantDetail.phone || '-'}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="block text-[9px] font-bold text-gray-500 uppercase">Kategori</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedParticipantDetail.category}</span>
                </div>
              </div>

              {(selectedParticipantDetail.allergies !== 'Yok' || selectedParticipantDetail.chronicDiseases !== 'Yok' || selectedParticipantDetail.medications !== 'Yok') && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                  <span className="block text-[10px] font-bold text-amber-800 uppercase mb-2 flex items-center gap-1">
                    <HeartPulse className="w-3 h-3" />
                    Sağlık Bilgileri
                  </span>
                  <div className="space-y-1 text-xs text-amber-900">
                    {selectedParticipantDetail.allergies !== 'Yok' && <p><strong>Alerji:</strong> {selectedParticipantDetail.allergies}</p>}
                    {selectedParticipantDetail.chronicDiseases !== 'Yok' && <p><strong>Kronik:</strong> {selectedParticipantDetail.chronicDiseases}</p>}
                    {selectedParticipantDetail.medications !== 'Yok' && <p><strong>İlaçlar:</strong> {selectedParticipantDetail.medications}</p>}
                  </div>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedParticipantDetail.status === 'Kampta' ? 'bg-emerald-100 text-emerald-800' :
                  selectedParticipantDetail.status === 'Reddedildi' ? 'bg-red-100 text-red-800' :
                  selectedParticipantDetail.status === 'Ayrıldı' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {selectedParticipantDetail.status}
                </span>
                
                <button 
                  onClick={() => {
                    setSelectedParticipantDetail(null);
                    setSelectedPeriodDetail(null);
                    setActiveMainTab('katilimci');
                  }}
                  className="text-emerald-700 text-xs font-bold hover:underline"
                >
                  Detaylı Profili Gör
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY: Dönem Sonu Verimlilik Raporu */}
      <div className="hidden print:block text-black bg-white">
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
          <h1 className="text-3xl font-black mb-2">YEŞİLAY KAMP YÖNETİM SİSTEMİ</h1>
          <h2 className="text-2xl font-bold">Dönem Sonu Verimlilik Raporu</h2>
          <p className="text-sm mt-2 font-medium">Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Katılımcı İstatistikleri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-300 rounded">
                <p className="text-sm text-gray-500">Toplam Başvuru</p>
                <p className="text-3xl font-black">{participants.length}</p>
              </div>
              <div className="p-4 border border-gray-300 rounded">
                <p className="text-sm text-gray-500">Kampa Katılan</p>
                <p className="text-3xl font-black">{participants.filter(p => p.status === 'Kampta' || p.status === 'Ayrıldı').length}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Finansal Özet (Giderler)</h3>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="py-2">Kategori</th>
                  <th className="py-2">Tutar (TL)</th>
                </tr>
              </thead>
              <tbody>
                {['Konaklama', 'Yemek', 'Ulaşım', 'Aktivite', 'Personel', 'Genel Gider'].map(cat => {
                  const total = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
                  if (total === 0) return null;
                  return (
                    <tr key={cat} className="border-b border-gray-200">
                      <td className="py-2">{cat}</td>
                      <td className="py-2 font-bold">{total.toLocaleString('tr-TR')} ₺</td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-gray-800 font-bold bg-gray-100">
                  <td className="py-2 px-2">Genel Toplam</td>
                  <td className="py-2 px-2">{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('tr-TR')} ₺</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Memnuniyet Anketleri Ortalaması</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border border-gray-300 rounded text-center">
                <p className="text-sm text-gray-500 mb-1">Yemek</p>
                <p className="text-2xl font-black">{surveys.length ? (surveys.reduce((sum, s) => sum + s.ratingMeals, 0) / surveys.length).toFixed(1) : '-'} / 5</p>
              </div>
              <div className="p-4 border border-gray-300 rounded text-center">
                <p className="text-sm text-gray-500 mb-1">Aktivite</p>
                <p className="text-2xl font-black">{surveys.length ? (surveys.reduce((sum, s) => sum + s.ratingActivities, 0) / surveys.length).toFixed(1) : '-'} / 5</p>
              </div>
              <div className="p-4 border border-gray-300 rounded text-center">
                <p className="text-sm text-gray-500 mb-1">Tesis</p>
                <p className="text-2xl font-black">{surveys.length ? (surveys.reduce((sum, s) => sum + s.ratingBungalows, 0) / surveys.length).toFixed(1) : '-'} / 5</p>
              </div>
              <div className="p-4 border border-gray-300 rounded text-center">
                <p className="text-sm text-gray-500 mb-1">Eğitmenler</p>
                <p className="text-2xl font-black">{surveys.length ? (surveys.reduce((sum, s) => sum + s.ratingTrainers, 0) / surveys.length).toFixed(1) : '-'} / 5</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
