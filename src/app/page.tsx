"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUpcomingSequences,
  getCountdown,
  generateIcs,
  downloadIcs,
  SequenceDate,
  Countdown,
  ReminderValue,
} from "@/lib/sequences";
import { usePwa } from "@/components/PwaProvider";
import SequenceCard from "@/components/SequenceCard";
import ReminderModal from "@/components/ReminderModal";

export default function Home() {
  const { canInstall, isStandalone, triggerInstall } = usePwa();
  const [sequences, setSequences] = useState<SequenceDate[]>([]);
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [selectedSeq, setSelectedSeq] = useState<SequenceDate | null>(null);
  const [reminderOffset, setReminderOffset] = useState<ReminderValue>("0");
  const [note, setNote] = useState("");

  // Calculate upcoming sequences once on mount
  useEffect(() => {
    const now = new Date();
    const seqs = getUpcomingSequences(now, 5);
    setSequences(seqs);
  }, []);

  // Tick every second to update countdowns
  useEffect(() => {
    if (sequences.length === 0) return;

    const tick = () => {
      const now = new Date();
      setCountdowns(sequences.map((s) => getCountdown(s.date, now)));
    };

    tick(); // immediate first tick
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sequences]);

  const handleCardClick = useCallback((seq: SequenceDate) => {
    setSelectedSeq(seq);
    setReminderOffset("0");
    setNote("");
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedSeq(null);
  }, []);

  const handleAddToCalendar = useCallback(() => {
    if (!selectedSeq) return;

    const icsContent = generateIcs(selectedSeq, reminderOffset, note);
    // Filename: e.g. "sequence-10-10.ics"
    const filename = `sequence-${String(selectedSeq.month).padStart(2, "0")}-${String(selectedSeq.day).padStart(2, "0")}.ics`;
    downloadIcs(icsContent, filename);

    // Close the modal after the download is initiated
    setSelectedSeq(null);
  }, [selectedSeq, reminderOffset, note]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Background aurora */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-900/20 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full bg-indigo-900/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-fuchsia-900/15 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-12 pb-24">
        {/* Header */}
        <header className="mb-10">
          {/* Top bar: branding + install button */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🌀</span>
              <span className="text-xs uppercase tracking-[0.2em] text-violet-400 font-semibold">
                Sequence Tracker
              </span>
            </div>

            {/* Install App button — visible only when browser supports it and app isn't installed */}
            {canInstall && !isStandalone && (
              <button
                id="install-app-btn"
                onClick={triggerInstall}
                aria-label="Install Sequence Tracker app"
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                  bg-violet-600/20 hover:bg-violet-600/30
                  border border-violet-500/40 hover:border-violet-500/60
                  text-violet-300 hover:text-violet-200
                  transition-all duration-150 active:scale-95
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z" />
                  <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
                </svg>
                Install App
              </button>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Special
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Sequence Dates
            </span>
          </h1>
          <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-sm">
            Magical moments when the date and time align perfectly —{" "}
            <span className="text-slate-300">10/10 at 10:10</span>,{" "}
            <span className="text-slate-300">11/11 at 11:11</span>, and beyond.
          </p>
        </header>

        {/* Stats pill */}
        <div className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs text-slate-400">
            Next{" "}
            <span className="text-white font-semibold">{sequences.length}</span>{" "}
            upcoming sequences
          </span>
        </div>

        {/* Card list */}
        {sequences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="text-4xl mb-3 animate-spin" style={{ animationDuration: "3s" }}>
              🌀
            </div>
            <p className="text-sm">Calculating sequences…</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sequences.map((seq, i) => (
              <SequenceCard
                key={seq.date.toISOString()}
                sequence={seq}
                countdown={countdowns[i] ?? { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }}
                index={i}
                onClick={() => handleCardClick(seq)}
              />
            ))}
          </div>
        )}

        {/* Footer note */}
        <p className="mt-10 text-center text-[11px] text-slate-600">
          Tap a card to set a reminder · Sequences repeat every year
        </p>
      </div>

      {/* Modal */}
      <ReminderModal
        sequence={selectedSeq}
        onClose={handleModalClose}
        reminderOffset={reminderOffset}
        onReminderChange={setReminderOffset}
        note={note}
        onNoteChange={setNote}
        onAddToCalendar={handleAddToCalendar}
      />
    </main>
  );
}
