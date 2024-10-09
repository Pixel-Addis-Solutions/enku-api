import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { HomePageCard } from "../../entities/card";
import { ResUtil } from "../../helper/response.helper";

// Controller to get all cards for the homepage
export const getHomePageCards = async (req: Request, res: Response) => {
  try {
    const cardRepository = getRepository(HomePageCard);

    // Fetch all cards
    const cards = await cardRepository.find();

    // Optionally, filter by card type if a query parameter is provided (e.g., "promotion")
    const { type } = req.query;
    const filteredCards = type
      ? cards.filter((card) => card.type === type)
      : cards;

    ResUtil.success({
      res,
      data: filteredCards,
      message: "Cards retrieved successfully",
    });
  } catch (error) {
    ResUtil.internalError({
      res,
      message: "Error fetching homepage cards",
      data: error,
    });
  }
};
