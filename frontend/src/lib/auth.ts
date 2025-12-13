// Role: Authentication & Authorization
// Developer: Mohamed Emad
import { cookies } from 'next/headers';
import { verifyToken } from './token';

/**
 * Server-side: Gets the authenticated user ID from the token in cookies
 * @returns Promise<string | null> - The userId or null if not authenticated
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  const decoded = await verifyToken(token);
  return decoded?.userId || null;
}

/**
 * Server-side: Checks if user is authenticated
 * @returns Promise<boolean>
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getAuthenticatedUserId();
  return userId !== null;
}

