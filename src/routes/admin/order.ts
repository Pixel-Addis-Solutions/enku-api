import { Router } from "express";
import {
  getAllOrders,
  updateOrderStatus,
  getOrderById,
} from "../../controllers/admin/order";
import { getOrderAnalytics } from "../../controllers/admin/dashboard";

const router = Router();

router.get("/", getAllOrders);
router.put("/:id", updateOrderStatus);
router.get("/analytics", getOrderAnalytics);
router.get("/:id", getOrderById);

export default router;
