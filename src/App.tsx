import { useState, useEffect, useRef } from 'react';
import { useTheme } from './hooks/useTheme';
import { v4 as uuidv4 } from 'uuid';
import { ChatPanel } from './components/ChatPanel';
import { ImagePanel } from './components/ImagePanel';
import { AdminPanel } from './components/AdminPanel';
import { api } from './services/api';
import type { Message, AppMode, ModePreset } from './types';
import { MobileTabNavigation } from './components/MobileTabNavigation';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentImage, setCurrentImage] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [mode, setMode] = useState<AppMode>('freestyle');
  const [modes, setModes] = useState<Record<string, ModePreset>>({});
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'chat'>('image');
  const mainContentRef = useRef<HTMLDivElement>(null);

  // モード一覧を取得
  useEffect(() => {
    const fetchModes = async () => {
      try {
        const data = await api.getModes();
        setModes(data.modes);
      } catch (error) {
        console.error('モードの取得に失敗しました:', error);
      }
    };
    fetchModes();
  }, []);

  // プロンプトを処理する関数
  const processPrompt = (template: string, userInput?: string): string => {
    // テンプレートが空の場合（freestyleモード）はユーザー入力をそのまま返す
    if (!template) return userInput || '';
    // ユーザー入力がない場合はテンプレートをそのまま返す
    if (!userInput) return template;
    // テンプレートに{{prompt}}が含まれている場合は、ユーザー入力で置換
    if (template.includes('{{prompt}}')) {
      return template.replace(/{{prompt}}/g, userInput);
    }
    // それ以外の場合は、ユーザー入力をそのまま使用（ChatPanelで結合済み）
    return userInput;
  };

  const handleSendMessage = async (customText?: string) => {
    // モードに応じたプロンプトを使用
    const currentMode = modes[mode];
    const text = processPrompt(currentMode?.prompt || '', customText);
    
    if (!text) return;

    // ユーザーメッセージを追加（選択された画像がある場合は一緒に送信）
    const userMessage: Message = {
      id: uuidv4(),
      text,
      isUser: true,
      images: selectedImages.length > 0 ? selectedImages : undefined,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      let response;
      // 常にmergeImages関数を使用
      if (selectedImages.length > 0) {
        // 画像があればマージ
        response = await api.mergeImages({
          prompt: text,
          images: selectedImages
        });
      } else if (currentImage.length > 0) {
        // 現在の画像があれば、それを使ってマージ
        response = await api.mergeImages({
          prompt: text,
          images: currentImage
        });
      } else {
        // 画像がない場合は、テキストのみで生成
        response = await api.mergeImages({
          prompt: text,
          images: []
        });
      }
      
      if (isFirstMessage) {
        setIsFirstMessage(false);
      }

      // AIの応答を追加
      console.log('API Response:', response);
      const aiMessage: Message = {
        id: uuidv4(),
        text: response.text || '応答を生成しました',
        isUser: false,
        images: response.image ? [response.image] : [],
        timestamp: Date.now(),
      };
      console.log('AI Message with image:', aiMessage);
      setMessages(prev => [...prev, aiMessage]);
      setCurrentImage(response.image ? [response.image] : []);
      setSelectedImages([]); // メッセージ送信後に選択された画像をクリア
    } catch (error) {
      console.error('エラー:', error);
      // エラーメッセージを追加
      const errorMessage: Message = {
        id: uuidv4(),
        text: error instanceof Error ? error.message : 'エラーが発生しました。もう一度お試しください。',
        isUser: false,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleImageClick = (image: string) => {
    setCurrentImage([image]);
  };

  const handleImageSelect = (imageData: string, isReference?: boolean) => {
    // 常に複数画像選択モードとして扱う
    if (selectedImages.length < 2) {
      setSelectedImages([...selectedImages, imageData]);
    }
  };

  const handleImagesUpdate = (updatedImages: string[]) => {
    setSelectedImages(updatedImages);
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentImage([]);
    setSelectedImages([]);
    setIsFirstMessage(true);
  };

  return (
      <div className="flex flex-col h-screen bg-gradient-secondary from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 overflow-hidden">
        {/* テーマ切り替えボタン */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="theme-toggle hover-float"
            aria-label="テーマ切り替え"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
        {/* モード選択ボタン */}
        <div className="flex flex-col items-center mb-4 pt-4 px-4 animate-fade-in">
          <div className="flex flex-wrap justify-center gap-2 mb-2 mode-selector p-4 rounded-lg w-full max-w-4xl">
            {/* 管理ボタン */}
            <button
              className="btn-secondary hover-float"
              onClick={() => setShowAdmin(true)}
            >
              ⚙️ 管理
            </button>
            
            {/* 動的に生成されるモードボタン */}
            {Object.entries(modes)
              .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
              .map(([modeId, modePreset]) => (
                <button
                  key={modeId}
                  className={`${mode === modeId ? 'btn-primary' : 'btn-secondary'} hover-float`}
                  onClick={() => setMode(modeId)}
                >
                  {modePreset.icon} {modeId}
                </button>
              ))}
          </div>

          {/* 現在のモードの説明 */}
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mode-description px-6 py-3 rounded-lg slide-in">
            {modes[mode]?.description || '説明が見つかりません'}
          </div>
        </div>

        {/* 管理画面 */}
        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      {/* メインコンテンツエリア */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden" ref={mainContentRef}>
        {/* 画像表示パネル */}
        <div className={`lg:w-1/2 h-[calc(100vh-16rem)] lg:h-full shadow-md transition-all duration-300 ease-in-out relative ${activeTab === 'chat' ? 'hidden lg:block' : ''}`}>
          <div className="absolute inset-0 overflow-y-auto">
            <ImagePanel 
              currentImage={currentImage} 
              onImageSelect={handleImageSelect}
              mode={mode}
              selectedImages={selectedImages}
              maxImages={2}
              onImagesUpdate={handleImagesUpdate}
            />
          </div>
        </div>
        
        {/* チャットパネル */}
        <div className={`lg:w-1/2 h-[calc(100vh-16rem)] lg:h-full transition-all duration-300 ease-in-out relative ${activeTab === 'image' ? 'hidden lg:block' : ''}`}>
          <div className="absolute inset-0 overflow-y-auto">
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              onImageClick={handleImageClick}
              mode={mode}
              selectedImages={selectedImages}
              onImageSelect={handleImageSelect}
              maxImages={2}
              onReset={handleReset}
              onImagesUpdate={handleImagesUpdate}
            />
          </div>
        </div>

        {/* モバイルタブナビゲーション */}
        <MobileTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}

export default App;
