import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Terminal Agent API",
      version: "1.0.0",
      description: "API documentation for Terminal Agent",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },

  apis: ["src/routes/**/*.ts"],
});