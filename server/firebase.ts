import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import * as admin from 'firebase-admin';

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyAhMSmfBU9FMlQ6P4Nigqv-xNoKU48CRWg',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'mother-line.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'mother-line',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'mother-line.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '532699746424',
  appId: process.env.FIREBASE_APP_ID || '1:532699746424:web:e892b2120b6f4252be5d8d'
};

// Initialize Firebase client
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };

// Initialize Firebase Admin SDK only if service account is provided
let adminApp: admin.app.App | null = null;
let adminDb: any = null;
let adminStorage: any = null;
let adminAuth: any = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_PROJECT_ID) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    adminApp = admin.apps.length === 0 
      ? admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        })
      : admin.app();
    
    adminDb = admin.firestore();
    adminStorage = admin.storage();
    adminAuth = admin.auth();
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export { adminDb, adminStorage, adminAuth };

export { admin };