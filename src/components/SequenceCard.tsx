"use client";

import { SequenceDate, Countdown } from "@/lib/sequences";
import CountdownDisplay from "./CountdownDisplay";

interface Props {
  sequence: SequenceDate;
  countdown: Countdown;
  index: number;
  onClick: () => void;
}

const CARD_GRADIENTS = [
  "from-violet-900/60 to-indigo-900/60 border-violet-700/40",
  "from-blue-900/60 to-cyan-900/60 border-blue-700/40",
  "from-fuchsia-900/60 to-purple-900/60 border-fuchsia-700/40",
  "from-rose-900/60 to-pink-900/60 border-rose-700/40",
  "from-amber-900/60 to-orange-900/60 border-amber-700/40",
];

const ACCENT_COLORS = [
  "text-violet-400",
  "text-cyan-400",
  "text-fuchsia-400",
  "text-rose-400",
  "text-amber-400",
];

const GLOW_COLORS = [
  "shadow-violet-900/30",
  "shadow-cyan-900/30",
  "shadow-fuchsia-900/30",
  "shadow-rose-900/30",
  "shadow-amber-900/30",
];

const BADGE_COLORS = [
  "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
];

const EMOJIS = ["✨", "🎯", "💫", "⚡", "🔮", "🌟", "🎆", "🌀", "🔥", "💥", "🌌", "🎇"];

export default function SequenceCard({ sequence, countdown, index, onClick }: Props) {
  const grad = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const glow = GLOW_COLORS[index % GLOW_COLORS.length];
  const badge = BADGE_COLORS[index % BADGE_COLORS.length];
  const emoji = EMOJIS[(sequence.month - 1) % EMOJIS.length];

  const n = sequence.month;
  const pad = (v: number) => String(v).padStart(2, "0");

  // Sequence pattern display  e.g.  "10 · 10 · 10:10"
  const pattern = `${pad(n)}/${pad(n)}  ${pad(n)}:${pad(n)}`;

  const isNearby = countdown.total < 3600; // within 1 hour

  return (
    <button
      id={`sequence-card-${index}`}
      onClick={onClick}
      className={`
        group relative w-full text-left
        bg-gradient-to-br ${grad}
        border backdrop-blur-sm
        rounded-2xl p-5
        shadow-xl ${glow}
        transition-all duration-200
        hover:scale-[1.01] hover:shadow-2xl
        active:scale-[0.99]
        focus:outline-none focus:ring-2 focus:ring-violet-500/60
      `}
    >
      {/* Shine overlay */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {/* Pulsing indicator if nearby */}
      {isNearby && (
        <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <p className="text-white font-bold text-base leading-tight">
              {sequence.label}
            </p>
            <p className={`font-mono text-xs mt-0.5 ${accent} tracking-widest`}>
              {pattern}
            </p>
          </div>
        </div>

        {/* Tap hint */}
        <span
          className={`
            flex-shrink-0 self-start
            text-[10px] uppercase tracking-widest font-semibold
            border rounded-full px-2 py-0.5
            ${badge}
          `}
        >
          Set reminder
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 mb-4" />

      {/* Countdown */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">
            Time remaining
          </p>
          <CountdownDisplay countdown={countdown} />
        </div>

        {/* Arrow */}
        <div className={`${accent} opacity-40 group-hover:opacity-80 group-hover:translate-x-1 transition-all duration-200`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Full date */}
      <p className="text-slate-500 text-[11px] mt-3">
        {sequence.date.toLocaleString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </button>
  );
}
