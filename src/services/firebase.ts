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
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  checkActionCode,
  ActionCodeSettings,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
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

export async function loginWithEmail(email: string, pass: string, rememberMe = true) {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please verify your Firebase configuration in .env');
  }
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  } catch (persistErr) {
    console.warn('Persistence configuration notice:', persistErr);
  }
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

export async function sendAdminPasswordReset(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please verify your Firebase configuration in .env');
  }

  // Determine current origin or default to production domain
  const origin = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : 'https://mpexam.vercel.app';

  // ActionCodeSettings ensures the password reset link directs back to the app with oobCode and mode=resetPassword
  const actionCodeSettings: ActionCodeSettings = {
    url: `${origin}/?mode=resetPassword`,
    handleCodeInApp: true,
  };

  try {
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  } catch (err: any) {
    // If the continueUrl or domain is not authorized in Firebase Console yet, fallback gracefully to default template
    if (
      err?.code === 'auth/unauthorized-continue-uri' ||
      err?.code === 'auth/invalid-continue-uri'
    ) {
      console.warn('ActionCodeSettings continue URI warning (falling back to standard email link):', err);
      await sendPasswordResetEmail(auth, email);
    } else {
      throw err;
    }
  }
}

/**
 * Verifies a password reset oobCode and returns the user's email.
 * Note: verifyPasswordResetCode does NOT consume the action code.
 */
export async function verifyResetCode(oobCode: string): Promise<string> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized.');
  }
  return await verifyPasswordResetCode(auth, oobCode);
}

/**
 * Confirms password reset with the new password and consumes the oobCode.
 */
export async function confirmResetPassword(oobCode: string, newPass: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized.');
  }
  await confirmPasswordReset(auth, oobCode, newPass);
}

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Please set your Firebase credentials.');
  }
  const provider = new GoogleAuthProvider();
  // Force account selection screen so the user can choose the right admin account
  provider.setCustomParameters({
    prompt: 'select_account'
  });
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
