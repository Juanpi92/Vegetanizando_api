import nodemailer from "nodemailer";
export const StripeRoutes = (app) => {
  app.post("/webhook_stripe", async (req, res) => {
    try {
      const message = `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">

            <title>Vegetanizando</title>
        </head>
        <body>
            <h1>Nova compra detetada</h1>
        </body>
        </html>
        `;
      const event = req.body;
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        console.log(paymentIntent);
        const transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        const emailConfig = {
          from: process.env.EMAIL,
          to: process.env.EMAIL,
          subject: "Nova compra detetada",
          html: message,
          text: `Nova compra detetada`,
        };
        const response = await transport.sendMail(emailConfig);
      }
    } catch (error) {
      console.log(error);
    }
  });
};
