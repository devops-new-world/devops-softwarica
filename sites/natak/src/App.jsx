import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
  const itemsUrl = `${apiBaseUrl}/items`;
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await axios.get(itemsUrl);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [itemsUrl]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(`${itemsUrl}/${editingId}`, form);
        setEditingId(null);
      } else {
        await axios.post(itemsUrl, form);
      }

      setForm({ name: "", description: "" });
      fetchItems();
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${itemsUrl}/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem" }}>
      <h1>Basic CRUD App</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          name="name"
          placeholder="Enter item name"
          value={form.name}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.75rem",
            marginBottom: "1rem",
            fontSize: "1rem",
          }}
        />

        <input
          type="text"
          name="description"
          placeholder="Enter item description"
          value={form.description}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.75rem",
            marginBottom: "1rem",
            fontSize: "1rem",
          }}
        />

        <button type="submit" style={{ padding: "0.75rem 1rem", marginRight: "0.5rem" }}>
          {editingId ? "Update Item" : "Add Item"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", description: "" });
            }}
            style={{ padding: "0.75rem 1rem" }}
          >
            Cancel
          </button>
        )}
      </form>

      <div>
        {items.length === 0 ? (
          <p>No items found.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h3>{item.name}</h3>
              <p>{item.description}</p>

              <button
                onClick={() => handleEdit(item)}
                style={{ marginRight: "0.5rem", padding: "0.5rem 0.75rem" }}
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(item.id)}
                style={{ padding: "0.5rem 0.75rem" }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
