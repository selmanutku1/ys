/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ThemePalette, getThemeCSS } from './themeColors';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INITIAL_CAMP_CENTERS, 
  INITIAL_BUNGALOWS, 
  INITIAL_STAFF, 
  INITIAL_GROUPS, 
  INITIAL_CAMP_PERIODS, 
  INITIAL_PARTICIPANTS,
  INITIAL_PARTICIPANTS_COMBINED,
  INITIAL_HEALTH_INCIDENTS, 
  INITIAL_MEAL_PLANS, 
  INITIAL_ACTIVITIES, 
  INITIAL_LOGS,
  INITIAL_INCIDENTS, 
  INITIAL_SURVEYS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EXPENSES,
  INITIAL_TASKS,
  INITIAL_SHIFTS
} from './data';

import { 
  CampCenter, 
  Bungalow, 
  Staff, 
  Group, 
  CampPeriod, 
  Participant, 
  HealthIncident, 
  MealPlan, 
  CampActivity, 
  SystemLog, 
  SurveyResponse,
  AppNotification,
  Expense,
  Task,
  ShiftAssignment,
  CampIncident
} from './types';

// Importing our modular sub-views
import DashboardView from './components/DashboardView';
import ReportsView from './components/ReportsView';
import OfflineBanner from './components/OfflineBanner';
import PeriodManagementView from './components/PeriodManagementView';
import BungalowView from './components/BungalowView';
import ParticipantView from './components/ParticipantView';
import RegistrationView from './components/RegistrationView';
import HealthView from './components/HealthView';
import DocumentationTab from './components/DocumentationTab';
import SettingsView from './components/SettingsView';
import YemekhaneView from './components/YemekhaneView';
import TechnicalOperationsView from './components/TechnicalOperationsView';
import CostAnalysisView from './components/CostAnalysisView';
import GuvenlikView from './components/GuvenlikView';
import SystemLogsView from './components/SystemLogsView';
import DijitalArsivView from './components/DijitalArsivView';
import IncidentLogsView from './components/IncidentLogsView';
import SurveyAnalysisView from './components/SurveyAnalysisView';
import SurveyManagementView from './components/SurveyManagementView';
import KampSonuDegerlendirmeRaporu from './components/KampSonuDegerlendirmeRaporu';
import LoginView from './components/LoginView';
import SystemUpdatesView from './components/SystemUpdatesView';
import PublicCalendarView from './components/PublicCalendarView';
import { OnboardingGuide } from './components/OnboardingGuide';
import UserProfileModal from './components/UserProfileModal';
import Screensaver from './components/Screensaver';
import YesilAiChatbot from "./components/YesilAiChatbot";
import KahootQuestionPoolView from './components/KahootQuestionPoolView';
import KampLiderleriDefteriView from './components/KampLiderleriDefteriView';

// Lucide icons
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  FileText, 
  HeartHandshake, 
  UtensilsCrossed, 
  BookOpen, 
  Activity, 
  Building2,
  AlertOctagon, 
  Compass, 
  ArrowRight,
  TrendingDown,
  CalendarDays,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wrench,
  Menu,
  X,
  Coins,
  LogIn,
  LogOut,
  Lock,
  User,
  Shield,
  Bell,
  Moon,
  Info,
  Printer,
  Sun,
  Monitor,
  Terminal,
  Archive,
  Command,
  Search,
  Save,
  CheckCircle2,
  Calendar,
  Maximize2,
  Minimize2,
  Trash2,
  Check,
  Volume2,
  VolumeX,
  Filter, HelpCircle,
  Sparkles,
  Plus, BarChart2,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';

export interface LoginUser {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'mudur' | 'kayit' | 'saglik' | 'yemekhane' | 'teknik' | 'guvenlik' | 'gonullu';
  roleName: string;
  allowedTabs: ('dashboard' | 'kamp-planlama' | 'bungalov' | 'katilimci' | 'kayit' | 'revir' | 'yemekhane' | 'teknik' | 'guvenlik' | 'dokümanlar' | 'ayarlar' | 'maliyet' | 'anket-analizi' | 'anket-yonetimi' | 'sistem-loglari' | 'dijital-arsiv' | 'olay-kayit' | 'sistem-guncellemeleri' | 'raporlar' | 'kahoot')[];
  password: string;
}

export const USERS_LIST: LoginUser[] = [
  {
    id: 'ADMIN2',
    name: 'Mahmut Çelik',
    username: 'mahmut',
    role: 'mudur',
    roleName: 'Kamp Operasyonları',
    allowedTabs: ['dashboard', 'kamp-planlama', 'bungalov', 'katilimci', 'kayit', 'revir', 'yemekhane', 'teknik', 'guvenlik', 'maliyet', 'anket-analizi', 'anket-yonetimi', 'dokümanlar', 'ayarlar', 'sistem-loglari', 'dijital-arsiv', 'olay-kayit', 'sistem-guncellemeleri', 'raporlar'],
    password: '55c5de31ec754ba40fb1687ff4f4e0d95142f5ca2765c4839b618329190a434b'
  },
  {
    id: 'ADMIN',
    name: 'Selman UTKU',
    username: 'admin',
    role: 'admin',
    roleName: 'Sistem Yöneticisi',
    allowedTabs: ['dashboard', 'kamp-planlama', 'bungalov', 'katilimci', 'kayit', 'revir', 'yemekhane', 'teknik', 'guvenlik', 'maliyet', 'anket-analizi', 'anket-yonetimi', 'dokümanlar', 'ayarlar', 'sistem-loglari', 'dijital-arsiv', 'olay-kayit', 'sistem-guncellemeleri', 'raporlar'],
    password: '55c5de31ec754ba40fb1687ff4f4e0d95142f5ca2765c4839b618329190a434b'
  },
  {
    id: 'S01',
    name: 'İnan BAYRAMOĞLU',
    username: 'mudur',
    role: 'mudur',
    roleName: 'Kamp Müdürü',
    allowedTabs: ['dashboard', 'kamp-planlama', 'bungalov', 'katilimci', 'revir', 'yemekhane', 'teknik', 'guvenlik', 'maliyet', 'anket-analizi', 'anket-yonetimi', 'dokümanlar', 'ayarlar', 'dijital-arsiv', 'olay-kayit', 'sistem-guncellemeleri', 'raporlar'],
    password: '55c5de31ec754ba40fb1687ff4f4e0d95142f5ca2765c4839b618329190a434b'
  },
  {
    id: 'S02',
    name: 'Canan Özdemir',
    username: 'kayit',
    role: 'kayit',
    roleName: 'Kayıt ve Yerleşim Sorumlusu',
    allowedTabs: ['bungalov', 'katilimci'],
    password: '6b5f40c09215713a1fa83ea2de2adcae17e605b8958a2d7379e15b561687ee8f'
  },
  {
    id: 'GON01',
    name: 'Gönüllü Yönetimi',
    username: 'gonullu',
    role: 'gonullu',
    roleName: 'Gönüllü Yönetimi',
    allowedTabs: ['dashboard', 'kayit', 'kamp-planlama'],
    password: '6b5f40c09215713a1fa83ea2de2adcae17e605b8958a2d7379e15b561687ee8f'
  },
  {
    id: 'S06',
    name: 'Hemşire Elif Aslan',
    username: 'saglik',
    role: 'saglik',
    roleName: 'Sağlık Görevlisi',
    allowedTabs: ['revir', 'katilimci', 'olay-kayit'],
    password: '6b5f40c09215713a1fa83ea2de2adcae17e605b8958a2d7379e15b561687ee8f'
  },
  {
    id: 'S09',
    name: 'Adem Usta',
    username: 'yemekhane',
    role: 'yemekhane',
    roleName: 'Yemekhane Sorumlusu',
    allowedTabs: ['yemekhane'],
    password: '6b5f40c09215713a1fa83ea2de2adcae17e605b8958a2d7379e15b561687ee8f'
  },
  {
    id: 'S10',
    name: 'Mehmet Teknik',
    username: 'teknik',
    role: 'teknik',
    roleName: 'Teknik Sorumlu',
    allowedTabs: ['teknik'],
    password: '6b5f40c09215713a1fa83ea2de2adcae17e605b8958a2d7379e15b561687ee8f'
  },
  {
    id: 'S11',
    name: 'Ahmet Güvenlik',
    username: 'guvenlik',
    role: 'guvenlik',
    roleName: 'Güvenlik Sorumlusu',
    allowedTabs: ['guvenlik', 'katilimci', 'olay-kayit'],
    password: '6b5f40c09215713a1fa83ea2de2adcae17e605b8958a2d7379e15b561687ee8f'
  }
];

const SidebarNavItem = ({
  id,
  label,
  icon: Icon,
  isActive,
  isSidebarCollapsed,
  onClick,
  isDanger = false,
  extraContent = null
}: any) => {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      title={label}
      className={`relative flex items-center rounded-xl text-xs font-bold transition-colors text-left ${
        isSidebarCollapsed ? 'lg:justify-center lg:px-2 py-2.5' : 'px-3 py-2.5 gap-3'
      } ${
        isActive 
          ? (isDanger ? 'text-white' : 'text-white') 
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bg"
          className={`absolute inset-0 rounded-xl shadow-xs ${isDanger ? 'bg-red-600' : 'bg-emerald-700'}`}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <div className="relative z-10 flex items-center gap-3 w-full">
        <Icon className="w-4 h-4 shrink-0" />
        <span className={`flex-1 ${isSidebarCollapsed ? 'lg:hidden' : 'block'}`}>
          {label}
        </span>
        {extraContent}
      </div>
    </motion.button>
  );
};

export default function App() {
  // Master states representing KYS persistent database
  const [campCenters, setCampCenters] = useState<CampCenter[]>(INITIAL_CAMP_CENTERS);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('C01');
  
  const [bungalows, setBungalows] = useState<Bungalow[]>(INITIAL_BUNGALOWS);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [groups] = useState<Group[]>(INITIAL_GROUPS);
  
  const [periods, setPeriods] = useState<CampPeriod[]>(INITIAL_CAMP_PERIODS);
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS_COMBINED);
  const [healthIncidents, setHealthIncidents] = useState<HealthIncident[]>(INITIAL_HEALTH_INCIDENTS);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>(INITIAL_MEAL_PLANS);
  const [activities, setActivities] = useState<CampActivity[]>(INITIAL_ACTIVITIES);
  const [surveys, setSurveys] = useState<SurveyResponse[]>(INITIAL_SURVEYS);
  const [questions, setQuestions] = useState<string[]>([
    "Kamp tesisleri, bungalovlar ve konaklama kalitesini nasıl değerlendiriyorsunuz?",
    "Yemeklerin lezzeti, porsiyon miktarı ve hijyen koşullarından memnun kaldınız mı?"
  ]);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [incidents, setIncidents] = useState<CampIncident[]>(INITIAL_INCIDENTS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [shifts, setShifts] = useState<ShiftAssignment[]>(INITIAL_SHIFTS);
  const [users, setUsers] = useState<LoginUser[]>(() => {
    const saved = localStorage.getItem('kys_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as LoginUser[];
        // Perform a robust merge: ensure every default user in USERS_LIST exists by ID
        const merged = [...parsed];
        let changed = false;
        
        USERS_LIST.forEach(defaultUser => {
          const existingIdx = merged.findIndex(u => u.id === defaultUser.id || u.username === defaultUser.username);
          if (existingIdx === -1) {
            merged.push(defaultUser);
            changed = true;
          } else {
            // If the user role has changed or is updated in USERS_LIST, heal it
            if (merged[existingIdx].role !== defaultUser.role || 
                JSON.stringify(merged[existingIdx].allowedTabs) !== JSON.stringify(defaultUser.allowedTabs) ||
                merged[existingIdx].password !== defaultUser.password) {
              merged[existingIdx] = defaultUser;
              changed = true;
            }
          }
        });
        
        if (changed) {
          localStorage.setItem('kys_users', JSON.stringify(merged));
        }
        return merged;
      } catch (err) {
        console.error('Error parsing kys_users:', err);
      }
    }
    return USERS_LIST;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('kys_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [isNotifSoundEnabled, setIsNotifSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('kys_notif_sound');
    return saved !== 'false';
  });
  const [notifTabFilter, setNotifTabFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [notifSearchQuery, setNotifSearchQuery] = useState<string>('');
  const [isNotifSimulatorOpen, setIsNotifSimulatorOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'alert' | 'warning' | 'info' }[]>([]);

  // User session state
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(() => {
    const saved = localStorage.getItem('kys_current_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      const savedUsers = localStorage.getItem('kys_users');
      const activeUsersList = savedUsers ? JSON.parse(savedUsers) : USERS_LIST;
      const latestUser = activeUsersList.find((u: any) => u.id === parsed.id);
      return latestUser ? latestUser : parsed;
    }
    return null;
  });

  // Public Calendar routing state
  const [isPublicCalendar, setIsPublicCalendar] = useState<boolean>(() => {
    return window.location.pathname.endsWith('/takvim') || window.location.search.includes('view=takvim') || window.location.hash === '#takvim';
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const isPublic = window.location.pathname.endsWith('/takvim') || window.location.search.includes('view=takvim') || window.location.hash === '#takvim';
      setIsPublicCalendar(isPublic);
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Profile editing state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Synchronize users state to localStorage
  useEffect(() => {
    localStorage.setItem('kys_users', JSON.stringify(users));
  }, [users]);


  useEffect(() => {
    // Migration: Add 'raporlar' tab to admins/mudur if missing in existing localstorage users
    setUsers(prevUsers => {
      let changed = false;
      const newUsers = prevUsers.map(u => {
        if ((u.role === 'admin' || u.role === 'mudur') && !u.allowedTabs.includes('raporlar' as any)) {
          changed = true;
          return { ...u, allowedTabs: [...u.allowedTabs, 'raporlar' as any] };
        }
        return u;
      });
      if (changed && currentUser && (currentUser.role === 'admin' || currentUser.role === 'mudur' || currentUser.role === 'gonullu') && !currentUser.allowedTabs.includes('raporlar' as any)) {
         const updatedCurrentUser = newUsers.find(u => u.id === currentUser.id);
         if (updatedCurrentUser) {
            setCurrentUser(updatedCurrentUser);
            localStorage.setItem('kys_current_user', JSON.stringify(updatedCurrentUser));
         }
      }
      return changed ? newUsers : prevUsers;
    });
  }, []);

  // Automatically sync planned & active camp periods into the camp activities (takvim)
  useEffect(() => {
    const nonPeriodActivities = activities.filter(act => !act.id.startsWith('period-'));
    
    const periodActivities: CampActivity[] = [];
    periods.forEach(period => {
      // Create Start Event
      periodActivities.push({
        id: `period-start-${period.id}`,
        campCenterId: period.campCenterId,
        title: `🏁 Kamp Başlangıcı: ${period.name}`,
        type: 'Eğitim',
        dateTime: `${period.startDate}T09:00:00`,
        instructorId: 'Kamp Koordinasyonu',
        location: 'Kayıt ve Kabul Alanı'
      });
      
      // Create End Event
      periodActivities.push({
        id: `period-end-${period.id}`,
        campCenterId: period.campCenterId,
        title: `⛺ Kamp Bitişi: ${period.name}`,
        type: 'Eğitim',
        dateTime: `${period.endDate}T17:00:00`,
        instructorId: 'Kamp Koordinasyonu',
        location: 'Tüm Kamp Alanı'
      });
    });

    const currentPeriodActIds = activities.filter(act => act.id.startsWith('period-')).map(act => act.id).sort();
    const newPeriodActIds = periodActivities.map(act => act.id).sort();
    
    let hasChanged = currentPeriodActIds.length !== newPeriodActIds.length;
    if (!hasChanged) {
      for (let i = 0; i < periodActivities.length; i++) {
        const matching = activities.find(act => act.id === periodActivities[i].id);
        if (!matching || 
            matching.title !== periodActivities[i].title || 
            matching.dateTime !== periodActivities[i].dateTime || 
            matching.campCenterId !== periodActivities[i].campCenterId) {
          hasChanged = true;
          break;
        }
      }
    }

    if (hasChanged) {
      const mergedActivities = [...nonPeriodActivities, ...periodActivities];
      setActivities(mergedActivities);
      localStorage.setItem('kys_activities', JSON.stringify(mergedActivities));
      syncStateWithServer({ activities: mergedActivities });
    }
  }, [periods, activities]);

  // UI state
  type ThemeMode = 'light' | 'dark' | 'system';
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('kys_theme') as ThemeMode;
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    const oldMode = localStorage.getItem('kys_dark_mode');
    if (oldMode === 'true') return 'dark';
    if (oldMode === 'false') return 'light';
    return 'system';
  });
  
  const [colorPalette, setColorPalette] = useState<ThemePalette>(() => {
    return (localStorage.getItem('kys_color_palette') as ThemePalette) || 'emerald';
  });

  useEffect(() => {
    const handlePaletteChange = () => {
      const saved = localStorage.getItem('kys_color_palette') as ThemePalette;
      if (saved) setColorPalette(saved);
    };
    window.addEventListener('kys_color_palette_changed', handlePaletteChange);
    return () => window.removeEventListener('kys_color_palette_changed', handlePaletteChange);
  }, []);

  useEffect(() => {
    let styleEl = document.getElementById('kys-theme-override');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'kys-theme-override';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = getThemeCSS(colorPalette);
  }, [colorPalette]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isIdle, setIsIdle] = useState<boolean>(false);

  // Inactivity / Screensaver timer logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const getSettings = () => {
      const enabled = localStorage.getItem('kys_screensaver_enabled') !== 'false';
      const timeoutSec = parseInt(localStorage.getItem('kys_screensaver_timeout') || '60') || 60;
      return { enabled, timeoutMs: timeoutSec * 1000 };
    };

    let { enabled, timeoutMs } = getSettings();

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (enabled) {
        timeoutId = setTimeout(() => {
          setIsIdle(true);
        }, timeoutMs);
      }
    };

    // Any user activity will mark the user active and dismiss screensaver
    const handleActivity = () => {
      if (document.getElementById('yesilay-screensaver-overlay')) {
        return;
      }
      setIsIdle(false);
      resetTimer();
    };

    const handleSettingsChanged = () => {
      const updated = getSettings();
      enabled = updated.enabled;
      timeoutMs = updated.timeoutMs;
      resetTimer();
    };

    // Track standard user interactions
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('kys_screensaver_settings_changed', handleSettingsChanged);

    // Run initial timer
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('kys_screensaver_settings_changed', handleSettingsChanged);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.error("Fullscreen request failed:", err);
          alert("Tam ekran moduna geçilemedi. Uygulamayı yeni sekmede açmayı deneyin.");
        });
      } else {
        alert("Tarayıcınız tam ekran modunu desteklemiyor.");
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error("Exit fullscreen failed:", err);
        });
      }
    }
  };

  // Initialize onboarding when user logs in or page reloads
  useEffect(() => {
    if (currentUser) {
      const onboarded = localStorage.getItem(`kys_onboarded_${currentUser.role}`);
      if (!onboarded) {
        setShowOnboarding(true);
      }
    }
  }, [currentUser]);

  const handleCompleteOnboarding = () => {
    if (currentUser) {
      localStorage.setItem(`kys_onboarded_${currentUser.role}`, 'true');
    }
    setShowOnboarding(false);
  };

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kamp-planlama' | 'bungalov' | 'katilimci' | 'kayit' | 'revir' | 'yemekhane' | 'teknik' | 'guvenlik' | 'dokümanlar' | 'ayarlar' | 'maliyet' | 'anket-analizi' | 'anket-yonetimi' | 'sistem-loglari' | 'dijital-arsiv' | 'olay-kayit' | 'raporlar' | 'sistem-guncellemeleri' | 'kahoot' | 'kamp-liderleri'>('dashboard');
  const [registrationSubTab, setRegistrationSubTab] = useState<'form' | 'queue'>('form');
  const [technicalSubTab, setTechnicalSubTab] = useState<'dashboard' | 'issues' | 'requests' | 'ai-copilot' | 'reports' | 'areas'>('dashboard');
  const [isKayitMenuOpen, setIsKayitMenuOpen] = useState<boolean>(true);
  const [isTeknikMenuOpen, setIsTeknikMenuOpen] = useState<boolean>(true);
  const [isAnketMenuOpen, setIsAnketMenuOpen] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [externalSelectedParticipantId, setExternalSelectedParticipantId] = useState<string | null>(null);

  // Check role-based tab access
  const hasAccess = (tab: 'dashboard' | 'kamp-planlama' | 'bungalov' | 'katilimci' | 'kayit' | 'revir' | 'yemekhane' | 'teknik' | 'guvenlik' | 'dokümanlar' | 'ayarlar' | 'maliyet' | 'anket-analizi' | 'anket-yonetimi' | 'sistem-loglari' | 'dijital-arsiv' | 'olay-kayit' | 'raporlar' | 'sistem-guncellemeleri' | 'kahoot' | 'kamp-liderleri') => {
    if (!currentUser) return false;
    const access = (tab === 'kamp-planlama' && (currentUser.role === 'admin' || currentUser.role === 'mudur' || currentUser.role === 'gonullu')) ||
                   (tab === 'kamp-liderleri' && (currentUser.role === 'admin' || currentUser.role === 'mudur' || currentUser.role === 'gonullu')) ||
                   currentUser.role === 'admin' ||
                   currentUser.allowedTabs.includes(tab as any);
    console.log(`Access check for ${tab}: ${access}, role: ${currentUser.role}, allowedTabs: ${currentUser.allowedTabs.includes(tab)}`);
    return access;
  };

  // Klave kısayolları: Ctrl+1 (Dashboard), Ctrl+2 (Bungalov), Ctrl+3 (Katılımcı Defteri)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1' && hasAccess('dashboard')) {
          e.preventDefault();
          handleActiveTabChange('dashboard');
        } else if (e.key === '2' && hasAccess('bungalov')) {
          e.preventDefault();
          handleActiveTabChange('bungalov');
        } else if (e.key === '3' && hasAccess('katilimci')) {
          e.preventDefault();
          handleActiveTabChange('katilimci');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser]);

  // Mobil ekranlarda sol menüyü kaydırarak (swipe) açıp kapatma jest desteği
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) return; // Çoklu dokunmaları yoksay
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Sadece mobil ve tablet boyutlarında çalışsın (lg altı)
      if (window.innerWidth >= 1024) return;
      
      // Dikey hareket yatay hareketten daha baskınsa yoksay (sayfa kaydırmalarıyla çakışmasın)
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;
      
      // Minimum kaydırma eşiği (60 piksel)
      if (Math.abs(deltaX) < 60) return;

      // Eğer form elemanları veya harita/slider üzerinde kaydırma yapıldıysa tetikleme
      const activeElement = document.activeElement;
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (
        targetTag === 'input' || 
        targetTag === 'textarea' || 
        targetTag === 'select' || 
        targetTag === 'option' ||
        (e.target as HTMLElement)?.closest('.no-swipe') ||
        (activeElement && ['input', 'textarea'].includes(activeElement.tagName.toLowerCase()))
      ) {
        return;
      }

      if (deltaX > 0) {
        // Sağa kaydırma: Eğer sol kenardan başlandıysa (ilk 100px) menüyü aç
        if (touchStartX < 100 && !isMobileMenuOpen) {
          setIsMobileMenuOpen(true);
          addToast('Navigasyon Menüsü Açıldı (Jest)', 'info');
        }
      } else {
        // Sola kaydırma: Eğer menü açıksa menüyü kapat
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
          addToast('Navigasyon Menüsü Kapatıldı (Jest)', 'info');
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobileMenuOpen]);

  const handleActiveTabChange = (tab: 'dashboard' | 'kamp-planlama' | 'bungalov' | 'katilimci' | 'kayit' | 'revir' | 'yemekhane' | 'teknik' | 'guvenlik' | 'dokümanlar' | 'ayarlar' | 'maliyet' | 'anket-analizi' | 'anket-yonetimi' | 'sistem-loglari' | 'dijital-arsiv' | 'olay-kayit' | 'raporlar' | 'sistem-guncellemeleri' | 'kahoot') => {
    console.log('Navigating to tab:', tab);
    if (hasAccess(tab)) {
      setActiveTab(tab);
    } else {
      console.log('Access denied to tab:', tab);
      addToast('Bu sayfaya erişim yetkiniz bulunmuyor.', 'alert');
    }
    setIsMobileMenuOpen(false);
  };

  // URL parameters detection
  const params = new URLSearchParams(window.location.search);
  const isRemotePortal = params.get('portal') === 'basvuru';
  const isKampSonuForm = params.get('form') === 'kamp-sonu-degerlendirme' || window.location.href.includes('form=kamp-sonu-degerlendirme');

  // State synchronization helper
  const syncStateWithServer = (dataToSync: any) => {
    const handleOfflineBackup = () => {
      try {
        const pendingSync = JSON.parse(localStorage.getItem('kys_pending_sync') || '{}');
        const updatedSync = { ...pendingSync, ...dataToSync };
        localStorage.setItem('kys_pending_sync', JSON.stringify(updatedSync));
        
        // Otomatik çevrimdışı yedekleme indirme bağlantısı
        const blob = new Blob([JSON.stringify(updatedSync, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kys_offline_backup_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Error saving pending sync data offline:", e);
      }
    };

    if (!navigator.onLine) {
      handleOfflineBackup();
      return;
    }

    fetch('/api/state/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSync)
    }).catch(err => {
      console.error("Error syncing state with server, saving locally:", err);
      handleOfflineBackup();
    });
  };

  // Load from backend API with localStorage fallback
  useEffect(() => {
    fetch('/api/state')
      .then(res => res.json())
      .then(data => {
        if (data && data.participants) {
          setParticipants(data.participants);
          setPeriods(data.periods);
          setHealthIncidents(data.healthIncidents);
          setSurveys(data.surveys);
          setLogs(data.logs);
          setBungalows(data.bungalows.map((b: any) => ({ ...b, capacity: 6 })));
          setCampCenters(data.campCenters);
          setMealPlans(data.mealPlans);
          if (data.activities) {
            setActivities(data.activities);
          }
          
          // Sync locally
          localStorage.setItem('kys_participants', JSON.stringify(data.participants));
          localStorage.setItem('kys_periods', JSON.stringify(data.periods));
          localStorage.setItem('kys_health', JSON.stringify(data.healthIncidents));
          localStorage.setItem('kys_surveys', JSON.stringify(data.surveys));
          localStorage.setItem('kys_logs', JSON.stringify(data.logs));
          localStorage.setItem('kys_bungalows', JSON.stringify(data.bungalows));
          localStorage.setItem('kys_camp_centers', JSON.stringify(data.campCenters));
          localStorage.setItem('kys_meal_plans', JSON.stringify(data.mealPlans));
          if (data.activities) {
            localStorage.setItem('kys_activities', JSON.stringify(data.activities));
          }
        } else {
          loadLocalStorage();
        }
      })
      .catch(() => {
        loadLocalStorage();
      });

    function loadLocalStorage() {
      const savedParticipants = localStorage.getItem('kys_participants');
      const savedPeriods = localStorage.getItem('kys_periods');
      const savedHealth = localStorage.getItem('kys_health');
      const savedSurveys = localStorage.getItem('kys_surveys');
      const savedLogs = localStorage.getItem('kys_logs');
      const savedBungalows = localStorage.getItem('kys_bungalows');
      const savedCenters = localStorage.getItem('kys_camp_centers');
      const savedMealPlans = localStorage.getItem('kys_meal_plans');
      const savedExpenses = localStorage.getItem('kys_expenses');
      const savedTasks = localStorage.getItem('kys_tasks');
      const savedShifts = localStorage.getItem('kys_shifts');
      const savedActivities = localStorage.getItem('kys_activities');

      if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
      if (savedPeriods) setPeriods(JSON.parse(savedPeriods));
      if (savedHealth) setHealthIncidents(JSON.parse(savedHealth));
      if (savedSurveys) setSurveys(JSON.parse(savedSurveys));
      if (savedLogs) setLogs(JSON.parse(savedLogs));
      if (savedBungalows) {
        const parsed = JSON.parse(savedBungalows);
        setBungalows(parsed.map((b: any) => ({ ...b, capacity: 6 })));
      }
      if (savedCenters) setCampCenters(JSON.parse(savedCenters));
      if (savedMealPlans) setMealPlans(JSON.parse(savedMealPlans));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedShifts) setShifts(JSON.parse(savedShifts));
      if (savedActivities) setActivities(JSON.parse(savedActivities));
    }
    
    // Auto-select tab and camp center based on URL query or hash for convenient QR scanning!
    const tabParam = params.get('tab');
    const centerIdParam = params.get('centerId');
    const hash = window.location.hash;
    
    if (centerIdParam) {
      setSelectedCenterId(centerIdParam);
    }
    
    if (tabParam === 'kayit' || hash === '#kayit') {
      setActiveTab('kayit');
    }
  }, []);

  // Persistent storage synchronized hooks
  const updateParticipants = (updated: Participant[]) => {
    setParticipants(updated);
    localStorage.setItem('kys_participants', JSON.stringify(updated));
    syncStateWithServer({ participants: updated });
  };

  const updateMealPlans = (updated: MealPlan[]) => {
    setMealPlans(updated);
    localStorage.setItem('kys_meal_plans', JSON.stringify(updated));
    syncStateWithServer({ mealPlans: updated });
  };

  const updateExpenses = (updated: Expense[]) => {
    setExpenses(updated);
    localStorage.setItem('kys_expenses', JSON.stringify(updated));
    syncStateWithServer({ expenses: updated });
  };

  const updateTasks = (updated: Task[]) => {
    setTasks(updated);
    localStorage.setItem('kys_tasks', JSON.stringify(updated));
    syncStateWithServer({ tasks: updated });
  };

  const updateShifts = (updated: ShiftAssignment[]) => {
    setShifts(updated);
    localStorage.setItem('kys_shifts', JSON.stringify(updated));
    syncStateWithServer({ shifts: updated });
  };

  const updateBungalows = (updated: Bungalow[]) => {
    setBungalows(updated);
    localStorage.setItem('kys_bungalows', JSON.stringify(updated));
    syncStateWithServer({ bungalows: updated });
  };

  const updateCampCenters = (updated: CampCenter[]) => {
    setCampCenters(updated);
    localStorage.setItem('kys_camp_centers', JSON.stringify(updated));
    
    // If our currently selected center ID got deleted, reset to the first available one!
    if (updated.length > 0 && !updated.some(c => c.id === selectedCenterId)) {
      setSelectedCenterId(updated[0].id);
    }
    syncStateWithServer({ campCenters: updated });
  };

  const updatePeriods = (updated: CampPeriod[]) => {
    setPeriods(updated);
    localStorage.setItem('kys_periods', JSON.stringify(updated));
    syncStateWithServer({ periods: updated });
  };

  const updateActivities = (updated: CampActivity[]) => {
    setActivities(updated);
    localStorage.setItem('kys_activities', JSON.stringify(updated));
    syncStateWithServer({ activities: updated });
  };

  const handleAddPeriod = (newPer: CampPeriod) => {
    const updated = [newPer, ...periods];
    setPeriods(updated);
    localStorage.setItem('kys_periods', JSON.stringify(updated));
    syncStateWithServer({ periods: updated });
  };

  const handleAddHealthIncident = (inc: HealthIncident) => {
    const updated = [inc, ...healthIncidents];
    setHealthIncidents(updated);
    localStorage.setItem('kys_health', JSON.stringify(updated));
    syncStateWithServer({ healthIncidents: updated });
  };

  const handleAddSurvey = (surv: SurveyResponse) => {
    const updated = [surv, ...surveys];
    setSurveys(updated);
    localStorage.setItem('kys_surveys', JSON.stringify(updated));
    syncStateWithServer({ surveys: updated });
  };

  const playNotifSound = () => {
    if (!isNotifSoundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const now = ctx.currentTime;
      
      // Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.1); // A5
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      // Tone 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.08); // A5
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18); // D6
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.5);
    } catch (error) {
      console.warn("Audio Context failed:", error);
    }
  };

  const addAppNotification = (message: string, type: 'alert' | 'warning' | 'info', targetedRoles: string[] = ['admin', 'mudur']) => {
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      message,
      type,
      roles: targetedRoles,
      read: false,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem('kys_notifications', JSON.stringify(updated));
      return updated;
    });

    if (currentUser && targetedRoles.includes(currentUser.role)) {
      playNotifSound();
      addToast(message, type);
    }
  };

  const deleteAppNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('kys_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleNotifReadStatus = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: !n.read } : n);
      localStorage.setItem('kys_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const addToast = (message: string, type: 'alert' | 'warning' | 'info') => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const addSystemLog = (action: string, details: string, overrideUser?: { id: string; name: string; roleName: string } | null, undoData?: SystemLog['undoData']) => {
    const actorId = overrideUser ? overrideUser.id : (currentUser?.id || 'S01');
    const actorName = overrideUser ? overrideUser.name : (currentUser?.name || 'İnan BAYRAMOĞLU');
    const actorRole = overrideUser ? overrideUser.roleName : (currentUser?.roleName || 'Kamp Müdürü');

    const newLog: SystemLog = {
      id: `L0${Date.now()}-${Math.floor(Math.random()*1000)}`,
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action,
      timestamp: new Date().toISOString().slice(0, 19),
      details,
      undoData,
    };
    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem('kys_logs', JSON.stringify(updated));
    syncStateWithServer({ logs: updated });
  };

  const handleUndoLog = (logId: string) => {
    const log = logs.find(l => l.id === logId);
    if (!log || !log.undoData) {
      alert("Bu işlem geri alınamaz veya geçmiş veri bulunamadı.");
      return;
    }

    const undo = log.undoData;
    
    if (undo.participants) updateParticipants(undo.participants);
    if (undo.periods) updatePeriods(undo.periods);
    if (undo.bungalows) updateBungalows(undo.bungalows);
    if (undo.campCenters) updateCampCenters(undo.campCenters);
    if (undo.mealPlans) updateMealPlans(undo.mealPlans);
    if (undo.expenses) updateExpenses(undo.expenses);
    if (undo.tasks) updateTasks(undo.tasks);
    if (undo.shifts) updateShifts(undo.shifts);
    
    if (undo.healthIncidents) {
      setHealthIncidents(undo.healthIncidents);
      localStorage.setItem('kys_health', JSON.stringify(undo.healthIncidents));
      syncStateWithServer({ healthIncidents: undo.healthIncidents });
    }
    if (undo.surveys) {
      setSurveys(undo.surveys);
      localStorage.setItem('kys_surveys', JSON.stringify(undo.surveys));
      syncStateWithServer({ surveys: undo.surveys });
    }

    addSystemLog('İşlem Geri Alındı', `"${log.action}" işlemi geri alındı.`);
  };

  const selectedCenter = campCenters.find((c) => c.id === selectedCenterId) || campCenters[0];

  // Specific Bungalows for ONLY the selected Center
  const centerBungalows = bungalows.filter((b) => b.campCenterId === selectedCenterId);

  // Dynamic values for special nutritional alerts in food/kitchen tab
  const activeInSelectedCenter = participants.filter(
    (p) => p.status === 'Kampta'
  );

  const glutenFreeCount = activeInSelectedCenter.filter(
    (p) => p.allergies.toLowerCase().includes('gluten') || p.healthNote.toLowerCase().includes('gluten')
  ).length;

  const lactoseFreeCount = activeInSelectedCenter.filter(
    (p) => p.allergies.toLowerCase().includes('laktoz') || p.allergies.toLowerCase().includes('süt') || p.healthNote.toLowerCase().includes('laktoz')
  ).length;

  const allergyDetails = activeInSelectedCenter.filter(
    (p) => p.allergies && p.allergies.toLowerCase() !== 'yok' && p.allergies.toLowerCase() !== 'belirtilmedi'
  );

  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [showSaveToast, setShowSaveToast] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S for Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        syncStateWithServer({
           participants,
           periods,
           bungalows,
           campCenters,
           mealPlans,
           healthIncidents,
           surveys,
           logs
        });
        
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
      }
      
      // Ctrl+K / Cmd+K for Command Palette (Search/Switch)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [participants, periods, bungalows, campCenters, mealPlans, healthIncidents, surveys, logs]);


  if (isKampSonuForm) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-center items-center z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center p-2 rounded-xl">
              <svg viewBox="0 0 100 100" className="w-10 h-10">
                <path d="M50 5 C25 5 5 25 5 50 C5 75 25 95 50 95 C75 95 95 75 95 50 C95 25 75 5 50 5 Z" fill="#059669"/>
                <path d="M70 30 C70 30 55 45 40 60 C35 65 25 55 30 50 C45 35 60 20 60 20 Z" fill="#ffffff"/>
                <path d="M40 70 C40 70 55 55 70 40 C75 35 85 45 80 50 C65 65 50 80 50 80 Z" fill="#ffffff"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">YEŞİLAY</h1>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">TÜRKİYE YEŞİLAY CEMİYETİ</span>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 pt-8 md:pt-12">
          <KampSonuDegerlendirmeRaporu />
        </main>
        <footer className="py-6 border-t border-gray-200 bg-white text-center text-xs text-gray-500 font-semibold mt-12">
          <p>© 2026 Türkiye Yeşilay Cemiyeti</p>
        </footer>
      </div>
    );
  }

  if (isRemotePortal) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col font-sans" id="yesilay-kys-remote-portal">
        {/* Beautiful standalone Header */}
        <header className="print:hidden bg-white border-b border-gray-150 px-6 py-4 flex justify-between items-center z-30 shadow-xs">
          <div className="flex items-center gap-3 mx-auto">
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-2xs select-none h-14">
              <div className="w-11 h-11 flex items-center justify-center bg-white rounded-lg">
                <svg viewBox="0 0 100 100" className="w-9 h-9">
                  <path
                    d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z"
                    fill="#00AB41"
                  />
                </svg>
              </div>
              
              {/* Divider */}
              <div className="h-9 w-[1.5px] bg-gray-300 mx-2.5" />
              
              {/* Yesilay Bold Brand Text */}
              <div className="pr-3 flex flex-col justify-center">
                <span className="font-black text-[#0B3B24] tracking-tight text-lg font-sans leading-none">YEŞİLAY</span>
                <span className="text-[7.5px] text-[#00AB41] font-black uppercase tracking-[0.2em] mt-1 leading-none">KAMP BAŞVURU PORTALI</span>
              </div>
            </div>
          </div>
        </header>

        {/* Standalone content wrapper */}
        <main className="flex-1 p-4 md:p-8 max-w-[1200px] mx-auto w-full">
          <RegistrationView
            participants={participants}
            periods={periods}
            bungalows={bungalows}
            onUpdateParticipants={updateParticipants}
            onAddLog={addSystemLog}
            isRemote={true}
          />
        </main>

        <footer className="py-6 border-t border-gray-200 bg-white text-center text-xs text-gray-500 font-semibold space-y-1">
          <p>© 2026 Türkiye Yeşilay Cemiyeti • Kamp Yönetim Sistemi</p>
          <p className="text-[10px] text-gray-400">Tüm hakları saklıdır.</p>
        </footer>
      </div>
    );
  }

  const handleLogin = (user: LoginUser) => {
    setCurrentUser(user);
    localStorage.setItem('kys_current_user', JSON.stringify(user));
    if (user.allowedTabs.length > 0) {
      setActiveTab(user.allowedTabs[0]);
    }
    addSystemLog('Giriş Yapıldı', `${user.name} (${user.roleName}) sisteme giriş yaptı.`, user);
  };

  const handleLogout = () => {
    if (currentUser) {
      addSystemLog('Çıkış Yapıldı', `${currentUser.name} (${currentUser.roleName}) sistemden çıkış yaptı.`);
    }
    setCurrentUser(null);
    localStorage.removeItem('kys_current_user');
  };

  const handleUpdateProfile = (updatedName: string, updatedUsername: string) => {
    if (!currentUser) return;
    
    const updatedUser: LoginUser = {
      ...currentUser,
      name: updatedName,
      username: updatedUsername
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('kys_current_user', JSON.stringify(updatedUser));
    
    const updatedUsersList = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsersList);
    
    addSystemLog(
      'Profil Güncellendi',
      `Kullanıcı kendi profil bilgilerini güncelledi. Yeni Ad Soyad: "${updatedName}", Kullanıcı Adı: "@${updatedUsername}"`
    );
  };

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        isDark = mediaQuery.matches;
      }
      
      setIsDarkMode(isDark);
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('kys_theme', theme);
      localStorage.setItem('kys_dark_mode', isDark ? 'true' : 'false');
    };

    updateTheme();

    if (theme === 'system') {
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [theme]);

  const unreadCount = notifications.filter(n => !n.read && n.roles.includes(currentUser?.role || '')).length;

  if (isPublicCalendar) {
    return <PublicCalendarView activities={activities} campCenters={campCenters} />;
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} users={users} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={theme} 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col font-sans ${isFullscreen ? 'fixed inset-0 z-[99999] w-screen h-screen overflow-hidden' : ''}`} id="yesilay-kys-master-parent"
      >
      <OfflineBanner />
      
      {/* SaaS Executive Header Banner */}
      <header className="print:hidden bg-white dark:bg-gray-800 border-b border-gray-150 dark:border-gray-700 px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-30 shadow-xs transition-colors duration-200">
        {/* Brand & Turkey Crest */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            {/* Authentic Yeşilay Logo Component */}
            <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-1 shadow-2xs select-none h-14">
              {/* Green Crescent on White Box */}
              <div className="w-11 h-11 flex items-center justify-center bg-white dark:bg-gray-700 rounded-lg">
                <svg viewBox="0 0 100 100" className="w-9 h-9">
                  <path
                    d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z"
                    fill="#00AB41"
                  />
                </svg>
              </div>
              
              {/* Divider */}
              <div className="h-9 w-[1.5px] bg-gray-300 dark:bg-gray-500 mx-2.5" />
              
              {/* Yesilay Bold Brand Text */}
              <div className="pr-3 flex flex-col justify-center">
                <span className="font-black text-[#0B3B24] dark:text-gray-100 tracking-tight text-lg font-sans leading-none">YEŞİLAY</span>
                <span className="text-[7.5px] text-[#00AB41] font-black uppercase tracking-[0.2em] mt-1 leading-none">TÜRKİYE</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-[#00875A] dark:text-emerald-100 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1.5">Kamp Yönetim Sistemi (KYS) <span className="text-[9px] bg-indigo-500 text-white font-black px-1.5 py-0.5 rounded border border-indigo-600">BETA</span></span>
              </div>
            </div>
          </div>

          {/* Hamburger Menu Button for Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-500 hover:text-[#00875A] hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-xl transition cursor-pointer flex items-center justify-center border border-gray-150 dark:border-gray-600"
            title="Menüyü Aç/Kapat"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-800 dark:text-emerald-400" /> : <Menu className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />}
          </button>
        </div>

        <div className="flex items-center justify-between md:justify-start gap-2 md:gap-4 w-full md:w-auto min-w-0">
          {/* Multi-Tenant SaaS Camp Center Switcher */}
          <div className="flex items-center gap-1.5 md:gap-2 bg-emerald-50/50 dark:bg-gray-700 p-1.5 border border-emerald-100 dark:border-gray-600 rounded-lg flex-1 max-w-[145px] xs:max-w-[185px] sm:max-w-xs md:max-w-none md:flex-none">
            <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 ml-1" />
            <span className="text-3xs font-extrabold text-emerald-900 dark:text-emerald-100 uppercase shrink-0 hidden xs:inline">Kamp Merkezi:</span>
            <select
              value={selectedCenterId}
              onChange={(e) => {
                setSelectedCenterId(e.target.value);
                addSystemLog('Camp Center Switch', `SaaS seçici ile '${campCenters.find(c=>c.id===e.target.value)?.name}' merkezine geçildi.`);
              }}
              className="bg-transparent text-xs font-bold text-emerald-950 dark:text-white focus:outline-none cursor-pointer pr-2 flex-grow min-w-0 truncate"
            >
              {campCenters.map((cc) => (
                <option key={cc.id} value={cc.id}>
                  {cc.name} ({cc.city})
                </option>
              ))}
            </select>
          </div>

          {/* Action Icons & User Profile */}
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            {/* Tekli Gece / Gündüz Modu Butonu */}
                        {/* Tekli Gece / Gündüz / Sistem Modu Butonu */}
            <button
              onClick={() => {
                if (theme === 'light') setTheme('dark');
                else if (theme === 'dark') setTheme('system');
                else setTheme('light');
              }}
              className="p-1.5 md:p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition flex items-center justify-center cursor-pointer border border-gray-200/50 dark:border-gray-700"
              title={theme === 'light' ? 'Karanlık Moda Geç' : theme === 'dark' ? 'Sistem Temasına Geç' : 'Aydınlık Moda Geç'}
            >
              {theme === 'light' && <Moon className="w-4 h-4 text-gray-500" />}
              {theme === 'dark' && <Sun className="w-4 h-4 text-amber-500" />}
              {theme === 'system' && <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </button>

            {/* Tam Ekran Modu Butonu */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 md:p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition flex items-center justify-center cursor-pointer border border-gray-200/50 dark:border-gray-700"
              title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Maximize2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-1.5 md:p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition relative focus:outline-none cursor-pointer"
                title="Bildirimler"
              >
                <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-bounce text-emerald-600 dark:text-emerald-400' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[580px] animate-in fade-in duration-200">
                  
                  {/* Top Header */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Bildirim Merkezi
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                        {unreadCount} okunmamış bildiriminiz var
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* Sesli Uyarı Button */}
                      <button
                        onClick={() => {
                          const newVal = !isNotifSoundEnabled;
                          setIsNotifSoundEnabled(newVal);
                          localStorage.setItem('kys_notif_sound', String(newVal));
                          addToast(newVal ? 'Sesli bildirimler açıldı' : 'Sesli bildirimler kapatıldı', 'info');
                        }}
                        className={`p-1.5 rounded-lg transition-all border ${isNotifSoundEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900' : 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'}`}
                        title={isNotifSoundEnabled ? "Sesi Kapat" : "Sesi Aç"}
                      >
                        {isNotifSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      </button>

                      {/* Simülatör Panel Toggle */}
                      <button
                        onClick={() => setIsNotifSimulatorOpen(!isNotifSimulatorOpen)}
                        className={`p-1.5 rounded-lg transition-all border ${isNotifSimulatorOpen ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900' : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}
                        title="Simülasyon İstasyonu"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Notification Simulator Section (Inline Expandable) */}
                  {isNotifSimulatorOpen && (
                    <div className="px-4 py-3 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/40 text-xs text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-amber-900 dark:text-amber-300 text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 animate-pulse" /> Simülasyon İstasyonu
                        </span>
                        <button 
                          onClick={() => setIsNotifSimulatorOpen(false)}
                          className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-extrabold"
                        >
                          Kapat
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                        Canlı test etmek için aşağıdaki ön tanımlı acil durumlardan birini tetikleyin:
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            addAppNotification(
                              "Yeni Sağlık Alarmı: Revir Girişi yapıldı. G-12 bungalovunda kalan Ali Yılmaz'da yüksek ateş (39°C) tespit edildi.",
                              "alert",
                              ["admin", "mudur", "saglik"]
                            );
                            addSystemLog("Sağlık Bildirimi Tetiklendi", "Simülasyon İstasyonundan revir girişi uyarısı fırlatıldı.");
                          }}
                          className="px-2 py-1.5 bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 rounded-lg text-[9px] font-black text-left border border-rose-100 hover:scale-[1.02] transition"
                        >
                          🚨 Sağlık Alarmı
                        </button>
                        <button
                          onClick={() => {
                            addAppNotification(
                              "Teknik Arıza Uyarısı: B-02 Bungalovunun klima ünitesinde aşırı yüklenme ve duman ihbarı alındı. Teknik personel sevk edildi.",
                              "alert",
                              ["admin", "mudur", "teknik"]
                            );
                            addSystemLog("Teknik Alarm Tetiklendi", "Simülasyon İstasyonundan elektrik aşırı yüklenme uyarısı fırlatıldı.");
                          }}
                          className="px-2 py-1.5 bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 rounded-lg text-[9px] font-black text-left border border-rose-100 hover:scale-[1.02] transition"
                        >
                          🔧 Teknik Acil Pano
                        </button>
                        <button
                          onClick={() => {
                            addAppNotification(
                              "Gıda Alerjisi Uyarısı: 3 katılımcının fındık alerjisi rapor edildi. Akşam menüsünde alternatif öğün hazırlanması gerekiyor.",
                              "warning",
                              ["admin", "mudur", "yemekhane"]
                            );
                            addSystemLog("Gıda Bildirimi Tetiklendi", "Simülasyon İstasyonundan fındık alerjisi uyarısı fırlatıldı.");
                          }}
                          className="px-2 py-1.5 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 rounded-lg text-[9px] font-black text-left border border-amber-100 hover:scale-[1.02] transition"
                        >
                          🥦 Yemekhane Alerji
                        </button>
                        <button
                          onClick={() => {
                            addAppNotification(
                              "Meteoroloji Alarmı: Kamp bölgesinde saat 15:00 civarı şiddetli rüzgar ve fırtına beklenmektedir. Tüm açık etkinliklerin çadırlara çekilmesi rica olunur.",
                              "warning",
                              ["admin", "mudur", "teknik", "lider", "ogretmen"]
                            );
                            addSystemLog("Hava Durumu Bildirimi Tetiklendi", "Simülasyon İstasyonundan meteoroloji uyarısı fırlatıldı.");
                          }}
                          className="px-2 py-1.5 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 rounded-lg text-[9px] font-black text-left border border-amber-100 hover:scale-[1.02] transition"
                        >
                          ⚡ Fırtına İhbarı
                        </button>
                        <button
                          onClick={() => {
                            addAppNotification(
                              "Yeni Kayıt Bildirimi: 4. Döneme 'Zeynep Kaya' adlı yeni bir katılımcı kaydı tamamlandı.",
                              "info",
                              ["admin", "mudur", "kayit"]
                            );
                            addSystemLog("Yeni Kayıt Bildirimi Tetiklendi", "Zeynep Kaya adlı katılımcı kaydı simüle edildi.");
                          }}
                          className="px-2 py-1 text-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 rounded-lg text-[9px] font-black text-left border border-emerald-100 hover:scale-[1.02] transition col-span-2 text-center"
                        >
                          🏕️ Yeni Katılımcı Kayıt Girişi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Search and Tabs Controller */}
                  <div className="px-3.5 py-2 border-b border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800 flex flex-col gap-2">
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Bildirimlerde ara..."
                        value={notifSearchQuery}
                        onChange={(e) => setNotifSearchQuery(e.target.value)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-8 pr-3.5 py-1.5 focus:outline-emerald-500 focus:bg-white dark:focus:bg-gray-850 focus:ring-1 focus:ring-emerald-500 dark:text-white"
                      />
                      {notifSearchQuery && (
                        <button 
                          onClick={() => setNotifSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-gray-50 dark:bg-gray-900 p-0.5 rounded-lg border border-gray-150 dark:border-gray-850">
                      <button
                        onClick={() => setNotifTabFilter('all')}
                        className={`flex-1 py-1 text-[10px] font-black rounded-md transition-all cursor-pointer ${notifTabFilter === 'all' ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-3xs' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                      >
                        Tümü
                      </button>
                      <button
                        onClick={() => setNotifTabFilter('unread')}
                        className={`flex-1 py-1 text-[10px] font-black rounded-md transition-all cursor-pointer relative ${notifTabFilter === 'unread' ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-3xs' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                      >
                        Okunmamış
                        {notifications.filter(n => !n.read && n.roles.includes(currentUser.role)).length > 0 && (
                          <span className="absolute top-0.5 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                        )}
                      </button>
                      <button
                        onClick={() => setNotifTabFilter('critical')}
                        className={`flex-1 py-1 text-[10px] font-black rounded-md transition-all cursor-pointer ${notifTabFilter === 'critical' ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-3xs' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                      >
                        Kritik
                      </button>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="px-4 py-1.5 bg-gray-50/50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center text-[10px] font-bold text-gray-500">
                    <span>Rol: <span className="text-emerald-700 dark:text-emerald-400 font-extrabold uppercase">{currentUser?.roleName}</span></span>
                    <button 
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-extrabold"
                      onClick={() => {
                        const updated = notifications.map(n => n.roles.includes(currentUser.role) ? { ...n, read: true } : n);
                        setNotifications(updated);
                        localStorage.setItem('kys_notifications', JSON.stringify(updated));
                        addToast('Tüm bildirimler okundu işaretlendi', 'info');
                      }}
                    >
                      Hepsini Okundu Yap
                    </button>
                  </div>

                  {/* Notification List Scrollable Area */}
                  <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                    {(() => {
                      let list = notifications.filter(n => n.roles.includes(currentUser.role));
                      
                      if (notifSearchQuery.trim()) {
                        list = list.filter(n => n.message.toLowerCase().includes(notifSearchQuery.toLowerCase()));
                      }

                      if (notifTabFilter === 'unread') {
                        list = list.filter(n => !n.read);
                      } else if (notifTabFilter === 'critical') {
                        list = list.filter(n => n.type === 'alert' || n.type === 'warning');
                      }

                      if (list.length === 0) {
                        return (
                          <div className="p-8 text-center flex flex-col items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-gray-300 dark:text-gray-600 stroke-1 mb-2 animate-pulse" />
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Bildirim bulunamadı</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Filtreleri veya arama kriterlerini kontrol edin.</p>
                          </div>
                        );
                      }

                      return list.map(notif => {
                        const isAlert = notif.type === 'alert';
                        const isWarning = notif.type === 'warning';
                        
                        const handleNotificationClick = () => {
                          const msg = notif.message.toLowerCase();
                          let tabTarget = '';
                          if (msg.includes('arıza') || msg.includes('pano') || msg.includes('hidrofor') || msg.includes('klima') || msg.includes('b-02') || msg.includes('teknik')) {
                            tabTarget = 'teknik';
                          } else if (msg.includes('revir') || msg.includes('ateş') || msg.includes('hasta') || msg.includes('alerji') || msg.includes('sağlık')) {
                            tabTarget = 'revir';
                          } else if (msg.includes('domates') || msg.includes('fındık') || msg.includes('mutfak') || msg.includes('yemekhane') || msg.includes('stok') || msg.includes('menü')) {
                            tabTarget = 'yemekhane';
                          } else if (msg.includes('kayıt') || msg.includes('katılımcı') || msg.includes('dönem')) {
                            tabTarget = 'kayit';
                          } else if (msg.includes('güvenlik') || msg.includes('acil') || msg.includes('alarm') || msg.includes('fırtına') || msg.includes('meteoroloji')) {
                            tabTarget = 'guvenlik';
                          }

                          if (tabTarget) {
                            handleActiveTabChange(tabTarget as any);
                            setIsNotifOpen(false);
                            addToast(`İlgili ekrana yönlendirildi: ${tabTarget.toUpperCase()}`, 'info');
                          }

                          if (!notif.read) {
                            toggleNotifReadStatus(notif.id);
                          }
                        };

                        return (
                          <div 
                            key={notif.id} 
                            className={`group relative p-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition flex gap-2.5 items-start cursor-pointer ${!notif.read ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''}`}
                            onClick={handleNotificationClick}
                          >
                            <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${isAlert ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                            <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${isAlert ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : isWarning ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
                              {isAlert ? <AlertOctagon className="w-3.5 h-3.5" /> : isWarning ? <AlertTriangle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className={`text-xs leading-normal ${!notif.read ? 'font-extrabold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                {notif.message}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500">
                                  {new Date(notif.timestamp).toLocaleString('tr-TR')}
                                </span>
                                {!notif.read && (
                                  <span className="text-[8px] bg-rose-500/15 text-rose-600 px-1 py-0.2 rounded font-black uppercase">Yeni</span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 items-end shrink-0 md:opacity-0 group-hover:opacity-100 transition duration-150">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleNotifReadStatus(notif.id);
                                }}
                                className={`p-1 rounded-lg border hover:scale-105 transition cursor-pointer ${notif.read ? 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-700 dark:border-gray-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400'}`}
                                title={notif.read ? "Okunmamış yap" : "Okundu yap"}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAppNotification(notif.id);
                                  addToast('Bildirim silindi', 'info');
                                }}
                                className="p-1 rounded-lg border bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-400 hover:scale-105 transition cursor-pointer"
                                title="Bildirimi sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-1.5 md:gap-3">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="group flex items-center gap-2 md:gap-3 text-left hover:opacity-95 transition cursor-pointer bg-transparent border-none p-0 outline-none"
                title="Profilimi Düzenle"
              >
                <div className="hidden md:block text-right">
                  <p className="text-2xs font-extrabold text-gray-800 dark:text-white truncate leading-none mb-1 group-hover:text-emerald-650 dark:group-hover:text-emerald-400 transition-colors">
                    {currentUser?.name}
                  </p>
                  <span className="text-[9px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wide bg-emerald-100/60 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {currentUser?.roleName}
                  </span>
                </div>
                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full ${localStorage.getItem('kys_profile_color_' + currentUser?.id) || 'bg-emerald-600'} text-white flex items-center justify-center font-black text-xs shadow-3xs shrink-0 uppercase border-2 border-emerald-100 dark:border-emerald-900 transition-all duration-300 group-hover:scale-105`}>
                  {currentUser?.name ? currentUser.name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'PP'}
                </div>
              </button>
              <button
                onClick={() => setIsIdle(true)}
                className="p-1.5 md:p-2 ml-0.5 flex items-center text-amber-700 dark:text-amber-400 hover:text-white hover:bg-amber-600 border border-amber-200/60 dark:border-amber-900/60 hover:border-amber-600 rounded-xl transition-all duration-150 cursor-pointer"
                title="Ekranı Güvenli Moda Kilitle"
              >
                <Lock className="w-4 h-4 shrink-0" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 md:p-2 ml-0.5 flex items-center text-rose-700 dark:text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-200/60 dark:border-rose-900/60 hover:border-rose-600 rounded-xl transition-all duration-150 cursor-pointer"
                title="Sistemden Güvenli Çıkış"
              >
                <LogOut className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </header>



      {/* Main Container Section */}
      <div className="flex-grow flex flex-col lg:flex-row transition-colors duration-200 min-h-0">
        
        {/* Left Side Navigation Bar */}
        <nav className={`print:hidden bg-white dark:bg-gray-800 border-r border-gray-150 dark:border-gray-700 w-full lg:flex flex-col gap-1.5 shrink-0 select-none transition-all duration-300 lg:sticky lg:top-[88px] lg:h-[calc(100vh-88px)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 ${
          isMobileMenuOpen ? 'flex p-5' : 'hidden lg:flex'
        } ${
          isSidebarCollapsed ? 'lg:w-[72px] lg:p-3' : 'lg:w-64 lg:p-5'
        }`}>
          <div className="flex items-center justify-end px-3 mb-2">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition cursor-pointer"
              title={isSidebarCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile Quick Action Buttons Panel */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-slate-50/50 dark:bg-gray-700/30 p-3.5 rounded-2xl border border-gray-150 dark:border-gray-700 mb-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60 dark:border-gray-700/60">
                <Settings className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hızlı Sistem Kontrolleri</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                                <button
                  type="button"
                  onClick={() => {
                    if (theme === 'light') setTheme('dark');
                    else if (theme === 'dark') setTheme('system');
                    else setTheme('light');
                  }}
                  className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  {theme === 'light' && <Moon className="w-4 h-4 text-gray-500" />}
                  {theme === 'dark' && <Sun className="w-4 h-4 text-amber-500" />}
                  {theme === 'system' && <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  <span className="text-[9px] font-bold">Tema ({theme === 'light' ? 'Açık' : theme === 'dark' ? 'Koyu' : 'Sistem'})</span>
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-emerald-600" /> : <Maximize2 className="w-4 h-4 text-gray-500" />}
                  <span className="text-[9px] font-bold">Tam Ekran</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer relative"
                >
                  <Bell className="w-4 h-4 text-gray-500" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                  <span className="text-[9px] font-bold">Bildirim ({unreadCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsIdle(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-amber-100 dark:border-amber-900/40 flex flex-col items-center justify-center gap-1 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-[9px] font-bold">Güvenli Mod</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-emerald-100 dark:border-emerald-900/40 flex flex-col items-center justify-center gap-1 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span className="text-[9px] font-bold">Profil</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-rose-100 dark:border-rose-900/40 flex flex-col items-center justify-center gap-1 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-[9px] font-bold">Çıkış Yap</span>
                </button>
              </div>
            </div>
          )}

          {hasAccess('dashboard') && (
            <SidebarNavItem
              id="dashboard"
              label={currentUser?.role === 'gonullu' ? 'Kamp Takvimi' : 'Kontrol Paneli (Dashboard)'}
              icon={currentUser?.role === 'gonullu' ? Calendar : LayoutDashboard}
              isActive={activeTab === 'dashboard'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('dashboard')}
              hasAccessCheck={true}
            />
          )}

          {hasAccess('kamp-planlama') && (
            <SidebarNavItem
              id="kamp-planlama"
              label="Kamp Planlama"
              icon={Calendar}
              isActive={activeTab === 'kamp-planlama'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('kamp-planlama')}
              hasAccessCheck={true}
            />
          )}

          {hasAccess('bungalov') && (
            <SidebarNavItem
              id="bungalov"
              label="Bungalov & Yerleşim"
              icon={Home}
              isActive={activeTab === 'bungalov'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('bungalov')}
              hasAccessCheck={true}
              
            />
          )}

          {hasAccess('katilimci') && (
            <SidebarNavItem
              id="katilimci"
              label="Katılımcı Defteri"
              icon={Users}
              isActive={activeTab === 'katilimci'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('katilimci')}
              hasAccessCheck={true}
              
            />
          )}

          {hasAccess('kayit') && (
            <SidebarNavItem
              id="kayit"
              label="Ön Kayıtlar & Muvafakat"
              icon={FileText}
              isActive={activeTab === 'kayit'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => {
                if (activeTab === 'kayit') {
                  setIsKayitMenuOpen(!isKayitMenuOpen);
                } else {
                  handleActiveTabChange('kayit');
                  setIsKayitMenuOpen(true);
                }
              }}
              hasAccessCheck={true}
              extraContent={
                !isSidebarCollapsed && activeTab === 'kayit' && (
                  isKayitMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                )
              }
            />
          )}

          {/* Sub-menu categories under Kayıt when active */}
          {activeTab === 'kayit' && isKayitMenuOpen && hasAccess('kayit') && !isSidebarCollapsed && (
            <div className="pl-6 pr-2 py-1 flex flex-col gap-1 border-l-2 border-emerald-100/50 ml-5 animate-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => setRegistrationSubTab('form')}
                className={`flex items-center gap-2 py-1 px-2 rounded-lg text-left transition text-[11px] font-semibold ${
                  registrationSubTab === 'form'
                    ? 'bg-emerald-50 text-emerald-800 font-extrabold shadow-3xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${registrationSubTab === 'form' ? 'bg-emerald-600' : 'bg-gray-300'}`} />
                Başvuru Formu
              </button>
              <button
                onClick={() => setRegistrationSubTab('queue')}
                className={`flex items-center gap-2 py-1 px-2 rounded-lg text-left transition text-[11px] font-semibold ${
                  registrationSubTab === 'queue'
                    ? 'bg-emerald-50 text-emerald-800 font-extrabold shadow-3xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${registrationSubTab === 'queue' ? 'bg-emerald-600' : 'bg-gray-300'}`} />
                Başvurular
              </button>
            </div>
          )}

          {hasAccess('kamp-liderleri' as any) && (
            <SidebarNavItem
              id="kamp-liderleri"
              label="Kamp Liderleri Defteri"
              icon={Users}
              isActive={activeTab === 'kamp-liderleri'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('kamp-liderleri' as any)}
              hasAccessCheck={true}
            />
          )}

          {hasAccess('revir') && (
            <SidebarNavItem
              id="revir"
              label="Revir & Sağlık Modülü"
              icon={HeartHandshake}
              isActive={activeTab === 'revir'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('revir')}
              hasAccessCheck={true}
              
            />
          )}

          {hasAccess('yemekhane') && (
            <SidebarNavItem
              id="yemekhane"
              label="Yemekhane & Öğün Planlama"
              icon={UtensilsCrossed}
              isActive={activeTab === 'yemekhane'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('yemekhane')}
              hasAccessCheck={true}
            />
          )}

          {hasAccess('teknik') && (
            <SidebarNavItem
              id="teknik"
              label="Teknik İşler & Talepler"
              icon={Wrench}
              isActive={activeTab === 'teknik'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => {
                if (activeTab === 'teknik') {
                  setIsTeknikMenuOpen(!isTeknikMenuOpen);
                } else {
                  handleActiveTabChange('teknik');
                  setIsTeknikMenuOpen(true);
                }
              }}
              hasAccessCheck={true}
              extraContent={
                !isSidebarCollapsed && activeTab === 'teknik' && (
                  isTeknikMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                )
              }
            />
          )}

          {/* Sub-menu categories under Teknik when active */}
          {activeTab === 'teknik' && isTeknikMenuOpen && hasAccess('teknik') && !isSidebarCollapsed && (
            <div className="pl-6 pr-2 py-1 flex flex-col gap-1 border-l-2 border-emerald-100/50 ml-5 animate-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => setTechnicalSubTab('dashboard')}
                className={`flex items-center gap-2 py-1 px-2 rounded-lg text-left transition text-[11px] font-semibold ${
                  technicalSubTab === 'dashboard'
                    ? 'bg-emerald-50 text-emerald-800 font-extrabold shadow-3xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${technicalSubTab === 'dashboard' ? 'bg-emerald-600' : 'bg-gray-300'}`} />
                Genel Durum Panel
              </button>
              <button
                onClick={() => setTechnicalSubTab('issues')}
                className={`flex items-center gap-2 py-1 px-2 rounded-lg text-left transition text-[11px] font-semibold ${
                  technicalSubTab === 'issues'
                    ? 'bg-emerald-50 text-emerald-800 font-extrabold shadow-3xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${technicalSubTab === 'issues' ? 'bg-emerald-600' : 'bg-gray-300'}`} />
                Arıza &amp; Onarım İşleri
              </button>
              <button
                onClick={() => setTechnicalSubTab('requests')}
                className={`flex items-center gap-2 py-1 px-2 rounded-lg text-left transition text-[11px] font-semibold ${
                  technicalSubTab === 'requests'
                    ? 'bg-emerald-50 text-emerald-800 font-extrabold shadow-3xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${technicalSubTab === 'requests' ? 'bg-emerald-600' : 'bg-gray-300'}`} />
                Malzeme &amp; Sipariş
              </button>
              <button
                onClick={() => setTechnicalSubTab('ai-copilot')}
                className={`flex items-center gap-2 py-1 px-2 rounded-lg text-left transition text-[11px] font-semibold ${
                  technicalSubTab === 'ai-copilot'
                    ? 'bg-emerald-50 text-emerald-800 font-extrabold shadow-3xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${technicalSubTab === 'ai-copilot' ? 'bg-emerald-600' : 'bg-gray-300'}`} />
                Yapay Zeka Copilot
              </button>
              <button
                onClick={() => setTechnicalSubTab('reports')}
                className={`flex items-center gap-2 py-1 px-2 rounded-lg text-left transition text-[11px] font-semibold ${
                  technicalSubTab === 'reports'
                    ? 'bg-emerald-50 text-emerald-800 font-extrabold shadow-3xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${technicalSubTab === 'reports' ? 'bg-emerald-600' : 'bg-gray-300'}`} />
                Sarf Malzeme Raporu
              </button>
              <button
                onClick={() => setTechnicalSubTab('areas')}
                className={`flex items-center gap-2 py-1 px-2 rounded-lg text-left transition text-[11px] font-semibold ${
                  technicalSubTab === 'areas'
                    ? 'bg-emerald-50 text-emerald-800 font-extrabold shadow-3xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${technicalSubTab === 'areas' ? 'bg-emerald-600' : 'bg-gray-300'}`} />
                Alanlar &amp; Sorumlular
              </button>
            </div>
          )}

          {hasAccess('guvenlik') && (
            <SidebarNavItem
              id="guvenlik"
              label="Güvenlik & Nöbetler"
              icon={Shield}
              isActive={activeTab === 'guvenlik'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('guvenlik')}
              hasAccessCheck={true}
              
            />
          )}

          {hasAccess('maliyet') && (
            <>
              <span className={`text-4xs font-extrabold text-gray-400 tracking-widest uppercase mt-6 mb-2 px-3 block ${isSidebarCollapsed ? 'lg:hidden' : 'block'}`}>FİNANSAL ANALİZ</span>
              <SidebarNavItem
                id="maliyet"
                label="Maliyet Analiz Modülü"
                icon={Coins}
                isActive={activeTab === 'maliyet'}
                isSidebarCollapsed={isSidebarCollapsed}
                onClick={() => handleActiveTabChange('maliyet')}
                hasAccessCheck={true}
              />
            </>
          )}

          {hasAccess('anket-analizi') && (
            <div className="flex items-center justify-between group">
              <SidebarNavItem
                id="anket-analizi"
                label="Kamp Sonu Değerlendirme Analizi"
                icon={FileText}
                isActive={activeTab === 'anket-analizi'}
                isSidebarCollapsed={isSidebarCollapsed}
                onClick={() => handleActiveTabChange('anket-analizi')}
                hasAccessCheck={true}
              />
              {!isSidebarCollapsed && (
                <button 
                  onClick={() => setIsAnketMenuOpen(!isAnketMenuOpen)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
                >
                  {isAnketMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
            </div>
          )}

          {hasAccess('anket-yonetimi') && isAnketMenuOpen && (
            <div className="pl-4">
              <SidebarNavItem
                id="anket-yonetimi"
                label="Anket Yönetimi"
                icon={ClipboardList}
                isActive={activeTab === 'anket-yonetimi'}
                isSidebarCollapsed={isSidebarCollapsed}
                onClick={() => handleActiveTabChange('anket-yonetimi')}
                hasAccessCheck={true}
              />
            </div>
          )}

          {hasAccess('raporlar') && (
            <SidebarNavItem
              id="raporlar"
              label="Faaliyet Raporları"
              icon={BarChart2}
              isActive={activeTab === 'raporlar'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('raporlar')}
              hasAccessCheck={true}
            />
          )}

          {(hasAccess('dokümanlar') || hasAccess('ayarlar') || hasAccess('dijital-arsiv') || hasAccess('olay-kayit') || hasAccess('sistem-guncellemeleri')) && (
            <span className={`text-4xs font-extrabold text-gray-400 tracking-widest uppercase mt-6 mb-2 px-3 block ${isSidebarCollapsed ? 'lg:hidden' : 'block'}`}>SİSTEM STANDARTLARI</span>
          )}
          {hasAccess('sistem-guncellemeleri') && (
            <SidebarNavItem
              id="sistem-guncellemeleri"
              label="Sistem Güncellemeleri"
              icon={Sparkles}
              isActive={activeTab === 'sistem-guncellemeleri'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('sistem-guncellemeleri')}
              hasAccessCheck={true}
            />
          )}

          {hasAccess('dijital-arsiv') && (
            <SidebarNavItem
              id="dijital-arsiv"
              label="Dijital Arşiv"
              icon={Archive}
              isActive={activeTab === 'dijital-arsiv'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('dijital-arsiv')}
              hasAccessCheck={true}
              
            />
          )}

          {hasAccess('dokümanlar') && (
            <SidebarNavItem
              id="dokümanlar"
              label="KYS Sistem Tasarım Analizi"
              icon={BookOpen}
              isActive={activeTab === 'dokümanlar'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('dokümanlar')}
              hasAccessCheck={true}
              
            />
          )}

          {hasAccess('ayarlar') && (
            <SidebarNavItem
              id="ayarlar"
              label="Genel Ayarlar"
              icon={Settings}
              isActive={activeTab === 'ayarlar'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('ayarlar')}
              hasAccessCheck={true}
              
            />
          )}

          {hasAccess('olay-kayit') && (
            <SidebarNavItem
              id="olay-kayit"
              label="Olay Kayıt Sistemi"
              icon={AlertOctagon}
              isActive={activeTab === 'olay-kayit'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('olay-kayit')}
              hasAccessCheck={true}
              isDanger={true}
            />
          )}

          {hasAccess('sistem-loglari') && (
            <SidebarNavItem
              id="sistem-loglari"
              label="Sistem Logları"
              icon={Terminal}
              isActive={activeTab === 'sistem-loglari'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('sistem-loglari')}
              hasAccessCheck={true}
              
            />
          )}

          {hasAccess('kahoot') && (
            <SidebarNavItem
              id="kahoot"
              label="Kahoot Soru Havuzu"
              icon={HelpCircle}
              isActive={activeTab === 'kahoot'}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={() => handleActiveTabChange('kahoot')}
            />
          )}

          <div className={`pt-6 border-t border-gray-100 text-center text-4xs text-gray-400 font-semibold space-y-1 ${isSidebarCollapsed ? 'lg:hidden' : 'block'}`}>
            <p>© 2026 Türkiye Yeşilay Cemiyeti</p>
            <p>Kamp Yönetim Sistemi v3.4.2</p>
          </div>

          {isSidebarCollapsed && (
            <div className="mt-auto flex justify-center py-4 animate-pulse" title="Türkiye Yeşilay Cemiyeti">
              <svg viewBox="0 0 100 100" className="w-5 h-5">
                <path
                  d="M52,15 A35,35 0 1,0 85,68 A28,28 0 1,1 85,32 A35,35 0 0,0 52,15 Z"
                  fill="#00AB41"
                />
              </svg>
            </div>
          )}
        </nav>

        {/* Dynamic workspace panel */}
        <main className={`flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full ${isFullscreen ? 'max-w-none' : 'max-w-[1600px] mx-auto'}`}>
          {/* Active Tab View routers */}
          
          {activeTab === 'kamp-planlama' && (
            <PeriodManagementView
              periods={periods}
              onAddPeriod={handleAddPeriod}
              onUpdatePeriods={updatePeriods}
              onAddLog={addSystemLog}
              campCenters={campCenters}
              selectedCampCenterId={selectedCenterId}
              participants={participants}
              staff={staff}
            />
          )}

          {activeTab === 'kahoot' && (
            <KahootQuestionPoolView />
          )}

          {activeTab === 'kamp-liderleri' && (
            <KampLiderleriDefteriView staff={staff} setStaff={setStaff} periods={periods} />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              participants={participants}
              periods={periods}
              logs={logs}
              selectedCampCenterId={selectedCenterId}
              campCenters={campCenters}
              expenses={expenses}
              surveys={surveys}
              currentUser={currentUser}
              onAddPeriod={handleAddPeriod}
              onUpdatePeriods={updatePeriods}
              onAddLog={addSystemLog}
              setActiveMainTab={handleActiveTabChange}
              activities={activities}
              onUpdateActivities={updateActivities}
              staff={staff}
            />
          )}

          {activeTab === 'bungalov' && (
            <BungalowView
              bungalows={bungalows}
              periods={periods}
              selectedCenterId={selectedCenterId}
              onUpdateBungalows={updateBungalows}
              participants={participants}
              onUpdateParticipants={updateParticipants}
              onAddLog={addSystemLog}
              onNavigateToParticipant={(participantId) => {
                setExternalSelectedParticipantId(participantId);
                handleActiveTabChange('katilimci');
              }}
            />
          )}

          {activeTab === 'katilimci' && (
            <ParticipantView
              participants={participants}
              groups={groups}
              periods={periods}
              onUpdateParticipants={updateParticipants}
              onAddLog={addSystemLog}
              externalSelectedParticipantId={externalSelectedParticipantId}
              onClearExternalSelectedParticipantId={() => setExternalSelectedParticipantId(null)}
            />
          )}

          {activeTab === 'kayit' && (
            <RegistrationView
              participants={participants}
              periods={periods}
              bungalows={bungalows}
              onUpdateParticipants={updateParticipants}
              onAddLog={addSystemLog}
              activeSubView={registrationSubTab}
              onChangeSubView={setRegistrationSubTab}
            />
          )}

          {activeTab === 'revir' && (
            <HealthView
              participants={participants}
              healthIncidents={healthIncidents}
              onAddHealthIncident={handleAddHealthIncident}
              onAddLog={addSystemLog}
            />
          )}

          {activeTab === 'dokümanlar' && (
            <DocumentationTab />
          )}

          {activeTab === 'yemekhane' && (
            <YemekhaneView
              participants={participants}
              mealPlans={mealPlans}
              tasks={tasks}
              shifts={shifts}
              onUpdateTasks={updateTasks}
              onUpdateShifts={updateShifts}
              onUpdateMealPlans={updateMealPlans}
              onAddLog={addSystemLog}
            />
          )}

          {activeTab === 'teknik' && (
            <TechnicalOperationsView
              selectedCenterId={selectedCenterId}
              tasks={tasks}
              shifts={shifts}
              onUpdateTasks={updateTasks}
              onUpdateShifts={updateShifts}
              onAddLog={addSystemLog}
              activeSubView={technicalSubTab}
              onChangeSubView={setTechnicalSubTab}
            />
          )}

          {activeTab === 'sistem-loglari'&& (
            <SystemLogsView logs={logs} onUndoLog={handleUndoLog} />
          )}

          {activeTab === 'dijital-arsiv' && (
            <DijitalArsivView onAddLog={addSystemLog} />
          )}
          {activeTab === 'sistem-guncellemeleri' && (
            <SystemUpdatesView />
          )}

          {activeTab === 'olay-kayit' && (
            <IncidentLogsView
              incidents={incidents}
              onUpdateIncidents={setIncidents}
              onAddLog={addSystemLog}
              currentUserId={currentUser.id}
              currentUserName={currentUser.name}
            />
          )}

          {activeTab === 'ayarlar' && (
            <SettingsView
              theme={theme}
              setTheme={setTheme}
              currentUser={currentUser}
              users={users}
              onUpdateUsers={setUsers}
              campCenters={campCenters}
              onUpdateCampCenters={updateCampCenters}
              periods={periods}
              onUpdatePeriods={updatePeriods}
              onAddLog={addSystemLog}
            />
          )}

          {activeTab === 'maliyet' && (
            <CostAnalysisView
              participants={participants}
              periods={periods}
              expenses={expenses}
              onUpdateExpenses={updateExpenses}
              onAddLog={addSystemLog}
            />
          )}

          {activeTab === 'anket-yonetimi' && (
            <SurveyManagementView 
              participants={participants} 
              surveys={surveys} 
              questions={questions} 
              setQuestions={setQuestions} 
              setSurveys={setSurveys} 
              campPeriods={periods}
            />
          )}

          {activeTab === 'anket-analizi' && (
            <SurveyAnalysisView
              participants={participants}
              periods={periods}
              surveys={surveys}
              questions={questions}
              setQuestions={setQuestions}
              onNavigateToParticipant={(id) => {
                
                handleActiveTabChange('katilimci');
              }}
              onAddLog={addSystemLog}
            />
          )}

          {activeTab === 'raporlar' && (
            <ReportsView 
              logs={logs}
              expenses={expenses}
              participants={participants}
              campCenters={campCenters}
              tasks={tasks}
              incidents={incidents}
              healthIncidents={healthIncidents}
              activities={activities}
              surveys={surveys}
              periods={periods}
            />
          )}

          {activeTab === 'guvenlik' && (
            <GuvenlikView
              participants={participants}
              tasks={tasks}
              shifts={shifts}
              staff={staff}
              onUpdateTasks={updateTasks}
              onUpdateShifts={updateShifts}
              onAddLog={(action, details) => addSystemLog(action, details)}
            />
          )}
        </main>
      </div>
      
      {showOnboarding && currentUser && (
        <OnboardingGuide role={currentUser.role} onComplete={handleCompleteOnboarding} />
      )}

      {/* Command Palette (Ctrl+K) */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-gray-900/40 backdrop-blur-sm p-4 pt-24" onClick={() => setShowCommandPalette(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in slide-in-from-top-4 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Arama yapın veya sekmeye gidin... (örn: katilimci)"
                className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-800 placeholder-gray-400"
                value={commandSearch}
                onChange={(e) => setCommandSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowCommandPalette(false);
                  if (e.key === 'Enter') {
                     const term = commandSearch.toLowerCase().trim();
                     const foundTab = currentUser?.allowedTabs.find(t => t.includes(term));
                     if (foundTab) {
                        handleActiveTabChange(foundTab as any);
                        setShowCommandPalette(false);
                        setCommandSearch('');
                     }
                  }
                }}
              />
              <div className="flex items-center gap-1 shrink-0 bg-gray-100 px-1.5 py-0.5 rounded text-3xs text-gray-500 font-medium cursor-pointer" onClick={() => setShowCommandPalette(false)}>
                ESC
              </div>
            </div>
            {commandSearch.length > 0 && (
              <div className="max-h-[300px] overflow-y-auto p-2">
                {currentUser?.allowedTabs.filter(t => t.includes(commandSearch.toLowerCase())).map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      handleActiveTabChange(tab as any);
                      setShowCommandPalette(false);
                      setCommandSearch('');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-emerald-50 text-emerald-800 text-sm font-semibold capitalize transition flex items-center justify-between"
                  >
                    <span>{tab.replace('-', ' ')}</span>
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </button>
                ))}
                {currentUser?.allowedTabs.filter(t => t.includes(commandSearch.toLowerCase())).length === 0 && (
                  <div className="p-4 text-center text-xs text-gray-500">Sonuç bulunamadı.</div>
                )}
              </div>
            )}
            {commandSearch.length === 0 && (
              <div className="p-4 bg-gray-50 text-xs text-gray-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-600">Kısayollar</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Arama / Menü Geçişi</span>
                    <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-gray-600 flex items-center gap-1"><Command className="w-3 h-3"/> K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hızlı Kaydet</span>
                    <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-gray-600 flex items-center gap-1"><Command className="w-3 h-3"/> S</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Toast (Ctrl+S) */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-emerald-500/50 p-1.5 rounded-full shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-50" />
          </div>
          <div>
            <h4 className="font-bold text-sm leading-tight">Kaydedildi</h4>
            <p className="text-[11px] text-emerald-100 leading-tight mt-0.5">Tüm değişiklikler başarıyla senkronize edildi.</p>
          </div>
        </div>
      )}

      {/* Floating Toast Notifications List */}
      <div className="fixed bottom-5 right-5 z-[10000] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isAlert = toast.type === 'alert';
          const isWarning = toast.type === 'warning';
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex gap-3 items-start animate-in slide-in-from-right-10 duration-200 ${
                isAlert
                  ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-100'
                  : isWarning
                  ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-100'
              }`}
            >
              <div className={`p-1.5 rounded-xl shrink-0 ${isAlert ? 'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-400' : isWarning ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400'}`}>
                {isAlert ? <AlertOctagon className="w-4 h-4" /> : isWarning ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {isAlert ? 'Kritik Alarm' : isWarning ? 'Önemli Uyarı' : 'Bilgilendirme'}
                </p>
                <p className="text-xs font-bold leading-normal mt-1">{toast.message}</p>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUpdateProfile={handleUpdateProfile}
          allUsers={users}
        />
      )}

      {isIdle && (
        <Screensaver currentUser={currentUser} onDismiss={() => setIsIdle(false)} />
      )}
      </motion.div>
      {currentUser && (
        <YesilAiChatbot 
          onNavigate={handleActiveTabChange}
          onFullscreen={(enable) => {
            const docEl = document.documentElement;
            if (enable && !isFullscreen) {
              if (docEl.requestFullscreen) docEl.requestFullscreen();
            } else if (!enable && isFullscreen) {
              if (document.exitFullscreen) document.exitFullscreen();
            }
          }}
          onThemeChange={setTheme}

          onDataAction={(actionName, data) => {
            if (actionName === 'CREATE_CAMP_PERIOD') {
              const newPeriod = { id: `PRD-${Date.now()}`, ...data };
              setPeriods([...periods, newPeriod]);
              addToast(`Yeni kamp dönemi eklendi: ${data.name}`, 'info');
              handleActiveTabChange('kamp-planlama');
            } else if (actionName === 'ADD_PARTICIPANT') {
              const newParticipant = { id: `STD-${Date.now()}`, ...data };
              setParticipants([...participants, newParticipant]);
              addToast(`Yeni katılımcı eklendi: ${data.firstName} ${data.lastName}`, 'info');
              handleActiveTabChange('katilimci');
            
            } else if (actionName === 'CREATE_TASK') {
              const newTask = { id: `TSK-${Date.now()}`, history: [], ...data };
              setTasks([...tasks, newTask]);
              addToast(`Yeni görev atandı: ${data.title}`, 'info');
              handleActiveTabChange('teknik');
            } else if (actionName === 'ADD_BUNGALOW') {
              const newBungalow = { id: `BNG-${Date.now()}`, currentOccupants: 0, status: 'Müsait', conditions: { cleanliness: 100, maintenance: 100, lastCleaned: new Date().toISOString() }, issues: [], ...data };
              setBungalows([...bungalows, newBungalow]);
              addToast(`Yeni bungalov eklendi: ${data.number}`, 'info');
              handleActiveTabChange('bungalov');
            } else if (actionName === 'ADD_HEALTH_INCIDENT') {
              const incident = { id: `INC-${Date.now()}`, ...data };
              setHealthIncidents([...healthIncidents, incident]);
              addToast(`Sağlık vakası kaydedildi.`, 'warning');
              handleActiveTabChange('revir');
            }
          }}

          onLockScreen={() => setIsIdle(true)}
        />
      )}
    </AnimatePresence>
  );
}
