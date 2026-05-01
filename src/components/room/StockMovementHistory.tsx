import type { HotelStockMovement, StockMovementType } from "@/types/room-types";
import {
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  RefreshCw,
  MoveRight,
  Trash2,
  Loader2,
  PackageOpen,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

export const MOVEMENT_TYPE_CONFIG: Record<
  StockMovementType,
  { icon: React.ReactNode; colorClass: string; label: string }
> = {
  STOCK_IN: {
    icon: <ArrowUp size={11} aria-hidden />,
    colorClass:
      "text-emerald-600 bg-emerald-500/10 border-emerald-500/25 ring-emerald-500/10",
    label: "Stock In",
  },
  STOCK_OUT: {
    icon: <ArrowDown size={11} aria-hidden />,
    colorClass: "text-sky-600 bg-sky-500/10 border-sky-500/25 ring-sky-500/10",
    label: "Stock Out",
  },
  DAMAGE: {
    icon: <AlertTriangle size={11} aria-hidden />,
    colorClass: "text-red-400 bg-red-500/10 border-red-500/25 ring-red-500/10",
    label: "Damage",
  },
  TRANSFER: {
    icon: <MoveRight size={11} aria-hidden />,
    colorClass:
      "text-violet-600 bg-violet-500/10 border-violet-500/25 ring-violet-500/10",
    label: "Transfer",
  },
  ADJUSTMENT: {
    icon: <RefreshCw size={11} aria-hidden />,
    colorClass:
      "text-amber-600 bg-amber-500/10 border-amber-500/25 ring-amber-500/10",
    label: "Adjustment",
  },
  WASTAGE: {
    icon: <Trash2 size={11} aria-hidden />,
    colorClass:
      "text-orange-600 bg-orange-500/10 border-orange-500/25 ring-orange-500/10",
    label: "Wastage",
  },
};

/** Movement types that represent stock leaving inventory */
const OUT_TYPES = new Set<StockMovementType>([
  "STOCK_OUT",
  "DAMAGE",
  "WASTAGE",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: StockMovementType }) {
  const cfg = MOVEMENT_TYPE_CONFIG[type];
  return (
    <span
      aria-label={cfg.label}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${cfg.colorClass}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function QuantityCell({
  quantity,
  type,
}: {
  quantity: number;
  type: StockMovementType;
}) {
  const isOut = OUT_TYPES.has(type);
  return (
    <span
      className={`tabular-nums font-medium ${
        isOut ? "text-red-400" : "text-slate-800"
      }`}
    >
      {isOut ? "−" : "+"}
      {quantity}
    </span>
  );
}

function StockArrow({ previous, next }: { previous: number; next: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-slate-400">
      <span>{previous}</span>
      <span className="text-slate-600">→</span>
      <span className="text-slate-800">{next}</span>
    </span>
  );
}

// ─── Loading & Empty states ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 size={22} className="animate-spin text-amber-400" />
      <p className="text-xs text-slate-500 tracking-wide">Loading movements…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
        <PackageOpen size={28} className="text-slate-600" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-300">No movements found</p>
        <p className="mt-1 text-xs text-slate-500">
          Try adjusting your filters or check back later.
        </p>
      </div>
    </div>
  );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function MovementCard({
  movement,
  showItemName,
}: {
  movement: HotelStockMovement;
  showItemName: boolean;
}) {
  const { date, time } = formatDate(movement.createdAt);
  const qty = Number(movement.quantity);

  return (
    <article className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-3 hover:bg-white/[0.04] transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {showItemName && (
            <p className="truncate text-sm font-medium text-black">
              {movement.hotelItem?.name ?? "—"}
            </p>
          )}
          {movement.hotelItem?.sku && (
            <p className="mt-0.5 font-mono text-[10px] text-black tracking-wider">
              {movement.hotelItem.sku}
            </p>
          )}
        </div>
        <TypeBadge type={movement.type} />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Quantity
          </p>
          <QuantityCell quantity={qty} type={movement.type} />
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Stock change
          </p>
          <StockArrow
            previous={Number(movement.previousStock)}
            next={Number(movement.newStock)}
          />
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <p className="text-xs text-slate-500">
          {movement.user?.name ?? "Unknown user"}
        </p>
        <time dateTime={movement.createdAt} className="text-xs text-slate-500">
          {date}
          <span className="ml-1.5 text-slate-600">{time}</span>
        </time>
      </div>

      {/* Notes */}
      {movement.notes && (
        <p className="rounded-lg bg-white/3 px-3 py-2 text-xs italic text-slate-400">
          {movement.notes}
        </p>
      )}
    </article>
  );
}

// ─── Desktop table ────────────────────────────────────────────────────────────

function MovementsTable({
  movements,
  showItemName,
}: {
  movements: HotelStockMovement[];
  showItemName: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/8">
      <table className="w-full min-w-[640px] text-sm">
        <caption className="sr-only">Stock movement history</caption>

        <thead>
          <tr className="border-b border-white/8 bg-white/[0.02]">
            {showItemName && <Th>Item</Th>}
            <Th>Type</Th>
            <Th align="right">Qty</Th>
            <Th align="right">Stock Change</Th>
            <Th>By</Th>
            <Th>Date</Th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/4">
          {movements.map((m) => {
            const { date, time } = formatDate(m.createdAt);
            const qty = Number(m.quantity);

            return (
              <tr
                key={m.id}
                className="group transition-colors hover:bg-white/2.5"
              >
                {showItemName && (
                  <td className="px-4 py-3">
                    <p className="truncate max-w-[160px] text-sm font-medium text-black">
                      {m.hotelItem?.name ?? "—"}
                    </p>
                    {m.hotelItem?.sku && (
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500 tracking-wider">
                        ``
                        {m.hotelItem.sku}
                      </p>
                    )}
                  </td>
                )}

                <td className="px-4 py-3">
                  <TypeBadge type={m.type} />
                </td>

                <td className="px-4 py-3 text-right">
                  <QuantityCell quantity={qty} type={m.type} />
                </td>

                <td className="px-4 py-3 text-right">
                  <StockArrow
                    previous={Number(m.previousStock)}
                    next={Number(m.newStock)}
                  />
                </td>

                <td className="px-4 py-3 text-sm text-slate-800">
                  {m.user?.name ?? "—"}
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <time
                    dateTime={m.createdAt}
                    className="text-sm text-slate-800"
                  >
                    {date}
                    <span className="ml-1.5 text-xs text-slate-600">
                      {time}
                    </span>
                  </time>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Reusable table header cell */
function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface StockMovementHistoryProps {
  movements: HotelStockMovement[];
  isLoading?: boolean;
  showItemName?: boolean;
}

export function StockMovementHistory({
  movements,
  isLoading = false,
  showItemName = false,
}: StockMovementHistoryProps) {
  if (isLoading) return <LoadingState />;
  if (movements.length === 0) return <EmptyState />;

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {movements.map((m) => (
          <MovementCard key={m.id} movement={m} showItemName={showItemName} />
        ))}
      </div>

      {/* Desktop: data table */}
      <div className="hidden md:block">
        <MovementsTable movements={movements} showItemName={showItemName} />
      </div>
    </>
  );
}
