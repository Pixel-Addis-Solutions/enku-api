import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { User } from "../../entities/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger"; // Adjust the import path according to your project structure

const JWT_SECRET = process.env.JWT_SECRET || "secret"; // Move this to environment variables in production

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      logger.warn("Email and password are required");
      return ResUtil.badRequest({
        res,
        message: "Email and password are required",
      });
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      logger.warn(`Invalid credentials for email: ${email}`);
      return ResUtil.unAuthorized({ res, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn(`Invalid credentials for email: ${email}`);
      return ResUtil.unAuthorized({ res, message: "Invalid credentials" });
    }

    // Generate JWT token
    const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    logger.info(`User logged in: ${email}`);
    return ResUtil.success({
      res,
      message: "Login successful",
      data: { accessToken },
    });
  } catch (error) {
    logger.error("Error logging in", error);
    return ResUtil.internalError({
      res,
      message: "Error logging in",
      data: error,
    });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    // const authHeader = req.headers.authorization;

    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   logger.warn("Authorization header is missing or invalid");
    //   return ResUtil.unAuthorized({
    //     res,
    //     message: "Authorization token is required",
    //   });
    // }

    // const token = authHeader.split(" ")[1];

    try {
      // const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const decoded = req.user;
      if (!decoded) {
        logger.error("not decoded data found");
        return;
      }
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded?.id },
        select: ["id", "role", "fullName", "email", "phoneNumber"],
        relations: ["role"],
      });

      if (!user) {
        logger.warn(`User not found for ID: ${decoded?.id}`);
        return ResUtil.notFound({ res, message: "User not found" });
      }

      logger.info(`User profile retrieved for ID: ${decoded?.id}`);
      return ResUtil.success({
        res,
        message: "User profile fetched successfully",
        data: user,
      });
    } catch (err) {
      logger.error("Invalid or expired token", err);
      return ResUtil.unAuthorized({
        res,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    logger.error("Error fetching user profile", error);
    return ResUtil.internalError({
      res,
      message: "Error fetching user profile",
      data: error,
    });
  }
};
export const changePassword = async (req: any, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      logger.warn(
        "Old password, new password, and confirm password are required"
      );
      return ResUtil.badRequest({
        res,
        message:
          "Old password, new password, and confirm password are required",
      });
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOneBy({ id: req.user.id });

    if (!user) {
      logger.warn(`User not found for ID: ${req.user.id}`);
      return ResUtil.notFound({ res, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      logger.warn("Incorrect old password");
      return ResUtil.badRequest({ res, message: "Incorrect old password" });
    }

    // Hash new password before saving
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await userRepository.save(user);

    logger.info(`Password changed successfully for user ID: ${req.user.id}`);
    return ResUtil.success({
      res,
      message: "Password changed successfully",
    });
  } catch (error) {
    logger.error("Error changing password", error);
    return ResUtil.internalError({
      res,
      message: "Error changing password",
      data: error,
    });
  }
};

export const updateUserInformation = async (req: any, res: Response) => {
  try {
    const { fullName, email, phoneNumber } = req.body;

    // Validate input fields
    if (!fullName || !email || !phoneNumber) {
      logger.warn("Full name, email, and phone number are required");
      return ResUtil.badRequest({
        res,
        message: "Full name, email, and phone number are required",
      });
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOneBy({ id: req.user.id });

    if (!user) {
      logger.warn(`User not found for ID: ${req.user.id}`);
      return ResUtil.notFound({ res, message: "User not found" });
    }

    // Update user information
    user.fullName = fullName;
    user.email = email;
    user.phoneNumber = phoneNumber;

    // Save updated user
    await userRepository.save(user);

    logger.info(`User information updated for ID: ${req.user.id}`);
    return ResUtil.success({
      res,
      message: "User information updated successfully",
      data: {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role?.name, // Ensure role information is returned
      },
    });
  } catch (error) {
    logger.error("Error updating user information", error);
    return ResUtil.internalError({
      res,
      message: "Error updating user information",
      data: error,
    });
  }
};
