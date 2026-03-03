import { apiRequest } from '@/lib/api';
import type { UserRole, Tables } from '@/types/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardStats {
  schools: number;
  users: number;
  photos: number;
  orders: number;
  revenue: number;
  activeToday: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  school_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminSchool {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  _count: {
    classes: number;
    students: number;
    teachers: number;
  };
  classes: Array<{ id: string; name: string; grade: string | null }>;
}

export interface CreateSchoolData {
  name: string;
  address?: string;
  phone?: string;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Fetch aggregate dashboard statistics for the admin overview.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>('/admin/dashboard', {
    method: 'GET',
  });
}

/**
 * Fetch a paginated, searchable, filterable list of users.
 */
export async function getUsers(
  search?: string,
  role?: UserRole,
  cursor?: string,
  limit: number = 20,
): Promise<PaginatedResponse<AdminUser>> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (role) params.set('role', role);
  if (cursor) params.set('cursor', cursor);
  params.set('limit', String(limit));

  const qs = params.toString();
  return apiRequest<PaginatedResponse<AdminUser>>(`/admin/users?${qs}`, {
    method: 'GET',
  });
}

/**
 * Update a user's role.
 */
export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<void> {
  await apiRequest(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: { role },
  });
}

/**
 * Fetch a paginated list of schools with nested counts.
 */
export async function getSchools(
  cursor?: string,
  limit: number = 20,
): Promise<PaginatedResponse<AdminSchool>> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', String(limit));

  const qs = params.toString();
  return apiRequest<PaginatedResponse<AdminSchool>>(`/admin/schools?${qs}`, {
    method: 'GET',
  });
}

/**
 * Create a new school.
 */
export async function createSchool(
  data: CreateSchoolData,
): Promise<Tables<'schools'>> {
  return apiRequest<Tables<'schools'>>('/admin/schools', {
    method: 'POST',
    body: data,
  });
}
