#!/bin/bash

API_URL="http://localhost:3000/api"
TOKEN="test_admin_token_for_development"

echo "🚀 Creating products with correct categories..."

# Personal Care - Bath Soaps
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Lux Velvet Touch Soap","brand":"Lux","category":"personal-care","price":35,"weight":{"value":125,"unit":"gram"},"countInStock":150,"description":"Luxurious bathing soap with velvet touch formula for soft and smooth skin","images":[{"url":"/uploads/bar_of_soap,_bath_so_01935eca.jpg"}],"unit":"piece","isActive":true}' && echo "✅ Lux Velvet Touch Soap"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Lifebuoy Total 10 Soap","brand":"Lifebuoy","category":"personal-care","price":30,"weight":{"value":125,"unit":"gram"},"countInStock":180,"description":"Germ protection soap with advanced formula that provides 99.9% protection","images":[{"url":"/uploads/bar_of_soap,_bath_so_431a92fd.jpg"}],"unit":"piece","isActive":true}' && echo "✅ Lifebuoy Total 10 Soap"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dettol Skincare Soap","brand":"Dettol","category":"personal-care","price":40,"weight":{"value":125,"unit":"gram"},"countInStock":120,"description":"Antibacterial soap with trusted Dettol protection for healthy skin","images":[{"url":"/uploads/bar_of_soap,_bath_so_edd185c3.jpg"}],"unit":"piece","isActive":true}' && echo "✅ Dettol Skincare Soap"

# Hair Oils
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Parachute Coconut Oil","brand":"Parachute","category":"personal-care","price":180,"weight":{"value":500,"unit":"ml"},"countInStock":100,"description":"Pure coconut oil for strong, healthy and beautiful hair","images":[{"url":"/uploads/hair_oil_bottle,_coc_6b88f444.jpg"}],"unit":"bottle","isActive":true}' && echo "✅ Parachute Coconut Oil"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dabur Amla Hair Oil","brand":"Dabur","category":"personal-care","price":150,"weight":{"value":500,"unit":"ml"},"countInStock":120,"description":"Enriched with amla extracts for long, thick and beautiful hair","images":[{"url":"/uploads/hair_oil_bottle,_coc_9a59f260.jpg"}],"unit":"bottle","isActive":true}' && echo "✅ Dabur Amla Hair Oil"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bajaj Almond Drops Hair Oil","brand":"Bajaj","category":"personal-care","price":160,"weight":{"value":500,"unit":"ml"},"countInStock":90,"description":"Non-sticky almond oil for smooth and silky hair","images":[{"url":"/uploads/hair_oil_bottle,_coc_ba6db951.jpg"}],"unit":"bottle","isActive":true}' && echo "✅ Bajaj Almond Drops Hair Oil"

# Toothpaste
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Colgate Total Advanced Health","brand":"Colgate","category":"personal-care","price":85,"weight":{"value":150,"unit":"gram"},"countInStock":200,"description":"Complete oral care with 12-hour protection against germs","images":[{"url":"/uploads/toothpaste_tube,_den_5cad189f.jpg"}],"unit":"piece","isActive":true}' && echo "✅ Colgate Total Advanced Health"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Pepsodent Germicheck","brand":"Pepsodent","category":"personal-care","price":75,"weight":{"value":150,"unit":"gram"},"countInStock":180,"description":"Fights germs and keeps your mouth fresh all day","images":[{"url":"/uploads/toothpaste_tube,_den_7babcb1a.jpg"}],"unit":"piece","isActive":true}' && echo "✅ Pepsodent Germicheck"

# Shampoo
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Pantene Pro-V Silky Smooth","brand":"Pantene","category":"personal-care","price":220,"weight":{"value":340,"unit":"ml"},"countInStock":80,"description":"Pro-vitamin formula for silky smooth and manageable hair","images":[{"url":"/uploads/shampoo_bottle,_hair_3359bb6b.jpg"}],"unit":"bottle","isActive":true}' && echo "✅ Pantene Pro-V Silky Smooth"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Clinic Plus Strong & Long","brand":"Clinic Plus","category":"personal-care","price":180,"weight":{"value":340,"unit":"ml"},"countInStock":100,"description":"Milk protein formula for strong and long hair","images":[{"url":"/uploads/shampoo_bottle,_hair_df0dd5ef.jpg"}],"unit":"bottle","isActive":true}' && echo "✅ Clinic Plus Strong & Long"

# Cooking Oils
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Fortune Sunflower Oil","brand":"Fortune","category":"oil-ghee","price":185,"weight":{"value":1,"unit":"liter"},"countInStock":75,"description":"Light and healthy sunflower oil rich in Vitamin E","images":[{"url":"/uploads/cooking_oil_bottle,__2784f70e.jpg"}],"unit":"bottle","isActive":true}' && echo "✅ Fortune Sunflower Oil"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dhara Mustard Oil","brand":"Dhara","category":"oil-ghee","price":195,"weight":{"value":1,"unit":"liter"},"countInStock":65,"description":"Pure mustard oil with authentic taste and aroma","images":[{"url":"/uploads/cooking_oil_bottle,__8c8e5bd2.jpg"}],"unit":"bottle","isActive":true}' && echo "✅ Dhara Mustard Oil"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Parachute Coconut Cooking Oil","brand":"Parachute","category":"oil-ghee","price":210,"weight":{"value":1,"unit":"liter"},"countInStock":60,"description":"Pure coconut oil for healthy and tasty cooking","images":[{"url":"/uploads/cooking_oil_bottle,__a3431f83.jpg"}],"unit":"bottle","isActive":true}' && echo "✅ Parachute Coconut Cooking Oil"

# Dal/Lentils
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Toor Dal Premium","brand":"Organic India","category":"groceries","price":140,"weight":{"value":1,"unit":"kg"},"countInStock":100,"description":"High quality toor dal rich in protein and nutrients","images":[{"url":"/uploads/lentils_dal,_yellow__6d18f48e.jpg"}],"unit":"kg","isActive":true}' && echo "✅ Toor Dal Premium"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type": "application/json" \
  -d '{"name":"Moong Dal Yellow","brand":"Tata Sampann","category":"groceries","price":135,"weight":{"value":1,"unit":"kg"},"countInStock":120,"description":"Fresh moong dal with natural taste and nutrition","images":[{"url":"/uploads/lentils_dal,_yellow__6d69f7ac.jpg"}],"unit":"kg","isActive":true}' && echo "✅ Moong Dal Yellow"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Masoor Dal Red","brand":"Aashirvaad","category":"groceries","price":130,"weight":{"value":1,"unit":"kg"},"countInStock":110,"description":"Premium quality masoor dal for healthy meals","images":[{"url":"/uploads/lentils_dal,_yellow__9496f453.jpg"}],"unit":"kg","isActive":true}' && echo "✅ Masoor Dal Red"

# Rice
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"India Gate Basmati Rice","brand":"India Gate","category":"groceries","price":180,"weight":{"value":1,"unit":"kg"},"countInStock":85,"description":"Premium aged basmati rice with long grains and rich aroma","images":[{"url":"/uploads/rice_grains,_basmati_1b7efdf4.jpg"}],"unit":"kg","isActive":true}' && echo "✅ India Gate Basmati Rice"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Sona Masoori Rice","brand":"Laxmi","category":"groceries","price":75,"weight":{"value":1,"unit":"kg"},"countInStock":150,"description":"Lightweight and aromatic sona masoori rice for daily meals","images":[{"url":"/uploads/rice_grains,_basmati_b9d7fefd.jpg"}],"unit":"kg","isActive":true}' && echo "✅ Sona Masoori Rice"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Brown Rice Organic","brand":"Organic India","category":"groceries","price":120,"weight":{"value":1,"unit":"kg"},"countInStock":70,"description":"Healthy brown rice rich in fiber and nutrients","images":[{"url":"/uploads/rice_grains,_basmati_fded14aa.jpg"}],"unit":"kg","isActive":true}' && echo "✅ Brown Rice Organic"

# Wheat Flour
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Aashirvaad Whole Wheat Atta","brand":"Aashirvaad","category":"groceries","price":250,"weight":{"value":5,"unit":"kg"},"countInStock":90,"description":"Chakki fresh atta with 100% whole wheat for soft rotis","images":[{"url":"/uploads/wheat_flour_atta,_fl_df3d50fe.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Aashirvaad Whole Wheat Atta"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Pillsbury Chakki Fresh Atta","brand":"Pillsbury","category":"groceries","price":245,"weight":{"value":5,"unit":"kg"},"countInStock":80,"description":"Fresh chakki atta for nutritious and tasty rotis","images":[{"url":"/uploads/wheat_flour_atta,_fl_f3cfe95d.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Pillsbury Chakki Fresh Atta"

# Spices
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Everest Turmeric Powder","brand":"Everest","category":"spices","price":95,"weight":{"value":200,"unit":"gram"},"countInStock":130,"description":"Pure turmeric powder with natural color and health benefits","images":[{"url":"/uploads/spices,_turmeric_pow_291c4bb9.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Everest Turmeric Powder"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"MDH Red Chilli Powder","brand":"MDH","category":"spices","price":85,"weight":{"value":200,"unit":"gram"},"countInStock":140,"description":"Authentic red chilli powder for spicy and flavorful dishes","images":[{"url":"/uploads/spices,_turmeric_pow_38de5b58.jpg"}],"unit":"packet","isActive":true}' && echo "✅ MDH Red Chilli Powder"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Catch Coriander Powder","brand":"Catch","category":"spices","price":75,"weight":{"value":200,"unit":"gram"},"countInStock":125,"description":"Fresh coriander powder with authentic aroma","images":[{"url":"/uploads/spices,_turmeric_pow_6a87ee08.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Catch Coriander Powder"

# Tea
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tata Tea Premium","brand":"Tata Tea","category":"beverages","price":250,"weight":{"value":500,"unit":"gram"},"countInStock":110,"description":"Premium black tea with rich flavor and aroma","images":[{"url":"/uploads/tea_leaves,_black_te_1c19f27e.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Tata Tea Premium"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Red Label Natural Care Tea","brand":"Brooke Bond","category":"beverages","price":230,"weight":{"value":500,"unit":"gram"},"countInStock":95,"description":"Natural care tea with 5 Ayurvedic ingredients","images":[{"url":"/uploads/tea_leaves,_black_te_aba94533.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Red Label Natural Care Tea"

# Sugar
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Madhur Pure Sugar","brand":"Madhur","category":"groceries","price":45,"weight":{"value":1,"unit":"kg"},"countInStock":160,"description":"Pure white sugar with fine crystals","images":[{"url":"/uploads/sugar,_white_sugar,__0e6e4e88.jpg"}],"unit":"kg","isActive":true}' && echo "✅ Madhur Pure Sugar"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dhampure Speciality White Sugar","brand":"Dhampure","category":"groceries","price":48,"weight":{"value":1,"unit":"kg"},"countInStock":150,"description":"Premium quality white sugar for sweetening","images":[{"url":"/uploads/sugar,_white_sugar,__88eb6247.jpg"}],"unit":"kg","isActive":true}' && echo "✅ Dhampure Speciality White Sugar"

# Salt
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tata Salt Iodized","brand":"Tata","category":"spices","price":22,"weight":{"value":1,"unit":"kg"},"countInStock":200,"description":"Iodized salt for healthy living and better taste","images":[{"url":"/uploads/salt_packet,_iodized_24df8918.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Tata Salt Iodized"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Annapurna Double Fortified Salt","brand":"Annapurna","category":"spices","price":24,"weight":{"value":1,"unit":"kg"},"countInStock":180,"description":"Double fortified with iodine and iron","images":[{"url":"/uploads/salt_packet,_iodized_eb955dad.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Annapurna Double Fortified Salt"

# Detergent
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Surf Excel Matic Top Load","brand":"Surf Excel","category":"cleaning","price":380,"weight":{"value":2,"unit":"kg"},"countInStock":70,"description":"Powerful detergent for top load washing machines","images":[{"url":"/uploads/detergent_powder,_la_11569e0f.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Surf Excel Matic Top Load"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ariel Matic Powder","brand":"Ariel","category":"cleaning","price":375,"weight":{"value":2,"unit":"kg"},"countInStock":65,"description":"Excellent stain removal for machine wash","images":[{"url":"/uploads/detergent_powder,_la_ea2cc3c6.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Ariel Matic Powder"

# Biscuits
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Parle-G Glucose Biscuits","brand":"Parle","category":"snacks","price":30,"weight":{"value":200,"unit":"gram"},"countInStock":180,"description":"Classic glucose biscuits loved by all generations","images":[{"url":"/uploads/biscuits_cookies,_te_153ea183.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Parle-G Glucose Biscuits"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Britannia Marie Gold","brand":"Britannia","category":"snacks","price":35,"weight":{"value":200,"unit":"gram"},"countInStock":160,"description":"Light and crispy marie biscuits perfect for tea time","images":[{"url":"/uploads/biscuits_cookies,_te_930c9560.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Britannia Marie Gold"

# Milk
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Amul Taaza Toned Milk","brand":"Amul","category":"dairy","price":28,"weight":{"value":500,"unit":"ml"},"countInStock":120,"description":"Fresh toned milk with goodness of calcium","images":[{"url":"/uploads/milk_packet,_dairy_m_77103063.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Amul Taaza Toned Milk"

curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mother Dairy Full Cream Milk","brand":"Mother Dairy","category":"dairy","price":32,"weight":{"value":500,"unit":"ml"},"countInStock":100,"description":"Rich and creamy full cream milk","images":[{"url":"/uploads/milk_packet,_dairy_m_9b596c7a.jpg"}],"unit":"packet","isActive":true}' && echo "✅ Mother Dairy Full Cream Milk"

echo ""
echo "📦 Product creation completed!"
