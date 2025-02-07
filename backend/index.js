import express from "express";
import http from "http";
import cors from "cors";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typedefs/index.js";

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs: mergedTypeDefs,
    resolvers: mergedResolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Start Apollo Server
  await server.start();

  // Middleware setup
  app.use(express.json());

  app.use(
    "/graphql",
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    }),
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    })
  );

  // Start HTTP server
  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}

// Start the server and handle errors
startServer().catch((error) => {
  console.error("Error starting server:", error);
});
