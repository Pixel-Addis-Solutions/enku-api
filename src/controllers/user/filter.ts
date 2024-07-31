import { Request, Response } from "express";
import { CategoryFilter } from "../../entities/filter";
import { getRepository } from "../../data-source";
import logger from "../../util/logger";
import { ResUtil } from "../../helper/response.helper";

export const getFilters = async (req: Request, res: Response) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId } = req.query;

    let filters: CategoryFilter[] = [];

    if (subSubCategoryId) {
      filters = await getRepository(CategoryFilter).find({ where: { subSubCategory: { id: subSubCategoryId } }, relations: ["filter", "filter.values"] });
    } else if (subCategoryId) {
      filters = await getRepository(CategoryFilter).find({ where: { subCategory: { id: subCategoryId } }, relations: ["filter", "filter.values"] });
    } else if (categoryId) {
      filters = await getRepository(CategoryFilter).find({ where: { category: { id: categoryId } }, relations: ["filter", "filter.values"] });
    }

    return res.json(filters);
  } catch (error) {
    logger.error(`Error loading filters: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error loading filters",
      data: error,
    });
  }
};
