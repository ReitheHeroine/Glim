// -----------------------------------------------------------------------------
// Title:       App.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-25
// Last Modified: 2026-03-26
// Purpose:     Root application component. Gates the app behind Firebase Auth.
//              Listens for auth state changes and routes to SignIn or DesktopPet.
//              Creates the Firestore user document on first sign-in. Starts and
//              stops the background sync service with the auth lifecycle.
// Inputs:      Firebase auth, db from firebase.js
// Outputs:     Renders SignIn (unauthenticated), DesktopPet (authenticated),
//              or a blank loading screen while auth state resolves.
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { startSync, stopSync } from './sync';
import DesktopPet from './DesktopPet.jsx';
import SignIn from './SignIn.jsx';

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
        startSync(currentUser.uid);
      } else {
        stopSync();
      }
      setUser(currentUser ?? null);
    });
    return unsubscribe;
  }, []);

  // Loading: auth state not resolved yet - blank dark screen to avoid flash
  if (user === undefined) {
    return <div style={{ width: '100vw', height: '100vh', background: '#020108' }} />;
  }

  if (!user) {
    return <SignIn />;
  }

  return <DesktopPet />;
}
