import { validate } from "../authorization/auth.js";
import { Product } from "../model/Product.js";
import { Purchase } from "../model/Purchase.js";

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Endpoints para estadísticas
 */

/**
 * @swagger
 * /statistic/purchases_by_month:
 *   get:
 *     summary: Retorna as compras do último mês
 *     tags: [Statistics]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: Lista de compras do último mês
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   year:
 *                     type: number
 *                     description: Ano da compra
 *                   month:
 *                     type: number
 *                     description: Mês da compra
 *                   total:
 *                     type: number
 *                     description: Total de compras no mês
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro

 * /statistic/product_type:
 *   get:
 *     summary: Retorna o número de produtos por tipo
 *     tags: [Statistics]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos por tipo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Tipo de produto
 *                   count:
 *                     type: number
 *                     description: Quantidade de produtos desse tipo
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro

 * /statistic/top_customer:
 *   get:
 *     summary: Retorna os principais clientes do último mês
 *     tags: [Statistics]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: Lista dos principais clientes do último mês
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: string
 *                     description: Nome do cliente
 *                   celphone:
 *                     type: string
 *                     description: Número de celular do cliente
 *                   totalSpent:
 *                     type: number
 *                     description: Total gasto pelo cliente no último mês
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro

 * /statistic/top_product:
 *   get:
 *     summary: Retorna os principais produtos vendidos no último mês
 *     tags: [Statistics]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: Lista dos principais produtos vendidos no último mês
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productName:
 *                     type: string
 *                     description: Nome do produto
 *                   totalSold:
 *                     type: number
 *                     description: Total de unidades vendidas do produto no último mês
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro

 * /statistic/card:
 *   get:
 *     summary: Retorna estatísticas gerais compra no último mês
 *     tags: [Statistics]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas gerais de compra no último mês
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalClient:
 *                   type: number
 *                   description: Número total de clientes no último mês
 *                 totalPurchases:
 *                   type: number
 *                   description: Número total de compras no último mês
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 */

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
