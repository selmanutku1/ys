/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// We import the initial data for DB seeding if it doesn't exist
import { 
  INITIAL_CAMP_CENTERS, 
  INITIAL_BUNGALOWS, 
  INITIAL_STAFF, 
  INITIAL_GROUPS, 
  INITIAL_CAMP_PERIODS, 
  INITIAL_PARTICIPANTS, 
  INITIAL_HEALTH_INCIDENTS, 
  INITIAL_MEAL_PLANS, 
  INITIAL_ACTIVITIES, 
  INITIAL_LOGS, 
  INITIAL_SURVEYS 
} from './src/data';

const DB_FILE = path.join(process.cwd(), 'db_store.json');

function getInitialState() {
  return {
    campCenters: INITIAL_CAMP_CENTERS,
    bungalows: INITIAL_BUNGALOWS,
    staff: INITIAL_STAFF,
    groups: INITIAL_GROUPS,
    periods: INITIAL_CAMP_PERIODS,
    participants: INITIAL_PARTICIPANTS,
    healthIncidents: INITIAL_HEALTH_INCIDENTS,
    mealPlans: INITIAL_MEAL_PLANS,
    activities: INITIAL_ACTIVITIES,
    surveys: INITIAL_SURVEYS,
    logs: INITIAL_LOGS
  };
}

function readState() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed.bungalows) {
        parsed.bungalows = parsed.bungalows.map((b: any) => ({ ...b, capacity: 6 }));
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error reading db_store.json, resetting to initial', error);
  }
  
  const initial = getInitialState();
  writeState(initial);
  return initial;
}

function writeState(state: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing db_store.json', error);
  }
}


function scheduleBackups() {
  const BACKUP_DIR = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
  }
  
  // Create a backup every 1 hour
  setInterval(() => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(BACKUP_DIR, `db_backup_${timestamp}.json`);
        fs.copyFileSync(DB_FILE, backupPath);
        console.log(`[Backup] Automatic backup created: ${backupPath}`);
        
        // Keep only the last 10 backups
        const backups = fs.readdirSync(BACKUP_DIR)
          .filter(file => file.startsWith('db_backup_'))
          .sort((a, b) => b.localeCompare(a)); // descending
        
        if (backups.length > 10) {
          const toDelete = backups.slice(10);
          toDelete.forEach(file => {
            fs.unlinkSync(path.join(BACKUP_DIR, file));
          });
        }
      }
    } catch (err) {
      console.error('[Backup] Error creating automatic backup', err);
    }
  }, 60 * 60 * 1000);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Vite requires inline scripts
    crossOriginEmbedderPolicy: false,
  }));
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });
  app.use(limiter);
  
  // Start background backup task
  scheduleBackups();


  // API endpoints
// Gemini Chatbot Endpoint
// Gemini Chatbot Endpoint
app.post('/api/gemini/chat', express.json(), async (req, res) => {
  try {
    const { prompt, history } = req.body;
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const state = readState();
    const systemInstruction = `Sen YeşilAI adında, Türkiye Yeşilay Cemiyeti'nin Kamp Yönetim Sistemi (KYS) için tasarlanmış özel, yetenekli ve akıllı bir asistansın.
Kullanıcıların sistem içinde gezinmesine, ayarları değiştirmesine ve bilgi almasına yardımcı olursun.
Daima nazik, profesyonel ve yardımsever bir dil kullan.

Mevcut Eylemler (Kullanıcının isteği yönlendirme veya işlem gerektiriyorsa "action" objesi ile belirtin. Kısayol komutları için MUTLAKA "action" döndürün):
- NAVIGATE: Kullanıcıyı belirli bir sayfaya yönlendirir. Geçerli sekmeler (Payload olarak kullanılacaklar):
  * dashboard (Ana Sayfa)
  * kamp-planlama (Kamp Dönemleri Planlama / Kamp Takvimi)
  * bungalov (Bungalov ve Konaklama Yönetimi)
  * katilimci (Katılımcı ve Öğrenci Listesi)
  * kayit (Yeni Kayıt İşlemleri)
  * revir (Sağlık ve Revir Modülü)
  * yemekhane (Yemek Planı ve Stok)
  * teknik (Teknik Operasyonlar ve Arıza)
  * guvenlik (Güvenlik Yönetimi)
  * dokümanlar (Belgeler ve Evraklar)
  * ayarlar (Sistem Ayarları)
  * maliyet (Maliyet ve Bütçe Analizi)
  * anket-analizi (Değerlendirme Anketleri)
  * sistem-loglari (Loglar)
  * dijital-arsiv (Arşiv ve Eski Kayıtlar)
  * olay-kayit (Vaka/Olay Bildirimi)
  * raporlar (Genel Raporlama)
- FULLSCREEN: Tam ekran modunu açar (true) veya kapatır (false).
- THEME: Temayı değiştirir. Değerler: light, dark, system.
- LOCK_SCREEN: Güvenli moda (ekran koruyucu / kilit ekranı) geçer.

- DATA_ACTION: Veri üzerinde işlem yapar. type olarak "DATA_ACTION" ve payload olarak BİR JSON DİZGİSİ (STRING) döner.
  Geçerli JSON dizgisi (string) formatı şu şekilde olmalıdır: "{\"actionName\": \"...\", \"data\": {...}}"
  * CREATE_CAMP_PERIOD: Yeni bir kamp dönemi oluşturur. data formatı: { name: string, campCenterId: "CEN-01", startDate: string, endDate: string, maxQuota: number, isActive: true, status: 'Planlandı' }
  * ADD_PARTICIPANT: Yeni bir katılımcı ekler. data formatı: { firstName: string, lastName: string, tcNo: string, gender: 'Erkek'|'Kadın', birthDate: string, phone: string, status: 'Kayıtlı' }
    * ADD_HEALTH_INCIDENT: Yeni bir sağlık vakası ekler. data formatı: { participantId: string, date: string, type: 'Yaralanma'|'Hastalık'|'Diğer', description: string, status: 'Açık' }
  * CREATE_TASK: Yeni görev oluşturur (teknik/temizlik). data formatı: { title: string, description: string, assignedToName: string, department: 'Temizlik'|'Güvenlik'|'Teknik', status: 'Bekliyor', priority: 'Yüksek' }
  * ADD_BUNGALOW: Yeni bungalov ekler. data formatı: { number: string, campCenterId: "C01", capacity: number, genderType: 'Erkek'|'Kadın'|'Karışık/Aile' }

Örnek Yanıtlar:
Kullanıcı: "Yeni bir kamp dönemi oluştur, adı Yaz Kampı olsun" -> text: "Yaz Kampı başarıyla oluşturuluyor...", action: { type: "DATA_ACTION", payload: "{\"actionName\": \"CREATE_CAMP_PERIOD\", \"data\": {\"name\": \"Yaz Kampı\", \"campCenterId\": \"CEN-01\", \"startDate\": \"2026-07-01\", \"endDate\": \"2026-07-15\", \"maxQuota\": 100, \"isActive\": true, \"status\": \"Planlandı\"}}" }
Kullanıcı: "Tam ekrana geç" -> text: "Tam ekran modu açılıyor.", action: { type: "FULLSCREEN", payload: "true" }
Kullanıcı: "Güvenli mod" -> text: "Sistem güvenli kilit ekranına alınıyor.", action: { type: "LOCK_SCREEN", payload: "" }
Kullanıcı: "Öğrencileri nerede görebilirim?" -> text: "Katılımcılar sayfasından tüm öğrencileri görebilirsiniz, sizi oraya yönlendiriyorum.", action: { type: "NAVIGATE", payload: "katilimci" }
Kullanıcı: "Kamp takvimini aç" -> text: "Kamp takvimi (kamp dönemleri planlama) sayfasına yönlendiriyorum.", action: { type: "NAVIGATE", payload: "kamp-planlama" }
Kullanıcı: "Yemekhaneye git" -> text: "Yemekhane yönetimi sayfasına yönlendiriyorum.", action: { type: "NAVIGATE", payload: "yemekhane" }
Kullanıcı: "Depoya bak" -> text: "Depo ve erzak stok sayfasına yönlendiriyorum.", action: { type: "NAVIGATE", payload: "yemekhane" }
Kullanıcı: "Teknik işleri aç" -> text: "Teknik operasyonlar sayfasına yönlendiriyorum.", action: { type: "NAVIGATE", payload: "teknik" }


Sistem Verisi (Proje İçi Besleme - Sorulara Buradan Yanıt Ver):
- Toplam Kamp Merkezi: ${state.campCenters?.length || 0} (${state.campCenters?.map(c=>c.name).join(', ')})
- Toplam Kamp Dönemi: ${state.periods?.length || 0}
- Toplam Kayıtlı Katılımcı: ${state.participants?.length || 0}
- Bungalov Sayısı: ${state.bungalows?.length || 0}
- Revirdeki Olay Sayısı: ${state.healthIncidents?.length || 0}
`;

    const contents = history && history.length > 0 ? [...history, { role: 'user', parts: [{ text: prompt }] }] : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "Kullanıcıya gösterilecek dostane ve yardımsever mesaj" },
            action: {
              type: Type.OBJECT,
              description: "Eğer kullanıcının isteği bir eylem gerektiriyorsa doldurulacak alan. Yoksa boş bırakın.",
              properties: {
                type: { type: Type.STRING, description: "Eylem tipi: 'NAVIGATE', 'FULLSCREEN', 'THEME', 'LOCK_SCREEN', 'DATA_ACTION'" },
                payload: { type: Type.STRING, description: "Eylem parametresi. Eğer DATA_ACTION ise string formatında JSON olmalıdır." }
              }
            }
          },
          required: ["text"]
        }
      }
    });

    const jsonString = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(jsonString));
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    const status = err.status || 500;
    const message = status === 429 
      ? 'Günlük kullanım limitiniz doldu. Lütfen bir süre bekleyin.' 
      : 'Chatbot şu anda yanıt veremiyor.';
    res.status(status).json({ error: message });
  }
});


// Weather API proxy endpoint
app.get('/api/weather', async (req, res) => {
  const { city, forecast } = req.query;
  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Weather API key not configured' });
    }
    
    // Using OpenWeatherMap API
    const baseUrl = forecast 
      ? `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(String(city))}&appid=${apiKey}&units=metric&lang=tr`
      : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(String(city))}&appid=${apiKey}&units=metric&lang=tr`;
    
    const response = await fetch(baseUrl);
    if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch weather' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('Weather API Error:', err);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});



app.get('/api/state', (req, res) => {
    const state = readState();
    res.json(state);
  });

  app.post('/api/state/sync', (req, res) => {
    try {
      const partialState = req.body;
      if (partialState && typeof partialState === 'object') {
        const currentState = readState();
        const newState = { ...currentState, ...partialState };
        writeState(newState);
        res.json({ success: true });
      } else {
        res.status(400).json({ error: 'Geçersiz veri formatı' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/apply', (req, res) => {
    try {
      const { type, payload } = req.body; // type can be 'individual' or 'convoy'
      const state = readState();
      const timestamp = new Date().toISOString();
      
      if (type === 'individual') {
        const p = payload;
        const newId = `P-REM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newParticipant = {
          ...p,
          id: newId,
          status: 'Başvuru Yapıldı',
          bungalowId: null,
          bedNumber: null,
          groupId: null,
          checkedIn: false
        };
        
        state.participants.push(newParticipant);
        
        // Add System Log
        state.logs.unshift({
          id: `L-${Date.now()}`,
          timestamp,
          user: 'Uzaktan Portal',
          action: 'Online Bireysel Başvuru',
          details: `${p.name} (${p.gender} - ${p.category}) adlı gönüllü uzaktan başvuru bağlantısıyla online müracaatta bulundu. İl: ${p.city}, İlçe: ${p.district}.`
        });
        
        writeState(state);
        return res.json({ success: true, participantId: newId });
      } else if (type === 'convoy') {
        const { convoyName, leader, members, campPeriodId } = payload;
        const baseIdNum = Date.now();
        const leaderId = `PT-REM-LDR-${baseIdNum}`;
        
        // 1. Leader Participant
        const newLeader = {
          ...leader,
          id: leaderId,
          status: 'Başvuru Yapıldı',
          bungalowId: null,
          bedNumber: null,
          campPeriodId,
          convoyName,
          isConvoyLeader: true,
          groupId: null,
          checkedIn: false
        };
        
        state.participants.push(newLeader);
        
        // 2. Members
        const newMembers = members.map((member: any, idx: number) => {
          return {
            ...member,
            id: `PT-REM-MEM-${baseIdNum}-${idx}`,
            status: 'Başvuru Yapıldı',
            bungalowId: null,
            bedNumber: null,
            phone: leader.phone,
            email: leader.email,
            address: leader.address || convoyName,
            city: leader.city,
            district: leader.district,
            campPeriodId,
            convoyName,
            isConvoyLeader: false,
            convoyLeaderId: leaderId,
            groupId: null,
            checkedIn: false
          };
        });
        
        state.participants.push(...newMembers);
        
        // Add System Log
        state.logs.unshift({
          id: `L-${Date.now()}`,
          timestamp,
          user: 'Uzaktan Portal',
          action: 'Online Kafile Başvurusu',
          details: `'${convoyName}' kafilesi (${leader.name} liderliğinde, ${members.length} katılımcı) uzaktan başvuru bağlantısıyla toplu müracaatta bulundu.`
        });
        
        writeState(state);
        return res.json({ success: true, leaderId });
      }
      
      res.status(400).json({ error: 'Geçersiz başvuru tipi' });
    } catch (err: any) {
      console.error('Application registration error', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Google Calendar API proxy route
  app.get('/api/google-calendar/events', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const calendarId = req.query.calendarId || 'primary';
      
      if (!authHeader) {
        // Return realistic upcoming events if no token is passed (fallback demo mode)
        const sampleEvents = [
          {
            id: 'g1',
            summary: 'Sabah Spinning & Doğa Yürüyüşü',
            description: 'Güne enerjik bir başlangıç için eğitmen eşliğinde doğa yürüyüşü.',
            location: 'Ormanlık Parkur',
            start: { dateTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString() }
          },
          {
            id: 'g2',
            summary: 'Yeşilay Teknoloji Bağımlılığı Semineri',
            description: 'Teknoloji bağımlılığıyla mücadele üzerine eğitici sunum.',
            location: 'Büyük Amfi',
            start: { dateTime: new Date(Date.now() + 26 * 3600 * 1000).toISOString() }
          },
          {
            id: 'g3',
            summary: 'Grup Atölyesi: Akıl Oyunları',
            description: 'Takım çalışması ve stratejik düşünme becerileri atölyesi.',
            location: 'Atölye B',
            start: { dateTime: new Date(Date.now() + 50 * 3600 * 1000).toISOString() }
          },
          {
            id: 'g4',
            summary: 'Kamp Ateşi & Akustik Dinleti',
            description: 'Günün yorgunluğunu müzik ve sohbetle atıyoruz.',
            location: 'Ateş Alanı',
            start: { dateTime: new Date(Date.now() + 74 * 3600 * 1000).toISOString() }
          }
        ];
        return res.json({ items: sampleEvents });
      }

      const cleanToken = authHeader.replace('Bearer ', '');
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(String(calendarId))}/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(new Date().toISOString())}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `Google API error: ${errorText}` });
      }

      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      console.error('Error in google calendar proxy route', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
