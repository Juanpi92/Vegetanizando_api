import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./infra/db.js";
import cors from "cors";
import { ProductRoutes } from "./routes/product_routes.js";
import { AdminRoutes } from "./routes/admin_routes.js";
import { PlanRoutes } from "./routes/plan_routes.js";
import { PaymentRoutes } from "./routes/payment_routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import { PurchaseRoutes } from "./routes/purchase_routes.js";
import path from "path";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.use(cors());
mongoose.set("strictQuery", false);

app.use(
  cors({
    exposedHeaders: ["auth-token"],
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(
  "/api-docs",
  express.static(path.join(process.cwd(), "/api-docs"), {
    fallthrough: false,
  })
);

//Db connection
connectDB();

//Using product routes
ProductRoutes(app);

//Using plan routes
PlanRoutes(app);

//Using admin route
AdminRoutes(app);

//Using pyment routes
PaymentRoutes(app);

//Using purchase routes
PurchaseRoutes(app);

app.get("/", async (req, res) => {
  res.status(200).send({ message: "API is ready to go!" });
});

app.listen(PORT, () => {
  console.log(`API ready to use in -> http://localhost:${PORT}`);
});
