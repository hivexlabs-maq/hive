import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import {
  createSchoolSchema,
  updateUserRoleSchema,
  getUsersSchema,
  getSchoolsSchema,
} from '../validators/admin.validator';
import * as adminController from '../controllers/admin.controller';

const router: import("express").Router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(roleGuard('admin'));

// GET /admin/dashboard - Dashboard statistics
router.get('/dashboard', adminController.getDashboardStats);

// GET /admin/users - List users with search/filter
router.get(
  '/users',
  validate(getUsersSchema, 'query'),
  adminController.getUsers,
);

// PATCH /admin/users/:id/role - Update user role
router.patch(
  '/users/:id/role',
  validate(updateUserRoleSchema, 'body'),
  adminController.updateUserRole,
);

// GET /admin/schools - List schools
router.get(
  '/schools',
  validate(getSchoolsSchema, 'query'),
  adminController.getSchools,
);

// POST /admin/schools - Create school
router.post(
  '/schools',
  validate(createSchoolSchema, 'body'),
  adminController.createSchool,
);

export default router;
