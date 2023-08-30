import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import multer from "multer";
import { validate } from "../authorization/auth.js";
import { Product } from "../model/Product.js";

export const ProductRoutes = (app) => {
  const upload = multer({ storage: multer.memoryStorage() });
  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
    region: process.env.BUCKET_REGION,
  });
  //inserir
  app.post("/product", validate, async (req, res) => {
    const { name, portion, price } = req.body;
    const src = "from AWS";
    const product = {
      name,
      portion,
      price,
    };
    try {
      await Product.create(product);
      res.status(201).send({ message: "Produto inserido exitosamente" });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  });

  //route to get all Product(Read)
  app.get("/products", async (req, res) => {
    try {
      let products = await Product.find();
      if (!products) {
        res.status(204).send({ message: "No encontramos nehum produto" });
        return;
      }
      for (let index = 0; index < products.length; index++) {
        //Creating the temporal URL for the bucket object for each product and send to the client
        let getObjectParams = {
          Bucket: process.env.BUCKET_NAME,
          Key: products[index].src,
        };

        let command2 = new GetObjectCommand(getObjectParams);
        let url = await getSignedUrl(s3, command2, {
          expiresIn: 518400,
        });
        // products[index].url = url;
        // delete products[index].src;
        products[index] = {
          id: products[index].id,
          url: url,
          name: products[index].name,
          portion: products[index].portion,
          price: products[index].price,
        };
      }

      res.status(200).send(products);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  });
  //route to del 1 Product(Delete)
  app.delete("/product/:id", async (req, res) => {
    try {
      //get the id
      let id_product = req.params.id;
      let src_imagen = await Product.findById(id_product);
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: src_imagen.src,
      });

      // Command to delete the object from S3
      await s3.send(deleteCommand);
      //Deleting the product of the database
      await Product.findByIdAndDelete(id_product);
      res.status(200).send({ deleted: true });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Ocurreu um error ao intentar eliminar o produto" });
    }
  });
};
