// src/components/room_types/RoomTypeFormDialog.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Plus,
  X,
  Check,
  Wifi,
  Tv,
  AirVent,
  Coffee,
  Bath,
  Shirt,
  Refrigerator,
  Phone,
  Lock,
  Waves,
  Dumbbell,
  Car,
  UtensilsCrossed,
  Wine,
  Laptop,
  Armchair,
  Bed,
  CircleParking,
  Heater,
  Fan,
  Cigarette,
  CigaretteOff,
  Baby,
  Accessibility,
  Mountain,
  Sunrise,
  type LucideIcon,
} from "lucide-react";
import type { RoomType, CreateRoomTypePayload } from "@/types/room-types";
import { cn } from "@/lib/utils";

// ============================================================================
// AMENITY CONFIGURATION
// ============================================================================

interface AmenityOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface AmenityCategory {
  name: string;
  amenities: AmenityOption[];
}

const AMENITY_CATEGORIES: AmenityCategory[] = [
  {
    name: "Essentials",
    amenities: [
      { id: "wifi", label: "Free WiFi", icon: Wifi },
      { id: "tv", label: "Flat Screen TV", icon: Tv },
      { id: "ac", label: "Air Conditioning", icon: AirVent },
      { id: "heating", label: "Heating", icon: Heater },
      { id: "safe", label: "In-room Safe", icon: Lock },
      { id: "phone", label: "Telephone", icon: Phone },
    ],
  },
  {
    name: "Furniture",
    amenities: [
      { id: "wardrobe", label: "Wardrobe", icon: Shirt },
      { id: "desk", label: "Work Desk", icon: Laptop },
      { id: "coffeeTable", label: "Coffee Table", icon: Coffee },
      { id: "sofa", label: "Sofa/Seating Area", icon: Armchair },
      { id: "kingBed", label: "King Size Bed", icon: Bed },
    ],
  },
  {
    name: "Bathroom",
    amenities: [
      { id: "privateBath", label: "Private Bathroom", icon: Bath },
      { id: "shower", label: "Rain Shower", icon: Waves },
      { id: "bathtub", label: "Bathtub", icon: Bath },
      { id: "hairdryer", label: "Hair Dryer", icon: Fan },
      { id: "toiletries", label: "Free Toiletries", icon: Bath },
    ],
  },
  {
    name: "Food & Drinks",
    amenities: [
      { id: "minibar", label: "Minibar", icon: Wine },
      { id: "coffeeMaker", label: "Coffee/Tea Maker", icon: Coffee },
      { id: "fridge", label: "Refrigerator", icon: Refrigerator },
      { id: "roomService", label: "Room Service", icon: UtensilsCrossed },
      { id: "breakfast", label: "Breakfast Included", icon: UtensilsCrossed },
    ],
  },
  {
    name: "Views & Location",
    amenities: [
      { id: "cityView", label: "City View", icon: Mountain },
      { id: "oceanView", label: "Ocean View", icon: Sunrise },
      { id: "balcony", label: "Balcony/Terrace", icon: Sunrise },
      { id: "poolAccess", label: "Pool Access", icon: Waves },
      { id: "gymAccess", label: "Gym Access", icon: Dumbbell },
    ],
  },
  {
    name: "Services & Policies",
    amenities: [
      { id: "parking", label: "Free Parking", icon: CircleParking },
      { id: "valetParking", label: "Valet Parking", icon: Car },
      { id: "nonSmoking", label: "Non-Smoking", icon: CigaretteOff },
      { id: "smokingAllowed", label: "Smoking Allowed", icon: Cigarette },
      { id: "petsAllowed", label: "Pets Allowed", icon: Baby },
      { id: "accessible", label: "Wheelchair Accessible", icon: Accessibility },
    ],
  },
];

const ALL_AMENITIES = AMENITY_CATEGORIES.flatMap((cat) => cat.amenities);

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoomTypePayload) => Promise<void>;
  editingType?: RoomType | null;
  isLoading: boolean;
}

// ============================================================================
// CUSTOM CHECKBOX INDICATOR
// ============================================================================

function CheckIndicator({ checked }: { checked: boolean }) {
  return (
    <div
      className={cn(
        "h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors",
        checked
          ? "bg-primary border-primary text-primary-foreground"
          : "border-muted-foreground/40 bg-background",
      )}
    >
      {checked && <Check className="h-3 w-3" />}
    </div>
  );
}

export function RoomTypeFormDialog({
  open,
  onClose,
  onSubmit,
  editingType,
  isLoading,
}: Props) {
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(
    new Set(),
  );
  const [customAmenities, setCustomAmenities] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<CreateRoomTypePayload, "amenities">>();

  const isEdit = !!editingType;

  useEffect(() => {
    if (!open) return;

    if (editingType) {
      reset({
        name: editingType.name,
        description: editingType.description ?? "",
        basePrice: Number(editingType.basePrice),
        maxOccupancy: editingType.maxOccupancy,
      });

      const amenities = editingType.amenities ?? [];
      const predefinedIds = new Set(ALL_AMENITIES.map((a) => a.id));
      const selected = new Set<string>();
      const custom: string[] = [];

      amenities.forEach((a) => {
        if (predefinedIds.has(a)) {
          selected.add(a);
        } else {
          custom.push(a);
        }
      });

      setSelectedAmenities(selected);
      setCustomAmenities(custom);
    } else {
      reset({ name: "", description: "", basePrice: 0, maxOccupancy: 2 });
      setSelectedAmenities(new Set());
      setCustomAmenities([]);
    }
    setCustomInput("");
  }, [editingType, reset, open]);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addCustomAmenity = () => {
    const trimmed = customInput.trim();
    if (
      trimmed &&
      !customAmenities.includes(trimmed) &&
      !selectedAmenities.has(trimmed)
    ) {
      setCustomAmenities([...customAmenities, trimmed]);
      setCustomInput("");
    }
  };

  const removeCustomAmenity = (amenity: string) => {
    setCustomAmenities(customAmenities.filter((a) => a !== amenity));
  };

  const onFormSubmit = async (
    data: Omit<CreateRoomTypePayload, "amenities">,
  ) => {
    const amenities = [...Array.from(selectedAmenities), ...customAmenities];
    await onSubmit({ ...data, amenities });
    onClose();
  };

  const totalSelected = selectedAmenities.size + customAmenities.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-175 max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header - fixed */}
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="text-xl">
            {isEdit ? "Edit Room Type" : "Create New Room Type"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the room type details and amenities."
              : "Configure a new room type with pricing and amenities."}
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Form wraps BOTH scrollable content AND footer */}
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Scrollable middle */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-6 pb-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h3 className="font-semibold text-lg">Basic Information</h3>
                </div>

                <div className="grid gap-4 pl-3">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Room Type Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      placeholder="e.g. Deluxe Suite, Standard Room"
                      className={cn(errors.name && "border-red-500")}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Describe what makes this room type special..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basePrice">
                        Base Price ($/night){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="basePrice"
                          type="number"
                          step="0.01"
                          min="0"
                          className={cn(
                            "pl-7",
                            errors.basePrice && "border-red-500",
                          )}
                          {...register("basePrice", {
                            required: "Price is required",
                            valueAsNumber: true,
                            min: { value: 0.01, message: "Must be positive" },
                          })}
                        />
                      </div>
                      {errors.basePrice && (
                        <p className="text-xs text-red-500">
                          {errors.basePrice.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxOccupancy">
                        Max Occupancy <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="maxOccupancy"
                          type="number"
                          min="1"
                          max="20"
                          className={cn(
                            errors.maxOccupancy && "border-red-500",
                          )}
                          {...register("maxOccupancy", {
                            required: "Required",
                            valueAsNumber: true,
                            min: { value: 1, message: "At least 1 guest" },
                            max: { value: 20, message: "Maximum 20 guests" },
                          })}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          guests
                        </span>
                      </div>
                      {errors.maxOccupancy && (
                        <p className="text-xs text-red-500">
                          {errors.maxOccupancy.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Amenities */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-primary rounded-full" />
                    <h3 className="font-semibold text-lg">Amenities</h3>
                  </div>
                  {totalSelected > 0 && (
                    <Badge variant="secondary" className="font-normal">
                      {totalSelected} selected
                    </Badge>
                  )}
                </div>

                <div className="space-y-6 pl-3">
                  {AMENITY_CATEGORIES.map((category) => (
                    <div key={category.name} className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        {category.name}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {category.amenities.map((amenity) => {
                          const Icon = amenity.icon;
                          const isSelected = selectedAmenities.has(amenity.id);

                          return (
                            <button
                              key={amenity.id}
                              type="button"
                              onClick={() => toggleAmenity(amenity.id)}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all w-full",
                                "hover:bg-accent hover:border-accent-foreground/20",
                                isSelected
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "bg-background border-border",
                              )}
                            >
                              <CheckIndicator checked={isSelected} />
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="text-sm truncate">
                                {amenity.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <Separator className="my-4" />

                  {/* Custom Amenities */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Custom Amenities
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Add any additional amenities not listed above
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomAmenity();
                          }
                        }}
                        placeholder="e.g. Jacuzzi, Private Pool..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addCustomAmenity}
                        disabled={!customInput.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    {customAmenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {customAmenities.map((amenity) => (
                          <Badge
                            key={amenity}
                            variant="secondary"
                            className="gap-1 pr-1 py-1"
                          >
                            {amenity}
                            <button
                              type="button"
                              onClick={() => removeCustomAmenity(amenity)}
                              className="ml-1 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Footer is NOW inside the form */}
          <div className="px-6 py-4 border-t bg-muted/30 shrink-0">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                {totalSelected > 0 && (
                  <>
                    <span className="font-medium text-foreground">
                      {totalSelected}
                    </span>{" "}
                    amenities selected
                  </>
                )}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                {/* ✅ This button now correctly triggers form submit */}
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEdit ? "Update Room Type" : "Create Room Type"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
