/* Add unique constraint on products.slug so ON CONFLICT (slug) works for idempotent seeding. */
ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
