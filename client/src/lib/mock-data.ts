import type {
  ChatMessage,
  DataCard,
  SidebarItem,
  QuickAction,
  Notebook,
  TeamMember,
  PodcastEpisode,
  PodcastVoice,
  UserAccount,
  AuditEntry,
  DataSource,
  AdminConfig,
} from "./types";

// ── Team Members ──────────────────────────────────────────

export const teamMembers: TeamMember[] = [
  { id: "tm-1", name: "Irfan", role: "Admin" },
  { id: "tm-2", name: "Talha", role: "Owner" },
  { id: "tm-3", name: "Gibran", role: "Team Lead" },
  { id: "tm-4", name: "Qasim", role: "Agent" },
];

// ── Quick Actions ─────────────────────────────────────────

export const quickActions: QuickAction[] = [
  {
    id: "1",
    label: "Market Overview",
    icon: "TrendingUp",
    prompt: "Give me today's Dubai real estate market overview",
  },
  {
    id: "2",
    label: "Top Communities",
    icon: "MapPin",
    prompt: "What are the top performing communities this quarter?",
  },
  {
    id: "3",
    label: "DLD Transactions",
    icon: "FileText",
    prompt: "Show me the latest DLD transaction data summary",
  },
  {
    id: "4",
    label: "Price Trends",
    icon: "BarChart3",
    prompt: "Analyze price trends for Dubai Marina and Downtown",
  },
];

// ── Sample Data Cards ─────────────────────────────────────

export const sampleCards: DataCard[] = [
  {
    id: "card-1",
    type: "market",
    title: "Dubai Marina — Q1 2026",
    subtitle: "Market Performance Snapshot",
    data: {
      avgPrice: "AED 1,850/sqft",
      txVolume: "2,340 transactions",
      yoyGrowth: "+12.4%",
      medianDays: "18 days on market",
      topProject: "Marina Gate",
      inventory: "1,280 active listings",
    },
  },
  {
    id: "card-2",
    type: "transaction",
    title: "Recent DLD Transactions",
    subtitle: "Top 5 by value — Last 7 days",
    data: {
      transactions: [
        { project: "Palm Jumeirah Villa", value: "AED 45.2M", type: "Sale", date: "Mar 11" },
        { project: "Burj Khalifa 3BR", value: "AED 18.7M", type: "Sale", date: "Mar 10" },
        { project: "DIFC Tower Penthouse", value: "AED 15.3M", type: "Sale", date: "Mar 10" },
        { project: "Dubai Hills 5BR", value: "AED 12.8M", type: "Sale", date: "Mar 9" },
        { project: "Bluewaters Apt", value: "AED 8.4M", type: "Sale", date: "Mar 8" },
      ],
    },
  },
  {
    id: "card-3",
    type: "insight",
    title: "AI Insight",
    subtitle: "Trend Alert — MBR City Zone",
    data: {
      summary: "MBR City zone is showing 18% quarter-over-quarter growth in transaction volumes, led by Dubai Hills Estate and District One. Absorption rates are accelerating in the villa segment.",
      confidence: "High",
      sources: ["DLD Official Data", "Realco Intelligence"],
      recommendation: "Consider increasing inventory allocation in Dubai Hills by 15%.",
    },
  },
  {
    id: "card-4",
    type: "property",
    title: "Featured Listing",
    subtitle: "Dubai Hills Estate — Park Heights 2",
    data: {
      bedrooms: "3 BR",
      bua: "1,845 sqft",
      price: "AED 3.2M",
      pricePerSqft: "AED 1,734/sqft",
      status: "Available",
      developer: "Emaar",
      view: "Park & Pool View",
      completion: "Ready",
    },
  },
];

export const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Welcome to Realco Intelligence. I'm Arqos — your AI guide built on years of Dubai market data. I learn from every deal, every trend, and every cycle to help you make better decisions today.\n\nWhat would you like to explore?",
    timestamp: new Date(),
    cards: [],
  },
];

export const sidebarResources: SidebarItem[] = [
  {
    id: "res-1",
    type: "resource",
    title: "Market Weekly Brief",
    subtitle: "W/E March 8, 2026",
    icon: "Newspaper",
  },
  {
    id: "res-2",
    type: "resource",
    title: "Zone Performance",
    subtitle: "5 Zones Comparative",
    icon: "Map",
  },
  {
    id: "res-3",
    type: "resource",
    title: "DLD Data Feed",
    subtitle: "Live Transaction Stream",
    icon: "Database",
  },
  {
    id: "res-4",
    type: "resource",
    title: "Inventory Dashboard",
    subtitle: "Active Listings Overview",
    icon: "LayoutDashboard",
  },
  {
    id: "res-5",
    type: "resource",
    title: "Agent Performance",
    subtitle: "Team Metrics Q1",
    icon: "Users",
  },
];

// Simulate bot response with card generation
export function generateBotResponse(userMessage: string): { text: string; cards: DataCard[] } {
  const lower = userMessage.toLowerCase();

  if (lower.includes("market") || lower.includes("overview")) {
    return {
      text: "Here's your Dubai real estate market overview for Q1 2026. The market continues to show resilience, with transaction volumes up 14% year-over-year. Dubai Marina and Downtown remain the highest-volume areas, while MBR City shows the strongest growth trajectory.",
      cards: [sampleCards[0], sampleCards[2]],
    };
  }

  if (lower.includes("transaction") || lower.includes("dld")) {
    return {
      text: "I've pulled the latest DLD transaction data. Here are the top transactions from the past week, along with a market insight on emerging trends.",
      cards: [sampleCards[1]],
    };
  }

  if (lower.includes("community") || lower.includes("communities") || lower.includes("performing")) {
    return {
      text: "Based on Q1 2026 data, the top performing communities by transaction growth are:\n\n1. Dubai Hills Estate — +22% YoY\n2. JVC — +19% YoY\n3. Dubai Marina — +15% YoY\n4. Business Bay — +13% YoY\n5. Palm Jumeirah — +11% YoY\n\nDubai Hills Estate continues to dominate with strong villa demand.",
      cards: [sampleCards[2]],
    };
  }

  if (lower.includes("price") || lower.includes("trend")) {
    return {
      text: "Price trends for the selected areas show continued appreciation. Dubai Marina average prices have risen 12.4% YoY to AED 1,850/sqft. Downtown Dubai is at AED 2,380/sqft, up 9.7% YoY. Here's a featured listing from a high-demand community.",
      cards: [sampleCards[0], sampleCards[3]],
    };
  }

  if (lower.includes("listing") || lower.includes("property") || lower.includes("inventory")) {
    return {
      text: "Here's a featured listing from our current inventory. I can search for specific criteria — beds, budget, community, or property type. Just let me know what you're looking for.",
      cards: [sampleCards[3]],
    };
  }

  return {
    text: "I can help you with market analysis, DLD transactions, community performance, price trends, inventory search, and agent insights. What area would you like to explore?",
    cards: [],
  };
}

// ── Notebook Studio Mock Data ─────────────────────────────

export const mockNotebooks: Notebook[] = [
  // SLT Command Center
  {
    id: "nb-1",
    name: "Q1 2026 Executive Summary",
    cluster: "SLT Command Center",
    description: "Quarterly performance metrics, P&L highlights, strategic priorities",
    lastUpdated: new Date("2026-03-10T14:30:00"),
    sourceCount: 12,
    sources: [
      { id: "s-1", name: "Q1 Financial Report.pdf", type: "pdf", addedAt: new Date("2026-03-08") },
      { id: "s-2", name: "Board Presentation.pdf", type: "pdf", addedAt: new Date("2026-03-05") },
      { id: "s-3", name: "KPI Dashboard Export.spreadsheet", type: "spreadsheet", addedAt: new Date("2026-03-01") },
    ],
    sharedWith: [teamMembers[0], teamMembers[1]],
  },
  {
    id: "nb-2",
    name: "Strategic Vision 2026-2028",
    cluster: "SLT Command Center",
    description: "Long-term growth strategy, market expansion plans, partnership pipeline",
    lastUpdated: new Date("2026-03-06T09:15:00"),
    sourceCount: 8,
    sources: [
      { id: "s-4", name: "Vision Document.pdf", type: "pdf", addedAt: new Date("2026-02-20") },
      { id: "s-5", name: "Market Expansion Analysis.doc", type: "doc", addedAt: new Date("2026-02-18") },
    ],
    sharedWith: [teamMembers[0], teamMembers[1], teamMembers[2]],
  },
  // AI Bot Development Lab
  {
    id: "nb-3",
    name: "Arqos v2.0 Architecture",
    cluster: "AI Bot Development Lab",
    description: "Multi-layer architecture, API integrations, deployment pipeline",
    lastUpdated: new Date("2026-03-12T11:00:00"),
    sourceCount: 15,
    sources: [
      { id: "s-6", name: "Architecture Diagram.pdf", type: "pdf", addedAt: new Date("2026-03-10") },
      { id: "s-7", name: "API Specification.doc", type: "doc", addedAt: new Date("2026-03-09") },
      { id: "s-8", name: "Tech Stack Decision.doc", type: "doc", addedAt: new Date("2026-03-07") },
    ],
    sharedWith: [teamMembers[0], teamMembers[1], teamMembers[2], teamMembers[3]],
  },
  {
    id: "nb-4",
    name: "Prompt Engineering Playbook",
    cluster: "AI Bot Development Lab",
    description: "System prompts, persona tuning, card generation templates",
    lastUpdated: new Date("2026-03-11T16:45:00"),
    sourceCount: 9,
    sources: [
      { id: "s-9", name: "System Prompts Collection.doc", type: "doc", addedAt: new Date("2026-03-11") },
      { id: "s-10", name: "Prompt Testing Results.spreadsheet", type: "spreadsheet", addedAt: new Date("2026-03-10") },
    ],
    sharedWith: [teamMembers[0], teamMembers[2]],
  },
  // DLD Intelligence Hub
  {
    id: "nb-5",
    name: "DLD Transaction Analytics",
    cluster: "DLD Intelligence Hub",
    description: "Transaction volume trends, buyer demographics, zone performance",
    lastUpdated: new Date("2026-03-11T08:30:00"),
    sourceCount: 22,
    sources: [
      { id: "s-11", name: "DLD Raw Data Q1.spreadsheet", type: "spreadsheet", addedAt: new Date("2026-03-11") },
      { id: "s-12", name: "Transaction Trends Report.pdf", type: "pdf", addedAt: new Date("2026-03-09") },
    ],
    sharedWith: [teamMembers[0], teamMembers[1], teamMembers[2], teamMembers[3]],
  },
  {
    id: "nb-6",
    name: "Zone Classification Model",
    cluster: "DLD Intelligence Hub",
    description: "Core, Waterfront, MBR City, Suburbs, Dubai South — zone definitions and metrics",
    lastUpdated: new Date("2026-03-09T13:20:00"),
    sourceCount: 7,
    sources: [
      { id: "s-13", name: "Zone Mapping.spreadsheet", type: "spreadsheet", addedAt: new Date("2026-03-01") },
    ],
    sharedWith: [teamMembers[0], teamMembers[2]],
  },
  // Market Intelligence
  {
    id: "nb-7",
    name: "Competitor Landscape Analysis",
    cluster: "Market Intelligence",
    description: "Major brokerages, market share, pricing strategies, digital presence",
    lastUpdated: new Date("2026-03-08T10:00:00"),
    sourceCount: 11,
    sources: [
      { id: "s-14", name: "Competitor Matrix.spreadsheet", type: "spreadsheet", addedAt: new Date("2026-03-07") },
      { id: "s-15", name: "Market Share Report.pdf", type: "pdf", addedAt: new Date("2026-03-05") },
    ],
    sharedWith: [teamMembers[0], teamMembers[1], teamMembers[2]],
  },
  {
    id: "nb-8",
    name: "Developer Pipeline Tracker",
    cluster: "Market Intelligence",
    description: "Emaar, DAMAC, Nakheel, Sobha — upcoming launches, handovers, pricing",
    lastUpdated: new Date("2026-03-10T15:30:00"),
    sourceCount: 14,
    sources: [
      { id: "s-16", name: "Emaar Launch Calendar.pdf", type: "pdf", addedAt: new Date("2026-03-10") },
      { id: "s-17", name: "DAMAC Project Updates.doc", type: "doc", addedAt: new Date("2026-03-08") },
    ],
    sharedWith: [teamMembers[0], teamMembers[1], teamMembers[3]],
  },
  // Realco Operations
  {
    id: "nb-9",
    name: "Inventory Management SOPs",
    cluster: "Realco Operations",
    description: "Listing workflows, pricing guidelines, photography standards",
    lastUpdated: new Date("2026-03-07T11:15:00"),
    sourceCount: 6,
    sources: [
      { id: "s-18", name: "SOP Document.pdf", type: "pdf", addedAt: new Date("2026-02-28") },
    ],
    sharedWith: [teamMembers[0], teamMembers[2], teamMembers[3]],
  },
  {
    id: "nb-10",
    name: "CRM & Lead Management",
    cluster: "Realco Operations",
    description: "Lead scoring model, follow-up cadences, conversion metrics",
    lastUpdated: new Date("2026-03-09T09:45:00"),
    sourceCount: 10,
    sources: [
      { id: "s-19", name: "CRM Workflow.pdf", type: "pdf", addedAt: new Date("2026-03-01") },
      { id: "s-20", name: "Lead Scoring Matrix.spreadsheet", type: "spreadsheet", addedAt: new Date("2026-02-25") },
    ],
    sharedWith: [teamMembers[0], teamMembers[2], teamMembers[3]],
  },
  // App & Infrastructure
  {
    id: "nb-11",
    name: "Deployment & CI/CD",
    cluster: "App & Infrastructure",
    description: "Vercel deployment, GitHub Actions, environment configs",
    lastUpdated: new Date("2026-03-12T08:00:00"),
    sourceCount: 5,
    sources: [
      { id: "s-21", name: "Deployment Guide.doc", type: "doc", addedAt: new Date("2026-03-10") },
    ],
    sharedWith: [teamMembers[0], teamMembers[2]],
  },
  {
    id: "nb-12",
    name: "API Integrations Reference",
    cluster: "App & Infrastructure",
    description: "Vertex AI, BigQuery, Base44, Databricks — integration specs",
    lastUpdated: new Date("2026-03-11T14:30:00"),
    sourceCount: 8,
    sources: [
      { id: "s-22", name: "API Keys & Endpoints.doc", type: "doc", addedAt: new Date("2026-03-11") },
      { id: "s-23", name: "Integration Architecture.pdf", type: "pdf", addedAt: new Date("2026-03-08") },
    ],
    sharedWith: [teamMembers[0], teamMembers[1], teamMembers[2]],
  },
  // Client Intelligence
  {
    id: "nb-13",
    name: "High-Value Client Profiles",
    cluster: "Client Intelligence",
    description: "Top 50 clients, portfolio analysis, preference mapping",
    lastUpdated: new Date("2026-03-10T16:00:00"),
    sourceCount: 18,
    sources: [
      { id: "s-24", name: "Client Portfolio Data.spreadsheet", type: "spreadsheet", addedAt: new Date("2026-03-10") },
      { id: "s-25", name: "Preference Survey Results.pdf", type: "pdf", addedAt: new Date("2026-03-07") },
    ],
    sharedWith: [teamMembers[0], teamMembers[1], teamMembers[3]],
  },
  {
    id: "nb-14",
    name: "Buyer Nationality Trends",
    cluster: "Client Intelligence",
    description: "Investor demographics, nationality-based demand patterns, visa impact",
    lastUpdated: new Date("2026-03-08T12:30:00"),
    sourceCount: 9,
    sources: [
      { id: "s-26", name: "Nationality Analysis.pdf", type: "pdf", addedAt: new Date("2026-03-06") },
      { id: "s-27", name: "Visa Policy Impact.doc", type: "doc", addedAt: new Date("2026-03-02") },
    ],
    sharedWith: [teamMembers[0], teamMembers[1], teamMembers[2]],
  },
];

export const notebookClusters = [
  "SLT Command Center",
  "AI Bot Development Lab",
  "DLD Intelligence Hub",
  "Market Intelligence",
  "Realco Operations",
  "App & Infrastructure",
  "Client Intelligence",
];

// ── Podcast Studio Mock Data ──────────────────────────────

export const podcastVoices: PodcastVoice[] = [
  { id: "charon", name: "Arqos", label: "Arqos (Charon)", description: "Authoritative, data-driven intelligence voice" },
  { id: "fenrir", name: "Talha", label: "Talha (Fenrir)", description: "Strategic, visionary leadership voice" },
];

export const mockPodcastEpisodes: PodcastEpisode[] = [
  {
    id: "ep-1",
    topic: "Q1 2026 Dubai Market Review: Where Are Prices Heading?",
    voice1: "charon",
    voice2: "fenrir",
    createdAt: new Date("2026-03-10T10:00:00"),
    duration: "12:34",
    status: "ready",
    script: [
      { speaker: "Arqos", voice: "charon", text: "Welcome to the Realco Intelligence Podcast. Today we're diving into the Q1 2026 Dubai real estate market. The numbers are in, and there are some fascinating trends emerging." },
      { speaker: "Talha", voice: "fenrir", text: "Absolutely. What stands out to me is the continued resilience in transaction volumes. We're seeing 14% year-over-year growth, which is remarkable given the global economic headwinds." },
      { speaker: "Arqos", voice: "charon", text: "Let me break down the data. Dubai Marina continues to lead with 2,340 transactions this quarter, averaging AED 1,850 per square foot. That's a 12.4% increase from last year." },
      { speaker: "Talha", voice: "fenrir", text: "And the off-plan segment is where the real action is. Developers like Emaar and DAMAC are seeing absorption rates north of 80% within the first week of launches." },
      { speaker: "Arqos", voice: "charon", text: "The MBR City zone deserves special attention. District One and Dubai Hills Estate are showing 18% quarter-over-quarter growth. The villa segment is particularly strong." },
      { speaker: "Talha", voice: "fenrir", text: "For investors, I'd say the sweet spot right now is the AED 2-5 million range in established communities. Rental yields are stable at 6-8%, and capital appreciation is outpacing most global markets." },
    ],
  },
  {
    id: "ep-2",
    topic: "Palm Jumeirah vs Dubai Marina: Investment Deep Dive",
    voice1: "charon",
    voice2: "fenrir",
    createdAt: new Date("2026-03-07T14:00:00"),
    duration: "15:21",
    status: "ready",
    script: [
      { speaker: "Arqos", voice: "charon", text: "Today's episode is a head-to-head comparison that our clients ask about constantly: Palm Jumeirah versus Dubai Marina. Two iconic communities, very different investment profiles." },
      { speaker: "Talha", voice: "fenrir", text: "Great topic. Let's start with Palm. It's the trophy asset — limited supply, ultra-premium positioning. Average prices are sitting around AED 3,200 per square foot for apartments." },
      { speaker: "Arqos", voice: "charon", text: "Compared to Dubai Marina at AED 1,850 per square foot. But here's where it gets interesting — Marina's transaction volume is nearly 4x higher. Liquidity matters." },
      { speaker: "Talha", voice: "fenrir", text: "That's a crucial point. Palm is a buy-and-hold play. Marina is where you get both yield and exit flexibility. Different strategies for different investor profiles." },
    ],
  },
  {
    id: "ep-3",
    topic: "The Rise of AI in Dubai Real Estate",
    voice1: "charon",
    voice2: "fenrir",
    createdAt: new Date("2026-03-03T11:30:00"),
    duration: "10:45",
    status: "ready",
    script: [
      { speaker: "Arqos", voice: "charon", text: "In this episode, we're examining how artificial intelligence is transforming the Dubai real estate landscape. And yes, I have a personal stake in this topic." },
      { speaker: "Talha", voice: "fenrir", text: "Ha! You certainly do. But jokes aside, the adoption curve for AI in real estate here has been phenomenal. We're seeing it in everything from property valuation to lead scoring." },
      { speaker: "Arqos", voice: "charon", text: "The DLD itself has been pioneering in this space. Their smart services and blockchain-based transactions have set the stage for AI-powered market intelligence." },
      { speaker: "Talha", voice: "fenrir", text: "And that's exactly what we're building at Realco. Arqos isn't just a chatbot — it's an intelligence layer that processes years of transaction data to surface actionable insights." },
    ],
  },
];

// ── Admin Panel Mock Data ─────────────────────────────────

export const mockUsers: UserAccount[] = [
  {
    id: "user-1",
    name: "Irfan",
    email: "irfan@realcocapital.com",
    role: "Admin",
    status: "active",
    lastActive: new Date("2026-03-12T09:00:00"),
    permissions: { chat: true, notebooks: true, podcast: true, admin: true, crud: true },
  },
  {
    id: "user-2",
    name: "Talha",
    email: "talha@realcocapital.com",
    role: "Owner",
    status: "active",
    lastActive: new Date("2026-03-12T08:30:00"),
    permissions: { chat: true, notebooks: true, podcast: true, admin: true, crud: true },
  },
  {
    id: "user-3",
    name: "Gibran",
    email: "gibran@realcocapital.com",
    role: "Team Lead",
    status: "active",
    lastActive: new Date("2026-03-11T17:45:00"),
    permissions: { chat: true, notebooks: true, podcast: true, admin: false, crud: false },
  },
  {
    id: "user-4",
    name: "Qasim",
    email: "qasim@realcocapital.com",
    role: "Agent",
    status: "active",
    lastActive: new Date("2026-03-12T07:15:00"),
    permissions: { chat: true, notebooks: true, podcast: false, admin: false, crud: false },
  },
];

export const mockDataSources: DataSource[] = [
  {
    id: "ds-0",
    name: "Google Vertex AI",
    type: "AI Engine — realco.ai",
    status: "connected",
    lastSync: new Date(),
    description: "Gemini models, Agent Builder, RAG Engine, Vector Search — Project: precise-office-485714-i8 (me-central1)",
  },
  {
    id: "ds-1",
    name: "Databricks",
    type: "DLD Data Pipeline",
    status: "connected",
    lastSync: new Date("2026-03-12T08:00:00"),
    description: "Dubai Land Department transaction data — 641K+ units tracked",
  },
  {
    id: "ds-2",
    name: "Base44",
    type: "Inventory Management",
    status: "connected",
    lastSync: new Date("2026-03-12T07:30:00"),
    description: "Realco property inventory — listings, availability, pricing",
  },
  {
    id: "ds-3",
    name: "BigQuery",
    type: "Analytics Warehouse",
    status: "connected",
    lastSync: new Date("2026-03-11T23:00:00"),
    description: "Consolidated analytics — market metrics, agent performance, client data",
  },
  {
    id: "ds-6",
    name: "Google Cloud Storage",
    type: "File Storage",
    status: "connected",
    lastSync: new Date("2026-03-13T10:00:00"),
    description: "GCS buckets for media assets, documents, and model artifacts — realco.ai org",
  },
  {
    id: "ds-4",
    name: "NotebookLM",
    type: "Knowledge Base",
    status: "connected",
    lastSync: new Date("2026-03-13T11:00:00"),
    description: "Google NotebookLM via Vertex AI — 7 intelligence clusters active",
  },
  {
    id: "ds-5",
    name: "Manus CRM",
    type: "Client Management",
    status: "syncing",
    lastSync: new Date("2026-03-12T06:00:00"),
    description: "Lead management, deal pipeline, client communications",
  },
];

export const mockAuditLog: AuditEntry[] = [
  {
    id: "audit-1",
    timestamp: new Date("2026-03-12T09:15:23"),
    user: "Irfan",
    query: "Give me today's Dubai real estate market overview",
    model: "gemini_3_flash",
    tokensUsed: 1847,
    responseTime: 2340,
    status: "success",
  },
  {
    id: "audit-2",
    timestamp: new Date("2026-03-12T09:02:11"),
    user: "Talha",
    query: "What are the latest DLD transaction trends for Palm Jumeirah?",
    model: "gemini_3_flash",
    tokensUsed: 2156,
    responseTime: 3120,
    status: "success",
  },
  {
    id: "audit-3",
    timestamp: new Date("2026-03-12T08:45:07"),
    user: "Gibran",
    query: "Show me top performing agents this month",
    model: "gemini_3_flash",
    tokensUsed: 1234,
    responseTime: 1890,
    status: "success",
  },
  {
    id: "audit-4",
    timestamp: new Date("2026-03-12T08:30:45"),
    user: "Qasim",
    query: "Search for 3BR apartments in Dubai Hills under AED 3M",
    model: "gemini_3_flash",
    tokensUsed: 1678,
    responseTime: 2560,
    status: "success",
  },
  {
    id: "audit-5",
    timestamp: new Date("2026-03-12T08:15:33"),
    user: "Irfan",
    query: "Generate competitor analysis report for Business Bay",
    model: "sonar",
    tokensUsed: 3421,
    responseTime: 4200,
    status: "success",
  },
  {
    id: "audit-6",
    timestamp: new Date("2026-03-12T07:58:19"),
    user: "Talha",
    query: "What's the ROI comparison between JVC and Al Furjan?",
    model: "gemini_3_flash",
    tokensUsed: 1956,
    responseTime: 2780,
    status: "success",
  },
  {
    id: "audit-7",
    timestamp: new Date("2026-03-11T23:42:08"),
    user: "Gibran",
    query: "Update inventory for Marina Gate Tower 2",
    model: "gemini_3_flash",
    tokensUsed: 890,
    responseTime: 1200,
    status: "error",
  },
  {
    id: "audit-8",
    timestamp: new Date("2026-03-11T22:15:55"),
    user: "Irfan",
    query: "Run full market analysis for Dubai South zone",
    model: "sonar",
    tokensUsed: 4102,
    responseTime: 5340,
    status: "success",
  },
];

export const defaultAdminConfig: AdminConfig = {
  systemPrompt: "",
  model: "gemini_3_flash",
  temperature: 0.7,
  maxTokens: 4096,
};
