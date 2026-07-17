/*
# Seed Product Images

Inserts 3 image variants per product into product_images for all products
that don't already have images. Uses the primary_image_url plus two
resolution variants for the product gallery.
*/

INSERT INTO public.product_images (product_id, image_url, position)
SELECT p.id, img.url, img.pos
FROM public.products p
CROSS JOIN LATERAL (
  VALUES
    (p.primary_image_url, 0),
    (REPLACE(p.primary_image_url, 'w=800', 'w=800&dpr=2'), 1),
    (REPLACE(p.primary_image_url, 'w=800', 'w=1200'), 2)
) AS img(url, pos)
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_images pi WHERE pi.product_id = p.id
);
