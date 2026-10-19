"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { STAGES } from "@/lib/stages";
import { stageColor, avatarColor, initials } from "@/lib/stageColors";
import { timeAgo } from "@/lib/format";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { PCSBadge } from "@/components/PCSBadge";
import { TimelineBadge } from "@/components/TimelineBadge";
import { CampaignBadge } from "@/components/CampaignBadge";
import { isTimeline } from "@/lib/timeline";

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  currentStage: number;
  isPCS: boolean;
  // Prisma's column is a plain String? (not an enum), so this is whatever
  // was last written to it -- isTimeline is what actually narrows it to a
  // real Timeline before TimelineBadge ever sees it.
  timeline: string | null;
  utmSource: string | null;
  updatedAt: Date;
};

const SEARCH_DEBOUNCE_MS = 300;

export function ClientList({
  clients,
  deleteAction,
  query,
  stageFilter,
  page,
  totalPages,
  hasAnyClients,
}: {
  clients: ClientRow[];
  deleteAction: (clientId: string) => void;
  // The list below is already the server-filtered, server-paginated page
  // for these three -- search and stage filtering happen in the database
  // (see admin/page.tsx) so they cover every client, not just whatever
  // page happens to be loaded in the browser right now.
  query: string;
  stageFilter: string;
  page: number;
  totalPages: number;
  hasAnyClients: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [inputValue, setInputValue] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keeps the box in sync on back/forward navigation, which bypasses the
  // debounce below entirely. Adjusting state during render (rather than in
  // an effect) avoids an extra, cascading render on every query change.
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setInputValue(query);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function navigate(next: { q?: string; stage?: string; page?: number }) {
    // Without this, a page/stage click made just after typing could be
    // immediately undone once the still-pending debounced search below
    // fires and navigates again, overwriting it back to page 1.
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const nextQuery = next.q ?? query;
    const nextStage = next.stage ?? stageFilter;
    const nextPage = next.page ?? 1;

    const params = new URLSearchParams();
    if (nextQuery) params.set("q", nextQuery);
    if (nextStage !== "all") params.set("stage", nextStage);
    if (nextPage > 1) params.set("page", String(nextPage));

    const search = params.toString();
    router.push(search ? `${pathname}?${search}` : pathname);
  }

  function handleQueryChange(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate({ q: value, page: 1 }), SEARCH_DEBOUNCE_MS);
  }

  function handleStageChange(value: string) {
    navigate({ stage: value, page: 1 });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by name, email, or phone"
            className="w-full rounded-lg border border-stone-300 pl-9 pr-3 py-2.5 text-sm text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => handleStageChange(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
        >
          <option value="all">All stages</option>
          {STAGES.map((stage, index) => (
            <option key={stage.title} value={index}>
              {stage.title}
            </option>
          ))}
        </select>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 py-16 text-center">
          <p className="text-sm text-stone-500">
            {!hasAnyClients
              ? "No clients yet. Add your first client to get started."
              : "No clients match your search."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-sm">
          {clients.map((client) => {
            const stage = STAGES[client.currentStage];
            const color = stageColor(client.currentStage);
            // 0 at "Lead" (nothing's happened yet), 100 at "Moved In" --
            // unlike the other STAGES.length usages, +1/STAGES.length would
            // show a lead who hasn't been contacted as already ~11% done.
            const progress = (client.currentStage / (STAGES.length - 1)) * 100;
            return (
              <div
                key={client.id}
                className="flex items-center gap-4 px-5 py-5 hover:bg-stone-50 transition"
              >
                <div
                  className={`flex items-center justify-center w-11 h-11 rounded-full ${avatarColor(client.name)} text-white text-sm font-semibold shrink-0`}
                >
                  {initials(client.name)}
                </div>
                <Link href={`/admin/clients/${client.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-900 truncate">{client.name}</p>
                    {client.isPCS && <PCSBadge />}
                    {isTimeline(client.timeline) && <TimelineBadge timeline={client.timeline} />}
                    {client.utmSource && <CampaignBadge source={client.utmSource} />}
                  </div>
                  <p className="text-sm text-stone-500 truncate">
                    {client.email || client.phone || "No contact info"}
                  </p>
                </Link>
                <Link href={`/admin/clients/${client.id}`} className="w-40 shrink-0 hidden sm:block">
                  <span
                    className={`inline-block text-xs font-semibold rounded-full px-2.5 py-1 mb-1.5 ${color.badgeBg} ${color.badgeText}`}
                  >
                    {stage.title}
                  </span>
                  <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color.solidBg}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </Link>
                <p className="text-xs text-stone-400 shrink-0 hidden md:block w-16 text-right">
                  {timeAgo(client.updatedAt)}
                </p>
                <ConfirmSubmitButton
                  action={deleteAction.bind(null, client.id)}
                  confirmMessage={`Remove ${client.name}? This can't be undone.`}
                  label="Remove"
                />
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => navigate({ page: page - 1 })}
              className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => navigate({ page: page + 1 })}
              className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
