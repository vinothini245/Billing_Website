import React, { useEffect, useState } from 'react';

export default function ManageMenu({ menu = [], loading, initialForm, editingId, onSave, onEdit, onDelete }) {
  const [form, setForm] = useState(initialForm || { name:'', price:'', image:'', category:'' });
  const [errors, setErrors] = useState({});

  useEffect(()=> setForm(initialForm || { name:'', price:'', image:'', category:'' }), [initialForm]);

  // basic validation
  useEffect(() => {
    const e = {};
    if (!form.name || !form.name.trim()) e.name = 'Name is required';
    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Enter a valid price';
    if (form.image && form.image.trim()) {
      try { new URL(form.image.trim()); } catch { e.image = 'Invalid image URL'; }
    }
    setErrors(e);
  }, [form]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;
    onSave({ ...form, price: Number(form.price) });
    setForm({ name:'', price:'', image:'', category:'' });
  };

  return (
    <div className="row g-3">
      <div className="col-lg-5">
        <div className="card p-3">
          <h5>{editingId ? 'Edit Item' : 'Add Menu Item'}</h5>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-2">
              <label className="form-label">Name</label>
              <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="mb-2">
              <label className="form-label">Price (₹)</label>
              <input type="number" className={`form-control ${errors.price ? 'is-invalid' : ''}`} value={form.price} onChange={(e)=>setForm({...form, price: e.target.value === '' ? '' : Number(e.target.value)})} />
              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>
            <div className="mb-2">
              <label className="form-label">Image URL</label>
              <input className={`form-control ${errors.image ? 'is-invalid' : ''}`} value={form.image} onChange={(e)=>setForm({...form, image:e.target.value})} />
              {errors.image && <div className="invalid-feedback">{errors.image}</div>}
              {/* Preview */}
              {form.image && !errors.image && (
                <img src={form.image} alt="preview" className="mt-2 image-preview" onError={(ev)=>{ ev.currentTarget.style.display='none'; }} />
              )}
            </div>
            <div className="mb-2">
              <label className="form-label">Category</label>
              <input className="form-control" value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} />
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" type="submit" disabled={Object.keys(errors).length > 0}>{editingId ? 'Update' : 'Create'}</button>
              <button type="button" className="btn btn-outline-secondary" onClick={()=>{ setForm({ name:'', price:'', image:'', category:'' }); onEdit && onEdit({id:null}); }}>Reset</button>
            </div>
          </form>
        </div>
      </div>

      <div className="col-lg-7">
        <div className="card p-3">
          <h5>Menu List</h5>
          {loading && <div>Loading…</div>}
          {!loading && !menu.length && <div className="text-muted">No items yet</div>}
          <div className="list-group">
            {menu.map(item => (
              <div key={item.id} className="list-group-item d-flex align-items-center">
                <img src={item.image} alt={item.name} className="me-3" style={{width:48,height:48,objectFit:'cover',borderRadius:6}} />
                <div className="flex-grow-1">
                  <div><strong>{item.name}</strong></div>
                  <div className="text-muted small">₹{Number(item.price).toFixed(0)} · {item.category}</div>
                </div>
                <div>
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={()=>onEdit(item)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>onDelete(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
