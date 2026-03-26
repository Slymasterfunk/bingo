'use client';

import { useState, useEffect, useRef } from 'react';

interface NameInputModalProps {
  isOpen: boolean;
  prompt: string;
  currentName: string | null;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export default function NameInputModal({
  isOpen,
  prompt,
  currentName,
  onSubmit,
  onClose
}: NameInputModalProps) {
  const [name, setName] = useState(currentName || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName || '');
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {prompt}
        </h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="person-name" className="block text-sm font-medium text-gray-700 mb-2">
            Enter their name:
          </label>
          <input
            ref={inputRef}
            id="person-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="e.g., John Doe"
            autoComplete="off"
          />

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {currentName ? 'Update' : 'Mark Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
