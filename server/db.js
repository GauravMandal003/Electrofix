// server/db.js - Firestore-based Database Layer
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACqPBkWk2F4LzR1GIXBDgGLQWXqnJWRA0",
  authDomain: "electrofix-5306f.firebaseapp.com",
  projectId: "electrofix-5306f",
  storageBucket: "electrofix-5306f.firebasestorage.app",
  messagingSenderId: "196612259734",
  appId: "1:196612259734:web:79ec3b2d5722170c6127b7"
};


// Initialize Firebase App and Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ----------------------------------------------------
// Default Seeding Datasets
// ----------------------------------------------------
const SEED_USERS = [
  { id: 'user-1', name: 'Gaurav Kumar', email: 'gaurav00@gmail.com', phone: '9876543210', role: 'admin', status: 'Active', blocked: false, createdAt: '2026-06-12T10:00:00.000Z' },
  { id: 'user-2', name: 'Rajesh Patel', email: 'rajesh@example.com', phone: '9876543211', role: 'user', status: 'Active', blocked: false, createdAt: '2026-06-15T12:30:00.000Z' },
  { id: 'user-3', name: 'Amit Sharma', email: 'amit@example.com', phone: '9876543212', role: 'user', status: 'Active', blocked: false, createdAt: '2026-06-18T14:45:00.000Z' }
];

const SEED_BOOKINGS = [
  { id: 'book-1', userName: 'Rajesh Patel', customerName: 'Rajesh Patel', appliance: 'Washing Machine', service: 'Washing Machine Repair', issue: 'Not draining, making loud noise', status: 'Pending', preferredDate: '2026-07-10', bookingDate: '2026-07-10', preferredTime: '10:00 AM - 01:00 PM', phone: '9876543210', address: 'Block C, Sector 62, Noida', city: 'Noida', technician: 'Marcus Carter', amount: 499, createdAt: '2026-07-04T12:00:00.000Z' }
];

const SEED_ORDERS = [
  { id: 'EF-ORD-3199', orderId: 'EF-ORD-3199', userName: 'Rajesh Patel', customerName: 'Rajesh Patel', items: [{ name: 'Samsung Direct Cool Refrigerator', price: 299, quantity: 1 }], total: 299, totalAmount: 299, status: 'Packed', orderStatus: 'Confirmed', paymentStatus: 'Paid', paymentMethod: 'Card', date: '2026-07-05T06:22:15.000Z', createdAt: '2026-07-05T06:22:15.000Z' }
];

const SEED_PRODUCTS = [
  { id: 'prod-1', productName: 'Samsung Direct Cool Refrigerator', name: 'Samsung Direct Cool Refrigerator', brand: 'Samsung', category: 'Refrigerator', price: 299, originalPrice: 349, stock: 15, description: 'Single door refrigerator with digital inverter technology.', imageUrl: 'https://images.unsplash.com/photo-1571175486658-28328c3a59f9?auto=format&fit=crop&q=80&w=400', image: 'https://images.unsplash.com/photo-1571175486658-28328c3a59f9?auto=format&fit=crop&q=80&w=400', warranty: '1 Year Warranty', featured: true }
];

const SEED_USED_PRODUCTS = [
  { id: 'used-1', sellerName: 'Amit Sharma', productName: 'Bosch Condenser Dryer', title: 'Bosch 8kg Condenser Dryer', brand: 'Bosch', category: 'Washing Machine', age: '18 Months', condition: 'Excellent', expectedPrice: 220, status: 'Pending Inspection', inspectionStatus: 'Scheduled', phone: '9822334455', city: 'Noida', description: 'Clean and fully working, minor scratch on side door panel.', images: ['https://images.unsplash.com/photo-1582730149719-6111a4e4142f?auto=format&fit=crop&q=80&w=400'], createdAt: '2026-07-04T15:00:00.000Z' }
];

const SEED_TECHNICIANS = [
  { id: 'tech-1', technicianName: 'Marcus Carter', name: 'Marcus Carter', phone: '9876543201', specialization: 'Washing Machine & Refrigerator', availability: 'Available', assignedBookings: 2 }
];

const SEED_REVIEWS = [
  { id: 'rev-1', customerName: 'Rajesh Patel', userName: 'Rajesh Patel', rating: 5, review: 'Absolutely brilliant product! Highly recommended.', comment: 'Absolutely brilliant product! Highly recommended.', createdAt: '2026-07-06T00:00:00.000Z' }
];

const SEED_NOTIFICATIONS = [
  { id: 'notif-1', title: 'System Boot Complete', message: 'The ElectroFix real-time Firebase database has been initialized successfully.', type: 'info', createdAt: '2026-07-06T00:00:00.000Z', isRead: false }
];

const SEED_COUPONS = [
  { code: 'ELECTRO20', couponCode: 'ELECTRO20', discount: 20, limit: 100, used: 45, active: true, expiry: '2026-12-31', expiryDate: '2026-12-31' }
];

const SEED_REPORTS = [
  { id: 'report-1', reportType: 'Revenue Report', totalRevenue: 15000, totalOrders: 120, generatedAt: '2026-07-06T00:00:00.000Z' }
];

const SEED_SETTINGS = {
  companyName: 'ElectroFix Technologies Ltd',
  supportEmail: 'support@electrofix.com',
  contactEmail: 'support@electrofix.com',
  supportPhone: '1-800-ELECTRO',
  contactPhone: '1-800-ELECTRO',
  companyAddress: '1428 Elm Street, Seattle, WA',
  address: '1428 Elm Street, Seattle, WA',
  categories: ['Washing Machine', 'Refrigerator', 'AC', 'TV', 'Kitchen Appliances'],
  brands: ['Samsung', 'Whirlpool', 'LG', 'Bosch', 'Carrier', 'Dyson']
};

const SEED_MAP = {
  users: SEED_USERS,
  bookings: SEED_BOOKINGS,
  orders: SEED_ORDERS,
  products: SEED_PRODUCTS,
  usedProducts: SEED_USED_PRODUCTS,
  technicians: SEED_TECHNICIANS,
  reviews: SEED_REVIEWS,
  notifications: SEED_NOTIFICATIONS,
  coupons: SEED_COUPONS,
  reports: SEED_REPORTS
};

// ----------------------------------------------------
// Helper functions for Firestore Operations
// ----------------------------------------------------
async function getAllDocs(colPath) {
  try {
    const colRef = collection(db, colPath);
    // Timeout getDocs after 3 seconds so we don't hang server responses
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore operation timeout')), 3000)
    );
    const snap = await Promise.race([getDocs(colRef), timeoutPromise]);
    const results = [];
    snap.forEach(d => {
      results.push({ id: d.id, _id: d.id, ...d.data() });
    });
    if (results.length > 0) {
      return results;
    }
    return SEED_MAP[colPath] || [];
  } catch (err) {
    console.error(`[Firestore Error] Failed to read from collection ${colPath}:`, err.message || err);
    return SEED_MAP[colPath] || [];
  }
}

async function createDoc(colPath, data) {
  try {
    let id = data.id || data._id || data.orderId || data.bookingId;
    if (!id) {
      id = `${colPath.slice(0, 4)}-${Math.random().toString(36).substring(2, 11)}`;
    }
    const cleanData = { ...data, id, _id: id };
    const docRef = doc(db, colPath, id);
    await setDoc(docRef, cleanData);
    console.log(`[Firestore Success] Created document ${id} in collection "${colPath}"`);
    return cleanData;
  } catch (err) {
    console.error(`[Firestore Error] Failed to create document in collection "${colPath}":`, err);
    throw err;
  }
}

async function updateDocById(colPath, id, update) {
  try {
    const cleanUpdate = { ...update };
    delete cleanUpdate._id;
    delete cleanUpdate.id;

    const docRef = doc(db, colPath, id);
    await updateDoc(docRef, cleanUpdate);
    console.log(`[Firestore Success] Updated document ${id} in collection "${colPath}"`);
    return { id, _id: id, ...cleanUpdate };
  } catch (err) {
    console.error(`[Firestore Error] Failed to update document ${id} in collection "${colPath}":`, err);
    throw err;
  }
}

// ----------------------------------------------------
// Firestore Models Wrapper
// ----------------------------------------------------
class FirestoreModel {
  constructor(collectionPath) {
    this.collectionPath = collectionPath;
  }

  async find(queryObj = {}) {
    const all = await getAllDocs(this.collectionPath);
    if (!queryObj || Object.keys(queryObj).length === 0) {
      return all;
    }
    return all.filter(item => {
      for (const key in queryObj) {
        if (queryObj[key] !== undefined) {
          if (item[key] !== queryObj[key]) {
            return false;
          }
        }
      }
      return true;
    });
  }

  async findOne(queryObj = {}) {
    const results = await this.find(queryObj);
    return results.length > 0 ? results[0] : null;
  }

  async findById(id) {
    if (!id) return null;
    try {
      const docRef = doc(db, this.collectionPath, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, _id: snap.id, ...snap.data() };
      }
      return await this.findOne({ id }) || await this.findOne({ _id: id });
    } catch (err) {
      console.error(`[Firestore Error] findById failed on ${this.collectionPath} for ID ${id}:`, err);
      return null;
    }
  }

  async create(data) {
    return await createDoc(this.collectionPath, data);
  }

  async findByIdAndUpdate(id, update) {
    return await updateDocById(this.collectionPath, id, update);
  }

  async updateOne(queryObj = {}, update = {}) {
    const existing = await this.findOne(queryObj);
    if (!existing) {
      return null;
    }
    const id = existing.id || existing._id;
    return await updateDocById(this.collectionPath, id, update);
  }
}

// ----------------------------------------------------
// Exported Firestore Models
// ----------------------------------------------------
export const User = new FirestoreModel('users');
export const Product = new FirestoreModel('products');
export const Order = new FirestoreModel('orders');
export const Booking = new FirestoreModel('bookings');
export const Notification = new FirestoreModel('notifications');

// ----------------------------------------------------
// Database Initialization and Seeding Orchestrator
// ----------------------------------------------------
export async function connectDB() {
  console.log("Initializing Firestore Database connection...");
  setTimeout(async () => {
    try {
      const collectionsToSeed = [
        { path: 'users', data: SEED_USERS },
        { path: 'bookings', data: SEED_BOOKINGS },
        { path: 'orders', data: SEED_ORDERS },
        { path: 'products', data: SEED_PRODUCTS },
        { path: 'usedProducts', data: SEED_USED_PRODUCTS },
        { path: 'technicians', data: SEED_TECHNICIANS },
        { path: 'reviews', data: SEED_REVIEWS },
        { path: 'notifications', data: SEED_NOTIFICATIONS },
        { path: 'coupons', data: SEED_COUPONS },
        { path: 'reports', data: SEED_REPORTS }
      ];

      for (const col of collectionsToSeed) {
        try {
          const colRef = collection(db, col.path);
          const snap = await getDocs(colRef);
          if (snap.empty) {
            console.log(`[Firestore Startup] Seeding empty collection "${col.path}"...`);
            for (const record of col.data) {
              const docId = record.id || record.code || `id-${Math.random().toString(36).substring(2, 11)}`;
              await setDoc(doc(db, col.path, docId), record);
            }
          }
        } catch (e) {
          console.warn(`[Firestore Startup] Skip seeding "${col.path}":`, e.message || e);
        }
      }

      const settingsDocRef = doc(db, 'settings', 'company_profile');
      const settingsSnap = await getDoc(settingsDocRef);
      if (!settingsSnap.exists()) {
        await setDoc(settingsDocRef, SEED_SETTINGS);
      }
      console.log("Connected to Firestore and verified seed state.");
    } catch (err) {
      console.error("Firestore initialization warning:", err.message || err);
    }
  }, 10);
}
