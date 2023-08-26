import { FormattedError } from './interfaces';
import { StatusCodes } from 'http-status-codes';

export abstract class CustomError extends Error {
  abstract status: StatusCodes;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): Array<
    Pick<FormattedError, `message`>
  >;
}