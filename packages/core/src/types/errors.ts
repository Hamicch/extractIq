/**
 * Base error class for domain errors
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Entity not found error
 */
export class NotFoundError extends DomainError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} not found`);
  }
}

/**
 * Invalid operation error
 */
export class InvalidOperationError extends DomainError {
  constructor(operation: string, reason: string) {
    super(`Invalid operation '${operation}': ${reason}`);
  }
}

/**
 * Validation error
 */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized') {
    super(message);
  }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends DomainError {
  constructor(message: string = 'Forbidden') {
    super(message);
  }
}

/**
 * Conflict error (e.g., duplicate entry)
 */
export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
