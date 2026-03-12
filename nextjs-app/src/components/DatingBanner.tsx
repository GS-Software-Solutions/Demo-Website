'use client';

import { useApp } from '@/lib/store/AppContext';

interface DatingBannerProps {
  onOpenModal: () => void;
}

export default function DatingBanner({ onOpenModal }: DatingBannerProps) {
  const { config } = useApp();

  if (!config.datingApp) return null;

  const parts: string[] = [];
  if (config.datingAppCustomerInfo) parts.push('Customer: ' + config.datingAppCustomerInfo);
  if (config.datingAppModeratorInfo) parts.push('Moderator: ' + config.datingAppModeratorInfo);
  if (config.datingAppSpamMessage) parts.push('Spam: ' + config.datingAppSpamMessage);

  const text = parts.join('  |  ') || 'Click to add previous dating app information...';

  return (
    <div className="dating-banner show" onClick={onOpenModal}>
      <span className="db-label">Dating App</span>
      <span className="db-text">{text}</span>
      <span className="db-edit">Edit</span>
    </div>
  );
}
