"use client";

import { useMemo, useState } from "react";

import { SectionHeader } from "@/features/samuel-ai/components/section-header";

import {
  buildExecutiveInbox,
  filterExecutiveInboxItems,
  type BuildExecutiveInboxInput,
} from "../services/executive-inbox.service";
import { ExecutiveInboxCard } from "./ExecutiveInboxCard";
import { ExecutiveInboxFilters } from "./ExecutiveInboxFilters";
import { ExecutiveInboxSummary } from "./ExecutiveInboxSummary";
import type { ExecutiveInboxFilter, InboxStatus } from "../executive-inbox.types";

export type ExecutiveInboxProps = BuildExecutiveInboxInput;

export function ExecutiveInbox(props: ExecutiveInboxProps) {
  const [activeFilter, setActiveFilter] = useState<ExecutiveInboxFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, InboxStatus>>({});

  const { items: baseItems, summary } = useMemo(
    () => buildExecutiveInbox(props),
    [props],
  );

  const items = useMemo(
    () =>
      baseItems.map((item) => ({
        ...item,
        status: statusOverrides[item.id] ?? item.status,
      })),
    [baseItems, statusOverrides],
  );

  const filteredItems = useMemo(
    () => filterExecutiveInboxItems(items, activeFilter),
    [items, activeFilter],
  );

  const filterCounts = useMemo(() => {
    const categories: ExecutiveInboxFilter[] = [
      "all",
      "today",
      "urgent",
      "this-week",
      "marketing",
      "finance",
      "operations",
      "sales",
      "hr",
      "legal",
      "market",
      "seo",
      "google",
      "meta",
      "linkedin",
    ];

    return Object.fromEntries(
      categories.map((category) => [
        category,
        filterExecutiveInboxItems(items, category).length,
      ]),
    ) as Partial<Record<ExecutiveInboxFilter, number>>;
  }, [items]);

  const resolvedCount = items.filter(
    (item) => item.status === "resolved" || item.status === "archived",
  ).length;

  const updateStatus = (id: string, status: InboxStatus) => {
    setStatusOverrides((current) => ({ ...current, [id]: status }));
  };

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Inbox"
        description="Caixa de entrada executiva consolidando alertas, recomendações, prioridades e ações"
      />

      <ExecutiveInboxSummary summary={summary} resolvedOverride={resolvedCount} />

      <ExecutiveInboxFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={filterCounts}
      />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          {filteredItems.length} item(ns) · filtro: {activeFilter}
        </p>
        <ul className="flex max-h-[560px] flex-col gap-1.5 overflow-y-auto pr-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <ExecutiveInboxCard
                key={item.id}
                item={item}
                expanded={expandedId === item.id}
                onOpen={() =>
                  setExpandedId((current) => (current === item.id ? null : item.id))
                }
                onDelegate={() => updateStatus(item.id, "delegated")}
                onResolve={() => updateStatus(item.id, "resolved")}
                onArchive={() => updateStatus(item.id, "archived")}
                onExecute={() => updateStatus(item.id, "executing")}
              />
            ))
          ) : (
            <li className="rounded-lg border border-border/60 bg-black/10 px-3 py-4 text-center text-sm text-muted">
              Nenhum item para o filtro selecionado.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
