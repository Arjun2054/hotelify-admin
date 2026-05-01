import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onRefresh?: () => void;
}

export function Header({ title, subtitle, actions, onRefresh }: HeaderProps) {
  return (
    <header className="relative flex flex-wrap items-center justify-between gap-y-2 min-h-[60px] px-4 py-3 sm:px-8 sm:py-0 sm:h-[60px] font-mono">
      {/* Left accent line */}
      <div className="absolute left-0 top-[20%] h-[60%] w-[2px]" />

      {/* Title Section */}
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h1 className="text-sm uppercase tracking-[0.12em] text-black font-medium truncate">
          {title}
        </h1>

        {subtitle && (
          <>
            <span className="text-black/20 text-xs hidden sm:inline">/</span>
            <p className="text-xs tracking-[0.06em] text-black/40 truncate max-w-[180px] sm:max-w-none w-full sm:w-auto">
              {subtitle}
            </p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {onRefresh && (
          <Button onClick={onRefresh} title="Refresh">
            <RefreshCw size={14} />
          </Button>
        )}
        {actions}
      </div>
    </header>
  );
}
