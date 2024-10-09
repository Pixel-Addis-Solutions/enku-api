import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { User } from "../../entities/user";
import { LoyaltyProgram } from "../../entities/loyalty-program";
import { ResUtil } from "../../helper/response.helper";

// Create new loyalty program entry
export const createLoyaltyProgram = async (req: Request, res: Response) => {
  const loyaltyProgramRepository = getRepository(LoyaltyProgram);
  
  try {
    const { action, points, reason, active,thresholdAmount } = req.body;

    // Create a new loyalty program
    const newLoyaltyProgram = loyaltyProgramRepository.create({
      action,
      points,
      reason,
      active: active ?? true, // Set default value if not provided
      thresholdAmount
    });

    // Save to the database
    await loyaltyProgramRepository.save(newLoyaltyProgram);

    res.status(201).json(newLoyaltyProgram);
  } catch (error) {
    res.status(500).json({ message: "Failed to create loyalty program", error });
  }
};

// Get all loyalty programs
export const getLoyaltyPrograms = async (_req: Request, res: Response) => {
  const loyaltyProgramRepository = getRepository(LoyaltyProgram);

  try {
    const programs = await loyaltyProgramRepository.find();
    ResUtil.success({data:programs,message:'',res});
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve loyalty programs", error });
  }
};

// Get specific loyalty program by ID
export const getLoyaltyProgramById = async (req: Request, res: Response) => {
  const loyaltyProgramRepository = getRepository(LoyaltyProgram);

  try {
    const { id } = req.params;
    const program = await loyaltyProgramRepository.findOneBy({ id: Number(id) });

    if (!program) {
      return res.status(404).json({ message: "Loyalty program not found" });
    }

    ResUtil.success({data:program,message:'',res});
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve loyalty program", error });
  }
};

// Update loyalty program
export const updateLoyaltyProgram = async (req: Request, res: Response) => {
  const loyaltyProgramRepository = getRepository(LoyaltyProgram);

  try {
    const { id } = req.params;
    const { action, points, reason, active,thresholdAmount } = req.body;

    const program = await loyaltyProgramRepository.findOneBy({ id: Number(id) });

    if (!program) {
      return res.status(404).json({ message: "Loyalty program not found" });
    }

    // Update fields
    program.action = action || program.action;
    program.points = points || program.points;
    program.reason = reason || program.reason;
    program.active = active ?? program.active;
    program.thresholdAmount = thresholdAmount ?? program.thresholdAmount;

    // Save updated entry
    await loyaltyProgramRepository.save(program);

    res.status(200).json(program);
  } catch (error) {
    res.status(500).json({ message: "Failed to update loyalty program", error });
  }
};

// Delete loyalty program
export const deleteLoyaltyProgram = async (req: Request, res: Response) => {
  const loyaltyProgramRepository = getRepository(LoyaltyProgram);

  try {
    const { id } = req.params;

    const program = await loyaltyProgramRepository.findOneBy({ id: Number(id) });

    if (!program) {
      return res.status(404).json({ message: "Loyalty program not found" });
    }

    await loyaltyProgramRepository.remove(program);

    res.status(200).json({ message: "Loyalty program deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete loyalty program", error });
  }
};
