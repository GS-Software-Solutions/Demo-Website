'use client';

interface GenderMismatchModalProps {
  show: boolean;
  onClose: () => void;
}

export default function GenderMismatchModal({ show, onClose }: GenderMismatchModalProps) {
  if (!show) return null;

  return (
    <div className="lang-warn-overlay show" onClick={onClose}>
      <div className="lang-warn-box" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>{'\u26A0\uFE0F'}</div>
        <strong style={{ fontSize: 15 }}>Gender Issue</strong>
        <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.6, color: 'var(--text-muted)' }}>
          The gender detected in your photo does not match the gender selected in your profile.
          Please update your profile gender or upload a different photo.
        </p>
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            background: 'linear-gradient(135deg, #ff2d6e, #ff6b9d)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 28px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
