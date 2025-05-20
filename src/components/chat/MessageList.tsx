import React, { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';  

export type Message = {
  id: string;
  content: string;
  sender: { id: string; name: string };
  createdAt: string;
  sentAt?: string;
  deleted?: boolean;
};

interface MessageListProps {
  messages: Message[];
  currentUserId: string | null;
  onDelete?: (messageId: string) => void;
}

const formatDateHeader = (dateISO: string) => {
  const d = new Date(dateISO);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

const MessageList: React.FC<MessageListProps> = ({messages,currentUserId,onDelete,}) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  let lastDate = '';

  return (
    <div
      ref={listRef}
      className="flex flex-col space-y-4 max-h-96 overflow-y-auto px-2"
    >
      {messages.map((msg) => {
        const timestamp = msg.sentAt || msg.createdAt;
        const thisDate = formatDateHeader(timestamp);
        const showHeader = thisDate !== lastDate;
        lastDate = thisDate;
        const isMine = currentUserId === msg.sender.id;

        return (
          <React.Fragment key={msg.id}>
            {showHeader && (
              <div className="text-center text-sm text-gray-500 mt-4 mb-1">
                {thisDate}
              </div>
            )}
            <div
              className={`relative flex items-start space-x-2 ${
                isMine ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isMine && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-sm text-gray-600">
                  {msg.sender.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div
                className={`group max-w-[80%] p-3 rounded-2xl shadow ${
                  isMine
                    ? 'bg-blue-600 text-white self-end'
                    : 'bg-white text-gray-900'
                }`}
              >
                {isMine && !msg.deleted && onDelete && (
                  <button
                    onClick={() => onDelete(msg.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"
                    aria-label="Delete message"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                )}

                {msg.deleted ? (
                  <p className="italic text-gray-500">This message was deleted</p>
                ) : (
                  <>
                    {!isMine && (
                      <p className="text-xs font-semibold">{msg.sender.name}</p>
                    )}
                    <p className="mt-1 break-words">{msg.content}</p>
                  </>
                )}

                <p className="text-[10px] opacity-50 mt-1 text-right">
                  {new Date(timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {isMine && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-sm text-gray-600 ml-2">
                  You
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default MessageList;
