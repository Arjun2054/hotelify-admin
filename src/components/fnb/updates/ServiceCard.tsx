import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { FnbService, OrganizationFnbService } from "@/types/fnb.types";

const SERVICE_ICONS: Record<string, string> = {
  RESTAURANT: "🍽️",
  BUFFET: "🥘",
  BAR: "🍸",
  LOUNGE: "🛋️",
  ROOM_SERVICE: "🛎️",
  BANQUET: "🎉",
};

const SERVICE_COLORS: Record<string, string> = {
  RESTAURANT: "from-orange-50 to-orange-100 border-orange-200",
  BUFFET: "from-green-50 to-green-100 border-green-200",
  BAR: "from-purple-50 to-purple-100 border-purple-200",
  LOUNGE: "from-blue-50 to-blue-100 border-blue-200",
  ROOM_SERVICE: "from-yellow-50 to-yellow-100 border-yellow-200",
  BANQUET: "from-pink-50 to-pink-100 border-pink-200",
};

interface ServiceCardProps {
  service: FnbService;
  orgService?: OrganizationFnbService;
  onEnable: (serviceId: string) => void;
  onDisable: (orgServiceId: string) => void;
  isLoading?: boolean;
}

export function ServiceCard({
  service,
  orgService,
  onEnable,
  onDisable,
  isLoading,
}: ServiceCardProps) {
  const isEnabled = orgService?.isEnabled ?? false;
  const colorClass =
    SERVICE_COLORS[service.type] ?? "from-gray-50 to-gray-100 border-gray-200";

  return (
    <Card
      className={cn(
        "border bg-linear-to-br transition-all duration-200 hover:shadow-md",
        colorClass,
        isEnabled && "ring-2 ring-primary/20",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {SERVICE_ICONS[service.type] ?? "🍴"}
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {service.type.replace("_", " ")}
              </p>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            disabled={isLoading}
            onCheckedChange={(checked) => {
              if (checked) onEnable(service.id);
              else if (orgService) onDisable(orgService.id);
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {service.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {service.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <Badge
            variant={isEnabled ? "default" : "secondary"}
            className="text-xs"
          >
            {isEnabled
              ? orgService?.status === "TEMPORARILY_CLOSED"
                ? "Temporarily Closed"
                : "Active"
              : "Disabled"}
          </Badge>
          {orgService && (
            <span className="text-xs text-muted-foreground">
              {orgService.menus?.length ?? 0} menu(s)
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
