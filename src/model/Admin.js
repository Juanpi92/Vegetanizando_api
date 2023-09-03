import mongoose from "mongoose";
export const Admin = mongoose.model(
  "Admin",
  {
    user: { type: String, default: "default value" },
    email: { type: String, default: "default value" },
    password: { type: String, default: "default value" },
    src: { type: String, default: "default value" },
  },
  "Admins"
);
