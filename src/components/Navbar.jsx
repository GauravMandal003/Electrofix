import { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Hammer, ShieldCheck, User, LogIn, LogOut, 
  ChevronDown, Calendar, ShoppingBag, Heart, Settings, Check,
  Bell, LayoutDashboard, Award, Users, Plus, FileText, RefreshCw, Star
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [logoutToast, setLogoutToast] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Load user from localStorage
  useEffect(() => {
    const syncUser = () => {
      const authUserStr = localStorage.getItem('ef_auth_user');
      const adminUserStr = localStorage.getItem('ef_admin_user');
      if (authUserStr) {
        try {
          setUser(JSON.parse(authUserStr));
        } catch (e) {
          setUser(null);
        }
      } else if (adminUserStr) {
        try {
          setUser(JSON.parse(adminUserStr));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    syncUser();

    window.addEventListener('ef_profile_update', syncUser);
    window.addEventListener('ef_logout', syncUser);

    return () => {
      window.removeEventListener('ef_profile_update', syncUser);
      window.removeEventListener('ef_logout', syncUser);
    };
  }, [location]);

  // Subscribe to real-time notifications from Firestore
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });
        items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setNotifications(items);
      }, (err) => {
        console.warn("Navbar notifications subscription warning:", err);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Firestore notifs listen error:", e);
    }
  }, []);

  // Clear toast after timeout
  useEffect(() => {
    if (logoutToast) {
      const timer = setTimeout(() => {
        setLogoutToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [logoutToast]);

  const handleLogout = () => {
    auth.signOut().catch(err => console.error("Firebase signOut error:", err));

    localStorage.removeItem('ef_auth_token');
    localStorage.removeItem('ef_auth_user');
    localStorage.removeItem('ef_admin_token');
    localStorage.removeItem('ef_admin_user');
    localStorage.removeItem('ef_cart');
    localStorage.removeItem('ef_wishlist');
    localStorage.removeItem('ef_orders');
    localStorage.removeItem('ef_recently_viewed');
    localStorage.setItem('ef_logged_out', 'true');
    
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }

    setUser(null);

    setLogoutToast({
      message: "You have been logged out successfully.",
      type: "success"
    });

    navigate('/', { replace: true });
    window.dispatchEvent(new CustomEvent('ef_logout'));
  };

  const handleMarkAllRead = async () => {
    const unreadItems = notifications.filter(n => !n.read && !n.isRead);
    for (const item of unreadItems) {
      try {
        await updateDoc(doc(db, 'notifications', item.id), { read: true, isRead: true });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const isAdmin = user?.role === 'admin';

  const menuItems = isAdmin ? [
    { label: 'Dashboard', path: '/admin/dashboard?tab=overview' },
    { label: 'Bookings', path: '/admin/dashboard?tab=bookings' },
    { label: 'Orders', path: '/admin/dashboard?tab=orders' },
    { label: 'Users', path: '/admin/dashboard?tab=customers' },
    { label: 'Products', path: '/admin/dashboard?tab=products' },
    { label: 'Technicians', path: '/admin/dashboard?tab=techs' },
    { label: 'Reports', path: '/admin/dashboard?tab=reports' },
    { label: 'Settings', path: '/admin/dashboard?tab=settings' },
  ] : [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Shop', path: '/shop' },
    { label: 'Sell Used', path: '/sell-used' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (!path || typeof path !== 'string') return false;
    if (path === '/shop') {
      return location.pathname.startsWith('/shop') || location.pathname.startsWith('/products/');
    }
    if (path.includes('?tab=')) {
      const urlTab = path.split('?tab=')[1];
      const params = new URLSearchParams(location.search);
      const currentTab = params.get('tab') || 'overview';
      return location.pathname.startsWith('/admin') && currentTab === urlTab;
    }
    return location.pathname === path;
  };

  const unreadCount = notifications.filter(n => !n.read && !n.isRead).length;

  return (
    <header
      ref={headerRef}
      id="navbar-header"
      className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-[72px] flex items-center transition-all duration-300 shadow-2xs"
    >
      <div className="w-full max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between">
        
        {/* SECTION 1: LEFT - Logo, Brand Name & Small Tagline */}
        <div className="flex items-center shrink-0">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 group focus:outline-none"
            id="nav-logo-btn"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Hammer className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div className="leading-none flex flex-col justify-center">
              <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-0.5">
                Electro<span className="text-blue-600">Fix</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                Certified Repair
              </span>
            </div>
          </Link>
        </div>

        {/* SECTION 2: CENTER - Navigation Links with 32px separation from Logo & Equal 24-32px spacing */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 ml-8 mr-auto shrink-0">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                id={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`relative px-2.5 py-1.5 text-xs xl:text-sm font-semibold tracking-wide transition-all duration-200 whitespace-nowrap rounded-lg flex items-center justify-center ${
                  active
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                {active && (
                  <motion.span
                    layoutId="activeNavTab"
                    className="absolute inset-0 bg-blue-50 border border-blue-100/60 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* SECTION 3: RIGHT - Super Admin Profile, Notifications & Logout */}
        <div className="hidden lg:flex items-center justify-end shrink-0 gap-3 xl:gap-4">
          
          {/* Notifications Dropdown */}
          <div className="relative flex items-center">
            <button
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setIsDropdownOpen(false);
              }}
              className="relative h-10 w-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all focus:outline-none cursor-pointer flex items-center justify-center border border-slate-200/70 hover:border-slate-300 shrink-0"
              aria-label="Notifications"
              id="nav-notifications-btn"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popup */}
            <AnimatePresence>
              {notifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 origin-top-right overflow-hidden"
                  >
                    <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900">Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No recent notifications
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 text-left ${
                              !notif.read && !notif.isRead ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0 opacity-80" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">{notif.title || 'System Alert'}</p>
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{notif.message || notif.body}</p>
                              <span className="text-[9px] text-slate-400 mt-1 block font-mono">
                                {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User / Super Admin Profile Card */}
          {user || isAdmin ? (
            <div className="relative flex items-center">
              <button
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                className="h-10 flex items-center gap-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all focus:outline-none cursor-pointer shrink-0 group"
                id="user-profile-trigger"
                aria-label="User Account Menu"
              >
                <div className="h-7 w-7 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {isAdmin ? 'SA' : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
                </div>
                
                <div className="flex flex-col text-left leading-none justify-center">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                    {isAdmin ? 'Super Admin' : (user?.name || 'Account')}
                  </span>
                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mt-0.5 whitespace-nowrap">
                    {isAdmin ? 'Administrator' : 'Customer'}
                  </span>
                </div>

                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-blue-600' : 'group-hover:text-slate-600'}`} />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 origin-top-right overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 mb-1 bg-slate-50/70">
                        <p className="text-xs font-bold text-slate-900">{user?.role === 'admin' ? (user?.name || 'Super Admin') : (user?.name || 'User')}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email || ''}</p>
                      </div>

                      <div className="space-y-0.5 px-1.5">
                        {isAdmin ? (
                          <>
                            <Link
                              to="/admin/dashboard?tab=overview"
                              onClick={() => setIsDropdownOpen(false)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 transition-all"
                            >
                              <LayoutDashboard className="h-4 w-4 text-slate-400" />
                              <span>Admin Dashboard</span>
                            </Link>
                            <Link
                              to="/admin/dashboard?tab=settings"
                              onClick={() => setIsDropdownOpen(false)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 transition-all"
                            >
                              <Settings className="h-4 w-4 text-slate-400" />
                              <span>System Settings</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/account"
                              onClick={() => setIsDropdownOpen(false)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 transition-all"
                            >
                              <User className="h-4 w-4 text-slate-400" />
                              <span>My Account</span>
                            </Link>
                            <Link
                              to="/account/orders"
                              onClick={() => setIsDropdownOpen(false)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 transition-all"
                            >
                              <ShoppingBag className="h-4 w-4 text-slate-400" />
                              <span>My Orders</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t border-slate-100 my-1.5" />

                      <div className="px-1.5">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer text-left"
                        >
                          <LogOut className="h-4 w-4 shrink-0" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2 h-10">
              <Link
                to="/login"
                id="navbar-login-btn"
                className="h-10 px-4 flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                id="navbar-signup-btn"
                className="h-10 px-4 flex items-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/15 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Logout Button */}
          {(user || isAdmin) && (
            <button
              onClick={handleLogout}
              className="h-10 flex items-center gap-1.5 px-3.5 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-all cursor-pointer shrink-0 shadow-2xs"
              id="nav-logout-btn"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="whitespace-nowrap">Logout</span>
            </button>
          )}

        </div>

        {/* Mobile / Tablet Hamburger Toggle */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="mobile-menu-toggle"
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Slide-out Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[99] lg:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-2xl z-[100] lg:hidden flex flex-col justify-between"
            >
              <div className="flex-1 overflow-y-auto px-6 py-6">
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                      <Hammer className="h-4.5 w-4.5 stroke-[2.2]" />
                    </div>
                    <div className="leading-none">
                      <span className="font-display text-base font-extrabold tracking-tight text-slate-900">
                        Electro<span className="text-blue-600">Fix</span>
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                        {isAdmin ? 'Admin Console' : 'Certified Repair'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Profile Card if Logged In */}
                {(user || isAdmin) && (
                  <div className="mb-6 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                      {isAdmin ? 'SA' : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.role === 'admin' ? (user?.name || 'Super Admin') : (user?.name || 'User')}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
                    </div>
                  </div>
                )}

                {/* Navigation Items */}
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-2 font-mono">
                    {isAdmin ? 'Management Modules' : 'Navigation Menu'}
                  </p>
                  {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? 'bg-blue-50 text-blue-600 font-extrabold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{item.label}</span>
                        {active && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                      </Link>
                    );
                  })}
                </div>

              </div>

              {/* Drawer Footer / Logout */}
              {(user || isAdmin) && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Success Toast */}
      <AnimatePresence>
        {logoutToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-[9999] pointer-events-none"
          >
            <div className="bg-slate-900 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-slate-800 pointer-events-auto max-w-sm">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-100">{logoutToast.message}</p>
              </div>
              <button 
                onClick={() => setLogoutToast(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
