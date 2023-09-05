import { validate } from "../authorization/auth.js";
import { Purchase } from "../model/Purchase.js";

export const PurchaseRoutes = (app) => {
  //Route to get all Purchases
  app.get("/purchases", validate, async (req, res) => {});

  //Route to insert a purchase
  app.post("/purchase", async (req, res) => {
    let { purchase } = req.body;
    try {
      if (!purchase) {
        return res.status(400).send({ error: "Nenhum dado fornecido" });
      }

      await Purchase.create(purchase);

      res.status(201).send({ message: "Purchase inserida exitosamente" });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  });

  //Route to update a purchase status
  app.patch("/purchase/:id", validate, async (req, res) => {});

  //Route to delete a purchase
  app.delete("/purchase/:id", validate, async (req, res) => {});
};
