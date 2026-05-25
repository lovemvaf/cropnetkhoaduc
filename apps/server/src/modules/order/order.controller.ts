import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as orderService from './order.service';
import { UnauthorizedError } from '../../utils/errors';

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const order = await orderService.placeOrder(req.user.id, req.body);
    
    // Broadcast message via Socket.io
    try {
      const io = req.app.get('io');
      io.emit('new_order', { orderId: order.id, totalAmount: order.totalAmount });
    } catch (ioErr) {
      // Safe to ignore if socket is not bound
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const list = await orderService.getUserOrders({ id: req.user.id, role: req.user.role });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const order = await orderService.getOrderDetails(req.params.id, req.user);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status, req.user);

    // Broadcast order update via realtime socket
    try {
      const io = req.app.get('io');
      io.to(order.id).emit('order_status_updated', { orderId: order.id, status });
    } catch (ioErr) {
      // Safe to ignore if socket is not bound
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const confirmSupplierOrderItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { orderItemId, batchId } = req.body;
    const order = await orderService.confirmSupplierOrderItem(req.params.id, orderItemId, batchId, req.user);
    
    try {
      const io = req.app.get('io');
      io.to(order.id).emit('order_status_updated', { orderId: order.id, status: order.status });
    } catch (ioErr) {}

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const createOrderShipment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { shipperName, shipperPhone, trackingCode, estimatedDelivery } = req.body;
    const order = await orderService.dispatchShipment(req.params.id, {
      shipperName,
      shipperPhone,
      trackingCode,
      estimatedDelivery
    });

    try {
      const io = req.app.get('io');
      io.to(order.id).emit('order_status_updated', { orderId: order.id, status: 'SHIPPING' });
    } catch (ioErr) {}

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const addShipmentMilestone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, location } = req.body;
    const order = await orderService.addShipmentMilestone(req.params.id, { title, description, location });

    try {
      const io = req.app.get('io');
      io.to(order.id).emit('shipment_milestone_added', { orderId: order.id, milestone: { title, description, location, timestamp: new Date() } });
    } catch (ioErr) {}

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const fileOrderDispute = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { reason } = req.body;
    const order = await orderService.disputeOrder(req.params.id, reason, req.user);

    try {
      const io = req.app.get('io');
      io.to(order.id).emit('order_status_updated', { orderId: order.id, status: 'DISPUTED' });
    } catch (ioErr) {}

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const adminResolveDispute = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { resolution } = req.body;
    const order = await orderService.resolveDispute(req.params.id, resolution);

    try {
      const io = req.app.get('io');
      io.to(order.id).emit('order_status_updated', { orderId: order.id, status: resolution });
    } catch (ioErr) {}

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
