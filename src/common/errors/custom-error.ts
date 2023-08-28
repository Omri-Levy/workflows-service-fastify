import { FormattedError } from './interfaces';
import { StatusCodes } from 'http-status-codes';

export abstract class CustomError extends Error {
  abstract status: StatusCodes;

  constructor(message: string) {
    super(message);
  }

  abstract serializeErrors(): Array<
    Pick<FormattedError, `message`>
  >;
}