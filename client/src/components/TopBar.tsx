import { Sun, Moon, PanelRight, History, Wifi, Menu } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface TopBarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  onClearChat?: () => void;
  layerName?: string;
  showRightSidebarToggle?: boolean;
  onToggleMobileMenu?: () => void;
}

export function TopBar({
  onToggleSidebar,
  sidebarOpen,
  onClearChat,
  layerName = "Arqos Console",
  showRightSidebarToggle = true,
  onToggleMobileMenu,
}: TopBarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20"
      data-testid="top-bar"
    >
      {/* Left — Layer name + Live */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
            data-testid="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <h1 className="text-sm font-semibold tracking-wide" data-testid="layer-name">
          {layerName}
        </h1>
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <Wifi className="w-3 h-3 text-green-500" />
          <span className="text-[10px] font-medium text-green-600 dark:text-green-400">Live</span>
        </div>
      </div>

      {/* Right — Controls */}
      <div className="flex items-center gap-1">
        {/* New Chat — only on console */}
        {onClearChat && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary transition-colors"
            data-testid="new-chat-button"
            aria-label="New chat"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
          data-testid="theme-toggle"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Right Sidebar Toggle — only on console */}
        {showRightSidebarToggle && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              sidebarOpen ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
            }`}
            data-testid="sidebar-toggle"
            aria-label="Toggle sidebar"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
