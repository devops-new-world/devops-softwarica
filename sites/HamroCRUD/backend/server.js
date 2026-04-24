const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(
  process.env.MONGO_URI ||
    "mongodb+srv://rezenkhadgi_db_user:cO7jYybmUX8oZmuw@cluster0.61adj2k.mongodb.net/",
);

const ItemSchema = new mongoose.Schema({ name: String });
const Item = mongoose.model("Item", ItemSchema);

// GET all items
app.get("/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// POST new item
app.post("/items", async (req, res) => {
  const item = new Item({ name: req.body.name });
  await item.save();
  res.json(item);
});
app.put("/items/:id", async (req, res) => {
  const item = await Item.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true },
  );
  res.json(item);
});
// DELETE item
app.delete("/items/:id", async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(5000, () => console.log("Backend running on port 5000"));
