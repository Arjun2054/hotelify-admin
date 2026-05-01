import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Star,
  Zap,
  ImageOff,
  Eye,
  Lock,
  Clock,
  Flame,
  Tag,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { MenuItem } from "@/types/fnb.types";

interface MenuItemCardProps {
  item: MenuItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (
    id: string,
    status: "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED",
  ) => void;
  isManager: boolean;
}

const STATUS_CONFIG = {
  AVAILABLE: {
    label: "Available",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  OUT_OF_STOCK: {
    label: "Out of Stock",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  DISCONTINUED: {
    label: "Discontinued",
    className: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
};

export function MenuItemCard({
  item,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
  isManager,
}: MenuItemCardProps) {
  const status = STATUS_CONFIG[item.status];
  const effectivePrice = item.discountPrice ?? item.price;
  const hasDiscount = item.discountPrice && item.discountPrice !== item.price;

  const handleEdit = () => {
    if (!isManager) return;
    onEdit(item);
  };

  const handleDelete = () => {
    if (!isManager) return;
    onDelete(item.id);
  };

  const handleStatusChange = (
    status: "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED",
  ) => {
    if (!isManager) return;
    onStatusChange(item.id, status);
  };

  const handleSelect = () => {
    if (!isManager) return;
    onSelect(item.id);
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border border-gray-100 bg-white",
        "rounded-xl shadow-sm hover:shadow-md transition-all duration-200",
        "flex gap-0 p-0",
        isSelected && "ring-2 ring-primary ring-offset-1 border-primary/20",
        item.status === "DISCONTINUED" && "opacity-60",
        !isManager && "cursor-default",
      )}
    >
      {/* ── Left accent bar based on status ─────────────────────────────── */}
      <div
        className={cn(
          "w-1 shrink-0 rounded-l-xl",
          item.status === "AVAILABLE" && "bg-emerald-400",
          item.status === "OUT_OF_STOCK" && "bg-amber-400",
          item.status === "DISCONTINUED" && "bg-red-400",
        )}
      />

      {/* ── Main content wrapper ─────────────────────────────────────────── */}
      <div className="flex flex-1 gap-3 p-3">
        {/* ── Checkbox ────────────────────────────────────────────────────── */}
        <div className="flex items-start pt-0.5 shrink-0">
          {isManager ? (
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelect}
              aria-label={`Select ${item.name}`}
              className="rounded-[4px]"
            />
          ) : (
            <div className="w-4 h-4" aria-hidden />
          )}
        </div>

        {/* ── Image ───────────────────────────────────────────────────────── */}
        <div className="relative shrink-0">
          <div className="w-[92px] h-[92px] rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageOff className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </div>

          {/* Signature & Featured badges on image */}
          {(item.isSignature || item.isFeatured) && (
            <div className="absolute -top-1.5 -right-1.5 flex gap-0.5">
              {item.isSignature && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 border border-amber-200 shadow-sm">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                </span>
              )}
              {item.isFeatured && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 border border-blue-200 shadow-sm">
                  <Zap className="w-2.5 h-2.5 fill-blue-500 text-blue-500" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Row 1: Name + Status + Role Pill + Action */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Name row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4
                  className="font-semibold text-gray-900 truncate leading-snug"
                  style={{ fontSize: "14px" }}
                >
                  {item.name}
                </h4>

                {/* Status badge with dot */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-medium leading-none",
                    status.className,
                  )}
                  style={{ fontSize: "12px" }}
                >
                  <span
                    className={cn("w-1.5 h-1.5 rounded-full", status.dot)}
                  />
                  {status.label}
                </span>

                {/* View-only pill */}
                {!isManager && (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full",
                            "bg-gray-100 border border-gray-200 text-gray-400",
                            "cursor-default select-none leading-none font-medium",
                          )}
                          style={{ fontSize: "10px" }}
                        >
                          <Lock className="w-2.5 h-2.5" />
                          View only
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Contact an admin to make changes.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Description */}
              {item.description && (
                <p
                  className="text-gray-600 mt-0.5 leading-relaxed"
                  style={{ fontSize: "14px" }}
                >
                  {item.description}
                </p>
              )}
            </div>

            {/* Action button */}
            {isManager ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7 shrink-0 rounded-lg text-gray-400",
                      "hover:text-gray-700 hover:bg-gray-100",
                      "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                    )}
                    aria-label="Item options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={handleEdit}
                    className="text-sm gap-2"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit item
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {item.status !== "AVAILABLE" && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("AVAILABLE")}
                      className="text-sm gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" />
                      Mark Available
                    </DropdownMenuItem>
                  )}
                  {item.status !== "OUT_OF_STOCK" && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("OUT_OF_STOCK")}
                      className="text-sm gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 ml-0.5" />
                      Out of Stock
                    </DropdownMenuItem>
                  )}
                  {item.status !== "DISCONTINUED" && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("DISCONTINUED")}
                      className="text-sm gap-2 text-red-600 focus:text-red-600"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500 ml-0.5" />
                      Discontinued
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-sm gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete item
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="inline-flex items-center justify-center h-7 w-7 shrink-0 text-gray-300 cursor-default rounded-lg"
                      aria-label="View only"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs">
                    Only admins can modify items.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Row 2: Price + Dietary tags */}
          <div className="flex items-center justify-between gap-2">
            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-bold text-gray-900 leading-none"
                style={{ fontSize: "14px" }}
              >
                {formatCurrency(Number(effectivePrice))}
              </span>
              {hasDiscount && (
                <span
                  className="text-gray-300 line-through leading-none"
                  style={{ fontSize: "12px" }}
                >
                  {formatCurrency(Number(item.price))}
                </span>
              )}
              {hasDiscount && (
                <span
                  className="text-emerald-600 font-medium leading-none"
                  style={{ fontSize: "12px" }}
                >
                  Discount
                </span>
              )}
            </div>

            {/* Dietary tags */}
            <div className="flex items-center gap-1 flex-wrap justify-end">
              {item.dietaryTags?.slice(0, 3).map(({ dietaryTag }) => (
                <span
                  key={dietaryTag.id}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-medium leading-none"
                  style={{
                    fontSize: "12px",
                    backgroundColor: dietaryTag.color
                      ? `${dietaryTag.color}18`
                      : "#f3f4f6",
                    color: dietaryTag.color ?? "#6b7280",
                    border: `1px solid ${dietaryTag.color ? `${dietaryTag.color}30` : "#e5e7eb"}`,
                  }}
                  title={dietaryTag.name}
                >
                  {dietaryTag.icon && (
                    <span style={{ fontSize: "12px" }}>{dietaryTag.icon}</span>
                  )}
                  {dietaryTag.shortName ?? dietaryTag.name}
                </span>
              ))}
              {(item.dietaryTags?.length ?? 0) > 3 && (
                <span
                  className="text-gray-400 font-medium"
                  style={{ fontSize: "12px" }}
                >
                  +{(item.dietaryTags?.length ?? 0) - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Row 3: Meta info */}
          <div className="flex items-center gap-3 flex-wrap">
            {item.preparationTime && (
              <span
                className="inline-flex items-center gap-1 text-gray-400"
                style={{ fontSize: "12px" }}
              >
                <Clock className="w-3 h-3 text-gray-300" />
                {item.preparationTime} min
              </span>
            )}
            {item.calories && (
              <span
                className="inline-flex items-center gap-1 text-gray-400"
                style={{ fontSize: "12px" }}
              >
                <Flame className="w-3 h-3 text-gray-300" />
                {item.calories} cal
              </span>
            )}
            {item.sku && isManager && (
              <span
                className="inline-flex items-center gap-1 text-gray-400"
                style={{ fontSize: "12px" }}
              >
                <Tag className="w-3 h-3 text-gray-300" />
                {item.sku}
              </span>
            )}
            {item.menuCategory && (
              <span
                className="inline-flex items-center gap-1 text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md"
                style={{ fontSize: "11px" }}
              >
                {item.menuCategory.icon && (
                  <span style={{ fontSize: "12px" }}>
                    {item.menuCategory.icon}
                  </span>
                )}
                {item.menuCategory.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
