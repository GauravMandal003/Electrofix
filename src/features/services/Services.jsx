import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Wind, Tv, Flame, Droplet, Thermometer, Snowflake, Cpu, Lightbulb, Bell, 
  Wrench, Cable, Grid, Volume2, ShieldCheck, IndianRupee, Award, Clock, Calendar, 
  MapPin, Phone, User, Search, CheckCircle2, ChevronRight, ArrowLeft, ShieldAlert, 
  Lock, ThumbsUp, HelpCircle, Star, Sparkles, MessageSquare, AlertTriangle, Play 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';

const SERVICE_FALLBACK_IMAGES = {
  'Electrician Services': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  'AC Repair & Installation': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  'Refrigerator Repair': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
  'Washing Machine Repair': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80',
  'Television Repair': 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80',
  'Microwave Oven Repair': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80',
  'Water Purifier (RO) Repair': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80',
  'Geyser Repair': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  'Ceiling Fan Repair & Installation': 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=600&q=80',
  'Cooler Repair': 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80',
  'Mixer Grinder Repair': 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=600&q=80',
  'Inverter Repair': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  'Electrical Wiring': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
  'Switch Board Installation': 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
  'LED Light Installation': 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80',
  'Doorbell & Electrical Accessories Repair': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
  'default': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
};

const getFallbackServiceImage = (name) => {
  return SERVICE_FALLBACK_IMAGES[name] || SERVICE_FALLBACK_IMAGES['default'];
};

// Data for the 16 Electrical & Electronic Repair and Installation Services
const SERVICES_DATA = [
  {
    id: 'srv-electrician',
    name: 'Electrician Services',
    category: 'wiring',
    icon: Wrench,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    description: 'Expert diagnostics for power tripping, short circuits, loose connections, socket installations, and general home electrical fixes.',
    startingPrice: 499,
    estimatedTime: '30-60 Mins',
  },
  {
    id: 'srv-ac',
    name: 'AC Repair & Installation',
    category: 'cooling',
    icon: Wind,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    description: 'Deep cooling coil cleaning, gas leakage checks, condenser repair, and professional mounting/unmounting of split & window ACs.',
    startingPrice: 699,
    estimatedTime: '1-2 Hours',
  },
  {
    id: 'srv-fridge',
    name: 'Refrigerator Repair',
    category: 'cooling',
    icon: RefrigeratorIcon, // Handled dynamically below
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
    description: 'Fixing compressor failure, gas refilling, thermostat replacement, heavy cooling loss, and constant water overflow issues.',
    startingPrice: 599,
    estimatedTime: '1-2 Hours',
  },
  {
    id: 'srv-washer',
    name: 'Washing Machine Repair',
    category: 'appliances',
    icon: Cpu,
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80',
    description: 'Resolving drum spin noise, water outlet drainage blockages, gasket leakage, control PCB failure, and belt replacements.',
    startingPrice: 499,
    estimatedTime: '1-2 Hours',
  },
  {
    id: 'srv-tv',
    name: 'Television Repair',
    category: 'appliances',
    icon: Tv,
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80',
    description: 'Professional backlight swap, display flickering fix, audio system board recovery, and loose port HDMI re-soldering.',
    startingPrice: 499,
    estimatedTime: '1-3 Hours',
  },
  {
    id: 'srv-microwave',
    name: 'Microwave Oven Repair',
    category: 'appliances',
    icon: Flame,
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80',
    description: 'Replacing faulty magnetrons, glass rotating plate motors, thermal fuse triggers, and unresponsive touch-panel pads.',
    startingPrice: 399,
    estimatedTime: '30-60 Mins',
  },
  {
    id: 'srv-ro',
    name: 'Water Purifier (RO) Repair',
    category: 'appliances',
    icon: Droplet,
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80',
    description: 'Total filter membrane replacements, sediment pre-filter servicing, TDS calibration, UV lamp swaps, and booster pump repairs.',
    startingPrice: 399,
    estimatedTime: '45 Mins',
  },
  {
    id: 'srv-geyser',
    name: 'Geyser Repair',
    category: 'cooling',
    icon: Thermometer,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    description: 'Replacing burnt heating coils, resetting dead thermostat controllers, pressure safety valve fixes, and fixing hot water leakage.',
    startingPrice: 499,
    estimatedTime: '45-60 Mins',
  },
  {
    id: 'srv-fan',
    name: 'Ceiling Fan Repair & Installation',
    category: 'appliances',
    icon: Wind,
    image: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=600&q=80',
    description: 'Installing standard/modular ceiling fans, replacing noisy speed regulators, worn ball bearings, and weak speed capacitors.',
    startingPrice: 299,
    estimatedTime: '30 Mins',
  },
  {
    id: 'srv-cooler',
    name: 'Cooler Repair',
    category: 'cooling',
    icon: Snowflake,
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80',
    description: 'Replacing water submersible pumps, rewinding fan motors, switching dry honey-comb cooling pads, and general cleaning.',
    startingPrice: 399,
    estimatedTime: '30-45 Mins',
  },
  {
    id: 'srv-mixer',
    name: 'Mixer Grinder Repair',
    category: 'appliances',
    icon: Cpu,
    image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=600&q=80',
    description: 'Fixing motor coupler breaks, replacing carbon brushes, sharpening dull jar blades, and fixing speed selector switches.',
    startingPrice: 299,
    estimatedTime: '30 Mins',
  },
  {
    id: 'srv-inverter',
    name: 'Inverter Repair',
    category: 'wiring',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    description: 'Troubleshooting low backup issues, deep battery acid topping, board motherboard trace recovery, and charging overload bypasses.',
    startingPrice: 599,
    estimatedTime: '1-2 Hours',
  },
  {
    id: 'srv-wiring',
    name: 'Electrical Wiring',
    category: 'wiring',
    icon: Cable,
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    description: 'Whole-house systematic rewiring, phase balancer alignments, short circuit isolation, and heavy fire-proof PVC conduit installations.',
    startingPrice: 699,
    estimatedTime: '2-4 Hours',
  },
  {
    id: 'srv-switchboard',
    name: 'Switch Board Installation',
    category: 'wiring',
    icon: Grid,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
    description: 'Mounting modular switchboards, replacing individual modular switches, master indicators, multi-pin sockets, and dimmers.',
    startingPrice: 299,
    estimatedTime: '30 Mins',
  },
  {
    id: 'srv-led',
    name: 'LED Light Installation',
    category: 'wiring',
    icon: Lightbulb,
    image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80',
    description: 'Drilling and fitting smart LED ceiling panels, decorative profile strip lights, wall spotlights, and heavy chandeliers.',
    startingPrice: 199,
    estimatedTime: '30 Mins',
  },
  {
    id: 'srv-doorbell',
    name: 'Doorbell & Electrical Accessories Repair',
    category: 'appliances',
    icon: Bell,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
    description: 'Setting up smart wireless video doorbells, fixing intercom accessory wires, exhaust fans, and minor bathroom fixture utilities.',
    startingPrice: 199,
    estimatedTime: '30 Mins',
  }
];

// Helper icon render since "Refrigerator" isn't a standard named icon in some older Lucide sets
function RefrigeratorIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="5" y1="10" x2="19" y2="10" />
      <line x1="9" y1="5" x2="9" y2="7" />
      <line x1="9" y1="13" x2="9" y2="17" />
    </svg>
  );
}

// Predefined Indian States and their prominent Cities for autocomplete suggestions
const INDIAN_STATES_AND_CITIES = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kakinada", "Kadapa", "Anantapur"
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Naharlagun", "Pasighat", "Namsai", "Tawang", "Ziro", "Aalo"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Ara", "Begusarai", "Katihar", "Munger"
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Raigarh", "Jagdalpur"
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Gandhidham", "Anand"
  ],
  "Haryana": [
    "Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"
  ],
  "Himachal Pradesh": [
    "Shimla", "Dharamshala", "Solan", "Mandi", "Palampur", "Baddi", "Kullu"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih"
  ],
  "Karnataka": [
    "Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Davangere", "Ballari", "Kalaburagi", "Shivamogga", "Tumakuru"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur", "Kottayam"
  ],
  "Madhya Pradesh": [
    "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai", "Solapur", "Kolhapur"
  ],
  "Manipur": [
    "Imphal", "Thoubal", "Kakching", "Ukhrul"
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Jowai", "Nongpoh"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Kolasib"
  ],
  "Nagaland": [
    "Dimapur", "Kohima", "Mokokchung", "Tuensang"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Udaipur", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Sikar", "Bharatpur"
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Gyalshing", "Mangan"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Nagercoil"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar"
  ],
  "Tripura": [
    "Agartala", "Dharmanagar", "Udaipur", "Kailasahar"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Noida", "Aligarh", "Bareilly", "Moradabad", "Gorakhpur"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Haldwani", "Rudrapur", "Rishikesh", "Roorkee", "Kashipur"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol", "Durgapur", "Kharagpur", "Bardhaman", "Malda", "Baharampur", "Jalpaiguri"
  ],
  "Andaman and Nicobar Islands": [
    "Port Blair"
  ],
  "Chandigarh": [
    "Chandigarh"
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Daman", "Diu", "Silvassa"
  ],
  "Delhi": [
    "New Delhi", "Dwarka", "Rohini", "Narela", "Vasant Kunj", "Saket", "Karol Bagh"
  ],
  "Jammu and Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Udhampur"
  ],
  "Ladakh": [
    "Leh", "Kargil"
  ],
  "Lakshadweep": [
    "Kavaratti"
  ],
  "Puducherry": [
    "Puducherry", "Karaikal", "Mahe", "Yanam"
  ]
};

export default function Services() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeView, setActiveView] = useState('services'); // 'services', 'booking', 'emergency'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Service for the Booking flow
  const [selectedService, setSelectedService] = useState(SERVICES_DATA[0]);

  // General Booking Form state - India defaults, empty city/state by default, plus pinCode
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceId: SERVICES_DATA[0].id,
    preferredDate: '',
    preferredTimeSlot: '10:00 AM - 01:00 PM',
    address: '',
    country: 'India',
    state: '',
    city: '',
    pinCode: '',
    instructions: ''
  });

  // Restore pending booking after login
  useEffect(() => {
    const pendingStr = localStorage.getItem('ef_pending_booking');
    const token = localStorage.getItem('ef_auth_token');
    if (pendingStr && token) {
      try {
        const parsed = JSON.parse(pendingStr);
        setBookingForm(parsed);
        const matchingSrv = SERVICES_DATA.find(s => s.id === parsed.serviceId) || SERVICES_DATA[0];
        setSelectedService(matchingSrv);
        setActiveView('booking');
        localStorage.removeItem('ef_pending_booking');
      } catch (err) {
        console.error(err);
      }
    }
  }, [location]);

  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const stateContainerRef = useRef(null);
  const cityContainerRef = useRef(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityContainerRef.current && !cityContainerRef.current.contains(event.target)) {
        setShowCitySuggestions(false);
      }
      if (stateContainerRef.current && !stateContainerRef.current.contains(event.target)) {
        setShowStateSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredStates = Object.keys(INDIAN_STATES_AND_CITIES).filter(stateName => 
    stateName.toLowerCase().includes((bookingForm.state || '').toLowerCase())
  );

  const filteredCities = (INDIAN_STATES_AND_CITIES[bookingForm.state] || []).filter(city => 
    city.toLowerCase().includes((bookingForm.city || '').toLowerCase())
  );

  // Emergency Request state
  const [emergencyForm, setEmergencyForm] = useState({
    phone: '',
    address: '',
    issueDescription: '',
    agreeUrgentCharge: true
  });

  // Wizard Steps state
  const [bookingStep, setBookingStep] = useState(1); // 1: Form, 2: Matching Radar, 3: Confirmed Success
  const [emergencyStep, setEmergencyStep] = useState(1); // 1: Form, 2: Dispatching, 3: Dispatched Success
  
  // Scanners simulated messages
  const [scannerMessage, setScannerMessage] = useState('Initiating database handshake...');

  // Mock assigned technician details
  const mockTechnician = {
    name: 'Robert "Bob" Henderson',
    photo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80',
    rating: 4.9,
    reviewsCount: 142,
    badge: 'Senior Electrical Engineer',
    phone: '+1 (555) 321-4890',
    arrivalEstimate: 'Tomorrow, aligned with your slot'
  };

  const mockEmergencyTechnician = {
    name: 'Marcus Vance',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5.0,
    reviewsCount: 389,
    badge: 'Emergency Quick-Response Specialist',
    phone: '+1 (555) 911-0943',
    arrivalEstimate: '17 minutes'
  };

  // Scroll restoration on tab/view switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  // Categories helper
  const categories = [
    { id: 'all', label: 'All Services', count: SERVICES_DATA.length },
    { id: 'wiring', label: 'Electrical & Wiring', count: SERVICES_DATA.filter(s => s.category === 'wiring').length },
    { id: 'cooling', label: 'Cooling & Heating', count: SERVICES_DATA.filter(s => s.category === 'cooling').length },
    { id: 'appliances', label: 'Home & Kitchen Appliances', count: SERVICES_DATA.filter(s => s.category === 'appliances').length }
  ];

  // Filters logic
  const filteredServices = SERVICES_DATA.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handler for Book Now click on a card
  const handleBookNow = (service) => {
    setSelectedService(service);
    setBookingForm(prev => ({
      ...prev,
      serviceId: service.id
    }));
    setBookingStep(1);
    setActiveView('booking');
  };

  // Handler to start blank booking from Hero
  const handleStartBlankBooking = () => {
    setSelectedService(SERVICES_DATA[0]);
    setBookingForm(prev => ({
      ...prev,
      serviceId: SERVICES_DATA[0].id
    }));
    setBookingStep(1);
    setActiveView('booking');
  };

  // Switch selected service inside the booking form
  const handleFormServiceChange = (e) => {
    const serviceId = e.target.value;
    const serviceObj = SERVICES_DATA.find(s => s.id === serviceId);
    if (serviceObj) {
      setSelectedService(serviceObj);
      setBookingForm(prev => ({
        ...prev,
        serviceId: serviceObj.id
      }));
    }
  };

  // Submit standard Booking Form
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting || submittingRef.current) {
      return;
    }
    setSubmitError('');

    const isLoggedIn = !!localStorage.getItem('ef_auth_token');
    if (!isLoggedIn) {
      // Save form data to restore after login
      localStorage.setItem('ef_pending_booking', JSON.stringify({
        ...bookingForm,
        serviceId: selectedService.id
      }));
      navigate(`/login?redirect=/services`);
      return;
    }
    
    const errors = {};
    if (!bookingForm.fullName || !bookingForm.fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    }
    if (!bookingForm.phone || !bookingForm.phone.trim()) {
      errors.phone = 'Phone Number is required.';
    }
    if (!bookingForm.preferredDate) {
      errors.preferredDate = 'Preferred Date is required.';
    }
    if (!bookingForm.country || !bookingForm.country.trim()) {
      errors.country = 'Country is required.';
    }
    if (!bookingForm.state || !bookingForm.state.trim()) {
      errors.state = 'State / UT is required.';
    }
    if (!bookingForm.city || !bookingForm.city.trim()) {
      errors.city = 'City is required.';
    }
    if (!bookingForm.address || !bookingForm.address.trim()) {
      errors.address = 'Street Address is required.';
    }
    if (!bookingForm.pinCode || !bookingForm.pinCode.trim()) {
      errors.pinCode = 'PIN Code / ZIP is required.';
    } else if (bookingForm.country === 'India') {
      const pinRegex = /^\d{6}$/;
      if (!pinRegex.test(bookingForm.pinCode.trim())) {
        errors.pinCode = 'Please enter a valid 6-digit Indian PIN Code (numbers only).';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitError('Please fill out all required fields correctly.');
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    setFormErrors({});
    submittingRef.current = true;
    setIsSubmitting(true);

    // Prepare booking details to store in Firestore
    let userId = auth.currentUser?.uid;
    if (!userId) {
      const loggedInUserStr = localStorage.getItem('ef_auth_user');
      if (loggedInUserStr) {
        try {
          const loggedInUser = JSON.parse(loggedInUserStr);
          userId = loggedInUser.id;
        } catch (err) {
          console.error(err);
        }
      }
    }
    userId = userId || 'anonymous';

    // Generate a deterministic but unique ID to guarantee idempotency and avoid double-creation
    const rawKey = `${userId}_${selectedService.id}_${bookingForm.preferredDate}_${bookingForm.preferredTimeSlot}_${bookingForm.phone || ''}`.replace(/\s+/g, '').toLowerCase();
    let hash = 0;
    for (let i = 0; i < rawKey.length; i++) {
      hash = (hash << 5) - hash + rawKey.charCodeAt(i);
      hash = hash & hash;
    }
    const hashNum = 10000 + (Math.abs(hash) % 90000);
    const bookingId = `EF-BOOK-${hashNum}`;

    const bookingData = {
      bookingId,
      userId,
      fullName: bookingForm.fullName,
      phone: bookingForm.phone,
      email: bookingForm.email || '',
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      preferredDate: bookingForm.preferredDate,
      preferredTimeSlot: bookingForm.preferredTimeSlot,
      country: bookingForm.country,
      state: bookingForm.state,
      city: bookingForm.city,
      address: bookingForm.address,
      pinCode: bookingForm.pinCode,
      instructions: bookingForm.instructions || '',
      status: 'Pending Approval',
      createdAt: new Date().toISOString()
    };

    // Save to Firestore asynchronously, then proceed with the radar scanning animation
    const saveBooking = async () => {
      try {
        await setDoc(doc(db, 'bookings', bookingId), bookingData);
        await addDoc(collection(db, 'notifications'), {
          title: 'New Booking',
          message: `New booking request #${bookingId} received from ${bookingForm.fullName} for ${selectedService.name}.`,
          body: `New booking request #${bookingId} received from ${bookingForm.fullName} for ${selectedService.name}.`,
          type: 'booking',
          recipient: 'admin',
          userId: userId,
          bookingId: bookingId,
          read: false,
          isRead: false,
          createdAt: new Date().toISOString()
        });
        console.log(`[Firestore Success] Saved booking ${bookingId}`);
      } catch (fsErr) {
        console.error(`[Firestore Error] Failed to save booking ${bookingId}:`, fsErr);
        handleFirestoreError(fsErr, OperationType.WRITE, `bookings/${bookingId}`);
      }
    };

    saveBooking().then(() => {
      setBookingStep(2); // Show radar scan
      setIsSubmitting(false);
      submittingRef.current = false;
      
      // Animate radar messages
      const messages = [
        'Parsing request parameters...',
        `Locating nearest certified appliance technician in ${bookingForm.city}...`,
        'Verifying engineer availability for the selected time window...',
        'Securing genuine replacement kit pre-reservation...',
        'Technician successfully allocated!'
      ];

      let msgIndex = 0;
      setScannerMessage(messages[0]);
      const interval = setInterval(() => {
        if (msgIndex < messages.length - 1) {
          msgIndex++;
          setScannerMessage(messages[msgIndex]);
        } else {
          clearInterval(interval);
          setBookingStep(3); // Show success receipt
        }
      }, 1000);
    }).catch(err => {
      setIsSubmitting(false);
      submittingRef.current = false;
      setSubmitError('Failed to record booking details in Firestore. Please try again.');
      console.error(err);
    });
  };

  // Submit Emergency Booking Form
  const handleEmergencySubmit = (e) => {
    e.preventDefault();
    if (!emergencyForm.phone || !emergencyForm.address || !emergencyForm.issueDescription) {
      alert('Please enter your phone number, address, and issue description for instant dispatch.');
      return;
    }

    setEmergencyStep(2); // Radar Scan
    const messages = [
      'Ping routed to nearest fast-response mobile hub...',
      'Detecting GPS-active engineers within 5 miles...',
      'Triaging electrical hazard risk variables...',
      'Emergency Dispatch Vehicle #E-401 authorized...',
      'Technician dispatched with priority sirens!'
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      if (msgIndex < messages.length - 1) {
        msgIndex++;
        setScannerMessage(messages[msgIndex]);
      } else {
        clearInterval(interval);
        setEmergencyStep(3); // Success dispatched screen
      }
    }, 900);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* HEADER HERO AREA */}
      <AnimatePresence mode="wait">
        {activeView === 'services' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* HERO SECTION */}
            <section className="relative pt-32 pb-24 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden" id="services-hero">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_50%)]" />
              <div className="absolute bottom-[-20%] left-[-10%] w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[100px]" />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/15 via-cyan-500/10 to-indigo-500/15 text-cyan-100 rounded-full border border-blue-400/30 text-[11px] font-extrabold uppercase tracking-widest mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.55)] hover:border-cyan-400/50 cursor-pointer select-none"
                  style={{
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                  }}
                >
                  <Zap className="h-4 w-4 text-cyan-400 fill-cyan-400/30 animate-pulse shrink-0" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200">
                    ElectroFix Doorstep Services
                  </span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
                  Home Electrical & Electronic <br />
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                    Repair Services
                  </span>
                </h1>

                <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mt-6">
                  Book verified technicians for fast, reliable, and affordable doorstep repair and installation services.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                  <button
                    onClick={handleStartBlankBooking}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    id="hero-book-service-btn"
                  >
                    <span>Book a Service</span>
                    <ChevronRight className="h-5 w-5 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={() => {
                      setEmergencyStep(1);
                      setActiveView('emergency');
                    }}
                    className="px-8 py-4 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    id="hero-emergency-btn"
                  >
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span>24/7 Emergency Support</span>
                  </button>
                </div>

                {/* Micro Stats Row */}
                <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-slate-800/80 mt-12 max-w-4xl mx-auto">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">4.9★</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">Average Customer Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">30 Min</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">Emergency Dispatch</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">Genuine Spare Parts</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">30 Days</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">Service Warranty</div>
                  </div>
                </div>
              </div>
            </section>

            {/* SERVICE CATEGORIES & SEARCH SECTION */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="service-catalogue">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
                  Instant Scheduling
                </span>
                <h2 className="font-display text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
                  Our Electrical & Appliance Solutions
                </h2>
                <p className="text-slate-500 mt-3 text-sm sm:text-base">
                  Select your required repair or installation work below. Filter by module or search immediately to view upfront, transparent starting prices and estimated durations.
                </p>
              </div>

              {/* SEARCH BAR & CATEGORY SELECTORS */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4 mb-10 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  
                  {/* Search input */}
                  <div className="relative w-full md:flex-1">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search for 'AC repair', 'switch board', 'LED installation', 'RO purifier'..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      id="service-search-input"
                    />
                  </div>

                  {/* Filter tabs */}
                  <div className="flex flex-wrap justify-center gap-1.5 shrink-0">
                    {categories.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedCategory(tab.id)}
                        className={`px-4 py-2.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer border ${
                          selectedCategory === tab.id
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        id={`category-tab-${tab.id}`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* SERVICE CARDS GRID */}
              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredServices.map((service, index) => {
                    const CardIcon = service.icon;
                    return (
                      <motion.div
                        key={service.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        className="group flex flex-col justify-between bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden relative"
                        id={`service-card-${service.id}`}
                      >
                        <div>
                          {/* Card Image Area */}
                          <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                            <img
                              src={service.image}
                              alt={service.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                if (e.target.dataset.triedFallback) {
                                  e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                                } else {
                                  e.target.dataset.triedFallback = "true";
                                  e.target.src = getFallbackServiceImage(service.name);
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                            
                            {/* Float Badge Category */}
                            <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[9px] font-extrabold uppercase text-blue-600 px-2.5 py-1 rounded-lg tracking-wider shadow-sm border border-slate-200/55">
                              {service.category === 'wiring' ? 'Wiring & Power' : service.category === 'cooling' ? 'Heating & Cooling' : 'Appliance'}
                            </span>

                            {/* Floating Round Icon */}
                            <div className="absolute bottom-3 right-3 h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-600/30">
                              <CardIcon className="h-5 w-5" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <h3 className="font-display font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                              {service.name}
                            </h3>
                            <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">
                              {service.description}
                            </p>
                          </div>
                        </div>

                        {/* Price & Action Footer */}
                        <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50">
                          <div className="flex items-center justify-between gap-2 mb-4 text-xs font-semibold">
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Starting Price</span>
                              <span className="text-emerald-600 text-sm font-extrabold">₹{service.startingPrice} <span className="text-[10px] text-slate-400 font-medium">upfront</span></span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Est. Duration</span>
                              <span className="text-slate-700 text-xs font-bold flex items-center justify-end gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {service.estimatedTime}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleBookNow(service)}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs tracking-wider uppercase shadow-md shadow-blue-600/10 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            id={`book-btn-${service.id}`}
                          >
                            <span>Book Now</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-xl mx-auto space-y-4">
                  <div className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-slate-900 text-base">No matching services found</h4>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                      We couldn't find anything matching your keywords. Try checking the category tabs or clearing your search queries.
                    </p>
                  </div>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </section>

            {/* EMERGENCY SERVICE */}
            <section className="py-12 bg-white border-y border-slate-200" id="emergency-banner-section">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-full w-[30%] bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.06),transparent_50%)] pointer-events-none" />
                  
                  <div className="flex items-center gap-4 text-left">
                    <div className="h-14 w-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/25 shrink-0 relative">
                      <span className="absolute top-[-3px] right-[-3px] h-3 w-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                      <Phone className="h-6 w-6 animate-bounce" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded">Emergency Service</span>
                        <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                      </div>
                      <h3 className="font-display text-2xl font-extrabold text-slate-900 mt-1">
                        24/7 Emergency Electrical Repair
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
                        Experiencing dangerous power sparking, complete home blackout, or burning wire odors? Request priority emergency dispatch now.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => {
                        setEmergencyStep(1);
                        setActiveView('emergency');
                      }}
                      className="w-full md:w-auto px-7 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                      id="emergency-request-btn"
                    >
                      <span>Request Emergency Service</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="how-it-works-section">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
                  Flawless Execution
                </span>
                <h2 className="font-display text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
                  How It Works
                </h2>
                <p className="text-slate-500 mt-3 text-sm sm:text-base">
                  From tapping a button to post-repair ratings, experience Seattle's most customer-centric doorstep mechanics.
                </p>
              </div>

              {/* TIMELINE STEPS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
                {/* Horizontal progress bar for desktop only */}
                <div className="hidden md:block absolute top-[52px] left-[8%] right-[8%] h-[2px] bg-slate-200 z-0" />

                {/* Step 1 */}
                <div className="text-center relative z-10 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                    1
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-slate-900 text-xs sm:text-sm">Step 1 – Select a Service</h4>
                    <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed max-w-[200px] mx-auto">
                      Choose from our standard 16 home electrical repair and appliance diagnostic solutions.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="text-center relative z-10 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                    2
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-slate-900 text-xs sm:text-sm">Step 2 – Choose Date & Time</h4>
                    <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed max-w-[200px] mx-auto">
                      Pick a custom date and convenient three-hour slot that perfectly aligns with your day.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="text-center relative z-10 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                    3
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-slate-900 text-xs sm:text-sm">Step 3 – Technician Assigned</h4>
                    <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed max-w-[200px] mx-auto">
                      Our automated routing coordinates the best-matched senior engineer in your area.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="text-center relative z-10 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                    4
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-slate-900 text-xs sm:text-sm">Step 4 – Doorstep Service</h4>
                    <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed max-w-[200px] mx-auto">
                      The specialist inspects, carries out the fixes, and provides diagnostic reports.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="text-center relative z-10 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                    5
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-slate-900 text-xs sm:text-sm">Step 5 – Secure Payment & Rating</h4>
                    <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed max-w-[200px] mx-auto">
                      Confirm success, complete cashless escrow checkout, and leave your valuable review.
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* WHY CHOOSE ELECTROFIX */}
            <section className="py-20 bg-slate-900 text-white rounded-[36px] overflow-hidden relative mx-4 sm:mx-8 lg:mx-12 mb-20" id="why-choose-us-section">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.1),transparent_40%)] pointer-events-none" />
              
              <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/20">
                    Trusted Engineers
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
                    Why Choose ElectroFix
                  </h2>
                  <p className="text-slate-400 mt-3 text-xs sm:text-sm">
                    We maintain strict criteria for every technician we dispatch, ensuring absolute safety and structural durability.
                  </p>
                </div>

                {/* 8 Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  
                  {/* Item 1 */}
                  <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="h-10 w-10 bg-blue-500/15 rounded-xl flex items-center justify-center text-blue-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h4 className="font-display text-sm font-bold text-white">Verified Technicians</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      All local experts undergo strict third-party background screens and master technical audits before dispatch.
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="h-10 w-10 bg-blue-500/15 rounded-xl flex items-center justify-center text-blue-400">
                      <Award className="h-5 w-5" />
                    </div>
                    <h4 className="font-display text-sm font-bold text-white">Genuine Spare Parts</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      We source 100% genuine original components and industrial-grade seals straight from direct factories.
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="h-10 w-10 bg-blue-500/15 rounded-xl flex items-center justify-center text-blue-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <h4 className="font-display text-sm font-bold text-white">Doorstep Service</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      No hauling heavy washing machines or AC modules. Complete repairs are executed inside your living room or office.
                    </p>
                  </div>

                  {/* Item 4 */}
                  <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="h-10 w-10 bg-blue-500/15 rounded-xl flex items-center justify-center text-blue-400">
                      <IndianRupee className="h-5 w-5" />
                    </div>
                    <h4 className="font-display text-sm font-bold text-white">Affordable Pricing</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Upfront diagnostics, flat rates, and fully detailed invoice breakdowns with absolutely zero surprise premiums.
                    </p>
                  </div>

                  {/* Item 5 */}
                  <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="h-10 w-10 bg-blue-500/15 rounded-xl flex items-center justify-center text-blue-400">
                      <Clock className="h-5 w-5" />
                    </div>
                    <h4 className="font-display text-sm font-bold text-white">Fast Response</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Real-time tracker maps, immediate digital scheduling triggers, and quick 30-minute responses for emergency hazards.
                    </p>
                  </div>

                  {/* Item 6 */}
                  <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="h-10 w-10 bg-blue-500/15 rounded-xl flex items-center justify-center text-blue-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <h4 className="font-display text-sm font-bold text-white">Secure Payments</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Secure processing through integrated encrypted digital pathways. Pay comfortably after verifying total success.
                    </p>
                  </div>

                  {/* Item 7 */}
                  <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="h-10 w-10 bg-blue-500/15 rounded-xl flex items-center justify-center text-blue-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h4 className="font-display text-sm font-bold text-white">Service Warranty</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Relax knowing every service job contains an iron-clad 30-day labor and spare parts guarantee at zero cost to you.
                    </p>
                  </div>

                  {/* Item 8 */}
                  <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="h-10 w-10 bg-blue-500/15 rounded-xl flex items-center justify-center text-blue-400">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <h4 className="font-display text-sm font-bold text-white">Customer Support</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Dedicated support representatives ready to answer billing details or follow-up queries at any hour.
                    </p>
                  </div>

                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================== VIEW: DEDICATED SERVICE BOOKING PAGE ================== */}
      <AnimatePresence mode="wait">
        {activeView === 'booking' && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6"
            id="service-booking-view"
          >
            {/* Header / Back Link */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setActiveView('services')}
                className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-slate-900 group cursor-pointer"
                id="booking-back-to-list-btn"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to All Services</span>
              </button>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-200/50 px-2.5 py-1 rounded-full">
                Step {bookingStep} of 3
              </span>
            </div>

            {/* Step-by-Step wizard controller */}
            {bookingStep === 1 && (
              <div className="space-y-6">
                {/* Introduction heading */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
                  <img
                    src={selectedService.image}
                    alt={selectedService.name}
                    className="h-16 w-16 rounded-2xl object-cover shrink-0 border border-slate-100"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      if (e.target.dataset.triedFallback) {
                        e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                      } else {
                        e.target.dataset.triedFallback = "true";
                        e.target.src = getFallbackServiceImage(selectedService.name);
                      }
                    }}
                  />
                  <div>
                    <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                      Schedule {selectedService.name}
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Starting at <strong className="text-emerald-600">₹{selectedService.startingPrice}</strong> • Average repair time: <strong className="text-slate-700">{selectedService.estimatedTime}</strong>
                    </p>
                  </div>
                </div>

                {/* Main Form Box */}
                <form onSubmit={handleBookingSubmit} className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-md space-y-6">
                  
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      1. Client Details
                    </h3>
                  </div>

                  {/* Name, Phone, Email Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={bookingForm.fullName}
                        onChange={(e) => {
                          setBookingForm({...bookingForm, fullName: e.target.value});
                          if (formErrors.fullName) setFormErrors(prev => ({ ...prev, fullName: '' }));
                        }}
                        className={`w-full bg-slate-50 border ${formErrors.fullName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:bg-white`}
                        id="booking-form-name"
                      />
                      {formErrors.fullName && (
                        <p className="text-red-500 text-[10px] font-semibold mt-1">{formErrors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="(555) 000-0000"
                        value={bookingForm.phone}
                        onChange={(e) => {
                          setBookingForm({...bookingForm, phone: e.target.value});
                          if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
                        }}
                        className={`w-full bg-slate-50 border ${formErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:bg-white`}
                        id="booking-form-phone"
                      />
                      {formErrors.phone && (
                        <p className="text-red-500 text-[10px] font-semibold mt-1">{formErrors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        placeholder="john.doe@example.com"
                        value={bookingForm.email}
                        onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                        id="booking-form-email"
                      />
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-4 pt-4">
                    <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      2. Service Options
                    </h3>
                  </div>

                  {/* Service selection modification, Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Selected Service</label>
                      <select
                        value={bookingForm.serviceId}
                        onChange={handleFormServiceChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                        id="booking-form-service-select"
                      >
                        {SERVICES_DATA.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (Starts at ₹{s.startingPrice})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preferred Date *</label>
                      <input
                        type="date"
                        required
                        value={bookingForm.preferredDate}
                        onChange={(e) => {
                          setBookingForm({...bookingForm, preferredDate: e.target.value});
                          if (formErrors.preferredDate) setFormErrors(prev => ({ ...prev, preferredDate: '' }));
                        }}
                        className={`w-full bg-slate-50 border ${formErrors.preferredDate ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer`}
                        id="booking-form-date"
                      />
                      {formErrors.preferredDate && (
                        <p className="text-red-500 text-[10px] font-semibold mt-1">{formErrors.preferredDate}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preferred Time Window</label>
                      <select
                        value={bookingForm.preferredTimeSlot}
                        onChange={(e) => setBookingForm({...bookingForm, preferredTimeSlot: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                        id="booking-form-timeslot"
                      >
                        <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM (Early morning)</option>
                        <option value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM (Morning/Midday)</option>
                        <option value="01:00 PM - 04:00 PM">01:00 PM - 04:00 PM (Afternoon)</option>
                        <option value="04:00 PM - 07:00 PM">04:00 PM - 07:00 PM (Evening)</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-4 pt-4">
                    <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      3. Service Address & Notes
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Country Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Country *</label>
                      <select
                        value={bookingForm.country}
                        onChange={(e) => {
                          setBookingForm({
                            ...bookingForm,
                            country: e.target.value,
                            state: '',
                            city: '',
                            pinCode: ''
                          });
                          if (formErrors.country) setFormErrors(prev => ({ ...prev, country: '' }));
                        }}
                        className={`w-full bg-slate-50 border ${formErrors.country ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer hover:border-slate-300 transition-all text-slate-800`}
                        id="booking-form-country"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>

                    {/* State Selector */}
                    <div className="space-y-2 relative" ref={stateContainerRef}>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">State / UT *</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={bookingForm.state}
                          onChange={(e) => {
                            setBookingForm({
                              ...bookingForm,
                              state: e.target.value,
                              city: '' // Clear city when state changes
                            });
                            setShowStateSuggestions(true);
                            if (formErrors.state) setFormErrors(prev => ({ ...prev, state: '' }));
                          }}
                          onFocus={() => setShowStateSuggestions(true)}
                          placeholder={bookingForm.country === 'India' ? "Search Indian State..." : "Enter state..."}
                          className={`w-full bg-slate-50 border ${formErrors.state ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} rounded-xl py-3 px-4 pr-10 text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer hover:border-slate-300 transition-all text-slate-800`}
                          id="booking-form-state"
                          autoComplete="off"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                      </div>

                      {formErrors.state && (
                        <p className="text-red-500 text-[10px] font-semibold mt-1">{formErrors.state}</p>
                      )}

                      <AnimatePresence>
                        {showStateSuggestions && bookingForm.country === 'India' && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 divide-y divide-slate-100"
                          >
                            {filteredStates.length > 0 ? (
                              filteredStates.map((stateName) => (
                                <button
                                  key={stateName}
                                  type="button"
                                  onClick={() => {
                                    setBookingForm({
                                      ...bookingForm,
                                      state: stateName,
                                      city: '' // Clear city
                                    });
                                    setShowStateSuggestions(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-semibold cursor-pointer flex items-center gap-2 transition-colors"
                                >
                                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span>{stateName}</span>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-xs text-slate-400 font-medium italic">
                                Type to add custom state
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* City Selector */}
                    <div className="space-y-2 relative" ref={cityContainerRef}>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">City *</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={bookingForm.city}
                          onChange={(e) => {
                            setBookingForm({...bookingForm, city: e.target.value});
                            setShowCitySuggestions(true);
                            if (formErrors.city) setFormErrors(prev => ({ ...prev, city: '' }));
                          }}
                          onFocus={() => setShowCitySuggestions(true)}
                          placeholder={bookingForm.country === 'India' ? (bookingForm.state ? "Search City..." : "Select State first...") : "Enter city..."}
                          className={`w-full bg-slate-50 border ${formErrors.city ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} rounded-xl py-3 px-4 pr-10 text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer hover:border-slate-300 transition-all text-slate-800`}
                          id="booking-form-city"
                          autoComplete="off"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                      </div>

                      {formErrors.city && (
                        <p className="text-red-500 text-[10px] font-semibold mt-1">{formErrors.city}</p>
                      )}

                      <AnimatePresence>
                        {showCitySuggestions && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 divide-y divide-slate-100"
                          >
                            {bookingForm.country === 'India' && bookingForm.state ? (
                              filteredCities.length > 0 ? (
                                filteredCities.map((cityName) => (
                                  <button
                                    key={cityName}
                                    type="button"
                                    onClick={() => {
                                      setBookingForm({...bookingForm, city: cityName});
                                      setShowCitySuggestions(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-semibold cursor-pointer flex items-center gap-2 transition-colors"
                                  >
                                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                    <span>{cityName}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-xs text-slate-400 font-medium italic">
                                  Type to add custom city
                                </div>
                              )
                            ) : bookingForm.country === 'India' ? (
                              <div className="px-4 py-3 text-xs text-slate-400 font-medium italic">
                                Please select a state first
                              </div>
                            ) : (
                              <div className="px-4 py-3 text-xs text-slate-400 font-medium italic">
                                Type your custom city name
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Street Address */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Street Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="Flat/House No., Building, Area/Street Name"
                        value={bookingForm.address}
                        onChange={(e) => {
                          setBookingForm({...bookingForm, address: e.target.value});
                          if (formErrors.address) setFormErrors(prev => ({ ...prev, address: '' }));
                        }}
                        className={`w-full bg-slate-50 border ${formErrors.address ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white hover:border-slate-300 transition-all text-slate-800`}
                        id="booking-form-address"
                      />
                      {formErrors.address && (
                        <p className="text-red-500 text-[10px] font-semibold mt-1">{formErrors.address}</p>
                      )}
                    </div>

                    {/* PIN / ZIP Code */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PIN Code / ZIP *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder={bookingForm.country === 'India' ? "6-digit PIN" : "ZIP Code"}
                        value={bookingForm.pinCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          let updatedValue = val;
                          if (bookingForm.country === 'India') {
                            // only allow numbers for PIN code
                            if (/^\d*$/.test(val)) {
                              updatedValue = val;
                            } else {
                              return;
                            }
                          }
                          setBookingForm({...bookingForm, pinCode: updatedValue});
                          if (formErrors.pinCode) setFormErrors(prev => ({ ...prev, pinCode: '' }));
                        }}
                        className={`w-full bg-slate-50 border ${formErrors.pinCode ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white hover:border-slate-300 transition-all text-slate-800`}
                        id="booking-form-pincode"
                      />
                      {formErrors.pinCode && (
                        <p className="text-red-500 text-[10px] font-semibold mt-1">{formErrors.pinCode}</p>
                      )}
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2 sm:col-span-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructions / Specific Symptoms (Optional)</label>
                      <textarea
                        rows="3"
                        placeholder="Tell us what is wrong (e.g. Fridge fan isn't rotating, AC emits musty odor, ceiling regulator doesn't respond...)"
                        value={bookingForm.instructions}
                        onChange={(e) => setBookingForm({...bookingForm, instructions: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                        id="booking-form-notes"
                      />
                    </div>
                  </div>

                  {/* Safety & Submission */}
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-blue-800 leading-relaxed">
                      <strong>No pre-payment required:</strong> You only pay securely through cash or card after Robert inspects, explains and completes the repairs. Cancel or reschedule for free up to 24 hours prior.
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                    <div className="text-left w-full sm:w-auto">
                      {submitError && (
                        <p className="text-red-500 text-xs font-bold bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <span className="text-red-600">⚠️</span> {submitError}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 relative z-10 disabled:cursor-not-allowed"
                      id="booking-form-submit-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processing Booking...</span>
                        </>
                      ) : (
                        <>
                          <span>Book Service / Submit</span>
                          <ChevronRight className="h-5 w-5 text-blue-200" />
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* Step 2: Interactive Matching Radar */}
            {bookingStep === 2 && (
              <div className="bg-white p-8 sm:p-12 rounded-[32px] border border-slate-200 shadow-xl text-center space-y-8">
                <div className="relative h-44 w-44 mx-auto flex items-center justify-center">
                  {/* Radar Wave pulses */}
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
                  <div className="absolute inset-4 rounded-full border-2 border-blue-500/40 animate-pulse" />
                  <div className="absolute inset-8 rounded-full border-2 border-blue-500/60" />
                  
                  {/* Spinning line overlay */}
                  <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-spin-slow" style={{ borderRightColor: '#2563eb', borderWidth: '3px' }} />

                  {/* Center glowing icon */}
                  <div className="h-16 w-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center relative z-10 shadow-lg shadow-blue-500/40">
                    <Wrench className="h-8 w-8 animate-spin-slow" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-xl font-extrabold text-slate-900">Matching Certified Expert</h3>
                  <p className="text-slate-500 text-xs tracking-wider font-mono animate-pulse">
                    {scannerMessage}
                  </p>
                </div>

                <div className="max-w-md mx-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 justify-center text-xs">
                  <span className="h-2.5 w-2.5 bg-blue-600 rounded-full animate-ping" />
                  <span className="text-slate-500 font-medium">Scanning Seattle regional engineers list...</span>
                </div>
              </div>
            )}

            {/* Step 3: Successfully Booked Receipt / Dashboard */}
            {bookingStep === 3 && (
              <div className="space-y-6">
                
                {/* Visual success splash */}
                <div className="bg-emerald-500 text-white p-8 rounded-[32px] shadow-xl text-center space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-full w-[30%] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
                  
                  <div className="h-16 w-16 bg-white text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 bg-white/10 px-3 py-1 rounded-full inline-block">Booking Submitted</span>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold">Your booking has been submitted successfully.</h2>
                    <p className="text-emerald-100 text-xs sm:text-sm max-w-lg mx-auto">
                      Our team will review your request and confirm it shortly.
                    </p>
                  </div>
                </div>

                {/* Grid of details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Clean Booking Confirmation Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-display font-extrabold text-slate-900 text-base">
                            ✅ Booking Confirmation Done
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                            ElectroFix Request Registered
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3.5 text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                        <p>Thank you for choosing ElectroFix.</p>
                        <p>Your booking has been successfully received.</p>
                        <p>Our support team will contact you very soon to confirm your booking and assign the best available technician.</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-blue-50/50 border border-blue-100/50 rounded-xl flex items-start gap-2.5 text-xs text-blue-700 font-semibold leading-relaxed">
                      <span className="text-sm leading-none shrink-0">📱</span>
                      <span>You will receive all service updates through your registered mobile number or email.</span>
                    </div>
                  </div>

                  {/* Booking Receipt Summary */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Service Receipt Summary</span>
                      <h4 className="font-display font-extrabold text-slate-900 text-base">{selectedService.name}</h4>
                      <p className="text-slate-500 text-[11px] mt-0.5">Reference ID: <strong className="font-mono text-slate-700 uppercase">EFX-{Math.floor(Math.random() * 900000) + 100000}</strong></p>
                    </div>

                    <div className="space-y-3.5 border-y border-slate-100 py-4 text-xs font-semibold text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Customer:</span>
                        <span>{bookingForm.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Contact Phone:</span>
                        <span>{bookingForm.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Preferred Slot:</span>
                        <span>{bookingForm.preferredDate} • {bookingForm.preferredTimeSlot}</span>
                      </div>
                      <div className="flex flex-col text-right items-end w-full">
                        <div className="w-full flex justify-between gap-4">
                          <span className="text-slate-400 font-medium text-left">Doorstep Address:</span>
                          <span className="max-w-[200px] truncate font-semibold" title={`${bookingForm.address}, ${bookingForm.city}, ${bookingForm.state}, ${bookingForm.country} - ${bookingForm.pinCode}`}>
                            {bookingForm.address}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {bookingForm.city}{bookingForm.state ? `, ${bookingForm.state}` : ''}, {bookingForm.country} - {bookingForm.pinCode}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Starting Base Price</span>
                        <strong className="text-emerald-600 text-lg font-extrabold">₹{selectedService.startingPrice}</strong>
                      </div>
                      <button
                        onClick={() => setActiveView('services')}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
                      >
                        Return to List
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* ================== VIEW: DEDICATED EMERGENCY QUICK DISPATCH ================== */}
      <AnimatePresence mode="wait">
        {activeView === 'emergency' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="pt-28 pb-20 max-w-xl mx-auto px-4"
            id="emergency-quick-view"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setActiveView('services')}
                className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-slate-900 group cursor-pointer"
                id="emergency-back-btn"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Cancel & Return</span>
              </button>
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-rose-600">
                <span className="h-2.5 w-2.5 bg-rose-500 rounded-full animate-ping" />
                24/7 SIRENS ACTIVE
              </span>
            </div>

            {/* Emergency wizard switcher */}
            {emergencyStep === 1 && (
              <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-rose-100 shadow-xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="h-14 w-14 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-rose-500/20">
                    <Phone className="h-6 w-6 animate-bounce" />
                  </div>
                  <h1 className="font-display text-2xl font-black text-slate-900">Request Emergency Dispatch</h1>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                    Enter your details below. We authorize immediate technician dispatch. Vehicles are packed with heavy tools and response kits.
                  </p>
                </div>

                <form onSubmit={handleEmergencySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency Callback Mobile *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. (555) 911-3829"
                      value={emergencyForm.phone}
                      onChange={(e) => setEmergencyForm({...emergencyForm, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-rose-500 focus:bg-white"
                      id="emergency-form-phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exact Doorstep Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1420 Pine Street, Seattle, WA"
                      value={emergencyForm.address}
                      onChange={(e) => setEmergencyForm({...emergencyForm, address: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-rose-500 focus:bg-white"
                      id="emergency-form-address"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Describe the Hazard / Malfunction *</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="e.g. Living room switchboard has deep sparking sounds, wire insulation melting odor, complete kitchen socket blackout..."
                      value={emergencyForm.issueDescription}
                      onChange={(e) => setEmergencyForm({...emergencyForm, issueDescription: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-rose-500 focus:bg-white"
                      id="emergency-form-desc"
                    />
                  </div>

                  <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-rose-900 leading-relaxed">
                      <strong>Urgent Dispatch Notice:</strong> Emergency calls incur a ₹150 flat dispatch priority premium. Our technicians will diagnostic and provide complete repair quotes on-site.
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/25 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    id="emergency-form-submit"
                  >
                    <span>Authorize Immediate Dispatch</span>
                  </button>
                </form>
              </div>
            )}

            {/* Emergency Step 2: Dispatching animation */}
            {emergencyStep === 2 && (
              <div className="bg-white p-8 sm:p-12 rounded-[32px] border border-rose-100 shadow-xl text-center space-y-8">
                <div className="relative h-40 w-40 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-rose-500/10 animate-ping" />
                  <div className="absolute inset-4 rounded-full border-2 border-rose-500/30 animate-pulse" />
                  
                  {/* Glowing warning ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-rose-500/10 border-t-rose-500 animate-spin" />
                  
                  <div className="h-16 w-16 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
                    <Phone className="h-8 w-8 animate-bounce" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-xl font-black text-rose-600">Discharging Priority Crew</h3>
                  <p className="text-slate-500 text-xs tracking-wider font-mono animate-pulse">
                    {scannerMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Emergency Step 3: Technician Dispatched Confirmation */}
            {emergencyStep === 3 && (
              <div className="space-y-6">
                
                {/* Visual success */}
                <div className="bg-rose-600 text-white p-8 rounded-[32px] shadow-xl text-center space-y-4">
                  <div className="h-14 w-14 bg-white/10 rounded-full flex items-center justify-center mx-auto text-white">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-rose-200 bg-white/10 px-2.5 py-0.5 rounded inline-block animate-pulse">Vehicle En Route</span>
                    <h2 className="font-display text-2xl font-black">Sirens On. Technician Dispatched!</h2>
                    <p className="text-rose-100 text-xs max-w-sm mx-auto leading-relaxed">
                      Marcus has been dispatched in emergency vehicle #E-401. Keep your callback line clear.
                    </p>
                  </div>
                </div>

                {/* Emergency Technician Info */}
                <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Emergency Responder</span>
                  
                  <div className="flex items-center gap-4">
                    <img
                      src={mockEmergencyTechnician.photo}
                      alt={mockEmergencyTechnician.name}
                      className="h-16 w-16 rounded-2xl object-cover border border-slate-100 shadow-xs"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80";
                      }}
                    />
                    <div>
                      <h4 className="font-display font-extrabold text-slate-900 text-sm">{mockEmergencyTechnician.name}</h4>
                      <span className="text-rose-600 font-extrabold text-[9px] uppercase block tracking-wider mt-0.5">{mockEmergencyTechnician.badge}</span>
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        <span className="text-amber-400">★</span>
                        <span className="font-bold text-slate-800">{mockEmergencyTechnician.rating}</span>
                        <span className="text-slate-400">({mockEmergencyTechnician.reviewsCount} emergency saves)</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3.5 text-xs font-semibold text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Emergency Line:</span>
                      <span>{mockEmergencyTechnician.phone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Estimated Arrival Time:</span>
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black animate-pulse">
                        {mockEmergencyTechnician.arrivalEstimate}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('services')}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs uppercase tracking-wider"
                >
                  Return to Main Portal
                </button>

              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
