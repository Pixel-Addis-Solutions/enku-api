import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Discount } from "../../entities/discount";
import { ResUtil } from "../../helper/response.helper";

export const getAllUserDiscounts = async (req: Request, res: Response) => {
  try {
    const discountRepo = getRepository(Discount);

    // Find all active discounts
    const discounts = await discountRepo.find({ where: { status: true } });

    return ResUtil.success({ data: discounts, res, message: "" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching discounts", error });
  }
};
