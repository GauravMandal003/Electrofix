import { useState, useEffect } from 'react';
import { Lock, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Reset token is missing.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccess(true);
      setLoading(false);
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setLoading(false);
      setError(err.message);
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
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6 group">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Login</span>
          </Link>
          
          <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
            Reset Password
          </h2>
          <p className="text-slate-500 text-sm mt-1.5">
            Create a secure new password for your ElectroFix account.
          </p>
        </div>

        {success ? (
          <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">
              Password Reset Successful!
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-2">
              Your password has been securely updated. Redirecting you to login page...
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
                  New Password
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
                    disabled={!token}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={!token}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full mt-4 rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-800 disabled:bg-slate-400 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <span>ElectroFix Safe Authentication Guard</span>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
