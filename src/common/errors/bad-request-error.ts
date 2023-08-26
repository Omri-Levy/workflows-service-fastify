import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { CustomError } from "@/common/errors/custom-error";

export class BadRequestError extends CustomError {
  status = StatusCodes.BAD_REQUEST;

  constructor(
    public message = getReasonPhrase(
      StatusCodes.BAD_REQUEST,
    ),
  ) {
    super(message);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}