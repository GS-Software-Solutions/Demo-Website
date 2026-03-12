'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/store/AppContext';

interface DatingModalProps {
  show: boolean;
  onClose: () => void;
}

export default function DatingModal({ show, onClose }: DatingModalProps) {
  const { config, dispatch } = useApp();

  const [customerInfo, setCustomerInfo] = useState('');
  const [moderatorInfo, setModeratorInfo] = useState('');
  const [spamMessage, setSpamMessage] = useState('');

  useEffect(() => {
    if (show) {
      setCustomerInfo(config.datingAppCustomerInfo || '');
      setModeratorInfo(config.datingAppModeratorInfo || '');
      setSpamMessage(config.datingAppSpamMessage || '');
    }
  }, [show, config.datingAppCustomerInfo, config.datingAppModeratorInfo, config.datingAppSpamMessage]);

  function handleSave() {
    dispatch({
      type: 'SAVE_DATING_INFO',
      payload: {
        datingAppCustomerInfo: customerInfo.trim(),
        datingAppModeratorInfo: moderatorInfo.trim(),
        datingAppSpamMessage: spamMessage.trim(),
      },
    });
    onClose();
  }

  return (
    <div
      className={`da-modal-overlay${show ? ' show' : ''}`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="da-modal">
        <h3>Previous Dating App Information</h3>
        <p>Enter information gathered from the dating app. This will be added to the notes.</p>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>
            Customer Info
          </label>
          <textarea
            value={customerInfo}
            onChange={e => setCustomerInfo(e.target.value)}
            placeholder="e.g. likes hiking, has a dog named Max, works in IT..."
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>
            Moderator Info
          </label>
          <textarea
            value={moderatorInfo}
            onChange={e => setModeratorInfo(e.target.value)}
            placeholder="e.g. matched on Lovoo, talked about travel, shared photos..."
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>
            Spam Message (why she can&apos;t text on the app anymore)
          </label>
          <textarea
            value={spamMessage}
            onChange={e => setSpamMessage(e.target.value)}
            placeholder="e.g. account got restricted, too many messages, app keeps crashing..."
          />
        </div>

        <div className="da-modal-btns">
          <button className="da-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="da-btn-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
