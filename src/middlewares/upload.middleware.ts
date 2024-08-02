import path from "path";
import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import { v4 as uuidv4 } from "uuid";
import { File } from "../entities/file";
import { getRepository } from "../data-source";
import logger from "../util/logger";
require("dotenv").config();

// Create storage for uploaded files
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    // Set the destination folder for uploaded files
    cb(null, "uploads/");
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => { 
    // Generate a unique filename based on uuid
    const uniqueFilename = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const filename = `${uniqueFilename}${fileExtension}`;
    cb(null, filename);
  },
});

// File filter function to accept only certain file types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // Allow all file types for now
  cb(null, true);
  // Uncomment to restrict file types, e.g., only images
  // if (file.mimetype.startsWith("image/")) {
  //   cb(null, true);
  // } else {
  //   cb(null, false);
  // }
};

// Create multer instance with the storage configuration
const upload = multer({ storage, fileFilter });

// Middleware for single file upload
export const singleUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload.single("file")(req, res, async (err: any) => {
    if (err) {
      // Handle file upload error
      return res.status(400).json({ error: err.message });
    }
    try {
      if (!req.file) {
        return res.status(400).json({
          status: false,
          message: "Empty file upload",
        });
      }
      const fileRepository = getRepository(File);
      const file = fileRepository.create({
        name: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      });
      await fileRepository.save(file);

      return res.status(200).json({
        status: true,
        message: "File uploaded successfully",
        data: {
          id: file.id,
          name: file.name,
          path: `${process.env.API}/${file.name}`,
        },
      });
    } catch (error) {
      console.error("File upload error", error);
      return res.status(500).json({
        status: false,
        message: "Error uploading file",
      });
    }
  });
};

// Middleware for multiple file uploads
export const multipleUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload.array("files")(req, res, async (err: any) => {
    if (err) {
      // Handle file upload error
      logger.error("array_file_upload_error",err)
      logger.error("array_file_upload_error",req)
      return res.status(400).json({ error: err.message });
    }
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        logger.info("req.files", req.files);
        return res.status(400).json({
          status: false,
          message: "Empty file upload",
        });
      }

      const fileRepository = getRepository(File);
      const files = (req.files as Express.Multer.File[]).map((file) => {
        return fileRepository.create({
          name: file.filename,
          originalName: file.originalname,
          size: file.size,
        });
      });

      await fileRepository.save(files);

      return res.status(200).json({
        status: true,
        message: "Files uploaded successfully",
        data: files.map((file) => ({
          id: file.id,
          name: file.name,
          path: `${process.env.API}/${file.name}`,
        })),
      });
    } catch (error) {
      console.error("File upload error", error);
      return res.status(500).json({
        status: false,
        message: "Error uploading files",
      });
    }
  });
};
