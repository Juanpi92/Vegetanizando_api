import Stripe from "stripe";

export const PaymentRoutes = (app) => {
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
  });

  app.post("/payment", async (req, res) => {
    let stripeSecretKey = process.env.SECRET_STRIPE_KEY;
    const { token, total, email } = req.body;
    try {
      const stripe = new Stripe(stripeSecretKey);

      const customer = await stripe.customers.create({
        email: email,
      });
      let charge = await stripe.charges.create({
        amount: total * 100,
        currency: "BRL",
        source: token,
        customer: customer.id,
      });
      res.status(200).json({ message: "Pago exitoso", charge });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  });
};
