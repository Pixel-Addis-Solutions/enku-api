import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  buyNow,
} from "../../controllers/user/order";
import { authenticate } from "../../middlewares/customer-login";
import { authenticateCustomer } from "../../middlewares/authenticate-customer";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/",authenticateCustomer, getOrders);
router.get("/:orderId", authenticateCustomer, getOrderById);
router.post("/buy_now", authenticateCustomer, buyNow);

export default router;
