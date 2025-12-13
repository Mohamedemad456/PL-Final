// Role: Authentication & Token Management (Server Actions)
// Developer: Mohamed Emad
'use server';

import { cookies } from 'next/headers';
import { generateToken } from '@/lib/token';

/**
 * Server Action: Generate token and save to HTTP-only cookie
 * @param userId - The user ID to generate token for
 * @returns Object with success status and token
 */
export async function createToken(userId: string) {
  try {
    // Validate userId
    if (!userId) {
      return {
        success: false,
        error: 'UserId is required',
      };
    }

    // Convert to string if it's not already
    const userIdString = String(userId);

    // Generate token
    const token = await generateToken(userIdString);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60, // 5 minutes for testing
      path: '/',
    });

    return {
      success: true,
      token,
    };
  } catch (error) {
    console.error('Token generation error:', error);
    return {
      success: false,
      error: 'Failed to generate token',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Server Action: Remove auth token cookie (logout)
 * @returns Object with success status
 */
export async function deleteToken() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Token deletion error:', error);
    return {
      success: false,
      error: 'Failed to delete token',
    };
  }
}

