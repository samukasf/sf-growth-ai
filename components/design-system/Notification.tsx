import { cn } from "@/utils/cn";

type DsNotificationProps = {
  title: string;
  message?: string;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
};

const VARIANT_CLASS = {
  default: "",
  success: "ds-notification-success",
  warning: "ds-notification-warning",
  danger: "ds-notification-danger",
} as const;

export function DsNotification({
  title,
  message,
  variant = "default",
  className,
}: DsNotificationProps) {
  return (
    <div className={cn("ds-root ds-notification", VARIANT_CLASS[variant], className)} role="status">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--ds-text)]">{title}</p>
        {message ? <p className="mt-1 text-sm text-[var(--ds-text-muted)]">{message}</p> : null}
      </div>
    </div>
  );
}

export { DsNotification as Notification };
