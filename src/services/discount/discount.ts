// src/services/discount.service.ts

import { Product } from "../../entities/product";
import { Discount } from "../../entities/discount";

/**
 * Apply discounts to a product if applicable
 */
export const calculateDiscountedPrice = async (
  product: Product
): Promise<number> => {
  let finalPrice = product.price;

  // Fetch any active discounts on the product
  const activeProductDiscounts = product.discounts.filter((discount) => {
    return discount.status && isDiscountValid(discount);
  });

  // If product has no discount, check its category for discounts
  if (activeProductDiscounts.length === 0 && product.category) {
    const activeCategoryDiscounts = product.category.discounts.filter(
      (discount) => {
        return discount.status && isDiscountValid(discount);
      }
    );

    if (activeCategoryDiscounts.length > 0) {
      finalPrice = applyBestDiscount(finalPrice, activeCategoryDiscounts);
    }
  } else {
    finalPrice = applyBestDiscount(finalPrice, activeProductDiscounts);
  }

  return finalPrice;
};

/**
 * Check if a discount is valid (within date range, etc.)
 */
const isDiscountValid = (discount: Discount): boolean => {
  const currentDate = new Date();
  if (discount.startDate && discount.endDate) {
    return currentDate >= discount.startDate && currentDate <= discount.endDate;
  }
  return true;
};

/**
 * Apply the best discount from available discounts
 */
const applyBestDiscount = (
  originalPrice: number,
  discounts: Discount[]
): number => {
  let bestPrice = originalPrice;

  discounts.forEach((discount) => {
    let discountedPrice;
    if (discount.type === "percentage") {
      discountedPrice = originalPrice * (1 - discount.value / 100);
    } else if (discount.type === "fixed") {
      discountedPrice = Math.max(originalPrice - discount.value, 0);
    }

    if (discountedPrice && discountedPrice < bestPrice) {
      bestPrice = discountedPrice;
    }
  });

  return bestPrice;
};
