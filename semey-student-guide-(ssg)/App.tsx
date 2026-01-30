
import React, { useState, useMemo, useEffect, useRef, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  User as UserIcon, 
  Search, 
  CheckCircle2, 
  Info,
  AlertTriangle,
  Heart,
  ChevronRight,
  Menu,
  X,
  Globe,
  Languages,
  LogIn,
  LogOut,
  Mail,
  Lock,
  MessageSquare,
  Edit2,
  Check,
  Sparkles,
  ExternalLink,
  Navigation,
  Share2,
  Map as MapIcon,
  Copy,
  Save
} from 'lucide-react';
import { MOCK_PLACES, ONBOARDING_DATA } from './constants';
import { PlaceCategory, SignalType } from './types';
import { translations } from './i18n';
import { discoverPlacesInSemey } from './services/geminiService';

// Leaflet import via CDN-style ES module
import L from 'https://esm.sh/leaflet@1.9.4';

// Language Context
type Language = 'en' | 'ru';
const LanguageContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
  t: any;
}>({ lang: 'en', setLang: () => {}, t: {} });

const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('ssg_lang');
    return (saved === 'en' || saved === 'ru') ? saved : 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('ssg_lang', newLang);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useTranslation = () => useContext(LanguageContext);

// Auth Context
interface User {
  id: string;
  email: string;
  name: string;
  university: string;
  yearOfStudy: string;
  bio: string;
}

const AuthContext = createContext<{
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: Partial<User>) => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  logout: () => void;
}>({ user: null, login: async () => {}, register: async () => {}, updateProfile: () => {}, logout: () => {} });

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ssg_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, pass: string) => {
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      university: 'SMU Semey',
      yearOfStudy: '1',
      bio: 'Medical student in Semey.'
    };
    setUser(mockUser);
    localStorage.setItem('ssg_user', JSON.stringify(mockUser));
  };

  const register = async (data: Partial<User>) => {
    const newUser: User = {
      id: Math.random().toString(),
      email: data.email || 'guest@example.com',
      name: data.name || 'Anonymous',
      university: data.university || 'SMU Semey',
      yearOfStudy: data.yearOfStudy || '1',
      bio: ''
    };
    setUser(newUser);
    localStorage.setItem('ssg_user', JSON.stringify(newUser));
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('ssg_user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ssg_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Components
const LanguageSwitcher = () => {
  const { lang, setLang } = useTranslation();
  return (
    <div className="flex items-center space-x-1">
      <button 
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${lang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
      >
        EN
      </button>
      <button 
        onClick={() => setLang('ru')}
        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${lang === 'ru' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
      >
        RU
      </button>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-[1000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-xl shadow-blue-100 shadow-lg">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black text-gray-900 tracking-tight">{t.nav.title}</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-bold text-xs uppercase tracking-wider">{t.nav.map}</Link>
            <Link to="/onboarding" className="text-gray-600 hover:text-blue-600 font-bold text-xs uppercase tracking-wider">{t.nav.onboarding}</Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-gray-600 hover:text-blue-600 font-bold text-xs uppercase tracking-wider">{t.nav.profile}</Link>
                <button onClick={logout} className="text-gray-400 hover:text-red-500 transition">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition shadow-lg shadow-blue-50">
                {t.nav.login}
              </Link>
            )}
            
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
               <LanguageSwitcher />
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2 hover:bg-gray-50 rounded-lg">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 text-gray-700 font-bold p-3 hover:bg-gray-50 rounded-2xl">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span>{t.nav.map}</span>
          </Link>
          <Link to="/onboarding" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 text-gray-700 font-bold p-3 hover:bg-gray-50 rounded-2xl">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span>{t.nav.onboarding}</span>
          </Link>
          {user ? (
             <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 text-gray-700 font-bold p-3 hover:bg-gray-50 rounded-2xl">
                <UserIcon className="w-5 h-5 text-green-500" />
                <span>{t.nav.profile}</span>
             </Link>
          ) : (
             <Link to="/auth" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 text-gray-700 font-bold p-3 hover:bg-gray-50 rounded-2xl">
                <LogIn className="w-5 h-5 text-blue-500" />
                <span>{t.nav.login}</span>
             </Link>
          )}
          <div className="p-3">
             <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
};

const MapComponent = ({ places, lang, selectedPlaceId, onMarkerClick }: { places: any[], lang: Language, selectedPlaceId: string | null, onMarkerClick: (id: string) => void }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const markersMap = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false 
      }).setView([50.4165, 80.2450], 14);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM'
      }).addTo(mapRef.current);
      
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
      markersRef.current = L.layerGroup().addTo(mapRef.current);
    }

    if (markersRef.current) {
      markersRef.current.clearLayers();
      markersMap.current.clear();
      
      places.forEach(place => {
        const isWarning = place.signals?.includes(SignalType.SOFT_WARNING);
        const markerColor = isWarning ? '#f59e0b' : '#2563eb';
        
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="marker-pulse" style="background-color: ${markerColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const name = lang === 'en' ? place.name : (place.nameRu || place.name);
        const addr = lang === 'en' ? place.address : (place.addrRu || place.address);

        const marker = L.marker([place.lat, place.lng], { icon })
          .bindPopup(`<b>${name}</b><br/><span style="font-size: 10px; color: #666;">${addr}</span>`)
          .addTo(markersRef.current!);
          
        marker.on('click', () => onMarkerClick(place.id));
        markersMap.current.set(place.id, marker);
      });
    }

    setTimeout(() => { mapRef.current?.invalidateSize(); }, 200);
  }, [places, lang, onMarkerClick]);

  useEffect(() => {
    if (selectedPlaceId && markersMap.current.has(selectedPlaceId) && mapRef.current) {
      const marker = markersMap.current.get(selectedPlaceId);
      if (marker) {
        mapRef.current.flyTo(marker.getLatLng(), 16, { duration: 1.5 });
        marker.openPopup();
      }
    }
  }, [selectedPlaceId]);

  return <div ref={containerRef} className="w-full h-full z-10" />;
};

const MapView = () => {
  const { lang, t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredPlaces, setDiscoveredPlaces] = useState<any[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const handleDiscover = async () => {
    setIsDiscovering(true);
    const result = await discoverPlacesInSemey(selectedCategory === 'All' ? 'student-friendly places' : selectedCategory);
    if (result && result.chunks) {
      const newPlaces = result.chunks.map((chunk: any, idx: number) => {
        const mapData = chunk.maps;
        if (!mapData) return null;
        return {
          id: `ai-${idx}-${Date.now()}`,
          name: mapData.title,
          category: selectedCategory === 'All' ? PlaceCategory.FOOD : selectedCategory,
          description: "Found live via community search.",
          lat: 50.4165 + (Math.random() - 0.5) * 0.04,
          lng: 80.2450 + (Math.random() - 0.5) * 0.04,
          tags: ['AI Discovery'],
          signals: [SignalType.STUDENT_FAVORITE],
          universityVerified: false,
          address: mapData.title,
          uri: mapData.uri
        };
      }).filter(Boolean);
      setDiscoveredPlaces(prev => [...newPlaces, ...prev].slice(0, 15));
    }
    setIsDiscovering(false);
  };

  const allPlaces = useMemo(() => [...MOCK_PLACES, ...discoveredPlaces], [discoveredPlaces]);

  const filteredPlaces = useMemo(() => {
    return allPlaces.filter(place => {
      const matchesCategory = selectedCategory === 'All' || place.category === selectedCategory;
      const term = searchQuery.toLowerCase();
      const matchesSearch = 
        place.name.toLowerCase().includes(term) || 
        (place.nameRu && place.nameRu.toLowerCase().includes(term)) ||
        place.tags.some(t => t.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, allPlaces]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="bg-white p-4 shadow-sm z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t.map.searchPlaceholder}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
             <button
              disabled={isDiscovering}
              onClick={handleDiscover}
              className={`flex items-center space-x-2 px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isDiscovering ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-50 hover:-translate-y-0.5'}`}
            >
              {isDiscovering ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isDiscovering ? t.map.loadingDiscovery : t.map.discoverBtn}</span>
            </button>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            {['All', ...Object.values(PlaceCategory)].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`px-5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-400'}`}
              >
                {cat === 'All' ? t.map.all : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="flex-1 bg-gray-100 relative h-[40vh] md:h-full">
          <MapComponent places={filteredPlaces} lang={lang} selectedPlaceId={selectedPlaceId} onMarkerClick={setSelectedPlaceId} />
        </div>

        <div className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-2xl z-20">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-black text-sm text-gray-800 tracking-tight uppercase tracking-wider">{t.map.nearbyPicks}</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-2 py-1 rounded-lg border border-gray-100">
              {filteredPlaces.length} {t.map.results}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
            {filteredPlaces.length > 0 ? filteredPlaces.map(place => {
              const isRecommended = place.signals?.includes(SignalType.STUDENT_FAVORITE);
              const isVerified = place.universityVerified;
              const isActive = selectedPlaceId === place.id;

              return (
                <div 
                  key={place.id} 
                  onClick={() => setSelectedPlaceId(place.id)}
                  className={`p-5 border rounded-[2rem] transition-all duration-300 bg-white group cursor-pointer ${isActive ? 'ring-2 ring-blue-500 border-transparent shadow-2xl' : 'border-gray-100 hover:border-blue-200 hover:shadow-xl'}`}
                >
                  <div className="flex flex-wrap gap-2 mb-2">
                    {isVerified && (
                      <div className="flex items-center text-[9px] bg-green-50 text-green-700 px-2 py-1 rounded-lg border border-green-100 font-black uppercase tracking-tighter shadow-sm">
                        <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                        {t.map.verified}
                      </div>
                    )}
                    {isRecommended && (
                      <div className="flex items-center text-[9px] bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100 font-black uppercase tracking-tighter shadow-sm">
                        <Heart className="w-2.5 h-2.5 mr-1" />
                        {t.map.recommended}
                      </div>
                    )}
                  </div>
                  
                  <h4 className={`font-black tracking-tight group-hover:text-blue-600 transition ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                    {lang === 'en' ? place.name : (place.nameRu || place.name)}
                  </h4>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed font-medium">
                    {lang === 'en' ? place.description : (place.descRu || place.description)}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {place.signals?.map((sig, idx) => (
                      <span 
                        key={idx} 
                        className={`text-[9px] font-black px-2 py-0.5 rounded-md flex items-center transition-colors ${
                          sig === SignalType.SOFT_WARNING 
                          ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                          : 'bg-gray-100 text-gray-500 border border-gray-100'
                        }`}
                      >
                        {sig === SignalType.SOFT_WARNING && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {sig}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <span className="text-[10px] text-gray-400 flex items-center font-bold max-w-[150px] truncate">
                      <MapPin className="w-3 h-3 mr-1 text-gray-300" />
                      {lang === 'en' ? place.address : (place.addrRu || place.address)}
                    </span>
                    
                    <div className="flex space-x-2">
                       {place.uri ? (
                          <a 
                             href={place.uri} 
                             target="_blank" 
                             className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition shadow-sm border border-blue-100"
                             onClick={(e) => e.stopPropagation()}
                          >
                             <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                       ) : (
                         <a 
                           href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' Semey')}`}
                           target="_blank"
                           className="flex items-center text-[9px] font-black text-blue-600 hover:text-blue-700 transition uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100"
                           onClick={(e) => e.stopPropagation()}
                         >
                           <Navigation className="w-3 h-3 mr-1.5" />
                           {t.map.getDirections}
                         </a>
                       )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-16 opacity-60">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-4" />
                <p className="text-sm font-bold text-gray-500 px-8">{t.map.noResults}</p>
                <button onClick={() => setSelectedCategory('All')} className="mt-4 text-xs font-black text-blue-600 uppercase tracking-widest underline">
                  {t.map.clearFilters}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OnboardingView = () => {
  const { lang, t } = useTranslation();
  const [tasks, setTasks] = useState(ONBOARDING_DATA);

  const toggleTask = (periodIdx: number, taskIdx: number) => {
    const newData = [...tasks];
    const taskList = lang === 'en' ? newData[periodIdx].tasks : newData[periodIdx].tasksRu;
    taskList[taskIdx].completed = !taskList[taskIdx].completed;
    setTasks(newData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-16 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">{t.onboarding.title}</h1>
        <p className="text-gray-500 mt-4 text-lg font-medium">{t.onboarding.subtitle}</p>
      </div>

      <div className="space-y-16">
        {tasks.map((period, pIdx) => (
          <div key={period.id} className="relative">
            <div className="md:flex items-start md:space-x-12">
              <div className="hidden md:flex flex-col items-center w-12 pt-3">
                <div className="w-12 h-12 rounded-3xl bg-blue-600 text-white flex items-center justify-center z-10 font-black text-xl shadow-xl shadow-blue-100">
                  {pIdx + 1}
                </div>
                <div className="w-1 h-full bg-blue-50 min-h-[120px] mt-4 rounded-full"></div>
              </div>

              <div className="flex-1 bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full">{period.period}</span>
                  <Calendar className="w-6 h-6 text-gray-200 group-hover:text-blue-200 transition-colors" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">{lang === 'en' ? period.title : period.titleRu}</h2>
                
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center uppercase tracking-widest">
                      <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center mr-3 shadow-sm border border-blue-100">
                        <Info className="w-4 h-4 text-blue-600" />
                      </div>
                      {t.onboarding.keyAdvice}
                    </h3>
                    <ul className="space-y-5">
                      {(lang === 'en' ? period.content : period.contentRu).map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start leading-relaxed font-medium">
                          <div className="w-5 h-5 bg-blue-50/50 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                            <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center uppercase tracking-widest">
                      <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center mr-3 shadow-sm border border-green-100">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      {t.onboarding.checklist}
                    </h3>
                    <div className="space-y-4">
                      {(lang === 'en' ? period.tasks : period.tasksRu).map((task, tIdx) => (
                        <div 
                          key={tIdx} 
                          onClick={() => toggleTask(pIdx, tIdx)}
                          className={`flex items-center p-5 rounded-[1.5rem] border cursor-pointer transition-all duration-300 ${task.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50/50 border-gray-100 hover:bg-white hover:border-blue-300 hover:shadow-xl'}`}
                        >
                          <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center mr-4 transition-all duration-300 ${task.completed ? 'bg-green-500 border-green-500 text-white scale-110 shadow-lg shadow-green-100' : 'bg-white border-gray-200'}`}>
                            {task.completed && <Check className="w-4 h-4" />}
                          </div>
                          <span className={`text-sm font-bold tracking-tight ${task.completed ? 'text-green-700 line-through opacity-50' : 'text-gray-800'}`}>
                            {task.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileView = () => {
  const { lang, t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const [editName, setEditName] = useState(user?.name || '');
  const [editUniversity, setEditUniversity] = useState(user?.university || '');
  const [editYear, setEditYear] = useState(user?.yearOfStudy || '1');
  const [editBio, setEditBio] = useState(user?.bio || '');

  const handleSave = () => {
    updateProfile({
      name: editName,
      university: editUniversity,
      yearOfStudy: editYear,
      bio: editBio
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        <div className="flex flex-col items-center text-center mb-12 relative z-10">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-tr from-blue-600 to-indigo-800 rounded-[2.5rem] rotate-6 flex items-center justify-center shadow-2xl shadow-blue-200">
              <UserIcon className="w-16 h-16 text-white -rotate-6" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-2xl border-4 border-white shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
          </div>

          {isEditing ? (
            <div className="w-full space-y-4">
              <input 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-center text-2xl font-black p-2 border-b-2 border-blue-500 focus:outline-none"
              />
              <div className="flex space-x-4">
                <input 
                  value={editUniversity}
                  onChange={(e) => setEditUniversity(e.target.value)}
                  className="flex-1 text-center p-2 bg-gray-50 rounded-xl text-xs font-bold"
                />
                <select 
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className="w-24 text-center p-2 bg-gray-50 rounded-xl text-xs font-bold"
                >
                  {[1,2,3,4,5,6].map(n => <option key={n} value={String(n)}>{n} Course</option>)}
                </select>
              </div>
              <textarea 
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-[1.5rem] text-xs font-medium min-h-[100px]"
              />
              <div className="flex space-x-3 pt-4">
                <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center">
                   <Save className="w-4 h-4 mr-2" /> {t.profile.save}
                </button>
                <button onClick={() => setIsEditing(false)} className="px-6 bg-gray-100 text-gray-600 py-3 rounded-2xl font-black uppercase tracking-widest text-xs">
                  {t.profile.cancel}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">{user?.name}</h2>
              <p className="text-gray-500 font-bold text-sm mt-2 uppercase tracking-widest opacity-80">
                {user?.yearOfStudy} Year Student • {user?.university}
              </p>
              {user?.bio && (
                <p className="text-xs text-gray-600 mt-4 max-w-sm leading-relaxed font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100 italic">
                  "{user.bio}"
                </p>
              )}
              
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-6 flex items-center text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition"
              >
                <Edit2 className="w-3 h-3 mr-2" />
                {t.profile.edit}
              </button>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="space-y-10 relative z-10">
            <div className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 shadow-inner grid grid-cols-2 gap-8 text-center">
               <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t.profile.recommendedCount}</h3>
                  <div className="text-3xl font-black text-gray-900">0</div>
               </div>
               <div className="border-l border-gray-100">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t.profile.signals}</h3>
                  <div className="text-3xl font-black text-gray-900">0</div>
               </div>
            </div>

            <div className="mt-12 pt-10 border-t border-gray-100 relative z-10">
              <div className="bg-blue-50/70 backdrop-blur p-8 rounded-[2rem] flex items-start border border-blue-100/50">
                <div className="bg-white p-3 rounded-2xl mr-5 shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-blue-900 uppercase tracking-[0.1em]">{t.profile.supportTitle}</p>
                  <p className="text-xs text-blue-700/80 mt-2 leading-relaxed font-bold">
                    {t.profile.supportText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// AuthView component handles login and registration
const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('SMU Semey');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await register({ email, name, university });
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] mb-8 shadow-xl shadow-blue-100 rotate-3">
            <LogIn className="w-8 h-8 text-white -rotate-3" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
            {isLogin ? t.auth.loginTitle : t.auth.registerTitle}
          </h2>
          <p className="text-gray-500 mt-3 text-sm font-bold uppercase tracking-widest opacity-60">
            {isLogin ? t.auth.loginSubtitle : t.auth.registerSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t.auth.fullName}</label>
              <input 
                type="text" 
                required 
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ivan Ivanov"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t.auth.email}</label>
            <div className="relative">
              <input 
                type="email" 
                required 
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.kz"
              />
              <Mail className="absolute right-5 top-4.5 w-4 h-4 text-gray-300" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t.auth.password}</label>
            <div className="relative">
              <input 
                type="password" 
                required 
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Lock className="absolute right-5 top-4.5 w-4 h-4 text-gray-300" />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition transform hover:-translate-y-1 active:scale-95 mt-8 flex items-center justify-center space-x-2"
          >
            <span>{isLogin ? t.auth.loginBtn : t.auth.registerBtn}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-50 text-center relative z-10">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline"
          >
            {isLogin ? t.auth.noAccount : t.auth.hasAccount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <div className="min-h-screen flex flex-col bg-gray-50/30">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<MapView />} />
                <Route path="/auth" element={<AuthView />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <OnboardingView />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfileView />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            
            <footer className="bg-white border-t border-gray-100 py-10 px-4 text-center">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center space-x-3">
                   <ShieldCheck className="w-5 h-5 text-blue-600" />
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                      © 2024 Semey Student Guide
                   </p>
                </div>
                <div className="flex space-x-8">
                   <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition">Map</Link>
                   <Link to="/onboarding" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition">Help</Link>
                </div>
              </div>
            </footer>
          </div>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
