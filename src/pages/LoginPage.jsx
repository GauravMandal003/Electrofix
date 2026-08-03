import { useState } from 'react';
import { Mail, Lock, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      // 1. Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Retrieve user details from Firestore (/users/{uid})
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      let userRole = 'user';
      let userData = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || (typeof email === 'string' && email ? email.split('@')[0] : 'User'),
        email: firebaseUser.email,
        role: 'user',
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
      };

      if (userDocSnap.exists()) {
        const storedData = userDocSnap.data();
        userData.name = storedData.name || userData.name;
        userData.avatar = storedData.avatar || userData.avatar;
        userRole = storedData.role === 'admin' ? 'admin' : 'user';
        userData.role = userRole;
      }

      const authToken = firebaseUser.accessToken || 'firebase-token-' + firebaseUser.uid;

      // Store auth token and user details
      localStorage.setItem('ef_auth_token', authToken);
      localStorage.setItem('ef_auth_user', JSON.stringify(userData));
      localStorage.removeItem('ef_logged_out'); // clear logged out flag

      if (userRole === 'admin') {
        localStorage.setItem('ef_admin_token', authToken);
        localStorage.setItem('ef_admin_user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('ef_admin_token');
        localStorage.removeItem('ef_admin_user');
      }

      window.dispatchEvent(new CustomEvent('ef_profile_update'));

      setLoading(false);
      setSuccess(true);
      
      // Auto redirect after success to Home page (/)
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        let redirectTo = params.get('redirect');

        if (!redirectTo || redirectTo === '/account' || redirectTo.startsWith('/admin')) {
          redirectTo = '/';
        }

        navigate(redirectTo, { replace: true });
      }, 1200);
    } catch (err) {
      setLoading(false);
      // Clean up common Firebase Auth messages to be user-friendly
      let friendlyMsg = err.message;
      if (err.code === 'auth/invalid-credential') {
        friendlyMsg = 'Invalid email or password.';
      } else if (err.code === 'auth/user-not-found') {
        friendlyMsg = 'No user found with this email.';
      } else if (err.code === 'auth/wrong-password') {
        friendlyMsg = 'Incorrect password.';
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
          
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
              Login to Continue
            </h2>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Please log in or create an account to continue with your booking, purchase, or other requested action.
          </p>
        </div>

        {success ? (
          <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">
              Successfully Logged In!
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-2">
              Redirecting you to complete your requested action...
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-800 disabled:bg-slate-400 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="relative my-6 flex py-1 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white px-2">or</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <Link
              to={`/signup${window.location.search}`}
              className="w-full block text-center rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 py-3 font-bold text-slate-700 transition-all shadow-sm text-sm"
            >
              Create New Account
            </Link>

            <div className="mt-8 flex items-center justify-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <span>ElectroFix Safe Sign-In Guard</span>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
