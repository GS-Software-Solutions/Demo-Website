'use client';

import { useEffect } from 'react';

interface LightboxProps {
  src: string | null;
  onClose: () => void;
}

export default function Lightbox({ src, onClose }: LightboxProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className={`lightbox${src ? ' show' : ''}`}
      onClick={onClose}
    >
      {src && <img src={src} alt="Enlarged" />}
    </div>
  );
}
