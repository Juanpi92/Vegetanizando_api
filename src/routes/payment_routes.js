import Stripe from "stripe";

/**
 * @swagger
 * /payment:
 *   post:
 *     summary: Processa um pagamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de pagamento (gerado previamente)
 *               total:
 *                 type: number
 *                 description: Valor total do pagamento
 *               email:
 *                 type: string
 *                 description: Endereço de e-mail do cliente
 *     responses:
 *       200:
 *         description: Pagamento bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem de sucesso
 *                 charge:
 *                   type: object
 *                   description: Detalhes do pagamento
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
 *         description: Não autorizado
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
 */

export const PaymentRoutes = (app) => {
  /*
  app.post("/payment_token", async (req, res) => {
    const stripe = new Stripe(
      "pk_test_51NmekIDpeBCo5ijrY6v5H3YxJOvOD1WKesK7eGO3nUWuahUANAFVFY7jVelfX0VfIJNVym1WIGEi51rXHd2jo5XC00YSXh2WHw"
    );
    try {
      const token = await stripe.tokens.create({
        card: {
          number: "4242424242424242", // Número de tarjeta de prueba
          exp_month: 12, // Mes de vencimiento de prueba
          exp_year: 2025, // Año de vencimiento de prueba
          cvc: "123", // Código de seguridad de prueba
        },
      });

      return res.status(200).send(token.id);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  });*/

  app.post("/payment", async (req, res) => {
    let stripeSecretKey = process.env.SECRET_STRIPE_KEY;
    const { token, total, email } = req.body;
    try {
      const stripe = new Stripe(stripeSecretKey);

      let customer = await stripe.customers.list({ email: email, limit: 1 });
      customer = customer.data[0];

      if (!customer) {
        customer = await stripe.customers.create({
          email: email,
        });
      }

      const source = await stripe.customers.createSource(customer.id, {
        source: token,
      });

      let charge = await stripe.charges.create({
        amount: 100,
        currency: "BRL",
        source: source.id,
        customer: customer.id,
      });
      res.status(200).json({ message: "Pago exitoso", charge });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  });
};
