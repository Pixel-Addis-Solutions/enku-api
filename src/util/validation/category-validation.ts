import Joi from "joi";

export const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(), // min length 2, max length 50
  description: Joi.string().min(2).max(200).optional().allow("", null), // min length 2, max length 50
  status: Joi.boolean().optional().allow("", null), // boolean
  sort: Joi.number().optional().allow("", null), // number
});
