-- Add missing columns to savings_goals table for full functionality
ALTER TABLE savings_goals 
ADD COLUMN IF NOT EXISTS auto_debit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS monthly_contribution NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '🎯',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_tenant ON savings_goals(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_status ON savings_goals(status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_savings_goals_updated_at
BEFORE UPDATE ON savings_goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();