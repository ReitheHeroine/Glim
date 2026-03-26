// -----------------------------------------------------------------------------
// Title:       Firebase Initialization
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-26
// Last Modified: 2026-03-26
// Purpose:     Initializes the Firebase app and exports Firestore and Auth
//              instances for use across the app. Config values are loaded from
//              environment variables so API keys stay out of the public repo.
// Outputs:     Named exports: `db` (Firestore), `auth` (Firebase Auth),
//              `googleProvider` (GoogleAuthProvider)
// Usage:       import { db, auth, googleProvider } from './firebase'
// -----------------------------------------------------------------------------

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// --- Config ---

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- Initialize ---

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
