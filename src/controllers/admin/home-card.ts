import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { HomePageCard } from "../../entities/card";
import { ResUtil } from "../../helper/response.helper";

// Create a new card
export const createHomePageCard = async (req: Request, res: Response) => {
  try {
    const cardRepository = getRepository(HomePageCard);
    const { title, description, image, type, active, redirectUrl } = req.body;

    const newCard = cardRepository.create({
      title,
      description,
      image,
      type,
      active,
      redirectUrl,
    });
    const savedCard = await cardRepository.save(newCard);

    ResUtil.success({
      res,
      data: savedCard,
      message: "Card created successfully",
    });
  } catch (error) {
    ResUtil.internalError({ res, message: "Error creating card", data: error });
  }
};

// Get all cards
export const getAllHomePageCards = async (req: Request, res: Response) => {
  try {
    const cardRepository = getRepository(HomePageCard);
    const cards = await cardRepository.find();

    ResUtil.success({
      res,
      data: cards,
      message: "Cards retrieved successfully",
    });
  } catch (error) {
    ResUtil.internalError({
      res,
      message: "Error fetching cards",
      data: error,
    });
  }
};

// Get a single card by ID
export const getHomePageCardById = async (req: Request, res: Response) => {
  try {
    const cardRepository = getRepository(HomePageCard);
    const card = await cardRepository.findOneBy({ id: req.params.id });

    if (!card) {
      return ResUtil.notFound({ res, message: "Card not found" });
    }

    ResUtil.success({
      res,
      data: card,
      message: "Card retrieved successfully",
    });
  } catch (error) {
    ResUtil.internalError({ res, message: "Error fetching card", data: error });
  }
};

// Update an existing card
export const updateHomePageCard = async (req: Request, res: Response) => {
  try {
    const cardRepository = getRepository(HomePageCard);
    const card = await cardRepository.findOneBy({ id: req.params.id });

    if (!card) {
      return ResUtil.notFound({ res, message: "Card not found" });
    }

    const { title, description, image, type, active,redirectUrl } = req.body;

    card.title = title ?? card.title;
    card.description = description ?? card.description;
    card.image = image ?? card.image;
    card.type = type ?? card.type;
    card.active = active ?? card.active;
    card.redirectUrl = redirectUrl ?? card.redirectUrl;

    const updatedCard = await cardRepository.save(card);

    ResUtil.success({
      res,
      data: updatedCard,
      message: "Card updated successfully",
    });
  } catch (error) {
    ResUtil.internalError({ res, message: "Error updating card", data: error });
  }
};

// Delete a card by ID
export const deleteHomePageCard = async (req: Request, res: Response) => {
  try {
    const cardRepository = getRepository(HomePageCard);
    const card = await cardRepository.findOneBy({ id: req.params.id });

    if (!card) {
      return ResUtil.notFound({ res, message: "Card not found" });
    }

    await cardRepository.remove(card);
    ResUtil.success({ res, message: "Card deleted successfully" });
  } catch (error) {
    ResUtil.internalError({ res, message: "Error deleting card", data: error });
  }
};
