// =====================================================
// Firebase Admin SDK Configuration
// Copy this to any project that uses Firebase Admin SDK
// =====================================================
// Project: amanuelschool-78888
// Service Account: firebase-adminsdk-fbsvc@amanuelschool-78888.iam.gserviceaccount.com

import { initializeApp, getApps, cert, type App as FirebaseAdminApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getDatabase } from 'firebase-admin/database'
import { getStorage } from 'firebase-admin/storage'

let adminAuth: ReturnType<typeof getAuth> | null = null
let adminDb: ReturnType<typeof getDatabase> | null = null
let adminStorage: ReturnType<typeof getStorage> | null = null

try {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT

  let app: FirebaseAdminApp

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson)
    app = initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
      }),
      databaseURL: 'https://newschool-15515-default-rtdb.firebaseio.com',
      storageBucket: 'amanuelschool-78888.firebasestorage.app',
    })
    console.log('✅ Firebase Admin SDK initialized with service account')
  } else if (getApps().length === 0) {
    app = initializeApp({
      databaseURL: 'https://newschool-15515-default-rtdb.firebaseio.com',
      storageBucket: 'amanuelschool-78888.firebasestorage.app',
    })
    console.log('⚠️ Firebase Admin SDK initialized without service account')
  } else {
    app = getApps()[0]
  }

  adminAuth = getAuth(app)
  adminDb = getDatabase(app)
  adminStorage = getStorage(app)
} catch (error: any) {
  console.log('⚠️ Firebase Admin SDK init error:', error.message)
}

export { adminAuth, adminDb, adminStorage }
