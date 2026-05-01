// src/components/room_types/RoomTypeTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pencil,
  Trash2,
  MoreHorizontal,
  Users,
  DollarSign,
  BedDouble,
  PackageOpen,
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
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { RoomType } from "@/types/room-types";

// ============================================================================
// AMENITY ICON MAP (matches the form dialog)
// ============================================================================

const AMENITY_ICON_MAP: Record<string, { label: string; icon: LucideIcon }> = {
  wifi: { label: "Free WiFi", icon: Wifi },
  tv: { label: "Flat Screen TV", icon: Tv },
  ac: { label: "Air Conditioning", icon: AirVent },
  heating: { label: "Heating", icon: Heater },
  safe: { label: "In-room Safe", icon: Lock },
  phone: { label: "Telephone", icon: Phone },
  wardrobe: { label: "Wardrobe", icon: Shirt },
  desk: { label: "Work Desk", icon: Laptop },
  coffeeTable: { label: "Coffee Table", icon: Coffee },
  sofa: { label: "Sofa/Seating Area", icon: Armchair },
  kingBed: { label: "King Size Bed", icon: Bed },
  privateBath: { label: "Private Bathroom", icon: Bath },
  shower: { label: "Rain Shower", icon: Waves },
  bathtub: { label: "Bathtub", icon: Bath },
  hairdryer: { label: "Hair Dryer", icon: Fan },
  toiletries: { label: "Free Toiletries", icon: Bath },
  minibar: { label: "Minibar", icon: Wine },
  coffeeMaker: { label: "Coffee/Tea Maker", icon: Coffee },
  fridge: { label: "Refrigerator", icon: Refrigerator },
  roomService: { label: "Room Service", icon: UtensilsCrossed },
  breakfast: { label: "Breakfast Included", icon: UtensilsCrossed },
  cityView: { label: "City View", icon: Mountain },
  oceanView: { label: "Ocean View", icon: Sunrise },
  balcony: { label: "Balcony/Terrace", icon: Sunrise },
  poolAccess: { label: "Pool Access", icon: Waves },
  gymAccess: { label: "Gym Access", icon: Dumbbell },
  parking: { label: "Free Parking", icon: CircleParking },
  valetParking: { label: "Valet Parking", icon: Car },
  nonSmoking: { label: "Non-Smoking", icon: CigaretteOff },
  smokingAllowed: { label: "Smoking Allowed", icon: Cigarette },
  petsAllowed: { label: "Pets Allowed", icon: Baby },
  accessible: { label: "Wheelchair Accessible", icon: Accessibility },
};

// ============================================================================
// AMENITY ICON COMPONENT
// ============================================================================

function AmenityIcon({ amenityId }: { amenityId: string }) {
  const mapped = AMENITY_ICON_MAP[amenityId];
  const Icon = mapped?.icon ?? Sparkles;
  const label = mapped?.label ?? amenityId;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex items-center justify-center h-7 w-7 rounded-md border transition-colors",
            "bg-muted/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// ============================================================================
// PROPS
// ============================================================================

interface Props {
  roomTypes: RoomType[];
  onEdit: (rt: RoomType) => void;
  onDelete: (rt: RoomType) => void;
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <PackageOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No room types yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Create your first room type to start managing rooms, pricing, and
        amenities.
      </p>
    </div>
  );
}

// ============================================================================
// MAIN TABLE COMPONENT
// ============================================================================

export function RoomTypeTable({ roomTypes, onEdit, onDelete }: Props) {
  if (!roomTypes || roomTypes.length === 0) {
    return <EmptyState />;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-lg border bg-card">
        {/* Header summary */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {roomTypes.length} Room Type{roomTypes.length !== 1 && "s"}
            </span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-55">Room Type</TableHead>
              <TableHead className="hidden lg:table-cell">
                Description
              </TableHead>
              <TableHead className="text-right w-32.5">
                <div className="flex items-center justify-end gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  Price/Night
                </div>
              </TableHead>
              <TableHead className="text-center w-30">
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Capacity
                </div>
              </TableHead>
              <TableHead className="w-50">Amenities</TableHead>
              <TableHead className="text-center w-22.5">Rooms</TableHead>
              <TableHead className="w-15" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {roomTypes.map((rt) => {
              const amenities = rt.amenities ?? [];
              const visibleCount = 5;
              const visibleAmenities = amenities.slice(0, visibleCount);
              const remainingCount = amenities.length - visibleCount;

              return (
                <TableRow
                  key={rt.id}
                  className="group hover:bg-muted/40 transition-colors"
                >
                  {/* Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BedDouble className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold truncate">{rt.name}</span>
                    </div>
                  </TableCell>

                  {/* Description */}
                  <TableCell className="hidden lg:table-cell">
                    <p className="text-sm text-muted-foreground max-w-62.5 truncate">
                      {rt.description || "—"}
                    </p>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-right">
                    <span className="text-sm font-bold tabular-nums">
                      {formatCurrency(Number(rt.basePrice))}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      /night
                    </span>
                  </TableCell>

                  {/* Capacity */}
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="gap-1 font-medium tabular-nums"
                    >
                      <Users className="h-3 w-3" />
                      {rt.maxOccupancy}
                    </Badge>
                  </TableCell>

                  {/* Amenities */}
                  <TableCell>
                    {amenities.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">
                        None
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        {visibleAmenities.map((a) => (
                          <AmenityIcon key={a} amenityId={a} />
                        ))}
                        {remainingCount > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center h-7 min-w-7 px-1.5 rounded-md border bg-muted/50 text-xs font-medium text-muted-foreground">
                                +{remainingCount}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-50">
                              <p className="text-xs">
                                {amenities
                                  .slice(visibleCount)
                                  .map((a) => AMENITY_ICON_MAP[a]?.label ?? a)
                                  .join(", ")}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Room Count */}
                  <TableCell className="text-center">
                    <div
                      className={cn(
                        "inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-full text-xs font-semibold",
                        (rt.roomCount ?? 0) > 0
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {rt.roomCount ?? 0}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onEdit(rt)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(rt)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
