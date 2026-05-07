import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Loader2,
  Clock,
  BookOpen,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { OrgFnbServiceEntry } from "@/services/fnb/fnbService";
import { getServiceDef } from "@/types/fnb.types";

interface OrgServiceCardProps {
  entry: OrgFnbServiceEntry;
  onToggle: (serviceId: string) => Promise<void>;
  onRemove: (serviceId: string) => Promise<void>;
  isToggling: boolean;
  isManager: boolean;
}

export function OrgServiceCard({
  entry,
  onToggle,
  onRemove,
  isToggling,
  isManager,
}: OrgServiceCardProps) {
  const [showRemoveAlert, setShowRemoveAlert] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const def = getServiceDef(entry.type);
  const svc = entry.orgService!;
  const isEnabled = svc.isEnabled;

  const handleRemove = async () => {
    if (!isManager) return; // guard: never execute for non-managers
    setIsRemoving(true);
    try {
      await onRemove(svc.id);
    } finally {
      setIsRemoving(false);
      setShowRemoveAlert(false);
    }
  };

  const handleToggle = () => {
    if (!isManager) return; // guard: never execute for non-managers
    onToggle(svc.id);
  };

  return (
    <>
      <Card
        className={cn(
          "relative border-2 bg-linear-to-br transition-all duration-300 overflow-hidden",
          def.color.gradient,
          def.color.border,
          // non-managers see a flat, non-interactive presentation
          isEnabled ? `ring-2 ${def.color.ring} shadow-sm` : "opacity-75",
          !isManager && "cursor-default",
        )}
      >
        {/* Active indicator — only meaningful visual, not tied to role */}
        {isEnabled && (
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-0.5",
              "bg-linear-to-r from-transparent to-transparent",
            )}
          />
        )}

        <CardHeader className="pb-2 pt-4">
          <div className="flex items-start justify-between gap-2">
            {/* ── Icon + name ───────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center text-2xl",
                  "border border-black/5 bg-white/60 shrink-0",
                )}
              >
                {def.icon}
              </span>

              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {svc.name}
                </p>

                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {/* Status badge — always visible, accurately reflects state */}
                  <Badge
                    className={cn(
                      "text-[10px] h-4 px-1.5 border-0",
                      isEnabled
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500",
                    )}
                  >
                    {isEnabled ? "Active" : "Inactive"}
                  </Badge>

                  <span className="text-[10px] text-muted-foreground">
                    {entry.type.replace(/_/g, " ")}
                  </span>

                  {/* Read-only badge for non-managers */}
                </div>
              </div>
            </div>

            {/* ── Actions — manager vs viewer ───────────────────────────────── */}
            <div className="flex items-center gap-1 shrink-0">
              {isManager ? (
                // ── MANAGER: full interactive controls ──────────────────────
                <>
                  {isToggling ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={handleToggle}
                      aria-label={`Toggle ${svc.name}`}
                      className={
                        isEnabled ? "data-[state=checked]:bg-green-500" : ""
                      }
                    />
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Service options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      {/* Toggle enable/disable */}
                      <DropdownMenuItem onClick={handleToggle}>
                        {isEnabled ? (
                          <>
                            <ToggleLeft className="w-4 h-4 mr-2" />
                            Disable service
                          </>
                        ) : (
                          <>
                            <ToggleRight className="w-4 h-4 mr-2" />
                            Enable service
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Destructive — managers only */}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setShowRemoveAlert(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove service
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                // ── VIEWER: read-only icon only ─────────────────────────────
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground/50 cursor-default"
                        aria-label="View only access"
                      >
                        <Eye className="w-4 h-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      className="text-xs max-w-[180px] text-center"
                    >
                      Only admins and owners can modify services.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Description */}
          {svc.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {svc.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-black/5">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {svc.menuCount} menu{svc.menuCount !== 1 ? "s" : ""}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {isEnabled
                ? `Active since ${format(new Date(svc.enabledAt), "MMM d, yyyy")}`
                : svc.disabledAt
                  ? `Off since ${format(new Date(svc.disabledAt), "MMM d, yyyy")}`
                  : "Never active"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Remove confirmation — only reachable by managers ───────────────── */}
      {isManager && (
        <AlertDialog open={showRemoveAlert} onOpenChange={setShowRemoveAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Remove {svc.name}?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <span className="block">
                  This will permanently remove <strong>{svc.name}</strong> from
                  your organisation.
                </span>

                {svc.menuCount > 0 && (
                  <span className="block p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    ⚠️ {svc.menuCount} menu
                    {svc.menuCount !== 1 ? "s" : ""} linked to this service will
                    be unlinked.
                  </span>
                )}

                <span className="block text-xs">
                  You can add it back at any time from the setup options.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isRemoving}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleRemove}
                disabled={isRemoving}
              >
                {isRemoving && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
