import {
    Resolver,
    Mutation,
    Arg,
    Field,
    Ctx,
    ObjectType,
    Query,
    FieldResolver,
    Root,
  } from "type-graphql";
  import { MyContext } from "./types";
  import { User } from "./entity/User";
  import argon2 from "argon2";
  import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "./constants";
  import { UsernamePasswordInput } from "./resolvers/UsernamePasswordInput";
  import { validateRegister } from "./utils/validateRegister";
  import { sendEmail } from "./utils/sendEmail";
  import { v4 } from "uuid";
  import { appDataSource } from "./index";
  
  
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

 
  
  @Resolver(User)
  export class UserResolver {
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() { req }: MyContext) {
      // this is the current user and its ok to show them their own email
      if (req.session.userId === user.id) {
        return user.email;
      }
      // current user wants to see someone elses email
      return "";
    }
  
    @Mutation(() => UserResponse)
    async changePassword(
      @Arg("token") token: string,
      @Arg("newPassword") newPassword: string,
      @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
      if (newPassword.length <= 2) {
        return {
          errors: [
            {
              field: "newPassword",
              message: "Senha deve conter mais que 2 caracteres",
            },
          ],
        };
      }
  
      const key = FORGET_PASSWORD_PREFIX + token;
      const userId = await redis.get(key);
      if (!userId) {
        return {
          errors: [
            {
              field: "token",
              message: "Token expirado",
            },
          ],
        };
      }
  
      const userIdNum = parseInt(userId);
      const user = await User.findOne({where: {id: userIdNum}});
  
      if (!user) {
        return {
          errors: [
            {
              field: "token",
              message: "Usuário não existe",
            },
          ],
        };
      }
  
      await User.update(
        { id: userIdNum },
        {
          password: await argon2.hash(newPassword),
        }
      );
  
      await redis.del(key);
  
      // log in user after change password
      req.session.userId = user.id;
  
      return { user };
    }
  
    @Mutation(() => Boolean)
    async forgotPassword(
      @Arg("email") email: string,
      @Ctx() { redis }: MyContext
    ) {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        // the email is not in the db
        return true;
      }
  
      const token = v4();
  
      await redis.set(
        FORGET_PASSWORD_PREFIX + token,
        user.id,
        "ex",
        1000 * 60 * 60 * 24 * 3
      ); // 3 days
  
      await sendEmail(
        email,
        `<a href="https://acouguedigital.vercel.app/change-password/${token}">reset password</a>`
      );
  
      return true;
    }
  
    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext) {
      // you are not logged in
      if (!req.session.userId) {
        return null;
      }
  
      return User.findOne({where: {id: req.session.userId}});
    }
  
    @Mutation(() => UserResponse)
    async register(
      @Arg("options") options: UsernamePasswordInput,
      @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
      const errors = validateRegister(options);
      if (errors) {
        return { errors };
      }
  
      const hashedPassword = await argon2.hash(options.password);
      let user;
      try {
        // User.create({}).save()
        const result = await appDataSource.getRepository(User)
          .createQueryBuilder()
          .insert()
          .into(User)
          .values({
            username: options.username,
            name: options.name,
            email: options.email,
            password: hashedPassword,
            state: options.state,
            city: options.city,
            adress: options.adress,

          })
          .returning("*")
          .execute();
        user = result.raw[0];
      } catch (err) {
        //|| err.detail.includes("already exists")) {
        // duplicate username error
        if (err.code === "23505") {
          return {
            errors: [
              {
                field: "username",
                message: "Usuário já existe",
              },
            ],
          };
        }
      }
  
      // store user id session
      // this will set a cookie on the user
      // keep them logged in
      req.session.userId = user.id;
  
      return { user };
    }
  
    @Mutation(() => UserResponse)
    async login(
      @Arg("usernameOrEmail") usernameOrEmail: string,
      @Arg("password") password: string,
      @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
      const user = await User.findOne(
        usernameOrEmail.includes("@")
          ? { where: { email: usernameOrEmail } }
          : { where: { username: usernameOrEmail } }
      );
      if (!user) {
        return {
          errors: [
            {
              field: "usernameOrEmail",
              message: "Usúario ou Email digitado não existe",
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
              message: "Senha incorreta",
            },
          ],
        };
      }
  
      req.session.userId = user.id;
  
      return {
        user,
      };
    }
  
    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
      return new Promise((resolve) =>
        req.session.destroy((err) => {
          res.clearCookie(COOKIE_NAME);
          if (err) {
            console.log(err);
            resolve(false);
            return;
          }
  
          resolve(true);
        })
      );
    }

    @Mutation(() => UserResponse)
    async createMonthSubscription(
      @Arg('userId') userId: number,
      ) 
      {
      const user = await User.findOne({ where: {id: userId}})

      if (!user) {
        throw new Error();
      }

      user.type = "Month-User"
      await user.save();

      return user;
    }
  }

  