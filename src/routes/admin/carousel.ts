import { Router } from "express";
import { CarouselController } from "../../controllers/admin/carousel-controller";

const router = Router();

// Existing routes
router.post("/", CarouselController.createCarousel);
router.get("/", CarouselController.getAllCarousels);
router.put("/:id", CarouselController.updateCarousel);
router.delete("/:id", CarouselController.deleteCarousel);

// New routes for updating status
router.patch("/:id/status", CarouselController.updateCarouselStatus);
router.patch(
  "/carousel-item/:id/status",
  CarouselController.updateCarouselItemStatus
);

export default router;
