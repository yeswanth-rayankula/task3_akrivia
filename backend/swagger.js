const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chat Application API",
      version: "1.0.0",
      description: "API Documentation for the Chat Application",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", 
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    "./index.js",
    "./src/v1/pagination/pagination.routes.js"
  ],
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger docs available at http://localhost:4000/api-docs");
};

module.exports = swaggerDocs;
