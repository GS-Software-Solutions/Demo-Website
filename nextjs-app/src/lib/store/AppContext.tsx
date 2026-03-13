'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { AppConfig, AppState, Message, Profile } from '@/types';
import { DEFAULT_CONFIG } from '@/lib/config';

/* ---------- helpers ---------- */

function randomChatId(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function initialState(): AppState {
  return {
    messages: [],
    ins: 0,
    outs: 0,
    chatId: randomChatId(),
    sessionStart: new Date().toISOString(),
    loading: false,
    summaryUser: {},
    summaryAssistant: {},
    sentImages: [],
  };
}

function setNestedField(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  if (keys.length === 1) {
    return { ...obj, [keys[0]]: value };
  }
  const [head, ...rest] = keys;
  return { ...obj, [head]: setNestedField(obj[head] || {}, rest.join('.'), value) };
}

/* ---------- actions ---------- */

export type Action =
  | { type: 'RESTORE'; payload: Store }
  | { type: 'SET_CONFIG'; payload: AppConfig }
  | { type: 'UPDATE_CONFIG'; payload: Partial<AppConfig> }
  | { type: 'SET_FIELD'; payload: { path: string; value: any } }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_MIN_LENGTH'; payload: number }
  | { type: 'TOGGLE_DATING' }
  | { type: 'SAVE_DATING_INFO'; payload: { datingAppCustomerInfo: string; datingAppModeratorInfo: string; datingAppSpamMessage: string } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_CHAT' }
  | { type: 'UPDATE_SUMMARY'; payload: { summaryUser?: Record<string, any>; summaryAssistant?: Record<string, any> } }
  | { type: 'SET_CUSTOMER_PIC'; payload: string }
  | { type: 'SET_NOTES'; payload: { field: 'customerNotes' | 'moderatorNotes'; value: string } }
  | { type: 'RANDOMIZE_PROFILE'; payload: { who: 'customer' | 'moderator'; profile: Profile } }
  | { type: 'SET_EXTRA_INFO'; payload: string }
  | { type: 'TRACK_SENT_IMAGE'; payload: string };

/* ---------- reducer ---------- */

interface Store {
  config: AppConfig;
  state: AppState;
}

function reducer(store: Store, action: Action): Store {
  const { config, state } = store;

  switch (action.type) {
    case 'RESTORE':
      return action.payload;

    case 'SET_CONFIG':
      return { ...store, config: action.payload };

    case 'UPDATE_CONFIG':
      return { ...store, config: { ...config, ...action.payload } };

    case 'SET_FIELD':
      if (action.payload.path === '_ins') return { ...store, state: { ...state, ins: action.payload.value } };
      if (action.payload.path === '_outs') return { ...store, state: { ...state, outs: action.payload.value } };
      return { ...store, config: setNestedField(config, action.payload.path, action.payload.value) };

    case 'SET_LANGUAGE':
      return { ...store, config: { ...config, sourceLanguage: action.payload } };

    case 'SET_MIN_LENGTH':
      return { ...store, config: { ...config, minLength: action.payload } };

    case 'TOGGLE_DATING':
      return { ...store, config: { ...config, datingApp: !config.datingApp } };

    case 'SAVE_DATING_INFO':
      return {
        ...store,
        config: {
          ...config,
          datingAppCustomerInfo: action.payload.datingAppCustomerInfo,
          datingAppModeratorInfo: action.payload.datingAppModeratorInfo,
          datingAppSpamMessage: action.payload.datingAppSpamMessage,
        },
      };

    case 'ADD_MESSAGE': {
      const msg = action.payload;
      return {
        ...store,
        state: {
          ...state,
          messages: [...state.messages, msg],
          ins: msg.type === 'received' ? state.ins + 1 : state.ins,
          outs: msg.type === 'sent' ? state.outs + 1 : state.outs,
        },
      };
    }

    case 'SET_LOADING':
      return { ...store, state: { ...state, loading: action.payload } };

    case 'CLEAR_CHAT':
      return {
        ...store,
        state: {
          ...state,
          messages: [],
          ins: 0,
          outs: 0,
          loading: false,
          chatId: randomChatId(),
          sessionStart: new Date().toISOString(),
          summaryUser: {},
          summaryAssistant: {},
          sentImages: [],
        },
      };

    case 'UPDATE_SUMMARY':
      return {
        ...store,
        state: {
          ...state,
          summaryUser: action.payload.summaryUser
            ? { ...state.summaryUser, ...action.payload.summaryUser }
            : state.summaryUser,
          summaryAssistant: action.payload.summaryAssistant
            ? { ...state.summaryAssistant, ...action.payload.summaryAssistant }
            : state.summaryAssistant,
        },
      };

    case 'SET_CUSTOMER_PIC':
      return {
        ...store,
        config: {
          ...config,
          customer: { ...config.customer, profilePic: action.payload, hasProfilePic: !!action.payload },
        },
      };

    case 'SET_NOTES':
      return { ...store, config: { ...config, [action.payload.field]: action.payload.value } };

    case 'RANDOMIZE_PROFILE':
      return { ...store, config: { ...config, [action.payload.who]: action.payload.profile } };

    case 'SET_EXTRA_INFO':
      return { ...store, config: { ...config, extraInfo: action.payload } };

    case 'TRACK_SENT_IMAGE':
      return { ...store, state: { ...state, sentImages: [...state.sentImages, action.payload] } };

    default:
      return store;
  }
}

/* ---------- context ---------- */

interface AppContextValue {
  config: AppConfig;
  state: AppState;
  dispatch: React.Dispatch<Action>;
  modIndexRef: React.MutableRefObject<number>;
  modPhotoIndexRef: React.MutableRefObject<number>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'chatcraft_store';

/* ---------- provider ---------- */

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [store, dispatch] = useReducer(reducer, { config: DEFAULT_CONFIG, state: initialState() });
  const modIndexRef = useRef(0);
  const modPhotoIndexRef = useRef(0);
  const hydrated = useRef(false);

  // Restore from localStorage on mount (SSR-safe)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Store>;
        const savedConfig = (saved.config || {}) as Record<string, unknown>;
        const { apiKey: _deprecatedApiKey, endpoint: _deprecatedEndpoint, ...safeConfig } = savedConfig;
        const restoredConfig = saved.config ? { ...DEFAULT_CONFIG, ...safeConfig } : DEFAULT_CONFIG;
        const restoredState = saved.state ? { ...initialState(), ...saved.state } : initialState();
        dispatch({ type: 'RESTORE', payload: { config: restoredConfig, state: restoredState } });
      }
    } catch {
      // localStorage unavailable or corrupt — use defaults
    }
    hydrated.current = true;
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // storage full or unavailable
    }
  }, [store]);

  const value: AppContextValue = {
    config: store.config,
    state: store.state,
    dispatch,
    modIndexRef,
    modPhotoIndexRef,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* ---------- hook ---------- */

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}
