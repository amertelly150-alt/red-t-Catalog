import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const ADMIN_COOKIE = 'red_t_admin';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET must be configured.');
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

function getCookie(req: Request, name: string): string | undefined {
  const cookies = req.headers.cookie?.split(';') ?? [];
  const prefix = `${name}=`;
  const cookie = cookies.find((value) => value.trim().startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.trim().slice(prefix.length)) : undefined;
}

export function adminCredentialsConfigured(): boolean {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET);
}

export function areAdminCredentialsValid(username: string, password: string): boolean {
  const configuredUsername = process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredUsername || !configuredPassword || !adminCredentialsConfigured()) return false;

  const usernameMatches = safeEqual(username, configuredUsername);
  const passwordMatches = safeEqual(password, configuredPassword);
  return usernameMatches && passwordMatches;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function setAdminSession(res: Response): void {
  const issuedAt = Date.now().toString();
  const payload = `${issuedAt}.${randomBytes(18).toString('hex')}`;
  const value = `${payload}.${sign(payload)}`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.append(
    'Set-Cookie',
    `${ADMIN_COOKIE}=${encodeURIComponent(value)}; Path=/api; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure}`,
  );
}

export function clearAdminSession(res: Response): void {
  res.append(
    'Set-Cookie',
    `${ADMIN_COOKIE}=; Path=/api; Max-Age=0; HttpOnly; SameSite=Lax`,
  );
}

export function isAdminAuthenticated(req: Request): boolean {
  if (!adminCredentialsConfigured()) return false;
  const value = getCookie(req, ADMIN_COOKIE);
  if (!value) return false;

  const signatureStart = value.lastIndexOf('.');
  if (signatureStart <= 0) return false;
  const payload = value.slice(0, signatureStart);
  const receivedSignature = value.slice(signatureStart + 1);
  const issuedAt = Number(payload.split('.')[0]);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > SESSION_MAX_AGE_SECONDS * 1000) return false;

  return safeEqual(receivedSignature, sign(payload));
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return;
  }
  next();
}