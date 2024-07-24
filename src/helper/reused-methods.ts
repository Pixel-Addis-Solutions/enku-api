import fs from "fs";
import path from "path";
import { getRepository } from "../data-source";
import { File } from "../entities/file";
import logger from "../util/logger";

export const generateOTP = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const generateOtpExpiration = (valid: number) =>
  new Date(new Date().getTime() + valid * 60 * 1000); // Set OTP expiration to 10 minutes from now

export const unlinkFile = (filename: string) => {
  const UPLOADS_DIR = path.resolve(__dirname, "..", "..", "uploads");
  const filePath = path.join(UPLOADS_DIR, filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log("file not exist", err);

      return;
    }

    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("file not exist", err);

        // Error occurred while deleting the file
        return;
      }

      // File deleted successfully
      return "File deleted successfully";
    });
  });
};

export const getFileName = async (fileId: string) => {
  try {
    if (!fileId) {
      return null;
    }
    const fileRepository = getRepository(File);
    const file = await fileRepository.findOne({
      where: { id: fileId },
      select: { id: true, name: true },
    });
    if (!file) {
      return null;
    }
    return file?.name;
  } catch (error) {
    logger.error("Error While Deleting File", error);
    return "";
  }
};
export const deleteFile = async (fileId: string) => {
  try {
    if (!fileId) {
      return null;
    }
    unlinkFile(await getFileName(fileId));
    const fileRepository = getRepository(File);
    await fileRepository.delete({
      where: { id: fileId },
    });
  } catch (error) {
    logger.error("Error While Deleting File", error);
  }
};


export const getFileDetails = async (fileId: string) => {
  try {
    if (!fileId) {
      return null;
    }
    const fileRepository = getRepository(File);
    const file = await fileRepository.findOne({
      where: { id: fileId },
      select: { id: true, name: true, originalName: true },
    });

    if (!file) {
      return null;
    }

    const UPLOADS_DIR = path.resolve(__dirname, "..", "..", "uploads");
    const filePath = path.join(UPLOADS_DIR, file.name);

    const fileSize = await new Promise<number>((resolve, reject) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          // return reject(`Error retrieving file size: ${err.message}`);
          return resolve(0);
        }

        resolve(stats.size); // File size in bytes
      });
    });

    return { ...file, fileSize: fileSize };
  } catch (error) {
    logger.error("Error while getting File details", error);
  }
};

export const formatToTwoDecimalPlaces = (value: number): number => {
  return Math.round(value * 100) / 100;
};
