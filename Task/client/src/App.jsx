import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:4000/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      if (!res.ok) throw new Error('Failed to load tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingStatus, setEditingStatus] = useState('pending');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error('Failed to save task');
      const newTask = await res.json();
      setTasks((current) => [newTask, ...current]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();
    if (!editingTitle.trim() || editingId === null) return;

    try {
      const res = await fetch(`${API_BASE}/tasks/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTitle,
          description: editingDescription,
          status: editingStatus,
        }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      const updatedTask = await res.json();
      setTasks((current) => current.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
      cancelEdit();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleStatus(task) {
    try {
      const updatedStatus = task.status === 'done' ? 'pending' : 'done';
      const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: updatedStatus,
        }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updatedTask = await res.json();
      setTasks((current) => current.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
    setEditingDescription(task.description || '');
    setEditingStatus(task.status || 'pending');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle('');
    setEditingDescription('');
    setEditingStatus('pending');
  }

  return (
    <div className="app-shell">
      <header>
        <h1>Task Manager</h1>
        <p>Track your tasks with title, description, and status.</p>
      </header>

      <form onSubmit={editingId ? handleUpdate : handleSubmit} className="item-form">
        <input
          value={editingId ? editingTitle : title}
          onChange={(e) => (editingId ? setEditingTitle(e.target.value) : setTitle(e.target.value))}
          placeholder={editingId ? 'Edit title' : 'Task title'}
        />
        <input
          value={editingId ? editingDescription : description}
          onChange={(e) => (editingId ? setEditingDescription(e.target.value) : setDescription(e.target.value))}
          placeholder={editingId ? 'Edit description' : 'Task description (optional)'}
        />
        {editingId && (
          <select value={editingStatus} onChange={(e) => setEditingStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
          </select>
        )}
        <button type="submit">{editingId ? 'Save Task' : 'Add Task'}</button>
        {editingId && (
          <button type="button" className="cancel-button" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div>Loading tasks...</div>
      ) : (
        <ul className="item-list">
          {tasks.map((task) => (
            <li key={task.id} className={task.status === 'done' ? 'task-done' : ''}>
              <div className="task-summary">
                <strong>{task.title}</strong>
                <span className="task-status">{task.status}</span>
                {task.description && <p>{task.description}</p>}
              </div>
              <div className="item-actions">
                <button type="button" onClick={() => toggleStatus(task)}>
                  {task.status === 'done' ? 'Mark Pending' : 'Mark Done'}
                </button>
                <button type="button" onClick={() => startEdit(task)}>
                  Edit
                </button>
                <button type="button" className="delete-button" onClick={() => handleDelete(task.id)}>
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
