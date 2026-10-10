import Link from "next/link";
import { createClient } from "../../actions";

export default function NewClientPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-md px-2.5 py-2 -ml-2.5 hover:bg-stone-100 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            Back to clients
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-stone-900 mb-6">Add a client</h1>
        <form action={createClient} className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
              Full name
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
              Email (optional)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1">
              Phone (optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="isPCS" className="rounded" />
            PCS / military relocation (VA loan checklist)
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-amber-600 text-white text-sm font-medium py-2.5 shadow-sm hover:shadow-md hover:bg-amber-700 transition"
          >
            Create client & tracker link
          </button>
        </form>
      </main>
    </div>
  );
}
