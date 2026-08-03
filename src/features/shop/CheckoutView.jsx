// CheckoutView.jsx - Shipping, Billing, and multi-method secure gateway simulation
import { useState, useEffect, useRef } from 'react';
import { CreditCard, Check, ArrowLeft, ShieldCheck, RefreshCw, AlertTriangle, AlertCircle, ChevronDown, Truck, Wrench, Lock, X, Search, Building2, CheckCircle2 } from 'lucide-react';
import { getFallbackProductImage } from '../../utils/shopData';
import { INDIA_STATES_AND_CITIES, INDIAN_STATES_LIST } from '../../data/indiaData';
import { INDIAN_BANKS, POPULAR_INDIAN_BANKS } from '../../data/indianBanks';
import { processPaymentTransaction, PAYMENT_GATEWAY_CONFIG, setDemoOutcomeMode } from '../../services/paymentGatewayService';

export default function CheckoutView({
  cart,
  appliedPromo,
  onOrderSuccess,
  onCancel,
  cancelLabel = "Return to Cart",
  userEmail
}) {
  // Address form states (empty by default for new/guest users)
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [country, setCountry] = useState('India');

  // Inline field errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Autocomplete dropdown states for State & City
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [stateHighlight, setStateHighlight] = useState(0);
  const stateRef = useRef(null);

  const [isCityOpen, setIsCityOpen] = useState(false);
  const [cityHighlight, setCityHighlight] = useState(0);
  const cityRef = useRef(null);

  // Click outside listener to close State & City autocomplete dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setIsStateOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setIsCityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Shipping Method
  const [deliveryOption, setDeliveryOption] = useState('standard'); // standard | express | nextday

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('card'); // card | upi | netbanking | cod

  // UPI State
  const [upiId, setUpiId] = useState('');
  const [isUpiValid, setIsUpiValid] = useState(false);

  // Credit Card States
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardBrand, setCardBrand] = useState('generic'); // visa | mastercard | amex | generic

  // Net banking States (Indian Banks)
  const [selectedBank, setSelectedBank] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [demoOutcome, setDemoOutcome] = useState('RANDOM'); // 'RANDOM' | 'ALWAYS_SUCCESS' | 'ALWAYS_FAIL'

  // Filter Indian Banks dynamically by search query
  const filteredBanks = INDIAN_BANKS.filter(b => 
    b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
    b.shortName.toLowerCase().includes(bankSearch.toLowerCase()) ||
    b.code.toLowerCase().includes(bankSearch.toLowerCase())
  );

  // Secure processing animation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  // Simulated gateway modal states
  const [showGateway, setShowGateway] = useState(false);
  const [paymentSession, setPaymentSession] = useState(null);
  const [gatewayStep, setGatewayStep] = useState('input'); // input | loading | success | failed
  const [verificationStep, setVerificationStep] = useState(0);
  const [gatewayPin, setGatewayPin] = useState('');
  const [gatewayError, setGatewayError] = useState('');
  const [formError, setFormError] = useState('');

  // Auto fill logged in user's actual data / saved address
  useEffect(() => {
    let loggedUser = null;
    const localUserStr = localStorage.getItem('ef_auth_user');
    if (localUserStr) {
      try {
        loggedUser = JSON.parse(localUserStr);
      } catch (err) {
        console.error("Failed to parse ef_auth_user:", err);
      }
    }

    let savedAddr = null;
    const addressesStr = localStorage.getItem('ef_user_addresses') || localStorage.getItem('ef_saved_address');
    if (addressesStr) {
      try {
        const parsed = JSON.parse(addressesStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          savedAddr = parsed.find(a => a.isDefault) || parsed[0];
        } else if (parsed && typeof parsed === 'object') {
          savedAddr = parsed;
        }
      } catch (err) {
        console.error("Failed to parse saved addresses:", err);
      }
    }

    if (loggedUser) {
      setFullname(savedAddr?.name || savedAddr?.fullname || loggedUser.name || loggedUser.fullname || '');
      setEmail(savedAddr?.email || loggedUser.email || userEmail || '');
      
      const rawPhone = savedAddr?.phone || loggedUser.phone || '';
      const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
      setPhone(cleanPhone);

      setAddress(savedAddr?.address || loggedUser.address || loggedUser.streetAddress || '');
      setState(savedAddr?.state || loggedUser.state || '');
      setCity(savedAddr?.city || loggedUser.city || '');

      const rawZip = savedAddr?.zip || savedAddr?.zipcode || savedAddr?.pinCode || loggedUser.zip || loggedUser.zipcode || loggedUser.pinCode || '';
      setZipcode(rawZip.replace(/\D/g, '').slice(0, 6));

      setCountry('India');
    } else {
      setFullname('');
      setPhone('');
      setEmail(userEmail || '');
      setAddress('');
      setState('');
      setCity('');
      setZipcode('');
      setCountry('India');
    }
  }, [userEmail]);

  // Handle phone change (10 digits numeric, starting with 6,7,8,9)
  const handlePhoneChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(rawDigits);
    setFormError('');

    if (rawDigits.length > 0) {
      if (!/^[6-9]/.test(rawDigits)) {
        setFieldErrors(prev => ({
          ...prev,
          phone: "Phone number must start with 6, 7, 8, or 9"
        }));
      } else if (rawDigits.length < 10) {
        setFieldErrors(prev => ({
          ...prev,
          phone: "Phone number must be exactly 10 digits"
        }));
      } else {
        setFieldErrors(prev => ({ ...prev, phone: "" }));
      }
    } else {
      setFieldErrors(prev => ({ ...prev, phone: "Phone number is required" }));
    }
  };

  // State filtering & keyboard navigation
  const filteredStates = INDIAN_STATES_LIST.filter(s =>
    s.toLowerCase().includes(state.toLowerCase())
  );

  const handleStateSelect = (selectedState) => {
    setState(selectedState);
    setIsStateOpen(false);
    setStateHighlight(0);
    setFieldErrors(prev => ({ ...prev, state: '' }));

    // Reset city if current city is not in selected state's cities
    const citiesInState = INDIA_STATES_AND_CITIES[selectedState] || [];
    if (city && !citiesInState.some(c => c.toLowerCase() === city.toLowerCase())) {
      setCity('');
    }
  };

  const handleStateKeyDown = (e) => {
    if (!isStateOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsStateOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setStateHighlight(prev => (prev + 1) % (filteredStates.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setStateHighlight(prev => (prev - 1 + (filteredStates.length || 1)) % (filteredStates.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredStates.length > 0 && filteredStates[stateHighlight]) {
        handleStateSelect(filteredStates[stateHighlight]);
      }
    } else if (e.key === 'Escape') {
      setIsStateOpen(false);
    }
  };

  // City filtering & keyboard navigation
  const availableCities = state && INDIA_STATES_AND_CITIES[state]
    ? INDIA_STATES_AND_CITIES[state]
    : [];

  const filteredCities = availableCities.filter(c =>
    c.toLowerCase().includes(city.toLowerCase())
  );

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity);
    setIsCityOpen(false);
    setCityHighlight(0);
    setFieldErrors(prev => ({ ...prev, city: '' }));
  };

  const handleCityKeyDown = (e) => {
    if (!isCityOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsCityOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCityHighlight(prev => (prev + 1) % (filteredCities.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCityHighlight(prev => (prev - 1 + (filteredCities.length || 1)) % (filteredCities.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCities.length > 0 && filteredCities[cityHighlight]) {
        handleCitySelect(filteredCities[cityHighlight]);
      }
    } else if (e.key === 'Escape') {
      setIsCityOpen(false);
    }
  };

  // PIN Code change (6 digits numeric)
  const handleZipcodeChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 6);
    setZipcode(rawDigits);
    setFormError('');

    if (rawDigits.length > 0 && rawDigits.length < 6) {
      setFieldErrors(prev => ({
        ...prev,
        zipcode: "PIN Code must be exactly 6 digits"
      }));
    } else {
      setFieldErrors(prev => ({ ...prev, zipcode: "" }));
    }
  };

  const processingLabels = [
    "Locking factory inventory spaces...",
    "Authorizing SSL payment gateways...",
    "Registering product warranties with ElectroFix Care...",
    "Generating secure digital invoice PDF receipts..."
  ];

  // Auto-detect Credit Card Brand
  useEffect(() => {
    const rawDigits = cardNumber.replace(/\D/g, '');
    if (rawDigits.startsWith('4')) {
      setCardBrand('visa');
    } else if (rawDigits.startsWith('5')) {
      setCardBrand('mastercard');
    } else if (rawDigits.startsWith('3')) {
      setCardBrand('amex');
    } else {
      setCardBrand('generic');
    }
  }, [cardNumber]);

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.substring(0, 16);
    
    // Add spaces
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY, auto insert slash)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substring(0, 4);

    let formatted = value;
    if (value.length >= 3) {
      formatted = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setCardExpiry(formatted);
  };

  // Calculations
  const rawSubtotal = cart.reduce((acc, item) => {
    let itemCost = item.product.price;
    if (item.withInstallation) itemCost += 49;
    return acc + (itemCost * item.quantity);
  }, 0);

  const taxes = Math.round(rawSubtotal * 0.05);

  let deliveryFee = 0;
  if (deliveryOption === 'express') deliveryFee = 15;
  if (deliveryOption === 'nextday') deliveryFee = 29;

  if (appliedPromo === 'FREESHIP') {
    deliveryFee = 0;
  }

  let discountAmount = 0;
  if (appliedPromo === 'FIX20') {
    discountAmount = Math.round(rawSubtotal * 0.20);
  } else if (appliedPromo === 'SAVE50') {
    discountAmount = rawSubtotal >= 200 ? 50 : 0;
  }

  const grandTotal = rawSubtotal + taxes + deliveryFee - discountAmount;

  // Address validation helper
  const validateAddress = () => {
    const newErrors = {};

    const trimmedName = fullname.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();
    const trimmedState = state.trim();
    const trimmedCity = city.trim();
    const trimmedZip = zipcode.trim();

    // 1. Full name
    if (!trimmedName) {
      newErrors.fullname = "Full name is required";
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    // 3. Indian Phone number validation (exactly 10 digits starting with 6, 7, 8, or 9)
    const phoneDigits = trimmedPhone.replace(/\D/g, '');
    if (!trimmedPhone) {
      newErrors.phone = "Phone number is required";
    } else if (phoneDigits.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    } else if (!/^[6-9]/.test(phoneDigits)) {
      newErrors.phone = "Indian mobile numbers must start with 6, 7, 8, or 9";
    }

    // 4. Delivery street address
    if (!trimmedAddress) {
      newErrors.address = "Street address is required";
    }

    // 5. State validation
    if (!trimmedState) {
      newErrors.state = "Please select a State from suggestions";
    } else if (!INDIAN_STATES_LIST.some(s => s.toLowerCase() === trimmedState.toLowerCase())) {
      newErrors.state = "Please select a valid Indian state from suggestions";
    }

    // 6. City validation
    if (!trimmedCity) {
      newErrors.city = "Please select or type a City";
    }

    // 7. PIN Code / Zip code validation (exactly 6 digits numeric)
    const zipDigits = trimmedZip.replace(/\D/g, '');
    if (!trimmedZip) {
      newErrors.zipcode = "PIN Code is required";
    } else if (zipDigits.length !== 6) {
      newErrors.zipcode = "PIN Code must be exactly 6 digits";
    }

    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const msg = "Please correct all highlighted errors in your shipping details before proceeding.";
      setFormError(msg);
      return false;
    }

    setFormError('');
    return true;
  };

  // Helper to persist shipping details for logged-in user profile/address
  const saveAddressIfLoggedIn = () => {
    try {
      const localUserStr = localStorage.getItem('ef_auth_user');
      if (localUserStr) {
        const addrObj = {
          fullname: fullname.trim(),
          name: fullname.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zipcode: zipcode.trim(),
          pinCode: zipcode.trim(),
          country: country.trim(),
          isDefault: true
        };
        localStorage.setItem('ef_saved_address', JSON.stringify(addrObj));

        const loggedUser = JSON.parse(localUserStr);
        const updatedUser = {
          ...loggedUser,
          name: loggedUser.name || fullname.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zipcode: zipcode.trim(),
          pinCode: zipcode.trim(),
          country: country.trim()
        };
        localStorage.setItem('ef_auth_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.warn("Could not save address to local storage:", err);
    }
  };

  // Handle Order Submit (Fully simulated in Demo Mode)
  const handlePlaceOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError('');

    // Validations
    if (!validateAddress()) return;

    if (paymentMethod === 'card') {
      if (cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3 || !cardName.trim()) {
        setFormError("Please complete all credit card information fields!");
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setFormError("Please enter a valid UPI ID (e.g., name@okaxis)!");
        return;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        setFormError("Please select an Indian bank from the Net Banking list to proceed.");
        return;
      }
    }

    // Persist details if user is logged in
    saveAddressIfLoggedIn();

    // Prevent duplicate triggers
    if (isProcessing) return;

    setIsProcessing(true);
    setProcessingStep(0); // Step 0: Connecting Gateway

    const estDays = deliveryOption === 'nextday' ? 1 : deliveryOption === 'express' ? 2 : 4;
    const token = localStorage.getItem('ef_auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Progress animation timers during 2-3s delay
    const pTimer1 = setTimeout(() => setProcessingStep(1), 600);
    const pTimer2 = setTimeout(() => setProcessingStep(2), 1200);
    const pTimer3 = setTimeout(() => setProcessingStep(3), 1800);

    try {
      // Execute payment transaction (Always succeeds in Demo Mode)
      const paymentResult = await processPaymentTransaction({
        paymentMethod,
        selectedBank,
        upiId,
        cardDetails: { cardNumber, cardExpiry, cardName },
        amount: grandTotal,
        shippingAddress: { fullname, phone, email, address, city, state, zipcode, country },
        cartItems: cart
      });

      clearTimeout(pTimer1);
      clearTimeout(pTimer2);
      clearTimeout(pTimer3);
      setProcessingStep(3);

      const timestamp = new Date().toISOString();
      const randSuffix = Math.floor(1000 + Math.random() * 9000);
      const demoTxnId = paymentResult?.transactionId || `DEMO_${Math.floor(Date.now() / 1000)}_${randSuffix}`;
      const demoOrderId = `EF-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      const demoInvoiceNo = `EF-INV-${Date.now().toString().slice(-6)}-${randSuffix}`;

      const methodLabelMap = {
        card: 'Credit/Debit Card',
        upi: 'UPI',
        netbanking: 'Net Banking',
        cod: 'Cash on Delivery'
      };
      const formattedMethod = methodLabelMap[paymentMethod] || paymentMethod.toUpperCase();

      let last4Val = 'DEMO';
      if (paymentMethod === 'card' && cardNumber) {
        last4Val = cardNumber.replace(/\s+/g, '').slice(-4) || '4242';
      } else if (paymentMethod === 'upi' && upiId) {
        last4Val = upiId;
      } else if (paymentMethod === 'netbanking' && selectedBank) {
        last4Val = selectedBank;
      } else if (paymentMethod === 'cod') {
        last4Val = 'COD';
      }

      let loggedInUser = null;
      try {
        const u = localStorage.getItem('ef_auth_user');
        if (u) loggedInUser = JSON.parse(u);
      } catch (e) {}

      // Fallback order object if server DB is offline / unavailable / fails in Demo Mode
      const fallbackOrder = {
        _id: `local-ord-${Date.now()}`,
        orderId: demoOrderId,
        transactionId: demoTxnId,
        invoiceNo: demoInvoiceNo,
        userId: loggedInUser?.id || null,
        email: email.trim().toLowerCase(),
        date: new Date().toLocaleDateString(),
        createdAt: timestamp,
        items: cart,
        shippingAddress: {
          fullname: fullname.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zipcode: zipcode.trim(),
          country: country.trim()
        },
        paymentDetails: {
          method: formattedMethod,
          paymentMethod: formattedMethod,
          selectedBank: paymentMethod === 'netbanking' ? selectedBank : null,
          last4: last4Val,
          paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Success',
          transactionId: demoTxnId,
          invoiceNo: demoInvoiceNo,
          timestamp: timestamp
        },
        costs: { subtotal: rawSubtotal, taxes, deliveryFee, discountAmount, total: grandTotal },
        status: paymentMethod === 'cod' ? 'Confirmed (Cash on Delivery)' : 'Confirmed',
        orderStatus: 'Confirmed',
        paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Success',
        selectedBank: paymentMethod === 'netbanking' ? selectedBank : null,
        estimatedDays: estDays,
        withInstallation: cart.some(item => item.withInstallation)
      };

      let savedOrder = null;

      // Attempt backend API order persistence (graceful fallback if server unavailable or fails)
      try {
        if (paymentMethod === 'cod') {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              items: cart,
              shippingAddress: fallbackOrder.shippingAddress,
              paymentDetails: fallbackOrder.paymentDetails,
              costs: fallbackOrder.costs,
              estimatedDays: estDays,
              withInstallation: fallbackOrder.withInstallation,
              userId: loggedInUser?.id || null
            })
          }).catch(() => null);

          if (res && res.ok) {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              savedOrder = await res.json();
            }
          }
        } else {
          // Online payment verification route
          const initRes = await fetch('/api/payments/initiate', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              paymentMethod,
              selectedBank,
              amount: grandTotal,
              items: cart,
              shippingAddress: fallbackOrder.shippingAddress
            })
          }).catch(() => null);

          let txnId = demoTxnId;
          if (initRes && initRes.ok) {
            const initCt = initRes.headers.get('content-type');
            if (initCt && initCt.includes('application/json')) {
              const session = await initRes.json().catch(() => ({}));
              txnId = session.transactionId || txnId;
            }
          }

          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              transactionId: txnId,
              status: 'SUCCESS',
              paymentDetails: fallbackOrder.paymentDetails,
              costs: fallbackOrder.costs,
              estimatedDays: estDays,
              withInstallation: fallbackOrder.withInstallation,
              userId: loggedInUser?.id || null,
              email: email.trim().toLowerCase()
            })
          }).catch(() => null);

          if (verifyRes && verifyRes.ok) {
            const verifyCt = verifyRes.headers.get('content-type');
            if (verifyCt && verifyCt.includes('application/json')) {
              savedOrder = await verifyRes.json();
            }
          }
        }
      } catch (apiErr) {
        console.warn("[Checkout] Server API order save unavailable, using local demo order.", apiErr);
      }

      // If backend API returned a valid saved order, use it; otherwise use fallback order
      if (!savedOrder || !savedOrder.orderId) {
        savedOrder = fallbackOrder;
      }

      // Always persist order into localStorage so order history is saved locally
      try {
        const existingLocal = JSON.parse(localStorage.getItem('ef_orders') || '[]');
        const updatedLocal = [savedOrder, ...existingLocal.filter(o => o.orderId !== savedOrder.orderId)];
        localStorage.setItem('ef_orders', JSON.stringify(updatedLocal));
      } catch (e) {
        console.warn("Could not save order to localStorage:", e);
      }

      // Complete progress delay and redirect to Order Success
      setTimeout(() => {
        setIsProcessing(false);
        onOrderSuccess(savedOrder);
      }, 500);

    } catch (err) {
      clearTimeout(pTimer1);
      clearTimeout(pTimer2);
      clearTimeout(pTimer3);
      console.error("[Checkout] Payment processing fallback triggered:", err);

      // In Demo Mode, construct demo order so user checkout never breaks
      const timestamp = new Date().toISOString();
      const randSuffix = Math.floor(1000 + Math.random() * 9000);
      const demoTxnId = `DEMO_${Math.floor(Date.now() / 1000)}_${randSuffix}`;
      const demoOrderId = `EF-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

      const methodLabelMap = {
        card: 'Credit/Debit Card',
        upi: 'UPI',
        netbanking: 'Net Banking',
        cod: 'Cash on Delivery'
      };
      const formattedMethod = methodLabelMap[paymentMethod] || paymentMethod.toUpperCase();

      const safeOrder = {
        _id: `local-ord-${Date.now()}`,
        orderId: demoOrderId,
        transactionId: demoTxnId,
        invoiceNo: `EF-INV-${Date.now().toString().slice(-6)}-${randSuffix}`,
        userId: null,
        email: email.trim().toLowerCase(),
        date: new Date().toLocaleDateString(),
        createdAt: timestamp,
        items: cart,
        shippingAddress: {
          fullname: fullname.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zipcode: zipcode.trim(),
          country: country.trim()
        },
        paymentDetails: {
          method: formattedMethod,
          paymentMethod: formattedMethod,
          selectedBank: paymentMethod === 'netbanking' ? selectedBank : null,
          last4: 'DEMO',
          paymentStatus: 'Success',
          transactionId: demoTxnId,
          timestamp
        },
        costs: { subtotal: rawSubtotal, taxes, deliveryFee, discountAmount, total: grandTotal },
        status: 'Confirmed',
        orderStatus: 'Confirmed',
        paymentStatus: 'Success',
        estimatedDays: estDays,
        withInstallation: cart.some(item => item.withInstallation)
      };

      try {
        const existingLocal = JSON.parse(localStorage.getItem('ef_orders') || '[]');
        localStorage.setItem('ef_orders', JSON.stringify([safeOrder, ...existingLocal]));
      } catch (e) {}

      setIsProcessing(false);
      onOrderSuccess(safeOrder);
    }
  };

  // Secure payment verification client-side handler
  const handleVerifyPayment = async (status) => {
    setGatewayStep('loading');
    setVerificationStep(0);
    setGatewayError('');

    const verifyPayload = {
      transactionId: paymentSession.transactionId,
      status: status === 'SUCCESS' ? 'SUCCESS' : 'FAILURE',
      paymentDetails: {
        method: paymentMethod.toUpperCase(),
        last4: paymentMethod === 'card' 
          ? cardNumber.replace(/\s+/g, '').slice(-4) 
          : paymentMethod === 'upi' 
          ? upiId 
          : selectedBank
      },
      costs: { subtotal: rawSubtotal, taxes, deliveryFee, discountAmount, total: grandTotal },
      estimatedDays: deliveryOption === 'nextday' ? 1 : deliveryOption === 'express' ? 2 : 4,
      withInstallation: cart.some(item => item.withInstallation)
    };

    const token = localStorage.getItem('ef_auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Sequentially advance visual verification steps inside the modal
    const stepsCount = 5;
    let currentStep = 0;

    const interval = setInterval(async () => {
      currentStep++;
      if (currentStep < stepsCount) {
        setVerificationStep(currentStep);
      } else {
        clearInterval(interval);
        
        // Make the POST request to our verified server verification endpoint
        try {
          console.log(`[Gateway] [VERIFY] Calling server verification endpoint for ${paymentSession.transactionId}...`);
          const res = await fetch('/api/payments/verify', {
            method: 'POST',
            headers,
            body: JSON.stringify(verifyPayload)
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Payment validation declined by backend server rules.');
          }

          const vCt = res.headers.get('content-type');
          if (!vCt || !vCt.includes('application/json')) {
            throw new Error('Server returned invalid response structure.');
          }
          const savedOrder = await res.json();
          console.log(`[Gateway] [VERIFY] Payment successfully verified and captured! Order ID: ${savedOrder.orderId}`);
          
          setGatewayStep('success');
          setTimeout(() => {
            setShowGateway(false);
            onOrderSuccess(savedOrder);
          }, 1200);

        } catch (err) {
          console.error("[Gateway] Verification failed:", err);
          setGatewayError(err.message || 'Payment has failed or been declined by your bank issuer.');
          setGatewayStep('failed');
        }
      }
    }, 600);
  };

  // Safe payment cancel handler
  const handleCancelPayment = async () => {
    if (!confirm("Are you sure you want to cancel the payment? Your cart will remain intact and you will return to checkout.")) {
      return;
    }

    const token = localStorage.getItem('ef_auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      console.log(`[Gateway] [CANCEL] Reporting payment cancellation for ${paymentSession.transactionId}...`);
      await fetch('/api/payments/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transactionId: paymentSession.transactionId,
          status: 'CANCELLED',
          paymentDetails: { method: paymentMethod.toUpperCase(), last4: 'CANCELLED' },
          costs: { subtotal: rawSubtotal, taxes, deliveryFee, discountAmount, total: grandTotal }
        })
      });
    } catch (err) {
      console.warn("[Gateway] Error reporting payment cancellation:", err);
    }

    setShowGateway(false);
    setGatewayStep('input');
    setGatewayPin('');
  };

  if (isProcessing) {
    return (
      <div className="py-20 text-center space-y-6 max-w-md mx-auto animate-fade-in">
        <div className="flex justify-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute animate-ping h-full w-full rounded-full bg-blue-400 opacity-20" />
            <RefreshCw className="h-10 w-10 text-blue-600 animate-spin" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-lg font-bold text-slate-900">Connecting Secure Gateway</h3>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">SSL Secure Transaction Gateway</p>
        </div>

        {/* Multi-step list indicator */}
        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 text-left space-y-3">
          {[
            "Establishing Secure Connection...",
            "Encrypting card credentials...",
            "Routing to UPI/Bank interfaces...",
            "Generating transaction parameters..."
          ].map((lbl, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                processingStep > idx 
                  ? 'bg-emerald-500 text-white' 
                  : processingStep === idx 
                  ? 'bg-blue-600 text-white animate-pulse' 
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {processingStep > idx ? '✓' : idx + 1}
              </div>
              <span className={`font-semibold ${processingStep === idx ? 'text-blue-600 font-extrabold' : processingStep > idx ? 'text-slate-500' : 'text-slate-300'}`}>
                {lbl}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400">Do not hit your back button or close this tab...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Navigation Line */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-slate-900 uppercase tracking-widest cursor-pointer transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{cancelLabel}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Checkout Inputs (Address, Shipping method, Payment gateways) */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-8 space-y-6">
          
          {/* Shipping Address Box */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">1. Shipping & Contact Details</h3>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">India Shipping</span>
            </div>
            
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Gaurav Mandal"
                  required
                  value={fullname}
                  onChange={(e) => {
                    setFullname(e.target.value);
                    setFormError('');
                    setFieldErrors(prev => ({ ...prev, fullname: e.target.value.trim() ? '' : 'Full name is required' }));
                  }}
                  className={`w-full text-xs px-3.5 py-3 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-semibold ${
                    fieldErrors.fullname ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors.fullname && (
                  <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {fieldErrors.fullname}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number (10 Digits) *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-extrabold text-slate-500 select-none">+91</span>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={handlePhoneChange}
                    className={`w-full text-xs pl-12 pr-3.5 py-3 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-semibold font-mono ${
                      fieldErrors.phone ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {fieldErrors.phone ? (
                  <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {fieldErrors.phone}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-medium">Must be 10 digits starting with 6, 7, 8, or 9</p>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address *</label>
              <input
                type="email"
                placeholder="e.g. user@example.com"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormError('');
                  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim());
                  setFieldErrors(prev => ({ ...prev, email: valid ? '' : 'Please enter a valid email address' }));
                }}
                className={`w-full text-xs px-3.5 py-3 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-semibold ${
                  fieldErrors.email ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Street Address */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Street Address *</label>
              <input
                type="text"
                placeholder="e.g. House No. 104, Green Park Heights, Main Road"
                required
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setFormError('');
                  setFieldErrors(prev => ({ ...prev, address: e.target.value.trim() ? '' : 'Street address is required' }));
                }}
                className={`w-full text-xs px-3.5 py-3 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-semibold ${
                  fieldErrors.address ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              {fieldErrors.address && (
                <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {fieldErrors.address}
                </p>
              )}
            </div>

            {/* State, City, PIN Code, Country Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* State Autocomplete */}
              <div className="space-y-1 relative" ref={stateRef}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">State *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type or select State..."
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setIsStateOpen(true);
                      setFormError('');
                      setFieldErrors(prev => ({ ...prev, state: '' }));
                    }}
                    onFocus={() => setIsStateOpen(true)}
                    onKeyDown={handleStateKeyDown}
                    className={`w-full text-xs px-3.5 py-3 pr-8 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-semibold ${
                      fieldErrors.state ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  />
                  <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* State Dropdown Suggestions */}
                {isStateOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto z-50 py-1">
                    {filteredStates.length > 0 ? (
                      filteredStates.map((st, idx) => (
                        <button
                          key={st}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleStateSelect(st);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                            idx === stateHighlight ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{st}</span>
                          {state === st && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))
                    ) : (
                      <div className="px-3.5 py-2 text-xs text-slate-400 font-medium">
                        No state matching "{state}"
                      </div>
                    )}
                  </div>
                )}

                {fieldErrors.state && (
                  <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {fieldErrors.state}
                  </p>
                )}
              </div>

              {/* City Autocomplete */}
              <div className="space-y-1 relative" ref={cityRef}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">City *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={state ? "Type or select City..." : "Select State first..."}
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setIsCityOpen(true);
                      setFormError('');
                      setFieldErrors(prev => ({ ...prev, city: '' }));
                    }}
                    onFocus={() => setIsCityOpen(true)}
                    onKeyDown={handleCityKeyDown}
                    className={`w-full text-xs px-3.5 py-3 pr-8 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-semibold ${
                      fieldErrors.city ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  />
                  <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* City Dropdown Suggestions */}
                {isCityOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto z-50 py-1">
                    {!state ? (
                      <div className="px-3.5 py-2 text-xs text-slate-400 font-medium">
                        Please select a State above first
                      </div>
                    ) : filteredCities.length > 0 ? (
                      filteredCities.map((ct, idx) => (
                        <button
                          key={ct}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleCitySelect(ct);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                            idx === cityHighlight ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{ct}</span>
                          {city === ct && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))
                    ) : (
                      <div className="px-3.5 py-2 text-xs text-slate-400 font-medium">
                        No matching city in {state}
                      </div>
                    )}
                  </div>
                )}

                {fieldErrors.city && (
                  <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {fieldErrors.city}
                  </p>
                )}
              </div>

              {/* PIN Code */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PIN Code (6 Digits) *</label>
                <input
                  type="text"
                  placeholder="e.g. 400001"
                  required
                  maxLength={6}
                  value={zipcode}
                  onChange={handleZipcodeChange}
                  className={`w-full text-xs px-3.5 py-3 rounded-xl border outline-none bg-slate-50 focus:bg-white focus:ring-1 transition-all font-mono font-semibold ${
                    fieldErrors.zipcode ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors.zipcode && (
                  <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {fieldErrors.zipcode}
                  </p>
                )}
              </div>

              {/* Country (Read-only India) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Country *</label>
                <input
                  type="text"
                  readOnly
                  value="India"
                  className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 outline-none bg-slate-100 text-slate-700 font-bold cursor-not-allowed select-none"
                />
              </div>
            </div>
          </div>

          {/* Shipping Methods Radio Group */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">2. Select Delivery Speed</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Standard */}
              <div
                onClick={() => setDeliveryOption('standard')}
                className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  deliveryOption === 'standard' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryOption === 'standard'}
                  onChange={() => setDeliveryOption('standard')}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">Standard Ground</p>
                  <p className="text-[10px] text-slate-500">3-5 Business Days</p>
                  <p className="text-xs font-extrabold text-emerald-600 font-mono">FREE</p>
                </div>
              </div>

              {/* Express */}
              <div
                onClick={() => setDeliveryOption('express')}
                className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  deliveryOption === 'express' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryOption === 'express'}
                  onChange={() => setDeliveryOption('express')}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">Express Air</p>
                  <p className="text-[10px] text-slate-500">1-2 Business Days</p>
                  <p className="text-xs font-extrabold text-slate-950 font-mono">₹{appliedPromo === 'FREESHIP' ? 0 : 15}</p>
                </div>
              </div>

              {/* Next-Day */}
              <div
                onClick={() => setDeliveryOption('nextday')}
                className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  deliveryOption === 'nextday' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryOption === 'nextday'}
                  onChange={() => setDeliveryOption('nextday')}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">Next-Day Rush</p>
                  <p className="text-[10px] text-slate-500">Within 24 Hours</p>
                  <p className="text-xs font-extrabold text-slate-950 font-mono">₹{appliedPromo === 'FREESHIP' ? 0 : 29}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Validation Error Banner */}
          {formError && (
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-800 text-xs flex items-center justify-between gap-2 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <span className="font-semibold">{formError}</span>
              </div>
              <button
                type="button"
                onClick={() => setFormError('')}
                className="text-[11px] font-bold text-red-700 hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Secure Payment Methods selectors */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">3. Choose Payment Method</h3>
            
            {/* Horizontal choice list */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-slate-100 pb-4">
              {[
                { id: 'card', name: 'Credit/Debit' },
                { id: 'upi', name: 'UPI ID' },
                { id: 'netbanking', name: 'Net Banking' },
                { id: 'cod', name: 'Cash on Delivery' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/10'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {/* Sub-form fields based on Payment choice */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Card Verification Engine</span>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${cardBrand === 'visa' ? 'bg-blue-50 text-blue-600 border-blue-100' : cardBrand === 'mastercard' ? 'bg-amber-50 text-amber-600 border-amber-100' : cardBrand === 'amex' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-200 text-slate-400 border-slate-300'}`}>
                      {cardBrand === 'generic' ? 'Card Detected' : cardBrand}
                    </span>
                    <CreditCard className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 outline-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono tracking-wider"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 outline-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CVV/Security Code</label>
                    <input
                      type="password"
                      required
                      placeholder="123"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 outline-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Name on Card</label>
                  <input
                    type="text"
                    required
                    placeholder="Gaurav Mandal"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 outline-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}


            {paymentMethod === 'upi' && (
              <div className="space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enter UPI Virtual Address</label>
                  <input
                    type="text"
                    placeholder="yourname@gpay, bhim, or phonepe"
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      setIsUpiValid(e.target.value.includes('@'));
                    }}
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 outline-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {isUpiValid ? (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">✓ VPA Verified. Instant payment trigger will prompt your UPI application.</p>
                ) : (
                  <p className="text-[9px] text-slate-400">Example format: address@vpa, user@okhdfc</p>
                )}
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="space-y-4 animate-fade-in bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 block">
                      Select Your Indian Bank
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Choose from major Indian banks for Net Banking checkout
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    Demo Gateway Mode
                  </span>
                </div>

                {/* Search Input Box */}
                <div className="relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search 15 major Indian banks (e.g. SBI, HDFC, ICICI, Axis)..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    className="w-full text-xs pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 placeholder-slate-400"
                  />
                  {bankSearch && (
                    <button
                      type="button"
                      onClick={() => setBankSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Popular Banks Selection */}
                {!bankSearch && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Popular Indian Banks
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {POPULAR_INDIAN_BANKS.map((bank) => {
                        const isSelected = selectedBank === bank.name;
                        return (
                          <button
                            type="button"
                            key={bank.id}
                            onClick={() => {
                              setSelectedBank(bank.name);
                              setFormError('');
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-16 cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/90 ring-2 ring-blue-500/20 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={`text-[9px] font-extrabold text-white px-1.5 py-0.5 rounded ${bank.logoBg}`}>
                                {bank.logoText}
                              </span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                            </div>
                            <span className="text-[10px] font-bold text-slate-900 truncate">
                              {bank.shortName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Full Searchable Indian Bank List */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <span>All Indian Banks ({filteredBanks.length})</span>
                    {selectedBank && (
                      <button
                        type="button"
                        onClick={() => setSelectedBank('')}
                        className="text-blue-600 hover:underline font-bold lowercase"
                      >
                        clear selection
                      </button>
                    )}
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                    {filteredBanks.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                        No Indian bank found matching "<span className="font-bold">{bankSearch}</span>"
                      </div>
                    ) : (
                      filteredBanks.map((bank) => {
                        const isSelected = selectedBank === bank.name;
                        return (
                          <div
                            key={bank.id}
                            onClick={() => {
                              setSelectedBank(bank.name);
                              setFormError('');
                            }}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/90 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 ${bank.logoBg}`}>
                                {bank.logoText}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-extrabold text-slate-900 truncate">
                                  {bank.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  IFSC Code: <span className="font-bold text-slate-600">{bank.code}</span>
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 pl-2">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Selected Bank Banner */}
                {selectedBank ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-bold truncate">Selected Bank: {selectedBank}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider shrink-0 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      Confirmed
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Please select an Indian bank from above to enable Net Banking placement.</span>
                  </div>
                )}

                {/* Demo Outcome Configuration Controller */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      ⚙️ Demo Simulation Response Outcome
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      Simulates Gateway Auth
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDemoOutcome('RANDOM')}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all ${
                        demoOutcome === 'RANDOM'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      🎲 Random (80% Pass)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoOutcome('ALWAYS_SUCCESS')}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all ${
                        demoOutcome === 'ALWAYS_SUCCESS'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      ✅ Force Success
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoOutcome('ALWAYS_FAIL')}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all ${
                        demoOutcome === 'ALWAYS_FAIL'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      ❌ Force Failure
                    </button>
                  </div>
                </div>

              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40 text-amber-800 text-xs space-y-2 animate-fade-in">
                <p className="font-bold flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 shrink-0" /> Pay Cash on Delivery (COD)</p>
                <p className="text-[11px] leading-relaxed">
                  A verification SMS/OTP will be sent to your phone number prior to dispatcher transit. Please have exactly <span className="font-bold font-mono text-slate-900">₹{grandTotal}</span> in cash ready at your doorstep. No installation checks can be paid in COD.
                </p>
              </div>
            )}
          </div>

          {/* Place Order CTA Button */}
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/20 cursor-pointer"
          >
            <ShieldCheck className="h-4.5 w-4.5" />
            <span>Securely Place Order (₹{grandTotal})</span>
          </button>

        </form>

        {/* Right Column: Mini Order Summary Receipt */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Summary</h3>
          
          {/* Scrollable list */}
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
            {cart.map((item) => {
              const baseCost = item.product.price;
              const actualCost = item.withInstallation ? baseCost + 49 : baseCost;
              return (
                <div key={`${item.product.id}-${item.withInstallation}`} className="flex items-center gap-3 py-2 border-b border-slate-150/55 last:border-0">
                  <img
                    src={item.product.image || getFallbackProductImage(item.product.category, item.product.name)}
                    alt={item.product.name}
                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-white"
                    referrerPolicy="no-referrer"
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
                    <h4 className="text-[11px] font-extrabold text-slate-900 truncate">{item.product.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium font-mono">Qty: {item.quantity} × ₹{actualCost}</p>
                    {item.withInstallation && (
                      <span className="text-[9px] text-blue-600 font-bold block">🛠️ Included Installation</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-950 font-mono shrink-0">₹{actualCost * item.quantity}</span>
                </div>
              );
            })}
          </div>

          {/* Pricing Row details */}
          <div className="space-y-2 pt-4 border-t border-slate-200 text-xs font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-mono font-bold text-slate-950">₹{rawSubtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>GST/Sales Tax (5%)</span>
              <span className="font-mono font-bold text-slate-950">₹{taxes}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Speed Fee</span>
              <span className="font-mono font-bold text-slate-950">
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>Coupon Deduct</span>
                <span className="font-mono">-₹{discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-3 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="font-mono text-base">₹{grandTotal}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 text-[10px] text-slate-400 leading-normal flex items-start gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
            <p>Your details are protected using standard 256-bit SSL encryption. Warranty certificates are generated instantly on success.</p>
          </div>
        </div>

      </div>

      {/* RENDER SIMULATED SECURE PAYMENT GATEWAY OVERLAY MODAL */}
      {showGateway && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-150 overflow-hidden flex flex-col animate-fade-in">
            
            {/* Gateway Brand Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Secure Payment Gateway</h4>
                  <p className="text-[10px] text-slate-400 font-mono font-bold">
                    {paymentMethod === 'card' ? 'Visa/Mastercard Protocol' : paymentMethod === 'upi' ? 'UPI Secure Net' : 'Bank NetBanking Portal'}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleCancelPayment}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Gateway Body */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* Transaction Summary Block */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Merchant Reference</p>
                  <p className="font-extrabold text-slate-800 mt-0.5">ElectroFix Care E-Store</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-1">Session ID: {paymentSession?.transactionId}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Amount Due</p>
                  <p className="text-base font-mono font-extrabold text-blue-600 mt-0.5">₹{grandTotal}</p>
                </div>
              </div>

              {gatewayStep === 'input' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                      {paymentMethod === 'card' && 'Enter 3D-Secure 6-Digit SMS OTP'}
                      {paymentMethod === 'upi' && 'Enter your 6-Digit Secure UPI MPIN'}
                      {paymentMethod === 'netbanking' && 'Enter Bank Security Password'}
                    </label>
                    
                    <input
                      type={paymentMethod === 'netbanking' ? 'password' : 'tel'}
                      placeholder={paymentMethod === 'card' ? '6-Digit OTP Code' : paymentMethod === 'upi' ? 'UPI MPIN' : 'Bank Password'}
                      value={gatewayPin}
                      onChange={(e) => setGatewayPin(e.target.value)}
                      maxLength={paymentMethod === 'netbanking' ? 30 : 6}
                      className="w-full text-center text-sm font-bold font-mono tracking-widest px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-[9px] text-slate-400 text-center leading-relaxed max-w-xs mx-auto">
                      {paymentMethod === 'card' && `Enter the secure code sent to the phone associated with card ending in **** ${cardNumber.replace(/\s+/g, '').slice(-4)}.`}
                      {paymentMethod === 'upi' && `Authorize this request using your secure UPI MPIN for virtual address ${upiId}.`}
                      {paymentMethod === 'netbanking' && `Authenticate using your online banking security credentials for ${selectedBank}.`}
                    </p>
                  </div>

                  {/* Simulated Actions */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleVerifyPayment('SUCCESS')}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Simulate Successful Payment</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleVerifyPayment('FAILURE')}
                      className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Simulate Failed Payment
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCancelPayment}
                      className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel Payment
                    </button>
                  </div>
                </div>
              )}

              {gatewayStep === 'loading' && (
                <div className="py-10 text-center space-y-6 animate-fade-in">
                  <div className="flex justify-center">
                    <RefreshCw className="h-10 w-10 text-blue-600 animate-spin" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">
                      {[
                        "Contacting your issuing bank...",
                        "Validating digital payment token...",
                        "Verifying status with backend ledger...",
                        "Updating warehouse inventory allocations...",
                        "Finishing up order invoice creation..."
                      ][verificationStep] || "Processing transaction verification..."}
                    </h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Secure Gateway Verification</p>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${((verificationStep + 1) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {gatewayStep === 'success' && (
                <div className="py-10 text-center space-y-4 animate-fade-in">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 shadow-md">
                    <Check className="h-8 w-8 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Payment Verified!</h4>
                    <p className="text-xs text-slate-400">Order successfully recorded. Redirecting to invoice...</p>
                  </div>
                </div>
              )}

              {gatewayStep === 'failed' && (
                <div className="py-6 text-center space-y-5 animate-fade-in">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-100">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Transaction Failed</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">{gatewayError || 'Your bank issuer declined the transaction authorization.'}</p>
                  </div>
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setGatewayStep('input')}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Retry Payment
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelPayment}
                      className="w-full py-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Back to Checkout
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
