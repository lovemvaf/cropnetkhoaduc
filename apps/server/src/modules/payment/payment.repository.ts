import { prisma } from '../../database/client';
import { isDatabaseError, MOCK_ORDERS } from '../../database/dbFallback';

export const findOrderById = async (orderId: string) => {
  try {
    return await prisma.order.findUnique({ where: { id: orderId } });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return MOCK_ORDERS.find(o => o.id === orderId) || null;
    }
    throw error;
  }
};

export const updatePaymentAndOrderStatus = async (orderId: string, transId: string) => {
  try {
    await prisma.payment.update({
      where: { orderId },
      data: {
        paymentStatus: 'COMPLETED',
        transactionId: transId,
        paidAt: new Date()
      }
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const orderIndex = MOCK_ORDERS.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        MOCK_ORDERS[orderIndex].status = 'CONFIRMED';
        if (MOCK_ORDERS[orderIndex].payment) {
          MOCK_ORDERS[orderIndex].payment.paymentStatus = 'COMPLETED';
          MOCK_ORDERS[orderIndex].payment.transactionId = transId;
          MOCK_ORDERS[orderIndex].payment.paidAt = new Date();
        }
      }
      return;
    }
    throw error;
  }
};
