-- Recurring Deposits Table
CREATE TABLE IF NOT EXISTS recurring_deposits (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    next_deposit_date TIMESTAMPTZ NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_wallet FOREIGN KEY (user_id) REFERENCES wallets(user_id)
);

-- Add RLS policies
ALTER TABLE recurring_deposits ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own recurring deposits
CREATE POLICY "Users can view their own recurring deposits" ON recurring_deposits
    FOR SELECT USING (auth.uid() = user_id);

-- Only allow users to insert their own recurring deposits
CREATE POLICY "Users can insert their own recurring deposits" ON recurring_deposits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only allow users to update their own recurring deposits
CREATE POLICY "Users can update their own recurring deposits" ON recurring_deposits
    FOR UPDATE USING (auth.uid() = user_id);

-- Only allow users to delete their own recurring deposits
CREATE POLICY "Users can delete their own recurring deposits" ON recurring_deposits
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to process recurring deposits
CREATE OR REPLACE FUNCTION process_recurring_deposits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER := 0;
    v_rec RECORD;
BEGIN
    -- Find all active recurring deposits that are due
    FOR v_rec IN 
        SELECT * FROM recurring_deposits 
        WHERE is_active = TRUE AND next_deposit_date <= NOW()
    LOOP
        -- Make the deposit
        PERFORM make_deposit(v_rec.user_id, v_rec.amount, 'Recurring deposit: ' || v_rec.description);
        
        -- Update the next deposit date
        UPDATE recurring_deposits
        SET 
            next_deposit_date = CASE 
                WHEN v_rec.frequency = 'daily' THEN next_deposit_date + INTERVAL '1 day'
                WHEN v_rec.frequency = 'weekly' THEN next_deposit_date + INTERVAL '1 week'
                WHEN v_rec.frequency = 'monthly' THEN next_deposit_date + INTERVAL '1 month'
                ELSE next_deposit_date
            END,
            updated_at = NOW()
        WHERE id = v_rec.id;
        
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$;

-- Create a cron job to process recurring deposits daily
-- Note: This requires pg_cron extension to be enabled
-- COMMENT OUT if pg_cron is not available
-- SELECT cron.schedule('0 0 * * *', $$SELECT process_recurring_deposits()$$);

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION process_recurring_deposits TO authenticated;