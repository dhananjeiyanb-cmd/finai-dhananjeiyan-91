
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Shield, Zap, Users } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center">
              <Wallet className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Welcome to <span className="text-primary">FinAI</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your intelligent financial companion for budgeting, expense tracking, and smart money management.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gradient-primary shadow-glow text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Choose FinAI?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="gradient-card shadow-card border-0">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Your financial data is encrypted and secured with bank-level security protocols.
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-card border-0">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Get intelligent spending recommendations and financial insights powered by AI.
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-card border-0">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Multi-Tenant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Each user gets their own secure workspace with unique tenant ID for data isolation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
