// src/util/validation/sub-sub-category-validation.ts
import Joi from "joi";

export const createSubSubCategorySchema = Joi.object({
  name: Joi.string().required(),
  categoryId: Joi.string().required(),
  subCategoryId: Joi.string().required(),
});

export const updateSubSubCategorySchema = Joi.object({
  name: Joi.string().required(),
  categoryId: Joi.string().required(),
  subCategoryId: Joi.string().required(),
});
