import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [newPriority, setNewPriority] = useState('P3');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
  // Normalize priority (fallback to P3 if missing)
  const normalized = result.map(r => ({ ...r, priority: ['P1','P2','P3'].includes(r.priority) ? r.priority : 'P3' }));
  setData(normalized);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  if (!newItem.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newItem, priority: newPriority }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const result = await response.json();
  setData([...data, { ...result, priority: result.priority || newPriority || 'P3' }]);
  setNewItem('');
  setNewPriority('P3');
    } catch (err) {
      setError('Error adding item: ' + err.message);
      console.error('Error adding item:', err);
    }
  };

  const updatePriority = async (id, priority) => {
    try {
      // Optimistic update
      setData(prev => prev.map(it => it.id === id ? { ...it, priority } : it));
      await updatePriorityRequest(id, priority);
    } catch (e) {
      setError('Error updating priority: ' + e.message);
      // Refresh from server to correct optimistic mismatch
      fetchData();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Frontend with Node Backend</h1>
        <p>Connected to in-memory database</p>
      </header>
      
      <main>
        <section className="add-item-section">
          <h2>Add New Item</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter item name"
            />
            <div className="priority-selector">
              {['P1','P2','P3'].map(p => (
                <button
                  key={p}
                  type="button"
                  className={`priority-btn ${p === newPriority ? 'selected' : ''} priority-${p.toLowerCase()}`}
                  onClick={() => setNewPriority(p)}
                >{p}</button>
              ))}
            </div>
            <button type="submit">Add Item</button>
          </form>
        </section>

        <section className="items-section">
          <h2>Items from Database</h2>
          {loading && <p>Loading data...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && (
            <ul>
              {data.length > 0 ? (
                data.map((item) => (
                  <li key={item.id} className="item-row">
                    <span className="item-name">{item.name}</span>
                    <span className="item-priority-buttons">
                      {['P1','P2','P3'].map(p => (
                        <button
                          key={p}
                          type="button"
                          className={`priority-btn ${p === item.priority ? 'selected' : ''} priority-${p.toLowerCase()}`}
                          onClick={() => updatePriority(item.id, p)}
                        >{p}</button>
                      ))}
                    </span>
                  </li>
                ))
              ) : (
                <p>No items found. Add some!</p>
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

async function updatePriorityRequest(id, priority) {
  const response = await fetch(`/api/items/${id}/priority`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priority })
  });
  if (!response.ok) {
    throw new Error('Failed to update priority');
  }
  return response.json();
}

export default App;