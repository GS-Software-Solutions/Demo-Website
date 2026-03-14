'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/store/AppContext';
import { callAPI, checkLanguage, parseResponse } from '@/lib/api';
import { getUI } from '@/data/ui-labels';
import MessageRow from './MessageRow';
import TypingIndicator from './TypingIndicator';
import MinorDetectedModal from '../modals/MinorDetectedModal';
import type { Message } from '@/types';

interface ChatColumnProps {
  onLightbox?: (src: string) => void;
  onShowLangWarn: () => void;
}

const MALE_PICS = [
  '/male-pics/27884195_019_dcdc.jpg',
  '/male-pics/39700326_030_ca59.jpg',
  '/male-pics/66235540_006_4911.jpg',
  '/male-pics/79722577_051_b108.jpg',
  '/male-pics/99782711_031_95ba.jpg',
];

export default function ChatColumn({ onShowLangWarn }: ChatColumnProps) {
  const { config, state, dispatch } = useApp();
  const ui = getUI(config.sourceLanguage);

  const [showTyping, setShowTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [showGetAnimation, setShowGetAnimation] = useState(false);
  const [showReactivate, setShowReactivate] = useState(false);
  const [showMinorWarn, setShowMinorWarn] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Abort in-flight request when chat is cleared
  useEffect(() => {
    function handleClearChat() {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      setShowTyping(false);
      setError(null);
    }
    window.addEventListener('clear-chat', handleClearChat);
    return () => window.removeEventListener('clear-chat', handleClearChat);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [state.messages, showTyping]);

  // Update context buttons based on last messages
  const updateContextButtons = useCallback(() => {
    const msgs = state.messages;
    const last = msgs[msgs.length - 1];
    const prev = msgs[msgs.length - 2];
    const lastIsMod = last && last.type === 'sent';
    const last2AreMod = lastIsMod && prev && prev.type === 'sent';
    setShowGetAnimation(lastIsMod && !last2AreMod);
    setShowReactivate(!!last2AreMod);
  }, [state.messages]);

  useEffect(() => {
    updateContextButtons();
  }, [updateContextButtons]);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function pulseBtn() {
    const btn = sendBtnRef.current;
    if (btn) {
      btn.classList.remove('pulse');
      void btn.offsetWidth;
      btn.classList.add('pulse');
    }
  }

  async function handleResponse(data: any) {
    const jsonStr = JSON.stringify(data);
    console.log('🔍 handleResponse called, BLOCK_MINOR present:', jsonStr.includes('BLOCK_MINOR'));

    // Quick check: if BLOCK_MINOR anywhere in response, just show popup
    if (jsonStr.includes('BLOCK_MINOR')) {
      setShowMinorWarn(true);
      setShowTyping(false);
      return;
    }

    const { text, alertMsg, summaryUser, summaryAssistant, assets } = parseResponse(data);

    // Handle image assets from backend
    if (assets.length > 0) {
      const asset = assets[0];
      const imgMsg: Message = { text: asset.resText, imageUrl: asset.imageUrl, type: 'sent', messageType: 'image', timestamp: new Date().toISOString() };
      dispatch({ type: 'ADD_MESSAGE', payload: imgMsg });
      dispatch({ type: 'TRACK_SENT_IMAGE', payload: asset.imageUrl });
      setShowTyping(false);
    } else if (text) {
      const reply: Message = { text, type: 'sent', messageType: 'text', timestamp: new Date().toISOString() };
      dispatch({ type: 'ADD_MESSAGE', payload: reply });
      setShowTyping(false);
    } else {
      setShowTyping(false);
      const { minorDetected } = parseResponse(data);
      if (minorDetected) {
        setShowMinorWarn(true);
      } else {
        setError(alertMsg || 'No response');
      }
    }

    if (summaryUser || summaryAssistant) {
      dispatch({
        type: 'UPDATE_SUMMARY',
        payload: {
          summaryUser: summaryUser || undefined,
          summaryAssistant: summaryAssistant || undefined,
        },
      });

      // Update notes with summary data
      if (summaryUser) {
        const text = Object.entries(summaryUser).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n');
        dispatch({ type: 'SET_NOTES', payload: { field: 'customerNotes', value: text } });
      }
      if (summaryAssistant) {
        const BLOCKED_MOD_KEYS = /sexual|fetish|kink|prefer/i;
        const text = Object.entries(summaryAssistant).filter(([k]) => !BLOCKED_MOD_KEYS.test(k)).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n');
        dispatch({ type: 'SET_NOTES', payload: { field: 'moderatorNotes', value: text } });
      }
    }
  }

  async function sendAnimateMe() {
    if (state.loading) return;
    setError(null);
    dispatch({ type: 'SET_LOADING', payload: true });
    setShowTyping(true);

    try {
      const data = await callAPI(config, state);
      await handleResponse(data);
    } catch (err: any) {
      setShowTyping(false);
      if (err.message?.includes('BLOCK_MINOR')) { setShowMinorWarn(true); }
      else { setError(err.message); }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  async function sendQuickMessage(displayText: string, payloadText: string) {
    if (state.loading) return;
    setError(null);

    const msg: Message = { text: displayText, payloadText, type: 'received', messageType: 'text', timestamp: new Date().toISOString() };
    dispatch({ type: 'ADD_MESSAGE', payload: msg });
    dispatch({ type: 'SET_LOADING', payload: true });
    setShowTyping(true);

    try {
      const updatedState = { ...state, messages: [...state.messages, msg], ins: state.ins + 1 };
      const data = await callAPI(config, updatedState);
      await handleResponse(data);
    } catch (err: any) {
      setShowTyping(false);
      if (err.message?.includes('BLOCK_MINOR')) { setShowMinorWarn(true); }
      else { setError(err.message); }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  async function sendContextPayload() {
    if (state.loading) return;
    setError(null);
    dispatch({ type: 'SET_LOADING', payload: true });
    setShowTyping(true);

    try {
      const data = await callAPI(config, state);
      await handleResponse(data);
    } catch (err: any) {
      setShowTyping(false);
      if (err.message?.includes('BLOCK_MINOR')) { setShowMinorWarn(true); }
      else { setError(err.message); }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  async function sendMessage() {
    const text = inputText.trim();
    if (!text && !pendingImage) return;

    pulseBtn();
    const imageUrl = pendingImage;
    setPendingImage(null);

    // If already loading, abort current and merge
    if (state.loading && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;

      const msg2: Message = { text, type: 'received', messageType: imageUrl ? 'image' : 'text', timestamp: new Date().toISOString(), ...(imageUrl ? { imageUrl } : {}) };
      dispatch({ type: 'ADD_MESSAGE', payload: msg2 });
      setInputText('');

      // Language check on new text
      if (state.ins <= 3 && text.split(/\s+/).length > 2) {
        const langOk = await checkLanguage(text, config.sourceLanguage);
        if (!langOk) {
          setShowTyping(false);
          dispatch({ type: 'SET_LOADING', payload: false });
          onShowLangWarn();
          return;
        }
      }

      // Re-send with merged messages
      try {
        abortRef.current = new AbortController();
        const data = await callAPI(config, { ...state, messages: [...state.messages, msg2], ins: state.ins + 1 }, abortRef.current.signal);
        await handleResponse(data);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setShowTyping(false);
        if (err.message?.includes('BLOCK_MINOR')) { setShowMinorWarn(true); }
        else { setError(err.message); }
      } finally {
        abortRef.current = null;
        dispatch({ type: 'SET_LOADING', payload: false });
        textareaRef.current?.focus();
      }
      return;
    }

    setError(null);

    const msg: Message = { text, type: 'received', messageType: imageUrl ? 'image' : 'text', timestamp: new Date().toISOString(), ...(imageUrl ? { imageUrl } : {}) };
    dispatch({ type: 'ADD_MESSAGE', payload: msg });
    setInputText('');
    dispatch({ type: 'SET_LOADING', payload: true });
    setShowTyping(true);

    // Language check for first 3 messages (after showing the message)
    if (state.ins < 3 && text.split(/\s+/).length > 2) {
      const langOk = await checkLanguage(text, config.sourceLanguage);
      if (!langOk) {
        setShowTyping(false);
        dispatch({ type: 'SET_LOADING', payload: false });
        onShowLangWarn();
        return;
      }
    }

    try {
      abortRef.current = new AbortController();
      // We need to pass the updated state with the new message included
      const updatedState = {
        ...state,
        messages: [...state.messages, msg],
        ins: state.ins + 1,
      };
      const data = await callAPI(config, updatedState, abortRef.current.signal);
      await handleResponse(data);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setShowTyping(false);
      if (err.message?.includes('BLOCK_MINOR')) { setShowMinorWarn(true); }
      else { setError(err.message); }
    } finally {
      abortRef.current = null;
      dispatch({ type: 'SET_LOADING', payload: false });
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const showContextBtns = showGetAnimation || showReactivate;
  const hasMessages = state.messages.length > 0;

  return (
    <div className="chat-col">
      <div className="chat-messages" ref={messagesRef}>
        {!hasMessages && (
          <div className="empty-state">
            <div className="icon">{'\u{1F48B}'}</div>
            <p>{ui.emptyText}</p>
            {!config.datingApp && (
              <button className="animate-btn" onClick={sendAnimateMe}>
                {ui.animateBtn}
              </button>
            )}
            {!config.datingApp && (
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="animate-btn" onClick={() => sendQuickMessage('\uD83D\uDC8B', 'Ich sende dir einen Kuss!')} style={{ fontSize: 20, padding: '8px 16px' }}>
                  {'\uD83D\uDC8B'}
                </button>
                <button className="animate-btn" onClick={() => sendQuickMessage('\uD83D\uDC4D', 'Ich mag dich!')} style={{ fontSize: 20, padding: '8px 16px' }}>
                  {'\uD83D\uDC4D'}
                </button>
              </div>
            )}
            {config.datingApp && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                {ui.datingAppHint}
              </p>
            )}
          </div>
        )}

        {state.messages.map((msg, i) => (
          <MessageRow
            key={i}
            message={msg}
            customerPic={config.customer.profilePic}
            moderatorPic={config.moderator.profilePic}
          />
        ))}

        {showTyping && (
          <TypingIndicator moderatorPic={config.moderator.profilePic} />
        )}
      </div>

      {/* Error Banner */}
      {error && !showMinorWarn && (
        <div className="err-banner show">
          {'\u2717'} {error}
        </div>
      )}

      {/* Context Buttons */}
      {showContextBtns && hasMessages && (
        <div id="contextBtns" className="show" style={{ display: 'flex', padding: '0 18px 10px', gap: 10, flexWrap: 'wrap' }}>
          {showGetAnimation && (
            <button className="animate-btn" style={{ fontSize: 12, padding: '8px 18px' }} onClick={sendContextPayload}>
              Get Animation
            </button>
          )}
          {showReactivate && (
            <button className="animate-btn" style={{ fontSize: 12, padding: '8px 18px' }} onClick={sendContextPayload}>
              Reactivate Me
            </button>
          )}
        </div>
      )}

      {/* Image Picker */}
      {showImagePicker && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, padding: '8px 18px' }}>
          {MALE_PICS.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              onClick={() => { setPendingImage(src); setShowImagePicker(false); }}
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: pendingImage === src ? '2px solid var(--accent)' : '1px solid var(--border)', transition: 'all .2s' }}
            />
          ))}
        </div>
      )}

      {/* Image Preview */}
      {pendingImage && !showImagePicker && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 18px' }}>
          <img src={pendingImage} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
          <button onClick={() => setPendingImage(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>{'\u2715'}</button>
        </div>
      )}

      {/* Input Bar */}
      <div className="input-bar">
        <button
          onClick={() => setShowImagePicker(!showImagePicker)}
          style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}
          title="Send image"
        >
          {'\uD83D\uDDBC\uFE0F'}
        </button>
        <textarea
          ref={textareaRef}
          placeholder={ui.chatPlaceholder}
          value={inputText}
          onChange={e => {
            setInputText(e.target.value);
            autoResize(e.target);
          }}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          ref={sendBtnRef}
          className="send-btn"
          disabled={state.loading && !abortRef.current}
          onClick={sendMessage}
        >
          <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>

      <MinorDetectedModal show={showMinorWarn} onClose={() => setShowMinorWarn(false)} />
    </div>
  );
}
