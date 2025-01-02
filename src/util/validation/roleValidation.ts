import Joi from "joi";

export const roleSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    "string.base": "Name should be a type of 'text'",
    "string.empty": "Name cannot be an empty field",
    "string.min": "Name should have a minimum length of {#limit}",
    "string.max": "Name should have a maximum length of {#limit}",
    "any.required": "Name is a required field",
  }),
  description: Joi.string().max(255).optional().messages({
    "string.base": "Description should be a type of 'text'",
    "string.max": "Description should have a maximum length of {#limit}",
  }),
});