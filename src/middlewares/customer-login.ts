// src/middleware/authenticate.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getRepository } from "../data-source";
import { Customer } from "../entities/customer";
import logger from "../util/logger";

export const authenticate = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (token) {
    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );
      const userRepository = getRepository(Customer);
      const user = await userRepository.findOne({ where: { id: decoded.id } });

      if (user) {
        req.user = user;
        logger.info("user logged in:");

      }
    } catch (error) {
      logger.error("Token verification failed:" + error);
    }
  }

  next();
};
