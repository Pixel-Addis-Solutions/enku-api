import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { User } from "../../entities/user";
import { Role } from "../../entities/role";
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import logger from "../../util/logger";

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
export const createUser = async (req: Request, res: Response): Promise<Response> => {
  const { fullName, email, phoneNumber, password, roleId } = req.body;

  try {
    const userRepository = getRepository(User);
    const roleRepository = getRepository(Role);

    // Validate role
    const role = await roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      logger.warn(`Invalid role ID: ${roleId}`);
      return res.status(400).json({ message: "Invalid role ID." });
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
    return res.status(201).json({
      message: "User created successfully.",
      data: excludePassword(savedUser), // Exclude password from response
    });
  } catch (error) {
    logger.error(`Error creating user - ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    return res.status(500).json({
      message: "Error creating user.",
      data: (error as Error).message,
    });
  }
};

/**
 * Get all users
 * GET /api/users
 */
export const getAllUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const userRepository = getRepository(User);
    const users = await userRepository.find({ relations: ["role"] });

    logger.info(`Retrieved all users.`);
    return res.status(200).json({
      message: "Users retrieved successfully.",
      data: users.map((user) => excludePassword(user)), // Exclude passwords from all users
    });
  } catch (error) {
    logger.error(`Error retrieving users - ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    return res.status(500).json({
      message: "Error retrieving users.",
      data: (error as Error).message,
    });
  }
};

/**
 * Get a specific user by ID
 * GET /api/users/:id
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
      return res.status(404).json({ message: "User not found." });
    }

    logger.info(`Retrieved user with ID: ${id}`);
    return res.status(200).json({
      message: "User retrieved successfully.",
      data: excludePassword(user), // Exclude password from response
    });
  } catch (error) {
    logger.error(`Error retrieving user with ID: ${id} - ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    return res.status(500).json({
      message: "Error retrieving user.",
      data: (error as Error).message,
    });
  }
};

/**
 * Update a user
 * PUT /api/users/:id
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
      return res.status(404).json({ message: "User not found." });
    }

    // Validate role if provided
    let role;
    if (roleId) {
      role = await roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        logger.warn(`Invalid role ID: ${roleId}`);
        return res.status(400).json({ message: "Invalid role ID." });
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
    return res.status(200).json({
      message: "User updated successfully.",
      data: excludePassword(updatedUser), // Exclude password from response
    });
  } catch (error) {
    logger.error(`Error updating user with ID: ${id} - ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    return res.status(500).json({
      message: "Error updating user.",
      data: (error as Error).message,
    });
  }
};

/**
 * Delete a user
 * DELETE /api/users/:id
 */
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const userRepository = getRepository(User);

    // Find user
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      logger.warn(`User not found with ID: ${id}`);
      return res.status(404).json({ message: "User not found." });
    }

    // Delete user
    await userRepository.remove(user);

    logger.info(`User deleted successfully with ID: ${id}`);
    return res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    logger.error(`Error deleting user with ID: ${id} - ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    return res.status(500).json({
      message: "Error deleting user.",
      data: (error as Error).message,
    });
  }
};