import swaggerJsdoc from "swagger-jsdoc";

const options = {
  swaggerDefinition: {
    openapi: "3.1.0", // Especifica la versión de OpenAPI que quieres usar
    info: {
      title: "Vegetanizando API",
      version: "1.0.0",
      description: "Descripción de tu API",
    },
  },
  apis: ["./src/routes/*.js"], // Ruta a tus archivos de definición de rutas
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
