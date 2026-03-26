// title: storage.js
// project: Glim
// author: Reina Hastings
// contact: reinahastings13@gmail.com
// date created: 2026-03-25
// last modified: 2026-03-25
//
// purpose:
//   Polyfills window.storage with a localStorage-backed implementation.
//   The Glim codebase uses the window.storage async API (originally from the
//   Claude artifact environment). This shim maps those calls to localStorage
//   so the same storage code works in a standalone browser context.
//
// inputs:
//   - Browser localStorage API
//
// outputs:
//   - Sets window.storage on the global object (side effect on import)

window.storage = {
  async get(key) {
    const val = localStorage.getItem(key);
    if (val === null) throw new Error('Key not found');
    return { key, value: val, shared: false };
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value, shared: false };
  },
  async delete(key) {
    localStorage.removeItem(key);
    return { key, deleted: true, shared: false };
  },
  async list(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!prefix || k.startsWith(prefix)) keys.push(k);
    }
    return { keys, shared: false };
  }
};
