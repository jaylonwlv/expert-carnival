"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

// useFormStatus works for any descendant of the <form> it's rendered in,
// with zero wiring from the form itself -- a plain <button type="submit">
// gave no feedback between a click and the server action actually
// finishing, which is exactly the "did that register?" gap that makes a
// button feel slow even when the action itself is fast.
export function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className ?? ""} disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {pending ? pendingText ?? "Saving…" : children}
    </button>
  );
}
