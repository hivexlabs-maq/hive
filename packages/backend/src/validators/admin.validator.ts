import { z } from 'zod';

export const createSchoolSchema = z.object({
  name: z
    .string()
    .min(1, 'School name is required')
    .max(200, 'School name too long'),
  address: z.string().max(500, 'Address too long').optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,20}$/, 'Invalid phone number format')
    .optional(),
  email: z.string().email('Invalid email').optional(),
  logoUrl: z.string().url('Invalid logo URL').optional(),
});

export const updateSchoolSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().max(500).optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,20}$/, 'Invalid phone number format')
    .optional(),
  email: z.string().email('Invalid email').optional(),
  logoUrl: z.string().url('Invalid logo URL').optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['parent', 'teacher', 'school_admin', 'admin'], {
    errorMap: () => ({
      message: 'role must be parent, teacher, school_admin, or admin',
    }),
  }),
});

export const getUsersSchema = z.object({
  search: z.string().max(100).optional(),
  role: z.enum(['parent', 'teacher', 'school_admin', 'admin']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(20),
});

export const getSchoolsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(20),
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type GetUsersInput = z.infer<typeof getUsersSchema>;
export type GetSchoolsInput = z.infer<typeof getSchoolsSchema>;
