
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/Layout";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Target,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Bot
} from "lucide-react";
import { useBudget } from "@/contexts/BudgetContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { getCurrentBalance, getTotalSpent, getBudgetUsagePercentage, getSavingsPercentage } = useBudget();
  const { toast } = useToast();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hi! I'm FinPilot, your AI financial assistant. I can help you analyze your spending by category and time period. Try asking: 'What did I spend on food last month?' or 'Analyze my transportation expenses from January 1st to January 31st, 2025'."
    }
  ]);
  
  const currentBalance = getCurrentBalance();
  const monthlySpent = getTotalSpent();
  const budgetUsed = getBudgetUsagePercentage();
  const savingsProgress = getSavingsPercentage();

  // Fetch upcoming bills
  const fetchUpcomingBills = async () => {
    if (!user) return;
    
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .order('due_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      setUpcomingBills(data || []);
    } catch (error) {
      console.error('Error fetching upcoming bills:', error);
    }
  };

  useEffect(() => {
    fetchUpcomingBills();
  }, [user]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = message;
    setMessage("");
    setIsLoading(true);
    
    // Add user message immediately
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use the AI financial assistant.",
          variant: "destructive",
        });
        return;
      }

      // Call the AI financial assistant edge function
      const { data, error } = await supabase.functions.invoke('ai-financial-assistant', {
        body: {
          message: userMessage,
          user_id: user.id
        }
      });

      if (error) {
        throw error;
      }

      // Add AI response
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: data.message || "I apologize, but I couldn't process your request at the moment. Please try again." 
      }]);

    } catch (error) {
      console.error('Error calling AI assistant:', error);
      
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: "I'm having trouble connecting to my AI services right now. Please check that you're signed in and try again in a moment." 
      }]);
      
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Last updated</p>
            <p className="text-sm font-medium">2 minutes ago</p>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Current Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-income" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">₹{currentBalance.toLocaleString()}</div>
              <div className="flex items-center text-xs text-income">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12.5% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Monthly Spent</CardTitle>
              <CreditCard className="h-4 w-4 text-expense" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">₹{monthlySpent.toLocaleString()}</div>
              <div className="flex items-center text-xs text-expense">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                +8.2% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Budget Used</CardTitle>
              <Target className="h-4 w-4 text-budget-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{budgetUsed}%</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-budget-warning rounded-full h-2 transition-all duration-300" 
                  style={{ width: `${budgetUsed}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Savings Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-savings" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{savingsProgress}%</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-savings rounded-full h-2 transition-all duration-300" 
                  style={{ width: `${savingsProgress}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FinPilot AI Assistant */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Bot className="w-6 h-6 mr-2 text-primary" />
              FinPilot – AI Financial Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                    {msg.type === 'bot' && (
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl ${
                      msg.type === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-br-sm' 
                        : 'bg-card text-card-foreground rounded-bl-sm shadow-card'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Section */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your finances, investments, or expenses…"
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="gradient-primary shadow-glow"
                  size="icon"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Try: "Analyze my food expenses from 2025-01-01 to 2025-01-31" or "What did I spend on transportation last week?"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Alerts */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Bell className="w-5 h-5 mr-2 text-budget-warning" />
              Upcoming Bills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBills.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No upcoming bills in the next 30 days</p>
              </div>
            ) : (
              upcomingBills.map((bill) => {
                const today = new Date();
                const due = new Date(bill.due_date);
                const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                const getBgColor = () => {
                  if (daysUntilDue <= 3) return 'bg-warning-light';
                  return 'bg-muted';
                };
                
                const getTextColor = () => {
                  if (daysUntilDue <= 3) return 'text-warning';
                  return 'text-card-foreground';
                };
                
                const getDueDateText = () => {
                  if (daysUntilDue === 0) return 'Due today';
                  if (daysUntilDue === 1) return 'Due tomorrow';
                  return `Due in ${daysUntilDue} days`;
                };

                return (
                  <div key={bill.id} className={`flex items-center justify-between p-3 rounded-lg ${getBgColor()}`}>
                    <div>
                      <p className="font-medium text-card-foreground">{bill.title}</p>
                      <p className="text-sm text-muted-foreground">{getDueDateText()}</p>
                    </div>
                    <p className={`font-bold ${getTextColor()}`}>₹{bill.amount.toLocaleString()}</p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
