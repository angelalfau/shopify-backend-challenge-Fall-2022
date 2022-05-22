const express = require("express");
const router = express.Router();
const Item = require("../models/item");

// create new item
router.post("/create-item", async (req, res) => {
  const newItem = new Item({
    title: req.body.title,
    amount: req.body.amount,
  });
  let error = false;
  await Item.findOne({ title: newItem.title }).then(async (res) => {
    console.log(res);
    if (res != null) {
      error = true;
    }
  });
  console.log(newItem);
  if (!error) {
    const post = await newItem.save();
    res.status(200).json(post);
  } else {
    res.status(404).json({ error: "Item already exists" });
  }
});

// delete item completely, given item title
router.delete("/delete-item/:id", async (req, res) => {
  console.log(req.params);
  Item.findByIdAndDelete(req.params.id).catch((err) => {
    console.log(err);
  });
  //   Item.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: "Item deleted" });
});

// change item amount, given item title
router.put("/update-item", async (req, res) => {
  console.log("update item");
  console.log(req.body);
  Item.findByIdAndUpdate(req.body.title, { amount: req.body.amount }).catch(
    (err) => {
      console.log(err);
    }
  );
  res.status(200).json({ message: "Item updated" });
});

// change item amount, given item title
router.get("/read-items", async (req, res) => {
  console.log("read items");
  res.status(200).json(await Item.find());
});

module.exports = router;
