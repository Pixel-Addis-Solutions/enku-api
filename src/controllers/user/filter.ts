import { Request, Response } from "express";
import { Filter } from "../../entities/filter";
import { getRepository } from "../../data-source";
import logger from "../../util/logger";
import { ResUtil } from "../../helper/response.helper";
import { Product } from "../../entities/product";

export const getFiltersForCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const filterRepository = getRepository(Filter);

    const filters = await filterRepository
      .createQueryBuilder("filter")
      .innerJoin("filter.categories", "category", "category.id = :categoryId", {
        categoryId,
      })
      .leftJoinAndSelect("filter.values", "filterValue")
      .getMany();

    return ResUtil.success({
      res,
      message: "Filters fetched successfully",
      data: filters,
    });
  } catch (error) {
    logger.error(`Error fetching filters: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching filters",
      data: error,
    });
  }
};
export const getFilters = async (req: Request, res: Response) => {
  try {
    const filterRepository = getRepository(Filter);
    const filters = await filterRepository.find({
      relations: ["values", "categories"],
    });

    return ResUtil.success({
      res,
      message: "Filters fetched successfully",
      data: filters,
    });
  } catch (error) {
    logger.error(`Error fetching filters: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching filters",
      data: error,
    });
  }
};  
 
// Apply filters to search products
export const filterProducts = async (req: Request, res: Response) => {
  try {
    const { filters } = req.body; // filters should be an array of filterValue IDs
    const productRepository = getRepository(Product);

    const products = await productRepository
      .createQueryBuilder("product")
      .innerJoin("product.filters", "filterValue")
      .where("filterValue.id IN (:...filters)", { filters })
      .getMany();

    return ResUtil.success({
      res,
      message: "Products filtered successfully",
      data: products,
    });
  } catch (error) {
    logger.error(`Error filtering products: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error filtering products",
      data: error,
    });
  }
};
