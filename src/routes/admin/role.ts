import { Router } from "express";
import { RoleController } from "../../controllers/admin/role";

const router = Router();

// Assign permissions to a role..
router.post("/:id/permissions", RoleController.assignPermissions);

// Retrieve permissions for a specific role...
router.get("/:id/permissions", RoleController.getRolePermissions);

export default router;