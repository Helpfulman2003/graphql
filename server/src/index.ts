import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { createServer } from "http";
import { buildSchema } from "type-graphql";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { GreetingResolve } from "./resolves/greeting";
import { UserResolver } from "./resolves/user";
import { Context } from "./types/Context";
import refreshTokenRouter from "./routes/refreshTokenRouter"
import cookieParser from "cookie-parser";

require("dotenv").config();

// tạo file config.ts là tsc --init

const main = async () => {
  try {
    // create TypeORM connection
    await createConnection({
      type: "postgres",
      database: "jwt-auth",
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      synchronize: true,
      logging: true,
      entities: [User],
    });

    const app = express();

    const corsConfig = {
      methods: "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS",
      credentials: true,
      origin: [/localhost*/],
    };

    app.use(cors(corsConfig));

    app.use(cookieParser())

    app.use('/refresh_token', refreshTokenRouter);
    
    const PORT = process.env.PORT || 4000;

    // Create GraphQL server
    const httpServer = createServer(app);
    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        validate: false,
        resolvers: [GreetingResolve, UserResolver],
      }),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        ApolloServerPluginLandingPageGraphQLPlayground,
      ],
      // cái req, res của graphql là đã có sẵn từ express nên cứ thế mà dùng, những gì bỏ từ context thì nhận được ở bên middleware
      context: ({req, res}: Pick<Context, 'req' | 'res'>) => {
        return {req, res}
      }
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: corsConfig });
    await new Promise<void>((resolve) =>
      httpServer.listen({ port: PORT }, resolve)
    );
    //http://localhost:4000/graphql
    
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
    );
  } catch (error) {
    console.log(error);
  }
};

main();
