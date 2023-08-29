import mongoose from "mongoose";
export const Product = mongoose.model(
  "Product",
  {
    src: { type: String, default: "default value" },
    name: { type: String, default: "default value" },
    portion: { type: String, default: "default value" },
    price: { type: Number, default: 0.0 },
  },
  "Products"
);
