import React from 'react';

export default function Menu({ menu = [], loading, onAdd, onEdit }) {
  if (loading) return <div className="card p-3">Loading menu…</div>;
  if (!menu.length) return <div className="card p-3">No items. Add dishes in Manage Menu.</div>;

  return (
    <div className="row">
      {menu.map(item => (
        <div className="col-md-6 mb-3 " key={item.id}>
          <div className="card h-100">
            <img src={item.image} alt={item.name} className="card-img-top menu-card-img" />
            <div className="card-body d-flex flex-column bg-dark text-light">
              <h5 className="card-title">{item.name}</h5>
              <p className="card-text text-light mb-2">{item.category}</p>
              <div className="mt-auto d-flex justify-content-between align-items-center">
                <div><strong>₹{Number(item.price).toFixed(0)}</strong></div>
                <div>
                  <button className="btn btn-sm btn-primary me-2" onClick={()=>onAdd(item)}>Add</button>
                  <button className="btn btn-sm btn-outline-secondary bg-danger text-light" onClick={()=>onEdit(item)}>Edit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
