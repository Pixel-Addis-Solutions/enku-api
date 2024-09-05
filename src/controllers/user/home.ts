import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Brand } from "../../entities/brand";
import { Category } from "../../entities/category";
import { Product } from "../../entities/product";
import { OrderItem } from "../../entities/order-item"; // Import the OrderItem entity
import { ResUtil } from "../../helper/response.helper";

export const getHomePageData = async (req: Request, res: Response) => {
  const productRepository = getRepository(Product);
  const categoryRepository = getRepository(Category);
  const brandRepository = getRepository(Brand);
  const orderItemRepository = getRepository(OrderItem); // Add OrderItem repository

  try {
    // Fetch top sellers based on total quantity sold
    const topSellers = await productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.items", "orderItem")
      .addSelect("SUM(orderItem.quantity)", "soldQuantity")
      .groupBy("product.id")
      .orderBy("soldQuantity", "DESC")
      .take(10) // Limit to top 10
      .getMany();

    // Fetch featured products
    const featuredProducts = await productRepository.find({
      where: { isFeatured: true },
      take: 10, // Limit to top 10
    });

    // Fetch featured categories
    const featuredCategories = await categoryRepository.find({
      where: { isFeatured: true },
      take: 5, // Limit to top 5
    });

    // Fetch top brands
    const topBrands = await brandRepository.find({
      where: { isFeatured: true },
      take: 5, // Limit to top 5
    });

    return ResUtil.success({
      res,
      message: "",
      data: { topSellers, featuredProducts, featuredCategories, topBrands },
    });
  } catch (error) {
    console.error(error);
    return ResUtil.internalError({
      res,
      message: "Failed to fetch home page data",
    });
  }
};
