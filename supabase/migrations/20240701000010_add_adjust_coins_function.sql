-- Create a function to adjust user coins and create a transaction record in a single transaction
CREATE OR REPLACE FUNCTION adjust_user_coins(
  p_user_id UUID,
  p_new_balance INTEGER,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN;
BEGIN
  -- Update the user's coin balance
  UPDATE public.users
  SET coins = p_new_balance
  WHERE id = p_user_id;
  
  -- Create a transaction record
  INSERT INTO public.coin_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    created_at
  ) VALUES (
    p_user_id,
    p_amount,
    p_transaction_type,
    p_description,
    NOW()
  );
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
