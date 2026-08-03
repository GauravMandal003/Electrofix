// src/services/paymentGatewayService.js
// Modular Payment Gateway Service with Demo Mode & future Razorpay/Stripe integration support

const isRealPaymentEnabled = () => {
  try {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ENABLE_REAL_PAYMENT === 'true') ||
      (typeof process !== 'undefined' && process.env?.ENABLE_REAL_PAYMENT === 'true')
    );
  } catch (e) {
    return false;
  }
};

export const PAYMENT_GATEWAY_CONFIG = {
  // Mode: 'DEMO' (default) | 'REAL' / 'RAZORPAY' / 'STRIPE'
  mode: isRealPaymentEnabled() ? 'REAL' : 'DEMO',
  currency: 'INR',
  currencySymbol: '₹',
  
  // Demo Mode Simulation outcome controls:
  // 'ALWAYS_SUCCESS' = Always succeed in Demo Mode (Default)
  // 'ALWAYS_FAIL' = Always fail
  // 'RANDOM' = Random outcome
  demoOutcomeMode: 'ALWAYS_SUCCESS',
  successProbability: 1.0,
  
  // Simulated processing delay in milliseconds (2-3 seconds as requested)
  processingDelayMs: 2200,

  // Future gateway credentials placeholder
  razorpayKeyId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAZORPAY_KEY) || '',
  stripePublicKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PUBLIC_KEY) || ''
};

/**
 * Configure demo outcome mode programmatically or via UI control
 */
export function setDemoOutcomeMode(mode) {
  if (['RANDOM', 'ALWAYS_SUCCESS', 'ALWAYS_FAIL'].includes(mode)) {
    PAYMENT_GATEWAY_CONFIG.demoOutcomeMode = mode;
  }
}

/**
 * Process payment transaction.
 * Written in a modular way so that if ENABLE_REAL_PAYMENT=true is set in the environment,
 * real payment gateways can be engaged seamlessly.
 */
export async function processPaymentTransaction({
  paymentMethod, // 'card' | 'upi' | 'netbanking' | 'cod'
  selectedBank = '',
  upiId = '',
  cardDetails = null,
  amount = 0,
  shippingAddress = {},
  cartItems = [],
  forcedOutcome = null // optional override: 'SUCCESS' | 'FAILURE'
}) {
  const methodLabelMap = {
    card: 'Credit/Debit Card',
    upi: 'UPI',
    netbanking: 'Net Banking',
    cod: 'Cash on Delivery'
  };

  const formattedMethod = methodLabelMap[paymentMethod] || paymentMethod.toUpperCase();

  // Check if real payment mode is requested via environment
  const activeMode = isRealPaymentEnabled() ? 'REAL' : 'DEMO';

  // 1. DEMO MODE SIMULATION (DEFAULT)
  if (activeMode === 'DEMO' || PAYMENT_GATEWAY_CONFIG.mode === 'DEMO') {
    return new Promise((resolve) => {
      setTimeout(() => {
        let isSuccessful = true;

        if (forcedOutcome) {
          isSuccessful = forcedOutcome === 'SUCCESS';
        } else if (PAYMENT_GATEWAY_CONFIG.demoOutcomeMode === 'ALWAYS_FAIL') {
          isSuccessful = false;
        } else {
          // Default: Always Success in Demo Mode
          isSuccessful = true;
        }

        const timestamp = new Date().toISOString();
        const randSuffix = Math.floor(1000 + Math.random() * 9000);
        const demoTxnId = `DEMO_${Math.floor(Date.now() / 1000)}_${randSuffix}`;

        if (isSuccessful) {
          resolve({
            success: true,
            status: 'SUCCESS',
            orderStatus: 'Confirmed',
            paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Success',
            transactionId: demoTxnId,
            currency: 'INR',
            currencySymbol: '₹',
            paymentMethod: formattedMethod,
            selectedBank: paymentMethod === 'netbanking' ? selectedBank : null,
            upiId: paymentMethod === 'upi' ? upiId : null,
            timestamp,
            message: 'Payment authorized and captured successfully in Demo Mode!'
          });
        } else {
          resolve({
            success: false,
            status: 'FAILURE',
            orderStatus: 'Failed',
            paymentStatus: 'Failed',
            transactionId: `DEMO_FAIL_${Math.floor(Date.now() / 1000)}_${randSuffix}`,
            paymentMethod: formattedMethod,
            selectedBank: paymentMethod === 'netbanking' ? selectedBank : null,
            timestamp,
            message: 'Payment simulated failure.'
          });
        }
      }, PAYMENT_GATEWAY_CONFIG.processingDelayMs);
    });
  }

  // 2. REAL PAYMENT GATEWAY (Triggered if ENABLE_REAL_PAYMENT=true)
  if (activeMode === 'REAL' || PAYMENT_GATEWAY_CONFIG.mode === 'RAZORPAY') {
    if (PAYMENT_GATEWAY_CONFIG.razorpayKeyId) {
      // Future integration hook for Razorpay SDK
      throw new Error('Razorpay SDK configuration pending.');
    } else if (PAYMENT_GATEWAY_CONFIG.stripePublicKey) {
      // Future integration hook for Stripe SDK
      throw new Error('Stripe SDK configuration pending.');
    }
  }

  throw new Error('Unsupported payment gateway configuration.');
}
