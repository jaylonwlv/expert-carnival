"use client";

import { useActionState, type ReactNode } from "react";

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
  const [completedAt, formAction] = useActionState<number, FormData>(async (_prev, formData) => {
    await action(formData);
    return Date.now();
  }, 0);

  return (
    <form action={formAction} className={className}>
      {children}
      {completedAt !== 0 && <SaveToast key={completedAt} message={toastMessage} />}
    </form>
  );
}

export function SaveToast({ message }: { message: string }) {
  return (
    <div className="toast-fade fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 text-white text-sm font-medium px-4 py-3 shadow-lg">
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  );
}
