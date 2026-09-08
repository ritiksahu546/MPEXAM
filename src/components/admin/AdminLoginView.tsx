import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft, 
  Loader2,
  CheckCircle2,
  UserX
} from 'lucide-react';
import { 
  auth,
  signInWithGoogle,
  verifyAdminAuthorization, 
  isFirebaseConfigured, 
  missingFirebaseEnvVars,
  logOut
} from '../../services/firebase';
import { UserProfile, SiteSettings } from '../../types';

interface Props {
  settings: SiteSettings;
  onSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
}

export const AdminLoginView: React.FC<Props> = ({ settings: _settings, onSuccess, onNavigateHome }) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasUnauthorizedAttempt, setHasUnauthorizedAttempt] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if an already authenticated and authorized admin opens this page
  useEffect(() => {
    let isMounted = true;
    const checkActiveSession = async () => {
      if (auth && auth.currentUser) {
        try {
          const user = auth.currentUser;
          const isAuthorized = await verifyAdminAuthorization(user);
          if (isMounted && isAuthorized) {
            onSuccess({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Authorized Admin',
              role: 'admin',
              isAdmin: true
            });
          }
        } catch {
          // If verification fails, keep user on login screen
        }
      }
    };
    checkActiveSession();
    return () => {
      isMounted = false;
    };
  }, [onSuccess]);

  // Handle Google Sign-In with account picker prompt
  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setErrorMessage('');
    setHasUnauthorizedAttempt(false);
    setIsSuccess(false);
    setIsGoogleLoading(true);

    try {
      if (!isFirebaseConfigured) {
        setErrorMessage('Firebase configuration is incomplete. Please check application settings.');
        setIsGoogleLoading(false);
        return;
      }

      // 1. Firebase Google Authentication via Popup (forces account selection)
      const cred = await signInWithGoogle();
      const user = cred.user;

      // 2. Authorization check against Firestore 'admins' collection
      const isAuthorized = await verifyAdminAuthorization(user);

      if (!isAuthorized) {
        // Sign out unauthorized user session immediately
        await logOut();
        setHasUnauthorizedAttempt(true);
        setErrorMessage(
          'Google प्रमाणीकरण सफल रहा, लेकिन यह खाता अधिकृत Admin सूची में नहीं है। कृपया अधिकृत एडमिन खाते से पुनः प्रयास करें।'
        );
        setIsGoogleLoading(false);
        return;
      }

      // 3. Authorized Admin Success
      setIsSuccess(true);
      onSuccess({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Authorized Admin',
        role: 'admin',
        isAdmin: true
      });
    } catch (err: any) {
      console.warn('Admin Google sign-in notice:', err?.code || err?.message);
      const errorCode = err?.code || '';

      if (errorCode === 'auth/popup-closed-by-user') {
        setErrorMessage('लॉगिन विंडो बंद कर दी गई। कृपया पुनः प्रयास करें। (Login window was closed)');
      } else if (errorCode === 'auth/popup-blocked') {
        setErrorMessage('ब्राउज़र ने Google लॉगिन पॉपअप ब्लॉक कर दिया है। कृपया पॉपअप की अनुमति दें। (Popup was blocked)');
      } else if (errorCode === 'auth/cancelled-popup-request') {
        // Another popup opened, do nothing
      } else if (
        errorCode === 'auth/network-request-failed' ||
        (err instanceof Error && err.message.toLowerCase().includes('network'))
      ) {
        setErrorMessage('नेटवर्क कनेक्शन विफल रहा। कृपया अपना इंटरनेट कनेक्शन जांचें।');
      } else if (errorCode === 'auth/unauthorized-domain') {
        setErrorMessage('यह डोमेन Firebase Console के Authorized Domains में स्वीकृत नहीं है। कृपया Firebase Console में इस डोमेन को जोड़ें।');
      } else {
        setErrorMessage(err?.message || 'Google लॉगिन विफल रहा। कृपया पुनः प्रयास करें।');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100 relative selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[540px] h-[340px] bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[480px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        {/* Navigation back to main site */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded-lg px-2 py-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>होमपेज पर वापस जाएं (Back to Website)</span>
          </button>
          
          <span className="text-[11px] font-mono text-slate-500">CMS v2.4</span>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 ring-1 ring-white/5 p-6 sm:p-8">
          
          {/* Brand Header */}
          <div className="text-center mb-7">
            {/* MP Exam Update Badge */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white shadow-xl shadow-blue-950/60 mb-3.5 ring-1 ring-white/20">
              <div className="relative flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-white drop-shadow" />
                <span className="absolute -bottom-2 -right-2 px-1 py-0.2 bg-slate-950 text-amber-400 text-[9px] font-black rounded border border-amber-500/30 uppercase tracking-tighter">
                  MP
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              MP Exam Update
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1">
              CMS Admin Panel
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-amber-400 border border-slate-700/80">
                <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>सुरक्षित प्रशासन पोर्टल</span>
              </span>
            </div>
          </div>

          {/* Missing Firebase Config Notice */}
          {!isFirebaseConfigured && (
            <div className="mb-6 bg-amber-950/40 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-200 flex gap-2.5 items-start" role="alert">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-semibold text-amber-300">Firebase Configuration Notice</p>
                <p className="mt-0.5 text-amber-200/90 text-[11px]">
                  Missing environment variables: {missingFirebaseEnvVars.join(', ')}. Please verify your Firebase project configuration.
                </p>
              </div>
            </div>
          )}

          {/* Unauthorized Attempt Alert with Switch Action */}
          {hasUnauthorizedAttempt && (
            <div 
              className="mb-6 bg-red-950/50 border border-red-500/40 text-red-200 text-xs sm:text-sm p-4 rounded-xl shadow-sm space-y-2.5"
              role="alert"
            >
              <div className="flex items-start gap-2.5">
                <UserX className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <p className="font-semibold text-red-300">अनधिकृत खाता (Unauthorized Account)</p>
                  <p className="mt-1 text-xs text-red-200/90">
                    आपका Google खाता प्रमाणित हुआ, लेकिन इसे Admin Panel की अनुमति नहीं है।
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-red-500/20 text-[11px] text-red-200/80">
                कृपया नीचे दिए बटन से अधिकृत Google खाते का चयन करें।
              </div>
            </div>
          )}

          {/* Generic Error Banner */}
          {errorMessage && !hasUnauthorizedAttempt && (
            <div 
              className="mb-6 bg-red-950/50 border border-red-500/40 text-red-200 text-xs sm:text-sm p-4 rounded-xl shadow-sm space-y-2"
              role="alert"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">
                  {errorMessage}
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div 
              className="mb-6 bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm p-3.5 rounded-xl flex items-start gap-2.5 shadow-sm"
              role="status"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                प्रमाणीकरण सफल! एडमिन पैनल में प्रवेश हो रहा है...
              </div>
            </div>
          )}

          {/* PRIMARY GOOGLE LOGIN BUTTON */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full relative group flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-xl shadow-black/40 hover:shadow-black/60 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] border border-slate-200"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-700 shrink-0" />
                  <span className="text-slate-700">Google प्रमाणीकरण हो रहा है...</span>
                </>
              ) : (
                <>
                  {/* Official Google 'G' Logo SVG */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>
                    {hasUnauthorizedAttempt 
                      ? 'दूसरे Google खाते से लॉगिन करें (Switch Account)' 
                      : 'Continue with Google'}
                  </span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 pt-1 leading-relaxed">
              केवल अधिकृत व्यवस्थापक Google खातों को ही अनुमति है।
            </p>
          </div>

          {/* Security details footer */}
          <div className="mt-8 pt-5 border-t border-slate-800/80 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Firebase Cloud Authentication & Role-Based Access Control</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
