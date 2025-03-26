import React from 'react';

interface MobileTabNavigationProps {
  activeTab: 'image' | 'chat';
  onTabChange: (tab: 'image' | 'chat') => void;
}

export const MobileTabNavigation: React.FC<MobileTabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-2 flex justify-center space-x-4 z-50">
      <button
        className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 ${
          activeTab === 'image'
            ? 'bg-primary-500 dark:bg-accent-500 text-white'
            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
        }`}
        onClick={() => onTabChange('image')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        画像
      </button>
      <button
        className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 ${
          activeTab === 'chat'
            ? 'bg-primary-500 dark:bg-accent-500 text-white'
            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
        }`}
        onClick={() => onTabChange('chat')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
        チャット
      </button>
    </div>
  );
};
