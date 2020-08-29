import { MigrationInterface, QueryRunner } from "typeorm";
import postsSQL from "../mocks/posts";

export class FakePosts1598650827264 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(postsSQL);
  }

  public async down(_: QueryRunner): Promise<void> {}
}
