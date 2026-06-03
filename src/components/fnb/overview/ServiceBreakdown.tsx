// frontend/src/features/fnb/components/overview/ServiceBreakdown.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getServiceDef } from "@/types/fnb.types";
import type { ServiceStat } from "@/store/fnb/fnbOverview.store";

interface Props {
  services: ServiceStat[];
  totalItems: number;
}

export function ServiceBreakdown({ services, totalItems }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Service Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No services configured yet
          </p>
        ) : (
          services.map((svc) => {
            const def = getServiceDef(svc.serviceType);
            const pct =
              totalItems > 0
                ? Math.round((svc.itemCount / totalItems) * 100)
                : 0;
            return (
              <div key={svc.serviceId} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{def.icon}</span>
                    <span className="text-sm font-medium">
                      {svc.serviceName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {svc.menuCount} menu{svc.menuCount !== 1 ? "s" : ""}
                    </Badge>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {svc.itemCount} items
                    </span>
                  </div>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
