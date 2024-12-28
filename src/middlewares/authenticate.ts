import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getRepository } from "../data-source";
import { Customer } from "../entities/customer";
import { ResUtil } from "../helper/response.helper";
import { User } from "../entities/user";

export const authenticateCustomer = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return ResUtil.unAuthenticated({ res, message: "UnAuthenticated" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");
    const customerRepository = getRepository(Customer);
    const customer = await customerRepository.findOne({
      where: { id: decoded.id },
    });

    if (!customer) {
      return ResUtil.unAuthenticated({ res, message: "UnAuthenticated" });
    }

    req.customer = customer;
    next();
  } catch (error) {
    return ResUtil.unAuthenticated({ res, message: "UnAuthenticated" });
  }
};

export const authenticateUser = async (
  req: any, // Use 'any' to extend the Request object
  res: Response,
  next: NextFunction
) => {
  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return ResUtil.unAuthenticated({ res, message: "Unauthenticated" });
  }

  try {
    // Verify the token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");
    const userRepository = getRepository(User);

    // Find the user by ID from the token
    const user = await userRepository.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      return ResUtil.unAuthenticated({ res, message: "Unauthenticated" });
    }

    // Attach user to the request object
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // Handle token verification errors or unexpected issues
    return ResUtil.unAuthenticated({ res, message: "Unauthenticated" });
  }
};

export const can = (requiredPermissions: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    // Get the current user's permissions from the request

    const permissions = req?.user?.role?.permissions?.map(
      (permission: any) => permission?.name
    );
    console.log("permissions", permissions);

    // Check if the user has the required permissions
    const hasPermission = requiredPermissions?.every((permission) =>
      permissions?.includes(permission)
    );

    if (!hasPermission) {
      return ResUtil.unAuthorized({ res, message: `UnAuthorized:You haven't ${requiredPermissions[0]} permission ` });
    }
    // Proceed to the next middleware or route handler
    next();
  };
};