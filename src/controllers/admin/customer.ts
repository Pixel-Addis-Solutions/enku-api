import { Request, Response } from "express";
import { getRepository } from "../../data-source";

import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { Customer } from "../../entities/customer";

// Define repository using your custom getRepository function
const customerRepository = getRepository(Customer);

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    // Retrieve the customers without the password field
    const customers = await customerRepository.find({
      select: [
        "id",
        "fullName",
        "phoneNumber",
        "email",
        "createdAt",
        "updatedAt",
      ],
    });

    logger.info(`Customers retrieved successfully`);
    return ResUtil.success({
      res,
      message: "Customers retrieved successfully",
      data: customers,
    });
  } catch (error: unknown) {
    logger.error(`Error retrieving customers:`, error);
    return ResUtil.internalError({
      res,
      message: "Error retrieving customers",
      data: error,
    });
  }
};
