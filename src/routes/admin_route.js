import { Admin } from "../model/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const AdminRoutes = (app) => {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
    region: process.env.BUCKET_REGION,
  });

  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ error: "Debe prencher todos os dados" });
    }
    try {
      let admin = await Admin.findOne({ email: email });
      if (!admin) {
        return res.status(401).send("User not found");
      } else {
        const match = await bcrypt.compare(password, admin.password);

        if (match) {
          //get the url for the admin photo
          let getObjectParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: admin.src,
          };

          let command2 = new GetObjectCommand(getObjectParams);
          let url = await getSignedUrl(s3, command2, {
            expiresIn: 518400,
          });

          //Create the jwt
          const token = jwt.sign(
            {
              id: admin.id,
              user: admin.user,
              email: admin.email,
              photo: url,
            },
            process.env.SECRET_TOKEN,
            {
              expiresIn: "2h",
            }
          );
          //Rewritte the admin info
          admin = {
            id: admin.id,
            user: admin.user,
            email: admin.email,
            photo: url,
            token: token,
          };
          return res.status(200).send(admin);
        } else {
          return res.status(401).send("User not found");
        }
      }
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  });

  app.post("/password", async (req, res) => {
    try {
      const { password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword);
      const match = await bcrypt.compare(password, hashedPassword);
      res.status(201).json({ hashedPassword, match });
    } catch (error) {
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
};
