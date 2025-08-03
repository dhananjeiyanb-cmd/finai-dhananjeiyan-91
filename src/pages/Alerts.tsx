import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { Bell, AlertTriangle, DollarSign, Target, Calendar, Smartphone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const alertSettings = [
  {
    id: 'overspending',
    title: 'Overspending Alert',
    description: 'Get notified when you exceed your budget in any category',
    icon: AlertTriangle,
    color: 'text-budget-danger',
    enabled: true,
    frequency: 'instant'
  },
  {
    id: 'bills',
    title: 'Bill Due Alerts',
    description: 'Reminders for upcoming bill payments',
    icon: Calendar,
    color: 'text-budget-warning',
    enabled: true,
    frequency: 'daily'
  },
  {
    id: 'budget-limit',
    title: 'Budget Limit Reached',
    description: 'Alert when you reach 80% of your budget limit',
    icon: Target,
    color: 'text-accent-vivid',
    enabled: true,
    frequency: 'instant'
  },
  {
    id: 'goal-deadline',
    title: 'Goal Deadline Alert',
    description: 'Notifications about approaching savings goal deadlines',
    icon: DollarSign,
    color: 'text-savings',
    enabled: false,
    frequency: 'weekly'
  },
  {
    id: 'large-expense',
    title: 'Large Expense Alert',
    description: 'Get notified for transactions above ₹5,000',
    icon: AlertTriangle,
    color: 'text-expense',
    enabled: true,
    frequency: 'instant'
  },
  {
    id: 'savings-milestone',
    title: 'Savings Milestone',
    description: 'Celebrate when you reach savings milestones',
    icon: Target,
    color: 'text-income',
    enabled: true,
    frequency: 'instant'
  }
];

const notificationMethods = [
  {
    id: 'push',
    title: 'Push Notifications',
    description: 'Instant notifications on your device',
    icon: Smartphone,
    enabled: true
  },
  {
    id: 'email',
    title: 'Email Notifications',
    description: 'Daily/weekly email summaries',
    icon: Mail,
    enabled: false
  },
  {
    id: 'sms',
    title: 'SMS Alerts',
    description: 'Critical alerts via text message',
    icon: Bell,
    enabled: false
  }
];

const recentAlerts = [
  {
    id: 1,
    type: 'budget-warning',
    title: 'Food Budget Alert',
    message: 'You have spent 85% of your food budget for this month',
    time: '2 hours ago',
    icon: AlertTriangle,
    color: 'text-budget-warning bg-warning-light'
  },
  {
    id: 2,
    type: 'bill-due',
    title: 'Electricity Bill Due',
    message: 'Your electricity bill of ₹1,200 is due in 3 days',
    time: '1 day ago',
    icon: Calendar,
    color: 'text-accent-vivid bg-accent'
  },
  {
    id: 3,
    type: 'large-expense',
    title: 'Large Transaction Alert',
    message: 'You made a purchase of ₹2,800 at Amazon',
    time: '2 days ago',
    icon: DollarSign,
    color: 'text-expense bg-destructive/10'
  },
  {
    id: 4,
    type: 'milestone',
    title: 'Savings Milestone Reached!',
    message: 'Congratulations! You reached 60% of your laptop savings goal',
    time: '3 days ago',
    icon: Target,
    color: 'text-income bg-success-light'
  }
];

const Alerts = () => {
  const [alerts, setAlerts] = useState(alertSettings);
  const [notifications, setNotifications] = useState(notificationMethods);

  const toggleAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, enabled: !alert.enabled }
        : alert
    ));
  };

  const toggleNotification = (notificationId: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, enabled: !notification.enabled }
        : notification
    ));
  };

  const updateFrequency = (alertId: string, frequency: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, frequency }
        : alert
    ));
  };

  const testNotification = () => {
    toast.success("🔔 Test notification successful!", {
      description: "Your alert system is working perfectly. All notifications are configured correctly.",
      duration: 5000,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Alerts & Notifications</h1>
            <p className="text-muted-foreground">Manage your financial notification preferences</p>
          </div>
          <Button className="gradient-primary shadow-glow" onClick={testNotification}>
            <Bell className="w-4 h-4 mr-2" />
            Test Notification
          </Button>
        </div>

        {/* Alert Settings */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-card-foreground">Alert Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {alerts.map((alert) => {
              const IconComponent = alert.icon;
              return (
                <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-2 rounded-lg bg-muted ${alert.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={alert.id} className="text-base font-medium text-card-foreground cursor-pointer">
                          {alert.title}
                        </Label>
                        <Switch
                          id={alert.id}
                          checked={alert.enabled}
                          onCheckedChange={() => toggleAlert(alert.id)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      
                      {alert.enabled && (
                        <div className="mt-3">
                          <Label className="text-xs text-muted-foreground">Frequency</Label>
                          <Select 
                            value={alert.frequency} 
                            onValueChange={(value) => updateFrequency(alert.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="instant">Instant</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Notification Methods */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-card-foreground">Notification Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div key={notification.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-muted text-accent-vivid">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <Label htmlFor={notification.id} className="text-base font-medium text-card-foreground cursor-pointer">
                        {notification.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={notification.id}
                    checked={notification.enabled}
                    onCheckedChange={() => toggleNotification(notification.id)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => {
                const IconComponent = alert.icon;
                return (
                  <div key={alert.id} className="flex items-start space-x-4 p-4 rounded-lg border border-border">
                    <div className={`p-2 rounded-lg ${alert.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-vivid">
                {alerts.filter(a => a.enabled).length}
              </div>
              <p className="text-xs text-muted-foreground">of {alerts.length} total alerts</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Alerts This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-budget-warning">12</div>
              <p className="text-xs text-muted-foreground">+3 from last week</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Most Common</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">Budget</div>
              <p className="text-xs text-muted-foreground">Budget limit alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-card-foreground">Alert Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">Best Practices</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Enable budget alerts to stay on track</li>
                  <li>• Set bill reminders 3-5 days in advance</li>
                  <li>• Use instant alerts for large transactions</li>
                  <li>• Keep savings milestone alerts enabled for motivation</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">Customization Tips</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Adjust alert frequency to avoid notification fatigue</li>
                  <li>• Use email for weekly summaries</li>
                  <li>• Reserve SMS for critical alerts only</li>
                  <li>• Test notifications to ensure they're working</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Alerts;