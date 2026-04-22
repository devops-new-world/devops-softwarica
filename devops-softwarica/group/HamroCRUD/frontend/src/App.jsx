import { useEffect, useState } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Inject global styles ──────────────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0b0c0f;
    --surface:  #13151a;
    --border:   #1f2230;
    --accent:   #c8f04a;
    --accent2:  #4af0c8;
    --danger:   #f04a6e;
    --text:     #e8eaf0;
    --muted:    #5a5e72;
    --radius:   12px;
  }

  html, body, #root {
    height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Mono', monospace;
  }

  /* scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* fade-slide in for list items */
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(200,240,74,.35); }
    70%  { box-shadow: 0 0 0 10px rgba(200,240,74,0); }
    100% { box-shadow: 0 0 0 0 rgba(200,240,74,0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// ── Tiny icon components ──────────────────────────────────────────────────────
const IconPlus = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconEdit = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Sub-components ────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        border: "2px solid var(--border)",
        borderTopColor: "var(--accent)",
        borderRadius: "50%",
        animation: "spin .7s linear infinite",
      }}
    />
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const color = type === "error" ? "var(--danger)" : "var(--accent)";
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 999,
        background: "var(--surface)",
        border: `1px solid ${color}`,
        color,
        fontFamily: "'Syne', sans-serif",
        fontWeight: 600,
        fontSize: 13,
        padding: "10px 20px",
        borderRadius: "var(--radius)",
        boxShadow: `0 0 20px ${color}44`,
        animation: "slideIn .25s ease",
        pointerEvents: "none",
      }}
    >
      {msg}
    </div>
  );
}

function ItemRow({ item, index, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(item.name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!val.trim() || val === item.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onEdit(item._id, val.trim());
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(item._id);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setVal(item.name);
      setEditing(false);
    }
  };

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "14px 18px",
        animation: `slideIn .3s ease both`,
        animationDelay: `${index * 55}ms`,
        opacity: deleting ? 0.4 : 1,
        transition: "opacity .3s, transform .2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--muted)")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--border)")
      }
    >
      {/* index badge */}
      <span
        style={{
          minWidth: 26,
          height: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--border)",
          borderRadius: 6,
          fontSize: 11,
          color: "var(--muted)",
          fontFamily: "'DM Mono', monospace",
          flexShrink: 0,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* name / edit input */}
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={handleKey}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            borderBottom: "1px solid var(--accent)",
            outline: "none",
            color: "var(--text)",
            fontFamily: "'DM Mono', monospace",
            fontSize: 14,
            padding: "2px 4px",
          }}
        />
      ) : (
        <span style={{ flex: 1, fontSize: 14, letterSpacing: ".01em" }}>
          {item.name}
        </span>
      )}

      {/* action buttons */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {editing ? (
          <>
            <ActionBtn color="var(--accent)" onClick={handleSave} title="Save">
              {saving ? <Spinner /> : <IconCheck />}
            </ActionBtn>
            <ActionBtn
              color="var(--muted)"
              onClick={() => {
                setVal(item.name);
                setEditing(false);
              }}
              title="Cancel"
            >
              <IconX />
            </ActionBtn>
          </>
        ) : (
          <>
            <ActionBtn
              color="var(--accent2)"
              onClick={() => setEditing(true)}
              title="Edit"
            >
              <IconEdit />
            </ActionBtn>
            <ActionBtn
              color="var(--danger)"
              onClick={handleDelete}
              title="Delete"
            >
              {deleting ? <Spinner /> : <IconTrash />}
            </ActionBtn>
          </>
        )}
      </div>
    </li>
  );
}

function ActionBtn({ color, onClick, title, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: `1px solid ${color}44`,
        borderRadius: 8,
        color,
        cursor: "pointer",
        transition: "background .15s, box-shadow .15s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${color}18`;
        e.currentTarget.style.boxShadow = `0 0 8px ${color}44`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </button>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "ok" });

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "ok" }), 2200);
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API}/items`);
      setItems(await res.json());
    } catch {
      showToast("Failed to fetch items", "error");
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await fetch(`${API}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      setName("");
      await fetchItems();
      showToast("Item added ✓");
    } catch {
      showToast("Failed to add item", "error");
    } finally {
      setAdding(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      await fetch(`${API}/items/${id}`, { method: "DELETE" });
      await fetchItems();
      showToast("Item removed");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const editItem = async (id, newName) => {
    try {
      await fetch(`${API}/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      await fetchItems();
      showToast("Item updated ✓");
    } catch {
      showToast("Failed to update", "error");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60px 16px 80px",
        background: `
        radial-gradient(ellipse 80% 40% at 50% -10%, #c8f04a12 0%, transparent 70%),
        var(--bg)
      `,
      }}
    >
      {/* ── Header ── */}
      <header style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 999,
            padding: "5px 16px",
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: ".12em",
            textTransform: "uppercase",
            marginBottom: 20,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
              animation: "pulse-ring 2s ease infinite",
              display: "inline-block",
            }}
          />
          Live · MongoDB Atlas
        </div>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2rem, 6vw, 3.2rem)",
            lineHeight: 1.1,
            letterSpacing: "-.03em",
            color: "var(--text)",
          }}
        >
          Hamro{" "}
          <span
            style={{
              color: "var(--accent)",
              textShadow: "0 0 40px #c8f04a66",
            }}
          >
            CRUD
          </span>{" "}
          App
        </h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 13,
            marginTop: 10,
            letterSpacing: ".04em",
          }}
        >
          {items.length} item{items.length !== 1 ? "s" : ""} in collection
        </p>
      </header>

      {/* ── Input card ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "20px",
          marginBottom: 28,
          display: "flex",
          gap: 10,
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Enter item name…"
          style={{
            flex: 1,
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "var(--text)",
            fontFamily: "'DM Mono', monospace",
            fontSize: 14,
            outline: "none",
            transition: "border-color .2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <button
          onClick={addItem}
          disabled={adding || !name.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            background: name.trim() ? "var(--accent)" : "var(--border)",
            color: name.trim() ? "#0b0c0f" : "var(--muted)",
            border: "none",
            borderRadius: 8,
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            cursor: name.trim() ? "pointer" : "not-allowed",
            transition: "background .2s, color .2s, box-shadow .2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            if (name.trim())
              e.currentTarget.style.boxShadow = "0 0 20px #c8f04a55";
          }}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          {adding ? <Spinner /> : <IconPlus />}
          Add Item
        </button>
      </div>

      {/* ── List ── */}
      <div style={{ width: "100%", maxWidth: 560 }}>
        {loading ? (
          <div
            style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}
          >
            <Spinner />
            <p style={{ marginTop: 12, fontSize: 13 }}>Loading items…</p>
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "var(--surface)",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
            <p>No items yet.</p>
            <p style={{ marginTop: 4 }}>Add something above to get started.</p>
          </div>
        ) : (
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {items.map((item, i) => (
              <ItemRow
                key={item._id}
                item={item}
                index={i}
                onDelete={deleteItem}
                onEdit={editItem}
              />
            ))}
          </ul>
        )}
      </div>

      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}
