// Role: Authentication & Token Management
// Developer: Mohamed Emad
'use server';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Secret key for signing tokens (in production, use environment variable)
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars'
);

// Token expiration time (1 minute for testing, adjust as needed)
const TOKEN_EXPIRATION = 5 * 60; // 5 minutes for testing

/**
 * Generates a JWT token with userId and expiration timestamp
 * @param userId - The user ID to encode in the token
 * @returns Promise<string> - The signed JWT token
 */
export async function generateToken(userId: string): Promise<string> {
  const expirationTime = Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION; // Current time + expiration in seconds

  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(SECRET_KEY);

  return token;
}

/**
 * Verifies and decodes a JWT token
 * @param token - The JWT token to verify
 * @returns Promise<{ userId: string } | null> - Decoded token payload or null if invalid
 */
export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { userId: string };
  } catch (error) {
    // Token is invalid, expired, or malformed
    return null;
  }
}

/**
 * Saves token to HTTP-only cookie (server-side)
 * @param token - The JWT token to save
 */
export async function saveTokenToCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRATION,
    path: '/',
  });
}

/**
 * Gets token from cookie (server-side)
 * @returns Promise<string | null> - The token or null if not found
 */
export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  return token?.value || null;
}

/**
 * Removes token from cookie (server-side)
 */
export async function removeTokenFromCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

/**
 * Gets userId from token in cookie (server-side)
 * @returns Promise<string | null> - The userId or null if token is invalid/expired
 */
export async function getUserIdFromToken(): Promise<string | null> {
  const token = await getTokenFromCookie();
  if (!token) return null;

  const decoded = await verifyToken(token);
  return decoded?.userId || null;
}
