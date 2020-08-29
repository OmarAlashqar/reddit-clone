import { Field, ObjectType, Int } from "type-graphql";
import { BaseEntity, Entity, ManyToOne, PrimaryColumn, Column } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

// junction table between User & Post

@ObjectType()
@Entity()
export class Vote extends BaseEntity {
  // @Field(() => String)
  // @CreateDateColumn()
  // createdAt: Date;

  // @Field(() => String)
  // @UpdateDateColumn()
  // updatedAt: Date;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.votes)
  user: User;

  @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.votes, { onDelete: "CASCADE" })
  post: Post;

  @Field(() => Int)
  @Column({ type: "int" })
  value: number;
}
