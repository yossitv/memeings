import React, { useState, useRef, useEffect } from 'react';
import type { Message, AppMode, ModePreset } from '../types';
import { api } from '../services/api';
import { ChatMessage } from './ChatMessage';
import { ImageUploadArea } from './ImageUploadArea';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onImageClick: (image: string) => void;
  mode?: AppMode;
  selectedImages?: string[];
  onImageSelect: (imageData: string, isReference?: boolean) => void;
  maxImages?: number;
  onReset: () => void;
  onImagesUpdate?: (images: string[]) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  onImageClick,
  mode = 'freestyle',
  selectedImages = [],
  onImageSelect,
  maxImages = 1,
  onReset,
  onImagesUpdate
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [modes, setModes] = useState<Record<string, ModePreset>>({});
  const [currentModePreset, setCurrentModePreset] = useState<ModePreset | null>(null);

  useEffect(() => {
    const loadModes = async () => {
      try {
        const data = await api.getModes();
        setModes(data.modes);
      } catch (error) {
        console.error('モードの読み込みに失敗しました:', error);
      }
    };
    loadModes();
  }, []);

  useEffect(() => {
    if (mode && modes[mode]) {
      setCurrentModePreset(modes[mode]);
    }
  }, [mode, modes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentModePreset) return;

    if (currentModePreset.inputDisabled) {
      // 入力が無効な場合は、プロンプトをそのまま送信
      onSendMessage('');
    } else {
      // 入力が有効な場合
      const trimmedInput = input.trim();
      if (trimmedInput) {
        // プロンプトテンプレートに{{prompt}}が含まれる場合は、ユーザー入力のみを送信
        // 含まれない場合は、ユーザー入力をそのまま送信
        const shouldSendInputOnly = currentModePreset.prompt.includes('{{prompt}}');
        onSendMessage(shouldSendInputOnly ? trimmedInput : currentModePreset.prompt + ' ' + trimmedInput);
        setInput('');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-800 shadow-sm chat-panel">
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-4 pb-24 lg:pb-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onImageClick={onImageClick}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ImageUploadArea
        onImageSelect={onImageSelect}
        selectedImages={selectedImages}
        mode={mode}
        maxImages={maxImages}
        onImagesUpdate={onImagesUpdate}
      />
      <form
        onSubmit={handleSubmit}
        className="fixed lg:sticky bottom-[88px] lg:bottom-0 left-0 right-0 p-4 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 shadow-lg z-10"
      >
        <div className="flex flex-col lg:flex-row gap-2 max-w-4xl mx-auto">
      {currentModePreset && (
        currentModePreset.inputDisabled ? (
          <div className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 shadow-sm">
            {currentModePreset.prompt.substring(0, 60)}...
          </div>
        ) : (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentModePreset.inputPlaceholder || (currentModePreset.prompt.includes('{{prompt}}') ? 'プロンプトをカスタマイズ...' : '画像の生成や編集の指示を入力してください...')}
            className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-4 lg:py-3
                     focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent 
                     shadow-md hover:shadow-lg transition-shadow duration-300 text-base lg:text-sm min-h-[56px]
                     bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100
                     placeholder-neutral-500 dark:placeholder-neutral-400"
          />
        )
      )}
          <div className="flex gap-2 lg:flex-shrink-0">
            <button
              type="submit"
              className="btn-primary min-h-[56px] px-6 lg:px-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              disabled={currentModePreset?.inputDisabled === false && !input.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              生成
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('会話と画像をリセットしますか？')) {
                  onReset();
                }
              }}
              className="btn-secondary min-h-[56px] px-6 lg:px-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              リセット
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
