// ChatWidget.jsx - Interactive AI Customer Support floating assistant
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, X, Minus, Trash2, Send, Bot, User, ArrowLeft,
  Sparkles, Phone, ShieldCheck, Wrench, RefreshCw, ChevronUp
} from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ef_support_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading chat session messages:', e);
    }
    return [
      {
        id: 'welcome',
        sender: 'ai',
        text: '👋 Welcome to ElectroFix Customer Support. How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Quick Action options mapped to their quick replies / actions
  const QUICK_ACTIONS = [
    { label: 'Book a Repair', icon: Wrench, value: 'Book a Repair' },
    { label: 'Track My Order', icon: RefreshCw, value: 'Track My Order' },
    { label: 'Product Information', icon: Sparkles, value: 'Product Information' },
    { label: 'Warranty', icon: ShieldCheck, value: 'Warranty' },
    { label: 'Returns & Refunds', icon: Trash2, value: 'Returns & Refunds' },
    { label: 'Installation Support', icon: Bot, value: 'Installation Support' },
    { label: 'Contact Human Agent', icon: Phone, value: 'Contact Human Agent' },
  ];

  // Map quick action replies for instant high-speed responses
  const QUICK_ACTION_ANSWERS = {
    'Book a Repair': "To book a professional repair service, please navigate to our **Services** page. You can select your device type, describe the issue, choose a convenient date/time, and book a certified technician in under 2 minutes!",
    'Track My Order': "To track your order, please log in to your account and visit the **Orders** tab on our Shop page. If you ordered as a guest, you can check the order tracking status using the query option, or check your confirmation email for the tracking link. If you have an Order ID (e.g., `EF-ORD-XXXXX`), let me know!",
    'Product Information': "ElectroFix offers certified refurbished premium electronics (smartphones, laptops, tablets) and genuine OEM spare parts (PCBs, AC components, smart switches). Every item is rigorously tested, cleaned, and certified by our in-house engineers.",
    'Warranty': "We stand behind our quality! All professional repair services come with our iron-clad **12-month ElectroFix Guarantee** covering parts and mechanics. All purchases from our Refurbished Shop include a **30-day warranty and returns period**.",
    'Returns & Refunds': "We offer a hassle-free **30-day return & refund policy** on all refurbished shop products and spare parts. If you are not satisfied, go to your Orders tab to request a return or exchange, or contact our support.",
    'Installation Support': "For heavy or complex equipment like air conditioners, smart home systems, or TVs, we offer optional professional home installation. Simply tick the 'Include Professional Installation' checkbox in your cart before checkout!",
    'Contact Human Agent': "Our human support team is available 24/7! You can reach us by calling toll-free at **1-800-ELECTRO-FIX** or emailing **support@electrofix.com**. We are always here to help you!"
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isMinimized]);

  // Persist messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('ef_support_chat_messages', JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving support chat messages:', e);
    }
  }, [messages]);

  // Listen to global open-support-chat event
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener('open-support-chat', handleOpenChat);
    return () => {
      window.removeEventListener('open-support-chat', handleOpenChat);
    };
  }, []);

  // Handle send message logic
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || messageText;
    if (!text.trim()) return;

    if (!textToSend) {
      setMessageText('');
    }

    // Append user message
    const userMsg = {
      id: Math.random().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // If it is a quick action, respond instantly with custom predefined answer
    if (QUICK_ACTION_ANSWERS[text]) {
      setTimeout(() => {
        const aiMsg = {
          id: Math.random().toString(),
          sender: 'ai',
          text: QUICK_ACTION_ANSWERS[text],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, 700);
      return;
    }

    // Otherwise, call the backend AI Gemini route
    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await response.json();
      
      const aiMsg = {
        id: Math.random().toString(),
        sender: 'ai',
        text: data.reply || "I'm sorry, I couldn't find that information. Please contact our support team.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const aiMsg = {
        id: Math.random().toString(),
        sender: 'ai',
        text: "I'm sorry, I couldn't find that information. Please contact our support team.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear your support chat session?')) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: '👋 Welcome to ElectroFix Customer Support. How can I help you today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      try {
        sessionStorage.removeItem('ef_support_chat_messages');
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Determine if user has actively started chatting
  const hasChatted = messages.length > 1;

  const handleBackClick = () => {
    setIsOpen(false);
  };

  const handleCloseClick = () => {
    if (hasChatted) {
      setShowConfirm(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button - Styled beautifully with pulse indicator */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:shadow-blue-600/30 transition-all border border-blue-500/20"
          id="chat-floating-launcher"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
          <MessageSquare className="h-6 w-6" />
        </motion.button>
      )}

      {/* Main Chat Widget Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '560px'
            }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden"
            id="chat-widget-container"
          >
            {/* Confirmation overlay inside the chat modal */}
            <AnimatePresence>
              {showConfirm && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 max-w-[290px] text-center space-y-4"
                  >
                    <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-display">Leave Chat?</h4>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Are you sure you want to leave this chat?</p>
                    </div>
                    <div className="flex gap-2.5 pt-1">
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                      >
                        Continue Chat
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirm(false);
                          setIsOpen(false);
                        }}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm shadow-red-600/10"
                      >
                        Leave Chat
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header section with brand color and controls */}
            <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                {/* Visible Back (←) button */}
                <button
                  onClick={handleBackClick}
                  title="Go Back"
                  className="p-1 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer flex items-center justify-center group"
                >
                  <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
                </button>

                <div className="relative h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                  <Bot className="h-4 w-4" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-slate-900 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold tracking-wide uppercase font-display text-blue-400">ElectroFix Helpdesk</h4>
                  <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <span>AI Assistant</span>
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    <span>24/7 Support</span>
                  </p>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={handleClearChat}
                  title="Clear Conversation"
                  className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Expand" : "Minimize"}
                  className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {isMinimized ? <ChevronUp className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={handleCloseClick}
                  title="Close Helpdesk"
                  className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Body - Visible when not minimized */}
            {!isMinimized && (
              <>
                {/* Scrollable messages container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 max-w-[85%] ${
                        msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      {/* Avatar badge */}
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        msg.sender === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 border border-slate-200 text-slate-700'
                      }`}>
                        {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      </div>

                      {/* Message bubble */}
                      <div className="space-y-1">
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                        }`}>
                          {/* Rendering Markdown-like Bold tags manually */}
                          {(msg.text || '').split('\n').map((line, idx) => (
                            <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
                              {line.split('**').map((part, partIdx) => 
                                partIdx % 2 === 1 ? <strong key={partIdx} className="font-extrabold">{part}</strong> : part
                              )}
                            </p>
                          ))}
                        </div>
                        <p className={`text-[9px] text-slate-400 font-mono tracking-wider ${
                          msg.sender === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* AI Typing loading indicator */}
                  {isTyping && (
                    <div className="flex gap-2.5 max-w-[85%] mr-auto">
                      <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0">
                        <Bot className="h-3.5 w-3.5 animate-bounce" />
                      </div>
                      <div className="bg-white border border-slate-200 shadow-sm p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick actions listing */}
                <div className="px-4 py-2 bg-white border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Quick Actions</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none snap-x">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleSendMessage(action.value)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-[11px] font-bold rounded-xl shrink-0 snap-align-start cursor-pointer transition-all active:scale-95 shadow-sm"
                      >
                        <action.icon className="h-3 w-3" />
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Entry Input box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 bg-white border-t border-slate-100 flex gap-2"
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Ask ElectroFix Support..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || isTyping}
                    className="h-9 w-9 shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md shadow-blue-600/10 active:scale-95"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

                {/* Bottom Action Bar with Permanent Back Button */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)} // immediately close without confirmation
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-200/50 text-[11px] font-extrabold text-slate-600 hover:text-slate-900 uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Back</span>
                  </button>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
                    Support Live
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
