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
  
  const { query: { id } } = useRouter();
  const dispatch = useAppDispatch();
  const { current } = useAppSelector((s) => s.properties);
  const authUser = useAppSelector((s) => s.auth.user);
  const { theme } = useContext(ThemeContext)!;

  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [presence, setPresence] = useState<Record<string, 'online' | 'offline'>>({});
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  useEffect(() => {
    if (typeof id === 'string') {
      dispatch(fetchPropertyById(id)).unwrap().then((prop) => {
        if (Array.isArray(prop.messages)) {
          const normalized = prop.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            sender: { id: msg.sender.id, name: msg.sender.name },
            createdAt: typeof msg.createdAt === 'string' ? msg.createdAt : msg.createdAt?.toISOString() ?? new Date().toISOString(),
            sentAt: msg.sentAt == null ? undefined : typeof msg.sentAt === 'string' ? msg.sentAt : msg.sentAt.toISOString(),
            deleted: msg.deleted ?? false,
            editedAt: msg.editedAt == null ? undefined : typeof msg.editedAt === 'string' ? msg.editedAt : msg.editedAt.toISOString(),
          }));
          setMessages(normalized);
        }
      });
      (socket as any).emit('joinRoom', id);
    }
    return () => {
      if (typeof id === 'string') {
        (socket as any).emit('leaveRoom', id);
        setMessages([]);
        setTypingUsers(new Set());
        setPresence({});
        setEditingMessageId(null);
        setEditText('');
      }
    };
  }, [id, dispatch]);

  useEffect(() => {
    const onNew = (msg: Message) => setMessages((prev) => [...prev, { ...msg, deleted: msg.deleted ?? false }]);
    (socket as any).on('newMessage', onNew);
    return () => { (socket as any).off('newMessage', onNew); };
  }, []);

  useEffect(() => {
    const onDeleted = ({ messageId }: { messageId: string }) =>
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, deleted: true } : m)));
    (socket as any).on('messageDeleted', onDeleted);
    return () => { (socket as any).off('messageDeleted', onDeleted); };
  }, []);

  useEffect(() => {
    const onEdited = (updated: Message) =>
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
    (socket as any).on('messageEdited', onEdited);
    return () => { (socket as any).off('messageEdited', onEdited); };
  }, []);

  useEffect(() => {
    const onTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        isTyping ? next.add(userId) : next.delete(userId);
        return next;
      });
    };
    (socket as any).on('typingStatus', onTyping);
    return () => { (socket as any).off('typingStatus', onTyping); };
  }, []);

  useEffect(() => {
    const onPresence = ({ userId, status }: { userId: string; status: 'online' | 'offline' }) =>
      setPresence((prev) => ({ ...prev, [userId]: status }));
    (socket as any).on('presence', onPresence);
    return () => { (socket as any).off('presence', onPresence); };
  }, []);

  const handleSend = (content: string) => {
    if (!authUser) return toast.error('Login required');
    if (!current?.id || !socket.connected) return toast.error('Chat not ready');
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      { id: tempId, content, sender: { id: authUser.id, name: authUser.name }, createdAt: now, sentAt: now, deleted: false },
    ]);
    (socket as any).emit('sendMessage', { propertyId: current.id, content }, () =>
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    );
  };

  const handleDelete = (messageId: string) => {
    if (!current?.id) return;
    (socket as any).emit('deleteMessage', { propertyId: current.id, messageId }, (res: { success: boolean; error?: string }) => {
      if (!res.success) toast.error(res.error || 'Delete failed');
    });
  };

  const handleEdit = (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    setEditingMessageId(messageId);
    setEditText(msg.content);
  };

  const handleEditChange = (value: string) => {
    setEditText(value);
  };

  const handleEditSave = () => {
    if (!authUser || !current || !editingMessageId) return;
    (socket as any).emit(
      'editMessage',
      { propertyId: current.id, messageId: editingMessageId, newContent: editText },
      (res: { success: boolean; error?: string }) => {
        if (!res.success) toast.error(res.error || 'Edit failed');
        else {
          setEditingMessageId(null);
          setEditText('');
        }
      }
    );
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const otherTyping = Array.from(typingUsers).filter((uid) => uid !== authUser?.id);

  return (
    <UserLayout>
      <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
        <div className="max-w-4xl mx-auto">
          <Link href={`/properties/${current?.id}`} className="text-blue-500 hover:underline">← Back to property</Link>
          <div className="flex items-center my-2">
            <span className={`h-2 w-2 rounded-full mr-2 ${presence[current?.landlord?.id || ''] === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="font-semibold">{current?.landlord?.name}</span>
          </div>
          <div className="border rounded-lg flex flex-col h-[60vh]">
            <MessageList
              messages={messages}
              currentUserId={authUser?.id || null}
              onDelete={handleDelete}
              onEdit={handleEdit}
              editingMessageId={editingMessageId}
              editText={editText}
              onEditChange={handleEditChange}
              onEditSave={handleEditSave}
              onEditCancel={handleEditCancel}
            />
            {otherTyping.length > 0 && <div className="p-2 italic text-gray-500">Someone is typing…</div>}
            <ChatInput propertyId={current?.id ?? ''} onSend={handleSend} disabled={!socket.connected} />
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default PropertyChatPage;
