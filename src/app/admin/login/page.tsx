import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/admin";

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <form
        action={login}
        className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-neutral-200 p-8 space-y-5"
      >
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Relocation Engine</h1>
          <p className="text-sm text-neutral-500 mt-1">Admin sign in</p>
        </div>

        {params.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            Incorrect password. Try again.
          </p>
        )}

        <input type="hidden" name="next" value={next} />

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-neutral-900 text-white text-sm font-medium py-2.5 hover:bg-neutral-800 transition"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
