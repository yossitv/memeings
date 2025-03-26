import React, { useCallback, useRef, useState } from 'react';
import { AppMode } from '../types';

interface ImagePanelProps {
  currentImage: string[];
  onImageSelect: (imageData: string, isReference?: boolean) => void;
  mode?: AppMode;
  selectedImages?: string[];
  maxImages?: number;
  onImagesUpdate?: (images: string[]) => void;
}

export const ImagePanel: React.FC<ImagePanelProps> = ({
  currentImage,
  onImageSelect,
  mode = 'freestyle',
  selectedImages = [],
  maxImages = 1
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).slice(0, maxImages - selectedImages.length).forEach(file => {
        processImageFile(file, false);
      });
    }
  };

  const handlePaste = useCallback((event: ClipboardEvent) => {
    if (selectedImages.length >= maxImages) return;

    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          processImageFile(file, false);
          break;
        }
      }
    }
  }, [selectedImages, maxImages]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, maxImages - selectedImages.length);

    files.forEach(file => {
      processImageFile(file, false);
    });
  }, [selectedImages, maxImages]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const processImageFile = (file: File, isReference: boolean = false) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        onImageSelect(result, isReference);
      }
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleButtonClick = (isReference: boolean = false) => {
    if (fileInputRef.current) {
      fileInputRef.current.multiple = mode !== 'freestyle';
      fileInputRef.current.click();
    }
  };

  const getRemainingImagesCount = () => {
    return maxImages - selectedImages.length;
  };

  const getUploadGuidance = () => {
    switch (mode) {
      case 'clothing':
        return (
          <div className="mt-2 text-sm">
            <p className="font-medium text-primary-600 dark:text-accent-400">1枚目: あなたの画像</p>
            <p className="font-medium text-primary-600 dark:text-accent-400">2枚目: 着せたい服の画像</p>
          </div>
        );
      case 'hairstyle':
        return (
          <div className="mt-2 text-sm">
            <p className="font-medium text-primary-600 dark:text-accent-400">1枚目: あなたの画像</p>
            <p className="font-medium text-primary-600 dark:text-accent-400">2枚目: なりたい髪型の画像</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex items-center justify-center h-full bg-primary-50 dark:bg-neutral-900 p-2 lg:p-6 image-panel ${
        isDragging ? 'border-2 border-dashed border-primary-400 dark:border-accent-400 bg-primary-100 dark:bg-neutral-800' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {currentImage.length > 0 ? (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div className="flex flex-col gap-4 w-full">
            {currentImage.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt={`現在の画像 ${index + 1}`}
                  className="w-full h-auto object-contain rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                />
                <button
                  onClick={() => handleDownload(img, index)}
                  className="absolute top-2 right-2 bg-gray-800/50 hover:bg-gray-800/80 text-white p-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                  title="画像をダウンロード"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-md w-full max-w-lg mx-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            multiple={mode !== 'freestyle'}
          />
          <button
            onClick={() => handleButtonClick(false)}
            className="btn-primary mb-4 w-full min-h-[56px] text-lg"
            disabled={selectedImages.length >= maxImages}
          >
            画像を選択 {mode !== 'freestyle' && `(残り${getRemainingImagesCount()}枚)`}
          </button>
          <p className="text-sm mt-3 text-neutral-500 dark:text-neutral-400">
            <span className="hidden lg:inline">または画像をドラッグ＆ドロップ</span>
            <span className="lg:hidden">または</span>
          </p>
          <p className="text-sm mt-1 text-neutral-500 dark:text-neutral-400">
            クリップボードから貼り付けも可能です
            <span className="lg:hidden block mt-1">
              （スマートフォンの場合はカメラやギャラリーから直接選択できます）
            </span>
          </p>
          {mode !== 'freestyle' && (
            <p className="text-sm mt-3 text-primary-600 dark:text-accent-400 font-medium">
              最大{maxImages}枚の画像を選択できます
            </p>
          )}
          {getUploadGuidance()}
        </div>
      )}
    </div>
  );
};
