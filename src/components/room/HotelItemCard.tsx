import { formatCurrency } from "@/lib/utils";
import { useHotelItemStore } from "@/store/room/hotelItemStore";
import type { HotelItem } from "@/types/room-types";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
  Eye,
  Power,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface HotelItemCardProps {
  item: HotelItem;
  selected?: boolean;
  mobile?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onEdit: (item: HotelItem) => void;
  onAdjustStock: (item: HotelItem) => void;
  onDelete: (item: HotelItem) => void;
  onViewDetail: (item: HotelItem) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "bg-blue-50 text-blue-600",
  Apparel: "bg-purple-50 text-purple-600",
  Wellness: "bg-emerald-50 text-emerald-600",
  "Home & Living": "bg-orange-50 text-orange-600",
  Food: "bg-yellow-50 text-yellow-700",
  Beverage: "bg-cyan-50 text-cyan-600",
};

function getCategoryStyle(name?: string) {
  if (!name) return "bg-slate-100 text-slate-500";
  return CATEGORY_COLORS[name] ?? "bg-slate-100 text-slate-500";
}

function ItemAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const colors = [
    "bg-violet-100 text-violet-600",
    "bg-sky-100 text-sky-600",
    "bg-emerald-100 text-emerald-600",
    "bg-amber-100 text-amber-600",
    "bg-rose-100 text-rose-600",
    "bg-indigo-100 text-indigo-600",
  ];
  const idx =
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${colors[idx]}`}
    >
      {initials}
    </div>
  );
}

function StockBadge({ stock, reorder }: { stock: number; reorder: number }) {
  const isOut = stock === 0;
  const isLow = reorder > 0 && stock <= reorder && stock > 0;
  if (isOut)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Out of stock
      </span>
    );
  if (isLow)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Low stock
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> In stock
    </span>
  );
}

function ActionMenu({
  item,
  onViewDetail,
  onAdjustStock,
  onEdit,
  onDelete,
  toggleActive,
}: {
  item: HotelItem;
  onViewDetail: () => void;
  onAdjustStock: () => void;
  onEdit: () => void;
  onDelete: () => void;
  toggleActive: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="py-1">
            {[
              {
                icon: <Eye size={13} className="text-slate-400" />,
                label: "View details",
                action: onViewDetail,
              },
              {
                icon: <ArrowUpDown size={13} className="text-slate-400" />,
                label: "Adjust stock",
                action: onAdjustStock,
              },
              {
                icon: <Pencil size={13} className="text-slate-400" />,
                label: "Edit item",
                action: onEdit,
              },
              {
                icon: <Power size={13} className="text-slate-400" />,
                label: item.isActive ? "Deactivate" : "Activate",
                action: toggleActive,
              },
            ].map(({ icon, label, action }) => (
              <button
                key={label}
                onClick={() => {
                  setOpen(false);
                  action();
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {icon} {label}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100" />
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} /> Archive item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function HotelItemCard({
  item,
  selected = false,
  mobile = false,
  onSelect,
  onEdit,
  onAdjustStock,
  onDelete,
  onViewDetail,
}: HotelItemCardProps) {
  const { updateItem } = useHotelItemStore();
  const stock = Number(item.stockQuantity) || 0;
  const reorder = Number(item.reorderPoint) || 0;
  const toggleActive = () => updateItem(item.id, { isActive: !item.isActive });

  const actionProps = {
    item,
    onViewDetail: () => onViewDetail(item),
    onAdjustStock: () => onAdjustStock(item),
    onEdit: () => onEdit(item),
    onDelete: () => onDelete(item),
    toggleActive,
  };

  /* ── Mobile card layout ── */
  if (mobile) {
    return (
      <div
        className={`p-4 transition-colors ${selected ? "bg-slate-50" : "bg-white"} ${!item.isActive ? "opacity-60" : ""}`}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect?.(item.id, e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-black cursor-pointer shrink-0"
          />

          {/* Avatar */}
          <ItemAvatar name={item.name} />

          {/* Main info */}
          <button
            onClick={() => onViewDetail(item)}
            className="flex-1 min-w-0 text-left"
          >
            <p className="text-sm font-medium text-slate-800 truncate">
              {item.name}
            </p>
            {item.description && (
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {item.description}
              </p>
            )}
          </button>

          {/* Action menu */}
          <ActionMenu {...actionProps} />
        </div>

        {/* Meta row */}
        <div className="mt-3 ml-11 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${getCategoryStyle(item.category?.name)}`}
          >
            {item.category?.name ?? "—"}
          </span>
          <StockBadge stock={stock} reorder={reorder} />
          <span className="text-xs font-semibold text-slate-700 tabular-nums ml-auto">
            {item.costPrice != null && !isNaN(Number(item.costPrice))
              ? formatCurrency(Number(item.costPrice))
              : "—"}
          </span>
        </div>

        {/* Stock row */}
        <div className="mt-1.5 ml-11 flex items-center gap-3 text-xs text-slate-500">
          <span>
            Stock: <span className="font-semibold text-slate-700">{stock}</span>
            {item.unit?.abbreviation && (
              <span className="ml-0.5">{item.unit.abbreviation}</span>
            )}
          </span>
          {reorder > 0 && (
            <span>
              Reorder at:{" "}
              <span className="font-medium text-slate-600">{reorder}</span>
            </span>
          )}
          {item.sku && (
            <span className="font-mono text-slate-400">{item.sku}</span>
          )}
        </div>
      </div>
    );
  }

  /* ── Desktop table row ── */
  return (
    <tr
      className={`group border-b border-slate-100 transition-colors hover:bg-slate-50/70 ${selected ? "bg-slate-50" : "bg-white"} ${!item.isActive ? "opacity-60" : ""}`}
    >
      <td className="w-10 px-4 py-3.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect?.(item.id, e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 accent-black cursor-pointer"
        />
      </td>
      <td className="px-4 py-3.5">
        <button
          onClick={() => onViewDetail(item)}
          className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
        >
          <ItemAvatar name={item.name} />
          <div>
            <p className="text-sm font-medium text-slate-800 leading-tight">
              {item.name}
            </p>
            {item.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-[160px]">
                {item.description}
              </p>
            )}
          </div>
        </button>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${getCategoryStyle(item.category?.name)}`}
        >
          {item.category?.name ?? "—"}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span className="font-mono text-xs text-slate-500">
          {item.sku ?? "—"}
        </span>
      </td>
      <td className="px-4 py-3.5 text-sm text-slate-600 tabular-nums">
        {reorder > 0 ? reorder : "—"}
      </td>
      <td className="px-4 py-3.5">
        <span className="text-sm font-semibold text-slate-800 tabular-nums">
          {stock}
        </span>
        {item.unit?.abbreviation && (
          <span className="ml-1 text-xs text-slate-400">
            {item.unit.abbreviation}
          </span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <StockBadge stock={stock} reorder={reorder} />
      </td>
      <td className="px-4 py-3.5 text-sm font-medium text-slate-700 tabular-nums">
        {item.costPrice != null && !isNaN(Number(item.costPrice))
          ? formatCurrency(Number(item.costPrice))
          : "—"}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionMenu {...actionProps} />
        </div>
      </td>
    </tr>
  );
}
