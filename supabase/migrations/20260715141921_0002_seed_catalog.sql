/*
# Seed Data: Categories, 30+ Products, Banners, Coupons, Demo Reviews

## What this does
- Inserts 5 categories: T-Shirts, Shirts, Pants, Sneakers, Men's Trending Perfumes.
- Inserts 30 demo products with images (Pexels), prices, stock, descriptions,
  badges, and flags (featured/trending/best_seller/new).
- Inserts 3 home page banners.
- Inserts 3 demo coupons.
All inserts are idempotent (ON CONFLICT DO NOTHING).
*/

-- Categories
INSERT INTO public.categories (name, slug, description, image_url) VALUES
('T-Shirts','t-shirts','Premium oversized and printed tees.','https://images.pexels.com/photos/1655532/pexels-photo-1655532.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Shirts','shirts','Formal and casual shirts for every occasion.','https://images.pexels.com/photos/2974409/pexels-photo-2974409.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Pants','pants','Cargo, jeans and formal trousers.','https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Sneakers','sneakers','Trendy sneakers and sports shoes.','https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Men''s Trending Perfumes','perfumes','Luxury and trending fragrances for men.','https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=800')
ON CONFLICT (name) DO NOTHING;

-- Products
DO $$
DECLARE
  c_t uuid; c_s uuid; c_p uuid; c_sn uuid; c_pf uuid;
BEGIN
  SELECT id INTO c_t FROM public.categories WHERE slug='t-shirts';
  SELECT id INTO c_s FROM public.categories WHERE slug='shirts';
  SELECT id INTO c_p FROM public.categories WHERE slug='pants';
  SELECT id INTO c_sn FROM public.categories WHERE slug='sneakers';
  SELECT id INTO c_pf FROM public.categories WHERE slug='perfumes';

  -- T-Shirts (6)
  INSERT INTO public.products (name, slug, description, price, mrp, stock, low_stock_threshold, category_id, brand, rating, rating_count, badges, is_featured, is_trending, is_best_seller, is_new, primary_image_url) VALUES
  ('Black Oversized T-Shirt','black-oversized-tshirt','Heavyweight 240 GSM cotton oversized fit tee with drop shoulders. Premium matte finish, pre-shrunk fabric.',799,1499,40,10,c_t,'Harsh Co.',4.5,128,ARRAY['Bestseller','Oversized'],true,true,true,false,'https://images.pexels.com/photos/1655532/pexels-photo-1655532.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('White Printed T-Shirt','white-printed-tshirt','Soft bio-washed cotton tee with a bold graphic print. Relaxed regular fit.',899,1799,30,10,c_t,'Harsh Co.',4.4,96,ARRAY['Printed'],false,true,false,true,'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Grey Premium Cotton Tee','grey-premium-cotton-tee','180 GSM combed cotton with a tailored regular fit. Minimal gold-t embroidered chest detail.',999,1999,20,10,c_t,'Harsh Luxe',4.7,54,ARRAY['Premium'],true,false,true,false,'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Navy Stripe Tee','navy-stripe-tee','Classic horizontal stripe tee in navy and white. Breathable summer cotton.',749,1399,35,10,c_t,'Harsh Co.',4.2,40,ARRAY['New'],false,false,false,true,'https://images.pexels.com/photos/5383375/pexels-photo-5383375.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Maroon Henley Tee','maroon-henley-tee','Three-button henley in rich maroon. Premium slub cotton, regular fit.',849,1699,22,10,c_t,'Harsh Luxe',4.3,33,ARRAY['New','Henley'],false,true,false,true,'https://images.pexels.com/photos/769733/pexels-photo-769733.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Olive Oversized Tee','olive-oversized-tee','Oversized boxy fit in earthy olive. 220 GSM heavyweight cotton.',899,1799,18,10,c_t,'Harsh Co.',4.6,28,ARRAY['Oversized','Olive'],true,true,false,false,'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg?auto=compress&cs=tinysrgb&w=800')
  ON CONFLICT DO NOTHING;

  -- Shirts (6)
  INSERT INTO public.products (name, slug, description, price, mrp, stock, low_stock_threshold, category_id, brand, rating, rating_count, badges, is_featured, is_trending, is_best_seller, is_new, primary_image_url) VALUES
  ('Black Formal Shirt','black-formal-shirt','Wrinkle-resistant formal shirt with a spread collar. Slim fit, rich black twill.',1499,2999,18,10,c_s,'Harsh Formals',4.6,72,ARRAY['Formal'],true,false,true,false,'https://images.pexels.com/photos/2974409/pexels-photo-2974409.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('White Casual Shirt','white-casual-shirt','Linen-blend casual shirt with a relaxed fit. Perfect for everyday styling.',1299,2499,25,10,c_s,'Harsh Co.',4.4,61,ARRAY['Casual'],false,true,false,true,'https://images.pexels.com/photos/2974396/pexels-photo-2974396.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Denim Shirt','denim-shirt','Mid-wash denim shirt with a button-down collar. Versatile layering piece.',1799,3499,14,10,c_s,'Harsh Denim',4.7,45,ARRAY['Denim','Bestseller'],true,true,true,false,'https://images.pexels.com/photos/4308801/pexels-photo-4308801.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Light Blue Oxford Shirt','light-blue-oxford-shirt','Pinpoint oxford weave with a button-down collar. A timeless wardrobe staple.',1399,2699,30,10,c_s,'Harsh Formals',4.5,38,ARRAY['Oxford'],false,false,false,false,'https://images.pexels.com/photos/8214843/pexels-photo-8214843.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Checked Flannel Shirt','checked-flannel-shirt','Brushed flannel in red and black checks. Soft, warm, and effortlessly stylish.',1599,3099,16,10,c_s,'Harsh Co.',4.3,29,ARRAY['Flannel','New'],false,true,false,true,'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Peach Linen Shirt','peach-linen-shirt','Lightweight pure linen shirt in a soft peach tone. Holiday-ready breathable weave.',1699,3299,12,10,c_s,'Harsh Luxe',4.8,21,ARRAY['Linen','Premium'],true,false,true,true,'https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?auto=compress&cs=tinysrgb&w=800')
  ON CONFLICT DO NOTHING;

  -- Pants (6)
  INSERT INTO public.products (name, slug, description, price, mrp, stock, low_stock_threshold, category_id, brand, rating, rating_count, badges, is_featured, is_trending, is_best_seller, is_new, primary_image_url) VALUES
  ('Black Cargo Pant','black-cargo-pant','Utility cargo pant with six pockets and a tapered leg. Ripstop cotton blend.',1899,3599,15,10,c_p,'Harsh Utility',4.6,83,ARRAY['Cargo','Bestseller'],true,true,true,false,'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Slim Fit Jeans','slim-fit-jeans','Stretch-comfort slim fit jeans in indigo blue. Reinforced stitching, mid-rise.',1999,3999,28,10,c_p,'Harsh Denim',4.5,110,ARRAY['Denim','Stretch'],false,true,true,false,'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Formal Trouser','formal-trouser','Wrinkle-free formal trouser with a flat front. Charcoal grey poly-wool blend.',1699,3299,24,10,c_p,'Harsh Formals',4.4,57,ARRAY['Formal'],false,false,false,false,'https://images.pexels.com/photos/1346187/pexels-photo-1346187.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Beige Chino Pant','beige-chino-pant','Garment-dyed chino with a slim tapered fit. Versatile everyday essential.',1499,2899,26,10,c_p,'Harsh Co.',4.3,44,ARRAY['Chino','New'],false,true,false,true,'https://images.pexels.com/photos/2112645/pexels-photo-2112645.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Black Jogger Pant','black-jogger-pant','Fleece-lined jogger with ribbed cuffs. Sporty comfort meets street style.',1299,2499,32,10,c_p,'Harsh Utility',4.2,51,ARRAY['Jogger'],false,false,false,true,'https://images.pexels.com/photos/4498130/pexels-photo-4498130.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Pleated Wool Trouser','pleated-wool-trouser','Single-pleat wool-blend trouser with a tailored drape. Premium formalwear.',2199,4299,10,10,c_p,'Harsh Luxe',4.8,18,ARRAY['Premium','Wool'],true,false,true,false,'https://images.pexels.com/photos/1478400/pexels-photo-1478400.jpeg?auto=compress&cs=tinysrgb&w=800')
  ON CONFLICT DO NOTHING;

  -- Sneakers (6)
  INSERT INTO public.products (name, slug, description, price, mrp, stock, low_stock_threshold, category_id, brand, rating, rating_count, badges, is_featured, is_trending, is_best_seller, is_new, primary_image_url) VALUES
  ('White Sneakers','white-sneakers','Minimalist white leather sneakers with a cushioned insole. Everyday clean look.',2999,5999,10,10,c_sn,'Harsh Footwear',4.7,142,ARRAY['Bestseller'],true,true,true,false,'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Black Sports Shoes','black-sports-shoes','Lightweight mesh sports shoes with a rubber outsole. Built for all-day comfort.',3499,6999,16,10,c_sn,'Harsh Sport',4.5,89,ARRAY['Sports'],false,true,false,false,'https://images.pexels.com/photos/2562992/pexels-photo-2562992.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('High Top Sneakers','high-top-sneakers','Canvas high-top sneakers with a vulcanized sole. Iconic street style.',3999,7999,8,10,c_sn,'Harsh Footwear',4.6,63,ARRAY['High-Top','Limited'],true,false,true,false,'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Retro Runner Sneakers','retro-runner-sneakers','Retro-inspired running sneakers with chunky cushioning. Throwback colorway.',3799,7499,14,10,c_sn,'Harsh Sport',4.4,47,ARRAY['New','Retro'],false,true,false,true,'https://images.pexels.com/photos/2421374/pexels-photo-2421374.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Tan Leather Loafers','tan-leather-loafers','Hand-finished tan leather loafers. Slip-on smart casual elegance.',4499,8999,9,10,c_sn,'Harsh Luxe',4.8,31,ARRAY['Premium','Leather'],true,false,true,false,'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Grey Knit Sneakers','grey-knit-sneakers','Breathable knit upper with a memory-foam insole. Featherlight comfort.',3299,6499,20,10,c_sn,'Harsh Footwear',4.3,26,ARRAY['Knit','New'],false,false,false,true,'https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800')
  ON CONFLICT DO NOTHING;

  -- Perfumes (6)
  INSERT INTO public.products (name, slug, description, price, mrp, stock, low_stock_threshold, category_id, brand, rating, rating_count, badges, is_featured, is_trending, is_best_seller, is_new, primary_image_url) VALUES
  ('Dior Sauvage','dior-sauvage','Fresh and raw, an irresistible bergamot and pepper signature. Eau de Parfum, 100ml.',6999,9999,12,10,c_pf,'Dior',4.9,210,ARRAY['Luxury','Bestseller'],true,true,true,false,'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Bella Vita CEO Man','bella-vita-ceo-man','A luxury woody fragrance with notes of citrus and amber. Premium gifting, 100ml.',699,1299,40,10,c_pf,'Bella Vita',4.3,178,ARRAY['Budget'],false,true,false,false,'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Wild Stone Edge','wild-stone-edge','A bold spicy fragrance for the modern man. Long-lasting everyday scent, 120ml.',399,799,50,10,c_pf,'Wild Stone',4.1,156,ARRAY['Budget','New'],false,false,false,true,'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Versace Eros','versace-eros','Intense mint, green apple and vanilla notes. A statement of pure confidence, 100ml.',7499,10999,8,10,c_pf,'Versace',4.8,94,ARRAY['Luxury','Limited'],true,true,true,false,'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Armani Code','armani-code','A seductive blend of bergamot, coffee and tonka bean. Timeless evening fragrance, 75ml.',8999,12999,6,10,c_pf,'Armani',4.9,67,ARRAY['Luxury','Premium'],true,false,true,false,'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Park Avenue Voyage','park-avenue-voyage','A refreshing aquatic fragrance with citrus top notes. Value pack, 120ml.',499,999,38,10,c_pf,'Park Avenue',4.0,134,ARRAY['Budget'],false,false,false,false,'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=800')
  ON CONFLICT DO NOTHING;
END $$;

-- Banners
INSERT INTO public.banners (title, subtitle, image_url, cta_text, cta_link, position, is_active) VALUES
('Winter Collection 2025','Up to 40% off on premium denim, jackets & more.','https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1600','Shop Collection','/shop?trending=1',1,true),
('New Drop: Oversized Tees','Heavyweight cotton. Designed in India. Made to last.','https://images.pexels.com/photos/1655532/pexels-photo-1655532.jpeg?auto=compress&cs=tinysrgb&w=1600','Explore','/category/t-shirts',2,true),
('Signature Fragrances','Discover trending perfumes for the modern man.','https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1600','Shop Perfumes','/category/perfumes',3,true)
ON CONFLICT DO NOTHING;

-- Coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order, max_discount, usage_limit, is_active) VALUES
('WELCOME10','Flat 10% off on your first order.', 'percent', 10, 0, 500, 1000, true),
('FLAT200','Flat ₹200 off on orders above ₹1499.', 'flat', 200, 1499, 200, 1000, true),
('GOLD500','Flat ₹500 off on orders above ₹3999.', 'flat', 500, 3999, 500, 500, true)
ON CONFLICT (code) DO NOTHING;
