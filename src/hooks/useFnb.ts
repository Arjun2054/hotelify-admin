// // frontend/src/features/fnb/hooks/useFnb.ts
// import { useFnbStore } from "@/store/fnb/fnb.store";
// import { useCallback } from "react";

// export function useFnb() {
//   const store = useFnbStore();

//   const isModuleEnabled = store.overview?.isModuleEnabled ?? false;

//   const refreshAll = useCallback(async () => {
//     await Promise.all([
//       store.fetchOverview(),
//       store.fetchOrgServices(),
//       store.fetchMenus(),
//     ]);
//   }, []);

//   return {
//     isModuleEnabled,
//     refreshAll,
//     ...store,
//   };
// }
