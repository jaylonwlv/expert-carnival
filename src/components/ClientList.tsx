"use client";

import { useState } from "react";
import Link from "next/link";
import { STAGES } from "@/lib/stages";
import { stageColor, avatarColor, initials } from "@/lib/stageColors";
import { timeAgo } from "@/lib/format";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  currentStage: number;
  updatedAt: Date;
};

export function ClientList({
  clients,
  deleteAction,
}: {
  clients: ClientRow[];
  deleteAction: (clientId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = clients.filter((client) => {
    const matchesQuery =
      normalizedQuery === "" ||
      [client.name, client.email, client.phone].some((field) =>
        field?.toLowerCase().includes(normalizedQuery)
      );
    const matchesStage = stageFilter === "all" || client.currentStage === Number(stageFilter);
    return matchesQuery && matchesStage;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or phone"
            className="w-full rounded-md border border-neutral-300 pl-9 pr-3 py-2 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <option value="all">All stages</option>
          {STAGES.map((stage, index) => (
            <option key={stage.title} value={index}>
              {stage.title}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 py-16 text-center">
          <p className="text-sm text-neutral-500">
            {clients.length === 0
              ? "No clients yet. Add your first client to get started."
              : "No clients match your search."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden shadow-sm">
          {filtered.map((client) => {
            const stage = STAGES[client.currentStage];
            const color = stageColor(client.currentStage);
            const progress = ((client.currentStage + 1) / STAGES.length) * 100;
            return (
              <div
                key={client.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition"
              >
                <div
                  className={`flex items-center justify-center w-11 h-11 rounded-full ${avatarColor(client.name)} text-white text-sm font-semibold shrink-0`}
                >
                  {initials(client.name)}
                </div>
                <Link href={`/admin/clients/${client.id}`} className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 truncate">{client.name}</p>
                  <p className="text-sm text-neutral-500 truncate">
                    {client.email || client.phone || "No contact info"}
                  </p>
                </Link>
                <Link href={`/admin/clients/${client.id}`} className="w-40 shrink-0 hidden sm:block">
                  <span
                    className={`inline-block text-xs font-semibold rounded-full px-2.5 py-1 mb-1.5 ${color.badgeBg} ${color.badgeText}`}
                  >
                    {stage.title}
                  </span>
                  <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color.solidBg}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </Link>
                <p className="text-xs text-neutral-400 shrink-0 hidden md:block w-16 text-right">
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
    </div>
  );
}
