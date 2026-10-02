"use client";

import { Countdown } from "@/lib/sequences";

interface Props {
  countdown: Countdown;
  compact?: boolean;
}

export default function CountdownDisplay({ countdown, compact = false }: Props) {
  const { days, hours, minutes, seconds } = countdown;

  if (compact) {
    return (
      <span className="font-mono text-sm text-violet-300 tracking-wide">
        {days > 0 && <>{pad(days)}d </>}
        {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
      </span>
    );
  }

  return (
    <div className="flex items-end gap-3">
      {days > 0 && <Unit value={days} label="days" />}
      <Unit value={hours} label="hrs" />
      <Unit value={minutes} label="min" />
      <Unit value={seconds} label="sec" highlight />
    </div>
  );
}

function Unit({
  value,
  label,
  highlight = false,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center min-w-[3rem]">
      <span
        className={`font-mono text-2xl font-bold tabular-nums leading-none ${
          highlight ? "text-violet-400" : "text-white"
        }`}
      >
        {pad(value)}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">
        {label}
      </span>
    </div>
  );
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}
