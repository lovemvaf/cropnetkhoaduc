import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { db, UserRecord } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'cropnet-dongnai-ai-secure-secret-key-2026-min32chars';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'cropnet-dongnai-ai-refresh-secure-secret-2026-min32chars';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateTokens(user: UserRecord) {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getUserFromRequest(request: NextRequest): UserRecord | null {
  let token: string | null = null;

  // 1. Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 2. Fallback to cookie
  if (!token) {
    token = request.cookies.get('accessToken')?.value || request.cookies.get('token')?.value || null;
  }

  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload) return null;

  return db.findUserById(payload.userId);
}

export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production';

  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 // 1 day
  });

  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });

  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set('accessToken', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0
  });

  return response;
}
