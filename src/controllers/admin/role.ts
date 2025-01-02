import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Role } from "../../entities/role";
import { Permission } from "../../entities/permission";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
require("dotenv").config();

export class RoleController {
  /**
   * POST /api/roles/:id/permissions
   * Assign permissions to a role
   */
  static async assignPermissions(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { id: roleId } = req.params; // Role ID from the URL
    const { permissions } = req.body; // Array of permission IDs from the request body

    if (!Array.isArray(permissions) || !permissions.length) {
      return res
        .status(400)
        .json({ message: "Permissions must be a non-empty array of IDs." });
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
      const permissionEntities = await permissionRepository.findByIds(
        permissions
      );

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
  static async getRolePermissions(
    req: Request,
    res: Response
  ): Promise<Response> {
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




const roleRepository = AppDataSource.getRepository(Role);

export const createRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description } = req.body;

  try {
    const existingRole = await roleRepository.findOneBy({ name });
    if (existingRole) {
      ResUtil.badRequest({ res, message: "Role name must be unique" });
      return;
    }

    const role = roleRepository.create({ name, description });
    const savedRole = await roleRepository.save(role);
    ResUtil.success({
      res,
      message: "Role Created Successfully",
      data: savedRole,
    });
  } catch (error) {
    ResUtil.internalError({
      res,
      message: "Error while creating role",
      data: error,
    });
    logger.error({ error });
  }
};

export const getAllRoles = async (_: Request, res: Response): Promise<void> => {
  try {
    const roles = await roleRepository.find();
    ResUtil.success({
      res,
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    ResUtil.internalError({
      res,
      message: "Error while fetching roles",
      data: error,
    });
    logger.error({ error });
  }
};

export const getRoleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const role = await roleRepository.findOneBy({ id });
    if (!role) {
      ResUtil.notFound({ res, message: "Role not found" });
      return;
    }
    ResUtil.success({ res, message: "Role fetched successfully", data: role });
  } catch (error) {
    ResUtil.internalError({
      res,
      message: "Error while fetching role",
      data: error,
    });
    logger.error({ error });
  }
};

export const updateRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const role = await roleRepository.findOneBy({ id });
    if (!role) {
      ResUtil.notFound({ res, message: "Role not found" });
      return;
    }

    role.name = name || role.name;
    role.description = description || role.description;

    const updatedRole = await roleRepository.save(role);
    ResUtil.success({
      res,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    ResUtil.internalError({
      res,
      message: "Error while updating role",
      data: error,
    });
    logger.error({ error });
  }
};

export const deleteRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const role = await roleRepository.findOneBy({ id });
    if (!role) {
      ResUtil.notFound({ res, message: "Role not found" });
      return;
    }

    await roleRepository.remove(role);
    ResUtil.success({ res, message: "Role deleted successfully" });
  } catch (error) {
    ResUtil.internalError({
      res,
      message: "Error while deleting role",
      data: error,
    });
    logger.error({ error });
  }
};
