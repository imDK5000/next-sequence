"use client";

import { useEffect, useRef } from "react";
import { SequenceDate, REMINDER_OPTIONS, ReminderValue } from "@/lib/sequences";

interface Props {
  sequence: SequenceDate | null;
  onClose: () => void;
  reminderOffset: ReminderValue;
  onReminderChange: (val: ReminderValue) => void;
  note: string;
  onNoteChange: (val: string) => void;
  onAddToCalendar: () => void;
}

export default function ReminderModal({
  sequence,
  onClose,
  reminderOffset,
  onReminderChange,
  note,
  onNoteChange,
  onAddToCalendar,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Trap body scroll when open
  useEffect(() => {
    document.body.style.overflow = sequence ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sequence]);

  if (!sequence) return null;

  const formattedDate = sequence.date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const n = sequence.month;
  const emoji = ["✨", "🎯", "💫", "⚡", "🔮", "🌟", "🎆", "🌀", "🔥", "💥", "🌌", "🎇"][n - 1];

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      <div
        ref={sheetRef}
        className="
          relative w-full sm:max-w-md
          bg-gradient-to-b from-slate-800 to-slate-900
          border border-slate-700/60
          rounded-t-3xl sm:rounded-3xl
          shadow-2xl shadow-black/60
          overflow-hidden
        "
        style={{ animation: "slideUp 0.3s cubic-bezier(0.32,0.72,0,1)" }}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-4 border-b border-slate-700/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs uppercase tracking-widest text-violet-400 font-semibold">
                  Set Reminder
                </span>
              </div>
              <h2 className="text-white font-bold text-lg leading-tight">
                {sequence.label}
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">{formattedDate}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="
                flex-shrink-0 w-8 h-8 rounded-full
                flex items-center justify-center
                bg-slate-700 hover:bg-slate-600
                text-slate-400 hover:text-white
                transition-colors
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Reminder offset */}
          <div>
            <label
              htmlFor="reminder-select"
              className="block text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2"
            >
              Notify me
            </label>
            <div className="relative">
              <select
                id="reminder-select"
                value={reminderOffset}
                onChange={(e) => onReminderChange(e.target.value as ReminderValue)}
                className="
                  w-full appearance-none
                  bg-slate-700/60 border border-slate-600
                  text-white rounded-xl px-4 py-3 pr-10
                  focus:outline-none focus:ring-2 focus:ring-violet-500
                  transition-all cursor-pointer text-sm
                "
              >
                {REMINDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {/* Chevron */}
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 text-slate-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="note-input"
              className="block text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2"
            >
              Note to self{" "}
              <span className="normal-case text-slate-600 tracking-normal">(optional)</span>
            </label>
            <textarea
              id="note-input"
              rows={3}
              placeholder="e.g. Celebrate with a moment of gratitude 🙏"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="
                w-full resize-none
                bg-slate-700/60 border border-slate-600
                text-white placeholder-slate-500
                rounded-xl px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-violet-500
                transition-all text-sm leading-relaxed
              "
            />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 pb-6">
          <button
            id="add-to-calendar-btn"
            onClick={onAddToCalendar}
            className="
              w-full py-4 rounded-2xl font-bold text-base
              bg-gradient-to-r from-violet-600 to-indigo-600
              hover:from-violet-500 hover:to-indigo-500
              active:scale-[0.98]
              text-white shadow-lg shadow-violet-900/40
              transition-all duration-150
              flex items-center justify-center gap-2
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                clipRule="evenodd"
              />
            </svg>
            Add to Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
