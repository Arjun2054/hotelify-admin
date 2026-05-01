import { authService } from "@/services/authService";
import axios from "axios";

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor - attach token
adminApi.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const orgId = authService.getActiveOrganizationId();
    // Add organization ID for multi-tenancy

    if (orgId) {
      config.headers["X-Organization-Id"] = orgId;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        await authService.refreshToken();

        // Retry original request with new token
        const token = authService.getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        // Re-add organization header
        const orgId = authService.getActiveOrganizationId();
        if (orgId) {
          originalRequest.headers["X-Organization-Id"] = orgId;
        }
        return adminApi(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth state
        authService.clearStorage();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    // Handle 403 - Feature not enabled or insufficient permissions
    if (error.response?.status === 403) {
      console.error("Access denied:", error.response.data);
      // You could show a toast notification here
    }

    return Promise.reject(error);
  },
);

export default adminApi;
