import { useEffect } from "react";
import {
  X,
  ArrowUpDown,
  Hash,
  Layers,
  DollarSign,
  Activity,
  BedDouble,
  BarChart2,
} from "lucide-react";
import type { HotelItem } from "@/types/room-types";
import { useHotelItemStore } from "@/store/room/hotelItemStore";
import { StockMovementHistory } from "./StockMovementHistory";

interface ItemDetailPanelProps {
  item: HotelItem;
  onClose: () => void;
  onAdjustStock: () => void;
}

function ItemAvatar({
  name,
  size = "lg",
}: {
  name: string;
  size?: "sm" | "lg";
}) {
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
  const sz =
    size === "lg" ? "h-10 w-10 sm:h-12 sm:w-12 text-sm" : "h-8 w-8 text-xs";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl font-semibold ${sz} ${colors[idx]}`}
    >
      {initials}
    </div>
  );
}

export function ItemDetailPanel({
  item,
  onClose,
  onAdjustStock,
}: ItemDetailPanelProps) {
  const { movements, fetchMovements, isLoadingMovements } = useHotelItemStore();

  useEffect(() => {
    fetchMovements(item.id);
  }, [item.id]);

  const stock = Number(item.stockQuantity) || 0;
  const reorder = Number(item.reorderPoint) || 0;
  const minimum = Number(item.minimumStock) || 0;
  const cost = Number(item.costPrice) || 0;
  const totalValue = stock * cost;

  const isOutOfStock = stock === 0;
  const isLowStock = reorder > 0 && stock <= reorder && stock > 0;

  const statusBadge = isOutOfStock ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Out of stock
    </span>
  ) : isLowStock ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Low stock
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> In stock
    </span>
  );

  const stockPct =
    reorder > 0 ? Math.min(100, (stock / (reorder * 2)) * 100) : 100;
  const barColor = isOutOfStock
    ? "bg-red-400"
    : isLowStock
      ? "bg-amber-400"
      : "bg-emerald-400";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/*
        Panel:
        - Mobile:  full screen (w-full, no left margin, slide up)
        - Tablet+: right-side drawer (max-w-lg, slide in from right)
      */}
      <div
        className={`
          relative flex h-full w-full flex-col overflow-hidden
          border-l border-slate-200 bg-white shadow-2xl
          sm:max-w-lg
        `}
        style={{ animation: "slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3 min-w-0">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <ItemAvatar name={item.name} size="lg" />
            )}
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-slate-800 leading-tight truncate max-w-[180px] sm:max-w-none">
                {item.name}
              </h2>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                {item.category?.name && (
                  <span className="text-xs text-slate-400">
                    {item.category.name}
                  </span>
                )}
                {item.category?.name && (
                  <span className="text-slate-200">·</span>
                )}
                {statusBadge}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
          {/* Quick stat cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div
              className={`rounded-xl border p-3 sm:p-4 text-center ${
                isOutOfStock
                  ? "border-red-200 bg-red-50"
                  : isLowStock
                    ? "border-amber-200 bg-amber-50"
                    : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-1">
                In Stock
              </p>
              <p
                className={`text-xl sm:text-2xl font-bold tabular-nums ${
                  isOutOfStock
                    ? "text-red-500"
                    : isLowStock
                      ? "text-amber-500"
                      : "text-emerald-600"
                }`}
              >
                {stock}
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                {item.unit?.abbreviation}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 text-center shadow-sm">
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-1">
                Reorder At
              </p>
              <p className="text-xl sm:text-2xl font-bold tabular-nums text-slate-700">
                {reorder || "—"}
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                {item.unit?.abbreviation}
              </p>
            </div>

            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 sm:p-4 text-center">
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-violet-400 mb-1">
                Stock Value
              </p>
              <p className="text-xl sm:text-2xl font-bold tabular-nums text-violet-600">
                ${totalValue.toFixed(0)}
              </p>
              <p className="text-[9px] sm:text-[10px] text-violet-400 mt-0.5">
                ${cost.toFixed(2)} ea
              </p>
            </div>
          </div>

          {/* Stock level bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">
                Stock Level
              </span>
              <span className="text-xs text-slate-400">
                {stock} / {reorder > 0 ? reorder * 2 : "—"}{" "}
                {item.unit?.abbreviation}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${stockPct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-slate-400">
              <span>0</span>
              {reorder > 0 && (
                <span className="text-amber-500">Reorder: {reorder}</span>
              )}
              <span>{reorder > 0 ? reorder * 2 : stock}</span>
            </div>
          </div>

          {/* Item details */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Item Details
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                {
                  icon: <Hash size={13} className="text-slate-400" />,
                  label: "SKU",
                  value: item.sku || "—",
                },
                {
                  icon: <Hash size={13} className="text-slate-400" />,
                  label: "Barcode",
                  value: item.barcode || "—",
                },
                {
                  icon: <Layers size={13} className="text-slate-400" />,
                  label: "Unit",
                  value: item.unit
                    ? `${item.unit.name} (${item.unit.abbreviation})`
                    : "—",
                },
                {
                  icon: <TrendingDownIcon />,
                  label: "Min Stock",
                  value:
                    `${minimum} ${item.unit?.abbreviation ?? ""}`.trim() || "—",
                },
                {
                  icon: <DollarSign size={13} className="text-slate-400" />,
                  label: "Cost / Unit",
                  value: cost > 0 ? `$${cost.toFixed(2)}` : "—",
                },
                {
                  icon: <Activity size={13} className="text-slate-400" />,
                  label: "Status",
                  value: item.isActive ? "Active" : "Inactive",
                  highlight: item.isActive,
                },
                {
                  icon: <BedDouble size={13} className="text-slate-400" />,
                  label: "Assigned Rooms",
                  value: String(item._count?.roomItems ?? 0),
                },
                {
                  icon: <BarChart2 size={13} className="text-slate-400" />,
                  label: "Total Movements",
                  value: String(item._count?.hotelStockMovements ?? 0),
                },
              ].map(({ icon, label, value, highlight }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {icon} {label}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      label === "Status"
                        ? highlight
                          ? "text-emerald-600"
                          : "text-slate-400"
                        : "text-slate-700"
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
            {item.description && (
              <div className="border-t border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}
          </div>

          {/* Assigned rooms */}
          {item.roomItems && item.roomItems.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Assigned Rooms
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 px-4 py-3">
                {item.roomItems.map((ri: any) => (
                  <span
                    key={ri.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    <BedDouble size={11} className="text-slate-400" />
                    Room {ri.room?.roomNumber}
                    <span className="text-slate-400">·</span>
                    {Number(ri.standardQty)} {item.unit?.abbreviation}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Movement history */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Movement History
              </h3>
            </div>
            <div className="px-3 sm:px-4 py-3">
              <StockMovementHistory
                movements={movements.filter(Boolean)}
                isLoading={isLoadingMovements}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-slate-100 bg-slate-50 px-4 sm:px-6 py-4">
          <button
            onClick={onAdjustStock}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-700 active:scale-[0.98]"
          >
            <ArrowUpDown size={14} /> Adjust Stock
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @media (max-width: 639px) {
          @keyframes slideInRight {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
}

function TrendingDownIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-400"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
