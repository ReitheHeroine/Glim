// -----------------------------------------------------------------------------
// Title:       SignIn.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-26
// Last Modified: 2026-03-29
// Purpose:     Sign-in screen shown to unauthenticated users. Handles Google
//              sign-in via Firebase Auth. Uses signInWithRedirect on iOS PWA
//              (standalone mode) because WebKit blocks popups there; falls back
//              to signInWithPopup on desktop and regular browser tabs.
// Inputs:      Firebase auth and googleProvider from firebase.js
// Outputs:     Triggers onAuthStateChanged in App.jsx on successful sign-in
// Usage:       Rendered by App.jsx when auth state is null (not signed in)
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

// iOS PWA (standalone) blocks popups - detect and route accordingly
const isStandalone =
  window.navigator.standalone === true ||
  window.matchMedia('(display-mode: standalone)').matches;

// --- Google "G" logo SVG (inline, official brand colors) ---

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

// --- Sign-in screen ---

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    try {
      if (isStandalone) {
        // Redirect flow: page navigates to Google and back.
        // onAuthStateChanged in App.jsx fires automatically on return.
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
        // App.jsx onAuthStateChanged fires and transitions to DesktopPet
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('sign-in failed - try again');
      }
      setLoading(false);
    }
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 60%, #1a0a2e 0%, #080415 50%, #020108 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>

      {/* Subtle star field */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 60 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 137.5) % 100}%`,
            top: `${(i * 97.3) % 100}%`,
            width: i % 7 === 0 ? '2px' : '1px',
            height: i % 7 === 0 ? '2px' : '1px',
            borderRadius: '50%',
            background: 'white',
            opacity: 0.2 + (i % 5) * 0.12,
          }} />
        ))}
      </div>

      {/* Sign-in card */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '48px 40px',
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        maxWidth: '340px',
        width: '90%',
        textAlign: 'center',
      }}>

        {/* Icon */}
        <img
          src={`${import.meta.env.BASE_URL}glim-icon.svg`}
          alt="Glim"
          style={{ width: '80px', height: '80px', borderRadius: '20px' }}
        />

        {/* Name + tagline */}
        <div>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            letterSpacing: '0.05em',
            color: 'transparent',
            backgroundImage: 'linear-gradient(135deg, #c084fc, #818cf8, #67e8f9)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            marginBottom: '8px',
          }}>
            glim
          </div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            your little companion is waiting
          </div>
        </div>

        {/* Google sign-in button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '11px 20px',
            background: loading ? 'rgba(255,255,255,0.7)' : 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#1f2937',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <GoogleIcon />
          {loading ? 'signing in...' : 'continue with google'}
        </button>

        {/* Error message */}
        {error && (
          <div style={{ fontSize: '0.8rem', color: '#f87171' }}>
            {error}
          </div>
        )}

        {/* Footer note */}
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
          sign-in keeps your data synced across devices
        </div>

      </div>
    </div>
  );
}
