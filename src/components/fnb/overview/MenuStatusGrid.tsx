// frontend/src/features/fnb/components/overview/MenuStatusGrid.tsx

import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Layers, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuStat } from "@/store/fnb/fnbOverview.store";

const STATUS_STYLE = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  ARCHIVED: "bg-red-100 text-red-600",
};

const DAY_SHORT: Record<string, string> = {
  MONDAY: "M",
  TUESDAY: "T",
  WEDNESDAY: "W",
  THURSDAY: "T",
  FRIDAY: "F",
  SATURDAY: "S",
  SUNDAY: "S",
};

interface Props {
  menus: MenuStat[];
}

export function MenuStatusGrid({ menus }: Props) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Menus</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => navigate("menus")}
        >
          View all
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {menus.length === 0 ? (
          <div className="text-center py-8">
            <UtensilsCrossed className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No menus yet</p>
          </div>
        ) : (
          menus.slice(0, 6).map((menu) => (
            <div
              key={menu.menuId}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate(`menus/${menu.menuId}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate">
                    {menu.menuName}
                  </span>
                  <Badge
                    className={cn(
                      "text-[10px] h-4 px-1.5 border-0",
                      STATUS_STYLE[menu.status as keyof typeof STATUS_STYLE] ??
                        STATUS_STYLE.INACTIVE,
                    )}
                  >
                    {menu.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {menu.sectionCount} sections
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {menu.itemCount} items
                  </span>
                  {menu.availableFrom && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {menu.availableFrom}–{menu.availableTo}
                    </span>
                  )}
                </div>
                {menu.availableDays.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {[
                      "MONDAY",
                      "TUESDAY",
                      "WEDNESDAY",
                      "THURSDAY",
                      "FRIDAY",
                      "SATURDAY",
                      "SUNDAY",
                    ].map((day) => (
                      <span
                        key={day}
                        className={cn(
                          "w-4 h-4 rounded text-[9px] flex items-center justify-center font-medium",
                          menu.availableDays.includes(day)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {DAY_SHORT[day]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
