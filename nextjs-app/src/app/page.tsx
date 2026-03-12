'use client';

import { useState, useEffect } from 'react';
import { MODERATOR_PHOTO_SETS } from '@/data/random-profiles';
import TopBar from '@/components/TopBar';
import DatingBanner from '@/components/DatingBanner';
import ProfilePanel from '@/components/profile/ProfilePanel';
import ChatColumn from '@/components/chat/ChatColumn';
import Lightbox from '@/components/modals/Lightbox';
import LangWarningModal from '@/components/modals/LangWarningModal';
import DatingModal from '@/components/modals/DatingModal';
import GenderMismatchModal from '@/components/modals/GenderMismatchModal';
import LoadingScreen from '@/components/LoadingScreen';

const ACCESS_CODE = 'IamSexy';
const AUTH_KEY = 'chatcraft_auth';

export default function Home() {

  const [authed, setAuthed] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showLangWarn, setShowLangWarn] = useState(false);
  const [showDatingModal, setShowDatingModal] = useState(false);
  const [showGenderWarn, setShowGenderWarn] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === ACCESS_CODE) setAuthed(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  function handleCodeSubmit() {
    if (codeInput.trim() === ACCESS_CODE) {
      localStorage.setItem(AUTH_KEY, ACCESS_CODE);
      setAuthed(true);
      setCodeError(false);
    } else {
      setCodeError(true);
    }
  }

  // Preload all moderator photos so cycling is instant
  useEffect(() => {
    MODERATOR_PHOTO_SETS.forEach(set => {
      new Image().src = set.profilePic;
      set.gallery.forEach(src => { new Image().src = src; });
    });
  }, []);

  if (!authed) {
    return (
      <div className="access-gate">
        <div className="access-box">
          <div style={{ fontSize: 32, marginBottom: 12 }}>{'\uD83D\uDD12'}</div>
          <h2>Access Code Required</h2>
          <p>Enter the access code to continue</p>
          <input
            type="password"
            value={codeInput}
            onChange={e => { setCodeInput(e.target.value); setCodeError(false); }}
            onKeyDown={e => e.key === 'Enter' && handleCodeSubmit()}
            placeholder="Enter code..."
            autoFocus
          />
          {codeError && <span className="access-error">Invalid code</span>}
          <button onClick={handleCodeSubmit}>Enter</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!splashDone && <LoadingScreen />}

      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

      <TopBar />

      <DatingBanner onOpenModal={() => setShowDatingModal(true)} />

      <div className="workspace">
        <ProfilePanel
          side="customer"
          onLightbox={setLightboxSrc}
          onOpenDatingModal={() => setShowDatingModal(true)}
          onGenderMismatch={() => setShowGenderWarn(true)}
        />
        <ChatColumn
          onLightbox={setLightboxSrc}
          onShowLangWarn={() => setShowLangWarn(true)}
        />
        <ProfilePanel
          side="moderator"
          onLightbox={setLightboxSrc}
        />
      </div>

      <LangWarningModal show={showLangWarn} onClose={() => setShowLangWarn(false)} />
      <DatingModal show={showDatingModal} onClose={() => setShowDatingModal(false)} />
      <GenderMismatchModal show={showGenderWarn} onClose={() => setShowGenderWarn(false)} />
    </>
  );
}
