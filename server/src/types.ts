import { Request, Response } from "express";
import { Redis } from "ioredis";
import { createUserLoader } from "./dataloader/createUserLoader";
import { createVoteLoader } from "./dataloader/createVoteLoader";

export type MyContext = {
  req: Request;
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  voteLoader: ReturnType<typeof createVoteLoader>;
};
