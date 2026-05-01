import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { StaffRoleBadge } from "@/components/staff/StaffRoleBadge";
import { StaffActivityTimeline } from "@/components/staff/StaffActivityTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Mail,
  Calendar,
  ClipboardList,
  Package,
  ExternalLink,
  User,
} from "lucide-react";
import { useStaffStore } from "@/store/staff/useStaffStore";

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    selectedMember,
    activities,
    isLoading,
    fetchMemberById,
    fetchActivity,
  } = useStaffStore();

  useEffect(() => {
    if (id) {
      fetchMemberById(id);
      fetchActivity(id);
    }
  }, [id]);

  const member = selectedMember;

  if (isLoading || !member) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const initials = member.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/staff")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <div className="h-16 w-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{member.user.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <StaffRoleBadge role={member.role} />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {member.user.email}
              </span>
            </div>
          </div>
        </div>
        <Link to={`/housekeeping?userId=${member.userId}`}>
          <Button variant="outline">
            <ClipboardList className="mr-2 h-4 w-4" /> View Tasks
          </Button>
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <ClipboardList className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Housekeeping Tasks
                </p>
                <p className="text-2xl font-bold">
                  {member._count.housekeepingLogs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock Movements</p>
                <p className="text-2xl font-bold">
                  {member._count.stockMovements}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50">
                <User className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-lg font-bold capitalize">
                  {member.role.toLowerCase()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="text-sm font-bold">
                  {new Date(member.user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="flex gap-3">
        <Link to={`/housekeeping?userId=${member.userId}`}>
          <Button variant="outline" size="sm">
            <ClipboardList className="mr-1 h-3.5 w-3.5" /> All Housekeeping
            Tasks
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </Link>
        <Link to={`/stock-movements?userId=${member.userId}`}>
          <Button variant="outline" size="sm">
            <Package className="mr-1 h-3.5 w-3.5" /> All Stock Movements
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>

      <Separator />

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <StaffActivityTimeline activities={activities} />
        </CardContent>
      </Card>
    </div>
  );
}
