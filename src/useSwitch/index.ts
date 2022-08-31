import { useState, useCallback } from 'react';

export default function useSwitch(defaultVisible = false) {
  const [visible, setVisible] = useState(defaultVisible);

  return {
    visible,
    setVisible,
    close: useCallback(() => {
      setVisible(false);
    }, []),
    open: useCallback(() => {
      setVisible(true);
    }, []),
    toggle: useCallback((v: boolean) => {
      setVisible(typeof v === 'boolean' ? v : (v) => !v);
    }, []),
  };
}
