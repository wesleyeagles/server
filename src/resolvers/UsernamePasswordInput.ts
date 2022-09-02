import { InputType, Field } from "type-graphql";
import { Column } from "typeorm";
@InputType()
export class UsernamePasswordInput {

  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  name: string;

  @Field()
  @Column()
  state: string

  @Field()
  @Column()
  city: string

  @Field()
  @Column()
  adress: string
}