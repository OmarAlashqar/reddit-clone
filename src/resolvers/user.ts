import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Resolver,
  ObjectType,
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2 from "argon2";

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
  @Field(() => FieldError)
  errors?: FieldError[];
  @Field(() => User)
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") { username, password }: UsernamePasswordInput,
    @Ctx() { em }: MyContext
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
    const user = em.create(User, { username, password: hashedPassword });

    try {
      await em.persistAndFlush(user);
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

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") { username, password }: UsernamePasswordInput,
    @Ctx() { em }: MyContext
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

    return { user };
  }
}
