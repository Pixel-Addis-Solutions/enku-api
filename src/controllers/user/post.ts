import { Request, Response } from "express";
import { Post } from "../../entities/post";
import { Media } from "../../entities/media";
import { Platform } from "../../entities/platform";
import { Hashtag } from "../../entities/hashtag";
import { getRepository } from "../../data-source";
import { In } from "typeorm";
// Create a new post
export const createPost = async (req: Request, res: Response) => {
  try {
    const postRepo = getRepository(Post);
    const mediaRepo = getRepository(Media);
    const platformRepo = getRepository(Platform);
    const hashtagRepo = getRepository(Hashtag);

    const { content, status, scheduleTime, media, platforms, hashtags } =
      req.body;

    // Create a new post
    const post = postRepo.create({
      content,
      status,
      scheduleTime: scheduleTime ? new Date(scheduleTime) : null,
    });

    // Save associated media
    if (media && media.length) {
      post.media = await mediaRepo.save(
        media.map((url: string) => mediaRepo.create({ url }))
      );
    }

    // Save associated platforms
    if (platforms && platforms.length) {
      const foundPlatforms = await platformRepo.find({
        where: {
          id: In(platforms),
        },
      });
      post.platforms = foundPlatforms;
    }

    // Save associated hashtags
    if (hashtags && hashtags.length) {
      const foundHashtags = await hashtagRepo.find({
        where: {
          id: In(hashtags),
        },
      });
      post.hashtags = foundHashtags;
    }

    await postRepo.save(post);

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error });
  }
};

// Get all posts
export const getScheduledPosts = async (req: Request, res: Response) => {
  try {
    const postRepo = getRepository(Post);
    const posts = await postRepo.find({
      relations: ["media", "platforms", "hashtags"],
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

// Update a post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const postRepo = getRepository(Post);
    const mediaRepo = getRepository(Media);
    const platformRepo = getRepository(Platform);
    const hashtagRepo = getRepository(Hashtag);

    const { id } = req.params;
    const { content, status, scheduleTime, media, platforms, hashtags } = req.body;

    const post = await postRepo.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["media", "platforms", "hashtags"],
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.content = content ?? post.content;
    post.status = status ?? post.status;
    post.scheduleTime = scheduleTime ? new Date(scheduleTime) : post.scheduleTime;

    if (media && media.length) {
      await mediaRepo.delete({ post: { id: post.id } }); // Remove old media
      post.media = await mediaRepo.save(
        media.map((url: string) => mediaRepo.create({ url }))
      );
    }

    if (platforms && platforms.length) {
      post.platforms = await platformRepo.find({
        where: {
          id: In(platforms),
        },
      });
    }

    if (hashtags && hashtags.length) {
      post.hashtags = await hashtagRepo.find({
        where: {
          id: In(hashtags),
        },
      });
    }

    await postRepo.save(post);

    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Error updating post", error });
  }
};

// Delete a post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const postRepo = getRepository(Post);
    const { id } = req.params;

    const post = await postRepo.findOne({ where: { id: parseInt(id, 10) } });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await postRepo.remove(post);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
};
