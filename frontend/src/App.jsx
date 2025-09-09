import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:10001';

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getMonthMatrix(year, monthIndexZeroBased) {
  const firstDay = new Date(Date.UTC(year, monthIndexZeroBased, 1));
  const startDayOfWeek = firstDay.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndexZeroBased + 1, 0)).getUTCDate();

  const cells = [];
  for (let i = 0; i < startDayOfWeek; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(new Date(Date.UTC(year, monthIndexZeroBased, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function ExpenseModal({ dateStr, onClose, onSaved, initial }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setAmount(String(initial.amount ?? ''));
      setDescription(initial.description ?? '');
      setLabel(initial.label ?? '');
    }
  }, [initial]);

  async function handleSave(e) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed)) return;
    try {
      setSaving(true);
      const url = initial?._id ? `${API_BASE}/api/expenses/${initial._id}` : `${API_BASE}/api/expenses/daily`;
      const method = initial?._id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, amount: parsed, description, label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save');
      onSaved(data);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{initial?._id ? 'Edit' : 'Add'} expense for {dateStr}</h3>
        <form onSubmit={handleSave}>
          <div className="row" style={{ margin: '8px 0' }}>
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)} style={{ color: 'black' }}
              required
            />
          </div>
          <div className="row" style={{ margin: '8px 0' }}>
            <input
              type="text"
              placeholder="Label (e.g. Food, Travel, Gift)"
              value={description}
              onChange={(e) => setDescription(e.target.value)} style={{ color: 'black' }}
            />
          </div>
          <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewExpensesModal({ dateStr, items, onClose, onEdit, onDelete }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Expenses on {dateStr}</h3>
        <div className="expense-list" style={{ maxHeight: 320, overflow: 'auto' }}>
          {items.map((e) => (
            <div className="expense-item" key={e._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
              <span>
                {e.label ? `[${e.label}] ` : ''}Rs. {e.amount.toFixed(2)}{e.description ? ` - ${e.description}` : ''}
              </span>
              <span style={{ display: 'flex', gap: 6 }}>
                <button className="btn-secondary" onClick={() => onEdit(e)}>Edit</button>
                <button className="btn-secondary" onClick={() => onDelete(e)}>Delete</button>
              </span>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ color: '#7f1d5a', opacity: 0.7 }}>No expenses yet for this day.</div>
          )}
        </div>
        <div className="toolbar" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getUTCMonth());
  const [byDate, setByDate] = useState({});
  const [modalDate, setModalDate] = useState(null);
  const [editing, setEditing] = useState(null);
  const [viewDate, setViewDate] = useState(null);

  const days = useMemo(() => getMonthMatrix(year, monthIndex), [year, monthIndex]);
  const monthHuman = useMemo(
    () => new Date(Date.UTC(year, monthIndex, 1)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }),
    [year, monthIndex]
  );
  const { monthTotal, monthCount } = useMemo(() => {
    let total = 0;
    let count = 0;
    for (const key in byDate) {
      const items = byDate[key] || [];
      count += items.length;
      for (const it of items) total += it.amount || 0;
    }
    return { monthTotal: total, monthCount: count };
  }, [byDate]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_BASE}/api/expenses/daily?year=${year}&month=${monthIndex + 1}`);
      const data = await res.json();
      setByDate(data || {});
    }
    load();
  }, [year, monthIndex]);

  function handleSaved(item) {
    setByDate((prev) => {
      const next = { ...prev };
      const existing = prev[item.date] || [];
      const idx = existing.findIndex((x) => x._id === item._id);
      if (idx >= 0) {
        const copy = existing.slice();
        copy[idx] = item;
        next[item.date] = copy;
      } else {
        next[item.date] = [item, ...existing];
      }
      return next;
    });
  }

  async function handleDelete(expense) {
    if (!confirm('Delete this expense?')) return;
    try {
      await fetch(`${API_BASE}/api/expenses/${expense._id}`, { method: 'DELETE' });
      setByDate((prev) => {
        const items = (prev[expense.date] || []).filter((x) => x._id !== expense._id);
        return { ...prev, [expense.date]: items };
      });
    } catch (e) {
      alert('Failed to delete');
    }
  }

  function goPrevMonth() {
    const d = new Date(Date.UTC(year, monthIndex, 1));
    d.setUTCMonth(d.getUTCMonth() - 1);
    setYear(d.getUTCFullYear());
    setMonthIndex(d.getUTCMonth());
  }

  function goNextMonth() {
    const d = new Date(Date.UTC(year, monthIndex, 1));
    d.setUTCMonth(d.getUTCMonth() + 1);
    setYear(d.getUTCFullYear());
    setMonthIndex(d.getUTCMonth());
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="bg-decor">
        <div className="decor f1" />
        <div className="decor f2" />
        <div className="decor t1" />
        <div className="decor t2" />
      </div>
      <div>
      <div className="hero">
        <div className="hero-card">
          <div className="app-title">🐢  Manya's Expenditure Calendar 💗</div>
          <div className="subtitle">Sweet, simple, and cute money tracking, just like you!</div>
        </div>
        <div className="hero-card">
          <div className="hero-stats">
            <div className="stat">Month: {monthHuman} {year}</div>
            <div className="stat">Spent: Rs. {monthTotal.toFixed(2)}</div>
            <div className="stat">Entries: {monthCount}</div>
          </div>
        </div>
      </div>
      </div>

      <div className="gap-4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="toolbar">
          <button className="nav-btn" onClick={goPrevMonth}>⟨</button>
          <div className="month-label">{monthHuman} {year}</div>
          <button className="nav-btn" onClick={goNextMonth}>⟩</button>
        </div>
      </div>

      <div className="calendar">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={`hdr-${d}`} className="weekday">{d}</div>
        ))}
        {days.map((date, idx) => {
          if (!date) return <div key={idx} />;
          const dateStr = formatDate(date);
          const items = byDate[dateStr] || [];
          const total = items.reduce((s, it) => s + (it.amount || 0), 0);
          return (
            <div key={idx} className="day-cell" onClick={() => setModalDate(dateStr)}>
              <header>🌸 {date.getUTCDate()}</header>
              {total > 0 && <span className="total-badge">Rs. {total.toFixed(0)}</span>}
              {items.length > 0 ? (
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={(ev) => { ev.stopPropagation(); setViewDate(dateStr); }}>View</button>
                </div>
              ) : (
                <div style={{ marginTop: 10, color: '#9f7a93', fontSize: 12 }}>No entries yet</div>
              )}
            </div>
          );
        })}
      </div>

      {modalDate && (
        <ExpenseModal
          dateStr={modalDate}
          onClose={() => { setModalDate(null); setEditing(null); }}
          onSaved={handleSaved}
          initial={editing || null}
        />
      )}
      {viewDate && (
        <ViewExpensesModal
          dateStr={viewDate}
          items={byDate[viewDate] || []}
          onClose={() => setViewDate(null)}
          onEdit={(e) => { setViewDate(null); setEditing(e); setModalDate(e.date); }}
          onDelete={(e) => { setViewDate(null); handleDelete(e); }}
        />
      )}
      <div className="footer">
        <div className="footer-card">Made with 💗 and 🐢 for Manya</div>
      </div>
    </div>
  );
}

function SmallMonthlyTotals({ year }) {
  const [totals, setTotals] = useState({});
  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_BASE}/api/expenses/monthly?year=${year}`);
      const data = await res.json();
      setTotals(data || {});
    }
    load();
  }, [year]);
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} style={{ fontSize: 12, padding: '2px 6px', background: '#f1f5f9', borderRadius: 6 }}>
          {new Date(Date.UTC(2000, i, 1)).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}: ${'{'}(totals[i + 1] || 0).toFixed(0){'}'}
        </span>
      ))}
    </div>
  );
}

export default App;
