-- Wallet System Database Setup

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- Create wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment')),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_wallet FOREIGN KEY (user_id) REFERENCES wallets(user_id)
);

-- Create unique index on user_id in wallets
CREATE UNIQUE INDEX IF NOT EXISTS wallets_user_id_idx ON wallets(user_id);

-- Add RLS policies
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own wallets
CREATE POLICY "Users can view their own wallets" ON wallets
    FOR SELECT USING (auth.uid() = user_id);

-- Only allow users to view their own transactions
CREATE POLICY "Users can view their own transactions" ON wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Create function to make a deposit
CREATE OR REPLACE FUNCTION make_deposit(
    p_user_id UUID,
    p_amount DECIMAL,
    p_description TEXT DEFAULT 'Deposit to wallet'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id INTEGER;
BEGIN
    -- Validate inputs
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;

    -- Create wallet if it doesn't exist
    INSERT INTO wallets (user_id, balance)
    VALUES (p_user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;

    -- Update wallet balance
    UPDATE wallets
    SET 
        balance = balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING id INTO v_wallet_id;

    -- Record the transaction
    INSERT INTO wallet_transactions (user_id, type, amount, description)
    VALUES (p_user_id, 'deposit', p_amount, p_description);

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- Create function to make a withdrawal
CREATE OR REPLACE FUNCTION make_withdrawal(
    p_user_id UUID,
    p_amount DECIMAL,
    p_description TEXT DEFAULT 'Withdrawal from wallet'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance DECIMAL;
BEGIN
    -- Validate inputs
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;

    -- Check if user has a wallet and sufficient balance
    SELECT balance INTO v_balance
    FROM wallets
    WHERE user_id = p_user_id;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    -- Update wallet balance
    UPDATE wallets
    SET 
        balance = balance - p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Record the transaction
    INSERT INTO wallet_transactions (user_id, type, amount, description)
    VALUES (p_user_id, 'withdrawal', p_amount, p_description);

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- Create function to make a payment
CREATE OR REPLACE FUNCTION make_payment(
    p_user_id UUID,
    p_amount DECIMAL,
    p_description TEXT DEFAULT 'Payment'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance DECIMAL;
BEGIN
    -- Validate inputs
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;

    -- Check if user has a wallet and sufficient balance
    SELECT balance INTO v_balance
    FROM wallets
    WHERE user_id = p_user_id;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    -- Update wallet balance
    UPDATE wallets
    SET 
        balance = balance - p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Record the transaction
    INSERT INTO wallet_transactions (user_id, type, amount, description)
    VALUES (p_user_id, 'payment', p_amount, p_description);

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION make_deposit TO authenticated;
GRANT EXECUTE ON FUNCTION make_withdrawal TO authenticated;
GRANT EXECUTE ON FUNCTION make_payment TO authenticated; 