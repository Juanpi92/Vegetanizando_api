import { validate } from "../authorization/auth.js";
import { Purchase } from "../model/Purchase.js";

export const PurchaseRoutes = (app) => {
  //Route to get all Purchases
  app.get("/purchases",async (req, res) => {
    try {
      let purchases = await Purchase.find();
      res.status(200).send(purchases);
      
    } catch (error) {
      return res.status(500).send({ error: error });
    }

  });

  //Route to insert a purchase
  app.post("/purchase", async (req, res) => {
    let { purchase } = req.body;
    try {
      if (!purchase) {
        return res.status(400).send({ error: "Nenhum dado fornecido" });
      }

      await Purchase.create(purchase);

      res.status(201).send({ message: "compra inserida exitosamente" });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  });

  //Route to update a purchase status
  app.patch("/purchase/:id", validate, async (req, res) => {});

  //Route to delete a purchase
  app.delete("/purchase/:id",async (req, res) => {
    try {
      let id_purchase = req.params.id;
      let deleted = await Purchase.findByIdAndDelete(id_purchase);
      if (!deleted) {
        return res.status(404).send({message: "Compra nao encontrada" });
      }
      res.status(200).send({ message: "compra apagada corretamente" });
      
    } catch (error) {
      return res.status(500).send({ error: error });
    }

  });
};
