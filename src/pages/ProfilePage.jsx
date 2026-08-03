import { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, Calendar, Clock, ShoppingBag, MapPin, Edit3, Trash2, CheckCircle2, Heart, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFallbackProductImage } from '../utils/shopData';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const localUser = localStorage.getItem('ef_auth_user');
    if (!localUser) {
      navigate('/login?redirect=/profile');
      return;
    }
    
    const u = JSON.parse(localUser);
    setUser(u);
    setName(u.name || '');
    setPhone(u.phone || '');
    setAddress(u.address || '');
 
    // Load active bookings from Firestore
    const fetchProfileBookings = async (targetUid) => {
      try {
        const q = query(collection(db, 'bookings'), where('userId', '==', targetUid));
        const querySnapshot = await getDocs(q);
        const fbBookings = [];
        querySnapshot.forEach((doc) => {
          fbBookings.push({ id: doc.id, ...doc.data() });
        });
        fbBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(fbBookings);
      } catch (fsErr) {
        console.error("Failed to load profile bookings from firestore:", fsErr);
        // Fallback
        const localBooking = localStorage.getItem('ef_pending_booking');
        if (localBooking) {
          try {
            setBookings([JSON.parse(localBooking)]);
          } catch (e) {
            console.error(e);
          }
        }
      }
    };
 
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        fetchProfileBookings(firebaseUser.uid);
      } else {
        // Fallback to local
        const localBooking = localStorage.getItem('ef_pending_booking');
        if (localBooking) {
          try {
            setBookings([JSON.parse(localBooking)]);
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
 
    // Load listed products
    const localListings = localStorage.getItem('ef_products');
    if (localListings) {
      try {
        const parsed = JSON.parse(localListings);
        // filter some mock items
        setListings(parsed.slice(0, 2));
      } catch (e) {
        console.error(e);
      }
    }

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    setTimeout(() => {
      const updatedUser = { ...user, name };
      localStorage.setItem('ef_auth_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setLoading(false);
      setSuccessMsg('Your profile has been updated successfully!');
      
      // Dispatch event to update Navbar instantly
      window.dispatchEvent(new CustomEvent('ef_profile_update'));
      
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 800);
  };

  const handleLogout = () => {
    localStorage.removeItem('ef_auth_token');
    localStorage.removeItem('ef_auth_user');
    localStorage.removeItem('ef_admin_token');
    localStorage.removeItem('ef_admin_user');
    localStorage.setItem('ef_logged_out', 'true');
    window.dispatchEvent(new CustomEvent('ef_logout'));
    navigate('/', { replace: true });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-b from-blue-50/30 via-white to-white px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/5 blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-display text-3xl font-extrabold shadow-lg shadow-blue-500/20">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="flex-grow text-center sm:text-left">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">
                ElectroFix Member
              </span>
              <h1 className="font-display text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {user.name}
              </h1>
              <p className="text-slate-500 text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" />
                {user.email}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-950 text-white hover:bg-slate-800 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form with animation */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <form onSubmit={handleUpdateProfile} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                  Update Account Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-slate-800 outline-none focus:border-blue-600 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-slate-800 outline-none focus:border-blue-600 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Default Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3.5 text-slate-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-800 outline-none focus:border-blue-600 transition-all text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 disabled:bg-blue-400 transition-all shadow-md shadow-blue-600/10 flex items-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-semibold text-sm flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            {successMsg}
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Active Bookings Section */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Active Bookings
            </h2>

            {bookings.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-100 rounded-2xl bg-slate-50/40">
                <p className="text-slate-400 text-xs">No active repair bookings found.</p>
                <button
                  onClick={() => navigate('/services')}
                  className="mt-3 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                >
                  Book a Repair
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-blue-50/30 border border-blue-50/50 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-sm">
                        Standard Service Booking
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        Confirmed
                      </span>
                    </div>
                    <div className="text-slate-500 text-xs flex flex-col gap-1 mt-1">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> {b.fullName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {b.preferredDate} ({b.preferredTimeSlot})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {b.address}, {b.city}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Shop Listings / Purchases */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-indigo-500" />
              Recent Used Listings
            </h2>

            {listings.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-100 rounded-2xl bg-slate-50/40">
                <p className="text-slate-400 text-xs">No listed appliances found.</p>
                <button
                  onClick={() => navigate('/sell-used')}
                  className="mt-3 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                >
                  Sell Appliance
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((l, idx) => (
                  <div key={idx} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/20 flex items-center gap-3">
                    <img
                      src={l.image}
                      alt={l.name}
                      className="h-12 w-12 rounded-xl object-cover"
                      onError={(e) => {
                        if (e.target.dataset.triedFallback) { e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"; } else { e.target.dataset.triedFallback = "true"; e.target.src = getFallbackProductImage(l.category, l.name); }
                      }}
                    />
                    <div className="flex-grow">
                      <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{l.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5">₹{l.price}</p>
                    </div>
                    <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
