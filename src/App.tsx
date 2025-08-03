
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { BudgetProvider } from '@/contexts/BudgetContext';
import AuthPage from '@/pages/AuthPage';
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Budget from "@/pages/Budget";
import Transactions from "@/pages/Transactions";
import QRPayment from "@/pages/QRPayment";
import Savings from "@/pages/Savings";
import Alerts from "@/pages/Alerts";
import Profile from "@/pages/Profile";
import Reminders from "@/pages/Reminders";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BudgetProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/qr-payment" element={<QRPayment />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </BudgetProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
