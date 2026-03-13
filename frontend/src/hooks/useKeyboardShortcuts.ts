import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type ShortcutOptions = {
  onMarkReadTopUpdate?: () => void;
};

const useKeyboardShortcuts = ({ onMarkReadTopUpdate }: ShortcutOptions) => {
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (isTyping || event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toLowerCase();
      if (key === 'a') {
        event.preventDefault();
        navigate('/upload');
      } else if (key === 'u') {
        event.preventDefault();
        navigate('/updates');
      } else if (key === 'r') {
        event.preventDefault();
        onMarkReadTopUpdate?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, onMarkReadTopUpdate]);
};

export default useKeyboardShortcuts;
