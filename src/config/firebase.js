// src/config/firebase.js - Firebase initialization and utilities
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// User's provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACqPBkWk2F4LzR1GIXBDgGLQWXqnJWRA0",
  authDomain: "electrofix-5306f.firebaseapp.com",
  projectId: "electrofix-5306f",
  storageBucket: "electrofix-5306f.firebasestorage.app",
  messagingSenderId: "196612259734",
  appId: "1:196612259734:web:79ec3b2d5722170c6127b7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Operation types for Firestore error tracking
export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

/**
 * Handles Firestore security and permission errors gracefully by constructing 
 * structured context logs.
 */
export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
