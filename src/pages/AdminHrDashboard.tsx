// src/pages/hr/AdminHrDashboard.tsx

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarDays,
  FileText,
  PlaneTakeoff,
  CheckCircle2,
  XCircle,
  DollarSign,
  Loader2,
  Plus,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useHrStore } from "@/store/hr/useHrStore";
import { useStaffStore } from "@/store/staff/useStaffStore";
import { cn } from "@/lib/utils";
import {
  LEAVE_STATUS_CONFIG,
  ATTENDANCE_STATUS_CONFIG,
  PAYSLIP_STATUS_CONFIG,
} from "@/types/hr-types";
import type { GeneratePayslipPayload, PayslipItem } from "@/types/hr-types";

export default function AdminHrDashboard() {
  const {
    leaveRequests,
    leaveStats,
    allAttendance,
    attendanceStats,
    allPayslips,
    isLoading,
    fetchLeaveRequests,
    fetchLeaveStats,
    processLeaveRequest,
    fetchAllAttendance,
    fetchAttendanceStats,
    fetchAllPayslips,
    generatePayslip,
    markPayslipAsPaid,
  } = useHrStore();

  const { members, fetchMembers } = useStaffStore();

  const [generateOpen, setGenerateOpen] = useState(false);
  const [payslipForm, setPayslipForm] = useState<GeneratePayslipPayload>({
    userId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 0,
    items: [],
    notes: "",
  });
  const [payslipItems, setPayslipItems] = useState<PayslipItem[]>([]);

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveStats();
    fetchAllAttendance();
    fetchAttendanceStats();
    fetchAllPayslips();
    fetchMembers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await processLeaveRequest(id, { status: "APPROVED" });
      toast.success("Leave approved");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await processLeaveRequest(id, {
        status: "REJECTED",
        rejectedReason: "Insufficient coverage",
      });
      toast.success("Leave rejected");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleGeneratePayslip = async () => {
    try {
      await generatePayslip({ ...payslipForm, items: payslipItems });
      toast.success("Payslip generated");
      setGenerateOpen(false);
      resetPayslipForm();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markPayslipAsPaid(id);
      toast.success("Payslip marked as paid");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const addPayslipItem = () => {
    setPayslipItems([
      ...payslipItems,
      { label: "", type: "ALLOWANCE", amount: 0 },
    ]);
  };

  const updatePayslipItem = (index: number, field: string, value: any) => {
    const updated = [...payslipItems];
    (updated[index] as any)[field] = value;
    setPayslipItems(updated);
  };

  const removePayslipItem = (index: number) => {
    setPayslipItems(payslipItems.filter((_, i) => i !== index));
  };

  const resetPayslipForm = () => {
    setPayslipForm({
      userId: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      basicSalary: 0,
      items: [],
      notes: "",
    });
    setPayslipItems([]);
  };

  return (
    <div className="mx-auto w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight">HR Management</h1>

      {/* ── Stats Cards ──────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-amber-100 p-2">
              <PlaneTakeoff className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Leaves</p>
              <p className="text-xl font-bold">{leaveStats?.pending ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-emerald-100 p-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Present Today</p>
              <p className="text-xl font-bold">
                {attendanceStats?.present ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-red-100 p-2">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Absent Today</p>
              <p className="text-xl font-bold">
                {attendanceStats?.absent ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-blue-100 p-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Staff</p>
              <p className="text-xl font-bold">{members.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ─────────────────────────────── */}
      <Tabs defaultValue="leave" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leave" className="gap-1.5">
            <PlaneTakeoff className="h-4 w-4" /> Leave Requests
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1.5">
            <CalendarDays className="h-4 w-4" /> Attendance
          </TabsTrigger>
          <TabsTrigger value="payslips" className="gap-1.5">
            <FileText className="h-4 w-4" /> Payslips
          </TabsTrigger>
        </TabsList>

        {/* ── Leave Requests Tab ──────────────── */}
        <TabsContent value="leave">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-35" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((r) => {
                    const cfg = LEAVE_STATUS_CONFIG[r.status];
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          {r.user.name}
                        </TableCell>
                        <TableCell>{r.leaveType.name}</TableCell>
                        <TableCell className="text-xs">
                          {formatDate(r.startDate)} — {formatDate(r.endDate)}
                        </TableCell>
                        <TableCell>{r.totalDays}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn("text-xs", cfg.bgColor, cfg.color)}
                          >
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {r.status === "PENDING" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-emerald-600"
                                onClick={() => handleApprove(r.id)}
                              >
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />{" "}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-red-600"
                                onClick={() => handleReject(r.id)}
                              >
                                <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Attendance Tab ──────────────────── */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allAttendance.map((a) => {
                    const cfg = ATTENDANCE_STATUS_CONFIG[a.status];
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">
                          {a.user?.name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(a.date)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {a.clockIn
                            ? new Date(a.clockIn).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {a.clockOut
                            ? new Date(a.clockOut).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {a.totalHours != null
                            ? `${a.totalHours.toFixed(1)}h`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn("text-xs", cfg.bgColor, cfg.color)}
                          >
                            {cfg.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Payslips Tab ────────────────────── */}
        <TabsContent value="payslips">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Payslips</CardTitle>
              <Button
                size="sm"
                onClick={() => setGenerateOpen(true)}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Generate Payslip
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Basic</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-25" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPayslips.map((p) => {
                    const cfg = PAYSLIP_STATUS_CONFIG[p.status];
                    const monthName = new Date(
                      p.year,
                      p.month - 1,
                    ).toLocaleString("default", { month: "short" });
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          {p.user.name}
                        </TableCell>
                        <TableCell>
                          {monthName} {p.year}
                        </TableCell>
                        <TableCell>{p.basicSalary.toFixed(2)}</TableCell>
                        <TableCell className="font-bold">
                          {p.netPay.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn("text-xs", cfg.bgColor, cfg.color)}
                          >
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.status === "GENERATED" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-emerald-600"
                              onClick={() => handleMarkPaid(p.id)}
                            >
                              <DollarSign className="mr-1 h-3.5 w-3.5" /> Pay
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Generate Payslip Dialog ──────────── */}
      <Dialog
        open={generateOpen}
        onOpenChange={(open) => {
          if (!open) resetPayslipForm();
          setGenerateOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-140">
          <DialogHeader>
            <DialogTitle>Generate Payslip</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto py-2">
            <div className="space-y-1.5">
              <Label>Staff Member</Label>
              <Select
                value={payslipForm.userId}
                onValueChange={(v) =>
                  setPayslipForm({ ...payslipForm, userId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Month</Label>
                <Select
                  value={String(payslipForm.month)}
                  onValueChange={(v) =>
                    setPayslipForm({ ...payslipForm, month: parseInt(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {new Date(2024, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={payslipForm.year}
                  onChange={(e) =>
                    setPayslipForm({
                      ...payslipForm,
                      year: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Basic Salary</Label>
              <Input
                type="number"
                step="0.01"
                value={payslipForm.basicSalary}
                onChange={(e) =>
                  setPayslipForm({
                    ...payslipForm,
                    basicSalary: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Allowances & Deductions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items (Allowances & Deductions)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addPayslipItem}
                  className="h-7 gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" /> Add Item
                </Button>
              </div>
              {payslipItems.map((item, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Label"
                      value={item.label}
                      onChange={(e) =>
                        updatePayslipItem(i, "label", e.target.value)
                      }
                    />
                  </div>
                  <Select
                    value={item.type}
                    onValueChange={(v) => updatePayslipItem(i, "type", v)}
                  >
                    <SelectTrigger className="w-32.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALLOWANCE">Allowance</SelectItem>
                      <SelectItem value="DEDUCTION">Deduction</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    className="w-25"
                    value={item.amount}
                    onChange={(e) =>
                      updatePayslipItem(
                        i,
                        "amount",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-500 shrink-0"
                    onClick={() => removePayslipItem(i)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Summary */}
            {payslipForm.basicSalary > 0 && (
              <Card className="bg-muted/30">
                <CardContent className="space-y-1 p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Basic</span>
                    <span>{payslipForm.basicSalary.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>+ Allowances</span>
                    <span>
                      {payslipItems
                        .filter((i) => i.type === "ALLOWANCE")
                        .reduce((s, i) => s + i.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>− Deductions</span>
                    <span>
                      {payslipItems
                        .filter((i) => i.type === "DEDUCTION")
                        .reduce((s, i) => s + i.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-bold">
                    <span>Net Pay</span>
                    <span>
                      {(
                        payslipForm.basicSalary +
                        payslipItems
                          .filter((i) => i.type === "ALLOWANCE")
                          .reduce((s, i) => s + i.amount, 0) -
                        payslipItems
                          .filter((i) => i.type === "DEDUCTION")
                          .reduce((s, i) => s + i.amount, 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-1.5">
              <Label>
                Notes <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                value={payslipForm.notes}
                onChange={(e) =>
                  setPayslipForm({ ...payslipForm, notes: e.target.value })
                }
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetPayslipForm();
                setGenerateOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGeneratePayslip}
              disabled={
                isLoading || !payslipForm.userId || payslipForm.basicSalary <= 0
              }
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
