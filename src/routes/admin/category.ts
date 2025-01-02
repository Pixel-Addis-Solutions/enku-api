// import { Router } from "express";
// import {
//   createCategory,
//   getCategories,
//   getCategory,
//   updateCategory,
//   deleteCategory,
// } from "../../controllers/admin/category";

// const router = Router();

// router.post("/", createCategory);
// router.get("/", getCategories);
// router.get("/:id", getCategory);
// router.put("/:id", updateCategory);
// router.delete("/:id", deleteCategory);

// export default router;


import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../../controllers/admin/category";
import { can } from "../../middlewares/authenticate";
const router = Router();

router.post("/", can(["create-Category"]), createCategory);
router.get("/", can(["view-Category"]), getCategories);
router.get("/:id", can(["view-Category"]), getCategory);
router.put("/:id", can(["update-Category"]), updateCategory);
router.delete("/:id", can(["delete-Category"]), deleteCategory);

export default router;
