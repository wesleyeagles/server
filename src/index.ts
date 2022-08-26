import { AppDataSource } from "./data-source"
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from '../src/typeDefs'
import { resolvers } from '../src/resolvers'
import * as express from 'express'
import * as session from 'express-session'
import * as cors from 'cors'


const startServer = async () => {

    const app = express();

    app.set("trust proxy", true);

    app.use(session({
        name: "qid",
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
          httpOnly: true,
          sameSite: 'none', // csrf
          secure: true, // cookie only works in https
        },
         secret: "odjiweqdhjiw0qdhiwqd",
         resave:false,
         saveUninitialized:false
     }))

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req, res }: any) => ({ req, res })
            
    });

    
    await AppDataSource.initialize()
    
   //
    
    server.start().then(() => {
        server.applyMiddleware({ app, cors: {
            credentials: true,
            origin: ["http://localhost:3000", "http://localhost:4000/graphql"]
        }
    });
    
        app.listen({ port: 4000}, () => {
        console.log(`Server started at https://localhost:4000${server.graphqlPath}`)
    })
    }) 

    app.use(cors({ credentials: true, origin: ["http://localhost:3000", "https://studio.apollographql.com"] }));

}

startServer()


    



  
  
