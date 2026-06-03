import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Products from "./pages/Products.tsx";
import Categories from "./pages/Categories.tsx";
import Suppliers from "./pages/Suppliers.tsx";
import ProductCreatePage from "./components/ProductCreatePage.tsx";
import ProductEditPage from "./components/ProductEditPage.tsx";
import { lazy, Suspense } from "react";
import LoadingSpinner from "./components/shared/LoadingSpinner.tsx";
import { ErrorBoundary } from "./components/shared/ErrorBoundary.tsx";

// Auth pages
const LoginPage = lazy(() => import("./pages/Login.tsx"));
const RegisterPage = lazy(() => import("./pages/Register.tsx"));

// Stock Management
const StockManagementPage = lazy(
  () => import("@/pages/StockManagementPage.tsx"),
);
const StockMovementPage = lazy(() => import("@/pages/StockMovementPage.tsx"));

const StockReportsPage = lazy(() => import("@/pages/StockReports.tsx"));

const SalesPage = lazy(() => import("./pages/Sales.tsx"));

const NotFoundPage = lazy(() => import("./components/shared/NotFoundPage.tsx"));

const RoomTypePage = lazy(() => import("./pages/RoomType.tsx"));

const UnitPage = lazy(() => import("./pages/UnitPage.tsx"));

const HotelItemPage = lazy(() => import("./pages/HotelItemPage.tsx"));

const HotelItemDetailPage = lazy(
  () => import("./pages/HotelItemDetailPage.tsx"),
);

const HotelStockMovementPage = lazy(
  () => import("./pages/HotelStockMovementPage.tsx"),
);

const RoomPage = lazy(() => import("./pages/RoomPage.tsx"));

const RoomDashboardPage = lazy(
  () => import("./components/room/DashboardPage.tsx"),
);

const FnbOverviewPage = lazy(() => import("./pages/FnbOverviewPage.tsx"));

const FnbPage = lazy(() => import("./pages/FnbPage.tsx"));

const MenuPage = lazy(() => import("./pages/MenusPage.tsx"));

const FnbSettingsPage = lazy(() => import("./pages/FnbSettingsPage.tsx"));

const MenuDetailPage = lazy(() => import("./pages/MenuDetailPage.tsx"));

const OrdersPage = lazy(() => import("./pages/OrdersPage.tsx"));

const KitchenDisplayPage = lazy(() => import("./pages/KitchenDisplayPage.tsx"));

const HotelAnalyticsPage = lazy(() => import("./pages/HotelAnalytics.tsx"));

const HousekeepingPage = lazy(() => import("./pages/HousekeepingPage.tsx"));

const RoomDetailPage = lazy(() => import("./pages/RoomDetailPage.tsx"));

const RoomCheckInPage = lazy(() => import("./pages/CheckInPage.tsx"));

import StaffPage from "./pages/StaffPage.tsx";
import { DepartmentGuard } from "./components/guards/DepartmentGuard.tsx";
import HrDashboardPage from "./pages/HrDashboardPage.tsx";
import ModuleSettingsPage from "./pages/ModuleSettingsPage.tsx";

const StaffDetailsPage = lazy(() => import("./pages/StaffDetailsPage.tsx"));

const NotificationsPage = lazy(() => import("./pages/NotificationsPage.tsx"));

const HotelItemInventoryAnalytics = lazy(
  () => import("./pages/HotelItemInventoryAnalytics.tsx"),
);

const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        path: "/dashboard",
        element: <Dashboard />,
      },

      {
        path: "/dashboard/products",
        children: [
          {
            index: true,
            element: <Products />,
          },
          {
            path: "new",
            element: <ProductCreatePage />,
          },
          {
            path: ":id/edit",
            element: <ProductEditPage />,
          },
        ],
      },

      {
        path: "/dashboard/categories",
        element: <Categories />,
      },
      {
        path: "/dashboard/suppliers",
        element: <Suppliers />,
      },
      {
        path: "/dashboard/stock",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <StockManagementPage />
              </Suspense>
            ),
          },
          {
            path: "/dashboard/stock/reports",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <StockReportsPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "/dashboard/sales",
        element: <SalesPage />,
      },
      {
        path: "/dashboard/movements",
        element: <StockMovementPage />,
      },

      {
        path: "/hotel/inventory-analytics",
        element: <HotelItemInventoryAnalytics />,
      },

      {
        path: "/hotel-items/:id",
        element: <HotelItemDetailPage />,
      },

      {
        path: "/room",
        element: <RoomPage />,
      },

      {
        path: "/overallanalytics",
        element: <HotelAnalyticsPage />,
      },
      {
        path: "/room/room-types",
        element: <RoomTypePage />,
      },

      {
        path: "/units",
        element: <UnitPage />,
      },

      {
        path: "/hotel-items",
        element: <HotelItemPage />,
      },
      {
        path: "/hotel-stock-movements",
        element: <HotelStockMovementPage />,
      },
      {
        path: "/room/dashboard",
        element: <RoomDashboardPage />,
      },
      {
        path: "/housekeeping/tasks",
        element: (
          <DepartmentGuard allowedDepartments={["HOUSEKEEPING"]}>
            <HousekeepingPage />
          </DepartmentGuard>
        ),
      },
      {
        path: "/fnb",
        element: (
          <DepartmentGuard allowedDepartments={["FRONT_DESK", "KITCHEN"]}>
            <FnbOverviewPage />
          </DepartmentGuard>
        ),
      },
      {
        path: "/fnb/services",
        element: (
          <DepartmentGuard allowedDepartments={["FRONT_DESK", "KITCHEN"]}>
            <FnbPage />
          </DepartmentGuard>
        ),
      },
      {
        path: "/fnb/menus",
        element: (
          <DepartmentGuard allowedDepartments={["FRONT_DESK", "KITCHEN"]}>
            <MenuPage />
          </DepartmentGuard>
        ),
      },
      {
        path: "/fnb/menus/:menuId",
        element: (
          <DepartmentGuard allowedDepartments={["FRONT_DESK", "KITCHEN"]}>
            <MenuDetailPage />
          </DepartmentGuard>
        ),
      },
      {
        path: "/fnb/settings",
        element: (
          <DepartmentGuard allowedDepartments={["FRONT_DESK", "KITCHEN"]}>
            <FnbSettingsPage />
          </DepartmentGuard>
        ),
      },

      {
        path: "/fnb/orders",
        element: (
          <DepartmentGuard allowedDepartments={["FRONT_DESK", "KITCHEN"]}>
            <OrdersPage />
          </DepartmentGuard>
        ),
      },

      {
        path: "/fnb/kitchen",
        element: (
          <DepartmentGuard allowedDepartments={["KITCHEN"]}>
            <KitchenDisplayPage />
          </DepartmentGuard>
        ),
      },

      {
        path: "/hotel/rooms/:id",
        element: <RoomDetailPage />,
      },
      {
        path: "/rooms/:roomId/check-in",
        element: <RoomCheckInPage />,
      },
      {
        path: "/staff",
        element: <StaffPage />,
      },

      {
        path: "/staff/:id",
        element: <StaffDetailsPage />,
      },
      {
        path: "*",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
      // ─────────────────────────────────────────────
      // ✅  HR ROUTES — all use the same wrapper
      // ─────────────────────────────────────────────
      {
        path: "/hr/dashboard",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HrDashboardPage />
          </Suspense>
        ),
      },
      {
        path: "/hr/leave",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HrDashboardPage />
          </Suspense>
        ),
      },
      {
        path: "/hr/attendance",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HrDashboardPage />
          </Suspense>
        ),
      },
      {
        path: "/hr/payslips",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HrDashboardPage />
          </Suspense>
        ),
      },

      {
        path: "/hotel/rooms/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HrDashboardPage />
          </Suspense>
        ),
      },

      {
        path: "/notifications",
        element: <NotificationsPage />,
      },
      // ── Settings ───────────────────────────────────────────────────────
      {
        path: "/settings/modules",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ModuleSettingsPage />
          </Suspense>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>,
);
