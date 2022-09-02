import { gql } from 'apollo-server-express';


export const typeDefs = gql`
    type User {
        id: ID!
        name: String!
        email: String!
        state: String!
        city: String!
        adress: String!
        number: String!
        type: String!
    }

    type Query {
        me: User
    }

    type Mutation {
        register(name: String!, email: String!, password: String!, confirmpassword: String!, state: String!, city: String!, adress: String!, number: String!, type: String!): Boolean!
        login(email: String!, password: String!): User
        logout: Boolean!
        createSubscription: Boolean!
    }
`;