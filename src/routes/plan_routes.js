import { Plan } from "../model/Plan.js";
/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Obtém todos os planos
 *     responses:
 *       200:
 *         description: Sucesso ao obter os planos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID do plano
 *                   name:
 *                     type: string
 *                     description: Nome do plano
 *                   description:
 *                     type: string
 *                     description: Descrição do plano
 *                   price:
 *                     type: number
 *                     description: Preço do plano
 *       204:
 *         description: Nenhum plano encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem informativa
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
