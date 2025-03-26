import React from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onImageClick?: (image: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onImageClick }) => {
  const handleImageClick = (image: string) => {
    if (onImageClick) {
      onImageClick(image);
    }
  };

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[70%] ${
          message.isUser 
            ? 'bg-primary-500 dark:bg-accent-500 text-white shadow-md' 
            : 'bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 shadow-sm'
        } rounded-lg p-4`}
      >
        <p className={`text-sm mb-2 ${!message.isUser ? 'text-neutral-800 dark:text-neutral-100' : ''}`}>{message.text}</p>
        {message.images && message.images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {message.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`生成された画像 ${index + 1}`}
                className="max-w-[48%] h-auto rounded-md cursor-pointer hover:opacity-90 transition-all duration-300 hover:shadow-md"
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
        )}
        <p className={`text-xs mt-2 ${message.isUser ? 'opacity-70' : 'text-neutral-400 dark:text-neutral-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};
