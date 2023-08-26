import { UnauthorizedError } from '@/common/errors/unauthorized-error';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { AuthService } from '../auth.service';
import { IAuthStrategy } from '../../auth/types';
import { UserInfo } from '../../user/user-info';

export class BasicStrategy extends PassportStrategy(Strategy) implements IAuthStrategy {
  constructor(protected readonly authService: AuthService) {
    super();
  }

  async validate(email: string, password: string): Promise<UserInfo> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedError();
    }
    return user;
  }
}
