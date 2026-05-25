import * as adminRepository from './admin.repository';
import { NotFoundError } from '../../utils/errors';

export const getAllUsers = async () => {
  const users = await adminRepository.findAllUsers();
  return users.map(u => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    role: u.role.name,
    status: u.status,
    supplier: u.supplier
  }));
};

export const approveUser = async (id: string) => {
  const user = await adminRepository.findUserById(id);
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }

  if (user.role.name === 'FARMER') {
    await adminRepository.updateSupplierStatus(id, 'APPROVED');
  }

  await adminRepository.updateUserStatus(id, 'ACTIVE');
};

export const blockUser = async (id: string) => {
  const user = await adminRepository.findUserById(id);
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }
  await adminRepository.updateUserStatus(id, 'BLOCKED');
};

export const unblockUser = async (id: string) => {
  const user = await adminRepository.findUserById(id);
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }
  await adminRepository.updateUserStatus(id, 'ACTIVE');
};

export const getAllProducts = async () => {
  return await adminRepository.findAllProducts();
};

export const updateProductStatus = async (id: string, status: string) => {
  return await adminRepository.updateProductStatus(id, status);
};

export const deleteProduct = async (id: string) => {
  return await adminRepository.deleteProduct(id);
};

export const getAllOrders = async () => {
  return await adminRepository.findAllOrders();
};

export const cancelOrder = async (id: string) => {
  return await adminRepository.updateOrderStatus(id, 'CANCELLED');
};

export const getAllCertificates = async () => {
  return await adminRepository.findAllCertificates();
};

export const approveCertificate = async (id: string) => {
  return await adminRepository.updateCertificationStatus(id, 'APPROVED');
};

export const rejectCertificate = async (id: string) => {
  return await adminRepository.updateCertificationStatus(id, 'REJECTED');
};
