import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
} from "../../controllers/user/order";

const router = Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("//:orderId", getOrderById);

export default router;
