import React, { useState, useEffect, useRef } from 'react';
import { 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { verifyResetCode, confirmResetPassword } from '../../services/firebase';

interface Props {
  oobCode: string;
  onSuccess: () => void;
  onCancel: () => void;
  onRequestNewLink: () => void;
}

export const ResetPasswordView: React.FC<Props> = ({
  oobCode,
  onSuccess,
  onCancel,
  onRequestNewLink
}) => {
  // Verification states
  const [isVerifyingCode, setIsVerifyingCode] = useState<boolean>(true);
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const [verificationError, setVerificationError] = useState<string>('');
  const [errorCode, setErrorCode] = useState<string>('');

  // Password reset form states
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);

  // Prevent StrictMode duplicate verification calls
  const hasVerifiedRef = useRef<boolean>(false);

  // 1. Verify oobCode on mount
  useEffect(() => {
    if (!oobCode) {
      setIsVerifyingCode(false);
      setVerificationError('कोई पासवर्ड रीसेट कोड (oobCode) नहीं मिला। कृपया अपने ईमेल में दिए गए लिंक की जांच करें।');
      return;
    }

    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    let isMounted = true;

    const verifyCode = async () => {
      setIsVerifyingCode(true);
      setVerificationError('');
      setErrorCode('');

      try {
        const email = await verifyResetCode(oobCode);
        if (isMounted) {
          setVerifiedEmail(email);
          setIsVerifyingCode(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('verifyResetCode notice:', err?.code || err?.message);
        const code = err?.code || '';
        setErrorCode(code);

        if (code === 'auth/expired-action-code') {
          setVerificationError(
            'यह पासवर्ड रीसेट लिंक समाप्त (Expired) हो चुका है। सुरक्षा कारणों से रीसेट लिंक सीमित समय के लिए ही मान्य होते हैं। कृपया नया रीसेट लिंक मांगें।'
          );
        } else if (code === 'auth/invalid-action-code') {
          setVerificationError(
            'यह पासवर्ड रीसेट लिंक अमान्य है या पहले ही उपयोग किया जा चुका है। यदि आपने कई बार रीसेट का अनुरोध किया था, तो कृपया हमेशा अपने इनबॉक्स में आए सबसे नवीनतम (Latest) ईमेल के लिंक पर क्लिक करें।'
          );
        } else if (code === 'auth/user-disabled') {
          setVerificationError(
            'यह व्यवस्थापक खाता निष्क्रिय (Disabled) कर दिया गया है। कृपया मुख्य एडमिन से संपर्क करें।'
          );
        } else if (code === 'auth/user-not-found') {
          setVerificationError(
            'इस रीसेट लिंक से संबद्ध कोई खाता नहीं मिला।'
          );
        } else if (code === 'auth/network-request-failed') {
          setVerificationError(
            'इंटरनेट कनेक्शन में समस्या है। कृपया अपना नेटवर्क जांचें और पुनः प्रयास करें।'
          );
        } else {
          setVerificationError(
            'पासवर्ड रीसेट लिंक अमान्य या समाप्त हो चुका है। कृपया नया लिंक मांगें।'
          );
        }
        setIsVerifyingCode(false);
      }
    };

    verifyCode();

    return () => {
      isMounted = false;
    };
  }, [oobCode]);

  // 2. Countdown redirect after successful reset
  useEffect(() => {
    if (!isSuccess) return;

    // Clean URL to prevent re-submitting an already used oobCode
    try {
      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.pathname + '#admin-login';
        window.history.replaceState(null, '', cleanUrl);
      }
    } catch {
      // Ignore URL rewrite failure
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, onSuccess]);

  // 3. Handle Submit New Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSuccess) return;

    setFormError('');

    // Validations
    if (!newPassword) {
      setFormError('कृपया नया पासवर्ड दर्ज करें।');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('दोनों पासवर्ड मेल नहीं खा रहे हैं। कृपया जांचें।');
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmResetPassword(oobCode, newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      console.warn('confirmResetPassword notice:', err?.code || err?.message);
      const code = err?.code || '';

      if (code === 'auth/weak-password') {
        setFormError('पासवर्ड बहुत कमजोर है। कृपया कम से कम 6 अक्षरों का मजबूत पासवर्ड चुनें।');
      } else if (code === 'auth/expired-action-code') {
        setFormError('पासवर्ड रीसेट लिंक समाप्त हो चुका है। कृपया नया लिंक प्राप्त करें।');
      } else if (code === 'auth/invalid-action-code') {
        setFormError('यह रीसेट कोड पहले ही उपयोग किया जा चुका है या अमान्य है।');
      } else if (code === 'auth/user-disabled') {
        setFormError('यह खाता निष्क्रिय कर दिया गया है।');
      } else if (code === 'auth/network-request-failed') {
        setFormError('नेटवर्क कनेक्शन विफल रहा। कृपया इंटरनेट जांचें।');
      } else {
        setFormError('पासवर्ड अपडेट करने में असमर्थ। कृपया पुनः प्रयास करें।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'कमजोर (Weak)', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'मध्यम (Fair)', color: 'bg-amber-500' };
    if (score <= 3) return { score: 3, label: 'अच्छा (Good)', color: 'bg-blue-500' };
    return { score: 4, label: 'मजबूत (Strong)', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100 relative selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[540px] h-[340px] bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[480px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="w-full max-w-[460px] relative z-10">
        {/* Navigation back */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded-lg px-2 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>लॉगिन पेज पर वापस जाएं (Back to Login)</span>
          </button>
          
          <span className="text-[11px] font-mono text-slate-500">CMS Security</span>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 ring-1 ring-white/5 p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white shadow-xl shadow-blue-950/60 mb-3.5 ring-1 ring-white/20">
              <KeyRound className="w-7 h-7 text-white drop-shadow" />
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isSuccess ? 'पासवर्ड रीसेट पूर्ण' : 'नया पासवर्ड बनाएं'}
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1">
              MP Exam Update CMS - सुरक्षित पासवर्ड रीसेट
            </p>
          </div>

          {/* STATE 1: VERIFYING CODE */}
          {isVerifyingCode && (
            <div className="py-10 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <p className="text-sm font-medium text-slate-300">
                रीसेट लिंक का सत्यापन हो रहा है...
              </p>
              <p className="text-xs text-slate-500">
                कृपया प्रतीक्षा करें (Verifying action code with Firebase)
              </p>
            </div>
          )}

          {/* STATE 2: VERIFICATION ERROR / EXPIRED / INVALID LINK */}
          {!isVerifyingCode && verificationError && (
            <div className="space-y-5">
              <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 text-xs sm:text-sm text-red-200 flex gap-3 items-start leading-relaxed">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-red-300">
                    {errorCode === 'auth/expired-action-code'
                      ? 'रीसेट लिंक समाप्त हो चुका है'
                      : 'अमान्य या प्रयुक्त रीसेट लिंक'}
                  </p>
                  <p className="text-red-200/90 text-xs">
                    {verificationError}
                  </p>
                </div>
              </div>

              {/* Troubleshooting Tips */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>महत्वपूर्ण सुझाव (Troubleshooting):</span>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                  <li>यदि आपने कई बार "Forgot Password" पर क्लिक किया था, तो पिछले सभी लिंक अमान्य हो जाते हैं। केवल सबसे नवीनतम (Last) ईमेल के लिंक का उपयोग करें।</li>
                  <li>सुरक्षा कारणों से प्रत्येक रीसेट लिंक केवल एक बार ही उपयोग किया जा सकता है।</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={onRequestNewLink}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>नया रीसेट लिंक भेजें (Request New Link)</span>
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white font-medium py-2.5 px-4 rounded-xl text-sm border border-slate-700/80 transition-colors"
                >
                  <span>लॉगिन पेज पर जाएं (Back to Login)</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: SUCCESSFUL PASSWORD RESET */}
          {!isVerifyingCode && isSuccess && (
            <div className="py-4 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-white">
                  Password reset successful!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  आपका पासवर्ड सफलतापूर्वक अपडेट कर दिया गया है।
                </p>
                <p className="text-xs text-slate-500">
                  {countdown} सेकंड में लॉगिन पेज पर रीडायरेक्ट किया जाएगा...
                </p>
              </div>

              <button
                type="button"
                onClick={onSuccess}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>एडमिन लॉगिन करें (Login Now)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STATE 4: ENTER NEW PASSWORD FORM */}
          {!isVerifyingCode && !verificationError && !isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Account badge */}
              {verifiedEmail && (
                <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-slate-400">खाता:</span>
                    <span className="font-semibold text-white truncate">{verifiedEmail}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">
                    सत्यापित
                  </span>
                </div>
              )}

              {/* Error banner */}
              {formError && (
                <div className="bg-red-950/50 border border-red-500/40 text-red-200 text-xs p-3 rounded-xl flex items-start gap-2" role="alert">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label 
                  htmlFor="new-password-input" 
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  नया पासवर्ड (New Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="new-password-input"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="कम से कम 6 अक्षर दर्ज करें"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-950/80 border border-slate-750 text-white placeholder:text-slate-500 text-sm rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">मजबूती:</span>
                      <span className="font-medium text-slate-300">{strength.label}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 transition-all ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all ${strength.score >= 4 ? strength.color : 'bg-transparent'}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label 
                  htmlFor="confirm-password-input" 
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  पासवर्ड की पुष्टि करें (Confirm Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirm-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="पासवर्ड दोबारा दर्ज करें"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-950/80 border border-slate-750 text-white placeholder:text-slate-500 text-sm rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>पासवर्ड अपडेट हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <span>नया पासवर्ड सहेजें (Update Password)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
