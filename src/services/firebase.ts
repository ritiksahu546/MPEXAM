import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  FirestoreSettings,
  doc, 
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: ReturnType<typeof initializeApp> | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(app);

    // Forces the SDK's underlying transport (WebChannel) to use long-polling.
    // This is required in iframe preview and proxy container environments to prevent
    // WebChannel streaming connection drops and [code=unavailable] backend errors.
    const firestoreSettings: FirestoreSettings = {
      experimentalForceLongPolling: true,
    };

    if (firebaseConfig.firestoreDatabaseId) {
      try {
        dbInstance = initializeFirestore(app, firestoreSettings, firebaseConfig.firestoreDatabaseId);
      } catch {
        dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      }
    } else {
      try {
        dbInstance = initializeFirestore(app, firestoreSettings);
      } catch {
        dbInstance = getFirestore(app);
      }
    }
  } catch (err) {
    console.warn('Firebase initialization error, fallback to local storage mode:', err);
  }
}

export const auth = authInstance;
export const db = dbInstance;

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.uid,
      email: currentAuth?.email,
      emailVerified: currentAuth?.emailVerified,
      isAnonymous: currentAuth?.isAnonymous,
      tenantId: currentAuth?.tenantId,
      providerInfo: currentAuth?.providerData?.map(provider => ({
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

export async function testFirebaseConnection(): Promise<boolean> {
  if (!dbInstance) return false;
  try {
    await getDocFromServer(doc(dbInstance, 'test', 'connection'));
    return true;
  } catch (error: any) {
    // Gracefully handle transient offline or unavailable states without breaking application flow
    if (
      error?.code === 'unavailable' || 
      (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable')))
    ) {
      console.warn('Firebase connection test: backend temporarily unreachable or operating offline. App will use local cache.');
    } else {
      console.warn('Firebase connection test notice:', error);
    }
    return false;
  }
}

export async function signInWithGoogle() {
  if (!authInstance) {
    throw new Error('Firebase Auth is not configured. Please set your Firebase credentials in .env or Settings.');
  }
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(authInstance, provider);
}

export async function logOut() {
  if (!authInstance) return;
  await signOut(authInstance);
}

export { onAuthStateChanged };
