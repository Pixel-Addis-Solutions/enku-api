import Joi from 'joi';

// Product validation schema
export const productSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().greater(0).required(),
  imageUrl: Joi.string().allow('').optional(),
  productionDate: Joi.date().optional(),
  expiryDate: Joi.date().optional(),
  categoryId: Joi.number().required(),
  subCategoryId: Joi.number().required(),
  brandId: Joi.number().required(),
});
