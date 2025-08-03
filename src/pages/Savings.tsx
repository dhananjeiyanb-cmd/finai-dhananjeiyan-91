import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { Plus, Target, Calendar, TrendingUp, Star, Gift, Trash2, Eye, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBudget } from "@/contexts/BudgetContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  auto_debit: boolean;
  monthly_contribution: number;
  icon: string;
  priority: string;
  status: string;
}

const motivationalQuotes = [
  "Small savings lead to big achievements! 💪",
  "Every rupee saved is a step towards your dreams! ✨",
  "Consistency in saving creates financial freedom! 🎯",
  "Your future self will thank you for saving today! 🙏",
  "Dreams become plans when you save for them! 🌟"
];

// Add Money Dialog Component
const AddMoneyDialog = ({ goalId, goalTitle, onAddMoney }: { goalId: string; goalTitle: string; onAddMoney: (goalId: string, amount: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (parsedAmount > 0) {
      onAddMoney(goalId, parsedAmount);
      setAmount("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gradient-primary" size="sm">
          <Gift className="w-4 h-4 mr-2" />
          Add Money to Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Money to {goalTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="add-amount">Amount to Add (₹)</Label>
            <Input
              id="add-amount"
              type="number"
              placeholder="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex space-x-4">
            <Button onClick={handleSave} className="gradient-primary flex-1">
              Add Money
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Transaction History Dialog Component
const TransactionHistoryDialog = ({ 
  goalId, 
  goalTitle, 
  isOpen, 
  onClose 
}: { 
  goalId: string; 
  goalTitle: string; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGoalTransactions = async () => {
    if (!user || !goalId) return;
    
    setLoading(true);
    try {
      // Fetch transactions related to this savings goal
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'Savings')
        .ilike('description', `%${goalTitle}%`)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching goal transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && goalId) {
      fetchGoalTransactions();
    }
  }, [isOpen, goalId, user]);

  const totalContributions = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2 text-accent-vivid" />
            Transaction History - {goalTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Summary */}
          <Card className="gradient-card border-0">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-savings">₹{totalContributions.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Contributions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent-vivid">{transactions.length}</div>
                  <div className="text-xs text-muted-foreground">Total Transactions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading transaction history...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No transactions found for this savings goal yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Transactions will appear here when you add money to this goal.
                </p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-savings/20 flex items-center justify-center">
                          <Gift className="w-5 h-5 text-savings" />
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{transaction.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-savings/10 text-savings">
                              {transaction.mode}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg text-savings">
                          +₹{Math.abs(transaction.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Contribution</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Savings = () => {
  const { user } = useAuth();
  const { refreshTransactions } = useBudget(); // Get refresh function from budget context
  const navigate = useNavigate();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [selectedGoalTitle, setSelectedGoalTitle] = useState<string>("");
  const [newGoal, setNewGoal] = useState({
    title: "",
    target_amount: "",
    target_date: "",
    monthly_contribution: "",
    icon: "🎯",
    type: "General",
    accountDetails: "",
    policyNumber: "",
    premiumAmount: "",
    maturityDate: "",
    dueDate: ""
  });
  const [currentQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  // Calculate totals from database goals

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalSavedAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalMonthlyContribution = goals.filter(g => g.auto_debit).reduce((sum, goal) => sum + goal.monthly_contribution, 0);

  // Fetch savings goals from database
  const fetchGoals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-budget-danger bg-destructive/10';
      case 'medium': return 'text-budget-warning bg-warning-light';
      case 'low': return 'text-budget-good bg-success-light';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const today = new Date();
    const target = new Date(deadline);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 30) return `${diffDays} days left`;
    
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month left' : `${months} months left`;
  };

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.target_amount || !user) return;
    
    try {
      // Get user profile to get tenant_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const goalData = {
        title: newGoal.title,
        target_amount: parseFloat(newGoal.target_amount),
        target_date: newGoal.target_date || null,
        monthly_contribution: parseFloat(newGoal.monthly_contribution) || 0,
        icon: newGoal.icon,
        priority: 'medium',
        status: 'active',
        current_amount: 0,
        auto_debit: false,
        user_id: user.id,
        tenant_id: profile.tenant_id
      };

      const { data, error } = await supabase
        .from('savings_goals')
        .insert([goalData])
        .select()
        .single();

      if (error) throw error;

      setGoals([data, ...goals]);
      setNewGoal({ title: "", target_amount: "", target_date: "", monthly_contribution: "", icon: "🎯", type: "General", accountDetails: "", policyNumber: "", premiumAmount: "", maturityDate: "", dueDate: "" });
      setIsDialogOpen(false);
      toast.success('Savings goal created successfully!');
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create savings goal');
    }
  };

  const toggleAutoDebit = async (goalId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const { error } = await supabase
        .from('savings_goals')
        .update({ auto_debit: !goal.auto_debit })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, auto_debit: !goal.auto_debit }
          : goal
      ));
      
      toast.success(`Auto-debit ${!goal.auto_debit ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating auto-debit:', error);
      toast.error('Failed to update auto-debit setting');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.filter(goal => goal.id !== goalId));
      toast.success('Savings goal deleted successfully');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete savings goal');
    }
  };

  const handleAddMoney = async (goalId: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal || !user) return;

      // Get user profile to get tenant_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const newCurrentAmount = goal.current_amount + amount;

      // Update the savings goal amount
      const { error: goalError } = await supabase
        .from('savings_goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', goalId);

      if (goalError) throw goalError;

      // Create a transaction record for this savings contribution
      const transactionData = {
        user_id: user.id,
        tenant_id: profile.tenant_id,
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        description: `Savings: ${goal.title}`,
        amount: -amount, // Negative because it's money going out (into savings)
        category: 'Savings',
        mode: 'Savings Transfer',
        status: 'completed'
      };

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([transactionData]);

      if (transactionError) {
        console.error('Transaction creation error:', transactionError);
        // Don't fail the savings addition if transaction creation fails
      }

      setGoals(goals.map(g => 
        g.id === goalId 
          ? { ...g, current_amount: newCurrentAmount }
          : g
      ));
      
      // Refresh transactions in budget context so they show up on Transactions page
      await refreshTransactions();
      
      toast.success(`₹${amount.toLocaleString()} added to ${goal.title}!`);
    } catch (error) {
      console.error('Error adding money to goal:', error);
      toast.error('Failed to add money to goal');
    }
  };

  const handleViewHistory = (goalId: string, goalTitle: string) => {
    setSelectedGoalId(goalId);
    setSelectedGoalTitle(goalTitle);
    setHistoryDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Savings Goals</h1>
            <p className="text-muted-foreground">Track your progress towards financial milestones</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-foreground">Create New Savings Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal-type">Goal Type</Label>
                  <select
                    id="goal-type"
                    className="w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                  >
                    <option value="General">General Savings</option>
                    <option value="LIC">LIC Insurance</option>
                    <option value="Car">Car</option>
                    <option value="Home">Home</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health Insurance</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="goal-name">Goal Name</Label>
                  <Input
                    id="goal-name"
                    placeholder="e.g., Buy a Car"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="target-amount">Target Amount (₹)</Label>
                  <Input
                    id="target-amount"
                    type="number"
                    placeholder="50000"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  />
                </div>

                {/* Conditional fields based on goal type */}
                {(newGoal.type === "LIC" || newGoal.type === "Health") && (
                  <>
                    <div>
                      <Label htmlFor="account-details">Account Details</Label>
                      <Input
                        id="account-details"
                        placeholder="Account number or details"
                        value={newGoal.accountDetails}
                        onChange={(e) => setNewGoal({ ...newGoal, accountDetails: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="policy-number">Policy Number</Label>
                      <Input
                        id="policy-number"
                        placeholder="Policy number"
                        value={newGoal.policyNumber}
                        onChange={(e) => setNewGoal({ ...newGoal, policyNumber: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="premium-amount">Premium Amount (₹)</Label>
                      <Input
                        id="premium-amount"
                        type="number"
                        placeholder="Monthly/Annual premium"
                        value={newGoal.premiumAmount}
                        onChange={(e) => setNewGoal({ ...newGoal, premiumAmount: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="maturity-date">Maturity Date</Label>
                      <Input
                        id="maturity-date"
                        type="date"
                        value={newGoal.maturityDate}
                        onChange={(e) => setNewGoal({ ...newGoal, maturityDate: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="due-date">Premium Due Date</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={newGoal.dueDate}
                        onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {(newGoal.type === "Car" || newGoal.type === "Home") && (
                  <>
                    <div>
                      <Label htmlFor="account-details">Account Details</Label>
                      <Input
                        id="account-details"
                        placeholder="Loan account or registration details"
                        value={newGoal.accountDetails}
                        onChange={(e) => setNewGoal({ ...newGoal, accountDetails: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="due-date">EMI Due Date</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={newGoal.dueDate}
                        onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <Label htmlFor="deadline">Target Date</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="monthly-contribution">Monthly Contribution (₹)</Label>
                  <Input
                    id="monthly-contribution"
                    type="number"
                    placeholder="3000"
                    value={newGoal.monthly_contribution}
                    onChange={(e) => setNewGoal({ ...newGoal, monthly_contribution: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddGoal} className="w-full gradient-primary">
                  Create Savings Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Motivational Quote */}
        <Card className="gradient-purple shadow-glow border-0">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-accent-vivid mx-auto mb-3" />
            <p className="text-lg font-medium text-card-foreground">{currentQuote}</p>
          </CardContent>
        </Card>

        {/* Savings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">₹{totalTargetAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{goals.length} active goals</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Saved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-savings">₹{totalSavedAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((totalSavedAmount / totalTargetAmount) * 100).toFixed(1)}% of total target
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Monthly Auto-Debit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-vivid">₹{totalMonthlyContribution.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Automated savings</p>
            </CardContent>
          </Card>
        </div>

        {/* Savings Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Loading your savings goals...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No savings goals yet. Create your first goal to get started!</p>
            </div>
          ) : (
            goals.map((goal) => {
              const percentage = (goal.current_amount / goal.target_amount) * 100;
              const remainingAmount = goal.target_amount - goal.current_amount;
              const timeRemaining = goal.target_date ? getTimeRemaining(goal.target_date) : 'No deadline set';

              return (
                <Card key={goal.id} className="gradient-card shadow-card border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{goal.icon}</div>
                        <div>
                          <CardTitle className="text-lg text-card-foreground">{goal.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(goal.priority)}`}>
                              {goal.priority} priority
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {timeRemaining}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewHistory(goal.id, goal.title)}
                          className="text-muted-foreground hover:text-accent-vivid"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-destructive mr-2" />
                                Delete Savings Goal
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{goal.title}"? This action cannot be undone and all progress will be lost.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete Goal
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-card-foreground">
                          ₹{goal.current_amount.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-3" />
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{percentage.toFixed(1)}% completed</span>
                        <span className="text-muted-foreground">₹{remainingAmount.toLocaleString()} remaining</span>
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">Auto-debit monthly savings</span>
                        <Switch
                          checked={goal.auto_debit}
                          onCheckedChange={() => toggleAutoDebit(goal.id)}
                        />
                      </div>
                      {goal.auto_debit && (
                        <div className="text-xs text-muted-foreground">
                          ₹{goal.monthly_contribution.toLocaleString()} will be automatically saved each month
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="text-lg font-bold text-savings">
                          ₹{goal.monthly_contribution.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Monthly target</div>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="text-lg font-bold text-accent-vivid">
                          {goal.monthly_contribution > 0 ? Math.ceil(remainingAmount / goal.monthly_contribution) : '∞'}
                        </div>
                        <div className="text-xs text-muted-foreground">Months to go</div>
                      </div>
                    </div>

                    <AddMoneyDialog goalId={goal.id} goalTitle={goal.title} onAddMoney={handleAddMoney} />
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Savings Tips */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-savings" />
              Smart Savings Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">Automate Your Success</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Set up automatic transfers on salary day</li>
                  <li>• Use the 24-hour rule before making non-essential purchases</li>
                  <li>• Round up purchases and save the change</li>
                  <li>• Save windfalls and bonuses immediately</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">Goal Optimization</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Break large goals into smaller milestones</li>
                  <li>• Prioritize emergency funds over other goals</li>
                  <li>• Review and adjust goals quarterly</li>
                  <li>• Celebrate when you reach milestones</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History Dialog */}
        <TransactionHistoryDialog
          goalId={selectedGoalId}
          goalTitle={selectedGoalTitle}
          isOpen={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default Savings;