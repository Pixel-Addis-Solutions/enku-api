import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Discount } from "../../entities/discount";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { Product } from "../../entities/product";

export const createDiscount = async (req: Request, res: Response) => {
  try {
    const discountRepo = getRepository(Discount);
    const { type, value, startDate, endDate, status, code } = req.body;

    // Create a new discount
    const discount = discountRepo.create({
      type,
      value,
      startDate,
      endDate,
      status: status,
      code,
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
    const { type, value, startDate, endDate, status, code } = req.body;

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
export const attachDiscountToProduct = async (req: Request, res: Response) => {
  try {
    const { productId, discountId } = req.body;

    // Find the product by ID
    const product = await Product.findOne({
      where: { id: productId },
      relations: ["discounts"],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the discount by ID
    const discount = await Discount.findOne({
      where: { id: discountId },
    });

    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    // Add the discount to the product's discounts array
    product.discounts.push(discount);

    // Save the updated product with the new discount
    await product.save();

    return res
      .status(200)
      .json({ message: "Discount successfully attached to product" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error attaching discount to product", error });
  }
};

export const detachDiscount = async (req: Request, res: Response) => {
  try {
    const discountRepo = getRepository(Discount);
    const productRepo = getRepository(Product);
    const { id } = req.params; // The discount ID to detach
    const { productId } = req.body; // The product ID to detach discount from (if needed)

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
        relations: ["discounts"], // Assuming a ManyToMany relationship between Product and Discount
      });

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      // Remove the discount from the product
      product.discounts = product.discounts.filter((d: Discount) => d.id !== discount.id);
      await productRepo.save(product);

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
