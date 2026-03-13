import { MessageSquare, BookOpen, Mic, Settings, ChevronLeft, ChevronRight, User } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { ArqosWordmark, ArqosLogo } from "./ArqosLogo";
import type { UserRole } from "@/lib/types";

interface LeftSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole: UserRole;
}

const navItems = [
  { id: "console", label: "Console", path: "/", icon: MessageSquare, adminOnly: false },
  { id: "notebooks", label: "Notebooks", path: "/notebooks", icon: BookOpen, adminOnly: false },
  { id: "podcast", label: "Podcast Studio", path: "/podcast", icon: Mic, adminOnly: false },
  { id: "admin", label: "Admin Panel", path: "/admin", icon: Settings, adminOnly: true },
];

export function LeftSidebar({ currentPath, onNavigate, collapsed, onToggleCollapse, userRole }: LeftSidebarProps) {
  const { theme } = useTheme();
  const isAdmin = userRole === "Admin" || userRole === "Owner";

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside
      className={`h-full flex flex-col border-r border-border transition-all duration-200 shrink-0 ${
        collapsed ? "w-16" : "w-56"
      } bg-sidebar dark:bg-sidebar`}
      data-testid="left-sidebar"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b border-border shrink-0">
        {collapsed ? (
          <div className="w-full flex justify-center">
            <ArqosLogo size={28} />
          </div>
        ) : (
          <ArqosWordmark />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1" data-testid="left-sidebar-nav">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              } ${collapsed ? "justify-center px-2" : ""}`}
              data-testid={`nav-${item.id}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`shrink-0 ${isActive ? "w-5 h-5" : "w-4.5 h-4.5"}`} style={{ width: 18, height: 18 }} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-2 space-y-1">
        {/* User role indicator */}
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground ${
            collapsed ? "justify-center" : ""
          }`}
          data-testid="user-role-indicator"
        >
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-medium text-foreground">Irfan</span>
              <span className="text-[10px]">{userRole}</span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary transition-colors"
          data-testid="sidebar-collapse-toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
