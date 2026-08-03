import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, ShoppingBag, Plus, Edit, Trash, Lock, 
  Check, X, Shield, Users, Award, Ticket, CreditCard, Star, Bell, 
  Settings, LogOut, ChevronRight, Search, FileText, Truck, RefreshCw, 
  Eye, EyeOff, User, MapPin, Phone, AlertCircle, Sparkles, Filter, CheckCircle2,
  Printer, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { logoutAdmin } from '../services/adminAuth';
import { getFallbackProductImage } from '../utils/shopData';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, doc, setDoc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, limit 
} from 'firebase/firestore';

// Import Modular Subcomponents
import ConfirmationModal from '../components/admin/ConfirmationModal';
import Pagination from '../components/admin/Pagination';
import GlobalSearchModal from '../components/admin/GlobalSearchModal';
import ChartsOverview from '../components/admin/ChartsOverview';
import ReportsExporter from '../components/admin/ReportsExporter';
import CreateBookingModal from '../components/admin/CreateBookingModal';
import CreateUserModal from '../components/admin/CreateUserModal';

const DEFAULT_USERS = [
  { id: 'user-1', name: 'Admin User', email: 'admin@electrofix.com', role: 'admin', createdAt: '2026-06-12T10:00:00.000Z', blocked: false },
  { id: 'user-2', name: 'Rajesh Patel', email: 'rajesh@example.com', role: 'user', createdAt: '2026-06-15T12:30:00.000Z', blocked: false },
  { id: 'user-3', name: 'Amit Sharma', email: 'amit@example.com', role: 'user', createdAt: '2026-06-18T14:45:00.000Z', blocked: false },
  { id: 'user-4', name: 'Priya Singh', email: 'priya@example.com', role: 'user', createdAt: '2026-06-20T09:15:00.000Z', blocked: true }
];

const DEFAULT_BOOKINGS = [
  { id: 'book-1', userName: 'Rajesh Patel', appliance: 'Washing Machine', issue: 'Not draining, making loud noise', status: 'Pending', preferredDate: '2026-07-10', preferredTime: '10:00 AM - 01:00 PM', phone: '9876543210', address: 'Block C, Sector 62, Noida', city: 'Noida', technician: '', createdAt: '2026-07-04T12:00:00.000Z' },
  { id: 'book-2', userName: 'Amit Sharma', appliance: 'Refrigerator', issue: 'Cooling compartment not working', status: 'Technician Assigned', preferredDate: '2026-07-12', preferredTime: '02:00 PM - 05:00 PM', phone: '8765432109', address: 'Tower A, Sector 150, Noida', city: 'Noida', technician: 'Marcus Carter', createdAt: '2026-07-05T08:00:00.000Z' }
];

const DEFAULT_PRODUCTS = [
  { id: 'prod-1', name: 'Samsung Direct Cool Refrigerator', brand: 'Samsung', category: 'Refrigerator', price: 299, originalPrice: 349, stock: 15, description: 'Single door refrigerator with digital inverter technology.', image: 'https://images.unsplash.com/photo-1571175486658-28328c3a59f9?auto=format&fit=crop&q=80&w=400', warranty: '1 Year Warranty', featured: true },
  { id: 'prod-2', name: 'LG Front Load Washing Machine', brand: 'LG', category: 'Washing Machine', price: 449, originalPrice: 499, stock: 8, description: 'Fully automatic front load with direct drive motor.', image: 'https://images.unsplash.com/photo-1582730149719-6111a4e4142f?auto=format&fit=crop&q=80&w=400', warranty: '2 Years Warranty', featured: true },
  { id: 'prod-3', name: 'Dyson Pure Cool Air Purifier', brand: 'Dyson', category: 'AC', price: 399, originalPrice: 449, stock: 12, description: 'Hephaestus purification with remote control functionality.', image: 'https://images.unsplash.com/photo-1585338111555-74974955700b?auto=format&fit=crop&q=80&w=400', warranty: '1 Year Warranty', featured: false }
];

const DEFAULT_ORDERS = [
  { orderId: 'EF-ORD-3199', id: 'EF-ORD-3199', userName: 'Rajesh Patel', items: [{ name: 'Samsung Direct Cool Refrigerator', price: 299, quantity: 1 }], total: 299, status: 'Packed', paymentStatus: 'Paid', paymentMethod: 'Card', date: '2026-07-05T06:22:15.000Z', createdAt: '2026-07-05T06:22:15.000Z' },
  { orderId: 'EF-ORD-3200', id: 'EF-ORD-3200', userName: 'Amit Sharma', items: [{ name: 'Dyson Pure Cool Air Purifier', price: 399, quantity: 1 }], total: 399, status: 'Processing', paymentStatus: 'Pending', paymentMethod: 'COD', date: '2026-07-05T08:15:30.000Z', createdAt: '2026-07-05T08:15:30.000Z' }
];

const DEFAULT_USED_PRODUCTS = [
  { id: 'used-1', title: 'Bosch 8kg Condenser Dryer', brand: 'Bosch', category: 'Washing Machine', age: '18 Months', condition: 'Excellent', expectedPrice: 220, status: 'Pending Inspection', inspectionStatus: 'Scheduled', phone: '9822334455', city: 'Seattle', description: 'Clean and fully working, minor scratch on side door panel.', images: ['https://images.unsplash.com/photo-1582730149719-6111a4e4142f?auto=format&fit=crop&q=80&w=400'], createdAt: '2026-07-04T15:00:00.000Z' }
];

const DEFAULT_TECHNICIANS = [
  { id: 'tech-1', name: 'Marcus Carter', rating: 4.9, status: 'Available', areas: 'Seattle, Bellevue', jobs: 24 },
  { id: 'tech-2', name: 'Robert Downey', rating: 4.8, status: 'Busy', areas: 'Tacoma, Renton', jobs: 31 },
  { id: 'tech-3', name: 'Sarah Jenkins', rating: 4.7, status: 'Available', areas: 'Seattle, Everett', jobs: 12 },
  { id: 'tech-4', name: 'Liam Neeson', rating: 5.0, status: 'Off-Duty', areas: 'Redmond, Kirkland', jobs: 40 }
];

const DEFAULT_COUPONS = [
  { code: 'ELECTRO20', discount: 20, limit: 100, used: 45, active: true, expiry: '2026-12-31' },
  { code: 'FIXED50', discount: 50, limit: 50, used: 12, active: true, expiry: '2026-08-15' },
  { code: 'WELCOME10', discount: 10, limit: 500, used: 312, active: true, expiry: '2026-12-31' }
];

const DEFAULT_REVIEWS = [
  { id: 'rev-1', userName: 'Rajesh Patel', rating: 5, targetName: 'Samsung Refrigerator', targetType: 'product', comment: 'Absolutely brilliant product! Keeps things cold instantly.', date: '2026-07-01' },
  { id: 'rev-2', userName: 'Amit Sharma', rating: 4, targetName: 'LG Washing Machine Service', targetType: 'service', comment: 'Technician was polite and repaired it quickly.', date: '2026-07-03' }
];

const DEFAULT_REPORTS = [
  { id: 'log-1', action: 'Admin Authorized', user: 'admin@electrofix.com', time: '2026-07-05 06:10:02' },
  { id: 'log-2', action: 'Product Added (Samsung AC)', user: 'admin@electrofix.com', time: '2026-07-05 06:15:30' }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 'notif-1', title: 'System Boot Complete', message: 'The ElectroFix real-time Firebase database has been initialized successfully.', type: 'info', createdAt: new Date().toISOString(), isRead: false },
  { id: 'notif-2', title: 'New Booking Request', message: 'Rajesh Patel booked a Washing Machine repair service.', type: 'booking', createdAt: new Date().toISOString(), isRead: false }
];

const DEFAULT_SETTINGS = {
  companyName: 'ElectroFix Technologies Ltd',
  contactEmail: 'support@electrofix.com',
  contactPhone: '1-800-ELECTRO',
  address: '1428 Elm Street, Seattle, WA',
  socialFb: 'https://facebook.com/electrofix',
  aboutUsText: 'ElectroFix is Seattle\'s leading premium appliance repair, maintenance, and pre-owned showroom portal.'
};


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };
  const [toast, setToast] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Synchronize and restore secure Admin credentials from Firebase Auth & Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data()?.role === 'admin') {
            setCurrentAdmin({ ...user, ...userDocSnap.data() });
          } else {
            setCurrentAdmin(null);
          }
        } catch (err) {
          console.error("Error verifying admin role in Firestore:", err);
          setCurrentAdmin(null);
        }
      } else {
        setCurrentAdmin(null);
      }
      setAuthReady(true);
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-time synchronization states connected to Firestore
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [usedListings, setUsedListings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [techs, setTechs] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [logs, setLogs] = useState([]);

  // Local state for categories and brands catalog
  const [categories, setCategories] = useState(['Washing Machine', 'Refrigerator', 'AC', 'TV', 'Kitchen Appliances']);
  const [brands, setBrands] = useState(['Samsung', 'Whirlpool', 'LG', 'Bosch', 'Carrier', 'Dyson']);

  const [siteSettings, setSiteSettings] = useState(DEFAULT_SETTINGS);

  // Loading states
  const [loading, setLoading] = useState({
    bookings: false,
    orders: false,
    products: false,
    customers: false
  });

  // Dedicated check & seed function for all 11 required collections
  const verifyAndSeedCollections = async () => {
    const requiredCollections = [
      { path: 'products', data: DEFAULT_PRODUCTS, idKey: 'id' },
      { path: 'bookings', data: DEFAULT_BOOKINGS, idKey: 'id' },
      { path: 'technicians', data: DEFAULT_TECHNICIANS, idKey: 'id' },
      { path: 'coupons', data: DEFAULT_COUPONS, idKey: 'code' },
      { path: 'users', data: DEFAULT_USERS, idKey: 'id' },
      { path: 'orders', data: DEFAULT_ORDERS, idKey: 'id' },
      { path: 'usedProducts', data: DEFAULT_USED_PRODUCTS, idKey: 'id' },
      { path: 'reviews', data: DEFAULT_REVIEWS, idKey: 'id' },
      { path: 'reports', data: DEFAULT_REPORTS, idKey: 'id' },
      { path: 'notifications', data: DEFAULT_NOTIFICATIONS, idKey: 'id' }
    ];

    try {
      for (const col of requiredCollections) {
        const colRef = collection(db, col.path);
        const q = query(colRef, limit(1));
        const snap = await getDocs(q);
        if (snap.empty) {
          console.log(`Collection "${col.path}" is empty. Seeding default documents...`);
          for (const item of col.data) {
            const docId = item[col.idKey];
            await setDoc(doc(db, col.path, docId), item);
          }
        }
      }

      const settingsDocRef = doc(db, 'settings', 'company_profile');
      const settingsSnap = await getDoc(settingsDocRef);
      if (!settingsSnap.exists()) {
        console.log(`Settings document is missing. Seeding default settings...`);
        await setDoc(settingsDocRef, {
          ...DEFAULT_SETTINGS,
          categories: ['Washing Machine', 'Refrigerator', 'AC', 'TV', 'Kitchen Appliances'],
          brands: ['Samsung', 'Whirlpool', 'LG', 'Bosch', 'Carrier', 'Dyson']
        });
      }
    } catch (err) {
      console.error("Collection verification/seeding failed:", err);
    }
  };

  // Database Seeding Logic (On-demand total reset/seed)
  const seedDatabase = async () => {
    setIsSeeding(true);
    try {
      showToastMsg('Bootstrapping cloud databases...', 'info');
      
      // 1. Seed products
      for (const prod of DEFAULT_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      // 2. Seed bookings
      for (const b of DEFAULT_BOOKINGS) {
        await setDoc(doc(db, 'bookings', b.id), b);
      }
      // 3. Seed technicians
      for (const t of DEFAULT_TECHNICIANS) {
        await setDoc(doc(db, 'technicians', t.id), t);
      }
      // 4. Seed coupons
      for (const c of DEFAULT_COUPONS) {
        await setDoc(doc(db, 'coupons', c.code), c);
      }
      // 5. Seed users (customers)
      for (const u of DEFAULT_USERS) {
        await setDoc(doc(db, 'users', u.id), u);
      }
      // 6. Seed orders
      for (const o of DEFAULT_ORDERS) {
        await setDoc(doc(db, 'orders', o.id), o);
      }
      // 7. Seed used products
      for (const up of DEFAULT_USED_PRODUCTS) {
        await setDoc(doc(db, 'usedProducts', up.id), up);
      }
      // 8. Seed reviews
      for (const r of DEFAULT_REVIEWS) {
        await setDoc(doc(db, 'reviews', r.id), r);
      }
      // 9. Seed reports / logs
      for (const lg of DEFAULT_REPORTS) {
        await setDoc(doc(db, 'reports', lg.id), lg);
      }
      // 10. Seed notifications
      for (const n of DEFAULT_NOTIFICATIONS) {
        await setDoc(doc(db, 'notifications', n.id), n);
      }
      // 11. Seed settings
      await setDoc(doc(db, 'settings', 'company_profile'), {
        ...DEFAULT_SETTINGS,
        categories: ['Washing Machine', 'Refrigerator', 'AC', 'TV', 'Kitchen Appliances'],
        brands: ['Samsung', 'Whirlpool', 'LG', 'Bosch', 'Carrier', 'Dyson']
      });

      showToastMsg('Cloud database seeded successfully!', 'success');
    } catch (error) {
      console.error("Database Seeding error: ", error);
      showToastMsg('Database seeding failed.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Synchronize All Firestore Collections with React State in Real-Time
  useEffect(() => {
    if (!authReady || !currentAdmin) return;

    const unsubscribes = [];

    // Check and seed any empty collection out of the 11 required collections
    const initDb = async () => {
      setIsSeeding(true);
      try {
        await verifyAndSeedCollections();
      } catch (err) {
        console.error("Initial database validation failed:", err);
      } finally {
        setIsSeeding(false);
      }
    };
    initDb();

    const collectionsToSync = [
      { path: 'products', setter: setProducts },
      { path: 'bookings', setter: setBookings },
      { path: 'orders', setter: setOrders },
      { path: 'usedProducts', setter: setUsedListings },
      { path: 'users', setter: setCustomers },
      { path: 'reviews', setter: setReviews },
      { path: 'notifications', setter: setNotifications },
      { path: 'technicians', setter: setTechs },
      { path: 'coupons', setter: setCoupons },
      { path: 'reports', setter: setLogs }
    ];

    collectionsToSync.forEach(({ path: collectionPath, setter }) => {
      const unsub = onSnapshot(collection(db, collectionPath), (snapshot) => {
        const items = [];
        snapshot.forEach((docSnapshot) => {
          items.push({ id: docSnapshot.id, ...docSnapshot.data() });
        });
        setter(items);
      }, (err) => {
        console.error(`Error on Firestore subscription for ${collectionPath}:`, err);
        setGlobalError(`Firestore permission/connection error on collection: ${collectionPath}`);
      });
      unsubscribes.push(unsub);
    });

    // Sync site settings document
    const unsubSettings = onSnapshot(doc(db, 'settings', 'company_profile'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSiteSettings(data);
        if (data.categories) setCategories(data.categories);
        if (data.brands) setBrands(data.brands);
      } else {
        // Create settings document if absent
        setDoc(doc(db, 'settings', 'company_profile'), {
          ...DEFAULT_SETTINGS,
          categories: ['Washing Machine', 'Refrigerator', 'AC', 'TV', 'Kitchen Appliances'],
          brands: ['Samsung', 'Whirlpool', 'LG', 'Bosch', 'Carrier', 'Dyson']
        }).catch(err => console.error("Settings creation failed:", err));
      }
    }, (err) => {
      console.error("Settings listener error:", err);
    });
    unsubscribes.push(unsubSettings);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [authReady, currentAdmin]);


  // Modal & Global Search & Pagination states
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [createBookingModalOpen, setCreateBookingModalOpen] = useState(false);
  const [editingBookingObj, setEditingBookingObj] = useState(null);
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [editingUserObj, setEditingUserObj] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: null
  });

  // Pagination states (8 items per page)
  const PAGE_SIZE = 8;
  const [bookingsPage, setBookingsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [customersPage, setCustomersPage] = useState(1);
  const [usedPage, setUsedPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);

  // Global Keyboard Shortcut for Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modal forms states
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    id: '', name: '', brand: 'Samsung', category: 'Washing Machine', price: '', 
    originalPrice: '', stock: 10, description: '', image: '', warranty: '1 Year Warranty', featured: false
  });

  const [assigningBooking, setAssigningBooking] = useState(null);
  const [selectedTech, setSelectedTech] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [rejectionBooking, setRejectionBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 10, limit: 100, expiry: '2026-12-31' });
  const [newTech, setNewTech] = useState({ name: '', areas: '', status: 'Available' });
  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newNotification, setNewNotification] = useState({ title: '', message: '', targetUser: 'all' });
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '' });

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const showToastMsg = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addLog = async (action) => {
    const logId = `log-${Date.now()}`;
    const newLog = {
      id: logId,
      action,
      user: currentAdmin?.email || 'admin',
      time: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    try {
      await setDoc(doc(db, 'reports', logId), newLog);
    } catch (err) {
      console.error("Audit logging failed:", err);
    }
  };

  const fetchData = async () => {
    showToastMsg('Synchronizing database...', 'info');
    setTimeout(() => {
      showToastMsg('Database synchronized with Firestore.', 'success');
    }, 400);
  };

  // Verify Auth on Mount
  useEffect(() => {
    const token = localStorage.getItem('ef_admin_token');
    const authUserStr = localStorage.getItem('ef_auth_user');
    let isAdminRole = false;
    if (authUserStr) {
      try {
        const u = JSON.parse(authUserStr);
        if (u.role === 'admin') isAdminRole = true;
      } catch (e) {}
    }
    if (!token && !isAdminRole) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // --- Handlers for Bookings ---
  const handleBookingStatus = async (bookingId, newStatus) => {
    try {
      const docRef = doc(db, 'bookings', bookingId);
      await updateDoc(docRef, { status: newStatus });
      await addLog(`Updated Booking ${bookingId} status to ${newStatus}`);

      // Find booking target user to notify
      const targetBkg = bookings.find(b => b.id === bookingId);
      const targetUserId = targetBkg?.userId || targetBkg?.email || 'user';
      const notifTitleMap = {
        'Approved': 'Booking Approved',
        'Technician Assigned': 'Technician Assigned',
        'On The Way': 'Technician On The Way',
        'In Progress': 'Service In Progress',
        'Completed': 'Booking Completed',
        'Cancelled': 'Booking Cancelled'
      };
      const notifTitle = notifTitleMap[newStatus] || `Booking ${newStatus}`;

      await addDoc(collection(db, 'notifications'), {
        title: notifTitle,
        message: `Your service booking #${bookingId} status is now ${newStatus}.`,
        body: `Your service booking #${bookingId} status is now ${newStatus}.`,
        type: 'booking',
        recipient: targetUserId,
        targetUsers: targetUserId,
        userId: targetUserId,
        bookingId: bookingId,
        read: false,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      showToastMsg(`Booking ${bookingId} has been set to ${newStatus}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  const handleAssignTech = async () => {
    if (!assigningBooking || !selectedTech) return;
    try {
      const targetBkg = bookings.find(b => b.id === assigningBooking);
      const techObj = techs.find(t => t.id === selectedTech || t.name === selectedTech) || {
        name: selectedTech,
        phone: '9876543201',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        rating: 4.9,
        cert: 'Certified Senior Technician'
      };

      const assignedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const estimatedArrival = '30 - 45 Minutes';

      const richTech = {
        id: techObj.id || 'tech-1',
        name: techObj.name || selectedTech,
        phone: techObj.phone || '9876543201',
        avatar: techObj.photo || techObj.avatar || techObj.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        photo: techObj.photo || techObj.avatar || techObj.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        rating: techObj.rating || 4.9,
        reviews: techObj.jobs || 24,
        cert: techObj.areas ? `Area: ${techObj.areas}` : (techObj.cert || 'Certified Engineer'),
        assignedTime,
        estimatedArrival
      };

      const docRef = doc(db, 'bookings', assigningBooking);
      await updateDoc(docRef, { 
        status: 'Technician Assigned', 
        technician: richTech
      });

      await addLog(`Assigned ${richTech.name} to Booking ${assigningBooking}`);

      const targetUserId = targetBkg?.userId || targetBkg?.email || 'user';
      await addDoc(collection(db, 'notifications'), {
        title: 'Technician Assigned',
        message: `Technician ${richTech.name} assigned to booking #${assigningBooking}. Contact: ${richTech.phone}. Estimated arrival: ${estimatedArrival}.`,
        body: `Technician ${richTech.name} assigned to booking #${assigningBooking}. Contact: ${richTech.phone}. Estimated arrival: ${estimatedArrival}.`,
        type: 'booking',
        recipient: targetUserId,
        targetUsers: targetUserId,
        userId: targetUserId,
        bookingId: assigningBooking,
        read: false,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      showToastMsg(`Technician ${richTech.name} assigned successfully.`);
      setAssigningBooking(null);
      setSelectedTech('');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${assigningBooking}`);
    }
  };

  // --- Handlers for Orders ---
  const handleOrderStatus = async (orderId, newStatus) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status: newStatus });
      await addLog(`Updated Order ${orderId} status to ${newStatus}`);

      const targetOrder = orders.find(o => o.orderId === orderId || o.id === orderId);
      const targetUserId = targetOrder?.userId || targetOrder?.email || 'user';
      const orderTitleMap = {
        'Confirmed': 'Order Confirmed',
        'Packed': 'Order Packed',
        'Shipped': 'Order Shipped',
        'Out for Delivery': 'Order Out for Delivery',
        'Delivered': 'Order Delivered',
        'Cancelled': 'Order Cancelled'
      };

      await addDoc(collection(db, 'notifications'), {
        title: orderTitleMap[newStatus] || `Order ${newStatus}`,
        message: `Your order #${orderId} tracking status has changed to ${newStatus}.`,
        body: `Your order #${orderId} tracking status has changed to ${newStatus}.`,
        type: 'order',
        recipient: targetUserId,
        targetUsers: targetUserId,
        userId: targetUserId,
        orderId: orderId,
        read: false,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      showToastMsg(`Order status set to ${newStatus}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleOrderPaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { paymentStatus: newPaymentStatus });
      await addLog(`Updated Order ${orderId} payment status to ${newPaymentStatus}`);
      showToastMsg(`Payment status set to ${newPaymentStatus}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleOrderRefundStatus = async (orderId, newRefundStatus) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { refundStatus: newRefundStatus });
      await addLog(`Updated Order ${orderId} refund status to ${newRefundStatus}`);
      showToastMsg(`Refund status set to ${newRefundStatus}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // --- Handlers for Products ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.id || !productForm.name || !productForm.price) {
      showToastMsg('Please fill in all required fields.', 'error');
      return;
    }

    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      originalPrice: parseFloat(productForm.originalPrice || productForm.price),
      stock: parseInt(productForm.stock),
      image: productForm.image || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'
    };

    try {
      const docRef = doc(db, 'products', productForm.id);
      await setDoc(docRef, payload, { merge: true });
      if (editingProduct) {
        showToastMsg('Product updated successfully!');
        await addLog(`Updated Product: ${payload.name}`);
      } else {
        showToastMsg('Product added successfully!');
        await addLog(`Created Product: ${payload.name}`);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      resetProductForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${productForm.id}`);
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', prodId));
      showToastMsg('Product deleted successfully.');
      await addLog(`Deleted Product: ${prodId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${prodId}`);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      id: '', name: '', brand: 'Samsung', category: 'Washing Machine', price: '', 
      originalPrice: '', stock: 10, description: '', image: '', warranty: '1 Year Warranty', featured: false
    });
  };

  // --- Handlers for Used Listings ---
  const handleUsedStatus = async (listingId, newStatus, reason = '') => {
    try {
      const docRef = doc(db, 'usedProducts', listingId);
      await updateDoc(docRef, { status: newStatus, rejectionReason: reason });
      await addLog(`Used Listing ${listingId} marked as ${newStatus}`);
      showToastMsg(`Used Listing has been set to ${newStatus}.`);
      setRejectionBooking(null);
      setRejectionReason('');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `usedProducts/${listingId}`);
    }
  };

  const handleUsedInspectionStatus = async (listingId, newInspectionStatus) => {
    try {
      const docRef = doc(db, 'usedProducts', listingId);
      await updateDoc(docRef, { inspectionStatus: newInspectionStatus });
      await addLog(`Used Listing ${listingId} inspection status updated to ${newInspectionStatus}`);
      showToastMsg(`Inspection status updated to ${newInspectionStatus}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `usedProducts/${listingId}`);
    }
  };

  // --- Handlers for Admin Utilities ---
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    try {
      const couponCode = newCoupon.code.toUpperCase();
      const added = { 
        ...newCoupon, 
        code: couponCode, 
        used: 0, 
        active: true,
        limit: parseInt(newCoupon.limit || 100)
      };
      const docRef = doc(db, 'coupons', couponCode);
      await setDoc(docRef, added);
      showToastMsg(`Coupon ${added.code} created successfully.`);
      await addLog(`Created Coupon ${added.code}`);
      setNewCoupon({ code: '', discount: 10, limit: 100, expiry: '2026-12-31' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `coupons/${newCoupon.code}`);
    }
  };

  const handleAddTech = async (e) => {
    e.preventDefault();
    if (!newTech.name) return;
    try {
      const techId = `tech-${Date.now()}`;
      const added = { id: techId, ...newTech, rating: 5.0, jobs: 0 };
      const docRef = doc(db, 'technicians', techId);
      await setDoc(docRef, added);
      showToastMsg(`Technician ${added.name} registered.`);
      await addLog(`Registered Technician ${added.name}`);
      setNewTech({ name: '', areas: '', status: 'Available' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `technicians/${techId}`);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/login', { replace: true });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    showToastMsg('Processing product image locally...', 'info');
    const reader = new FileReader();
    reader.onload = (event) => {
      setProductForm(prev => ({ ...prev, image: event.target.result }));
      showToastMsg('Product image processed successfully!', 'success');
      setUploadingImage(false);
    };
    reader.onerror = (err) => {
      console.error(err);
      showToastMsg('Failed to process image.', 'error');
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!newNotification.title || !newNotification.message) return;
    try {
      const notifyId = `notify-${Date.now()}`;
      const alertDoc = {
        id: notifyId,
        title: newNotification.title,
        message: newNotification.message,
        targetUser: newNotification.targetUser,
        read: false,
        createdAt: new Date().toISOString()
      };
      const docRef = doc(db, 'notifications', notifyId);
      await setDoc(docRef, alertDoc);
      showToastMsg('Notification broadcasted and delivered successfully!');
      await addLog(`Broadcasted Notification: ${newNotification.title}`);
      setNewNotification({ title: '', message: '', targetUser: 'all' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${notifyId}`);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      showToastMsg('Review deleted successfully.');
      await addLog(`Deleted Review: ${reviewId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reviews/${reviewId}`);
    }
  };

  const handleToggleUserBlock = async (userId, currentBlocked) => {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, { blocked: !currentBlocked });
      showToastMsg(`User ${!currentBlocked ? 'blocked' : 'unblocked'} successfully.`);
      await addLog(`${!currentBlocked ? 'Blocked' : 'Unblocked'} User: ${userId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user permanently?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      showToastMsg('User deleted permanently.');
      await addLog(`Deleted User: ${userId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const docRef = doc(db, 'users', editingUser.id);
      await updateDoc(docRef, { name: userForm.name, email: userForm.email, phone: userForm.phone });
      showToastMsg('User details updated successfully.');
      await addLog(`Updated User details: ${editingUser.id}`);
      setEditingUser(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${editingUser.id}`);
    }
  };

  // Calculations for stats
  const totalRevenue = orders.reduce((sum, o) => {
    if (o.status !== 'Cancelled') {
      return sum + (o.costs?.total || o.total || 0);
    }
    return sum;
  }, 0) + bookings.filter(b => b.status === 'Completed').length * 90;

  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending Approval' || b.status === 'Requested').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed').length;
  const pendingUsedCount = usedListings.filter(l => l.status === 'Pending Inspection').length;

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="space-y-4 max-w-xs">
          <div className="relative flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500/20 border-t-blue-500" />
            <Lock className="h-4 w-4 text-blue-500 absolute" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-slate-200 uppercase">Authorizing Session...</h1>
            <p className="text-slate-500 text-[10px] mt-1">Re-establishing cryptographic credentials with Firebase Auth...</p>
          </div>
        </div>
      </div>
    );
  }

  if (authReady && !currentAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-slate-800/80 border border-slate-700/50 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full w-fit mx-auto border border-rose-500/20">
            <Lock className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Access Denied</h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              Your cryptographic admin session is invalid, expired, or unauthorized. Only authenticated personnel can access the command boards.
            </p>
          </div>
          <button 
            onClick={() => navigate('/login', { replace: true })}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
          >
            Authenticate Credentials
          </button>
        </div>
      </div>
    );
  }

  if (globalError) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-slate-800/80 border border-slate-700/50 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full w-fit mx-auto border border-rose-500/20">
            <AlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-white">System Sync Notice</h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              An unexpected error occurred during database synchronization.
            </p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-700 text-left font-mono text-[10px] text-rose-300 break-words max-h-48 overflow-y-auto">
            {globalError}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
          >
            Re-establish Connection
          </button>
        </div>
      </div>
    );
  }

  if (isSeeding) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="space-y-4 max-w-xs">
          <div className="relative flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500/20 border-t-blue-500" />
            <Shield className="h-4 w-4 text-blue-500 absolute" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-slate-200 uppercase">Verifying Gateway...</h1>
            <p className="text-slate-500 text-[10px] mt-1">Establishing secure connection with Firestore datastore...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 border text-sm font-semibold ${
              toast.type === 'error' 
                ? 'bg-rose-50 border-rose-150 text-rose-700' 
                : 'bg-emerald-50 border-emerald-150 text-emerald-700'
            }`}
          >
            <CheckCircle2 className="h-4.5 w-4.5" />
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Menu Panel */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 shrink-0 border-r border-slate-800 flex flex-col justify-between">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-800">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">ElectroFix Admin</h2>
              <span className="text-[10px] text-blue-400 font-mono font-semibold">SECURE GATEWAY</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'overview', label: 'Overview Panel', icon: LayoutDashboard },
              { id: 'bookings', label: 'Bookings Log', icon: Calendar, badge: pendingBookingsCount },
              { id: 'orders', label: 'Orders Registry', icon: ShoppingBag, badge: pendingOrdersCount },
              { id: 'products', label: 'Store Products', icon: Plus },
              { id: 'used', label: 'Used Moderation', icon: RefreshCw, badge: pendingUsedCount },
              { id: 'customers', label: 'User Directory', icon: Users },
              { id: 'techs', label: 'Technician Pool', icon: Award },
              { id: 'reviews', label: 'User Reviews', icon: Star, badge: reviews.length },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.length },
              { id: 'categories', label: 'Marketing & Coupons', icon: Ticket },
              { id: 'reports', label: 'System Reports', icon: FileText },
              { id: 'settings', label: 'Settings & Security', icon: Settings }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5 stroke-1.5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      isActive ? 'bg-white text-blue-600' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 p-2 bg-slate-800/40 rounded-xl border border-slate-800">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <User className="h-4.5 w-4.5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-semibold text-white truncate">Gaurav Mandal</p>
              <p className="text-[9px] text-slate-500 truncate">Super Administrator</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-grow p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <span className="text-[10px] tracking-widest font-bold text-slate-400 uppercase">Operational Hub</span>
            <h1 className="text-2xl font-black text-slate-900 capitalize tracking-tight">{activeTab.replace('-', ' ')} Manager</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="bg-white border border-slate-200 hover:border-slate-300 text-xs rounded-xl py-2 pl-3 pr-4 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all shadow-sm cursor-pointer"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <span>Global Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-100 text-slate-500 rounded border border-slate-200">Ctrl+K</kbd>
            </button>

            {['bookings', 'orders', 'products', 'used', 'customers'].includes(activeTab) && (
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter active list..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-slate-200 text-xs rounded-xl py-2 pl-9 pr-4 w-44 sm:w-56 focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>
            )}
            <button 
              onClick={fetchData}
              className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 hover:text-slate-900 transition-colors shrink-0 cursor-pointer shadow-sm"
              title="Synchronize Database"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 1. OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '+14% this week', color: 'blue' },
                { label: 'Service Bookings', value: bookings.length, change: `${pendingBookingsCount} awaiting review`, color: 'emerald' },
                { label: 'Store Orders', value: orders.length, change: `${pendingOrdersCount} in queue`, color: 'indigo' },
                { label: 'Used Listings', value: usedListings.length, change: `${pendingUsedCount} inspection jobs`, color: 'amber' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm relative overflow-hidden flex flex-col justify-between h-32">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className={stat.color === 'emerald' ? 'text-emerald-600' : stat.color === 'amber' ? 'text-amber-600' : 'text-blue-600'}>
                      {stat.change}
                    </span>
                    {/* Tiny Sparkline graph */}
                    <svg className="w-16 h-6 stroke-slate-300 stroke-1.5 fill-none">
                      <path d="M0,15 Q8,2 16,10 T32,5 T48,15 T64,4" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Management Toolbar */}
            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span>Quick Administrative Dispatch</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Instant actions for service bookings, inventory, and users.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    setEditingBookingObj(null);
                    setCreateBookingModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Booking</span>
                </button>

                <button
                  onClick={() => {
                    resetProductForm();
                    setEditingProduct(null);
                    setShowProductForm(true);
                    setActiveTab('products');
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Product</span>
                </button>

                <button
                  onClick={() => {
                    setEditingUserObj(null);
                    setCreateUserModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Users className="h-4 w-4" />
                  <span>Add User</span>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  <span>Export Reports</span>
                </button>
              </div>
            </div>

            {/* Middle Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Interactive Performance Charts Component */}
              <div className="lg:col-span-2">
                <ChartsOverview bookings={bookings} orders={orders} techs={techs} />
              </div>

              {/* Action Log Card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Security Activity Trail</h3>
                  <button onClick={() => setActiveTab('reports')} className="text-[10px] font-bold text-blue-600 hover:underline">View Logs</button>
                </div>
                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {logs.slice(0, 5).map(log => (
                    <div key={log.id} className="text-xs flex gap-3 pb-3 border-b border-slate-50 last:border-0">
                      <div className="p-1.5 h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-mono text-[9px] shrink-0">
                        OK
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{log.action}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{log.time} • {log.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Hotlists & Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Most Booked Services */}
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">Most Demanded Repairs</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Split Air Conditioner Overhaul', bookings: 42, rev: 3780, category: 'AC' },
                    { name: 'Front Load Washer Spin Failure Repair', bookings: 31, rev: 2790, category: 'Washing Machine' },
                    { name: 'Refrigerator Gas Leak Refilling', bookings: 25, rev: 2250, category: 'Refrigerator' }
                  ].map((srv, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-3 bg-slate-50 rounded-2xl">
                      <div>
                        <p className="font-semibold text-slate-800">{srv.name}</p>
                        <span className="text-[10px] text-slate-400">{srv.category}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-800">{srv.bookings} Bookings</p>
                        <p className="text-[10px] text-blue-600 font-semibold">₹{srv.rev} Earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">Top-Selling Spares</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Samsung Heavy Duty Condenser Motor', sales: 68, stock: 12, price: 89 },
                    { name: 'Carrier Washable PM2.5 Active Filter', sales: 54, stock: 41, price: 29 },
                    { name: 'Bosch PureDry Stainless Steel Heating Element', sales: 32, stock: 8, price: 119 }
                  ].map((prod, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-3 bg-slate-50 rounded-2xl">
                      <div>
                        <p className="font-semibold text-slate-800">{prod.name}</p>
                        <span className="text-[10px] text-slate-400">{prod.stock} Units Remaining</span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-800">{prod.sales} Sold</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">₹{prod.price} Each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 2. BOOKINGS LOG */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Service Booking Logs</h3>
              <div className="flex gap-2">
                {['All', 'Pending Approval', 'Technician Assigned', 'Completed', 'Cancelled'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      statusFilter === filter ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {loading.bookings ? (
              <div className="p-10 space-y-4">
                <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse"></div>
                <div className="h-10 bg-slate-100 rounded w-full animate-pulse"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="p-4">ID / Type</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Preferred Slot</th>
                      <th className="p-4">Address</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Technician</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings
                      .filter(b => {
                        if (statusFilter !== 'All' && b.status !== statusFilter) return false;
                        if (searchQuery) {
                          const query = searchQuery.toLowerCase();
                          return b.bookingId?.toLowerCase().includes(query) || b.customerName?.toLowerCase().includes(query) || b.serviceType?.toLowerCase().includes(query);
                        }
                        return true;
                      })
                      .map(b => (
                        <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="p-4">
                            <span className="font-bold text-slate-950 font-mono text-[11px] block">{b.bookingId || b.id.substring(0, 8)}</span>
                            <span className="text-[10px] text-slate-400">{b.serviceType}</span>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-800">{b.customerName ||  b.fullName || 'Anonymous'}</p>
                            <span className="text-[10px] text-slate-400">{b.phone || 'No phone'}</span>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-800">{b.preferredDate}</p>
                            <span className="text-[10px] text-slate-400">{b.preferredTimeSlot}</span>
                          </td>
                          <td className="p-4">
                            <p className="truncate max-w-[150px]" title={b.address}>{b.address || 'In-store drop'}</p>
                            <span className="text-[10px] text-slate-400">{b.city}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              b.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              b.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              b.status === 'Technician Assigned' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                              'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>
                              {b.status || 'Pending Approval'}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-slate-700">
                            {b.technician ? (
                              <span className="flex items-center gap-1.5">
                                <Award className="h-3.5 w-3.5 text-blue-500" />
                                {b.technician}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Unassigned</span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-1 shrink-0">
                            {b.status === 'Pending Approval' && (
                              <>
                                <button 
                                  onClick={() => handleBookingStatus(b.id, 'Confirmed')}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 rounded-lg cursor-pointer"
                                  title="Approve Booking"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm('Reject this booking?')) {
                                      handleBookingStatus(b.id, 'Cancelled');
                                    }
                                  }}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg cursor-pointer"
                                  title="Reject Booking"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => setAssigningBooking(b.id)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Assign
                            </button>
                            {b.status === 'Technician Assigned' && (
                              <button 
                                onClick={() => handleBookingStatus(b.id, 'Completed')}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Complete
                              </button>
                            )}
                            <button 
                              onClick={() => setViewingReceipt(b)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-lg cursor-pointer"
                              title="Generate Service Receipt"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-10 text-center text-slate-400">No service bookings found in collection.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. ORDERS REGISTRY */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Store Orders</h3>
              <div className="flex gap-2">
                {['All', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      statusFilter === filter ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {loading.orders ? (
              <div className="p-10 space-y-4">
                <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse"></div>
                <div className="h-10 bg-slate-100 rounded w-full animate-pulse"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items Count</th>
                      <th className="p-4">Total Price</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter(o => {
                        if (statusFilter !== 'All' && o.status !== statusFilter) return false;
                        if (searchQuery) {
                          const query = searchQuery.toLowerCase();
                          return o.orderId?.toLowerCase().includes(query) || o.email?.toLowerCase().includes(query) || o.shippingAddress?.fullname?.toLowerCase().includes(query);
                        }
                        return true;
                      })
                      .map(o => (
                        <tr key={o._id || o.orderId} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-950 font-mono text-[11px]">
                            {o.orderId}
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-800">{o.shippingAddress?.fullname || o.email}</p>
                            <span className="text-[10px] text-slate-400">{o.shippingAddress?.phone}</span>
                          </td>
                          <td className="p-4 text-slate-700">
                            {o.items?.length || 1} Products
                          </td>
                          <td className="p-4 font-bold text-slate-900">
                            ₹{o.costs?.total || o.total || 0}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {o.paymentDetails?.method || 'COD'} ({o.paymentStatus || 'Pending'})
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              o.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            <select 
                              value={o.status}
                              onChange={(e) => handleOrderStatus(o._id || o.orderId, e.target.value)}
                              className="bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold px-2 py-1 focus:outline-none"
                            >
                              <option value="Confirmed">Confirm</option>
                              <option value="Packed">Pack</option>
                              <option value="Shipped">Ship</option>
                              <option value="Delivered">Deliver</option>
                              <option value="Cancelled">Cancel</option>
                            </select>
                            <button 
                              onClick={() => setViewingInvoice(o)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-lg cursor-pointer inline-flex items-center"
                              title="View Invoice Details"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-10 text-center text-slate-400">No store orders found in database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. STORE PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Product Inventory</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">List, modify, create, or archive hardware catalog items.</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  resetProductForm();
                  setShowProductForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            </div>

            {showProductForm && (
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100">
                  {editingProduct ? 'Edit Product Details' : 'Create New Hardware Product'}
                </h3>
                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Product ID</label>
                    <input 
                      type="text" 
                      required 
                      disabled={!!editingProduct}
                      placeholder="e.g. SAM-AC-5S"
                      value={productForm.id}
                      onChange={(e) => setProductForm(prev => ({ ...prev, id: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Samsung WindFree 1.5 Ton AC"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                    <select 
                      value={productForm.category}
                      onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Brand</label>
                    <select 
                      value={productForm.brand}
                      onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                    >
                      {brands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Store Price (₹)</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="e.g. 450"
                      value={productForm.price}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Original Price (₹)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 599"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Inventory Stock</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 15"
                      value={productForm.stock}
                      onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Warranty Info</label>
                    <input 
                      type="text" 
                      value={productForm.warranty}
                      onChange={(e) => setProductForm(prev => ({ ...prev, warranty: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Photo Catalog Link</label>
                    <input 
                      type="text" 
                      placeholder="Unsplash / custom image url"
                      value={productForm.image}
                      onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Specification Description</label>
                    <textarea 
                      rows="2"
                      placeholder="Enter technical details and overview features..."
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                    ></textarea>
                  </div>
                  <div className="md:col-span-3 flex items-center gap-3 py-2">
                    <input 
                      type="checkbox" 
                      id="featuredCheck"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="featuredCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">Feature this product in the hero homepage carousel</label>
                  </div>
                  <div className="md:col-span-3 flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md"
                    >
                      Save Product Record
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="p-4">Visual</th>
                      <th className="p-4">ID / Title</th>
                      <th className="p-4">Brand & Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Inventory Level</th>
                      <th className="p-4">Warranty Scope</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter(p => !p.deleted)
                      .filter(p => {
                        if (searchQuery) {
                          const query = searchQuery.toLowerCase();
                          return p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query);
                        }
                        return true;
                      })
                      .map(p => (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="p-4">
                            <img 
                              src={p.image} 
                              alt="" 
                              className="h-10 w-10 object-cover rounded-xl border border-slate-100 shrink-0"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                if (e.target.dataset.triedFallback) { e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"; } else { e.target.dataset.triedFallback = "true"; e.target.src = getFallbackProductImage(p.category, p.name); }
                              }}
                            />
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-950 font-mono text-[11px] block">{p.id}</span>
                            <span className="text-slate-800 font-semibold">{p.name}</span>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-700">{p.brand}</p>
                            <span className="text-[10px] text-slate-400">{p.category}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900">₹{p.price}</span>
                            {p.originalPrice > p.price && (
                              <span className="text-[10px] text-slate-400 line-through block">₹{p.originalPrice}</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.stock <= 2 ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              p.stock <= 5 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>
                              {p.stock} Units Left
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 font-medium">
                            {p.warranty || 'No Warranty'}
                          </td>
                          <td className="p-4 text-right space-x-1 shrink-0">
                            <button
                              onClick={() => {
                                setEditingProduct(p.id);
                                setProductForm({ ...p });
                                setShowProductForm(true);
                                window.scrollTo(0, 0);
                              }}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg cursor-pointer inline-flex"
                              title="Edit"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-600 rounded-lg cursor-pointer inline-flex"
                              title="Delete"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. USED MODERATION */}
        {activeTab === 'used' && (
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Used Appliance Moderation Pool</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Inspect user-submitted used listings before publishing to the showroom.</p>
              </div>
              <div className="flex gap-2">
                {['All', 'Pending Inspection', 'Live', 'Sold', 'Rejected'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      statusFilter === filter ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="p-4">Visual</th>
                    <th className="p-4">Appliance Model / Category</th>
                    <th className="p-4">Seller Detail</th>
                    <th className="p-4">Condition</th>
                    <th className="p-4">Requested Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usedListings
                    .filter(l => {
                      if (statusFilter !== 'All' && l.status !== statusFilter) return false;
                      if (searchQuery) {
                        const query = searchQuery.toLowerCase();
                        return l.title.toLowerCase().includes(query) || l.brand.toLowerCase().includes(query) || l.phone?.toLowerCase().includes(query);
                      }
                      return true;
                    })
                    .map(l => (
                      <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-4">
                          <img 
                            src={l.images?.[0]} 
                            alt="" 
                            className="h-10 w-10 object-cover rounded-xl border border-slate-100 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              if (e.target.dataset.triedFallback) { e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"; } else { e.target.dataset.triedFallback = "true"; e.target.src = getFallbackProductImage(l.category, l.title); }
                            }}
                          />
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{l.title}</p>
                          <span className="text-[10px] text-slate-400">{l.age} Old • {l.category}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-800">{l.city || 'Seattle'}</p>
                          <span className="text-[10px] text-slate-400">{l.phone || 'No phone'}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            l.condition === 'Excellent' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {l.condition}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          ₹{l.expectedPrice}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            l.status === 'Live' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            l.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1 shrink-0">
                          {l.status === 'Pending Inspection' && (
                            <>
                              <button 
                                onClick={() => handleUsedStatus(l.id, 'Live')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] cursor-pointer"
                              >
                                Approve Listing
                              </button>
                              <button 
                                onClick={() => setRejectionBooking(l.id)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-150 rounded-lg font-bold text-[10px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => {
                              if (confirm('Delete this listing permanently?')) {
                                setUsedListings(prev => prev.filter(item => item.id !== l.id));
                                showToastMsg('Listing deleted.');
                              }
                            }}
                            className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  {usedListings.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-10 text-center text-slate-400">No used listings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. USER DIRECTORY */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            {editingUser && (
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4 animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Edit User Account</h3>
                  <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={userForm.name}
                      onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                    <input 
                      type="text" 
                      value={userForm.phone || ''}
                      onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 px-5 rounded-xl cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-3 px-5 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">User Account Directory</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Manage customer access credentials, block accounts, edit info or delete users.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="p-4">UserID</th>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Registration Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers
                      .filter(c => {
                        if (searchQuery) {
                          const query = searchQuery.toLowerCase();
                          return c.name?.toLowerCase().includes(query) || c.email?.toLowerCase().includes(query) || c.id?.toLowerCase().includes(query) || c._id?.toLowerCase().includes(query);
                        }
                        return true;
                      })
                      .map(c => (
                        <tr key={c.id || c._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="p-4 font-mono font-bold text-slate-950 text-[10px]">
                            {c.id || c._id}
                          </td>
                          <td className="p-4 font-semibold text-slate-800">
                            {c.name}
                          </td>
                          <td className="p-4 font-medium text-slate-600">
                            {c.email}
                          </td>
                          <td className="p-4 text-slate-400 font-medium">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '2026-06-12'}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.blocked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {c.blocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            <button 
                              onClick={() => {
                                setEditingUser(c);
                                setUserForm({ name: c.name || '', email: c.email || '', phone: c.phone || '' });
                              }}
                              className="text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer inline-flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" /> Edit
                            </button>
                            <button 
                              onClick={() => handleToggleUserBlock(c.id || c._id, c.blocked)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg cursor-pointer ${
                                c.blocked 
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                  : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              }`}
                            >
                              {c.blocked ? 'Unblock' : 'Block'}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(c.id || c._id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer inline-flex items-center"
                              title="Delete User permanently"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-10 text-center text-slate-400">No registered customers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. TECHNICIAN POOL */}
        {activeTab === 'techs' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100">Register New Service Engineer</h3>
              <form onSubmit={handleAddTech} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Engineer Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. John Doe"
                    value={newTech.name}
                    onChange={(e) => setNewTech(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Assigned Service Areas</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Seattle, Tacoma"
                    value={newTech.areas}
                    onChange={(e) => setNewTech(prev => ({ ...prev, areas: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Duty Status</label>
                  <select 
                    value={newTech.status}
                    onChange={(e) => setNewTech(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Off-Duty">Off-Duty</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3.5 px-5 rounded-xl cursor-pointer"
                >
                  Register Engineer
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {techs.map(tech => (
                <div key={tech.id} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2.5 items-center">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{tech.name}</h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          {tech.rating} Score
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      tech.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                      tech.status === 'Busy' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {tech.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Territories</p>
                    <p className="font-semibold text-slate-700">{tech.areas}</p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50 text-[11px] font-semibold text-slate-500">
                    <span>{tech.jobs} Jobs Finished</span>
                    <button 
                      onClick={() => {
                        setTechs(prev => prev.filter(t => t.id !== tech.id));
                        showToastMsg('Technician removed.');
                      }}
                      className="text-rose-600 hover:underline cursor-pointer"
                    >
                      Deregister
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">User Reviews Directory</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Moderate or delete customer product/service reviews across the site.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Target Name (Type)</th>
                    <th className="p-4">Comment</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(r => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4 font-semibold text-slate-800">
                        {r.userName}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {r.targetName} <span className="text-[10px] text-slate-400 font-mono capitalize">({r.targetType})</span>
                      </td>
                      <td className="p-4 text-slate-700 max-w-xs truncate" title={r.comment}>
                        {r.comment}
                      </td>
                      <td className="p-4 text-slate-400">
                        {r.date}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-150 rounded-lg cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-slate-400">No reviews found in database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS BROADCAST */}
        {activeTab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4 lg:col-span-1">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100">Broadcast Notification</h3>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Alert Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Server Maintenance"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Notification Message</label>
                  <textarea 
                    rows="4"
                    required
                    placeholder="Write details for the user alerts..."
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  ></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Audience</label>
                  <select 
                    value={newNotification.targetUser}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, targetUser: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                  >
                    <option value="all">Broadcast to All Users</option>
                    {customers.map(c => (
                      <option key={c.id || c._id} value={c.id || c._id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 px-4 rounded-xl cursor-pointer"
                >
                  Deliver Alert
                </button>
              </form>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4 lg:col-span-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100">Sent Notifications Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="p-3">Title</th>
                      <th className="p-3">Target Audience</th>
                      <th className="p-3">Message Preview</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map(n => (
                      <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50/40">
                        <td className="p-3 font-bold text-slate-900">{n.title}</td>
                        <td className="p-3 text-slate-600 font-semibold uppercase text-[10px]">
                          {n.targetUser === 'all' ? 'Broadcast (All)' : (customers.find(c => c.id === n.targetUser || c._id === n.targetUser)?.name || 'Direct User')}
                        </td>
                        <td className="p-3 text-slate-500 max-w-xs truncate" title={n.message}>{n.message}</td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={async () => {
                              try {
                                await deleteDoc(doc(db, 'notifications', n.id));
                                showToastMsg('Notification deleted.');
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="text-rose-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {notifications.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-10 text-center text-slate-400">No sent notifications found in database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. MARKETING & COUPONS */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Coupon Manager */}
            <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4 lg:col-span-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100">Coupons & Campaigns</h3>
              
              <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-2xl">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Coupon Code</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. MONSOON25"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Discount (%)</label>
                  <input 
                    type="number" 
                    required 
                    min="1" 
                    max="100"
                    value={newCoupon.discount}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, discount: e.target.value }))}
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Expiry Date</label>
                  <input 
                    type="date" 
                    required
                    value={newCoupon.expiry}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, expiry: e.target.value }))}
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer"
                >
                  Generate Coupon
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="p-3">Campaign Code</th>
                      <th className="p-3">Discount</th>
                      <th className="p-3">Expiry</th>
                      <th className="p-3">Redemptions</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(coupon => (
                      <tr key={coupon.code} className="border-b border-slate-100 hover:bg-slate-50/40">
                        <td className="p-3 font-mono font-bold text-slate-900">{coupon.code}</td>
                        <td className="p-3 font-semibold text-slate-700">{coupon.discount}% Off</td>
                        <td className="p-3 text-slate-500">{coupon.expiry}</td>
                        <td className="p-3 text-slate-500 font-medium">{coupon.used}/{coupon.limit} Claims</td>
                        <td className="p-3">
                          <button 
                            onClick={async () => {
                              try {
                                await updateDoc(doc(db, 'coupons', coupon.code), { active: !coupon.active });
                                showToastMsg(`Campaign ${coupon.code} updated.`);
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              coupon.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {coupon.active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={async () => {
                              try {
                                await deleteDoc(doc(db, 'coupons', coupon.code));
                                showToastMsg('Coupon deleted.');
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="text-rose-600 hover:text-rose-800 cursor-pointer"
                          >
                            <Trash className="h-4 w-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category / Brand Catalog Settings */}
            <div className="space-y-6">
              
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100">Category Catalog</h3>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newCategory) return;
                    const updatedCategories = [...categories, newCategory];
                    try {
                      await updateDoc(doc(db, 'settings', 'company_profile'), { categories: updatedCategories });
                      setNewCategory('');
                      showToastMsg('Category added.');
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="flex gap-2"
                >
                  <input 
                    type="text" 
                    placeholder="New category..." 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-grow bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:outline-none"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-2.5 shrink-0">
                    <Plus className="h-4 w-4" />
                  </button>
                </form>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {categories.map(c => (
                    <span key={c} className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-1.5 text-slate-700">
                      {c}
                      <button 
                        onClick={async () => {
                          const updatedCategories = categories.filter(item => item !== c);
                          try {
                            await updateDoc(doc(db, 'settings', 'company_profile'), { categories: updatedCategories });
                            showToastMsg('Category removed.');
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100">Brand Portfolio</h3>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newBrand) return;
                    const updatedBrands = [...brands, newBrand];
                    try {
                      await updateDoc(doc(db, 'settings', 'company_profile'), { brands: updatedBrands });
                      setNewBrand('');
                      showToastMsg('Brand registered.');
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="flex gap-2"
                >
                  <input 
                    type="text" 
                    placeholder="New brand..." 
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="flex-grow bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:outline-none"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-2.5 shrink-0">
                    <Plus className="h-4 w-4" />
                  </button>
                </form>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {brands.map(b => (
                    <span key={b} className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-1.5 text-slate-700">
                      {b}
                      <button 
                        onClick={async () => {
                          const updatedBrands = brands.filter(item => item !== b);
                          try {
                            await updateDoc(doc(db, 'settings', 'company_profile'), { brands: updatedBrands });
                            showToastMsg('Brand removed.');
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Reports Panel */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <ReportsExporter 
              bookings={bookings}
              orders={orders}
              customers={customers}
              techs={techs}
              products={products}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Gross Revenue</span>
                <p className="text-2xl font-black text-slate-900">
                  ₹{orders.reduce((sum, o) => sum + (o.costs?.total || o.total || 0), 0).toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-500 font-bold">● Live Processing</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Bookings</span>
                <p className="text-2xl font-black text-slate-900">{bookings.length}</p>
                <span className="text-[10px] text-slate-400">Services Scheduled</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Store Sales</span>
                <p className="text-2xl font-black text-slate-900">{orders.length}</p>
                <span className="text-[10px] text-slate-400">Orders Processed</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Service Pool</span>
                <p className="text-2xl font-black text-slate-900">{techs.length}</p>
                <span className="text-[10px] text-blue-500 font-bold">Engineers On-Call</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Metrics Table */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Platform Operational Summaries</h3>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded">AUTO-REFRESH</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-3 flex justify-between">
                    <span className="font-semibold text-slate-500">Service Success Rate</span>
                    <span className="font-bold text-slate-900">98.4%</span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="font-semibold text-slate-500">Average Booking Cost</span>
                    <span className="font-bold text-slate-900">₹85.00</span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="font-semibold text-slate-500">Active Promo Campaigns</span>
                    <span className="font-bold text-slate-900">{coupons.filter(c => c.active).length} Campaigns</span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="font-semibold text-slate-500">Reviews & Feedback Rating</span>
                    <span className="font-bold text-slate-900">★ {(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)} / 5.0</span>
                  </div>
                </div>
              </div>

              {/* Audit Trail Copy for Convenience */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest pb-3 border-b border-slate-100">System Security Trail</h3>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {logs.map(log => (
                    <div key={log.id} className="text-xs pb-3 border-b border-slate-50 last:border-0 flex justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-900">{log.action}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 h-fit">
                        {log.user && typeof log.user === 'string' ? log.user.split('@')[0] : (log.user || 'admin')}
                      </span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">No audit records available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. SETTINGS & LOG TRAIL */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Website Configuration */}
            <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100">Platform Identity</h3>
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Platform Legal Name</label>
                    <input 
                      type="text" 
                      value={siteSettings.companyName}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Operational Hotline</label>
                    <input 
                      type="text" 
                      value={siteSettings.contactPhone}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Official Support Email</label>
                  <input 
                    type="email" 
                    value={siteSettings.contactEmail}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Office Headquarters</label>
                  <input 
                    type="text" 
                    value={siteSettings.address}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">About Us Platform Description</label>
                  <textarea 
                    rows="4"
                    value={siteSettings.aboutUsText}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, aboutUsText: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                  ></textarea>
                </div>
                <button 
                  onClick={async () => {
                    try {
                      await setDoc(doc(db, 'settings', 'company_profile'), {
                        ...siteSettings,
                        categories,
                        brands
                      }, { merge: true });
                      showToastMsg('Identity settings saved.');
                      await addLog('Updated website identity parameters');
                    } catch (err) {
                      handleFirestoreError(err, OperationType.WRITE, 'settings/company_profile');
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl cursor-pointer"
                >
                  Commit Changes
                </button>
              </div>
            </div>

            {/* Audit Log Panel */}
            <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100">Historical Security Trail</h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {logs.map(log => (
                  <div key={log.id} className="text-xs pb-3 border-b border-slate-50 last:border-0 flex justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900">{log.action}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 h-fit">
                      {log.user && typeof log.user === 'string' ? log.user.split('@')[0] : (log.user || 'admin')}
                    </span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  if (confirm('Clear audit logs?')) {
                    setLogs([]);
                    showToastMsg('Audit trail cleared.');
                  }
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 text-xs rounded-xl cursor-pointer"
              >
                Clear Log History
              </button>
            </div>

          </div>
        )}

      </main>

      {/* --- MODAL 1: ASSIGN TECHNICIAN --- */}
      {assigningBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-150 max-w-sm w-full p-6 space-y-4 relative shadow-2xl"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assign Field Service Engineer</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Select from authorized engineers registered in the platform pool.</p>
            </div>
            
            <div className="space-y-2.5">
              {techs
                .filter(t => t.status === 'Available')
                .map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setSelectedTech(t.name)}
                    className={`w-full flex justify-between items-center p-3 rounded-2xl border text-xs font-semibold transition-all text-left ${
                      selectedTech === t.name 
                        ? 'border-blue-600 bg-blue-50/45 text-blue-950' 
                        : 'border-slate-150 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <span className="text-[10px] text-slate-400">Areas: {t.areas}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5 shrink-0 font-bold">
                      ★ {t.rating}
                    </span>
                  </button>
                ))}
              {techs.filter(t => t.status === 'Available').length === 0 && (
                <p className="text-xs text-rose-500 text-center font-semibold">No engineers are currently marked Available.</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button 
                onClick={() => {
                  setAssigningBooking(null);
                  setSelectedTech('');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600"
              >
                Close
              </button>
              <button 
                onClick={handleAssignTech}
                disabled={!selectedTech}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-xs font-bold text-white shadow-md"
              >
                Confirm Dispatch
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- MODAL 2: REJECTION SPECIFICATION --- */}
      {rejectionBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-150 max-w-sm w-full p-6 space-y-4 relative shadow-2xl"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">Specify Rejection Reason</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Please write down why this listing was rejected. The seller will see this note.</p>
            </div>
            
            <textarea
              rows="3"
              placeholder="e.g. Appliance age exceeds the maximum limit, or uploaded photo lacks clear resolution."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none"
            ></textarea>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 font-bold">
              <button 
                onClick={() => {
                  setRejectionBooking(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs text-slate-600"
              >
                Close
              </button>
              <button 
                onClick={() => handleUsedStatus(rejectionBooking, 'Rejected', rejectionReason)}
                disabled={!rejectionReason}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl text-xs text-white"
              >
                Reject Listing
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- MODAL 3: VIEW SERVICE RECEIPT --- */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-150 max-w-md w-full p-6 space-y-4 relative shadow-2xl text-slate-800"
          >
            <div className="border-b border-dashed border-slate-200 pb-4 text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 tracking-tight">SERVICE WORK ORDER RECEIPT</h3>
              <p className="text-[10px] font-mono font-bold text-slate-400">ELECTROFIX TECHNOLOGIES INC.</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <p><span className="text-slate-400 uppercase">Receipt No:</span> {viewingReceipt.bookingId || viewingReceipt.id.substring(0, 8)}</p>
                <p className="text-right"><span className="text-slate-400 uppercase">Date:</span> {viewingReceipt.preferredDate}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Client Profile</p>
                <p className="font-bold text-slate-900">{viewingReceipt.customerName}</p>
                <p className="text-[11px] text-slate-500 font-medium">Phone: {viewingReceipt.phone || 'No Phone'}</p>
                <p className="text-[11px] text-slate-500 font-medium">Address: {viewingReceipt.address || 'In-shop drop'}, {viewingReceipt.city || 'Seattle'}</p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Repair / Maintenance Summary</p>
                <div className="flex justify-between font-bold border-b border-slate-100 pb-1.5">
                  <p>{viewingReceipt.serviceType}</p>
                  <p>₹90.00</p>
                </div>
              </div>

              {viewingReceipt.technician && (
                <div className="flex justify-between items-center text-[11px] bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl text-blue-950 font-semibold">
                  <span>Assigned Field Engineer:</span>
                  <span>{viewingReceipt.technician}</span>
                </div>
              )}

              <div className="space-y-1 text-right font-mono text-[11px]">
                <p><span className="text-slate-400">Diagnosis Fee:</span> ₹50.00</p>
                <p><span className="text-slate-400">Labor Charge:</span> ₹40.00</p>
                <p className="font-bold text-sm text-slate-900">Grand Total: ₹90.00</p>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-4 border-t border-slate-100">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600"
              >
                Print Receipt
              </button>
              <button 
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white"
              >
                Close Work Order
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- MODAL 4: VIEW INVOICE --- */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-150 max-w-md w-full p-6 space-y-4 relative shadow-2xl text-slate-800"
          >
            <div className="border-b border-slate-100 pb-3 text-center">
              <h3 className="text-base font-black text-slate-900 tracking-tight">OFFICIAL PLATFORM INVOICE</h3>
              <p className="text-[10px] font-mono font-bold text-slate-400">{viewingInvoice.orderId}</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between text-[11px] font-mono">
                <p><span className="text-slate-400 uppercase">Invoice No:</span> {viewingInvoice.invoiceNo || 'INV-2026-991'}</p>
                <p><span className="text-slate-400 uppercase">Placed Date:</span> {viewingInvoice.date || '2026-07-05'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Shipping Address</p>
                  <p className="font-bold text-slate-900">{viewingInvoice.shippingAddress?.fullname || 'Guest Buyer'}</p>
                  <p className="text-[10px] text-slate-500">{viewingInvoice.shippingAddress?.address || 'Pickup'}</p>
                  <p className="text-[10px] text-slate-500">{viewingInvoice.shippingAddress?.city}, {viewingInvoice.shippingAddress?.state}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Payment Summary</p>
                  <p className="font-bold text-slate-900">{viewingInvoice.paymentDetails?.method || 'Cash On Delivery'}</p>
                  <p className="text-[10px] text-slate-500">Gateway Status: {viewingInvoice.paymentStatus || 'Pending'}</p>
                  <p className="text-[10px] text-slate-500">Transaction Ref: {viewingInvoice.transactionId || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Itemized Breakdown</p>
                <div className="space-y-2 max-h-[120px] overflow-y-auto">
                  {(viewingInvoice.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <span className="text-[10px] text-slate-400">{item.brand} • Qty {item.quantity || 1}</span>
                      </div>
                      <p className="font-bold text-slate-900">₹{item.price * (item.quantity || 1)}</p>
                    </div>
                  ))}
                  {(!viewingInvoice.items || viewingInvoice.items.length === 0) && (
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-50">
                      <div>
                        <p className="font-bold text-slate-900">Premium Appliance Diagnostics</p>
                        <span className="text-[10px] text-slate-400">On-demand</span>
                      </div>
                      <p className="font-bold text-slate-900">₹{viewingInvoice.costs?.total || viewingInvoice.total || 90}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-right font-mono text-[11px] pt-2 border-t border-dashed border-slate-100">
                <p><span className="text-slate-400">Subtotal:</span> ₹{viewingInvoice.costs?.subtotal || viewingInvoice.total || 0}</p>
                <p><span className="text-slate-400">Taxes:</span> ₹{viewingInvoice.costs?.taxes || 0}</p>
                <p><span className="text-slate-400">Shipping Fees:</span> ₹{viewingInvoice.costs?.deliveryFee || 0}</p>
                <p className="font-bold text-sm text-slate-950">Grand Total Paid: ₹{viewingInvoice.costs?.total || viewingInvoice.total || 0}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 font-bold">
              <button 
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs text-white shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- GLOBAL SEARCH MODAL --- */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        bookings={bookings}
        orders={orders}
        products={products}
        customers={customers}
        techs={techs}
        usedListings={usedListings}
        onNavigate={(tab, item) => {
          setActiveTab(tab);
          if (item) {
            showToastMsg(`Navigated to ${tab} record: ${item.name || item.bookingId || item.orderId || item.id}`);
          }
        }}
      />

      {/* --- REUSABLE CONFIRMATION MODAL --- */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
      />

      {/* --- CREATE / EDIT SERVICE BOOKING MODAL --- */}
      <CreateBookingModal
        isOpen={createBookingModalOpen}
        onClose={() => {
          setCreateBookingModalOpen(false);
          setEditingBookingObj(null);
        }}
        editingBooking={editingBookingObj}
        techs={techs}
        categories={categories}
        onSubmit={async (bookingData) => {
          try {
            const docRef = doc(db, 'bookings', bookingData.bookingId);
            await setDoc(docRef, {
              ...bookingData,
              createdAt: bookingData.createdAt || new Date().toISOString()
            }, { merge: true });
            showToastMsg(`Booking ${bookingData.bookingId} saved successfully!`);
            await addLog(`Saved Service Booking ${bookingData.bookingId}`);
            setCreateBookingModalOpen(false);
            setEditingBookingObj(null);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `bookings/${bookingData.bookingId}`);
          }
        }}
      />

      {/* --- CREATE / EDIT USER MODAL --- */}
      <CreateUserModal
        isOpen={createUserModalOpen}
        onClose={() => {
          setCreateUserModalOpen(false);
          setEditingUserObj(null);
        }}
        editingUser={editingUserObj}
        onSubmit={async (userData) => {
          try {
            const docRef = doc(db, 'users', userData.id);
            await setDoc(docRef, {
              ...userData,
              createdAt: userData.createdAt || new Date().toISOString()
            }, { merge: true });
            showToastMsg(`User account ${userData.name} updated successfully!`);
            await addLog(`Saved User Account: ${userData.email}`);
            setCreateUserModalOpen(false);
            setEditingUserObj(null);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${userData.id}`);
          }
        }}
      />

    </div>
  );
}
