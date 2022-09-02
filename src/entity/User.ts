import { Field, ObjectType } from "type-graphql"
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm"
import { Updoot } from "./Updoot"

@ObjectType()
@Entity()
export class User extends BaseEntity {

    @Field()
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column()
    username: string
    
    @Field()
    @Column()
    name: string

    @Field()
    @Column("text")
    email: string

    @Column("text")
    password: string

    @Field()
    @Column("text", {nullable: true})
    stripeId: string

    @Field()
    @Column("text", { default: "Free-Trial" })
    type: string

    @Field()
    @Column()
    state: string

    @Field()
    @Column()
    city: string

    @Field()
    @Column()
    adress: string

    @OneToMany(() => Updoot, (updoot) => updoot.user)
    updoots: Updoot[];

}
