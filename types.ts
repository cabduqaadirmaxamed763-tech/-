
export type Language = {
  code: string;
  name: string;
  nativeName: string;
  direction: 'rtl' | 'ltr';
  flag: string;
};

export type Subject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  subjectId?: string;
  timestamp: number;
  image?: string;
  audio?: string;
};

export type SavedLesson = {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  date: number;
};

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
}
