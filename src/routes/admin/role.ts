import { Router } from "express";
import {
  assignPermissions,
  getRolePermissions,
} from "../../controllers/admin/role";

const router = Router();

// Assign permissions to a role..
router.post("/:id/permissions", assignPermissions);

// Retrieve permissions for a specific role...
router.get("/:id/permissions", getRolePermissions);

export default router;