export class AppError extends Error {
  constructor(public message: string, public status: number = 500) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Yêu cầu không hợp lệ') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Phiên làm việc hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Bạn không có quyền thực hiện chức năng này') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Không tìm thấy dữ liệu yêu cầu') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Dữ liệu đã tồn tại hoặc có xung đột xảy ra') {
    super(message, 409);
  }
}
