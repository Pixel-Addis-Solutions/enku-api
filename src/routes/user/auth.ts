import { Router } from "express";
import {
  registerCustomer,
  loginCustomer,
  getCustomerById,
  updateCustomer,
} from "../../controllers/user/customer";

const router = Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/me/:id", getCustomerById);
router.put("/me", updateCustomer);

export default router;
