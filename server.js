// server.js - Full-Stack Express Server with Products API and Orders API
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

import { connectDB, User, Product, Order, Booking, Notification } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Database Connection
await connectDB();

// ----------------------------------------------------
// Authentication REST API routes
// ----------------------------------------------------

// Register API
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter all fields.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    const token = `token-${newUser._id || newUser.id || Date.now()}`;

    res.status(201).json({
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter all fields.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = `token-${user._id || user.id || Date.now()}`;

    res.json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during sign in.' });
  }
});

// Get Current Profile API
app.get('/api/auth/me', async (req, res) => {
  try {
    const userId = req.query.id || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required.' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Auth profile error:', error);
    res.status(500).json({ error: 'Server error retrieving user details.' });
  }
});

// Forgot Password API
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please enter your email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist.' });
    }

    const token = `reset-token-${user._id || user.id}-${Date.now()}`;

    res.json({
      message: 'Password reset token generated successfully.',
      token,
      email: user.email
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error processing forgot password.' });
  }
});

// Reset Password API
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const user = await User.findOne({ email: email ? email.toLowerCase() : '' });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(user._id || user.id, { password: hashedPassword });

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error resetting password.' });
  }
});


// ----------------------------------------------------
// AI Support Chatbot & Helper Routes
// ----------------------------------------------------

let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Using intelligent rules fallback for support chatbot.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Intelligent keyword matching fallback responder
function getFallbackResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('book') || msg.includes('repair') || msg.includes('service') || msg.includes('fix') || msg.includes('technician')) {
    return "To book a professional repair service, please navigate to our **Services** page. You can select your device type, describe the issue, choose a convenient date/time, and book a certified technician in under 2 minutes!";
  }
  if (msg.includes('track') || msg.includes('order') || msg.includes('status') || msg.includes('shipment')) {
    return "To track your order, please log in to your account and visit the **Orders** tab on our Shop page. If you ordered as a guest, you can check the order tracking status using the query option, or check your confirmation email for the tracking link. If you have an Order ID (e.g., `EF-ORD-XXXXX`), let me know!";
  }
  if (msg.includes('product') || msg.includes('buy') || msg.includes('shop') || msg.includes('parts') || msg.includes('refurbished')) {
    return "ElectroFix offers certified refurbished premium electronics (smartphones, laptops, tablets) and genuine OEM spare parts (PCBs, AC components, smart switches). Every item is rigorously tested, cleaned, and certified by our in-house engineers.";
  }
  if (msg.includes('warranty') || msg.includes('guarantee')) {
    return "We stand behind our quality! All professional repair services come with our iron-clad **12-month ElectroFix Guarantee** covering parts and mechanics. All purchases from our Refurbished Shop include a **30-day warranty and returns period**.";
  }
  if (msg.includes('return') || msg.includes('refund') || msg.includes('exchange')) {
    return "We offer a hassle-free **30-day return & refund policy** on all refurbished shop products and spare parts. If you are not satisfied, go to your Orders tab to request a return or exchange, or contact our support.";
  }
  if (msg.includes('install') || msg.includes('setup') || msg.includes('technician home')) {
    return "For heavy or complex equipment like air conditioners, smart home systems, or TVs, we offer optional professional home installation. Simply tick the 'Include Professional Installation' checkbox in your cart before checkout!";
  }
  if (msg.includes('agent') || msg.includes('human') || msg.includes('contact') || msg.includes('phone') || msg.includes('email') || msg.includes('support')) {
    return "Our human support team is available 24/7! You can reach us by calling toll-free at **1-800-ELECTRO-FIX** or emailing **support@electrofix.com**. We are always here to help you!";
  }
  
  return "I'm sorry, I couldn't find that information. Please contact our support team.";
}

app.post('/api/support/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      const reply = getFallbackResponse(message);
      return res.json({ reply });
    }

    const systemInstruction = `You are the official 24/7 AI Customer Support Assistant for ElectroFix, a premium professional electronics repair, refurbished device shop, and appliance trade-in website.
Your tone should be professional, concise, reassuring, and highly helpful.
Use markdown for formatting when appropriate (like bolding key terms with **bold**).

Here is key information about ElectroFix services:
1. Book a Repair: Customers can book premium repair services for home appliances, smartphones, laptops, and gadgets by going to the 'Services' page. A certified technician will be scheduled.
2. Track My Order: Customers can view and track their orders on the 'Orders' tab of the Shop page. Guests can search by Order ID (e.g. EF-ORD-XXXXX) or their email.
3. Product Info: We sell certified refurbished high-quality devices (phones, tablets, laptops) and 100% genuine OEM factory spare parts (PCBs, AC components, smart switches).
4. Warranty: Repairs include an iron-clad 12-month parts & mechanics guarantee. Shop products feature a 30-day warranty and returns policy.
5. Returns & Refunds: Hassle-free 30-day returns on any refurbished device or spare part. Users can initiate returns directly from their order logs.
6. Installation Support: Heavy appliances (ACs, smart TVs, geysers) offer an optional professional technician home installation during checkout.
7. Contact Support: 24/7 hotline at 1-800-ELECTRO-FIX or email support@electrofix.com.

CRITICAL INSTRUCTION:
If a user asks something unrelated to electronics, appliance repairs, ElectroFix, or something you absolutely cannot answer or do not have enough information about, you MUST output exactly:
"I'm sorry, I couldn't find that information. Please contact our support team."`;

    const contents = [];
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach(msg => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || "I'm sorry, I couldn't find that information. Please contact our support team.";
    res.json({ reply });

  } catch (error) {
    console.error('AI chat endpoint error:', error);
    const reply = getFallbackResponse(req.body.message || "");
    res.json({ reply });
  }
});

// ----------------------------------------------------
// Products REST API routes
// ----------------------------------------------------

// List Products
app.get('/api/products', async (req, res) => {
  try {
    const productsList = await Product.find({});
    res.json(productsList);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// Get Single Product details
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    console.error('Fetch product error:', error);
    res.status(500).json({ error: 'Failed to retrieve product details.' });
  }
});

// Post a review
app.post('/api/products/:id/review', async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    if (!name || !rating || !comment) {
      return res.status(400).json({ error: 'Please enter name, rating, and comment.' });
    }

    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const newReview = {
      name,
      rating: Number(rating),
      comment,
      date: new Date().toLocaleDateString()
    };

    const updatedReviews = [newReview, ...(product.reviews || [])];
    const newAvg = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));

    const updatedProduct = await Product.updateOne(
      { id: req.params.id },
      {
        reviews: updatedReviews,
        rating: newAvg
      }
    );

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});


// ----------------------------------------------------
// Orders REST API routes
// ----------------------------------------------------

// Stock reduction helper function
async function reduceProductStock(items) {
  for (const item of items) {
    try {
      const product = await Product.findOne({ id: item.product.id });
      if (product) {
        const currentStock = typeof product.stock === 'number' ? product.stock : 10;
        const newStock = Math.max(0, currentStock - item.quantity);
        await Product.updateOne({ id: item.product.id }, { stock: newStock });
        console.log(`[Server] [STOCK_REDUCTION] Reduced stock for product "${product.name}" (ID: ${item.product.id}) from ${currentStock} to ${newStock}.`);
      }
    } catch (err) {
      console.error(`[Server] Error reducing stock for product ${item.product.id}:`, err);
    }
  }
}

// Simulated active payments registry to handle webhook and transaction validation securely
const activePayments = new Map();


// 1. Payment Initiation API (Online Payments: Card, UPI, Net Banking)
app.post('/api/payments/initiate', async (req, res) => {
  try {
    const { paymentMethod, selectedBank, amount, items, shippingAddress } = req.body;
    if (!paymentMethod || !amount || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing payment initiation fields.' });
    }

    // Use unique identifiers, idempotency and request locking
    const transactionId = `PAY-TXN-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const signature = `SIG-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const paymentSession = {
      transactionId,
      amount,
      paymentMethod: paymentMethod === 'netbanking' ? 'Net Banking' : paymentMethod.toUpperCase(),
      selectedBank: paymentMethod === 'netbanking' ? selectedBank : (req.body.selectedBank || null),
      status: 'Processing',
      signature,
      createdAt: new Date().toISOString(),
      items,
      shippingAddress,
      gateway: paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'upi' ? 'UPI' : 'Net Banking (Demo)'
    };

    activePayments.set(transactionId, paymentSession);
    console.log(`[Server] [PAYMENT_INITIATE] Created pending transaction ${transactionId} via ${paymentSession.gateway}, Bank: ${paymentSession.selectedBank || 'N/A'}`);

    res.status(200).json({
      transactionId,
      amount,
      currency: 'INR',
      paymentMethod,
      selectedBank: paymentSession.selectedBank,
      gateway: paymentSession.gateway,
      status: 'Processing',
      signature
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Server error during payment initiation.' });
  }
});

// 2. Payment Webhook Mock endpoint (For Gateway simulation confirmation)
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const { transactionId, status } = req.body;
    console.log(`[Server] [WEBHOOK_RECEIVED] Gateway Callback received for transaction: ${transactionId} with status: ${status}`);
    
    const txn = activePayments.get(transactionId);
    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    txn.status = status === 'SUCCESS' ? 'Paid' : status === 'CANCELLED' ? 'Cancelled' : 'Failed';
    activePayments.set(transactionId, txn);

    res.json({ received: true, status: txn.status });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// 3. Payment Verification & Order Creation API (Online payments)
app.post('/api/payments/verify', async (req, res) => {
  try {
    const { transactionId, status, paymentDetails, costs, estimatedDays, withInstallation, userId, email } = req.body;

    if (!transactionId || !status || !paymentDetails || !costs) {
      return res.status(400).json({ error: 'Incomplete verification payload.' });
    }

    console.log(`[Server] [PAYMENT_VERIFY] Verifying payment for transaction ${transactionId} with status: ${status}`);

    // Retrieve corresponding session from server state
    const session = activePayments.get(transactionId);
    if (!session) {
      return res.status(404).json({ error: 'Payment session expired or invalid. Please retry.' });
    }

    // Double check duplicate order insertion (idempotency key / transaction ID validation check)
    const existingOrder = await Order.findOne({ transactionId });
    if (existingOrder) {
      console.log(`[Server] [DUPLICATE_PREVENTION] Order already exists for Transaction ID: ${transactionId}. Returning existing order.`);
      return res.status(200).json(existingOrder);
    }

    if (status !== 'SUCCESS') {
      session.status = status === 'CANCELLED' ? 'Cancelled' : 'Failed';
      activePayments.set(transactionId, session);
      return res.status(400).json({ error: 'Payment has not been completed successfully.', status: session.status });
    }

    // Server-side Payment verification - ensure session state matches
    session.status = 'Paid';
    activePayments.set(transactionId, session);

    // Create the Order ONLY after payment has been verified as successful
    const orderId = `EF-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const invoiceNo = `EF-INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentIsoTimestamp = new Date().toISOString();

    const formattedPaymentMethod = session.paymentMethod === 'netbanking' || session.paymentMethod === 'NETBANKING'
      ? 'Net Banking'
      : (session.paymentMethod || paymentDetails.method || 'Online');

    const newOrder = await Order.create({
      orderId,
      userId: userId || null,
      email: session.shippingAddress.email || email || 'guest',
      date: new Date().toLocaleDateString(),
      items: session.items,
      shippingAddress: session.shippingAddress,
      paymentDetails: {
        method: formattedPaymentMethod,
        paymentMethod: formattedPaymentMethod,
        selectedBank: session.selectedBank || paymentDetails.selectedBank || null,
        last4: paymentDetails.last4 || session.selectedBank || 'DEMO',
        paymentStatus: 'Success',
        transactionId: transactionId,
        invoiceNo: invoiceNo,
        timestamp: currentIsoTimestamp
      },
      costs,
      status: 'Confirmed',
      orderStatus: 'Confirmed',
      paymentStatus: 'Success',
      selectedBank: session.selectedBank || paymentDetails.selectedBank || null,
      transactionId,
      invoiceNo,
      estimatedDays: estimatedDays || 3,
      withInstallation: withInstallation || false,
      createdAt: currentIsoTimestamp
    });

    // Reduce product stock in the database upon successful payment
    await reduceProductStock(session.items);

    try {
      await Notification.create({
        title: 'New Order Placed',
        message: `New order #${orderId} placed for ₹${costs?.total || costs?.grandTotal || 0}.`,
        body: `New order #${orderId} placed for ₹${costs?.total || costs?.grandTotal || 0}.`,
        type: 'order',
        recipient: 'admin',
        orderId,
        createdAt: currentIsoTimestamp
      });
    } catch (nErr) {
      console.warn('Failed to save order notification:', nErr);
    }

    console.log(`[Server] [SUCCESS] Order ${orderId} created successfully. Invoice generated: ${invoiceNo}`);
    
    // Remove transaction from active registry after successful resolution
    activePayments.delete(transactionId);

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Payment verification/Order creation error:', error);
    res.status(500).json({ error: 'Failed to verify payment and save order.' });
  }
});

// 4. Cash on Delivery (COD) Immediate Order Creation API
app.post('/api/orders', async (req, res) => {
  try {
    const { items, shippingAddress, paymentDetails, costs, estimatedDays, withInstallation, userId } = req.body;

    if (!items || items.length === 0 || !shippingAddress || !paymentDetails || !costs) {
      return res.status(400).json({ error: 'Incomplete order placement fields.' });
    }

    // Only allow COD via this route
    if (paymentDetails.method !== 'COD') {
      return res.status(400).json({ error: 'Online payments must be processed via the /api/payments/verify gateway route.' });
    }

    const orderId = `EF-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const invoiceNo = `EF-INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await Order.create({
      orderId,
      userId: userId || null,
      email: shippingAddress.email || 'guest',
      date: new Date().toLocaleDateString(),
      items,
      shippingAddress,
      paymentDetails: {
        method: 'COD',
        last4: 'COD',
        paymentStatus: 'Pending',
        invoiceNo: invoiceNo
      },
      costs,
      status: 'Confirmed (Cash on Delivery)',
      paymentStatus: 'Pending',
      invoiceNo,
      estimatedDays: estimatedDays || 3,
      withInstallation: withInstallation || false
    });

    // Reduce product stock in database
    await reduceProductStock(items);

    try {
      await Notification.create({
        title: 'New COD Order Placed',
        message: `New COD order #${orderId} placed for ₹${costs?.total || costs?.grandTotal || 0}.`,
        body: `New COD order #${orderId} placed for ₹${costs?.total || costs?.grandTotal || 0}.`,
        type: 'order',
        recipient: 'admin',
        orderId,
        createdAt: new Date().toISOString()
      });
    } catch (nErr) {
      console.warn('Failed to save COD notification:', nErr);
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Place COD order error:', error);
    res.status(500).json({ error: 'Failed to place COD order.' });
  }
});

// View Orders API
app.get('/api/orders', async (req, res) => {
  try {
    let orderList = [];
    const userId = req.query.userId || req.query.user;
    const emailQuery = req.query.email;

    if (userId) {
      orderList = await Order.find({ userId });
    } else if (emailQuery) {
      orderList = await Order.find({ email: emailQuery.toLowerCase() });
    } else {
      orderList = await Order.find({});
    }

    // Sort by latest created
    orderList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orderList);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// Cancel Order API
app.post('/api/orders/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.status !== 'Confirmed' && order.status !== 'Processing') {
      return res.status(400).json({ error: 'Orders can only be cancelled before dispatching.' });
    }

    await Order.updateOne({ orderId }, { status: 'Cancelled' });
    res.json({ success: true, status: 'Cancelled' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order.' });
  }
});

// Simulate Tracking Status API
app.post('/api/orders/:orderId/simulate', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const TRACK_STEPS = ["Confirmed", "Processing", "Dispatched", "Out for Delivery", "Delivered"];
    const currentIdx = TRACK_STEPS.indexOf(order.status);
    
    if (currentIdx > -1 && currentIdx < TRACK_STEPS.length - 1) {
      const nextStatus = TRACK_STEPS[currentIdx + 1];
      await Order.updateOne({ orderId }, { status: nextStatus });
      return res.json({ success: true, status: nextStatus });
    }

    res.json({ success: true, status: order.status });
  } catch (error) {
    console.error('Simulate order status error:', error);
    res.status(500).json({ error: 'Failed to advance order tracking status.' });
  }
});

// Return Order API
app.post('/api/orders/:orderId/return', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, type, notes } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    await Order.updateOne({ orderId }, {
      status: 'Return Requested',
      returnClaim: { reason, type, notes }
    });

    res.json({ success: true, status: 'Return Requested' });
  } catch (error) {
    console.error('Return claim error:', error);
    res.status(500).json({ error: 'Failed to file return request.' });
  }
});


// ----------------------------------------------------
// Production-grade Admin Portal Endpoints
// ----------------------------------------------------

// Admin Login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if ((email === 'gaurav00@gmail.com' || email === 'mandalgaurav775@gmail.com') && password === '123456') {
      const token = 'admin-auth-token-super-id';
      return res.json({
        token,
        user: {
          id: 'admin-super-id',
          name: 'Super Admin',
          email,
          role: 'admin'
        }
      });
    } else {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error during admin login.' });
  }
});

// Get all users
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Fetch users admin error:', error);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// Block/Delete a user
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { blocked: true });
    res.json({ success: true, message: 'User blocked/deleted successfully.' });
  } catch (error) {
    console.error('Block user admin error:', error);
    res.status(500).json({ error: 'Failed to block/delete user.' });
  }
});

// Create new product
app.post('/api/admin/products', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id || !data.name || !data.price) {
      return res.status(400).json({ error: 'Please enter required fields (id, name, price).' });
    }
    const newProduct = await Product.create(data);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product admin error:', error);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

// Update product
app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const data = req.body;
    const updated = await Product.findByIdAndUpdate(req.params.id, data);
    res.json(updated);
  } catch (error) {
    console.error('Update product admin error:', error);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// Delete product
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    await Product.updateOne({ id: req.params.id }, { deleted: true });
    res.json({ success: true, message: 'Product deleted/hidden successfully.' });
  } catch (error) {
    console.error('Delete product admin error:', error);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// Get all orders
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (error) {
    console.error('Fetch orders admin error:', error);
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// Update order status
app.put('/api/admin/orders/:orderId', async (req, res) => {
  try {
    const data = req.body;
    const updated = await Order.findByIdAndUpdate(req.params.orderId, data);
    res.json(updated);
  } catch (error) {
    console.error('Update order admin error:', error);
    res.status(500).json({ error: 'Failed to update order.' });
  }
});


// ----------------------------------------------------
// UI Bundle and Vite Server Setup
// ----------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  console.log('Running Express server in DEVELOPMENT mode with Vite middleware...');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  console.log('Running Express server in PRODUCTION mode with static files...');
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ElectroFix full-stack server running on http://localhost:${PORT}`);
});
