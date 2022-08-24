import { User } from "./entity/User"
import { hash, verify} from 'argon2'


type IUserRegister = {
    name: string
    email:string
    password: string
    state: string
    city: string
    zip: string
    adress: string
}

type IUserLogin = {
    email: string
    password: string
}

export const resolvers = {
    Query: {
        me: (_: any, __: any, {req}: any) => {
            if (!req.session.userId) {
                return null
            }
            return User.findOne({where: {id:req.session.userId}});
        }
    },

    Mutation: {
        register: async (_: any, {name, email, password, state, city, zip, adress}: IUserRegister) => {
           const hashedPassword = await hash(password)
           await User.create({
            name,
            email,
            password: hashedPassword,
            state,
            city,
            zip,
            adress
           }).save();

           return true
        },

        login: async (_: any, {email, password}: IUserLogin, { req }: any) => {
            const user = await User.findOne({ where: {email} });
            if (!user) {
                return null
            }
            
            const valid = await verify(user.password, password)
            if (!valid) {
                return null
            }

            console.log(req.session.userId)
            req.session.userId = user.id
            console.log(req.session.userId)

            return user;
        }
    }
}