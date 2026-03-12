'use client';

import { useRef } from 'react';
import { useApp } from '@/lib/store/AppContext';
import { getUI, UI_LABELS } from '@/data/ui-labels';
import { LANG_LOCATIONS } from '@/data/lang-locations';
import { RANDOM_CUSTOMERS, RANDOM_MODERATORS, MODERATOR_PHOTO_SETS } from '@/data/random-profiles';
import { pick, isFemale } from '@/lib/utils';
import type { Profile } from '@/types';

interface ProfilePanelProps {
  side: 'customer' | 'moderator';
  onLightbox: (src: string) => void;
  onOpenDatingModal?: () => void;
  onGenderMismatch?: () => void;
}

const PROFILE_FIELDS: Array<{ key: string; labelKey: string; customerOnly?: boolean }> = [
  { key: 'name', labelKey: 'keyName' },
  { key: 'username', labelKey: 'keyUsername' },
  { key: 'age', labelKey: 'keyAge' },
  { key: 'city', labelKey: 'keyCity', customerOnly: true },
  { key: 'country', labelKey: 'keyCountry' },
  { key: 'gender', labelKey: 'keyGender' },
  { key: 'relationshipStatus', labelKey: 'keyStatus' },
  { key: 'occupation', labelKey: 'keyJob' },
  { key: 'hobbies', labelKey: 'keyHobbies' },
  { key: 'personality', labelKey: 'keyPersonality' },
  { key: 'lookingFor', labelKey: 'keyLookingFor' },
  { key: 'education', labelKey: 'keyEducation' },
  { key: 'bodyType', labelKey: 'keyBodyType' },
  { key: 'height', labelKey: 'keyHeight' },
  { key: 'eyeColor', labelKey: 'keyEyeColor' },
  { key: 'smoking', labelKey: 'keySmoking' },
  { key: 'hasCar', labelKey: 'keyHasCar' },
  { key: 'housing', labelKey: 'keyHousing' },
  { key: 'movies', labelKey: 'keyMovies' },
  { key: 'music', labelKey: 'keyMusic' },
];

export default function ProfilePanel({ side, onLightbox, onOpenDatingModal, onGenderMismatch }: ProfilePanelProps) {
  const { config, state, dispatch, modIndexRef, modPhotoIndexRef } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = config[side];
  const ui = getUI(config.sourceLanguage);
  const enUI = UI_LABELS['en'];
  const isCustomer = side === 'customer';
  const isMod = side === 'moderator';

  function getFieldValue(key: string): string {
    if (key === 'age') {
      return String(profile.birthDate?.age || profile.age || '');
    }
    const val = profile[key];
    if (typeof val === 'boolean') {
      return val ? 'Yes' : 'No';
    }
    return String(val ?? '');
  }

  function handleFieldBlur(key: string, el: HTMLElement) {
    const value = (el.textContent || '').trim();
    let stored: any = value;

    if (key === 'gender') {
      stored = isFemale(value) ? 'female' : 'male';
      el.textContent = stored.charAt(0).toUpperCase() + stored.slice(1);
    }

    dispatch({ type: 'SET_FIELD', payload: { path: `${side}.${key}`, value: stored } });

    if (key === 'age') {
      const num = parseInt(value);
      if (!isNaN(num)) {
        dispatch({ type: 'SET_FIELD', payload: { path: `${side}.birthDate`, value: { age: num, date: new Date(Date.now() - num * 365.25 * 86400000).toISOString() } } });
      }
    }
  }

  function handleRandomize() {
    const code = config.sourceLanguage || 'en';
    const poolBase = isCustomer ? RANDOM_CUSTOMERS : RANDOM_MODERATORS;
    const pool = poolBase[code] || poolBase['en'];
    if (!pool || !pool.length) return;

    let chosen: any;

    if (isMod) {
      modIndexRef.current = (modIndexRef.current + 1) % pool.length;
      chosen = pool[modIndexRef.current];
    } else {
      const currentName = config[side].name;
      const others = pool.filter((p: any) => p.name !== currentName);
      chosen = others.length ? pick(others) : pick(pool);
    }

    if (!chosen) chosen = pool[0];

    const preserved: Partial<Profile> = {
      id: config[side].id,
      gender: config[side].gender,
    };

    if (isCustomer) {
      preserved.profilePic = config[side].profilePic;
      preserved.hasProfilePic = config[side].hasProfilePic;
      preserved.hasPictures = config[side].hasPictures;
    }

    const newProfile: any = {
      ...preserved,
      name: chosen.name,
      username: chosen.username,
      occupation: chosen.occupation,
      education: chosen.education,
      birthDate: { age: chosen.age, date: new Date(Date.now() - chosen.age * 365.25 * 86400000).toISOString() },
      hobbies: chosen.hobbies,
      music: chosen.music,
      movies: chosen.movies,
      relationshipStatus: chosen.relationshipStatus,
      lookingFor: chosen.lookingFor,
      bodyType: chosen.bodyType,
      height: chosen.height,
      eyeColor: chosen.eyeColor,
      smoking: chosen.smoking,
      hasCar: chosen.hasCar,
      housing: chosen.housing,
      personality: chosen.personality,
    };

    // Override city/country from language locations
    const locations = LANG_LOCATIONS[code] || LANG_LOCATIONS['en'];
    const loc = pick(locations);
    if (loc) {
      newProfile.city = loc.city;
      newProfile.postalCode = loc.postalCode;
      newProfile.country = loc.country;
    }

    // For moderator: cycle through photo sets independently
    if (isMod && MODERATOR_PHOTO_SETS.length > 0) {
      modPhotoIndexRef.current = (modPhotoIndexRef.current + 1) % MODERATOR_PHOTO_SETS.length;
      const photoSet = MODERATOR_PHOTO_SETS[modPhotoIndexRef.current];
      newProfile.profilePic = photoSet.profilePic;
      newProfile.hasProfilePic = true;
      newProfile.hasPictures = true;
      newProfile.privateGallery = photoSet.gallery || [];
    } else if (isMod) {
      newProfile.profilePic = config[side].profilePic;
      newProfile.hasProfilePic = config[side].hasProfilePic;
      newProfile.hasPictures = config[side].hasPictures;
      newProfile.privateGallery = config[side].privateGallery || [];
    }

    dispatch({ type: 'RANDOMIZE_PROFILE', payload: { who: side, profile: newProfile } });
  }

  function handlePicClick() {
    if (isCustomer) {
      if (profile.profilePic) {
        onLightbox(profile.profilePic);
      } else {
        fileInputRef.current?.click();
      }
    } else {
      if (profile.profilePic) {
        onLightbox(profile.profilePic);
      }
    }
  }

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    dispatch({ type: 'SET_CUSTOMER_PIC', payload: url });

    // Convert to base64 and check gender
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/gendercheck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        const detectedGender = data.gender?.toLowerCase();
        const profileGender = config.customer.gender?.toLowerCase() || 'male';
        if (detectedGender && detectedGender !== 'unknown' && detectedGender !== profileGender) {
          onGenderMismatch?.();
        }
      } catch (err) {
        console.warn('Gender check failed:', err);
      }
    };
    reader.readAsDataURL(file);
  }

  const summaryData = isCustomer ? state.summaryUser : state.summaryAssistant;
  const hasSummary = summaryData && Object.keys(summaryData).length > 0;
  const notes = isCustomer ? config.customerNotes : config.moderatorNotes;

  return (
    <div className={`profile-panel ${isCustomer ? 'left' : 'right'}`}>
      <div className="profile-scroll">
        {/* Hero */}
        <div className="profile-hero">
          <div className="pic-wrap">
            <div className="pic-ring" onClick={handlePicClick}>
              {profile.profilePic ? (
                <img src={profile.profilePic} alt={profile.name} />
              ) : (
                isCustomer ? '\u{1F464}' : '\u{1F3AD}'
              )}
            </div>
            <div className="pic-overlay" onClick={handlePicClick}>
              {profile.profilePic ? 'View' : 'Upload'}
            </div>
            <div className="online-badge" />
          </div>

          {isCustomer && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChosen}
            />
          )}

          <div
            className="edit-name"
            contentEditable
            suppressContentEditableWarning
            onBlur={e => {
              const val = (e.currentTarget.textContent || '').trim();
              dispatch({ type: 'SET_FIELD', payload: { path: `${side}.name`, value: val } });
            }}
          >
            {profile.name}
          </div>

          {isCustomer && (
            <label className="dating-toggle">
              <input
                type="checkbox"
                checked={config.datingApp}
                onChange={() => {
                  dispatch({ type: 'TOGGLE_DATING' });
                  if (!config.datingApp && onOpenDatingModal) onOpenDatingModal();
                }}
              />
              <div className="toggle-track">
                <div className="toggle-thumb" />
              </div>
              <span className="toggle-label">{ui.toggleDatingApp}</span>
            </label>
          )}

          <button className="randomize-btn" onClick={handleRandomize}>
            {'↻'} {side === 'customer' ? 'New Customer' : 'New Moderator'}
          </button>
        </div>

        {/* Summary Section */}
        {hasSummary && (
          <div className="info-section">
            <div className="section-label">{ui.sectionAiLearned}</div>
            <div className={`summary-card visible`}>
              {Object.entries(summaryData).map(([k, v]) => (
                <div className="summary-row" key={k}>
                  <span className="sk">{k}</span>
                  <span>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="info-section">
          <div className="section-label">{ui.sectionPersona}</div>
          {PROFILE_FIELDS.filter(f => !f.customerOnly || isCustomer).map(field => {
            // Field labels always stay in English
            const label = enUI[field.labelKey] || field.key;
            return (
              <div className="info-row" key={field.key}>
                <div className="k">{label}</div>
                <div
                  className="v"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleFieldBlur(field.key, e.currentTarget)}
                >
                  {getFieldValue(field.key)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Notes Section */}
        <div className="info-section">
          <div className="section-label">{ui.sectionNotes}</div>
          <div
            className="edit-area"
            contentEditable
            suppressContentEditableWarning
            onBlur={e => {
              const val = (e.currentTarget.textContent || '').trim();
              dispatch({
                type: 'SET_NOTES',
                payload: { field: isCustomer ? 'customerNotes' : 'moderatorNotes', value: val },
              });
            }}
          >
            {notes}
          </div>
        </div>

        {/* Private Gallery (moderator only) */}
        {isMod && profile.privateGallery && profile.privateGallery.length > 0 && (
          <div className="info-section">
            <div className="section-label">
              {ui.sectionGallery} <span style={{ fontWeight: 400, fontSize: '9px' }}>{ui.galleryNote}</span>
            </div>
            <div className="gallery-grid">
              {profile.privateGallery.filter(Boolean).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Gallery ${i + 1}`}
                  onClick={() => onLightbox(src)}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
