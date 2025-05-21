import React, {useState,useEffect,useRef,useCallback,ChangeEvent,KeyboardEvent,} from 'react';
import { useAppSelector } from '@/store/hooks';
import socket from '@/utils/socket';
import type { ClientToServerEvents } from '@/utils/socket';

export interface ChatInputProps {
  propertyId: string;
  onSend: (content: string) => void;
  disabled: boolean;
}

const TYPING_DEBOUNCE = 500;

const ChatInput: React.FC<ChatInputProps> = ({
  propertyId,
  onSend,
  disabled,
}) => {
  const [input, setInput] = useState('');
  const authUser = useAppSelector((s) => s.auth.user);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket.connected || !authUser) return;
      socket.emit('typing', {
        propertyId,
        userId: authUser.id,
        isTyping,
      } as Parameters<ClientToServerEvents['typing']>[0]);
    },
    [propertyId, authUser]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (!socket.connected || !authUser) return;
    emitTyping(true);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(false), TYPING_DEBOUNCE);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');

    if (!socket.connected || !authUser) return;
    emitTyping(false);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
  };

  useEffect(() => {
    return () => {
      if (!socket.connected || !authUser) return;
      emitTyping(false);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [emitTyping, authUser]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t px-4 py-2 flex items-center space-x-2">
      <input
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? 'Connecting…' : 'Type a message…'}
        className="flex-1 px-3 py-2 border rounded focus:outline-none disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;
