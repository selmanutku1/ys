/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, OAuthProvider, signOut, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Setup Microsoft Provider with Calendar Scopes
const provider = new OAuthProvider('microsoft.com');
provider.addScope('Calendars.Read');
provider.addScope('Calendars.ReadWrite');

// Cache token in memory
let cachedAccessToken: string | null = null;

export const signInWithMicrosoft = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = OAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Microsoft Auth response did not contain an access token.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error) {
    console.error('Error signing in with Microsoft:', error);
    throw error;
  }
};

export const getCachedToken = (): string | null => {
  return cachedAccessToken || localStorage.getItem('kys_microsoft_manual_token');
};

export const saveManualToken = (token: string): void => {
  localStorage.setItem('kys_microsoft_manual_token', token);
};

export const logoutMicrosoft = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  localStorage.removeItem('kys_microsoft_manual_token');
};
