
import React from 'react';
import { 
  Calculator, 
  FlaskConical, 
  Atom, 
  Dna, 
  Globe2, 
  History, 
  BookOpen, 
  Languages as LanguagesIcon
} from 'lucide-react';
import { Subject, Language } from './types';

export const LANGUAGES: Language[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', flag: '🇸🇦' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', direction: 'ltr', flag: '🇸🇴' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', flag: '🇫🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', flag: '🇷🇺' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', flag: '🇹🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', flag: '🇪🇸' },
];

export const TRANSLATIONS: Record<string, any> = {
  ar: {
    appName: "أكاديمية الذكاء",
    welcome: "أهلاً بك في أكاديمية الذكاء! 🚀",
    description: "أنا مساعدك التعليمي الذكي. يمكنني شرح أي مادة، حل المسائل المعقدة، ومساعدتك في المذاكرة.",
    inputPlaceholder: "اطرح سؤالك هنا...",
    subjects: "المواد الدراسية",
    general: "عام / استكشاف",
    saved: "المحفوظات",
    chat: "المحادثة",
    saveLesson: "حفظ للمراجعة",
    nightMode: "الوضع الليلي",
    dayMode: "الوضع النهاري",
    math: "الرياضيات",
    chemistry: "الكيمياء",
    physics: "الفيزياء",
    biology: "الأحياء",
    geography: "الجغرافيا",
    history: "التاريخ",
    arabic: "اللغة العربية",
    languages: "اللغات الأجنبية"
  },
  so: {
    appName: "Akadeemiyada AI",
    welcome: "Ku soo dhawaada Akadeemiyada AI! 🚀",
    description: "Waxaan ahay kaaliyahaaga waxbarasho ee caqliga badan. Waxaan sharxi karaa maaddo kasta oo aan kaa caawin karaa waxbarashadaada.",
    inputPlaceholder: "Halkan ku weydii su'aashaada...",
    subjects: "Maaddooyinka",
    general: "Guud / Baadhitaan",
    saved: "Kaydka",
    chat: "Wadahadal",
    saveLesson: "Kaydi casharka",
    nightMode: "Habka habeenka",
    dayMode: "Habka maalinta",
    math: "Xisaab",
    chemistry: "Kimisteri",
    physics: "Fiisigis",
    biology: "Bayoolaji",
    geography: "Juqraafi",
    history: "Taariikh",
    arabic: "Af-Carabi",
    languages: "Luuqadaha"
  },
  fr: {
    appName: "Académie IA",
    welcome: "Bienvenue à l'Académie IA ! 🚀",
    description: "Je suis votre assistant pédagogique intelligent. Je peux expliquer n'importe quel sujet et vous aider dans vos études.",
    inputPlaceholder: "Posez votre question ici...",
    subjects: "Matières",
    general: "Général / Exploration",
    saved: "Enregistré",
    chat: "Chat",
    saveLesson: "Enregistrer la leçon",
    nightMode: "Mode nuit",
    dayMode: "Mode jour",
    math: "Mathématiques",
    chemistry: "Chimie",
    physics: "Physique",
    biology: "Biologie",
    geography: "Géographie",
    history: "Histoire",
    arabic: "Langue Arabe",
    languages: "Langues"
  },
  ru: {
    appName: "Академия ИИ",
    welcome: "Добро пожаловать в Академию ИИ! 🚀",
    description: "Я ваш интеллектуальный помощник в обучении. Я могу объяснить любой предмет и помочь вам в учебе.",
    inputPlaceholder: "Задайте свой вопрос здесь...",
    subjects: "Предметы",
    general: "Общее / Исследование",
    saved: "Сохраненное",
    chat: "Чат",
    saveLesson: "Сохранить урок",
    nightMode: "Ночной режим",
    dayMode: "Дневной режим",
    math: "Математика",
    chemistry: "Химия",
    physics: "Физика",
    biology: "Биология",
    geography: "География",
    history: "История",
    arabic: "Арабский язык",
    languages: "Языки"
  },
  tr: {
    appName: "Yapay Zeka Akademisi",
    welcome: "Yapay Zeka Akademisi'ne Hoş Geldiniz! 🚀",
    description: "Ben sizin akıllı eğitim asistanınızım. Herhangi bir konuyu açıklayabilir ve çalışmalarınızda size yardımcı olabilirim.",
    inputPlaceholder: "Sorunuzu buraya yazın...",
    subjects: "Dersler",
    general: "Genel / Keşfet",
    saved: "Kaydedilenler",
    chat: "Sohbet",
    saveLesson: "Dersi kaydet",
    nightMode: "Gece modu",
    dayMode: "Gündüz modu",
    math: "Matematik",
    chemistry: "Kimya",
    physics: "Fizik",
    biology: "Biyoloji",
    geography: "Coğrafya",
    history: "Tarih",
    arabic: "Arapça",
    languages: "Diller"
  },
  es: {
    appName: "Academia IA",
    welcome: "¡Bienvenido a la Academia IA! 🚀",
    description: "Soy tu asistente educativo inteligente. Puedo explicar cualquier tema y ayudarte en tus estudios.",
    inputPlaceholder: "Haz tu pregunta aquí...",
    subjects: "Materias",
    general: "General / Exploración",
    saved: "Guardado",
    chat: "Chat",
    saveLesson: "Guardar lección",
    nightMode: "Modo noche",
    dayMode: "Modo día",
    math: "Matemáticas",
    chemistry: "Química",
    physics: "Física",
    biology: "Biología",
    geography: "Geografía",
    history: "Historia",
    arabic: "Lengua Árabe",
    languages: "Idiomas"
  }
};

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'math', icon: 'Calculator', color: 'bg-blue-500', description: '' },
  { id: 'chemistry', name: 'chemistry', icon: 'FlaskConical', color: 'bg-emerald-500', description: '' },
  { id: 'physics', name: 'physics', icon: 'Atom', color: 'bg-indigo-500', description: '' },
  { id: 'biology', name: 'biology', icon: 'Dna', color: 'bg-rose-500', description: '' },
  { id: 'geography', name: 'geography', icon: 'Globe2', color: 'bg-cyan-500', description: '' },
  { id: 'history', name: 'history', icon: 'History', color: 'bg-amber-500', description: '' },
  { id: 'literature', name: 'arabic', icon: 'BookOpen', color: 'bg-violet-500', description: '' },
  { id: 'languages', name: 'languages', icon: 'LanguagesIcon', color: 'bg-orange-500', description: '' }
];

export const getIcon = (iconName: string, className?: string) => {
  const props = { className: className || "w-6 h-6" };
  switch (iconName) {
    case 'Calculator': return <Calculator {...props} />;
    case 'FlaskConical': return <FlaskConical {...props} />;
    case 'Atom': return <Atom {...props} />;
    case 'Dna': return <Dna {...props} />;
    case 'Globe2': return <Globe2 {...props} />;
    case 'History': return <History {...props} />;
    case 'BookOpen': return <BookOpen {...props} />;
    case 'LanguagesIcon': return <LanguagesIcon {...props} />;
    default: return <BookOpen {...props} />;
  }
};
