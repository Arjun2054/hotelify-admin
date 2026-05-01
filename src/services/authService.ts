import adminApi from "@/lib/config";
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  User,
  Organization,
} from "@/store/useAuthStore";

class AuthService {
  private baseUrl = "/auth";
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await adminApi.post<LoginResponse>(
      `${this.baseUrl}/login`,
      credentials,
    );
    return response.data;
  }

  async register(
    data: RegisterData,
  ): Promise<{ message: string; user: User; organization: any }> {
    const response = await adminApi.post<{
      message: string;
      user: User;
      organization: any;
    }>(`${this.baseUrl}/register`, data);
    return response.data;
  }

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  async refreshToken(): Promise<{ success: boolean }> {
    const response = await adminApi.post<{ success: boolean }>(
      `${this.baseUrl}/refresh-token`,
    );
    return response.data;
  }

  async getCurrentUser(): Promise<{
    success: boolean;
    user: User;
    organizations: Organization[];
  }> {
    const response = await adminApi.post<{
      success: boolean;
      user: User;
      organizations: Organization[];
    }>(`${this.baseUrl}/logged-in-user`);
    return response.data;
  }

  // Local storage helpers
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  setUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  // Organization management
  setOrganizations(organizations: Organization[]): void {
    localStorage.setItem("organizations", JSON.stringify(organizations));
  }

  getStoredOrganizations(): Organization[] {
    const orgs = localStorage.getItem("organizations");
    return orgs ? JSON.parse(orgs) : [];
  }

  setActiveOrganization(orgId: string): void {
    localStorage.setItem("active_organization_id", orgId);
  }

  getActiveOrganizationId(): string | null {
    return localStorage.getItem("active_organization_id");
  }

  getActiveOrganization(): Organization | null {
    const orgId = this.getActiveOrganizationId();
    const organizations = this.getStoredOrganizations();
    return organizations.find((org) => org.id === orgId) || null;
  }

  getStoredUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  clearStorage(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("organizations");
    localStorage.removeItem("active_organization_id");
  }
}

export const authService = new AuthService();
