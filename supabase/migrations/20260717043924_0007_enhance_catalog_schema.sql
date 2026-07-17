/*
# Enhance Product Catalog Schema: Colors, Sizes, Discount, COD

## Overview
Adds columns to the products table to support rich filtering (by brand, size,
color), explicit discount tracking, and COD availability flags.

## Schema Changes
1. products table — new columns:
   - colors text[]        — available color names (e.g. ['Black','Navy'])
   - sizes text[]         — available sizes (e.g. ['S','M','L','XL']; empty for perfumes)
   - discount integer     — explicit discount percentage (0 if none), CHECK 0-100
   - cod_available boolean — whether Cash on Delivery is available (default true)
2. Backfills discount from existing mrp/price for legacy rows.
3. Adds indexes on brand, is_best_seller, is_new for faster filtering.
4. Ensures the 5 required categories (Pants, Shirts, T-Shirts, Sneakers, Perfumes)
   exist with clean slugs and up-to-date names/descriptions/images.

## Security
- No RLS changes — existing public-read / admin-write policies remain sufficient.
- All new columns inherit existing RLS.

## Notes
- Idempotent: uses IF NOT EXISTS for columns, ON CONFLICT for categories.
- Data seeding is handled in separate migrations (0008-0012) per category.
*/

-- ============ 1. New columns on products ============

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='products' AND column_name='colors') THEN
    ALTER TABLE public.products ADD COLUMN colors text[] NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='products' AND column_name='sizes') THEN
    ALTER TABLE public.products ADD COLUMN sizes text[] NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='products' AND column_name='discount') THEN
    ALTER TABLE public.products ADD COLUMN discount integer NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='products' AND column_name='cod_available') THEN
    ALTER TABLE public.products ADD COLUMN cod_available boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Backfill discount from existing mrp/price for legacy products
UPDATE public.products
SET discount = ROUND(((mrp - price)::numeric / mrp) * 100)::integer
WHERE discount = 0 AND mrp IS NOT NULL AND mrp > price;

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS products_brand_idx ON public.products(brand);
CREATE INDEX IF NOT EXISTS products_is_best_seller_idx ON public.products(is_best_seller);
CREATE INDEX IF NOT EXISTS products_is_new_idx ON public.products(is_new);

-- ============ 2. Ensure the 5 required categories ============

INSERT INTO public.categories (name, slug, description, image_url) VALUES
('Pants','pants','Cargo, jeans, chinos and formal trousers for every occasion.','https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Shirts','shirts','Formal, casual, denim and linen shirts.','https://images.pexels.com/photos/2974409/pexels-photo-2974409.jpeg?auto=compress&cs=tinysrgb&w=800'),
('T-Shirts','t-shirts','Oversized, printed and premium cotton tees.','https://images.pexels.com/photos/1655532/pexels-photo-1655532.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Sneakers','sneakers','Trendy sneakers, sports shoes and loafers.','https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Perfumes','perfumes','Luxury and trending fragrances.','https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=800')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;
