import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  status = StatusCodes.NOT_FOUND;

  constructor(
    public message = getReasonPhrase(
      StatusCodes.NOT_FOUND,
    ),
  ) {
    super(message);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}