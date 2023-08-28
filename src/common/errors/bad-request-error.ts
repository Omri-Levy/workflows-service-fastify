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
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}