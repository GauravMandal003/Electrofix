import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, addDoc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../firebase';
import { getFallbackProductImage } from '../utils/shopData';
import { onAuthStateChanged } from 'firebase/auth';
import {
  User, Mail, Phone, Calendar, Clock, ShoppingBag, MapPin, CreditCard,
  Lock, Settings, HelpCircle, LogOut, ChevronRight, Trash2, Plus, Edit3,
  Camera, Check, Search, Share2, Grid, AlertCircle, FileText, Download,
  RefreshCw, Bell, Globe, Sliders, MessageSquare, LifeBuoy, Star, ShieldAlert,
  Printer, CheckCircle2, Copy, Heart, ShoppingCart, Upload
} from 'lucide-react';

const TECHNICIANS = [
  {
    name: 'Arjun Sharma',
    rating: '4.9',
    reviews: '142',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
    cert: 'Senior Electrical Engineer'
  },
  {
    name: 'Sarah Connor',
    rating: '4.8',
    reviews: '98',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
    cert: 'Appliance Diagnostics Specialist'
  },
  {
    name: 'Marcus Vance',
    rating: '4.9',
    reviews: '164',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&h=100&q=80',
    cert: 'Smart Electronics Architect'
  },
  {
    name: 'Kabir Mehta',
    rating: '4.7',
    reviews: '110',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    cert: 'Thermal & HVAC Expert'
  }
];

const getStatusStepNumber = (status) => {
  switch (status) {
    case 'Pending Approval': return 1;
    case 'Confirmed': return 2;
    case 'Technician Assigned': return 3;
    case 'On The Way': return 4;
    case 'Service Started': return 5;
    case 'Completed': return 6;
    case 'Cancelled': return -1;
    default: return 1;
  }
};

export default function AccountPage() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || 'dashboard';

  // --- Auth & User State ---
  const [user, setUser] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Predefined Premium Avatars ---
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80'
  ];

  // --- Dynamic states for sections ---
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '555-0192',
    gender: 'Male',
    dob: '1995-06-15',
    avatar: '',
    hasUploadedAvatar: false
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // --- Orders State ---
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnForm, setReturnForm] = useState({ reason: 'defective', notes: '' });

  // --- Bookings State ---
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [adminBookings, setAdminBookings] = useState([]);
  const [cancelConfirmationId, setCancelConfirmationId] = useState(null);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '09:00 AM - 12:00 PM' });

  // --- Wishlist State ---
  const [wishlist, setWishlist] = useState(() => {
    const local = localStorage.getItem('ef_wishlist');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // --- Addresses State ---
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('ef_user_addresses');
      if (saved) return JSON.parse(saved);
      const singleSaved = localStorage.getItem('ef_saved_address');
      if (singleSaved) {
        const parsed = JSON.parse(singleSaved);
        return [{ id: 1, type: 'Home', name: parsed.name || parsed.fullname || '', phone: parsed.phone || '', address: parsed.address || '', city: parsed.city || '', state: parsed.state || '', zip: parsed.zipcode || parsed.zip || '', isDefault: true }];
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ef_user_addresses', JSON.stringify(addresses));
  }, [addresses]);

  const [addressForm, setAddressForm] = useState(null); // null, 'add', or {id: ...}

  // --- Payments State ---
  const [upiIds, setUpiIds] = useState([
    { id: 1, upi: 'johndoe@okaxis', isDefault: true },
    { id: 2, upi: 'jdoe@okicici', isDefault: false }
  ]);
  const [newUpi, setNewUpi] = useState('');
  
  const [cards, setCards] = useState([
    { id: 1, number: '•••• •••• •••• 4242', holder: 'JOHN DOE', expiry: '12/28', type: 'Visa', isDefault: true },
    { id: 2, number: '•••• •••• •••• 5555', holder: 'JOHN DOE', expiry: '09/27', type: 'Mastercard', isDefault: false }
  ]);
  const [newCard, setNewCard] = useState({ number: '', holder: '', expiry: '', cvv: '', type: 'Visa' });
  const [addCardMode, setAddCardMode] = useState(false);

  // --- Notifications State ---
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Order Dispatched', message: 'Your spare parts order #EF-94812 is on its way.', time: '2 hours ago', read: false },
    { id: 2, title: 'Booking Confirmed', message: 'Technician assigned for Washing Machine Repair.', time: '1 day ago', read: true },
    { id: 3, title: 'Welcome to ElectroFix', message: 'Thank you for updating your profile preferences.', time: '3 days ago', read: true }
  ]);

  // --- Settings State ---
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'English',
    emailNotify: true,
    smsNotify: true,
    pushNotify: false,
    twoFactor: false
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // --- Help & Support State ---
  const [tickets, setTickets] = useState([
    { id: 'TKT-1024', subject: 'Inquiry regarding part warranty', category: 'Warranty', status: 'Open', priority: 'Medium', date: '2026-07-02' }
  ]);
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'Warranty', priority: 'Medium', details: '' });
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    { q: 'How long does physical parts delivery take?', a: 'Standard shipping takes 2-3 business days. We also offer emergency Next-Day delivery for urgent breakdowns.' },
    { q: 'Can I reschedule my service technician booking?', a: 'Yes! Go to the "Bookings" tab, find your active booking, and click "Reschedule" to pick a new date and time window.' },
    { q: 'What is the warranty policy for certified spares?', a: 'All spare parts listed on ElectroFix come with a certified 12-month manufacturer replacement warranty.' },
    { q: 'How do I cancel an order or request a return?', a: 'You can cancel any order that has not been dispatched yet from the "Orders" tab. If delivered, you can file a Return Claim.' }
  ];

  // --- Core Life-Cycle Syncing ---
  useEffect(() => {
    // 1. Sync User
    const localUser = localStorage.getItem('ef_auth_user');
    if (!localUser) {
      navigate('/login?redirect=/account');
      return;
    }
    const parsedUser = JSON.parse(localUser);
    setUser(parsedUser);
    setProfileData(prev => ({
      ...prev,
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      avatar: parsedUser.avatar || '',
      hasUploadedAvatar: Boolean(parsedUser.hasUploadedAvatar || parsedUser.customAvatar),
      phone: parsedUser.phone || prev.phone,
      gender: parsedUser.gender || prev.gender,
      dob: parsedUser.dob || prev.dob
    }));

    // Start with loading true
    setBookingsLoading(true);
    setOrdersLoading(true);
    setWishlistLoading(true);

    const unsubscribes = [];

    // 2. Real-time Sync for Bookings from Firestore
    try {
      const bookingsCol = collection(db, 'bookings');
      const unsubBookings = onSnapshot(bookingsCol, (snapshot) => {
        const fbBookings = [];
        const allBkgs = [];
        const currentUid = auth.currentUser?.uid || parsedUser.id;
        const userEmail = (parsedUser.email || '').toLowerCase();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const status = data.status || 'Pending Approval';
          const bkgItem = {
            id: docSnap.id,
            ...data,
            status,
            technician: data.technician || null
          };

          allBkgs.push(bkgItem);

          if (
            (currentUid && data.userId === currentUid) ||
            (userEmail && (data.email || '').toLowerCase() === userEmail) ||
            (parsedUser.name && data.fullName === parsedUser.name)
          ) {
            fbBookings.push(bkgItem);
          }
        });

        fbBookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        allBkgs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setBookings(fbBookings);
        setAdminBookings(allBkgs);
        setBookingsLoading(false);
      }, (fsErr) => {
        console.error("Bookings real-time error:", fsErr);
        handleFirestoreError(fsErr, OperationType.GET, 'bookings');
        setBookingsLoading(false);
      });
      unsubscribes.push(unsubBookings);
    } catch (e) {
      console.error("Failed to subscribe to bookings:", e);
      setBookingsLoading(false);
    }

    // 3. Real-time Sync for Orders from Firestore
    try {
      const ordersCol = collection(db, 'orders');
      const unsubOrders = onSnapshot(ordersCol, (snapshot) => {
        const fbOrders = [];
        const userEmail = (parsedUser.email || '').toLowerCase();
        const currentUid = auth.currentUser?.uid || parsedUser.id;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const orderId = docSnap.id;
          const item = { orderId, id: orderId, ...data };

          if (
            (currentUid && data.userId === currentUid) ||
            (userEmail && (data.email || '').toLowerCase() === userEmail) ||
            (userEmail && (data.shippingAddress?.email || '').toLowerCase() === userEmail) ||
            parsedUser?.role === 'admin'
          ) {
            fbOrders.push(item);
          }
        });

        fbOrders.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
        setOrders(fbOrders);
        setOrdersLoading(false);
      }, (err) => {
        console.error("Orders real-time error:", err);
        handleFirestoreError(err, OperationType.GET, 'orders');
        setOrdersLoading(false);
      });
      unsubscribes.push(unsubOrders);
    } catch (e) {
      console.error("Failed to subscribe to orders:", e);
      setOrdersLoading(false);
    }

    // 4. Real-time Sync for Notifications from Firestore
    try {
      const notifsCol = collection(db, 'notifications');
      const unsubNotifs = onSnapshot(notifsCol, (snapshot) => {
        const userNotifs = [];
        const userEmail = (parsedUser.email || '').toLowerCase();
        const currentUid = auth.currentUser?.uid || parsedUser.id;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const recipient = (data.recipient || '').toLowerCase();
          const target = (data.targetUsers || data.userId || '').toLowerCase();

          if (
            recipient === 'user' ||
            recipient === 'all' ||
            target === (currentUid || '').toLowerCase() ||
            target === userEmail ||
            parsedUser?.role === 'admin'
          ) {
            userNotifs.push({ id: docSnap.id, ...data });
          }
        });

        userNotifs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setNotifications(userNotifs);
      }, (err) => {
        console.error("Notifications real-time error:", err);
      });
      unsubscribes.push(unsubNotifs);
    } catch (e) {
      console.error("Failed to subscribe to notifications:", e);
    }

    // 5. Sync Wishlist
    const localWishlist = localStorage.getItem('ef_wishlist');
    if (localWishlist) {
      try {
        setWishlist(JSON.parse(localWishlist));
      } catch (e) {
        console.error(e);
      }
    }
    setWishlistLoading(false);

    // Setup Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        const local = localStorage.getItem('ef_local_bookings');
        if (local) {
          try {
            setBookings(JSON.parse(local));
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
    unsubscribes.push(unsubscribeAuth);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [navigate]);

  // --- Action Handlers ---
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const updatedUser = {
        ...user,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        gender: profileData.gender,
        dob: profileData.dob,
        avatar: profileData.avatar,
        hasUploadedAvatar: profileData.hasUploadedAvatar
      };
      localStorage.setItem('ef_auth_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setLoading(false);
      window.dispatchEvent(new CustomEvent('ef_profile_update'));
      triggerSuccess('Profile information updated successfully!');
    }, 700);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      triggerError('New passwords do not match.');
      return;
    }
    if (passwordForm.new.length < 6) {
      triggerError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      triggerSuccess('Your password has been changed securely.');
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

  const handleCancelOrder = (orderId) => {
    const updated = orders.map(o => o.orderId === orderId ? { ...o, status: 'Cancelled' } : o);
    setOrders(updated);
    localStorage.setItem('ef_orders', JSON.stringify(updated));
    triggerSuccess(`Order ${orderId} has been cancelled. Refund initiated.`);
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnOrder) return;
    const updated = orders.map(o => o.orderId === returnOrder.orderId ? { ...o, status: 'Return Requested' } : o);
    setOrders(updated);
    localStorage.setItem('ef_orders', JSON.stringify(updated));
    setReturnOrder(null);
    triggerSuccess('Return claim filed. A technician will contact you to inspect.');
  };

  const handleBuyAgain = (product) => {
    const localCart = localStorage.getItem('ef_cart');
    let currentCart = [];
    if (localCart) {
      try { currentCart = JSON.parse(localCart); } catch (e) { console.error(e); }
    }
    const idx = currentCart.findIndex(item => item.product.id === product.id);
    if (idx > -1) {
      currentCart[idx].quantity += 1;
    } else {
      currentCart.push({ product, quantity: 1, withInstallation: false });
    }
    localStorage.setItem('ef_cart', JSON.stringify(currentCart));
    navigate('/shop/cart');
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleBooking) return;
    
    // Update local state
    const updatedBookings = bookings.map(b => b.id === rescheduleBooking.id ? {
      ...b,
      preferredDate: rescheduleForm.date,
      preferredTimeSlot: rescheduleForm.time
    } : b);
    setBookings(updatedBookings);
    
    setAdminBookings(prev => prev.map(b => b.id === rescheduleBooking.id ? {
      ...b,
      preferredDate: rescheduleForm.date,
      preferredTimeSlot: rescheduleForm.time
    } : b));
    
    // Update in Firestore
    try {
      const targetId = rescheduleBooking.bookingId || rescheduleBooking.id;
      const bookingRef = doc(db, 'bookings', targetId);
      await updateDoc(bookingRef, {
        preferredDate: rescheduleForm.date,
        preferredTimeSlot: rescheduleForm.time
      });
    } catch (fsErr) {
      console.error("Failed to reschedule booking in Firestore:", fsErr);
    }
    
    setRescheduleBooking(null);
    triggerSuccess('Repair appointment rescheduled successfully.');
  };

  const handleCancelBooking = async (bookingId) => {
    const bookingToCancel = bookings.find(b => b.id === bookingId) || adminBookings.find(b => b.id === bookingId);
    if (!bookingToCancel) return;

    // Update in user bookings state
    const updatedBookings = bookings.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b);
    setBookings(updatedBookings);

    // Update in admin bookings state
    setAdminBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
    
    // Update in Firestore status to Cancelled
    try {
      const targetId = bookingToCancel.bookingId || bookingId;
      const bookingRef = doc(db, 'bookings', targetId);
      await updateDoc(bookingRef, {
        status: 'Cancelled'
      });
    } catch (fsErr) {
      console.error("Failed to cancel booking in Firestore:", fsErr);
    }
    
    triggerSuccess('Your repair service appointment has been cancelled.');
  };

  const handleRemoveWishlist = (productId) => {
    const filtered = wishlist.filter(p => p.id !== productId);
    setWishlist(filtered);
    localStorage.setItem('ef_wishlist', JSON.stringify(filtered));
    triggerSuccess('Item removed from wishlist.');
  };

  const handleMoveWishlistToCart = (product) => {
    // Add to cart
    const localCart = localStorage.getItem('ef_cart');
    let currentCart = [];
    if (localCart) {
      try { currentCart = JSON.parse(localCart); } catch (e) { console.error(e); }
    }
    const idx = currentCart.findIndex(item => item.product.id === product.id);
    if (idx > -1) {
      currentCart[idx].quantity += 1;
    } else {
      currentCart.push({ product, quantity: 1, withInstallation: false });
    }
    localStorage.setItem('ef_cart', JSON.stringify(currentCart));

    // Remove from wishlist
    handleRemoveWishlist(product.id);
    triggerSuccess(`${product.name} moved to Cart.`);
  };

  const handleShareWishlistProduct = (product) => {
    const url = `${window.location.origin}/products/${product.id}`;
    navigator.clipboard.writeText(url);
    triggerSuccess('Product link copied to clipboard!');
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (addressForm === 'add') {
      const newAddr = {
        id: Date.now(),
        type: e.target.type.value,
        name: e.target.name.value,
        phone: e.target.phone.value,
        address: e.target.address.value,
        city: e.target.city.value,
        state: e.target.state.value,
        zip: e.target.zip.value,
        isDefault: e.target.isDefault.checked
      };
      let current = [...addresses];
      if (newAddr.isDefault) {
        current = current.map(a => ({ ...a, isDefault: false }));
      }
      setAddresses([...current, newAddr]);
      triggerSuccess('New address added successfully.');
    } else {
      const updated = addresses.map(a => a.id === addressForm.id ? {
        ...a,
        type: e.target.type.value,
        name: e.target.name.value,
        phone: e.target.phone.value,
        address: e.target.address.value,
        city: e.target.city.value,
        state: e.target.state.value,
        zip: e.target.zip.value,
        isDefault: e.target.isDefault.checked
      } : a);
      setAddresses(updated);
      triggerSuccess('Address updated successfully.');
    }
    setAddressForm(null);
  };

  const handleAddressDelete = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
    triggerSuccess('Address deleted successfully.');
  };

  const handleAddressDefault = (id) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
    triggerSuccess('Default address updated.');
  };

  const handleAddUpi = (e) => {
    e.preventDefault();
    if (!newUpi.includes('@')) {
      triggerError('Please enter a valid UPI ID (e.g. user@okaxis).');
      return;
    }
    setUpiIds([...upiIds, { id: Date.now(), upi: newUpi, isDefault: false }]);
    setNewUpi('');
    triggerSuccess('UPI handle added successfully.');
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (newCard.number.length < 12 || !newCard.holder || !newCard.expiry || newCard.cvv.length < 3) {
      triggerError('Please enter valid credit card details.');
      return;
    }
    const masked = `•••• •••• •••• ${newCard.number.slice(-4)}`;
    setCards([...cards, {
      id: Date.now(),
      number: masked,
      holder: newCard.holder.toUpperCase(),
      expiry: newCard.expiry,
      type: newCard.type,
      isDefault: false
    }]);
    setNewCard({ number: '', holder: '', expiry: '', cvv: '', type: 'Visa' });
    setAddCardMode(false);
    triggerSuccess('Credit card saved securely.');
  };

  const handleSetDefaultCard = (id) => {
    setCards(cards.map(c => ({ ...c, isDefault: c.id === id })));
    triggerSuccess('Default payment method updated.');
  };

  const handleSetDefaultUpi = (id) => {
    setUpiIds(upiIds.map(u => ({ ...u, isDefault: u.id === id })));
    triggerSuccess('Default UPI payment ID updated.');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() === 'delete') {
      setShowDeleteModal(false);
      handleLogout();
    } else {
      triggerError('Please type DELETE to confirm.');
    }
  };

  const handleRaiseTicket = (e) => {
    e.preventDefault();
    const newTkt = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketForm.subject,
      category: ticketForm.category,
      priority: ticketForm.priority,
      status: 'Open',
      date: new Date().toISOString().split('T')[0]
    };
    setTickets([newTkt, ...tickets]);
    setTicketForm({ subject: '', category: 'Warranty', priority: 'Medium', details: '' });
    triggerSuccess('Your support ticket has been raised. A technician will update you within 4 hours.');
  };

  const getPasswordStrength = () => {
    if (!passwordForm.new) return { text: 'Empty', color: 'bg-slate-200', width: 'w-0' };
    if (passwordForm.new.length < 4) return { text: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
    if (passwordForm.new.length < 8) return { text: 'Fair', color: 'bg-yellow-500', width: 'w-1/2' };
    return { text: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-slate-500 text-xs font-semibold">Configuring your personal workshop...</p>
        </div>
      </div>
    );
  }

  // --- Sidebar Items ---
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Grid },
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, badge: orders.length },
    { id: 'bookings', label: 'Bookings', icon: Calendar, badge: bookings.length },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.filter(n => !n.read).length },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Toast Alerts */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-4 sm:right-8 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl z-50 flex items-center gap-2.5 border border-slate-800 text-xs font-bold"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-4 sm:right-8 bg-red-900 text-white px-5 py-3.5 rounded-2xl shadow-xl z-50 flex items-center gap-2.5 border border-red-800 text-xs font-bold"
            >
              <ShieldAlert className="h-4 w-4 text-red-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Root Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT SIDEBAR (Desktop) / Horizontal Tab Menu (Mobile) */}
          <div className="w-full lg:w-72 shrink-0 bg-white border border-slate-100 rounded-3xl p-4 shadow-sm lg:sticky lg:top-28">
            <div className="hidden lg:flex items-center gap-3.5 px-3 py-4 border-b border-slate-100 mb-4 bg-slate-50/60 rounded-2xl">
              {profileData.hasUploadedAvatar && profileData.avatar && (
                <div className="h-11 w-11 rounded-xl bg-slate-100 overflow-hidden ring-2 ring-blue-100 relative shrink-0">
                  <img
                    src={profileData.avatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-sans font-extrabold text-sm text-slate-900 truncate leading-snug">{user?.name}</h4>
                <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">{user?.email}</p>
              </div>
            </div>

            {/* Sidebar list items */}
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/account/${item.id}`)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap lg:w-full ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-grow text-left">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none ${isActive ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              
              <div className="hidden lg:block border-t border-slate-100 my-2.5" />
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer whitespace-nowrap lg:w-full"
              >
                <LogOut className="h-4 w-4 text-rose-400" />
                <span className="text-left">Sign Out</span>
              </button>
            </nav>
          </div>

          {/* MAIN ACTIVE CONTENT TAB */}
          <div className="flex-1 w-full bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
              >
                
                {/* 1. DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-8 animate-fade-in">
                    {/* Welcome Banner */}
                    <div className="p-6 rounded-3xl bg-slate-900 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-slate-900/10">
                      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />
                      <div className="space-y-1 relative z-10">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-900/40 border border-blue-800/50 px-2.5 py-1 rounded-full">
                          ⭐ Premium ElectroFix Member
                        </span>
                        <h2 className="text-2xl font-extrabold font-display tracking-tight pt-2">
                          Hello, {user.name}!
                        </h2>
                        <p className="text-xs text-slate-400 max-w-sm">
                          Keep your premium home devices and appliances operating at maximum engineering efficiency.
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-3 bg-slate-800/40 border border-slate-700/30 p-3 rounded-2xl relative z-10 backdrop-blur-xs">
                        <div className="h-10 w-10 rounded-xl overflow-hidden">
                          <img
                            src={profileData.avatar}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80";
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{user.name}</p>
                          <p className="text-[10px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Spares Ordered', value: orders.length, icon: ShoppingBag, color: 'text-blue-500 bg-blue-50' },
                        { label: 'Active Repairs Scheduled', value: bookings.length, icon: Calendar, color: 'text-emerald-500 bg-emerald-50' },
                        { label: 'Saved Spares Wishlist', value: wishlist.length, icon: Heart, color: 'text-rose-500 bg-rose-50' },
                        { label: 'Account Security Status', value: 'Excellent', icon: Lock, color: 'text-indigo-500 bg-indigo-50' }
                      ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-slate-100 flex items-center gap-3 bg-slate-50/20">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                            <stat.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{stat.label}</p>
                            <p className="text-sm font-extrabold text-slate-900 font-mono leading-none">{stat.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recent Order & Service Tracking Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Quick Order status */}
                      <div className="p-5 rounded-2xl border border-slate-150 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-blue-500" />
                          <span>Latest Spare Order Tracking</span>
                        </h4>
                        
                        {orders.length === 0 ? (
                          <p className="text-xs text-slate-400 py-4 text-center">No recent orders registered.</p>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl text-xs font-semibold">
                              <span className="font-mono text-slate-800">{orders[0].orderId}</span>
                              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{orders[0].status}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 space-y-1">
                              <p className="font-bold text-slate-800 truncate">{orders[0].items[0].product.name}</p>
                              <p>Estimated Dispatch Window: Within 24 Hours</p>
                            </div>
                            <button
                              onClick={() => navigate('/account/orders')}
                              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <span>View Full Shipment Journey</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right: Quick Booking status */}
                      <div className="p-5 rounded-2xl border border-slate-150 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-emerald-500" />
                          <span>Upcoming Technician Repairs</span>
                        </h4>
                        
                        {bookings.length === 0 ? (
                          <div className="text-center py-4 space-y-2">
                            <p className="text-xs text-slate-400">No upcoming repair appointments.</p>
                            <button onClick={() => navigate('/services')} className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">Book a Repair</button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl text-xs font-semibold">
                              <span className="font-bold text-slate-900 truncate">{bookings[0].serviceName || "Premium Service"}</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                bookings[0].status === 'Pending Approval' ? 'text-amber-600 bg-amber-50' :
                                bookings[0].status === 'Cancelled' ? 'text-rose-600 bg-rose-50' :
                                bookings[0].status === 'Completed' ? 'text-emerald-600 bg-emerald-50' :
                                'text-blue-600 bg-blue-50'
                              }`}>
                                {bookings[0].status || 'Pending Approval'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 space-y-1.5">
                              <p className="flex items-center gap-1.5 text-slate-800 font-bold">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {bookings[0].preferredDate} ({bookings[0].preferredTimeSlot})
                              </p>
                              {bookings[0].technician ? (
                                <p className="flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Assigned: {bookings[0].technician.name} ({bookings[0].technician.cert})</span>
                                </p>
                              ) : (
                                <p className="flex items-center gap-1.5 text-slate-400 italic">
                                  <User className="h-3.5 w-3.5 text-slate-300" />
                                  <span>Assigned Engineer: Awaiting confirmation</span>
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => navigate('/account/bookings')}
                              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <span>Reschedule or Contact Engineer</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PROFILE TAB */}
                {activeTab === 'profile' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 font-display">Profile Information</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Manage your personal details, contact credentials, and avatar preferences.</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      {/* Profile Picture Section */}
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profile Picture</label>
                            <p className="text-[11px] text-slate-500 mt-0.5">Upload a photo or select an avatar to display across ElectroFix.</p>
                          </div>
                          {profileData.hasUploadedAvatar && (
                            <button
                              type="button"
                              onClick={() => setProfileData({ ...profileData, avatar: '', hasUploadedAvatar: false })}
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              Remove Photo
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          {/* File Upload Button */}
                          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 text-blue-700 text-xs font-bold hover:bg-blue-100/50 transition-colors cursor-pointer">
                            <Upload className="h-4 w-4 shrink-0" />
                            <span>Upload Custom Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    setProfileData({
                                      ...profileData,
                                      avatar: event.target.result,
                                      hasUploadedAvatar: true
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                          {/* Preset Avatars */}
                          <div className="flex flex-wrap gap-2.5 items-center">
                            {avatars.map((av, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setProfileData({ ...profileData, avatar: av, hasUploadedAvatar: true })}
                                className={`h-10 w-10 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                  profileData.avatar === av && profileData.hasUploadedAvatar ? 'border-blue-600 scale-105 ring-4 ring-blue-50' : 'border-slate-200 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img
                                  src={av}
                                  alt="avatar option"
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Fields row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                          <input
                            type="text"
                            required
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                          <input
                            type="email"
                            required
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
                          <input
                            type="text"
                            required
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date of Birth</label>
                          <input
                            type="date"
                            value={profileData.dob}
                            onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gender</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['Male', 'Female', 'Other'].map((gen) => (
                              <button
                                key={gen}
                                type="button"
                                onClick={() => setProfileData({ ...profileData, gender: gen })}
                                className={`py-2 px-3 border rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                                  profileData.gender === gen
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {gen}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-600/10 flex items-center gap-2 cursor-pointer"
                      >
                        {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Save Profile Changes'}
                      </button>
                    </form>

                    <div className="border-t border-slate-100 my-8 pt-8" />

                    {/* Change Password Sub-Form */}
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                      <div>
                        <h4 className="font-display font-extrabold text-sm text-slate-950">Update Security Password</h4>
                        <p className="text-[11px] text-slate-400">Ensure a unique, hard-to-guess credential sequence.</p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Password</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New Password</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={passwordForm.new}
                            onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-blue-600"
                          />
                          {/* strength visual */}
                          {passwordForm.new && (
                            <div className="pt-1.5 space-y-1">
                              <div className="h-1.5 bg-slate-150 rounded-full overflow-hidden w-full">
                                <div className={`h-full ${getPasswordStrength().color} ${getPasswordStrength().width} transition-all duration-300`} />
                              </div>
                              <p className="text-[9px] font-extrabold text-slate-400">Strength: {getPasswordStrength().text}</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirm New Password</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={passwordForm.confirm}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                      >
                        Update Security Key
                      </button>
                    </form>
                  </div>
                )}

                {/* 3. ORDERS TAB */}
                {activeTab === 'orders' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 font-display">My Orders & Tracking</h3>
                      <p className="text-slate-400 text-xs mt-0.5">View your purchase history, download invoices, track dispatches, or initiate claims.</p>
                    </div>

                    {ordersLoading ? (
                      <div className="space-y-5">
                        {[1, 2].map((n) => (
                          <div key={n} className="border border-slate-150 rounded-2xl bg-white p-5 space-y-4 animate-pulse">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                              <div className="space-y-2">
                                <div className="h-3 bg-slate-200 rounded w-28"></div>
                                <div className="h-3 bg-slate-200 rounded w-20"></div>
                              </div>
                              <div className="h-5 bg-slate-200 rounded-full w-16"></div>
                            </div>
                            <div className="flex gap-4 items-center">
                              <div className="h-12 w-12 bg-slate-200 rounded-lg shrink-0"></div>
                              <div className="space-y-2 flex-grow">
                                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl space-y-4 bg-slate-50/20 max-w-md mx-auto">
                        <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto stroke-1" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">No Orders Registered</h4>
                          <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1">You have not ordered any physical spare parts or appliances yet.</p>
                        </div>
                        <button onClick={() => navigate('/shop')} className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold">Go to Shop Catalog</button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {orders.map((order) => {
                          const isCancelled = order.status === 'Cancelled';
                          const isReturned = order.status === 'Return Requested';
                          
                          return (
                            <div key={order.orderId} className="border border-slate-150 rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-sm transition-all p-5 space-y-4">
                              {/* Header details bar */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Reference ID: {order.orderId}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">Ordered on: {order.date}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                    isCancelled ? 'bg-red-50 text-red-600 border-red-100' :
                                    isReturned ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                  }`}>
                                    {order.status}
                                  </span>

                                  <button
                                    onClick={() => setSelectedInvoice(order)}
                                    className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-1 cursor-pointer"
                                  >
                                    <FileText className="h-3 w-3" />
                                    <span>Invoice</span>
                                  </button>
                                </div>
                              </div>

                              {/* Items list */}
                              <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-50">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 py-1 first:pt-0 last:pb-0">
                                    <img
                                      src={item.product.image || getFallbackProductImage(item.product.category, item.product.name)}
                                      alt={item.product.name}
                                      className="h-10 w-10 rounded-lg object-cover border bg-white shrink-0"
                                      onError={(e) => {
                                        if (e.target.dataset.triedFallback) {
                                          e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                                        } else {
                                          e.target.dataset.triedFallback = "true";
                                          e.target.src = getFallbackProductImage(item.product.category, item.product.name);
                                        }
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h5>
                                      <p className="text-[9px] text-slate-400 font-bold font-mono mt-0.5">Qty: {item.quantity} × ₹{item.product.price}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-xs font-bold text-slate-900 font-mono">₹{item.product.price * item.quantity}</p>
                                      <button
                                        onClick={() => handleBuyAgain(item.product)}
                                        className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 mt-1 cursor-pointer hover:underline block"
                                      >
                                        Buy Again
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Bottom costs & actions */}
                              <div className="flex justify-between items-center pt-2">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Paid</span>
                                  <span className="text-sm font-extrabold text-slate-900 font-mono">₹{order.costs.total}</span>
                                </div>
                                <div className="flex gap-2">
                                  {!isCancelled && !isReturned && order.status !== 'Delivered' && (
                                    <button
                                      onClick={() => handleCancelOrder(order.orderId)}
                                      className="px-3.5 py-1.5 border border-red-250 text-red-650 hover:bg-red-50 rounded-xl text-xs font-bold cursor-pointer"
                                    >
                                      Cancel Order
                                    </button>
                                  )}
                                  {order.status === 'Delivered' && (
                                    <button
                                      onClick={() => setReturnOrder(order)}
                                      className="px-3.5 py-1.5 border border-amber-250 text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-bold cursor-pointer"
                                    >
                                      Return Spare
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. BOOKINGS TAB */}
                {activeTab === 'bookings' && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 font-display">My Appliance Bookings</h3>
                        <p className="text-slate-400 text-xs mt-0.5">Manage your repair service tickets, view technical engineer details, and track status timelines.</p>
                      </div>
                      <button onClick={() => navigate('/services')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold self-start sm:self-auto flex items-center gap-1.5 transition-all">
                        <Plus className="h-4 w-4" />
                        <span>Book New Service</span>
                      </button>
                    </div>

                    {bookingsLoading ? (
                      <div className="space-y-6">
                        {[1, 2].map((n) => (
                          <div key={n} className="border border-slate-150 rounded-3xl bg-white p-5 sm:p-6 space-y-5 animate-pulse">
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                              <div className="space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-24"></div>
                                <div className="h-5 bg-slate-200 rounded w-48"></div>
                              </div>
                              <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                            </div>
                            <div className="h-12 bg-slate-100 rounded-2xl w-full"></div>
                            <div className="flex gap-4">
                              <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
                              <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-slate-150 rounded-3xl space-y-4 bg-slate-50/20 max-w-md mx-auto">
                        <Calendar className="h-12 w-12 text-slate-300 mx-auto stroke-1" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">No Bookings Found</h4>
                          <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1">You have no scheduled repair tasks right now.</p>
                        </div>
                        <button onClick={() => navigate('/services')} className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold">Schedule Repair Task</button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {bookings.map((booking) => {
                          const currentStatus = booking.status || 'Pending Approval';
                          const statusStep = getStatusStepNumber(currentStatus);
                          
                          // Style status badge dynamically
                          let badgeStyles = "text-amber-600 bg-amber-50 border-amber-100";
                          if (currentStatus === 'Confirmed') badgeStyles = "text-blue-600 bg-blue-50 border-blue-100";
                          else if (currentStatus === 'Technician Assigned') badgeStyles = "text-indigo-600 bg-indigo-50 border-indigo-100";
                          else if (currentStatus === 'On The Way') badgeStyles = "text-orange-600 bg-orange-50 border-orange-100";
                          else if (currentStatus === 'Service Started') badgeStyles = "text-sky-600 bg-sky-50 border-sky-100";
                          else if (currentStatus === 'Completed') badgeStyles = "text-emerald-600 bg-emerald-50 border-emerald-100";
                          else if (currentStatus === 'Cancelled') badgeStyles = "text-rose-600 bg-rose-50 border-rose-100";

                          return (
                            <div key={booking.id} className="border border-slate-150 rounded-3xl bg-white overflow-hidden shadow-xs p-5 sm:p-6 space-y-6">
                              
                              {/* Booking info top bar */}
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
                                <div>
                                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md font-mono">Booking ID: {booking.bookingId || booking.id}</span>
                                  <h4 className="text-sm font-extrabold text-slate-900 mt-1">{booking.serviceName || "Premium Appliance Repair"}</h4>
                                </div>
                                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border self-start sm:self-auto uppercase tracking-wider ${badgeStyles}`}>
                                  {currentStatus}
                                </span>
                              </div>

                              {/* Estimated Visit Section */}
                              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Visit Time</span>
                                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    <span>
                                      {currentStatus === 'Pending Approval' ? "Awaiting admin confirmation and schedule review" : 
                                       currentStatus === 'Cancelled' ? "Cancelled" :
                                       currentStatus === 'Completed' ? `Completed on ${booking.preferredDate} at ${booking.preferredTimeSlot}` :
                                       currentStatus === 'On The Way' ? "Technician dispatched! Arriving in 15-30 minutes" :
                                       `Confirmed for ${booking.preferredDate} (${booking.preferredTimeSlot})`}
                                    </span>
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Doorstep Address</span>
                                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="truncate max-w-[240px]" title={`${booking.address}, ${booking.city}, ${booking.state}, ${booking.pinCode}`}>
                                      {booking.address}, {booking.city}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              {/* Horizontal Timeline (Stepper) */}
                              {currentStatus !== 'Cancelled' ? (
                                <div className="space-y-3 py-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service Tracker Timeline</span>
                                  <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-2">
                                    {/* Line connecting steps */}
                                    <div className="absolute left-[15px] md:left-0 top-3 md:top-1/2 md:-translate-y-1/2 w-0.5 md:w-full h-full md:h-0.5 bg-slate-100 -z-10" />
                                    <div 
                                      className="absolute left-[15px] md:left-0 top-3 md:top-1/2 md:-translate-y-1/2 w-0.5 md:h-0.5 bg-blue-600 transition-all duration-500 -z-10" 
                                      style={{
                                        height: '1px',
                                        width: `${((statusStep - 1) / 5) * 100}%`
                                      }}
                                    />

                                    {[
                                      { label: 'Submitted', desc: 'Request submitted' },
                                      { label: 'Approved', desc: 'Confirmed by Admin' },
                                      { label: 'Assigned', desc: 'Technician allocated' },
                                      { label: 'En Route', desc: 'Technician on the way' },
                                      { label: 'Started', desc: 'Repair active' },
                                      { label: 'Completed', desc: 'Service finished' }
                                    ].map((step, idx) => {
                                      const stepNum = idx + 1;
                                      const isCompleted = statusStep >= stepNum;

                                      return (
                                        <div key={idx} className="flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center flex-1 w-full md:w-auto">
                                          {/* Circle step indicator */}
                                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                                            isCompleted ? 'bg-blue-600 text-white ring-4 ring-blue-50' :
                                            'bg-white text-slate-400 border-2 border-slate-200'
                                          }`}>
                                            {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : stepNum}
                                          </div>
                                          {/* Step details labels */}
                                          <div className="space-y-0.5">
                                            <p className={`text-[11px] font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                              {step.label}
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-medium hidden md:block">{step.desc}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 bg-red-50 border border-red-100/50 rounded-2xl flex items-center gap-3 text-red-700">
                                  <AlertCircle className="h-5 w-5 stroke-2" />
                                  <div className="text-xs">
                                    <p className="font-extrabold">Service Ticket Cancelled</p>
                                    <p className="text-red-500 font-medium mt-0.5">This booking has been cancelled and will not be serviced.</p>
                                  </div>
                                </div>
                              )}

                              {/* Service and Timeslot detail card & Technician Card side-by-side */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                <div className="space-y-3.5 p-5 rounded-2xl bg-slate-50/50 border border-slate-100 text-xs text-slate-600">
                                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400">Scheduled Info</p>
                                  <div className="space-y-2 font-medium">
                                    <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" /> Preferred Slot: {booking.preferredDate} • {booking.preferredTimeSlot}</p>
                                    <p className="flex items-center gap-2"><User className="h-4 w-4 text-slate-400" /> Customer: {booking.fullName}</p>
                                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> Phone: {booking.phone}</p>
                                    {booking.instructions && (
                                      <p className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-500 mt-1">
                                        <span className="font-bold text-slate-700 shrink-0">Note:</span> 
                                        <span>"{booking.instructions}"</span>
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Technician Card: Only show if technician exists AND status is NOT Pending Approval AND status is NOT Cancelled */}
                                {booking.technician && currentStatus !== 'Pending Approval' && currentStatus !== 'Cancelled' ? (
                                  <div className="p-5 rounded-2xl border border-slate-150 flex flex-col justify-between bg-white shadow-xs">
                                    <div className="flex items-start gap-3.5">
                                      <img
                                        src={booking.technician.avatar}
                                        alt={booking.technician.name}
                                        className="h-12 w-12 rounded-full object-cover shrink-0 ring-4 ring-slate-100"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80";
                                        }}
                                      />
                                      <div className="min-w-0 flex-1">
                                        <span className="text-[8px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md inline-block">Assigned Engineer</span>
                                        <p className="text-xs font-extrabold text-slate-900 truncate mt-1">{booking.technician.name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold truncate">{booking.technician.cert}</p>
                                        <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-500">
                                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                          <span>{booking.technician.rating}</span>
                                          <span className="text-slate-400 font-medium">({booking.technician.reviews} reviews)</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 pt-4 mt-2 border-t border-slate-100/60">
                                      <a href={`tel:${booking.phone}`} className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg text-center transition-all">
                                        Call Engineer
                                      </a>
                                      <button onClick={() => triggerSuccess(`Chat initialized with engineer ${booking.technician.name}`)} className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg transition-all">
                                        Direct Chat
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-5 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center bg-slate-50/20">
                                    <div className="h-9 w-9 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                                      <User className="h-4 w-4" />
                                    </div>
                                    <h5 className="text-[11px] font-bold text-slate-800 mt-2">No Technician Assigned</h5>
                                    <p className="text-[9px] text-slate-400 max-w-[200px] mt-0.5">Technician details will become visible here once the admin confirms your booking and schedules an engineer.</p>
                                  </div>
                                )}
                              </div>

                              {/* Booking Action Buttons - only visible for Pending Approval and Confirmed statuses */}
                              {(currentStatus === 'Pending Approval' || currentStatus === 'Confirmed') && (
                                <div className="flex gap-2.5 pt-2">
                                  <button
                                    onClick={() => {
                                      setRescheduleBooking(booking);
                                      setRescheduleForm({ date: booking.preferredDate, time: booking.preferredTimeSlot });
                                    }}
                                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex-1 text-center transition-all"
                                  >
                                    Reschedule Booking
                                  </button>
                                  <button
                                    onClick={() => setCancelConfirmationId(booking.id)}
                                    className="px-4 py-2 border border-red-200 hover:bg-red-50 rounded-xl text-xs font-bold text-red-600 cursor-pointer flex-1 text-center transition-all"
                                  >
                                    Cancel Booking
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ADMIN PORTAL TAB */}
                {activeTab === 'admin-portal' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 font-display">Administrative Service Portal</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Control center to approve/reject bookings, assign technical engineers, schedule visits, and update live service status.</p>
                    </div>

                    {adminBookings.length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-slate-150 rounded-3xl space-y-4 bg-slate-50/20 max-w-md mx-auto">
                        <Sliders className="h-12 w-12 text-slate-300 mx-auto stroke-1" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">No Service Tickets Registered</h4>
                          <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1">There are no incoming customer bookings to manage currently.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {adminBookings.map((bkg) => {
                          const status = bkg.status || 'Pending Approval';
                          
                          // Badges style
                          let badgeStyles = "text-amber-600 bg-amber-50 border-amber-100";
                          if (status === 'Confirmed') badgeStyles = "text-blue-600 bg-blue-50 border-blue-100";
                          else if (status === 'Technician Assigned') badgeStyles = "text-indigo-600 bg-indigo-50 border-indigo-100";
                          else if (status === 'On The Way') badgeStyles = "text-orange-600 bg-orange-50 border-orange-100";
                          else if (status === 'Service Started') badgeStyles = "text-sky-600 bg-sky-50 border-sky-100";
                          else if (status === 'Completed') badgeStyles = "text-emerald-600 bg-emerald-50 border-emerald-100";
                          else if (status === 'Cancelled') badgeStyles = "text-rose-600 bg-rose-50 border-rose-100";

                          return (
                            <div key={bkg.id} className="border border-slate-150 rounded-2xl bg-white p-5 sm:p-6 shadow-xs space-y-5">
                              
                              {/* Ticket title and quick status */}
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded font-mono">TICKET: {bkg.id}</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded font-mono">USER ID: {bkg.userId}</span>
                                  </div>
                                  <h4 className="text-sm font-extrabold text-slate-900 mt-1">{bkg.serviceName || "Premium Appliance Repair"}</h4>
                                </div>
                                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border self-start sm:self-auto uppercase tracking-wider ${badgeStyles}`}>
                                  {status}
                                </span>
                              </div>

                              {/* Customer and Schedule detail block */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Customer Contacts</span>
                                  <p className="font-bold text-slate-800">{bkg.fullName}</p>
                                  <p className="text-slate-500">{bkg.phone}</p>
                                  <p className="text-slate-500 truncate">{bkg.email}</p>
                                </div>

                                <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Address Details</span>
                                  <p className="font-bold text-slate-800">{bkg.address}</p>
                                  <p className="text-slate-500">{bkg.city}, {bkg.state}</p>
                                  <p className="text-slate-500">PIN: {bkg.pinCode}</p>
                                </div>

                                <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Scheduled Slot</span>
                                  <p className="font-bold text-slate-800">{bkg.preferredDate}</p>
                                  <p className="text-slate-500">{bkg.preferredTimeSlot}</p>
                                  {bkg.instructions && <p className="text-slate-500 italic truncate">"{bkg.instructions}"</p>}
                                </div>
                              </div>

                              {/* Technician Assigned Detail */}
                              <div className="flex items-center justify-between p-3 border border-slate-100 bg-white rounded-xl text-xs">
                                <div className="flex items-center gap-2.5">
                                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                  <span className="font-bold text-slate-700">Assigned Engineer:</span>
                                  {bkg.technician ? (
                                    <span className="font-extrabold text-blue-600 bg-blue-50/50 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                                      <img
                                        src={bkg.technician.avatar}
                                        className="h-4 w-4 rounded-full object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80";
                                        }}
                                      />
                                      <span>{bkg.technician.name} ({bkg.technician.cert})</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-medium">None</span>
                                  )}
                                </div>
                              </div>

                              {/* INTERACTIVE ADMIN ACTIONS PANEL */}
                              <div className="p-4 bg-slate-50/40 rounded-xl border border-slate-100 space-y-4">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Administrative Service Status Transitions</span>
                                
                                <div className="flex flex-wrap gap-2.5">
                                  {/* Step 1: Approve / Reject (Only for Pending Approval) */}
                                  {status === 'Pending Approval' && (
                                    <>
                                      <button 
                                        onClick={async () => {
                                          // Update status to Confirmed
                                          const updated = adminBookings.map(item => item.id === bkg.id ? { ...item, status: 'Confirmed' } : item);
                                          setAdminBookings(updated);
                                          setBookings(prev => prev.map(item => item.id === bkg.id ? { ...item, status: 'Confirmed' } : item));
                                          try {
                                            await updateDoc(doc(db, 'bookings', bkg.id), { status: 'Confirmed' });
                                            triggerSuccess('Booking approved successfully. Status changed to Confirmed.');
                                          } catch(e) { console.error(e); }
                                        }}
                                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Approve Booking</span>
                                      </button>
                                      <button 
                                        onClick={async () => {
                                          // Reject Booking
                                          const updated = adminBookings.map(item => item.id === bkg.id ? { ...item, status: 'Cancelled' } : item);
                                          setAdminBookings(updated);
                                          setBookings(prev => prev.map(item => item.id === bkg.id ? { ...item, status: 'Cancelled' } : item));
                                          try {
                                            await updateDoc(doc(db, 'bookings', bkg.id), { status: 'Cancelled' });
                                            triggerSuccess('Booking has been rejected.');
                                          } catch(e) { console.error(e); }
                                        }}
                                        className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        <span>Reject Booking</span>
                                      </button>
                                    </>
                                  )}

                                  {/* Step 2: Assign Technician (For Confirmed) */}
                                  {status === 'Confirmed' && (
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                      <select 
                                        onChange={async (e) => {
                                          const selectedIndex = parseInt(e.target.value);
                                          if (isNaN(selectedIndex)) return;
                                          const tech = TECHNICIANS[selectedIndex];
                                          const updated = adminBookings.map(item => item.id === bkg.id ? { ...item, status: 'Technician Assigned', technician: tech } : item);
                                          setAdminBookings(updated);
                                          setBookings(prev => prev.map(item => item.id === bkg.id ? { ...item, status: 'Technician Assigned', technician: tech } : item));
                                          try {
                                            await updateDoc(doc(db, 'bookings', bkg.id), { status: 'Technician Assigned', technician: tech });
                                            triggerSuccess(`Engineer ${tech.name} assigned successfully.`);
                                          } catch(e) { console.error(e); }
                                        }}
                                        className="p-1.5 border rounded-lg text-xs bg-white font-semibold"
                                        defaultValue=""
                                      >
                                        <option value="" disabled>-- Select Technical Engineer to Assign --</option>
                                        {TECHNICIANS.map((tech, idx) => (
                                          <option key={idx} value={idx}>{tech.name} ({tech.cert}) - {tech.rating}★</option>
                                        ))}
                                      </select>
                                    </div>
                                  )}

                                  {/* Step 3: Dispatch Tech (For Technician Assigned) */}
                                  {status === 'Technician Assigned' && (
                                    <button 
                                      onClick={async () => {
                                        const updated = adminBookings.map(item => item.id === bkg.id ? { ...item, status: 'On The Way' } : item);
                                        setAdminBookings(updated);
                                        setBookings(prev => prev.map(item => item.id === bkg.id ? { ...item, status: 'On The Way' } : item));
                                        try {
                                          await updateDoc(doc(db, 'bookings', bkg.id), { status: 'On The Way' });
                                          triggerSuccess('Technician dispatched! Status changed to On The Way.');
                                        } catch(e) { console.error(e); }
                                      }}
                                      className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Dispatch Technician</span>
                                    </button>
                                  )}

                                  {/* Step 4: Start Service (For On The Way) */}
                                  {status === 'On The Way' && (
                                    <button 
                                      onClick={async () => {
                                        const updated = adminBookings.map(item => item.id === bkg.id ? { ...item, status: 'Service Started' } : item);
                                        setAdminBookings(updated);
                                        setBookings(prev => prev.map(item => item.id === bkg.id ? { ...item, status: 'Service Started' } : item));
                                        try {
                                          await updateDoc(doc(db, 'bookings', bkg.id), { status: 'Service Started' });
                                          triggerSuccess('Repair service started! Status changed to Service Started.');
                                        } catch(e) { console.error(e); }
                                      }}
                                      className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Start Repair Work</span>
                                    </button>
                                  )}

                                  {/* Step 5: Mark Completed (For Service Started) */}
                                  {status === 'Service Started' && (
                                    <button 
                                      onClick={async () => {
                                        const updated = adminBookings.map(item => item.id === bkg.id ? { ...item, status: 'Completed' } : item);
                                        setAdminBookings(updated);
                                        setBookings(prev => prev.map(item => item.id === bkg.id ? { ...item, status: 'Completed' } : item));
                                        try {
                                          await updateDoc(doc(db, 'bookings', bkg.id), { status: 'Completed' });
                                          triggerSuccess('Repair work completed successfully!');
                                        } catch(e) { console.error(e); }
                                      }}
                                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      <span>Mark Completed</span>
                                    </button>
                                  )}

                                  {/* Reschedule Visit / Schedule Date and Slot (Available for non-terminal states) */}
                                  {status !== 'Completed' && status !== 'Cancelled' && (
                                    <button 
                                      onClick={() => {
                                        setRescheduleBooking(bkg);
                                        setRescheduleForm({ date: bkg.preferredDate, time: bkg.preferredTimeSlot });
                                      }}
                                      className="px-3 py-1.5 border border-slate-250 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Schedule / Edit Visit Slot</span>
                                    </button>
                                  )}

                                  {/* Completed or Cancelled Info Message */}
                                  {(status === 'Completed' || status === 'Cancelled') && (
                                    <p className="text-slate-400 italic text-[11px] font-medium">This service ticket has reached its terminal state and cannot be modified further.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. WISHLIST TAB */}
                {activeTab === 'wishlist' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 font-display">My Wishlist</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Explore your saved spares, quick-move them to the cart, or share links with engineers.</p>
                    </div>

                    {wishlistLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="border border-slate-150 rounded-2xl bg-white p-4 space-y-4 animate-pulse flex flex-col justify-between">
                            <div className="aspect-video bg-slate-100 rounded-xl w-full"></div>
                            <div className="space-y-2">
                              <div className="h-3 bg-slate-200 rounded w-12"></div>
                              <div className="h-4 bg-slate-200 rounded w-full"></div>
                            </div>
                            <div className="h-8 bg-slate-200 rounded-xl w-full mt-2"></div>
                          </div>
                        ))}
                      </div>
                    ) : wishlist.length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl space-y-4 bg-slate-50/20 max-w-md mx-auto">
                        <Heart className="h-12 w-12 text-slate-300 mx-auto stroke-1" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Your Wishlist is Empty</h4>
                          <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1">Browse our genuine appliance parts catalog and click the heart icon to save components.</p>
                        </div>
                        <button onClick={() => navigate('/shop')} className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold">Browse Catalog</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {wishlist.map((product) => (
                          <div key={product.id} className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-xs flex flex-col justify-between hover:shadow-sm transition-all">
                            <div className="relative aspect-video bg-slate-50 flex items-center justify-center p-4">
                              <img
                                src={product.image || getFallbackProductImage(product.category, product.name)}
                                alt={product.name}
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                  if (e.target.dataset.triedFallback) {
                                    e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                                  } else {
                                    e.target.dataset.triedFallback = "true";
                                    e.target.src = getFallbackProductImage(product.category, product.name);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleRemoveWishlist(product.id)}
                                className="absolute top-2.5 right-2.5 h-7 w-7 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-100 rounded-full flex items-center justify-center cursor-pointer shadow-xs"
                                title="Remove item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="p-4 flex-grow flex flex-col justify-between gap-3.5">
                              <div>
                                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded-md">{product.brand}</span>
                                <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mt-1 leading-snug">{product.name}</h4>
                              </div>

                              <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                <div>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Price</span>
                                  <span className="text-xs font-extrabold text-slate-900 font-mono">₹{product.price}</span>
                                </div>
                                
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleShareWishlistProduct(product)}
                                    className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                                    title="Share link"
                                  >
                                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveWishlistToCart(product)}
                                    className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <ShoppingCart className="h-3 w-3" />
                                    <span>Move to Cart</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. ADDRESSES TAB */}
                {activeTab === 'addresses' && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 font-display">Manage Saved Addresses</h3>
                        <p className="text-slate-400 text-xs mt-0.5">Add or update your home, office, or secondary delivery coordinates.</p>
                      </div>
                      <button
                        onClick={() => setAddressForm('add')}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-xl uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add New Address</span>
                      </button>
                    </div>

                    {/* Address Form */}
                    {addressForm && (
                      <form onSubmit={handleAddressSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4 animate-in slide-in-from-top-3 duration-200">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{addressForm === 'add' ? 'Add Delivery Address' : 'Edit Delivery Address'}</h4>
                          <button type="button" onClick={() => setAddressForm(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Address Tag / Type</label>
                            <select name="type" defaultValue={addressForm.type || 'Home'} className="w-full rounded-lg border bg-white p-2 text-xs font-semibold text-slate-700">
                              <option value="Home">Home</option>
                              <option value="Office">Office</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Contact Full Name</label>
                            <input name="name" required type="text" defaultValue={addressForm.name || ''} className="w-full rounded-lg border bg-white p-2 text-xs font-semibold" />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Contact Phone</label>
                            <input name="phone" required type="text" defaultValue={addressForm.phone || ''} className="w-full rounded-lg border bg-white p-2 text-xs font-semibold" />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Street Address Line</label>
                            <input name="address" required type="text" defaultValue={addressForm.address || ''} className="w-full rounded-lg border bg-white p-2 text-xs font-semibold" />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">City</label>
                            <input name="city" required type="text" defaultValue={addressForm.city || ''} className="w-full rounded-lg border bg-white p-2 text-xs font-semibold" />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">State</label>
                              <input name="state" required type="text" defaultValue={addressForm.state || ''} className="w-full rounded-lg border bg-white p-2 text-xs font-semibold" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ZIP Code</label>
                              <input name="zip" required type="text" defaultValue={addressForm.zip || ''} className="w-full rounded-lg border bg-white p-2 text-xs font-semibold font-mono" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <input type="checkbox" name="isDefault" id="isDefault" defaultChecked={addressForm.isDefault || false} className="rounded" />
                          <label htmlFor="isDefault" className="text-xs text-slate-650 font-semibold cursor-pointer">Set as default delivery address</label>
                        </div>

                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer">
                          Save Delivery Coordinates
                        </button>
                      </form>
                    )}

                    {/* Address List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div key={addr.id} className={`border rounded-2xl p-4 space-y-3 relative overflow-hidden bg-white ${addr.isDefault ? 'border-blue-600 shadow-sm ring-2 ring-blue-50' : 'border-slate-150'}`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">{addr.type}</span>
                              {addr.isDefault && <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">Default Address</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => setAddressForm(addr)} className="text-slate-400 hover:text-slate-600" title="Edit address"><Edit3 className="h-3.5 w-3.5" /></button>
                              <button onClick={() => handleAddressDelete(addr.id)} className="text-slate-400 hover:text-rose-600" title="Delete address"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 space-y-1">
                            <p className="font-extrabold text-slate-800 text-xs">{addr.name}</p>
                            <p>{addr.address}</p>
                            <p>{addr.city}, {addr.state} {addr.zip}</p>
                            <p className="font-semibold text-slate-600 pt-1">Phone: {addr.phone}</p>
                          </div>

                          {!addr.isDefault && (
                            <button
                              onClick={() => handleAddressDefault(addr.id)}
                              className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 mt-2 cursor-pointer hover:underline block text-left"
                            >
                              Set as Default Delivery Address
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. PAYMENTS TAB */}
                {activeTab === 'payments' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 font-display">Saved Payment Profiles</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Configure your saved credit cards, digital UPI handles, and auto-checkout wallets.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Side: saved cards */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="h-4 w-4 text-blue-500" />
                            <span>Saved Credit/Debit Cards</span>
                          </h4>
                          <button
                            onClick={() => setAddCardMode(!addCardMode)}
                            className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 uppercase"
                          >
                            {addCardMode ? 'Cancel' : '+ Add Card'}
                          </button>
                        </div>

                        {addCardMode && (
                          <form onSubmit={handleAddCard} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-in slide-in-from-top-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Card Number</label>
                              <input
                                type="text"
                                maxLength={16}
                                placeholder="1234 5678 1234 5678"
                                value={newCard.number}
                                onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                                className="w-full bg-white border rounded-lg p-2 text-xs font-semibold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Cardholder Name</label>
                              <input
                                type="text"
                                placeholder="JOHN DOE"
                                value={newCard.holder}
                                onChange={(e) => setNewCard({ ...newCard, holder: e.target.value })}
                                className="w-full bg-white border rounded-lg p-2 text-xs font-semibold"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1 col-span-2">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Expiry Date</label>
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  value={newCard.expiry}
                                  onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                                  className="w-full bg-white border rounded-lg p-2 text-xs font-semibold"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">CVV</label>
                                <input
                                  type="password"
                                  maxLength={3}
                                  placeholder="•••"
                                  value={newCard.cvv}
                                  onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                                  className="w-full bg-white border rounded-lg p-2 text-xs font-semibold font-mono"
                                />
                              </div>
                            </div>
                            <button type="submit" className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all">
                              Save Card Securely
                            </button>
                          </form>
                        )}

                        {/* Cards view list */}
                        <div className="space-y-3">
                          {cards.map((c) => (
                            <div key={c.id} className={`p-4 rounded-xl border flex items-center justify-between bg-white relative overflow-hidden ${c.isDefault ? 'border-blue-600 ring-2 ring-blue-50' : 'border-slate-150'}`}>
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-12 rounded bg-slate-100 flex items-center justify-center font-display font-black text-slate-600 italic text-[10px] tracking-tighter shrink-0 border border-slate-200">
                                  {c.type}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-extrabold text-slate-900 font-mono">{c.number}</p>
                                  <p className="text-[9px] text-slate-400 mt-0.5">{c.holder} • Exp {c.expiry}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {c.isDefault ? (
                                  <span className="text-[8px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full uppercase">Default</span>
                                ) : (
                                  <button onClick={() => handleSetDefaultCard(c.id)} className="text-[9px] text-slate-400 hover:text-slate-600 font-extrabold hover:underline">Set Default</button>
                                )}
                                <button onClick={() => setCards(cards.filter(card => card.id !== c.id))} className="text-slate-300 hover:text-rose-600" title="Delete card"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Side: UPI Handles */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Plus className="h-4 w-4 text-indigo-500" />
                            <span>Digital UPI Addresses</span>
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Link your Google Pay, PhonePe, or BHIM UPI IDs.</p>
                        </div>

                        <form onSubmit={handleAddUpi} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="username@bank"
                            value={newUpi}
                            onChange={(e) => setNewUpi(e.target.value)}
                            className="flex-grow rounded-lg border py-2 px-3 text-xs font-semibold outline-none focus:border-indigo-500 bg-white"
                          />
                          <button type="submit" className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold">Link UPI</button>
                        </form>

                        <div className="space-y-3">
                          {upiIds.map((u) => (
                            <div key={u.id} className={`p-3.5 rounded-xl border flex items-center justify-between bg-white ${u.isDefault ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-150'}`}>
                              <span className="text-xs font-extrabold font-mono text-slate-800">{u.upi}</span>
                              <div className="flex items-center gap-2">
                                {u.isDefault ? (
                                  <span className="text-[8px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase">Default</span>
                                ) : (
                                  <button onClick={() => handleSetDefaultUpi(u.id)} className="text-[9px] text-slate-400 hover:text-slate-600 font-extrabold hover:underline">Set Default</button>
                                )}
                                <button onClick={() => setUpiIds(upiIds.filter(upi => upi.id !== u.id))} className="text-slate-300 hover:text-rose-600" title="Delete UPI handle"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 font-display">Notifications Log</h3>
                        <p className="text-slate-400 text-xs mt-0.5">Stay updated with instant logs regarding dispatches, repairs, and security events.</p>
                      </div>
                      <button
                        onClick={() => {
                          setNotifications(notifications.map(n => ({ ...n, read: true })));
                          triggerSuccess('All notifications marked as read.');
                        }}
                        className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 uppercase"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-4 rounded-xl border flex items-start gap-3.5 bg-white transition-colors relative overflow-hidden ${!n.read ? 'border-blue-200 bg-blue-50/5' : 'border-slate-150'}`}>
                          {!n.read && <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-600" />}
                          <div className={`h-8.5 w-8.5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${!n.read ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                            <Bell className="h-4.5 w-4.5" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-extrabold text-slate-900 truncate">{n.title}</h4>
                              <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">{n.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-normal">{n.message}</p>
                          </div>
                          <button onClick={() => setNotifications(notifications.filter(not => not.id !== n.id))} className="text-slate-300 hover:text-slate-500 self-start mt-0.5" title="Dismiss notification"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. SETTINGS TAB */}
                {activeTab === 'settings' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 font-display">Account Settings</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Calibrate theme choices, communication alerts, languages, and deletion safeguards.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                      <div className="space-y-6">
                        {/* Theme and Language Selection */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interface Preferences</h4>
                          
                          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Globe className="h-4 w-4 text-slate-400" /> Language</span>
                              <select
                                value={settings.language}
                                onChange={(e) => {
                                  setSettings({ ...settings, language: e.target.value });
                                  triggerSuccess(`Language changed to ${e.target.value}.`);
                                }}
                                className="rounded border bg-white p-1 px-2.5 text-xs font-semibold text-slate-700 cursor-pointer"
                              >
                                <option value="English">English (US)</option>
                                <option value="Spanish">Spanish (ES)</option>
                                <option value="Hindi">Hindi (IN)</option>
                                <option value="French">French (FR)</option>
                              </select>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-150 pt-3">
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Sliders className="h-4 w-4 text-slate-400" /> Color Accent Preset</span>
                              <div className="flex gap-1.5">
                                {['light', 'slate', 'warm'].map((th) => (
                                  <button
                                    key={th}
                                    onClick={() => {
                                      setSettings({ ...settings, theme: th });
                                      triggerSuccess(`Theme changed to ${th}.`);
                                    }}
                                    className={`px-2 py-1 rounded text-[10px] font-bold capitalize transition-all cursor-pointer border ${
                                      settings.theme === th
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    {th}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notifications Toggle Settings */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Communication Dispatches</h4>
                          <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            {[
                              { key: 'emailNotify', label: 'Email Order Summaries', desc: 'Receive transaction slips and warranty confirmations via email.' },
                              { key: 'smsNotify', label: 'SMS Technician Warnings', desc: 'Get phone pings when your repair dispatch technician leaves the regional hub.' },
                              { key: 'pushNotify', label: 'Push Web Notifications', desc: 'Instant browser alerts for dispatch advances.' }
                            ].map((item) => (
                              <div key={item.key} className="flex items-start justify-between gap-4">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-slate-700">{item.label}</p>
                                  <p className="text-[10px] text-slate-400 leading-normal">{item.desc}</p>
                                </div>
                                <input
                                  type="checkbox"
                                  className="rounded shrink-0"
                                  checked={settings[item.key]}
                                  onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Privacy & Active Logins Log */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credential Privacy</h4>
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-700">Two-Factor Authenticator (2FA)</span>
                              <input
                                type="checkbox"
                                className="rounded"
                                checked={settings.twoFactor}
                                onChange={(e) => {
                                  setSettings({ ...settings, twoFactor: e.target.checked });
                                  triggerSuccess(e.target.checked ? '2FA has been armed.' : '2FA disarmed. Use caution.');
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal">Require an SMS authorization pin every time you log in to your account.</p>
                            
                            <div className="border-t border-slate-200 pt-3 space-y-1.5">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Workspace Sessions</p>
                              <div className="text-[10px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-150 divide-y divide-slate-100">
                                <p className="py-1 flex justify-between"><span>Seattle, WA (Chrome / PC)</span> <span className="text-emerald-600 font-bold">Active Now</span></p>
                                <p className="py-1 flex justify-between"><span>Android Phone (Native App)</span> <span className="text-slate-400">1 day ago</span></p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Danger zone Delete */}
                        <div className="p-4 rounded-xl border border-red-200 bg-red-50/20 space-y-3">
                          <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>Safeguard Deletion</span>
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed">Permanently clear purchase logs, saved spares, bookings, and billing credentials. This operation is irreversible.</p>
                          <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Delete Customer Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 10. HELP & SUPPORT TAB */}
                {activeTab === 'help' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 font-display">Support Desk & FAQ</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Read troubleshooting guides, raise engineer service tickets, or contact direct lines.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                      
                      {/* Left: FAQ and support contacts */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frequently Asked Questions</h4>
                          <div className="relative">
                            <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search support queries..."
                              value={faqSearch}
                              onChange={(e) => setFaqSearch(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none"
                            />
                          </div>

                          <div className="space-y-2.5">
                            {faqs.filter(f => f.q.toLowerCase().includes(faqSearch.toLowerCase())).map((faq, i) => (
                              <div key={i} className="border border-slate-150 rounded-xl bg-slate-50/50 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                  className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-left text-slate-800"
                                >
                                  <span>{faq.q}</span>
                                  <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${expandedFaq === i ? 'rotate-90 text-blue-600' : ''}`} />
                                </button>
                                {expandedFaq === i && (
                                  <div className="p-3.5 pt-0 border-t border-slate-150 text-xs text-slate-500 leading-relaxed bg-white">
                                    {faq.a}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Phone and Email Direct coordinates */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Hotline Helpdesks</p>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <a href="tel:18005550199" className="p-3 rounded-lg border bg-white hover:border-blue-500 transition-all flex flex-col items-center text-center gap-1 shadow-xs">
                              <LifeBuoy className="h-5 w-5 text-blue-600" />
                              <span className="font-bold">Toll Free Call</span>
                              <span className="text-[9px] text-slate-400">1-800-555-0199</span>
                            </a>
                            <a href="mailto:support@electrofix.com" className="p-3 rounded-lg border bg-white hover:border-blue-500 transition-all flex flex-col items-center text-center gap-1 shadow-xs">
                              <MessageSquare className="h-5 w-5 text-indigo-600" />
                              <span className="font-bold">Email Desk</span>
                              <span className="text-[9px] text-slate-400">support@electrofix.com</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Right: Raise a Ticket & Active Tickets */}
                      <div className="space-y-6">
                        <form onSubmit={handleRaiseTicket} className="p-5 border border-slate-150 bg-white rounded-2xl shadow-xs space-y-4">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">File Technical Support Ticket</h4>
                          
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Subject Topic</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. AG-504 spare part compatibility details"
                                value={ticketForm.subject}
                                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                className="w-full border rounded-lg p-2 text-xs font-semibold bg-slate-50/50 focus:bg-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Category</label>
                                <select
                                  value={ticketForm.category}
                                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                                  className="w-full border rounded-lg p-2 text-xs font-semibold bg-white"
                                >
                                  <option value="Warranty">Warranty claim</option>
                                  <option value="Spares Compatibility">Spares Compatibility</option>
                                  <option value="Technician Booking">Technician Booking</option>
                                  <option value="Payments">Refund / Payment</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Priority</label>
                                <select
                                  value={ticketForm.priority}
                                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                                  className="w-full border rounded-lg p-2 text-xs font-semibold bg-white"
                                >
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">Urgent</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Elaborate details</label>
                              <textarea
                                rows={3}
                                required
                                placeholder="Explain the technical hurdle..."
                                value={ticketForm.details}
                                onChange={(e) => setTicketForm({ ...ticketForm, details: e.target.value })}
                                className="w-full border rounded-lg p-2 text-xs font-semibold bg-slate-50/50 focus:bg-white resize-none"
                              />
                            </div>
                          </div>

                          <button type="submit" className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all">
                            Dispatch Ticket File
                          </button>
                        </form>

                        {/* Raised tickets history log */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Support Tickets</h4>
                          
                          <div className="space-y-2.5">
                            {tickets.map((t) => (
                              <div key={t.id} className="p-3.5 border border-slate-150 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">{t.id} • {t.category}</span>
                                  <p className="font-bold text-slate-800 mt-0.5">{t.subject}</p>
                                  <p className="text-[9px] text-slate-400 font-bold mt-1">Filed on: {t.date}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 uppercase tracking-wider">{t.status}</span>
                                  <p className="text-[9px] font-semibold text-slate-400 mt-1.5">Priority: <span className="font-bold text-slate-700">{t.priority}</span></p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* --- INVOICE MODAL POPUP --- */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-150 animate-in zoom-in-95">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <Trash2 className="h-5 w-5 rotate-45" />
            </button>

            <div id="printable-invoice" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h2 className="text-xl font-extrabold font-display text-blue-600 tracking-tight">ELECTROFIX CARE</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Premium Spares & Technical Services</p>
                  <p className="text-[9px] text-slate-400">License ID: EF-TX-583-Z89 | Tax No: GST-NY-7491-0</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Tax Invoice Receipt</p>
                  <p className="text-xs font-mono font-extrabold text-slate-900">{selectedInvoice.orderId}</p>
                  <p className="text-[10px] text-slate-500">Date Issued: {selectedInvoice.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] text-slate-500 leading-normal">
                <div className="space-y-1 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billing & Shipping To:</span>
                  <p className="font-extrabold text-slate-900 text-xs">{selectedInvoice.shippingAddress.fullname}</p>
                  <p>{selectedInvoice.shippingAddress.address}</p>
                  <p>{selectedInvoice.shippingAddress.city}, {selectedInvoice.shippingAddress.state} {selectedInvoice.shippingAddress.zipcode}</p>
                  <p>Contact: {selectedInvoice.shippingAddress.phone}</p>
                </div>
                <div className="space-y-1 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Payment & Logistics Details:</span>
                  <p className="font-bold text-slate-850">Method: <span className="uppercase text-slate-950 font-mono">{selectedInvoice.paymentDetails.method}</span></p>
                  <p className="font-mono text-[10px]">Credential Tag: {selectedInvoice.paymentDetails.last4}</p>
                  <p>Shipping Option: {selectedInvoice.estimatedDays === 1 ? 'Next-Day Rush' : 'Standard Ground'}</p>
                </div>
              </div>

              <div className="overflow-hidden border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-200">
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Unit Price</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/20">
                        <td className="p-3">
                          <p className="font-extrabold text-slate-900">{item.product.name}</p>
                          <p className="text-[10px] text-slate-400">Brand: {item.product.brand}</p>
                          {item.withInstallation && (
                            <p className="text-[9px] text-blue-600 font-bold flex items-center gap-0.5">🛠️ Includes technician setup</p>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-500">₹{item.product.price}</td>
                        <td className="p-3 text-center font-mono text-slate-800">{item.quantity}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">₹{item.product.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-full sm:w-64 space-y-2 text-xs font-semibold text-slate-650 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-slate-950">₹{selectedInvoice.costs.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (5%)</span>
                    <span className="font-mono font-bold text-slate-950">₹{selectedInvoice.costs.taxes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Surcharge</span>
                    <span className="font-mono font-bold text-slate-950">₹{selectedInvoice.costs.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-2 border-t border-slate-200">
                    <span>Total Transacted</span>
                    <span className="font-mono text-blue-600 text-sm">₹{selectedInvoice.costs.total}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-400">
                <p>This is a computer-generated tax invoice. No signature required. Thank you for choosing ElectroFix Care!</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-150 mt-6">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- RETURN REPLACEMENT MODAL --- */}
      {returnOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleReturnSubmit} className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Return / Replacement Claim Request</span>
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 text-[11px] text-slate-500 font-medium">
              Claiming on Order: <span className="font-mono font-bold text-slate-850">{returnOrder.orderId}</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Reason for Claim</label>
                <select
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-750"
                >
                  <option value="defective">Defective / Faulty Spare Part</option>
                  <option value="incorrect">Wrong Size / Model Discrepancy</option>
                  <option value="damaged">Damaged in Transit / Cracked Plastic</option>
                  <option value="unneeded">No Longer Required</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Elaborate Damage Details</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Tell us what's wrong with the part..."
                  value={returnForm.notes}
                  onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setReturnOrder(null)} className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold">Submit Return Claim</button>
            </div>
          </form>
        </div>
      )}

      {/* --- RESCHEDULE APPOINTMENT MODAL --- */}
      {rescheduleBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRescheduleSubmit} className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Reschedule Repair Appointment</span>
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 text-[11px] text-slate-500 font-medium">
              Service ID: <span className="font-mono font-bold text-slate-850">{rescheduleBooking.id}</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Preferred New Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleForm.date}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                  className="w-full border rounded-lg p-2 text-xs font-semibold bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Preferred Time Slot</label>
                <select
                  value={rescheduleForm.time}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                  className="w-full border rounded-lg p-2 text-xs font-semibold bg-white"
                >
                  <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning)</option>
                  <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM (Afternoon)</option>
                  <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM (Evening)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setRescheduleBooking(null)} className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">Reschedule Now</button>
            </div>
          </form>
        </div>
      )}

      {/* --- DELETE ACCOUNT MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2 text-red-650">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span>Confirm Account Deletion</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">This action is permanently fatal. To prevent accidental clicks, please type <span className="font-mono font-extrabold text-red-600 bg-red-50 px-1 py-0.5 rounded">DELETE</span> in the box below to authorize deletion.</p>
            <input
              type="text"
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-xs font-bold text-center bg-slate-50/50 uppercase outline-none focus:border-red-600"
            />
            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500">Keep Account</button>
              <button type="button" onClick={handleDeleteAccount} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold">Delete Instantly</button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM CANCEL BOOKING CONFIRMATION MODAL --- */}
      {cancelConfirmationId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6 text-red-650" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-display text-base font-extrabold text-slate-900">Cancel Repair Service Booking?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to cancel booking <strong className="font-mono text-slate-700">{cancelConfirmationId}</strong>? This action will cancel your scheduled slot and cannot be undone.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setCancelConfirmationId(null)} 
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 cursor-pointer"
              >
                Keep Booking
              </button>
              <button 
                type="button" 
                onClick={() => {
                  handleCancelBooking(cancelConfirmationId);
                  setCancelConfirmationId(null);
                }} 
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
