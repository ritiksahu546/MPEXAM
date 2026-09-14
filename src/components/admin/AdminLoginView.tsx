import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft, 
  Loader2,
  CheckCircle2,
  UserX,
  ExternalLink,
  RefreshCw,
  Mail,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  auth,
  signInWithGoogle,
  verifyAdminAuthorization, 
  isFirebaseConfigured, 
  missingFirebaseEnvVars,
  logOut,
  loginWithEmail
} from '../../services/firebase';
import { UserProfile, SiteSettings } from '../../types';

interface Props {
  settings: SiteSettings;
  onSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
}

export const AdminLoginView: React.FC<Props> = ({ settings: _settings, onSuccess, onNavigateHome }) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasUnauthorizedAttempt, setHasUnauthorizedAttempt] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Login Mode: 'google' | 'email'
  const [loginMode, setLoginMode] = useState<'google' | 'email'>('google');

  // Email form state
  const [email, setEmail] = useState('gig.ritik546@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Detect if running inside an iframe (like AI Studio preview)
  const isInIframe = typeof window !== 'undefined' && (
    window.self !== window.top ||
    Boolean((window.location as any)?.ancestorOrigins && (window.location as any).ancestorOrigins.length > 0)
  );

  const newTabAdminUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/admin` 
    : '/admin';

  // Check if an already authenticated and authorized admin opens this page
  const checkActiveSession = useCallback(async (showFeedback = false) => {
    if (showFeedback) setIsCheckingSession(true);
    try {
      if (auth && auth.currentUser) {
        await auth.currentUser.reload().catch(() => {});
        const user = auth.currentUser;
        const isAuthorized = await verifyAdminAuthorization(user);
        if (isAuthorized) {
          setIsSuccess(true);
          onSuccess({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Authorized Admin',
            role: 'admin',
            isAdmin: true
          });
          return true;
        } else if (showFeedback) {
          setErrorMessage('खाता प्रमाणित है, लेकिन यह अधिकृत Admin सूची में नहीं है।');
        }
      } else if (showFeedback) {
        setErrorMessage('कोई सक्रिय लॉगिन नहीं मिला। कृपया Google लॉगिन पूरा करें।');
      }
    } catch {
      if (showFeedback) {
        setErrorMessage('सत्र जांचने में समस्या आई। कृपया पुनः प्रयास करें।');
      }
    } finally {
      if (showFeedback) setIsCheckingSession(false);
    }
    return false;
  }, [onSuccess]);

  useEffect(() => {
    let isMounted = true;
    checkActiveSession();

    // Listen to storage events across tabs: if user logs in in another tab, log them in here
    const handleStorageChange = () => {
      if (isMounted) {
        checkActiveSession();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkActiveSession]);

  // Handle Google Sign-In with timeout & safety fallback
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

      // 1. Firebase Google Authentication via Popup (with 25s timeout)
      const cred = await signInWithGoogle(25000);
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
        setErrorMessage('लॉगिन विंडो बंद कर दी गई। यदि आप प्रीव्यू में हैं, तो कृपया नए टैब में खोलकर लॉगिन करें।');
      } else if (errorCode === 'auth/popup-blocked') {
        setErrorMessage('ब्राउज़र ने Google लॉगिन पॉपअप ब्लॉक कर दिया है। कृपया ऊपर दिए गए "नए टैब में खोलें" बटन का उपयोग करें।');
      } else if (errorCode === 'auth/popup-timeout' || (err?.message && err.message.includes('TIMEOUT'))) {
        setErrorMessage(
          'Google लॉगिन विंडो से प्रतिक्रिया नहीं मिली (Timeout)। आईफ्रेम (iFrame Preview) में ब्राउज़र सुरक्षा के कारण पॉपअप अवरुद्ध हो सकता है। कृपया नीचे दिए गए "नए टैब में खोलें" बटन का उपयोग करके लॉगिन करें।'
        );
      } else if (errorCode === 'auth/cancelled-popup-request') {
        // Another popup opened
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

  // Handle Email / Password Login
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailLoading) return;
    if (!email.trim() || !password) {
      setErrorMessage('कृपया ईमेल और पासवर्ड दर्ज करें।');
      return;
    }

    setErrorMessage('');
    setHasUnauthorizedAttempt(false);
    setIsSuccess(false);
    setIsEmailLoading(true);

    try {
      const user = await loginWithEmail(email.trim(), password);
      const isAuthorized = await verifyAdminAuthorization(user);

      if (!isAuthorized) {
        await logOut();
        setHasUnauthorizedAttempt(true);
        setErrorMessage('यह खाता अधिकृत Admin सूची में नहीं है।');
        setIsEmailLoading(false);
        return;
      }

      setIsSuccess(true);
      onSuccess({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Authorized Admin',
        role: 'admin',
        isAdmin: true
      });
    } catch (err: any) {
      console.warn('Email login error:', err);
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMessage('गलत ईमेल या पासवर्ड। कृपया पुनः जांचें।');
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMessage('Firebase Console में Email/Password प्रदाता सक्षम नहीं है। कृपया Google लॉगिन का उपयोग करें।');
      } else {
        setErrorMessage(err?.message || 'लॉगिन विफल रहा। कृपया पुनः प्रयास करें।');
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100 relative selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[540px] h-[340px] bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[480px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="w-full max-w-[460px] relative z-10">
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
          <div className="text-center mb-6">
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
            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-amber-400 border border-slate-700/80">
                <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>सुरक्षित प्रशासन पोर्टल</span>
              </span>
            </div>
          </div>

          {/* CRITICAL IFRAME HELPER BANNER */}
          {isInIframe && (
            <div className="mb-6 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/40 rounded-xl p-4 text-xs text-blue-100 shadow-lg space-y-3">
              <div className="flex items-start gap-2.5">
                <ExternalLink className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <p className="font-semibold text-blue-200 text-xs">
                    आईफ्रेम प्रीव्यू सूचना (iFrame Preview Notice)
                  </p>
                  <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                    ब्राउज़र सुरक्षा प्रतिबंधों के कारण, प्रीव्यू आईफ्रेम में Google लॉगिन पॉपअप रुक या हैंग हो सकता है। 
                    सुचारू लॉगिन के लिए कृपया इस पोर्टल को <strong>नए ब्राउज़र टैब</strong> में खोलें:
                  </p>
                </div>
              </div>
              
              <a
                href={newTabAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md hover:shadow-blue-600/30 cursor-pointer text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span>नए टैब में खोलें और लॉगिन करें (Open in New Tab)</span>
              </a>
            </div>
          )}

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

          {/* Unauthorized Attempt Alert */}
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
                अधिकृत एडमिन ईमेल: <strong>gig.ritik546@gmail.com</strong>
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
              {isInIframe && (
                <div className="pt-2 border-t border-red-500/20">
                  <a
                    href={newTabAdminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-200 font-semibold underline underline-offset-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>नए टैब में खोलकर पुनः प्रयास करें</span>
                  </a>
                </div>
              )}
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

          {/* Mode Switch Tabs (Google vs Email/Password) */}
          <div className="mb-5 flex rounded-lg bg-slate-950/60 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setLoginMode('google')}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                loginMode === 'google'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Google Login (सुझाया गया)
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('email')}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                loginMode === 'email'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ईमेल / पासवर्ड
            </button>
          </div>

          {/* TAB 1: GOOGLE LOGIN */}
          {loginMode === 'google' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full relative group flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-xl shadow-black/40 hover:shadow-black/60 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.99] border border-slate-200"
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

              {/* CANCEL & RETRY CONTROLS WHEN STUCK OR LOADING */}
              {isGoogleLoading && (
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
                  <p className="text-[11px] text-amber-300 text-center leading-relaxed">
                    Google लॉगिन विंडो खुली है या पॉपअप की प्रतीक्षा की जा रही है...
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsGoogleLoading(false);
                        setErrorMessage('लॉगिन प्रक्रिया रद्द की गई। यदि पॉपअप विंडो नहीं खुली, तो कृपया नए टैब में खोलकर लॉगिन करें।');
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      रद्द करें (Cancel)
                    </button>
                    <a
                      href={newTabAdminUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600/40 hover:bg-blue-600/70 text-blue-200 text-xs font-medium border border-blue-500/40 transition-colors text-center inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span>नए टैब में खोलें</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Active session check button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => checkActiveSession(true)}
                  disabled={isCheckingSession}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSession ? 'animate-spin text-blue-400' : ''}`} />
                  <span>सत्र स्थिति जांचें (Check Active Session)</span>
                </button>
                <a
                  href={newTabAdminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>नया टैब</span>
                </a>
              </div>

              <p className="text-center text-xs text-slate-400 leading-relaxed">
                अधिकृत एडमिन खाता: <strong>gig.ritik546@gmail.com</strong>
              </p>
            </div>
          )}

          {/* TAB 2: EMAIL / PASSWORD LOGIN */}
          {loginMode === 'email' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  एडमिन ईमेल (Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gig.ritik546@gmail.com"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  पासवर्ड (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isEmailLoading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-900/40 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isEmailLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>लॉगिन हो रहा है...</span>
                  </>
                ) : (
                  <span>लॉगिन करें (Sign In)</span>
                )}
              </button>
            </form>
          )}

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
