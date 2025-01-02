import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Role } from "../../entities/role";
import { Permission } from "../../entities/permission";
import { roleSchema } from "../../util/validation/roleValidation"; // Ensure this path is correct or update it
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";

// Create a new role
export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = roleSchema.validate(req.body);
    if (error) {
      logger.warn(`Validation error: ${error.message}`);
      return ResUtil.badRequest({ res, message: error.message });
    }

    const roleRepository = getRepository(Role);
    const role = roleRepository.create(req.body);
    const savedRole = await roleRepository.save(role);

    logger.info(`Role created successfully: ${savedRole.id}`);
    return ResUtil.success({
      res,
      message: "Role created successfully",
      data: savedRole,
    });
  } catch (error) {
    logger.error("Error creating role", error);
    return ResUtil.internalError({
      res,
      message: "Error creating role",
      data: error,
    });
  }
};

// Get all roles
export const getAllRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roleRepository = getRepository(Role);
    const roles = await roleRepository.find();

    logger.info("Roles retrieved successfully");
    return ResUtil.success({
      res,
      message: "Roles retrieved successfully",
      data: roles,
    });
  } catch (error) {
    logger.error("Error retrieving roles", error);
    return ResUtil.internalError({
      res,
      message: "Error retrieving roles",
      data: error,
    });
  }
};

// Get a single role by ID
export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  const { id: roleId } = req.params; // Role ID from the URL

  try {
    const roleRepository = getRepository(Role);
    const role = await roleRepository.findOne({
      where: { id: roleId },
      relations: ["permissions"],
    });

    if (!role) {
      logger.warn(`Role not found with ID: ${roleId}`);
      return ResUtil.notFound({ res, message: "Role not found" });
    }

    logger.info(`Role retrieved successfully: ${roleId}`);
    return ResUtil.success({
      res,
      message: "Role retrieved successfully",
      data: role,
    });
  } catch (error) {
    logger.error("Error retrieving role by ID", error);
    return ResUtil.internalError({
      res,
      message: "Error retrieving role by ID",
      data: error,
    });
  }
};

// Update a role by ID
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  const { id: roleId } = req.params;
  const { error } = roleSchema.validate(req.body);
  if (error) {
    logger.warn(`Validation error: ${error.message}`);
    return ResUtil.badRequest({ res, message: error.message });
  }

  try {
    const roleRepository = getRepository(Role);
    const role = await roleRepository.findOneBy({ id: roleId });

    if (!role) {
      logger.warn(`Role not found with ID: ${roleId}`);
      return ResUtil.notFound({ res, message: "Role not found" });
    }

    roleRepository.merge(role, req.body);
    const updatedRole = await roleRepository.save(role);

    logger.info(`Role updated successfully: ${roleId}`);
    return ResUtil.success({
      res,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    logger.error("Error updating role", error);
    return ResUtil.internalError({
      res,
      message: "Error updating role",
      data: error,
    });
  }
};

// Delete a role by ID
export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  const { id: roleId } = req.params;

  try {
    const roleRepository = getRepository(Role);
    const role = await roleRepository.findOneBy({ id: roleId });

    if (!role) {
      logger.warn(`Role not found with ID: ${roleId}`);
      return ResUtil.notFound({ res, message: "Role not found" });
    }

    await roleRepository.remove(role);

    logger.info(`Role deleted successfully: ${roleId}`);
    return ResUtil.noContent({ res, message: "Role deleted successfully" });
  } catch (error) {
    logger.error("Error deleting role", error);
    return ResUtil.internalError({
      res,
      message: "Error deleting role",
      data: error,
    });
  }
};

// Assign permissions to a role
export const assignPermissions = async (req: Request, res: Response): Promise<void> => {
  const { id: roleId } = req.params; // Role ID from the URL
  const { permissions } = req.body; // Array of permission IDs from the request body

  if (!Array.isArray(permissions) || !permissions.length) {
    logger.warn("Permissions must be a non-empty array of IDs.");
    return ResUtil.badRequest({
      res,
      message: "Permissions must be a non-empty array of IDs.",
    });
  }

  try {
    const roleRepository = getRepository(Role);
    const permissionRepository = getRepository(Permission);

    const role = await roleRepository.findOne({
      where: { id: roleId },
      relations: ["permissions"],
    });

    if (!role) {
      logger.warn(`Role not found with ID: ${roleId}`);
      return ResUtil.notFound({ res, message: "Role not found" });
    }

    const permissionsEntities = await permissionRepository.findByIds(permissions);

    if (permissionsEntities.length !== permissions.length) {
      logger.warn("Some permissions not found");
      return ResUtil.badRequest({
        res,
        message: "Some permissions not found",
      });
    }

    role.permissions = permissionsEntities;
    await roleRepository.save(role);

    logger.info(`Permissions assigned successfully to role ID: ${roleId}`);
    return ResUtil.success({
      res,
      message: "Permissions assigned successfully",
      data: role,
    });
  } catch (error) {
    logger.error("Error assigning permissions", error);
    return ResUtil.internalError({
      res,
      message: "Error assigning permissions",
      data: error,
    });
  }
};

// Get all permissions
export const getAllPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const permissionRepository = getRepository(Permission);
    const permissions = await permissionRepository.find();

    logger.info("Permissions retrieved successfully");
    return ResUtil.success({
      res,
      message: "Permissions retrieved successfully",
      data: permissions,
    });
  } catch (error) {
    logger.error("Error retrieving permissions", error);
    return ResUtil.internalError({
      res,
      message: "Error retrieving permissions",
      data: error,
    });
  }
};

// Get permissions for a specific role
export const getRolePermissions = async (req: Request, res: Response): Promise<void> => {
  const { id: roleId } = req.params; // Role ID from the URL

  try {
    const roleRepository = getRepository(Role);

    // Find the role with its permissions
    const role = await roleRepository.findOne({
      where: { id: roleId },
      relations: ["permissions"],
    });

    if (!role) {
      logger.warn(`Role not found with ID: ${roleId}`);
      return ResUtil.notFound({ res, message: "Role not found" });
    }

    logger.info(`Permissions retrieved successfully for role ID: ${roleId}`);
    return ResUtil.success({
      res,
      message: "Permissions retrieved successfully",
      data: role.permissions,
    });
  } catch (error) {
    logger.error("Error retrieving permissions for role", error);
    return ResUtil.internalError({
      res,
      message: "Error retrieving permissions for role",
      data: error,
    });
  }
};
