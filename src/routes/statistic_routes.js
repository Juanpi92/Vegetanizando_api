import { validate } from "../authorization/auth.js";
import { Product } from "../model/Product.js";
import { Purchase } from "../model/Purchase.js";

export const StatisticRoutes = (app) => {
  app.get("/statistic/purchases_by_month", validate, async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const result = await Purchase.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(currentYear - 1, currentMonth - 1, 1),
              $lte: new Date(currentYear, currentMonth, 1),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            total: { $sum: "$totalCart" },
          },
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month", // Devuelve el número del mes directamente
            total: 1,
          },
        },
      ]);

      result.sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }

        return a.month - b.month; // Ordena por número de mes
      });
      //

      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  });
  app.get("/statistic/product_type", validate, async (req, res) => {
    try {
      const result = await Product.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ]);
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  });
  app.get("/statistic/top_customer", validate, async (req, res) => {
    try {
      const initialData = new Date();
      initialData.setDate(1);
      initialData.setHours(0, 0, 0, 0);

      const finalData = new Date();
      finalData.setDate(31);
      finalData.setHours(23, 59, 59, 999);

      const topCustomers = await Purchase.aggregate([
        {
          $match: {
            date: {
              $gte: initialData,
              $lte: finalData,
            },
          },
        },
        {
          $group: {
            _id: {
              user: "$user",
              celphone: "$celphone",
            },
            totalSpent: { $sum: "$totalCart" },
          },
        },
        {
          $project: {
            _id: 0,
            user: "$_id.user",
            celphone: "$_id.celphone",
            totalSpent: 1,
          },
        },
        {
          $sort: { totalSpent: -1 },
        },
        {
          $limit: 3,
        },
      ]).exec();
      return res.status(200).send(topCustomers);
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  });
  app.get("/statistic/top_product", validate, async (req, res) => {
    try {
      const initialData = new Date();
      initialData.setDate(1);
      initialData.setHours(0, 0, 0, 0);

      const finalData = new Date();
      finalData.setDate(31);
      finalData.setHours(23, 59, 59, 999);

      const topProducts = await Purchase.aggregate([
        {
          $match: {
            date: {
              $gte: initialData,
              $lte: finalData,
            },
          },
        },
        {
          $unwind: "$cart", // Desenrollar el array de productos en compras
        },
        {
          $group: {
            _id: "$cart.name",
            totalSold: { $sum: { $toInt: "$cart.quantity" } }, // Convertir la cantidad a entero y sumar
          },
        },
        {
          $project: {
            _id: 0, // Excluimos el campo _id
            productName: "$_id", // Renombramos _id a productName
            totalSold: 1, // Mantenemos totalSold
          },
        },
        {
          $sort: { totalSold: -1 },
        },
        {
          $limit: 5,
        },
      ]).exec();
      return res.status(200).send(topProducts);
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  });
  app.get("/statistic/card", validate, async (req, res) => {
    try {
      const initialData = new Date();
      initialData.setDate(1);
      initialData.setHours(0, 0, 0, 0);

      const finalData = new Date();
      finalData.setDate(31);
      finalData.setHours(23, 59, 59, 999);

      const client = await Purchase.distinct("user", {
        date: {
          $gte: initialData,
          $lte: finalData,
        },
      }).exec();
      const totalClient = client.length;

      const totalPurchases = await Purchase.find({
        date: {
          $gte: initialData,
          $lte: finalData,
        },
      });

      return res.status(200).send({
        totalClient: totalClient,
        totalPurchases: totalPurchases.length,
      });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  });
};
