import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Category } from "../../entities/category";
import { categorySchema } from "../../util/validation/category-validation";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";

// Define repository using your custom getRepository function
const categoryRepository = getRepository(Category);

export const getCategories = async (req: Request, res: Response) => {
  try {
    // Retrieve the category
    const category = await categoryRepository.find({
      relations: ["subCategories.subSubCategories"],order:{updatedAt:'DESC'}
    });
    if (category) {
      logger.info(`Category retrieved successfully:`);
      ResUtil.success({
        res,
        message: "Category retrieved successfully",
        data: category,
      });
    } else {
      logger.warn(`Categories not found:`);
      ResUtil.notFound({ res, message: "Categories not found" });
    }
  } catch (error: unknown) {
    logger.error(`Error retrieving categories`, error);
    ResUtil.internalError({
      res,
      message: "Error retrieving categories",
      data: error,
    });
  }
};
export const getCategory = async (req: Request, res: Response) => {
  try {
    // Retrieve the category

    if (!req.params.id) {
      return;
    }
    const category = await categoryRepository.findOne({
      where: { id: req.params.id },
      relations: ["subCategories.subSubCategories"],
    });
    if (category) {
      logger.info(`Category retrieved successfully: ${category.id}`);
      ResUtil.success({
        res,
        message: "Category retrieved successfully",
        data: category,
      });
    } else {
      logger.warn(`Category not found: ${req.params.id}`);
      ResUtil.notFound({ res, message: "Category not found" });
    }
  } catch (error: unknown) {
    logger.error(`Error retrieving category`, error);
    ResUtil.internalError({
      res,
      message: "Error retrieving category",
      data: error,
    });
  }
};

export const getCategoriesWithSubcategories = async (
  req: Request,
  res: Response
) => {
  try {
    const categoryRepository = getRepository(Category);

    const categories = await categoryRepository.find({
      relations: ["subCategories", "subCategories.subSubCategories"],
    });

    return ResUtil.success({
      res,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    logger.error(`Error fetching categories: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching categories",
      data: error,
    });
  }
};
