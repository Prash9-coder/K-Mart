#!/bin/bash

API_URL="http://localhost:3000/api"
TOKEN="test_admin_token_for_development"

echo "🚀 Creating products..."

# Personal Care - Bath Soaps
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lux Velvet Touch Soap",
    "brand": "Lux",
    "category": "Personal Care",
    "price": 35,
    "weight": 125,
    "unit": "g",
    "countInStock": 150,
    "description": "Luxurious bathing soap with velvet touch formula for soft and smooth skin",
    "image": "/uploads/bar_of_soap,_bath_so_01935eca.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Lux Velvet Touch Soap"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lifebuoy Total 10 Soap",
    "brand": "Lifebuoy",
    "category": "Personal Care",
    "price": 30,
    "weight": 125,
    "unit": "g",
    "countInStock": 180,
    "description": "Germ protection soap with advanced formula that provides 99.9% protection",
    "image": "/uploads/bar_of_soap,_bath_so_431a92fd.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Lifebuoy Total 10 Soap"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dettol Skincare Soap",
    "brand": "Dettol",
    "category": "Personal Care",
    "price": 40,
    "weight": 125,
    "unit": "g",
    "countInStock": 120,
    "description": "Antibacterial soap with trusted Dettol protection for healthy skin",
    "image": "/uploads/bar_of_soap,_bath_so_edd185c3.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Dettol Skincare Soap"

# Hair Oils
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Parachute Coconut Oil",
    "brand": "Parachute",
    "category": "Personal Care",
    "price": 180,
    "weight": 500,
    "unit": "ml",
    "countInStock": 100,
    "description": "Pure coconut oil for strong, healthy and beautiful hair",
    "image": "/uploads/hair_oil_bottle,_coc_6b88f444.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Parachute Coconut Oil"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dabur Amla Hair Oil",
    "brand": "Dabur",
    "category": "Personal Care",
    "price": 150,
    "weight": 500,
    "unit": "ml",
    "countInStock": 120,
    "description": "Enriched with amla extracts for long, thick and beautiful hair",
    "image": "/uploads/hair_oil_bottle,_coc_9a59f260.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Dabur Amla Hair Oil"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bajaj Almond Drops Hair Oil",
    "brand": "Bajaj",
    "category": "Personal Care",
    "price": 160,
    "weight": 500,
    "unit": "ml",
    "countInStock": 90,
    "description": "Non-sticky almond oil for smooth and silky hair",
    "image": "/uploads/hair_oil_bottle,_coc_ba6db951.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Bajaj Almond Drops Hair Oil"

# Toothpaste
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Colgate Total Advanced Health",
    "brand": "Colgate",
    "category": "Personal Care",
    "price": 85,
    "weight": 150,
    "unit": "g",
    "countInStock": 200,
    "description": "Complete oral care with 12-hour protection against germs",
    "image": "/uploads/toothpaste_tube,_den_5cad189f.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Colgate Total Advanced Health"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pepsodent Germicheck",
    "brand": "Pepsodent",
    "category": "Personal Care",
    "price": 75,
    "weight": 150,
    "unit": "g",
    "countInStock": 180,
    "description": "Fights germs and keeps your mouth fresh all day",
    "image": "/uploads/toothpaste_tube,_den_7babcb1a.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Pepsodent Germicheck"

# Shampoo
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pantene Pro-V Silky Smooth",
    "brand": "Pantene",
    "category": "Personal Care",
    "price": 220,
    "weight": 340,
    "unit": "ml",
    "countInStock": 80,
    "description": "Pro-vitamin formula for silky smooth and manageable hair",
    "image": "/uploads/shampoo_bottle,_hair_3359bb6b.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Pantene Pro-V Silky Smooth"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Clinic Plus Strong & Long",
    "brand": "Clinic Plus",
    "category": "Personal Care",
    "price": 180,
    "weight": 340,
    "unit": "ml",
    "countInStock": 100,
    "description": "Milk protein formula for strong and long hair",
    "image": "/uploads/shampoo_bottle,_hair_df0dd5ef.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Clinic Plus Strong & Long"

# Cooking Oils
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fortune Sunflower Oil",
    "brand": "Fortune",
    "category": "Cooking Oil",
    "price": 185,
    "weight": 1,
    "unit": "l",
    "countInStock": 75,
    "description": "Light and healthy sunflower oil rich in Vitamin E",
    "image": "/uploads/cooking_oil_bottle,__2784f70e.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Fortune Sunflower Oil"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dhara Mustard Oil",
    "brand": "Dhara",
    "category": "Cooking Oil",
    "price": 195,
    "weight": 1,
    "unit": "l",
    "countInStock": 65,
    "description": "Pure mustard oil with authentic taste and aroma",
    "image": "/uploads/cooking_oil_bottle,__8c8e5bd2.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Dhara Mustard Oil"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Parachute Coconut Cooking Oil",
    "brand": "Parachute",
    "category": "Cooking Oil",
    "price": 210,
    "weight": 1,
    "unit": "l",
    "countInStock": 60,
    "description": "Pure coconut oil for healthy and tasty cooking",
    "image": "/uploads/cooking_oil_bottle,__a3431f83.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Parachute Coconut Cooking Oil"

# Dal/Lentils
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Toor Dal Premium",
    "brand": "Organic India",
    "category": "Pulses & Lentils",
    "price": 140,
    "weight": 1,
    "unit": "kg",
    "countInStock": 100,
    "description": "High quality toor dal rich in protein and nutrients",
    "image": "/uploads/lentils_dal,_yellow__6d18f48e.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Toor Dal Premium"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Moong Dal Yellow",
    "brand": "Tata Sampann",
    "category": "Pulses & Lentils",
    "price": 135,
    "weight": 1,
    "unit": "kg",
    "countInStock": 120,
    "description": "Fresh moong dal with natural taste and nutrition",
    "image": "/uploads/lentils_dal,_yellow__6d69f7ac.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Moong Dal Yellow"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Masoor Dal Red",
    "brand": "Aashirvaad",
    "category": "Pulses & Lentils",
    "price": 130,
    "weight": 1,
    "unit": "kg",
    "countInStock": 110,
    "description": "Premium quality masoor dal for healthy meals",
    "image": "/uploads/lentils_dal,_yellow__9496f453.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Masoor Dal Red"

# Rice
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "India Gate Basmati Rice",
    "brand": "India Gate",
    "category": "Grains & Cereals",
    "price": 180,
    "weight": 1,
    "unit": "kg",
    "countInStock": 85,
    "description": "Premium aged basmati rice with long grains and rich aroma",
    "image": "/uploads/rice_grains,_basmati_1b7efdf4.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ India Gate Basmati Rice"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sona Masoori Rice",
    "brand": "Laxmi",
    "category": "Grains & Cereals",
    "price": 75,
    "weight": 1,
    "unit": "kg",
    "countInStock": 150,
    "description": "Lightweight and aromatic sona masoori rice for daily meals",
    "image": "/uploads/rice_grains,_basmati_b9d7fefd.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Sona Masoori Rice"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Brown Rice Organic",
    "brand": "Organic India",
    "category": "Grains & Cereals",
    "price": 120,
    "weight": 1,
    "unit": "kg",
    "countInStock": 70,
    "description": "Healthy brown rice rich in fiber and nutrients",
    "image": "/uploads/rice_grains,_basmati_fded14aa.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Brown Rice Organic"

# Wheat Flour
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aashirvaad Whole Wheat Atta",
    "brand": "Aashirvaad",
    "category": "Grains & Cereals",
    "price": 250,
    "weight": 5,
    "unit": "kg",
    "countInStock": 90,
    "description": "Chakki fresh atta with 100% whole wheat for soft rotis",
    "image": "/uploads/wheat_flour_atta,_fl_df3d50fe.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Aashirvaad Whole Wheat Atta"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pillsbury Chakki Fresh Atta",
    "brand": "Pillsbury",
    "category": "Grains & Cereals",
    "price": 245,
    "weight": 5,
    "unit": "kg",
    "countInStock": 80,
    "description": "Fresh chakki atta for nutritious and tasty rotis",
    "image": "/uploads/wheat_flour_atta,_fl_f3cfe95d.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Pillsbury Chakki Fresh Atta"

# Spices
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Everest Turmeric Powder",
    "brand": "Everest",
    "category": "Spices & Seasonings",
    "price": 95,
    "weight": 200,
    "unit": "g",
    "countInStock": 130,
    "description": "Pure turmeric powder with natural color and health benefits",
    "image": "/uploads/spices,_turmeric_pow_291c4bb9.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Everest Turmeric Powder"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MDH Red Chilli Powder",
    "brand": "MDH",
    "category": "Spices & Seasonings",
    "price": 85,
    "weight": 200,
    "unit": "g",
    "countInStock": 140,
    "description": "Authentic red chilli powder for spicy and flavorful dishes",
    "image": "/uploads/spices,_turmeric_pow_38de5b58.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ MDH Red Chilli Powder"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Catch Coriander Powder",
    "brand": "Catch",
    "category": "Spices & Seasonings",
    "price": 75,
    "weight": 200,
    "unit": "g",
    "countInStock": 125,
    "description": "Fresh coriander powder with authentic aroma",
    "image": "/uploads/spices,_turmeric_pow_6a87ee08.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Catch Coriander Powder"

# Tea
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tata Tea Premium",
    "brand": "Tata Tea",
    "category": "Beverages",
    "price": 250,
    "weight": 500,
    "unit": "g",
    "countInStock": 110,
    "description": "Premium black tea with rich flavor and aroma",
    "image": "/uploads/tea_leaves,_black_te_1c19f27e.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Tata Tea Premium"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Red Label Natural Care Tea",
    "brand": "Brooke Bond",
    "category": "Beverages",
    "price": 230,
    "weight": 500,
    "unit": "g",
    "countInStock": 95,
    "description": "Natural care tea with 5 Ayurvedic ingredients",
    "image": "/uploads/tea_leaves,_black_te_aba94533.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Red Label Natural Care Tea"

# Sugar
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Madhur Pure Sugar",
    "brand": "Madhur",
    "category": "Grains & Cereals",
    "price": 45,
    "weight": 1,
    "unit": "kg",
    "countInStock": 160,
    "description": "Pure white sugar with fine crystals",
    "image": "/uploads/sugar,_white_sugar,__0e6e4e88.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Madhur Pure Sugar"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dhampure Speciality White Sugar",
    "brand": "Dhampure",
    "category": "Grains & Cereals",
    "price": 48,
    "weight": 1,
    "unit": "kg",
    "countInStock": 150,
    "description": "Premium quality white sugar for sweetening",
    "image": "/uploads/sugar,_white_sugar,__88eb6247.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Dhampure Speciality White Sugar"

# Salt
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tata Salt Iodized",
    "brand": "Tata",
    "category": "Spices & Seasonings",
    "price": 22,
    "weight": 1,
    "unit": "kg",
    "countInStock": 200,
    "description": "Iodized salt for healthy living and better taste",
    "image": "/uploads/salt_packet,_iodized_24df8918.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Tata Salt Iodized"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Annapurna Double Fortified Salt",
    "brand": "Annapurna",
    "category": "Spices & Seasonings",
    "price": 24,
    "weight": 1,
    "unit": "kg",
    "countInStock": 180,
    "description": "Double fortified with iodine and iron",
    "image": "/uploads/salt_packet,_iodized_eb955dad.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Annapurna Double Fortified Salt"

# Detergent
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Surf Excel Matic Top Load",
    "brand": "Surf Excel",
    "category": "Household Items",
    "price": 380,
    "weight": 2,
    "unit": "kg",
    "countInStock": 70,
    "description": "Powerful detergent for top load washing machines",
    "image": "/uploads/detergent_powder,_la_11569e0f.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Surf Excel Matic Top Load"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ariel Matic Powder",
    "brand": "Ariel",
    "category": "Household Items",
    "price": 375,
    "weight": 2,
    "unit": "kg",
    "countInStock": 65,
    "description": "Excellent stain removal for machine wash",
    "image": "/uploads/detergent_powder,_la_ea2cc3c6.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Ariel Matic Powder"

# Biscuits
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Parle-G Glucose Biscuits",
    "brand": "Parle",
    "category": "Snacks & Confectionery",
    "price": 30,
    "weight": 200,
    "unit": "g",
    "countInStock": 180,
    "description": "Classic glucose biscuits loved by all generations",
    "image": "/uploads/biscuits_cookies,_te_153ea183.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Parle-G Glucose Biscuits"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Britannia Marie Gold",
    "brand": "Britannia",
    "category": "Snacks & Confectionery",
    "price": 35,
    "weight": 200,
    "unit": "g",
    "countInStock": 160,
    "description": "Light and crispy marie biscuits perfect for tea time",
    "image": "/uploads/biscuits_cookies,_te_930c9560.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Britannia Marie Gold"

# Milk
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amul Taaza Toned Milk",
    "brand": "Amul",
    "category": "Dairy Products",
    "price": 28,
    "weight": 500,
    "unit": "ml",
    "countInStock": 120,
    "description": "Fresh toned milk with goodness of calcium",
    "image": "/uploads/milk_packet,_dairy_m_77103063.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Amul Taaza Toned Milk"

curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mother Dairy Full Cream Milk",
    "brand": "Mother Dairy",
    "category": "Dairy Products",
    "price": 32,
    "weight": 500,
    "unit": "ml",
    "countInStock": 100,
    "description": "Rich and creamy full cream milk",
    "image": "/uploads/milk_packet,_dairy_m_9b596c7a.jpg",
    "isActive": true
  }' > /dev/null 2>&1 && echo "✅ Mother Dairy Full Cream Milk"

echo ""
echo "📦 Product creation completed!"
