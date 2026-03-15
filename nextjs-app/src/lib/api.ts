import { AppConfig, AppState, Message } from '@/types';
import { mergeTrailingCustomerMsgs, LANG_FULL } from './utils';

const VALID_COUNTRIES = new Set(['DE','AT','CH','FR','ES','IT','GB','NL','BE','LU','IE','PT','DK','SE','NO','FI','IS','PL','CZ','SK','HU','RO','BG','GR','HR','SI','EE','LV','LT','MT','CY','LI','MC','SM','VA','AD','AL','BA','MD','ME','MK','RS','TR','UA','BY','RU','XK','US']);
function safeCountry(c: string): string { return VALID_COUNTRIES.has(c) ? c : 'DE'; }

export function buildPayload(config: AppConfig, state: AppState) {
  return {
    origin: {
      url: config.datingApp && state.ins <= 3 ? 'https://teddy-sys-mod.de' : 'https://' + config.origin,
      noCache: true,
      pageType: config.datingApp && state.ins <= 3 ? 'https://teddy-sys-mod.de' : 'https://' + config.origin,
      clientType: 'server',
      accountUsername: '216',
      extensionVersion: '1.0.25',
    },
    ...(config.datingApp && state.ins <= 3 ? { keywords: ['Werbe Profil'] } : config.extraInfo ? { keywords: [config.extraInfo] } : {}),
    bypassCache: true,
    siteInfos: {
      ins: state.ins,
      outs: state.outs,
      chatId: state.chatId,
      messages: mergeTrailingCustomerMsgs(state.messages),
      minLength: config.minLength,
      customerInfo: {
        age:                config.customer.birthDate?.age || config.customer.age,
        name:               config.customer.name,
        gender:             config.customer.gender || 'male',
        height:             config.customer.height || '',
        smoking:            config.customer.smoking || '',
        bodyType:           config.customer.bodyType || '',
        eyeColor:           config.customer.eyeColor || '',
        originId:           config.customer.username,
        username:           config.customer.username,
        hairColor:          config.customer.hairColor || '',
        lookingFor:         config.customer.lookingFor || '',
        occupation:         config.customer.occupation || '',
        postalCode:         config.customer.postalCode || '',
        profilePic:         config.customer.profilePic || 'has no profile picture',
        hasPictures:        config.customer.hasPictures || false,
        hasProfilePic:      !!config.customer.profilePic,
        relationshipStatus: config.customer.relationshipStatus || '',
        hobbies:            config.customer.hobbies || '',
        personality:        config.customer.personality || '',
        education:          config.customer.education || '',
        city:               config.customer.city || '',
        country:            safeCountry(config.customer.country || 'DE'),
        music:              config.customer.music || '',
        movies:             config.customer.movies || '',
      },
      moderatorInfo: {
        age:                config.moderator.birthDate?.age || config.moderator.age,
        name:               config.moderator.name,
        gender:             config.moderator.gender || 'female',
        originId:           config.moderator.username,
        username:           config.moderator.username,
        occupation:         config.moderator.occupation || '',
        hobbies:            config.moderator.hobbies || '',
        personality:        config.moderator.personality || '',
        education:          config.moderator.education || '',
        bodyType:           config.moderator.bodyType || '',
        height:             config.moderator.height || '',
        eyeColor:           config.moderator.eyeColor || '',
        hairColor:          config.moderator.hairColor || '',
        smoking:            config.moderator.smoking || '',
        relationshipStatus: config.moderator.relationshipStatus || '',
        lookingFor:         config.moderator.lookingFor || '',
        postalCode:         config.moderator.postalCode || '',
        country:            safeCountry(config.moderator.country || 'DE'),
        music:              config.moderator.music || '',
        movies:             config.moderator.movies || '',
        profilePic:         config.moderator.profilePic || '',
        hasPictures:        config.moderator.hasPictures || false,
        hasProfilePic:      !!config.moderator.profilePic,
        privateGallery:     (config.moderator.privateGallery || []).filter(url => !state.sentImages.includes(url)),
      },
      sessionStart: state.sessionStart,
      customerNotes: [
        config.customerNotes.trim(),
        config.datingApp && config.datingAppCustomerInfo?.trim()
          ? 'Previous Dating App Info: ' + config.datingAppCustomerInfo.trim()
          : '',
      ].filter(Boolean).join('\n') || '',
      sendToMaestro: false,
      ...(config.datingApp ? { extraVariables: [{ key: 'Dating App', value: true }] } : {}),
      moderatorNotes: [
        config.moderatorNotes.trim(),
        config.datingApp && config.datingAppModeratorInfo?.trim()
          ? 'Previous Dating App Info: ' + config.datingAppModeratorInfo.trim()
          : '',
        config.datingApp && config.datingAppSpamMessage?.trim()
          ? 'Spam Message (reason she cannot text on dating app): ' + config.datingAppSpamMessage.trim()
          : '',
      ].filter(Boolean).join('\n') || '',
      ...(config.sourceLanguage && config.sourceLanguage !== 'de'
        ? { sourceLanguage: (LANG_FULL[config.sourceLanguage]?.toLowerCase() || config.sourceLanguage.toLowerCase()) }
        : {}),
    },
  };
}

export async function callAPI(config: AppConfig, state: AppState, signal?: AbortSignal) {
  const payload = buildPayload(config, state);
  console.log('\ud83d\udce4 PAYLOAD:', JSON.stringify(payload, null, 2));
  const res = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  const rawText = await res.text();
  console.log('\ud83d\udce5 RAW RESPONSE:', rawText);
  if (!rawText) throw new Error(`Empty response (HTTP ${res.status})`);
  const data = JSON.parse(rawText);
  if (!data) throw new Error('Null response from API');
  // Always return data for BLOCK_MINOR so handleResponse can show the popup
  if (/BLOCK_MINOR/i.test(rawText)) return data;
  if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
  return data;
}

export async function checkLanguage(text: string, sourceLanguage: string): Promise<boolean> {
  const fullLang = LANG_FULL[sourceLanguage] || sourceLanguage;
  try {
    const resp = await fetch('/api/langcheck', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sourceLanguage: fullLang }),
    });
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    if (content.includes('<NO/>')) return false;
  } catch (e) {
    console.warn('Language check failed:', e);
  }
  return true;
}

export function parseResponse(data: any): {
  text: string | null;
  alertMsg: string | null;
  summaryUser: Record<string, any> | null;
  summaryAssistant: Record<string, any> | null;
  minorDetected: boolean;
  assets: { imageUrl: string; resText: string }[];
} {
  const raw = data.translation?.translatedText || data.inferenceCallResponse?.content || data.resText;
  const text = raw ? raw.replace(/[-:\u2013\u2014\u2012\u2015]/g, '') : null;

  // Check for minor detection: trigger=BLOCK_MINOR or action=BLOCK_REQUEST from checker
  const checkerReason =
    data.inferenceCallResponse?.inputCheckerResult?.reason ||
    data.inferenceCallResponse?.inputCheckerResult?.result ||
    '';
  const jsonStr = JSON.stringify(data);
  const minorDetected = /BLOCK_MINOR/i.test(jsonStr) || /minor[\s_]*(detected|check)|check[\s_]*minor|underage/i.test(jsonStr);

  let alertMsg: string | null = null;
  if (!text) {
    alertMsg = minorDetected
      ? '⛔ Minor detected – response blocked'
      : checkerReason
        ? `[Input blocked: ${checkerReason}]`
        : data.alert
          ? `[API Alert: ${data.alert}]`
          : '[No response text]';
  }

  const summary = data.translation?.translatedSummary || data.summary;
  const summaryUser = summary?.user && Object.keys(summary.user).length ? summary.user : null;
  const summaryAssistant = summary?.assistant && Object.keys(summary.assistant).length ? summary.assistant : null;

  const assets: { imageUrl: string; resText: string }[] = (data.inferenceCallResponse?.assetsToSend || [])
    .filter((a: any) => a.imageUrl && a.resText)
    .map((a: any) => ({ imageUrl: a.imageUrl, resText: a.resText }));

  return { text, alertMsg, summaryUser, summaryAssistant, minorDetected, assets };
}
