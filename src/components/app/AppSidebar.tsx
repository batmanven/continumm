import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Brain,
  FileText,
  Settings,
  Heart,
  History,
  ClipboardList,
  Activity,
  Users,
  Pill,
  User,
  Zap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "Guardians", url: "/app/guardians", icon: Users },
  { title: "Medications", url: "/app/medications", icon: Pill },
  { title: "Health Memory", url: "/app/health-memory", icon: Brain },
  { title: "Bill Explainer", url: "/app/bill-explainer", icon: FileText },
  { title: "Previous Bills", url: "/app/previous-bills", icon: History },
  { title: "Doctor Summaries", url: "/app/doctor-summaries", icon: ClipboardList },
  { title: "Symptom Checker", url: "/app/symptom-checker", icon: Activity },
];

const bottomItems = [
  { title: "Profile", url: "/app/profile", icon: User },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const renderNavItems = (navItems: typeof items) => (
    <SidebarMenu className="gap-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.url || (item.url === "/app" && location.pathname === "/app/");
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild className="h-11 rounded-xl transition-all">
              <NavLink
                id={`tour-nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                to={item.url}
                className={`flex items-center gap-3 px-3 w-full transition-all group ${
                  isActive 
                    ? "bg-white/5 border-white/10 shadow-inner" 
                    : "hover:bg-white/5"
                }`}
              >
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
                  isActive 
                    ? "bg-primary/10 text-primary shadow-lg shadow-primary/20 scale-105" 
                    : "bg-transparent text-muted-foreground group-hover:text-foreground"
                }`}>
                  <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                </div>
                {!collapsed && (
                  <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  }`}>
                    {item.title}
                  </span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto h-1 w-1 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 shadow-2xl">
      <SidebarHeader className={`border-b border-white/5 bg-white/[0.02] transition-all duration-300 ${collapsed ? 'p-2' : 'p-4 px-6'}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'flex-col justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-110 ${collapsed ? 'h-8 w-8' : 'h-10 w-10'}`}>
              <Heart className={`${collapsed ? 'h-4 w-4' : 'h-5 w-5'} text-primary-foreground fill-primary-foreground/20`} />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-display font-bold tracking-tight text-foreground">
                  Continuum
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
                  Health Hub
                </span>
              </div>
            )}
          </div>
          <SidebarTrigger id="tour-sidebar-trigger" className={`text-muted-foreground hover:text-primary transition-colors hover:bg-white/5 rounded-lg ${collapsed ? 'h-10 w-10 mt-2' : 'h-8 w-8'}`} />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 flex flex-col justify-between h-full">
        <SidebarGroup>
          <SidebarGroupContent>
            {renderNavItems(items)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto pb-4">
          <SidebarGroupContent>
            {renderNavItems(bottomItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
