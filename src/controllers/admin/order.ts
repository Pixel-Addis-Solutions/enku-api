import { Request, Response } from "express";
import { AppDataSource, getRepository } from "../../data-source";
import { Order } from "../../entities/order";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { Product } from "../../entities/product";
import { OrderItem } from "../../entities/order-item";
import { Customer } from "../../entities/customer";
import { ProductVariation } from "../../entities/product-variation";

export const getAllOrders = async (req: any, res: Response) => {


  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const orderRepository = getRepository(Order);

    const [orders, total] = await orderRepository.findAndCount({
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


export const createOrder = async (req: Request | any, res: Response) => {
  const { 
    productId, 
    customerId: providedCustomerId, 
    shippingPhoneNumber, 
    shippingAddress, 
    customerName, 
    agreed, 
    quantity = 1, 
    variationId 
  } = req.body;

  const entityManager = AppDataSource.manager;

  try {
    await entityManager.transaction(async (transactionalEntityManager) => {
      const productRepository =
        transactionalEntityManager.getRepository(Product);
      const orderRepository = transactionalEntityManager.getRepository(Order);
      const orderItemRepository =
        transactionalEntityManager.getRepository(OrderItem);
      const customerRepository =
        transactionalEntityManager.getRepository(Customer);
      const variationRepository =
        transactionalEntityManager.getRepository(ProductVariation);

      // Retrieve the product
      const product = await productRepository.findOne({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // Retrieve the variation if provided
      const variation = variationId
        ? await variationRepository.findOne({
            where: { id: variationId, product: { id: productId } },
          })
        : null;

      if (variationId && !variation) {
        throw new Error("Variation not found");
      }

      // Handle customer identification
      let customerId = providedCustomerId;

      if (!customerId) {
        // Check if the customer already exists by phone number
        let customer = await customerRepository.findOneBy({
          phoneNumber: shippingPhoneNumber,
        });

        if (customer) {
          customerId = customer.id;
        } else {
          // Create a new customer
          customer = customerRepository.create({
            phoneNumber: shippingPhoneNumber,
            fullName: customerName,
          });
          await customerRepository.save(customer);
          customerId = customer.id;
        } 
      }

      // Calculate total price
      const total = (variation?.price || product.price) * quantity;

      // Create the order
      const order = orderRepository.create({
        customer: customerId,
        total,
        items: [],
        shippingPhoneNumber,
        shippingAddress,
        customerName,
        status: "pending", // Initial order status
        // createdBy: req.user.id, // Track admin who created the order
      });
      await orderRepository.save(order);

      if (variationId && !variation) {
        return ;
      }

      // Create the order item
      const orderItem = orderItemRepository.create({
        order,
        product,
        variation: variation || undefined,
        quantity,
        price: variation?.price || product.price,
      });
      await orderItemRepository.save(orderItem);
    });

    return ResUtil.success({
      res,
      message: "Order created successfully by admin",
    });
  } catch (error: any) {
    logger.error(`Error in Admin Create Order: ${error}`);
    return ResUtil.internalError({
      res,
      message: error.message || "Error processing admin order creation",
      data: error,
    });
  }
};
