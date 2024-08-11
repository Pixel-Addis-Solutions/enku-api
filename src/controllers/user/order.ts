import { Request, Response } from "express";
import { getRepository, AppDataSource } from "../../data-source";
import { Order } from "../../entities/order";
import { OrderItem } from "../../entities/order-item";
import { Cart } from "../../entities/cart";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { Customer } from "../../entities/customer";
import { CartItem } from "../../entities/cart-item";
import { Product } from "../../entities/product";
import { ProductVariation } from "../../entities/product-variation";

export const createOrder = async (req: Request | any, res: Response) => {
  let customerId = req.user?.id;
  const sessionId = req.headers["sessionid"] as string;
  const { shippingPhoneNumber, shippingAddress, customerName, agreed } =
    req.body;

  const entityManager = AppDataSource.manager;

  try {
    await entityManager.transaction(async (transactionalEntityManager) => {
      const orderRepository = transactionalEntityManager.getRepository(Order);
      const orderItemRepository =
        transactionalEntityManager.getRepository(OrderItem);
      const cartRepository = transactionalEntityManager.getRepository(Cart);
      const customerRepository =
        transactionalEntityManager.getRepository(Customer);
      const cartItemRepository =
        transactionalEntityManager.getRepository(CartItem);

      let cart;

      // Retrieve the cart for the logged-in customer
      if (customerId) {
        cart = await cartRepository.findOne({
          where: { customerId },
          relations: ["items", "items.product", "items.variation"],
        });
      } else if (sessionId) {
        if (agreed) {
          let customer = await customerRepository.findOneBy({
            phoneNumber: shippingPhoneNumber,
          });

          if (customer) {
            customerId = customer?.id;
          } else {
            customer = customerRepository.create({
              phoneNumber: shippingPhoneNumber,
              fullName: customerName,
            });
            await customerRepository.save(customer);
            customerId = customer.id;
          }
        } else {
          let customer = await customerRepository.findOneBy({
            phoneNumber: shippingPhoneNumber,
          });
          if (customer) {
            customerId = customer?.id;
          }
        }
        cart = await cartRepository.findOne({
          where: { sessionId },
          relations: ["items", "items.product", "items.variation"],
        });
      }

      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      // Calculate total order amount
      const total = cart.items.reduce(
        (acc: any, item: any) => acc + item.product.price * item.quantity,
        0
      );

      // Create new order
      const order = orderRepository.create({
        customer: { id: customerId },
        total,
        items: [],
        shippingPhoneNumber,
        shippingAddress,
        customerName,
      });
      await orderRepository.save(order);

      // Create order items
      for (const cartItem of cart.items) {
        const orderItem = orderItemRepository.create({
          order,
          product: cartItem.product,
          variation: cartItem.variation,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
        });
        await orderItemRepository.save(orderItem);
      }

      // Remove cart items first
      await cartItemRepository.remove(cart.items);

      // Clear the cart
      await cartRepository.remove(cart);
    });

    return ResUtil.success({
      res,
      message: "Order created successfully",
    });
  } catch (error: any) {
    logger.error(`Error creating order: ${error}`);
    return ResUtil.internalError({
      res,
      message: error.message || "Error creating order",
      data: error,
    });
  }
};

export const getOrders = async (req: any, res: Response) => {
  const customerId = req.customer?.id;

  if (!customerId) {
    return ResUtil.unAuthorized({ res, message: "Customer not logged in" });
  }

  try {
    const orderRepository = getRepository(Order);
    
    const orders = await orderRepository.find({
      where: { customer: { id: customerId } },
      relations: ["customer", "items", "items.product", "items.variation"],
    });

    return ResUtil.success({
      res,
      message: "Orders fetched successfully",
      data: orders,
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

export const getOrderById = async (req: any, res: Response) => {
  const customerId = req.customer?.id;
  const { orderId } = req.params;

  if (!customerId) {
    return ResUtil.unAuthorized({ res, message: "Customer not logged in" });
  }

  try {
    const orderRepository = getRepository(Order);

    const order = await orderRepository.findOne({
      where: { id: orderId, customer: { id: customerId } },
      relations: ["items", "items.product", "items.variation"],
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

export const buyNow = async (req: Request | any, res: Response) => {
  let customerId = req.user?.id;
  const sessionId = req.headers["sessionid"] as string;
  const {
    productId,
    shippingPhoneNumber,
    shippingAddress,
    customerName,
    agreed,
    quantity = 1,
    variationId, // New parameter for the product variation
  } = req.body;

  const entityManager = AppDataSource.manager;

  try {
    await entityManager.transaction(async (transactionalEntityManager) => {
      const productRepository = transactionalEntityManager.getRepository(Product);
      const orderRepository = transactionalEntityManager.getRepository(Order);
      const orderItemRepository = transactionalEntityManager.getRepository(OrderItem);
      const customerRepository = transactionalEntityManager.getRepository(Customer);
      const variationRepository = transactionalEntityManager.getRepository(ProductVariation);

      // Retrieve the product
      const product = await productRepository.findOne({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

          // Retrieve the variation
          const variation = await variationRepository.findOne({
            where: { id: variationId, product: { id: productId } },
          });
    
          if (!variation) {
            throw new Error("Variation not found");
          }
    
      // Handle customer identification
      if (!customerId && sessionId) {
        let customer = await customerRepository.findOneBy({
          phoneNumber: shippingPhoneNumber,
        });

        if (customer) {
          customerId = customer.id;
        } else if (agreed) {
          // Create a new customer if agreed to register
          customer = customerRepository.create({
            phoneNumber: shippingPhoneNumber,
            fullName: customerName,
          });
          await customerRepository.save(customer);
          customerId = customer.id;
        }
      }

      // Calculate total price
      const total = product.price * quantity;

      // Create the order
      const order = orderRepository.create({
        customer:customerId ,
        total,
        items: [],
        shippingPhoneNumber,
        shippingAddress,
        customerName,
        status: "pending", // Initial order status
      });
      await orderRepository.save(order);

      // Create the order item
      const orderItem = orderItemRepository.create({
        order,
        product,
        variation,
        quantity,
        price: variation.price,
      });
      await orderItemRepository.save(orderItem);
    });

    return ResUtil.success({
      res,
      message: "Order placed successfully",
    });
  } catch (error: any) {
    logger.error(`Error in Buy Now: ${error}`);
    return ResUtil.internalError({
      res,
      message: error.message || "Error processing Buy Now",
      data: error,
    });
  }
};