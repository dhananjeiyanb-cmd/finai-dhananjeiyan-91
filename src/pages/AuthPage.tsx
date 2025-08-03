
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Wallet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = (isSignUp: boolean = false) => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (isSignUp && !formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    console.log('Starting sign in process for:', formData.email);
    setIsLoading(true);

    const { error } = await signIn(formData.email, formData.password);
    
    if (!error) {
      console.log('Sign in successful, redirecting to dashboard');
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(true)) return;
    
    console.log('Starting sign up process for:', formData.email);
    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, formData.fullName);
    
    if (!error) {
      console.log('Sign up successful');
      // Don't navigate immediately as user might need to confirm email
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md gradient-card shadow-elevated border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Welcome to FinAI
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your intelligent financial management platform
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={formErrors.email ? "border-destructive" : ""}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-destructive">{formErrors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className={formErrors.password ? "border-destructive" : ""}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {formErrors.password && (
                    <p className="text-sm text-destructive">{formErrors.password}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full gradient-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your account will be created with a unique tenant workspace for secure data isolation.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">Full Name</Label>
                  <Input
                    id="signup-fullname"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className={formErrors.fullName ? "border-destructive" : ""}
                  />
                  {formErrors.fullName && (
                    <p className="text-sm text-destructive">{formErrors.fullName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={formErrors.email ? "border-destructive" : ""}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-destructive">{formErrors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className={formErrors.password ? "border-destructive" : ""}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {formErrors.password && (
                    <p className="text-sm text-destructive">{formErrors.password}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full gradient-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
