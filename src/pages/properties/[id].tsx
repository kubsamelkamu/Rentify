import React, { useEffect, useContext, useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import toast from 'react-hot-toast';
import socket from '@/utils/socket';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {fetchPropertyById,deleteProperty,} from '@/store/slices/propertySlice';
import UserLayout from '@/components/userLayout/Layout';
import { ThemeContext } from '@/components/context/ThemeContext';

function formatDateHeader(dateISO: string) {
  const d = new Date(dateISO);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
}

type Message = {
  id: string;
  content: string;
  sender: { id: string; name: string };
  createdAt: string;
  sentAt?: string;
};

const PropertyDetailPage: React.FC = () => {

  const router = useRouter();
  const { id } = router.query;
  const dispatch = useAppDispatch();
  const { current, loading, error } = useAppSelector((s) => s.properties);
  const authUser = useAppSelector((s) => s.auth.user);
  const themeContext = useContext(ThemeContext);
  if (!themeContext) throw new Error('Must be within ThemeProvider');
  const { theme } = themeContext;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchPropertyById(id))
        .unwrap()
        .then((prop) => {
          if (Array.isArray(prop.messages)) {
            setMessages(
              prop.messages.map((msg: any) => ({
                ...msg,
                createdAt:
                  typeof msg.createdAt === 'string'
                    ? msg.createdAt
                    : msg.createdAt?.toISOString?.() ?? '',
                sentAt: msg.sentAt
                  ? typeof msg.sentAt === 'string'
                    ? msg.sentAt
                    : msg.sentAt?.toISOString?.() ?? ''
                  : undefined,
              }))
            );
          }
        });
      socket.emit('joinRoom', id);
    }

    return () => {
      if (id && typeof id === 'string') {
        socket.emit('leaveRoom', id);
        setMessages([]);
      }
    };
  }, [id, dispatch]);

  useEffect(() => {
    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, []);

  const canModify = authUser && current && authUser.id === current.landlord?.id;

  const handleDelete = async () => {
    if (!current?.id) return;
    const promise = dispatch(deleteProperty(current.id)).unwrap();
    toast.promise(promise, {
      loading: 'Deleting property...',
      success: 'Deleted!',
      error: 'Delete failed.',
    });
    try {
      await promise;
      router.push('/properties');
    } catch {}
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !current?.id) return;
    if (!authUser) {
      toast.error('You must be logged in to send messages.');
      return;
    }

    if (!socket.connected) {
      toast.error('Chat connection not ready. Please wait.');
      return;
    }

    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const tempMsg: Message = {
      id: tempId,
      content: newMsg.trim(),
      sender: { id: authUser.id, name: authUser.name },
      createdAt,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMsg('');

    socket.emit(
      'sendMessage',
      { propertyId: current.id, content: tempMsg.content },
      (serverMsg: Message) => {
        setSending(false);
        setMessages((prev) =>
          prev.filter((m) => m.id !== tempId)
        );
      }
    );
  };

  return (
    <UserLayout>
      <div
        className={`min-h-screen p-6 ${
          theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
        }`}
      >
        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-t-4 ${
                theme === 'dark' ? 'border-blue-400' : 'border-blue-500'
              }`}
            />
          </div>
        )}
        {error && (
          <p className={`text-center ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
            {error}
          </p>
        )}
        {!loading && current && (
          <>
            <div
              className={`max-w-4xl mx-auto rounded-2xl shadow-lg overflow-hidden ${
                theme === 'dark' ? 'bg-gray-800 shadow-gray-800/50' : 'bg-white'
              }`}
            >
              {current.images?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {current.images.slice(0, 2).map((img) => (
                    <div key={img.id} className="relative h-64 w-full">
                      <Image src={img.url} alt={img.fileName} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`h-64 w-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  No Images Available
                </div>
              )}
              <div className="p-8 relative">
                {canModify && (
                  <div className="absolute top-6 right-6 flex space-x-2">
                    <button
                      onClick={() => router.push(`/properties/${current.id}/edit`)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
                <h1 className="text-4xl font-bold mb-2">{current.title}</h1>
                <p className="mb-4">{current.city}</p>
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-2xl font-extrabold">${current.rentPerMonth}/mo</span>
                  <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    {current.propertyType}
                  </span>
                </div>
                <p className="prose mb-6">{current.description}</p>
              </div>
            </div>
            
            <div className="mt-8 max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">Messages</h3>
              <div className="flex flex-col space-y-4 mb-6 max-h-64 overflow-y-auto">
                {(() => {
                  let lastDate = '';
                  return messages.map((msg) => {
                    const timestamp = msg.sentAt || msg.createdAt;
                    const thisDate = formatDateHeader(timestamp);
                    const showHeader = thisDate !== lastDate;
                    lastDate = thisDate;
                    return (
                      <React.Fragment key={msg.id}>
                        {showHeader && (
                          <div className="text-center text-sm text-gray-500 my-2">
                            {thisDate}
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-lg max-w-[80%] ${
                            authUser && msg.sender.id === authUser.id
                              ? 'self-end bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm font-medium">{msg.sender.name}</p>
                          <p className="mt-1">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(timestamp).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()}
              </div>

              <form onSubmit={handleSend} className="flex space-x-2">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 border rounded-lg px-3 py-2"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMsg.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {sending ? 'Sending…' : 'Send'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default PropertyDetailPage;
