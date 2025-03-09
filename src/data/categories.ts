
import { 
  Camera, ComputerIcon, Headphones, Home, Car, Dumbbell, 
  ShoppingBag, Dog, Music, Gamepad, Baby, Tv, Gift, Watch, 
  Ticket, BookOpen, MusicIcon, Monitor, Film, Sofa, Smartphone,
  Building, Briefcase 
} from "lucide-react";

export interface SubSubCategory {
  id: string;
  name: string;
}

export interface SubCategory {
  id: string;
  name: string;
  subSubCategories?: SubSubCategory[];
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
          { id: "plasma", name: "PlasmaAS" },
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
      // Adding just a sampling of the other electronic subcategories for brevity
      { id: "gadgets", name: "Gadgets" },
      { id: "car-electronics", name: "Car Electronics" },
      { id: "projectors", name: "Projectors" },
      { id: "mp3-players", name: "Mp3 Players and Portable Audio" },
      { id: "satellite-cable", name: "Satellite & Cable TV" },
      { id: "health-electronics", name: "Health Electronics" },
      { id: "smart-home", name: "Smart Home" },
      { id: "wearable-technology", name: "Wearable Technology" },
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
      { id: "computer-components", name: "Computer Components" },
      { id: "accessories", name: "Accessories" },
      { id: "networking", name: "Networking & Communication" },
      { id: "software", name: "Software" },
      { id: "mining-rigs", name: "Mining Rigs & Components" },
      { id: "pos-machine", name: "POS machine & parts" },
      { id: "peripherals", name: "Monitors, Printers & Other Peripherals" },
    ]
  },
  {
    id: "business",
    name: "Business & Industrial",
    icon: Building,
    subCategories: [
      { id: "businesses-for-sale", name: "Businesses for Sale" },
      { id: "construction", name: "Construction" },
      { id: "food-beverage", name: "Food & Beverage" },
      { id: "industrial-supplies", name: "Industrial Supplies" },
      { id: "office-furniture", name: "Office Furniture & Equipment" },
      { id: "manufacturing", name: "Manufacturing" },
      { id: "electrical-equipment", name: "Electrical Equipment" },
      { id: "retail-services", name: "Retail & Services" },
      { id: "healthcare-lab", name: "Healthcare & Lab" },
      { id: "printing", name: "Commercial Printing & Copy Machines" },
      { id: "packing-shipping", name: "Packing & Shipping" },
      { id: "agriculture", name: "Agriculture & Forestry" },
      { id: "other-business", name: "Other" },
    ]
  },
  {
    id: "appliances",
    name: "Home Appliances",
    icon: Home,
    subCategories: [
      { id: "large-appliances", name: "Large Appliances / White Goods" },
      { id: "small-kitchen", name: "Small Kitchen Appliances" },
      { id: "outdoor-appliances", name: "Outdoor Appliances" },
      { id: "small-bathroom", name: "Small Bathroom Appliances" },
      { id: "beauty-spa", name: "Beauty, Spa & Sauna Appliances" },
      { id: "irons-sewing", name: "Irons & Sewing Machines" },
      { id: "vacuums", name: "Vacuums & Floor Care" },
      { id: "other-appliances", name: "Other" },
    ]
  },
  {
    id: "sports",
    name: "Sports Equipment",
    icon: Dumbbell,
    subCategories: [
      { id: "cycling", name: "Cycling" },
      { id: "exercise", name: "Exercise Equipment" },
      { id: "water-sports", name: "Water Sports" },
      { id: "camping", name: "Camping & Hiking" },
      { id: "golf", name: "Golf" },
      { id: "indoor-sports", name: "Indoor Sports" },
      { id: "team-sports", name: "Team Sports" },
      { id: "tennis-racquet", name: "Tennis & Racquet Sports" },
      { id: "winter-sports", name: "Winter Sports" },
      { id: "other-sports", name: "Other Sports" },
    ]
  },
  {
    id: "clothing",
    name: "Clothing & Accessories",
    icon: ShoppingBag,
    subCategories: [
      { id: "footwear", name: "Shoes/Footwear" },
      { id: "clothing", name: "Clothing" },
      { id: "bags", name: "Handbags, Bags & Wallets" },
      { id: "mens-accessories", name: "Men's Accessories" },
      { id: "womens-accessories", name: "Women's Accessories" },
      { id: "luggage", name: "Luggage" },
      { id: "fragrances", name: "Fragrances" },
      { id: "wedding", name: "Wedding Apparel" },
      { id: "costumes", name: "Costumes & Uniforms" },
      { id: "vintage", name: "Vintage & Highend Clothing" },
      { id: "gifts", name: "Gifts & Bouquet" },
      { id: "makeup", name: "Make up & Skin Care" },
      { id: "other-clothing", name: "Other" },
    ]
  },
  {
    id: "cameras",
    name: "Cameras & Imaging",
    icon: Camera,
    subCategories: [
      { id: "digital-cameras", name: "Digital Cameras" },
      { id: "lenses", name: "Lenses, Filters & Lighting" },
      { id: "professional", name: "Professional Equipment" },
      { id: "camera-accessories", name: "Camera Accessories" },
      { id: "tripods", name: "Tripods & Stands" },
      { id: "camcorders", name: "Camcorders" },
      { id: "film-cameras", name: "Film Cameras" },
      { id: "binoculars", name: "Binoculars/Telescopes" },
      { id: "camcorder-accessories", name: "Camcorder Accessories" },
      { id: "camera-drones", name: "Camera Drones" },
    ]
  },
  {
    id: "jewelry",
    name: "Jewelry & Watches",
    icon: Watch,
    subCategories: [
      { id: "watches", name: "Watches" },
      { id: "women-jewelry", name: "Women's Jewelry" },
      { id: "men-jewelry", name: "Men's Jewelry" },
      { id: "loose-diamonds", name: "Loose Diamonds & Gems" },
      { id: "other-jewelry", name: "Other" },
    ]
  },
  {
    id: "pets",
    name: "Pets",
    icon: Dog,
    subCategories: [
      { id: "pets-adoption", name: "Pets for Free Adoption" },
      { id: "pet-accessories", name: "Pet Accessories" },
      { id: "lost-found", name: "Lost & Found Pets" },
    ]
  },
  {
    id: "instruments",
    name: "Musical Instruments",
    icon: Music,
    subCategories: [
      { id: "guitars", name: "Guitars" },
      { id: "pianos", name: "Pianos, Keyboards & Organs" },
      { id: "percussion", name: "Percussion" },
      { id: "string-instruments", name: "String Instruments" },
      { id: "wind-instruments", name: "Wind Instruments" },
      { id: "dj-equipment", name: "DJ & Recording Equipment" },
      { id: "other-instruments", name: "Other" },
    ]
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: Gamepad,
    subCategories: [
      { id: "gaming-systems", name: "Gaming Systems" },
      { id: "video-games", name: "Video Games" },
      { id: "gaming-accessories", name: "Gaming Accessories" },
    ]
  },
  {
    id: "baby",
    name: "Baby Items",
    icon: Baby,
    subCategories: [
      { id: "strollers", name: "Strollers & Car Seats" },
      { id: "nursery", name: "Nursery Furniture & Accessories" },
      { id: "baby-gear", name: "Baby Gear" },
      { id: "baby-toys", name: "Baby Toys" },
      { id: "feeding", name: "Feeding" },
      { id: "safety-health", name: "Safety & Health" },
      { id: "bath-diapers", name: "Bath & Diapers" },
    ]
  },
  {
    id: "toys",
    name: "Toys",
    icon: Gift,
    subCategories: [
      { id: "electronic-toys", name: "Electronic & Remote Control Toys" },
      { id: "action-figures", name: "Action Figures & Toy Vehicles" },
      { id: "outdoor-toys", name: "Outdoor Toys & Structures" },
      { id: "hobbies", name: "Hobbies" },
      { id: "pretend-play", name: "Pretend Play & Preschool Toys" },
      { id: "educational-toys", name: "Educational Toys" },
      { id: "dolls", name: "Dolls & Stuffed Animals" },
      { id: "games-puzzles", name: "Games & Puzzles" },
      { id: "classic-toys", name: "Classic & Vintage Toys" },
      { id: "building-toys", name: "Building Toys" },
      { id: "other-toys", name: "Other" },
    ]
  },
  {
    id: "tickets",
    name: "Tickets & Vouchers",
    icon: Ticket,
    subCategories: [
      { id: "concerts", name: "Concerts" },
      { id: "sporting-events", name: "Sporting Events" },
      { id: "travel", name: "Travel" },
      { id: "events", name: "Events" },
      { id: "movies", name: "Movies" },
      { id: "theater", name: "Theater" },
      { id: "activities", name: "Activities & Attractions" },
      { id: "vouchers", name: "Vouchers & Gift Cards" },
      { id: "other-tickets", name: "Other" },
    ]
  },
  {
    id: "collectibles",
    name: "Collectibles",
    icon: Briefcase,
    subCategories: [
      { id: "antiques", name: "Antiques" },
      { id: "art", name: "Art" },
      { id: "decorations", name: "Decorations" },
      { id: "pens-writing", name: "Pens & Writing Instruments" },
      { id: "memorabilia", name: "Memorabilia" },
      { id: "rocks-fossils", name: "Rocks/Fossils/Artifacts" },
      { id: "other-collectibles", name: "Other" },
    ]
  },
  {
    id: "books",
    name: "Books",
    icon: BookOpen,
    subCategories: [
      { id: "textbooks", name: "Textbooks" },
      { id: "nonfiction", name: "Nonfiction" },
      { id: "fiction", name: "Fiction" },
      { id: "childrens-books", name: "Children's Books" },
      { id: "book-accessories", name: "Book Accessories" },
      { id: "digital-ebooks", name: "Digital/E-books" },
      { id: "audiobooks", name: "Audiobooks" },
      { id: "stationery", name: "Stationery" },
    ]
  },
  {
    id: "music",
    name: "Music",
    icon: MusicIcon,
    subCategories: [
      { id: "vinyl", name: "Vinyl" },
      { id: "cds", name: "CDs" },
      { id: "cassettes", name: "Cassettes" },
      { id: "digital", name: "Digital" },
    ]
  },
  {
    id: "dvds",
    name: "DVDs & Movies",
    icon: Film,
    subCategories: [
      { id: "dvd", name: "DVD" },
      { id: "digital-movies", name: "Digital" },
      { id: "vhs", name: "VHS" },
      { id: "other-formats", name: "Other Formats" },
    ]
  },
  {
    id: "furniture",
    name: "Furniture, Home & Garden",
    icon: Sofa,
    subCategories: [
      { id: "furniture", name: "Furniture" },
      { id: "home-accessories", name: "Home Accessories" },
      { id: "garden", name: "Garden & Outdoor" },
      { id: "lighting", name: "Lighting & Fans" },
      { id: "rugs-carpets", name: "Rugs & Carpets" },
      { id: "curtains", name: "Curtains & Blinds" },
      { id: "tools", name: "Tools & Home Improvement" },
    ]
  },
  {
    id: "mobile",
    name: "Mobile Phones & Tablets",
    icon: Smartphone,
    subCategories: [
      { id: "mobile-phones", name: "Mobile Phones" },
      { id: "mobile-accessories", name: "Mobile Phone & Tablet Accessories" },
      { id: "tablets", name: "Tablets" },
      { id: "other-mobile", name: "Other Mobile Phones & Tablets" },
    ]
  },
];

// Create a simplified flat list for the top-level CategoryNav component
export const categoryNav = [
  { id: "all", name: "All" },
  ...categories.map(category => ({ id: category.id, name: category.name }))
];
