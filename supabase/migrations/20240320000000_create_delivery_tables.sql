-- Create delivery_stages table
CREATE TABLE IF NOT EXISTS delivery_stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_status_history table
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL REFERENCES delivery_stages(code),
    notes TEXT,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create delivery_routes table
CREATE TABLE IF NOT EXISTS delivery_routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    pickup_lat DOUBLE PRECISION,
    pickup_lng DOUBLE PRECISION,
    delivery_lat DOUBLE PRECISION,
    delivery_lng DOUBLE PRECISION,
    status TEXT NOT NULL REFERENCES delivery_stages(code),
    scheduled_time TIMESTAMPTZ NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default delivery stages
INSERT INTO delivery_stages (code, name, description, display_order) VALUES
    ('pending', 'Order Placed', 'Order has been placed and is pending confirmation', 10),
    ('confirmed', 'Order Confirmed', 'Order has been confirmed by the seller', 20),
    ('preparing', 'Preparing for Pickup', 'Seller is preparing the item for pickup', 30),
    ('pickup_scheduled', 'Pickup Scheduled', 'A pickup time has been scheduled with the seller', 40),
    ('picked_up', 'Picked Up', 'Item has been picked up from the seller', 50),
    ('in_transit', 'In Transit', 'Item is in transit to the buyer', 60),
    ('out_for_delivery', 'Out for Delivery', 'Item is out for delivery to the buyer', 70),
    ('delivered', 'Delivered', 'Item has been delivered to the buyer', 80),
    ('completed', 'Order Completed', 'Order has been completed and payment released', 90),
    ('cancelled', 'Cancelled', 'Order has been cancelled', 100),
    ('returned', 'Returned', 'Item has been returned to the seller', 110)
ON CONFLICT (code) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_delivery_stages_updated_at
    BEFORE UPDATE ON delivery_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_status_history_updated_at
    BEFORE UPDATE ON order_status_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_routes_updated_at
    BEFORE UPDATE ON delivery_routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 