import { useState, useEffect } from 'react';
import FaqChatWidget from './FaqChatWidget';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { MessageSquare } from 'lucide-react';

export default function ChatLauncher() {

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { from: 'user' | 'bot'; text: string; time: string }[]
  >([]);

  const token = useAppSelector((state: RootState) => state.auth.token);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const storageKey = user?.email ? `rentify-chat-history-${user.email}` : null;

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      setMessages(saved ? JSON.parse(saved) : []);
    } else {
      setMessages([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  if (!token) return null;

  const openChat = () => {
    setOpen(true);
    if (messages.length === 0 && user) {
      const greeting = {
        from: 'bot' as const,
        text: `Hi ${user.name || 'there'}! I'm your Rentify Assistant — how can I help you today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([greeting]);
    }
  };

  return (
    <>
      {open && (
        <FaqChatWidget
          onClose={() => setOpen(false)}
          messages={messages}
          setMessages={setMessages}
        />
      )}
      <button
        onClick={openChat}
        className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-200 z-40"
        aria-label="Open chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </>
  );
}