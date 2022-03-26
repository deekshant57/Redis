const Product = require("../model/product.model");

const express = require("express");

const router = express.Router();

const client = require("../configs/redis");

// post request
router.post("", async (req, res) => {
  try {
    const product = await Product.create(req.body);

    const productFind = await Product.find().lean().exec();

    client.set("products", JSON.stringify(productFind));

    return res.status(201).send(product);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

// get all

router.get("", async (req, res) => {
  try {
    client.set("products", async (err, fetchedProducts) => {
      if (fetchedProducts) {
        return res.status(200).send(JSON.parse(fetchedProducts));
      } else {
        try {
          const product = await Product.find().lean().exec();

          client.set("products", JSON.stringify(product));

          return res.status(201).send(product);
        } catch (error) {
          return res.status(500).send({ message: error.message });
        }
      }
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

// get by ID
router.get("/:id", async (req, res) => {
  try {
    client.set(`products.${req.params.id}`, async (err, fetchedProducts) => {
      if (fetchedProducts) {
        return res.status(200).send(JSON.parse(fetchedProducts));
      } else {
        try {
          const product = await Product.findById(req.params.id).lean().exec();

          client.set(`products.${req.params.id}`, JSON.stringify(product));

          return res.status(201).send(product);
        } catch (error) {
          return res.status(500).send({ message: error.message });
        }
      }
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

// Patch or update

router.patch("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .lean()
      .exec();

    const productFind = await Product.find().lean().exec();

    client.set(`products.${req.params.id}`, JSON.stringify(product));
    client.set(`products`, JSON.stringify(productFind));

    return res.status(201).send(product);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
      .lean()
      .exec();

    const productFind = await Product.find().lean().exec();

    client.del(`products.${req.params.id}`);
    client.set(`products`, JSON.stringify(productFind));

    return res.status(201).send(product);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

module.exports = router;
