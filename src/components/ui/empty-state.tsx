// src/components/ui/empty-state.tsx
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "sm" && "py-8 px-4",
        size === "md" && "py-14 px-6",
        size === "lg" && "py-20 px-8",
        className,
      )}
    >
      <div className="rounded-2xl bg-muted p-4">
        <Icon
          className={cn(
            "text-muted-foreground",
            size === "sm" && "h-6 w-6",
            size === "md" && "h-9 w-9",
            size === "lg" && "h-12 w-12",
          )}
        />
      </div>
      <h3
        className={cn(
          "mt-4 font-semibold",
          size === "sm" ? "text-sm" : "text-base",
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "mt-1.5 text-muted-foreground max-w-xs",
            size === "sm" ? "text-xs" : "text-sm",
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
