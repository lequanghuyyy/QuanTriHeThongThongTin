-- Add session_id column to cart_items table for guest cart support
ALTER TABLE cart_items 
ADD COLUMN session_id VARCHAR(255) NULL AFTER user_id;

-- Add index for faster session-based queries
CREATE INDEX idx_session_id ON cart_items(session_id);

-- Make user_id nullable to support guest carts
ALTER TABLE cart_items 
MODIFY COLUMN user_id BIGINT NULL;
