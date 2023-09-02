import { Strategy as LocalStrategy } from "passport-local";
import { PasswordService } from "@/auth/password/password.service";
import { UserRepository } from "@/user/user.repository";
import { UserService } from "@/user/user.service";
import { db } from "@/db/client";
import { UnauthorizedError } from "@/common/errors/unauthorized-error";

export const PassportLocalStrategy = new LocalStrategy(
  {
    usernameField: "email"
  },
  async (email, password, done) => {
    const passwordService = new PasswordService();
    const userRepository = new UserRepository(db, passwordService);
    const userService = new UserService(userRepository);
    const user = await userService.getByEmail(email);
    const passwordMatches = await passwordService.compare(password, user?.password ?? "");

    if (!user || !passwordMatches) {
      return done(new UnauthorizedError("Invalid email or password"));
    }

    return done(null, {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
  }
);

