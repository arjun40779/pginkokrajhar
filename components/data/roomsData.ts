export interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  available: boolean;
  image: string;
  amenities: string[];
  description: string;
}

export const rooms: Room[] = [
  {
    id: "single-1",
    name: "Single Deluxe Room",
    type: "Single",
    price: 8000,
    capacity: 1,
    available: true,
    image: "https://images.unsplash.com/photo-1721743169043-dda0212ce3d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzaW5nbGUlMjBiZWRyb29tJTIwYWNjb21tb2RhdGlvbnxlbnwxfHx8fDE3NzM3NTQ4OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["AC", "Attached Bathroom", "Study Table", "Wardrobe", "WiFi"],
    description: "Spacious single occupancy room with modern amenities and attached bathroom."
  },
  {
    id: "double-1",
    name: "Double Sharing Room",
    type: "Double",
    price: 6000,
    capacity: 2,
    available: true,
    image: "https://images.unsplash.com/photo-1767884162402-683fdd430046?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3VibGUlMjBiZWQlMjBzaGFyZWQlMjByb29tJTIwaG9zdGVsfGVufDF8fHx8MTc3Mzc1NDg5Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["AC", "Attached Bathroom", "Study Tables", "Wardrobes", "WiFi"],
    description: "Comfortable double sharing room perfect for students and working professionals."
  },
  {
    id: "triple-1",
    name: "Triple Sharing Room",
    type: "Triple",
    price: 5000,
    capacity: 3,
    available: false,
    image: "https://images.unsplash.com/photo-1655450075012-c0393e3cc1ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwdHJpcGxlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NzM3NTQ4OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["AC", "Common Bathroom", "Study Tables", "Wardrobes", "WiFi"],
    description: "Economical triple sharing room with all basic amenities."
  },
  {
    id: "single-2",
    name: "Single Premium Room",
    type: "Single",
    price: 10000,
    capacity: 1,
    available: true,
    image: "https://images.unsplash.com/photo-1721743169043-dda0212ce3d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzaW5nbGUlMjBiZWRyb29tJTIwYWNjb21tb2RhdGlvbnxlbnwxfHx8fDE3NzM3NTQ4OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["AC", "Attached Bathroom", "Study Table", "Wardrobe", "WiFi", "Balcony", "Mini Fridge"],
    description: "Premium single room with balcony and additional amenities for maximum comfort."
  },
  {
    id: "double-2",
    name: "Double AC Room",
    type: "Double",
    price: 7000,
    capacity: 2,
    available: true,
    image: "https://images.unsplash.com/photo-1767884162402-683fdd430046?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3VibGUlMjBiZWQlMjBzaGFyZWQlMjByb29tJTIwaG9zdGVsfGVufDF8fHx8MTc3Mzc1NDg5Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["AC", "Attached Bathroom", "Study Tables", "Wardrobes", "WiFi", "Geyser"],
    description: "Well-furnished double sharing room with geyser and modern facilities."
  },
  {
    id: "triple-2",
    name: "Triple Budget Room",
    type: "Triple",
    price: 4500,
    capacity: 3,
    available: true,
    image: "https://images.unsplash.com/photo-1655450075012-c0393e3cc1ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwdHJpcGxlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NzM3NTQ4OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["Fan", "Common Bathroom", "Study Tables", "Wardrobes", "WiFi"],
    description: "Budget-friendly triple sharing room ideal for students."
  }
];

export const benefits = [
  {
    icon: "Utensils",
    title: "Hygienic Meals",
    description: "3 times nutritious homely meals included in the package"
  },
  {
    icon: "Wifi",
    title: "High-Speed WiFi",
    description: "24/7 unlimited high-speed internet connectivity"
  },
  {
    icon: "Shield",
    title: "24/7 Security",
    description: "CCTV surveillance and secure entry with biometric access"
  },
  {
    icon: "WashingMachine",
    title: "Laundry Service",
    description: "Free laundry service with washing machine and dryer"
  },
  {
    icon: "BookOpen",
    title: "Study Room",
    description: "Dedicated quiet study area with library facilities"
  },
  {
    icon: "Users",
    title: "Common Area",
    description: "Spacious common room with TV and recreational facilities"
  },
  {
    icon: "Zap",
    title: "Power Backup",
    description: "100% power backup with generator for uninterrupted supply"
  },
  {
    icon: "Refrigerator",
    title: "Modern Kitchen",
    description: "Fully equipped shared kitchen with refrigerator"
  }
];
