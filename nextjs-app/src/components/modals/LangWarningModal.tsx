'use client';

interface LangWarningModalProps {
  show: boolean;
  onClose: () => void;
}

export default function LangWarningModal({ show, onClose }: LangWarningModalProps) {
  return (
    <div
      className={`lang-warn-overlay${show ? ' show' : ''}`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="lang-warn-box">
        <div className="warn-icon">{'\u26A0\uFE0F'}</div>
        <div className="warn-text">Dialog language does not match with language in message!</div>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
