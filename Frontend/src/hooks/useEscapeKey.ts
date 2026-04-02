import { useEffect, useCallback } from 'react';

/**
 * Hook that listens for the "Escape" key and executes a callback.
 * 
 * @param onEscape Callback function to execute when Escape is pressed.
 * @param active Whether the listener should be active (defaults to true).
 */
export const useEscapeKey = (onEscape: () => void, active: boolean = true) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape();
      }
    },
    [onEscape]
  );

  useEffect(() => {
    if (active) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, handleKeyDown]);
};
