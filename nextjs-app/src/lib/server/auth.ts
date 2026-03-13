import { createHmac, timingSafeEqual } from 'crypto';

export const AUTH_COOKIE_NAME = 'chatcraft_auth';
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;

const AUTH_TOKEN_VERSION = 'v1';

function getAccessCode(): string {
  return process.env.APP_ACCESS_CODE || process.env.ACCESS_CODE || '';
}

function getCookieSecret(): string {
  return process.env.ACCESS_COOKIE_SECRET || process.env.AUTH_COOKIE_SECRET || '';
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeCompare(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function getAuthConfigurationError(): string | null {
  if (!getAccessCode()) return 'APP_ACCESS_CODE is not configured';
  if (!getCookieSecret()) return 'ACCESS_COOKIE_SECRET is not configured';
  return null;
}

export function isValidAccessCode(input: string): boolean {
  const expected = getAccessCode();
  if (!expected) return false;
  return safeCompare(input, expected);
}

export function createAuthToken(nowMs = Date.now()): string | null {
  const secret = getCookieSecret();
  if (!secret) return null;

  const issuedAt = Math.floor(nowMs / 1000).toString(10);
  const payload = `${AUTH_TOKEN_VERSION}.${issuedAt}`;
  const signature = sign(payload, secret);

  return `${payload}.${signature}`;
}

export function verifyAuthToken(token: string | undefined | null, nowMs = Date.now()): boolean {
  if (!token) return false;

  const secret = getCookieSecret();
  if (!secret) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [version, issuedAtRaw, signature] = parts;
  if (version !== AUTH_TOKEN_VERSION) return false;

  const issuedAt = Number.parseInt(issuedAtRaw, 10);
  if (!Number.isFinite(issuedAt)) return false;

  const nowSeconds = Math.floor(nowMs / 1000);
  if (issuedAt > nowSeconds) return false;
  if (nowSeconds - issuedAt > AUTH_COOKIE_MAX_AGE_SECONDS) return false;

  const payload = `${version}.${issuedAtRaw}`;
  const expectedSignature = sign(payload, secret);

  return safeCompare(signature, expectedSignature);
}

export function isAuthorizedCookieStore(cookieStore: { get(name: string): { value: string } | undefined }): boolean {
  return verifyAuthToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}
