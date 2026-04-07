import React from 'react';

export default function Cart({ cart = [], subtotal = 0, onInc, onDec, onRemove, onClear, onCheckout, onShowQR }) {
  return (
    <div className="card mb-3 ">
      <div className="card-header d-flex justify-content-between align-items-center">
        <strong>Current Bill</strong>
        <div>
          <button className="btn btn-sm btn-outline-secondary me-2 bg-primary text-light" onClick={onClear} disabled={!cart.length}>Clear</button>
          <button className="btn btn-sm btn-outline-secondary text-light bg-success" onClick={()=>window.print()}>Print</button>
        </div>
      </div>
      <div className="card-body">
        {!cart.length && <div className="text-muted">No items in bill</div>}
        {cart.map(line => (
          <div key={line.id} className="d-flex align-items-center mb-2 cart-item">
            <img src={line.image} alt={line.name} className="me-2" />
            <div className="flex-grow-1">
              <div><strong>{line.name}</strong></div>
              <div className="text-muted small">₹{Number(line.price).toFixed(0)} × {line.quantity}</div>
            </div>
            <div className="text-end">
              <div className="btn-group btn-group-sm" role="group">
                <button className="btn btn-outline-secondary" onClick={()=>onDec(line.id)}>-</button>
                <button className="btn btn-outline-secondary" onClick={()=>onInc(line.id)}>+</button>
              </div>
              <div className="mt-1">
                <button className="btn btn-sm btn-link text-danger" onClick={()=>onRemove(line.id)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
        <hr />
        <div className="d-flex justify-content-between">
          <strong>Subtotal</strong>
          <strong>₹{Number(subtotal).toFixed(2)}</strong>
        </div>
        <div className="mt-3 d-grid gap-2">
          <button className="btn btn-outline-success bg-info text-light" onClick={onShowQR} disabled={!cart.length}>Pay via QR</button>
          <button className="btn btn-outline-success bg-success text-light" onClick={onCheckout} disabled={!cart.length}>Checkout & Save Bill</button>
        </div>
      </div>
    </div>
  );
}
