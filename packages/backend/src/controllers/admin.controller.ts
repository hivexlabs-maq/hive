import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import { success, paginated } from '../utils/apiResponse';
import type {
  CreateSchoolInput,
  UpdateUserRoleInput,
  GetUsersInput,
  GetSchoolsInput,
} from '../validators/admin.validator';

export async function getDashboardStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(success(stats));
  } catch (err) {
    next(err);
  }
}

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = req.query as unknown as GetUsersInput;
    const result = await adminService.getUsers(query);
    res.json(paginated(result.users, result.nextCursor));
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body as UpdateUserRoleInput;

    const user = await adminService.updateUserRole(id, role);
    res.json(success(user, 'User role updated'));
  } catch (err) {
    next(err);
  }
}

export async function getSchools(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = req.query as unknown as GetSchoolsInput;
    const result = await adminService.getSchools(query);
    res.json(paginated(result.schools, result.nextCursor));
  } catch (err) {
    next(err);
  }
}

export async function createSchool(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = req.body as CreateSchoolInput;
    const school = await adminService.createSchool(data);
    res.status(201).json(success(school, 'School created'));
  } catch (err) {
    next(err);
  }
}
