import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { LoyaltyProgram } from "../../entities/loyalty-program";
import { ResUtil } from "../../helper/response.helper";

// Get all loyalty programs
export const getLoyaltyPrograms = async (_req: Request, res: Response) => {
  const loyaltyProgramRepository = getRepository(LoyaltyProgram);

  try {
    // Fetch all loyalty programs where active is true
    const loyaltyPrograms = await loyaltyProgramRepository.find({
      where: { active: true },
    });
    ResUtil.success({ data: loyaltyPrograms, message: "", res });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve loyalty programs", error });
  }
};
