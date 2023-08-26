import type { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { CustomError } from "@/common/errors/custom-error";

export class ZodValidationError extends CustomError {
  status = StatusCodes.BAD_REQUEST;

  constructor(public error: ZodError) {
    super(`Validation error`);

    Object.setPrototypeOf(this, ZodValidationError.prototype);
  }

  serializeErrors() {
    return this.error.issues.map((err) => ({
      field: err.path?.join(`.`),
      type: err.code,
      message: err.message,
    }));
  }
}