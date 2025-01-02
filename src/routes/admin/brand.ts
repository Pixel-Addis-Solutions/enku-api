// // src/routes/brand.ts
// import { Router } from 'express';
// import {
//   createBrand,
//   getBrands,
//   getBrandById,
//   updateBrand,
//   deleteBrand,
// } from '../../controllers/admin/brand';

// const router = Router();

// router.post('/', createBrand);
// router.get('/', getBrands);
// router.get('/:id', getBrandById);
// router.put('/:id', updateBrand);
// router.delete('/:id', deleteBrand);

// export default router;


// src/routes/brand.ts
import { Router } from 'express';
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from '../../controllers/admin/brand';
import { can } from "../../middlewares/authenticate";

const router = Router();

router.post("/", can(["create-Brand"]), createBrand);
router.get("/", can(["view-Brand"]), getBrands);
router.get("/:id", can(["view-Brand"]), getBrandById);
router.put("/:id", can(["update-Brand"]), updateBrand);
router.delete("/:id", can(["delete-Brand"]), deleteBrand);

export default router;
