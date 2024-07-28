import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { Order } from '../../entities/order';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';


export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orderRepository = getRepository(Order);
    const orders = await orderRepository.find({
      relations: ['customer', 'items', 'items.product', 'items.variation'],
    });

    return ResUtil.success({
      res,
      message: 'Orders fetched successfully',
      data: orders,
    });
  } catch (error) {
    logger.error(`Error fetching orders: ${error}`);
    return ResUtil.internalError({
      res,
      message: 'Error fetching orders',
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
      relations: ['customer', 'items', 'items.product', 'items.variation'],
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
    return ResUtil.internalError({
      res,
      message: 'Error fetching order',
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
      return ResUtil.notFound({ res, message: 'Order not found' });
    }

    order.status = status;
    await orderRepository.save(order);

    return ResUtil.success({
      res,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    logger.error(`Error updating order status: ${error}`);
    return ResUtil.internalError({
      res,
      message: 'Error updating order status',
      data: error,
    });
  }
};

