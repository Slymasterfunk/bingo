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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className="name-modal" onClick={handleBackdropClick}>
      <div className="name-modal__backdrop"></div>
      <div className="name-modal__content">
        <h2 className="name-modal__header">
          {prompt}
        </h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="person-name" className="admin-login__label">
            Enter their name:
          </label>
          <input
            ref={inputRef}
            id="person-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="name-modal__input"
            placeholder="e.g., John Doe"
            autoComplete="off"
          />

          <div className="name-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn--secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn btn--blue"
            >
              {currentName ? 'Update' : 'Mark Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
