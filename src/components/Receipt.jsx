import React from 'react';

export default function Receipt({ receipt }) {
  if (!receipt) return null;

  const handlePrint = () => {
    const cssLink = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    const content = document.getElementById(`receipt-${receipt.id}`)?.outerHTML || '';
    const w = window.open('', '_blank', 'width=600,height=800');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Receipt</title><link rel="stylesheet" href="${cssLink}"><style>body{padding:20px}</style></head><body>${content}<script>window.onload = ()=>{ window.print(); setTimeout(()=>window.close(),500); };</script></body></html>`);
    w.document.close();
  };

  return (
    <div className="card mt-3" id={`receipt-${receipt.id}`}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <strong>Receipt</strong>
        <button className="btn btn-sm btn-outline-primary" onClick={handlePrint}>Print</button>
      </div>
      <div className="card-body">
        <div className="small text-muted">#{String(receipt.id).slice(0,8)} · {new Date(receipt.createdAt).toLocaleString()}</div>
        <ul className="list-unstyled my-2">
          {receipt.items.map(i => (
            <li key={i.id} className="d-flex justify-content-between">
              <span>{i.name} × {i.quantity}</span>
              <span>₹{Number(i.lineTotal).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="d-flex justify-content-between">
          <strong>Total</strong>
          <strong>₹{Number(receipt.total).toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}
