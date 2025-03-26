import React, { useRef, useState, useCallback } from 'react';
import { AppMode } from '../types';

interface ImageUploadAreaProps {
  onImageSelect: (imageData: string, isReference?: boolean) => void;
  selectedImages: string[];
  maxImages?: number;
  mode?: AppMode;
  onImagesUpdate?: (images: string[]) => void;
}

export const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  onImageSelect,
  selectedImages,
  maxImages = 1,
  mode = 'freestyle',
  onImagesUpdate
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).slice(0, maxImages - selectedImages.length).forEach(file => {
        processImageFile(file);
      });
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, maxImages - selectedImages.length);

    files.forEach(file => {
      processImageFile(file);
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

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        onImageSelect(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getRemainingImagesCount = () => {
    return maxImages - selectedImages.length;
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (onImagesUpdate) {
      const updatedImages = selectedImages.filter((_, index) => index !== indexToRemove);
      onImagesUpdate(updatedImages);
    }
  };

  const handleDragStart = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    if (e.dataTransfer.setDragImage && e.currentTarget.querySelector('img')) {
      const img = e.currentTarget.querySelector('img') as HTMLImageElement;
      e.dataTransfer.setDragImage(img, 20, 20);
    }
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleImageDragOver = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleImageDrop = (dropIndex: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || !onImagesUpdate) return;

    const imagesCopy = [...selectedImages];
    const draggedImage = imagesCopy[draggedIndex];
    imagesCopy.splice(draggedIndex, 1);
    imagesCopy.splice(dropIndex, 0, draggedImage);
    
    onImagesUpdate(imagesCopy);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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
    <div className="p-2 lg:p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mb-16 lg:mb-0">
      <div
        className={`
          min-h-[100px]
          border-2
          ${isDragging 
            ? 'border-primary-500 dark:border-accent-500 bg-primary-50 dark:bg-neutral-700' 
            : 'border-dashed border-neutral-300 dark:border-neutral-600'}
          rounded-lg
          p-2 lg:p-4
          mb-2 lg:mb-4
          transition-all duration-300
          ${selectedImages.length >= maxImages 
            ? 'bg-neutral-50 dark:bg-neutral-800' 
            : 'bg-white dark:bg-neutral-700'}
          shadow-sm
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-wrap gap-2 mb-2 lg:mb-3">
          {selectedImages.map((image, index) => (
            <div
              key={index}
              className={`relative w-20 h-20 rounded-lg overflow-hidden border 
                ${draggedIndex === index ? 'opacity-50 border-dashed' : 'border-neutral-200 dark:border-neutral-600'} 
                shadow-sm hover:shadow-md transition-all duration-300 cursor-move`}
              draggable={true}
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e) => handleImageDragOver(index, e)}
              onDrop={(e) => handleImageDrop(index, e)}
              onDragEnd={handleDragEnd}
            >
              <img
                src={image}
                alt={`選択された画像 ${index + 1}`}
                className="w-full h-full object-cover pointer-events-none"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                className="absolute top-1 right-1 bg-white dark:bg-neutral-800 bg-opacity-70 hover:bg-opacity-100 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:shadow transition-all"
                aria-label="画像を削除"
              >
                <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-center max-w-lg mx-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            multiple={mode !== 'freestyle'}
            capture="environment"
          />
          <button
            onClick={handleButtonClick}
            className={`
              w-full min-h-[56px] text-lg
              ${selectedImages.length >= maxImages
                ? 'bg-neutral-300 dark:bg-neutral-600 cursor-not-allowed text-neutral-500 dark:text-neutral-400'
                : 'btn-primary'}
              mb-3
            `}
            disabled={selectedImages.length >= maxImages}
          >
            画像を選択 {mode !== 'freestyle' && `(残り${getRemainingImagesCount()}枚)`}
          </button>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">
            {mode !== 'freestyle' ? '画像を2枚追加してください' : '画像を追加してください'}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            <span className="hidden lg:inline">ここに画像をドラッグ＆ドロップすることもできます</span>
            <span className="lg:hidden">カメラで撮影するか、ギャラリーから選択してください</span>
          </p>
          {getUploadGuidance()}
        </div>
      </div>
    </div>
  );
};
