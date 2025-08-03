import { 
  LayoutDashboard, 
  CreditCard, 
  Target, 
  PiggyBank, 
  Bell, 
  QrCode, 
  User, 
  LogOut,
  TrendingUp,
  CalendarDays
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: CreditCard },
  { title: "Budget Management", url: "/budget", icon: Target },
  { title: "Savings Goals", url: "/savings", icon: PiggyBank },
  { title: "Bill Reminders", url: "/reminders", icon: CalendarDays },
  { title: "Alerts & Notifications", url: "/alerts", icon: Bell },
  { title: "QR Payment", url: "/qr-payment", icon: QrCode },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r border-border bg-sidebar`}
      collapsible="icon"
    >
      <SidebarContent className="p-4">
        {/* FinAI Logo */}
        <div className="mb-8 flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img 
              src="/lovable-uploads/8eaa0ed2-ead7-405f-ba7f-5ddd5ba7e661.png" 
              alt="FinAI Logo" 
              className="w-10 h-10 object-contain"
            />
          </div>
          {!collapsed && (
            <div>
              <div className="text-lg font-bold text-sidebar-foreground">FinAI</div>
              <div className="text-xs text-sidebar-foreground/70">Smart Finance</div>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 text-xs uppercase tracking-wider mb-2">
            {!collapsed && "Main Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-card"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button */}
        <div className="mt-auto pt-4">
          <SidebarMenuButton asChild>
            <button
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive w-full"
              onClick={() => {
                // Handle logout
                console.log("Logout clicked");
              }}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span className="font-medium">Logout</span>}
            </button>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}