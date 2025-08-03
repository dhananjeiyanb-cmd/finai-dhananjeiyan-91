-- Create reminders table for bills and recurring payments
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'once', -- once, monthly, yearly
  category TEXT NOT NULL DEFAULT 'utilities',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue
  auto_pay BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own reminders" 
ON public.reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
ON public.reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
ON public.reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
ON public.reminders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reminders_updated_at
BEFORE UPDATE ON public.reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on due dates
CREATE INDEX idx_reminders_due_date ON public.reminders(due_date);
CREATE INDEX idx_reminders_user_tenant ON public.reminders(user_id, tenant_id);