'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccessGate() {
  const router = useRouter();
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCodeSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setCodeError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setCodeError(data?.error || 'Invalid code');
        return;
      }

      router.replace('/');
      router.refresh();
    } catch {
      setCodeError('Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="access-gate">
      <div className="access-box">
        <div style={{ fontSize: 32, marginBottom: 12 }}>{'\uD83D\uDC8B'}</div>
        <h2>Access Code Required</h2>
        <p>Enter the access code to continue</p>
        <input
          type="password"
          value={codeInput}
          onChange={e => {
            setCodeInput(e.target.value);
            setCodeError(null);
          }}
          onKeyDown={e => e.key === 'Enter' && handleCodeSubmit()}
          placeholder="Enter code..."
          autoFocus
        />
        {codeError && <span className="access-error">{codeError}</span>}
        <button onClick={handleCodeSubmit} disabled={submitting}>
          {submitting ? 'Checking...' : 'Enter'}
        </button>
      </div>
    </div>
  );
}
