// src/components/staff/StaffFilters.tsx

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type {
  MemberRole,
  StaffDepartment,
  StaffFilters as StaffFiltersType,
} from "@/types/staff-types";
import { ALL_DEPARTMENTS, DEPARTMENT_LABELS } from "@/types/staff-types";

interface Props {
  filters: StaffFiltersType;
  onFilterChange: (f: Partial<StaffFiltersType>) => void;
  onClear: () => void;
}

export function StaffFilters({ filters, onFilterChange, onClear }: Props) {
  const hasActiveFilters = filters.role || filters.department || filters.search;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <Input
        placeholder="Search name or email…"
        value={filters.search ?? ""}
        onChange={(e) =>
          onFilterChange({
            search: e.target.value || undefined,
          })
        }
        className="w-64"
      />

      {/* Role filter */}
      <Select
        value={filters.role ?? "ALL"}
        onValueChange={(v) =>
          onFilterChange({
            role: v === "ALL" ? undefined : (v as MemberRole),
          })
        }
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Roles</SelectItem>
          <SelectItem value="OWNER">Owner</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="STAFF">Staff</SelectItem>
        </SelectContent>
      </Select>

      {/* Department filter */}
      <Select
        value={filters.department ?? "ALL"}
        onValueChange={(v) =>
          onFilterChange({
            department: v === "ALL" ? undefined : (v as StaffDepartment),
          })
        }
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Departments</SelectItem>
          {ALL_DEPARTMENTS.map((d) => (
            <SelectItem key={d} value={d}>
              {DEPARTMENT_LABELS[d]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-9">
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
