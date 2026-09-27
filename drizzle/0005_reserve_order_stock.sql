-- Takes an order's quantities out of `stock`, summed per product (several bag
-- lines can share one product). Raises check_violation (23514) when a product
-- has no stock row or too little stock (the latter via stock_quantity_non_negative),
-- so the db.batch that created the order rolls back as a whole.
CREATE OR REPLACE FUNCTION reserve_order_stock(p_order_id text) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  wanted integer;
  reserved integer;
BEGIN
  SELECT count(DISTINCT product_id) INTO wanted FROM order_items WHERE order_id = p_order_id;

  WITH r AS (
    SELECT product_id, sum(quantity) AS qty FROM order_items WHERE order_id = p_order_id GROUP BY product_id
  ), u AS (
    UPDATE stock s SET quantity = s.quantity - r.qty, updated_at = now()
    FROM r WHERE s.product_id = r.product_id
    RETURNING s.product_id
  )
  SELECT count(*) INTO reserved FROM u;

  IF reserved <> wanted THEN
    RAISE EXCEPTION 'insufficient stock for order %', p_order_id USING ERRCODE = 'check_violation';
  END IF;
END;
$$;
