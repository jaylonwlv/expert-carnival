"use client";

export function ConfirmSubmitButton({
  action,
  confirmMessage,
  label,
  className,
}: {
  action: () => void;
  confirmMessage: string;
  label: string;
  className?: string;
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
      <button
        type="submit"
        className={className ?? "text-sm text-red-600 hover:text-red-700 hover:underline px-2 py-1"}
      >
        {label}
      </button>
    </form>
  );
}
