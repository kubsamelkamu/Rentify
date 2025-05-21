import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Edit2, X, Check } from 'lucide-react';

export type Message = {
  id: string;
  content: string;
  sender: { id: string; name: string };
  createdAt: string;
  sentAt?: string;
  deleted?: boolean;
  editedAt?: string;
};

interface MessageListProps {
  messages: Message[];
  currentUserId: string | null;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  editingMessageId?: string | null;
  editText?: string;
  onEditChange?: (text: string) => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
}

const formatDateHeader = (dateISO: string) => {
  const d = new Date(dateISO);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

const formatTime = (dateISO: string) => {
  const d = new Date(dateISO);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onDelete,
  onEdit,
  editingMessageId,
  editText,
  onEditChange,
  onEditSave,
  onEditCancel,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  let lastDate = '';

  return (
    <div
      ref={listRef}
      className="flex flex-col space-y-4 max-h-96 overflow-y-auto px-2"
    >
      {messages.map((msg) => {
        const original = msg.sentAt || msg.createdAt;
        const displayISO = msg.editedAt ?? original;
        const thisDate = formatDateHeader(displayISO);
        const showHeader = thisDate !== lastDate;
        lastDate = thisDate;
        const isMine = currentUserId === msg.sender.id;
        const isEditing = editingMessageId === msg.id;
        const isMenuOpen = menuOpenFor === msg.id;

        return (
          <React.Fragment key={msg.id}>
            {showHeader && (
              <div className="text-center text-sm text-gray-500 my-2">
                {thisDate}
              </div>
            )}
            <div
              onClick={() =>
                isMine && !msg.deleted && !isEditing
                  ? setMenuOpenFor(isMenuOpen ? null : msg.id)
                  : undefined
              }
              className={`relative flex items-start space-x-2 ${
                isMine ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isMine && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm text-gray-600">
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
                {isMine && !msg.deleted && !isEditing && (
                  <div
                    className={`absolute top-1 right-1 flex space-x-1 transition
                      ${isMenuOpen ? 'opacity-100' : 'opacity-0'}
                      sm:opacity-0 sm:group-hover:opacity-100
                    `}
                  >
                    {onEdit && (
                      <button onClick={() => onEdit(msg.id)} aria-label="Edit">
                        <Edit2 className="h-4 w-4 text-yellow-400" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(msg.id)} aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    )}
                  </div>
                )}
                {msg.deleted ? (
                  <p className="italic text-gray-500">This message was deleted</p>
                ) : isEditing ? (
                  <div>
                    <input
                      value={editText}
                      onChange={(e) => onEditChange?.(e.target.value)}
                      className="w-full rounded p-1 text-black"
                    />
                    <div className="flex justify-end space-x-1 mt-1">
                      <button onClick={onEditCancel} aria-label="Cancel">
                        <X className="h-4 w-4" />
                      </button>
                      <button onClick={onEditSave} aria-label="Save">
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {!isMine && (
                      <p className="text-xs font-semibold">{msg.sender.name}</p>
                    )}
                    <p className="mt-1 break-words">{msg.content}</p>
                  </>
                )}

                <div className="flex justify-between items-center mt-1">
                  <p className="text-[10px] opacity-50">
                    {formatTime(displayISO)}
                  </p>
                  {msg.editedAt && (
                    <p className="text-[10px] italic opacity-50">edited</p>
                  )}
                </div>
              </div>

              {isMine && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm text-gray-600 ml-2">
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
