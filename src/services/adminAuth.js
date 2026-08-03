// src/services/adminAuth.js
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Fetch the role of a user from Firestore (/users/{uid}).
 * @param {string} uid 
 * @returns {Promise<string>} 'admin' | 'user'
 */
export async function getUserRole(uid) {
  if (!uid) return 'user';
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      return data?.role === 'admin' ? 'admin' : 'user';
    }
  } catch (err) {
    console.error('Error fetching user role from Firestore:', err);
  }
  return 'user';
}

/**
 * Check if the currently authenticated Firebase user has the 'admin' role in Firestore.
 * @param {object} firebaseUser 
 * @returns {Promise<boolean>}
 */
export async function checkIsAdmin(firebaseUser) {
  if (!firebaseUser || !firebaseUser.uid) return false;
  const role = await getUserRole(firebaseUser.uid);
  return role === 'admin';
}

/**
 * Log out the current user and clear all local storage sessions.
 */
export async function logoutAdmin() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Firebase signOut error:", err);
  }

  localStorage.removeItem('ef_admin_token');
  localStorage.removeItem('ef_admin_user');
  localStorage.removeItem('ef_auth_token');
  localStorage.removeItem('ef_auth_user');
  localStorage.removeItem('ef_cart');
  localStorage.removeItem('ef_wishlist');
  localStorage.removeItem('ef_orders');
  localStorage.removeItem('ef_recently_viewed');
  localStorage.setItem('ef_logged_out', 'true');

  window.dispatchEvent(new CustomEvent('ef_logout'));
}

/**
 * Retrieve current admin user details if logged in.
 * @returns {object|null}
 */
export function getAdminSession() {
  const token = localStorage.getItem('ef_admin_token');
  const userJson = localStorage.getItem('ef_admin_user');
  
  if (!token || !userJson) {
    return null;
  }

  try {
    const user = JSON.parse(userJson);
    return user?.role === 'admin' ? user : null;
  } catch (e) {
    return null;
  }
}

/**
 * Check if an admin is currently logged in.
 * @returns {boolean}
 */
export function isAdminLoggedIn() {
  const session = getAdminSession();
  return !!session;
}
