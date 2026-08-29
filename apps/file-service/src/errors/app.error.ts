export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required.") {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied.") {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "File not found") {
    super(404, message);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = "File is too large") {
    super(413, message);
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(message = "Unsupported media type") {
    super(415, message);
  }
}
