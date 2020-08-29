import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { Vote } from "../entities/Vote";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

@Resolver(Vote)
export class VoteResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("value", () => Int) value: number,
    @Arg("postId", () => Int) postId: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session!;
    const actualValue = value < 0 ? -1 : 1;

    const vote = await Vote.findOne({ where: { postId, userId } });

    if (vote && vote.value !== actualValue) {
      // changing vote
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          UPDATE vote
          SET value = $1
          WHERE "postId" = $2 AND "userId" = $3
          `,
          [actualValue, postId, userId]
        );

        await tm.query(
          `
          UPDATE post
          SET points = points + $1
          WHERE id = $2
          `,
          [2 * actualValue, postId]
        );
      });
    } else if (!vote) {
      // never voted before

      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          INSERT INTO vote ("userId", "postId", value)
          VALUES ($1, $2, $3)
          `,
          [userId, postId, actualValue]
        );

        await tm.query(
          `
          UPDATE post
          SET points = points + $1
          WHERE id = $2
          `,
          [actualValue, postId]
        );
      });
    }

    return true;
  }
}
