import express from "express";
import { multipleUpload, singleUpload } from "../middlewares/upload.middleware";
import { File } from "../entities/file";
import { unlinkFile } from "../helper/reused-methods";
import path from "path";
import fs from "fs";
import { getRepository } from "../data-source";
const router = express.Router();
const fileRepository = getRepository(File);

router.post("/", multipleUpload);
router.get("/", async (req, res) => {
  // if (!req.params?.id) {
  //   return res.status(400).json({ message: "wrong file id" });
  // }
  try {
    // const id = req.params?.id;
    const file = await fileRepository.find();
    return res.json(file);
  } catch (error) {
    console.log("file get", error);
    return res.status(500).json({ message: "error while getting file" });
  }
});
router.get("/:id", async (req, res) => {
  if (!req.params?.id) {
    return res.status(400).json({ message: "wrong file id" });
  }
  try {
    const id = req.params?.id;
    const file = await fileRepository.findOneBy({ id });
    if (!file) {
      return res.status(400).json({ message: "file not found" });
    }
    const filePath = path.resolve(__dirname, "..", "..", "uploads", file.name);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    } else {
      return res.status(200).json(null);
    }
    // return res.json(`${process.env?.API}/${file?.name}`);
  } catch (error) {
    console.log("file get", error);
    return res.status(200).json({ message: "error while getting file" });
  }
});
router.delete("/:id", async (req, res) => {
  if (!req.params?.id) {
    return res.status(400).json({ message: "wrong file id" });
  }
  try {
    const id = req.params?.id;
    const file = await fileRepository.findOneBy({ id });
    file?.name && unlinkFile(file?.name);

    file?.remove();
    return res.json({ status: true, message: `file deleted successfully` });
  } catch (error) {
    console.log("file get", error);
    return res.status(500).json({ message: "error while getting file" });
  }
});

export default router;
