import { cn } from "@/utils/cn";

import { dsCardClass } from "./shared";

type DsTableProps = {
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
  className?: string;
  emptyMessage?: string;
};

export function DsTable({ columns, rows, className, emptyMessage = "Sem dados." }: DsTableProps) {
  return (
    <div className={cn("ds-root overflow-x-auto", dsCardClass, className)}>
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--ds-border)] bg-[var(--ds-surface-muted)]">
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--ds-text-muted)]"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--ds-text-muted)]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-[var(--ds-border)] last:border-b-0 hover:bg-[var(--ds-surface-muted)]/60"
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-[var(--ds-text)]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export { DsTable as Table };
