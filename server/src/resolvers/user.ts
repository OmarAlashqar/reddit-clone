import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  FieldResolver,
  Root,
} from "type-graphql";
import { getConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { __cookie_name__, __forgot_pass_prefix__ } from "../constants";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { sendEmail } from "../utils/sendEmail";
import { validateRegister } from "../utils/validateRegister";
import { UsernamePasswordInput } from "./types/UsernamePasswordInput";
import { FieldError } from "./types/FieldError";

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // logged-in user is requesting, so it's okay to show
    if (req.session!.userId === user.id) {
      return user.email;
    }

    return "";
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session!.userId) return null;

    return User.findOne(req.session!.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") { username, password, email }: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister({ username, email, password });
    if (errors) return { errors };

    const emailLowercase = email.toLowerCase();
    const hashedPassword = await argon2.hash(password);

    let user = null;
    try {
      // using query builder to try it out
      // equivalent to:
      // User.create({...}).save();
      const res = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username,
          password: hashedPassword,
          email: emailLowercase,
        })
        .returning("*")
        .execute();

      user = res.raw[0];
    } catch (error) {
      // duplicate username
      if (error.code == "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "your username is already in use",
            },
          ],
        };
      }
    }

    // auto-login after register
    req.session!.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // this is ok since it was enforced at register
    const filter = usernameOrEmail.includes("@")
      ? { where: { email: usernameOrEmail.toLowerCase() } }
      : { where: { username: usernameOrEmail } };

    const user = await User.findOne(filter);

    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "whoops, that username/email doesn't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "whoops, that password is incorrect",
          },
        ],
      };
    }

    // store id in session
    req.session!.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
    return new Promise((resolve) =>
      req.session?.destroy((err) => {
        // always clear cookie
        res.clearCookie(__cookie_name__);

        // attempt to clear redis entry for session
        if (err) {
          console.error(err);
          resolve(false);
        } else resolve(true);
      })
    );
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<Boolean> {
    const user = await User.findOne({ where: { email } });

    // no feedback to user for security
    if (!user) return true;

    const token = uuidv4();

    // no await so user doesn't know if if worked or not
    redis.set(
      `${__forgot_pass_prefix__}${token}`,
      user.id,
      "ex", // set an expiry date
      1000 * 60 * 60 * 24 * 3 // 3 days
    );

    sendEmail({
      to: email,
      subject: "Reddit-clone password change form",
      html: `Follow link to change e-mail: <a href="${process.env.APP_ORIGIN}/change-password/${token}">reset password</a>`,
    });

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { req, redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 3) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "your password must be at least 3 characters long",
          },
        ],
      };
    }

    // check token
    const key = `${__forgot_pass_prefix__}${token}`;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdParsed = parseInt(userId);
    const user = await User.findOne(userIdParsed);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    // update password
    await User.update(
      { id: userIdParsed },
      { password: await argon2.hash(newPassword) }
    );

    // ensures token is only used once
    await redis.del(key);

    // auto-login
    req.session!.userId = user.id;

    return { user };
  }
}
