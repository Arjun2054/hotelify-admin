// frontend/src/features/fnb/components/FnbSetupWizard.tsx

import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  FNB_SERVICE_DEFINITIONS,
  type FnbServiceType,
} from "@/types/fnb.types";

interface FnbSetupWizardProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selected: FnbServiceType[]) => Promise<void>;
  alreadyCreated: string[]; // types already added to this org
  isLoading: boolean;
}

export function FnbSetupWizard({
  open,
  onClose,
  onConfirm,
  alreadyCreated,
  isLoading,
}: FnbSetupWizardProps) {
  const [selected, setSelected] = useState<Set<FnbServiceType>>(new Set());

  const available = FNB_SERVICE_DEFINITIONS.filter(
    (d) => !alreadyCreated.includes(d.type),
  );

  const toggle = (type: FnbServiceType) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(available.map((d) => d.type)));

  const clearAll = () => setSelected(new Set());

  const handleConfirm = async () => {
    if (!selected.size) return;
    await onConfirm([...selected]);
    setSelected(new Set());
  };

  const handleClose = () => {
    setSelected(new Set());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Add F&B Services
          </DialogTitle>
          <DialogDescription>
            Choose the services your property offers. You can add more or remove
            them at any time.
          </DialogDescription>
        </DialogHeader>

        {/* Selection counter */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {selected.size} of {available.length} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-primary underline-offset-2 hover:underline text-xs"
            >
              Select all
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              onClick={clearAll}
              className="text-muted-foreground underline-offset-2 hover:underline text-xs"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Service grid */}
        {available.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-medium">All services have been added.</p>
            <p className="text-sm mt-1">
              You can manage them from the services list.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
            {available.map((def) => {
              const isSelected = selected.has(def.type);
              return (
                <button
                  key={def.type}
                  type="button"
                  onClick={() => toggle(def.type)}
                  className={cn(
                    "relative text-left rounded-xl border-2 p-4 transition-all duration-200",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    "bg-linear-to-br",
                    def.color.gradient,
                    isSelected
                      ? `${def.color.border} ${def.color.ring} ring-2 shadow-md`
                      : "border-transparent hover:border-gray-200 hover:shadow-sm",
                  )}
                >
                  {/* Checkmark */}
                  <div
                    className={cn(
                      "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-gray-300 bg-white",
                    )}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex items-start gap-3 pr-6">
                    <span
                      className={cn(
                        "text-2xl w-10 h-10 flex items-center justify-center rounded-lg shrink-0",
                        def.color.icon,
                      )}
                    >
                      {def.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {def.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {def.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              selected.size === 0 || isLoading || available.length === 0
            }
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add {selected.size > 0 ? `${selected.size} ` : ""}
            Service{selected.size !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
