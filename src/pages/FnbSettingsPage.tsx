import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag,
  Layers,
  Lock,
  ShieldAlert,
  Sparkles,
  ChefHat,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFnbStore } from "@/store/fnb/fnb.store";
import { useAuthStore } from "@/store/useAuthStore";

// ── Read-only banner ───────────────────────────────────────────────────────────
function ReadOnlyBanner() {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        "bg-amber-50 border border-amber-200/70",
      )}
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 shrink-0">
        <ShieldAlert className="w-4 h-4 text-amber-600" />
      </span>
      <p style={{ fontSize: "12px" }} className="text-amber-700 leading-snug">
        You have <span className="font-semibold">view-only</span> access to this
        section. Contact an{" "}
        <span className="font-semibold">admin or owner</span> to manage
        categories and dietary tags.
      </p>
    </div>
  );
}

// ── Section label ──────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="uppercase tracking-widest font-semibold text-gray-400"
      style={{ fontSize: "10px" }}
    >
      {children}
    </p>
  );
}

export default function FnbSettingsPage() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { canPerformAction } = useAuthStore();
  const isManager = canPerformAction(["OWNER", "ADMIN"]);

  // ── Store ─────────────────────────────────────────────────────────────────
  const {
    categories,
    dietaryTags,
    isLoading,
    isSubmitting,
    fetchCategories,
    fetchDietaryTags,
    createCategory,
    updateCategory,
    deleteCategory,
    createDietaryTag,
    updateDietaryTag,
    deleteDietaryTag,
  } = useFnbStore();

  // ── Category state ────────────────────────────────────────────────────────
  const [catDialog, setCatDialog] = useState(false);
  const [editCat, setEditCat] = useState<any | null>(null);
  const [catForm, setCatForm] = useState({
    name: "",
    icon: "",
    color: "#6b7280",
  });

  // ── Tag state ─────────────────────────────────────────────────────────────
  const [tagDialog, setTagDialog] = useState(false);
  const [editTag, setEditTag] = useState<any | null>(null);
  const [tagForm, setTagForm] = useState({
    name: "",
    shortName: "",
    icon: "",
    color: "#6b7280",
  });

  useEffect(() => {
    fetchCategories();
    fetchDietaryTags();
  }, []);

  // ── Category handlers ─────────────────────────────────────────────────────
  const openCatCreate = () => {
    if (!isManager) return;
    setEditCat(null);
    setCatForm({ name: "", icon: "", color: "#6b7280" });
    setCatDialog(true);
  };

  const openCatEdit = (cat: any) => {
    if (!isManager) return;
    setEditCat(cat);
    setCatForm({
      name: cat.name,
      icon: cat.icon ?? "",
      color: cat.color ?? "#6b7280",
    });
    setCatDialog(true);
  };

  const handleCatSubmit = async () => {
    if (!isManager) return;
    try {
      if (editCat) {
        await updateCategory(editCat.id, catForm);
        toast.success("Category updated");
      } else {
        await createCategory(catForm);
        toast.success("Category created");
      }
      setCatDialog(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed");
    }
  };

  const handleCatDelete = async (catId: string) => {
    if (!isManager) return;
    try {
      await deleteCategory(catId);
      toast.success("Category deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to delete category");
    }
  };

  // ── Tag handlers ──────────────────────────────────────────────────────────
  const openTagCreate = () => {
    if (!isManager) return;
    setEditTag(null);
    setTagForm({ name: "", shortName: "", icon: "", color: "#6b7280" });
    setTagDialog(true);
  };

  const openTagEdit = (tag: any) => {
    if (!isManager) return;
    setEditTag(tag);
    setTagForm({
      name: tag.name,
      shortName: tag.shortName ?? "",
      icon: tag.icon ?? "",
      color: tag.color ?? "#6b7280",
    });
    setTagDialog(true);
  };

  const handleTagSubmit = async () => {
    if (!isManager) return;
    try {
      if (editTag) {
        await updateDietaryTag(editTag.id, tagForm);
        toast.success("Tag updated");
      } else {
        await createDietaryTag(tagForm);
        toast.success("Tag created");
      }
      setTagDialog(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed");
    }
  };

  const handleTagDelete = async (tagId: string) => {
    if (!isManager) return;
    try {
      await deleteDietaryTag(tagId);
      toast.success("Tag deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to delete tag");
    }
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-linear-to-br from-stone-800 via-stone-700 to-stone-900 px-8 py-10">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-6 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Icon badge */}
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shrink-0">
              <ChefHat className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <SectionLabel>Food &amp; Beverage</SectionLabel>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <SectionLabel>Configuration</SectionLabel>
              </div>

              <h1
                className="font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: "22px" }}
              >
                Culinary Settings
              </h1>
              <p
                className="text-stone-300 mt-0.5 leading-snug"
                style={{ fontSize: "13px" }}
              >
                Define menu categories and dietary preferences for your
                establishment
              </p>
            </div>
          </div>

          {/* Role pill */}
          {!isManager && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                "bg-amber-400/20 border border-amber-400/30 text-amber-300",
                "font-medium shrink-0",
              )}
              style={{ fontSize: "11px" }}
            >
              <Lock className="w-3 h-3" />
              View only
            </span>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-5">
        {/* Read-only banner */}
        {!isManager && <ReadOnlyBanner />}

        {/* Tabs */}
        <Tabs defaultValue="categories">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList className="bg-white border border-gray-200 shadow-sm rounded-xl p-1 gap-1 h-auto">
              <TabsTrigger
                value="categories"
                className={cn(
                  "gap-2 rounded-lg px-4 py-2 text-gray-500 font-medium transition-all",
                  "data-[state=active]:bg-stone-800 data-[state=active]:text-white data-[state=active]:shadow-sm",
                )}
                style={{ fontSize: "13px" }}
              >
                <Layers className="w-3.5 h-3.5" />
                Menu Categories
              </TabsTrigger>
              <TabsTrigger
                value="dietary-tags"
                className={cn(
                  "gap-2 rounded-lg px-4 py-2 text-gray-500 font-medium transition-all",
                  "data-[state=active]:bg-stone-800 data-[state=active]:text-white data-[state=active]:shadow-sm",
                )}
                style={{ fontSize: "13px" }}
              >
                <Tag className="w-3.5 h-3.5" />
                Dietary Tags
              </TabsTrigger>
            </TabsList>

            {/* Count chips */}
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-500 font-medium shadow-sm"
                style={{ fontSize: "11px" }}
              >
                {categories.length} Categories
              </span>
              <span
                className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-500 font-medium shadow-sm"
                style={{ fontSize: "11px" }}
              >
                {dietaryTags.length} Tags
              </span>
            </div>
          </div>

          {/* ── Categories Tab ─────────────────────────────────────────────── */}
          <TabsContent value="categories" className="mt-5">
            <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-white">
              {/* Card header */}
              <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div>
                  <CardTitle
                    className="font-semibold text-gray-800"
                    style={{ fontSize: "14px" }}
                  >
                    Menu Categories
                  </CardTitle>
                  <p
                    className="text-gray-400 mt-0.5"
                    style={{ fontSize: "12px" }}
                  >
                    Organise your menu items into logical sections
                  </p>
                </div>

                {isManager ? (
                  <Button
                    size="sm"
                    onClick={openCatCreate}
                    className="h-8 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-white shadow-sm gap-1.5"
                    style={{ fontSize: "12px" }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Category
                  </Button>
                ) : (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                            "text-gray-400 bg-gray-100 border border-gray-200",
                            "cursor-not-allowed select-none",
                          )}
                          style={{ fontSize: "12px" }}
                        >
                          <Lock className="w-3 h-3" />
                          Add Category
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs">
                        Only admins can add categories.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardHeader>

              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-xl" />
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 mb-4">
                      <Layers className="w-6 h-6 text-stone-400" />
                    </div>
                    <p
                      className="font-semibold text-gray-700"
                      style={{ fontSize: "14px" }}
                    >
                      No categories yet
                    </p>
                    <p
                      className="text-gray-400 mt-1 max-w-xs"
                      style={{ fontSize: "12px" }}
                    >
                      Create your first category to start organising your menu
                      items.
                    </p>
                    {isManager && (
                      <Button
                        size="sm"
                        onClick={openCatCreate}
                        className="mt-4 rounded-lg bg-stone-800 hover:bg-stone-700 text-white gap-1.5"
                        style={{ fontSize: "12px" }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add First Category
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {categories.map((cat, idx) => (
                      <div
                        key={cat.id}
                        className={cn(
                          "group flex items-center gap-4 px-6 py-4 transition-colors",
                          isManager ? "hover:bg-stone-50/60" : "cursor-default",
                        )}
                      >
                        {/* Index number */}
                        <span
                          className="w-5 text-center font-medium text-gray-300 shrink-0"
                          style={{ fontSize: "11px" }}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>

                        {/* Color avatar */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-semibold shrink-0 border"
                          style={{
                            backgroundColor: cat.color
                              ? `${cat.color}18`
                              : "#f3f4f6",
                            borderColor: cat.color
                              ? `${cat.color}30`
                              : "#e5e7eb",
                            color: cat.color ?? "#6b7280",
                          }}
                        >
                          {cat.icon || cat.name[0].toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="font-semibold text-gray-800 truncate"
                              style={{ fontSize: "13px" }}
                            >
                              {cat.name}
                            </span>
                            {cat.isSystem && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 font-medium"
                                style={{ fontSize: "10px" }}
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                System
                              </span>
                            )}
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-medium",
                                cat.isActive
                                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                                  : "bg-gray-100 border border-gray-200 text-gray-500",
                              )}
                              style={{ fontSize: "10px" }}
                            >
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  cat.isActive
                                    ? "bg-emerald-500"
                                    : "bg-gray-400",
                                )}
                              />
                              {cat.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p
                            className="text-gray-400 mt-0.5"
                            style={{ fontSize: "11px" }}
                          >
                            {cat._count?.menuItems ?? 0} menu items
                            &nbsp;·&nbsp;
                            <span className="uppercase tracking-wide">
                              {cat.type}
                            </span>
                          </p>
                        </div>

                        {/* Color swatch */}
                        {cat.color && (
                          <div
                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm shrink-0"
                            style={{ backgroundColor: cat.color }}
                            title={cat.color}
                          />
                        )}

                        {/* Actions */}
                        {!cat.isSystem && isManager ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-8 w-8 rounded-lg text-gray-400 shrink-0",
                                  "opacity-0 group-hover:opacity-100 transition-opacity",
                                  "hover:bg-stone-100 hover:text-gray-700",
                                )}
                                aria-label="Category options"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-40 rounded-xl shadow-lg border-gray-100"
                            >
                              <DropdownMenuItem
                                onClick={() => openCatEdit(cat)}
                                className="gap-2 rounded-lg"
                                style={{ fontSize: "13px" }}
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCatDelete(cat.id)}
                                className="gap-2 rounded-lg text-destructive focus:text-destructive"
                                style={{ fontSize: "13px" }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <div className="w-8 h-8 shrink-0" aria-hidden />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Dietary Tags Tab ───────────────────────────────────────────── */}
          <TabsContent value="dietary-tags" className="mt-5">
            <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div>
                  <CardTitle
                    className="font-semibold text-gray-800"
                    style={{ fontSize: "14px" }}
                  >
                    Dietary Tags
                  </CardTitle>
                  <p
                    className="text-gray-400 mt-0.5"
                    style={{ fontSize: "12px" }}
                  >
                    Label items with dietary preferences and allergen info
                  </p>
                </div>

                {isManager ? (
                  <Button
                    size="sm"
                    onClick={openTagCreate}
                    className="h-8 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-white shadow-sm gap-1.5"
                    style={{ fontSize: "12px" }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Tag
                  </Button>
                ) : (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                            "text-gray-400 bg-gray-100 border border-gray-200",
                            "cursor-not-allowed select-none",
                          )}
                          style={{ fontSize: "12px" }}
                        >
                          <Lock className="w-3 h-3" />
                          Add Tag
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs">
                        Only admins can add dietary tags.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardHeader>

              <CardContent className="p-6">
                {isLoading ? (
                  <div className="flex flex-wrap gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-28 rounded-full" />
                    ))}
                  </div>
                ) : dietaryTags.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 mb-4">
                      <Tag className="w-6 h-6 text-stone-400" />
                    </div>
                    <p
                      className="font-semibold text-gray-700"
                      style={{ fontSize: "14px" }}
                    >
                      No dietary tags yet
                    </p>
                    <p
                      className="text-gray-400 mt-1 max-w-xs"
                      style={{ fontSize: "12px" }}
                    >
                      Add tags like Vegetarian, Vegan, Gluten-Free to help
                      guests identify suitable dishes.
                    </p>
                    {isManager && (
                      <Button
                        size="sm"
                        onClick={openTagCreate}
                        className="mt-4 rounded-lg bg-stone-800 hover:bg-stone-700 text-white gap-1.5"
                        style={{ fontSize: "12px" }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add First Tag
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {dietaryTags.map((tag) => (
                      <div
                        key={tag.id}
                        className={cn(
                          "group flex items-center gap-2 px-3 py-2 rounded-2xl border",
                          "transition-all duration-150 shadow-sm bg-white",
                          !isManager && "cursor-default",
                        )}
                        style={{
                          borderColor: tag.color ? `${tag.color}40` : "#e5e7eb",
                          backgroundColor: tag.color
                            ? `${tag.color}0d`
                            : "#fafafa",
                        }}
                      >
                        {/* Icon */}
                        {tag.icon && (
                          <span
                            className="flex items-center justify-center w-6 h-6 rounded-full"
                            style={{
                              backgroundColor: tag.color
                                ? `${tag.color}20`
                                : "#f3f4f6",
                            }}
                          >
                            <span style={{ fontSize: "13px" }}>{tag.icon}</span>
                          </span>
                        )}

                        {/* Name */}
                        <span
                          className="font-semibold leading-none"
                          style={{
                            fontSize: "12px",
                            color: tag.color ?? "#374151",
                          }}
                        >
                          {tag.shortName ?? tag.name}
                        </span>

                        {/* Count */}
                        <span
                          className="px-1.5 py-0.5 rounded-full font-medium leading-none"
                          style={{
                            fontSize: "10px",
                            backgroundColor: tag.color
                              ? `${tag.color}20`
                              : "#f3f4f6",
                            color: tag.color ?? "#9ca3af",
                          }}
                        >
                          {tag._count?.menuItems ?? 0}
                        </span>

                        {/* System badge */}
                        {tag.isSystem && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-500 font-medium leading-none"
                            style={{ fontSize: "9px" }}
                          >
                            <Sparkles className="w-2 h-2" />
                            System
                          </span>
                        )}

                        {/* Actions */}
                        {!tag.isSystem && isManager && (
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5">
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => openTagEdit(tag)}
                                    className="p-1 rounded-lg hover:bg-white/80 transition-colors"
                                    aria-label={`Edit ${tag.name}`}
                                  >
                                    <Edit className="w-3 h-3 text-gray-500" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  Edit tag
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleTagDelete(tag.id)}
                                    className="p-1 rounded-lg hover:bg-red-50 transition-colors"
                                    aria-label={`Delete ${tag.name}`}
                                  >
                                    <Trash2 className="w-3 h-3 text-red-400" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  Delete tag
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Dialogs ───────────────────────────────────────────────────────── */}
      {isManager && (
        <>
          {/* ── Category Dialog ──────────────────────────────────────────── */}
          <Dialog open={catDialog} onOpenChange={setCatDialog}>
            <DialogContent
              className={cn(
                "max-w-md w-[90vw] p-0 gap-0 rounded-2xl overflow-hidden",
                "border border-gray-100 shadow-xl",
              )}
            >
              {/* Header */}
              <div className="bg-linear-to-br from-stone-800 to-stone-700 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/15 border border-white/20">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <DialogTitle
                      className="font-semibold text-white leading-snug"
                      style={{ fontSize: "14px" }}
                    >
                      {editCat ? "Edit Category" : "New Category"}
                    </DialogTitle>
                    <p
                      className="text-stone-300 leading-none mt-0.5"
                      style={{ fontSize: "11px" }}
                    >
                      {editCat
                        ? "Update category details below"
                        : "Add a new section to your menu"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 bg-white">
                <div>
                  <Label
                    className="text-gray-600 font-medium"
                    style={{ fontSize: "12px" }}
                  >
                    Category Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={catForm.name}
                    onChange={(e) =>
                      setCatForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Grilled Specialties"
                    className="mt-1.5 h-9 rounded-xl border-gray-200 text-sm focus-visible:ring-stone-400/30"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      className="text-gray-600 font-medium"
                      style={{ fontSize: "12px" }}
                    >
                      Icon (emoji)
                    </Label>
                    <Input
                      value={catForm.icon}
                      onChange={(e) =>
                        setCatForm((f) => ({ ...f, icon: e.target.value }))
                      }
                      placeholder="🍖"
                      className="mt-1.5 h-9 rounded-xl border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <Label
                      className="text-gray-600 font-medium"
                      style={{ fontSize: "12px" }}
                    >
                      Accent Colour
                    </Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Input
                        type="color"
                        value={catForm.color}
                        onChange={(e) =>
                          setCatForm((f) => ({ ...f, color: e.target.value }))
                        }
                        className="h-9 w-14 rounded-xl cursor-pointer p-1 border-gray-200"
                      />
                      <span
                        className="text-gray-400 font-mono"
                        style={{ fontSize: "11px" }}
                      >
                        {catForm.color}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live preview */}
                {catForm.name && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base border"
                      style={{
                        backgroundColor: `${catForm.color}18`,
                        borderColor: `${catForm.color}30`,
                        color: catForm.color,
                      }}
                    >
                      {catForm.icon || catForm.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p
                        className="font-semibold text-gray-800"
                        style={{ fontSize: "13px" }}
                      >
                        {catForm.name}
                      </p>
                      <p className="text-gray-400" style={{ fontSize: "11px" }}>
                        Preview
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCatDialog(false)}
                  className="flex-1 h-9 rounded-xl border-gray-200 text-gray-600"
                  style={{ fontSize: "13px" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCatSubmit}
                  disabled={!catForm.name.trim() || isSubmitting}
                  className="flex-1 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-white"
                  style={{ fontSize: "13px" }}
                >
                  {editCat ? "Save Changes" : "Create Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Tag Dialog ───────────────────────────────────────────────── */}
          <Dialog open={tagDialog} onOpenChange={setTagDialog}>
            <DialogContent
              className={cn(
                "max-w-md w-[90vw] p-0 gap-0 rounded-2xl overflow-hidden",
                "border border-gray-100 shadow-xl",
              )}
            >
              {/* Header */}
              <div className="bg-linear-to-br from-stone-800 to-stone-700 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/15 border border-white/20">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <DialogTitle
                      className="font-semibold text-white leading-snug"
                      style={{ fontSize: "14px" }}
                    >
                      {editTag ? "Edit Dietary Tag" : "New Dietary Tag"}
                    </DialogTitle>
                    <p
                      className="text-stone-300 leading-none mt-0.5"
                      style={{ fontSize: "11px" }}
                    >
                      {editTag
                        ? "Update tag details below"
                        : "Help guests identify dishes that suit their needs"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 bg-white">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      className="text-gray-600 font-medium"
                      style={{ fontSize: "12px" }}
                    >
                      Tag Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={tagForm.name}
                      onChange={(e) =>
                        setTagForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="e.g. Vegetarian"
                      className="mt-1.5 h-9 rounded-xl border-gray-200 text-sm"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label
                      className="text-gray-600 font-medium"
                      style={{ fontSize: "12px" }}
                    >
                      Short Name
                    </Label>
                    <Input
                      value={tagForm.shortName}
                      onChange={(e) =>
                        setTagForm((f) => ({
                          ...f,
                          shortName: e.target.value,
                        }))
                      }
                      placeholder="VEG"
                      className="mt-1.5 h-9 rounded-xl border-gray-200 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      className="text-gray-600 font-medium"
                      style={{ fontSize: "12px" }}
                    >
                      Icon (emoji)
                    </Label>
                    <Input
                      value={tagForm.icon}
                      onChange={(e) =>
                        setTagForm((f) => ({ ...f, icon: e.target.value }))
                      }
                      placeholder="🌱"
                      className="mt-1.5 h-9 rounded-xl border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <Label
                      className="text-gray-600 font-medium"
                      style={{ fontSize: "12px" }}
                    >
                      Accent Colour
                    </Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Input
                        type="color"
                        value={tagForm.color}
                        onChange={(e) =>
                          setTagForm((f) => ({ ...f, color: e.target.value }))
                        }
                        className="h-9 w-14 rounded-xl cursor-pointer p-1 border-gray-200"
                      />
                      <span
                        className="text-gray-400 font-mono"
                        style={{ fontSize: "11px" }}
                      >
                        {tagForm.color}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live preview */}
                {tagForm.name && (
                  <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p
                      className="text-gray-400 w-full mb-1"
                      style={{ fontSize: "11px" }}
                    >
                      Preview
                    </p>
                    <div
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-sm"
                      style={{
                        borderColor: tagForm.color
                          ? `${tagForm.color}40`
                          : "#e5e7eb",
                        backgroundColor: tagForm.color
                          ? `${tagForm.color}0d`
                          : "#fafafa",
                      }}
                    >
                      {tagForm.icon && (
                        <span
                          className="flex items-center justify-center w-6 h-6 rounded-full"
                          style={{
                            backgroundColor: `${tagForm.color}20`,
                          }}
                        >
                          <span style={{ fontSize: "13px" }}>
                            {tagForm.icon}
                          </span>
                        </span>
                      )}
                      <span
                        className="font-semibold"
                        style={{
                          fontSize: "12px",
                          color: tagForm.color ?? "#374151",
                        }}
                      >
                        {tagForm.shortName || tagForm.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setTagDialog(false)}
                  className="flex-1 h-9 rounded-xl border-gray-200 text-gray-600"
                  style={{ fontSize: "13px" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTagSubmit}
                  disabled={!tagForm.name.trim() || isSubmitting}
                  className="flex-1 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-white"
                  style={{ fontSize: "13px" }}
                >
                  {editTag ? "Save Changes" : "Create Tag"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
