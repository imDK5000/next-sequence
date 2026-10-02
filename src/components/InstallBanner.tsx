"use client";

import { useState, useCallback } from "react";
import { usePwa } from "./PwaProvider";

/**
 * Renders:
 *  • Nothing         — when already installed (standalone mode)
 *  • iOS bottom tip  — slide-up banner on iPhone/iPad Safari
 *
 * The Android/Chrome install button is rendered directly in the page header
 * via the <InstallButton> component, also consuming usePwa().
 */
export default function InstallBanner() {
  const { isStandalone, isIos } = usePwa();
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem("ios-install-tip-dismissed", "1");
    setDismissed(true);
  }, []);

  // Hide when already installed, on Android, or already dismissed this session
  if (
    isStandalone ||
    !isIos ||
    dismissed ||
    (typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem("ios-install-tip-dismissed"))
  ) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="
        fixed bottom-6 left-4 right-4 z-50 max-w-sm mx-auto
        bg-slate-800/95 backdrop-blur-md
        border border-slate-700/60
        rounded-2xl px-4 py-3.5 shadow-2xl shadow-black/50
        flex items-start gap-3
      "
      style={{ animation: "slideUp 0.35s cubic-bezier(0.32,0.72,0,1)" }}
    >
      <span className="text-2xl mt-0.5" aria-hidden="true">📲</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">Install Sequences</p>
        <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
          Tap{" "}
          <span className="inline-flex items-center gap-0.5 text-violet-300">
            {/* iOS share icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.474l6.733-3.367A2.52 2.52 0 0 1 13 4.5Z" />
            </svg>
            Share
          </span>{" "}
          then{" "}
          <span className="text-white font-medium">Add to Home Screen</span> to
          install.
        </p>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss install tip"
        className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
        </svg>
      </button>
    </div>
  );
}
