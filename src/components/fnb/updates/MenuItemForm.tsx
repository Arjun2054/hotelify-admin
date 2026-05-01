import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  Tag,
  Utensils,
  DollarSign,
  LayoutGrid,
  Info,
  Star,
  Zap,
} from "lucide-react";
import type {
  DietaryTag,
  Menu,
  MenuCategory,
  MenuItem,
  MenuSection,
} from "@/types/fnb.types";

// ── Sentinel for "no selection" Selects ───────────────────────────────────────
const NONE = "none" as const;

// ── Zod schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  price: z.coerce
    .number({ message: "Price is required" })
    .min(0, "Must be 0 or greater"),
  discountPrice: z.coerce.number().min(0).optional().or(z.literal("")),
  menuId: z.string().min(1, "Menu is required"),
  sectionId: z.string().optional(),
  menuCategoryId: z.string().optional(),
  status: z.enum(["AVAILABLE", "OUT_OF_STOCK", "DISCONTINUED"]).optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  preparationTime: z.coerce.number().int().min(0).optional().or(z.literal("")),
  calories: z.coerce.number().int().min(0).optional().or(z.literal("")),
  sku: z.string().max(100).optional(),
  isSignature: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  allergens: z.string().optional(),
  dietaryTagIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

function resolveNone(v: string | undefined): string | undefined {
  return !v || v === NONE ? undefined : v;
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h3>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="space-y-3 pl-8">{children}</div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface MenuItemFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<
      FormValues,
      "allergens" | "discountPrice" | "preparationTime" | "calories"
    > & {
      allergens: string[];
      discountPrice?: number;
      preparationTime?: number;
      calories?: number;
      sectionId?: string;
      menuCategoryId?: string;
      imageUrl?: string;
    },
  ) => Promise<void>;
  item?: MenuItem | null;
  menus: Menu[];
  sections: MenuSection[];
  categories: MenuCategory[];
  dietaryTags: DietaryTag[];
  defaultMenuId?: string;
  isLoading?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function MenuItemForm({
  open,
  onClose,
  onSubmit,
  item,
  menus,
  sections,
  categories,
  dietaryTags,
  defaultMenuId,
  isLoading,
}: MenuItemFormProps) {
  const isEdit = !!item;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPrice: "" as const,
      menuId: defaultMenuId ?? "",
      sectionId: NONE,
      menuCategoryId: NONE,
      status: "AVAILABLE" as const,
      imageUrl: "",
      preparationTime: "" as const,
      calories: "" as const,
      sku: "",
      isSignature: false,
      isFeatured: false,
      allergens: "",
      dietaryTagIds: [] as string[],
    },
  });

  const watchMenuId = form.watch("menuId");
  const filteredSections = sections.filter((s) => s.menuId === watchMenuId);

  // ── Populate on edit / reset on create ────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (item) {
      form.reset({
        name: item.name,
        description: item.description ?? "",
        price: Number(item.price),
        discountPrice: item.discountPrice ? Number(item.discountPrice) : "",
        menuId: item.menuId,
        sectionId: item.sectionId ?? NONE,
        menuCategoryId: item.menuCategoryId ?? NONE,
        status: item.status,
        imageUrl: item.imageUrl ?? "",
        preparationTime: item.preparationTime ?? "",
        calories: item.calories ?? "",
        sku: item.sku ?? "",
        isSignature: item.isSignature,
        isFeatured: item.isFeatured,
        allergens: item.allergens?.join(", ") ?? "",
        dietaryTagIds: item.dietaryTags?.map((dt) => dt.dietaryTag.id) ?? [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        discountPrice: "",
        menuId: defaultMenuId ?? "",
        sectionId: NONE,
        menuCategoryId: NONE,
        status: "AVAILABLE",
        imageUrl: "",
        preparationTime: "",
        calories: "",
        sku: "",
        isSignature: false,
        isFeatured: false,
        allergens: "",
        dietaryTagIds: [],
      });
    }
  }, [item, open, defaultMenuId]);

  useEffect(() => {
    form.setValue("sectionId", NONE);
  }, [watchMenuId]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (values: FormValues) => {
    const allergens = values.allergens
      ? values.allergens
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean)
      : [];
    await onSubmit({
      ...values,
      allergens,
      sectionId: resolveNone(values.sectionId),
      menuCategoryId: resolveNone(values.menuCategoryId),
      imageUrl: values.imageUrl || undefined,
      discountPrice:
        values.discountPrice !== "" && Number(values.discountPrice) > 0
          ? Number(values.discountPrice)
          : undefined,
      preparationTime:
        values.preparationTime !== "" && values.preparationTime !== undefined
          ? Number(values.preparationTime)
          : undefined,
      calories:
        values.calories !== "" && values.calories !== undefined
          ? Number(values.calories)
          : undefined,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        {/* ── Fixed header ─────────────────────────────────────────────────── */}
        <SheetHeader className="px-6 py-5 border-b bg-background shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-base font-semibold leading-tight">
                {isEdit ? "Edit Menu Item" : "Add Menu Item"}
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEdit
                  ? "Update item details below"
                  : "Fill in the item details below"}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* ── Scrollable body ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              id="menu-item-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="px-6 py-6 space-y-8"
            >
              {/* ── Basic Info ──────────────────────────────────────────────── */}
              <FormSection icon={Utensils} title="Basic Info">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Item Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Grilled Salmon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the dish, ingredients, cooking style…"
                          rows={3}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/food.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              {/* ── Pricing ─────────────────────────────────────────────────── */}
              <FormSection icon={DollarSign} title="Pricing">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Price <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-7"
                              {...field}
                              value={field.value as string | number}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discountPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Discount Price
                          <span className="ml-1.5 text-[10px] font-normal text-muted-foreground uppercase tracking-wide">
                            optional
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-7"
                              {...field}
                              value={
                                (field.value as string | number | undefined) ??
                                ""
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              {/* ── Organisation ────────────────────────────────────────────── */}
              <FormSection icon={LayoutGrid} title="Organisation">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="menuId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Menu <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a menu" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {menus.length === 0 ? (
                              <SelectItem value="__empty__" disabled>
                                No menus available
                              </SelectItem>
                            ) : (
                              menus.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sectionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <Select
                          value={field.value ?? NONE}
                          onValueChange={field.onChange}
                          disabled={!watchMenuId || watchMenuId === "__empty__"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="No section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE}>No section</SelectItem>
                            {filteredSections.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="menuCategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          value={field.value ?? NONE}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="No category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE}>No category</SelectItem>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.icon ? `${c.icon} ` : ""}
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isEdit && (
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="AVAILABLE">
                                <span className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                  Available
                                </span>
                              </SelectItem>
                              <SelectItem value="OUT_OF_STOCK">
                                <span className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                                  Out of Stock
                                </span>
                              </SelectItem>
                              <SelectItem value="DISCONTINUED">
                                <span className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                                  Discontinued
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </FormSection>

              {/* ── Details ─────────────────────────────────────────────────── */}
              <FormSection icon={Info} title="Details">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="preparationTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prep Time</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              placeholder="15"
                              className="pr-10"
                              {...field}
                              value={
                                (field.value as string | number | undefined) ??
                                ""
                              }
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              min
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calories</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              placeholder="350"
                              className="pr-10"
                              {...field}
                              value={
                                (field.value as string | number | undefined) ??
                                ""
                              }
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              cal
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="ITEM-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="allergens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergens</FormLabel>
                      <FormControl>
                        <Input placeholder="nuts, dairy, gluten" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Separate multiple allergens with commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              {/* ── Flags ───────────────────────────────────────────────────── */}
              <FormSection icon={Star} title="Highlights">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="isSignature"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border px-4 py-3 gap-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            Signature
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Chef's special dish
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border px-4 py-3 gap-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-blue-500" />
                            Featured
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Promoted on menu
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              {/* ── Dietary Tags ─────────────────────────────────────────────── */}
              {dietaryTags.length > 0 && (
                <FormSection icon={Tag} title="Dietary Tags">
                  <FormField
                    control={form.control}
                    name="dietaryTagIds"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-wrap gap-2">
                          {dietaryTags.map((tag) => {
                            const checked =
                              field.value?.includes(tag.id) ?? false;
                            return (
                              <label
                                key={tag.id}
                                className={[
                                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
                                  "text-xs cursor-pointer select-none transition-all duration-150",
                                  checked
                                    ? "border-transparent text-white shadow-sm"
                                    : "border-border bg-background hover:bg-muted hover:border-border/80",
                                ].join(" ")}
                                style={
                                  checked
                                    ? {
                                        backgroundColor: tag.color ?? "#6b7280",
                                      }
                                    : {}
                                }
                              >
                                <Checkbox
                                  checked={checked}
                                  className="hidden"
                                  onCheckedChange={(c) => {
                                    const current = field.value ?? [];
                                    field.onChange(
                                      c
                                        ? [...current, tag.id]
                                        : current.filter((id) => id !== tag.id),
                                    );
                                  }}
                                />
                                {tag.icon ? `${tag.icon} ` : ""}
                                {tag.shortName ?? tag.name}
                              </label>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormSection>
              )}

              {/* Bottom padding so last section isn't flush against footer */}
              <div className="h-2" />
            </form>
          </Form>
        </div>

        {/* ── Fixed footer ─────────────────────────────────────────────────── */}
        <SheetFooter className="px-6 py-4 border-t bg-background shrink-0">
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="min-w-[80px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="menu-item-form"
              disabled={isLoading}
              className="min-w-[110px]"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
