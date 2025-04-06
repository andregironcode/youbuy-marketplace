-- Function to create orders with wallet support
CREATE OR REPLACE FUNCTION create_wallet_order(
  p_product_id UUID,
  p_buyer_id UUID,
  p_seller_id UUID,
  p_amount DECIMAL,
  p_status TEXT,
  p_delivery_details JSONB
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id TEXT;
  v_payment_method TEXT;
BEGIN
  -- Extract payment method from delivery details
  v_payment_method := p_delivery_details->>'paymentMethod';

  -- Insert the order
  INSERT INTO orders (
    product_id,
    buyer_id,
    seller_id,
    amount,
    status,
    delivery_details,
    payment_method
  ) VALUES (
    p_product_id,
    p_buyer_id,
    p_seller_id,
    p_amount,
    p_status,
    p_delivery_details,
    v_payment_method
  ) RETURNING id INTO v_order_id;

  -- Create initial order status history entry
  INSERT INTO order_status_history (
    order_id,
    status,
    notes
  ) VALUES (
    v_order_id,
    p_status,
    'Order created'
  );

  -- If using wallet payment, process the payment
  IF v_payment_method = 'wallet' THEN
    -- Make payment from wallet
    PERFORM make_payment(
      p_buyer_id,
      p_amount,
      'Payment for order #' || v_order_id
    );
  END IF;

  RETURN v_order_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$; 