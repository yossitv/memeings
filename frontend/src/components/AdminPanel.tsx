import React, { useState, useEffect } from 'react';
import type { ModePreset } from '../types';
import { api } from '../services/api';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [modes, setModes] = useState<Record<string, ModePreset>>({});
  const [newModeId, setNewModeId] = useState('');
  const [editingMode, setEditingMode] = useState<{id: string; preset: ModePreset} | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModes();
  }, []);

  const loadModes = async () => {
    try {
      const data = await api.getModes();
      setModes(data.modes);
    } catch (err) {
      setError('モードの読み込みに失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const modeData: ModePreset = {
        prompt: formData.get('prompt') as string,
        description: formData.get('description') as string,
        inputDisabled: formData.get('inputDisabled') === 'true',
        icon: formData.get('icon') as string || undefined,
        inputPlaceholder: formData.get('inputPlaceholder') as string || undefined
      };

      if (editingMode) {
        await api.updateMode(editingMode.id, modeData);
        setEditingMode(null);
      } else {
        await api.addMode(newModeId, modeData);
        setNewModeId('');
      }

      form.reset();
      await loadModes();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    }
  };

  const handleDelete = async (modeId: string) => {
    if (!window.confirm(`モード "${modeId}" を削除してもよろしいですか？`)) {
      return;
    }

    try {
      await api.deleteMode(modeId);
      await loadModes();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  const handleEdit = (modeId: string) => {
    const mode = modes[modeId];
    if (mode) {
      setEditingMode({ id: modeId, preset: mode });
      setNewModeId(modeId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">モード管理</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                モードID
              </label>
              <input
                type="text"
                name="id"
                value={newModeId}
                onChange={(e) => setNewModeId(e.target.value)}
                placeholder="例: portrait_mode"
                className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
                required
                disabled={!!editingMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                プロンプト
              </label>
              <textarea
                name="prompt"
                defaultValue={editingMode?.preset.prompt}
                placeholder="プロンプトを入力（{{prompt}}でユーザー入力を指定可能）"
                className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <input
                type="text"
                name="description"
                defaultValue={editingMode?.preset.description}
                placeholder="モードの説明"
                className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                アイコン（絵文字）
              </label>
              <input
                type="text"
                name="icon"
                defaultValue={editingMode?.preset.icon}
                placeholder="例: 🎨"
                className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                入力ボックスの説明
              </label>
              <input
                type="text"
                name="inputPlaceholder"
                defaultValue={editingMode?.preset.inputPlaceholder}
                placeholder="例: 画像に対して行いたい編集や生成の指示を入力してください..."
                className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="inputDisabled"
                  value="false"
                  defaultChecked={!editingMode?.preset.inputDisabled}
                />
                <span className="dark:text-neutral-300">ユーザー入力を許可</span>
              </label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="radio"
                  name="inputDisabled"
                  value="true"
                  defaultChecked={editingMode?.preset.inputDisabled}
                />
                <span className="dark:text-neutral-300">ユーザー入力を無効化</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              {editingMode && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMode(null);
                    setNewModeId('');
                  }}
                  className="btn-secondary"
                >
                  キャンセル
                </button>
              )}
              <button
                type="submit"
                className="btn-primary"
              >
                {editingMode ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </form>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">登録済みモード</h3>
          <div className="grid gap-4">
            {Object.entries(modes).map(([modeId, mode]) => (
              <div
                key={modeId}
                className="border rounded-lg p-4 bg-gray-50 dark:bg-neutral-700 dark:border-neutral-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                      {mode.icon} {modeId}
                      {!mode.isCustom && (
                        <span className="ml-2 text-xs bg-gray-200 dark:bg-neutral-600 px-2 py-1 rounded">
                          デフォルト
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{mode.description}</p>
                  </div>
                  {mode.isCustom && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(modeId)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(modeId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <pre className="text-sm bg-white dark:bg-neutral-800 p-2 rounded border dark:border-neutral-600 overflow-x-auto dark:text-neutral-300">
                  {mode.prompt}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
