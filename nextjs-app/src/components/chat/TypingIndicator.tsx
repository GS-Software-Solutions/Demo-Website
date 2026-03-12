'use client';

interface TypingIndicatorProps {
  moderatorPic: string;
}

export default function TypingIndicator({ moderatorPic }: TypingIndicatorProps) {
  return (
    <div className="typing-row">
      <div className="msg-av mod-av">
        {moderatorPic ? (
          <img src={moderatorPic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          '\u{1F3AD}'
        )}
      </div>
      <div className="typing-bubble">
        <div className="t-dot" />
        <div className="t-dot" />
        <div className="t-dot" />
      </div>
    </div>
  );
}
