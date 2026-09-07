import { 
  app, 
  auth, 
  db, 
  firestore, 
  storage, 
  isFirebaseConfigured, 
  missingFirebaseEnvVars,
  uploadImageToStorage,
  uploadPdfToStorage,
  verifyAdminAuthorization 
} from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  User 
} from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = auth?.currentUser;
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
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (
      error?.code === 'unavailable' || 
      (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable')))
    ) {
      console.warn('Firebase connection: operating in offline or fallback cached mode.');
    } else {
      console.warn('Firebase connection test notice:', error);
    }
    return false;
  }
}

export async function loginWithEmail(email: string, pass: string) {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please verify your Firebase configuration in .env');
  }
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Please set your Firebase credentials.');
  }
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}

export async function logOut() {
  if (!auth) return;
  await signOut(auth);
}

export { 
  app, 
  auth, 
  db, 
  firestore, 
  storage, 
  isFirebaseConfigured, 
  missingFirebaseEnvVars,
  uploadImageToStorage,
  uploadPdfToStorage,
  verifyAdminAuthorization,
  onAuthStateChanged,
  signInWithEmailAndPassword
};
