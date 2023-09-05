import mongoose from "mongoose";
export const Purchase = mongoose.model(
  "Purchase",
  {
    user: { type: String, required: true },
    email: { type: String, required: true },
    celphone: { type: String, required: true },
    cpf: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, default: "solicitado" },
    date: { type: Date, default: Date.now },
    cart: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: String, required: true },
      },
    ],
    totalCart: { type: Number, required: true },
  },
  "Purchases"
);
