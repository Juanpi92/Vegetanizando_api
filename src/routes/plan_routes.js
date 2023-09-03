import { Plan } from "../model/Plan.js";
import { Product } from "../model/Product.js";

export const PlanRoutes = (app) => {
  //route to get all Product(Read)
  app.get("/plans", async (req, res) => {
    try {
      let plans = await Plan.find();
      if (!plans) {
        res.status(204).send({ message: "No encontramos nehum produto" });
        return;
      }
      res.status(200).send(plans);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  });
};
