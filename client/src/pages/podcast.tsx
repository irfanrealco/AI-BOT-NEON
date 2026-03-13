import { useState } from "react";
import {
  Mic,
  Play,
  Pause,
  Clock,
  ChevronRight,
  Loader2,
  Volume2,
  User,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { mockPodcastEpisodes, podcastVoices } from "@/lib/mock-data";
import type { PodcastEpisode, PodcastDialogueLine } from "@/lib/types";

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

export default function PodcastPage() {
  const [topic, setTopic] = useState("");
  const [voice1, setVoice1] = useState("charon");
  const [voice2, setVoice2] = useState("fenrir");
  const [generating, setGenerating] = useState(false);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>(mockPodcastEpisodes);
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  const [playing, setPlaying] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || generating) return;
    setGenerating(true);

    try {
      const res = await fetch(`${API_BASE}/api/podcast/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), voice1, voice2 }),
      });

      if (res.ok) {
        const data = await res.json();
        const newEpisode: PodcastEpisode = {
          id: `ep-${Date.now()}`,
          topic: topic.trim(),
          voice1,
          voice2,
          createdAt: new Date(),
          duration: data.duration || "~8:00",
          status: "ready",
          script: data.script || [],
        };
        setEpisodes((prev) => [newEpisode, ...prev]);
        setSelectedEpisode(newEpisode);
        setTopic("");
      }
    } catch {
      // Fallback — show error state
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" data-testid="podcast-page">
      <TopBar layerName="Podcast Studio" showRightSidebarToggle={false} />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1" data-testid="podcast-title">Podcast Studio</h2>
            <p className="text-sm text-muted-foreground">
              Generate multi-voice AI podcast episodes on Dubai real estate topics
            </p>
          </div>

          {/* Generation Panel */}
          <div className="p-5 rounded-xl border border-border bg-card mb-8" data-testid="podcast-generator">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" />
              Generate New Episode
            </h3>

            {/* Topic */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Q1 2026 Dubai Market Review: Where Are Prices Heading?"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-primary"
                data-testid="podcast-topic-input"
              />
            </div>

            {/* Voice selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Voice 1</label>
                <select
                  value={voice1}
                  onChange={(e) => setVoice1(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-primary"
                  data-testid="voice1-select"
                >
                  {podcastVoices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} — {v.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Voice 2</label>
                <select
                  value={voice2}
                  onChange={(e) => setVoice2(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-primary"
                  data-testid="voice2-select"
                >
                  {podcastVoices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} — {v.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || generating}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              data-testid="generate-episode-btn"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Generate Episode
                </>
              )}
            </button>
          </div>

          {/* Selected Episode Script View */}
          {selectedEpisode && (
            <div className="mb-8" data-testid="episode-script-view">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">{selectedEpisode.topic}</h3>
                <button
                  onClick={() => setSelectedEpisode(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                  data-testid="close-script"
                >
                  Close
                </button>
              </div>

              {/* Waveform placeholder / player */}
              <div className="p-4 rounded-xl border border-border bg-card mb-4" data-testid="podcast-player">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPlaying(!playing)}
                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
                    data-testid="play-pause-btn"
                  >
                    {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <div className="flex-1">
                    {/* Waveform visualization */}
                    <div className="flex items-center gap-[2px] h-8" data-testid="waveform">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full ${
                            playing ? "bg-primary" : "bg-muted-foreground/30"
                          } transition-colors`}
                          style={{
                            height: `${Math.max(4, Math.sin(i * 0.5) * 16 + Math.random() * 16)}px`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{selectedEpisode.duration}</span>
                  </div>
                </div>
              </div>

              {/* Script */}
              <div className="space-y-3">
                {selectedEpisode.script.map((line, idx) => (
                  <ScriptLine key={idx} line={line} index={idx} />
                ))}
              </div>
            </div>
          )}

          {/* Episode Library */}
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" data-testid="episode-library-title">
              <Clock className="w-4 h-4 text-primary" />
              Episode Library ({episodes.length})
            </h3>
            <div className="space-y-3">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEpisode(ep)}
                  className={`w-full text-left p-4 rounded-xl border bg-card hover:border-primary/30 transition-all group ${
                    selectedEpisode?.id === ep.id ? "border-primary/40" : "border-border"
                  }`}
                  data-testid={`episode-${ep.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate mb-1">{ep.topic}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ep.duration}
                        </span>
                        <span>{ep.createdAt.toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {getVoiceLabel(ep.voice1)} + {getVoiceLabel(ep.voice2)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </button>
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

// ── Script Line Component ─────────────────────────────────

function ScriptLine({ line, index }: { line: PodcastDialogueLine; index: number }) {
  const isArqos = line.voice === "charon";
  return (
    <div
      className={`flex gap-3 p-3 rounded-lg border border-border ${
        isArqos ? "bg-primary/5" : "bg-secondary/50"
      }`}
      data-testid={`script-line-${index}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
          isArqos
            ? "bg-primary/20 text-primary"
            : "bg-secondary text-muted-foreground"
        }`}
      >
        {line.speaker[0]}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {line.speaker}
        </span>
        <p className="text-sm mt-0.5 leading-relaxed">{line.text}</p>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────

function getVoiceLabel(voiceId: string): string {
  const voice = podcastVoices.find((v) => v.id === voiceId);
  return voice?.name || voiceId;
}
