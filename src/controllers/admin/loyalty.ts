import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { LoyaltyPoints } from "../../entities/loyalty";
import { User } from "../../entities/user";

export class LoyaltyController {
  // Generic function to add points to a user's account
  static async earnPoints(userId: number, points: number, description: string) {
    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOneBy({ id: userId });

      if (!user) {
        return { status: 404, message: "User not found" };
      }

      const loyaltyPoints = new LoyaltyPoints();
      loyaltyPoints.customer = user;
      loyaltyPoints.points = points;
      loyaltyPoints.reason = description;

      const loyaltyRepo = getRepository(LoyaltyPoints);
      await loyaltyRepo.save(loyaltyPoints);

      return { status: 201, message: "Points awarded", loyaltyPoints };
    } catch (error) {
      return { status: 500, message: "Failed to award points", error };
    }
  }

  // After a completed purchase
  static async purchaseCompleted(req: Request, res: Response) {
    const { userId, amountSpent } = req.body;

    const pointsToEarn = amountSpent * 1; // Example: 1 point for every $1 spent
    const response = await LoyaltyController.earnPoints(
      userId,
      pointsToEarn,
      "Earned points from purchase"
    );

    return res.status(response.status).json(response);
  }

  // After submitting a product review
  static async reviewSubmitted(req: Request, res: Response) {
    const { userId } = req.body;

    const pointsForReview = 10; // Example: 10 points per review
    const response = await LoyaltyController.earnPoints(
      userId,
      pointsForReview,
      "Earned points for submitting a review"
    );

    return res.status(response.status).json(response);
  }

  // After a successful referral
  static async referralCompleted(req: Request, res: Response) {
    const { referrerId } = req.body;

    const pointsForReferral = 50; // Example: 50 points per successful referral
    const response = await LoyaltyController.earnPoints(
      referrerId,
      pointsForReferral,
      "Earned points for a successful referral"
    );

    return res.status(response.status).json(response);
  }

  // Award birthday points or other special promotions
  static async awardBirthdayPoints(req: Request, res: Response) {
    const { userId } = req.body;

    const birthdayPoints = 100; // Example: 100 points for birthday
    const response = await LoyaltyController.earnPoints(
      userId,
      birthdayPoints,
      "Birthday bonus points"
    );

    return res.status(response.status).json(response);
  }

  // Points for social engagement (e.g., sharing content)
  static async socialEngagement(req: Request, res: Response) {
    const { userId } = req.body;

    const pointsForEngagement = 5; // Example: 5 points for social engagement
    const response = await LoyaltyController.earnPoints(
      userId,
      pointsForEngagement,
      "Earned points for social engagement"
    );

    return res.status(response.status).json(response);
  }

  // Function to calculate total earned points for a user
  static async getTotalPoints(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const loyaltyRepo = getRepository(LoyaltyPoints);

      // Get the sum of points for the user
      const totalPoints = await loyaltyRepo
        .createQueryBuilder("loyaltyPoints")
        .select("SUM(loyaltyPoints.points)", "total")
        .where("loyaltyPoints.userId = :userId", { userId })
        .getRawOne();

      if (!totalPoints || !totalPoints.total) {
        return res.status(200).json({ totalPoints: 0 });
      }

      return res.status(200).json({ totalPoints: totalPoints.total });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to retrieve total points", error });
    }
  }
}
