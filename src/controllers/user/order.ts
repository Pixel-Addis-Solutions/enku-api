import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { Order } from '../../entities/order';
import { OrderItem } from '../../entities/order-item';
import { Cart } from '../../entities/cart';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';

export const createOrder = async (req: any, res: Response) => {
  const customerId = req.user?.id;

  if (!customerId) {
    return ResUtil.unAuthorized({ res, message: 'Customer not logged in' });
  }

  try {
    const orderRepository = getRepository(Order);
    const orderItemRepository = getRepository(OrderItem);
    const cartRepository = getRepository(Cart);

    // Retrieve the cart for the logged-in customer
    const cart = await cartRepository.findOne({
      where: { customerId },
      relations: ['items', 'items.product', 'items.variation'],
    });

    if (!cart || cart.items.length === 0) {
      return ResUtil.badRequest({ res, message: 'Cart is empty' });
    }

    // Calculate total order amount
    const total = cart.items.reduce((acc:any, item:any) => acc + item.product.price * item.quantity, 0);

    // Create new order
    const order = orderRepository.create({
      customer: { id: customerId },
      total,
      items: [],
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

    // Clear the cart
    await cartRepository.remove(cart);

    return ResUtil.success({
      res,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    logger.error(`Error creating order: ${error}`);
    return ResUtil.internalError({ res, message: 'Error creating order', data: error });
  }
};

export const getOrders = async (req: any, res: Response) => {
  const customerId = req.customer?.id;

  if (!customerId) {
    return ResUtil.unAuthorized({ res, message: 'Customer not logged in' });
  }

  try {
    const orderRepository = getRepository(Order);

    const orders = await orderRepository.find({
      where: { customer: { id: customerId } },
      relations: ['items', 'items.product', 'items.variation'],
    });

    return ResUtil.success({
      res,
      message: 'Orders fetched successfully',
      data: orders,
    });
  } catch (error) {
    logger.error(`Error fetching orders: ${error}`);
    return ResUtil.internalError({ res, message: 'Error fetching orders', data: error });
  }
};

export const getOrderById = async (req: any, res: Response) => {
  const customerId = req.customer?.id;
  const { orderId } = req.params;

  if (!customerId) {
    return ResUtil.unAuthorized({ res, message: 'Customer not logged in' });
  }

  try {
    const orderRepository = getRepository(Order);

    const order = await orderRepository.findOne({
      where: { id: orderId, customer: { id: customerId } },
      relations: ['items', 'items.product', 'items.variation'],
    });

    if (!order) {
      return ResUtil.notFound({ res, message: 'Order not found' });
    }

    return ResUtil.success({
      res,
      message: 'Order fetched successfully',
      data: order,
    });
  } catch (error) {
    logger.error(`Error fetching order: ${error}`);
    return ResUtil.internalError({ res, message: 'Error fetching order', data: error });
  }
};
