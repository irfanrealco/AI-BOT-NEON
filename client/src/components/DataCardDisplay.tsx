import { X, Pin, TrendingUp, FileText, Lightbulb, Home, BarChart3, Table2 } from "lucide-react";
import type { DataCard } from "@/lib/types";

const cardIcons: Record<DataCard["type"], any> = {
  market: TrendingUp,
  property: Home,
  transaction: FileText,
  insight: Lightbulb,
  chart: BarChart3,
  table: Table2,
};

const cardAccentColors: Record<DataCard["type"], string> = {
  market: "border-l-[hsl(var(--gold))]",
  property: "border-l-[hsl(155,50%,35%)]",
  transaction: "border-l-[hsl(200,60%,50%)]",
  insight: "border-l-[hsl(var(--gold))]",
  chart: "border-l-[hsl(270,50%,55%)]",
  table: "border-l-[hsl(var(--muted-foreground))]",
};

interface DataCardDisplayProps {
  card: DataCard;
  onClose?: () => void;
  onPin?: (card: DataCard) => void;
  compact?: boolean;
}

export function DataCardDisplay({ card, onClose, onPin, compact }: DataCardDisplayProps) {
  const Icon = cardIcons[card.type] || FileText;

  return (
    <div
      className={`card-animate-in bg-card border border-card-border rounded-lg overflow-hidden border-l-[3px] ${cardAccentColors[card.type]} ${
        compact ? "p-3" : "p-4"
      }`}
      data-testid={`data-card-${card.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center shrink-0">
            <Icon className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold truncate">{card.title}</h4>
            {card.subtitle && (
              <p className="text-xs text-muted-foreground truncate">{card.subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onPin && (
            <button
              onClick={() => onPin(card)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
              data-testid={`pin-card-${card.id}`}
              aria-label="Save to sidebar"
            >
              <Pin className={`w-3 h-3 ${card.pinned ? "text-primary fill-primary" : "text-muted-foreground"}`} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
              data-testid={`close-card-${card.id}`}
              aria-label="Close card"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Body — dynamic based on card type */}
      <div className={`${compact ? "text-xs" : "text-sm"}`}>
        {card.type === "market" && <MarketCardBody data={card.data} />}
        {card.type === "transaction" && <TransactionCardBody data={card.data} />}
        {card.type === "insight" && <InsightCardBody data={card.data} />}
        {card.type === "property" && <PropertyCardBody data={card.data} />}
      </div>
    </div>
  );
}

function MarketCardBody({ data }: { data: Record<string, any> }) {
  const metrics = [
    { label: "Avg Price", value: data.avgPrice },
    { label: "Volume", value: data.txVolume },
    { label: "YoY Growth", value: data.yoyGrowth },
    { label: "Days on Market", value: data.medianDays },
    { label: "Top Project", value: data.topProject },
    { label: "Active Listings", value: data.inventory },
  ];
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {metrics.map((m) => (
        <div key={m.label}>
          <span className="text-muted-foreground text-xs">{m.label}</span>
          <p className="font-medium">{m.value}</p>
        </div>
      ))}
    </div>
  );
}

function TransactionCardBody({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-1.5">
      {data.transactions?.map((tx: any, i: number) => (
        <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
          <div className="min-w-0">
            <p className="font-medium truncate">{tx.project}</p>
            <p className="text-xs text-muted-foreground">{tx.type} — {tx.date}</p>
          </div>
          <span className="font-semibold text-primary shrink-0 ml-3">{tx.value}</span>
        </div>
      ))}
    </div>
  );
}

function InsightCardBody({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-2.5">
      <p className="leading-relaxed text-foreground/90">{data.summary}</p>
      {data.recommendation && (
        <div className="bg-secondary/50 rounded-md px-3 py-2 border border-border/50">
          <span className="text-xs font-medium text-primary">Recommendation:</span>
          <p className="text-sm mt-0.5">{data.recommendation}</p>
        </div>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Confidence: {data.confidence}
        </span>
        <span>Sources: {data.sources?.join(", ")}</span>
      </div>
    </div>
  );
}

function PropertyCardBody({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <div>
          <span className="text-xs text-muted-foreground">Bedrooms</span>
          <p className="font-medium">{data.bedrooms}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">BUA</span>
          <p className="font-medium">{data.bua}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Price</span>
          <p className="font-semibold text-primary">{data.price}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Price/sqft</span>
          <p className="font-medium">{data.pricePerSqft}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border/50">
        <span className="text-muted-foreground">{data.developer} — {data.view}</span>
        <span className={`px-2 py-0.5 rounded-full font-medium ${
          data.status === "Available"
            ? "bg-green-500/10 text-green-600 dark:text-green-400"
            : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
        }`}>
          {data.status}
        </span>
      </div>
    </div>
  );
}
