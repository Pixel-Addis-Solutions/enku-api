import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Order } from "../../entities/order";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";

export const getAllOrders = async (req: any, res: Response) => {
  const customerId = req.customer?.id;

  if (!customerId) {
    return ResUtil.unAuthorized({ res, message: "Customer not logged in" });
  }

  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const orderRepository = getRepository(Order);

    const [orders, total] = await orderRepository.findAndCount({
      where: { customer: { id: customerId } },
      relations: [
        "customer",
        "items",
        "items.product",
        "items.variation",
        "items.variation.optionValues.option",
      ],
      order: { [sortBy]: sortOrder as "ASC" | "DESC" }, // Sort by createdAt or other fields
      skip: (Number(page) - 1) * Number(limit), // Skip for pagination
      take: Number(limit), // Limit the number of results
    });

    return ResUtil.success({
      res,
      message: "Orders fetched successfully",
      data: orders,
      meta: {
        totalItems: total, // Total number of orders
        currentPage: Number(page), // Current page
        itemsPerPage: Number(limit), // Number of items per page
        totalPages: Math.ceil(total / Number(limit)), // Total number of pages
      },
    });
  } catch (error) {
    logger.error(`Error fetching orders: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching orders",
      data: error,
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const orderRepository = getRepository(Order);
    const order = await orderRepository.findOne({
      where: { id },
      relations: ["customer", "items", "items.product", "items.variation"],
    });

    if (!order) {
      return ResUtil.notFound({ res, message: "Order not found" });
    }

    return ResUtil.success({
      res,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    logger.error(`Error fetching order: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching order",
      data: error,
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const orderRepository = getRepository(Order);
    const order = await orderRepository.findOne({ where: { id } });

    if (!order) {
      return ResUtil.notFound({ res, message: "Order not found" });
    }

    order.status = status;
    await orderRepository.save(order);

    return ResUtil.success({
      res,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    logger.error(`Error updating order status: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error updating order status",
      data: error,
    });
  }
};
