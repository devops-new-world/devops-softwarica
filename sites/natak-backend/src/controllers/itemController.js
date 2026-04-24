let items = [
  { id: 1, name: "Item 1", description: "First item" },
  { id: 2, name: "Item 2", description: "Second item" },
];

const getItems = (req, res) => {
  res.json(items);
};

const getItemById = (req, res) => {
  const item = items.find((i) => i.id === Number(req.params.id));

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json(item);
};

const createItem = (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: "Name and description are required" });
  }

  const newItem = {
    id: items.length ? items[items.length - 1].id + 1 : 1,
    name,
    description,
  };

  items.push(newItem);
  res.status(201).json(newItem);
};

const updateItem = (req, res) => {
  const item = items.find((i) => i.id === Number(req.params.id));

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  const { name, description } = req.body;

  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;

  res.json(item);
};

const deleteItem = (req, res) => {
  const index = items.findIndex((i) => i.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Item not found" });
  }

  const deletedItem = items.splice(index, 1);
  res.json(deletedItem[0]);
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};