"use client";

import { useMemo, useState } from "react";

import { SectionHeader } from "@/features/samuel-ai/components/section-header";

import {
  buildExecutiveInbox,
  filterExecutiveInboxItems,
  type BuildExecutiveInboxInput,
} from "../services/executive-inbox.service";
import type { InboxActionType } from "../executive-inbox.types";
import { ExecutiveInboxCard } from "./ExecutiveInboxCard";
import { ExecutiveInboxFilters } from "./ExecutiveInboxFilters";
import { ExecutiveInboxSummary } from "./ExecutiveInboxSummary";
import type { ExecutiveInboxFilter, ExecutiveInboxItem } from "../executive-inbox.types";

export type ExecutiveInboxProps = BuildExecutiveInboxInput & {
  onInboxAction?: (item: ExecutiveInboxItem, action: InboxActionType) => void;
};

export function ExecutiveInbox({ onInboxAction, ...props }: ExecutiveInboxProps) {
  const [activeFilter, setActiveFilter] = useState<ExecutiveInboxFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { items, summary } = useMemo(
    () => buildExecutiveInbox(props),
    [props],
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

  const handleAction = (item: ExecutiveInboxItem, action: InboxActionType) => {
    onInboxAction?.(item, action);
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
                onApprove={() => handleAction(item, "approve")}
                onComplete={() => handleAction(item, "complete")}
                onDismiss={() => handleAction(item, "dismiss")}
                onDefer={() => handleAction(item, "defer")}
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
