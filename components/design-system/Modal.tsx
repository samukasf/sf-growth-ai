import { cn } from "@/utils/cn";

import { DsButton } from "./Button";

type DsModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onClose?: () => void;
  className?: string;
};

export function DsModal({
  open,
  title,
  description,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onClose,
  className,
}: DsModalProps) {
  if (!open) return null;

  return (
    <div className="ds-root ds-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="ds-modal-title">
      <div className={cn("ds-modal-panel", className)}>
        <div className="border-b border-[var(--ds-border)] px-6 py-5">
          <h2 id="ds-modal-title" className="ds-heading">
            {title}
          </h2>
          {description ? <p className="mt-2 ds-body-sm ds-muted">{description}</p> : null}
        </div>
        {children ? <div className="px-6 py-5">{children}</div> : null}
        <div className="flex justify-end gap-2 border-t border-[var(--ds-border)] px-6 py-4">
          <DsButton variant="secondary" onClick={onClose}>
            {cancelLabel}
          </DsButton>
          <DsButton onClick={onConfirm}>{confirmLabel}</DsButton>
        </div>
      </div>
    </div>
  );
}

export { DsModal as Modal };
