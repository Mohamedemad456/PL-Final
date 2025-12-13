// Role: Authentication & Token Management (Client-side)
// Developer: Mohamed Emad
'use client';

/**
 * Client-side token utilities for localStorage
 * These functions work with tokens stored in localStorage for client-side access
 */

/**
 * Client-side: Saves token to localStorage
 * @param token - The JWT token to save
 */
export function saveTokenToLocalStorage(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-token', token);
  }
}

/**
 * Client-side: Gets token from localStorage
 * @returns string | null - The token or null if not found
 */
export function getTokenFromLocalStorage(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token');
  }
  return null;
}

/**
 * Client-side: Removes token from localStorage
 */
export function removeTokenFromLocalStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token');
  }
}

/**
 * Client-side: Decodes JWT token without verification (for client-side use only)
 * Note: This does NOT verify the token signature - use verifyToken for server-side
 * @param token - The JWT token to decode
 * @returns { userId: string } | null - Decoded payload or null if invalid
 */
function decodeTokenUnsafe(token: string): { userId: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }
    
    return decoded as { userId: string };
  } catch (error) {
    return null;
  }
}

/**
 * Client-side: Gets userId from token in localStorage
 * @returns string | null - The userId or null if token is invalid/expired
 */
export function getUserIdFromLocalStorage(): string | null {
  const token = getTokenFromLocalStorage();
  if (!token) return null;

  const decoded = decodeTokenUnsafe(token);
  return decoded?.userId || null;
}

