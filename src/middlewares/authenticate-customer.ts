import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getRepository } from "../data-source";
import { Customer } from "../entities/customer";
import { ResUtil } from "../helper/response.helper";

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
