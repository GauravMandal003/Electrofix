// shopData.js - Static inventory for ElectroFix Shop Module (15 distinct categories)

export const CATEGORIES = [
  "Air Conditioners",
  "Refrigerators",
  "Washing Machines",
  "Televisions",
  "Microwave Ovens",
  "Water Purifiers",
  "Ceiling Fans",
  "Coolers",
  "Mixer Grinders",
  "Electric Irons",
  "Inverters",
  "LED Bulbs",
  "Switches",
  "Wiring Accessories",
  "Genuine Spare Parts"
];

export const BRANDS = [
  "WindChill",
  "CoolTech",
  "QuickWash",
  "VisionX",
  "FireWave",
  "HydroPure",
  "WindControl",
  "Snowflake",
  "PowerMix",
  "PressPro",
  "VoltGuard",
  "LuxLight",
  "ApexWire",
  "FactoryDirect"
];

export const INITIAL_PRODUCTS = [
  {
    id: "ac-1",
    name: "FrostVortex 1.5 Ton 5-Star Split AC",
    brand: "WindChill",
    category: "Air Conditioners",
    price: 499,
    originalPrice: 699,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.8,
    popularity: 95,
    newest: true,
    stock: 6,
    description: "Stay ultra-cool with the energy-efficient FrostVortex. Features instant dual-inverter rapid cooling, anti-corrosive copper condenser coils, and a 5-stage allergen air purification filter.",
    specs: {
      "Capacity": "1.5 Ton",
      "Energy Rating": "5-Star Bureau Approved",
      "Cooling Coil": "100% Grooved Copper",
      "Refrigerant": "Eco-Safe R32",
      "Noise Level": "Ultra-Quiet 21 dB"
    },
    features: [
      "Dual-Inverter Variable Compressor for up to 60% energy savings.",
      "Active 4-in-1 PM 2.5 Air Filtration system traps microbes and fine dust.",
      "Turbo Cool mode provides ice-cold air throw in under 5 minutes.",
      "Anti-Corrosive GoldFin coating on both evaporator and condenser plates."
    ],
    warranty: "1 Year comprehensive warranty on product, 10 Years on inverter compressor.",
    reviews: [
      { id: 1, name: "Michael Chen", rating: 5, comment: "Absolute beast. Cools my whole master bedroom in seconds, and my energy bill barely went up!", date: "2026-06-22" },
      { id: 2, name: "Jessica K.", rating: 4.5, comment: "Great AC, super quiet sleep mode. The installation addition was extremely professional.", date: "2026-06-28" }
    ]
  },
  {
    id: "ref-1",
    name: "AuraFlow 350L Double-Door Smart Refrigerator",
    brand: "CoolTech",
    category: "Refrigerators",
    price: 749,
    originalPrice: 999,
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.7,
    popularity: 91,
    newest: false,
    stock: 4,
    description: "Modern double-door frost-free refrigerator with intelligent inverter, customizable temperature zones, and automatic odor neutralizer.",
    specs: {
      "Capacity": "350 Liters",
      "Defrost System": "Frost-Free Auto Defrost",
      "Compressor": "Smart Digital Inverter",
      "Shelves": "Toughened Spill-Proof Glass",
      "Energy Star": "4-Star Rating"
    },
    features: [
      "Multi-Airflow System maintains uniform cooling in every corner.",
      "Convertible freezer converts into standard fridge mode in a single touch.",
      "Deodorizing active carbon filter removes persistent food smells.",
      "Elegant exterior digital LED touch temperature control panel."
    ],
    warranty: "2 Years comprehensive warranty, 10 Years on digital compressor.",
    reviews: [
      { id: 1, name: "Robert H.", rating: 5, comment: "Spacious, silent, and keeps veggies incredibly fresh for weeks.", date: "2026-05-18" }
    ]
  },
  {
    id: "wm-1",
    name: "HydroSpin 8kg Front Load Steam Washer",
    brand: "QuickWash",
    category: "Washing Machines",
    price: 429,
    originalPrice: 599,
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.6,
    popularity: 88,
    newest: true,
    stock: 5,
    description: "Professional 8kg front load washer featuring deep hygienic steam wash, 1400 RPM high-speed spinner, and low-vibration silent motor.",
    specs: {
      "Capacity": "8.0 kg Capacity",
      "Spin Speed": "1400 RPM maximum",
      "Motor Type": "Direct Drive Inverter",
      "Wash Programs": "15 Custom smart programs",
      "Water Heater": "Built-in 20°C to 90°C Heater"
    },
    features: [
      "Hygienic Steam Wash removes 99.9% of bacteria, allergens, and odors.",
      "AI Drum Clean alerts you when maintenance is required to prevent mold.",
      "AquaStop leak protection valve automatically cuts water supply in an emergency.",
      "Delay Start timer lets you plan laundry up to 24 hours in advance."
    ],
    warranty: "3 Years comprehensive warranty on product, 12 Years on direct drive motor.",
    reviews: [
      { id: 1, name: "Gail S.", rating: 4, comment: "The steam function is wonderful for baby clothes. Smooth spinning sound.", date: "2026-06-10" }
    ]
  },
  {
    id: "tv-1",
    name: "CinemaVue 55\" 4K QLED Smart Google TV",
    brand: "VisionX",
    category: "Televisions",
    price: 579,
    originalPrice: 799,
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.9,
    popularity: 98,
    newest: false,
    stock: 3,
    description: "Stunning 55-inch QLED display with 4K resolution, quantum-dot color depth, Dolby Vision IQ, and immersive Dolby Atmos spatial audio.",
    specs: {
      "Screen Size": "55 Inches",
      "Display Type": "Quantum-Dot QLED",
      "Resolution": "4K Ultra HD (3840 x 2160)",
      "Operating System": "Google TV with Voice Search",
      "Refresh Rate": "120 Hz Native"
    },
    features: [
      "Quantum Dot technology delivers over 1 billion real-life colors.",
      "Dolby Vision & HDR10+ for cinematic brightness and deep, dark blacks.",
      "Dual 30W Onkyo speakers with built-in Dolby Atmos subwoofer.",
      "Game Mode Pro with VRR and ALLM for high-fidelity console sync."
    ],
    warranty: "2 Years comprehensive brand warranty.",
    reviews: [
      { id: 1, name: "Andrew P.", rating: 5, comment: "Unbelievable colors! Watching movies is a theater-like experience. Gaming at 120Hz on my PS5 is buttery smooth.", date: "2026-06-05" }
    ]
  },
  {
    id: "mw-1",
    name: "AeroCook 25L Convection Smart Microwave",
    brand: "FireWave",
    category: "Microwave Ovens",
    price: 139,
    originalPrice: 199,
    image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.5,
    popularity: 82,
    newest: false,
    stock: 7,
    description: "Versatile 25-liter convection microwave oven with air-fry capabilities, multi-stage defrosting, and 45 preset auto-cook programs.",
    specs: {
      "Capacity": "25 Liters",
      "Type": "Convection, Grill, & Microwave",
      "Cavity": "Ceramic Enamel Easy Clean",
      "Power Output": "900 Watts",
      "Control": "Tactile Touch & Dial Control"
    },
    features: [
      "Slim Fry technology combines a grill with warm air circulation for crispy food without oil.",
      "Hygienic ceramic interior is 99.9% scratch and rust resistant.",
      "Eco Mode significantly reduces standby power consumption.",
      "Sensor Cook adjusts optimal cooking time automatically."
    ],
    warranty: "1 Year comprehensive warranty, 5 Years on Magnetron.",
    reviews: [
      { id: 1, name: "Linda T.", rating: 4.5, comment: "Bakes perfect cookies and the air fry mode makes healthy fries!", date: "2026-04-12" }
    ]
  },
  {
    id: "wp-1",
    name: "PureSip RO+UV+Alkaline Multi-Stage Purifier",
    brand: "HydroPure",
    category: "Water Purifiers",
    price: 219,
    originalPrice: 299,
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.8,
    popularity: 89,
    newest: true,
    stock: 9,
    description: "8-Stage RO purifier featuring a copper-charged alkaline booster, live TDS digital controller, and food-grade stainless steel storage.",
    specs: {
      "Storage Capacity": "8 Liters Storage",
      "Purification": "RO + UV + UF + Mineralizer",
      "Material": "Food-Grade Stainless Steel & ABS",
      "Flow Rate": "15 Liters per hour",
      "TDS Reduction": "Up to 90% input TDS"
    },
    features: [
      "Alkaline cartridge balances pH levels of drinking water, making it rich in natural minerals.",
      "Real-time filter life indicator with smart alert buzzer.",
      "Zero water wastage bypass recovery loop.",
      "UV sterilization inside storage tank every 2 hours."
    ],
    warranty: "1 Year comprehensive warranty including all filters.",
    reviews: [
      { id: 1, name: "George D.", rating: 5, comment: "Water tastes incredibly sweet and light now. The TDS meter shows 24 down from 340!", date: "2026-06-14" }
    ]
  },
  {
    id: "cf-1",
    name: "AeroBreeze BLDC Silent Smart Ceiling Fan",
    brand: "WindControl",
    category: "Ceiling Fans",
    price: 85,
    originalPrice: 120,
    image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.4,
    popularity: 76,
    newest: false,
    stock: 12,
    description: "Super-efficient 28W BLDC motor ceiling fan with remote controller, whisper-quiet performance, and aerodynamic anti-dust blade profile.",
    specs: {
      "Motor Type": "Brushless DC (BLDC) Motor",
      "Power Consumption": "28W at peak speed",
      "Sweep Size": "1200 mm (48 inches)",
      "Air Delivery": "230 CMM",
      "Speed Settings": "5 Speeds + Turbo Mode"
    },
    features: [
      "Consumes 60% less electricity compared to induction fans.",
      "Included smart RF remote works from any corner of the room.",
      "Whisper-quiet double ball bearing design under 40 dB.",
      "Reversible rotation mode for warm winter air redistribution."
    ],
    warranty: "2 Years comprehensive warranty.",
    reviews: [
      { id: 1, name: "Albert M.", rating: 4, comment: "Saves a lot of power. Remote control sleep timer is super helpful.", date: "2026-05-30" }
    ]
  },
  {
    id: "cl-1",
    name: "PolarMax 50L Desert Air Cooler",
    brand: "Snowflake",
    category: "Coolers",
    price: 119,
    originalPrice: 169,
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.3,
    popularity: 74,
    newest: false,
    stock: 8,
    description: "Heavy duty desert air cooler with 50-liter large capacity tank, high-density honeycomb pads, and high-velocity blower fan.",
    specs: {
      "Capacity": "50 Liters",
      "Air Throw": "35 Feet",
      "Cooling Media": "High-Density Honeycomb Pads",
      "Power Usage": "160 Watts",
      "Blower/Fan": "Heavy-Duty Fan"
    },
    features: [
      "Special ice chamber for extra ice-cold air throw.",
      "Auto-fill float valve detects water level and fills automatically.",
      "Multi-directional wheels with locking brakes for ease of mobility.",
      "Inverter compatible for uninterrupted cooling during outages."
    ],
    warranty: "1 Year comprehensive warranty.",
    reviews: [
      { id: 1, name: "Patricia B.", rating: 4.5, comment: "Powerful air throw. Best for dry, hot summer days.", date: "2026-06-03" }
    ]
  },
  {
    id: "mg-1",
    name: "TurboBlend 750W Heavy Duty Mixer Grinder",
    brand: "PowerMix",
    category: "Mixer Grinders",
    price: 75,
    originalPrice: 99,
    image: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.6,
    popularity: 80,
    newest: false,
    stock: 15,
    description: "Professional-grade 750W motor mixer grinder with 3 stainless steel leak-proof jars, sharp multi-angle blades, and auto-overload reset.",
    specs: {
      "Motor Power": "750 Watts pure copper motor",
      "Speed Settings": "3 Speeds + Pulse Control",
      "Jars Included": "1.5L Wet, 1.0L Dry, 0.4L Chutney Jar",
      "Blade Material": "Food-Grade Stainless Steel",
      "Safety": "Auto-Cut Overload Protector"
    },
    features: [
      "Easy-grip ergonomic handles on all jars.",
      "Acoustic noise reduction casing around the copper motor.",
      "High-torque motor grinds heavy spices in under 60 seconds.",
      "Anti-skid vacuum suction feet for high-speed stability."
    ],
    warranty: "2 Years comprehensive, 5 Years on motor.",
    reviews: [
      { id: 1, name: "Meera S.", rating: 5, comment: "Perfect for wet batters and hard turmeric grinding. Jars lock securely.", date: "2026-05-12" }
    ]
  },
  {
    id: "ei-1",
    name: "SteamGlide 2200W Lightweight Steam Iron",
    brand: "PressPro",
    category: "Electric Irons",
    price: 35,
    originalPrice: 49,
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.5,
    popularity: 73,
    newest: false,
    stock: 20,
    description: "High-power 2200W steam iron with non-stick ceramic soleplate, vertical steaming mode, and anti-calc self-clean safety tech.",
    specs: {
      "Power": "2200 Watts",
      "Soleplate": "Advanced Non-Stick Ceramic",
      "Water Tank": "300 ml Capacity",
      "Steam Output": "35g/min continuous steam",
      "Cord Length": "2.0 Meters 360° Swivel"
    },
    features: [
      "Vertical steam burst enables crease removal from hanging suits.",
      "Anti-Drip system prevents water leaking even at low temps.",
      "Auto-off safety shutoff after 30 seconds horizontal/8 mins vertical.",
      "Self-cleaning calc collector prevents mineral deposits."
    ],
    warranty: "2 Years comprehensive warranty.",
    reviews: [
      { id: 1, name: "Thomas N.", rating: 4.5, comment: "Heats up incredibly fast. Glides so smoothly on cotton shirts.", date: "2026-04-20" }
    ]
  },
  {
    id: "inv-1",
    name: "PowerBackup 1500VA Pure Sine Wave Inverter",
    brand: "VoltGuard",
    category: "Inverters",
    price: 279,
    originalPrice: 349,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.7,
    popularity: 85,
    newest: true,
    stock: 4,
    description: "Humble pure sine wave home inverter with intelligent charging logic, bypass toggle switch, and multi-indicator LED control display.",
    specs: {
      "Capacity": "1500 VA / 1200 Watts",
      "Waveform": "Pure Sine Wave (Appliance Safe)",
      "Battery Type": "Supports Tubular, Flat, & SMF",
      "Transfer Time": "< 15 milliseconds",
      "Protection": "Overload, Short Circuit, Reverse Polarity"
    },
    features: [
      "Pure Sine Wave ensures silent appliance run with no hum.",
      "Dual charge settings for rapid or standard battery charging.",
      "Eco-mode cuts power use when backup load is minimal.",
      "Automatic temperature-controlled high speed cooling fan."
    ],
    warranty: "2 Years standard warranty.",
    reviews: [
      { id: 1, name: "Richard W.", rating: 5, comment: "Saves my work from sudden outages. PC doesn't even reboot!", date: "2026-06-11" }
    ]
  },
  {
    id: "led-1",
    name: "BrightBeam 9W Smart RGB+W LED Bulb (3-Pack)",
    brand: "LuxLight",
    category: "LED Bulbs",
    price: 19,
    originalPrice: 29,
    image: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.6,
    popularity: 92,
    newest: true,
    stock: 30,
    description: "Energy efficient 9W smart LED bulbs with 16 million colors, voice assistant sync, scheduling, and standard B22/E27 holders.",
    specs: {
      "Wattage": "9 Watts (Equiv. to 60W)",
      "Lumen Output": "810 Lumens",
      "Base Type": "Standard E27 Screw / B22 Pin",
      "Color Temp": "2700K - 6500K + RGB Color",
      "Connectivity": "Wi-Fi 2.4GHz + Bluetooth"
    },
    features: [
      "Control via mobile app or Alexa/Google Home voice assistant.",
      "16 Million dimmable color options with music sync capabilities.",
      "Schedule routines to wake up naturally with progressive illumination.",
      "Consumes 85% less energy than standard incandescent filaments."
    ],
    warranty: "2 Years replace warranty.",
    reviews: [
      { id: 1, name: "Emma S.", rating: 5, comment: "Setting it up was simple. Love changing the moods of my living room.", date: "2026-06-19" }
    ]
  },
  {
    id: "sw-1",
    name: "GlowTouch Smart Modular 4-Switch Plate",
    brand: "ApexWire",
    category: "Switches",
    price: 29,
    originalPrice: 39,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.4,
    popularity: 78,
    newest: false,
    stock: 25,
    description: "Premium sleek modular touch switch plate with Wi-Fi control, elegant blue LED backlighting, and shock-proof scratchless glass surface.",
    specs: {
      "Switches": "4 Modular Touch Gangs",
      "Surface": "Scratchproof Tempered Glass",
      "Max Load": "1000W resistive / 200W inductive per gang",
      "Working Voltage": "110V - 240V AC",
      "Backlight": "Blue (ON) / Soft White (OFF)"
    },
    features: [
      "Physically touch or control from anywhere via smartphone.",
      "Shock-proof plate safely operated with wet fingers.",
      "Fire-retardant polycarbonate back enclosure.",
      "Fits directly into standard 4-module metal/plastic wall boxes."
    ],
    warranty: "1 Year comprehensive warranty.",
    reviews: [
      { id: 1, name: "Chris M.", rating: 4.5, comment: "Beautiful visual upgrade. Makes my entryway look futuristic.", date: "2026-05-15" }
    ]
  },
  {
    id: "wa-1",
    name: "SafeShield Heavy Duty Fire-Retardant Wire Bundle",
    brand: "ApexWire",
    category: "Wiring Accessories",
    price: 39,
    originalPrice: 55,
    image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.8,
    popularity: 81,
    newest: false,
    stock: 15,
    description: "Heavy-duty industrial grade 1.5 sq mm copper wire roll (90m) with triple-layer fire retardant PVC shield. Ideal for house rewiring.",
    specs: {
      "Length": "90 Meters Roll",
      "Conductor": "100% Electrolytic Grade Copper",
      "Gauge / Width": "1.5 sq mm cross section",
      "Insulation": "HR-FR (Heat Resistant Fire Retardant) PVC",
      "Voltage Grade": "Up to 1100 Volts"
    },
    features: [
      "Anti-rodent and anti-termite insulation additive formulas.",
      "High oxygen and temperature indexes stop smoke propagation.",
      "100% conductivity reduces electric power line leakage losses.",
      "Extremely flexible, easily slides through complex wall conduits."
    ],
    warranty: "5 Years performance warranty.",
    reviews: [
      { id: 1, name: "Dennis R.", rating: 5, comment: "Master electrician here. Excellent copper quality and tough fireproof skin. Approved.", date: "2026-06-08" }
    ]
  },
  {
    id: "sp-1",
    name: "Universal Inverter AC Outdoor PCB Motherboard",
    brand: "FactoryDirect",
    category: "Genuine Spare Parts",
    price: 89,
    originalPrice: 119,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80"
    ],
    rating: 4.7,
    popularity: 83,
    newest: false,
    stock: 5,
    description: "Genuine factory-calibrated universal replacement main PCB board for split air conditioner outdoor units. Supports variable-speed inverter compressors.",
    specs: {
      "Compatibility": "1.0 to 2.0 Ton Inverter AC outdoor units",
      "Input Voltage": "220V - 240V, 50Hz",
      "EEPROM": "Pre-flashed with generic safety parameter charts",
      "Heatsink": "Heavy Duty Integrated Aluminum",
      "Sensors": "Ambient, Coil, and Discharge temperature probe bundle"
    },
    features: [
      "Factory original components ensure high voltage surge resilience.",
      "Conformal coating protects against high moisture, dust, and rust.",
      "Self-diagnosis chip reports error codes directly to the indoor unit.",
      "Standard plug-and-play terminal layouts for simple technician fitment."
    ],
    warranty: "6 Months parts replacement warranty.",
    reviews: [
      { id: 1, name: "Ken L.", rating: 5, comment: "Saved me from buying a whole new AC unit. Easy swap, worked perfectly with my outdoor fan!", date: "2026-06-25" }
    ]
  }
];

export const CATEGORY_FALLBACKS = {
  "Air Conditioners": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
  "Refrigerators": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80",
  "Washing Machines": "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80",
  "Televisions": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80",
  "Microwave Ovens": "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80",
  "Water Purifiers": "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80",
  "Ceiling Fans": "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=600&q=80",
  "Coolers": "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80",
  "Mixer Grinders": "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=600&q=80",
  "Electric Irons": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80",
  "Inverters": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
  "LED Bulbs": "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80",
  "Switches": "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
  "Wiring Accessories": "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80",
  "Genuine Spare Parts": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
  "default": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
};

export const getFallbackProductImage = (category, name) => {
  if (category && CATEGORY_FALLBACKS[category]) {
    return CATEGORY_FALLBACKS[category];
  }

  const cat = (category || "").toLowerCase();
  const title = (name || "").toLowerCase();

  if (cat.includes("ref") || title.includes("refrigerator") || title.includes("fridge")) {
    return CATEGORY_FALLBACKS["Refrigerators"];
  }
  if (cat.includes("wash") || cat.includes("dry") || title.includes("wash") || title.includes("laundry") || title.includes("dryer")) {
    return CATEGORY_FALLBACKS["Washing Machines"];
  }
  if (cat.includes("ac") || cat.includes("air cond") || title.includes("ac") || title.includes("air conditioner") || title.includes("cooling")) {
    return CATEGORY_FALLBACKS["Air Conditioners"];
  }
  if (cat.includes("tv") || cat.includes("tele") || title.includes("tv") || title.includes("television") || title.includes("screen") || title.includes("cinema")) {
    return CATEGORY_FALLBACKS["Televisions"];
  }
  if (cat.includes("micro") || title.includes("microwave") || title.includes("oven") || title.includes("cooker")) {
    return CATEGORY_FALLBACKS["Microwave Ovens"];
  }
  if (cat.includes("lap") || title.includes("laptop") || title.includes("notebook")) {
    return "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("desk") || title.includes("desktop") || title.includes("computer") || title.includes("monitor")) {
    return "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("mob") || cat.includes("phone") || title.includes("mobile") || title.includes("phone") || title.includes("smartphone")) {
    return "https://images.unsplash.com/photo-1551645121-d1034da75057?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("water") || cat.includes("puri") || title.includes("purifier") || title.includes("water")) {
    return CATEGORY_FALLBACKS["Water Purifiers"];
  }
  if (cat.includes("kitchen") || cat.includes("appliance") || title.includes("kitchen") || title.includes("grinder") || title.includes("mixer") || title.includes("blend")) {
    return CATEGORY_FALLBACKS["Mixer Grinders"];
  }
  if (cat.includes("fan") || title.includes("fan")) {
    return CATEGORY_FALLBACKS["Ceiling Fans"];
  }
  if (cat.includes("cool") || title.includes("cooler")) {
    return CATEGORY_FALLBACKS["Coolers"];
  }
  if (cat.includes("iron") || title.includes("iron") || title.includes("press")) {
    return CATEGORY_FALLBACKS["Electric Irons"];
  }
  if (cat.includes("invert") || title.includes("inverter") || title.includes("battery") || title.includes("backup")) {
    return CATEGORY_FALLBACKS["Inverters"];
  }
  if (cat.includes("led") || cat.includes("bulb") || title.includes("led") || title.includes("bulb") || title.includes("light")) {
    return CATEGORY_FALLBACKS["LED Bulbs"];
  }
  if (cat.includes("switch") || title.includes("switch") || title.includes("plate")) {
    return CATEGORY_FALLBACKS["Switches"];
  }
  if (cat.includes("wire") || cat.includes("access") || title.includes("wire") || title.includes("cable") || title.includes("conduit")) {
    return CATEGORY_FALLBACKS["Wiring Accessories"];
  }
  if (cat.includes("spare") || cat.includes("part") || cat.includes("pcb") || title.includes("pcb") || title.includes("motherboard") || title.includes("spare") || title.includes("part") || title.includes("motor") || title.includes("capacitor") || title.includes("gasket")) {
    return CATEGORY_FALLBACKS["Genuine Spare Parts"];
  }
  return CATEGORY_FALLBACKS["default"];
};
