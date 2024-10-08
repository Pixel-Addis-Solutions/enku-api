import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Blog } from "../../entities/blog";

export class BlogController {
  // Get all blogs
  static async getAll(req: Request, res: Response) {
    try {
      const blogRepository = getRepository(Blog);
      const blogs = await blogRepository.find();
      res.json(blogs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching blogs", error });
    }
  }

  // Get a single blog by ID
  static async getById(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const blogRepository = getRepository(Blog);
      const blog = await blogRepository.findOneBy({id});
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.json(blog);
    } catch (error) {
      res.status(500).json({ message: "Error fetching blog", error });
    }
  }

  // Create a new blog
  static async create(req: Request, res: Response) {
    const { title, description, content, type} = req.body;
    try {
      const blogRepository = getRepository(Blog);
      const newBlog = blogRepository.create({
        title,
        description,
        content, 
        type,
        status:'draft'
      });
      await blogRepository.save(newBlog); 
      res.status(201).json(newBlog);
    } catch (error) {
      res.status(500).json({ message: "Error creating blog", error });
    }
  }

  // Update an existing blog
  static async update(req: Request, res: Response) {
    const id = req.params.id;
    const { title, description, content, type } = req.body;

    try {
      const blogRepository = getRepository(Blog);
      const blog = await blogRepository.findOneBy({id});
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      // Update blog fields
      blog.title = title;
      blog.description = description;
      blog.content = content;
      blog.type = type;

      await blogRepository.save(blog);
      res.json(blog);
    } catch (error) {
      res.status(500).json({ message: "Error updating blog", error });
    }
  }

  // Delete a blog
  static async delete(req: Request, res: Response) {
    const id = req.params.id;

    try {
      const blogRepository = getRepository(Blog);
      const result = await blogRepository.delete(id);
      if (result.affected === 0) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.status(204).send(); // No content
    } catch (error) {
      res.status(500).json({ message: "Error deleting blog", error });
    }
  }
}
