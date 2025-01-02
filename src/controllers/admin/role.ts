import { Request, Response } from "express";
import { In } from "typeorm";
import { getRepository } from "../../data-source";
import { Role } from "../../entities/role";
import { Permission } from "../../entities/permission";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger"; // Import the logger

// Helper function to validate an array of IDs
const isValidIdArray = (array: any[]): boolean => {
  return (
    Array.isArray(array) &&
    array.every((item) => typeof item === "string" || typeof item === "number")
  );
};

/**
 * Assign permissions to a role
 * POST /api/roles/:id/permissions
 */
export const assignPermissions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: roleId } = req.params;
  const { permissions } = req.body as { permissions: Array<string | number> };

  try {
    // Validate input
    if (!isValidIdArray(permissions) || permissions.length === 0) {
      logger.warn(`Invalid permissions array for Role ID: ${roleId}`);
      return res
        .status(400)
        .json({
          message: "Permissions must be a non-empty array of valid IDs.",
        });
    }

    // Repositories
    const roleRepository = getRepository(Role);
    const permissionRepository = getRepository(Permission);

    // Check if the role exists
    const role = await roleRepository.findOne({
      where: { id: roleId },
      relations: ["permissions"],
    });

    if (!role) {
      logger.warn(`Role not found with ID: ${roleId}`);
      return res.status(404).json({ message: "Role not found." });
    }

    // Validate permissions
    const permissionEntities = await permissionRepository.find({
      where: { id: In(permissions) },
    });

    if (permissions.length !== permissionEntities.length) {
      logger.warn(
        `One or more permission IDs are invalid for Role ID: ${roleId}`
      );
      return res
        .status(400)
        .json({ message: "One or more permission IDs are invalid." });
    }

    // Merge new permissions with existing ones (avoid duplicates)
    const existingPermissionIds = new Set(
      role.permissions.map((perm: Permission) => perm.id)
    );
    const newPermissions = permissionEntities.filter(
      (perm) => !existingPermissionIds.has(perm.id)
    );

    // Update role permissions
    role.permissions = [...role.permissions, ...newPermissions];

    // Save the updated role
    const updatedRole = await roleRepository.save(role);

    logger.info(`Permissions assigned successfully to Role ID: ${roleId}`);

    return res.status(200).json({
      message: "Permissions successfully assigned to the role.",
      data: {
        id: updatedRole.id,
        name: updatedRole.name,
        permissions: updatedRole.permissions.map((perm: Permission) => ({
          id: perm.id,
          name: perm.name,
        })),
      },
    });
  } catch (error) {
    logger.error(
      `Error assigning permissions to Role ID: ${roleId} - ${
        (error as Error).message
      }`,
      { stack: (error as Error).stack }
    );
    return res
      .status(500)
      .json({
        message: "Error assigning permissions.",
        data: (error as Error).message,
      });
  }
};

/**
 * Retrieve permissions for a specific role
 * GET /api/roles/:id/permissions
 */
export const getRolePermissions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: roleId } = req.params;

  try {
    const roleRepository = getRepository(Role);

    // Find the role with its permissions
    const role = await roleRepository.findOne({
      where: { id: roleId },
      relations: ["permissions"],
    });

    if (!role) {
      logger.warn(`Role not found with ID: ${roleId}`);
      return res.status(404).json({ message: "Role not found." });
    }

    logger.info(`Permissions retrieved for Role ID: ${roleId}`);

    return res.status(200).json({
      message: "Permissions retrieved successfully.",
      data: role.permissions.map((perm: Permission) => ({
        id: perm.id,
        name: perm.name,
      })),
    });
  } catch (error) {
    logger.error(
      `Error retrieving permissions for Role ID: ${roleId} - ${
        (error as Error).message
      }`,
      { stack: (error as Error).stack }
    );
    return res
      .status(500)
      .json({
        message: "Error retrieving role permissions.",
        data: (error as Error).message,
      });
  }
};