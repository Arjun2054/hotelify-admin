import { useAuthStore, type MemberRole } from "@/store/useAuthStore";

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const { getActiveRole, canPerformAction, hasFeature, getActiveOrganization } =
    useAuthStore();

  const role = getActiveRole();
  const organization = getActiveOrganization();

  return {
    // Role checks
    isOwner: role === "OWNER",
    isAdmin: role === "ADMIN",
    isStaff: role === "STAFF",
    isAdminOrOwner: role === "ADMIN" || role === "OWNER",

    // Specific permissions
    canManageProducts: canPerformAction(["ADMIN", "OWNER"]),
    canManageCategories: canPerformAction(["ADMIN", "OWNER"]),
    canManageSuppliers: canPerformAction(["ADMIN", "OWNER"]),
    canManageStock: canPerformAction(["ADMIN", "OWNER"]),
    canDeleteItems: canPerformAction(["OWNER"]),
    canManageOrganization: canPerformAction(["OWNER"]),
    canCreateSales: canPerformAction(["STAFF", "ADMIN", "OWNER"]),
    canManageSales: canPerformAction(["ADMIN", "OWNER"]),

    // Feature checks
    hasInventoryFeature: hasFeature("inventory"),
    hasCategoriesFeature: hasFeature("categories"),
    hasSuppliersFeature: hasFeature("suppliers"),
    hasReportsFeature: hasFeature("reports"),
    hasSalesFeature: hasFeature("sales"),
    hasPurchasesFeature: hasFeature("purchases"),

    // Generic checks
    canPerformAction,
    hasFeature,
    role,
    organization,
  };
}

/**
 * Component wrapper for permission-based rendering
 */
interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRoles?: MemberRole[];
  requiredFeature?: string;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  requiredRoles,
  requiredFeature,
  fallback = null,
}: PermissionGuardProps) {
  const { canPerformAction, hasFeature } = usePermissions();

  // Check role permission
  if (requiredRoles && !canPerformAction(requiredRoles)) {
    return fallback ?? null;
  }

  if (requiredFeature && !hasFeature(requiredFeature)) {
    return fallback ?? null;
  }

  return children;
}

/**
 * Example usage:
 *
 * // In component
 * const { canManageProducts, hasInventoryFeature } = usePermissions();
 *
 * if (!hasInventoryFeature) {
 *   return <FeatureDisabled />;
 * }
 *
 * return (
 *   <div>
 *     {canManageProducts && <Button>Create Product</Button>}
 *
 *     <PermissionGuard requiredRoles={["ADMIN", "OWNER"]}>
 *       <DeleteButton />
 *     </PermissionGuard>
 *   </div>
 * );
 */
