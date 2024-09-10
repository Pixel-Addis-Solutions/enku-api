import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Carousel } from "../../entities/carousel";
import { CarouselItem } from "../../entities/carousel-item";
import { ResUtil } from "../../helper/response.helper";
import { Product } from "../../entities/product";
import { Category } from "../../entities/category";

export class CarouselController {
  // Create a new carousel with items
  static createCarousel = async (req: Request, res: Response) => {
    const carouselRepository = getRepository(Carousel);
    const carouselItemRepository = getRepository(CarouselItem);

    try {
      // Create a new carousel
      const { name, status, device, type, items } = req.body;

      const carousel = new Carousel();
      carousel.name = name;
      carousel.status = status;
      carousel.device = device;
      carousel.type = type;

      // Save the carousel first to get the ID
      await carouselRepository.save(carousel);

      // Save the items
      if (items && items.length > 0) {
        const savedItems = items.map((item: any) => {
          const carouselItem = new CarouselItem();
          carouselItem.image = item.image;
          carouselItem.title = item.title;
          carouselItem.description = item.description;
          carouselItem.typeId = item.typeId;
          carouselItem.status = item.status;
          carouselItem.carousel = carousel; // Associate with the saved carousel
          return carouselItemRepository.save(carouselItem);
        });
        await Promise.all(savedItems);
      }

      // Fetch the carousel with items
      const savedCarousel = await carouselRepository.findOne({
        where: { id: carousel.id },
        relations: ["items"],
      });

      return res.status(201).json(savedCarousel);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to create carousel" });
    }
  };

  // Get all carousels with their items
  static getAllCarousels = async (req: Request, res: Response) => {
    const carouselRepository = getRepository(Carousel);

    try {
      const carousels = await carouselRepository.find({ relations: ["items"] });
      return res.status(200).json(carousels);
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve carousels" });
    }
  };
  static searchProductWithVariations = async (req: Request, res: Response) => {
    const { search} = req.query; // Capture search term from query params

    if(!search){
      return ResUtil.badRequest({
        res,
        message: "search query required",
      });
    }
    const searchTerm  = search.toString().trim();
    const productRepository = getRepository(Product);

    try {
      // Search for products matching the search term
      const products = (await productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.variations", "variation")
        .where("product.name LIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        })
        .orWhere("variation.title LIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        })
        .select([
          "product.id",
          "product.name",
          "product.imageUrl",
          "variation.id",
          "variation.title",
          "variation.sku",
          "variation.price",
        ])
        .take(20)
        .getMany()) as Product[];

      // Format the result if needed
      const formattedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        variations: product.variations.map((variation) => ({
          id: variation.id,
          title: variation.title,
          sku: variation.sku,
          price: variation.price,
        })),
      }));

      return ResUtil.success({
        res,
        message: "Products and variations retrieved successfully",
        data: formattedProducts,
      });
    } catch (error) {
      console.error(error);
      return ResUtil.internalError({
        res,
        message: "Failed to search for products",
      });
    }
  };

  static searchCategories = async (req: Request, res: Response) => {
    const { search } = req.query; // Capture the search query from request parameters


    if(!search){
      return ResUtil.badRequest({
        res,
        message: "search query required",
      });
    }
    const searchTerm  = search.toString().trim();
    const categoryRepository = getRepository(Category);

    try {
      // Search for categories that match the search query
      const categories = await categoryRepository
        .createQueryBuilder("category")
        .where("category.name LIKE :query", { query: `%${searchTerm}%` }) // Case-insensitive search
        .select(["category.id", "category.name", "category.imageUrl"]) // Adjust fields as needed
        .take(20) // Limit to top 20 results
        .getMany();

      // Send the search results back to the frontend
      return ResUtil.success({
        res,
        message: "Categories fetched successfully",
        data: categories,
      });
    } catch (error) {
      console.error(error);
      return ResUtil.internalError({
        res,
        message: "Failed to fetch categories",
      });
    }
  };
  // Update a carousel and its items
  static updateCarousel = async (req: Request, res: Response) => {
    const carouselRepository = getRepository(Carousel);
    const carouselItemRepository = getRepository(CarouselItem);

    try {
      const { id } = req.params;
      const { name, status, device, type, items } = req.body;

      const carousel = await carouselRepository.findOne({
        where: { id },
        relations: ["items"],
      });
      if (!carousel) {
        return res.status(404).json({ message: "Carousel not found" });
      }

      // Update carousel properties
      carousel.name = name;
      carousel.status = status;
      carousel.device = device;
      carousel.type = type;

      // Update the carousel
      await carouselRepository.save(carousel);

      // Handle items update
      if (items && items.length > 0) {
        // Delete old items
        await carouselItemRepository.delete({ carousel });

        // Save new items
        const savedItems = items.map((item: any) => {
          const carouselItem = new CarouselItem();
          carouselItem.image = item.image;
          carouselItem.title = item.title;
          carouselItem.description = item.description;
          carouselItem.typeId = item.typeId;
          carouselItem.status = item.status;
          carouselItem.carousel = carousel;
          return carouselItemRepository.save(carouselItem);
        });
        await Promise.all(savedItems);
      }

      // Fetch the updated carousel with items
      const updatedCarousel = await carouselRepository.findOne({
        where: { id },
        relations: ["items"],
      });

      return res.status(200).json(updatedCarousel);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to update carousel" });
    }
  };

  // Delete a carousel and its items
  static deleteCarousel = async (req: Request, res: Response) => {
    const carouselRepository = getRepository(Carousel);

    try {
      const { id } = req.params;

      const carousel = await carouselRepository.findOne({
        where: { id },
        relations: ["items"],
      });
      if (!carousel) {
        return res.status(404).json({ message: "Carousel not found" });
      }

      // Delete the carousel and its items
      await carouselRepository.remove(carousel);

      return res.status(200).json({ message: "Carousel deleted" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to delete carousel" });
    }
  };

  // Update the status of a carousel
  static updateCarouselStatus = async (req: Request, res: Response) => {
    const carouselRepository = getRepository(Carousel);

    try {
      const { id } = req.params;
      const { status } = req.body;

      const carousel = await carouselRepository.findOneBy({ id });
      if (!carousel) {
        return res.status(404).json({ message: "Carousel not found" });
      }

      // Update status
      carousel.status = status;

      // Save updated carousel
      await carouselRepository.save(carousel);

      return res.status(200).json(carousel);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Failed to update carousel status" });
    }
  };

  // Update the status of a carousel item
  static updateCarouselItemStatus = async (req: Request, res: Response) => {
    const carouselItemRepository = getRepository(CarouselItem);

    try {
      const { id } = req.params;
      const { status } = req.body;

      const carouselItem = await carouselItemRepository.findOneBy({ id });
      if (!carouselItem) {
        return res.status(404).json({ message: "Carousel item not found" });
      }

      // Update status
      carouselItem.status = status;

      // Save updated item
      await carouselItemRepository.save(carouselItem);

      return res.status(200).json(carouselItem);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Failed to update carousel item status" });
    }
  };
}
