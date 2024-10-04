import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Discount } from "../../entities/discount";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";

export const createDiscount = async (req: Request, res: Response) => {
  try {
    const discountRepo = getRepository(Discount);
    const { type, value, start_date, end_date, status, code } = req.body;

    // Create a new discount
    const discount = discountRepo.create({
      type,
      value,
      start_date,
      end_date,
      status: status || "active",
      code,
    });

    await discountRepo.save(discount);

    res.status(201).json({
      message: "Discount created successfully",
      discount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating discount", error });
  }
};

export const getAllDiscounts = async (req: Request, res: Response) => {
  try {
    const discountRepo = getRepository(Discount);

    // Find all active discounts
    const discounts = await discountRepo.find();

    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching discounts", error });
  }
};

export const deleteDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const discountRepository = getRepository(Discount);

    const filterValue = await discountRepository.findOneBy({ id });
    if (!filterValue) {
      return ResUtil.notFound({ res, message: "Filter value not found" });
    }

    await discountRepository.remove(filterValue);

    return ResUtil.success({
      res,
      message: "discount value deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting discount value: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error deleting discount value",
      data: error,
    });
  }
};
