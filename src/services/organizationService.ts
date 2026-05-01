// services/organizationService.ts
import adminApi from "@/lib/config";
import type { Organization, MemberRole } from "@/store/useAuthStore";

export interface OrganizationMember {
  membershipId: string;
  role: MemberRole;
  department: string;
  jobTitle?: string;
  joinedAt: string;
  user: {
    userId: string;
    name: string;
    email: string;
    createdAt: string;
  };
  organization: Organization;
}

export interface OrganizationWithMeta extends Organization {
  joinedAt: string;
  totalMembers: number;
  isActive: boolean;
  createdAt: string;
}

class OrganizationService {
  private baseUrl = "/auth";

  // Get all members of an organization
  async getMembers(organizationId: string): Promise<{
    success: boolean;
    organization: Organization;
    members: OrganizationMember[];
    totalMembers: number;
  }> {
    const response = await adminApi.get(
      `${this.baseUrl}/organizations/${organizationId}/members`,
    );
    console.log(response.data.members);
    return response.data;
  }

  // Get a single member
  async getMemberById(
    organizationId: string,
    memberId: string,
  ): Promise<{
    success: boolean;
    member: OrganizationMember;
  }> {
    const response = await adminApi.get(
      `${this.baseUrl}/organizations/${organizationId}/members/${memberId}`,
    );
    return response.data;
  }

  // Get all organizations the current user belongs to
  async getUserOrganizations(): Promise<{
    success: boolean;
    organizations: OrganizationWithMeta[];
    total: number;
  }> {
    const response = await adminApi.get(`${this.baseUrl}/user/organizations`);
    return response.data;
  }
}

export const organizationService = new OrganizationService();
