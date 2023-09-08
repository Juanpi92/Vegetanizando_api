import { validate } from "../authorization/auth.js";
import { Product } from "../model/Product.js";
import { Purchase } from "../model/Purchase.js";

export const StatisticRoutes = (app) => {
  app.get("/purchases_by_month", validate, async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // Sumamos 1 porque los meses en JavaScript son indexados desde 0

      const result = await Purchase.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(currentYear - 1, currentMonth - 1, 1), // Fecha de inicio hace 12 meses desde el mes actual
              $lte: new Date(currentYear, currentMonth, 1), // Fecha de fin el mes actual
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" }, // Agrupar por año
              month: { $month: "$date" }, // Agrupar por mes
            },
            total: { $sum: "$totalCart" }, // Sumar el totalCart
          },
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id.month", 1] }, then: "Janeiro" },
                  { case: { $eq: ["$_id.month", 2] }, then: "Fevereiro" },
                  { case: { $eq: ["$_id.month", 3] }, then: "Março" },
                  { case: { $eq: ["$_id.month", 4] }, then: "Abril" },
                  { case: { $eq: ["$_id.month", 5] }, then: "Maio" },
                  { case: { $eq: ["$_id.month", 6] }, then: "Junho" },
                  { case: { $eq: ["$_id.month", 7] }, then: "Julho" },
                  { case: { $eq: ["$_id.month", 8] }, then: "Agosto" },
                  { case: { $eq: ["$_id.month", 9] }, then: "Setembro" },
                  { case: { $eq: ["$_id.month", 10] }, then: "Outubro" },
                  { case: { $eq: ["$_id.month", 11] }, then: "Novembro" },
                  { case: { $eq: ["$_id.month", 12] }, then: "Dezembro" },
                ],
                default: "Mês Desconhecido", // Manejar el caso por defecto
              },
            },
            total: 1,
          },
        },
      ]);

      result.sort((a, b) => {
        // Compara los años
        if (a.year !== b.year) {
          return a.year - b.year;
        }

        // Si los años son iguales, compara los meses por su número
        const meses = {
          Janeiro: 1,
          Fevereiro: 2,
          Março: 3,
          Abril: 4,
          Maio: 5,
          Junho: 6,
          Julho: 7,
          Agosto: 8,
          Setembro: 9,
          Outubro: 10,
          Novembro: 11,
          Dezembro: 12,
        };

        return meses[a.month] - meses[b.month];
      });

      //

      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  });
  app.get("/product_type", validate, async (req, res) => {
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
};
