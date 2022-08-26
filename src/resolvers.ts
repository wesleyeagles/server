import { User } from "./entity/User"
import { hash, verify} from 'argon2'


type IUserRegister = {
    name: string
    email:string
    password: string
    confirmpassword: string
    state: string
    city: string
    adress: string
    number: string
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
        register: async (_: any, {name, email, password, confirmpassword, state, city, adress, number}: IUserRegister) => {
           const hashedPassword = await hash(password)
           const hashedConfirmPassword = await hash(confirmpassword)
           await User.create({
            name,
            email,
            password: hashedPassword,
            confirmpassword: hashedConfirmPassword,
            state,
            city,
            adress,
            number
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
            
            req.session.userId = user.id

            return user;
        }
    }
}