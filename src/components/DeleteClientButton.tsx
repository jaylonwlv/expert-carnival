"use client";

export function DeleteClientButton({
  action,
  clientName,
}: {
  action: () => void;
  clientName: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Remove ${clientName}? This can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-sm text-red-600 hover:text-red-700 hover:underline px-2 py-1"
      >
        Remove
      </button>
    </form>
  );
}
