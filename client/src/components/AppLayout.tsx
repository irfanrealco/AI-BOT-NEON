import { useState } from "react";
import { LeftSidebar } from "./LeftSidebar";
import type { UserRole } from "@/lib/types";

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  userRole: UserRole;
}

export function AppLayout({ children, currentPath, onNavigate, userRole }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden" data-testid="app-layout">
      {/* Left sidebar */}
      <LeftSidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        userRole={userRole}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
