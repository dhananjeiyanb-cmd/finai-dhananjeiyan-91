import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { Plus, Target, AlertTriangle, CheckCircle, TrendingDown, Wallet, Info, Calculator } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBudget } from "@/contexts/BudgetContext";

const Budget = () => {
  const { 
    budgets, 
    income, 
    addIncome, 
    addBudget, 
    getTotalBudget, 
    getTotalSpent, 
    getTotalIncome,
    getCurrentBalance 
  } = useBudget();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isBudgetInfoDialogOpen, setIsBudgetInfoDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [newBudget, setNewBudget] = useState({
    name: "",
    budget: "",
    icon: "💰"
  });
  const [newIncome, setNewIncome] = useState({
    name: "Salary",
    amount: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [budgetInfo, setBudgetInfo] = useState({
    category: "",
    amount: ""
  });

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return { status: "exceeded", color: "budget-danger", icon: AlertTriangle };
    if (percentage >= 80) return { status: "warning", color: "budget-warning", icon: AlertTriangle };
    return { status: "good", color: "budget-good", icon: CheckCircle };
  };

  const totalBudget = getTotalBudget();
  const totalSpent = getTotalSpent();
  const remainingBudget = getCurrentBalance();

  const handleAddBudget = () => {
    if (newBudget.name && newBudget.budget) {
      addBudget({
        name: newBudget.name,
        budget: parseInt(newBudget.budget),
        color: "hsl(var(--primary))",
        icon: newBudget.icon
      });
      setNewBudget({ name: "", budget: "", icon: "💰" });
      setIsDialogOpen(false);
    }
  };

  const handleAddIncome = () => {
    if (newIncome.name && newIncome.amount) {
      addIncome({
        name: newIncome.name,
        amount: parseInt(newIncome.amount),
        date: newIncome.date
      });
      setNewIncome({ name: "Salary", amount: "", date: new Date().toISOString().split('T')[0] });
      setIsIncomeDialogOpen(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budget Management</h1>
            <p className="text-muted-foreground">Set and track your monthly spending limits</p>
          </div>
          
          <div className="flex gap-3">
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-income text-income hover:bg-income/10">
                  <Wallet className="w-4 h-4 mr-2" />
                  Add Income
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Income Source</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="income-source">Income Source</Label>
                    <Select value={newIncome.name} onValueChange={(value) => setNewIncome({ ...newIncome, name: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Salary">Salary</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="income-amount">Amount (₹)</Label>
                    <Input
                      id="income-amount"
                      type="number"
                      placeholder="45000"
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="income-date">Date</Label>
                    <Input
                      id="income-date"
                      type="date"
                      value={newIncome.date}
                      onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddIncome} className="w-full gradient-primary">
                    Add Income Source
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isBudgetInfoDialogOpen} onOpenChange={setIsBudgetInfoDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                  <Info className="w-4 h-4 mr-2" />
                  Budget Info
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Budget Information</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-sm text-muted-foreground">
                      <Info className="w-4 h-4 inline mr-1" />
                      This is for informational purposes only and won't be added to your total budget.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="info-category">Category</Label>
                    <Select value={budgetInfo.category} onValueChange={(value) => setBudgetInfo({ ...budgetInfo, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgets.map(budget => (
                          <SelectItem key={budget.id} value={budget.name}>{budget.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="info-amount">Amount (₹)</Label>
                    <Input
                      id="info-amount"
                      type="number"
                      placeholder="5000"
                      value={budgetInfo.amount}
                      onChange={(e) => setBudgetInfo({ ...budgetInfo, amount: e.target.value })}
                    />
                  </div>
                  <Button onClick={() => setIsBudgetInfoDialogOpen(false)} className="w-full gradient-primary">
                    Save Information
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary shadow-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Budget
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Budget Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    placeholder="e.g., Groceries"
                    value={newBudget.name}
                    onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="budget-amount">Monthly Budget (₹)</Label>
                  <Input
                    id="budget-amount"
                    type="number"
                    placeholder="5000"
                    value={newBudget.budget}
                    onChange={(e) => setNewBudget({ ...newBudget, budget: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category-icon">Icon</Label>
                  <Select value={newBudget.icon} onValueChange={(value) => setNewBudget({ ...newBudget, icon: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="💰">💰 Money</SelectItem>
                      <SelectItem value="🍽️">🍽️ Food</SelectItem>
                      <SelectItem value="🚗">🚗 Transport</SelectItem>
                      <SelectItem value="🛍️">🛍️ Shopping</SelectItem>
                      <SelectItem value="🎬">🎬 Entertainment</SelectItem>
                      <SelectItem value="🏥">🏥 Healthcare</SelectItem>
                      <SelectItem value="📚">📚 Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddBudget} className="w-full gradient-primary">
                  Add Budget Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Budget Overview</TabsTrigger>
            <TabsTrigger value="info">Budget Information</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">

        {/* Income Sources */}
        {income.length > 0 && (
          <Card className="gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-income" />
                Income Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {income.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-3 rounded-lg bg-income/10 border border-income/20">
                    <div>
                      <p className="font-medium text-card-foreground">{source.name}</p>
                      <p className="text-sm text-muted-foreground">{new Date(source.date).toLocaleDateString()}</p>
                    </div>
                    <p className="font-bold text-income">₹{source.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-income/5 border border-income/10">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-card-foreground">Total Income</span>
                  <span className="text-xl font-bold text-income">₹{getTotalIncome().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">₹{totalBudget.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Monthly allocation</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">₹{totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget used
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-income' : 'text-expense'}`}>
                ₹{Math.abs(remainingBudget).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {remainingBudget >= 0 ? 'Left to spend' : 'Over budget'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((category) => {
            const percentage = (category.spent / category.budget) * 100;
            const status = getBudgetStatus(category.spent, category.budget);
            const StatusIcon = status.icon;

            return (
              <Card key={category.id} className="gradient-card shadow-card border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div>
                        <CardTitle className="text-lg text-card-foreground">{category.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          ₹{category.spent.toLocaleString()} / ₹{category.budget.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <StatusIcon className={`w-5 h-5 text-${status.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={Math.min(percentage, 100)} className="h-3" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}% used
                    </span>
                    <span className={`text-sm font-medium ${
                      percentage >= 100 ? 'text-budget-danger' : 
                      percentage >= 80 ? 'text-budget-warning' : 'text-budget-good'
                    }`}>
                      {percentage >= 100 && (
                        <div className="flex items-center">
                          <TrendingDown className="w-4 h-4 mr-1" />
                          Over by ₹{(category.spent - category.budget).toLocaleString()}
                        </div>
                      )}
                      {percentage < 100 && (
                        <div>₹{(category.budget - category.spent).toLocaleString()} remaining</div>
                      )}
                    </span>
                  </div>

                  {/* Status Message */}
                  <div className={`p-3 rounded-lg text-sm ${
                    status.status === 'exceeded' ? 'bg-destructive/10 text-destructive' :
                    status.status === 'warning' ? 'bg-warning-light text-warning' :
                    'bg-success-light text-success'
                  }`}>
                    {status.status === 'exceeded' && '⚠️ Budget exceeded! Consider reducing spending in this category.'}
                    {status.status === 'warning' && '🔔 You\'re approaching your budget limit. Monitor spending carefully.'}
                    {status.status === 'good' && '✅ Great job! You\'re staying within your budget.'}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Budget Tips */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Target className="w-5 h-5 mr-2 text-accent-vivid" />
              Budget Tips & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">Smart Budgeting Tips</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
                  <li>• Review and adjust budgets monthly based on spending patterns</li>
                  <li>• Set up automatic alerts when you reach 80% of any budget</li>
                  <li>• Use the envelope method for variable expenses</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">AI Recommendations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Consider reducing dining out budget by ₹1,000</li>
                  <li>• Your transportation spending is optimal for your income</li>
                  <li>• Increase healthcare budget by ₹500 for better coverage</li>
                  <li>• Entertainment spending is well balanced</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <Card className="gradient-card shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-accent-vivid" />
                  Budget Information Display
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  View category amounts for informational purposes only
                </p>
              </CardHeader>
              <CardContent>
                {budgetInfo.category && budgetInfo.amount ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-card-foreground">{budgetInfo.category}</h3>
                          <p className="text-sm text-muted-foreground">Information only - not counted in total budget</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-accent">₹{parseInt(budgetInfo.amount || "0").toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Display amount</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Actual Budget</p>
                        <p className="text-lg font-bold text-card-foreground">
                          ₹{budgets.find(b => b.name === budgetInfo.category)?.budget.toLocaleString() || "0"}
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Current Spent</p>
                        <p className="text-lg font-bold text-expense">
                          ₹{budgets.find(b => b.name === budgetInfo.category)?.spent.toLocaleString() || "0"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No budget information set yet.</p>
                    <p className="text-sm text-muted-foreground">Use the "Budget Info" button to add informational amounts.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Budget;