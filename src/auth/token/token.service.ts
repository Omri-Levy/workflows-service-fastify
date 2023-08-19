import { JwtService } from "@nestjs/jwt";
import { INVALID_PASSWORD_ERROR, INVALID_USERNAME_ERROR } from "../auth-errors";
import { ITokenPayload, ITokenService } from "./types";

/**
 * TokenServiceBase is a jwt bearer implementation of ITokenService
 */
export class TokenService implements ITokenService {
  constructor(protected readonly jwtService: JwtService) {
  }

  /**
   *
   * @object { id: String, email: String, password: String}
   * @returns a jwt token sign with the email and user id
   */
  createToken({ id, email, password }: ITokenPayload) {
    if (!email) throw new Error(INVALID_USERNAME_ERROR);
    if (!password) throw new Error(INVALID_PASSWORD_ERROR);
    return this.jwtService.signAsync({
      sub: id,
      email
    });
  }
}
