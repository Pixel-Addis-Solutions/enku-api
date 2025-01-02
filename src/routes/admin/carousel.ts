import { Router } from "express";
import { CarouselController } from "../../controllers/admin/carousel-controller";
import { can } from "../../middlewares/authenticate";

const router = Router();

// Existing routes
router.post("/",can(['create-Carousel']),CarouselController.createCarousel);
router.get("/",can(["view-Carousel"]),CarouselController.getAllCarousels);
router.get("/search_products",can(['view-Carousel']) , CarouselController.searchProductWithVariations);
router.get("/search_categories",can(['view-Carousel']) , CarouselController.searchCategories);
router.put("/:id", can(["update-Carousel"]), CarouselController.updateCarousel);
router.delete("/:id",can(['delete-Carousel']) , CarouselController.deleteCarousel);

// New routes for updating status
router.patch("/:id/status", can(['update-Carousel']) ,CarouselController.updateCarouselStatus);
router.patch("/carousel-item/:id/status", can(["update-Carousel"]), CarouselController.updateCarouselItemStatus
);

export default router;
