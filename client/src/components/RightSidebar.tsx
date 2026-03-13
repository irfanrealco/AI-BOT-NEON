import { useState } from "react";
import {
  X,
  Newspaper,
  Map,
  Database,
  LayoutDashboard,
  Users,
  Pin,
  Trash2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import type { DataCard, SidebarItem } from "@/lib/types";
import { DataCardDisplay } from "./DataCardDisplay";
import { sidebarResources } from "@/lib/mock-data";

const iconMap: Record<string, any> = {
  Newspaper,
  Map,
  Database,
  LayoutDashboard,
  Users,
};

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedCards: DataCard[];
  onRemovePin: (cardId: string) => void;
}

export function RightSidebar({ isOpen, onClose, pinnedCards, onRemovePin }: RightSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("saved");

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  return (
    <div
      className="slide-in-right w-80 h-full bg-sidebar border-l border-sidebar-border flex flex-col shrink-0"
      data-testid="right-sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <h3 className="text-sm font-semibold">Intelligence Panel</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors"
          data-testid="close-sidebar"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Saved Cards Section */}
        <div className="border-b border-sidebar-border">
          <button
            onClick={() => toggleSection("saved")}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-sidebar-accent/50 transition-colors"
            data-testid="toggle-saved-section"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium">Saved Items</span>
              {pinnedCards.length > 0 && (
                <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-medium">
                  {pinnedCards.length}
                </span>
              )}
            </div>
            {expandedSection === "saved" ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
          {expandedSection === "saved" && (
            <div className="px-3 pb-3 space-y-2">
              {pinnedCards.length === 0 ? (
                <div className="text-center py-6">
                  <Pin className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Pin cards from the chat to save them here
                  </p>
                </div>
              ) : (
                pinnedCards.map((card) => (
                  <div key={card.id} className="relative">
                    <DataCardDisplay card={card} compact onClose={() => onRemovePin(card.id)} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Resources Section */}
        <div className="border-b border-sidebar-border">
          <button
            onClick={() => toggleSection("resources")}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-sidebar-accent/50 transition-colors"
            data-testid="toggle-resources-section"
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium">Resources</span>
            </div>
            {expandedSection === "resources" ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
          {expandedSection === "resources" && (
            <div className="px-3 pb-3 space-y-1">
              {sidebarResources.map((item) => {
                const ItemIcon = item.icon ? iconMap[item.icon] || Database : Database;
                return (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors text-left"
                    data-testid={`resource-${item.id}`}
                  >
                    <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
                      <ItemIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="px-4 py-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Today's Snapshot
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "DLD Txns", value: "342", change: "+8%" },
              { label: "Avg Price", value: "1.92K", change: "+2.1%" },
              { label: "New Listings", value: "87", change: "+12%" },
              { label: "Views", value: "4.2K", change: "+15%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-card border border-card-border rounded-lg p-2.5"
              >
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-semibold">{stat.value}</p>
                <p className="text-[10px] text-green-500 font-medium">{stat.change}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Realco Intelligence v2.0 — Data refreshed live
        </p>
      </div>
    </div>
  );
}
