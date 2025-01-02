import { Router } from "express";
import {
  getAllOrders,
  updateOrderStatus,
  getOrderById,
} from "../../controllers/admin/order";
import { getOrderAnalytics } from "../../controllers/admin/dashboard";
import { can } from "../../middlewares/authenticate";
const router = Router();

router.get("/",can(['create-order']), getAllOrders);
router.put("/:id", can(["update-order"]), updateOrderStatus);
router.get("/analytics", can(["view-order"]), getOrderAnalytics);
router.get("/:id", can(["view-order"]), getOrderById);

export default router;
