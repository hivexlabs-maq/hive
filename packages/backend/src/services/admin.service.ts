import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/supabase';
import { logger } from '../config/logger';
import { AppError } from '../middleware/errorHandler';
import type {
  CreateSchoolInput,
  GetUsersInput,
  GetSchoolsInput,
} from '../validators/admin.validator';

interface DashboardStats {
  totalSchools: number;
  totalUsers: number;
  totalPhotos: number;
  totalOrders: number;
  totalRevenue: number;
}

interface UserProfile {
  id: string;
  email: string;
  role: string;
  school_id: string | null;
  full_name: string | null;
  created_at: string;
}

interface School {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  created_at: string;
}

interface PaginatedUsers {
  users: UserProfile[];
  nextCursor: string | null;
}

interface PaginatedSchools {
  schools: School[];
  nextCursor: string | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [schoolsCount, usersCount, photosCount, ordersResult] =
    await Promise.all([
      supabaseAdmin
        .from('schools')
        .select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('photos')
        .select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('orders')
        .select('id, total'),
    ]);

  const totalOrders = ordersResult.data?.length ?? 0;
  const totalRevenue =
    ordersResult.data?.reduce(
      (sum, order) => sum + (order.total ?? 0),
      0,
    ) ?? 0;

  return {
    totalSchools: schoolsCount.count ?? 0,
    totalUsers: usersCount.count ?? 0,
    totalPhotos: photosCount.count ?? 0,
    totalOrders,
    totalRevenue,
  };
}

export async function getUsers(
  params: GetUsersInput,
): Promise<PaginatedUsers> {
  const { search, role, cursor, limit = 20 } = params;

  let query = supabaseAdmin
    .from('profiles')
    .select('id, email, role, school_id, full_name, created_at')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1);

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%`,
    );
  }

  if (role) {
    query = query.eq('role', role);
  }

  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString());
      query = query.or(
        `created_at.lt.${decoded.createdAt},and(created_at.eq.${decoded.createdAt},id.lt.${decoded.id})`,
      );
    } catch {
      throw new AppError('Invalid cursor', 400, 'INVALID_CURSOR');
    }
  }

  const { data: users, error } = await query;

  if (error) {
    logger.error('Failed to fetch users', { error: error.message });
    throw new AppError('Failed to fetch users', 500, 'QUERY_FAILED');
  }

  const hasNext = (users?.length ?? 0) > limit;
  const results = (users?.slice(0, limit) ?? []) as UserProfile[];

  const nextCursor =
    hasNext && results.length > 0
      ? Buffer.from(
          JSON.stringify({
            createdAt: results[results.length - 1].created_at,
            id: results[results.length - 1].id,
          }),
        ).toString('base64url')
      : null;

  return { users: results, nextCursor };
}

export async function updateUserRole(
  userId: string,
  role: string,
): Promise<UserProfile> {
  const { data: user, error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select('id, email, role, school_id, full_name, created_at')
    .single();

  if (error) {
    logger.error('Failed to update user role', {
      error: error.message,
      userId,
      role,
    });

    if (error.code === 'PGRST116') {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    throw new AppError('Failed to update user role', 500, 'UPDATE_FAILED');
  }

  logger.info('User role updated', { userId, role });
  return user as UserProfile;
}

export async function getSchools(
  params: GetSchoolsInput,
): Promise<PaginatedSchools> {
  const { cursor, limit = 20 } = params;

  let query = supabaseAdmin
    .from('schools')
    .select('id, name, address, phone, email, logo_url, created_at')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString());
      query = query.or(
        `created_at.lt.${decoded.createdAt},and(created_at.eq.${decoded.createdAt},id.lt.${decoded.id})`,
      );
    } catch {
      throw new AppError('Invalid cursor', 400, 'INVALID_CURSOR');
    }
  }

  const { data: schools, error } = await query;

  if (error) {
    logger.error('Failed to fetch schools', { error: error.message });
    throw new AppError('Failed to fetch schools', 500, 'QUERY_FAILED');
  }

  const hasNext = (schools?.length ?? 0) > limit;
  const results = (schools?.slice(0, limit) ?? []) as School[];

  const nextCursor =
    hasNext && results.length > 0
      ? Buffer.from(
          JSON.stringify({
            createdAt: results[results.length - 1].created_at,
            id: results[results.length - 1].id,
          }),
        ).toString('base64url')
      : null;

  return { schools: results, nextCursor };
}

export async function createSchool(
  data: CreateSchoolInput,
): Promise<School> {
  const school = {
    id: uuidv4(),
    name: data.name,
    address: data.address ?? null,
    phone: data.phone ?? null,
    email: data.email ?? null,
    logo_url: data.logoUrl ?? null,
  };

  const { data: created, error } = await supabaseAdmin
    .from('schools')
    .insert(school)
    .select('id, name, address, phone, email, logo_url, created_at')
    .single();

  if (error) {
    logger.error('Failed to create school', {
      error: error.message,
      name: data.name,
    });
    throw new AppError('Failed to create school', 500, 'INSERT_FAILED');
  }

  logger.info('School created', { schoolId: school.id, name: data.name });
  return created as School;
}
