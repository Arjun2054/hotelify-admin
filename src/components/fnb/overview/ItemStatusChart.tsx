// frontend/src/features/fnb/components/overview/ItemStatusChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  available: number;
  outOfStock: number;
  discontinued: number;
}

export function ItemStatusChart({
  available,
  outOfStock,
  discontinued,
}: Props) {
  const total = available + outOfStock + discontinued;

  const segments = [
    {
      label: "Available",
      value: available,
      color: "bg-green-500",
      text: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Out of Stock",
      value: outOfStock,
      color: "bg-amber-400",
      text: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Discontinued",
      value: discontinued,
      color: "bg-red-400",
      text: "text-red-700",
      bg: "bg-red-50",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Item Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Segmented bar */}
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {segments.map((seg) => {
            const pct = total > 0 ? (seg.value / total) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={seg.label}
                className={cn("h-full rounded-full transition-all", seg.color)}
                style={{ width: `${pct}%` }}
                title={`${seg.label}: ${seg.value}`}
              />
            );
          })}
          {total === 0 && (
            <div className="h-full w-full bg-muted rounded-full" />
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={cn("rounded-lg p-2.5 text-center", seg.bg)}
            >
              <p className={cn("text-xl font-bold", seg.text)}>{seg.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {seg.label}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {total} total items
        </p>
      </CardContent>
    </Card>
  );
}
