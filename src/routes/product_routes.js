import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { validate } from "../authorization/auth.js";
import { Product } from "../model/Product.js";

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Endpoints para produtos
 */

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Insere um novo produto
 *     tags: [Products]
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagem do produto (enviada como arquivo)
 *               name:
 *                 type: string
 *                 description: Nome do produto
 *               portion:
 *                 type: string
 *                 description: Porção do produto
 *               price:
 *                 type: number
 *                 description: Preço do produto
 *               type:
 *                 type: string
 *                 description: Tipo do produto
 *     responses:
 *       201:
 *         description: Produto inserido com sucesso
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

 *   get:
 *     summary: Retorna todos os produtos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID do produto
 *                   url:
 *                     type: string
 *                     description: URL da imagem do produto
 *                   name:
 *                     type: string
 *                     description: Nome do produto
 *                   portion:
 *                     type: string
 *                     description: Porção do produto
 *                   price:
 *                     type: number
 *                     description: Preço do produto
 *                   type:
 *                     type: string
 *                     description: Tipo do produto
 *       204:
 *         description: Nenhum produto encontrado

 *   put:
 *     summary: Atualiza um produto existente
 *     tags: [Products]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do produto a ser atualizado
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Nova imagem do produto (enviada como arquivo)
 *               name:
 *                 type: string
 *                 description: Novo nome do produto
 *               portion:
 *                 type: string
 *                 description: Nova porção do produto
 *               price:
 *                 type: number
 *                 description: Novo preço do produto
 *               type:
 *                 type: string
 *                 description: Novo tipo do produto
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL da nova imagem do produto
 *                 name:
 *                   type: string
 *                   description: Novo nome do produto
 *                 portion:
 *                   type: string
 *                   description: Nova porção do produto
 *                 price:
 *                   type: number
 *                   description: Novo preço do produto
 *                 type:
 *                   type: string
 *                   description: Novo tipo do produto
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
 *       404:
 *         description: Produto não encontrado
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

 *   patch:
 *     summary: Atualiza parcialmente um produto existente
 *     tags: [Products]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do produto a ser atualizado parcialmente
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Novo nome do produto
 *               portion:
 *                 type: string
 *                 description: Nova porção do produto
 *               price:
 *                 type: number
 *                 description: Novo preço do produto
 *               type:
 *                 type: string
 *                 description: Novo tipo do produto
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL da imagem atualizada do produto
 *                 name:
 *                   type: string
 *                   description: Novo nome do produto
 *                 portion:
 *                   type: string
 *                   description: Nova porção do produto
 *                 price:
 *                   type: number
 *                   description: Novo preço do produto
 *                 type:
 *                   type: string
 *                   description: Novo tipo do produto
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
 *       404:
 *         description: Produto não encontrado
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

 *   delete:
 *     summary: Deleta um produto
 *     tags: [Products]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do produto a ser deletado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:
 *                   type: boolean
 *                   description: Indica se o produto foi deletado com sucesso
 *       401:
 *         description: Não autorizado (Token JWT ausente ou inválido)
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Mensagem de erro
 *       404:
 *         description: Produto não encontrado
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
  app.post("/product", validate, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send({ error: "Nenhuma imagem fornecida" });
      }
      const { name, portion, price, type } = req.body;
      if (!name || !portion || !price || !type) {
        return res.status(400).send({ error: "Debe prencher todos os dados" });
      }

      //Resize the image
      let imagen = await sharp(req.file.buffer)
        .resize({ heigth: 600, width: 400, fit: "contain" })
        .toBuffer();

      //Send the image to s3
      let id_photo = `${uuidv4() - req.file.originalname}`;
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: id_photo,
        Body: imagen,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);
      //Create the product and insert the data in the DB
      let product = {
        src: id_photo,
        name: name,
        portion: portion,
        price: Number(price),
        type: type,
      };
      let newProduct = await Product.create(product);
      //Create the image URL
      let getObjectParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: newProduct.src,
      };

      let command2 = new GetObjectCommand(getObjectParams);
      let url = await getSignedUrl(s3, command2, {
        expiresIn: 518400,
      });

      res.status(201).send({
        url: url,
        name: name,
        portion: portion,
        price: Number(price),
        type: type,
        id: newProduct._id,
      });
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
          type: products[index].type,
        };
      }

      res.status(200).send(products);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  });

  //Update the product
  app.put(
    "/product/:id",
    validate,
    upload.single("image"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).send({ error: "Nenhuma imagem fornecida" });
        }
        const { name, portion, price, type } = req.body;
        if (!name || !portion || !price || !type) {
          return res
            .status(400)
            .send({ error: "Debe prencher todos os dados" });
        }
        //getting the id
        let id_product = req.params.id;
        //deleting the old photo
        let src_imagen = await Product.findById(id_product);
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: src_imagen.src,
        });
        await s3.send(deleteCommand);

        //Uploading the new photo
        let imagen = await sharp(req.file.buffer)
          .resize({ heigth: 600, width: 400, fit: "contain" })
          .toBuffer();

        let id_photo = `${uuidv4() - req.file.originalname}`;
        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: id_photo,
          Body: imagen,
          ContentType: req.file.mimetype,
        };
        const command = new PutObjectCommand(params);
        await s3.send(command);
        //Updating the change in the bd
        let product = await Product.findByIdAndUpdate(
          id_product,
          {
            src: id_photo,
            name: name,
            portion: portion,
            price: price,
            type: type,
          },
          { new: true }
        );
        //Create the new URL for the photo
        let getObjectParams = {
          Bucket: process.env.BUCKET_NAME,
          Key: product.src,
        };

        let command2 = new GetObjectCommand(getObjectParams);
        let url = await getSignedUrl(s3, command2, {
          expiresIn: 518400,
        });
        /* product.url = url;
      delete product.src;
      delete product.__v;*/

        product = {
          url: url,
          name: product.name,
          portion: product.portion,
          price: product.price,
          type: product.type,
        };

        res.status(200).send(product);
      } catch (error) {
        res.status(500).json({ error: error });
      }
    }
  );

  //patch the product
  app.patch("/product/:id", validate, async (req, res) => {
    try {
      const { name, portion, price, type } = req.body;
      if (!name || !portion || !price || !type) {
        return res.status(400).send({ error: "Debe prencher todos os dados" });
      }
      //getting the id
      let id_product = req.params.id;
      let product = await Product.findByIdAndUpdate(
        id_product,
        { name: name, portion: portion, price: price, type: type },
        { new: true }
      );
      let getObjectParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: product.src,
      };

      let command2 = new GetObjectCommand(getObjectParams);
      let url = await getSignedUrl(s3, command2, {
        expiresIn: 518400,
      });
      product = {
        url: url,
        name: product.name,
        portion: product.portion,
        price: product.price,
        type: product.type,
      };

      res.status(200).send(product);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  });

  //route to del 1 Product(Delete)
  app.delete("/product/:id", validate, async (req, res) => {
    try {
      //get the id
      let id_product = req.params.id;
      let src_imagen = await Product.findById(id_product);
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: src_imagen.src,
      });

      //Deleting the product of the database
      let deleted = await Product.findByIdAndDelete(id_product);
      if (!deleted) {
        return res.status(404).send({ message: "Produto não encontrado" });
      }

      // Command to delete the object from S3
      await s3.send(deleteCommand);

      res.status(200).send({ deleted: true });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Ocurreu um error ao intentar eliminar o produto" });
    }
  });
};
