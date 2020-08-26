import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Resolver,
  ObjectType,
  Query,
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { __cookie_name__ } from "../constants";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

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
    @Arg("options") { username, password }: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (username.length < 3) {
      return {
        errors: [
          {
            field: "username",
            message: "your username must be at least 3 characters long",
          },
        ],
      };
    }

    if (password.length < 3) {
      return {
        errors: [
          {
            field: "password",
            message: "your password must be at least 3 characters long",
          },
        ],
      };
    }

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
    @Arg("options") { username, password }: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "whoops, that username doesn't exist",
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
}
