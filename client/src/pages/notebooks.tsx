import { useState } from "react";
import {
  BookOpen,
  Search,
  FileText,
  Users,
  Clock,
  ChevronRight,
  RefreshCw,
  X,
  File,
  Table2,
  Link,
  Type,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { mockNotebooks, notebookClusters, teamMembers } from "@/lib/mock-data";
import type { Notebook } from "@/lib/types";

const sourceTypeIcon: Record<string, typeof File> = {
  pdf: FileText,
  doc: File,
  spreadsheet: Table2,
  url: Link,
  text: Type,
};

export default function NotebooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);

  const filteredNotebooks = mockNotebooks.filter((nb) => {
    const matchesSearch =
      !searchQuery ||
      nb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nb.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCluster = !selectedCluster || nb.cluster === selectedCluster;
    return matchesSearch && matchesCluster;
  });

  const groupedNotebooks = notebookClusters
    .map((cluster) => ({
      cluster,
      notebooks: filteredNotebooks.filter((nb) => nb.cluster === cluster),
    }))
    .filter((g) => g.notebooks.length > 0);

  if (selectedNotebook) {
    return (
      <NotebookDetail
        notebook={selectedNotebook}
        onBack={() => setSelectedNotebook(null)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" data-testid="notebooks-page">
      <TopBar layerName="Notebook Studio" showRightSidebarToggle={false} />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1" data-testid="notebooks-title">Notebook Studio</h2>
            <p className="text-sm text-muted-foreground">
              Knowledge base powered by NotebookLM — organized by intelligence clusters
            </p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notebooks..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-1 focus:ring-primary"
                data-testid="notebook-search"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCluster(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !selectedCluster
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                data-testid="filter-all"
              >
                All
              </button>
              {notebookClusters.map((cluster) => (
                <button
                  key={cluster}
                  onClick={() => setSelectedCluster(selectedCluster === cluster ? null : cluster)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCluster === cluster
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`filter-${cluster.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  {cluster}
                </button>
              ))}
            </div>
          </div>

          {/* Notebook grid by cluster */}
          <div className="space-y-8">
            {groupedNotebooks.map(({ cluster, notebooks }) => (
              <div key={cluster}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3" data-testid={`cluster-${cluster.replace(/\s+/g, "-").toLowerCase()}`}>
                  {cluster}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notebooks.map((nb) => (
                    <button
                      key={nb.id}
                      onClick={() => setSelectedNotebook(nb)}
                      className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all group"
                      data-testid={`notebook-card-${nb.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4.5 h-4.5 text-primary" style={{ width: 18, height: 18 }} />
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h4 className="text-sm font-semibold mb-1 line-clamp-1">{nb.name}</h4>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{nb.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{nb.sourceCount} sources</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(nb.lastUpdated)}</span>
                        </div>
                      </div>
                      {/* Shared members */}
                      <div className="flex items-center gap-1 mt-2.5">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <div className="flex -space-x-1.5">
                          {nb.sharedWith.slice(0, 4).map((member) => (
                            <div
                              key={member.id}
                              className="w-5 h-5 rounded-full bg-primary/20 border border-background flex items-center justify-center"
                              title={member.name}
                            >
                              <span className="text-[8px] font-bold text-primary">
                                {member.name[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center pb-2">
        <PerplexityAttribution />
      </div>
    </div>
  );
}

// ── Notebook Detail View ──────────────────────────────────

function NotebookDetail({ notebook, onBack }: { notebook: Notebook; onBack: () => void }) {
  const [chatInput, setChatInput] = useState("");

  return (
    <div className="h-full flex flex-col overflow-hidden" data-testid="notebook-detail">
      <TopBar layerName={notebook.name} showRightSidebarToggle={false} />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            data-testid="notebook-back"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Notebooks
          </button>

          {/* Notebook header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {notebook.cluster}
              </span>
              <span>Last updated {formatRelativeTime(notebook.lastUpdated)}</span>
            </div>
            <h2 className="text-xl font-bold mb-1">{notebook.name}</h2>
            <p className="text-sm text-muted-foreground">{notebook.description}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sources list */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Sources ({notebook.sourceCount})
              </h3>
              <div className="space-y-2">
                {notebook.sources.map((source) => {
                  const Icon = sourceTypeIcon[source.type] || File;
                  return (
                    <div
                      key={source.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                      data-testid={`source-${source.id}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{source.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Added {source.addedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {notebook.sourceCount > notebook.sources.length && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    + {notebook.sourceCount - notebook.sources.length} more sources
                  </p>
                )}
              </div>
            </div>

            {/* AI Chat within notebook context */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Ask about this notebook
              </h3>
              <div className="border border-border rounded-xl bg-card p-4">
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm mb-4 border border-dashed border-border rounded-lg">
                  <p className="text-center px-4">
                    AI chat will be connected once Vertex AI integration is live.
                    <br />
                    <span className="text-xs">Notebook context: {notebook.name}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about this notebook..."
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-primary"
                    data-testid="notebook-chat-input"
                  />
                  <button
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                    data-testid="notebook-chat-send"
                  >
                    Ask
                  </button>
                </div>
              </div>

              {/* Sync to Arqos */}
              <button
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                data-testid="sync-to-arqos"
              >
                <RefreshCw className="w-4 h-4" />
                Sync to Arqos
              </button>
            </div>
          </div>

          {/* Shared members */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Shared with
            </h3>
            <div className="flex gap-3 flex-wrap">
              {notebook.sharedWith.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{member.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pb-2">
        <PerplexityAttribution />
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
