import { useState, useRef, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import Fuse from 'fuse.js';
import faqs from '@/components/data/faq.json';

const fuse = new Fuse(faqs, {
  keys: ['questionKeywords'],
  threshold: 0.35,
  includeScore: true,
});

export default function FaqChatWidget({
  onClose,
  messages,
  setMessages,
}: {
  onClose: () => void;
  messages: { from: 'user' | 'bot'; text: string; time: string }[];
  setMessages: (msgs: { from: 'user' | 'bot'; text: string; time: string }[]) => void;
}) {

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages, typing]);

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const fallbackReplies = [
    "Sorry, I didn't quite catch that. Could you rephrase?",
    "I'm not sure about that — can I help you with something else?",
    "Hmm, I'm still learning — try asking me another question about Rentify.",
    "I don't have that info yet, but I'm here to help with property searches and bookings!"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userText = input.trim();
    if (!userText) return;

    const newMsgs = [
      ...messages,
      { from: 'user' as const, text: userText, time: getCurrentTime() },
    ];
    setMessages(newMsgs);
    setInput('');
    setTyping(true);

    const results = fuse.search(userText);
    const botReply =
      results.length > 0
        ? results[0].item.answer
        : fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];

    setTimeout(() => {
      setMessages([
        ...newMsgs,
        { from: 'bot' as const, text: botReply, time: getCurrentTime() },
      ]);
      setTyping(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-20 sm:right-4 w-80 h-96 sm:w-80 sm:h-96 bg-white dark:bg-gray-800 shadow-lg rounded-lg flex flex-col overflow-hidden z-50 border border-gray-300
                  sm:rounded-lg
                  max-sm:top-0 max-sm:left-0 max-sm:w-full max-sm:h-full max-sm:rounded-none">
      <div className="bg-blue-600 text-white font-semibold p-3 text-sm flex justify-between items-center">
        <span>💬 Rentify Assistant</span>
        <button onClick={onClose} className="text-white font-bold">×</button>
      </div>

      <div className="flex-1 p-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`my-1 text-sm ${m.from === 'user' ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center gap-1">
              {m.from === 'bot' && <span>💬</span>}
              <span
                className={`inline-block p-2 rounded max-w-[80%] ${
                  m.from === 'user' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                {m.text}
              </span>
              {m.from === 'user' && (
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-semibold">
                  {userInitial}
                </span>
              )}
            </div>
            <div className={`text-xs mt-1 ${m.from === 'user' ? 'text-right' : 'text-left'} text-gray-500`}>
              {m.time}
            </div>
          </div>
        ))}

        {typing && (
          <div className="my-1 text-sm text-left">
            <span className="inline-block p-2 rounded bg-gray-200 dark:bg-gray-600 animate-pulse">
              Assistant is typing…
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-2 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything…"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}