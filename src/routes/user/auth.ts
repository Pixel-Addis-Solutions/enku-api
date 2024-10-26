import { Router } from "express";
import {
  registerCustomer,
  loginCustomer,
  getCustomerById,
} from "../../controllers/user/customer";

const router = Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/me", getCustomerById);

export default router;
