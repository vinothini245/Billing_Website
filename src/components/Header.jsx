import React from 'react';

export default function Header({ onViewSales }) {
  return (
    <header className="d-flex align-items-center bg-dark text-light mb-3 p-3 rounded">
      <div>
        <h1 className="h3 mb-0">Foody House</h1>
        <small className=" text-light">Quick billing for your restaurant</small>
      </div>
      <div className="ms-auto">
        <button className="btn btn-outline-primary btn-sm bg-warning text-dark" onClick={onViewSales}>Sales Report</button>
      </div>
    </header>
  );
}
