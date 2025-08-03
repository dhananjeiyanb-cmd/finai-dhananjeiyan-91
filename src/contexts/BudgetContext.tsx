import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface BudgetCategory {
  id: number;
  name: string;
  budget: number;
  spent: number;
  color: string;
  icon: string;
}

export interface IncomeSource {
  id: number;
  name: string;
  amount: number;
  date: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  mode: string;
  status: string;
}

interface BudgetContextType {
  budgets: BudgetCategory[];
  income: IncomeSource[];
  transactions: Transaction[];
  setBudgets: (budgets: BudgetCategory[]) => void;
  addIncome: (income: Omit<IncomeSource, 'id'>) => void;
  addBudget: (budget: Omit<BudgetCategory, 'id' | 'spent'>) => void;
  processPayment: (payment: { amount: number; description: string; category: string; merchant: string }) => void;
  refreshTransactions: () => Promise<void>;
  getTotalBudget: () => number;
  getTotalSpent: () => number;
  getTotalIncome: () => number;
  getCurrentBalance: () => number;
  getBudgetUsagePercentage: () => number;
  getSavingsPercentage: () => number;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [income, setIncome] = useState<IncomeSource[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const { user } = useAuth();

  // Load tenant ID and data when user changes
  useEffect(() => {
    if (user) {
      loadTenantIdAndData();
    } else {
      // Clear data when user logs out
      setBudgets([]);
      setIncome([]);
      setTransactions([]);
      setTenantId(null);
    }
  }, [user]);

  const loadTenantIdAndData = async () => {
    if (!user) return;

    try {
      // Get tenant ID from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (profile?.tenant_id) {
        setTenantId(profile.tenant_id);
        await loadData(profile.tenant_id);
      }
    } catch (error) {
      console.error('Error loading tenant ID and data:', error);
    }
  };

  const loadData = async (currentTenantId: string) => {
    if (!user) return;

    try {
      // Load budgets
      const { data: budgetData } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', currentTenantId)
        .order('created_at', { ascending: false });

      // Load income
      const { data: incomeData } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', currentTenantId)
        .order('created_at', { ascending: false });

      // Load transactions
      const { data: transactionData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', currentTenantId)
        .order('created_at', { ascending: false });

      if (budgetData) setBudgets(budgetData);
      if (incomeData) setIncome(incomeData);
      if (transactionData) setTransactions(transactionData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addIncome = async (newIncome: Omit<IncomeSource, 'id'>) => {
    if (!user || !tenantId) {
      toast.error('User not authenticated or tenant ID not found');
      return;
    }

    try {
      // Save to Supabase
      const { data: incomeData } = await supabase
        .from('income_sources')
        .insert([{ 
          ...newIncome, 
          user_id: user.id,
          tenant_id: tenantId 
        }])
        .select()
        .single();

      if (incomeData) {
        setIncome([incomeData, ...income]);
      }

      // Add transaction entry
      const { data: transactionData } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          tenant_id: tenantId,
          date: newIncome.date,
          description: `${newIncome.name} Credit`,
          amount: newIncome.amount,
          category: "Income",
          mode: "Bank Transfer",
          status: "completed"
        }])
        .select()
        .single();

      if (transactionData) {
        setTransactions([transactionData, ...transactions]);
      }

      toast.success('Income added successfully!');
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error('Failed to add income');
    }
  };

  const addBudget = async (newBudget: Omit<BudgetCategory, 'id' | 'spent'>) => {
    if (!user || !tenantId) {
      toast.error('User not authenticated or tenant ID not found');
      return;
    }

    try {
      const { data } = await supabase
        .from('budget_categories')
        .insert([{ 
          ...newBudget, 
          user_id: user.id, 
          tenant_id: tenantId,
          spent: 0 
        }])
        .select()
        .single();

      if (data) {
        setBudgets([...budgets, data]);
        toast.success('Budget category added successfully!');
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      toast.error('Failed to add budget category');
    }
  };

  const processPayment = async (payment: { amount: number; description: string; category: string; merchant: string }) => {
    if (!user || !tenantId) {
      toast.error('User not authenticated or tenant ID not found');
      return;
    }

    try {
      // Add transaction for the payment
      const { data: transactionData } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          tenant_id: tenantId,
          date: new Date().toISOString().split('T')[0],
          description: `${payment.merchant} - ${payment.description}`,
          amount: -payment.amount,
          category: payment.category,
          mode: "UPI",
          status: "completed"
        }])
        .select()
        .single();

      if (transactionData) {
        setTransactions([transactionData, ...transactions]);
      }

      // Update budget spent amount for the category
      const budgetToUpdate = budgets.find(b => b.name === payment.category);
      if (budgetToUpdate) {
        const { data: updatedBudget } = await supabase
          .from('budget_categories')
          .update({ spent: budgetToUpdate.spent + payment.amount })
          .eq('id', budgetToUpdate.id)
          .eq('user_id', user.id)
          .eq('tenant_id', tenantId)
          .select()
          .single();

        if (updatedBudget) {
          const updatedBudgets = budgets.map(budget => 
            budget.id === updatedBudget.id ? updatedBudget : budget
          );
          setBudgets(updatedBudgets);
        }
      }

      toast.success('Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };

  const getTotalBudget = () => {
    return budgets.reduce((sum, category) => sum + category.budget, 0);
  };

  const getTotalSpent = () => {
    // Calculate total spent from all negative transactions (expenses)
    return transactions
      .filter(transaction => transaction.amount < 0)
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  };

  const getTotalIncome = () => {
    // Calculate total income from all positive transactions
    return transactions
      .filter(transaction => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const getCurrentBalance = () => {
    return getTotalIncome() - getTotalSpent();
  };

  const getBudgetUsagePercentage = () => {
    const totalBudget = getTotalBudget();
    const totalSpent = getTotalSpent();
    return totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  };

  const getSavingsPercentage = () => {
    const totalIncome = getTotalIncome();
    const totalSpent = getTotalSpent();
    const savings = totalIncome - totalSpent;
    return totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;
  };

  const refreshTransactions = async () => {
    if (!user || !tenantId) return;

    try {
      const { data: transactionData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (transactionData) {
        setTransactions(transactionData);
      }
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    }
  };

  const value: BudgetContextType = {
    budgets,
    income,
    transactions,
    setBudgets,
    addIncome,
    addBudget,
    processPayment,
    refreshTransactions,
    getTotalBudget,
    getTotalSpent,
    getTotalIncome,
    getCurrentBalance,
    getBudgetUsagePercentage,
    getSavingsPercentage
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
