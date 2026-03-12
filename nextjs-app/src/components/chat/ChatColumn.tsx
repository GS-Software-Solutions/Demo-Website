'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/store/AppContext';
import { callAPI, checkLanguage, parseResponse } from '@/lib/api';
import { getUI } from '@/data/ui-labels';
import MessageRow from './MessageRow';
import TypingIndicator from './TypingIndicator';
import type { Message } from '@/types';

interface ChatColumnProps {
  onLightbox?: (src: string) => void;
  onShowLangWarn: () => void;
}

export default function ChatColumn({ onShowLangWarn }: ChatColumnProps) {
  const { config, state, dispatch } = useApp();
  const ui = getUI(config.sourceLanguage);

  const [showTyping, setShowTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [showGetAnimation, setShowGetAnimation] = useState(false);
  const [showReactivate, setShowReactivate] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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
    const { text, alertMsg, summaryUser, summaryAssistant } = parseResponse(data);

    if (text) {
      const reply: Message = { text, type: 'sent', messageType: 'text', timestamp: new Date().toISOString() };
      dispatch({ type: 'ADD_MESSAGE', payload: reply });
      setShowTyping(false);
    } else {
      setShowTyping(false);
      setError(alertMsg || 'No response');
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
        const text = Object.entries(summaryAssistant).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n');
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
      setError(err.message);
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
      setError(err.message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  async function sendMessage() {
    const text = inputText.trim();
    if (!text) return;

    pulseBtn();

    // If already loading, abort current and merge
    if (state.loading && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;

      const msg2: Message = { text, type: 'received', messageType: 'text', timestamp: new Date().toISOString() };
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
        setError(err.message);
      } finally {
        abortRef.current = null;
        dispatch({ type: 'SET_LOADING', payload: false });
        textareaRef.current?.focus();
      }
      return;
    }

    // Language check for first 3 messages
    if (state.ins < 3 && text.split(/\s+/).length > 2) {
      const langOk = await checkLanguage(text, config.sourceLanguage);
      if (!langOk) {
        onShowLangWarn();
        return;
      }
    }

    setError(null);

    const msg: Message = { text, type: 'received', messageType: 'text', timestamp: new Date().toISOString() };
    dispatch({ type: 'ADD_MESSAGE', payload: msg });
    setInputText('');

    dispatch({ type: 'SET_LOADING', payload: true });
    setShowTyping(true);

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
      setError(err.message);
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
      {error && (
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

      {/* Input Bar */}
      <div className="input-bar">
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
    </div>
  );
}
