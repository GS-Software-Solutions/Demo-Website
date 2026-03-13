'use client';

interface MinorDetectedModalProps {
  show: boolean;
  onClose: () => void;
}

export default function MinorDetectedModal({ show, onClose }: MinorDetectedModalProps) {
  if (!show) return null;

  return (
    <div className="lang-warn-overlay show" onClick={onClose}>
      <div className="lang-warn-box" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>{'\u26D4'}</div>
        <strong style={{ fontSize: 16, color: '#ef4444' }}>Minor Detected</strong>
        <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.6, color: 'var(--text-muted)' }}>
          The system has detected a minor in the input.<br/>
          Please route the chat to a real moderator to ensure legal boundaries.
        </p>
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 28px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Understood
        </button>
      </div>
    </div>
  );
}
