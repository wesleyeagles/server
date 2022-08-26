import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column("text")
    email: string

    @Column("text")
    password: string

    @Column("text")
    confirmpassword: string

    @Column()
    state: string

    @Column()
    city: string

    @Column()
    adress: string

    @Column()
    number: string

}
