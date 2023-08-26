import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { CustomError } from "./custom-error";

export class UnauthorizedError extends CustomError {
  status = StatusCodes.BAD_REQUEST;

  constructor(
    public message = getReasonPhrase(
      StatusCodes.BAD_REQUEST,
    ),
  ) {
    super(message);

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}