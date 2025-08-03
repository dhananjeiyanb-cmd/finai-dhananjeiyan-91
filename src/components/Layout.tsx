
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import ProfileDropdown from '@/components/ProfileDropdown';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [user, loading, navigate, location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user && location.pathname !== '/auth') {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 h-full">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <ProfileDropdown user={user} onSignOut={handleSignOut} />
            </div>
          </header>
          <main className="flex-1 p-6 bg-gradient-to-br from-background to-muted">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
