import { useEffect } from 'react';
import type { ViewMode } from '../types/task';

interface UseKeyboardShortcutsProps {
  onOpenNewTask: () => void;
  onFocusSearch: () => void;
  onSetView: (view: ViewMode) => void;
  onCloseModal: () => void;
  isModalOpen: boolean;
}

export function useKeyboardShortcuts({
  onOpenNewTask,
  onFocusSearch,
  onSetView,
  onCloseModal,
  isModalOpen,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseModal();
        return;
      }

      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (isInput) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onOpenNewTask();
      } else if (e.key === '/') {
        e.preventDefault();
        onFocusSearch();
      } else if (e.key === '1') {
        e.preventDefault();
        onSetView('today');
      } else if (e.key === '2') {
        e.preventDefault();
        onSetView('week');
      } else if (e.key === '3') {
        e.preventDefault();
        onSetView('pool');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenNewTask, onFocusSearch, onSetView, onCloseModal, isModalOpen]);
}
