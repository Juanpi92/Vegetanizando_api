import { validate } from "../authorization/auth.js";
import { Purchase } from "../model/Purchase.js";

export const PurchaseRoutes = (app) => {
  //Route to get all Purchases
  app.get("/purchases", validate, async (req, res) => {
    try {
      const currentDate = new Date();
      const fiveDaysAgo = new Date(currentDate);
      fiveDaysAgo.setHours(0, 0, 0, 0);
      fiveDaysAgo.setDate(currentDate.getDate() - 5);
      console.log(currentDate, fiveDaysAgo);
      let purchases = await Purchase.find({
        date: { $gt: fiveDaysAgo, $lte: currentDate },
      });
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
  app.patch("/purchase/:id", validate, async (req, res) => {
    try {
      let id_purchase = req.params.id;
      let status = req.body.status;
      if (!status) {
        return res.status(400).send({ error: "Debe prencher todos os dados" });
      }
      let purchase = await Purchase.findByIdAndUpdate(
        id_purchase,
        { status: status },
        { new: true }
      );
      res.status(200).send(purchase);
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  });

  //Route to delete a purchase
  app.delete("/purchase/:id", validate, async (req, res) => {
    try {
      let id_purchase = req.params.id;
      let deleted = await Purchase.findByIdAndDelete(id_purchase);
      if (!deleted) {
        return res.status(404).send({ message: "Compra nao encontrada" });
      }
      res.status(200).send({ message: "compra apagada corretamente" });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  });
  /*
  //Insert Automatic
  app.post("/InsertAllPurchase", async (req, res) => {
    try {
      let purchases = [];
      for (let index = 0; index < purchases.length; index++) {
        await Purchase.create(purchases[index]);
      }

      res.status(200).send({ message: "ok" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: error });
    }
  });
  */
};
