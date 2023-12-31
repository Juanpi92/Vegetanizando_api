import { validate } from "../authorization/auth.js";
import { Purchase } from "../model/Purchase.js";

/**
 * @swagger
 * tags:
 *   name: Purchases
 *   description: Endpoints para compras
 */

/**
 * @swagger
 * /purchases:
 *   get:
 *     summary: Retorna todas as compras dos últimos 2 dias
 *     tags: [Purchases]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: Lista de compras dos últimos 2 dias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Purchase'
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

 *   post:
 *     summary: Insere uma nova compra
 *     tags: [Purchases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               purchase:
 *                 $ref: '#/components/schemas/Purchase'
 *     responses:
 *       201:
 *         description: Compra inserida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem de sucesso
 *       400:
 *         description: Requisição inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
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

 * /purchase/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: ID da compra
 *       schema:
 *         type: string

 *   patch:
 *     summary: Atualiza o status de uma compra existente
 *     tags: [Purchases]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da compra a ser atualizada
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: Novo status da compra
 *     responses:
 *       200:
 *         description: Compra atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Purchase'
 *       400:
 *         description: Requisição inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *       401:
 *         description: Não autorizado (Token JWT ausente ou inválido)
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Mensagem de erro
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

 *   delete:
 *     summary: Deleta uma compra
 *     tags: [Purchases]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: Compra deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem de sucesso
 *       401:
 *         description: Não autorizado (Token JWT ausente ou inválido)
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Mensagem de erro
 *       404:
 *         description: Compra não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro
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

export const PurchaseRoutes = (app) => {
  //Route to get all Purchases
  app.get("/purchases", validate, async (req, res) => {
    try {
      const currentDate = new Date();
      const yesterday = new Date(currentDate);
      yesterday.setDate(currentDate.getDate() - 30);
      let purchases = await Purchase.find({
        date: { $gte: yesterday, $lte: currentDate },
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
