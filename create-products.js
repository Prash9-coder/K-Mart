import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api';

// Product data with image mappings
const productsData = [
  // Personal Care - Bath Soaps (3 variants)
  {
    name: 'Lux Velvet Touch Soap',
    brand: 'Lux',
    category: 'Personal Care',
    price: 35,
    weight: 125,
    unit: 'g',
    countInStock: 150,
    description: 'Luxurious bathing soap with velvet touch formula for soft and smooth skin',
    image: 'bar_of_soap,_bath_so_01935eca.jpg'
  },
  {
    name: 'Lifebuoy Total 10 Soap',
    brand: 'Lifebuoy',
    category: 'Personal Care',
    price: 30,
    weight: 125,
    unit: 'g',
    countInStock: 180,
    description: 'Germ protection soap with advanced formula that provides 99.9% protection',
    image: 'bar_of_soap,_bath_so_431a92fd.jpg'
  },
  {
    name: 'Dettol Skincare Soap',
    brand: 'Dettol',
    category: 'Personal Care',
    price: 40,
    weight: 125,
    unit: 'g',
    countInStock: 120,
    description: 'Antibacterial soap with trusted Dettol protection for healthy skin',
    image: 'bar_of_soap,_bath_so_edd185c3.jpg'
  },

  // Personal Care - Hair Oils (3 variants)
  {
    name: 'Parachute Coconut Oil',
    brand: 'Parachute',
    category: 'Personal Care',
    price: 180,
    weight: 500,
    unit: 'ml',
    countInStock: 100,
    description: 'Pure coconut oil for strong, healthy and beautiful hair',
    image: 'hair_oil_bottle,_coc_6b88f444.jpg'
  },
  {
    name: 'Dabur Amla Hair Oil',
    brand: 'Dabur',
    category: 'Personal Care',
    price: 150,
    weight: 500,
    unit: 'ml',
    countInStock: 120,
    description: 'Enriched with amla extracts for long, thick and beautiful hair',
    image: 'hair_oil_bottle,_coc_9a59f260.jpg'
  },
  {
    name: 'Bajaj Almond Drops Hair Oil',
    brand: 'Bajaj',
    category: 'Personal Care',
    price: 160,
    weight: 500,
    unit: 'ml',
    countInStock: 90,
    description: 'Non-sticky almond oil for smooth and silky hair',
    image: 'hair_oil_bottle,_coc_ba6db951.jpg'
  },

  // Personal Care - Toothpaste (2 variants)
  {
    name: 'Colgate Total Advanced Health',
    brand: 'Colgate',
    category: 'Personal Care',
    price: 85,
    weight: 150,
    unit: 'g',
    countInStock: 200,
    description: 'Complete oral care with 12-hour protection against germs',
    image: 'toothpaste_tube,_den_5cad189f.jpg'
  },
  {
    name: 'Pepsodent Germicheck',
    brand: 'Pepsodent',
    category: 'Personal Care',
    price: 75,
    weight: 150,
    unit: 'g',
    countInStock: 180,
    description: 'Fights germs and keeps your mouth fresh all day',
    image: 'toothpaste_tube,_den_7babcb1a.jpg'
  },

  // Personal Care - Shampoo (2 variants)
  {
    name: 'Pantene Pro-V Silky Smooth',
    brand: 'Pantene',
    category: 'Personal Care',
    price: 220,
    weight: 340,
    unit: 'ml',
    countInStock: 80,
    description: 'Pro-vitamin formula for silky smooth and manageable hair',
    image: 'shampoo_bottle,_hair_3359bb6b.jpg'
  },
  {
    name: 'Clinic Plus Strong & Long',
    brand: 'Clinic Plus',
    category: 'Personal Care',
    price: 180,
    weight: 340,
    unit: 'ml',
    countInStock: 100,
    description: 'Milk protein formula for strong and long hair',
    image: 'shampoo_bottle,_hair_df0dd5ef.jpg'
  },

  // Groceries - Cooking Oils (3 variants)
  {
    name: 'Fortune Sunflower Oil',
    brand: 'Fortune',
    category: 'Cooking Oil',
    price: 185,
    weight: 1,
    unit: 'l',
    countInStock: 75,
    description: 'Light and healthy sunflower oil rich in Vitamin E',
    image: 'cooking_oil_bottle,__2784f70e.jpg'
  },
  {
    name: 'Dhara Mustard Oil',
    brand: 'Dhara',
    category: 'Cooking Oil',
    price: 195,
    weight: 1,
    unit: 'l',
    countInStock: 65,
    description: 'Pure mustard oil with authentic taste and aroma',
    image: 'cooking_oil_bottle,__8c8e5bd2.jpg'
  },
  {
    name: 'Parachute Coconut Cooking Oil',
    brand: 'Parachute',
    category: 'Cooking Oil',
    price: 210,
    weight: 1,
    unit: 'l',
    countInStock: 60,
    description: 'Pure coconut oil for healthy and tasty cooking',
    image: 'cooking_oil_bottle,__a3431f83.jpg'
  },

  // Groceries - Dal/Lentils (3 variants)
  {
    name: 'Toor Dal Premium',
    brand: 'Organic India',
    category: 'Pulses & Lentils',
    price: 140,
    weight: 1,
    unit: 'kg',
    countInStock: 100,
    description: 'High quality toor dal rich in protein and nutrients',
    image: 'lentils_dal,_yellow__6d18f48e.jpg'
  },
  {
    name: 'Moong Dal Yellow',
    brand: 'Tata Sampann',
    category: 'Pulses & Lentils',
    price: 135,
    weight: 1,
    unit: 'kg',
    countInStock: 120,
    description: 'Fresh moong dal with natural taste and nutrition',
    image: 'lentils_dal,_yellow__6d69f7ac.jpg'
  },
  {
    name: 'Masoor Dal Red',
    brand: 'Aashirvaad',
    category: 'Pulses & Lentils',
    price: 130,
    weight: 1,
    unit: 'kg',
    countInStock: 110,
    description: 'Premium quality masoor dal for healthy meals',
    image: 'lentils_dal,_yellow__9496f453.jpg'
  },

  // Groceries - Rice (3 variants)
  {
    name: 'India Gate Basmati Rice',
    brand: 'India Gate',
    category: 'Grains & Cereals',
    price: 180,
    weight: 1,
    unit: 'kg',
    countInStock: 85,
    description: 'Premium aged basmati rice with long grains and rich aroma',
    image: 'rice_grains,_basmati_1b7efdf4.jpg'
  },
  {
    name: 'Sona Masoori Rice',
    brand: 'Laxmi',
    category: 'Grains & Cereals',
    price: 75,
    weight: 1,
    unit: 'kg',
    countInStock: 150,
    description: 'Lightweight and aromatic sona masoori rice for daily meals',
    image: 'rice_grains,_basmati_b9d7fefd.jpg'
  },
  {
    name: 'Brown Rice Organic',
    brand: 'Organic India',
    category: 'Grains & Cereals',
    price: 120,
    weight: 1,
    unit: 'kg',
    countInStock: 70,
    description: 'Healthy brown rice rich in fiber and nutrients',
    image: 'rice_grains,_basmati_fded14aa.jpg'
  },

  // Groceries - Wheat Flour (2 variants)
  {
    name: 'Aashirvaad Whole Wheat Atta',
    brand: 'Aashirvaad',
    category: 'Grains & Cereals',
    price: 250,
    weight: 5,
    unit: 'kg',
    countInStock: 90,
    description: 'Chakki fresh atta with 100% whole wheat for soft rotis',
    image: 'wheat_flour_atta,_fl_df3d50fe.jpg'
  },
  {
    name: 'Pillsbury Chakki Fresh Atta',
    brand: 'Pillsbury',
    category: 'Grains & Cereals',
    price: 245,
    weight: 5,
    unit: 'kg',
    countInStock: 80,
    description: 'Fresh chakki atta for nutritious and tasty rotis',
    image: 'wheat_flour_atta,_fl_f3cfe95d.jpg'
  },

  // Groceries - Spices (3 variants)
  {
    name: 'Everest Turmeric Powder',
    brand: 'Everest',
    category: 'Spices & Seasonings',
    price: 95,
    weight: 200,
    unit: 'g',
    countInStock: 130,
    description: 'Pure turmeric powder with natural color and health benefits',
    image: 'spices,_turmeric_pow_291c4bb9.jpg'
  },
  {
    name: 'MDH Red Chilli Powder',
    brand: 'MDH',
    category: 'Spices & Seasonings',
    price: 85,
    weight: 200,
    unit: 'g',
    countInStock: 140,
    description: 'Authentic red chilli powder for spicy and flavorful dishes',
    image: 'spices,_turmeric_pow_38de5b58.jpg'
  },
  {
    name: 'Catch Coriander Powder',
    brand: 'Catch',
    category: 'Spices & Seasonings',
    price: 75,
    weight: 200,
    unit: 'g',
    countInStock: 125,
    description: 'Fresh coriander powder with authentic aroma',
    image: 'spices,_turmeric_pow_6a87ee08.jpg'
  },

  // Groceries - Tea (2 variants)
  {
    name: 'Tata Tea Premium',
    brand: 'Tata Tea',
    category: 'Beverages',
    price: 250,
    weight: 500,
    unit: 'g',
    countInStock: 110,
    description: 'Premium black tea with rich flavor and aroma',
    image: 'tea_leaves,_black_te_1c19f27e.jpg'
  },
  {
    name: 'Red Label Natural Care Tea',
    brand: 'Brooke Bond',
    category: 'Beverages',
    price: 230,
    weight: 500,
    unit: 'g',
    countInStock: 95,
    description: 'Natural care tea with 5 Ayurvedic ingredients',
    image: 'tea_leaves,_black_te_aba94533.jpg'
  },

  // Groceries - Sugar (2 variants)
  {
    name: 'Madhur Pure Sugar',
    brand: 'Madhur',
    category: 'Grains & Cereals',
    price: 45,
    weight: 1,
    unit: 'kg',
    countInStock: 160,
    description: 'Pure white sugar with fine crystals',
    image: 'sugar,_white_sugar,__0e6e4e88.jpg'
  },
  {
    name: 'Dhampure Speciality White Sugar',
    brand: 'Dhampure',
    category: 'Grains & Cereals',
    price: 48,
    weight: 1,
    unit: 'kg',
    countInStock: 150,
    description: 'Premium quality white sugar for sweetening',
    image: 'sugar,_white_sugar,__88eb6247.jpg'
  },

  // Groceries - Salt (2 variants)
  {
    name: 'Tata Salt Iodized',
    brand: 'Tata',
    category: 'Spices & Seasonings',
    price: 22,
    weight: 1,
    unit: 'kg',
    countInStock: 200,
    description: 'Iodized salt for healthy living and better taste',
    image: 'salt_packet,_iodized_24df8918.jpg'
  },
  {
    name: 'Annapurna Double Fortified Salt',
    brand: 'Annapurna',
    category: 'Spices & Seasonings',
    price: 24,
    weight: 1,
    unit: 'kg',
    countInStock: 180,
    description: 'Double fortified with iodine and iron',
    image: 'salt_packet,_iodized_eb955dad.jpg'
  },

  // Household - Detergent (2 variants)
  {
    name: 'Surf Excel Matic Top Load',
    brand: 'Surf Excel',
    category: 'Household Items',
    price: 380,
    weight: 2,
    unit: 'kg',
    countInStock: 70,
    description: 'Powerful detergent for top load washing machines',
    image: 'detergent_powder,_la_11569e0f.jpg'
  },
  {
    name: 'Ariel Matic Powder',
    brand: 'Ariel',
    category: 'Household Items',
    price: 375,
    weight: 2,
    unit: 'kg',
    countInStock: 65,
    description: 'Excellent stain removal for machine wash',
    image: 'detergent_powder,_la_ea2cc3c6.jpg'
  },

  // Snacks & Dairy - Biscuits (2 variants)
  {
    name: 'Parle-G Glucose Biscuits',
    brand: 'Parle',
    category: 'Snacks & Confectionery',
    price: 30,
    weight: 200,
    unit: 'g',
    countInStock: 180,
    description: 'Classic glucose biscuits loved by all generations',
    image: 'biscuits_cookies,_te_153ea183.jpg'
  },
  {
    name: 'Britannia Marie Gold',
    brand: 'Britannia',
    category: 'Snacks & Confectionery',
    price: 35,
    weight: 200,
    unit: 'g',
    countInStock: 160,
    description: 'Light and crispy marie biscuits perfect for tea time',
    image: 'biscuits_cookies,_te_930c9560.jpg'
  },

  // Snacks & Dairy - Milk (2 variants)
  {
    name: 'Amul Taaza Toned Milk',
    brand: 'Amul',
    category: 'Dairy Products',
    price: 28,
    weight: 500,
    unit: 'ml',
    countInStock: 120,
    description: 'Fresh toned milk with goodness of calcium',
    image: 'milk_packet,_dairy_m_77103063.jpg'
  },
  {
    name: 'Mother Dairy Full Cream Milk',
    brand: 'Mother Dairy',
    category: 'Dairy Products',
    price: 32,
    weight: 500,
    unit: 'ml',
    countInStock: 100,
    description: 'Rich and creamy full cream milk',
    image: 'milk_packet,_dairy_m_9b596c7a.jpg'
  }
];

async function loginAdmin() {
  try {
    const response = await axios.post(`${API_URL}/admin/auth/login`, {
      email: 'admin@kstore.com',
      password: 'admin123'
    });
    console.log('✅ Admin login successful');
    return response.data.token;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data?.message || error.message);
    // Use test token for development
    return 'test_admin_token_for_development';
  }
}

async function createProduct(productData, token) {
  try {
    const imagePath = `/uploads/${productData.image}`;
    
    const product = {
      name: productData.name,
      brand: productData.brand,
      category: productData.category,
      price: productData.price,
      weight: productData.weight,
      unit: productData.unit,
      countInStock: productData.countInStock,
      description: productData.description,
      image: imagePath,
      isActive: true
    };

    const response = await axios.post(`${API_URL}/products`, product, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Created: ${productData.name}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create ${productData.name}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting product creation...\n');
  
  const token = await loginAdmin();
  console.log('📝 Using token:', token.substring(0, 20) + '...\n');

  let successCount = 0;
  let failCount = 0;

  for (const productData of productsData) {
    const result = await createProduct(productData, token);
    if (result) {
      successCount++;
    } else {
      failCount++;
    }
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created: ${successCount} products`);
  console.log(`❌ Failed: ${failCount} products`);
  console.log(`📦 Total: ${productsData.length} products`);
}

main().catch(console.error);
