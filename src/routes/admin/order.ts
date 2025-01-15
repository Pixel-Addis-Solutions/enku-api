import { Router } from "express";
import {
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  createOrder,
} from "../../controllers/admin/order";
import { getOrderAnalytics } from "../../controllers/admin/dashboard";
import { can } from "../../middlewares/authenticate";
const router = Router();

router.get("/", getAllOrders);
router.put("/:id", updateOrderStatus);
router.get("/analytics", getOrderAnalytics);
router.get("/:id", getOrderById);
router.post("/", createOrder);

export default router;
