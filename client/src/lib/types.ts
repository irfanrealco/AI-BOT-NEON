export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  cards?: DataCard[];
}

export interface DataCard {
  id: string;
  type: "market" | "property" | "transaction" | "insight" | "chart" | "table";
  title: string;
  subtitle?: string;
  data: Record<string, any>;
  pinned?: boolean;
}

export interface SidebarItem {
  id: string;
  type: "saved" | "history" | "resource";
  title: string;
  subtitle?: string;
  icon?: string;
  timestamp?: Date;
  card?: DataCard;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

// ── Layer 2: Notebook Studio ──────────────────────────────

export type UserRole = "Guest" | "Client" | "Agent" | "Team Lead" | "Owner" | "Admin";

export interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface NotebookSource {
  id: string;
  name: string;
  type: "pdf" | "doc" | "spreadsheet" | "url" | "text";
  addedAt: Date;
}

export interface Notebook {
  id: string;
  name: string;
  cluster: string;
  description: string;
  lastUpdated: Date;
  sourceCount: number;
  sources: NotebookSource[];
  sharedWith: TeamMember[];
}

// ── Layer 3: Podcast Studio ───────────────────────────────

export interface PodcastVoice {
  id: string;
  name: string;
  label: string;
  description: string;
}

export interface PodcastDialogueLine {
  speaker: string;
  voice: string;
  text: string;
}

export interface PodcastEpisode {
  id: string;
  topic: string;
  voice1: string;
  voice2: string;
  createdAt: Date;
  duration: string;
  script: PodcastDialogueLine[];
  status: "generating" | "ready" | "error";
}

// ── Layer 4: Admin Panel ──────────────────────────────────

export interface AdminConfig {
  systemPrompt: string;
  model: "gemini_3_flash" | "sonar" | "sonar-pro";
  temperature: number;
  maxTokens: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "syncing";
  lastSync: Date | null;
  description: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  lastActive: Date;
  permissions: {
    chat: boolean;
    notebooks: boolean;
    podcast: boolean;
    admin: boolean;
    crud: boolean;
  };
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  user: string;
  query: string;
  model: string;
  tokensUsed: number;
  responseTime: number;
  status: "success" | "error";
}

// ── AI Engine ─────────────────────────────────────────────

export type AIEngine = "gemini" | "perplexity";

// ── Navigation ────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
}
