import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Order } from "../../entities/order";
import { Product } from "../../entities/product";
import { Customer } from "../../entities/customer";
import { Review } from "../../entities/review";
import { ResUtil } from "../../helper/response.helper";

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    // 1. Total Revenue
    const totalRevenue = await getRepository(Order)
      .createQueryBuilder("order")
      .select("SUM(order.total)", "totalRevenue")
      .where("order.status = :status", { status: "completed" })
      .getRawOne();

    // 2. Total Orders
    const totalOrders = await getRepository(Order)
      .createQueryBuilder("order")
      .where("order.status = :status", { status: "completed" })
      .getCount();

    // 3. New Customers
    const newCustomers = await getRepository(Customer)
      .createQueryBuilder("customer")
      .where("customer.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)")
      .getCount();

    // 4. Pending Orders
    const pendingOrders = await getRepository(Order)
      .createQueryBuilder("order")
      .where("order.status = :status", { status: "pending" })
      .getCount();

    // 5. Sales Trend (Last 30 days)
    const salesTrend = await getRepository(Order)
      .createQueryBuilder("order")
      .select("DATE(order.createdAt)", "date")
      .addSelect("SUM(order.total)", "total")
      .where("order.status = :status", { status: "completed" })
      .groupBy("DATE(order.createdAt)")
      .orderBy("DATE(order.createdAt)", "ASC")
      .getRawMany();

    // 6. Top Selling Products
    const topSellingProducts = await getRepository(Product)
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.items", "orderItem")
      .groupBy("product.id")
      .orderBy("SUM(orderItem.quantity)", "DESC")
      .limit(5)
      .getMany();

    // 7. Low Stock Products
    const lowStockProducts = await getRepository(Product)
      .createQueryBuilder("product")
      .where("product.quantity <= :threshold", { threshold: 10 })
      .orderBy("product.quantity", "ASC")
      .getMany();

    // 8. Top Customers
    const topCustomers = await getRepository(Customer)
      .createQueryBuilder("customer")
      .leftJoinAndSelect("customer.orders", "order")
      .groupBy("customer.id")
      .orderBy("SUM(order.total)", "DESC")
      .limit(5)
      .getMany();

    // 9. Recent Reviews
    const recentReviews = await getRepository(Review)
      .createQueryBuilder("review")
      .leftJoinAndSelect("review.product", "product")
      .orderBy("review.createdAt", "DESC")
      .limit(5)
      .getMany();

    return ResUtil.success({
      res,
      message: "Dashboard data fetched successfully",
      data: {
        totalRevenue: totalRevenue.totalRevenue || 0,
        totalOrders,
        newCustomers,
        pendingOrders,
        salesTrend,
        topSellingProducts,
        lowStockProducts,
        topCustomers,
        recentReviews,
      },
    });
  } catch (error) {
    console.error(error);
    return ResUtil.internalError({
      res,
      message: "Failed to fetch dashboard data",
    });
  }
};
