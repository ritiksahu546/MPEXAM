import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  Firestore,
  FirestoreSettings,
  doc, 
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// Optional fallback to applet configuration if env variables are not explicitly injected
import appletConfig from '../../firebase-applet-config.json';

export interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

// 1. Prioritize Vite Environment Variables (per requirement 1)
const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const envStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const envMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const envAppId = import.meta.env.VITE_FIREBASE_APP_ID;
const envMeasurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

// Fallback gracefully to appletConfig if environment variables are not yet populated
export const firebaseConfig: FirebaseConfigType = {
  apiKey: envApiKey || appletConfig.apiKey || '',
  authDomain: envAuthDomain || appletConfig.authDomain || '',
  projectId: envProjectId || appletConfig.projectId || '',
  storageBucket: envStorageBucket || appletConfig.storageBucket || '',
  messagingSenderId: envMessagingSenderId || appletConfig.messagingSenderId || '',
  appId: envAppId || appletConfig.appId || '',
  measurementId: envMeasurementId || appletConfig.measurementId || '',
  firestoreDatabaseId: appletConfig.firestoreDatabaseId || ''
};

export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey.trim().length > 0 &&
  firebaseConfig.projectId.trim().length > 0
);

export const missingFirebaseEnvVars: string[] = [];
if (!firebaseConfig.apiKey) missingFirebaseEnvVars.push('VITE_FIREBASE_API_KEY');
if (!firebaseConfig.projectId) missingFirebaseEnvVars.push('VITE_FIREBASE_PROJECT_ID');
if (!firebaseConfig.authDomain) missingFirebaseEnvVars.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.storageBucket) missingFirebaseEnvVars.push('VITE_FIREBASE_STORAGE_BUCKET');
if (!firebaseConfig.appId) missingFirebaseEnvVars.push('VITE_FIREBASE_APP_ID');

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);

    // Forces WebChannel long-polling to prevent proxy/iframe connection drops
    const firestoreSettings: FirestoreSettings = {
      experimentalForceLongPolling: true,
    };

    if (firebaseConfig.firestoreDatabaseId) {
      try {
        firestoreInstance = initializeFirestore(appInstance, firestoreSettings, firebaseConfig.firestoreDatabaseId);
      } catch {
        firestoreInstance = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId);
      }
    } else {
      try {
        firestoreInstance = initializeFirestore(appInstance, firestoreSettings);
      } catch {
        firestoreInstance = getFirestore(appInstance);
      }
    }

    try {
      storageInstance = getStorage(appInstance);
    } catch (storageErr) {
      console.warn('Firebase Storage initialization notice:', storageErr);
    }
  } catch (initErr) {
    console.warn('Firebase initialization warning:', initErr);
  }
}

export const app = appInstance;
export const auth = authInstance;
export const db = firestoreInstance;
export const firestore = firestoreInstance;
export const storage = storageInstance;

/**
 * Upload an image file to Firebase Storage with size and MIME validation
 */
export async function uploadImageToStorage(file: File, folder = 'posts'): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized. Please verify your Firebase configuration.');
  }

  // Max 5MB for images
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('इमेज का आकार 5MB से कम होना चाहिए (Image must be under 5MB).');
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    throw new Error('अमान्य इमेज फॉर्मेट! केवल JPG, PNG, WEBP या SVG की अनुमति है।');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${folder}/${Date.now()}_${cleanName}`;
  const fileRef = ref(storage, path);

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type
  });

  return await getDownloadURL(snapshot.ref);
}

/**
 * Upload an official notification PDF to Firebase Storage with validation
 */
export async function uploadPdfToStorage(file: File, folder = 'notifications'): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized. Please verify your Firebase configuration.');
  }

  // Max 15MB for PDF notifications
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('PDF का आकार 15MB से कम होना चाहिए (PDF must be under 15MB).');
  }

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('केवल PDF फाइल अपलोड की जा सकती है (Only PDF files are allowed).');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${folder}/${Date.now()}_${cleanName}`;
  const fileRef = ref(storage, path);

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: 'application/pdf'
  });

  return await getDownloadURL(snapshot.ref);
}

/**
 * Admin authorization check via Firestore 'admins' collection
 */
export async function verifyAdminAuthorization(user: User): Promise<boolean> {
  // Hardcoded owner/superadmin check fallback
  if (user.email === 'gig.ritik546@gmail.com') {
    return true;
  }

  if (!db) return false;

  try {
    const adminDocRef = doc(db, 'admins', user.uid);
    const snap = await getDoc(adminDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return data.role === 'admin';
    }
  } catch (err) {
    console.warn('Error checking admin document in admins collection:', err);
  }

  return false;
}
