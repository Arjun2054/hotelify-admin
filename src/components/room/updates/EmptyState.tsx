// src/components/ui/EmptyState.tsx
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

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
        size === "md" && "py-12 px-6",
        size === "lg" && "py-20 px-8",
        className,
      )}
    >
      <div className="rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
        <Icon
          className={cn(
            "text-gray-400 dark:text-gray-500",
            size === "sm" && "h-6 w-6",
            size === "md" && "h-8 w-8",
            size === "lg" && "h-12 w-12",
          )}
        />
      </div>
      <h3
        className={cn(
          "mt-4 font-semibold text-gray-900 dark:text-gray-100",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-lg",
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "mt-2 text-gray-500 dark:text-gray-400 max-w-sm",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-sm",
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
