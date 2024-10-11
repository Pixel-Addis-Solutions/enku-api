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
