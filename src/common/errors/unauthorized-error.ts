import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { CustomError } from "./custom-error";

export class UnauthorizedError extends CustomError {
  status = StatusCodes.UNAUTHORIZED;

  constructor(
    public message = getReasonPhrase(
      StatusCodes.UNAUTHORIZED,
    ),
  ) {
    super(message);

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}