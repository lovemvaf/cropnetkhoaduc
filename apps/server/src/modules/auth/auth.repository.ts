import { prisma } from '../../database/client';
import { isDatabaseError, mockUsersList } from '../../database/dbFallback';

export const findUserByEmail = async (email: string) => {
  try {
    return await prisma.user.findUnique({
      where: { email },
      include: { role: true, supplier: true }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const match = mockUsersList.find(u => u.email === email);
      if (!match) return null;
      return {
        id: match.id,
        email: match.email,
        passwordHash: match.passwordHash || '$2a$10$QR625Pf5HPAOlzTeR06a/eVZAFOLeTm.Y9aR7varPdbtJhH/vBxCy', // mock hashed password '123456'
        fullName: match.fullName,
        role: { name: match.role },
        status: match.status,
        isEmailVerified: match.isEmailVerified ?? false,
        verificationToken: match.verificationToken ?? null,
        resetPasswordToken: match.resetPasswordToken ?? null,
        resetPasswordExpires: match.resetPasswordExpires ?? null,
        supplier: match.supplierId ? { id: match.supplierId, status: match.supplierStatus } : null
      } as any;
    }
    throw error;
  }
};

export const findUserById = async (id: string) => {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: { role: true, supplier: true }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const match = mockUsersList.find(u => u.id === id);
      if (!match) return null;
      return {
        id: match.id,
        email: match.email,
        fullName: match.fullName,
        passwordHash: match.passwordHash || '$2a$10$QR625Pf5HPAOlzTeR06a/eVZAFOLeTm.Y9aR7varPdbtJhH/vBxCy',
        role: { name: match.role },
        status: match.status,
        isEmailVerified: match.isEmailVerified ?? false,
        verificationToken: match.verificationToken ?? null,
        resetPasswordToken: match.resetPasswordToken ?? null,
        resetPasswordExpires: match.resetPasswordExpires ?? null,
        supplier: match.supplierId ? { id: match.supplierId, status: match.supplierStatus } : null
      } as any;
    }
    throw error;
  }
};

export const createUser = async (data: {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  roleName: string;
  farmName?: string;
  address?: string;
}) => {
  try {
    // Ensure role exists or create it
    let role = await prisma.role.findUnique({ where: { name: data.roleName } });
    if (!role) {
      role = await prisma.role.create({ data: { name: data.roleName } });
    }

    const userStatus = (data.roleName === 'LOGISTICS' || data.roleName === 'INSPECTOR') ? 'PENDING' : 'ACTIVE';
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        roleId: role.id,
        status: userStatus
      },
      include: { role: true }
    });

    if (data.roleName === 'FARMER' && data.farmName && data.address) {
      await prisma.supplier.create({
        data: {
          userId: user.id,
          farmName: data.farmName,
          address: data.address,
          status: 'PENDING'
        }
      });
    }

    return user;
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const userStatus = (data.roleName === 'LOGISTICS' || data.roleName === 'INSPECTOR') ? 'PENDING' : 'ACTIVE';
      const mockUser = {
        id: `mock-user-${Date.now()}`,
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phone: data.phone || null,
        status: userStatus,
        role: data.roleName,
        isEmailVerified: false,
        verificationToken: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        supplierId: data.roleName === 'FARMER' ? `mock-supplier-${Date.now()}` : null,
        supplierStatus: data.roleName === 'FARMER' ? 'PENDING' : null
      };
      mockUsersList.push(mockUser);
      return {
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        phone: mockUser.phone,
        status: mockUser.status,
        role: { name: mockUser.role }
      } as any;
    }
    throw error;
  }
};

export const updateUserRefreshToken = async (userId: string, refreshToken: string | null) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return; // Safe to ignore in fallback mock
    }
    throw error;
  }
};

export const findUserByVerificationToken = async (token: string) => {
  try {
    return await prisma.user.findFirst({
      where: { verificationToken: token },
      include: { role: true, supplier: true }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const match = mockUsersList.find(u => u.verificationToken === token);
      if (!match) return null;
      return {
        id: match.id,
        email: match.email,
        passwordHash: match.passwordHash || '$2a$10$QR625Pf5HPAOlzTeR06a/eVZAFOLeTm.Y9aR7varPdbtJhH/vBxCy',
        fullName: match.fullName,
        role: { name: match.role },
        status: match.status,
        isEmailVerified: match.isEmailVerified ?? false,
        verificationToken: match.verificationToken,
        supplier: match.supplierId ? { id: match.supplierId, status: match.supplierStatus } : null
      } as any;
    }
    throw error;
  }
};

export const findUserByResetToken = async (token: string) => {
  try {
    return await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      },
      include: { role: true, supplier: true }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const match = mockUsersList.find(u => {
        if (u.resetPasswordToken !== token) return false;
        if (!u.resetPasswordExpires) return false;
        return new Date(u.resetPasswordExpires) > new Date();
      });
      if (!match) return null;
      return {
        id: match.id,
        email: match.email,
        passwordHash: match.passwordHash || '$2a$10$QR625Pf5HPAOlzTeR06a/eVZAFOLeTm.Y9aR7varPdbtJhH/vBxCy',
        fullName: match.fullName,
        role: { name: match.role },
        status: match.status,
        isEmailVerified: match.isEmailVerified ?? false,
        resetPasswordToken: match.resetPasswordToken,
        resetPasswordExpires: match.resetPasswordExpires,
        supplier: match.supplierId ? { id: match.supplierId, status: match.supplierStatus } : null
      } as any;
    }
    throw error;
  }
};

export const verifyUserEmail = async (userId: string) => {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        verificationToken: null
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const index = mockUsersList.findIndex(u => u.id === userId);
      if (index !== -1) {
        mockUsersList[index].isEmailVerified = true;
        mockUsersList[index].verificationToken = null;
      }
      return { id: userId, isEmailVerified: true } as any;
    }
    throw error;
  }
};

export const setUserResetPasswordToken = async (email: string, token: string, expires: Date) => {
  try {
    return await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const index = mockUsersList.findIndex(u => u.email === email);
      if (index !== -1) {
        mockUsersList[index].resetPasswordToken = token;
        mockUsersList[index].resetPasswordExpires = expires;
      }
      return { email, resetPasswordToken: token } as any;
    }
    throw error;
  }
};

export const updateUserPassword = async (userId: string, passwordHash: string) => {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const index = mockUsersList.findIndex(u => u.id === userId);
      if (index !== -1) {
        mockUsersList[index].passwordHash = passwordHash;
        mockUsersList[index].resetPasswordToken = null;
        mockUsersList[index].resetPasswordExpires = null;
      }
      return { id: userId } as any;
    }
    throw error;
  }
};

export const setUserVerificationToken = async (email: string, token: string) => {
  try {
    return await prisma.user.update({
      where: { email },
      data: {
        verificationToken: token
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const index = mockUsersList.findIndex(u => u.email === email);
      if (index !== -1) {
        mockUsersList[index].verificationToken = token;
      }
      return { email, verificationToken: token } as any;
    }
    throw error;
  }
};
