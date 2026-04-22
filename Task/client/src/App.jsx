import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:4000/api';

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/items`);
      if (!res.ok) throw new Error('Failed to load items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to save item');
      const newItem = await res.json();
      setItems((current) => [...current, newItem]);
      setName('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();
    if (!editingName.trim() || editingId === null) return;

    try {
      const res = await fetch(`${API_BASE}/items/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName }),
      });
      if (!res.ok) throw new Error('Failed to update item');
      const updatedItem = await res.json();
      setItems((current) => current.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
      setEditingId(null);
      setEditingName('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete item');
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditingName(item.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName('');
  }

  return (
    <div className="app-shell">
      <header>
        <h1>React + PostgreSQL</h1>
        <p>Store items in PostgreSQL and display them in React.</p>
      </header>

      <form onSubmit={editingId ? handleUpdate : handleSubmit} className="item-form">
        <input
          value={editingId ? editingName : name}
          onChange={(e) => (editingId ? setEditingName(e.target.value) : setName(e.target.value))}
          placeholder={editingId ? 'Edit item name' : 'Enter item name'}
        />
        <button type="submit">{editingId ? 'Save' : 'Add Item'}</button>
        {editingId && (
          <button type="button" className="cancel-button" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div>Loading items...</div>
      ) : (
        <ul className="item-list">
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.name}</span>
              <div className="item-actions">
                <button type="button" onClick={() => startEdit(item)}>
                  Edit
                </button>
                <button type="button" className="delete-button" onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


export default App;
