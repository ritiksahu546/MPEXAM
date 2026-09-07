import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { loginWithEmail, verifyAdminAuthorization, isFirebaseConfigured, missingFirebaseEnvVars } from '../../services/firebase';
import { UserProfile, SiteSettings } from '../../types';

interface Props {
  settings: SiteSettings;
  onSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
}

export const AdminLoginView: React.FC<Props> = ({ settings, onSuccess, onNavigateHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (!isFirebaseConfigured) {
        // Clear configuration notice if Firebase env vars are unset
        setErrorMessage(
          'Firebase क्रेडेंशियल कॉन्फ़िगर नहीं हैं। कृपया .env में VITE_FIREBASE_* विवरण सेट करें अथवा डेमो मोड का उपयोग करें।'
        );
        setIsLoading(false);
        return;
      }

      // 1. Firebase Authentication with Email and Password
      const user = await loginWithEmail(email.trim(), password);

      // 2. Authorization verification against Firestore 'admins' collection
      const isAuthorized = await verifyAdminAuthorization(user);

      if (!isAuthorized) {
        setErrorMessage(
          `लॉगिन सफल रहा (${user.email}), लेकिन आपका खाता एडमिन अधिकृत नहीं है। Firestore 'admins/${user.uid}' में role: "admin" आवश्यक है।`
        );
        setIsLoading(false);
        return;
      }

      onSuccess({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Authorized Admin',
        role: 'admin',
        isAdmin: true
      });
    } catch (err: any) {
      console.error('Admin login error:', err);
      let msg = 'लॉगिन विफल रहा। कृपया अपना ईमेल एवं पासवर्ड जांचें।';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'अमान्य ईमेल अथवा पासवर्ड। केवल अधिकृत एडमिन ही लॉगिन कर सकते हैं।';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'अत्यधिक असफल प्रयासों के कारण खाता अस्थायी रूप से लॉक है। कृपया कुछ समय बाद पुनः प्रयास करें।';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header Card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-800 to-amber-500 text-white shadow-lg mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {settings.siteName} CMS Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            सुरक्षित एडमिन लॉगिन (Authorized Administrators Only)
          </p>
        </div>

        {/* Firebase Config Notice if missing */}
        {!isFirebaseConfigured && (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex gap-2.5 items-start">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Firebase Configuration Notice:</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                पर्यावरण चर (Environment Variables) गायब हैं: {missingFirebaseEnvVars.join(', ')}। कृपया <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code> में अपनी Firebase चाबियां दर्ज करें।
              </p>
            </div>
          </div>
        )}

        {/* Login Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                एडमिन ईमेल (Admin Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mpexamupdate.in"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                पासवर्ड (Password)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>प्रमाणीकरण हो रहा है...</span>
                </>
              ) : (
                <>
                  <span>डैशबोर्ड में प्रवेश करें</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Guide toggle */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="hover:text-blue-700 flex items-center gap-1 font-semibold text-slate-600 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Firebase Admin खाता कैसे बनाएं?</span>
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-slate-800 transition-colors"
            >
              होमपेज पर जाएं
            </button>
          </div>

          {!isFirebaseConfigured && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  onSuccess({
                    uid: 'demo_admin',
                    email: 'admin@mpexamupdate.in',
                    displayName: 'Demo Super Admin',
                    role: 'admin',
                    isAdmin: true
                  });
                }}
                className="w-full text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                🚀 डेमो एडमिन मोड में प्रवेश करें (Local Fallback Mode)
              </button>
            </div>
          )}
        </div>

        {/* Setup guide details */}
        {showSetupGuide && (
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2 animate-in fade-in">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Firebase Admin सेटअप निर्देश:</span>
            </div>
            <p className="leading-relaxed">
              1. <strong>Firebase Console → Authentication → Users</strong> में जाकर <em>"Add user"</em> पर क्लिक करें और एडमिन ईमेल एवं पासवर्ड बनाएं।
            </p>
            <p className="leading-relaxed">
              2. <strong>Firestore Database → admins</strong> कलेक्शन में उस यूजर की UID से दस्तावेज़ बनाएं:
            </p>
            <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] overflow-x-auto font-mono">
{`admins/{user_uid}
{
  "uid": "USER_UID",
  "email": "your_email@domain.com",
  "role": "admin",
  "createdAt": "${new Date().toISOString()}"
}`}
            </pre>
            <p className="text-[11px] text-slate-500">
              *सुपरएडमिन खाता (<code className="text-blue-600">gig.ritik546@gmail.com</code>) स्वतः अधिकृत है।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
