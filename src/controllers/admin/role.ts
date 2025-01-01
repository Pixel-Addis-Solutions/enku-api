import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Role } from "../../entities/role";
import { Permission } from "../../entities/permission";

export class RoleController {
  /**
   * POST /api/roles/:id/permissions
   * Assign permissions to a role
   */
  static async assignPermissions(req: Request, res: Response): Promise<Response> {
    const { id: roleId } = req.params; // Role ID from the URL
    const { permissions } = req.body; // Array of permission IDs from the request body

    if (!Array.isArray(permissions) || !permissions.length) {
      return res.status(400).json({ message: "Permissions must be a non-empty array of IDs." });
    }

    try {
      const roleRepository = AppDataSource.getRepository(Role);
      const permissionRepository = AppDataSource.getRepository(Permission);

      // Check if the role exists
      const role = await roleRepository.findOne({
        where: { id: roleId },
        relations: ["permissions"],
      });

      if (!role) {
        return res.status(404).json({ message: "Role not found." });
      }

      // Check if the permissions exist
      const permissionEntities = await permissionRepository.findByIds(permissions);

      if (permissions.length !== permissionEntities.length) {
        return res.status(400).json({
          message: "One or more permission IDs are invalid.",
        });
      }

      // Merge new permissions with existing ones (avoid duplicates)
      const existingPermissionIds = role.permissions.map((perm) => perm.id);
      const newPermissions = permissionEntities.filter(
        (perm) => !existingPermissionIds.includes(perm.id)
      );

      role.permissions = [...role.permissions, ...newPermissions];

      // Save the updated role with new permissions
      const updatedRole = await roleRepository.save(role);

      return res.status(200).json({
        message: "Permissions successfully assigned to the role.",
        role: {
          id: updatedRole.id,
          name: updatedRole.name,
          permissions: updatedRole.permissions,
        },
      });
    } catch (error) {
      console.error("Error assigning permissions:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * GET /api/roles/:id/permissions
   * Retrieve permissions for a specific role
   */
  static async getRolePermissions(req: Request, res: Response): Promise<Response> {
    const { id: roleId } = req.params; // Role ID from the URL

    try {
      const roleRepository = AppDataSource.getRepository(Role);

      // Find the role with its permissions
      const role = await roleRepository.findOne({
        where: { id: roleId },
        relations: ["permissions"],
      });

      if (!role) {
        return res.status(404).json({ message: "Role not found." });
      }

      return res.status(200).json(role.permissions); // Return only the permissions
    } catch (error) {
      console.error("Error retrieving role permissions:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}