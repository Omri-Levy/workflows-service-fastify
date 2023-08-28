import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { CustomError } from "@/common/errors/custom-error";

export class ForbiddenError extends CustomError {
  status = StatusCodes.FORBIDDEN;

  constructor(
    public message = getReasonPhrase(
      StatusCodes.FORBIDDEN,
    ),
  ) {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}