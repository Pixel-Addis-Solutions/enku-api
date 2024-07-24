import path from "path";
import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import { v4 as uuidv4 } from "uuid";
import { File } from "../entities/file";
import { getRepository } from "../data-source";
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

    // or to store to external disk
    // Set the destination folder on the external disk
    //const destinationFolder = '/path/to/external/disk/uploads/';
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // Set the filename for uploaded files

    // generate unique filename based on uuid
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
  cb(null, true);
  return ;
  // Check file types, e.g., allow only images
  // if (file.mimetype.startsWith("image/")) {
  //   cb(null, true);
  // } else {
  //   cb(null, false);
  // }
};

// Create multer instance with the storage configuration
const upload = multer({ storage, fileFilter });

// Middleware for file upload
export const  singleUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // console.log('filerrr',req)
  upload.array("files")
  (req, res, async (err: any) => {
    if (err) {
      // Handle file upload error
      return res.status(400).json({ error: err.message });
    }
    try {
      if(!req?.files){
        return res.status(400).json({
          status: false,
          message: "empty file upload",
        });
      }
      const fileRepository = getRepository(File);

      const file =  fileRepository.create({ name: req?.file?.filename, originalName: req?.file?.originalname,size: req?.file?.size });
      await fileRepository.save(file);
      console.log('file',file);
      console.log('req?.file?.filename',req?.file?.filename);
      
      return res.status(200).json({
        status: true,
        message: "file uploaded successfully",
        data: {
          id: file.id,
          name: file.name,
          path: `${process.env?.API}/${file.name}`,
        },
      });
    } catch (error) {
      console.log("file upload error", error);
      return res.status(400).json({
        status: false,
        message: "error file uploaded ",
      });
    }
  });
};
export const multipleUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload.single("files")(req, res, (err: any) => {
    if (err) {
      // Handle file upload error
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};
