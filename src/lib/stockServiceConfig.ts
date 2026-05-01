// ============================================================================
// Stock Service Configuration
// ============================================================================

export const STOCK_SERVICE_CONFIG = {
  // Base URL
  BASE_URL: "/stock",

  // Endpoints
  ENDPOINTS: {
    MOVEMENTS: "/movements",
    STOCK_IN: "/in",
    STOCK_OUT: "/out",
    SUMMARY: "/summary",
    REPORT: "/report",
    HISTORY: "/history",
    EXPORT: "/export",
  },

  // Default Values
  DEFAULTS: {
    PAGE: 1,
    LIMIT: 10,
    MAX_LIMIT: 100,
    HISTORY_LIMIT: 50,
    SORT_COLUMN: "createdAt" as const,
    SORT_DIRECTION: "desc" as const,
  },

  // Cache Configuration
  CACHE: {
    SUMMARY_TTL: 5 * 60 * 1000, // 5 minutes
    MOVEMENTS_TTL: 2 * 60 * 1000, // 2 minutes
  },

  // Retry Configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
    BACKOFF_MULTIPLIER: 2,
  },
} as const;

// Export format mappings
export const EXPORT_MIME_TYPES: Record<string, string> = {
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

export const EXPORT_FILE_EXTENSIONS: Record<string, string> = {
  csv: ".csv",
  xlsx: ".xlsx",
  pdf: ".pdf",
};
