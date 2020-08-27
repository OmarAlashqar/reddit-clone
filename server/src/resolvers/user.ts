import {
  Arg,
  Ctx,
  Field,
  Mutation,
  Resolver,
  ObjectType,
  Query,
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { __cookie_name__, __forgot_pass_prefix__ } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 as uuidv4 } from "uuid";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session!.userId) return null;

    const user = await em.findOne(User, { id: req.session!.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") { username, password, email }: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister({ username, email, password });
    if (errors) return { errors };

    const hashedPassword = await argon2.hash(password);

    let user = null;
    try {
      // using query builder to try it out
      const res = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username,
          password: hashedPassword,
          email,
          // postgres converts these fields to have underscores
          // and knex wouldn't know to convert createdAt -> created_at
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");

      user = res[0];
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
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // this is ok since it was enforced at register
    const filter = usernameOrEmail.includes("@")
      ? { email: usernameOrEmail }
      : { username: usernameOrEmail };

    const user = await em.findOne(User, filter);

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
    @Ctx() { em, redis }: MyContext
  ): Promise<Boolean> {
    const user = await em.findOne(User, { email });

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
      html: `Follow link to change e-mail: <a href="http://localhost:3000/change-password/${token}">reset password</a>`,
    });

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { em, req, redis }: MyContext
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

    const user = await em.findOne(User, { id: parseInt(userId) });

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
    user.password = await argon2.hash(newPassword);
    await em.persistAndFlush(user);

    // ensures token is only used once
    await redis.del(key);

    // auto-login
    req.session!.userId = user.id;

    return { user };
  }
}
