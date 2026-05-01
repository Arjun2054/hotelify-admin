import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface MovementErrorProps {
  error: string;
  onRetry: () => void;
}

export function MovementError({ error, onRetry }: MovementErrorProps) {
  return (
    <div
      className="rounded-md bg-destructive/10 p-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle
        className="h-8 w-8 text-destructive mx-auto mb-3"
        aria-hidden="true"
      />
      <h3 className="text-lg font-semibold text-destructive mb-1">
        Failed to Load Stock Movements
      </h3>
      <p className="text-sm text-destructive/80 mb-4">{error}</p>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Try Again
      </Button>
    </div>
  );
}
