/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Participant, CampPeriod, Bungalow } from '../types';
import { Search } from 'lucide-react';
import { 
  FileEdit, 
  Smile, 
  Check, 
  X, 
  AlertTriangle, 
  UserCheck,
  Printer,
  FileText,
  FileDown,
  Users,
  MapPin,
  Plus,
  Trash2,
  CalendarDays,
  Building,
  CheckSquare,
  Square,
  HelpCircle,
  Link,
  Copy,
  Pencil,
  Save,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  AlertCircle,
  UploadCloud
} from 'lucide-react';
import { exportToWord, exportToPdf } from '../utils/formExporter';
import { HelpTooltip } from './HelpTooltip';
import SignaturePad from './SignaturePad';
import LegalDocumentBox from './LegalDocumentBox';

const CITY_DISTRICT_MAP: Record<string, string[]> = {
  'Adana': ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan', 'Kozan', 'İmamoğlu', 'Karataş', 'Pozantı', 'Feke'],
  'Adıyaman': ['Merkez', 'Kahta', 'Besni', 'Gölbaşı', 'Gerger', 'Samsat', 'Çelikhan', 'Tut', 'Sincik'],
  'Afyonkarahisar': ['Merkez', 'Sandıklı', 'Dinar', 'Bolvadin', 'Emirdağ', 'Sinanpaşa', 'Şuhut', 'Çay', 'İhsaniye'],
  'Ağrı': ['Merkez', 'Patnos', 'Doğubayazıt', 'Diyadin', 'Eleşkirt', 'Tutak', 'Taşlıçay', 'Hamur'],
  'Amasya': ['Merkez', 'Merzifon', 'Suluova', 'Taşova', 'Gümüşhacıköy', 'Göynücek', 'Hamamözü'],
  'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Gölbaşı', 'Polatlı', 'Beypazarı', 'Kahramankazan', 'Nallıhan', 'Haymana', 'Kadınılcahamam', 'Şereflikoçhisar'],
  'Antalya': ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya', 'Manavgat', 'Kemer', 'Serik', 'Kumluca', 'Kaş', 'Finike', 'Gazipaşa', 'Demre', 'Elmalı', 'Akseki', 'İbradı', 'Gündoğmuş'],
  'Artvin': ['Merkez', 'Hopa', 'Borçka', 'Arhavi', 'Şavşat', 'Yusufeli', 'Ardanuç', 'Murgul', 'Kemalpaşa'],
  'Aydın': ['Efeler', 'Nazilli', 'Söke', 'Kuşadası', 'Didim', 'Germencik', 'İncirliova', 'Çine', 'Bozdoğan', 'Karacasu', 'Sultanhisar', 'Köşk'],
  'Balıkesir': ['Altıeylül', 'Karesi', 'Edremit', 'Bandırma', 'Ayvalık', 'Burhaniye', 'Gönen', 'Erdek', 'Bigadiç', 'Sındırgı', 'Havran', 'Dursunbey', 'Susurluk', 'Manyas', 'Savaştepe', 'İvrindi'],
  'Bilecik': ['Merkez', 'Bozüyük', 'Osmaneli', 'Söğüt', 'Gölpazarı', 'Pazaryeri', 'Yenipazar', 'İnhisar'],
  'Bingöl': ['Merkez', 'Genç', 'Solhan', 'Karlıova', 'Adaklı', 'Kiğı', 'Yedisu', 'Yayladere'],
  'Bitlis': ['Merkez', 'Tatvan', 'Ahlat', 'Adilcevaz', 'Güroymak', 'Hizan', 'Mutki'],
  'Bolu': ['Merkez', 'Gerede', 'Mudurnu', 'Göynük', 'Mengen', 'Yeniçağa', 'Dörtdivan', 'Seben', 'Kıbrıscık'],
  'Burdur': ['Merkez', 'Bucak', 'Gölhisar', 'Yeşilova', 'Tefenni', 'Karamanlı', 'Kemer', 'Altınyayla', 'Çavdır', 'Ağlasun', 'Çeltikçi'],
  'Bursa': ['Osmangazi', 'Nilüfer', 'Yıldırım', 'İnegöl', 'Gemlik', 'Mustafakemalpaşa', 'Mudanya', 'Gürsu', 'Kestel', 'Karacabey', 'Orhangazi', 'Yenişehir', 'İznik', 'Orhaneli', 'Keles', 'Büyükorhan', 'Harmancık'],
  'Çanakkale': ['Merkez', 'Biga', 'Gelibolu', 'Çan', 'Ayvacık', 'Ezine', 'Yenice', 'Lapseki', 'Bayramiç', 'Eceabat', 'Gökçeada', 'Bozcaada'],
  'Çankırı': ['Merkez', 'Orta', 'Çerkeş', 'Ilgaz', 'Kurşunlu', 'Yapraklı', 'Eldivan', 'Şabanözü'],
  'Çorum': ['Merkez', 'Sungurlu', 'Osmancık', 'Alaca', 'İskilip', 'Mecitözü', 'Bayat', 'Kargı', 'Uğurludağ', 'Ortaköy', 'Oğuzlar', 'Dodurga', 'Laçin', 'Boğazkale'],
  'Denizli': ['Pamukkale', 'Merkezefendi', 'Acıpayam', 'Tavas', 'Çivril', 'Sarayköy', 'Buldan', 'Honaz', 'Kale', 'Çal', 'Bozkurt', 'Serinhisar', 'Güney', 'Çardak', 'Bekilli', 'Babadağ'],
  'Diyarbakır': ['Kayapınar', 'Bağlar', 'Yenişehir', 'Sur', 'Ergani', 'Bismil', 'Silvan', 'Çınar', 'Lice', 'Kulp', 'Dicle', 'Hani', 'Eğil', 'Hazro', 'Kocaköy'],
  'Edirne': ['Merkez', 'Keşan', 'Uzunköprü', 'İpsala', 'Havsa', 'Meriç', 'Enez', 'Süloğlu', 'Lalapaşa'],
  'Elazığ': ['Merkez', 'Kovancılar', 'Karakoçan', 'Palu', 'Baskil', 'Arıcak', 'Maden', 'Sivrice', 'Alacakaya', 'Keban', 'Ağın'],
  'Erzincan': ['Merkez', 'Tercan', 'Üzümlü', 'Refahiye', 'Çayırlı', 'İliç', 'Kemah', 'Kemaliye', 'Otlukbeli'],
  'Erzurum': ['Yakutiye', 'Palandöken', 'Aziziye', 'Oltu', 'Horasan', 'Hınıs', 'İspir', 'Pasinler', 'Karayazı', 'Aşkale', 'Tekman', 'Tortum', 'Karaçoban', 'Şenkaya', 'Köprüköy', 'Olur'],
  'Eskişehir': ['Odunpazarı', 'Tepebaşı', 'Sivrihisar', 'Çifteler', 'Seyitgazi', 'Alpu', 'Mihalıççık', 'Mahmudiye', 'Beylikova', 'İnönü', 'Sarıcakaya', 'Günyüzü', 'Mihalgazi', 'Han'],
  'Gaziantep': ['Şahinbey', 'Şehitkamil', 'Nizip', 'Islahiye', 'Nurdağı', 'Araban', 'Oğuzeli', 'Yavuzeli', 'Karkamış'],
  'Giresun': ['Merkez', 'Bulancak', 'Espiye', 'Görele', 'Tirebolu', 'Şebinkarahisar', 'Dereli', 'Keşap', 'Yağlıdere', 'Alucra', 'Piraziz', 'Eynesil', 'Çamoluk', 'Güce'],
  'Gümüşhane': ['Merkez', 'Kelkit', 'Şiran', 'Köse', 'Kürtün', 'Torul'],
  'Hakkari': ['Merkez', 'Yüksekova', 'Şemdinli', 'Çukurca', 'Derecik'],
  'Hatay': ['Antakya', 'İskenderun', 'Defne', 'Dörtyol', 'Samandağ', 'Kırıkhan', 'Reyhanlı', 'Arsuz', 'Altınözü', 'Hassa', 'Erzin', 'Payas', 'Belen', 'Yayladağı', 'Kumlu'],
  'Isparta': ['Merkez', 'Yalvaç', 'Eğirdir', 'Şarkikaraağaç', 'Gelendost', 'Keçiborlu', 'Senirkent', 'Sütçüler', 'Gönen', 'Uluborlu', 'Atabey', 'Aksu', 'Yenişarbademli'],
  'Mersin': ['Tarsus', 'Toroslar', 'Yenişehir', 'Akdeniz', 'Mezitli', 'Silifke', 'Anamur', 'Erdemli', 'Mut', 'Bozyazı', 'Gülnar', 'Aydıncık', 'Çamlıyayla'],
  'İstanbul': ['Beşiktaş', 'Kadıköy', 'Fatih', 'Üsküdar', 'Pendik', 'Esenyurt', 'Sarıyer', 'Beykoz', 'Şile', 'Arnavutköy', 'Bakırköy', 'Şişli', 'Beylikdüzü', 'Maltepe', 'Kartal', 'Ataşehir', 'Kağıthane', 'Zeytinburnu', 'Bağcılar', 'Bahçelievler', 'Eyüpsultan', 'Gaziosmanpaşa', 'Ümraniye', 'Sultangazi', 'Başakşehir', 'Sancaktepe', 'Tuzla', 'Büyükçekmece', 'Silivri', 'Çatalca'],
  'İzmir': ['Konak', 'Bornova', 'Karşıyaka', 'Buca', 'Çeşme', 'Aliağa', 'Karabağlar', 'Bayraklı', 'Çiğli', 'Gaziemir', 'Menemen', 'Torbalı', 'Ödemiş', 'Bergama', 'Kemalpaşa', 'Tire', 'Balçova', 'Narlıdere', 'Urla', 'Foça', 'Seferihisar', 'Selçuk', 'Dikili', 'Kiraz', 'Menderes'],
  'Kars': ['Merkez', 'Sarıkamış', 'Kağızman', 'Digor', 'Selim', 'Arpaçay', 'Akyaka', 'Susuz'],
  'Kastamonu': ['Merkez', 'Tosya', 'Taşköprü', 'Cide', 'İnebolu', 'Araç', 'Devrekani', 'Daday', 'Küre', 'Abana', 'Bozkurt', 'Seydiler'],
  'Kayseri': ['Melikgazi', 'Kocasinan', 'Talas', 'Develi', 'Yahyalı', 'Hacılar', 'Bünyan', 'Pınarbaşı', 'Tomarza', 'Yeşilhisar', 'Sarıoğlan', 'Felahiye', 'Özvatan'],
  'Kırklareli': ['Merkez', 'Lüleburgaz', 'Babaeski', 'Vize', 'Pınarhisar', 'Demirköy', 'Pehlivanköy', 'Kofçaz'],
  'Kırşehir': ['Merkez', 'Kaman', 'Mucur', 'Çiçekdağı', 'Akpınar', 'Boztepe', 'Akçakent'],
  'Kocaeli': ['İzmit', 'Gebze', 'Darıca', 'Körfez', 'Gölcük', 'Derince', 'Kartepe', 'Çayırova', 'Başiskele', 'Karamürsel', 'Kandıra', 'Dilovası'],
  'Konya': ['Selçuklu', 'Meram', 'Karatay', 'Ereğli', 'Akşehir', 'Beyşehir', 'Kulu', 'Cihanbeyli', 'Seydişehir', 'Karapınar', 'Çumra', 'Ilgın', 'Bozkır', 'Sarayönü', 'Yunak', 'Kadınhanı'],
  'Kütahya': ['Merkez', 'Tavşanlı', 'Simav', 'Gediz', 'Emet', 'Altıntaş', 'Domaniç', 'Hisarcık', 'Aslanapa', 'Şaphane'],
  'Malatya': ['Yeşilyurt', 'Battalgazi', 'Doğanşehir', 'Akçadağ', 'Darende', 'Hekimhan', 'Pütürge', 'Yazıhan', 'Arapgir', 'Arguvan', 'Kuluncak', 'Kale', 'Doğanyol'],
  'Manisa': ['Yunusemre', 'Şehzadeler', 'Akhisar', 'Turgutlu', 'Salihli', 'Soma', 'Alaşehir', 'Saruhanlı', 'Kula', 'Kırkağaç', 'Demirci', 'Gördes', 'Selendi', 'Ahmetli', 'Köprübaşı'],
  'Kahramanmaraş': ['Onikişubat', 'Dulkadiroğlu', 'Elbistan', 'Afşin', 'Türkoğlu', 'Pazarcık', 'Göksun', 'Andırın', 'Çağlayancerit', 'Ekinözü', 'Nurhak'],
  'Mardin': ['Artuklu', 'Kadınıltepe', 'Midyat', 'Nusaybin', 'Derik', 'Mazıdağı', 'Dargeçit', 'Savur', 'Yeşilli', 'Ömerli'],
  'Muğla': ['Menteşe', 'Bodrum', 'Fethiye', 'Milas', 'Marmaris', 'Ortaca', 'Yatağan', 'Dalaman', 'Datça', 'Köyceğiz', 'Ula', 'Kavaklıdere'],
  'Muş': ['Merkez', 'Bulanık', 'Malazgirt', 'Hasköy', 'Varto', 'Korkut'],
  'Nevşehir': ['Merkez', 'Ürgüp', 'Avanos', 'Gülşehir', 'Derinkuyu', 'Acıgöl', 'Kozaklı', 'Hacıbektaş'],
  'Niğde': ['Merkez', 'Bor', 'Çamardı', 'Ulukışla', 'Altunhisar', 'Çiftlik'],
  'Ordu': ['Altınordu', 'Ünye', 'Fatsa', 'Gölköy', 'Korgan', 'Kumru', 'Perşembe', 'Aybastı', 'Ulubey', 'Mesudiye', 'İkizce', 'Gürgentepe'],
  'Rize': ['Merkez', 'Çayeli', 'Ardeşen', 'Pazar', 'Fındıklı', 'Güneysu', 'Kalkandere', 'İyidere', 'Derepazarı', 'Çamlıhemşin', 'İkizdere', 'Hemşin'],
  'Sakarya': ['Adapazarı', 'Serdivan', 'Akyazı', 'Erenler', 'Hendek', 'Karasu', 'Geyve', 'Arifiye', 'Sapanca', 'Pamukova', 'Kocaali', 'Ferizli', 'Söğütlü', 'Karapürçek', 'Taraklı'],
  'Samsun': ['İlkadım', 'Atakum', 'Bafra', 'Çarşamba', 'Canik', 'Vezirköprü', 'Tekkeköy', 'Havza', 'Alaçam', 'Terme', '19 Mayıs', 'Kavak', 'Salıpazarı', 'Ayvacık', 'Ladik'],
  'Siirt': ['Merkez', 'Kurtalan', 'Eruh', 'Baykan', 'Şirvan', 'Tillo'],
  'Sinop': ['Merkez', 'Boyabat', 'Gerze', 'Ayancık', 'Durağan', 'Türkeli', 'Erfelek', 'Saraydüzü', 'Dikmen'],
  'Sivas': ['Merkez', 'Şarkışla', 'Yıldızeli', 'Suşehri', 'Gemerek', 'Zara', 'Kangal', 'Gürün', 'Divriği', 'Koyulhisar', 'Altınyayla'],
  'Tekirdağ': ['Süleymanpaşa', 'Çorlu', 'Çerkezköy', 'Kapaklı', 'Ergene', 'Malkara', 'Saray', 'Hayrabolu', 'Şarköy', 'Muratlı', 'Marmaraereğlisi'],
  'Tokat': ['Merkez', 'Erbaa', 'Turhal', 'Niksar', 'Zile', 'Reşadiye', 'Almus', 'Pazar', 'Yeşilyurt', 'Sulusaray'],
  'Trabzon': ['Ortahisar', 'Akçaabat', 'Araklı', 'Sürmene', 'Of', 'Yomra', 'Arsin', 'Vakfıkebir', 'Beşikdüzü', 'Tonya', 'Maçka', 'Çaykara', 'Şalpazarı', 'Düzköy'],
  'Tunceli': ['Merkez', 'Ovacık', 'Mazgirt', 'Pertek', 'Hozat', 'Çemişgezek', 'Pülümür', 'Nazımiye'],
  'Şanlıurfa': ['Haliliye', 'Eyyübiye', 'Karaköprü', 'Siverek', 'Viranşehir', 'Birecik', 'Suruç', 'Ceylanpınar', 'Harran', 'Akçakale', 'Bozova', 'Hilvan', 'Halfeti'],
  'Uşak': ['Merkez', 'Banaz', 'Eşme', 'Sivaslı', 'Ulubey', 'Karahallı'],
  'Van': ['İpekyolu', 'Tuşba', 'Edremit', 'Erciş', 'Özalp', 'Muradiye', 'Çaldıran', 'Başkale', 'Gevaş', 'Saray', 'Gürpınar', 'Çatak', 'Bahçesaray'],
  'Yozgat': ['Merkez', 'Sorgun', 'Akdağmadeni', 'Yerköy', 'Boğazlıyan', 'Sarıkaya', 'Çekerek', 'Şefaatli', 'Saraykent', 'Aydıncık'],
  'Zonguldak': ['Merkez', 'Ereğli', 'Alaplı', 'Çaycuma', 'Devrek', 'Kozlu', 'Kilimli', 'Gökçebey'],
  'Aksaray': ['Merkez', 'Ortaköy', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Sarıyahşi', 'Ağaçören'],
  'Bayburt': ['Merkez', 'Demirözü', 'Aydıntepe'],
  'Karaman': ['Merkez', 'Ermenek', 'Sarıveliler', 'Ayrancı', 'Kazımkarabekir', 'Başyayla'],
  'Kırıkkale': ['Merkez', 'Yahşihan', 'Bahşılı', 'Keskin', 'Delice', 'Sulakyurt', 'Karakeçili', 'Balışeyh', 'Çelebi'],
  'Batman': ['Merkez', 'Kozluk', 'Beşiri', 'Sason', 'Gercüş', 'Hasankeyf'],
  'Şırnak': ['Merkez', 'Cizre', 'Silopi', 'İdil', 'Uludere', 'Beytüşşebap', 'Güçlükonak'],
  'Bartın': ['Merkez', 'Amasra', 'Ulus', 'Kurucaşile'],
  'Ardahan': ['Merkez', 'Göle', 'Çıldır', 'Posof', 'Hanak', 'Damal'],
  'Iğdır': ['Merkez', 'Aralık', 'Tuzluca', 'Karakoyunlu'],
  'Yalova': ['Merkez', 'Çiftlikköy', 'Çınarcık', 'Altınova', 'Armutlu', 'Termal'],
  'Karabük': ['Merkez', 'Safranbolu', 'Yenice', 'Eskipazar', 'Ovacık', 'Eflani'],
  'Kilis': ['Merkez', 'Musabeyli', 'Elbeyli', 'Polateli'],
  'Osmaniye': ['Merkez', 'Kadirli', 'Düziçi', 'Bahçe', 'Toprakkale', 'Sumbas', 'Hasanbeyli'],
  'Düzce': ['Merkez', 'Akçakoca', 'Kaynaşlı', 'Gölyaka', 'Çilimli', 'Yığılca', 'Gümüşova', 'Cumayeri']
};

interface RegistrationViewProps {
  participants: Participant[];
  periods: CampPeriod[];
  bungalows: Bungalow[];
  onUpdateParticipants: (updated: Participant[]) => void;
  onAddLog: (action: string, details: string) => void;
  isRemote?: boolean;
  activeSubView?: 'form' | 'queue';
  onChangeSubView?: (view: 'form' | 'queue') => void;
}

export default function RegistrationView({
  participants,
  periods,
  bungalows,
  onUpdateParticipants,
  onAddLog,
  isRemote = false,
  activeSubView = 'form',
  onChangeSubView,
}: RegistrationViewProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // URL Parameter Detection
  const params = new URLSearchParams(window.location.search);
  const urlPeriodId = params.get('periodId');
  const urlCenterId = params.get('centerId');

  // Filter periods by center if provided
  const filteredPeriods = urlCenterId 
    ? (periods.filter(p => p.campCenterId === urlCenterId).length > 0 
        ? periods.filter(p => p.campCenterId === urlCenterId) 
        : periods)
    : periods;

  const initialPeriodId = urlPeriodId || (filteredPeriods.find(p => p.isActive)?.id || filteredPeriods[0]?.id || '');

  // 1. Individual Form State
  const [selectedPeriodId, setSelectedPeriodId] = useState(initialPeriodId);
  const [name, setName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [birthDate, setBirthDate] = useState('2013-05-15');
  const [gender, setGender] = useState<'Erkek' | 'Kadın'>('Erkek');
  const [category, setCategory] = useState<'İlkokul' | 'Ortaokul' | 'Lise' | 'Üniversite' | 'Yetişkin' | 'Kafile Sorumlusu' | 'Şoför'>('Lise');
  const [duty, setDuty] = useState('Katılımcı');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('Beşiktaş');
  const [address, setAddress] = useState('');
  
  const [allergies, setAllergies] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [medications, setMedications] = useState('');
  const [healthNote, setHealthNote] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  
  // Placement State
  const [autoAllocate, setAutoAllocate] = useState(true);
  const [preferredBungalowId, setPreferredBungalowId] = useState<string>('');
  const [preferredBedNumber, setPreferredBedNumber] = useState<number>(0);

  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // 2. Convoy Form State
  const [convoyName, setConvoyName] = useState('');
  const [convoyPeriodId, setConvoyPeriodId] = useState(initialPeriodId);
  
  // Leader info
  const [leaderName, setLeaderName] = useState('');
  const [leaderTc, setLeaderTc] = useState('');
  const [leaderBirth, setLeaderBirth] = useState('1985-06-15');
  const [leaderGender, setLeaderGender] = useState<'Erkek' | 'Kadın'>('Erkek');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderCity, setLeaderCity] = useState('İstanbul');
  const [leaderDistrict, setLeaderDistrict] = useState('Beşiktaş');
  const [leaderAddress, setLeaderAddress] = useState('');
  const [leaderDuty, setLeaderDuty] = useState('Kafile Sorumlusu');
  const [leaderHeight, setLeaderHeight] = useState('');
  const [leaderWeight, setLeaderWeight] = useState('');
  const [leaderAllergies, setLeaderAllergies] = useState('');
  const [leaderChronicDiseases, setLeaderChronicDiseases] = useState('');
  const [leaderMedications, setLeaderMedications] = useState('');
  const [leaderHealthNote, setLeaderHealthNote] = useState('');
  const [leaderAutoAllocate, setLeaderAutoAllocate] = useState(true);
  const [leaderPrefBungalowId, setLeaderPrefBungalowId] = useState('');
  const [leaderPrefBed, setLeaderPrefBed] = useState(0);

  // Convoy Members info
  interface ConvoyMemberForm {
    name: string;
    tcNo: string;
    birthDate: string;
    gender: 'Erkek' | 'Kadın';
    category: 'İlkokul' | 'Ortaokul' | 'Lise' | 'Üniversite' | 'Yetişkin' | 'Şoför';
    duty: string;
    emergencyContact: string;
    height: string;
    weight: string;
    allergies: string;
    chronicDiseases: string;
    medications: string;
    healthNote: string;
    autoAllocate: boolean;
    preferredBungalowId: string;
    preferredBedNumber: number;
  }

  const [convoyMembers, setConvoyMembers] = useState<ConvoyMemberForm[]>([
    {
      name: '',
      tcNo: '',
      birthDate: '2012-05-15',
      gender: 'Erkek',
      category: 'Lise',
      duty: 'Katılımcı',
      height: '',
      emergencyContact: '',
      weight: '',
      allergies: '',
      chronicDiseases: '',
      medications: '',
      healthNote: '',
      autoAllocate: true,
      preferredBungalowId: '',
      preferredBedNumber: 0
    }
  ]);

  // Bulk Selection State for evaluations
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // 3. Edit Participant Modal State
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [viewingConvoyLeader, setViewingConvoyLeader] = useState<Participant | null>(null);
  const [expandedAppIds, setExpandedAppIds] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // 4. CSV/Excel Import States
  const [importedParticipants, setImportedParticipants] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [importPeriodId, setImportPeriodId] = useState(initialPeriodId);

  const downloadTemplate = () => {
    const headers = [
      'T.C. Kimlik No',
      'Ad Soyad',
      'Doğum Tarihi (YYYY-MM-DD)',
      'Cinsiyet (Erkek/Kadın)',
      'Telefon',
      'E-posta',
      'Kategori',
      'Kamp Görevi',
      'İl',
      'İlçe',
      'Açık Adres',
      'Alerjiler',
      'Kronik Hastalıklar',
      'Düzenli İlaçlar',
      'Sağlık Notu',
      'Kafile/Grup İsmi',
      'Boy (cm)',
      'Kilo (kg)'
    ];
    
    const sampleRows = [
      [
        '12345678901',
        'Ahmet Yılmaz',
        '2008-04-12',
        'Erkek',
        '5551234567',
        'ahmet@email.com',
        'Lise',
        'Katılımcı',
        'İstanbul',
        'Fatih',
        'Hırka-i Şerif Mah. No:12',
        'Yok',
        'Yok',
        'Yok',
        'Sağlık durumu iyi',
        'İstanbul Lise Grubu',
        '175',
        '68'
      ],
      [
        '98765432101',
        'Zeynep Demir',
        '2009-08-23',
        'Kadın',
        '5559876543',
        'zeynep@email.com',
        'Lise',
        'Katılımcı',
        'İstanbul',
        'Beşiktaş',
        'Sinanpaşa Mah. No:45',
        'Polen Alerjisi',
        'Yok',
        'Yok',
        'Alerjik nezle var',
        'İstanbul Lise Grubu',
        '162',
        '52'
      ],
      [
        '45678901234',
        'Mehmet Aksoy',
        '1985-05-15',
        'Erkek',
        '5554443322',
        'mehmet@email.com',
        'Kafile Sorumlusu',
        'Kafile Sorumlusu',
        'İstanbul',
        'Beşiktaş',
        'Cihannüma Mah. No:22',
        'Yok',
        'Tansiyon',
        'Tansiyon İlacı',
        'Kafile lideri',
        'İstanbul Lise Grubu',
        '180',
        '85'
      ]
    ];

    const delimiter = ';';
    const csvContent = "\uFEFF" + 
      headers.join(delimiter) + "\n" + 
      sampleRows.map(row => row.map(val => `"${(val || '').replace(/"/g, '""')}"`).join(delimiter)).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "yesilay_kamp_toplu_kayit_sablonu.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processCSVFile(file);
  };

  const processCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const rows = parseCSV(text);
        if (rows.length < 2) {
          setImportErrors(['Dosya boş veya sadece başlık satırı içeriyor.']);
          return;
        }

        const dataRows = rows.slice(1);
        const parsedList: any[] = [];
        const errors: string[] = [];

        dataRows.forEach((row, idx) => {
          const tcNo = row[0]?.trim() || '';
          const name = row[1]?.trim() || '';
          const birthDateStr = row[2]?.trim() || '';
          const genderStr = row[3]?.trim() || '';
          const phone = row[4]?.trim() || '';
          const email = row[5]?.trim() || '';
          const categoryStr = row[6]?.trim() || 'Lise';
          const dutyStr = row[7]?.trim() || 'Katılımcı';
          const cityStr = row[8]?.trim() || 'İstanbul';
          const districtStr = row[9]?.trim() || 'Beşiktaş';
          const addressStr = row[10]?.trim() || '';
          const allergiesStr = row[11]?.trim() || 'Yok';
          const chronicStr = row[12]?.trim() || 'Yok';
          const medicationsStr = row[13]?.trim() || 'Yok';
          const healthNoteStr = row[14]?.trim() || '';
          const convoyNameStr = row[15]?.trim() || '';
          const heightStr = row[16]?.trim() || '';
          const weightStr = row[17]?.trim() || '';

          const rowNum = idx + 2;

          const rowErrors: string[] = [];
          if (!name) {
            rowErrors.push(`Satır ${rowNum}: Ad Soyad boş bırakılamaz.`);
          }
          if (tcNo && (!/^\d{11}$/.test(tcNo))) {
            rowErrors.push(`Satır ${rowNum}: T.C. Kimlik No 11 haneli sayı olmalıdır.`);
          }
          if (genderStr !== 'Erkek' && genderStr !== 'Kadın') {
            rowErrors.push(`Satır ${rowNum}: Cinsiyet 'Erkek' veya 'Kadın' olmalıdır.`);
          }
          if (birthDateStr && isNaN(Date.parse(birthDateStr))) {
            rowErrors.push(`Satır ${rowNum}: Doğum Tarihi geçersiz (Format: YYYY-MM-DD olmalıdır).`);
          }

          if (rowErrors.length > 0) {
            errors.push(...rowErrors);
          }

          const parsedHeight = heightStr ? parseFloat(heightStr) : undefined;
          const parsedWeight = weightStr ? parseFloat(weightStr) : undefined;

          parsedList.push({
            tempId: `PT-TEMP-${Date.now()}-${idx}`,
            name,
            identityNumber: tcNo,
            birthDate: birthDateStr || '2008-05-15',
            gender: (genderStr === 'Kadın' ? 'Kadın' : 'Erkek') as 'Erkek' | 'Kadın',
            phone,
            email,
            category: categoryStr as any,
            duty: dutyStr,
            city: cityStr,
            district: districtStr,
            address: addressStr,
            allergies: allergiesStr,
            chronicDiseases: chronicStr,
            medications: medicationsStr,
            healthNote: healthNoteStr,
            convoyName: convoyNameStr,
            height: isNaN(Number(parsedHeight)) ? undefined : parsedHeight,
            weight: isNaN(Number(parsedWeight)) ? undefined : parsedWeight,
            isValid: rowErrors.length === 0
          });
        });

        setImportedParticipants(parsedList);
        setImportErrors(errors);
        setImportSuccessMsg(`${parsedList.length} adet katılımcı satırı başarıyla okundu.`);
      } catch (err: any) {
        setImportErrors([`Dosya işlenirken hata oluştu: ${err.message}`]);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let currentVal = '';
    let insideQuotes = false;
    
    const firstLine = text.split('\n')[0] || '';
    const semiCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const delimiter = semiCount >= commaCount ? ';' : ',';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentVal += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        row.push(currentVal.trim());
        currentVal = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(currentVal.trim());
        if (row.length > 0 && row.some(cell => cell !== '')) {
          lines.push(row);
        }
        row = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    if (currentVal || row.length > 0) {
      row.push(currentVal.trim());
      if (row.some(cell => cell !== '')) {
        lines.push(row);
      }
    }
    return lines;
  };

  const handleCompleteImport = () => {
    if (importedParticipants.length === 0) return;

    const validParticipants = importedParticipants.filter(p => p.isValid);
    if (validParticipants.length === 0) {
      alert("İçe aktarılacak geçerli satır bulunmamaktadır. Lütfen hataları giderip tekrar deneyin.");
      return;
    }

    const selectedPeriod = periods.find(p => p.id === importPeriodId);
    if (!selectedPeriod) {
      alert("Lütfen geçerli bir kamp dönemi seçiniz.");
      return;
    }

    let updatedList = [...participants];
    const baseIdNum = participants.length + 500;
    
    const newAddedParticipants: Participant[] = validParticipants.map((p, idx) => {
      const newId = `PT-IMP-${baseIdNum}-${idx}-${Date.now()}`;
      return {
        id: newId,
        name: p.name,
        identityNumber: p.identityNumber || `100000000${idx + 10}`,
        birthDate: p.birthDate,
        gender: p.gender,
        phone: p.phone || '',
        email: p.email || '',
        status: 'Başvuru Yapıldı',
        category: p.category || 'Lise',
        duty: p.duty || 'Katılımcı',
        address: p.address || '',
        city: p.city || 'İstanbul',
        district: p.district || 'Beşiktaş',
        campPeriodId: importPeriodId,
        convoyName: p.convoyName || 'Toplu Excel İçe Aktarımı',
        isConvoyLeader: p.category === 'Kafile Sorumlusu',
        autoAllocate: true,
        bungalowId: null,
        bedNumber: null,
        allergies: p.allergies || 'Yok',
        chronicDiseases: p.chronicDiseases || 'Yok',
        medications: p.medications || 'Yok',
        healthNote: p.healthNote || 'Toplu yükleme ile kayıt edildi.',
        consentReceived: true,
        kvkkSigned: true,
        groupId: null,
        checkedIn: false,
        height: p.height,
        weight: p.weight,
      };
    });

    onUpdateParticipants([...updatedList, ...newAddedParticipants]);
    onAddLog(
      'Toplu Yükleme',
      `Toplu kayıt yükleme aracı kullanılarak '${selectedPeriod.name}' dönemine ${newAddedParticipants.length} yeni müracaatçı başarıyla eklendi.`
    );

    alert(`Tebrikler! ${newAddedParticipants.length} katılımcı müracaatı başarıyla içe aktarıldı ve '${selectedPeriod.name}' dönemine başvurular listesine eklendi.`);
    
    setImportedParticipants([]);
    setImportErrors([]);
    setImportSuccessMsg('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
      processCSVFile(file);
    } else {
      alert('Lütfen sadece .csv formatında bir şablon dosyası yükleyiniz.');
    }
  };

  const handleSaveEditedParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;

    // Check bungalow gender constraint
    if (editingParticipant.bungalowId) {
      const occupants = participants.filter(
        p => p.bungalowId === editingParticipant.bungalowId && p.id !== editingParticipant.id
      );
      if (occupants.length > 0 && occupants[0].gender !== editingParticipant.gender) {
        alert(
          `Güvenlik Uyarısı: Bu katılımcı '${editingParticipant.bungalowId}' bungalovunda kalmaktadır. Odanın güncel cinsiyeti '${occupants[0].gender}' olduğundan, katılımcının cinsiyeti değiştirilemez! Önce katılımcıyı odadan tahliye ediniz.`
        );
        return;
      }
    }

    // Check camp period gender constraint
    const targetPeriod = periods.find(per => per.id === editingParticipant.campPeriodId);
    if (targetPeriod && targetPeriod.gender && targetPeriod.gender !== 'Karışık/Aile' && editingParticipant.gender !== targetPeriod.gender) {
      alert(`Hata: Seçilen kamp dönemi yalnızca '${targetPeriod.gender}' katılımcılar içindir. Katılımcının cinsiyeti '${editingParticipant.gender}' olduğu için bu dönem seçilemez.`);
      return;
    }

    const updated = participants.map(p => p.id === editingParticipant.id ? editingParticipant : p);
    onUpdateParticipants(updated);
    onAddLog(
      'Başvuru Bilgileri Güncellendi',
      `'${editingParticipant.name}' adlı katılımcının başvuru bilgileri yönetici tarafından güncellendi.`
    );
    setEditingParticipant(null);
  };

  // Reset district when city changes
  useEffect(() => {
    if (CITY_DISTRICT_MAP[city]) {
      setDistrict(CITY_DISTRICT_MAP[city][0]);
    }
  }, [city]);

  useEffect(() => {
    if (CITY_DISTRICT_MAP[leaderCity]) {
      setLeaderDistrict(CITY_DISTRICT_MAP[leaderCity][0]);
    }
  }, [leaderCity]);

  // Handle selected campaign from URL query on component mount
  useEffect(() => {
    if (urlPeriodId) {
      setSelectedPeriodId(urlPeriodId);
      setConvoyPeriodId(urlPeriodId);
    }
  }, [urlPeriodId]);

  // Enforce gender restrictions based on selected period
  useEffect(() => {
    const p = periods.find(p => p.id === selectedPeriodId);
    if (p && p.gender && p.gender !== 'Karışık/Aile') {
      setGender(p.gender as 'Erkek' | 'Kadın');
    }
  }, [selectedPeriodId, periods]);

  useEffect(() => {
    const p = periods.find(p => p.id === convoyPeriodId);
    if (p && p.gender && p.gender !== 'Karışık/Aile') {
      setLeaderGender(p.gender as 'Erkek' | 'Kadın');
      setConvoyMembers(prev => prev.map(m => ({ ...m, gender: p.gender as 'Erkek' | 'Kadın' })));
    }
  }, [convoyPeriodId, periods]);

  // List only applicants with status "Başvuru Yapıldı" or "Yedek Listede" who belong to a convoy/institution
  const applications = participants.filter(
    (p) => (p.status === 'Başvuru Yapıldı' || p.status === 'Yedek Listede') && p.convoyName && p.convoyName.trim() !== ''
  ).filter(p => {
    if (searchTerm.trim() === '') return true;
    const s = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(s) || 
      p.identityNumber.includes(s) ||
      p.convoyName?.toLowerCase().includes(s) ||
      p.city?.toLowerCase().includes(s) ||
      p.district?.toLowerCase().includes(s) ||
      p.duty?.toLowerCase().includes(s) ||
      p.phone?.includes(s);
  });

  // Calculate bounds for date inputs based on period's age limits
  const getDateBounds = (periodId: string) => {
    const period = periods.find(p => p.id === periodId);
    if (!period) return { minAttr: undefined, maxAttr: undefined };
    
    const { minAge, maxAge } = period;
    const today = new Date();
    let minAttr: string | undefined = undefined; // oldest allowed
    let maxAttr: string | undefined = undefined; // youngest allowed

    if (maxAge) {
      const d = new Date(today);
      d.setFullYear(d.getFullYear() - maxAge - 1);
      d.setDate(d.getDate() + 1);
      minAttr = d.toISOString().split('T')[0];
    }
    if (minAge) {
      const d = new Date(today);
      d.setFullYear(d.getFullYear() - minAge);
      maxAttr = d.toISOString().split('T')[0];
    }
    return { minAttr, maxAttr };
  };

  // Helper to get available bungalows for a specific gender & type
  const getBungalowList = (genderFilter: 'Erkek' | 'Kadın', typeFilter?: 'Lider' | 'Standart', height?: number, weight?: number) => {
    const h = height || 0;
    const w = weight || 0;
    const bmi = h > 0 ? w / Math.pow(h / 100, 2) : 0;
    const isOverweightOrObese = bmi >= 25;

    return bungalows.map(b => {
      const occupants = participants.filter(p => p.bungalowId === b.id);
      let isAvailable = occupants.length < b.capacity;

      // BMI constraint for overweight/obese: must have at least one free bed among 1, 2, 3, 4.
      if (isOverweightOrObese) {
        const filledBeds = occupants.map(o => o.bedNumber);
        const maxAllowedBed = Math.min(b.capacity, 4);
        let hasFreeBedInFirstFour = false;
        for (let bNum = 1; bNum <= maxAllowedBed; bNum++) {
          if (!filledBeds.includes(bNum)) {
            hasFreeBedInFirstFour = true;
            break;
          }
        }
        if (!hasFreeBedInFirstFour) {
          isAvailable = false;
        }
      }

      const isGenderMatch = occupants.length === 0 || occupants[0].gender === genderFilter;
      const isTypeMatch = !typeFilter || b.type === typeFilter;
      
      return {
        ...b,
        occupantCount: occupants.length,
        isAvailable: isAvailable && isGenderMatch && isTypeMatch,
        currentGender: occupants.length > 0 ? occupants[0].gender : 'Boş'
      };
    });
  };

  const getRemainingQuota = (selectedPeriod: CampPeriod) => {
    const currentCount = participants.filter(p => p.campPeriodId === selectedPeriod.id && p.status !== 'Reddedildi').length;
    let remaining = selectedPeriod.maxQuota - currentCount;

    const start = new Date(selectedPeriod.startDate);
    const end = new Date(selectedPeriod.endDate);

    const overlappingPeriods = periods.filter(p => {
      if (p.campCenterId !== selectedPeriod.campCenterId) return false;
      const pStart = new Date(p.startDate);
      const pEnd = new Date(p.endDate);
      return start <= pEnd && pStart <= end;
    });

    const totalBungalowCapacity = bungalows.reduce((sum, b) => sum + b.capacity, 0);
    const overlappingParticipantsCount = participants.filter(p => 
      p.status !== 'Reddedildi' && overlappingPeriods.some(ap => ap.id === p.campPeriodId)
    ).length;
    
    const globalRemaining = totalBungalowCapacity - overlappingParticipantsCount;
      
    if (globalRemaining < remaining) {
      remaining = globalRemaining;
    }
    
    return Math.max(0, remaining);
  };

  const addConvoyMember = () => {
    const selectedPeriod = periods.find(p => p.id === convoyPeriodId);
    if (selectedPeriod) {
      const remaining = getRemainingQuota(selectedPeriod);
      if (convoyMembers.length >= remaining) {
        alert(`Bu kamp dönemi için sadece ${remaining} kontenjan kalmıştır. Daha fazla katılımcı ekleyemezsiniz.`);
        return;
      }
    }

    setConvoyMembers([
      ...convoyMembers,
      {
        name: '',
        tcNo: '',
        birthDate: '2012-05-15',
        gender: leaderGender, // inherit gender by default
        category: 'Lise',
        duty: 'Katılımcı',
        height: '',
        weight: '',
        allergies: '',
        chronicDiseases: '',
        medications: '',
        healthNote: '',
        autoAllocate: true,
        preferredBungalowId: '',
        preferredBedNumber: 0
      }
    ]);
  };

  const removeConvoyMember = (index: number) => {
    if (convoyMembers.length === 1) {
      alert("En az bir katılımcı bilgisi girmelisiniz.");
      return;
    }
    setConvoyMembers(convoyMembers.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof ConvoyMemberForm, value: any) => {
    const updated = [...convoyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setConvoyMembers(updated);
  };

  // Helper to compile current simulator inputs into a temporary draft participant
  const getDraftParticipant = (): Participant => {
    return {
      id: "BASVURU-TASLAK",
      name: name.trim() || "İsimsiz Kampçı Adayı",
      identityNumber: tcNo || "11111111111",
      birthDate: birthDate || "2013-05-15",
      gender: gender,
      category: category,
      phone: phone || "Girilmedi",
      email: email || "Girilmedi",
      address,
      city,
      district,
      campPeriodId: selectedPeriodId,
      allergies: allergies.trim() || "Saptanamayan Alerji Yok",
      chronicDiseases: chronicDiseases.trim() || "Yok",
      medications: medications.trim() || "Yok",
      healthNote: healthNote.trim() || "Müracaat Formu Taslağı",
      consentReceived: consentChecked,
      kvkkSigned: kvkkChecked,
      status: 'Başvuru Yapıldı',
      bungalowId: null,
      bedNumber: null,
      groupId: null,
      checkedIn: false
    };
  };

  const handleDownloadDraft = (format: 'pdf' | 'word') => {
    const draft = getDraftParticipant();
    if (format === 'pdf') {
      exportToPdf(draft);
    } else {
      exportToWord(draft);
    }
    onAddLog(
      'Form İndirme',
      `Sistem simülatöründe yazılı bilgiler ile geçici '${draft.name}' kayıt formu (${format.toUpperCase()}) olarak indirildi.`
    );
  };

  // SUBMIT INDIVIDUAL APPLICATION
  const handleSubmitIndividual = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !tcNo || !phone) {
      alert('Lütfen tüm zorunlu (yıldızlı) alanları doldurunuz.');
      return;
    }

    if (tcNo.length !== 11) {
      alert('T.C. Kimlik Numarası tam olarak 11 haneden oluşmalıdır.');
      return;
    }

    if (!kvkkChecked || !consentChecked) {
      alert('Lütfen KVKK Onay Belgesini ve Kamp Katılım Taahhütnamesini onaylayınız.');
      return;
    }

    const selectedPeriod = periods.find(p => p.id === selectedPeriodId);
    if (selectedPeriod) {
      const remaining = getRemainingQuota(selectedPeriod);
      if (remaining <= 0) {
        alert('Bu kamp dönemi için kontenjan dolmuştur. Daha fazla kayıt alınamamaktadır.');
        return;
      }
      
      if (category !== 'Kafile Sorumlusu' && category !== 'Şoför') {
      if (selectedPeriod.gender && selectedPeriod.gender !== 'Karışık/Aile' && gender !== selectedPeriod.gender) {
         alert(`Bu kamp dönemi yalnızca '${selectedPeriod.gender}' katılımcılar içindir.`);
         return;
      }
      if (selectedPeriod.minAge || selectedPeriod.maxAge) {
         const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
         if (selectedPeriod.minAge && age < selectedPeriod.minAge) {
            alert(`Bu kamp dönemi için minimum yaş ${selectedPeriod.minAge} olarak belirlenmiştir.`);
            return;
         }
         if (selectedPeriod.maxAge && age > selectedPeriod.maxAge) {
            alert(`Bu kamp dönemi için maksimum yaş ${selectedPeriod.maxAge} olarak belirlenmiştir.`);
            return;
         }
      }
    }
    }

    const payload = {
      name,
      identityNumber: tcNo,
      birthDate,
      gender,
      category,
      phone,
      email,
      emergencyContact,
      address,
      city,
      district,
      campPeriodId: selectedPeriodId,
      autoAllocate,
      preferredBungalowId: !autoAllocate && preferredBungalowId ? preferredBungalowId : null,
      preferredBedNumber: !autoAllocate && preferredBedNumber ? preferredBedNumber : null,
      allergies: allergies || 'Saptanamayan Alerji Yok',
      chronicDiseases: chronicDiseases || 'Yok',
      medications: medications || 'Yok',
      healthNote,
      consentReceived: true,
      kvkkSigned: true,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
    };

    if (!navigator.onLine) {
      const newId = `P-OFFLINE-${Date.now()}`;
      if (!isRemote) {
        const newParticipant = {
          ...payload,
          id: newId,
          status: 'Başvuru Yapıldı',
          bungalowId: null,
          bedNumber: null,
          groupId: null,
          checkedIn: false
        } as any;
        onUpdateParticipants([...participants, newParticipant]);
        onAddLog(
          'Online Başvuru (Çevrimdışı)',
          `${payload.name} (${payload.gender} - ${payload.category}) adlı gönüllü sistem tarafından çevrimdışı olarak kaydedildi. İl: ${payload.city}.`
        );
      } else {
        const offlineQueue = JSON.parse(localStorage.getItem('kys_remote_queue') || '[]');
        offlineQueue.push({ type: 'individual', payload });
        localStorage.setItem('kys_remote_queue', JSON.stringify(offlineQueue));
      }
      alert('İnternet bağlantısı yok. Başvuru yerel olarak kaydedildi, bağlantı geldiğinde senkronize edilecek.');
      setTcNo('');
      setName('');
      setBirthDate('');
      setPhone('');
      setEmail('');
      setCategory('Lise');
      setGender('Erkek');
      setCity('');
      setDistrict('');
      setAddress('');
      setHeight('');
      setWeight('');
      setKvkkChecked(false);
      setConsentChecked(false);
      return;
    }

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'individual', payload })
      });
      if (res.ok) {
        if (!isRemote) {
          const data = await res.json();
          const newParticipant: Participant = {
            ...payload,
            id: data.participantId,
            status: 'Başvuru Yapıldı',
            bungalowId: null,
            bedNumber: null,
            groupId: null,
            checkedIn: false
          } as any;
          onUpdateParticipants([...participants, newParticipant]);
          onAddLog(
            'Online Başvuru',
            `${name} (${gender} - ${category}) adlı gönüllü için yeni online kamp başvurusu yapıldı. İl: ${city}, İlçe: ${district}.`
          );
        }
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      const newParticipant: Participant = {
        id: `P0${participants.length + 100}`,
        ...payload,
        status: 'Başvuru Yapıldı',
        bungalowId: null,
        bedNumber: null,
        groupId: null,
        checkedIn: false,
      } as any;
      onUpdateParticipants([...participants, newParticipant]);
      onAddLog(
        'Online Başvuru',
        `${name} (${gender} - ${category}) adlı gönüllü için yeni online kamp başvurusu yapıldı. İl: ${city}, İlçe: ${district}.`
      );
    }

    // Clear form
    setName('');
    setTcNo('');
    setPhone('');
    setEmail('');
    setCategory('Lise');
    setAddress('');
    setAllergies('');
    setChronicDiseases('');
    setMedications('');
    setHealthNote('');
    setHeight('');
    setWeight('');
    setKvkkChecked(false);
    setConsentChecked(false);
    setSignatureData(null);
    setAutoAllocate(true);
    setPreferredBungalowId('');
    setPreferredBedNumber(0);

    alert('Yeşilay Kamp Başvurunuz sisteme başarıyla kaydedildi! Yönetici onayı bekleniyor.');
  };

  // SUBMIT CONVOY/BATCH APPLICATION
  const handleSubmitConvoy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!convoyName || !leaderName || !leaderTc || !leaderPhone) {
      alert('Lütfen Kafile Adı, Sorumlu Adı, T.C. Kimlik No ve Telefonunu eksiksiz doldurunuz.');
      return;
    }

    if (leaderTc.length !== 11) {
      alert('Kafile sorumlusunun T.C. Kimlik No 11 haneli olmalıdır.');
      return;
    }

    const selectedPeriod = periods.find(p => p.id === convoyPeriodId);
    if (selectedPeriod) {
      const remaining = getRemainingQuota(selectedPeriod);
      if (remaining < convoyMembers.length) {
        alert(`Bu kamp dönemi için sadece ${remaining} kontenjan kalmıştır. Lütfen kafile sayısını azaltınız veya başka bir dönem seçiniz.`);
        return;
      }
    }

    // Validate members
    for (let i = 0; i < convoyMembers.length; i++) {
      const m = convoyMembers[i];
      if (!m.name || !m.tcNo) {
        alert(`${i + 1}. katılımcının Ad-Soyad ve T.C. Kimlik No alanlarını doldurunuz.`);
        return;
      }
      if (m.tcNo.length !== 11) {
        alert(`${i + 1}. katılımcının T.C. Kimlik Numarası 11 haneli olmalıdır.`);
        return;
      }
      
      if (selectedPeriod && m.category !== 'Kafile Sorumlusu' && m.category !== 'Şoför') {
        if (selectedPeriod.gender && selectedPeriod.gender !== 'Karışık/Aile' && m.gender !== selectedPeriod.gender) {
           alert(`${i + 1}. katılımcı (${m.name}): Bu kamp dönemi yalnızca '${selectedPeriod.gender}' katılımcılar içindir.`);
           return;
        }
        if (selectedPeriod.minAge || selectedPeriod.maxAge) {
           const age = new Date().getFullYear() - new Date(m.birthDate).getFullYear();
           if (selectedPeriod.minAge && age < selectedPeriod.minAge) {
              alert(`${i + 1}. katılımcı (${m.name}): Bu kamp dönemi için minimum yaş ${selectedPeriod.minAge} olarak belirlenmiştir.`);
              return;
           }
           if (selectedPeriod.maxAge && age > selectedPeriod.maxAge) {
              alert(`${i + 1}. katılımcı (${m.name}): Bu kamp dönemi için maksimum yaş ${selectedPeriod.maxAge} olarak belirlenmiştir.`);
              return;
           }
        }
      }
    }

    if (!kvkkChecked || !consentChecked) {
      alert('Lütfen sözleşme ve katılım onay kutularını işaretleyiniz.');
      return;
    }
    if (!signatureData) {
      alert('Lütfen dijital muvafakatname için imza alanını doldurunuz.');
      return;
    }

    const convoyPayload = {
      convoyName,
      leader: {
        name: leaderName,
        identityNumber: leaderTc,
        birthDate: leaderBirth,
        gender: leaderGender,
        category: 'Kafile Sorumlusu',
        duty: leaderDuty,
        phone: leaderPhone,
        email: leaderEmail,
        address: leaderAddress || convoyName,
        city: leaderCity,
        district: leaderDistrict,
        autoAllocate: leaderAutoAllocate,
        preferredBungalowId: !leaderAutoAllocate && leaderPrefBungalowId ? leaderPrefBungalowId : null,
        preferredBedNumber: !leaderAutoAllocate && leaderPrefBed ? leaderPrefBed : null,
        allergies: leaderAllergies || 'Yok',
        chronicDiseases: leaderChronicDiseases || 'Yok',
        medications: leaderMedications || 'Yok',
        healthNote: leaderHealthNote || 'Kafile Sorumlusu Girişi',
        consentReceived: true,
        kvkkSigned: true,
        height: leaderHeight ? parseFloat(leaderHeight) : undefined,
        weight: leaderWeight ? parseFloat(leaderWeight) : undefined,
      },
      members: convoyMembers.map(m => ({
        name: m.name,
        identityNumber: m.tcNo,
        birthDate: m.birthDate,
        gender: m.gender,
        category: m.category,
        duty: m.duty,
        autoAllocate: m.autoAllocate,
        preferredBungalowId: !m.autoAllocate && m.preferredBungalowId ? m.preferredBungalowId : null,
        preferredBedNumber: !m.autoAllocate && m.preferredBedNumber ? m.preferredBedNumber : null,
        allergies: m.allergies || 'Saptanamayan Alerji Yok',
        chronicDiseases: m.chronicDiseases || 'Yok',
        medications: m.medications || 'Yok',
        healthNote: m.healthNote || `Üyesi: ${convoyName}`,
        consentReceived: true,
        kvkkSigned: true,
        height: m.height ? parseFloat(m.height) : undefined,
        weight: m.weight ? parseFloat(m.weight) : undefined,
      })),
      campPeriodId: convoyPeriodId
    };

    if (!navigator.onLine) {
      if (!isRemote) {
        const leaderId = `PT-LDR-OFFLINE-${Date.now()}`;
        const newLeader = {
          ...convoyPayload.leader,
          id: leaderId,
          status: 'Başvuru Yapıldı',
          bungalowId: null,
          bedNumber: null,
          campPeriodId: convoyPeriodId,
          convoyName,
          isConvoyLeader: true,
          groupId: null,
          checkedIn: false
        } as any;
        const newMembers = convoyPayload.members.map((member, idx) => ({
          ...member,
          id: `PT-MEM-OFFLINE-${Date.now()}-${idx}`,
          status: 'Başvuru Yapıldı',
          bungalowId: null,
          bedNumber: null,
          phone: convoyPayload.leader.phone,
          email: convoyPayload.leader.email,
          address: convoyPayload.leader.address || convoyName,
          city: convoyPayload.leader.city,
          district: convoyPayload.leader.district,
          campPeriodId: convoyPeriodId,
          convoyName,
          isConvoyLeader: false,
          convoyLeaderId: leaderId,
          groupId: null,
          checkedIn: false
        })) as any[];
        onUpdateParticipants([...participants, newLeader, ...newMembers]);
        onAddLog(
          'Online Kafile Başvurusu (Çevrimdışı)',
          `'${convoyName}' kafilesi (${convoyPayload.leader.name} liderliğinde, ${convoyPayload.members.length} katılımcı) çevrimdışı kaydedildi.`
        );
      } else {
        const offlineQueue = JSON.parse(localStorage.getItem('kys_remote_queue') || '[]');
        offlineQueue.push({ type: 'convoy', payload: convoyPayload });
        localStorage.setItem('kys_remote_queue', JSON.stringify(offlineQueue));
      }
      alert('İnternet bağlantısı yok. Kafile başvurusu yerel olarak kaydedildi, bağlantı geldiğinde senkronize edilecek.');
      setConvoyName('');
      setLeaderName('');
      setConvoyMembers([]);
      return;
    }

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'convoy', payload: convoyPayload })
      });
      if (res.ok) {
        if (!isRemote) {
          const data = await res.json();
          const leaderId = data.leaderId;
          const newLeader = {
            ...convoyPayload.leader,
            id: leaderId,
            status: 'Başvuru Yapıldı',
            bungalowId: null,
            bedNumber: null,
            campPeriodId: convoyPeriodId,
            convoyName,
            isConvoyLeader: true,
            groupId: null,
            checkedIn: false
          };
          const newMembers = convoyPayload.members.map((member, idx) => ({
            ...member,
            id: `PT-MEM-REM-${Date.now()}-${idx}`,
            status: 'Başvuru Yapıldı',
            bungalowId: null,
            bedNumber: null,
            phone: leaderPhone,
            email: leaderEmail,
            address: leaderAddress || convoyName,
            city: leaderCity,
            district: leaderDistrict,
            campPeriodId: convoyPeriodId,
            convoyName,
            isConvoyLeader: false,
            convoyLeaderId: leaderId,
            groupId: null,
            checkedIn: false
          }));
          onUpdateParticipants([...participants, newLeader as any, ...newMembers as any]);
          onAddLog(
            'Kafile Başvurusu',
            `'${convoyName}' isimli kafile için 1 Sorumlu ve ${convoyMembers.length} Katılımcı müracaatı toplu şekilde yapıldı.`
          );
        }
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      // Fallback
      let updatedList = [...participants];
      const baseIdNum = participants.length + 200;
      const leaderId = `PT-LDR-${baseIdNum}`;
      const newLeader: Participant = {
        id: leaderId,
        ...convoyPayload.leader,
        status: 'Başvuru Yapıldı',
        bungalowId: null,
        bedNumber: null,
        campPeriodId: convoyPeriodId,
        convoyName: convoyName,
        isConvoyLeader: true,
        groupId: null,
        checkedIn: false
      } as any;
      updatedList.push(newLeader);
      
      convoyMembers.forEach((member, idx) => {
        const memberId = `PT-MEM-${baseIdNum}-${idx}`;
        const newMember: Participant = {
          id: memberId,
          ...member,
          identityNumber: member.tcNo,
          status: 'Başvuru Yapıldı',
          bungalowId: null,
          bedNumber: null,
          phone: leaderPhone,
          email: leaderEmail,
          address: leaderAddress || convoyName,
          city: leaderCity,
          district: leaderDistrict,
          campPeriodId: convoyPeriodId,
          convoyName: convoyName,
          isConvoyLeader: false,
          convoyLeaderId: leaderId,
          groupId: null,
          checkedIn: false
        } as any;
        updatedList.push(newMember);
      });
      onUpdateParticipants(updatedList);
      onAddLog(
        'Kafile Başvurusu',
        `'${convoyName}' isimli kafile için 1 Sorumlu ve ${convoyMembers.length} Katılımcı müracaatı toplu şekilde yapıldı.`
      );
    }

    // Reset convoy states
    setConvoyName('');
    setLeaderName('');
    setLeaderTc('');
    setLeaderPhone('');
    setLeaderEmail('');
    setLeaderAddress('');
    setLeaderHeight('');
    setLeaderWeight('');
    setLeaderAllergies('');
    setLeaderChronicDiseases('');
    setLeaderMedications('');
    setLeaderHealthNote('');
    setLeaderDuty('Kafile Sorumlusu');
    setConvoyMembers([
      {
        name: '',
        tcNo: '',
        birthDate: '2012-05-15',
        gender: 'Erkek',
        category: 'Lise',
        duty: 'Katılımcı',
        height: '',
        weight: '',
        allergies: '',
        chronicDiseases: '',
        medications: '',
        healthNote: '',
        autoAllocate: true,
        preferredBungalowId: '',
        preferredBedNumber: 0
      }
    ]);
    setKvkkChecked(false);
    setConsentChecked(false);

    alert(`'${convoyName}' kafilesinin tüm başvuru belgeleri ve katılımcı listesi başarıyla kaydedildi!`);
  };

  // Helper to check if a participant can be assigned to a preferred bungalow based on gender rules
  const canAssignToPreferredBungalow = (p: Participant, bungalowId: string, list: Participant[]): boolean => {
    const pPeriod = periods.find((cp) => cp.id === p.campPeriodId);
    const pIsFamily = pPeriod?.gender === "Karışık/Aile";

    // 1. CAMP-WIDE PERIOD GENDER CONSTRAINT
    if (!pIsFamily) {
      const activeOccupantsOfSamePeriod = list.filter(
        (op) => op.campPeriodId === p.campPeriodId && op.bungalowId !== null && op.id !== p.id
      );
      const oppositeGenderOccupant = activeOccupantsOfSamePeriod.find(
        (op) => op.gender !== p.gender
      );
      if (oppositeGenderOccupant) {
        return false;
      }
    }

    // 2. BUNGALOW-LEVEL GENDER CONSTRAINT
    const occupants = list.filter((op) => op.bungalowId === bungalowId && op.id !== p.id);
    if (occupants.length > 0) {
      const differentGenderOccupant = occupants.find((occ) => occ.gender !== p.gender);
      if (differentGenderOccupant) {
        const allAreFamily = pIsFamily && occupants.every((occ) => {
          const occPeriod = periods.find((cp) => cp.id === occ.campPeriodId);
          return occPeriod?.gender === "Karışık/Aile";
        });
        if (!allAreFamily) return false;
      }
    }

    return true;
  };

  // REAL AUTOMATIC BUNGALOW ALLOCATOR
  const autoAllocateParticipant = (p: Participant, list: Participant[]): { bungalowId: string | null, bedNumber: number | null } => {
    // Determine target bungalow type preference
    const isLeaderOrAdult = p.category === 'Kafile Sorumlusu' || p.category === 'Şoför' || p.category === 'Yetişkin';
    const preferredType = isLeaderOrAdult ? 'Lider' : 'Standart';

    // Calculate Body Mass Index (BMI) to see if overweight / obese
    const height = p.height || 0;
    const weight = p.weight || 0;
    const bmi = (height > 0) ? (weight / Math.pow(height / 100, 2)) : 0;
    const isOverweightOrObese = bmi >= 25;

    // Get the participant's camp period
    const pPeriod = periods.find((cp) => cp.id === p.campPeriodId);
    const pIsFamily = pPeriod?.gender === "Karışık/Aile";

    // 1. CAMP-WIDE PERIOD GENDER CONSTRAINT:
    // If the camp period is not "Karışık/Aile", then the entire camp area cannot have both female and male participants accommodated at the same time (for this period).
    if (!pIsFamily) {
      const activeOccupantsOfSamePeriod = list.filter(
        (op) => op.campPeriodId === p.campPeriodId && op.bungalowId !== null && op.id !== p.id
      );
      const oppositeGenderOccupant = activeOccupantsOfSamePeriod.find(
        (op) => op.gender !== p.gender
      );

      if (oppositeGenderOccupant) {
        // Cannot automatically allocate because opposite gender exists in this period camp-wide
        return { bungalowId: null, bedNumber: null };
      }
    }

    // Find available bungalows
    let matchBungalows = bungalows.filter(b => {
      // Prefer specified type, fallback to any if no spot
      const occupants = list.filter(op => op.bungalowId === b.id);
      if (occupants.length >= b.capacity) return false;

      // Gender validation
      const existingGender = occupants.length > 0 ? occupants[0].gender : null;
      if (existingGender !== null && existingGender !== p.gender) {
        // If different genders exist, it is ONLY allowed if BOTH p and ALL current occupants are in a family/mixed period
        const allAreFamily = pIsFamily && occupants.every((occ) => {
          const occPeriod = periods.find((cp) => cp.id === occ.campPeriodId);
          return occPeriod?.gender === "Karışık/Aile";
        });

        if (!allAreFamily) return false;
      }

      // BMI Constraint for overweight/obese: must have at least one free bed among 1, 2, 3, 4.
      if (isOverweightOrObese) {
        const filledBeds = occupants.map(o => o.bedNumber);
        const maxAllowedBed = Math.min(b.capacity, 4);
        let hasFreeBedInFirstFour = false;
        for (let bNum = 1; bNum <= maxAllowedBed; bNum++) {
          if (!filledBeds.includes(bNum)) {
            hasFreeBedInFirstFour = true;
            break;
          }
        }
        if (!hasFreeBedInFirstFour) return false;
      }

      return true;
    });

    // Sort in reverse order of their appearance in the original bungalows array for overweight/obese participants
    if (isOverweightOrObese) {
      matchBungalows = [...matchBungalows].sort((a, b) => {
        const indexA = bungalows.findIndex(bg => bg.id === a.id);
        const indexB = bungalows.findIndex(bg => bg.id === b.id);
        return indexB - indexA;
      });
    }

    // Try to get one matching preferred type first
    let selectedBg = matchBungalows.find(b => b.type === preferredType);
    if (!selectedBg) {
      selectedBg = matchBungalows[0]; // fallback
    }

    if (selectedBg) {
      const occupants = list.filter(op => op.bungalowId === selectedBg.id);
      const filledBeds = occupants.map(o => o.bedNumber);
      let freeBed = 1;
      const maxBedToCheck = isOverweightOrObese ? Math.min(selectedBg.capacity, 4) : selectedBg.capacity;
      for (let bNum = 1; bNum <= maxBedToCheck; bNum++) {
        if (!filledBeds.includes(bNum)) {
          freeBed = bNum;
          break;
        }
      }
      return { bungalowId: selectedBg.id, bedNumber: freeBed };
    }

    return { bungalowId: null, bedNumber: null };
  };

  // HANDLERS FOR STATUS CHANGING (SINGLE AND BULK APPROVALS)
  const handleStatusChange = (pId: string, newStatus: 'Onaylandı' | 'Reddedildi' | 'Yedek Listede') => {
    const target = participants.find((p) => p.id === pId);
    if (!target) return;

    let updatedList = [...participants];
    
    const updated = updatedList.map((p) => {
      if (p.id === pId) {
        let updateData: Partial<Participant> = { status: newStatus };

        // Simplify Workflow: Automatically move to 'Kampta' (In Camp) directly if approved
        if (newStatus === 'Onaylandı') {
          updateData.status = 'Kampta';
          updateData.checkedIn = true;
          updateData.checkInTime = new Date().toISOString().slice(0, 19);

          // Attempt allocation
          if (p.preferredBungalowId && p.preferredBedNumber) {
            const isFilled = updatedList.some(op => op.bungalowId === p.preferredBungalowId && op.bedNumber === p.preferredBedNumber);
            const isGenderAllowed = canAssignToPreferredBungalow(p, p.preferredBungalowId, updatedList);
            if (!isFilled && isGenderAllowed) {
              updateData.bungalowId = p.preferredBungalowId;
              updateData.bedNumber = p.preferredBedNumber;
            } else {
              const placement = autoAllocateParticipant(p, updatedList);
              if (placement.bungalowId) {
                updateData.bungalowId = placement.bungalowId;
                updateData.bedNumber = placement.bedNumber;
              }
            }
          } else {
            const placement = autoAllocateParticipant(p, updatedList);
            if (placement.bungalowId) {
              updateData.bungalowId = placement.bungalowId;
              updateData.bedNumber = placement.bedNumber;
            }
          }
        } else {
          // If rejected or waitlisted, clear any bungalow preference
          updateData.bungalowId = null;
          updateData.bedNumber = null;
          updateData.checkedIn = false;
        }

        return { ...p, ...updateData };
      }
      return p;
    });

    onUpdateParticipants(updated);
    
    let allocationDetail = "";
    const updatedTarget = updated.find(p => p.id === pId);
    if (updatedTarget?.bungalowId) {
      allocationDetail = ` ve otomatik olarak ${updatedTarget.bungalowId} - Yatak ${updatedTarget.bedNumber} numaralı odaya yerleştirildi.`;
    }

    onAddLog(
      `Başvuru Kararı`,
      `${target.name} kişisinin müracaatı değerlendirildi ve durumu '${newStatus}' olarak güncellendi${allocationDetail}.`
    );

    // Remove from bulk selection
    setSelectedAppIds(selectedAppIds.filter(id => id !== pId));
  };

  // BULK ACTIONS (TOPLU ONAY, TOPLU RED)
  const handleBulkAction = (action: 'Onaylandı' | 'Reddedildi' | 'Yedek Listede') => {
    if (selectedAppIds.length === 0) {
      alert("Lütfen işlem yapmak istediğiniz müracaatları yandaki kutucuklardan seçiniz.");
      return;
    }

    if (!window.confirm(`Seçilen ${selectedAppIds.length} müracaat için toplu '${action}' kararı verilecektir. Emin misiniz?`)) {
      return;
    }

    let currentParticipants = [...participants];
    let approvedCount = 0;
    let placedCount = 0;

    const updated = currentParticipants.map((p) => {
      if (selectedAppIds.includes(p.id)) {
        let updateData: Partial<Participant> = { status: action };

        if (action === 'Onaylandı') {
          approvedCount++;
          updateData.status = 'Kampta';
          updateData.checkedIn = true;
          updateData.checkInTime = new Date().toISOString().slice(0, 19);

          if (p.preferredBungalowId && p.preferredBedNumber) {
            const isFilled = currentParticipants.some(op => op.bungalowId === p.preferredBungalowId && op.bedNumber === p.preferredBedNumber);
            const isGenderAllowed = canAssignToPreferredBungalow(p, p.preferredBungalowId, currentParticipants);
            if (!isFilled && isGenderAllowed) {
              updateData.bungalowId = p.preferredBungalowId;
              updateData.bedNumber = p.preferredBedNumber;
              placedCount++;
              
              currentParticipants = currentParticipants.map(cp => 
                cp.id === p.id ? { ...cp, bungalowId: p.preferredBungalowId, bedNumber: p.preferredBedNumber } : cp
              );
            } else {
              const placement = autoAllocateParticipant(p, currentParticipants);
              if (placement.bungalowId) {
                updateData.bungalowId = placement.bungalowId;
                updateData.bedNumber = placement.bedNumber;
                placedCount++;
                
                currentParticipants = currentParticipants.map(cp => 
                  cp.id === p.id ? { ...cp, bungalowId: placement.bungalowId, bedNumber: placement.bedNumber } : cp
                );
              }
            }
          } else {
            const placement = autoAllocateParticipant(p, currentParticipants);
            if (placement.bungalowId) {
              updateData.bungalowId = placement.bungalowId;
              updateData.bedNumber = placement.bedNumber;
              placedCount++;
              
              currentParticipants = currentParticipants.map(cp => 
                cp.id === p.id ? { ...cp, bungalowId: placement.bungalowId, bedNumber: placement.bedNumber } : cp
              );
            }
          }
        } else {
          updateData.bungalowId = null;
          updateData.bedNumber = null;
          updateData.checkedIn = false;
        }

        return { ...p, ...updateData };
      }
      return p;
    });

    onUpdateParticipants(updated);
    onAddLog(
      `Toplu Değerlendirme`,
      `Sistem üzerinden seçilen ${selectedAppIds.length} müracaatçı için toplu '${action}' kararı verildi. ${placedCount} kişi otomatik yerleştirildi.`
    );

    setSelectedAppIds([]);
    alert(`Toplu işlem başarıyla tamamlandı! ${action === 'Onaylandı' ? `${approvedCount} başvuru onaylandı, bunlardan ${placedCount} kişi uygun odalara otomatik yerleştirildi.` : `${selectedAppIds.length} başvuru güncellendi.`}`);
  };

  // Group-specific bulk action helper
  const handleGroupBulkAction = (groupName: string, action: 'Onaylandı' | 'Reddedildi' | 'Yedek Listede', groupAppIds: string[]) => {
    if (groupAppIds.length === 0) return;

    if (!window.confirm(`'${groupName}' grubundaki ${groupAppIds.length} müracaat için toplu '${action}' kararı verilecektir. Emin misiniz?`)) {
      return;
    }

    let currentParticipants = [...participants];
    let approvedCount = 0;
    let placedCount = 0;

    const updated = currentParticipants.map((p) => {
      if (groupAppIds.includes(p.id)) {
        let updateData: Partial<Participant> = { status: action };

        if (action === 'Onaylandı') {
          approvedCount++;
          updateData.status = 'Kampta';
          updateData.checkedIn = true;
          updateData.checkInTime = new Date().toISOString().slice(0, 19);

          if (p.preferredBungalowId && p.preferredBedNumber) {
            const isFilled = currentParticipants.some(op => op.bungalowId === p.preferredBungalowId && op.bedNumber === p.preferredBedNumber);
            const isGenderAllowed = canAssignToPreferredBungalow(p, p.preferredBungalowId, currentParticipants);
            if (!isFilled && isGenderAllowed) {
              updateData.bungalowId = p.preferredBungalowId;
              updateData.bedNumber = p.preferredBedNumber;
              placedCount++;
              
              currentParticipants = currentParticipants.map(cp => 
                cp.id === p.id ? { ...cp, bungalowId: p.preferredBungalowId, bedNumber: p.preferredBedNumber } : cp
              );
            } else {
              const placement = autoAllocateParticipant(p, currentParticipants);
              if (placement.bungalowId) {
                updateData.bungalowId = placement.bungalowId;
                updateData.bedNumber = placement.bedNumber;
                placedCount++;
                
                currentParticipants = currentParticipants.map(cp => 
                  cp.id === p.id ? { ...cp, bungalowId: placement.bungalowId, bedNumber: placement.bedNumber } : cp
                );
              }
            }
          } else {
            const placement = autoAllocateParticipant(p, currentParticipants);
            if (placement.bungalowId) {
              updateData.bungalowId = placement.bungalowId;
              updateData.bedNumber = placement.bedNumber;
              placedCount++;
              
              currentParticipants = currentParticipants.map(cp => 
                cp.id === p.id ? { ...cp, bungalowId: placement.bungalowId, bedNumber: placement.bedNumber } : cp
              );
            }
          }
        } else {
          updateData.bungalowId = null;
          updateData.bedNumber = null;
          updateData.checkedIn = false;
        }

        return { ...p, ...updateData };
      }
      return p;
    });

    onUpdateParticipants(updated);
    onAddLog(
      `Toplu Değerlendirme`,
      `Sistem üzerinden '${groupName}' grubundaki ${groupAppIds.length} müracaatçı için toplu '${action}' kararı verildi. ${placedCount} kişi otomatik yerleştirildi.`
    );

    // Remove from selection
    setSelectedAppIds(selectedAppIds.filter(id => !groupAppIds.includes(id)));
    alert(`Toplu işlem başarıyla tamamlandı! ${action === 'Onaylandı' ? `${approvedCount} başvuru onaylandı, bunlardan ${placedCount} kişi uygun odalara otomatik yerleştirildi.` : `${groupAppIds.length} başvuru güncellendi.`}`);
  };

  const toggleSelectAll = () => {
    if (selectedAppIds.length === applications.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(applications.map(app => app.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedAppIds.includes(id)) {
      setSelectedAppIds(selectedAppIds.filter(item => item !== id));
    } else {
      setSelectedAppIds([...selectedAppIds, id]);
    }
  };

  const handleCopyLink = () => {
    const origin = window.location.origin;
    const shareUrl = `${origin}/?portal=basvuru`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  // Shortcut to open new application form (Ctrl+N / Cmd+N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        
        setName('');
        setTcNo('');
        setPhone('');
        setEmail('');
        setCategory('Lise');
        setAddress('');
        setAllergies('');
        setChronicDiseases('');
        setMedications('');
        setHealthNote('');
        setHeight('');
        setWeight('');
        setKvkkChecked(false);
        setConsentChecked(false);
        
        setConvoyName('');
        setLeaderName('');
        setLeaderTc('');
        setLeaderPhone('');
        setLeaderEmail('');
        setLeaderAddress('');
        setLeaderHeight('');
        setLeaderWeight('');
        setLeaderAllergies('');
        setLeaderChronicDiseases('');
        setLeaderMedications('');
        setLeaderHealthNote('');
        setConvoyMembers([{
          name: '',
          tcNo: '',
          birthDate: '2012-05-15',
          gender: 'Erkek',
          category: 'Lise',
          duty: 'Katılımcı',
          height: '',
          weight: '',
          allergies: '',
          chronicDiseases: '',
          medications: '',
          healthNote: '',
          autoAllocate: true,
          preferredBungalowId: '',
          preferredBedNumber: 0
        }]);

        if (onChangeSubView) {
          onChangeSubView('form');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onChangeSubView]);

  return (
    <div className="space-y-6" id="registrations-management-panel">
      {/* Title block */}
      {!isRemote && (
        <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-sans">
              <FileEdit className="w-5 h-5 text-emerald-600" />
              {activeSubView === 'form' ? 'Başvuru ve Ön Kayıt Formu' : 'Başvurular'}
              <HelpTooltip content={activeSubView === 'form' ? 'Bu ekrandan kampa yeni katılacak kişilerin ön kayıt bilgilerini girebilir veya dışarıya açık başvuru linkini kopyalayabilirsiniz.' : 'Ön kayıt işlemi tamamlanmış katılımcıların evraklarını onaylayarak onları kampa kesin kayıtlı hale getirdiğiniz başvurular ekranı.'} />
            </h2>
            <p className="text-xs text-gray-505 mt-1 max-w-2xl">
              {activeSubView === 'form' 
                ? 'Yeşilay kamp dönemi müracaatlarının bizzat sisteme girildiği veya uzaktan müracaat kanallarının yönetildiği kayıt kabul form alanı.'
                : 'Online portallardan gelen ön başvuruların, evrak uygunluk durumlarının ve kontenjan/yatak eşleştirme müracaat onaylarının yönetildiği işlem merkezi.'}
            </p>
          </div>

          {/* Quick inline tab switcher for responsive/collapsed state convenience */}
          {onChangeSubView && (
            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold w-full md:w-auto shadow-3xs border border-gray-200">
              <button
                type="button"
                onClick={() => onChangeSubView('form')}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeSubView === 'form'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                📝 Başvuru Formu
              </button>
              <button
                type="button"
                onClick={() => onChangeSubView('queue')}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeSubView === 'queue'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                📋 Başvurular
              </button>
            </div>
          )}
        </div>
      )}

      <div className="w-full">
        {/* Left Side: Simulation form of Participant Portal Online Application */}
        {(isRemote || activeSubView === 'form') && (
          <div className={`${isRemote ? "max-w-3xl" : "max-w-4xl"} mx-auto bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-5`}>
          
          {/* Shareable Link Box for Admins */}
          {!isRemote && (
            <div className="p-4 bg-emerald-50/75 border border-emerald-100 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-xs text-emerald-900">
                  Uzaktan Online Başvuru Bağlantısı
                </span>
              </div>
              <p className="text-[10px] text-emerald-800 leading-relaxed">
                Bu bağlantıyı toplu katılım sağlayacak kafile liderlerine gönderebilirsiniz. Buradan yapılan tüm başvurular anında müracaat değerlendirme listesine düşecektir.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/?portal=basvuru`}
                  className="bg-white border border-emerald-200 rounded p-1.5 px-3 font-mono text-[10px] text-gray-600 flex-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded text-[10px] transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3" /> Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Bağlantıyı Kopyala
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Toplu Katılımcı Yükleme (Excel / CSV) Paneli */}
          {!isRemote && (
            <div className="p-5 border border-emerald-100 rounded-xl bg-gradient-to-br from-emerald-50/10 to-white shadow-3xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-emerald-950 font-sans">
                      Toplu Katılımcı Müracaat Yükleme (Excel / CSV)
                    </h4>
                    <p className="text-[10px] text-gray-500">
                      Önceden hazırlanmış başvuru listelerini tek tıkla başvurular listesine aktarın.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-emerald-200 text-emerald-700 hover:text-emerald-850 bg-white hover:bg-emerald-50/50 rounded-lg text-3xs font-extrabold transition cursor-pointer shadow-3xs uppercase tracking-wider"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Boş Şablon İndir (.CSV)
                </button>
              </div>

              {importedParticipants.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sürükle Bırak / Dosya Seçme Alanı */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 transition flex flex-col items-center justify-center text-center cursor-pointer relative min-h-[140px] ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : 'border-gray-200 hover:border-emerald-500 hover:bg-gray-50/30'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="p-3 bg-gray-50 rounded-full text-emerald-600 mb-2">
                      <UploadCloud className="w-6 h-6 animate-pulse" />
                    </div>
                    <span className="font-extrabold text-xs text-gray-700 block">
                      Dosyayı buraya sürükleyin veya tıklayın
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Yalnızca uyumlu .CSV şablonu desteklenir
                    </span>
                  </div>

                  {/* Rehber & Açıklama */}
                  <div className="text-[10.5px] text-gray-600 space-y-2 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <span className="font-bold text-gray-800 block text-xs">Uyumlu Alanlar Kılavuzu:</span>
                    <ul className="list-disc list-inside space-y-1 text-gray-500">
                      <li>Uyumlu şablonu indirip Microsoft Excel veya Google E-Tablolar ile açın.</li>
                      <li>
                        <strong>T.C. Kimlik No</strong>, <strong>Ad Soyad</strong>, <strong>Cinsiyet</strong> ve <strong>Doğum Tarihi</strong> alanlarını eksiksiz doldurun.
                      </li>
                      <li>Yeni eklenen <span className="font-semibold text-emerald-800">Kamp Görevi (duty)</span> alanına "Katılımcı", "Gençlik Lideri" gibi unvanları yazabilirsiniz.</li>
                      <li>Dosyayı tekrar <strong>CSV (Noktalı Virgülle ayrılmış)</strong> olarak kaydedip buraya yükleyin.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Validation and Preview layout */}
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Dosya Önizlemesi ve Doğrulama Raporu
                      </span>
                      <p className="text-[10px] text-gray-600">
                        {importSuccessMsg} {importErrors.length > 0 ? `(${importErrors.length} adet doğrulama uyarısı var)` : 'Tüm veriler uyumlu görünüyor!'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div>
                        <select
                          value={importPeriodId}
                          onChange={(e) => setImportPeriodId(e.target.value)}
                          className="p-1.5 border border-gray-200 bg-white rounded text-xs font-semibold focus:outline-none focus:border-emerald-600"
                        >
                          {filteredPeriods.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} Dönemine Aktar
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleCompleteImport}
                        className="bg-emerald-700 hover:bg-emerald-850 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        İçe Aktarımı Tamamla ({importedParticipants.filter(p => p.isValid).length} Kişi)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setImportedParticipants([]);
                          setImportErrors([]);
                          setImportSuccessMsg('');
                        }}
                        className="border border-gray-300 hover:bg-gray-100 text-gray-750 font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                      >
                        İptal Et
                      </button>
                    </div>
                  </div>

                  {importErrors.length > 0 && (
                    <div className="p-3 bg-red-50/60 border border-red-200 rounded-lg max-h-24 overflow-y-auto text-[10px] text-red-700 space-y-1">
                      <span className="font-bold uppercase text-[9px] block">Doğrulama Uyarıları:</span>
                      {importErrors.map((err, idx) => (
                        <p key={idx} className="flex items-start gap-1">
                          <span className="text-red-500 font-extrabold">•</span> {err}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto shadow-3xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                          <th className="p-2 pl-3">T.C. Kimlik No</th>
                          <th className="p-2">Ad Soyad</th>
                          <th className="p-2">Doğum Tarihi</th>
                          <th className="p-2">Cinsiyet</th>
                          <th className="p-2">Kategori</th>
                          <th className="p-2">Görev</th>
                          <th className="p-2">Telefon / E-posta</th>
                          <th className="p-2 pr-3 text-center">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-[11px] font-medium text-gray-700 bg-white">
                        {importedParticipants.map((p, idx) => (
                          <tr key={idx} className={p.isValid ? 'hover:bg-gray-50/50' : 'bg-red-50/30 hover:bg-red-50/40'}>
                            <td className="p-2 pl-3 font-mono text-[10px]">
                              {p.identityNumber || <span className="text-gray-400">Eksik (Oto-Atanır)</span>}
                            </td>
                            <td className="p-2 font-bold text-gray-950">{p.name || <span className="text-red-500">BOŞ</span>}</td>
                            <td className="p-2 font-mono text-[10px]">{p.birthDate}</td>
                            <td className="p-2">{p.gender}</td>
                            <td className="p-2">
                              <span className="inline-block text-[9px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                {p.category}
                              </span>
                            </td>
                            <td className="p-2">{p.duty || 'Katılımcı'}</td>
                            <td className="p-2 text-2xs text-gray-500 font-sans leading-tight">
                              <div>{p.phone || '-'}</div>
                              <div className="text-gray-400 mt-0.5">{p.email || '-'}</div>
                            </td>
                            <td className="p-2 pr-3 text-center">
                              {p.isValid ? (
                                <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-extrabold text-[9px]">
                                  <Check className="w-2.5 h-2.5" /> Geçerli
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-extrabold text-[9px]">
                                  <X className="w-2.5 h-2.5" /> Hata
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode Switcher Buttons */}
          <div className="flex border-b border-gray-100 pb-3 justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5 font-sans">
                <Smile className="w-4 h-4 text-emerald-600" />
                {isRemote ? 'Yeşilay Kamp Online Başvuru Portalı' : 'Yeşilay Kamp Kayıt Portalı'}
              </h3>
              <p className="text-[9px] text-gray-400 mt-0.5">
                {isRemote ? 'Lütfen bilgilerinizi eksiksiz doldurarak başvurunuzu tamamlayınız.' : 'Şehir, adres, kafile sorumlusu ve yerleşim planlama müracaat kanalı.'}
              </p>
            </div>
          </div>

          {/* Selected Period Fixed Criteria & Info Highlight */}
          {(() => {
            const currentPeriod = periods.find(p => p.id === convoyPeriodId);
            if (!currentPeriod) return null;

            const remaining = getRemainingQuota(currentPeriod);
            const showQuotaWarning = remaining <= 6;

            return (
              <div className="space-y-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3 border-b border-emerald-100 pb-2">
                    <CalendarDays className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="font-black text-emerald-950 block text-xs uppercase tracking-wider">Kamp Dönemi Bilgileri</span>
                      <p className="text-emerald-700 font-bold text-sm">
                        {currentPeriod.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    <div className="bg-white p-2 rounded-lg border border-emerald-100">
                      <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Kontenjan</span>
                      <span className="font-bold text-gray-800 text-xs">{currentPeriod.maxQuota} Kişi</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-100">
                      <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Cinsiyet Grubu</span>
                      <span className="font-bold text-gray-800 text-xs">{currentPeriod.gender || 'Karışık/Aile'}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-100">
                      <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Yaş Aralığı</span>
                      <span className="font-bold text-gray-800 text-xs">
                        {currentPeriod.minAge && currentPeriod.maxAge 
                          ? `${currentPeriod.minAge} - ${currentPeriod.maxAge} Yaş` 
                          : 'Kısıtlama Yok'}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-100">
                      <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Tarih</span>
                      <span className="font-bold text-gray-800 text-[10px]">
                        {new Date(currentPeriod.startDate).toLocaleDateString()} - {new Date(currentPeriod.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {currentPeriod.criteria && (
                    <div className="bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/60 mt-2">
                      <span className="block text-[9px] font-black text-amber-700 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Başvuru Kriterleri & Uyarılar
                      </span>
                      <p className="text-amber-900 font-medium text-xs leading-relaxed">
                        {currentPeriod.criteria}
                      </p>
                    </div>
                  )}
                </div>
                
                {showQuotaWarning && (
                  <div className="p-3 bg-red-50/80 border border-red-200 rounded-lg text-2xs shadow-sm">
                    <span className="font-bold text-red-800 flex items-center gap-1 uppercase text-[9px]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Dikkat: Kontenjan Sınırı
                    </span>
                    <p className="text-red-700 font-medium mt-1">
                      {remaining <= 0 
                        ? 'Bu kamp dönemi için kontenjan dolmuştur. Başvurunuz alınamayabilir.'
                        : `Katılımcı sınırına ulaşmak üzeresiniz. Bu kamp dönemi için son ${remaining} kontenjan kalmıştır.`}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

            <form onSubmit={handleSubmitConvoy} className="space-y-4 text-xs">
              
              {/* Campaign & Convoy Header */}
              <div className="space-y-3">
                <span className="font-bold text-emerald-950 uppercase text-[9px] block">1. Kafile &amp; Dönem Tanımlaması</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-3xs font-extrabold text-gray-500 mb-1">Kafile / Grup İsmi *</label>
                    <input
                      type="text"
                      placeholder="Örn: Kayseri Genç Yeşilay Şubesi Lise Grubu"
                      value={convoyName}
                      onChange={(e) => setConvoyName(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:border-emerald-600 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-extrabold text-gray-500 mb-1">Başvurulan Kamp Dönemi *</label>
                    <select
                      value={convoyPeriodId}
                      onChange={(e) => setConvoyPeriodId(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:border-emerald-600 bg-white font-medium"
                    >
                      {filteredPeriods.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* CONVOY LEADER DETAILS FIRST */}
              <div className="p-4 bg-emerald-50/10 border border-emerald-100 rounded-xl space-y-3">
                <span className="font-extrabold text-emerald-900 uppercase text-[9.5px] flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  2. Kafile Sorumlusu (Grup Lideri) Bilgileri
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600">Sorumlu Adı Soyadı *</label>
                    <input
                      type="text"
                      placeholder="Ahmet Yılmaz"
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600">T.C. Kimlik Numarası *</label>
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="11 haneli TC"
                      value={leaderTc}
                      onChange={(e) => setLeaderTc(e.target.value.replace(/\D/g, ''))}
                      className="w-full p-2 border border-gray-200 rounded bg-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600">Doğum Tarihi *</label>
                    <input
                      type="date"
                      value={leaderBirth}
                      onChange={(e) => setLeaderBirth(e.target.value)}
                      min={getDateBounds(convoyPeriodId).minAttr}
                      max={getDateBounds(convoyPeriodId).maxAttr}
                      className="w-full p-1.5 border border-gray-200 rounded bg-white text-[10px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600">Cinsiyet *</label>
                    {periods.find(p => p.id === convoyPeriodId)?.gender && periods.find(p => p.id === convoyPeriodId)?.gender !== 'Karışık/Aile' ? (
                      <div className="w-full p-2 border border-gray-100 bg-gray-50 rounded text-[10px] font-bold text-gray-600 h-[34px] flex items-center">
                        {periods.find(p => p.id === convoyPeriodId)?.gender}
                      </div>
                    ) : (
                      <select
                        value={leaderGender}
                        onChange={(e) => setLeaderGender(e.target.value as any)}
                        className="w-full p-2 border border-gray-200 rounded bg-white text-[10px]"
                      >
                        <option value="Erkek">Erkek</option>
                        <option value="Kadın">Kadın</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600">İrtibat No *</label>
                    <input
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      value={leaderPhone}
                      onChange={(e) => setLeaderPhone(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded bg-white font-mono text-[10px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600">Görevi / Unvanı *</label>
                    <select
                      value={leaderDuty}
                      onChange={(e) => setLeaderDuty(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded bg-white text-[10px]"
                    >
                      <option value="Kafile Sorumlusu">Kafile Sorumlusu</option>
                      <option value="Gençlik Lideri">Gençlik Lideri</option>
                      <option value="Spor Eğitmeni">Spor Eğitmeni</option>
                      <option value="Kamp Sorumlusu">Kamp Sorumlusu</option>
                      <option value="Gönüllü">Gönüllü</option>
                      <option value="Şoför">Şoför</option>
                      <option value="Sağlık Görevlisi">Sağlık Görevlisi</option>
                      <option value="Eğitmen">Eğitmen</option>
                      <option value="Tercüman">Tercüman</option>
                      <option value="Katılımcı">Katılımcı</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-emerald-50/10 p-2.5 rounded-lg border border-emerald-100/30">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600">Boy (cm)</label>
                    <input
                      type="number"
                      placeholder="Örn: 175"
                      value={leaderHeight}
                      onChange={(e) => setLeaderHeight(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded bg-white text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600">Kilo (kg)</label>
                    <input
                      type="number"
                      placeholder="Örn: 70"
                      value={leaderWeight}
                      onChange={(e) => setLeaderWeight(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded bg-white text-[10px]"
                    />
                  </div>
                  {leaderHeight && leaderWeight && (
                    <div className="col-span-2 text-3xs font-extrabold flex items-center gap-1.5 pt-1 text-gray-500">
                      <span>Vücut Kitle Endeksi (VKE):</span>
                      <span className="font-extrabold text-gray-800">
                        {(parseFloat(leaderWeight) / Math.pow(parseFloat(leaderHeight) / 100, 2)).toFixed(1)}
                      </span>
                      {(() => {
                        const h = parseFloat(leaderHeight);
                        const w = parseFloat(leaderWeight);
                        const bmi = w / Math.pow(h / 100, 2);
                        if (bmi < 18.5) return <span className="text-blue-600">(Zayıf)</span>;
                        if (bmi < 25) return <span className="text-emerald-600">(Normal)</span>;
                        if (bmi < 30) return <span className="text-amber-600">(Kilolu - İlk 4 Yatağa Yerleşecek)</span>;
                        return <span className="text-rose-600 font-bold">(Obez - İlk 4 Yatağa Yerleşecek)</span>;
                      })()}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3.5 border-t pt-2 mt-1">
                  <div>
                    <label className="block text-3xs font-bold text-gray-500">İl (Şehir)</label>
                    <select
                      value={leaderCity}
                      onChange={(e) => setLeaderCity(e.target.value)}
                      className="w-full p-1.5 border border-gray-200 bg-white rounded text-[10px]"
                    >
                      {Object.keys(CITY_DISTRICT_MAP).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-gray-500">İlçe</label>
                    <select
                      value={leaderDistrict}
                      onChange={(e) => setLeaderDistrict(e.target.value)}
                      className="w-full p-1.5 border border-gray-200 bg-white rounded text-[10px]"
                    >
                      {(CITY_DISTRICT_MAP[leaderCity] || []).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-3xs font-bold text-gray-500">Kafile Adresi</label>
                  <textarea
                    placeholder="Kafilenin çıkış yapacağı şube veya merkez adresi..."
                    value={leaderAddress}
                    onChange={(e) => setLeaderAddress(e.target.value)}
                    rows={1}
                    className="w-full p-1.5 border border-gray-200 bg-white rounded text-[10px]"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-3xs font-extrabold text-neutral-700 bg-white p-2 rounded border border-emerald-100">
                  <input
                    type="checkbox"
                    id="leaderAuto"
                    checked={leaderAutoAllocate}
                    onChange={(e) => setLeaderAutoAllocate(e.target.checked)}
                    className="accent-emerald-700"
                  />
                  <label htmlFor="leaderAuto" className="cursor-pointer">
                    Sorumluyu Odalara Akıllı Otomatik Yerleştir (Lider Odaları Tercih Edilir)
                  </label>
                </div>
              </div>

              {/* DYNAMIC LIST OF PARTICIPANTS (CONVOY MEMBERS) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-gray-900 uppercase text-[9.5px]">
                    3. Kafiledeki Katılımcıların Listesi
                  </span>
                  
                  <button
                    type="button"
                    onClick={addConvoyMember}
                    disabled={(() => {
                      const sp = periods.find(p => p.id === convoyPeriodId);
                      if (!sp) return false;
                      const remaining = getRemainingQuota(sp);
                      return convoyMembers.length >= remaining;
                    })()}
                    className={`py-1 px-2.5 rounded text-3xs font-black flex items-center gap-1 shadow-3xs transition ${
                      (() => {
                        const sp = periods.find(p => p.id === convoyPeriodId);
                        if (!sp) return false;
                        const remaining = getRemainingQuota(sp);
                        return convoyMembers.length >= remaining;
                      })() 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    }`}
                  >
                    <Plus className="w-3 h-3" /> Katılımcı Ekle
                  </button>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {convoyMembers.map((member, index) => (
                    <div key={index} className="p-3 border border-gray-150 rounded-lg bg-gray-50/70 relative space-y-2.5">
                      <button
                        type="button"
                        onClick={() => removeConvoyMember(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition"
                        title="Bu katılımcıyı kafileden çıkar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="text-[10px] font-black text-emerald-800 uppercase">
                        #{index + 1}. Kafile Üyesi
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Katılımcı Adı Soyadı *"
                            value={member.name}
                            onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                            className="w-full p-2 border border-gray-200 bg-white rounded text-[10px]"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            maxLength={11}
                            placeholder="T.C. Kimlik Numarası *"
                            value={member.tcNo}
                            onChange={(e) => handleMemberChange(index, 'tcNo', e.target.value.replace(/\D/g, ''))}
                            className="w-full p-2 border border-gray-200 bg-white rounded font-mono text-[10px]"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Acil Durum İletişim Numarası"
                          value={member.emergencyContact || ''}
                          onChange={(e) => handleMemberChange(index, 'emergencyContact', e.target.value)}
                          className="w-full p-2 border border-gray-200 bg-white rounded text-[10px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <div>
                          <label className="block text-[8px] font-bold text-gray-500 mb-0.5">Doğum Tarihi</label>
                          <input
                            type="date"
                            value={member.birthDate}
                            onChange={(e) => handleMemberChange(index, 'birthDate', e.target.value)}
                            min={getDateBounds(convoyPeriodId).minAttr}
                            max={getDateBounds(convoyPeriodId).maxAttr}
                            className="w-full p-1 border border-gray-200 bg-white rounded text-[9px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-gray-500 mb-0.5">Cinsiyet</label>
                          {periods.find(p => p.id === convoyPeriodId)?.gender && periods.find(p => p.id === convoyPeriodId)?.gender !== 'Karışık/Aile' ? (
                            <div className="w-full p-1 border border-gray-100 bg-gray-50 rounded text-[9px] font-bold text-gray-600 h-[22px] flex items-center">
                              {periods.find(p => p.id === convoyPeriodId)?.gender}
                            </div>
                          ) : (
                            <select
                              value={member.gender}
                              onChange={(e) => handleMemberChange(index, 'gender', e.target.value as any)}
                              className="w-full p-1 border border-gray-200 bg-white rounded text-[9px]"
                            >
                              <option value="Erkek">Erkek</option>
                              <option value="Kadın">Kadın</option>
                            </select>
                          )}
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-gray-500 mb-0.5">Kategori</label>
                          <select
                            value={member.category}
                            onChange={(e) => handleMemberChange(index, 'category', e.target.value as any)}
                            className="w-full p-1 border border-gray-200 bg-white rounded text-[9px]"
                          >
                            <option value="İlkokul">İlkokul</option>
                            <option value="Ortaokul">Ortaokul</option>
                            <option value="Lise">Lise</option>
                            <option value="Üniversite">Üniversite</option>
                            <option value="Yetişkin">Yetişkin</option>
                            <option value="Şoför">Şoför</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-gray-500 mb-0.5">Kamp Görevi</label>
                          <select
                            value={member.duty || 'Katılımcı'}
                            onChange={(e) => handleMemberChange(index, 'duty', e.target.value)}
                            className="w-full p-1 border border-gray-200 bg-white rounded text-[9px]"
                          >
                            <option value="Katılımcı">Katılımcı</option>
                            <option value="Gençlik Lideri">Gençlik Lideri</option>
                            <option value="Spor Eğitmeni">Spor Eğitmeni</option>
                            <option value="Kamp Sorumlusu">Kamp Sorumlusu</option>
                            <option value="Gönüllü">Gönüllü</option>
                            <option value="Şoför">Şoför</option>
                            <option value="Sağlık Görevlisi">Sağlık Görevlisi</option>
                            <option value="Eğitmen">Eğitmen</option>
                            <option value="Tercüman">Tercüman</option>
                            <option value="Diğer">Diğer</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[9px] bg-emerald-50/10 p-2 rounded border border-emerald-100/20">
                        <div>
                          <input
                            type="number"
                            placeholder="Boy (cm)"
                            value={member.height}
                            onChange={(e) => handleMemberChange(index, 'height', e.target.value)}
                            className="w-full p-1 border border-gray-200 bg-white rounded"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Kilo (kg)"
                            value={member.weight}
                            onChange={(e) => handleMemberChange(index, 'weight', e.target.value)}
                            className="w-full p-1 border border-gray-200 bg-white rounded"
                          />
                        </div>
                        {member.height && member.weight && (
                          <div className="col-span-2 text-[8px] font-bold flex items-center gap-1 text-gray-500">
                            <span>VKE:</span>
                            <span className="font-extrabold text-gray-800">
                              {(parseFloat(member.weight) / Math.pow(parseFloat(member.height) / 100, 2)).toFixed(1)}
                            </span>
                            {(() => {
                              const h = parseFloat(member.height);
                              const w = parseFloat(member.weight);
                              const bmi = w / Math.pow(h / 100, 2);
                              if (bmi < 18.5) return <span className="text-blue-600">(Zayıf)</span>;
                              if (bmi < 25) return <span className="text-emerald-600">(Normal)</span>;
                              if (bmi < 30) return <span className="text-amber-600">(Kilolu - İlk 4 Yatak)</span>;
                              return <span className="text-rose-600 font-bold">(Obez - İlk 4 Yatak)</span>;
                            })()}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[9px]">
                        <input
                          type="text"
                          placeholder="Alerji Hassasiyeti (varsa)"
                          value={member.allergies}
                          onChange={(e) => handleMemberChange(index, 'allergies', e.target.value)}
                          className="w-full p-1 border border-gray-200 bg-white rounded"
                        />
                        <input
                          type="text"
                          placeholder="Kronik Hastalık (varsa)"
                          value={member.chronicDiseases}
                          onChange={(e) => handleMemberChange(index, 'chronicDiseases', e.target.value)}
                          className="w-full p-1 border border-gray-200 bg-white rounded"
                        />
                      </div>

                      {/* Manual/Auto placement selector for each member */}
                      <div className="bg-white p-2 rounded border border-gray-150 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-700">
                          <input
                            type="checkbox"
                            id={`memberAuto-${index}`}
                            checked={member.autoAllocate}
                            onChange={(e) => handleMemberChange(index, 'autoAllocate', e.target.checked)}
                            className="accent-emerald-700"
                          />
                          <label htmlFor={`memberAuto-${index}`} className="cursor-pointer">
                            Otomatik Yerleştir (Öğrenci Bungalovları)
                          </label>
                        </div>

                        {!member.autoAllocate && (
                          <div className="grid grid-cols-2 gap-1 animate-fadeIn">
                            <select
                              value={member.preferredBungalowId}
                              onChange={(e) => {
                                handleMemberChange(index, 'preferredBungalowId', e.target.value);
                                handleMemberChange(index, 'preferredBedNumber', 1);
                              }}
                              className="p-1 border border-gray-200 text-[9px] bg-white rounded font-bold"
                            >
                              <option value="">-- El ile Seç --</option>
                              {getBungalowList(member.gender, 'Standart', parseFloat(member.height), parseFloat(member.weight)).filter(b => b.isAvailable).map(b => (
                                <option key={b.id} value={b.id}>
                                  {b.id} ({b.occupantCount}/{b.capacity} Dolu - {b.currentGender})
                                </option>
                              ))}
                            </select>

                            {member.preferredBungalowId && (
                              <select
                                value={member.preferredBedNumber}
                                onChange={(e) => handleMemberChange(index, 'preferredBedNumber', parseInt(e.target.value))}
                                className="p-1 border border-gray-200 text-[9px] bg-white rounded font-bold"
                              >
                                {[1, 2, 3, 4, 5, 6]
                                  .slice(0, bungalows.find(b => b.id === member.preferredBungalowId)?.capacity || 6)
                                  .filter(n => {
                                    const h = parseFloat(member.height) || 0;
                                    const w = parseFloat(member.weight) || 0;
                                    const bmi = h > 0 ? w / Math.pow(h / 100, 2) : 0;
                                    if (bmi >= 25 && n > 4) return false;
                                    return true;
                                  })
                                  .map(n => {
                                    const isBedFilled = participants.some(p => p.bungalowId === member.preferredBungalowId && p.bedNumber === n);
                                    return (
                                      <option key={n} value={n} disabled={isBedFilled}>
                                        {n}. Yatak {isBedFilled ? '(Dolu)' : ''}
                                      </option>
                                    );
                                  })}
                              </select>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                            {/* CONSENTS & CONTRACTS FOR GROUP */}
              <div className="space-y-4 border-t pt-4 font-semibold text-gray-650 mb-4">
                <LegalDocumentBox 
                  title="KVKK Onay ve Aydınlatma Metni"
                  label="Tüm KVKK aydınlatma metnini okudum, kişisel ve özel nitelikli verilerimin işlenmesini kabul ediyorum."
                  checked={kvkkChecked}
                  onChange={setKvkkChecked}
                  content={
                    <>
                      <h4 className="font-black text-center text-gray-900 mb-2">T.C. YEŞİLAY CEMİYETİ<br/>YAYLAGÖL ULUSLARARASI KAMP MERKEZİ<br/>KİŞİSEL VERİLERİN KORUNMASI AYDINLATMA METNİ</h4>
                      <p className="mb-2"><strong>Başvuru Sahibi / Kafile Sorumlusu:</strong> {leaderName || "..................................................."}</p>
                      <p className="mb-2"><strong>T.C. Kimlik No:</strong> {leaderTc || "..................."}</p>
                      <p className="mt-4">6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Türkiye Yeşilay Cemiyeti Yaylagöl Uluslararası Kamp Merkezi olarak, kamp kaydınız ve konaklamanız kapsamında elde ettiğimiz kişisel verilerinizi yetkili servis sağlayıcılarımız vasıtasıyla işliyoruz.</p>
                      <p className="mt-2"><strong>1. İşlenen Kişisel Veriler:</strong> Kimlik bilgileriniz, iletişim bilgileriniz, sağlık verileriniz (alerji, kronik rahatsızlık, kullanılan ilaçlar) ve kamp içi güvenlik/konaklama/oda atama bilgileriniz ile kafilede yer alan diğer katılımcıların verileri.</p>
                      <p className="mt-2"><strong>2. İşlenme Amacı:</strong> Konaklama hizmetinin eksiksiz sunulması, acil tıbbi müdahale gereksinimlerinin karşılanması, kampüs güvenliğinin sağlanması ve 1774 sayılı Kimlik Bildirme Kanunu gerekliliklerinin yerine getirilmesi amacıyla işlenmektedir.</p>
                      <p className="mt-2"><strong>3. Verilerin Aktarımı:</strong> Sağlık verileriniz sadece kamp reviri yetkilileri ve acil durumlarda sağlık personeliyle; kimlik bilgileriniz ise yasal zorunluluk kapsamında kolluk kuvvetleri ile paylaşılmaktadır.</p>
                      <p className="mt-4 border-t border-gray-200 pt-4">İşbu aydınlatma metnini okuduğumu, şahsım ve kafilemdeki/grubumdaki kampta kalacak diğer tüm katılımcılar adına sağlık durumlarını eksiksiz bildirdiğimi, verilerimizin kamp faaliyetleri süresince işlenmesine açık rıza gösterdiğimizi kabul ederim.</p>
                    </>
                  }
                />

                <LegalDocumentBox 
                  title="Kamp Katılım Taahhütnamesi"
                  label="Kamp Katılım Taahhütnamesinde yer alan tüm kuralları okudum, anladım ve kabul ediyorum."
                  checked={consentChecked}
                  onChange={setConsentChecked}
                  content={
                    <>
                      <h4 className="font-black text-center text-gray-900 mb-2">T.C. YEŞİLAY CEMİYETİ<br/>YAYLAGÖL ULUSLARARASI KAMP MERKEZİ<br/>KAMP KATILIM TAAHHÜTNAMESİ</h4>
                      <p className="mb-2"><strong>Başvuru Sahibi / Kafile Sorumlusu:</strong> {leaderName || "..................................................."}</p>
                      <p className="mb-4">Yaylagöl Uluslararası Kamp Merkezi'nde şahsım ve sorumluluğunu üstlendiğim kafilemdeki katılımcılar olarak konaklayacağımız süre boyunca aşağıdaki kurallara kayıtsız şartsız uyacağımızı taahhüt ederim:</p>
                      <ul className="list-disc pl-4 space-y-2 mt-2">
                        <li>Kamp alanına tütün, alkol, uyuşturucu madde, kesici/delici alet getirmeyeceğimizi ve kullanmayacağımızı kabul ediyoruz.</li>
                        <li>Kamp yetkililerinin, liderlerin ve güvenlik personelinin yönlendirmelerine harfiyen uyacağımızı beyan ederiz.</li>
                        <li>Tarafımıza tahsis edilen bungalov/çadır, yatak ve ortak alanlardaki demirbaşları koruyacağımızı, kasıtlı verilen zararları tazmin edeceğimizi kabul ederiz.</li>
                        <li>Kamp sınırları dışına, yetkililerden izinsiz ve tek başımıza çıkmayacağımızı taahhüt ederiz.</li>
                        <li>Revir kayıtlarında beyan ettiğimiz sağlık durumu bilgilerinin (alerji, kronik hastalık vb.) doğru olduğunu, eksik veya hatalı bilgi vermemizden kaynaklı doğacak sağlık problemlerinde sorumluluğun tarafımıza ait olduğunu kabul ederiz.</li>
                        <li>Kamptaki diğer katılımcıların huzurunu bozacak her türlü eylemden kaçınacağımızı, kurallara uymamamız durumunda kamp idaresi tarafından kamptan ilişiğimizin kesilebileceğini kabul ve beyan ederiz.</li>
                        <li>Katılımcılar, kamp girişinde kimliklerini görevliye teslim etmekle yükümlüdür. Kimlikler, kamp çıkışında oda ve kamp alanı kontrollerinin ardından katılımcılara teslim edilir.</li>
                      </ul>
                      <p className="mt-4 font-bold">Yukarıda yazılı bulunan kamp kurallarını kampta kalacak tüm kişiler (kafilem) adına okudum, anladım ve tüm kurallara uyacağımızı taahhüt ederim.</p>
                    </>
                  }
                />
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                <SignaturePad onSignatureChange={setSignatureData} />
                {signatureData && (
                  <p className="text-3xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> İmza Alındı
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg shadow-sm transition cursor-pointer"
              >
                Kafileyi ve Tüm Katılımcı Listesini Toplu Kaydet
              </button>
            </form>
        </div>
        )}

        {/* Right Side: Admins Evaluation Panel for waiting Registrations */}
        {!isRemote && activeSubView === 'queue' && (
          <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-4 w-full">
          
          {/* Header block with processing count */}
          <div className="flex justify-between items-start border-b pb-2 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5 font-sans">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Başvurular
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Online portaldan gönderilen ve yöneticinin onay/ret kararını bekleyen evrak ve başvurular.
              </p>
            </div>
            
            <div className="bg-gray-50 px-2.5 py-1 rounded-md text-right">
              <span className="text-3xs text-gray-400 font-extrabold uppercase block">Bekleyen Toplam</span>
              <span className="text-xs font-black text-emerald-800">{applications.length} Başvuru</span>
            </div>
          </div>

          {/* BULK ACTIONS HEADER (TOPLU İŞLEM ALANI) */}
          {applications.length > 0 && (
            <div className="p-3 bg-neutral-50 rounded-xl border border-gray-150 space-y-2.5 text-xs">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-1 text-3xs font-extrabold text-neutral-700 hover:text-neutral-900 bg-white border border-gray-200 px-2 py-1 rounded cursor-pointer"
                  >
                    {selectedAppIds.length === applications.length ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                        Seçimleri Temizle ({selectedAppIds.length})
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5 text-gray-400" />
                        Tümünü Seç ({applications.length})
                      </>
                    )}
                  </button>
                </div>
                
                <span className="text-3xs font-black text-emerald-850 uppercase">
                  {selectedAppIds.length} Genel Müracaat Seçildi
                </span>
              </div>

              {/* Bulk operations row */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleBulkAction('Reddedildi')}
                  disabled={selectedAppIds.length === 0}
                  className="py-1.5 px-2 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:hover:bg-red-50 text-red-700 text-3xs font-black rounded-lg transition border border-red-200 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Genel Toplu Reddet
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkAction('Yedek Listede')}
                  disabled={selectedAppIds.length === 0}
                  className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 disabled:hover:bg-purple-50 text-purple-700 text-3xs font-black rounded-lg transition border border-purple-200 flex items-center justify-center gap-1 cursor-pointer"
                >
                  Genel Toplu Yedeğe Al
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkAction('Onaylandı')}
                  disabled={selectedAppIds.length === 0}
                  className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-3xs font-black rounded-lg transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Genel Toplu Onayla
                </button>
              </div>
            </div>
          )}

          
          {/* SEARCH BAR */}
          <div className="mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Başvurularda ara (İsim, T.C. Kimlik No veya Kafile)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-250 rounded-lg text-xs w-full focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
          
          {/* GROUPED ACCORDION VIEW OF APPLICATIONS BY INSTITUTION / CONVOY */}
          {(() => {
            const groupedApps: Record<string, Participant[]> = {};
            applications.forEach((app) => {
              const groupKey = app.convoyName?.trim() || 'Kafile Başvurusu';
              if (!groupedApps[groupKey]) {
                groupedApps[groupKey] = [];
              }
              groupedApps[groupKey].push(app);
            });

            const groupKeys = Object.keys(groupedApps);

            return (
              <div className="space-y-4">
                {groupKeys.length > 0 ? (
                  groupKeys.map((groupName) => {
                    const groupParticipants = groupedApps[groupName];
                    const isGroupExpanded = expandedGroups.includes(groupName);
                    const groupParticipantIds = groupParticipants.map((p) => p.id);

                    // Check if all in group are selected
                    const areAllInGroupSelected = groupParticipantIds.every((id) => selectedAppIds.includes(id));
                    const areSomeInGroupSelected = groupParticipantIds.some((id) => selectedAppIds.includes(id));

                    const toggleSelectGroup = () => {
                      if (areAllInGroupSelected) {
                        // Deselect all in group
                        setSelectedAppIds(selectedAppIds.filter((id) => !groupParticipantIds.includes(id)));
                      } else {
                        // Select all in group
                        const otherSelected = selectedAppIds.filter((id) => !groupParticipantIds.includes(id));
                        setSelectedAppIds([...otherSelected, ...groupParticipantIds]);
                      }
                    };

                    return (
                      <div
                        key={groupName}
                        className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-2xs transition-all"
                      >
                        {/* Group Header */}
                        <div
                          onClick={() => {
                            if (isGroupExpanded) {
                              setExpandedGroups(expandedGroups.filter((g) => g !== groupName));
                            } else {
                              setExpandedGroups([...expandedGroups, groupName]);
                            }
                          }}
                          className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors bg-emerald-50/45 hover:bg-emerald-50/70 text-emerald-950"
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox for group selection */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectGroup();
                              }}
                              className="shrink-0 transition cursor-pointer"
                            >
                              {areAllInGroupSelected ? (
                                <CheckSquare className="w-5 h-5 text-emerald-700" />
                              ) : areSomeInGroupSelected ? (
                                <div className="w-5 h-5 bg-emerald-50 border-2 border-emerald-500 rounded flex items-center justify-center">
                                  <div className="w-2.5 h-0.5 bg-emerald-700" />
                                </div>
                              ) : (
                                <Square className="w-5 h-5 text-gray-300 hover:text-emerald-600" />
                              )}
                            </button>

                            <div className="flex items-center gap-2 flex-wrap">
                              <Building className="w-5 h-5 text-emerald-700" />
                              <span className="font-extrabold text-sm md:text-base tracking-tight text-gray-900">
                                {groupName}
                              </span>
                              <span className="text-3xs font-black uppercase px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                                {groupParticipants.length} Müracaat
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {isGroupExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>

                        {/* Group Body */}
                        {isGroupExpanded && (
                          <div className="p-4 bg-gray-50/30 border-t border-gray-150 space-y-4">
                            {/* Group Bulk Actions */}
                            <div className="p-3 bg-white rounded-xl border border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs">
                              <div className="space-y-0.5">
                                <span className="text-3xs font-black text-emerald-850 uppercase tracking-wider block">
                                  Toplu İşlemler ({groupName})
                                </span>
                                <p className="text-[10px] text-gray-400">
                                  Bu gruba ait tüm bekleyen müracaatları tek seferde değerlendirin.
                                </p>
                              </div>

                              <div className="flex gap-2 self-stretch sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleGroupBulkAction(groupName, 'Reddedildi', groupParticipantIds)}
                                  className="flex-1 sm:flex-none py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-3xs font-black rounded-lg transition border border-red-200 flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <X className="w-3 h-3" /> Toplu Reddet
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGroupBulkAction(groupName, 'Yedek Listede', groupParticipantIds)}
                                  className="flex-1 sm:flex-none py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 text-3xs font-black rounded-lg transition border border-purple-200 flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  Toplu Yedeğe Al
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGroupBulkAction(groupName, 'Onaylandı', groupParticipantIds)}
                                  className="flex-1 sm:flex-none py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-3xs font-black rounded-lg transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" /> Toplu Onayla
                                </button>
                              </div>
                            </div>

                            {/* Participant Cards for Group */}
                            <div className="space-y-3">
                              {groupParticipants.map((app) => {
                                const isSelected = selectedAppIds.includes(app.id);
                                const isExpanded = expandedAppIds.includes(app.id);
                                const toggleExpand = () => {
                                  if (isExpanded) {
                                    setExpandedAppIds(expandedAppIds.filter((id) => id !== app.id));
                                  } else {
                                    setExpandedAppIds([...expandedAppIds, app.id]);
                                  }
                                };

                                return (
                                  <div
                                    key={app.id}
                                    className={`p-3 md:p-4 rounded-xl border bg-white transition-all duration-200 ${
                                      isSelected
                                        ? 'border-emerald-400 bg-emerald-50/10 shadow-3xs'
                                        : 'border-gray-150 hover:border-gray-300 shadow-3xs'
                                    } space-y-3 text-xs`}
                                  >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                        {/* Checkbox for selection */}
                                        <button
                                          type="button"
                                          onClick={() => toggleSelectOne(app.id)}
                                          className="mt-1 shrink-0 transition cursor-pointer"
                                        >
                                          {isSelected ? (
                                            <CheckSquare className="w-4 h-4 text-emerald-700" />
                                          ) : (
                                            <Square className="w-4 h-4 text-gray-300 hover:text-emerald-600" />
                                          )}
                                        </button>

                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-extrabold text-gray-950 text-sm truncate">
                                              {app.name}
                                            </span>
                                            <span
                                              className={`px-1.5 py-0.5 rounded-md text-[9px] font-black shrink-0 uppercase tracking-wider ${
                                                app.status === 'Yedek Listede'
                                                  ? 'bg-purple-100 text-purple-800'
                                                  : 'bg-yellow-100 text-yellow-850 border border-yellow-200 animate-pulse'
                                              }`}
                                            >
                                              {app.status}
                                            </span>
                                          </div>
                                          <p className="text-3xs text-gray-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                                            <span>T.C.: {app.identityNumber}</span>
                                            <span className="text-gray-200 dark:text-gray-650">|</span>
                                            <span>ID: {app.id}</span>
                                            <span className="text-gray-200 dark:text-gray-650">|</span>
                                            <span>Kategori: <strong className="text-emerald-800">{app.category || 'Belirtilmedi'}</strong></span>
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                                        <button
                                          type="button"
                                          onClick={toggleExpand}
                                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 transition px-2.5 py-1.5 bg-emerald-50 rounded-xl border border-emerald-150 cursor-pointer shadow-3xs"
                                        >
                                          {isExpanded ? (
                                            <>
                                              <EyeOff className="w-3.5 h-3.5 text-emerald-800" /> Detayları Gizle
                                            </>
                                          ) : (
                                            <>
                                              <Eye className="w-3.5 h-3.5 text-emerald-700" /> Detayları Gör
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Meta info grid - Show only if expanded */}
                                    {isExpanded && (
                                      <div className="grid grid-cols-2 gap-2 text-2xs text-gray-650 bg-gray-50 p-2.5 rounded-lg border border-gray-100 font-medium shadow-3xs animate-in fade-in slide-in-from-top-1 duration-200">
                                        <p>
                                          <strong>Cinsiyet:</strong> {app.gender}
                                        </p>
                                        <p>
                                          <strong>Doğum T.:</strong> {app.birthDate}
                                        </p>

                                        <p className="col-span-2 text-emerald-800 bg-emerald-50/70 border border-emerald-100 px-1.5 py-1 rounded">
                                          <strong>Kategori:</strong>{' '}
                                          {app.category
                                            ? `${app.category} ${
                                                ['İlkokul', 'Ortaokul', 'Lise', 'Üniversite'].includes(app.category)
                                                  ? 'Öğrencisi'
                                                  : ''
                                              }`
                                            : 'Belirtilmedi'}
                                        </p>

                                        {/* Dynamic city, district, address listing */}
                                        {(app.city || app.district) && (
                                          <p className="col-span-2 text-neutral-850 bg-neutral-50 px-1.5 py-1 rounded border border-gray-150">
                                            <strong>Adres:</strong> {app.district}, {app.city}{' '}
                                            {app.address ? `(${app.address})` : ''}
                                          </p>
                                        )}

                                        {/* Display allocation mode preference */}
                                        <p className="col-span-2 text-[10px] text-amber-900 bg-amber-50/30 border border-amber-100/60 px-1.5 py-0.5 rounded">
                                          <strong>Yerleşim:</strong>{' '}
                                          {app.autoAllocate
                                            ? '⚡ Otomatik Akıllı Yerleştirme'
                                            : `📌 Manuel Plan: ${
                                                app.preferredBungalowId
                                                  ? `${app.preferredBungalowId} (Yatak ${app.preferredBedNumber})`
                                                  : 'Odası Belirlenmedi (Yönetici Atasın)'
                                              }`}
                                        </p>

                                        <p className="col-span-2">
                                          <strong>Alerji Durumu:</strong>{' '}
                                          <span className="text-red-700">{app.allergies}</span>
                                        </p>
                                        <p className="col-span-2">
                                          <strong>Hastalık/Not:</strong> {app.chronicDiseases}{' '}
                                          {app.healthNote ? `(${app.healthNote})` : ''}
                                        </p>
                                        {(app.phone || app.email) && (
                                          <p className="col-span-2 border-t pt-1.5 mt-1">
                                            <strong>İletişim:</strong> {app.phone}{' '}
                                            {app.email ? `(${app.email})` : ''}
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {/* Actions buttons */}
                                    <div className="flex flex-col gap-2.5 pt-2.5 border-t border-gray-100">
                                      {/* Document checks and downloads in single responsive row */}
                                      <div className="flex items-center justify-between gap-2 w-full flex-wrap sm:flex-nowrap">
                                        <span className="text-emerald-700 font-extrabold text-3xs flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                          <Check className="w-3.5 h-3.5" /> Evraklar Onaylı
                                        </span>
                                        
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={() => {
                                              exportToPdf(app);
                                              onAddLog(
                                                'Form İndirme',
                                                `'${app.name}' için kayıt ve sağlık beyan formu PDF olarak yazdırıldı.`
                                              );
                                            }}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-100 cursor-pointer transition flex items-center justify-center gap-1 text-[10px] font-bold"
                                            title="Resmi Kayıt Formunu PDF İndir"
                                          >
                                            <Printer className="w-3.5 h-3.5" /> <span className="sm:hidden">PDF</span>
                                          </button>
                                          <button
                                            onClick={() => {
                                              exportToWord(app);
                                              onAddLog(
                                                'Form İndirme',
                                                `'${app.name}' için kayıt ve sağlık beyan formu Word (.doc) olarak indirildi.`
                                              );
                                            }}
                                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-100 cursor-pointer transition flex items-center justify-center gap-1 text-[10px] font-bold"
                                            title="Resmi Kayıt Formunu Word İndir"
                                          >
                                            <FileDown className="w-3.5 h-3.5" /> <span className="sm:hidden">Word</span>
                                          </button>
                                        </div>
                                      </div>

                                      {/* Evaluation buttons in robust touch-friendly grid on mobile, inline row on desktop */}
                                      <div className="grid grid-cols-2 xs:flex xs:flex-row xs:flex-wrap md:flex-nowrap gap-2 w-full mt-1">
                                        <button
                                          type="button"
                                          onClick={() => setEditingParticipant(app)}
                                          className="flex items-center justify-center gap-1 py-2 px-3 border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-emerald-500 hover:text-emerald-700 font-bold rounded-xl text-3xs cursor-pointer transition"
                                        >
                                          <Pencil className="w-3 h-3" /> Düzenle
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleStatusChange(app.id, 'Reddedildi')}
                                          className="flex items-center justify-center gap-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-3xs cursor-pointer transition border border-red-200"
                                        >
                                          <X className="w-3.5 h-3.5" /> Reddet
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleStatusChange(app.id, 'Yedek Listede')}
                                          className="flex items-center justify-center gap-1 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-3xs cursor-pointer transition border border-purple-200"
                                        >
                                          Yedeğe Al
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleStatusChange(app.id, 'Onaylandı')}
                                          className="col-span-2 xs:col-span-1 flex-1 flex items-center justify-center gap-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-3xs cursor-pointer transition shadow-sm animate-pulse"
                                        >
                                          <Check className="w-3.5 h-3.5" /> Onayla
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 border border-dashed rounded-xl">
                    <Smile className="w-12 h-12 text-gray-200 stroke-1 mb-2" />
                    <p className="text-xs font-semibold">Tüm Başvurular Değerlendirildi</p>
                    <p className="text-3xs mt-1">
                      Değerlendirilmeyi bekleyen herhangi bir ön başvuru bulunmamaktadır. Yeni başvurular geldikçe bu akışa düşecektir.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Guidelines info */}
          <div className="p-3 bg-yellow-50/50 border border-yellow-100 rounded-lg flex items-start gap-1.5 text-2xs text-yellow-800">
            <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-[10px]">Onay &amp; Otomatik Yerleşim Detayları</span>
              <p className="text-gray-650">
                Müracaatçılar <strong>Onaylandığında</strong>, eğer "Otomatik Akıllı Yerleşim" seçilmişse, sistem boştaki cinsiyet ve kategori uyumlu yatağa bizzat yerleşim yapar. Manuel planda ise seçilen odaya atanırlar.
              </p>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Participant Edit Modal */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-extrabold text-base leading-tight">Başvuru Bilgilerini Düzenle</h3>
                  <p className="text-3xs text-emerald-200 font-mono mt-0.5">ID: {editingParticipant.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingParticipant(null)}
                className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveEditedParticipant} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Bölüm 1: Kişisel Bilgiler */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-[#0B3B24] uppercase tracking-wider border-b pb-1">Kişisel Bilgiler</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Adı Soyadı</label>
                    <input
                      type="text"
                      required
                      value={editingParticipant.name || ''}
                      onChange={(e) => setEditingParticipant({ ...editingParticipant, name: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">T.C. Kimlik No</label>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      value={editingParticipant.identityNumber || ''}
                      onChange={(e) => setEditingParticipant({ ...editingParticipant, identityNumber: e.target.value.replace(/\D/g, '') })}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Doğum Tarihi</label>
                    <input
                      type="date"
                      required
                      value={editingParticipant.birthDate || ''}
                      onChange={(e) => setEditingParticipant({ ...editingParticipant, birthDate: e.target.value })}
                      min={editingParticipant.campPeriodId ? getDateBounds(editingParticipant.campPeriodId).minAttr : undefined}
                      max={editingParticipant.campPeriodId ? getDateBounds(editingParticipant.campPeriodId).maxAttr : undefined}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-gray-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Cinsiyet</label>
                      <select
                        value={editingParticipant.gender || 'Erkek'}
                        onChange={(e) => setEditingParticipant({ ...editingParticipant, gender: e.target.value as 'Erkek' | 'Kadın' })}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-white"
                      >
                        <option value="Erkek">Erkek</option>
                        <option value="Kadın">Kadın</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Kategori</label>
                      <select
                        value={editingParticipant.category || 'Lise'}
                        onChange={(e) => setEditingParticipant({ ...editingParticipant, category: e.target.value as any })}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-white"
                      >
                        <option value="İlkokul">İlkokul</option>
                        <option value="Ortaokul">Ortaokul</option>
                        <option value="Lise">Lise</option>
                        <option value="Üniversite">Üniversite</option>
                        <option value="Yetişkin">Yetişkin</option>
                        <option value="Kafile Sorumlusu">Kafile Sorumlusu</option>
                        <option value="Şoför">Şoför</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Kamp Görevi / Unvanı</label>
                      <select
                        value={editingParticipant.duty || 'Katılımcı'}
                        onChange={(e) => setEditingParticipant({ ...editingParticipant, duty: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-white"
                      >
                        <option value="Katılımcı">Katılımcı</option>
                        <option value="Gençlik Lideri">Gençlik Lideri</option>
                        <option value="Spor Eğitmeni">Spor Eğitmeni</option>
                        <option value="Kamp Sorumlusu">Kamp Sorumlusu</option>
                        <option value="Gönüllü">Gönüllü</option>
                        <option value="Kafile Sorumlusu">Kafile Sorumlusu</option>
                        <option value="Şoför">Şoför</option>
                        <option value="Sağlık Görevlisi">Sağlık Görevlisi</option>
                        <option value="Eğitmen">Eğitmen</option>
                        <option value="Tercüman">Tercüman</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bölüm 2: İletişim & Adres */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-[#0B3B24] uppercase tracking-wider border-b pb-1">İletişim &amp; Adres Bilgileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Telefon</label>
                    <input
                      type="text"
                      placeholder="05xx xxx xx xx"
                      value={editingParticipant.phone || ''}
                      onChange={(e) => setEditingParticipant({ ...editingParticipant, phone: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">E-Posta</label>
                    <input
                      type="email"
                      placeholder="ornek@mail.com"
                      value={editingParticipant.email || ''}
                      onChange={(e) => setEditingParticipant({ ...editingParticipant, email: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-gray-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 col-span-1 md:col-span-2">
                    <div>
                      <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">İl</label>
                      <select
                        value={editingParticipant.city || 'İstanbul'}
                        onChange={(e) => {
                          const newCity = e.target.value;
                          const districts = CITY_DISTRICT_MAP[newCity] || [];
                          setEditingParticipant({
                            ...editingParticipant,
                            city: newCity,
                            district: districts[0] || ''
                          });
                        }}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-white"
                      >
                        {Object.keys(CITY_DISTRICT_MAP).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">İlçe</label>
                      <select
                        value={editingParticipant.district || ''}
                        onChange={(e) => setEditingParticipant({ ...editingParticipant, district: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-white"
                      >
                        {(CITY_DISTRICT_MAP[editingParticipant.city || 'İstanbul'] || []).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Adres Detayı</label>
                    <textarea
                      rows={2}
                      value={editingParticipant.address || ''}
                      onChange={(e) => setEditingParticipant({ ...editingParticipant, address: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-gray-50/50 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bölüm 3: Sağlık Bilgileri */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-[#0B3B24] uppercase tracking-wider border-b pb-1">Sağlık Beyan Bilgileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Alerjiler</label>
                    <input
                      type="text"
                      placeholder="Gıda veya ilaç alerjisi..."
                      value={editingParticipant.allergies || ''}
                      onChange={(e) => setEditingParticipant({ ...editingParticipant, allergies: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Kronik Hastalıklar</label>
                    <input
                      type="text"
                      placeholder="Astım, diyabet vb..."
                      value={editingParticipant.chronicDiseases || ''}
                      onChange={(e) => setEditingParticipant({ ...editingParticipant, chronicDiseases: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Kullanılan İlaçlar</label>
                    <input
                      type="text"
                      placeholder="Düzenli alınan ilaçlar..."
                      value={editingParticipant.medications || ''}
                      onChange={(e) => setEditingParticipant({ ...editingParticipant, medications: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Diğer Sağlık Notları</label>
                    <input
                      type="text"
                      placeholder="Yöneticiye iletilecek özel notlar..."
                      value={editingParticipant.healthNote || ''}
                      onChange={(e) => setEditingParticipant({ ...editingParticipant, healthNote: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-gray-50/50"
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-2 gap-3 bg-emerald-50/10 p-3 rounded-lg border border-emerald-100/30">
                    <div>
                      <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Boy (cm)</label>
                      <input
                        type="number"
                        placeholder="Örn: 175"
                        value={editingParticipant.height || ''}
                        onChange={(e) => setEditingParticipant({ ...editingParticipant, height: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Kilo (kg)</label>
                      <input
                        type="number"
                        placeholder="Örn: 70"
                        value={editingParticipant.weight || ''}
                        onChange={(e) => setEditingParticipant({ ...editingParticipant, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-white"
                      />
                    </div>
                    {editingParticipant.height && editingParticipant.weight && (
                      <div className="col-span-2 text-3xs font-extrabold flex items-center gap-1.5 pt-1 text-gray-500">
                        <span>Vücut Kitle Endeksi (VKE):</span>
                        <span className="font-extrabold text-gray-800">
                          {(editingParticipant.weight / Math.pow(editingParticipant.height / 100, 2)).toFixed(1)}
                        </span>
                        {(() => {
                          const h = editingParticipant.height;
                          const w = editingParticipant.weight;
                          const bmi = w / Math.pow(h / 100, 2);
                          if (bmi < 18.5) return <span className="text-blue-600">(Zayıf)</span>;
                          if (bmi < 25) return <span className="text-emerald-600">(Normal)</span>;
                          if (bmi < 30) return <span className="text-amber-600">(Kilolu - İlk 4 Yatağa Yerleşecek)</span>;
                          return <span className="text-rose-600 font-bold">(Obez - İlk 4 Yatağa Yerleşecek)</span>;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bölüm 4: Kamp Yerleşim Seçenekleri */}
              <div className="space-y-3 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/80">
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  🛖 Kamp Yerleşim Tercihi
                </h4>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingParticipant.autoAllocate ?? true}
                      onChange={(e) => setEditingParticipant({
                        ...editingParticipant,
                        autoAllocate: e.target.checked,
                        preferredBungalowId: e.target.checked ? null : (editingParticipant.preferredBungalowId || ''),
                        preferredBedNumber: e.target.checked ? null : (editingParticipant.preferredBedNumber || 1)
                      })}
                      className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-gray-950 block">Otomatik Akıllı Odalandırma</span>
                      <p className="text-gray-550 text-2xs">Başvuru onaylandığında sistem boş olan ve cinsiyete uygun en ideal bungalova otomatik yerleştirsin.</p>
                    </div>
                  </label>

                  {!(editingParticipant.autoAllocate ?? true) && (
                    <div className="grid grid-cols-2 gap-3 pt-2 pl-6 animate-in slide-in-from-top-1 duration-150">
                      <div>
                        <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Tercih Edilen Oda/Bungalov</label>
                        <select
                          value={editingParticipant.preferredBungalowId || ''}
                          onChange={(e) => setEditingParticipant({ ...editingParticipant, preferredBungalowId: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-white"
                        >
                          <option value="">Oda Belirlenmedi (Manuel)</option>
                          {bungalows
                            .filter(b => b.type === (['Kafile Sorumlusu', 'Yetişkin', 'Şoför'].includes(editingParticipant.category || '') ? 'Lider' : 'Standart'))
                            .map(b => (
                              <option key={b.id} value={b.id}>
                                {b.name} ({b.id} - Kapasite: {b.capacity})
                              </option>
                            ))
                          }
                        </select>
                      </div>

                      <div>
                        <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Yatak Numarası</label>
                        <select
                          value={editingParticipant.preferredBedNumber || 1}
                          onChange={(e) => setEditingParticipant({ ...editingParticipant, preferredBedNumber: parseInt(e.target.value) })}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-xs bg-white"
                        >
                          {[1, 2, 3, 4, 5, 6]
                            .slice(0, bungalows.find(b => b.id === editingParticipant.preferredBungalowId)?.capacity || 6)
                            .filter(num => {
                              const h = editingParticipant.height || 0;
                              const w = editingParticipant.weight || 0;
                              const bmi = h > 0 ? w / Math.pow(h / 100, 2) : 0;
                              if (bmi >= 25 && num > 4) return false;
                              return true;
                            })
                            .map(num => {
                              const isBedFilled = participants.some(p => p.bungalowId === editingParticipant.preferredBungalowId && p.bedNumber === num && p.id !== editingParticipant.id);
                              return (
                                <option key={num} value={num} disabled={isBedFilled}>
                                  {num}. Yatak {isBedFilled ? '(Dolu)' : ''}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-150 p-4 px-6 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingParticipant(null)}
                className="py-2 px-4 border border-gray-350 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-100 transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleSaveEditedParticipant}
                className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" /> Değişiklikleri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convoy Evaluation Modal */}
      {viewingConvoyLeader && (() => {
        const convoyName = viewingConvoyLeader.convoyName || '';
        const convoyMembers = participants.filter(p => p.convoyName === convoyName);
        const leader = convoyMembers.find(p => p.isConvoyLeader) || viewingConvoyLeader;
        
        const pendingCount = convoyMembers.filter(p => p.status === 'Başvuru Yapıldı').length;
        const approvedCount = convoyMembers.filter(p => p.status === 'Onaylandı' || p.status === 'Kampta').length;
        const rejectedCount = convoyMembers.filter(p => p.status === 'Reddedildi').length;
        const waitingCount = convoyMembers.filter(p => p.status === 'Yedek Listede').length;

        const handleConvoyBulkAction = (action: 'Onaylandı' | 'Reddedildi' | 'Yedek Listede') => {
          let updatedList = [...participants];
          const convoyIds = convoyMembers.map(p => p.id);
          
          const updated = updatedList.map((p) => {
            if (convoyIds.includes(p.id)) {
              let updateData: Partial<Participant> = { status: action };
              if (action === 'Onaylandı') {
                updateData.status = 'Kampta';
                updateData.checkedIn = true;
                updateData.checkInTime = new Date().toISOString().slice(0, 19);

                if (p.preferredBungalowId && p.preferredBedNumber) {
                  const isFilled = updatedList.some(op => op.bungalowId === p.preferredBungalowId && op.bedNumber === p.preferredBedNumber);
                  const isGenderAllowed = canAssignToPreferredBungalow(p, p.preferredBungalowId, updatedList);
                  if (!isFilled && isGenderAllowed) {
                    updateData.bungalowId = p.preferredBungalowId;
                    updateData.bedNumber = p.preferredBedNumber;
                  } else {
                    const placement = autoAllocateParticipant(p, updatedList);
                    if (placement.bungalowId) {
                      updateData.bungalowId = placement.bungalowId;
                      updateData.bedNumber = placement.bedNumber;
                    }
                  }
                } else {
                  const placement = autoAllocateParticipant(p, updatedList);
                  if (placement.bungalowId) {
                    updateData.bungalowId = placement.bungalowId;
                    updateData.bedNumber = placement.bedNumber;
                  }
                }
              } else {
                updateData.bungalowId = null;
                updateData.bedNumber = null;
                updateData.checkedIn = false;
              }
              return { ...p, ...updateData };
            }
            return p;
          });

          onUpdateParticipants(updated);
          onAddLog(
            'Kafile Toplu Kararı',
            `'${convoyName}' kafilesindeki tüm katılımcıların (${convoyMembers.length} kişi) müracaat durumu toplu olarak '${action}' yapıldı.`
          );
          setViewingConvoyLeader(null);
        };

        return (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="bg-emerald-800 text-white px-6 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="bg-emerald-700 p-2 rounded-xl border border-emerald-600">
                    <Users className="w-5 h-5 text-emerald-100" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base leading-tight">Kafile Başvuruları Ayrı İnceleme Paneli</h3>
                    <p className="text-3xs text-emerald-200 font-mono mt-0.5">Kafile: {convoyName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingConvoyLeader(null)}
                  className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Kafile Bilgi Kartı */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/60 text-xs">
                  <div>
                    <span className="text-3xs font-black text-emerald-850 uppercase block mb-1">Kafile Sorumlusu (Lider)</span>
                    <p className="font-black text-gray-900 text-sm">{leader.name}</p>
                    <p className="text-3xs text-gray-400 font-mono mt-0.5">T.C.: {leader.identityNumber}</p>
                    {leader.phone && <p className="text-gray-600 mt-1">📞 {leader.phone}</p>}
                    {leader.email && <p className="text-gray-600">✉️ {leader.email}</p>}
                  </div>
                  
                  <div>
                    <span className="text-3xs font-black text-blue-850 uppercase block mb-1">Köken Şehir / İlçe</span>
                    <p className="font-bold text-gray-800 text-xs">{leader.district ? `${leader.district}, ` : ''}{leader.city}</p>
                    <p className="text-gray-500 mt-1 line-clamp-2" title={leader.address}>📍 {leader.address || 'Adres detayı belirtilmedi.'}</p>
                  </div>

                  <div>
                    <span className="text-3xs font-black text-blue-850 uppercase block mb-1">Kafile İstatistikleri</span>
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-3xs font-extrabold text-center">
                      <div className="bg-yellow-50 border border-yellow-150 p-1.5 rounded-lg text-yellow-800">
                        <span className="block text-xs font-black">{pendingCount}</span> Bekleyen
                      </div>
                      <div className="bg-emerald-50 border border-emerald-150 p-1.5 rounded-lg text-emerald-800">
                        <span className="block text-xs font-black">{approvedCount}</span> Onaylı/Kampta
                      </div>
                      <div className="bg-purple-50 border border-purple-150 p-1.5 rounded-lg text-purple-800">
                        <span className="block text-xs font-black">{waitingCount}</span> Yedek
                      </div>
                      <div className="bg-red-50 border border-red-150 p-1.5 rounded-lg text-red-800">
                        <span className="block text-xs font-black">{rejectedCount}</span> Reddedilen
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kafile Toplu Karar Mekanizması */}
                <div className="bg-[#f0f4f8] p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-black text-gray-900">Kafile Toplu Karar Mekanizması</h4>
                    <p className="text-3xs text-gray-550 font-bold">Kafilenin tüm üyelerine aynı kararı tek tıkla uygulayabilirsiniz.</p>
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleConvoyBulkAction('Reddedildi')}
                      className="flex-1 sm:flex-none py-1.5 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-3xs font-black rounded-xl transition cursor-pointer"
                    >
                      Tüm Kafileyi Reddet
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConvoyBulkAction('Yedek Listede')}
                      className="flex-1 sm:flex-none py-1.5 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-3xs font-black rounded-xl transition cursor-pointer"
                    >
                      Tüm Kafileyi Yedeğe Al
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConvoyBulkAction('Onaylandı')}
                      className="flex-1 sm:flex-none py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-3xs font-black rounded-xl transition shadow-sm cursor-pointer"
                    >
                      Tüm Kafileyi Onayla
                    </button>
                  </div>
                </div>

                {/* Katılımcı Listesi */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black text-[#0B3B24] uppercase tracking-wider border-b pb-1">Kafilenin Katılımcı Listesi ({convoyMembers.length} Kişi)</h4>
                  
                  <div className="divide-y divide-gray-150 border border-gray-150 rounded-xl overflow-hidden bg-white">
                    {convoyMembers.map((member) => {
                      const hasHealthIssues = member.allergies !== 'Yok' || member.chronicDiseases !== 'Yok' || member.medications !== 'Yok';
                      
                      return (
                        <div key={member.id} className="p-3 hover:bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                          
                          {/* İsim ve T.C. */}
                          <div className="min-w-[180px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-gray-900">{member.name}</span>
                              {member.isConvoyLeader && (
                                <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Sorumlu</span>
                              )}
                            </div>
                            <p className="text-3xs text-gray-400 font-mono mt-0.5">T.C.: {member.identityNumber} | ID: {member.id}</p>
                          </div>

                          {/* Kategori, Yaş & Cinsiyet */}
                          <div className="text-2xs text-gray-600 min-w-[120px]">
                            <p><strong>Kategori:</strong> {member.category}</p>
                            <p className="text-3xs"><strong>Cinsiyet:</strong> {member.gender} | <strong>Doğum:</strong> {member.birthDate}</p>
                          </div>

                          {/* Sağlık Beyan Durumu */}
                          <div className={`text-3xs p-2 rounded-lg max-w-[220px] shrink-0 ${hasHealthIssues ? 'bg-red-50 border border-red-100 text-red-800' : 'bg-gray-50 text-gray-500'}`}>
                            {hasHealthIssues ? (
                              <div>
                                {member.allergies !== 'Yok' && <p><strong>Alerji:</strong> {member.allergies}</p>}
                                {member.chronicDiseases !== 'Yok' && <p><strong>Kronik:</strong> {member.chronicDiseases}</p>}
                                {member.healthNote && <p><strong>Not:</strong> {member.healthNote}</p>}
                              </div>
                            ) : (
                              <span>Sağlık Beyanı Temiz (Herhangi bir engel yok)</span>
                            )}
                          </div>

                          {/* Yerleşim / Oda Durumu */}
                          <div className="text-3xs text-neutral-600 min-w-[120px]">
                            {member.bungalowId ? (
                              <p className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                🛖 {member.bungalowId} - Yatak {member.bedNumber}
                              </p>
                            ) : (
                              <p className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                📌 {member.autoAllocate ? '⚡ Otomatik Yerleşecek' : 'Manuel Seçim Bekliyor'}
                              </p>
                            )}
                          </div>

                          {/* Durum Badge */}
                          <div className="shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                member.status === 'Onaylandı' || member.status === 'Kampta'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : member.status === 'Reddedildi'
                                  ? 'bg-red-100 text-red-800 border-red-250'
                                  : member.status === 'Yedek Listede'
                                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                                  : 'bg-yellow-100 text-yellow-850 border-yellow-200'
                              }`}
                            >
                              {member.status}
                            </span>
                          </div>

                          {/* Üye İşlemleri */}
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => setEditingParticipant(member)}
                              className="p-1 px-1.5 border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 font-bold rounded text-3xs flex items-center gap-0.5 cursor-pointer"
                              title="Bilgilerini Düzenle"
                            >
                              <Pencil className="w-2.5 h-2.5" /> Düzenle
                            </button>
                            {member.status !== 'Onaylandı' && member.status !== 'Kampta' && (
                              <button
                                onClick={() => handleStatusChange(member.id, 'Onaylandı')}
                                className="p-1 px-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded text-3xs flex items-center gap-0.5 cursor-pointer"
                                title="Onayla"
                              >
                                <Check className="w-2.5 h-2.5" /> Onayla
                              </button>
                            )}
                            {member.status !== 'Reddedildi' && (
                              <button
                                onClick={() => handleStatusChange(member.id, 'Reddedildi')}
                                className="p-1 px-1.5 border border-red-200 text-red-650 hover:bg-red-50 font-bold rounded text-3xs flex items-center gap-0.5 cursor-pointer"
                                title="Reddet"
                              >
                                <X className="w-2.5 h-2.5" /> Reddet
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 border-t border-gray-150 p-4 px-6 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setViewingConvoyLeader(null)}
                  className="py-2 px-6 bg-gray-800 hover:bg-gray-900 text-white font-black rounded-xl text-xs transition cursor-pointer"
                >
                  Kapat
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
