import { Request, Response } from "express";
import { getRepository } from "../../data-source";

import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { Customer } from "../../entities/customer";

// Define repository using your custom getRepository function
const customerRepository = getRepository(Customer);

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    // Retrieve the customers
    const customers = await customerRepository.find();
    logger.info(`customers retrieved successfully:`);
    ResUtil.success({
      res,
      message: "customers retrieved successfully",
      data: customers,
    });
  } catch (error: unknown) {
    logger.error(`Error retrieving customers`, error);
    ResUtil.internalError({
      res,
      message: "Error retrieving customers",
      data: error,
    });
  }
};
