'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        transition: 'opacity 0.3s ease',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'auto',
      }}
    >
      <div style={{ fontSize: 56, animation: 'floatEmoji 1.5s ease-in-out infinite' }}>
        {'\u{1F48B}'}
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
        Ready to Flirt?
      </div>
      <div
        style={{
          width: 28,
          height: 28,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spinLoader 0.8s linear infinite',
        }}
      />
    </div>
  );
}
