import { Request, Response } from "express";
import { PostLog } from "../../entities/post-log";
import { getRepository } from "../../data-source";
export const createPostLog = async (req: Request, res: Response) => {
  try {
    const postLogRepo = getRepository(PostLog);
    const { postId, platformId, attemptTime, success, errorMessage } = req.body;

    const postLog = postLogRepo.create({
      post: { id: postId },
      platform: { id: platformId },
      attemptTime: new Date(attemptTime),
      success,
      errorMessage: errorMessage ?? null,
    });

    await postLogRepo.save(postLog);

    res.status(201).json({ message: "Post log created successfully", postLog });
  } catch (error) {
    res.status(500).json({ message: "Error creating post log", error });
  }
};
