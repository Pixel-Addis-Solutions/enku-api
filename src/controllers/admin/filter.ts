import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Filter, FilterValue } from "../../entities/filter";
import { Category } from "../../entities/category";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { In } from "typeorm";

// Create a new filter
export const createFilter = async (req: Request, res: Response) => {
  try {
    const { name, categoryIds } = req.body;
    const filterRepository = getRepository(Filter);
    const categoryRepository = getRepository(Category);

    const categories = await categoryRepository.find({
      where: {
        id: In(categoryIds),
      },
    });
    console.log("cc", categories);
    console.log("cc", categories.length);

    const newFilter = filterRepository.create({ name, categories });
    const savedFilter = await filterRepository.save(newFilter);

    return ResUtil.success({
      res,
      message: "Filter created successfully",
      data: savedFilter,
    });
  } catch (error) {
    logger.error(`Error creating filter: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error creating filter",
      data: error,
    });
  }
};

export const updateFilter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Get the filter ID from the request params
    const { name, categoryIds } = req.body; // Get updated name and categories from the request body

    const filterRepository = getRepository(Filter);
    const categoryRepository = getRepository(Category);

    // Find the existing filter by ID
    const existingFilter = await filterRepository.findOne({
      where: { id },
      relations: ["categories"], // Load existing categories for this filter
    });

    if (!existingFilter) {
      return ResUtil.notFound({
        res,
        message: "Filter not found",
      });
    }

    // Fetch the new categories to be associated with the filter
    const categories = await categoryRepository.find({
      where: {
        id: In(categoryIds),
      },
    });

    if (categories.length === 0) {
      return ResUtil.badRequest({
        res,
        message: "No valid categories found",
      });
    }

    // Update the filter properties
    existingFilter.name = name || existingFilter.name;
    existingFilter.categories = categories;

    // Save the updated filter to the database
    const updatedFilter = await filterRepository.save(existingFilter);

    return ResUtil.success({
      res,
      message: "Filter updated successfully",
      data: updatedFilter,
    });
  } catch (error) {
    logger.error(`Error updating filter: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error updating filter",
      data: error,
    });
  }
};


// Get all filters
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
export const getFiltersByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { productId } = req.query;
    if (!categoryId) {
      return ResUtil.badRequest({
        res,
        message: "Category Id required",
      });
    }
    const filterRepository = getRepository(Filter);
    const filterValueRepository = getRepository(FilterValue);

    const filters = await filterRepository
      .createQueryBuilder("filter")
      .leftJoinAndSelect("filter.values", "values")
      .leftJoin("filter.categories", "category")
      .where("category.id = :categoryId", { categoryId })
      .getMany();

    // Step 2: Fetch Filter Values by Product
    let productFilterValues = [];
    if (productId) {
      productFilterValues = await filterValueRepository
        .createQueryBuilder("filterValue")
        .innerJoinAndSelect("filterValue.filter", "filter")
        .innerJoin("filterValue.products", "product") // Correctly join the 'products' relationship
        .where("product.id = :productId", { productId }) // Use 'product.id' to reference the product ID
        .getMany();
    }
    return ResUtil.success({
      res,
      message: "Filters fetched successfully",
      data: {
        filters,
        productFilterValues,
      },
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
export const getCategoriesWithFilters = async (req: Request, res: Response) => {
  try {
    const categoryRepository = getRepository(Category);

    const categories = await categoryRepository
      .createQueryBuilder("category")
      .leftJoinAndSelect("category.filters", "filter")
      .leftJoinAndSelect("filter.values", "values")
      .where("values.categoryId = category.id")
      .getMany();

    return ResUtil.success({
      res,
      message: "Filters fetched successfully",
      data: categories,
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

// Update a filter
// export const updateFilter = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { name } = req.body;
//     const filterRepository = getRepository(Filter);

//     const filter = await filterRepository.findOne(id);
//     if (!filter) {
//       return ResUtil.notFound({ res, message: 'Filter not found' });
//     }

//     filter.name = name;
//     const updatedFilter = await filterRepository.save(filter);

//     return ResUtil.success({
//       res,
//       message: 'Filter updated successfully',
//       data: updatedFilter,
//     });
//   } catch (error) {
//     logger.error(`Error updating filter: ${error}`);
//     return ResUtil.internalError({ res, message: 'Error updating filter', data: error });
//   }
// };

// Delete a filter
export const deleteFilter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filterRepository = getRepository(Filter);

    const filter = await filterRepository.findOneBy({ id });
    if (!filter) {
      return ResUtil.notFound({ res, message: "Filter not found" });
    }

    await filterRepository.remove(filter);

    return ResUtil.success({
      res,
      message: "Filter deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting filter: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error deleting filter",
      data: error,
    });
  }
};

// Create a new filter value
export const createFilterValue = async (req: Request, res: Response) => {
  try {
    const { filterId, values, categoryId } = req.body;
    const filterRepository = getRepository(Filter);
    const filterValueRepository = getRepository(FilterValue);
    const categoryRepository = getRepository(Category);

    const filter = await filterRepository.findOne({
      where: { id: filterId },
      relations: ["values"],
    });
    if (!filter) {
      return ResUtil.notFound({ res, message: "Filter not found" });
    }

    const category = await categoryRepository.findOne({
      where: { id: categoryId },
      relations: ["filterValues"],
    });
    if (!category) {
      return ResUtil.notFound({ res, message: "Category not found" });
    }

    let newFilterValues = [];
    if (Array.isArray(values)) {
      newFilterValues = values.map((value: string) =>
        filterValueRepository.create({ value, filter, category })
      );
    } else {
      return ResUtil.badRequest({
        res,
        message: "Values should be an array",
      });
    }

    const savedFilterValues = await filterValueRepository.save(newFilterValues);

    return ResUtil.success({
      res,
      message: "Filter values created successfully",
      data: savedFilterValues,
    });
  } catch (error) {
    logger.error(`Error creating filter values: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error creating filter values",
      data: error,
    });
  }
};
// Get all filter values for a specific filter and category
export const getFilterValues = async (req: Request, res: Response) => {
  try {
    const { filterId, categoryId } = req.params;
    const filterValueRepository = getRepository(FilterValue);

    const filterValues = await filterValueRepository
      .createQueryBuilder("filterValue")
      .leftJoinAndSelect("filterValue.filter", "filter")
      .leftJoinAndSelect("filterValue.categories", "category")
      .where("filter.id = :filterId", { filterId })
      .andWhere("category.id = :categoryId", { categoryId })
      .getMany();

    return ResUtil.success({
      res,
      message: "Filter values fetched successfully",
      data: filterValues,
    });
  } catch (error) {
    logger.error(`Error fetching filter values: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching filter values",
      data: error,
    });
  }
};
// Update a filter value
export const updateFilterValue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    const filterValueRepository = getRepository(FilterValue);

    const filterValue = await filterValueRepository.findOneBy({ id });
    if (!filterValue) {
      return ResUtil.notFound({ res, message: "Filter value not found" });
    }

    filterValue.value = value;
    const updatedFilterValue = await filterValueRepository.save(filterValue);

    return ResUtil.success({
      res,
      message: "Filter value updated successfully",
      data: updatedFilterValue,
    });
  } catch (error) {
    logger.error(`Error updating filter value: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error updating filter value",
      data: error,
    });
  }
};

// Delete a filter value
export const deleteFilterValue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filterValueRepository = getRepository(FilterValue);

    const filterValue = await filterValueRepository.findOneBy({ id });
    if (!filterValue) {
      return ResUtil.notFound({ res, message: "Filter value not found" });
    }

    await filterValueRepository.remove(filterValue);

    return ResUtil.success({
      res,
      message: "Filter value deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting filter value: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error deleting filter value",
      data: error,
    });
  }
};
