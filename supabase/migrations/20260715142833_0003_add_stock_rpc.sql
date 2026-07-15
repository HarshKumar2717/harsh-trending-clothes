/*
# Add decrement_stock RPC

Adds a SECURITY DEFINER function to safely decrement product stock
when an order is placed. Prevents negative stock.

## Notes
- Takes product id + qty, decrements stock (floor at 0).
- Callable by authenticated users (called during checkout).
*/

CREATE OR REPLACE FUNCTION public.decrement_stock(p_id uuid, qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock = GREATEST(0, stock - qty)
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.next_order_number() TO authenticated;
