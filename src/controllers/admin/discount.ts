import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Discount } from "../../entities/discount";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { Product } from "../../entities/product";
import { Category } from "../../entities/category";
import {ProductVariation} from "../../entities/product-variation"
import { ProductDiscounts } from "../../entities/ProductDiscounts";
export const createDiscount = async (req: Request, res: Response) => {
  try {
    const discountRepo = getRepository(Discount);
    const { type, value, startDate, endDate, status, code,image } = req.body;

    // Create a new discount
    const discount = discountRepo.create({
      type,
      value,
      startDate,
      endDate,
      status: status,
      code,
      image
    });

    await discountRepo.save(discount);

    res.status(201).json({
      message: "Discount created successfully",
      discount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating discount", error });
  }
};

export const getAllDiscounts = async (req: Request, res: Response) => {
  try {
    const discountRepo = getRepository(Discount);

    // Find all active discounts
    const discounts = await discountRepo.find();

    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching discounts", error });
  }
};

export const updateDiscount = async (req: Request, res: Response) => {
  try {
    const discountRepo = getRepository(Discount);
    const { id } = req.params; // Assuming you're sending the discount ID as a URL parameter
    const { type, value, startDate, endDate, status, code,image } = req.body;

    // Find the discount by ID
    const discount = await discountRepo.findOne({
      where: { id: parseInt(id, 10) }, // Ensure ID is properly parsed
    });

    if (!discount) {
      return res.status(404).json({
        message: "Discount not found",
      });
    }

    // Update the discount fields if they are present in the request body
    discount.type = type ?? discount.type;
    discount.value = value ?? discount.value;
    discount.startDate = startDate ?? discount.startDate;
    discount.endDate = endDate ?? discount.endDate;
    discount.status = status ?? discount.status;
    discount.code = code ?? discount.code;
    discount.image = image ?? discount.image;

    // Save the updated discount
    await discountRepo.save(discount);

    res.status(200).json({
      message: "Discount updated successfully",
      discount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating discount",
      error,
    });
  }
};

export const deleteDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const discountRepository = getRepository(Discount);

    const filterValue = await discountRepository.findOneBy({ id });
    if (!filterValue) {
      return ResUtil.notFound({ res, message: "Filter value not found" });
    }

    await discountRepository.remove(filterValue);

    return ResUtil.success({
      res,
      message: "discount value deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting discount value: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error deleting discount value",
      data: error,
    });
  }
};


export const attachDiscountToProductOrVariationOrCategory = async (
   req: Request,
   res: Response
 ) => {
   try {
     const { productId, categoryId, variationId, discountId } = req.body;

     // Validate discount
     const discount = await Discount.findOne({ where: { id: discountId } });
     if (!discount) {
       return res.status(400).json({ message: "Discount not found" });
     }

     let product, category, variation;

     // Attach to Product
     if (productId) {
       product = await Product.findOne({ where: { id: productId } });
       if (!product) {
         return res.status(400).json({ message: "Product not found" });
       }

       await ProductDiscounts.create({
         discount,
         product,
         discountedPrice:
           product.price - (product.price * discount.value) / 100,
       }).save();
     }

     // Attach to Category
     if (categoryId) {
       category = await Category.findOne({ where: { id: categoryId } });
       if (!category) {
         return res.status(400).json({ message: "Category not found" });
       }

       await ProductDiscounts.create({
         discount,
         category,
       }).save();
     }

     // Attach to Variation
     if (variationId) {
       variation = await ProductVariation.findOne({
         where: { id: variationId },
       });
       if (!variation) {
         return res.status(400).json({ message: "Variation not found" });
       }

       await ProductDiscounts.create({
         discount,
         variation,
         discountedPrice:
           variation.price - (variation.price * discount.value) / 100,
       }).save();
     }

     return res
       .status(200)
       .json({ message: "Discount attached successfully!" });
   } catch (error) {
     console.error(error);
     return res.status(500).json({ message: "Internal Server Error", error });
   }
 };



