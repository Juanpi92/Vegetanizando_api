import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./infra/db.js";
import cors from "cors";
import { ProductRoutes } from "./routes/product_routes.js";
import { AdminRoutes } from "./routes/admin_routes.js";
import { PlanRoutes } from "./routes/plan_routes.js";

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

//Db connection
connectDB();

//Using product routes
ProductRoutes(app);

//Using plan routes
PlanRoutes(app);

//Using admin route
AdminRoutes(app);

app.get("/", async (req, res) => {
  res.status(200).send({ message: "API is ready to go!" });
});

app.listen(PORT, () => {
  console.log(`API ready to use in -> http://localhost:${PORT}`);
});
