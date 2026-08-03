import { useState } from 'react';
import { Mail, Lock, User, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the terms and conditions.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create User in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Update user's display name profile in Firebase Auth
      await updateProfile(firebaseUser, { displayName: fullName });

      // 3. Prepare user record payload
      const userData = {
        id: firebaseUser.uid,
        name: fullName,
        email: email.toLowerCase(),
        role: 'user',
        createdAt: new Date().toISOString(),
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
      };

      // 4. Store user details in Firestore 'users' collection
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.WRITE, `users/${firebaseUser.uid}`);
      }

      // Store auth token and user details
      localStorage.setItem('ef_auth_token', firebaseUser.accessToken || 'firebase-token-' + firebaseUser.uid);
      localStorage.setItem('ef_auth_user', JSON.stringify({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: 'user',
        avatar: userData.avatar
      }));
      localStorage.removeItem('ef_admin_token');
      localStorage.removeItem('ef_admin_user');
      localStorage.removeItem('ef_logged_out'); // clear logged out flag

      window.dispatchEvent(new CustomEvent('ef_profile_update'));

      setLoading(false);
      setSuccess(true);
      
      // Auto redirect to requested page or homepage after success
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        let redirectTo = params.get('redirect');
        if (!redirectTo || redirectTo === '/account' || redirectTo.startsWith('/admin')) {
          redirectTo = '/';
        }
        navigate(redirectTo, { replace: true });
      }, 1500);
    } catch (err) {
      setLoading(false);
      let friendlyMsg = err.message;
      if (err.code === 'auth/email-already-in-use') {
        friendlyMsg = 'User with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMsg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMsg = 'Please enter a valid email address.';
      }
      setError(friendlyMsg);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-gradient-to-b from-blue-50/50 via-white to-white px-4 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-20 right-[-10%] w-[350px] h-[350px] rounded-full bg-blue-400/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-400/5 blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 relative z-10"
      >
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6 group">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </Link>
          
          <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Account
          </h2>
          <p className="text-slate-500 text-sm mt-1.5">
            Join ElectroFix today and get 10% off your first repair.
          </p>
        </div>

        {success ? (
          <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">
              Account Created!
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-2">
              Your profile is active. Redirecting to home...
            </p>
            <div className="flex justify-center mt-4">
              <div className="h-1.5 w-16 bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-pulse w-full rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-600 border border-rose-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1.5 pb-2">
                <input
                  type="checkbox"
                  id="terms-signup"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="terms-signup" className="text-xs text-slate-500 leading-normal select-none cursor-pointer">
                  I agree to the{' '}
                  <button type="button" className="text-blue-600 hover:underline font-semibold">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-blue-600 hover:underline font-semibold">
                    Privacy Policy
                  </button>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-800 disabled:bg-slate-400 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-500">
                Already have an account?
                <Link
                  to="/login"
                  className="ml-1.5 font-bold text-blue-600 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <span>1-Year ElectroFix Certified Protection</span>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
