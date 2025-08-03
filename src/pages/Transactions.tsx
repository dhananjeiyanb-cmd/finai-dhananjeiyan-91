import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, X } from "lucide-react";
import { useBudget } from "@/contexts/BudgetContext";
import { useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

const dummyTransactions = [
  {
    id: 1,
    date: "2025-01-28",
    description: "Grocery Shopping - BigBazaar",
    amount: -1245,
    category: "Food",
    mode: "UPI",
    status: "completed"
  },
  {
    id: 2,
    date: "2025-01-27",
    description: "Salary Credit",
    amount: 45000,
    category: "Income",
    mode: "Bank Transfer",
    status: "completed"
  },
  {
    id: 3,
    date: "2025-01-27",
    description: "Uber Ride",
    amount: -320,
    category: "Travel",
    mode: "UPI",
    status: "completed"
  },
  {
    id: 4,
    date: "2025-01-26",
    description: "Netflix Subscription",
    amount: -649,
    category: "Entertainment",
    mode: "Card",
    status: "completed"
  },
  {
    id: 5,
    date: "2025-01-26",
    description: "Online Shopping - Amazon",
    amount: -2799,
    category: "Shopping",
    mode: "Card",
    status: "completed"
  },
  {
    id: 6,
    date: "2025-01-25",
    description: "Electricity Bill",
    amount: -1200,
    category: "Bills",
    mode: "UPI",
    status: "completed"
  },
  {
    id: 7,
    date: "2025-01-24",
    description: "Restaurant - Pizza Hut",
    amount: -890,
    category: "Food",
    mode: "Card",
    status: "completed"
  },
  {
    id: 8,
    date: "2025-01-24",
    description: "Petrol - HP Station",
    amount: -1500,
    category: "Travel",
    mode: "UPI",
    status: "completed"
  }
];

const categories = ["All", "Income", "Food", "Travel", "Shopping", "Bills", "Entertainment"];
const modes = ["All", "UPI", "Card", "Bank Transfer"];

const Transactions = () => {
  const { transactions, getTotalIncome, getTotalSpent } = useBudget();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [savingsGoalFilter, setSavingsGoalFilter] = useState<string | null>(null);
  const [savingsGoalTitle, setSavingsGoalTitle] = useState<string>("");

  // Check if navigated from savings goal view history
  useEffect(() => {
    if (location.state?.filterBySavingsGoal) {
      setSavingsGoalFilter(location.state.filterBySavingsGoal);
      setSavingsGoalTitle(location.state.savingsGoalTitle || "");
    }
  }, [location.state]);

  // Combine context transactions with dummy data if needed
  const allTransactions = transactions.length > 0 ? transactions : dummyTransactions;

  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || transaction.category === selectedCategory;
    const matchesMode = selectedMode === "All" || transaction.mode === selectedMode;
    
    return matchesSearch && matchesCategory && matchesMode;
  });

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Income: "text-income bg-success-light",
      Food: "text-budget-warning bg-warning-light",
      Travel: "text-savings bg-accent",
      Shopping: "text-expense bg-destructive/10",
      Bills: "text-muted-foreground bg-muted",
      Entertainment: "text-accent-vivid bg-accent"
    };
    return colors[category] || "text-muted-foreground bg-muted";
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "UPI":
        return "💳";
      case "Card":
        return "💳";
      case "Bank Transfer":
        return "🏦";
      default:
        return "💰";
    }
  };

  const exportTransactions = () => {
    const headers = ["Date", "Description", "Category", "Mode", "Amount", "Type"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(transaction => [
        transaction.date,
        `"${transaction.description}"`,
        transaction.category,
        transaction.mode,
        Math.abs(transaction.amount),
        transaction.amount > 0 ? "Credit" : "Debit"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground">Track and manage all your financial transactions</p>
          </div>
          <Button onClick={exportTransactions} className="gradient-primary shadow-glow">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Savings Goal Filter Alert */}
        {savingsGoalFilter && (
          <Alert className="border-savings bg-savings/10">
            <AlertDescription className="flex items-center justify-between">
              <span className="text-savings">
                Showing transactions related to savings goal: <strong>{savingsGoalTitle}</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSavingsGoalFilter(null);
                  setSavingsGoalTitle("");
                }}
                className="h-auto p-1 text-savings hover:text-savings/80"
              >
                <X className="w-4 h-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  {modes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-income">₹{getTotalIncome().toLocaleString()}</div>
              <div className="flex items-center text-xs text-income">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                This month
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">₹{getTotalSpent().toLocaleString()}</div>
              <div className="flex items-center text-xs text-expense">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                This month
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Net Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-savings">₹{(getTotalIncome() - getTotalSpent()).toLocaleString()}</div>
              <div className="flex items-center text-xs text-savings">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                This month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl">
                      {getModeIcon(transaction.mode)}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{transaction.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-muted-foreground">{transaction.date}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(transaction.category)}`}>
                          {transaction.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{transaction.mode}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      transaction.amount > 0 ? 'text-income' : 'text-expense'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.amount > 0 ? 'Credit' : 'Debit'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions found matching your filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Transactions;