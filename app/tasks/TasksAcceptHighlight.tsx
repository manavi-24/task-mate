"use client";

import { useEffect } from "react";

// Client helper to ensure we can scroll/highlight even if the card
// isn't immediately in view due to images/layout.
export default function TasksAcceptHighlight({
  taskId,
}: {
  taskId: string;
}) {
  useEffect(() => {
    if (!taskId) return;
    const el = document.querySelector(`[data-task-id="${CSS.escape(taskId)}"]`);
    if (!el) return;
    // Let layout settle.
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);
    return () => window.clearTimeout(t);
  }, [taskId]);

  return null;
}
