import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import socket from '@/utils/socket';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPropertyById } from '@/store/slices/propertySlice';
import UserLayout from '@/components/userLayout/Layout';
import MessageList, { Message } from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';
import { ThemeContext } from '@/components/context/ThemeContext';

const PropertyChatPage: React.FC = () => {

  const router = useRouter();
  const { id } = router.query;
  const dispatch = useAppDispatch();
  const { current } = useAppSelector((s) => s.properties);
  const authUser = useAppSelector((s) => s.auth.user);
 
  const { theme } = useContext(ThemeContext)!;

  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [presence, setPresence] = useState<Record<string, 'online' | 'offline'>>({});

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchPropertyById(id))
        .unwrap()
        .then((prop) => {
          if (Array.isArray(prop.messages)) {
            const normalized = prop.messages.map((msg: any) => ({
              id: msg.id,
              content: msg.content,
              sender: { id: msg.sender.id, name: msg.sender.name },
              createdAt:
                typeof msg.createdAt === 'string'
                  ? msg.createdAt
                  : msg.createdAt
                  ? msg.createdAt.toISOString()
                  : new Date().toISOString(),
              sentAt:
                msg.sentAt
                  ? typeof msg.sentAt === 'string'
                    ? msg.sentAt
                    : msg.sentAt.toISOString()
                  : undefined,
            }));
            setMessages(normalized);
          }
        });
      (socket as any).emit('joinRoom', id);
    }
    return () => {
      if (id && typeof id === 'string') {
        (socket as any).emit('leaveRoom', id);
        setMessages([]);
        setTypingUsers(new Set());
        setPresence({});
      }
    };
  }, [id, dispatch]);

  useEffect(() => {
    const handleNew = (msg: Message) => setMessages((prev) => [...prev, msg]);
    (socket as any).on('newMessage', handleNew);
    return () => { (socket as any).off('newMessage', handleNew); };
  }, []);

  useEffect(() => {
    const handleTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (isTyping) next.add(userId);
        else next.delete(userId);
        return next;
      });
    };
    (socket as any).on('typingStatus', handleTyping);
    return () => { (socket as any).off('typingStatus', handleTyping); };
  }, []);

  useEffect(() => {
    const handlePresence = ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
      setPresence((prev) => ({ ...prev, [userId]: status }));
    };
    (socket as any).on('presence', handlePresence);
    return () => { (socket as any).off('presence', handlePresence); };
  }, []);

  const handleSend = (content: string) => {
    if (!authUser) {
      toast.error('You must be logged in to send messages.');
      return;
    }
    if (!current?.id) return;
    if (!socket.connected) {
      toast.error('Chat connection not ready. Please wait.');
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const tempMsg: Message = { id: tempId, content, sender: { id: authUser.id, name: authUser.name }, createdAt };
    setMessages((prev) => [...prev, tempMsg]);

    (socket as any).emit(
      'sendMessage',
      { propertyId: current.id, content },
      (serverMsg: Message) => {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    );
  };

  if (!current) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading chat...</p>
        </div>
      </UserLayout>
    );
  }

  const otherUsersTyping = Array.from(typingUsers).filter((uid) => uid !== authUser?.id);

  return (
    <UserLayout>
      <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
        <div className="max-w-4xl mx-auto">
          <Link href={`/properties/${current.id}`} className="text-blue-500 hover:underline mb-4 inline-block">
             ← Back to Property
          </Link>

          <div className="flex items-center mb-2">
            <span
              className={`h-2 w-2 rounded-full mr-2 ${
                presence[current.landlord?.id || ''] === 'online'
                  ? 'bg-green-500'
                  : 'bg-gray-400'
              }`}
            />
            <span className="font-semibold">{current.landlord?.name}</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">Conversation</h1>

          <div className="border rounded-lg overflow-hidden flex flex-col h-[60vh]">
            <MessageList messages={messages} currentUserId={authUser?.id || null} />

            {otherUsersTyping.length > 0 && (
              <div className="px-4 py-1 text-sm text-gray-500 italic">
                Someone is typing…
              </div>
            )}

            <ChatInput propertyId={current.id} onSend={handleSend} disabled={!socket.connected} />
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default PropertyChatPage;  
