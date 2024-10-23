import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Blog } from "../../entities/blog";
import { ResUtil } from "../../helper/response.helper";

// Controller for fetching all blogs with optional type filtering
export const getBlogTips = async (req: Request, res: Response) => {
  const blogRepository = getRepository(Blog);

  try {
    // Extract the 'type' query parameter from the request
    const type = "tip";

    // If the 'type' query exists, filter the blogs by type
    const blogs = await blogRepository.find({
      where: type ? { type: type } : {}, // Filter by 'type' if it exists
      order: { id: "DESC" }, // Optional: Sort blogs by ID (newest first)
    });

    ResUtil.success({ res, data: blogs, message: "Tips Fetched" });
  } catch (error) {
    ResUtil.internalError({
      message: "Failed to retrieve blogs",
      data: error,
      res,
    });
  }
};
export const getBlogVideos = async (req: Request, res: Response) => {
  const blogRepository = getRepository(Blog);

  try {
    const type = "video";

    // If the 'type' query exists, filter the blogs by type
    const blogs = await blogRepository.find({
      where: type ? { type: type } : {}, // Filter by 'type' if it exists
      order: { id: "DESC" }, // Optional: Sort blogs by ID (newest first)
    });

    ResUtil.success({ res, data: blogs, message: "" });
  } catch (error) {
    ResUtil.internalError({
      message: "Failed to retrieve blogs",
      data: error,
      res,
    });
  }
};

// Controller for fetching a single blog by ID (detail view)
export const getBlogDetail = async (req: Request, res: Response) => {
  const blogRepository = getRepository(Blog);

  try {
    // Extract the 'id' parameter from the URL
    const { id } = req.params;

    // Find the blog by its ID
    const blog = await blogRepository.findOneBy({ id: Number(id) });

    if (!blog) {
      ResUtil.success({ res, message: "Blog not found" });
    }

    ResUtil.success({ res, data: blog, message: "" });
  } catch (error) {
    ResUtil.internalError({
      message: "Failed to retrieve blog",
      data: error,
      res,
    });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const { type, page = 1, limit = 10, search } = req.query;

    const blogRepository = getRepository(Blog);

    const queryBuilder = blogRepository.createQueryBuilder("blog")
      .orderBy("blog.id", "DESC") // Sort blogs by ID (newest first)
      .skip((Number(page) - 1) * Number(limit)) // Skip items for pagination
      .take(Number(limit)); // Limit the number of items

    // Apply filters
    if (type) {
      queryBuilder.andWhere("blog.type = :type", { type });
    }

    // Apply search functionality
    if (search) {
      queryBuilder.andWhere(
        "(blog.title LIKE :search OR blog.description LIKE :search)",
        { search: `%${search}%` }
      );
    }

    const [blogs, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / Number(limit));

    return ResUtil.success({
      res,
      data: blogs,
      message: "Blogs fetched successfully",
      meta: {
        total,
        totalPages,
        currentPage: Number(page),
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    return ResUtil.internalError({
      message: "Error fetching blogs",
      data: error,
      res,
    });
  }
};

