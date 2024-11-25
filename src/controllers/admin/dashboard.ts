import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Order } from "../../entities/order";
import { Product } from "../../entities/product";
import { Customer } from "../../entities/customer";
import { Review } from "../../entities/review";
import { ResUtil } from "../../helper/response.helper";
import { User } from "../../entities/user";
import { Category } from "../../entities/category";
import logger from "../../util/logger";
import { OrderItem } from "../../entities/order-item";

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
      .getCount();

    // 3. New Customers
    const newCustomers = await getRepository(Customer)
      .createQueryBuilder("customer")
      .where("customer.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)")
      .getCount();
    // 3. Total Customers
    const totalCustomers = await getRepository(Customer)
      .createQueryBuilder("customer")
      .getCount();
    // 3. Total Customers
    const totalUsers = await getRepository(User)
      .createQueryBuilder("user")
      .getCount();
    // 3. Total Categories
    const totalCategories = await getRepository(Category)
      .createQueryBuilder("category")
      .getCount();
    const totalProduct = await getRepository(Product)
      .createQueryBuilder("product")
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
      .select([
        "product.id",
        "product.name",
        "orderItem.id",
        "orderItem.quantity",
      ])
      .limit(5)
      .getMany();

    // 7. Low Stock Products
    const lowStockProducts = await getRepository(Product)
      .createQueryBuilder("product")
      .where("product.quantity <= :threshold", { threshold: 10 })
      .orderBy("product.quantity", "ASC")
      .select(["id", "name", "quantity"])
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
    // const recentReviews = await getRepository(Review)
    //   .createQueryBuilder("review")
    //   .leftJoinAndSelect("review.product", "product")
    //   .orderBy("review.createdAt", "DESC")
    //   .limit(5)
    //   .getMany();

    return ResUtil.success({
      res,
      message: "Dashboard data fetched successfully",
      data: {
        totalRevenue: totalRevenue.totalRevenue || 0,
        totalOrders,
        newCustomers,
        pendingOrders,
        totalCustomers,
        totalUsers,
        totalCategories,
        totalProduct,
        salesTrend,
        topSellingProducts,
        lowStockProducts,
        topCustomers,
        // recentReviews,
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

// Get top selling products
export const getTopSellingProducts = async (req: Request, res: Response) => {
  try {
    const orderItemRepository = getRepository(OrderItem);

    // Aggregate the total quantity and total price for each product sold, including product variations
    const topSellingProducts = await orderItemRepository
      .createQueryBuilder("orderItem")
      .leftJoinAndSelect("orderItem.product", "product") // Join with Product table
      .leftJoinAndSelect("orderItem.variation", "variation") // Join with ProductVariation table
      .select([
        "product.id",
        "product.name",
        "product.price",
        "variation.id AS variationId",
        "variation.title AS variationName",
        "SUM(orderItem.quantity) AS totalQuantity", // Aggregate quantity sold
        "SUM(orderItem.price * orderItem.quantity) AS totalRevenue", // Aggregate total revenue
      ])
      .groupBy("product.id, variation.id") // Group by product and variation
      .orderBy("totalQuantity", "DESC") // Order by quantity sold
      .limit(10) // Limit to top 10 products
      .getRawMany();

    logger.info("Top selling products fetched successfully");
    return res.status(200).json({
      message: "Top selling products fetched successfully",
      data: topSellingProducts,
    });
  } catch (error) {
    logger.error("Error fetching top selling products", error);
    return res.status(500).json({
      message: "Error fetching top selling products",
      data: error,
    });
  }
};

// Get top liked products (assuming this data comes from product feedback or ratings)
export const getTopLikedProducts = async (req: Request, res: Response) => {
  try {
    const productRepository = getRepository(Product);

    // Assuming `likes` is a field that stores the number of likes or ratings.
    const topLikedProducts = await productRepository
      .createQueryBuilder("product")
      .orderBy("product.likes", "DESC")
      .limit(5)
      .getMany();

    logger.info("Top liked products fetched");
    return ResUtil.success({
      res,
      message: "Top liked products fetched successfully",
      data: topLikedProducts,
    });
  } catch (error) {
    logger.error("Error fetching top liked products", error);
    return ResUtil.internalError({
      res,
      message: "Error fetching top liked products",
      data: error,
    });
  }
};

// Get order analytics (by year and month)
export const getOrderAnalytics = async (req: Request, res: Response) => {
  try {
    const { year } = req.query;

    const orderRepository = getRepository(Order);

    // Fetch orders and calculate monthly data for the selected year
    const orderAnalytics = await orderRepository
      .createQueryBuilder("order")
      .select([
        "EXTRACT(MONTH FROM order.createdAt) AS month",
        "COUNT(order.id) AS totalOrders",
        "SUM(order.total) AS totalRevenue",
        "SUM(CASE WHEN order.status = 'Completed' THEN 1 ELSE 0 END) AS completedOrders",
        "SUM(CASE WHEN order.status = 'Canceled' THEN 1 ELSE 0 END) AS canceledOrders",
      ])
      .where("EXTRACT(YEAR FROM order.createdAt) = :year", { year })
      .groupBy("month")
      .orderBy("month")
      .getRawMany();

    logger.info(`Order analytics for year ${year} fetched`);
    return ResUtil.success({
      res,
      message: "Order analytics fetched successfully",
      data: orderAnalytics,
    });
  } catch (error) {
    logger.error("Error fetching order analytics", error);
    return ResUtil.internalError({
      res,
      message: "Error fetching order analytics",
      data: error,
    });
  }
};
