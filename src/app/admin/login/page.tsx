import Image from "next/image";
import { SubmitButton } from "@/components/SubmitButton";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/admin";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f4] px-4">
      <form
        action={login}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-stone-200 p-8 space-y-5"
      >
        <div className="flex flex-col items-center text-center">
          <Image src="/logo.png" alt="Relocation Engine LLC" width={680} height={546} className="h-16 w-auto mb-4" priority />
          <p className="text-sm text-stone-500">Admin sign in</p>
        </div>

        {params.error === "locked" && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            Too many attempts. Try again in a few minutes.
          </p>
        )}
        {params.error === "1" && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            Incorrect password. Try again.
          </p>
        )}

        <input type="hidden" name="next" value={next} />

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <SubmitButton
          pendingText="Signing in…"
          className="w-full rounded-lg bg-amber-600 text-white text-sm font-medium py-2.5 shadow-sm hover:shadow-md hover:bg-amber-700 transition"
        >
          Sign in
        </SubmitButton>
      </form>
    </div>
  );
}
