import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Server,
  AlertTriangle,
  Settings,
  ScrollText,
  Shield,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/inventory", icon: Server, label: "Inventory" },
  { to: "/gaps", icon: AlertTriangle, label: "Gaps" },
  { to: "/logs", icon: ScrollText, label: "Logs" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-sidebar-border">
        <Shield className="h-5 w-5 text-sidebar-primary" />
        <span className="text-sm font-bold tracking-tight text-sidebar-accent-foreground">
          AssetGap Sentinel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Sync status footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] text-sidebar-muted">
          <RefreshCw className="h-3 w-3" />
          <span>Last sync: 12 min ago</span>
        </div>
      </div>
    </aside>
  );
}
