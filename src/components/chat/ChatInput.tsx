import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';
import socket from '@/utils/socket';

export interface ChatInputProps {
  propertyId: string;
  onSend: (content: string) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ propertyId, onSend, disabled }) => {

  const [input, setInput] = useState('');
  const authUser = useAppSelector((s) => s.auth.user);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const emitTypingStatus = (isTyping: boolean) => {
    if (!socket.connected || !authUser) return;
    console.log(`${authUser.name} isTyping: ${isTyping}`);
    (socket as any).emit('typingStatus', {
      propertyId,
      userId: authUser.id,
      isTyping,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (!socket.connected || !authUser) return;
    emitTypingStatus(true);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      emitTypingStatus(false);
    }, 5000);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');

    if (!socket.connected || !authUser) return;

    emitTypingStatus(false);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
  };

  useEffect(() => {
    return () => {
      if (!socket.connected || !authUser) return;
      emitTypingStatus(false);
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [propertyId, authUser]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? 'Connecting to chat...' : 'Type a message...'}
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
