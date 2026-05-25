import * as paymentRepository from './payment.repository';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

export const createMomoPayment = async (orderId: string, user: any) => {
  const order = await paymentRepository.findOrderById(orderId);
  if (!order) {
    throw new NotFoundError('Đơn hàng không tồn tại');
  }

  // Ensure owner is the customer who placed the order, or an admin
  if (user.role !== 'ADMIN' && order.customerId !== user.id) {
    throw new ForbiddenError('Bạn không có quyền thanh toán cho đơn hàng này');
  }

  // Mock Momo Sandbox payment URL redirection to local Next.js payment portal
  const mockPayUrl = `http://localhost:3000/checkout/momo-portal?orderId=${orderId}&amount=${order.totalAmount}`;
  
  return { payUrl: mockPayUrl };
};

export const processMomoCallback = async (orderId: string, resultCode: any, transId: string, user: any) => {
  const order = await paymentRepository.findOrderById(orderId);
  if (!order) {
    throw new NotFoundError('Đơn hàng không tồn tại');
  }

  // Enforce same customer ownership on webhook callback simulated by client
  if (user.role !== 'ADMIN' && order.customerId !== user.id) {
    throw new ForbiddenError('Bạn không có quyền thực hiện giao dịch này');
  }

  // resultCode = 0 is success in Momo API
  if (resultCode === 0 || resultCode === '0') {
    const transactionId = transId || `MOCK-TRANS-${Date.now()}`;
    await paymentRepository.updatePaymentAndOrderStatus(orderId, transactionId);
  }
};
