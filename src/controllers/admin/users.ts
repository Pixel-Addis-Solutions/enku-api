import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { User } from "../../entities/user";
import { Role } from "../../entities/role";
import bcrypt from "bcrypt";
import logger from "../../util/logger";
import { ResUtil } from '../../helper/response.helper';

/**
 * Helper function to exclude sensitive fields like password from user responses
 */
const excludePassword = (user: User) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Create a new user
 * POST /admin/users
 */
export const createUser = async (req: Request, res: Response) => {
  const { fullName, email, phoneNumber, password, roleId } = req.body;

  try {

    if(!fullName || !email || !password){
      logger.warn(`Required Validation failed`);
      return ResUtil.badRequest({
        res,
        message: "please fill required data",
      });
    }
    const userRepository = getRepository(User);
    const roleRepository = getRepository(Role);

    // Validate role
    const role = await roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      logger.warn(`Invalid role ID: ${roleId}`);
      ResUtil.badRequest({
        res,
        message: "Invalid role ID.",
      });
      return res; // Explicitly return res
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const newUser = userRepository.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword, // Save hashed password
      role,
    });

    const savedUser = await userRepository.save(newUser);

    logger.info(`User created successfully with email: ${email}`);
    ResUtil.success({
      res,
      message: "User created successfully.",
      data: excludePassword(savedUser), // Exclude password from response
    });
    return res; // Explicitly return res
  } catch (error) {
    logger.error(`Error creating user - ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    ResUtil.badRequest({
      res,
      message: "Error creating user.",
      data: (error as Error).message,
    });
    return res; // Explicitly return res
  }
};

/**
 * Get all users
 * GET /admin/users
 */
export const getAllUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const userRepository = getRepository(User);
    const users = await userRepository.find({ relations: ["role"] });

    logger.info(`Retrieved all users.`);
    ResUtil.success({
      res,
      message: "Users retrieved successfully.",
      data: users.map((user) => excludePassword(user)), // Exclude passwords from all users
    });
    return res; // Explicitly return res
  } catch (error) {
    logger.error(`Error retrieving users - ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    ResUtil.badRequest({
      res,
      message: "Error retrieving users.",
      data: (error as Error).message,
    });
    return res; // Explicitly return res
  }
};

/**
 * Get a specific user by ID
 * GET /admin/users/:id
 */
export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const userRepository = getRepository(User);

    const user = await userRepository.findOne({
      where: { id },
      relations: ["role"],
    });

    if (!user) {
      logger.warn(`User not found with ID: ${id}`);
      ResUtil.badRequest({
        res,
        message: "User not found.",
      });
      return res; // Explicitly return res
    }

    logger.info(`Retrieved user with ID: ${id}`);
    ResUtil.success({
      res,
      message: "User retrieved successfully.",
      data: excludePassword(user), // Exclude password from response
    });
    return res; // Explicitly return res
  } catch (error) {
    logger.error(`Error retrieving user with ID: ${id} - ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    ResUtil.badRequest({
      res,
      message: "Error retrieving user.",
      data: (error as Error).message,
    });
    return res; // Explicitly return res
  }
};

/**
 * Update a user
 * PUT /admin/users/:id
 */
export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { fullName, email, phoneNumber, password, roleId } = req.body;

  try {
    const userRepository = getRepository(User);
    const roleRepository = getRepository(Role);

    // Find user
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      logger.warn(`User not found with ID: ${id}`);
      ResUtil.badRequest({
        res,
        message: "User not found.",
      });
      return res; // Explicitly return res
    }

    // Validate role if provided
    let role;
    if (roleId) {
      role = await roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        logger.warn(`Invalid role ID: ${roleId}`);
        ResUtil.badRequest({
          res,
          message: "Invalid role ID.",
        });
        return res; // Explicitly return res
      }
    }

    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Update user fields
    user.fullName = fullName ?? user.fullName;
    user.email = email ?? user.email;
    user.phoneNumber = phoneNumber ?? user.phoneNumber;
    user.password = hashedPassword ?? user.password;
    user.role = role ?? user.role;

    const updatedUser = await userRepository.save(user);

    logger.info(`User updated successfully with ID: ${id}`);
    ResUtil.success({
      res,
      message: "User updated successfully.",
      data: excludePassword(updatedUser), // Exclude password from response
    });
    return res; // Explicitly return res
  } catch (error) {
    logger.error(`Error updating user with ID: ${id} - ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    ResUtil.badRequest({
      res,
      message: "Error updating user.",
      data: (error as Error).message,
    });
    return res; // Explicitly return res
  }
};

/**
 * Delete a user
 * DELETE /admin/users/:id
 */
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const userRepository = getRepository(User);

    // Find user
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      logger.warn(`User not found with ID: ${id}`);
      ResUtil.badRequest({
        res,
        message: "User not found.",
      });
      return res; // Explicitly return res
    }

    // Delete user
    await userRepository.remove(user);

    logger.info(`User deleted successfully with ID: ${id}`);
    ResUtil.success({
      res,
      message: "User deleted successfully.",
    });
    return res; // Explicitly return res
  } catch (error) {
    logger.error(`Error deleting user with ID: ${id} - ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    ResUtil.badRequest({
      res,
      message: "Error deleting user.",
      data: (error as Error).message,
    });
    return res; // Explicitly return res
  }
};