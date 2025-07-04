import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import * as admin from 'firebase-admin';

// Firebase client configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVDVAQuxCogFRzdy28isE6pp1ySqqcXK4",
  authDomain: "mother-line-b9390.firebaseapp.com",
  projectId: "mother-line-b9390",
  storageBucket: "mother-line-b9390.firebasestorage.app",
  messagingSenderId: "908046010675",
  appId: "1:908046010675:web:979e942a9effbba07c1646",
  measurementId: "G-P1X7NGZQVN"
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