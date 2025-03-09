
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Array of sample products
const sampleProducts = [
  {
    title: "iPhone 13 Pro - Excellent Condition",
    description: "Selling my iPhone 13 Pro (128GB). Perfect working condition with minimal scratches. Comes with original charger, cable and box. Battery health at 92%. No repairs or issues.",
    price: "2199",
    category: "electronics",
    subcategory: "smartphones",
    location: "Dubai Marina",
    image_urls: [
      "https://epkpqlkvhuqnfepfpscd.supabase.co/storage/v1/object/public/product-images/iphone13pro.jpg"
    ],
    specifications: {
      brand: "Apple",
      model: "iPhone 13 Pro",
      condition: "excellent",
      storage: "128GB"
    },
    shipping_options: {
      inPersonMeetup: true,
      platformShipping: true,
      shippingCost: 25
    }
  },
  {
    title: "Sony PlayStation 5 - Digital Edition",
    description: "Brand new PS5 Digital Edition, unopened in sealed box. Includes controller and all original accessories. Selling because I received it as a gift but already have one.",
    price: "1850",
    category: "electronics",
    subcategory: "gaming",
    location: "Downtown Dubai",
    image_urls: [
      "https://epkpqlkvhuqnfepfpscd.supabase.co/storage/v1/object/public/product-images/ps5.jpg"
    ],
    specifications: {
      brand: "Sony",
      model: "PlayStation 5 Digital Edition",
      condition: "new"
    },
    shipping_options: {
      inPersonMeetup: true,
      platformShipping: false
    }
  },
  {
    title: "IKEA KALLAX Shelf Unit - White",
    description: "IKEA KALLAX shelf unit in white (2x4 squares). Used for 1 year but in excellent condition. Perfect for books, display items, or room divider. Disassembled for easy transport.",
    price: "299",
    category: "furniture",
    subcategory: "storage",
    location: "JLT",
    image_urls: [
      "https://epkpqlkvhuqnfepfpscd.supabase.co/storage/v1/object/public/product-images/kallax.jpg"
    ],
    specifications: {
      brand: "IKEA",
      material: "Wood",
      condition: "good"
    },
    weight: "35kg",
    shipping_options: {
      inPersonMeetup: true,
      platformShipping: false
    }
  },
  {
    title: "Adidas Ultra Boost 21 - Size 42 (US 8.5)",
    description: "Adidas Ultra Boost 21 running shoes, men's size 42 (US 8.5). Bought 3 months ago, worn only a few times. Almost like new. Original box included.",
    price: "450",
    category: "fashion",
    subcategory: "shoes",
    location: "The Greens",
    image_urls: [
      "https://epkpqlkvhuqnfepfpscd.supabase.co/storage/v1/object/public/product-images/ultraboost.jpg"
    ],
    specifications: {
      brand: "Adidas",
      model: "Ultra Boost 21",
      condition: "like-new"
    },
    shipping_options: {
      inPersonMeetup: true,
      platformShipping: true,
      shippingCost: 15
    }
  },
  {
    title: "Macbook Pro 14\" (2021) - M1 Pro 16GB RAM",
    description: "Macbook Pro 14-inch, 2021 model with M1 Pro chip, 16GB RAM, 512GB storage. Space gray. Purchased 1 year ago, in excellent condition with no scratches. Original box and charger included.",
    price: "4999",
    category: "electronics",
    subcategory: "computers",
    location: "Business Bay",
    image_urls: [
      "https://epkpqlkvhuqnfepfpscd.supabase.co/storage/v1/object/public/product-images/macbook.jpg"
    ],
    specifications: {
      brand: "Apple",
      model: "Macbook Pro 14\" (2021)",
      processor: "M1 Pro",
      ram: "16GB",
      storage: "512GB",
      condition: "excellent"
    },
    shipping_options: {
      inPersonMeetup: true,
      platformShipping: true,
      shippingCost: 50
    }
  }
];

// Helper function to insert products for a specific user
async function createProductsForUser(userId, email) {
  // Initialize Supabase client
  const supabase = createClient(
    "https://epkpqlkvhuqnfepfpscd.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwa3BxbGt2aHVxbmZlcGZwc2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mzk3MTMsImV4cCI6MjA1NzExNTcxM30.yx_PIyFi01fucqOwG1s8Hz4znk77wnDzKca6DYx5_V4"
  );

  console.log(`Creating sample products for user: ${email} (${userId})`);

  // Check if user exists
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    console.error('User not found:', userError);
    return;
  }

  console.log('User found:', userData);

  // Insert products
  for (const product of sampleProducts) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        seller_id: userId,
        product_status: 'available',
        promotion_level: 'none',
        view_count: Math.floor(Math.random() * 50),
        like_count: Math.floor(Math.random() * 15)
      });

    if (error) {
      console.error('Error inserting product:', error);
    } else {
      console.log('Product inserted successfully');
    }
  }

  console.log('All sample products created successfully');
}

// Main function
async function main() {
  const EMAIL = 'a.giron3121@gmail.com';

  // Get user ID from email
  const supabase = createClient(
    "https://epkpqlkvhuqnfepfpscd.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwa3BxbGt2aHVxbmZlcGZwc2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mzk3MTMsImV4cCI6MjA1NzExNTcxM30.yx_PIyFi01fucqOwG1s8Hz4znk77wnDzKca6DYx5_V4"
  );

  // First try to get from auth.users
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(EMAIL);

  if (authError || !authUser) {
    console.error('Error finding user by email:', authError);
    return;
  }

  const userId = authUser.id;
  console.log(`Found user ID: ${userId}`);

  // Create products for the user
  await createProductsForUser(userId, EMAIL);
}

main().catch(console.error);
