import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
import {
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Eye,
  Clock,
  ChefHat,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Menu } from "@/types/fnb.types";

interface MenuCardProps {
  menu: Menu;
  onEdit: (menu: Menu) => void;
  onDelete: (menuId: string) => void;
  onDuplicate: (menuId: string) => void;
  onView: (menu: Menu) => void;
  // Role-based access
  isManager: boolean;
}

const STATUS_CONFIG = {
  ACTIVE: { label: "Active", className: "bg-green-100 text-green-800" },
  INACTIVE: { label: "Inactive", className: "bg-gray-100 text-gray-600" },
  ARCHIVED: { label: "Archived", className: "bg-red-100 text-red-700" },
};

const DAYS_SHORT: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

// ── Read-only indicator ────────────────────────────────────────────────────────
function ViewOnlyIndicator() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
              "bg-gray-100 border border-gray-200 text-[10px] text-gray-500",
              "cursor-default select-none shrink-0",
            )}
          >
            <Lock className="w-2.5 h-2.5" />
            View only
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="text-xs max-w-[180px] text-center"
        >
          Contact an admin or owner to make changes.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function MenuCard({
  menu,
  onEdit,
  onDelete,
  onDuplicate,
  onView,
  isManager,
}: MenuCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const status = STATUS_CONFIG[menu.status] ?? STATUS_CONFIG.INACTIVE;

  // Guards — prevent action execution if somehow called without permission
  const handleEdit = () => {
    if (!isManager) return;
    onEdit(menu);
  };

  const handleDuplicate = () => {
    if (!isManager) return;
    onDuplicate(menu.id);
  };

  const handleDelete = () => {
    if (!isManager) return;
    onDelete(menu.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card
        className={cn(
          "group hover:shadow-lg transition-all duration-200 overflow-hidden",
          !isManager && "cursor-default",
        )}
      >
        {/* ── Cover Image ─────────────────────────────────────────────────── */}
        <div className="relative h-36 bg-linear-to-br from-amber-100 to-orange-200 overflow-hidden">
          {menu.coverImage ? (
            <img
              src={menu.coverImage}
              alt={menu.name}
              className={cn(
                "w-full h-full object-cover transition-transform duration-300",
                isManager && "group-hover:scale-105",
              )}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ChefHat className="w-12 h-12 text-amber-400" />
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-2 right-2">
            <Badge className={cn("text-xs font-medium", status.className)}>
              {status.label}
            </Badge>
          </div>

          {/* View-only ribbon for non-managers */}
          {!isManager && (
            <div className="absolute bottom-2 left-2">
              <ViewOnlyIndicator />
            </div>
          )}
        </div>

        <CardHeader className="pb-2 pt-3">
          <div className="flex items-start justify-between gap-2">
            {/* Title + description */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {menu.name}
              </h3>
              {menu.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {menu.description}
                </p>
              )}
            </div>

            {/* ── Action menu — manager vs viewer ──────────────────────────── */}
            {isManager ? (
              // MANAGER: full CRUD dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    aria-label="Menu options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* View — available to all, but inside manager menu too */}
                  <DropdownMenuItem onClick={() => onView(menu)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Menu
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // VIEWER: single view-details button, no mutating actions
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground/50"
                      onClick={() => onView(menu)}
                      aria-label="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs">
                    View details
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardHeader>

        <CardContent className="py-0">
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{menu._count?.sections ?? 0} sections</span>
            <span>•</span>
            <span>{menu._count?.items ?? 0} items</span>
          </div>

          {/* Availability */}
          {(menu.availableFrom || menu.availableDays.length > 0) && (
            <div className="mt-2 space-y-1">
              {menu.availableFrom && menu.availableTo && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    {menu.availableFrom} – {menu.availableTo}
                  </span>
                </div>
              )}
              {menu.availableDays.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {menu.availableDays.map((day) => (
                    <span
                      key={day}
                      className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium"
                    >
                      {DAYS_SHORT[day] ?? day}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>

        {/* ── Footer CTA ──────────────────────────────────────────────────── */}
        <CardFooter className="pt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onView(menu)}
          >
            {/* Label reflects actual access level */}
            {isManager ? "Manage Items" : "View Items"}
          </Button>
        </CardFooter>
      </Card>

      {/* ── Delete confirmation — only mounts for managers ───────────────── */}
      {isManager && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Menu</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{menu.name}&quot;? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
