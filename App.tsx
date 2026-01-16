
import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  SendHorizontal, 
  Mic, 
  Square,
  Image as ImageIcon, 
  Moon, 
  Sun, 
  Search, 
  Bookmark, 
  Cpu,
  GraduationCap,
  Trash2,
  Loader2,
  PlusCircle,
  MessageSquarePlus,
  AlertCircle
} from 'lucide-react';
import { SUBJECTS, getIcon, LANGUAGES, TRANSLATIONS } from './constants';
import { Subject, Message, SavedLesson, Language } from './types';
import { gemini } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'saved'>('chat');
  const [currentLang, setCurrentLang] = useState<Language>(LANGUAGES[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const t = TRANSLATIONS[currentLang.code] || TRANSLATIONS.ar;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.dir = currentLang.direction;
    document.documentElement.lang = currentLang.code;
  }, [currentLang]);

  const startRecording = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setErrorMessage(currentLang.code === 'ar' ? "يرجى السماح بالوصول للميكروفون" : "Please allow microphone access");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !imagePreview && !audioBase64) return;

    setErrorMessage(null);
    const currentText = inputText;
    const currentImage = imagePreview;
    const currentAudio = audioBase64;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentText,
      subjectId: selectedSubject?.id,
      timestamp: Date.now(),
      image: currentImage || undefined,
      audio: currentAudio || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setImagePreview(null);
    setAudioBase64(null);
    setIsLoading(true);

    try {
      const subjectName = selectedSubject ? t[selectedSubject.name] : t.general;
      const prompt = currentText || (currentAudio ? "اشرح محتوى هذا التسجيل" : "حلل هذه الصورة");
      
      let fullResponse = "";
      const assistantMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      }]);

      const stream = gemini.streamEducationalResponse(
        prompt, 
        subjectName, 
        currentImage || undefined,
        currentAudio || undefined,
        currentLang.name
      );

      let hasChunk = false;
      for await (const chunk of stream) {
        if (chunk) {
          hasChunk = true;
          fullResponse += chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId ? { ...msg, content: fullResponse } : msg
          ));
        }
      }

      if (!hasChunk) {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(currentLang.code === 'ar' ? "حدث خطأ في استلام الرد. تأكد من اتصالك بالإنترنت." : "Error receiving response. Check internet.");
      setMessages(prev => prev.filter(m => m.id !== (Date.now() + 1).toString()));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fix: Added missing saveToLessons function
  const saveToLessons = (msg: Message) => {
    if (!msg.content) return;
    const newLesson: SavedLesson = {
      id: Date.now().toString(),
      title: msg.content.split('\n')[0].substring(0, 40) + (msg.content.length > 40 ? '...' : ''),
      content: msg.content,
      subjectId: msg.subjectId || (selectedSubject?.id || 'general'),
      date: Date.now(),
    };
    setSavedLessons(prev => [newLesson, ...prev]);
    setActiveTab('saved');
  };

  const clearChat = () => {
    if (confirm(currentLang.code === 'ar' ? 'هل تريد مسح المحادثة؟' : 'Clear chat?')) {
      setMessages([]);
      setErrorMessage(null);
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark text-white bg-slate-900' : 'text-slate-900 bg-slate-50'}`}>
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white dark:bg-slate-800 border-x border-slate-200 dark:border-slate-700 flex flex-col z-40 relative overflow-hidden`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl truncate">{t.appName}</h1>
          </div>
          <button onClick={clearChat} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="مسح">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-4 py-2 uppercase tracking-wider">
            {t.subjects}
          </div>
          <button onClick={() => setSelectedSubject(null)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!selectedSubject ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}>
            <PlusCircle className="w-4 h-4" />
            <span>{t.general}</span>
          </button>
          {SUBJECTS.map((subject) => (
            <button key={subject.id} onClick={() => setSelectedSubject(subject)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedSubject?.id === subject.id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 font-bold border-r-4 border-indigo-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}>
              <div className={`p-1.5 rounded-lg text-white ${subject.color}`}>
                {getIcon(subject.icon, "w-4 h-4")}
              </div>
              <span className="truncate">{t[subject.name]}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
          <select value={currentLang.code} onChange={(e) => setCurrentLang(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
            {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.flag} {lang.nativeName}</option>)}
          </select>
          <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{darkMode ? t.dayMode : t.nightMode}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 relative min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 sticky top-0 z-30">
          <div className="flex items-center gap-4 truncate">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 flex-shrink-0">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg truncate text-indigo-600 dark:text-indigo-400">
              {selectedSubject ? t[selectedSubject.name] : t.appName}
            </span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setActiveTab('chat')} className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-500 bg-white dark:bg-slate-700 hover:bg-slate-100'}`}>{t.chat}</button>
            <button onClick={() => setActiveTab('saved')} className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm ${activeTab === 'saved' ? 'bg-indigo-600 text-white' : 'text-slate-500 bg-white dark:bg-slate-700 hover:bg-slate-100'}`}>{t.saved}</button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {activeTab === 'chat' ? (
            <>
              {messages.length === 0 && (
                <div className="max-w-3xl mx-auto py-12 text-center">
                  <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <GraduationCap className="w-12 h-12 text-indigo-600" />
                  </div>
                  <h2 className="text-3xl font-extrabold mb-4 text-slate-900 dark:text-white leading-tight">{t.welcome}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto font-medium">{t.description}</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} group animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[90%] sm:max-w-2xl flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 ${msg.role === 'user' ? 'bg-white dark:bg-slate-700' : 'bg-indigo-600 text-white'}`}>
                      {msg.role === 'user' ? <div className="font-bold text-xs">أنت</div> : <Cpu className="w-6 h-6" />}
                    </div>
                    <div className="space-y-2 overflow-hidden">
                      <div className={`p-5 rounded-2xl shadow-md overflow-hidden border ${msg.role === 'user' ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/30'}`}>
                        {msg.image && <img src={msg.image} className="mb-4 rounded-xl max-w-full h-auto border-2 dark:border-slate-600 shadow-sm" alt="مرفق" />}
                        {msg.audio && (
                          <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl mb-4 border dark:border-slate-600 shadow-inner">
                            <audio controls src={msg.audio} className="w-full h-10" />
                          </div>
                        )}
                        <div className="markdown-content whitespace-pre-wrap dark:text-slate-100 text-slate-900 font-bold text-lg leading-relaxed break-words">
                          {msg.content || (msg.audio ? (currentLang.code === 'ar' ? "تم إرسال تسجيل صوتي" : "Audio sent") : "")}
                        </div>
                      </div>
                      {msg.role === 'assistant' && (
                        <div className="flex gap-2 opacity-100 group-hover:opacity-100 transition-opacity px-2">
                          <button onClick={() => saveToLessons(msg)} className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-extrabold bg-white dark:bg-slate-800 px-3 py-1 rounded-full border shadow-sm">
                            <Bookmark className="w-3 h-3" /> {t.saveLesson}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-end animate-pulse">
                  <div className="bg-indigo-600 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg border border-indigo-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-extrabold">
                      {currentLang.code === 'ar' ? 'أقوم بتحضير الإجابة...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              )}
              {errorMessage && (
                <div className="flex justify-center animate-bounce">
                  <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 p-3 rounded-xl border border-rose-200 flex items-center gap-2 text-sm font-bold">
                    <AlertCircle className="w-4 h-4" />
                    {errorMessage}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </>
          ) : (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedLessons.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-400 font-extrabold bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <MessageSquarePlus className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  {currentLang.code === 'ar' ? 'لا توجد دروس محفوظة، ابدأ بالدراسة الآن!' : 'No saved lessons yet'}
                </div>
              ) : (
                savedLessons.map(lesson => (
                  <div key={lesson.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1">
                    <h3 className="font-bold text-xl mb-4 dark:text-white border-b-2 pb-3 border-indigo-50 dark:border-slate-700 text-indigo-600">{lesson.title}</h3>
                    <div className="text-sm text-slate-700 dark:text-slate-300 line-clamp-6 markdown-content font-medium leading-relaxed">
                      {lesson.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Input Bar - FIXED DESIGN FOR ABSOLUTE VISIBILITY */}
        <div className="p-4 sm:p-8 bg-white dark:bg-slate-800 border-t-2 border-slate-100 dark:border-slate-700 sticky bottom-0 z-40 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto">
            {/* Attachment Previews */}
            <div className="flex gap-3 mb-4 flex-wrap">
              {imagePreview && (
                <div className="relative group animate-in zoom-in duration-300">
                  <img src={imagePreview} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-indigo-600 shadow-2xl" alt="معاينة" />
                  <button type="button" onClick={() => setImagePreview(null)} className="absolute -top-3 -right-3 bg-rose-600 text-white rounded-full p-2 shadow-xl hover:bg-rose-700 transform hover:scale-110 transition-all"><X className="w-4 h-4" /></button>
                </div>
              )}
              {audioBase64 && (
                <div className="relative flex items-center bg-indigo-600 text-white px-6 py-3 rounded-2xl gap-4 shadow-xl animate-in slide-in-from-right duration-300 border-2 border-indigo-400">
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-black">{currentLang.code === 'ar' ? 'رسالة صوتية جاهزة' : 'Audio Ready'}</span>
                  <button type="button" onClick={() => setAudioBase64(null)} className="hover:text-rose-300 p-1"><Trash2 className="w-5 h-5" /></button>
                </div>
              )}
            </div>

            <div className="relative flex items-center gap-4">
              <div className="relative flex-1 group shadow-2xl rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 focus-within:border-indigo-600 transition-all">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  className={`main-input w-full py-5 sm:py-7 text-xl sm:text-2xl font-bold placeholder:text-slate-300 placeholder:font-medium focus:outline-none transition-all ${
                    currentLang.direction === 'rtl' ? 'pl-36 sm:pl-40 pr-6 sm:pr-8' : 'pr-36 sm:pr-40 pl-6 sm:pl-8'
                  }`}
                />
                
                {/* Overlay Buttons */}
                <div className={`absolute ${currentLang.direction === 'rtl' ? 'left-3 sm:left-4' : 'right-3 sm:right-4'} top-1/2 -translate-y-1/2 flex items-center gap-2`}>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="action-button p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all" title="إرفاق صورة">
                    <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  
                  {isRecording ? (
                    <button type="button" onClick={stopRecording} className="action-button p-3 bg-rose-600 text-white rounded-2xl recording-pulse shadow-lg" title="إيقاف التسجيل">
                      <Square className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
                    </button>
                  ) : (
                    <button type="button" onClick={startRecording} className="action-button p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all" title="تسجيل صوتي">
                      <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
                    </button>
                  )}
                </div>
              </div>

              {/* الصاروخ - أيقونة الإرسال */}
              <button 
                type="submit" 
                disabled={isLoading || (!inputText.trim() && !imagePreview && !audioBase64)} 
                className={`action-button bg-indigo-600 text-white p-5 sm:p-7 rounded-3xl hover:bg-indigo-700 shadow-2xl disabled:opacity-20 disabled:grayscale transition-all flex items-center justify-center transform hover:rotate-6 ${
                  currentLang.direction === 'rtl' ? 'rotate-180 hover:rotate-[186deg]' : ''
                }`}
                title="إرسال"
              >
                <SendHorizontal className="w-8 h-8 sm:w-9 sm:h-9" />
              </button>
            </div>
            
            <p className="text-[10px] text-center mt-4 text-slate-400 font-black uppercase tracking-[0.2em] opacity-50">
              أكاديمية الذكاء • Gemini Smart Learning
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default App;
