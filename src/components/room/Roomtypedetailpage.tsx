// import { Modal } from "@/components/shared/Modal";
// import { Button } from "@/components/shared/Formfields";
// import { formatCurrency } from "@/lib/utils";
// import {
//   ArrowLeft,
//   BedDouble,
//   CheckCircle2,
//   Maximize2,
//   Pencil,
//   Trash2,
//   Users,
//   XCircle,
//   Building2,
//   TrendingUp,
//   Sparkles,
// } from "lucide-react";
// import { useState, useCallback } from "react";
// import type { RoomType } from "@/types/room-types";
// import { useRoomTypeStore } from "@/store/room/roomTypeStore";

// // ─── Types ────────────────────────────────────────────────────────────────────

// export interface RoomTypeStats {
//   id: string;
//   available: number;
//   totalRooms: number;
//   occupancyRate: number;
// }

// export interface RoomTypeDetailPageProps {
//   roomType: RoomType;
//   stats?: RoomTypeStats;
//   image: string;
//   onBack: () => void;
//   onDeleted: () => void;
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const BED_KEYWORDS = [
//   "King Bed",
//   "Queen Bed",
//   "Single Bed",
//   "Twin Bed",
//   "Double Bed",
//   "2 Queen Beds",
// ];

// function inferBedType(amenities?: string[]): string {
//   if (!amenities) return "King Bed";
//   return (
//     amenities.find((a) =>
//       BED_KEYWORDS.some((k) => a.toLowerCase().includes(k.toLowerCase())),
//     ) ?? "King Bed"
//   );
// }

// function estimateRoomSize(maxOccupancy: number): number {
//   return maxOccupancy * 12 + 10;
// }

// function getErrorMessage(e: unknown): string {
//   if (e instanceof Error) return e.message;
//   return "An unexpected error occurred.";
// }

// // ─── Animated occupancy arc ───────────────────────────────────────────────────

// function OccupancyArc({ rate }: { rate: number }) {
//   // SVG arc: full circle = circumference ≈ 251.2 (r=40, stroke-dasharray trick)
//   const radius = 40;
//   const circ = 2 * Math.PI * radius;
//   const filled = (rate / 100) * circ;

//   return (
//     <div className="relative flex items-center justify-center">
//       <svg
//         width={100}
//         height={100}
//         viewBox="0 0 100 100"
//         aria-hidden
//         className="-rotate-90"
//       >
//         {/* Track */}
//         <circle
//           cx={50}
//           cy={50}
//           r={radius}
//           fill="none"
//           stroke="currentColor"
//           className="text-gray-100"
//           strokeWidth={8}
//         />
//         {/* Fill */}
//         <circle
//           cx={50}
//           cy={50}
//           r={radius}
//           fill="none"
//           stroke="currentColor"
//           className="text-amber-400 transition-all duration-1000"
//           strokeWidth={8}
//           strokeLinecap="round"
//           strokeDasharray={`${filled} ${circ}`}
//         />
//       </svg>
//       {/* Label */}
//       <div className="absolute inset-0 flex flex-col items-center justify-center">
//         <span className="text-xl font-bold text-gray-900 leading-none">
//           {rate}%
//         </span>
//         <span className="text-[10px] text-gray-400 mt-0.5">occupied</span>
//       </div>
//     </div>
//   );
// }

// // ─── Stat pill ────────────────────────────────────────────────────────────────

// function StatPill({
//   icon,
//   label,
//   value,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm flex-1 min-w-[90px]">
//       <span className="text-amber-500">{icon}</span>
//       <span className="text-xs text-gray-400 whitespace-nowrap">{label}</span>
//       <span className="text-sm font-semibold text-gray-800 text-center leading-snug">
//         {value}
//       </span>
//     </div>
//   );
// }

// // ─── Amenity chip ─────────────────────────────────────────────────────────────

// function AmenityChip({ label }: { label: string }) {
//   return (
//     <span className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-default">
//       <CheckCircle2 size={11} className="text-amber-400 shrink-0" aria-hidden />
//       {label}
//     </span>
//   );
// }

// // ─── Room availability row ────────────────────────────────────────────────────

// function AvailabilityRow({
//   label,
//   count,
//   total,
//   color,
// }: {
//   label: string;
//   count: number;
//   total: number;
//   color: string;
// }) {
//   const pct = total > 0 ? Math.round((count / total) * 100) : 0;
//   return (
//     <div>
//       <div className="flex items-center justify-between mb-1.5">
//         <span className="text-xs text-gray-500">{label}</span>
//         <span className="text-xs font-medium text-gray-700">
//           {count} <span className="text-gray-400 font-normal">/ {total}</span>
//         </span>
//       </div>
//       <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
//         <div
//           className={`h-full rounded-full transition-all duration-700 ${color}`}
//           style={{ width: `${pct}%` }}
//         />
//       </div>
//     </div>
//   );
// }

// // ─── Delete confirmation modal ────────────────────────────────────────────────

// interface DeleteConfirmProps {
//   name: string;
//   isOpen: boolean;
//   isDeleting: boolean;
//   error: string;
//   onConfirm: () => void;
//   onCancel: () => void;
// }

// function DeleteConfirmModal({
//   name,
//   isOpen,
//   isDeleting,
//   error,
//   onConfirm,
//   onCancel,
// }: DeleteConfirmProps) {
//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onCancel}
//       title="Delete Room Type"
//       size="sm"
//     >
//       <div className="space-y-4">
//         {error && (
//           <div
//             role="alert"
//             className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
//           >
//             {error}
//           </div>
//         )}
//         <p className="text-sm text-gray-600">
//           Are you sure you want to delete{" "}
//           <span className="font-semibold text-gray-900">{name}</span>? All rooms
//           of this type must be removed first.
//         </p>
//         <div className="flex justify-end gap-3">
//           <Button variant="secondary" onClick={onCancel}>
//             Cancel
//           </Button>
//           <Button variant="danger" loading={isDeleting} onClick={onConfirm}>
//             Delete
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );
// }

// // ─── Main page ────────────────────────────────────────────────────────────────

// export function RoomTypeDetailPage({
//   roomType: rt,
//   stats,
//   image,
//   onBack,
//   onDeleted,
// }: RoomTypeDetailPageProps) {
//   const [showEdit, setShowEdit] = useState(false);
//   const [showDelete, setShowDelete] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [deleteError, setDeleteError] = useState("");

//   const { deleteRoomType } = useRoomTypeStore();

//   const bedType = inferBedType(rt.amenities);
//   const roomSize = estimateRoomSize(rt.maxOccupancy);
//   const isAvailable = stats ? stats.available > 0 : false;
//   const occupiedRooms = stats ? stats.totalRooms - stats.available : 0;

//   // Non-bed amenities (bed info is surfaced separately in the stats row)
//   const amenities = (rt.amenities ?? []).filter(
//     (a: any) =>
//       !BED_KEYWORDS.some((k) => a.toLowerCase().includes(k.toLowerCase())),
//   );

//   //   const { deleteRoomType } = ((): {
//   //     deleteRoomType: (id: string) => Promise<void>;
//   //   } => {
//   //     // Inline store access — keeps this component portable
//   //     // eslint-disable-next-line @typescript-eslint/no-var-requires
//   //     return require("@/store/room/roomTypeStore").useRoomTypeStore.getState();
//   //   })();

//   //   const handleDelete = useCallback(async () => {
//   //     setIsDeleting(true);
//   //     setDeleteError("");
//   //     try {
//   //       await deleteRoomType(rt.id);
//   //       setShowDelete(false);
//   //       onDeleted();
//   //     } catch (e: unknown) {
//   //       setDeleteError(getErrorMessage(e));
//   //     } finally {
//   //       setIsDeleting(false);
//   //     }
//   //   }, [rt.id, deleteRoomType, onDeleted]);

//   return (
//     <div className="flex h-full flex-col bg-gray-50 animate-in fade-in duration-300">
//       {/* ── Mobile back bar ───────────────────────────────────────────────── */}
//       <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden sticky top-0 z-20">
//         <button
//           type="button"
//           onClick={onBack}
//           aria-label="Back to room types"
//           className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800 transition-colors"
//         >
//           <ArrowLeft size={15} />
//         </button>
//         <div className="min-w-0">
//           <p className="truncate text-sm font-semibold text-gray-800">
//             {rt.name}
//           </p>
//           <p className="text-[10px] text-gray-400">Room Type Details</p>
//         </div>
//         {/* Mobile quick actions */}
//         <div className="ml-auto flex items-center gap-1.5">
//           <button
//             type="button"
//             aria-label="Edit room type"
//             onClick={() => setShowEdit(true)}
//             className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
//           >
//             <Pencil size={13} />
//           </button>
//           <button
//             type="button"
//             aria-label="Delete room type"
//             onClick={() => setShowDelete(true)}
//             className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-400 hover:border-red-300 hover:text-red-600 transition-colors"
//           >
//             <Trash2 size={13} />
//           </button>
//         </div>
//       </div>

//       {/* ── Body ─────────────────────────────────────────────────────────── */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* ── LEFT: sticky sidebar (md+) ──────────────────────────────────── */}
//         <aside className="hidden md:flex md:w-80 lg:w-96 flex-col overflow-y-auto border-r border-gray-200 bg-white flex-shrink-0">
//           {/* Back link */}
//           <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
//             <button
//               type="button"
//               onClick={onBack}
//               className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors group"
//             >
//               <ArrowLeft
//                 size={13}
//                 className="transition-transform group-hover:-translate-x-0.5"
//               />
//               Room Types
//             </button>
//           </div>

//           {/* Room photo */}
//           <div
//             className="relative overflow-hidden"
//             style={{ aspectRatio: "4/3" }}
//           >
//             <img
//               src={image}
//               alt={`${rt.name} room`}
//               loading="lazy"
//               className="h-full w-full object-cover"
//             />
//             {/* Gradient overlay */}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

//             {/* Availability chip */}
//             <div className="absolute top-3 right-3">
//               <span
//                 className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm ${
//                   isAvailable
//                     ? "bg-emerald-500/20 border border-emerald-400/30 text-emerald-300"
//                     : "bg-red-500/20 border border-red-400/30 text-red-300"
//                 }`}
//               >
//                 {isAvailable ? (
//                   <CheckCircle2 size={10} aria-hidden />
//                 ) : (
//                   <XCircle size={10} aria-hidden />
//                 )}
//                 {isAvailable ? "Available" : "Fully Booked"}
//               </span>
//             </div>

//             {/* Name overlay */}
//             <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
//               <h1 className="text-xl font-bold text-white leading-tight">
//                 {rt.name}
//               </h1>
//               <p className="mt-0.5 text-xs text-white/60">
//                 {formatCurrency(Number(rt.basePrice))}{" "}
//                 <span className="text-white/40">/ night</span>
//               </p>
//             </div>
//           </div>

//           {/* Sidebar stats */}
//           <div className="flex-1 space-y-6 px-5 py-5">
//             {/* Quick facts */}
//             <section>
//               <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
//                 Room Details
//               </h2>
//               <div className="space-y-3">
//                 {[
//                   {
//                     icon: <BedDouble size={14} />,
//                     label: "Bed Type",
//                     value: bedType,
//                   },
//                   {
//                     icon: <Users size={14} />,
//                     label: "Max Occupancy",
//                     value: `${rt.maxOccupancy} guests`,
//                   },
//                   {
//                     icon: <Maximize2 size={14} />,
//                     label: "Room Size",
//                     value: `${roomSize} m²`,
//                   },
//                   {
//                     icon: <Building2 size={14} />,
//                     label: "Total Rooms",
//                     value: stats ? `${stats.totalRooms} rooms` : "—",
//                   },
//                 ].map(({ icon, label, value }) => (
//                   <div
//                     key={label}
//                     className="flex items-center justify-between"
//                   >
//                     <span className="flex items-center gap-2 text-xs text-gray-500">
//                       <span className="text-gray-400">{icon}</span>
//                       {label}
//                     </span>
//                     <span className="text-xs font-medium text-gray-800">
//                       {value}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </section>

//             {/* Occupancy arc */}
//             {stats && (
//               <section>
//                 <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
//                   Occupancy
//                 </h2>
//                 <div className="flex items-center gap-5">
//                   <OccupancyArc rate={stats.occupancyRate} />
//                   <div className="flex flex-col gap-2 flex-1">
//                     <AvailabilityRow
//                       label="Available"
//                       count={stats.available}
//                       total={stats.totalRooms}
//                       color="bg-emerald-400"
//                     />
//                     <AvailabilityRow
//                       label="Occupied"
//                       count={occupiedRooms}
//                       total={stats.totalRooms}
//                       color="bg-amber-400"
//                     />
//                   </div>
//                 </div>
//               </section>
//             )}

//             {/* Sidebar actions */}
//             <div className="flex flex-col gap-2 pt-2">
//               <Button
//                 onClick={() => setShowEdit(true)}
//                 className="w-full justify-center"
//               >
//                 <Pencil size={13} aria-hidden /> Edit Room Type
//               </Button>
//               <Button
//                 variant="danger"
//                 onClick={() => setShowDelete(true)}
//                 className="w-full justify-center"
//               >
//                 <Trash2 size={13} aria-hidden /> Delete
//               </Button>
//             </div>
//           </div>
//         </aside>

//         {/* ── RIGHT: scrollable content ──────────────────────────────────── */}
//         <main className="flex-1 overflow-y-auto">
//           {/* Hero (mobile only) */}
//           <div className="relative md:hidden" style={{ aspectRatio: "16/7" }}>
//             <img
//               src={image}
//               alt={`${rt.name} room`}
//               loading="lazy"
//               className="h-full w-full object-cover"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
//             <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
//               <h1 className="text-2xl font-bold text-white">{rt.name}</h1>
//               <p className="text-sm text-white/60">
//                 {formatCurrency(Number(rt.basePrice))}{" "}
//                 <span className="text-white/40">/ night</span>
//               </p>
//             </div>
//           </div>

//           {/* Content body */}
//           <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8 py-6 md:py-8">
//             {/* Desktop title (sidebar has it on md+) */}
//             <div className="hidden md:block">
//               <h1 className="text-2xl font-bold text-gray-900">{rt.name}</h1>
//               <p className="mt-1 text-sm text-gray-500">
//                 {formatCurrency(Number(rt.basePrice))} per night
//               </p>
//             </div>

//             {/* ── Mobile quick-stats row ──────────────────────────────────── */}
//             <section className="md:hidden">
//               <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
//                 <StatPill
//                   icon={<BedDouble size={16} />}
//                   label="Bed"
//                   value={bedType}
//                 />
//                 <StatPill
//                   icon={<Users size={16} />}
//                   label="Guests"
//                   value={`${rt.maxOccupancy}`}
//                 />
//                 <StatPill
//                   icon={<Maximize2 size={16} />}
//                   label="Size"
//                   value={`${roomSize} m²`}
//                 />
//                 {stats && (
//                   <StatPill
//                     icon={<TrendingUp size={16} />}
//                     label="Occupancy"
//                     value={`${stats.occupancyRate}%`}
//                   />
//                 )}
//               </div>
//             </section>

//             {/* ── Mobile occupancy + availability ────────────────────────── */}
//             {stats && (
//               <section className="md:hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
//                 <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
//                   <TrendingUp size={12} aria-hidden /> Availability
//                 </h2>
//                 <div className="flex items-center gap-6">
//                   <OccupancyArc rate={stats.occupancyRate} />
//                   <div className="flex flex-col gap-3 flex-1">
//                     <AvailabilityRow
//                       label="Available"
//                       count={stats.available}
//                       total={stats.totalRooms}
//                       color="bg-emerald-400"
//                     />
//                     <AvailabilityRow
//                       label="Occupied"
//                       count={occupiedRooms}
//                       total={stats.totalRooms}
//                       color="bg-amber-400"
//                     />
//                   </div>
//                 </div>
//               </section>
//             )}

//             {/* ── Description ────────────────────────────────────────────── */}
//             {rt.description && (
//               <section>
//                 <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
//                   <Sparkles size={12} aria-hidden /> About this room
//                 </h2>
//                 <p className="text-sm leading-relaxed text-gray-600">
//                   {rt.description}
//                 </p>
//               </section>
//             )}

//             {/* ── Amenities ──────────────────────────────────────────────── */}
//             {(rt.amenities?.length ?? 0) > 0 && (
//               <section>
//                 <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
//                   <CheckCircle2 size={12} aria-hidden /> Amenities
//                   <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700 normal-case tracking-normal font-normal">
//                     {rt.amenities!.length} included
//                   </span>
//                 </h2>
//                 <div className="flex flex-wrap gap-2">
//                   {rt.amenities!.map((a: any) => (
//                     <AmenityChip key={a} label={a} />
//                   ))}
//                 </div>
//               </section>
//             )}

//             {/* ── Pricing card ────────────────────────────────────────────── */}
//             <section className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
//               <div className="flex items-center justify-between flex-wrap gap-4">
//                 <div>
//                   <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 mb-1">
//                     Base Rate
//                   </p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {formatCurrency(Number(rt.basePrice))}
//                   </p>
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     per night, before taxes
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-xs text-gray-500 mb-1">Availability</p>
//                   <p className="text-lg font-semibold text-gray-800">
//                     {stats ? (
//                       <>
//                         <span
//                           className={
//                             isAvailable ? "text-emerald-600" : "text-red-500"
//                           }
//                         >
//                           {stats.available}
//                         </span>
//                         <span className="text-gray-400 font-normal text-sm">
//                           {" "}
//                           / {stats.totalRooms} rooms
//                         </span>
//                       </>
//                     ) : (
//                       "—"
//                     )}
//                   </p>
//                   <p className="text-[10px] text-gray-400">available tonight</p>
//                 </div>
//               </div>
//             </section>

//             {/* Spacer for mobile sticky bar */}
//             <div className="h-20 md:hidden" aria-hidden />
//           </div>
//         </main>
//       </div>

//       {/* ── Mobile sticky action bar ───────────────────────────────────────── */}
//       <div className="md:hidden sticky bottom-0 flex items-center gap-3 border-t border-gray-200 bg-white px-4 py-3 shadow-lg">
//         <Button
//           variant="secondary"
//           onClick={() => setShowDelete(true)}
//           className="flex-1 justify-center"
//         >
//           <Trash2 size={13} aria-hidden /> Delete
//         </Button>
//         <Button
//           onClick={() => setShowEdit(true)}
//           className="flex-1 justify-center"
//         >
//           <Pencil size={13} aria-hidden /> Edit Room Type
//         </Button>
//       </div>

//       {/* ── Modals ────────────────────────────────────────────────────────── */}
//       <Modal
//         isOpen={showEdit}
//         onClose={() => setShowEdit(false)}
//         title="Edit Room Type"
//         subtitle={rt.name}
//         size="md"
//       >
//         <RoomTypeForm
//           roomType={rt}
//           onSuccess={() => setShowEdit(false)}
//           onCancel={() => setShowEdit(false)}
//         />
//       </Modal>
//       {/*
//       <DeleteConfirmModal
//         name={rt.name}
//         isOpen={showDelete}
//         isDeleting={isDeleting}
//         error={deleteError}
//         onConfirm={handleDelete}
//         onCancel={() => {
//           setShowDelete(false);
//           setDeleteError("");
//         }}
//       /> */}
//     </div>
//   );
// }

// export default RoomTypeDetailPage;
