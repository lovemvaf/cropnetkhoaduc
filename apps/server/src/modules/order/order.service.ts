import * as orderRepository from './order.repository';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

export const placeOrder = async (customerId: string, data: {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  items: { productId: string; quantity: number }[];
}) => {
  return await orderRepository.createOrderTransaction(customerId, data);
};

export const getUserOrders = async (user: { id: string; role: string }) => {
  let whereClause: any = {};
  if (user.role === 'ADMIN') {
    whereClause = {};
  } else if (user.role === 'LOGISTICS') {
    whereClause = {
      status: { in: ['CONFIRMED', 'SHIPPING', 'DELIVERED', 'PENDING'] }
    };
  } else if (user.role === 'FARMER') {
    whereClause = {
      orderItems: { some: { product: { supplier: { userId: user.id } } } }
    };
  } else {
    whereClause = {
      customerId: user.id
    };
  }

  const list = await orderRepository.findOrders(whereClause);

  // If fallback is active, apply emulated filtering to the array
  if (list && list.length > 0 && list[0].id.startsWith('mock-')) {
    if (user.role === 'ADMIN') {
      return list;
    } else if (user.role === 'LOGISTICS') {
      return list.filter(o => ['CONFIRMED', 'SHIPPING', 'DELIVERED', 'PENDING'].includes(o.status));
    } else if (user.role === 'FARMER') {
      return list.filter(o => 
        o.orderItems.some((item: any) => item.product?.supplier?.id === 'mock-supplier-id')
      );
    } else {
      return list.filter(o => o.customerId === user.id);
    }
  }

  return list;
};

export const getOrderDetails = async (id: string, user: any) => {
  const order = await orderRepository.findOrderById(id);
  if (!order) {
    throw new NotFoundError('Không tìm thấy đơn hàng tương ứng');
  }

  // Access check
  if (user.role === 'ADMIN' || user.role === 'LOGISTICS') {
    return order;
  } else if (user.role === 'CUSTOMER') {
    if (order.customerId !== user.id) {
      throw new ForbiddenError('Bạn không có quyền truy cập đơn hàng này');
    }
  } else if (user.role === 'FARMER') {
    const hasFarmerProduct = order.orderItems.some((item: any) => {
      const prodSupplierId = item.product?.supplierId || item.product?.supplier?.id;
      return prodSupplierId === user.supplierId || item.product?.supplier?.userId === user.id;
    });
    if (!hasFarmerProduct) {
      throw new ForbiddenError('Bạn không có quyền truy cập đơn hàng này');
    }
  } else {
    throw new ForbiddenError('Bạn không có quyền truy cập đơn hàng này');
  }

  return order;
};

export const updateOrderStatus = async (id: string, status: string, user: any) => {
  const order = await orderRepository.findOrderById(id);
  if (!order) {
    throw new NotFoundError('Không tìm thấy đơn hàng tương ứng');
  }

  // Verify farmer only updates orders containing their products
  if (user.role === 'FARMER') {
    const hasFarmerProduct = order.orderItems.some((item: any) => {
      const prodSupplierId = item.product?.supplierId || item.product?.supplier?.id;
      return prodSupplierId === user.supplierId || item.product?.supplier?.userId === user.id;
    });
    if (!hasFarmerProduct) {
      throw new ForbiddenError('Bạn không có quyền cập nhật trạng thái cho đơn hàng này');
    }
  }

  let shipStatus = 'PICKING';
  if (status === 'SHIPPING') shipStatus = 'IN_TRANSIT';
  if (status === 'DELIVERED') shipStatus = 'DELIVERED';

  const updatedOrder = await orderRepository.updateOrderStatusInDb(id, status, shipStatus);
  if (!updatedOrder) {
    throw new NotFoundError('Không tìm thấy đơn hàng tương ứng');
  }
  return updatedOrder;
};

export const confirmSupplierOrderItem = async (orderId: string, orderItemId: string, batchId: string, user: any) => {
  const order = await orderRepository.findOrderById(orderId);
  if (!order) {
    throw new NotFoundError('Không tìm thấy đơn hàng tương ứng');
  }

  const item = order.orderItems.find((i: any) => i.id === orderItemId);
  if (!item) {
    throw new NotFoundError('Không tìm thấy sản phẩm cần gán trong đơn hàng này');
  }

  // Verify that the farmer owns this order item
  const prodSupplierId = item.product?.supplierId || item.product?.supplier?.id;
  if (prodSupplierId !== user.supplierId && item.product?.supplier?.userId !== user.id) {
    throw new ForbiddenError('Bạn không có quyền xác nhận sản phẩm của nhà vườn khác');
  }

  const updatedOrder = await orderRepository.assignOrderItemBatchInDb(orderId, orderItemId, batchId);
  if (!updatedOrder) {
    throw new NotFoundError('Không tìm thấy đơn hàng hoặc sản phẩm cần gán');
  }
  return updatedOrder;
};

export const dispatchShipment = async (orderId: string, details: { shipperName: string; shipperPhone: string; trackingCode: string; estimatedDelivery: string }) => {
  const dateVal = details.estimatedDelivery ? new Date(details.estimatedDelivery) : new Date(Date.now() + 86400 * 2000);
  const order = await orderRepository.updateShipmentLogisticsInDb(orderId, {
    ...details,
    estimatedDelivery: dateVal
  });
  if (!order) {
    throw new NotFoundError('Không thể tạo vận đơn cho đơn hàng này');
  }
  return order;
};

export const addShipmentMilestone = async (orderId: string, milestone: { title: string; description: string; location: string }) => {
  const order = await orderRepository.addShipmentMilestoneInDb(orderId, milestone);
  if (!order) {
    throw new NotFoundError('Không tìm thấy đơn hàng để cập nhật lộ trình');
  }
  return order;
};

export const disputeOrder = async (orderId: string, reason: string, user: any) => {
  const order = await orderRepository.findOrderById(orderId);
  if (!order) {
    throw new NotFoundError('Không thể tìm thấy đơn hàng này');
  }

  if (order.customerId !== user.id) {
    throw new ForbiddenError('Bạn không có quyền khiếu nại đơn hàng này');
  }

  const updatedOrder = await orderRepository.disputeOrderInDb(orderId, reason);
  if (!updatedOrder) {
    throw new NotFoundError('Không thể tạo khiếu nại cho đơn hàng này');
  }
  return updatedOrder;
};

export const resolveDispute = async (orderId: string, resolution: 'REFUNDED' | 'DELIVERED') => {
  const order = await orderRepository.resolveOrderDisputeInDb(orderId, resolution);
  if (!order) {
    throw new NotFoundError('Không thể xử lý khiếu nại cho đơn hàng này');
  }
  return order;
};

