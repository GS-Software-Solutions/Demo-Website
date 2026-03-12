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

const AUTH_EMAIL = 'test@sexytalk.io';
const AUTH_PASS = 'IamSexy';
const AUTH_KEY = 'chatcraft_auth';

export default function Home() {

  const [authed, setAuthed] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showLangWarn, setShowLangWarn] = useState(false);
  const [showDatingModal, setShowDatingModal] = useState(false);
  const [showGenderWarn, setShowGenderWarn] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === 'true') setAuthed(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  function handleLogin() {
    if (emailInput.trim().toLowerCase() === AUTH_EMAIL && passInput === AUTH_PASS) {
      localStorage.setItem(AUTH_KEY, 'true');
      setAuthed(true);
      setLoginError(false);
    } else {
      setLoginError(true);
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
          <h2>Login</h2>
          <p>Enter your credentials to continue</p>
          <input
            type="email"
            value={emailInput}
            onChange={e => { setEmailInput(e.target.value); setLoginError(false); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Email"
            autoFocus
          />
          <input
            type="password"
            value={passInput}
            onChange={e => { setPassInput(e.target.value); setLoginError(false); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Password"
            style={{ marginTop: 10 }}
          />
          {loginError && <span className="access-error">Invalid email or password</span>}
          <button onClick={handleLogin}>Log in</button>
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
