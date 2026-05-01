import { formatCurrency } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboardStore";

const LowStockAlerts = () => {
  const { lowStockAlerts, isLoadingLowStock } = useDashboardStore();

  if (isLoadingLowStock) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const products = lowStockAlerts?.products || [];
  const threshold = lowStockAlerts?.threshold || 10;
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Low Stock Alerts
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Products below {threshold} units
          </p>
        </div>
        {products.length > 0 && (
          <div className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-semibold">{products.length}</span>
          </div>
        )}
      </div>
      {products.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.productId}
              className="border border-red-200 rounded-lg p-4 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <div className="flex items-start gap-4">
                <img
                  src={product.image || "/placeholder-product.png"}
                  alt={product.name}
                  className="h-16 w-16 rounded object-cover flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-product.png";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-600 font-mono mt-1">
                        SKU: {product.sku}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Category: {product.category}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center justify-end">
                        <span className="text-2xl font-bold text-red-600">
                          {product.currentStock}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          units
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  </div>
                  {product.supplier && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-xs text-gray-700 font-semibold">
                        Supplier Information:
                      </p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-600">
                        <span className="flex items-center">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          {product.supplier.name}
                        </span>
                        {product.supplier.phone && (
                          <span className="flex items-center">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            {product.supplier.phone}
                          </span>
                        )}
                        {product.supplier.email && (
                          <span className="flex items-center">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {product.supplier.email}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-gray-500">
            All products are well stocked! 🎉
          </p>
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;
