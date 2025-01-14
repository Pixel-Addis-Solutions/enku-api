import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Discount } from "../../entities/discount";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { Product } from "../../entities/product";
import { Category } from "../../entities/category";
import { ProductVariation } from "../../entities/product-variation";

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

/**
 * Attach a discount to a product
 */
export const attachDiscountToProductOrVariationOrCategory = async (req: Request, res: Response) => {
  try {
    // incomplete code for melAKU
    const { productId, discountId,categoryId,variationId } = req.body;

    // Find the product by ID
    const product = await Product.findOne({
      where: { id: productId },
      relations: ["discounts"],
    });

    if (!product) {
      return ResUtil.badRequest({res, message: "Product not found" });
    }

    // Find the discount by ID
    const discount = await Discount.findOne({
      where: { id: discountId },
    });

    if (!discount) {
      return ResUtil.badRequest({res, message: "Discount not found" });
    }

    // Add the discount to the product's discounts array
    product.discounts.push(discount);

    const category = await Category.findOne({ 
      where: { id: categoryId },
      relations: ["discounts"],
    });

    if (!category) {
      return ResUtil.badRequest({res, message: "Category not found" });
    }

    category.discounts.push(discount);
  
    const variation = await ProductVariation.findOne({
      where: { id: variationId },
      relations: ["discounts"],
    });

    if (variation) {
      variation.discounts.push(discount);
    }

  
    // Save the updated product with the new discount
    await product.save();

    return ResUtil.success({res, message: "Discount successfully attached to product" });
  } catch (error) {
    ResUtil.internalError({res, message: "Error attaching discount to product", data:error });
  }
};

export const detachDiscountFromProductVariationCategory = async (req: Request, res: Response) => {
  try {
    const discountRepo = getRepository(Discount);
    const productRepo = getRepository(Product);
    const { id } = req.params; // The discount ID to detach
    const { productId,variationId, categoryId } = req.body; // The product ID to detach discount from (if needed)

    // Find the discount by ID
    const discount = await discountRepo.findOne({
      where: { id: parseInt(id, 10) },
    });

    if (!discount) {
      return res.status(404).json({
        message: "Discount not found",
      });
    }

    // Detach the discount from a specific product, if productId is provided
    if (productId) {
      const product = await productRepo.findOne({
        where: { id: parseInt(productId, 10) },
        relations: ["discounts"], 
      });

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      // Remove the discount from the product
      product.discounts = product.discounts.filter((d: Discount) => d.id !== discount.id);
      await productRepo.save(product);


      const category = await Category.findOne({
        where: { id},
        relations: ["discounts"], 
      });
      
      return res.status(200).json({
        message: `Discount detached from product ${productId} successfully`,
      });
    }

    // If no productId is provided, delete the discount completely
    await discountRepo.remove(discount);

    res.status(200).json({
      message: "Discount detached and removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error detaching discount",
      error,
    });
  }
};
