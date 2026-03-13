'use client';

import { fmtTime } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageRowProps {
  message: Message;
  customerPic: string;
  moderatorPic: string;
}

export default function MessageRow({ message, customerPic, moderatorPic }: MessageRowProps) {
  const isMod = message.type === 'sent';
  const pic = isMod ? moderatorPic : customerPic;

  return (
    <div className={`msg-row ${isMod ? 'moderator' : 'customer'}`}>
      <div className={`msg-av${isMod ? ' mod-av' : ''}`}>
        {pic ? (
          <img src={pic} alt="" />
        ) : (
          isMod ? '\u{1F3AD}' : '\u{1F464}'
        )}
      </div>
      <div className="msg-inner">
        {message.imageUrl && (
          <div className="bubble" style={{ padding: 4 }}>
            <img
              src={message.imageUrl}
              alt=""
              style={{ maxWidth: 220, borderRadius: 8, display: 'block' }}
            />
          </div>
        )}
        {message.text && (
          <div className="bubble">{message.text}</div>
        )}
        <div className="msg-time">{fmtTime(message.timestamp)}</div>
      </div>
    </div>
  );
}
