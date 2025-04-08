import { 
  Camera, ComputerIcon, Headphones, Home, Car, Dumbbell, 
  ShoppingBag, Dog, Music, Gamepad, Baby, Tv, Gift, Watch, 
  Ticket, BookOpen, MusicIcon, Monitor, Film, Sofa, Smartphone,
  Building, Briefcase, Wrench, LampDesk, DollarSign
} from "lucide-react";

export interface SubSubCategory {
  id: string;
  name: string;
}

export interface SubCategory {
  id: string;
  name: string;
  subSubCategories?: SubSubCategory[];
  highlight?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: any;
  subCategories: SubCategory[];
}

export const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    icon: Tv,
    subCategories: [
      {
        id: "home-audio",
        name: "Home Audio & Turntables",
        subSubCategories: [
          { id: "amplifiers", name: "Amplifiers" },
          { id: "cassette-players", name: "Cassette Players/Recorders" },
          { id: "cd-players", name: "CD Players/Recorders" },
          { id: "digital-music-systems", name: "Digital Music Systems" },
          { id: "karaoke", name: "Karaoke" },
          { id: "minidisc-players", name: "MiniDisc Players" },
          { id: "radios", name: "Radios" },
          { id: "receivers", name: "Receivers" },
          { id: "speakers-subwoofers", name: "Speakers & Subwoofers" },
          { id: "turntable-parts", name: "Turntable Parts & Accessories" },
          { id: "turntables", name: "Turntables" },
        ]
      },
      {
        id: "televisions",
        name: "Televisions",
        subSubCategories: [
          { id: "flat-panel", name: "Flat Panel" },
          { id: "lcd", name: "LCD" },
          { id: "led-lcd", name: "LED LCD" },
          { id: "oled-tvs", name: "OLED TVs" },
          { id: "plasmaAS", name: "PlasmaAS" },
          { id: "standard-crt", name: "Standard CRT" },
          { id: "other-televisions", name: "Other" },
        ]
      },
      {
        id: "dvd-home-theater",
        name: "DVD & Home Theater",
        subSubCategories: [
          { id: "dvd-players", name: "DVD Players" },
          { id: "home-theater-systems", name: "Home Theater Systems" },
          { id: "media-streamers", name: "Media Streamers" },
          { id: "mounts-cables", name: "Mounts & Cables" },
          { id: "vcrs", name: "VCRs" },
        ]
      },
      { 
        id: "electronic-accessories",
        name: "Electronic Accessories",
        subSubCategories: [
          { id: "antennas", name: "Antennas" },
          { id: "cables-chords", name: "Cables and Chords" },
          { id: "chargers-batteries", name: "Chargers/Batteries" },
          { id: "headphones", name: "Headphones" },
          { id: "travel-converter", name: "Travel Converter" },
        ]
      },
      { 
        id: "gadgets", 
        name: "Gadgets",
        subSubCategories: [
          { id: "calculators", name: "Calculators" },
          { id: "dictaphones", name: "Dictaphones" },
          { id: "digital-clocks-radios", name: "Digital Clocks/Radios" },
          { id: "digital-scales", name: "Digital Scales" },
          { id: "ebook-readers", name: "eBook Readers" },
          { id: "gps-navigation", name: "GPS Navigation" },
          { id: "landline-telephones", name: "Landline Telephones" },
          { id: "surveillance", name: "Surveillance" },
          { id: "other-gadgets", name: "Other" },
        ]
      },
      { 
        id: "car-electronics", 
        name: "Car Electronics",
        subSubCategories: [
          { id: "car-alarms", name: "Car Alarms" },
          { id: "car-audio-systems", name: "Car Audio Systems" },
          { id: "car-speakers", name: "Car Speakers" },
          { id: "car-video", name: "Car Video" },
          { id: "other-car-electronics", name: "Other" },
        ]
      },
      { 
        id: "projectors", 
        name: "Projectors"
      },
      { 
        id: "mp3-players", 
        name: "Mp3 Players and Portable Audio",
        subSubCategories: [
          { id: "apple-ipod", name: "Apple iPod" },
          { id: "cd-player", name: "CD Player" },
          { id: "microsoft-mp3", name: "Microsoft MP3 Player" },
          { id: "mp3-speakers", name: "MP3 Speakers" },
        ]
      },
      { 
        id: "satellite-cable", 
        name: "Satellite & Cable TV",
        subSubCategories: [
          { id: "cable-tv-boxes", name: "Cable TV Boxes" },
          { id: "satellite-tv-equipment", name: "Satellite TV Equipment" },
        ]
      },
      { 
        id: "health-electronics", 
        name: "Health Electronics"
      },
      { 
        id: "smart-home", 
        name: "Smart Home"
      },
      { 
        id: "wearable-technology", 
        name: "Wearable Technology",
        subSubCategories: [
          { id: "fitness-trackers", name: "Fitness Trackers" },
          { id: "smart-watches", name: "Smart Watches" },
          { id: "vr-headsets", name: "VR Headsets" },
        ]
      },
      { 
        id: "other-electronics", 
        name: "Other"
      }
    ]
  },
  {
    id: "computers",
    name: "Computers & Networking",
    icon: ComputerIcon,
    subCategories: [
      { 
        id: "computers", 
        name: "Computers",
        subSubCategories: [
          { id: "desktop-computers", name: "Desktop Computers" },
          { id: "laptop-computers", name: "Laptop Computers" },
          { id: "netbooks", name: "Netbooks" },
          { id: "servers", name: "Servers" },
          { id: "tablets", name: "Tablets" },
        ]
      },
      { 
        id: "computer-components", 
        name: "Computer Components",
        subSubCategories: [
          { id: "cases-towers", name: "Cases & Towers" },
          { id: "cpus", name: "CPUs" },
          { id: "drivers", name: "Drivers" },
          { id: "fans-cooling", name: "Fans & Cooling" },
          { id: "graphics-video-cards", name: "Graphics & Video Cards" },
          { id: "memory", name: "Memory" },
          { id: "power-supplies", name: "Power Supplies" },
          { id: "screens-lcd-panels", name: "Screens & LCD Panels" },
          { id: "sound-cards", name: "Sound Cards" },
          { id: "storage", name: "Storage" },
          { id: "motherboards", name: "Motherboards" },
          { id: "other-components", name: "Other" },
        ]
      },
      { 
        id: "accessories", 
        name: "Accessories",
        subSubCategories: [
          { id: "bags-cases", name: "Bags & Cases" },
          { id: "chargers-cables", name: "Chargers & Cables" },
          { id: "docking-stations", name: "Docking Stations" },
          { id: "external-hard-drives", name: "External Hard Drives" },
          { id: "headsets-microphones", name: "Headsets & Microphones" },
          { id: "speakers", name: "Speakers" },
          { id: "webcams", name: "Webcams" },
          { id: "other-accessories", name: "Other" },
        ]
      },
      { 
        id: "networking", 
        name: "Networking & Communication",
        subSubCategories: [
          { id: "modems", name: "Modems" },
          { id: "networking-cables", name: "Networking Cables" },
          { id: "networking-hubs", name: "Networking Hubs" },
          { id: "networking-switches", name: "Networking Switches" },
          { id: "routers", name: "Routers" },
          { id: "security", name: "Security" },
          { id: "voip-business-phones", name: "VoIP Business Phones" },
          { id: "wireless-access-points", name: "Wireless Access Points" },
          { id: "other-networking", name: "Other" },
        ]
      },
      { 
        id: "software", 
        name: "Software",
        subSubCategories: [
          { id: "business", name: "Business" },
          { id: "design", name: "Design" },
          { id: "education", name: "Education" },
          { id: "gaming", name: "Gaming" },
          { id: "networking", name: "Networking" },
          { id: "personal-management", name: "Personal Management" },
          { id: "security", name: "Security" },
          { id: "other-software", name: "Other" },
        ]
      },
      { id: "mining-rigs", name: "Mining Rigs & Components (CryptoCurrency)" },
      { id: "pos-machine", name: "POS machine & parts" },
      { 
        id: "peripherals", 
        name: "Monitors, Printers & Other Peripherals",
        subSubCategories: [
          { id: "keyboards", name: "Keyboards" },
          { id: "mice", name: "Mice" },
          { id: "monitors", name: "Monitors" },
          { id: "printers", name: "Printers" },
          { id: "scanners", name: "Scanners" },
          { id: "other-peripherals", name: "Other" },
        ]
      },
    ]
  },
  {
    id: "business",
    name: "Business & Industrial",
    icon: Building,
    subCategories: [
      { 
        id: "businesses-for-sale", 
        name: "Businesses for Sale",
        subSubCategories: [
          { id: "manufacturing", name: "Manufacturing" },
          { id: "marketing", name: "Marketing" },
          { id: "retail", name: "Retail" },
          { id: "service-business", name: "Service Business" },
          { id: "trade-distribution", name: "Trade & Distribution" },
          { id: "other-businesses", name: "Other" },
        ]
      },
      { 
        id: "construction", 
        name: "Construction",
        subSubCategories: [
          { id: "building-materials-supplies", name: "Building Materials & Supplies" },
          { id: "heavy-equipment-parts", name: "Heavy Equipment & Parts" },
          { id: "light-equipment-tools", name: "Light Equipment & Tools" },
          { id: "other-construction", name: "Other" },
        ]
      },
      { 
        id: "food-beverage", 
        name: "Food & Beverage",
        subSubCategories: [
          { id: "bar-equipment", name: "Bar Equipment" },
          { id: "commercial-kitchen-supplies", name: "Commercial Kitchen & Supplies" },
          { id: "furniture-decor", name: "Furniture & Decor" },
          { id: "refrigeration-ice", name: "Refrigeration & Ice" },
          { id: "serving", name: "Serving" },
          { id: "other-food-beverage", name: "Other" },
        ]
      },
      { 
        id: "industrial-supplies", 
        name: "Industrial Supplies",
        subSubCategories: [
          { id: "adhesives-sealant", name: "Adhesives & Sealant" },
          { id: "cleaning-equip-supplies", name: "Cleaning Equip. & Supplies" },
          { id: "generators", name: "Generators" },
          { id: "hardware", name: "Hardware" },
          { id: "hvac", name: "HVAC" },
          { id: "lifts-lift-parts", name: "Lifts & Lift parts" },
          { id: "lighting-lasers", name: "Lighting & Lasers" },
          { id: "painting-equip-supplies", name: "Painting Equip. & Supplies" },
          { id: "plumbing-parts-equip", name: "Plumbing Parts & Equip." },
          { id: "safety-equip", name: "Safety Equip." },
          { id: "other-industrial", name: "Other" },
        ]
      },
      { 
        id: "office-furniture-equipment", 
        name: "Office Furniture & Equipment",
        subSubCategories: [
          { id: "office-equipment", name: "Office Equipment" },
          { id: "office-fit-outs", name: "Office Fit Outs" },
          { id: "office-supplies", name: "Office Supplies" },
          { id: "phones-faxes", name: "Phones & Faxes" },
        ]
      },
      { 
        id: "manufacturing", 
        name: "Manufacturing",
        subSubCategories: [
          { id: "manufacturing-equip-tools", name: "Manufacturing Equip. & Tools" },
          { id: "manufacturing-machines", name: "Manufacturing Machines" },
          { id: "metals", name: "Metals" },
          { id: "textiles", name: "Textiles" },
          { id: "welding", name: "Welding" },
        ]
      },
      { 
        id: "electrical-equipment", 
        name: "Electrical Equipment",
        subSubCategories: [
          { id: "electrical-equip-tools", name: "Electrical Equip. Tools" },
          { id: "wire-transformers-breakers", name: "Wire, Transformers, Breakers, etc..." },
          { id: "other-electrical", name: "Other" },
        ]
      },
      { 
        id: "retail-services", 
        name: "Retail & Services",
        subSubCategories: [
          { id: "in-store-display-equipment", name: "In Store Display Equipment" },
          { id: "laundering-equip-supplies", name: "Laundering Equip. & Supplies" },
          { id: "racks-fixtures", name: "Racks & Fixtures" },
          { id: "security-surveillance", name: "Security & Surveillance" },
          { id: "other-retail", name: "Other" },
        ]
      },
      { 
        id: "healthcare-lab", 
        name: "Healthcare & Lab",
        subSubCategories: [
          { id: "dental-equipment", name: "Dental Equipment" },
          { id: "imaging-equip-supplies", name: "Imaging Equip. & Supplies" },
          { id: "lab-equip-supplies", name: "Lab Equip. & Supplies" },
          { id: "medical-equip-supplies", name: "Medical Equip. & Supplies" },
          { id: "other-healthcare", name: "Other" },
        ]
      },
      { 
        id: "commercial-printing", 
        name: "Commercial Printing & Copy Machines",
        subSubCategories: [
          { id: "copy-machines", name: "Copy Machines" },
          { id: "ink-print-cartridges", name: "Ink & Print Cartridges" },
          { id: "screen-specialty-printers", name: "Screen & Specialty Printers" },
          { id: "other-printing", name: "Other" },
        ]
      },
      { 
        id: "packing-shipping", 
        name: "Packing & Shipping",
        subSubCategories: [
          { id: "bags", name: "Bags" },
          { id: "boxes", name: "Boxes" },
          { id: "envelopes", name: "Envelopes" },
          { id: "scales", name: "Scales" },
        ]
      },
      { 
        id: "agriculture-forestry", 
        name: "Agriculture & Forestry",
        subSubCategories: [
          { id: "farm-equipment-parts", name: "Farm Equipment Parts" },
          { id: "livestock-supplies", name: "Livestock & Supplies" },
          { id: "tractors-equipment", name: "Tractors & Equipment" },
          { id: "other-agriculture", name: "Other" },
        ]
      },
      { id: "other-business", name: "Other" }
    ]
  },
  {
    id: "mobile",
    name: "Mobile Phones & Tablets",
    icon: Smartphone,
    subCategories: [
      { 
        id: "mobile-phones", 
        name: "Mobile Phones",
        subSubCategories: [
          { id: "apple", name: "Apple" },
          { id: "samsung", name: "Samsung" },
          { id: "google", name: "Google" },
          { id: "huawei", name: "Huawei" },
          { id: "xiaomi", name: "Xiaomi" },
          { id: "oppo", name: "Oppo" },
          { id: "oneplus", name: "OnePlus" },
          { id: "honor", name: "Honor" },
          { id: "nokia", name: "Nokia" },
          { id: "vivo", name: "Vivo" },
          { id: "motorola", name: "Motorola" },
          { id: "realme", name: "Realme" },
          { id: "sony-ericsson", name: "Sony Ericsson" },
          { id: "zte", name: "ZTE Phones" },
          { id: "vertu", name: "Vertu" },
          { id: "asus", name: "Asus" },
          { id: "infinix", name: "Infinix" },
          { id: "blackberry", name: "Blackberry" },
          { id: "nothing-phone", name: "Nothing Phone" },
          { id: "other-phones", name: "Other" }
        ]
      },
      { 
        id: "tablets", 
        name: "Tablets",
        subSubCategories: [
          { id: "apple-tablets", name: "Apple iPad" },
          { id: "samsung-tablets", name: "Samsung Tablets" },
          { id: "microsoft-tablets", name: "Microsoft Surface" },
          { id: "lenovo-tablets", name: "Lenovo Tablets" },
          { id: "huawei-tablets", name: "Huawei Tablets" },
          { id: "amazon-tablets", name: "Amazon Fire" },
          { id: "other-tablets", name: "Other Tablets" }
        ]
      },
      { 
        id: "mobile-accessories", 
        name: "Mobile Accessories",
        subSubCategories: [
          { id: "cases-covers", name: "Cases & Covers" },
          { id: "screen-protectors", name: "Screen Protectors" },
          { id: "chargers", name: "Chargers" },
          { id: "cables", name: "Cables" },
          { id: "power-banks", name: "Power Banks" },
          { id: "batteries", name: "Batteries" },
          { id: "selfie-sticks", name: "Selfie Sticks" },
          { id: "holders-mounts", name: "Holders & Mounts" },
          { id: "memory-cards", name: "Memory Cards" },
          { id: "bluetooth-headsets", name: "Bluetooth Headsets" },
          { id: "other-accessories", name: "Other Accessories" }
        ]
      },
      { 
        id: "smart-watches", 
        name: "Smart Watches & Trackers",
        subSubCategories: [
          { id: "apple-watch", name: "Apple Watch" },
          { id: "samsung-watch", name: "Samsung Watch" },
          { id: "fitbit", name: "Fitbit" },
          { id: "garmin", name: "Garmin" },
          { id: "xiaomi-band", name: "Xiaomi Band" },
          { id: "other-smart-watches", name: "Other Smart Watches" }
        ]
      }
    ]
  },
  {
    id: "home-garden",
    name: "Home & Garden",
    icon: Home,
    subCategories: [
      { 
        id: "furniture", 
        name: "Furniture",
        subSubCategories: [
          { id: "sofas-couches", name: "Sofas & Couches" },
          { id: "beds-mattresses", name: "Beds & Mattresses" },
          { id: "tables", name: "Tables" },
          { id: "chairs", name: "Chairs" },
          { id: "cabinets-storage", name: "Cabinets & Storage" },
          { id: "dining-sets", name: "Dining Sets" },
          { id: "dressers-wardrobes", name: "Dressers & Wardrobes" },
          { id: "office-furniture", name: "Office Furniture" },
          { id: "outdoor-furniture", name: "Outdoor Furniture" }
        ]
      },
      { 
        id: "home-decor", 
        name: "Home Decor",
        subSubCategories: [
          { id: "wall-art", name: "Wall Art" },
          { id: "rugs-carpets", name: "Rugs & Carpets" },
          { id: "curtains-blinds", name: "Curtains & Blinds" },
          { id: "lighting", name: "Lighting" },
          { id: "decorative-pillows", name: "Decorative Pillows" },
          { id: "vases", name: "Vases" },
          { id: "clocks", name: "Clocks" },
          { id: "mirrors", name: "Mirrors" }
        ]
      },
      { 
        id: "kitchen", 
        name: "Kitchen & Dining",
        subSubCategories: [
          { id: "cookware", name: "Cookware" },
          { id: "bakeware", name: "Bakeware" },
          { id: "kitchen-appliances", name: "Kitchen Appliances" },
          { id: "dinnerware", name: "Dinnerware" },
          { id: "flatware", name: "Flatware" },
          { id: "glassware", name: "Glassware" },
          { id: "kitchen-tools", name: "Kitchen Tools & Gadgets" },
          { id: "storage-containers", name: "Storage & Containers" }
        ]
      },
      { 
        id: "garden", 
        name: "Garden & Outdoor",
        subSubCategories: [
          { id: "gardening-tools", name: "Gardening Tools" },
          { id: "plants-seeds", name: "Plants & Seeds" },
          { id: "outdoor-decor", name: "Outdoor Decor" },
          { id: "grills-bbq", name: "Grills & BBQ" },
          { id: "patio-furniture", name: "Patio Furniture" },
          { id: "outdoor-lighting", name: "Outdoor Lighting" },
          { id: "lawn-mowers", name: "Lawn Mowers" }
        ]
      },
      { 
        id: "bedding", 
        name: "Bedding & Bath",
        subSubCategories: [
          { id: "bed-sheets", name: "Bed Sheets" },
          { id: "comforters-duvets", name: "Comforters & Duvets" },
          { id: "pillows", name: "Pillows" },
          { id: "blankets-throws", name: "Blankets & Throws" },
          { id: "towels", name: "Towels" },
          { id: "shower-curtains", name: "Shower Curtains" },
          { id: "bathroom-accessories", name: "Bathroom Accessories" }
        ]
      },
      { 
        id: "appliances", 
        name: "Appliances",
        subSubCategories: [
          { id: "refrigerators", name: "Refrigerators" },
          { id: "washing-machines", name: "Washing Machines" },
          { id: "dryers", name: "Dryers" },
          { id: "dishwashers", name: "Dishwashers" },
          { id: "ovens-ranges", name: "Ovens & Ranges" },
          { id: "microwaves", name: "Microwaves" },
          { id: "vacuum-cleaners", name: "Vacuum Cleaners" },
          { id: "small-appliances", name: "Small Appliances" }
        ]
      }
    ]
  },
  {
    id: "clothing",
    name: "Clothing & Fashion",
    icon: ShoppingBag,
    subCategories: [
      { 
        id: "mens-clothing", 
        name: "Men's Clothing",
        subSubCategories: [
          { id: "mens-shirts", name: "Shirts" },
          { id: "mens-t-shirts", name: "T-Shirts" },
          { id: "mens-pants", name: "Pants" },
          { id: "mens-jeans", name: "Jeans" },
          { id: "mens-shorts", name: "Shorts" },
          { id: "mens-suits", name: "Suits" },
          { id: "mens-outerwear", name: "Outerwear" },
          { id: "mens-underwear", name: "Underwear" },
          { id: "mens-sleepwear", name: "Sleepwear" }
        ]
      },
      { 
        id: "womens-clothing", 
        name: "Women's Clothing",
        subSubCategories: [
          { id: "womens-dresses", name: "Dresses" },
          { id: "womens-tops", name: "Tops & Blouses" },
          { id: "womens-pants", name: "Pants" },
          { id: "womens-jeans", name: "Jeans" },
          { id: "womens-skirts", name: "Skirts" },
          { id: "womens-suits", name: "Suits" },
          { id: "womens-outerwear", name: "Outerwear" },
          { id: "womens-intimates", name: "Intimates" },
          { id: "womens-sleepwear", name: "Sleepwear" }
        ]
      },
      { 
        id: "shoes", 
        name: "Shoes",
        subSubCategories: [
          { id: "mens-shoes", name: "Men's Shoes" },
          { id: "womens-shoes", name: "Women's Shoes" },
          { id: "kids-shoes", name: "Kids' Shoes" },
          { id: "athletic-shoes", name: "Athletic Shoes" },
          { id: "boots", name: "Boots" },
          { id: "sandals", name: "Sandals" },
          { id: "formal-shoes", name: "Formal Shoes" }
        ]
      },
      { 
        id: "accessories", 
        name: "Accessories",
        subSubCategories: [
          { id: "bags-wallets", name: "Bags & Wallets" },
          { id: "belts", name: "Belts" },
          { id: "hats", name: "Hats" },
          { id: "jewelry", name: "Jewelry" },
          { id: "scarves", name: "Scarves" },
          { id: "sunglasses", name: "Sunglasses" },
          { id: "watches", name: "Watches" }
        ]
      },
      { 
        id: "kids-clothing", 
        name: "Kids' Clothing",
        subSubCategories: [
          { id: "boys-clothing", name: "Boys' Clothing" },
          { id: "girls-clothing", name: "Girls' Clothing" },
          { id: "baby-clothing", name: "Baby Clothing" },
          { id: "kids-activewear", name: "Kids' Activewear" }
        ]
      }
    ]
  },
  {
    id: "sports",
    name: "Sports & Outdoors",
    icon: Dumbbell,
    subCategories: [
      { 
        id: "exercise-fitness", 
        name: "Exercise & Fitness",
        subSubCategories: [
          { id: "cardio-equipment", name: "Cardio Equipment" },
          { id: "strength-training", name: "Strength Training" },
          { id: "yoga-pilates", name: "Yoga & Pilates" },
          { id: "fitness-accessories", name: "Fitness Accessories" },
          { id: "fitness-trackers", name: "Fitness Trackers" }
        ]
      },
      { 
        id: "team-sports", 
        name: "Team Sports",
        subSubCategories: [
          { id: "football", name: "Football" },
          { id: "basketball", name: "Basketball" },
          { id: "soccer", name: "Soccer" },
          { id: "baseball", name: "Baseball" },
          { id: "volleyball", name: "Volleyball" },
          { id: "hockey", name: "Hockey" }
        ]
      },
      { 
        id: "outdoor-recreation", 
        name: "Outdoor Recreation",
        subSubCategories: [
          { id: "camping", name: "Camping" },
          { id: "hiking", name: "Hiking" },
          { id: "cycling", name: "Cycling" },
          { id: "fishing", name: "Fishing" },
          { id: "hunting", name: "Hunting" },
          { id: "water-sports", name: "Water Sports" }
        ]
      },
      { 
        id: "sports-apparel", 
        name: "Sports Apparel",
        subSubCategories: [
          { id: "mens-activewear", name: "Men's Activewear" },
          { id: "womens-activewear", name: "Women's Activewear" },
          { id: "kids-activewear", name: "Kids' Activewear" },
          { id: "sports-shoes", name: "Sports Shoes" }
        ]
      }
    ]
  },
  {
    id: "toys-hobbies",
    name: "Toys & Hobbies",
    icon: Gamepad,
    subCategories: [
      { 
        id: "toys", 
        name: "Toys",
        subSubCategories: [
          { id: "action-figures", name: "Action Figures" },
          { id: "dolls", name: "Dolls" },
          { id: "educational-toys", name: "Educational Toys" },
          { id: "games-puzzles", name: "Games & Puzzles" },
          { id: "remote-control", name: "Remote Control" },
          { id: "stuffed-animals", name: "Stuffed Animals" },
          { id: "outdoor-toys", name: "Outdoor Toys" }
        ]
      },
      { 
        id: "collectibles", 
        name: "Collectibles",
        subSubCategories: [
          { id: "coins-currency", name: "Coins & Currency" },
          { id: "stamps", name: "Stamps" },
          { id: "sports-memorabilia", name: "Sports Memorabilia" },
          { id: "trading-cards", name: "Trading Cards" },
          { id: "comic-books", name: "Comic Books" },
          { id: "movie-memorabilia", name: "Movie Memorabilia" }
        ]
      },
      { 
        id: "art-crafts", 
        name: "Art & Crafts",
        subSubCategories: [
          { id: "art-supplies", name: "Art Supplies" },
          { id: "craft-supplies", name: "Craft Supplies" },
          { id: "scrapbooking", name: "Scrapbooking" },
          { id: "sewing", name: "Sewing" },
          { id: "knitting-crochet", name: "Knitting & Crochet" }
        ]
      },
      { 
        id: "musical-instruments", 
        name: "Musical Instruments",
        subSubCategories: [
          { id: "guitars", name: "Guitars" },
          { id: "drums-percussion", name: "Drums & Percussion" },
          { id: "keyboards-pianos", name: "Keyboards & Pianos" },
          { id: "brass", name: "Brass" },
          { id: "woodwind", name: "Woodwind" },
          { id: "string-instruments", name: "String Instruments" },
          { id: "dj-equipment", name: "DJ Equipment" }
        ]
      },
      { 
        id: "video-games", 
        name: "Video Games",
        subSubCategories: [
          { id: "playstation", name: "PlayStation" },
          { id: "xbox", name: "Xbox" },
          { id: "nintendo", name: "Nintendo" },
          { id: "pc-games", name: "PC Games" },
          { id: "retro-gaming", name: "Retro Gaming" },
          { id: "gaming-accessories", name: "Gaming Accessories" }
        ]
      }
    ]
  },
  {
    id: "jewelry-watches",
    name: "Jewelry & Watches",
    icon: Watch,
    subCategories: [
      { 
        id: "watches", 
        name: "Watches",
        subSubCategories: [
          { id: "childrens-watches", name: "Children's Watches" },
          { id: "mens-sport-watches", name: "Men's Sport Watches" },
          { id: "mens-watches", name: "Men's Watches" },
          { id: "pocket-stop-watches", name: "Pocket Watches & Stop Watches" },
          { id: "womens-sport-watches", name: "Women's Sport Watches" },
          { id: "womens-watches", name: "Women's Watches" },
        ]
      },
      { 
        id: "womens-jewelry", 
        name: "Women's Jewelry",
        subSubCategories: [
          { id: "body-jewelry", name: "Body Jewelry" },
          { id: "bracelets", name: "Bracelets" },
          { id: "earrings", name: "Earrings" },
          { id: "ethnic-artisan-jewelry", name: "Ethnic & Artisan Jewelry" },
          { id: "hair-jewelry", name: "Hair Jewelry" },
          { id: "pins-brooches", name: "Pins & Brooches" },
          { id: "rings", name: "Rings" },
          { id: "other-womens-jewelry", name: "Other" },
        ]
      },
      { 
        id: "mens-jewelry", 
        name: "Men's Jewelry",
        subSubCategories: [
          { id: "belt-buckles", name: "Belt Buckles" },
          { id: "mens-bracelets", name: "Bracelets" },
          { id: "chains-necklaces", name: "Chains & Necklaces" },
          { id: "cufflinks", name: "Cufflinks" },
          { id: "pins-tie-clips", name: "Pins & Tie Clips" },
          { id: "mens-rings", name: "Rings" },
          { id: "studs", name: "Studs" },
          { id: "other-mens-jewelry", name: "Other" },
        ]
      },
      { 
        id: "loose-diamonds-gems", 
        name: "Loose Diamonds & Gems",
        subSubCategories: [
          { id: "cz", name: "CZ" },
          { id: "diamonds", name: "Diamonds" },
          { id: "gemstones", name: "Gemstones" },
          { id: "other-gems", name: "Other" },
        ]
      },
      { id: "other-jewelry", name: "Other" }
    ]
  },
  {
    id: "pets",
    name: "Pets",
    icon: Dog,
    subCategories: [
      { 
        id: "pets-for-adoption", 
        name: "Pets for Free Adoption",
        subSubCategories: [
          { id: "birds", name: "Birds" },
          { id: "cats", name: "Cats" },
          { id: "dogs", name: "Dogs" },
          { id: "fish", name: "Fish" },
          { id: "rabbits-rodents", name: "Rabbits & Rodents" },
          { id: "reptiles", name: "Reptiles" },
          { id: "other-pets", name: "Other" },
        ]
      },
      { 
        id: "pet-accessories", 
        name: "Pet Accessories",
        subSubCategories: [
          { id: "aquariums-supplies", name: "Aquariums & Fish/Reptile Supplies" },
          { id: "bird-supplies", name: "Bird Supplies" },
          { id: "cat-supplies", name: "Cat Supplies" },
          { id: "dog-supplies", name: "Dog Supplies" },
          { id: "rabbit-rodent-supplies", name: "Rabbit & Rodent Supplies" },
          { id: "other-pet-supplies", name: "Other Pet Supplies" },
        ]
      },
      { id: "lost-found-pets", name: "Lost & Found Pets" }
    ]
  },
  {
    id: "musical-instruments",
    name: "Musical Instruments",
    icon: MusicIcon,
    subCategories: [
      { 
        id: "guitars", 
        name: "Guitars",
        subSubCategories: [
          { id: "acoustic", name: "Acoustic" },
          { id: "acoustic-electric", name: "Acoustic Electric" },
          { id: "amps-chords", name: "Amps & Chords" },
          { id: "bass", name: "Bass" },
          { id: "cases-accessories", name: "Cases & Accessories" },
          { id: "electric", name: "Electric" },
        ]
      },
      { 
        id: "pianos-keyboards", 
        name: "Pianos, Keyboards & Organs",
        subSubCategories: [
          { id: "equipment-accessories", name: "Equipment & Accessories" },
          { id: "grand-pianos", name: "Grand Pianos" },
          { id: "keyboards-synthesizers", name: "Keyboards & Synthesizers" },
          { id: "organs", name: "Organs" },
          { id: "upright-pianos", name: "Upright Pianos" },
          { id: "other-pianos", name: "Other" },
        ]
      },
      { 
        id: "percussion", 
        name: "Percussion",
        subSubCategories: [
          { id: "bells-cymbals", name: "Bells & Cymbals" },
          { id: "drums", name: "Drums" },
          { id: "percussion-equipment", name: "Equipment & Accessories" },
          { id: "other-percussion", name: "Other" },
        ]
      },
      { 
        id: "string-instruments", 
        name: "String Instruments",
        subSubCategories: [
          { id: "string-equipment", name: "Equipment & Accessories" },
          { id: "viola-violin", name: "Viola & Violin" },
          { id: "other-string-instruments", name: "Other String Instruments" },
        ]
      },
      { 
        id: "wind-instruments", 
        name: "Wind Instruments",
        subSubCategories: [
          { id: "baritone-tuba", name: "Baritone & Tuba" },
          { id: "flute", name: "Flute" },
          { id: "saxophone", name: "Saxophone" },
          { id: "other-brass", name: "Other Brass" },
          { id: "other-woodwind", name: "Other Woodwind" },
        ]
      },
      { id: "dj-recording", name: "DJ & Recording Equipment" },
      { id: "other-instruments", name: "Other" }
    ]
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: Gamepad,
    subCategories: [
      { 
        id: "gaming-systems", 
        name: "Gaming Systems",
        subSubCategories: [
          { id: "xbox-360", name: "Microsoft Xbox 360" },
          { id: "xbox-one", name: "Microsoft Xbox One" },
          { id: "xbox-series", name: "Microsoft Xbox X|S Series" },
          { id: "nintendo-64", name: "Nintendo 64" },
          { id: "nintendo-ds", name: "Nintendo DS" },
          { id: "nintendo-gamecube", name: "Nintendo GameCube" },
          { id: "nintendo-nes", name: "Nintendo NES" },
          { id: "nintendo-switch", name: "Nintendo Switch" },
          { id: "nintendo-wii", name: "Nintendo Wii" },
          { id: "ps-vita", name: "PS VitA" },
          { id: "playstation", name: "Sony PlayStation" },
          { id: "playstation-2", name: "Sony PlayStation 2" },
          { id: "playstation-3", name: "Sony PlayStation 3" },
          { id: "playstation-4", name: "Sony PlayStation 4" },
          { id: "playstation-5", name: "Sony PlayStation 5" },
          { id: "psp", name: "Sony PSP" },
          { id: "super-nintendo", name: "Super Nintendo" },
          { id: "other-gaming-systems", name: "Other" },
        ]
      },
      { 
        id: "video-games", 
        name: "Video Games",
        subSubCategories: [
          { id: "vg-xbox-360", name: "Microsoft Xbox 360" },
          { id: "vg-xbox-one", name: "Microsoft Xbox One" },
          { id: "vg-xbox-series", name: "Microsoft Xbox Series X|S" },
          { id: "vg-nintendo-64", name: "Nintendo 64" },
          { id: "vg-nintendo-ds", name: "Nintendo DS" },
          { id: "vg-nintendo-gamecube", name: "Nintendo GameCube" },
          { id: "vg-nintendo-nes", name: "Nintendo NES" },
          { id: "vg-nintendo-switch", name: "Nintendo Switch" },
          { id: "vg-nintendo-wii", name: "Nintendo Wii" },
          { id: "vg-pc", name: "PC" },
          { id: "vg-ps-vita", name: "PS Vita" },
          { id: "vg-playstation", name: "Sony PlayStation" },
          { id: "vg-playstation-2", name: "Sony PlayStation 2" },
          { id: "vg-playstation-3", name: "Sony PlayStation 3" },
          { id: "vg-playstation-4", name: "Sony PlayStation 4" },
          { id: "vg-playstation-5", name: "Sony PlayStation 5" },
          { id: "vg-psp", name: "Sony PSP" },
          { id: "vg-super-nintendo", name: "Super Nintendo" },
          { id: "vg-other", name: "Other" },
        ]
      },
      { 
        id: "gaming-accessories", 
        name: "Gaming Accessories",
        subSubCategories: [
          { id: "acc-xbox-360", name: "Microsoft Xbox 360" },
          { id: "acc-xbox-one", name: "Microsoft Xbox One" },
          { id: "acc-nintendo-64", name: "Nintendo 64" },
          { id: "acc-nintendo-ds", name: "Nintendo DS" },
          { id: "acc-nintendo-gamecube", name: "Nintendo GameCube" },
          { id: "acc-nintendo-nes", name: "Nintendo NES" },
          { id: "acc-nintendo-switch", name: "Nintendo Switch" },
          { id: "acc-nintendo-wii", name: "Nintendo Wii" },
          { id: "acc-pc", name: "PC" },
          { id: "acc-ps-vita", name: "PS Vita" },
          { id: "acc-playstation", name: "Sony PlayStation" },
          { id: "acc-playstation-2", name: "Sony PlayStation 2" },
          { id: "acc-playstation-3", name: "Sony PlayStation 3" },
          { id: "acc-playstation-4", name: "Sony PlayStation 4" },
          { id: "acc-playstation-5", name: "Sony PlayStation 5" },
          { id: "acc-psp", name: "Sony PSP" },
          { id: "acc-super-nintendo", name: "Super Nintendo" },
          { id: "acc-other", name: "Other" },
        ]
      }
    ]
  },
  {
    id: "baby-items",
    name: "Baby Items",
    icon: Baby,
    subCategories: [
      { 
        id: "strollers-car-seats", 
        name: "Strollers & Car Seats",
        subSubCategories: [
          { id: "car-seat-accessories", name: "Car Seat Accessories" },
          { id: "infant-car-seats", name: "Infant Car Seats" },
          { id: "jogging-strollers", name: "Jogging Strollers" },
          { id: "pram-strollers", name: "Pram Strollers" },
          { id: "standard-strollers", name: "Standard Strollers" },
          { id: "stroller-accessories", name: "Stroller Accessories" },
          { id: "toddler-car-seats", name: "Toddler Car Seats" },
          { id: "travel-system-strollers", name: "Travel System Strollers" },
          { id: "other-strollers", name: "Other" },
        ]
      },
      { 
        id: "nursery-furniture", 
        name: "Nursery Furniture & Accessories",
        subSubCategories: [
          { id: "baby-dressers", name: "Baby Dressers" },
          { id: "bassinets-cradles", name: "Bassinets, Cradles & Rockers" },
          { id: "changing-tables", name: "Changing Tables" },
          { id: "cribs", name: "Cribs" },
          { id: "nursery-bedding", name: "Nursery Bedding" },
          { id: "nursery-decor", name: "Nursery Decor & Accessories" },
          { id: "nursery-sets", name: "Nursery Furniture Sets" },
          { id: "other-nursery", name: "Other" },
        ]
      },
      { 
        id: "baby-gear", 
        name: "Baby Gear",
        subSubCategories: [
          { id: "backpacks-carriers", name: "Backpacks & Carriers" },
          { id: "chairs", name: "Chairs" },
          { id: "jumping-exercisers", name: "Jumping Exercisers" },
          { id: "swings", name: "Swings" },
          { id: "walkers", name: "Walkers" },
          { id: "other-gear", name: "Other" },
        ]
      },
      { 
        id: "baby-toys", 
        name: "Baby Toys",
        subSubCategories: [
          { id: "activity-toys", name: "Activity Toys" },
          { id: "crib-toys", name: "Crib Toys" },
          { id: "development-learning", name: "Development/Learning Toys" },
          { id: "plush-soft-toys", name: "Plush/Soft Toys" },
          { id: "rattles-teethers", name: "Rattles & Teethers" },
          { id: "other-toys", name: "Other" },
        ]
      },
      { 
        id: "feeding", 
        name: "Feeding",
        subSubCategories: [
          { id: "baby-food-processor", name: "Baby Food Processor" },
          { id: "bibs", name: "Bibs" },
          { id: "booster-chairs", name: "Booster/High Chairs" },
          { id: "bottles", name: "Bottles" },
          { id: "dishes-utensils", name: "Dishes & Utensils" },
          { id: "nursing-pillows", name: "Nursing Pillows" },
          { id: "pacifiers", name: "Pacifiers" },
          { id: "other-feeding", name: "Other" },
        ]
      },
      { 
        id: "safety-health", 
        name: "Safety & Health",
        subSubCategories: [
          { id: "baby-proofing", name: "Baby House & Car Proofing" },
          { id: "baby-monitors", name: "Baby Monitors" },
          { id: "baby-thermometers", name: "Baby Thermometers" },
          { id: "locks-latches", name: "Locks & Latches" },
        ]
      },
      { 
        id: "bath-diapers", 
        name: "Bath & Diapers",
        subSubCategories: [
          { id: "bath-tubs", name: "Bath Tubs" },
          { id: "diaper-bins", name: "Diaper Bins" },
          { id: "diapers-wipes", name: "Diapers & Wipes" },
          { id: "lotions-powders", name: "Lotions, Powders & Shampoos" },
          { id: "potties", name: "Potties" },
        ]
      }
    ]
  },
  {
    id: "toys",
    name: "Toys",
    icon: Gift,
    subCategories: [
      { id: "electronic-remote-toys", name: "Electronic & Remote Control Toys" },
      { id: "action-figures-vehicles", name: "Action Figures & Toy Vehicles" },
      { id: "outdoor-toys-structures", name: "Outdoor Toys & Structures" },
      { id: "hobbies", name: "Hobbies" },
      { id: "pretend-preschool", name: "Pretend Play & Preschool Toys" },
      { id: "educational-toys", name: "Educational Toys" },
      { id: "dolls-stuffed", name: "Dolls & Stuffed Animals" },
      { id: "games-puzzles", name: "Games & Puzzles" },
      { id: "classic-vintage", name: "Classic & Vintage Toys" },
      { id: "building-toys", name: "Building Toys" },
      { id: "other-toys", name: "Other" }
    ]
  },
  {
    id: "tickets-vouchers",
    name: "Tickets & Vouchers",
    icon: Ticket,
    subCategories: [
      { id: "concerts", name: "Concerts" },
      { id: "sporting-events", name: "Sporting Events" },
      { id: "travel", name: "Travel" },
      { id: "events", name: "Events" },
      { id: "movies", name: "Movies" },
      { id: "theater", name: "Theater" },
      { id: "activities-attractions", name: "Activities & Attractions" },
      { id: "vouchers-gift-cards", name: "Vouchers & Gift Cards" },
      { id: "other-tickets", name: "Other" }
    ]
  },
  {
    id: "collectibles",
    name: "Collectibles",
    icon: Gift,
    subCategories: [
      { 
        id: "antiques", 
        name: "Antiques",
        subSubCategories: [
          { id: "antiquities", name: "Antiquities" },
          { id: "books-maps", name: "Books & Maps" },
          { id: "decorations", name: "Decorations" },
          { id: "furniture", name: "Furniture" },
          { id: "machines-instruments", name: "Machines, Instruments & Tools" },
          { id: "other-antiques", name: "Other" },
        ]
      },
      { 
        id: "art", 
        name: "Art",
        subSubCategories: [
          { id: "drawings", name: "Drawings" },
          { id: "paintings", name: "Paintings" },
          { id: "photography", name: "Photography" },
          { id: "statues", name: "Statues" },
          { id: "other-art", name: "Other" },
        ]
      },
      { 
        id: "decorations", 
        name: "Decorations",
        subSubCategories: [
          { id: "domestic-decorations", name: "Domestic Decorations" },
          { id: "linens-textiles", name: "Linens/Textiles" },
          { id: "outdoor-decoration", name: "Outdoor Decoration" },
          { id: "wall-hangings", name: "Wall Hangings" },
          { id: "other-decorations", name: "Other" },
        ]
      },
      { 
        id: "pens-writing", 
        name: "Pens & Writing Instruments",
        subSubCategories: [
          { id: "calligraphy", name: "Calligraphy" },
          { id: "pens", name: "Pens" },
          { id: "sets", name: "Sets" },
          { id: "typewriters", name: "Typewriters" },
          { id: "other-writing", name: "Other" },
        ]
      },
      { 
        id: "memorabilia", 
        name: "Memorabilia",
        subSubCategories: [
          { id: "cultural-memorabilia", name: "Cultural Memorabilia" },
          { id: "historical-memorabilia", name: "Historical Memorabilia" },
          { id: "limited-edition", name: "Limited Edition Memorabilia" },
          { id: "military-memorabilia", name: "Military Memorabilia" },
          { id: "religious-memorabilia", name: "Religious Memorabilia" },
          { id: "sports-memorabilia", name: "Sports Memorabilia" },
          { id: "other-memorabilia", name: "Other" },
        ]
      },
      { 
        id: "rocks-fossils", 
        name: "Rocks/Fossils/Artifacts",
        subSubCategories: [
          { id: "artifacts", name: "Artifacts" },
          { id: "fossils", name: "Fossils" },
          { id: "petrified-wood", name: "Petrified Wood" },
          { id: "rocks-crystals", name: "Rocks, Crystals & Minerals" },
          { id: "other-rocks", name: "Other" },
        ]
      },
      { id: "other-collectibles", name: "Other" }
    ]
  },
  {
    id: "books",
    name: "Books",
    icon: BookOpen,
    subCategories: [
      { 
        id: "textbooks", 
        name: "Textbooks",
        subSubCategories: [
          { id: "a-levels", name: "A Levels/High School" },
          { id: "primary-school", name: "Primary School" },
          { id: "secondary-school", name: "Secondary School" },
          { id: "university", name: "University" },
        ]
      },
      { 
        id: "nonfiction", 
        name: "Nonfiction",
        subSubCategories: [
          { id: "business-science-tech", name: "Business/Science/Technology" },
          { id: "cook-books", name: "Cook Books" },
          { id: "history-biography", name: "History/Biography" },
          { id: "how-to", name: "How-To Books" },
          { id: "picture-books", name: "Picture Books" },
          { id: "religious-books", name: "Religious Books" },
          { id: "self-help", name: "Self Help / Motivational Books" },
          { id: "sports-health", name: "Sports/Health Books" },
          { id: "travel-books", name: "Travel Books" },
          { id: "other-nonfiction", name: "Other" },
        ]
      },
      { 
        id: "fiction", 
        name: "Fiction",
        subSubCategories: [
          { id: "action-adventure", name: "Action/Adventure" },
          { id: "classics", name: "Classics" },
          { id: "fantasy-scifi", name: "Fantasy/Sci Fi" },
          { id: "humor", name: "Humor" },
          { id: "mystery-thriller", name: "Mystery/Thriller" },
          { id: "romance", name: "Romance" },
          { id: "other-fiction", name: "Other" },
        ]
      },
      { 
        id: "childrens-books", 
        name: "Children's Books",
        subSubCategories: [
          { id: "coloring-activity", name: "Coloring/Activity Books" },
          { id: "educational-books", name: "Educational Books" },
          { id: "fiction-childrens", name: "Fiction" },
          { id: "nonfiction-childrens", name: "Nonfiction" },
          { id: "picture-popup", name: "Picture/Pop Up Books" },
          { id: "other-childrens", name: "Other" },
        ]
      },
      { 
        id: "book-accessories", 
        name: "Book Accessories",
        subSubCategories: [
          { id: "book-lights", name: "Book Lights" },
          { id: "daily-planners", name: "Daily Planners" },
          { id: "diaries-notebooks", name: "Diaries/Note Books" },
          { id: "other-book-accessories", name: "Other" },
        ]
      },
      { id: "digital-ebooks", name: "Digital/E-books" },
      { id: "audiobooks", name: "Audiobooks" },
      { id: "stationery", name: "Stationery" }
    ]
  },
  {
    id: "music",
    name: "Music",
    icon: Music,
    subCategories: [
      { 
        id: "vinyl", 
        name: "Vinyl",
        subSubCategories: [
          { id: "vinyl-records", name: "Vinyl" }
        ]
      },
      { 
        id: "cds", 
        name: "CDs",
        subSubCategories: [
          { id: "latin", name: "Latin" }
        ]
      },
      { 
        id: "cassettes", 
        name: "Cassettes",
        subSubCategories: [
          { id: "classical", name: "Classical" },
          { id: "country", name: "Country" },
          { id: "jazz", name: "Jazz" },
          { id: "latin-cassettes", name: "Latin" },
          { id: "metal", name: "Metal" },
          { id: "rnb-soul-funk", name: "R&B, Soul & Funk" },
        ]
      },
      { 
        id: "digital-music", 
        name: "Digital",
        subSubCategories: [
          { id: "arabic", name: "Arabic" },
          { id: "country-digital", name: "Country" },
          { id: "jazz-digital", name: "Jazz" },
          { id: "latin-digital", name: "Latin" },
          { id: "metal-digital", name: "Metal" },
        ]
      }
    ]
  },
  {
    id: "dvds-movies",
    name: "DVDs & Movies",
    icon: Film,
    subCategories: [
      { 
        id: "dvd", 
        name: "DVD",
        subSubCategories: [
          { id: "action-adventure-dvd", name: "Action, Adventure" },
          { id: "animation-dvd", name: "Animation" },
          { id: "children-family-dvd", name: "Children & Family" },
          { id: "comedy-dvd", name: "Comedy" },
          { id: "concert-music-dvd", name: "Concert/Music" },
          { id: "documentary-dvd", name: "Documentary Film" },
          { id: "drama-dvd", name: "Drama" },
          { id: "horror-dvd", name: "Horror" },
          { id: "mystery-suspense-dvd", name: "Mystery/Suspense" },
          { id: "series-dvd", name: "Series" },
          { id: "sports-dvd", name: "Sports" },
          { id: "other-genre-dvd", name: "Other Genre" },
        ]
      },
      { 
        id: "digital-movies", 
        name: "Digital",
        subSubCategories: [
          { id: "action-adventure-digital", name: "Action, Adventure" },
          { id: "animation-digital", name: "Animation" },
          { id: "children-family-digital", name: "Children & Family" },
          { id: "comedy-digital", name: "Comedy" },
          { id: "concert-music-digital", name: "Concert/Music" },
          { id: "documentary-digital", name: "Documentary Film" },
          { id: "drama-digital", name: "Drama" },
          { id: "horror-digital", name: "Horror" },
          { id: "mystery-suspense-digital", name: "Mystery/Suspense" },
          { id: "sports-digital", name: "Sports" },
          { id: "other-genre-digital", name: "Other Genre" },
        ]
      },
      { 
        id: "vhs", 
        name: "VHS",
        subSubCategories: [
          { id: "action-adventure-vhs", name: "Action, Adventure" },
          { id: "animation-vhs", name: "Animation" },
          { id: "children-family-vhs", name: "Children & Family" },
          { id: "comedy-vhs", name: "Comedy" },
          { id: "concert-music-vhs", name: "Concert/Music" },
          { id: "documentary-vhs", name: "Documentary Film" },
          { id: "drama-vhs", name: "Drama" },
          { id: "horror-vhs", name: "Horror" },
          { id: "mystery-suspense-vhs", name: "Mystery/Suspense" },
          { id: "sports-vhs", name: "Sports" },
          { id: "other-genre-vhs", name: "Other Genre" },
        ]
      },
      { id: "other-formats", name: "Other Formats" }
    ]
  },
  {
    id: "furniture-home",
    name: "Furniture, Home & Garden",
    icon: Sofa,
    subCategories: [
      { 
        id: "furniture", 
        name: "Furniture",
        subSubCategories: [
          { id: "armoires-wardrobes", name: "Armoires & Wardrobes" },
          { id: "bar-tables", name: "Bar Tables" },
          { id: "beds-bed-sets", name: "Beds & Bed Sets" },
          { id: "bookcases", name: "Bookcases" },
          { id: "cabinets-cupboards", name: "Cabinets & Cupboards" },
          { id: "chairs-benches", name: "Chairs, Benches & Stools" },
          { id: "childrens-furniture", name: "Children's Furniture" },
          { id: "dining-sets", name: "Dining Sets" },
          { id: "dressers-vanities", name: "Dressers & Vanities" },
          { id: "entertainment-centers", name: "Entertainment Centers" },
          { id: "kitchen-islands", name: "Kitchen Islands & Carts" },
          { id: "nightstands", name: "Nightstands" },
          { id: "office-furniture", name: "Office Furniture" },
          { id: "sofas-lounges", name: "Sofas, Futons, & Lounges" },
          { id: "study-tables", name: "Study Tables & Computer Tables" },
          { id: "tables", name: "Tables" },
          { id: "other-furniture", name: "Other" },
        ]
      },
      { 
        id: "home-accessories", 
        name: "Home Accessories",
        subSubCategories: [
          { id: "bath-accessories", name: "Bath Accessories" },
          { id: "bedding-accessories", name: "Bedding & Bed Accessories" },
          { id: "garden-decor-accessories", name: "Garden Decor & Accessories" },
          { id: "home-decor-accents", name: "Home Decor & Accents" },
          { id: "home-fragrance", name: "Home Fragrance" },
          { id: "housekeeping", name: "Housekeeping" },
          { id: "kitchen-dining", name: "Kitchen & Dining" },
          { id: "other-home-accessories", name: "Other" },
        ]
      },
      { 
        id: "garden-outdoor", 
        name: "Garden & Outdoor",
        subSubCategories: [
          { id: "garden-accessories", name: "Garden Accessories" },
          { id: "garden-decor", name: "Garden Decor" },
          { id: "garden-furniture", name: "Garden Furniture" },
          { id: "garden-structures", name: "Garden Structures & Fences" },
          { id: "jacuzzis-pools", name: "Jacuzzis & Pools" },
          { id: "plants", name: "Plants" },
          { id: "other-garden", name: "Other" },
        ]
      },
      { 
        id: "lighting-fans", 
        name: "Lighting & Fans",
        subSubCategories: [
          { id: "ceiling-fans", name: "Ceiling Fans" },
          { id: "lamps", name: "Lamps" },
          { id: "light-fixtures", name: "Light Fixtures" },
          { id: "stand-fans", name: "Stand Fans" },
        ]
      },
      { 
        id: "rugs-carpets", 
        name: "Rugs & Carpets",
        subSubCategories: [
          { id: "abstract-modern", name: "Abstract/Modern" },
          { id: "animal-skin", name: "Animal Skin" },
          { id: "asian", name: "Asian" },
          { id: "childrens-rugs", name: "Children's Rugs & Carpets" },
          { id: "european-classical", name: "European/Classical" },
          { id: "middle-eastern-indian", name: "Middle Eastern/Indian" },
          { id: "solid-color", name: "Solid Color" },
          { id: "other-rugs", name: "Other" },
        ]
      },
      { 
        id: "curtains-blinds", 
        name: "Curtains & Blinds",
        subSubCategories: [
          { id: "curtains-drapes", name: "Curtains & Drapes" },
          { id: "fabric-blinds", name: "Fabric Blinds" },
          { id: "wooden-plastic-blinds", name: "Wooden/Plastic Blinds" },
          { id: "other-curtains", name: "Other" },
        ]
      },
      { 
        id: "tools-home-improvement", 
        name: "Tools & Home Improvement",
        subSubCategories: [
          { id: "hand-tools", name: "Hand Tools" },
          { id: "hardware", name: "Hardware" },
          { id: "plumbing-electrical-air", name: "Plumbing, Electrical & Air" },
          { id: "power-tools", name: "Power Tools" },
        ]
      }
    ]
  },
  {
    id: "clothing-accessories",
    name: "Clothing & Accessories",
    icon: ShoppingBag,
    subCategories: [
      { 
        id: "footwear", 
        name: "Shoes/Footwear",
        subSubCategories: [
          { id: "childrens-shoes", name: "Children's Shoes and Footwear" },
          { id: "mens-shoes", name: "Men's Shoes and Footwear" },
          { id: "unisex-shoes", name: "Unisex Shoes and Footwear" },
          { id: "womens-shoes", name: "Women's Shoes and Footwear" },
        ]
      },
      { 
        id: "clothing", 
        name: "Clothing",
        subSubCategories: [
          { id: "childrens-clothing", name: "Children's Clothing" },
          { id: "mens-clothing", name: "Men's Clothing" },
          { id: "unisex-clothing", name: "Unisex Clothing" },
          { id: "womens-clothing", name: "Women's Clothing" },
        ]
      },
      { 
        id: "bags-wallets", 
        name: "Handbags, Bags & Wallets",
        subSubCategories: [
          { id: "athletic-bags", name: "Athletic Bags" },
          { id: "bags", name: "Bags" },
          { id: "briefcases", name: "Briefcases" },
          { id: "mens-wallets", name: "Mens Wallets" },
          { id: "womens-handbags", name: "Women's Handbags" },
          { id: "womens-wallets", name: "Women's Wallets" },
        ]
      },
      { 
        id: "mens-accessories", 
        name: "Men's Accessories",
        subSubCategories: [
          { id: "belts", name: "Belts" },
          { id: "gloves", name: "Gloves" },
          { id: "hats", name: "Hats" },
          { id: "sunglasses", name: "Sunglasses" },
          { id: "ties", name: "Ties" },
          { id: "other-mens-accessories", name: "Other" },
        ]
      },
      { 
        id: "womens-accessories", 
        name: "Women's Accessories",
        subSubCategories: [
          { id: "belts-women", name: "Belts" },
          { id: "gloves-women", name: "Gloves" },
          { id: "hair-accessories", name: "Hair Accessories" },
          { id: "hats-women", name: "Hats" },
          { id: "sunglasses-women", name: "Sunglasses" },
          { id: "other-womens-accessories", name: "Other" },
        ]
      },
      { 
        id: "luggage", 
        name: "Luggage",
        subSubCategories: [
          { id: "backpacks", name: "Backpacks" },
          { id: "cases", name: "Cases" },
          { id: "duffel-bags", name: "Duffel Bags" },
          { id: "roller-luggage", name: "Roller Luggage" },
        ]
      },
      { 
        id: "fragrances", 
        name: "Fragrances",
        subSubCategories: [
          { id: "mens-fragrances", name: "Men's Fragrances" },
          { id: "unisex-fragrances", name: "Unisex Fragrances" },
          { id: "womens-fragrances", name: "Women's Fragrances" },
        ]
      },
      { 
        id: "wedding-apparel", 
        name: "Wedding Apparel",
        subSubCategories: [
          { id: "childrens-wedding", name: "Children's Wedding Apparel" },
          { id: "mens-wedding", name: "Men's Wedding Apparel" },
          { id: "womens-wedding", name: "Women's Wedding Apparel" },
        ]
      },
      { 
        id: "costumes-uniforms", 
        name: "Costumes & Uniforms",
        subSubCategories: [
          { id: "childrens-costumes", name: "Children's Costumes & Uniforms" },
          { id: "mens-costumes", name: "Men's Costumes & Uniforms" },
          { id: "unisex-costumes", name: "Unisex Costumes & Uniforms" },
          { id: "womens-costumes", name: "Women's Costumes & Uniforms" },
        ]
      },
      { 
        id: "vintage-highend", 
        name: "Vintage & Highend Clothing",
        subSubCategories: [
          { id: "childrens-vintage", name: "Children's Vintage & Highend Clothing" },
          { id: "mens-vintage", name: "Men's Vintage & Highend Clothing" },
          { id: "unisex-vintage", name: "Unisex Vintage & Highend Clothing" },
          { id: "womens-vintage", name: "Women's Vintage & Highend Clothing" },
        ]
      },
      { id: "gifts-bouquet", name: "Gifts & Bouquet" },
      { id: "makeup-skincare", name: "Make up & Skin Care" }
    ]
  }
];

// Create a simplified flat list for the top-level CategoryNav component
export const categoryNav = [
  { id: "all", name: "All" },
  ...categories.map(category => ({ id: category.id, name: category.name }))
];
