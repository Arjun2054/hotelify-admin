// frontend/src/features/fnb/components/MenuForm.tsx

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  UtensilsCrossed,
  Clock,
  CalendarDays,
  Image,
  Layers,
} from "lucide-react";
import { getServiceDef, type Menu } from "@/types/fnb.types";
import type { OrgFnbServiceEntry } from "@/services/fnb/fnbService";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const DAY_SHORT: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  coverImage: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  availableFrom: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format")
    .optional()
    .or(z.literal("")),
  availableTo: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format")
    .optional()
    .or(z.literal("")),
  availableDays: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  fnbServiceIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface MenuFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
  menu?: Menu | null;
  orgServices: OrgFnbServiceEntry[];
  isLoading?: boolean;
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/8 text-primary">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span
          className="font-semibold text-gray-700 tracking-wide uppercase"
          style={{ fontSize: "12px" }}
        >
          {label}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MenuForm({
  open,
  onClose,
  onSubmit,
  menu,
  orgServices,
  isLoading,
}: MenuFormProps) {
  const isEdit = !!menu;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      coverImage: "",
      availableFrom: "",
      availableTo: "",
      availableDays: [],
      status: "ACTIVE",
      fnbServiceIds: [],
    },
  });

  // ── Sync form values when menu changes ────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (menu) {
      form.reset({
        name: menu.name,
        description: menu.description ?? "",
        coverImage: menu.coverImage ?? "",
        availableFrom: menu.availableFrom ?? "",
        availableTo: menu.availableTo ?? "",
        availableDays: menu.availableDays ?? [],
        status: menu.status,
        fnbServiceIds:
          menu.fnbServices
            ?.map((fs) => fs.organizationFnbService?.id)
            .filter(Boolean) ?? [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        coverImage: "",
        availableFrom: "",
        availableTo: "",
        availableDays: [],
        status: "ACTIVE",
        fnbServiceIds: [],
      });
    }
  }, [menu, open]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (values: FormValues) => {
    await onSubmit({
      ...values,
      coverImage: values.coverImage || undefined,
      availableFrom: values.availableFrom || undefined,
      availableTo: values.availableTo || undefined,
    });
  };

  // ── Derive enabled services ───────────────────────────────────────────────
  const enabledServices = orgServices.filter(
    (entry) => entry.isCreated && entry.isEnabled && entry.orgService !== null,
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      {/*
       * max-w-[50vw] pins the dialog to exactly half the viewport width.
       * min-w-[420px] prevents it from collapsing on smaller screens.
       */}
      <DialogContent
        className={cn(
          "max-w-[85vw] min-w-[660px] w-[85vw]",
          "max-h-[90vh] overflow-hidden flex flex-col",
          "p-0 gap-0 rounded-2xl shadow-xl border border-gray-100",
        )}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle
                className="font-semibold text-gray-900 leading-snug"
                style={{ fontSize: "14px" }}
              >
                {isEdit ? "Edit Menu" : "Create New Menu"}
              </DialogTitle>
              <p
                className="text-gray-400 leading-none mt-0.5"
                style={{ fontSize: "12px" }}
              >
                {isEdit
                  ? "Update the details for this menu"
                  : "Fill in the details to create a new menu"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Form {...form}>
            <form
              id="menu-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-5"
            >
              {/* ── Basic Info ──────────────────────────────────────────── */}
              <Section icon={UtensilsCrossed} label="Basic Info">
                <div
                  className={cn(
                    "grid gap-3",
                    isEdit ? "grid-cols-2" : "grid-cols-1",
                  )}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="text-gray-600 font-medium"
                          style={{ fontSize: "12px" }}
                        >
                          Menu Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Lunch Menu"
                            className="h-8 text-sm rounded-lg border-gray-200 focus-visible:ring-primary/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage style={{ fontSize: "11px" }} />
                      </FormItem>
                    )}
                  />

                  {isEdit && (
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className="text-gray-600 font-medium"
                            style={{ fontSize: "12px" }}
                          >
                            Status
                          </FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 text-sm rounded-lg border-gray-200">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ACTIVE">
                                <span className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Active
                                </span>
                              </SelectItem>
                              <SelectItem value="INACTIVE">
                                <span className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  Inactive
                                </span>
                              </SelectItem>
                              <SelectItem value="ARCHIVED">
                                <span className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                  Archived
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage style={{ fontSize: "11px" }} />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className="text-gray-600 font-medium"
                        style={{ fontSize: "12px" }}
                      >
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe this menu..."
                          rows={2}
                          className="resize-none text-sm rounded-lg border-gray-200 focus-visible:ring-primary/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage style={{ fontSize: "11px" }} />
                    </FormItem>
                  )}
                />
              </Section>

              {/* ── Cover Image ─────────────────────────────────────────── */}
              <Section icon={Image} label="Cover Image">
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className="text-gray-600 font-medium"
                        style={{ fontSize: "12px" }}
                      >
                        Image URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          className="h-8 text-sm rounded-lg border-gray-200 focus-visible:ring-primary/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage style={{ fontSize: "11px" }} />
                    </FormItem>
                  )}
                />

                {/* Live preview */}
                {form.watch("coverImage") && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 h-24">
                    <img
                      src={form.watch("coverImage")}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).style.display = "none")
                      }
                    />
                  </div>
                )}
              </Section>

              {/* ── Availability ────────────────────────────────────────── */}
              <Section icon={Clock} label="Availability">
                {/* Time range */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="availableFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="text-gray-600 font-medium"
                          style={{ fontSize: "12px" }}
                        >
                          From
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className="h-8 text-sm rounded-lg border-gray-200 focus-visible:ring-primary/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage style={{ fontSize: "11px" }} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="availableTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="text-gray-600 font-medium"
                          style={{ fontSize: "12px" }}
                        >
                          Until
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className="h-8 text-sm rounded-lg border-gray-200 focus-visible:ring-primary/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage style={{ fontSize: "11px" }} />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Day pills */}
                <FormField
                  control={form.control}
                  name="availableDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className="text-gray-600 font-medium"
                        style={{ fontSize: "12px" }}
                      >
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-3 h-3" />
                          Active Days
                        </span>
                      </FormLabel>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {DAYS.map((day) => {
                          const checked = field.value?.includes(day) ?? false;
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const current = field.value ?? [];
                                field.onChange(
                                  checked
                                    ? current.filter((d) => d !== day)
                                    : [...current, day],
                                );
                              }}
                              className={cn(
                                "px-2.5 py-1 rounded-full border font-medium transition-all duration-150",
                                "leading-none select-none",
                                checked
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50",
                              )}
                              style={{ fontSize: "11px" }}
                            >
                              {DAY_SHORT[day]}
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage style={{ fontSize: "11px" }} />
                    </FormItem>
                  )}
                />
              </Section>

              {/* ── FnB Services ────────────────────────────────────────── */}
              {enabledServices.length > 0 && (
                <Section icon={Layers} label="Assign to Services">
                  <FormField
                    control={form.control}
                    name="fnbServiceIds"
                    render={({ field }) => (
                      <FormItem>
                        <p
                          className="text-gray-400 -mt-1"
                          style={{ fontSize: "12px" }}
                        >
                          This menu will appear in the selected services
                        </p>
                        <div className="grid grid-cols-1 gap-2 mt-1">
                          {enabledServices.map((entry) => {
                            const svc = entry.orgService!;
                            const def = getServiceDef(entry.type);
                            const checked =
                              field.value?.includes(svc.id) ?? false;

                            return (
                              <label
                                key={svc.id}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 cursor-pointer",
                                  "transition-all duration-150 select-none",
                                  checked
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100/60",
                                )}
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(c) => {
                                    const current = field.value ?? [];
                                    field.onChange(
                                      c
                                        ? [...current, svc.id]
                                        : current.filter((id) => id !== svc.id),
                                    );
                                  }}
                                  className="rounded-[4px] shrink-0"
                                />

                                {/* Service icon */}
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-gray-100 text-base shadow-sm shrink-0">
                                  {def.icon}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className="font-medium text-gray-800 truncate leading-snug"
                                    style={{ fontSize: "13px" }}
                                  >
                                    {svc.name}
                                  </p>
                                  <p
                                    className="text-gray-400 truncate leading-none mt-0.5"
                                    style={{ fontSize: "11px" }}
                                  >
                                    {entry.type.replace(/_/g, " ")}
                                  </p>
                                </div>

                                {checked && (
                                  <span
                                    className="shrink-0 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium leading-none"
                                    style={{ fontSize: "10px" }}
                                  >
                                    Selected
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                        <FormMessage style={{ fontSize: "11px" }} />
                      </FormItem>
                    )}
                  />
                </Section>
              )}
            </form>
          </Form>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <DialogFooter
          className={cn(
            "px-5 py-3.5 border-t border-gray-100 bg-gray-50/60 shrink-0",
            "flex items-center justify-end gap-2",
          )}
        >
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-8 px-4 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-100"
            style={{ fontSize: "13px" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="menu-form"
            disabled={isLoading}
            className="h-8 px-4 rounded-lg shadow-sm"
            style={{ fontSize: "13px" }}
          >
            {isLoading && (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            )}
            {isEdit ? "Save Changes" : "Create Menu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
