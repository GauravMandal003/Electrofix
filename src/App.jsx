import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Import Page-level Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Shop from './components/Shop';
import SellUsed from './components/SellUsed';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import ProfilePage from './components/ProfilePage';
import AccountPage from './components/AccountPage';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import AdminDashboard from './components/AdminDashboard';

// Scroll Restoration helper for smooth navigation transitions
function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.preventScrollReset) {
      return;
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.state]);

  return null;
}

// Helper to check admin authorization
function checkUserIsAdmin() {
  const authUserStr = localStorage.getItem('ef_auth_user');
  if (authUserStr) {
    try {
      const user = JSON.parse(authUserStr);
      if (user.role === 'admin') return true;
    } catch (e) {}
  }
  return !!localStorage.getItem('ef_admin_token');
}

// Protected Route Guard
function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('ef_auth_token');
  if (!isLoggedIn) {
    const currentPath = window.location.pathname + window.location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }
  return children;
}

// Admin Route Guard
function AdminRoute({ children }) {
  const isAdmin = checkUserIsAdmin();
  if (!isAdmin) {
    const isLoggedIn = !!localStorage.getItem('ef_auth_token');
    return <Navigate to={isLoggedIn ? "/account" : "/login"} replace />;
  }
  return children;
}

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) {
    const isAdmin = checkUserIsAdmin();
    if (!isAdmin) {
      const isLoggedIn = !!localStorage.getItem('ef_auth_token');
      return <Navigate to={isLoggedIn ? "/account" : "/login"} replace />;
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased overflow-x-hidden selection:bg-blue-600/10 selection:text-blue-700 flex flex-col justify-between">
      
      {/* Sticky Header Navigation */}
      <Navbar />

      {/* Dynamic Route Switching */}
      <main className="flex-grow">
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Hero />} />

          {/* Dedicated Page Routes */}
          <Route path="/services" element={<Services />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/cart" element={<Shop />} />
          <Route path="/shop/orders" element={<Shop />} />
          <Route path="/shop/checkout" element={<Shop />} />
          <Route path="/shop/success" element={<Shop />} />
          <Route path="/shop/wishlist" element={<Shop />} />
          <Route path="/shop/login-required" element={<Shop />} />
          <Route path="/shop/products/:id" element={<Shop />} />
          <Route path="/products/:id" element={<Shop />} />
          <Route path="/sell-used" element={<SellUsed />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account/:tab" 
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Universal Footer */}
      {!isAdminPath && <Footer />}

      {/* Global Floating AI Customer Support Helpdesk */}
      {!isAdminPath && <ChatWidget />}

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
