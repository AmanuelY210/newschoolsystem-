// =====================================================
// Firebase Web SDK Configuration
// Copy this to any project that uses Firebase
// =====================================================
// Project: amanuelschool-78888
// Console: https://console.firebase.google.com/project/amanuelschool-78888

import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyCLNBAMGP14NleTPkgqgn6wCqMLXvmHqVA',
  authDomain: 'amanuelschool-78888.firebaseapp.com',
  databaseURL: 'https://newschool-15515-default-rtdb.firebaseio.com',
  projectId: 'amanuelschool-78888',
  storageBucket: 'amanuelschool-78888.firebasestorage.app',
  messagingSenderId: '964618295727',
  appId: '1:964618295727:web:e19a1bdd4a58fbde84375a',
  measurementId: 'G-65ZTJ3FL7S',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getDatabase(app)
export const storage = getStorage(app)

// Analytics (browser only)
export let analytics: any = null
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app)
  }).catch(() => {})
}

export { app }
export default app
