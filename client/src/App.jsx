// -----------------------------------------------------------------------------
// Title:       App.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-25
// Last Modified: 2026-04-13
// Purpose:     Root application component. Gates the app behind Firebase Auth.
//              Listens for auth state changes and routes to SignIn or DesktopPet.
//              Creates the Firestore user document on first sign-in. Starts and
//              stops the background sync service with the auth lifecycle.
//              On sign-in, checks if the UID changed since last session; if so,
//              clears all localStorage data and reloads stores to prevent
//              cross-user data contamination.
// Inputs:      Firebase auth, db from firebase.js
// Outputs:     Renders SignIn (unauthenticated), DesktopPet (authenticated),
//              or a blank loading screen while auth state resolves.
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { startSync, stopSync } from './sync';
import { useJournalStore } from './stores/useJournalStore';
import { usePokesStore } from './stores/usePokesStore';
import { useSettingsStore } from './stores/useSettingsStore';
import { useWaterStore } from './stores/useWaterStore';
import { useStepsStore } from './stores/useStepsStore';
import DesktopPet from './DesktopPet.jsx';
import SignIn from './SignIn.jsx';
import SplashScreen from './SplashScreen.jsx';

// All localStorage keys owned by Glim (must match SettingsPanel's LOCAL_KEYS + glim-uid)
const GLIM_KEYS = ['glim-water', 'glim-steps', 'glim-journal', 'glim-pokes', 'glim-settings', 'glim-sync-meta'];

// --- Create user document on first sign-in ---
// Uses getDoc check so createdAt is only written once, not overwritten on every login.

async function ensureUserDocument(user) {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      createdAt: serverTimestamp(),
    });
  }
}

// --- Root component ---

export default function App() {
  // undefined = auth state not yet resolved (loading)
  // null      = resolved, no user signed in
  // object    = resolved, user is signed in
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await ensureUserDocument(currentUser);

        // --- UID change detection: clear stale cross-user data ---
        // If a different user signs in on this device, the previous user's
        // localStorage data must be cleared before sync starts, otherwise
        // it would get pushed to Firestore under the new user's UID.
        const storedUid = localStorage.getItem('glim-uid');
        if (storedUid && storedUid !== currentUser.uid) {
          GLIM_KEYS.forEach(k => localStorage.removeItem(k));
          useJournalStore.getState().reload();
          usePokesStore.getState().reload();
          useSettingsStore.getState().reload();
          useWaterStore.getState().reload();
          useStepsStore.getState().reload();
        }
        localStorage.setItem('glim-uid', currentUser.uid);

        startSync(currentUser.uid);
      } else {
        stopSync();
      }
      setUser(currentUser ?? null);
    });
    return unsubscribe;
  }, []);

  // Loading: auth state not resolved yet - show splash screen
  if (user === undefined) {
    return <SplashScreen />;
  }

  if (!user) {
    return <SignIn />;
  }

  return <DesktopPet />;
}
