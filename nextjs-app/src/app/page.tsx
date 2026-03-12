'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import DatingBanner from '@/components/DatingBanner';
import ProfilePanel from '@/components/profile/ProfilePanel';
import ChatColumn from '@/components/chat/ChatColumn';
import Lightbox from '@/components/modals/Lightbox';
import LangWarningModal from '@/components/modals/LangWarningModal';
import DatingModal from '@/components/modals/DatingModal';
import GenderMismatchModal from '@/components/modals/GenderMismatchModal';
import LoadingScreen from '@/components/LoadingScreen';

export default function Home() {

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showLangWarn, setShowLangWarn] = useState(false);
  const [showDatingModal, setShowDatingModal] = useState(false);
  const [showGenderWarn, setShowGenderWarn] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 1500);
    return () => clearTimeout(timer);
  }, []);

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
