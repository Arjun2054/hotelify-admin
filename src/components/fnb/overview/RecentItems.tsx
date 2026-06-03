// frontend/src/features/fnb/components/overview/RecentItems.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecentItem } from "@/store/fnb/fnbOverview.store";

const STATUS_STYLE = {
  AVAILABLE: "bg-green-100 text-green-700",
  OUT_OF_STOCK: "bg-amber-100 text-amber-700",
  DISCONTINUED: "bg-red-100 text-red-600",
};

interface Props {
  items: RecentItem[];
}

export function RecentItems({ items }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recently Added Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No items yet
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageOff className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.menuName}
                  {item.categoryName && ` · ${item.categoryName}`}
                </p>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <p className="text-sm font-semibold">
                  ${Number(item.price).toFixed(2)}
                </p>
                <Badge
                  className={cn(
                    "text-[10px] h-4 px-1.5 border-0",
                    STATUS_STYLE[item.status as keyof typeof STATUS_STYLE] ??
                      STATUS_STYLE.AVAILABLE,
                  )}
                >
                  {item.status.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
