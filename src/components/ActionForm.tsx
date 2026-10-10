"use client";

import { useActionState, type ReactNode } from "react";

type ActionFormState =
  | { status: "idle" }
  | { status: "success"; at: number }
  | { status: "error"; at: number; message: string };

export function ActionForm({
  action,
  toastMessage,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  toastMessage: string;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState<ActionFormState, FormData>(async (_prev, formData) => {
    try {
      await action(formData);
      return { status: "success", at: Date.now() };
    } catch (err) {
      return {
        status: "error",
        at: Date.now(),
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      };
    }
  }, { status: "idle" });

  return (
    <form action={formAction} className={className}>
      {children}
      {state.status === "success" && <SaveToast key={state.at} message={toastMessage} />}
      {state.status === "error" && <SaveToast key={state.at} message={state.message} variant="error" />}
    </form>
  );
}

export function SaveToast({ message, variant = "success" }: { message: string; variant?: "success" | "error" }) {
  return (
    <div
      className={`toast-fade fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg text-white text-sm font-medium px-4 py-3 shadow-lg ${
        variant === "error" ? "bg-red-600" : "bg-emerald-600"
      }`}
    >
      {variant === "error" ? (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {message}
    </div>
  );
}
