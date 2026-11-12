import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Bot, 
  User, 
  Lightbulb, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface AiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  image?: string;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  currentLessonTitle?: string;
  currentSubjectName?: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  initialTopic = '',
  currentLessonTitle,
  currentSubjectName,
}) => {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `أهلاً بك يا باشمهندس في **مساعد الميكاترونكس الذكي**! 🎓\n\nأنا أستاذك ومرشدك الأكاديمي لمواد السنة الأولى (فيزياء، دوائر كهربائية، رياضيات، برمجة). فلسفتنا: **"لا تحفظ القانون، افهمه."**\n\nاسألني عن أي قانون، أو اطلب حل مسألة خطوة بخطوة، أو ارفع صورة مسألة من كتابك أو واجبك!`,
      timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTopic) {
      setInputMessage(initialTopic);
    }
  }, [initialTopic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() && !selectedImage) return;

    const userMsg: AiMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
      image: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    const imagePayload = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          imageBase64: imagePayload,
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          currentLessonTitle,
          currentSubjectName,
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'عذرًا، حدث خطأ أثناء إعداد الإجابة. يرجى إعادة المحاولة.';

      const assistantMsg: AiMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'assistant',
          text: 'عذرًا يا مهندس، حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
          timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl h-[88vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg">
                  مساعد الميكاترونكس الذكي
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-900 text-[10px] font-black">
                  متصل
                </span>
              </div>
              <p className="text-xs text-blue-100">
                مرشدك الأكاديمي لمواد السنة الأولى بالجامعات اليمنية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages(messages.slice(0, 1))}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="بدء محادثة جديدة"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-400 shrink-0 flex items-center gap-1 font-bold">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>مقترحات سريعة:</span>
          </span>
          {[
            'اشرح لي قانون أوم بطريقة سهلة',
            'حل مسألة مقاومة وتيار خطوة بخطوة',
            'ما الفرق بين التوالي والتوازي؟',
            'كيف أتحقق من تجانس أبعاد أي قانون؟',
            'اشرح لي قانون نيوتن الثاني F=m*a',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(prompt)}
              className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                    isUser ? 'bg-blue-600' : 'bg-gradient-to-tr from-indigo-600 to-cyan-500'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m.image && (
                    <img
                      src={m.image}
                      alt="صورة السؤال"
                      className="max-h-48 rounded-lg object-contain border border-white/20 mb-2"
                    />
                  )}
                  <div className="whitespace-pre-wrap font-sans">
                    {m.text}
                  </div>
                  <div
                    className={`text-[10px] ${
                      isUser ? 'text-blue-200 text-left' : 'text-slate-400 text-right'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>مساعد الميكاترونكس يفكر ويحلل المسألة خطوة بخطوة...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Uploaded Image Preview */}
        {selectedImage && (
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-10 h-10 object-cover rounded-lg border border-slate-300 dark:border-slate-600"
              />
              <span>تم إرفاق صورة المسألة (سيقوم المساعد بقراءتها وحلها)</span>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-1 rounded-full text-slate-400 hover:text-rose-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="إرفاق صورة مسألة أو صفحة من كتاب"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="اكتب سؤالك أو مسألتك هنا وسأشرحها لك خطوة بخطوة..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
              className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
