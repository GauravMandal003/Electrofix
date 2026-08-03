// SellUsed.jsx - Redesigned Customer-First Used Appliance & Electronics Marketplace
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, IndianRupee, RefreshCw, Upload, FileText, CheckCircle2, 
  Trash2, Plus, MessageSquare, ShieldCheck, ArrowRight, Info, 
  AlertTriangle, AlertCircle, Eye, Send, Check, X, Edit3, MapPin, Phone, 
  User, Tag, Award, ShieldAlert, Calendar, Clock, Heart, List, 
  Settings, ChevronRight, ChevronLeft, Lock, Camera, Wallet, 
  ChevronDown, Search, CheckCircle, Smartphone, Tv, Laptop, 
  Monitor, Flame, Droplet, ChefHat, Cpu, Wind, Box, HelpCircle,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { INDIA_STATES_AND_CITIES, INDIAN_STATES_LIST } from '../../data/indiaData';

// Fallback images map in case of network errors or deleted Unsplash photos
const FALLBACK_IMAGES = {
  'Refrigerator': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80',
  'Washing Machine': 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=500&q=80',
  'Air Conditioner': 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=500&q=80',
  'Television': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=500&q=80',
  'Microwave': 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=500&q=80',
  'Laptop': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=500&q=80',
  'Desktop': 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=500&q=80',
  'Mobile': 'https://images.unsplash.com/photo-1551645121-d1034da75057?auto=format&fit=crop&w=500&q=80',
  'Water Purifier': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500&q=80',
  'Kitchen Appliances': 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=500&q=80',
  'Other Electronics': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=500&q=80',
  'default': 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=500&q=80'
};

// Popular Categories configuration with starting price estimates and mock hero imagery
const POPULAR_CATEGORIES = [
  { id: 'Refrigerator', name: 'Refrigerator', icon: 'Box', estimate: '₹150 - ₹450', img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=500&q=80' },
  { id: 'Washing Machine', name: 'Washing Machine', icon: 'RefreshCw', estimate: '₹120 - ₹350', img: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80' },
  { id: 'Air Conditioner', name: 'Air Conditioner', icon: 'Wind', estimate: '₹100 - ₹300', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80' },
  { id: 'Television', name: 'Television', icon: 'Tv', estimate: '₹80 - ₹400', img: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=500&q=80' },
  { id: 'Microwave', name: 'Microwave', icon: 'Flame', estimate: '₹40 - ₹150', img: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=500&q=80' },
  { id: 'Laptop', name: 'Laptop', icon: 'Laptop', estimate: '₹150 - ₹600', img: 'https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=500&q=80' },
  { id: 'Desktop', name: 'Desktop', icon: 'Monitor', estimate: '₹100 - ₹500', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80' },
  { id: 'Mobile', name: 'Mobile', icon: 'Smartphone', estimate: '₹80 - ₹450', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80' },
  { id: 'Water Purifier', name: 'Water Purifier', icon: 'Droplet', estimate: '₹50 - ₹180', img: 'https://images.unsplash.com/photo-1608541737042-87a12275d313?auto=format&fit=crop&w=500&q=80' },
  { id: 'Kitchen Appliances', name: 'Kitchen Appliances', icon: 'ChefHat', estimate: '₹30 - ₹150', img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=80' },
  { id: 'Other Electronics', name: 'Other Electronics', icon: 'Cpu', estimate: '₹20 - ₹250', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80' },
];

// Helper to render category icon
const getCategoryIcon = (iconName, className = "h-5 w-5") => {
  switch (iconName) {
    case 'Box': return <Box className={className} />;
    case 'RefreshCw': return <RefreshCw className={className} />;
    case 'Wind': return <Wind className={className} />;
    case 'Tv': return <Tv className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Laptop': return <Laptop className={className} />;
    case 'Monitor': return <Monitor className={className} />;
    case 'Smartphone': return <Smartphone className={className} />;
    case 'Droplet': return <Droplet className={className} />;
    case 'ChefHat': return <ChefHat className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    default: return <Cpu className={className} />;
  }
};

// Suggested Price Calculation helper
const calculateSuggestedPrice = (category, condition, age) => {
  let basePrice = 300;
  if (category === 'Refrigerator') basePrice = 450;
  else if (category === 'Washing Machine') basePrice = 350;
  else if (category === 'Air Conditioner') basePrice = 300;
  else if (category === 'Television') basePrice = 350;
  else if (category === 'Microwave') basePrice = 120;
  else if (category === 'Laptop') basePrice = 550;
  else if (category === 'Desktop') basePrice = 450;
  else if (category === 'Mobile') basePrice = 350;
  else if (category === 'Water Purifier') basePrice = 150;
  else if (category === 'Kitchen Appliances') basePrice = 100;
  else basePrice = 150;

  // Age multiplier
  let ageMult = 0.7;
  if (age === '< 1 Year') ageMult = 0.9;
  else if (age === '1-3 Years') ageMult = 0.7;
  else if (age === '4-6 Years') ageMult = 0.5;
  else ageMult = 0.3;

  // Condition multiplier
  let condMult = 1.0;
  if (condition === 'Like New') condMult = 1.25;
  else if (condition === 'Excellent') condMult = 1.1;
  else if (condition === 'Good') condMult = 0.9;
  else if (condition === 'Fair') condMult = 0.75;
  else condMult = 0.4; // Needs Repair

  const mid = Math.round(basePrice * ageMult * condMult);
  const min = Math.round(mid * 0.85);
  const max = Math.round(mid * 1.15);

  return { min: Math.max(15, min), max: Math.max(30, max) };
};

export default function SellUsed() {
  const navigate = useNavigate();
  const location = useLocation();

  // Main view state: 'landing' | 'wizard' | 'hub'
  const [activeView, setActiveView] = useState('landing');
  
  // Hub specific sub-tabs: 'listings' | 'offers' | 'pickup' | 'payments' | 'saved' | 'settings'
  const [hubTab, setHubTab] = useState('listings');

  // Customer Profile Defaults
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    upiId: '',
    bankAccount: '',
    notificationEmail: true,
    notificationSms: true
  });

  // Load user profile and restore drafts on mount
  useEffect(() => {
    const userStr = localStorage.getItem('ef_auth_user');
    const savedAddrStr = localStorage.getItem('ef_saved_address');
    let savedAddr = null;
    if (savedAddrStr) {
      try { savedAddr = JSON.parse(savedAddrStr); } catch (e) {}
    }
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setProfile(prev => ({
          ...prev,
          name: u.name || u.fullname || '',
          email: u.email || '',
          phone: savedAddr?.phone || u.phone || '',
          address: savedAddr?.address || u.address || '',
          city: savedAddr?.city || u.city || '',
          state: savedAddr?.state || u.state || '',
          zipcode: savedAddr?.zip || savedAddr?.zipcode || u.zip || u.zipcode || ''
        }));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Restore pending listing after login
  useEffect(() => {
    const pendingStr = localStorage.getItem('ef_pending_sell');
    const token = localStorage.getItem('ef_auth_token');
    if (pendingStr && token) {
      try {
        const data = JSON.parse(pendingStr);
        setFormCategory(data.formCategory || '');
        setFormBrand(data.formBrand || '');
        setFormModel(data.formModel || '');
        setFormAge(data.formAge || '1-3 Years');
        setFormCondition(data.formCondition || 'Good');
        setFormDescription(data.formDescription || '');
        setFormImages(data.formImages || []);
        setFormAccessories(data.formAccessories || []);
        setFormExpectedPrice(data.formExpectedPrice || '');
        setFormAddress(data.formAddress || '');
        setFormCity(data.formCity || '');
        setFormState(data.formState || '');
        setFormZipcode(data.formZipcode || '');
        setFormPhone(data.formPhone || '');
        setFormPickupDate(data.formPickupDate || '');
        setFormPickupTimeSlot(data.formPickupTimeSlot || 'Afternoon 12 PM - 4 PM');
        
        setActiveView('wizard');
        setWizardStep(3); // Go to review step
        localStorage.removeItem('ef_pending_sell');
        showToast("Welcome back! Your draft listing has been restored.", "success");
      } catch (err) {
        console.error(err);
      }
    }
  }, [location]);

  // Saved Listings state
  const [savedListings, setSavedListings] = useState([
    { id: 'fav-1', title: 'Carrier 1.5 Ton 5 Star Split AC', price: 340, seller: 'Mark V.', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=150&q=80' },
    { id: 'fav-2', title: 'Sony Bravia 55 inch OLED TV', price: 620, seller: 'Jessica T.', img: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=150&q=80' }
  ]);

  // Pickup Schedule state
  const [pickupSchedule, setPickupSchedule] = useState([
    {
      id: 'pck-101',
      listingTitle: 'Samsung Front Load Washing Machine',
      date: '2026-07-06',
      timeSlot: 'Afternoon 12 PM - 4 PM',
      technician: 'Marcus Carter',
      phone: '555-8930',
      status: 'Confirmed'
    }
  ]);

  // Payment History state
  const [paymentHistory, setPaymentHistory] = useState([
    { id: 'pay-201', listingTitle: 'Bosch 800 Series Silent Dishwasher', amount: 510, date: '2026-06-28', method: 'Direct Bank Transfer', status: 'Cleared' },
    { id: 'pay-202', listingTitle: 'Whirlpool French Door Refrigerator', amount: 390, date: '2026-07-02', method: 'UPI Instant Payout', status: 'Processing' }
  ]);

  // Initial Customer Listings from Firestore usedProducts collection
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'usedProducts'));
        const list = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setListings(list);
      } catch (err) {
        console.error("Failed to fetch used listings from Firestore:", err);
      } finally {
        setListingsLoading(false);
      }
    };
    fetchListings();
  }, []);

  // Interactive Buyer Offers & Chat State
  const [offers, setOffers] = useState([
    {
      id: 'off-201',
      listingId: 'lst-101',
      listingTitle: 'Whirlpool French Door Refrigerator',
      buyerName: 'David K.',
      buyerRating: 4.8,
      offeredAmount: 390,
      originalPrice: 420,
      status: 'Pending', // Pending, Accepted, Rejected, Countered
      chatHistory: [
        { sender: 'buyer', text: 'Hi Alex, I can pick this up tomorrow evening. Would you take ₹390 for it?', time: '10:15 AM' }
      ]
    },
    {
      id: 'off-202',
      listingId: 'lst-101',
      listingTitle: 'Whirlpool French Door Refrigerator',
      buyerName: 'Sarah Jenkins',
      buyerRating: 4.9,
      offeredAmount: 375,
      originalPrice: 420,
      status: 'Pending',
      chatHistory: [
        { sender: 'buyer', text: 'Is the water filter still fresh? I am offering ₹375 cash today.', time: 'Yesterday' }
      ]
    },
    {
      id: 'off-203',
      listingId: 'lst-102',
      listingTitle: 'Samsung Front Load Washing Machine',
      buyerName: 'Marcus Broadus',
      buyerRating: 4.7,
      offeredAmount: 250,
      originalPrice: 280,
      status: 'Pending',
      chatHistory: [
        { sender: 'buyer', text: 'Hey there. I saw this is pending technician verification. Would you take ₹250 if I self-verify during pick up?', time: '2 hours ago' }
      ]
    }
  ]);

  // Selected Offer / Chat Session in Customer Hub
  const [selectedOfferId, setSelectedOfferId] = useState('off-201');
  const [chatInput, setChatInput] = useState('');
  const [counterPrice, setCounterPrice] = useState('');

  // Active Offer Details helper
  const activeOffer = offers.find(o => o.id === selectedOfferId);

  // Form Wizard states
  const [wizardStep, setWizardStep] = useState(0);
  const [editingListingId, setEditingListingId] = useState(null);

  // Form fields state
  const [formCategory, setFormCategory] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formAge, setFormAge] = useState('1-3 Years');
  const [formCondition, setFormCondition] = useState('Good');
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState([]);
  const [formAccessories, setFormAccessories] = useState([]);
  const [formExpectedPrice, setFormExpectedPrice] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formZipcode, setFormZipcode] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPickupDate, setFormPickupDate] = useState('');
  const [formPickupTimeSlot, setFormPickupTimeSlot] = useState('12:00 PM – 3:00 PM');

  // Inline errors for Step 6 Pickup Address form
  const [pickupFieldErrors, setPickupFieldErrors] = useState({});

  // State autocomplete dropdown state
  const [isPickupStateOpen, setIsPickupStateOpen] = useState(false);
  const [pickupStateHighlight, setPickupStateHighlight] = useState(0);
  const pickupStateRef = useRef(null);

  // City autocomplete dropdown state
  const [isPickupCityOpen, setIsPickupCityOpen] = useState(false);
  const [pickupCityHighlight, setPickupCityHighlight] = useState(0);
  const pickupCityRef = useRef(null);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickupStateRef.current && !pickupStateRef.current.contains(event.target)) {
        setIsPickupStateOpen(false);
      }
      if (pickupCityRef.current && !pickupCityRef.current.contains(event.target)) {
        setIsPickupCityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter states
  const filteredPickupStates = INDIAN_STATES_LIST.filter(s =>
    s.toLowerCase().includes(formState.toLowerCase())
  );

  const handlePickupStateSelect = (selectedState) => {
    setFormState(selectedState);
    setIsPickupStateOpen(false);
    setPickupStateHighlight(0);
    setPickupFieldErrors(prev => ({ ...prev, state: '' }));

    // Reset city if current city is not in selected state's cities
    const citiesInState = INDIA_STATES_AND_CITIES[selectedState] || [];
    if (formCity && !citiesInState.some(c => c.toLowerCase() === formCity.toLowerCase())) {
      setFormCity('');
    }
  };

  const handlePickupStateKeyDown = (e) => {
    if (!isPickupStateOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsPickupStateOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPickupStateHighlight(prev => (prev + 1) % (filteredPickupStates.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPickupStateHighlight(prev => (prev - 1 + (filteredPickupStates.length || 1)) % (filteredPickupStates.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPickupStates.length > 0 && filteredPickupStates[pickupStateHighlight]) {
        handlePickupStateSelect(filteredPickupStates[pickupStateHighlight]);
      }
    } else if (e.key === 'Escape') {
      setIsPickupStateOpen(false);
    }
  };

  // Filter cities for selected state
  const availablePickupCities = formState && INDIA_STATES_AND_CITIES[formState]
    ? INDIA_STATES_AND_CITIES[formState]
    : [];

  const filteredPickupCities = availablePickupCities.filter(c =>
    c.toLowerCase().includes(formCity.toLowerCase())
  );

  const handlePickupCitySelect = (selectedCity) => {
    setFormCity(selectedCity);
    setIsPickupCityOpen(false);
    setPickupCityHighlight(0);
    setPickupFieldErrors(prev => ({ ...prev, city: '' }));
  };

  const handlePickupCityKeyDown = (e) => {
    if (!isPickupCityOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsPickupCityOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPickupCityHighlight(prev => (prev + 1) % (filteredPickupCities.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPickupCityHighlight(prev => (prev - 1 + (filteredPickupCities.length || 1)) % (filteredPickupCities.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPickupCities.length > 0 && filteredPickupCities[pickupCityHighlight]) {
        handlePickupCitySelect(filteredPickupCities[pickupCityHighlight]);
      }
    } else if (e.key === 'Escape') {
      setIsPickupCityOpen(false);
    }
  };

  // Phone input handler (10 digits numeric, starts with 6,7,8,9)
  const handlePickupPhoneChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormPhone(rawDigits);

    if (rawDigits.length > 0) {
      if (!/^[6-9]/.test(rawDigits)) {
        setPickupFieldErrors(prev => ({
          ...prev,
          phone: "Phone number must start with 6, 7, 8, or 9"
        }));
      } else if (rawDigits.length < 10) {
        setPickupFieldErrors(prev => ({
          ...prev,
          phone: "Phone number must be exactly 10 digits"
        }));
      } else {
        setPickupFieldErrors(prev => ({ ...prev, phone: "" }));
      }
    } else {
      setPickupFieldErrors(prev => ({ ...prev, phone: "Phone number is required" }));
    }
  };

  // PIN Code input handler (6 digits numeric)
  const handlePickupZipcodeChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormZipcode(rawDigits);

    if (rawDigits.length > 0 && rawDigits.length < 6) {
      setPickupFieldErrors(prev => ({
        ...prev,
        zipcode: "PIN Code must be exactly 6 digits"
      }));
    } else {
      setPickupFieldErrors(prev => ({ ...prev, zipcode: "" }));
    }
  };

  // Step 6 full validation helper
  const validatePickupStep = () => {
    const newErrors = {};
    const trimmedAddress = formAddress.trim();
    const trimmedState = formState.trim();
    const trimmedCity = formCity.trim();
    const trimmedZip = formZipcode.trim();
    const trimmedPhone = formPhone.trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, '');
    const zipDigits = trimmedZip.replace(/\D/g, '');
    const trimmedDate = formPickupDate.trim();
    const trimmedSlot = formPickupTimeSlot.trim();

    if (!trimmedAddress) {
      newErrors.address = "Street address is required";
    }

    if (!trimmedState) {
      newErrors.state = "Please select a State from suggestions";
    } else if (!INDIAN_STATES_LIST.some(s => s.toLowerCase() === trimmedState.toLowerCase())) {
      newErrors.state = "Please select a valid Indian state from suggestions";
    }

    if (!trimmedCity) {
      newErrors.city = "Please select or type a City";
    }

    if (!trimmedZip) {
      newErrors.zipcode = "PIN Code is required";
    } else if (zipDigits.length !== 6) {
      newErrors.zipcode = "PIN Code must be exactly 6 digits";
    }

    if (!trimmedPhone) {
      newErrors.phone = "Phone number is required";
    } else if (phoneDigits.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    } else if (!/^[6-9]/.test(phoneDigits)) {
      newErrors.phone = "Indian mobile numbers must start with 6, 7, 8, or 9";
    }

    if (!trimmedDate) {
      newErrors.date = "Preferred pickup date is required";
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      if (trimmedDate < todayStr) {
        newErrors.date = "Pickup date cannot be in the past";
      }
    }

    if (!trimmedSlot) {
      newErrors.timeSlot = "Please select a preferred time slot";
    }

    setPickupFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStep6Valid = formAddress.trim() !== '' &&
    INDIAN_STATES_LIST.some(s => s.toLowerCase() === formState.trim().toLowerCase()) &&
    formCity.trim() !== '' &&
    formZipcode.replace(/\D/g, '').length === 6 &&
    formPhone.replace(/\D/g, '').length === 10 &&
    /^[6-9]/.test(formPhone.replace(/\D/g, '')) &&
    formPickupDate.trim() !== '' &&
    formPickupDate.trim() >= new Date().toISOString().split('T')[0] &&
    formPickupTimeSlot.trim() !== '';

  // Interactive visual states
  const [dragActive, setDragActive] = useState(false);
  const [viewDetailsListing, setViewDetailsListing] = useState(null);
  const [toast, setToast] = useState(null);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Show customized toasts
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Scroll to top on navigation changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView, wizardStep, hubTab]);

  // Handle Drag & Drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const processMockFiles = (files) => {
    if (!files || files.length === 0) return;
    setIsPhotoUploading(true);
    
    // Simulate high-fidelity upload delay
    setTimeout(() => {
      const newImages = [...formImages];
      for (let i = 0; i < Math.min(files.length, 10 - formImages.length); i++) {
        const file = files[i];
        const randomUnsplash = [
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=400&q=80'
        ][Math.floor(Math.random() * 3)];
        
        newImages.push(URL.createObjectURL(file) || randomUnsplash);
      }
      setFormImages(newImages);
      setIsPhotoUploading(false);
      showToast("Photos uploaded successfully!");
    }, 1200);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      processMockFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      processMockFiles(e.target.files);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Camera Upload Simulator
  const handleCameraUploadSim = () => {
    setIsPhotoUploading(true);
    setTimeout(() => {
      const mockCameras = [
        'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1585837575652-267c0ee123e7?auto=format&fit=crop&w=400&q=80'
      ];
      const randomCamPic = mockCameras[Math.floor(Math.random() * mockCameras.length)];
      setFormImages(prev => [...prev, randomCamPic]);
      setIsPhotoUploading(false);
      showToast("Live photo captured and uploaded successfully!");
    }, 1000);
  };

  // Remove photo from listing form
  const removePhoto = (index) => {
    setFormImages(prev => prev.filter((_, idx) => idx !== index));
    showToast("Photo removed.");
  };

  // Accessories Checklist toggler
  const toggleAccessory = (accName) => {
    setFormAccessories(prev => 
      prev.includes(accName) 
        ? prev.filter(a => a !== accName) 
        : [...prev, accName]
    );
  };

  // Price suggestion calculations dynamically based on inputs
  const currentSuggestedPrice = formCategory 
    ? calculateSuggestedPrice(formCategory, formCondition, formAge) 
    : { min: 50, max: 250 };

  // Setup form fields for listing creation
  const handleStartSelling = (category = '') => {
    setEditingListingId(null);
    setFormCategory(category || 'Refrigerator');
    setFormBrand('');
    setFormModel('');
    setFormAge('1-3 Years');
    setFormCondition('Good');
    setFormDescription('');
    setFormImages([]);
    setFormAccessories([]);
    setFormExpectedPrice('');
    setFormAddress(profile.address || '');
    setFormCity(profile.city || '');
    setFormState(profile.state || '');
    setFormZipcode(profile.zipcode || '');
    setFormPhone(profile.phone || '');
    setFormPickupDate('');
    setFormPickupTimeSlot('12:00 PM – 3:00 PM');
    setPickupFieldErrors({});
    
    setWizardStep(category ? 1 : 0); // Skip category choosing if selected from home
    setActiveView('wizard');
  };

  // Setup form fields for editing existing listing
  const handleEditListing = (lst) => {
    setEditingListingId(lst.id);
    setFormCategory(lst.category);
    setFormBrand(lst.brand);
    setFormModel(lst.model);
    setFormAge(lst.age);
    setFormCondition(lst.condition);
    setFormDescription(lst.description);
    setFormImages(lst.images);
    setFormAccessories(lst.accessories || []);
    setFormExpectedPrice(lst.expectedPrice.toString());
    setFormAddress(lst.address || profile.address || '');
    setFormCity(lst.city || profile.city || '');
    setFormState(lst.state || profile.state || '');
    setFormZipcode(lst.zipcode || profile.zipcode || '');
    setFormPhone(lst.phone || profile.phone || '');
    setFormPickupDate(lst.pickupDate || '');
    setFormPickupTimeSlot(lst.pickupTimeSlot || '12:00 PM – 3:00 PM');
    setPickupFieldErrors({});
    
    setWizardStep(1); // Go to Specs step
    setActiveView('wizard');
  };

  // Delete listing handler
  const handleDeleteListing = (id) => {
    if (confirm("Are you sure you want to permanently delete this listing? This action cannot be undone.")) {
      setListings(prev => prev.filter(l => l.id !== id));
      setOffers(prev => prev.filter(o => o.listingId !== id));
      showToast("Listing deleted successfully.", "success");
    }
  };

  // Mark listing as Sold handler
  const handleMarkAsSold = (id) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'Sold' } : l));
    // Append to payment history
    const target = listings.find(l => l.id === id);
    if (target) {
      const newPay = {
        id: `pay-${Date.now()}`,
        listingTitle: target.title,
        amount: target.expectedPrice,
        date: new Date().toISOString().split('T')[0],
        method: 'UPI Instant Payout',
        status: 'Processing'
      };
      setPaymentHistory(prev => [newPay, ...prev]);
    }
    showToast("Congratulations! Your appliance has been marked as Sold.", "success");
  };

  // Submit/Publish Finalized Listing
  const handlePublishListing = () => {
    const isLoggedIn = !!localStorage.getItem('ef_auth_token');
    if (!isLoggedIn) {
      const pendingData = {
        formCategory, formBrand, formModel, formAge, formCondition, formDescription,
        formImages, formAccessories, formExpectedPrice, formAddress, formCity,
        formState, formZipcode, formPhone, formPickupDate, formPickupTimeSlot
      };
      localStorage.setItem('ef_pending_sell', JSON.stringify(pendingData));
      navigate(`/login?redirect=/sell-used`);
      return;
    }

    if (!formBrand || !formModel || !formExpectedPrice || !formAddress || !formPhone || !formPickupDate) {
      alert("Please ensure all fields are correctly populated before publishing.");
      return;
    }

    const priceNum = parseFloat(formExpectedPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid positive expected price.");
      return;
    }

    const defaultImg = formImages.length > 0 
      ? formImages[0] 
      : 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80';

    if (editingListingId) {
      // Edit mode
      const updatedListing = {
        id: editingListingId,
        title: `${formBrand} ${formModel} (${formCategory})`,
        category: formCategory,
        brand: formBrand,
        model: formModel,
        age: formAge,
        condition: formCondition,
        description: formDescription,
        images: formImages.length > 0 ? formImages : [defaultImg],
        accessories: formAccessories,
        expectedPrice: priceNum,
        address: formAddress,
        city: formCity,
        state: formState,
        zipcode: formZipcode,
        phone: formPhone,
        pickupDate: formPickupDate,
        pickupTimeSlot: formPickupTimeSlot,
        status: 'Pending Inspection' // Reset to verification after update
      };

      setListings(prev => prev.map(l => l.id === editingListingId ? updatedListing : l));

      // Update in Firestore
      setDoc(doc(db, 'usedProducts', editingListingId), updatedListing)
        .then(() => {
          console.log(`[Firestore Success] Updated used product listing: ${editingListingId}`);
        })
        .catch(err => {
          console.error(`[Firestore Error] Failed to update used product listing ${editingListingId}:`, err);
        });

      showToast("Listing updated successfully!");
    } else {
      // Create mode
      const newId = `lst-${Date.now()}`;
      const newListing = {
        id: newId,
        title: `${formBrand} ${formModel} (${formCategory})`,
        category: formCategory,
        brand: formBrand,
        model: formModel,
        age: formAge,
        condition: formCondition,
        description: formDescription,
        images: formImages.length > 0 ? formImages : [defaultImg],
        accessories: formAccessories,
        expectedPrice: priceNum,
        address: formAddress,
        city: formCity,
        state: formState,
        zipcode: formZipcode,
        phone: formPhone,
        pickupDate: formPickupDate,
        pickupTimeSlot: formPickupTimeSlot,
        status: 'Pending Inspection'
      };

      // Also create a simulated pickup schedule
      const newSchedule = {
        id: `pck-${Date.now()}`,
        listingTitle: newListing.title,
        date: formPickupDate,
        timeSlot: formPickupTimeSlot,
        technician: 'Robert Downey',
        phone: '555-2391',
        status: 'Confirmed'
      };

      setListings(prev => [newListing, ...prev]);
      setPickupSchedule(prev => [newSchedule, ...prev]);

      // Write to Firestore
      setDoc(doc(db, 'usedProducts', newId), newListing)
        .then(() => {
          console.log(`[Firestore Success] Created used product listing: ${newId}`);
        })
        .catch(err => {
          console.error(`[Firestore Error] Failed to create used product listing ${newId}:`, err);
        });

      // Mock offer triggers shortly to make marketplace feel alive!
      setTimeout(() => {
        const mockOfferId = `off-${Date.now()}`;
        const newOffer = {
          id: mockOfferId,
          listingId: newId,
          listingTitle: newListing.title,
          buyerName: 'Sophia Vance',
          buyerRating: 4.9,
          offeredAmount: Math.round(priceNum * 0.9),
          originalPrice: priceNum,
          status: 'Pending',
          chatHistory: [
            { sender: 'buyer', text: `Hello! I noticed your listing for "${newListing.title}". I live nearby and can pick it up this weekend. Would you be willing to accept ₹${Math.round(priceNum * 0.9)}?`, time: 'Just now' }
          ]
        };
        setOffers(prev => [newOffer, ...prev]);
        setSelectedOfferId(mockOfferId);
      }, 5000);
    }

    // Advance to Success step
    setWizardStep(8);
  };

  // Chat message send simulation
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeOffer) return;

    const updatedOffers = offers.map(o => {
      if (o.id === selectedOfferId) {
        return {
          ...o,
          chatHistory: [...o.chatHistory, { sender: 'seller', text: chatInput, time: 'Just now' }]
        };
      }
      return o;
    });

    setOffers(updatedOffers);
    setChatInput('');

    // Trigger instant mock response from buyer to keep it highly interactive
    setTimeout(() => {
      setOffers(prev => prev.map(o => {
        if (o.id === selectedOfferId) {
          const possibleReplies = [
            "Sounds fair! When can I come over for the inspection and final hand-off?",
            "Can we meet in the middle? Let me know if that works for you.",
            "Great! I am ready to close this deal as soon as the technician verifies the item.",
            "Perfect. I'll arrange transport based on the technician's scheduled slot."
          ];
          const randomReply = possibleReplies[Math.floor(Math.random() * possibleReplies.length)];
          return {
            ...o,
            chatHistory: [...o.chatHistory, { sender: 'buyer', text: randomReply, time: 'Just now' }]
          };
        }
        return o;
      }));
    }, 2500);
  };

  // Handle offer accept/reject/counter actions
  const handleOfferAction = (action, val = null) => {
    if (!activeOffer) return;

    let newStatus = activeOffer.status;
    let text = '';

    if (action === 'accept') {
      newStatus = 'Accepted';
      text = `Offer accepted! Let's arrange pickup. I've accepted your deal for ₹${activeOffer.offeredAmount}.`;
      // Also update listing status to Sold
      handleMarkAsSold(activeOffer.listingId);
    } else if (action === 'reject') {
      newStatus = 'Rejected';
      text = `Thank you for your interest, but I cannot accept ₹${activeOffer.offeredAmount} at this time.`;
    } else if (action === 'counter') {
      const amt = parseFloat(counterPrice);
      if (isNaN(amt) || amt <= 0) {
        alert("Please enter a valid counter offer amount.");
        return;
      }
      newStatus = 'Countered';
      text = `I would like to propose a counter offer of ₹${amt}. Does this work for you?`;
    }

    setOffers(prev => prev.map(o => {
      if (o.id === selectedOfferId) {
        return {
          ...o,
          status: newStatus,
          offeredAmount: action === 'counter' ? parseFloat(counterPrice) : o.offeredAmount,
          chatHistory: [...o.chatHistory, { sender: 'seller', text: text, time: 'Just now' }]
        };
      }
      return o;
    }));

    if (action === 'counter') {
      setCounterPrice('');
    }
    showToast(`Offer successfully ${newStatus}!`);
  };

  // Update profile handler
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    showToast("Profile settings saved successfully!");
  };

  // Cancel scheduled pickup helper
  const handleCancelPickup = (id) => {
    if (confirm("Are you sure you want to cancel this technician inspection slot?")) {
      setPickupSchedule(prev => prev.filter(p => p.id !== id));
      showToast("Pickup schedule cancelled.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-4">
      
      {/* ----------------- TOAST HUD ----------------- */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[99999] pointer-events-none"
          >
            <div className="bg-slate-900 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-slate-800 pointer-events-auto max-w-sm">
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-100">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToast(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        {/* Navigation Bar inside Sell Portal */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 rounded-3xl p-4 mb-8 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-display font-extrabold text-lg">
              S
            </div>
            <div>
              <h1 className="font-display font-black text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                ElectroFix <span className="text-blue-600">Re-Commerce</span>
              </h1>
              <p className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-widest">Doorstep Used Appliance Trade-In</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveView('landing'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'landing' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Browse Portal
            </button>
            
            <button
              onClick={() => { handleStartSelling(); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'wizard' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              + Sell Now
            </button>

            <button
              onClick={() => { setActiveView('hub'); setHubTab('listings'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'hub' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Customer Hub
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 1. LANDING PORTAL VIEW                               */}
        {/* ---------------------------------------------------- */}
        {activeView === 'landing' && (
          <div className="space-y-12 animate-fade-in">
            
            {/* HERO BANNER */}
            <div className="relative rounded-[40px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-8 sm:p-16 overflow-hidden shadow-2xl border border-slate-800">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_50%)]" />
              <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
              
              <div className="max-w-3xl relative z-10 space-y-6 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 text-blue-400 animate-spin" />
                  <span>Guaranteed Highest Trade-In Values</span>
                </div>
                
                <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight leading-none">
                  Sell Your Used <br />
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                    Electronics Easily
                  </span>
                </h2>
                
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  Get the best price for your old appliances with free inspection and doorstep pickup. Instant payout is guaranteed upon technician verification.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start pt-2">
                  <button
                    onClick={() => handleStartSelling()}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Sell Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  
                  <a
                    href="#how-it-works"
                    className="px-8 py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold rounded-2xl transition-all text-xs uppercase tracking-wider text-center"
                  >
                    How It Works
                  </a>
                </div>
              </div>
            </div>

            {/* POPULAR CATEGORIES */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-display font-black text-xl text-slate-900">Choose Product Category</h3>
                  <p className="text-xs text-slate-500">Select your appliance to calculate instant valuation range</p>
                </div>
                <button 
                  onClick={() => handleStartSelling()} 
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>See All categories</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {POPULAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleStartSelling(cat.id)}
                    className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden text-left"
                  >
                    {/* Image at the top (exactly 180px) */}
                    <div className="h-[180px] w-full overflow-hidden relative bg-slate-100 rounded-t-2xl">
                      <img 
                        src={cat.img} 
                        alt={cat.name} 
                        className="h-[180px] w-full object-cover rounded-t-2xl group-hover:scale-110 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGES[cat.id] || FALLBACK_IMAGES['default'];
                        }}
                      />
                    </div>

                    {/* Category name & Estimated price below the image */}
                    <div className="p-4 flex flex-col gap-1 bg-white">
                      <h4 className="font-display font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors truncate">
                        {cat.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-extrabold font-mono uppercase">
                        Est. {cat.estimate}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* HOW IT WORKS SECTION */}
            <div id="how-it-works" className="bg-white border border-slate-200 rounded-[36px] p-8 sm:p-12 shadow-sm space-y-10 scroll-mt-20">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
                  Seamless Re-Commerce Process
                </span>
                <h3 className="font-display text-2xl font-black text-slate-900 tracking-tight">How ElectroFix Trade-In Works</h3>
                <p className="text-xs text-slate-500">Simple, transparent, and completely contactless with instant payment.</p>
              </div>

              {/* Progress Connector Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
                
                {/* Connector Line overlay on desktop */}
                <div className="absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-slate-100 hidden lg:block z-0" />

                {[
                  { step: "01", title: "Choose Product", desc: "Select category & fill specification forms", icon: <Search className="h-4 w-4" /> },
                  { step: "02", title: "Upload Photos", desc: "Add functional photos from different angles", icon: <Camera className="h-4 w-4" /> },
                  { step: "03", title: "Price Estimate", desc: "Dynamic data estimate calculates valuation", icon: <IndianRupee className="h-4 w-4" /> },
                  { step: "04", title: "Home Audit", desc: "Technician performs free doorstep functional audit", icon: <Wrench className="h-4 w-4" /> },
                  { step: "05", title: "Buyer Match", desc: "Instantly finalize price with verified local buyers", icon: <CheckCircle className="h-4 w-4" /> },
                  { step: "06", title: "Instant Payout", desc: "Doorstep pickup and cash directly transferred", icon: <Wallet className="h-4 w-4" /> }
                ].map((item, idx) => (
                  <div key={idx} className="relative z-10 text-center space-y-3 flex flex-col items-center group">
                    <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-200 group-hover:border-blue-500 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 flex items-center justify-center font-bold font-mono text-sm shadow-sm transition-all">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 font-mono">STEP {item.step}</p>
                      <h4 className="font-display font-extrabold text-slate-900 text-xs">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-normal max-w-[130px] mx-auto">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECURITY/MARKETPLACE ADVANTAGES BANNER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[32px] p-8 flex flex-col justify-between space-y-6 shadow-md">
                <div className="space-y-3">
                  <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-display font-black text-xl">Verified Trust Badges</h4>
                  <p className="text-xs text-blue-100 leading-relaxed max-w-sm">
                    All listed electronics undergo a certification audit. This protects you against fraudulent buyers and gets you up to 25% higher payouts compared to standard marketplaces.
                  </p>
                </div>
                <button 
                  onClick={() => handleStartSelling()}
                  className="self-start px-5 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-xs uppercase tracking-wider shadow hover:bg-blue-50"
                >
                  Start Listing
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-[32px] p-8 space-y-4 shadow-sm">
                <h4 className="font-display font-black text-lg text-slate-950 flex items-center gap-1.5">
                  <ShieldAlert className="h-5 w-5 text-emerald-500" />
                  Smart Anti-Fraud Marketplace
                </h4>
                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <p><strong>Secure Communications:</strong> No need to share personal numbers. Our in-app customer chat coordinates offers safely.</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <p><strong>Doorstep Free Inspection:</strong> Our expert technician arrives at your preferred schedule for direct hardware checks.</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <p><strong>Zero Hassle Payouts:</strong> Immediately clear payments to your bank account or UPI before our team leaves with the appliance.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 2. MULTI-STEP SELLING WIZARD                         */}
        {/* ---------------------------------------------------- */}
        {activeView === 'wizard' && (
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-[36px] shadow-sm overflow-hidden animate-fade-in relative">
            
            {/* Wizard Header Progress Bar */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-base">
                  {editingListingId ? 'Edit Appliance Listing' : 'List Your Used Electronics'}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest mt-0.5">
                  Step {wizardStep + 1} of 9: {
                    [
                      "Choose Product Category",
                      "Basic Specs",
                      "Upload Photos",
                      "Condition",
                      "Accessories",
                      "Price Valuation",
                      "Pickup Address",
                      "Review Details",
                      "Completed"
                    ][wizardStep]
                  }
                </p>
              </div>
              <button 
                onClick={() => {
                  if (confirm("Cancel listing wizard? All progress will be cleared.")) {
                    setActiveView('landing');
                  }
                }}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Visual Indicator Line */}
            <div className="w-full bg-slate-100 h-1">
              <div 
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${((wizardStep + 1) / 9) * 100}%` }}
              />
            </div>

            {/* STEP CONTENT CONTAINER */}
            <div className="p-8 sm:p-10 min-h-[380px]">
              
              {/* STEP 0: CHOOSE CATEGORY */}
              {wizardStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center max-w-md mx-auto space-y-2 mb-4">
                    <h4 className="font-display font-extrabold text-lg text-slate-900">Select Appliance Category</h4>
                    <p className="text-xs text-slate-500">Pick the category that matches your electronics device.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {POPULAR_CATEGORIES.map((cat) => {
                      const isSelected = formCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setFormCategory(cat.id);
                            setWizardStep(1);
                          }}
                          className={`group rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden text-left ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20' 
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {/* Image at the top (exactly 180px) */}
                          <div className="h-[180px] w-full overflow-hidden relative bg-slate-100 rounded-t-2xl">
                            <img 
                              src={cat.img} 
                              alt={cat.name} 
                              className="h-[180px] w-full object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = FALLBACK_IMAGES[cat.id] || FALLBACK_IMAGES['default'];
                              }}
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-sm z-10">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>

                          {/* Category name & estimated price below the image */}
                          <div className="p-4 flex flex-col gap-1 flex-grow">
                            <span className={`font-display font-extrabold text-xs truncate ${isSelected ? 'text-blue-600 font-black' : 'text-slate-900'}`}>
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-extrabold font-mono uppercase">
                              Est. {cat.estimate}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 1: PRODUCT DETAILS */}
              {wizardStep === 1 && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="text-center space-y-1">
                    <h4 className="font-display font-extrabold text-lg text-slate-900">Basic Information</h4>
                    <p className="text-xs text-slate-500">Enter your appliance brand, model, and functional age.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand Name *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Samsung, LG, Sony" 
                          value={formBrand} 
                          onChange={(e) => setFormBrand(e.target.value)}
                          className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model Number *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. RF28T5001SR" 
                          value={formModel} 
                          onChange={(e) => setFormModel(e.target.value)}
                          className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Category</label>
                        <select 
                          value={formCategory} 
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        >
                          {POPULAR_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Age *</label>
                        <select 
                          value={formAge} 
                          onChange={(e) => setFormAge(e.target.value)}
                          className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        >
                          <option value="< 1 Year">Less than 1 year</option>
                          <option value="1-3 Years">1 - 3 years</option>
                          <option value="4-6 Years">4 - 6 years</option>
                          <option value="6+ Years">6+ years</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Description *</label>
                      <textarea 
                        rows="4" 
                        placeholder="Mention condition, minor details, defects, why you are selling, etc..." 
                        value={formDescription} 
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: UPLOAD PHOTOS */}
              {wizardStep === 2 && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="text-center space-y-1">
                    <h4 className="font-display font-extrabold text-lg text-slate-900">Upload Photos</h4>
                    <p className="text-xs text-slate-500">Provide up to 10 clear photos from multiple angles of the appliance.</p>
                  </div>

                  {/* Drag & Drop Area */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                    className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                      dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect} 
                      className="hidden" 
                      multiple 
                      accept="image/*"
                    />
                    
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <Upload className="h-6 w-6 text-slate-500" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">Drag & Drop your photos here</p>
                      <p className="text-[10px] text-slate-400">or click to browse from gallery</p>
                    </div>
                  </div>

                  {/* Camera Simulator and constraints */}
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Info className="h-4 w-4 text-blue-500" />
                      <span>Max 10 photos. Supported JPG, PNG.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCameraUploadSim}
                      disabled={isPhotoUploading}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-800 disabled:opacity-50"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>{isPhotoUploading ? 'Processing...' : 'Simulate Camera'}</span>
                    </button>
                  </div>

                  {/* Previews */}
                  {formImages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uploaded Photos ({formImages.length})</p>
                      <div className="grid grid-cols-5 gap-3">
                        {formImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl border border-slate-150 overflow-hidden group">
                            <img
                              src={img}
                              alt="preview"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = FALLBACK_IMAGES[formCategory] || FALLBACK_IMAGES['default'];
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: CONDITION SELECTION */}
              {wizardStep === 3 && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="text-center space-y-1">
                    <h4 className="font-display font-extrabold text-lg text-slate-900">Select Condition</h4>
                    <p className="text-xs text-slate-500">Accurately select the functional/cosmetic state of your device.</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {[
                      { key: 'Like New', title: 'Like New', desc: 'No visible marks, original box and documentation included. Looks unused.' },
                      { key: 'Excellent', title: 'Excellent', desc: 'Minimal microscopic signs of wear. Fully functional with zero software or hardware faults.' },
                      { key: 'Good', title: 'Good', desc: 'Normal signs of cosmetic usage (very light scuffs). Fully operational.' },
                      { key: 'Fair', title: 'Fair', desc: 'Deep scratches, small dents or cosmetic scuffs but completely functional.' },
                      { key: 'Needs Repair', title: 'Needs Repair', desc: 'Has functional faults, broken parts, or requires repair/restoration.' }
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setFormCondition(item.key)}
                        className={`w-full p-4 rounded-2xl border text-left flex gap-3 transition-all cursor-pointer ${
                          formCondition === item.key 
                            ? 'border-blue-500 bg-blue-50/50 text-blue-600 ring-1 ring-blue-500' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          formCondition === item.key ? 'border-blue-600 bg-white text-blue-600' : 'border-slate-300 bg-white'
                        }`}>
                          {formCondition === item.key && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-950">{item.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: ACCESSORIES CHECKBOXES */}
              {wizardStep === 4 && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="text-center space-y-1">
                    <h4 className="font-display font-extrabold text-lg text-slate-900">Accessories Included</h4>
                    <p className="text-xs text-slate-500">Select any accessories or files that will accompany this appliance.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { key: 'Original Bill', label: 'Original Bill' },
                      { key: 'Warranty', label: 'Warranty Card (Active/Expired)' },
                      { key: 'Remote', label: 'Remote Control' },
                      { key: 'Box', label: 'Original Retail Packaging / Box' },
                      { key: 'Accessories Included', label: 'Standard Cables / Accessories Included' }
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => toggleAccessory(item.key)}
                        className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          formAccessories.includes(item.key) 
                            ? 'border-blue-500 bg-blue-50/30 text-blue-600 font-bold' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs text-slate-900">{item.label}</span>
                        <div className={`h-5 w-5 rounded-lg border flex items-center justify-center ${
                          formAccessories.includes(item.key) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                        }`}>
                          {formAccessories.includes(item.key) && <Check className="h-3 w-3" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: EXPECTED SELLING PRICE */}
              {wizardStep === 5 && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="text-center space-y-1">
                    <h4 className="font-display font-extrabold text-lg text-slate-900">Expected Selling Price</h4>
                    <p className="text-xs text-slate-500">Determine your selling target based on automatic market research estimates.</p>
                  </div>

                  {/* Estimation Indicator */}
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-3xl p-5 border border-blue-100 flex items-center gap-4">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                      <Sparkles className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dynamic Valuation Estimate</p>
                      <p className="text-sm font-extrabold text-slate-800">
                        Suggested Price: <span className="text-blue-600">₹{currentSuggestedPrice.min} - ₹{currentSuggestedPrice.max}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Calculated based on {formCategory}, {formCondition} condition, and {formAge} age.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">Your Expected Price (₹) *</label>
                    <div className="relative max-w-xs mx-auto">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-lg">₹</span>
                      <input 
                        type="number" 
                        placeholder="e.g. 290" 
                        value={formExpectedPrice} 
                        onChange={(e) => setFormExpectedPrice(e.target.value)}
                        className="w-full text-center text-lg font-bold font-mono px-8 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 text-center leading-normal max-w-xs mx-auto">
                      Pricing within the recommended suggestion increases matching chances with certified buyers by up to 85%.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 6: PICKUP ADDRESS */}
              {wizardStep === 6 && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="text-center space-y-1">
                    <h4 className="font-display font-extrabold text-lg text-slate-900">Pickup Address & Schedule</h4>
                    <p className="text-xs text-slate-500">Provide pickup details for our verification technician visit.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Full Street Address */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Street Address *</label>
                      <input 
                        type="text" 
                        placeholder="House No., Street, Locality, Landmark" 
                        value={formAddress} 
                        onChange={(e) => {
                          setFormAddress(e.target.value);
                          setPickupFieldErrors(prev => ({ ...prev, address: e.target.value.trim() ? '' : 'Street address is required' }));
                        }}
                        className={`w-full text-xs px-3.5 py-3 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-semibold ${
                          pickupFieldErrors.address ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                        }`}
                      />
                      {pickupFieldErrors.address && (
                        <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {pickupFieldErrors.address}
                        </p>
                      )}
                    </div>

                    {/* State & City & PIN Code Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* State Autocomplete */}
                      <div className="space-y-1 relative" ref={pickupStateRef}>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">State *</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Type or select State..." 
                            value={formState} 
                            onChange={(e) => {
                              setFormState(e.target.value);
                              setIsPickupStateOpen(true);
                              setPickupFieldErrors(prev => ({ ...prev, state: '' }));
                            }}
                            onFocus={() => setIsPickupStateOpen(true)}
                            onKeyDown={handlePickupStateKeyDown}
                            className={`w-full text-xs px-3.5 py-3 pr-8 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-semibold ${
                              pickupFieldErrors.state ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                            }`}
                          />
                          <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {isPickupStateOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto z-50 py-1">
                            {filteredPickupStates.length > 0 ? (
                              filteredPickupStates.map((st, idx) => (
                                <button
                                  key={st}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handlePickupStateSelect(st);
                                  }}
                                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                                    idx === pickupStateHighlight ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <span>{st}</span>
                                  {formState === st && <Check className="h-3.5 w-3.5 text-blue-600" />}
                                </button>
                              ))
                            ) : (
                              <div className="px-3.5 py-2 text-xs text-slate-400 font-medium">
                                No state matching "{formState}"
                              </div>
                            )}
                          </div>
                        )}

                        {pickupFieldErrors.state && (
                          <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {pickupFieldErrors.state}
                          </p>
                        )}
                      </div>

                      {/* City Autocomplete */}
                      <div className="space-y-1 relative" ref={pickupCityRef}>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">City *</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder={formState ? "Type or select City..." : "Select State first..."} 
                            value={formCity} 
                            onChange={(e) => {
                              setFormCity(e.target.value);
                              setIsPickupCityOpen(true);
                              setPickupFieldErrors(prev => ({ ...prev, city: '' }));
                            }}
                            onFocus={() => setIsPickupCityOpen(true)}
                            onKeyDown={handlePickupCityKeyDown}
                            className={`w-full text-xs px-3.5 py-3 pr-8 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-semibold ${
                              pickupFieldErrors.city ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                            }`}
                          />
                          <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {isPickupCityOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto z-50 py-1">
                            {!formState ? (
                              <div className="px-3.5 py-2 text-xs text-slate-400 font-medium">
                                Please select a State above first
                              </div>
                            ) : filteredPickupCities.length > 0 ? (
                              filteredPickupCities.map((ct, idx) => (
                                <button
                                  key={ct}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handlePickupCitySelect(ct);
                                  }}
                                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                                    idx === pickupCityHighlight ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <span>{ct}</span>
                                  {formCity === ct && <Check className="h-3.5 w-3.5 text-blue-600" />}
                                </button>
                              ))
                            ) : (
                              <div className="px-3.5 py-2 text-xs text-slate-400 font-medium">
                                No matching city in {formState}
                              </div>
                            )}
                          </div>
                        )}

                        {pickupFieldErrors.city && (
                          <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {pickupFieldErrors.city}
                          </p>
                        )}
                      </div>

                      {/* PIN Code */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PIN Code (6 Digits) *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 400001" 
                          maxLength={6}
                          value={formZipcode} 
                          onChange={handlePickupZipcodeChange}
                          className={`w-full text-xs px-3.5 py-3 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-mono font-semibold ${
                            pickupFieldErrors.zipcode ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                          }`}
                        />
                        {pickupFieldErrors.zipcode && (
                          <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {pickupFieldErrors.zipcode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone and Preferred Date Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Contact Phone */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone (10 Digits) *</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-xs font-extrabold text-slate-500 select-none">+91</span>
                          <input 
                            type="tel" 
                            placeholder="9876543210" 
                            maxLength={10}
                            value={formPhone} 
                            onChange={handlePickupPhoneChange}
                            className={`w-full text-xs pl-12 pr-3.5 py-3 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-semibold font-mono ${
                              pickupFieldErrors.phone ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                            }`}
                          />
                        </div>
                        {pickupFieldErrors.phone ? (
                          <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {pickupFieldErrors.phone}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 font-medium">Must be 10 digits starting with 6, 7, 8, or 9</p>
                        )}
                      </div>

                      {/* Preferred Date */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Date *</label>
                        <input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          value={formPickupDate} 
                          onChange={(e) => {
                            setFormPickupDate(e.target.value);
                            setPickupFieldErrors(prev => ({ ...prev, date: '' }));
                          }}
                          className={`w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-semibold ${
                            pickupFieldErrors.date ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                          }`}
                        />
                        {pickupFieldErrors.date && (
                          <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {pickupFieldErrors.date}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Preferred Time Slot */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Time Slot *</label>
                      <select 
                        value={formPickupTimeSlot} 
                        onChange={(e) => {
                          setFormPickupTimeSlot(e.target.value);
                          setPickupFieldErrors(prev => ({ ...prev, timeSlot: '' }));
                        }}
                        className={`w-full text-xs px-3.5 py-3 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-semibold ${
                          pickupFieldErrors.timeSlot ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                        }`}
                      >
                        <option value="9:00 AM – 12:00 PM">9:00 AM – 12:00 PM</option>
                        <option value="12:00 PM – 3:00 PM">12:00 PM – 3:00 PM</option>
                        <option value="3:00 PM – 6:00 PM">3:00 PM – 6:00 PM</option>
                        <option value="6:00 PM – 8:00 PM">6:00 PM – 8:00 PM</option>
                      </select>
                      {pickupFieldErrors.timeSlot && (
                        <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {pickupFieldErrors.timeSlot}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: REVIEW DETAILS */}
              {wizardStep === 7 && (
                <div className="space-y-6">
                  <div className="text-center max-w-md mx-auto space-y-1">
                    <h4 className="font-display font-extrabold text-lg text-slate-900">Review Listing</h4>
                    <p className="text-xs text-slate-500">Double check specifications prior to publishing on marketplace.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* Left preview card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                      <div className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 relative">
                        <img 
                          src={formImages[0] || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'} 
                          alt="primary preview" 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FALLBACK_IMAGES[formCategory] || FALLBACK_IMAGES['default'];
                          }}
                        />
                        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur text-white rounded-lg px-2 py-1 text-[9px] font-mono font-bold">
                          Primary Photo
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">{formCategory}</span>
                        <h5 className="font-display font-extrabold text-sm text-slate-950 truncate">
                          {formBrand} {formModel}
                        </h5>
                        <p className="text-xs text-slate-500 line-clamp-3">{formDescription || 'No description provided.'}</p>
                      </div>
                    </div>

                    {/* Right details checklist */}
                    <div className="space-y-4">
                      
                      {/* Specs */}
                      <div className="border border-slate-150 rounded-2xl p-4 space-y-3 relative">
                        <div className="flex justify-between items-center">
                          <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specifications</h6>
                          <button type="button" onClick={() => setWizardStep(1)} className="text-[10px] font-bold text-blue-600 hover:underline">Edit</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400">Condition:</span>
                            <span className="font-semibold text-slate-800 ml-1">{formCondition}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Age:</span>
                            <span className="font-semibold text-slate-800 ml-1">{formAge}</span>
                          </div>
                        </div>
                        {formAccessories.length > 0 && (
                          <div className="pt-1.5 border-t border-slate-100">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Included Accessories</span>
                            <div className="flex flex-wrap gap-1">
                              {formAccessories.map(a => (
                                <span key={a} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[9px] font-medium">{a}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="border border-slate-150 rounded-2xl p-4 space-y-2 relative">
                        <div className="flex justify-between items-center">
                          <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pricing Target</h6>
                          <button type="button" onClick={() => setWizardStep(5)} className="text-[10px] font-bold text-blue-600 hover:underline">Edit</button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">Your Expected Price:</span>
                          <span className="text-lg font-mono font-extrabold text-emerald-600">₹{formExpectedPrice}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 italic">
                          Suggested estimation range was ₹{currentSuggestedPrice.min} - ₹{currentSuggestedPrice.max}
                        </div>
                      </div>

                      {/* Pickup details */}
                      <div className="border border-slate-150 rounded-2xl p-4 space-y-2 relative">
                        <div className="flex justify-between items-center">
                          <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Technician Inspection</h6>
                          <button type="button" onClick={() => setWizardStep(6)} className="text-[10px] font-bold text-blue-600 hover:underline">Edit</button>
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="text-slate-700 truncate"><span className="text-slate-400">Address:</span> {formAddress}, {formCity}</p>
                          <p className="text-slate-700"><span className="text-slate-400">Schedule:</span> {formPickupDate} ({formPickupTimeSlot})</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: SUCCESS SCREEN */}
              {wizardStep === 8 && (
                <div className="py-8 text-center space-y-6 animate-fade-in max-w-md mx-auto">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 shadow-md">
                    <Check className="h-8 w-8 animate-bounce" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-display font-black text-2xl text-slate-950">Listing Published Successfully!</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Our verification team has received your submission. A technician will contact you to perform the physical verification on <strong className="text-slate-800">{formPickupDate}</strong>.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setHubTab('listings');
                        setActiveView('hub');
                      }}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all"
                    >
                      View My Listings
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleStartSelling()}
                      className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all"
                    >
                      Sell Another Item
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setActiveView('landing')}
                      className="w-full py-3 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* WIZARD ACTIONS FOOTER */}
            {wizardStep < 8 && (
              <div className="bg-slate-50 px-8 py-5 border-t border-slate-150 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (wizardStep === 0) {
                      setActiveView('landing');
                    } else {
                      setWizardStep(prev => prev - 1);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                {wizardStep < 7 ? (
                  <button
                    type="button"
                    onClick={() => {
                      // Inline validation
                      if (wizardStep === 0 && !formCategory) {
                        alert("Please select a category first.");
                        return;
                      }
                      if (wizardStep === 1 && (!formBrand || !formModel || !formDescription)) {
                        alert("Please fill in the Brand, Model, and Description.");
                        return;
                      }
                      if (wizardStep === 5 && (!formExpectedPrice || parseFloat(formExpectedPrice) <= 0)) {
                        alert("Please enter a valid expected selling price.");
                        return;
                      }
                      if (wizardStep === 6) {
                        if (!validatePickupStep()) {
                          return;
                        }
                      }
                      setWizardStep(prev => prev + 1);
                    }}
                    disabled={wizardStep === 6 && !isStep6Valid}
                    className={`px-6 py-2.5 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                      wizardStep === 6 && !isStep6Valid
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    <span>Continue</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublishListing}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Publish Listing</span>
                  </button>
                )}
              </div>
            )}

            {/* Sticky publish footer bar on mobile review step */}
            {wizardStep === 7 && (
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50">
                <button
                  type="button"
                  onClick={handlePublishListing}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock className="h-4 w-4" />
                  <span>Publish Listing</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 3. CUSTOMER HUB / USER PROFILE VIEW                  */}
        {/* ---------------------------------------------------- */}
        {activeView === 'hub' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in">
            
            {/* Hub Left Sidebar Navigation */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 space-y-6 shadow-sm self-start">
              
              {/* Profile Card Header */}
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                <div className="h-12 w-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold font-display text-lg">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-slate-900">{profile.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{profile.email}</p>
                </div>
              </div>

              {/* Navigation Sub-Tabs */}
              <div className="space-y-1">
                {[
                  { id: 'listings', label: 'My Listings', icon: <Tag className="h-4 w-4" /> },
                  { id: 'offers', label: 'Offers Received', icon: <MessageSquare className="h-4 w-4" />, badge: offers.filter(o => o.status === 'Pending').length },
                  { id: 'pickup', label: 'Pickup Schedule', icon: <Calendar className="h-4 w-4" />, badge: pickupSchedule.filter(p => p.status === 'Confirmed').length },
                  { id: 'payments', label: 'Payment History', icon: <Wallet className="h-4 w-4" /> },
                  { id: 'saved', label: 'Saved Listings', icon: <Heart className="h-4 w-4" /> },
                  { id: 'settings', label: 'Hub Settings', icon: <Settings className="h-4 w-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setHubTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      hubTab === tab.id 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-l-blue-600 font-extrabold' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {tab.icon}
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="bg-rose-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">{tab.badge}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Hub Main Interactive Display Area */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* MY LISTINGS TAB */}
              {hubTab === 'listings' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-display font-black text-xl text-slate-900">My Listings</h3>
                      <p className="text-xs text-slate-500">Track and manage your appliances listed on the ElectroFix Marketplace.</p>
                    </div>
                    <button
                      onClick={() => handleStartSelling()}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl uppercase tracking-wider hover:bg-blue-500 flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>List Item</span>
                    </button>
                  </div>

                  {listings.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
                      <p className="text-slate-400 text-xs">You do not have any appliance listing yet.</p>
                      <button onClick={() => handleStartSelling()} className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl uppercase tracking-wider hover:bg-blue-500">
                        Create Listing Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {listings.map((lst) => (
                        <div key={lst.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
                          
                          {/* Image & Title Header */}
                          <div className="space-y-3">
                            <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-slate-150 relative bg-slate-50">
                              <img
                                src={lst.images[0]}
                                alt={lst.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = FALLBACK_IMAGES[lst.category] || FALLBACK_IMAGES['default'];
                                }}
                              />
                              
                              {/* Status Badges */}
                              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow backdrop-blur-md ${
                                lst.status === 'Live' 
                                  ? 'bg-emerald-500/90 text-white' 
                                  : lst.status === 'Pending Inspection' 
                                  ? 'bg-amber-500/90 text-white animate-pulse' 
                                  : lst.status === 'Sold' 
                                  ? 'bg-slate-700/90 text-white' 
                                  : 'bg-rose-500/90 text-white'
                              }`}>
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                {lst.status}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">{lst.category}</span>
                              <h4 className="font-display font-extrabold text-sm text-slate-900 truncate">{lst.title}</h4>
                            </div>
                          </div>

                          {/* Price & Primary Actions */}
                          <div className="space-y-3 pt-3 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Target Value</p>
                                <p className="text-base font-mono font-extrabold text-slate-950">₹{lst.expectedPrice}</p>
                              </div>
                              <button
                                onClick={() => setViewDetailsListing(lst)}
                                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase transition-all"
                              >
                                View Details
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                              {lst.status !== 'Sold' && (
                                <>
                                  <button
                                    onClick={() => handleEditListing(lst)}
                                    className="py-2 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors"
                                  >
                                    Edit specs
                                  </button>
                                  <button
                                    onClick={() => handleMarkAsSold(lst.id)}
                                    className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                  >
                                    Mark as Sold
                                  </button>
                                </>
                              )}
                              
                              <button
                                onClick={() => handleDeleteListing(lst.id)}
                                className="col-span-2 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors"
                              >
                                Delete Listing
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* OFFERS RECEIVED & REALTIME CHAT TAB */}
              {hubTab === 'offers' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-black text-xl text-slate-900">Offers Received</h3>
                    <p className="text-xs text-slate-500">Negotiate and communicate with verified local buyers safely.</p>
                  </div>

                  {offers.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs">
                      No customer offers received yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-200 rounded-3xl overflow-hidden min-h-[480px]">
                      
                      {/* Left Offers list */}
                      <div className="border-r border-slate-150 divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                        {offers.map((off) => (
                          <button
                            key={off.id}
                            onClick={() => setSelectedOfferId(off.id)}
                            className={`w-full p-4 text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                              selectedOfferId === off.id ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="font-display font-extrabold text-xs text-slate-950 truncate max-w-[120px]">{off.buyerName}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                                off.status === 'Pending' 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : off.status === 'Accepted' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-rose-100 text-rose-700'
                              }`}>{off.status}</span>
                            </div>
                                         <div className="flex justify-between items-center pt-1 border-t border-slate-100/50 w-full mt-1">
                              <span className="text-[9px] text-slate-400">Offer amount:</span>
                              <span className="text-xs font-mono font-extrabold text-blue-600">₹{off.offeredAmount}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Right Active Chat Pane */}
                      <div className="md:col-span-2 flex flex-col justify-between max-h-[480px]">
                        {activeOffer ? (
                          <>
                            {/* Chat Header */}
                            <div className="bg-slate-50 p-4 border-b border-slate-150 flex justify-between items-center">
                              <div>
                                <h4 className="font-display font-black text-xs text-slate-900">{activeOffer.buyerName}</h4>
                                <p className="text-[9px] text-slate-400">Rating: ★ {activeOffer.buyerRating} • Listing: {activeOffer.listingTitle}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] text-slate-400">Listing Price: ₹{activeOffer.originalPrice}</p>
                                <p className="text-xs font-extrabold text-blue-600">Offered: ₹{activeOffer.offeredAmount}</p>
                              </div>
                            </div>

                            {/* Chat History Messages */}
                            <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[300px]">
                              {activeOffer.chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-xs ${
                                    msg.sender === 'seller' 
                                      ? 'bg-blue-600 text-white rounded-br-none' 
                                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                                  }`}>
                                    <p className="leading-relaxed">{msg.text}</p>
                                    <span className={`text-[8px] block mt-1 text-right ${msg.sender === 'seller' ? 'text-blue-100' : 'text-slate-400'}`}>
                                      {msg.time}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Offer Operations & Text Input */}
                            <div className="p-4 border-t border-slate-150 space-y-3 bg-slate-50">
                              
                              {activeOffer.status === 'Pending' && (
                                <div className="flex gap-2 justify-end">
                                  <div className="flex items-center gap-1 border border-slate-200 bg-white rounded-xl px-2.5 py-1">
                                    <span className="text-[9px] text-slate-400">₹</span>
                                    <input 
                                      type="number" 
                                      placeholder="Counter Price" 
                                      value={counterPrice}
                                      onChange={(e) => setCounterPrice(e.target.value)}
                                      className="w-16 text-xs font-bold outline-none font-mono"
                                    />
                                    <button 
                                      onClick={() => handleOfferAction('counter')}
                                      className="text-[9px] font-bold text-blue-600 uppercase hover:underline"
                                    >
                                      Counter
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => handleOfferAction('reject')}
                                    className="px-3 py-1.5 border border-red-100 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase rounded-xl transition-colors"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => handleOfferAction('accept')}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-xl transition-colors shadow-sm"
                                  >
                                    Accept Offer
                                  </button>
                                </div>
                              )}

                              <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input 
                                  type="text" 
                                  placeholder="Type secure message..." 
                                  value={chatInput}
                                  onChange={(e) => setChatInput(e.target.value)}
                                  className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                                />
                                <button 
                                  type="submit" 
                                  className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0"
                                >
                                  <Send className="h-4 w-4" />
                                </button>
                              </form>

                            </div>
                          </>
                        ) : (
                          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center h-full">
                            Select an offer chat to start negotiating.
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* PICKUP SCHEDULE TAB */}
              {hubTab === 'pickup' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-black text-xl text-slate-900">Pickup Schedule</h3>
                    <p className="text-xs text-slate-500">Upcoming doorstep inspection and hardware checks appointments.</p>
                  </div>

                  {pickupSchedule.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs">
                      No technician pickup scheduled currently.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pickupSchedule.map((p) => (
                        <div key={p.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                                {p.status}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono font-bold">ID: {p.id}</span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-display font-extrabold text-sm text-slate-900">{p.listingTitle}</h4>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium pt-1">
                                <p className="flex items-center gap-1"><Calendar className="h-4 w-4 text-slate-400" /> {p.date}</p>
                                <p className="flex items-center gap-1"><Clock className="h-4 w-4 text-slate-400" /> {p.timeSlot}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 text-xs space-y-0.5 min-w-[160px]">
                              <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Assigned Auditor</p>
                              <p className="font-extrabold text-slate-800">{p.technician}</p>
                              <p className="text-[10px] text-slate-500 font-mono">Ph: {p.phone}</p>
                            </div>

                            <button
                              onClick={() => handleCancelPickup(p.id)}
                              className="px-4 py-2.5 border border-red-100 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Cancel slot
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PAYMENT HISTORY & WALLET TAB */}
              {hubTab === 'payments' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-black text-xl text-slate-900">Payment History</h3>
                    <p className="text-xs text-slate-500">Review instant wallet credits and bank disbursements securely.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100">Cleared Earnings</p>
                      <h4 className="font-display font-black text-2xl mt-1">₹510.00</h4>
                      <p className="text-[9px] text-teal-100/80 mt-2">Disbursed directly via bank transfer.</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Processing Earnings</p>
                      <h4 className="font-display font-black text-2xl mt-1 text-amber-600">₹390.00</h4>
                      <p className="text-[9px] text-slate-500 mt-2">Awaiting pickup technician confirmations.</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Payout Route</p>
                      <h4 className="font-display font-black text-sm mt-2 text-slate-800 truncate">{profile.upiId}</h4>
                      <p className="text-[9px] text-slate-500 mt-2.5">UPI Immediate Account Payout.</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-150 bg-slate-50">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Transaction History Ledger</h4>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {paymentHistory.map((pay) => (
                        <div key={pay.id} className="p-4 flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <h5 className="font-bold text-slate-900">{pay.listingTitle}</h5>
                            <p className="text-[10px] text-slate-400">Paid via {pay.method} • {pay.date}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-mono font-extrabold text-slate-900">₹{pay.amount}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block ${
                              pay.status === 'Cleared' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>{pay.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SAVED LISTINGS TAB */}
              {hubTab === 'saved' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-black text-xl text-slate-900">Saved Listings</h3>
                    <p className="text-xs text-slate-500">Appliances or seller requests you have marked as favorites.</p>
                  </div>

                  {savedListings.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs animate-fade-in">
                      No saved listings currently.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedListings.map((fav) => (
                        <div key={fav.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 items-center justify-between shadow-sm">
                          <div className="flex gap-3 items-center min-w-0">
                            <img
                              src={fav.img}
                              alt={fav.title}
                              className="h-12 w-12 rounded-xl object-cover shrink-0 border"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = FALLBACK_IMAGES[fav.category] || FALLBACK_IMAGES['default'];
                              }}
                            />
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-slate-900 truncate">{fav.title}</h5>
                              <p className="text-[10px] text-slate-400">Saved from seller {fav.seller}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-mono font-extrabold text-blue-600 text-xs">₹{fav.price}</p>
                            <button
                              onClick={() => {
                                setSavedListings(prev => prev.filter(f => f.id !== fav.id));
                                showToast("Removed from saved favorites.");
                              }}
                              className="text-[10px] text-red-500 hover:underline block mt-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* HUB SETTINGS TAB */}
              {hubTab === 'settings' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-display font-black text-xl text-slate-900">Hub Settings</h3>
                    <p className="text-xs text-slate-500">Configure default verification contact parameters and payouts details.</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    
                    {/* Basic details */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">Contact Default Parameters</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Your Full Name</label>
                          <input 
                            type="text" 
                            value={profile.name} 
                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Default Phone</label>
                          <input 
                            type="text" 
                            value={profile.phone} 
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Default Email</label>
                        <input 
                          type="email" 
                          value={profile.email} 
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Default address */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">Default Pickup Location</h4>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
                        <input 
                          type="text" 
                          value={profile.address} 
                          onChange={(e) => setProfile({...profile, address: e.target.value})}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">City</label>
                          <input 
                            type="text" 
                            value={profile.city} 
                            onChange={(e) => setProfile({...profile, city: e.target.value})}
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">State</label>
                          <input 
                            type="text" 
                            value={profile.state} 
                            onChange={(e) => setProfile({...profile, state: e.target.value})}
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">PIN Code</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 400001"
                            maxLength={6}
                            value={profile.zipcode} 
                            onChange={(e) => setProfile({...profile, zipcode: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Instant Payout Defaults */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">Direct Payout Defaults</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Your UPI ID</label>
                          <input 
                            type="text" 
                            value={profile.upiId} 
                            onChange={(e) => setProfile({...profile, upiId: e.target.value})}
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bank Account Ending In</label>
                          <input 
                            type="text" 
                            value={profile.bankAccount} 
                            onChange={(e) => setProfile({...profile, bankAccount: e.target.value})}
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                    >
                      Save Settings
                    </button>

                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* ----------------- PRODUCT DETAILS MODAL DRAWER ----------------- */}
      <AnimatePresence>
        {viewDetailsListing && (
          <div className="fixed inset-0 z-[10000] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-[36px] shadow-2xl border border-slate-150 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] bg-blue-600 px-2 py-0.5 rounded-md font-bold uppercase">{viewDetailsListing.category}</span>
                  <h4 className="font-display font-black text-sm mt-1">{viewDetailsListing.title}</h4>
                </div>
                <button 
                  onClick={() => setViewDetailsListing(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="aspect-[4/3] bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden">
                    <img
                      src={viewDetailsListing.images[0]}
                      alt={viewDetailsListing.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGES[viewDetailsListing.category] || FALLBACK_IMAGES['default'];
                      }}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border space-y-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pricing target value</p>
                      <p className="text-xl font-mono font-extrabold text-slate-900">₹{viewDetailsListing.expectedPrice}</p>
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-150 text-[10px] font-bold text-slate-600">Status: {viewDetailsListing.status}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50/50 p-3 rounded-xl border">
                        <span className="text-slate-400 font-bold block text-[8px] uppercase">Product Age</span>
                        <span className="font-semibold text-slate-800 text-[11px]">{viewDetailsListing.age}</span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-xl border">
                        <span className="text-slate-400 font-bold block text-[8px] uppercase">Condition</span>
                        <span className="font-semibold text-slate-800 text-[11px]">{viewDetailsListing.condition}</span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900">Description</h5>
                  <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border">{viewDetailsListing.description}</p>
                </div>

                {viewDetailsListing.accessories && viewDetailsListing.accessories.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-900">Included Accessories</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {viewDetailsListing.accessories.map(acc => (
                        <span key={acc} className="bg-slate-100 text-slate-800 border px-2.5 py-1 rounded-xl text-[10px] font-medium">{acc}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold text-[8px] uppercase">Pickup address</span>
                    <p className="font-semibold text-slate-800">{viewDetailsListing.address || profile.address}, {viewDetailsListing.city || profile.city}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold text-[8px] uppercase">Inspection schedule</span>
                    <p className="font-semibold text-slate-800">{viewDetailsListing.pickupDate || 'Awaiting slot scheduling'} • {viewDetailsListing.pickupTimeSlot}</p>
                  </div>
                </div>

              </div>
              
              <div className="bg-slate-50 p-5 border-t border-slate-150 flex justify-end gap-2">
                <button 
                  onClick={() => setViewDetailsListing(null)}
                  className="px-5 py-2 border text-slate-600 hover:text-slate-900 font-bold rounded-xl text-[11px] bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
