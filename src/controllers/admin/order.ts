import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { Order } from '../../entities/order';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orderRepository = getRepository(Order);
    const orders = await orderRepository.find({ relations: ['customer', 'items', 'status'] });

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

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { orderId, status } = req.body;

  try {
    const orderRepository = getRepository(Order);

    const order = await orderRepository.findOneBy({ id: orderId });
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
