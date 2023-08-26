import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthControllerInternal } from './auth.controller.internal';
import { AuthService } from './auth.service';
import { BasicStrategy } from './basic/basic.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';
import { PasswordService } from './password/password.service';
import { TokenService } from './token/token.service';
// eslint-disable-next-line import/no-cycle
import { UserModule } from '../user/user.module';
import { LocalStrategy } from '@/auth/local/local.strategy';
import { SessionSerializer } from '@/auth/passport-session-serializer-plugin';
import { UserService } from '@/user/user.service';
import { UserRepository } from '@/user/user.repository';
import { PassportModule } from '@nestjs/passport';
import { env } from '@/env';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule.register({
      session: true,
    }),
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: env.JWT_SECRET_KEY,
          signOptions: { expiresIn: env.JWT_EXPIRATION },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    PasswordService,
    UserRepository,
    {
      provide: 'USER_SERVICE',
      useClass: UserService,
    },
    BasicStrategy,
    JwtStrategy,
    TokenService,
    LocalStrategy,
    SessionSerializer,
  ],
  controllers: [AuthControllerInternal],
  exports: [AuthService, PasswordService],
})
export class AuthModule {}
