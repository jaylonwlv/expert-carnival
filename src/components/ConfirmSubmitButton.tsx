"use client";

import { SubmitButton } from "@/components/SubmitButton";

export function ConfirmSubmitButton({
  action,
  confirmMessage,
  label,
  className,
  ariaLabel,
}: {
  action: () => void;
  confirmMessage: string;
  label: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <SubmitButton
        pendingText="…"
        ariaLabel={ariaLabel}
        className={
          className ??
          "rounded-md border border-red-300 bg-white text-red-700 text-sm font-medium px-3 py-2 shadow-sm hover:shadow-md hover:bg-red-50 transition"
        }
      >
        {label}
      </SubmitButton>
    </form>
  );
}
