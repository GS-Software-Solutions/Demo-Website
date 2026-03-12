'use client';

import { useApp } from '@/lib/store/AppContext';
import { getUI } from '@/data/ui-labels';
import { LANG_LOCATIONS } from '@/data/lang-locations';
import { RANDOM_CUSTOMERS, RANDOM_MODERATORS } from '@/data/random-profiles';
import { pick } from '@/lib/utils';

const LANGUAGES: Record<string, string> = {
  de: '\u{1F1E9}\u{1F1EA} German',
  en: '\u{1F1EC}\u{1F1E7} English',
  fr: '\u{1F1EB}\u{1F1F7} French',
  es: '\u{1F1EA}\u{1F1F8} Spanish',
  it: '\u{1F1EE}\u{1F1F9} Italian',
  nl: '\u{1F1F3}\u{1F1F1} Dutch',
  pt: '\u{1F1F5}\u{1F1F9} Portuguese',
  pl: '\u{1F1F5}\u{1F1F1} Polish',
  tr: '\u{1F1F9}\u{1F1F7} Turkish',
  ru: '\u{1F1F7}\u{1F1FA} Russian',
  sv: '\u{1F1F8}\u{1F1EA} Swedish',
  da: '\u{1F1E9}\u{1F1F0} Danish',
  no: '\u{1F1F3}\u{1F1F4} Norwegian',
  fi: '\u{1F1EB}\u{1F1EE} Finnish',
  ro: '\u{1F1F7}\u{1F1F4} Romanian',
  cs: '\u{1F1E8}\u{1F1FF} Czech',
  hu: '\u{1F1ED}\u{1F1FA} Hungarian',
};

export default function TopBar() {
  const { config, state, dispatch } = useApp();
  const ui = getUI(config.sourceLanguage);

  function handleLanguageChange(code: string) {
    dispatch({ type: 'SET_LANGUAGE', payload: code });

    // Update city/country locations if no messages yet
    if (state.messages.length === 0) {
      const locations = LANG_LOCATIONS[code] || LANG_LOCATIONS['en'];
      const custLoc = pick(locations);
      const modLoc = pick(locations);
      if (custLoc) {
        dispatch({ type: 'SET_FIELD', payload: { path: 'customer.city', value: custLoc.city } });
        dispatch({ type: 'SET_FIELD', payload: { path: 'customer.postalCode', value: custLoc.postalCode } });
        dispatch({ type: 'SET_FIELD', payload: { path: 'customer.country', value: custLoc.country } });
      }
      if (modLoc) {
        dispatch({ type: 'SET_FIELD', payload: { path: 'moderator.city', value: modLoc.city } });
        dispatch({ type: 'SET_FIELD', payload: { path: 'moderator.postalCode', value: modLoc.postalCode } });
        dispatch({ type: 'SET_FIELD', payload: { path: 'moderator.country', value: modLoc.country } });
      }

      // Translate profile fields if no messages
      const poolCust = RANDOM_CUSTOMERS[code] || RANDOM_CUSTOMERS['en'];
      const poolMod = RANDOM_MODERATORS[code] || RANDOM_MODERATORS['en'];
      if (poolCust && poolMod) {
        const cSync = poolCust.find((p: any) => p.name === config.customer.name) || pick(poolCust) || poolCust[0];
        const mSync = poolMod.find((p: any) => p.name === config.moderator.name) || pick(poolMod) || poolMod[0];
        const fields = ['occupation', 'education', 'hobbies', 'music', 'movies', 'relationshipStatus', 'lookingFor', 'bodyType', 'eyeColor', 'smoking', 'housing', 'personality'];
        if (cSync) {
          fields.forEach(f => {
            if (cSync[f] !== undefined) dispatch({ type: 'SET_FIELD', payload: { path: `customer.${f}`, value: cSync[f] } });
          });
        }
        if (mSync) {
          fields.forEach(f => {
            if (mSync[f] !== undefined) dispatch({ type: 'SET_FIELD', payload: { path: `moderator.${f}`, value: mSync[f] } });
          });
        }
      }
    }
  }

  return (
    <div className="topbar">
      <div className="topbar-logo">
        SexyTalk.io <span>| Demo</span>
      </div>

      <div className="topbar-divider" />

      <div className="lang-wrap">
        <span className="lang-label">{ui.labelLanguage}</span>
        <select
          id="langSelect"
          value={config.sourceLanguage}
          onChange={e => handleLanguageChange(e.target.value)}
        >
          {Object.entries(LANGUAGES).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
      </div>

      <div className="lang-wrap">
        <span className="lang-label">{ui.labelMinLength}</span>
        <input
          id="minLengthInput"
          type="number"
          value={config.minLength}
          onChange={e => dispatch({ type: 'SET_MIN_LENGTH', payload: parseInt(e.target.value) || 0 })}
        />
      </div>

      <div className="status-pill" style={{ gap: 14 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          In: <strong
            contentEditable
            suppressContentEditableWarning
            onBlur={e => {
              const val = parseInt(e.currentTarget.textContent || '0') || 0;
              dispatch({ type: 'SET_FIELD', payload: { path: '_ins', value: val } });
            }}
            style={{ color: 'var(--text)', minWidth: 20, display: 'inline-block', outline: 'none', cursor: 'text' }}
          >{state.ins}</strong>
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Out: <strong
            contentEditable
            suppressContentEditableWarning
            onBlur={e => {
              const val = parseInt(e.currentTarget.textContent || '0') || 0;
              dispatch({ type: 'SET_FIELD', payload: { path: '_outs', value: val } });
            }}
            style={{ color: 'var(--text)', minWidth: 20, display: 'inline-block', outline: 'none', cursor: 'text' }}
          >{state.outs}</strong>
        </span>
        <button
          onClick={() => dispatch({ type: 'CLEAR_CHAT' })}
          title="Clear chat"
          style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text-muted)', fontSize: 11,
            padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
            transition: 'all .2s',
          }}
        >
          Clear
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="status-dot" />
          <span>{ui.statusLive}</span>
        </div>
      </div>
    </div>
  );
}
