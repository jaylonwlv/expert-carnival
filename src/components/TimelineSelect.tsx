"use client";

import { ActionForm } from "@/components/ActionForm";
import { TIMELINE_LABELS, TIMELINE_ORDER, type Timeline } from "@/lib/timeline";

// Pulled out of the client detail page (a Server Component) into its own
// "use client" file — an onChange handler authored inside a Server
// Component can't cross into a Client Component even as ActionForm's
// children, since the closure itself isn't serializable. React Server
// Components only allow that boundary crossing for Server Actions (like
// `action` below, already handled specially), not plain event handlers.
export function TimelineSelect({
  value,
  action,
}: {
  value: Timeline | null;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <ActionForm action={action} toastMessage="Timeline updated.">
      <select
        name="timeline"
        defaultValue={value ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="text-xs text-stone-500 border border-stone-200 rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-amber-600"
      >
        <option value="">Timeline: unknown</option>
        {TIMELINE_ORDER.map((t) => (
          <option key={t} value={t}>
            {TIMELINE_LABELS[t]}
          </option>
        ))}
      </select>
    </ActionForm>
  );
}
