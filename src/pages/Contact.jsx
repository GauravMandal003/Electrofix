import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, ChevronUp, Map, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [activeFaq, setActiveFaq] = useState(0);
  
  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('repair');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const faqs = [
    {
      question: 'Do I pay if my device cannot be fixed?',
      answer: 'Absolutely not! We adhere to a strict "No-Fix, No-Fee" policy. If our technicians determine that a motherboard or component is completely unsalvageable, you do not pay a single cent, and the diagnostic is entirely free.',
    },
    {
      question: 'What does the 1-Year ElectroFix Warranty cover?',
      answer: 'It covers all replacement parts (OLED screens, batteries, chips) and technical micro-soldering connections against defects, loose joints, or failure. It does not cover secondary user drops, water immersion, or third-party tampering.',
    },
    {
      question: 'How do home visits for large appliances work?',
      answer: 'Simply use our Quote Estimator or contact form to request a slot. We assign a certified field mechanic who will arrive with all heavy diagnostics kits, compressors, and parts. 90% of household washing machines and refrigerators are fixed on the first visit.',
    },
    {
      question: 'Do you use original factory replacement parts?',
      answer: 'We use original equipment manufacturer (OEM) grade components. Every replacement screen, battery cell, and capacitor meets or exceeds original factory tolerances, ensuring your device has a long, optimal lifecycle.',
    },
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !msg) {
      alert('Please fill out all required fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Reset state after success displays
      setTimeout(() => {
        setSuccess(false);
        setName('');
        setEmail('');
        setMsg('');
      }, 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="pt-32 pb-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
            24/7 Service Channels
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
            Connect With Our Mechanics
          </h2>
          <p className="text-slate-500 mt-3.5 text-base sm:text-lg">
            Ready to schedule a repair or trade-in? Fill out the secure form, view our workshop coordinates, or browse FAQs.
          </p>
        </div>

        {/* Contact Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mb-20">
          
          {/* Left: Contact Info and Interactive Radar Map (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Direct Support channels */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="font-display text-lg font-bold text-slate-900">Direct Channels</h3>
              
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Call Support</h4>
                  <a href="tel:+18005553498" className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors mt-0.5 block">
                    +1 (800) 555-FIXIT
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">Toll-free, Mon-Sun 8 AM - 10 PM EST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Enquiries</h4>
                  <a href="mailto:help@electrofix.com" className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors mt-0.5 block">
                    help@electrofix.com
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">Response within 60 minutes guaranteed</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Central Workshop</h4>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 leading-normal">
                    Suite 400, Electronic Row, NY 10012
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Walk-ins welcome. Ample customer parking.</p>
                </div>
              </div>
            </div>

            {/* Stylized CSS radar workshop map */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border-4 border-slate-800 relative overflow-hidden flex-1 flex flex-col justify-between min-h-[220px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
              
              {/* Grid map mock lines */}
              <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20" />

              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-blue-400" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">RADAR GPS TRACKER</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
              </div>

              {/* Centered locator pinpoint */}
              <div className="relative my-6 flex justify-center items-center h-20 z-10">
                {/* Radar rings */}
                <div className="absolute h-16 w-16 rounded-full border border-blue-500/20 animate-pulse" />
                <div className="absolute h-28 w-28 rounded-full border border-blue-500/10 animate-ping" />
                <div className="h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                  <div className="h-3.5 w-3.5 rounded-full bg-blue-500 shadow-md shadow-blue-500/50" />
                </div>
              </div>

              <div className="relative z-10">
                <h4 className="font-display text-xs font-bold">New York Center Workshop Location</h4>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  Conveniently centered inside the Manhattan Technology Innovation Quarter.
                </p>
              </div>
            </div>

          </div>

          {/* Right: Premium contact / ticket submission form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            {success ? (
              <div className="text-center py-14 my-auto">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <CheckCircle className="h-9 w-9" />
                </div>
                <h4 className="font-display text-2xl font-bold text-slate-900">Message Received!</h4>
                <p className="text-slate-500 text-xs mt-3 max-w-sm mx-auto leading-relaxed">
                  Thank you for contacting ElectroFix. Your enquiry ticket is logged in our central queue. Our dispatch specialists will follow up at <strong>{email}</strong> within 30-60 minutes.
                </p>
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 max-w-xs mx-auto text-[10px] font-mono text-slate-400">
                  TICKET ID: #EF-{Math.floor(1000 + Math.random() * 9000)}-MSG
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-1.5">Request Support or Dispatch</h3>
                <p className="text-slate-500 text-xs mb-6">
                  Fill out the secure ticket below to contact our central dispatch. We handle diagnostics, home call schedulers, and warranty reviews.
                </p>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-850 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-850 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Enquiry Department
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 focus:bg-white transition-all"
                      id="contact-department"
                    >
                      <option value="repair">Book a Repair Ticket (Phones, Laptops, Consoles)</option>
                      <option value="appliance">Major Domestic Appliance Field Visit (Fridges, Washers)</option>
                      <option value="tradein">Trade-In pickup & Buyout valuation</option>
                      <option value="warranty">12-Month Mechanical Warranty Claim</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Message, Device Make/Model, or Issue *
                    </label>
                    <textarea
                      required
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      rows={4}
                      placeholder="Include any symptoms, faulty buttons, or device age. We respond rapidly..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span>Submit Ticket</span>
                        <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>

        {/* Dynamic FAQ Accordion section below */}
        <div className="border-t border-slate-200 pt-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 mb-3">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900">
              Frequently Answered Questions
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
              Quick mechanics answers to core diagnostic and service enquiries.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none cursor-pointer hover:bg-slate-50/50"
                  id={`faq-toggle-${i}`}
                >
                  <span className="font-display text-sm font-bold text-slate-900 leading-normal">
                    {faq.question}
                  </span>
                  {activeFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </button>

                {activeFaq === i && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-500 leading-relaxed border-t border-slate-100 animate-in fade-in slide-in-from-top-1">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
