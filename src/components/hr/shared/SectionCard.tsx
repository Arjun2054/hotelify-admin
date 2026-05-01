// src/components/hr/shared/SectionCard.tsx

import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className,
  noPadding,
}: SectionCardProps) {
  return (
    <div
      className={cn("bg-white rounded-xl border border-slate-200", className)}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className={cn(!noPadding && "p-5")}>{children}</div>
    </div>
  );
}
