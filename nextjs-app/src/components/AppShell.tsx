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

export default function AppShell() {
  const [mobileTab, setMobileTab] = useState<'customer' | 'chat' | 'moderator'>('chat');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showLangWarn, setShowLangWarn] = useState(false);
  const [showDatingModal, setShowDatingModal] = useState(false);
  const [showGenderWarn, setShowGenderWarn] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Preload all moderator photos so cycling is instant
  useEffect(() => {
    MODERATOR_PHOTO_SETS.forEach(set => {
      new Image().src = set.profilePic;
      set.gallery.forEach(src => {
        new Image().src = src;
      });
    });
  }, []);

  return (
    <>
      {!splashDone && <LoadingScreen />}

      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

      <TopBar />

      <DatingBanner onOpenModal={() => setShowDatingModal(true)} />

      <div className="workspace" data-active-tab={mobileTab}>
        <ProfilePanel
          side="customer"
          onLightbox={setLightboxSrc}
          onOpenDatingModal={() => setShowDatingModal(true)}
          onGenderMismatch={() => setShowGenderWarn(true)}
        />
        <ChatColumn onLightbox={setLightboxSrc} onShowLangWarn={() => setShowLangWarn(true)} />
        <ProfilePanel side="moderator" onLightbox={setLightboxSrc} />
      </div>

      <div className="mobile-tab-bar">
        <button className={mobileTab === 'customer' ? 'active' : ''} onClick={() => setMobileTab('customer')}>
          Customer
        </button>
        <button className={mobileTab === 'chat' ? 'active' : ''} onClick={() => setMobileTab('chat')}>
          Chat
        </button>
        <button className={mobileTab === 'moderator' ? 'active' : ''} onClick={() => setMobileTab('moderator')}>
          Moderator
        </button>
      </div>

      <LangWarningModal show={showLangWarn} onClose={() => setShowLangWarn(false)} />
      <DatingModal show={showDatingModal} onClose={() => setShowDatingModal(false)} />
      <GenderMismatchModal show={showGenderWarn} onClose={() => setShowGenderWarn(false)} />
    </>
  );
}
