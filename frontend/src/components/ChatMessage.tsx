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
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4 slide-in`}>
      <div 
        className={`max-w-[70%] message-card ${
          message.isUser 
            ? 'message-card-user' 
            : 'message-card-ai'
        }`}
      >
        <p className={`text-sm mb-2 ${!message.isUser ? 'text-neutral-800 dark:text-neutral-100' : ''}`}>{message.text}</p>
        {message.images && message.images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {message.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`生成された画像 ${index + 1}`}
                className="w-24 h-24 object-cover rounded-md cursor-pointer image-card"
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
        )}
        <p className={`text-xs mt-2 ${message.isUser ? 'opacity-70' : 'text-neutral-400 dark:text-neutral-500'} slide-in`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};
