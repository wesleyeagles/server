import { ApolloServer } from 'apollo-server-express';
import { UserResolver } from '../src/resolvers'
import express from 'express'
import session from 'express-session'
import cors from 'cors'

import Redis from "ioredis";
import connectRedis from "connect-redis";
import { buildSchema } from "type-graphql";

import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Updoot } from './entity/Updoot';

const stripe = require('stripe')('sk_test_51Lc61fHbZtx4ETzjiSyiRdgDFAuJQ2zdy6yxTEhplJfx22beMNO82npmIrswZB5uUVylxqnEyfhJinQzpRagwU5k00pIpxEIHO');


const startServer = async () => {

  const monthPrice = await stripe.prices.create({
    recurring: {
      interval: "month"
    },
    currency: 'brl',
    unit_amount: 2790,
    product: 'prod_MKm7AdYaew1uYD'
  ,
  });

  const monthPaymentLink = await stripe.paymentLinks.create({
    line_items: [{price: 'price_1Lc6ZBHbZtx4ETzjX5T0MWJt', quantity: 1}],
    after_completion: {type: 'redirect', redirect: {url: 'https://acouguedigital.vercel.app/user/month/payment-sucess'}}
  });

  const trimensalPrice = await stripe.prices.create({
    recurring: {
      interval: "month",
      interval_count: "3",
    },
    currency: 'brl',
    unit_amount: 6990,
    product: 'prod_MKm7AdYaew1uYD'
  ,
  });

  const trimensalPaymentLink = await stripe.paymentLinks.create({
    line_items: [{price: 'price_1Lc6ZBHbZtx4ETzjWci3vC1d', quantity: 1}],
    after_completion: {type: 'redirect', redirect: {url: 'https://acouguedigital.vercel.app/user/trimensal/payment-sucess'}}
  });

  const anualPrice = await stripe.prices.create({
    recurring: {
      interval: "year",
      interval_count: "1",
    },
    currency: 'brl',
    unit_amount: 23880,
    product: 'prod_MKm7AdYaew1uYD'
  ,
  });

  const anualPaymentLink = await stripe.paymentLinks.create({
    line_items: [{price: 'price_1Lc6ZBHbZtx4ETzjqObDZ0rg', quantity: 1}],
    after_completion: {type: 'redirect', redirect: {url: 'https://acouguedigital.vercel.app/user/anual/payment-sucess'}}
  });

  console.log(monthPrice)
  console.log(monthPaymentLink)

  console.log(trimensalPrice)
  console.log(trimensalPaymentLink)

  console.log(anualPrice)
  console.log(anualPaymentLink)

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis(process.env.REDIS_URL);
    app.set("trust proxy", 1);
    app.use(
    cors({
      origin: ["https://acouguedigital.vercel.app", "https://acougueserver.herokuapp.com/graphql"],
      credentials: true,
    })
  );

    app.use(session({
        name: "qid",
        store: new RedisStore({
            client: redis,
            disableTouch: true,
          }),
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
          httpOnly: true,
          sameSite: "none", // csrf
          secure: false, // cookie only works in https
        },
         secret: "odjiweqdhjiw0qdhiwqd",
         resave:false,
         saveUninitialized:false
     }))

     const apolloServer = new ApolloServer({
        schema: await buildSchema({
          resolvers: [UserResolver],
          validate: false,
        }),
        context: ({ req, res }) => ({
          req,
          res,
          redis,
          userLoader: createUserLoader(),
          updootLoader: createUpdootLoader(),
        }),
      });

      await apolloServer.start()


      apolloServer.applyMiddleware({
        app,
        cors: false,
      });
    
      app.listen(process.env.PORT, () => {
        console.log("server started on localhost:4000");
      });
    };

    export const appDataSource = new DataSource({
        type: 'postgres',
        host: 'ec2-44-205-177-160.compute-1.amazonaws.com',
        port: 5432,
        ssl: {
          rejectUnauthorized: false
        },
        username: 'ilddoijnyevebw',
        password: 'c05f4fb610dc39e6f3aa1f08c6310940c6e53c46e1c55987b573a540a52b3f4c',
        database: 'd1oesg3v0kqpfd',
        synchronize: true,
        logging: false,
        entities: [User, Updoot]

    })
     
     appDataSource.initialize();

    


    

startServer()






    



  
  
