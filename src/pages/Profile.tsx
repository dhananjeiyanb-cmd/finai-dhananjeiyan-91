import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  PieChart,
  TrendingUp,
  CreditCard,
  Bell,
  Shield,
  Edit3,
  Camera,
  Building,
  Hash,
  Banknote
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    joinDate: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: ""
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setUserInfo({
            name: data.full_name || "",
            email: user.email || "",
            phone: "",
            location: "",
            joinDate: new Date(data.created_at).toLocaleDateString(),
            bankName: "",
            accountNumber: "",
            ifscCode: "",
            accountType: ""
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const usageStats = [
    { label: "Total Transactions", value: "1,248", icon: CreditCard, color: "text-primary" },
    { label: "Budget Categories", value: "6", icon: PieChart, color: "text-accent-vivid" },
    { label: "Savings Goals", value: "4", icon: TrendingUp, color: "text-savings" },
    { label: "Active Alerts", value: "8", icon: Bell, color: "text-budget-warning" }
  ];

  const monthlyUsage = [
    { month: "Oct 2024", transactions: 125, savings: 8500 },
    { month: "Nov 2024", transactions: 142, savings: 9200 },
    { month: "Dec 2024", transactions: 158, savings: 10100 },
    { month: "Jan 2025", transactions: 89, savings: 6800 }
  ];

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: userInfo.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bank Details</h1>
            <p className="text-muted-foreground">Manage your bank information and account preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Bank Info</TabsTrigger>
            <TabsTrigger value="usage">App Usage</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="gradient-card shadow-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground">Bank Information</CardTitle>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    className={isEditing ? "gradient-primary" : ""}
                  >
                    {isEditing ? (
                      <>Save Changes</>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-primary text-primary-foreground">
                        {userInfo.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-card-foreground">{userInfo.name}</h3>
                    <p className="text-muted-foreground">FinAI User since {userInfo.joinDate}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={userInfo.location}
                      onChange={(e) => setUserInfo({ ...userInfo, location: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Bank Details Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-card-foreground text-lg">Bank Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        Bank Name
                      </Label>
                      <Input
                        id="bankName"
                        value={userInfo.bankName}
                        onChange={(e) => setUserInfo({ ...userInfo, bankName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="flex items-center">
                        <Hash className="w-4 h-4 mr-2" />
                        Account Number
                      </Label>
                      <Input
                        id="accountNumber"
                        value={userInfo.accountNumber}
                        onChange={(e) => setUserInfo({ ...userInfo, accountNumber: e.target.value })}
                        disabled={!isEditing}
                        type={isEditing ? "text" : "password"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ifscCode" className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        IFSC Code
                      </Label>
                      <Input
                        id="ifscCode"
                        value={userInfo.ifscCode}
                        onChange={(e) => setUserInfo({ ...userInfo, ifscCode: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountType" className="flex items-center">
                        <Banknote className="w-4 h-4 mr-2" />
                        Account Type
                      </Label>
                      <Input
                        id="accountType"
                        value={userInfo.accountType}
                        onChange={(e) => setUserInfo({ ...userInfo, accountType: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-4">
                    <Button onClick={handleSaveProfile} className="gradient-primary">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {usageStats.map((stat, index) => (
                <Card key={index} className="gradient-card shadow-card border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Monthly Usage */}
            <Card className="gradient-card shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-card-foreground">Monthly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyUsage.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                      <div className="flex items-center space-x-4">
                        <Calendar className="w-5 h-5 text-accent-vivid" />
                        <span className="font-medium text-card-foreground">{month.month}</span>
                      </div>
                      <div className="flex space-x-6 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground">Transactions</p>
                          <p className="font-bold text-card-foreground">{month.transactions}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Savings</p>
                          <p className="font-bold text-savings">₹{month.savings.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Insights */}
            <Card className="gradient-card shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-card-foreground">Usage Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-card-foreground">Your Financial Journey</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• You've been consistently tracking expenses for 12 months</li>
                      <li>• Your savings rate has improved by 15% since joining</li>
                      <li>• Most active category: Food & Dining (45% of transactions)</li>
                      <li>• Best savings month: December 2024 (₹10,100)</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-card-foreground">App Engagement</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Average daily app usage: 12 minutes</li>
                      <li>• Most used feature: Transaction tracking</li>
                      <li>• QR payments made: 156 total</li>
                      <li>• Budget goals achieved: 8 out of 10</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="gradient-card shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-accent-vivid" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-card-foreground">Password & Authentication</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                      <div>
                        <p className="font-medium text-card-foreground">Password</p>
                        <p className="text-sm text-muted-foreground">Last changed 2 months ago</p>
                      </div>
                      <Button variant="outline" size="sm">Change Password</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                      <div>
                        <p className="font-medium text-card-foreground">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                      </div>
                      <Button variant="outline" size="sm">Setup 2FA</Button>
                    </div>
                  </div>
                </div>

                {/* Privacy Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-card-foreground">Privacy & Data</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                      <div>
                        <p className="font-medium text-card-foreground">Data Export</p>
                        <p className="text-sm text-muted-foreground">Download your financial data</p>
                      </div>
                      <Button variant="outline" size="sm">Export Data</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                      <div>
                        <p className="font-medium text-card-foreground">Delete Account</p>
                        <p className="text-sm text-muted-foreground">Permanently remove your account</p>
                      </div>
                      <Button variant="destructive" size="sm">Delete Account</Button>
                    </div>
                  </div>
                </div>

                {/* Account Security Status */}
                <div className="bg-success-light p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-success" />
                    <div>
                      <p className="font-medium text-success">Account Security: Strong</p>
                      <p className="text-sm text-success/80">Your account is well protected with current security measures</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;