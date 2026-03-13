import { useState, useRef, useCallback } from "react";
import {
  Settings,
  Database,
  Users,
  FileText,
  Terminal,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Send,
  AlertCircle,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import {
  mockUsers,
  mockDataSources,
  mockAuditLog,
  defaultAdminConfig,
} from "@/lib/mock-data";
import type { AdminConfig, AuditEntry, UserAccount, DataSource } from "@/lib/types";

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

type AdminTab = "config" | "sources" | "users" | "audit" | "crud";

const tabs: { id: AdminTab; label: string; icon: typeof Settings }[] = [
  { id: "config", label: "System Config", icon: Settings },
  { id: "sources", label: "Data Sources", icon: Database },
  { id: "users", label: "User Management", icon: Users },
  { id: "audit", label: "Audit Log", icon: FileText },
  { id: "crud", label: "CRUD Console", icon: Terminal },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("config");

  return (
    <div className="h-full flex flex-col overflow-hidden" data-testid="admin-page">
      <TopBar layerName="Admin Panel" showRightSidebarToggle={false} />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1" data-testid="admin-title">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">
              System configuration, data sources, and operational management
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto border-b border-border pb-px" data-testid="admin-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === "config" && <SystemConfigTab />}
          {activeTab === "sources" && <DataSourcesTab />}
          {activeTab === "users" && <UserManagementTab />}
          {activeTab === "audit" && <AuditLogTab />}
          {activeTab === "crud" && <CrudConsoleTab />}
        </div>
      </div>

      <div className="text-center pb-2">
        <PerplexityAttribution />
      </div>
    </div>
  );
}

// ── System Config Tab ─────────────────────────────────────

function SystemConfigTab() {
  const [config, setConfig] = useState<AdminConfig>(defaultAdminConfig);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/admin/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="config-tab">
      {/* System Prompt */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="text-sm font-semibold mb-3">Bot Persona (System Prompt)</h3>
        <textarea
          value={config.systemPrompt}
          onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
          placeholder="Override the default ARQOS system prompt..."
          rows={8}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-primary resize-y font-mono"
          data-testid="system-prompt-editor"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          Leave empty to use default ARQOS system prompt. Changes apply to new conversations only.
        </p>
      </div>

      {/* Model & Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-semibold mb-3">Model</h3>
          <select
            value={config.model}
            onChange={(e) => setConfig({ ...config, model: e.target.value as AdminConfig["model"] })}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-primary"
            data-testid="model-select"
          >
            <option value="gemini_3_flash">Gemini 3 Flash</option>
            <option value="sonar">Sonar (Perplexity)</option>
            <option value="sonar-pro">Sonar Pro (Perplexity)</option>
          </select>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-semibold mb-3">Temperature</h3>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature}
            onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
            className="w-full accent-primary"
            data-testid="temperature-slider"
          />
          <p className="text-xs text-muted-foreground text-center mt-1">{config.temperature}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-semibold mb-3">Max Tokens</h3>
          <input
            type="number"
            value={config.maxTokens}
            onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) || 4096 })}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-primary"
            data-testid="max-tokens-input"
          />
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        data-testid="save-config-btn"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Save Configuration
      </button>
    </div>
  );
}

// ── Data Sources Tab ──────────────────────────────────────

function DataSourcesTab() {
  const [sources] = useState<DataSource[]>(mockDataSources);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="sources-tab">
      {sources.map((source) => (
        <div
          key={source.id}
          className="p-4 rounded-xl border border-border bg-card"
          data-testid={`source-card-${source.id}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold">{source.name}</h4>
            </div>
            <StatusBadge status={source.status} />
          </div>
          <p className="text-xs text-muted-foreground mb-2">{source.type}</p>
          <p className="text-xs text-muted-foreground mb-3">{source.description}</p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {source.lastSync
                ? `Last sync: ${source.lastSync.toLocaleString()}`
                : "Never synced"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: DataSource["status"] }) {
  const styles = {
    connected: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    disconnected: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    syncing: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  };
  const icons = {
    connected: CheckCircle2,
    disconnected: XCircle,
    syncing: RefreshCw,
  };
  const Icon = icons[status];

  return (
    <span
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles[status]}`}
      data-testid={`status-${status}`}
    >
      <Icon className={`w-3 h-3 ${status === "syncing" ? "animate-spin" : ""}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── User Management Tab ───────────────────────────────────

function UserManagementTab() {
  const [users] = useState<UserAccount[]>(mockUsers);

  return (
    <div className="rounded-xl border border-border overflow-hidden" data-testid="users-tab">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="users-table">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Active</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Permissions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0" data-testid={`user-row-${user.id}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{user.name[0]}</span>
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 text-xs ${user.status === "active" ? "text-green-500" : "text-muted-foreground"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-green-500" : "bg-muted-foreground"}`} />
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {user.lastActive.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {Object.entries(user.permissions).map(([key, val]) => (
                      <span
                        key={key}
                        className={`w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold uppercase ${
                          val
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-secondary text-muted-foreground/40"
                        }`}
                        title={`${key}: ${val ? "Yes" : "No"}`}
                      >
                        {key[0]}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Audit Log Tab ─────────────────────────────────────────

function AuditLogTab() {
  const [entries] = useState<AuditEntry[]>(mockAuditLog);

  return (
    <div className="rounded-xl border border-border overflow-hidden" data-testid="audit-tab">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="audit-table">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Timestamp</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Query</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Model</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Tokens</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Response</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-border last:border-0" data-testid={`audit-row-${entry.id}`}>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {entry.timestamp.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-medium whitespace-nowrap">{entry.user}</td>
                <td className="px-4 py-3 max-w-[200px] truncate" title={entry.query}>
                  {entry.query}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{entry.model}</td>
                <td className="px-4 py-3 text-right text-xs tabular-nums">{entry.tokensUsed.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-xs tabular-nums">{entry.responseTime}ms</td>
                <td className="px-4 py-3 text-center">
                  {entry.status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── CRUD Console Tab ──────────────────────────────────────

function CrudConsoleTab() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "system"; content: string }>>([
    {
      role: "system",
      content:
        "CRUD Console active. Available commands:\n• /create lead <name> <phone>\n• /list deals\n• /update inventory <id> <field> <value>\n• /delete contact <id>\n\nOr ask in natural language — e.g., \"Show all active leads from this week\"",
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");

    // Simulate CRUD response
    setTimeout(() => {
      let response = "";
      const lower = trimmed.toLowerCase();

      if (lower.startsWith("/create lead")) {
        response = `Lead created successfully.\nName: ${trimmed.split(" ").slice(2, -1).join(" ") || "New Lead"}\nPhone: ${trimmed.split(" ").pop() || "N/A"}\nStatus: New\nAssigned to: Qasim`;
      } else if (lower.startsWith("/list deals")) {
        response = "Active Deals (4):\n1. Palm Jumeirah Villa — AED 45.2M — Negotiation\n2. Dubai Hills 5BR — AED 12.8M — Due Diligence\n3. DIFC Office — AED 8.5M — Viewing Scheduled\n4. JVC Apartment — AED 1.2M — Closing";
      } else if (lower.startsWith("/update inventory")) {
        response = "Inventory updated successfully.\nChange logged in audit trail.";
      } else if (lower.startsWith("/delete contact")) {
        response = "Contact deletion requires confirmation.\nType /confirm to proceed or /cancel to abort.";
      } else {
        response = `Processing: "${trimmed}"\n\nI've queried the CRM and inventory systems. Here's what I found:\n• 12 active leads this week\n• 4 deals in pipeline\n• 156 active inventory listings\n\nUse specific CRUD commands for targeted operations.`;
      }

      setMessages((prev) => [...prev, { role: "system", content: response }]);
    }, 500);
  }, [input]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden" data-testid="crud-tab">
      {/* Terminal-style chat */}
      <div className="h-[400px] overflow-y-auto custom-scrollbar p-4 space-y-3 font-mono text-sm">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === "user" ? "text-primary" : "text-muted-foreground"} data-testid={`crud-msg-${idx}`}>
            <span className="text-[10px] font-bold opacity-60">
              {msg.role === "user" ? "admin>" : "arqos>"}
            </span>
            <pre className="whitespace-pre-wrap mt-0.5 text-xs leading-relaxed">{msg.content}</pre>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="/create lead, /list deals, /update inventory..."
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono outline-none focus:ring-1 focus:ring-primary"
          data-testid="crud-input"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          data-testid="crud-send-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
