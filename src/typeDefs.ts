import { gql } from 'apollo-server-express';


export const typeDefs = gql`
    type User {
        id: ID!
        name: String!
        email: String!
        state: String!
        city: String!
        zip: String!
        adress: String!
    }

    type Query {
        me: User
    }

    type Mutation {
        register(name: String!, email: String!, password: String!, state: String!, city: String!, zip: String!, adress: String!): Boolean!
        login(email: String!, password: String!): User
    }
`;