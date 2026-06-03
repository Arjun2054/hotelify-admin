// import { useState, useCallback, useMemo } from "react";
// import type { SortConfig, SortDirection } from "@/types/sorting.types";

// interface UseSortOptions<T extends string> {
//   defaultSort?: SortConfig<T>;
//   onSortChange?: (sort: SortConfig<T>) => void;
// }

// interface UseSortReturn<T extends string> {
//   sortConfig: SortConfig<T>;
//   handleSort: (column: T) => void;
//   getSortDirection: (column: T) => SortDirection;
//   resetSort: () => void;
//   isSorted: (column: T) => boolean;
// }

// export function useSort<T extends string>({
//   defaultSort = { column: null, direction: null },
//   onSortChange,
// }: UseSortOptions<T> = {}): UseSortReturn<T> {
//   const [sortConfig, setSortConfig] = useState<SortConfig<T>>(defaultSort);

//   const handleSort = useCallback(
//     (column: T) => {
//       setSortConfig((prevSort) => {
//         let newDirection: SortDirection;

//         if (prevSort.column !== column) {
//           // New column: start with ascending
//           newDirection = "asc";
//         } else if (prevSort.direction === "asc") {
//           // Same column, was asc: switch to desc
//           newDirection = "desc";
//         } else if (prevSort.direction === "desc") {
//           // Same column, was desc: clear sort
//           newDirection = null;
//         } else {
//           // No previous sort: start with asc
//           newDirection = "asc";
//         }

//         const newSort: SortConfig<T> = {
//           column: newDirection ? column : null,
//           direction: newDirection,
//         };

//         onSortChange?.(newSort);
//         return newSort;
//       });
//     },
//     [onSortChange],
//   );

//   const getSortDirection = useCallback(
//     (column: T): SortDirection => {
//       return sortConfig.column === column ? sortConfig.direction : null;
//     },
//     [sortConfig],
//   );

//   const isSorted = useCallback(
//     (column: T): boolean => {
//       return sortConfig.column === column && sortConfig.direction !== null;
//     },
//     [sortConfig],
//   );

//   const resetSort = useCallback(() => {
//     const newSort = {
//       column: null as T | null,
//       direction: null as SortDirection,
//     };
//     setSortConfig(newSort);
//     onSortChange?.(newSort);
//   }, [onSortChange]);

//   return {
//     sortConfig,
//     handleSort,
//     getSortDirection,
//     resetSort,
//     isSorted,
//   };
// }

// // Client-side sorting utility
// export function sortData<T>(
//   data: T[],
//   sortConfig: SortConfig<string>,
//   getFieldValue: (item: T, field: string) => unknown,
// ): T[] {
//   if (!sortConfig.column || !sortConfig.direction) {
//     return data;
//   }

//   return [...data].sort((a, b) => {
//     const aValue = getFieldValue(a, sortConfig.column!);
//     const bValue = getFieldValue(b, sortConfig.column!);

//     // Handle null/undefined
//     if (aValue == null && bValue == null) return 0;
//     if (aValue == null) return sortConfig.direction === "asc" ? -1 : 1;
//     if (bValue == null) return sortConfig.direction === "asc" ? 1 : -1;

//     // Compare values
//     let comparison = 0;

//     if (typeof aValue === "string" && typeof bValue === "string") {
//       comparison = aValue.localeCompare(bValue, undefined, {
//         sensitivity: "base",
//         numeric: true,
//       });
//     } else if (typeof aValue === "number" && typeof bValue === "number") {
//       comparison = aValue - bValue;
//     } else if (aValue instanceof Date && bValue instanceof Date) {
//       comparison = aValue.getTime() - bValue.getTime();
//     } else {
//       comparison = String(aValue).localeCompare(String(bValue));
//     }

//     return sortConfig.direction === "desc" ? -comparison : comparison;
//   });
// }
