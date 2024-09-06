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
    const topSellers = await orderItemRepository
    .createQueryBuilder("order_item")
    .leftJoin("order_item.product", "product")
    .leftJoin("order_item.variation", "variation")
    .leftJoin("variation.images", "images")
    .select([
      "product.id AS productId",
      "product.name AS productName",
      "product.imageUrl AS productImageUrl",
      "variation.id AS variationId",
      "variation.title AS variationTitle",
      "variation.sku AS variationSku",
      "images.url AS variationImage", //  image URL
      // "GROUP_CONCAT(images.url) AS variationImages", // Concatenate image URLs
      "SUM(order_item.quantity) AS soldQuantity"
    ])
    .groupBy("product.id, variation.id") // Include images in the group by
    .orderBy("soldQuantity", "DESC")
    .take(10) // Limit to top 10
    .getRawMany();
  
    // Fetch featured products
    const featuredProducts = await productRepository.find({
      where: { variations: { isFeatured: true } },
      take: 10, // Limit to top 10
      relations: ["variations"],
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
