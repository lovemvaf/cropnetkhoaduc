import { prisma } from '../../database/client';
import { 
  isDatabaseError, MOCK_ORDERS, MOCK_PRODUCTS, 
  updateMockOrderShipmentDetails, addMockOrderShipmentMilestone,
  disputeMockOrder, resolveMockOrderDispute, assignMockOrderItemBatch
} from '../../database/dbFallback';

export const createOrderTransaction = async (customerId: string, data: {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  items: { productId: string; quantity: number }[];
}) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const orderItemsData = [];
      let totalAmount = 0;

      for (const item of data.items) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (!prod) {
          throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại`);
        }
        
        const stockNum = Number(prod.stock);
        if (stockNum < item.quantity) {
          throw new Error(`Sản phẩm ${prod.name} không đủ số lượng tồn kho (Còn lại: ${stockNum} ${prod.unit})`);
        }

        // Decrement product stock inside transaction
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: stockNum - item.quantity }
        });

        const itemPrice = Number(prod.price);
        totalAmount += itemPrice * item.quantity;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: itemPrice
        });
      }

      return tx.order.create({
        data: {
          customerId,
          totalAmount,
          shippingAddress: data.shippingAddress,
          receiverName: data.receiverName,
          receiverPhone: data.receiverPhone,
          status: 'PENDING',
          orderItems: {
            create: orderItemsData
          },
          payment: {
            create: {
              paymentMethod: data.paymentMethod,
              paymentStatus: 'PENDING',
              amount: totalAmount
            }
          },
          shipment: {
            create: {
              shipStatus: 'PICKING'
            }
          }
        },
        include: {
          orderItems: { include: { product: true } },
          payment: true,
          shipment: true
        }
      });
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const orderItems = data.items.map((item, index) => {
        const prod = MOCK_PRODUCTS.find(p => p.id === item.productId) || MOCK_PRODUCTS[0];
        return {
          id: `mock-item-${Date.now()}-${index}`,
          productId: item.productId,
          quantity: item.quantity,
          price: Number(prod.price),
          product: prod
        };
      });

      const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const newOrder = {
        id: `mock-order-${Date.now()}`,
        customerId,
        totalAmount,
        shippingAddress: data.shippingAddress,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        status: 'PENDING',
        createdAt: new Date(),
        orderItems,
        payment: {
          id: `mock-pay-${Date.now()}`,
          paymentMethod: data.paymentMethod,
          paymentStatus: 'PENDING',
          amount: totalAmount
        },
        shipment: {
          id: `mock-ship-${Date.now()}`,
          shipStatus: 'PICKING'
        }
      };

      MOCK_ORDERS.unshift(newOrder);
      return newOrder;
    }
    throw error;
  }
};

export const findOrders = async (whereClause: any) => {
  try {
    return await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: { include: { product: true } },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return MOCK_ORDERS; // Service will handle filtering of mocks
    }
    throw error;
  }
};

export const findOrderById = async (id: string) => {
  try {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { product: true, batch: true } },
        payment: true,
        shipment: true
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return MOCK_ORDERS.find(o => o.id === id) || null;
    }
    throw error;
  }
};

export const updateOrderStatusInDb = async (id: string, status: string, shipStatus: string) => {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { shipment: true }
    });

    const isCod = order.id.startsWith('mock-') 
      ? MOCK_ORDERS.find(o => o.id === id)?.payment?.paymentMethod === 'COD'
      : (await prisma.payment.findUnique({ where: { orderId: id } }))?.paymentMethod === 'COD';

    // If logistics delivered, and payment method is COD, sync payment status to COMPLETED
    const paymentUpdate = (status === 'DELIVERED' && isCod) 
      ? { paymentStatus: 'COMPLETED', paidAt: new Date() } 
      : {};

    if (status === 'DELIVERED' && isCod && !order.id.startsWith('mock-')) {
      await prisma.payment.update({
        where: { orderId: id },
        data: paymentUpdate
      });
    }

    await prisma.shipment.update({
      where: { orderId: id },
      data: { shipStatus, updatedAt: new Date() }
    });

    return order;
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const orderIndex = MOCK_ORDERS.findIndex(o => o.id === id);
      if (orderIndex === -1) return null;
      
      const updatedOrder = {
        ...MOCK_ORDERS[orderIndex],
        status
      };
      if (updatedOrder.shipment) {
        updatedOrder.shipment.shipStatus = shipStatus;
      }
      
      if (status === 'DELIVERED' && updatedOrder.payment && updatedOrder.payment.paymentMethod === 'COD') {
        updatedOrder.payment.paymentStatus = 'COMPLETED';
        updatedOrder.payment.paidAt = new Date();
      }
      
      MOCK_ORDERS[orderIndex] = updatedOrder;
      return updatedOrder;
    }
    throw error;
  }
};

export const assignOrderItemBatchInDb = async (orderId: string, orderItemId: string, batchId: string) => {
  try {
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { batchId }
    });

    const orderItems = await prisma.orderItem.findMany({
      where: { orderId }
    });

    const allAssigned = orderItems.every(item => !!item.batchId);
    let updatedOrder = null;
    if (allAssigned) {
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
        include: { orderItems: { include: { product: true } }, payment: true, shipment: true }
      });
    } else {
      updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: { include: { product: true } }, payment: true, shipment: true }
      });
    }

    return updatedOrder;
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return assignMockOrderItemBatch(orderId, orderItemId, batchId);
    }
    throw error;
  }
};

export const updateShipmentLogisticsInDb = async (orderId: string, details: { shipperName: string; shipperPhone: string; trackingCode: string; estimatedDelivery: Date }) => {
  try {
    const defaultMilestone = {
      title: 'Đã xuất kho & giao shipper',
      description: `Đơn hàng đã bàn giao cho nhân viên giao hàng ${details.shipperName} (${details.shipperPhone}). Vui lòng giữ liên lạc.`,
      location: 'Kho tổng CropNet',
      timestamp: new Date()
    };

    await prisma.shipment.update({
      where: { orderId },
      data: {
        shipperName: details.shipperName,
        shipperPhone: details.shipperPhone,
        trackingCode: details.trackingCode,
        shipStatus: 'IN_TRANSIT',
        estimatedDelivery: details.estimatedDelivery,
        trackingHistory: [defaultMilestone],
        updatedAt: new Date()
      }
    });

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'SHIPPING' },
      include: { orderItems: { include: { product: true } }, payment: true, shipment: true }
    });

    return order;
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return updateMockOrderShipmentDetails(orderId, details);
    }
    throw error;
  }
};

export const addShipmentMilestoneInDb = async (orderId: string, milestone: { title: string; description: string; location: string }) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { orderId }
    });
    if (!shipment) throw new Error('Không tìm thấy thông tin vận chuyển');

    const history = (shipment.trackingHistory as any[]) || [];
    history.push({
      ...milestone,
      timestamp: new Date()
    });

    await prisma.shipment.update({
      where: { orderId },
      data: {
        trackingHistory: history,
        updatedAt: new Date()
      }
    });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: true } }, payment: true, shipment: true }
    });

    return order;
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return addMockOrderShipmentMilestone(orderId, milestone);
    }
    throw error;
  }
};

export const disputeOrderInDb = async (orderId: string, reason: string) => {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DISPUTED',
        disputeReason: reason
      },
      include: { orderItems: { include: { product: true } }, payment: true, shipment: true }
    });
    return order;
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return disputeMockOrder(orderId, reason);
    }
    throw error;
  }
};

export const resolveOrderDisputeInDb = async (orderId: string, resolution: 'REFUNDED' | 'DELIVERED') => {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: resolution,
        ...(resolution === 'REFUNDED' ? {} : { disputeReason: null })
      },
      include: { orderItems: { include: { product: true } }, payment: true, shipment: true }
    });

    if (resolution === 'REFUNDED') {
      await prisma.payment.update({
        where: { orderId },
        data: { paymentStatus: 'REFUNDED' }
      });
      
      // Restore stocks
      for (const item of order.orderItems) {
        const prod = await prisma.product.findUnique({ where: { id: item.productId } });
        if (prod) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: Number(prod.stock) + Number(item.quantity) }
          });
        }
      }
    }

    return order;
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return resolveMockOrderDispute(orderId, resolution);
    }
    throw error;
  }
};
