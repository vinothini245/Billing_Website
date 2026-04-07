import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import Menu from './components/Menu';
import Cart from './components/Cart';
import ManageMenu from './components/ManageMenu';
import Receipt from './components/Receipt';
import { fetchMenu, createMenuItem, updateMenuItem, removeMenuItem, fetchSales, createSale, clearAllSales } from './api';
import './App.css';

function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('restaurant-cart-v1')) || []; } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState('billing');
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [formInit, setFormInit] = useState({ name: '', price: '', image: '', category: '' });
  const [notification, setNotification] = useState('');
  const [receipt, setReceipt] = useState(null);

  // new UI state for QR and sales report
  const [payModal, setPayModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [sales, setSales] = useState([]);

  useEffect(() => localStorage.setItem('restaurant-cart-v1', JSON.stringify(cart)), [cart]);
 
  useEffect(() => { if (!notification) return; const t = setTimeout(()=>setNotification(''),3500); return ()=>clearTimeout(t); }, [notification]);
  useEffect(() => { loadMenu(); loadSales(); }, []);

  const loadMenu = async () => {
    setLoadingMenu(true);
    try {
      const items = await fetchMenu();
      setMenu(items);
    } catch (e) {
      console.error(e);
      setNotification('Failed to load menu.');
    } finally { setLoadingMenu(false); }
  };

  // load sales from backend
  const loadSales = async () => {
    try {
      const list = await fetchSales();
      setSales(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('fetchSales', err);
      setNotification('Failed to load sales.');
    }
  };

  const addToCart = (item) => {
     setCart(prev => {
       const found = prev.find(p => p.id === item.id);
       if (found) return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
       return [...prev, { ...item, quantity: 1 }];
     });
     setNotification(`${item.name} added`);
   };
 
   const changeQuantity = (id, delta) => {
     setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
   };
 
   const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
 
   const clearCart = () => { setCart([]); setReceipt(null); setNotification('Cart cleared'); };
 
   const cartSubtotal = useMemo(() => cart.reduce((s,i)=>s + Number(i.price)*i.quantity, 0), [cart]);
 
   const handleCheckout = async () => {
    if (!cart.length) {
      setNotification('Cart is empty');
      return;
    }

    const items = cart.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      lineTotal: Number(i.price) * i.quantity,
    }));
    const total = items.reduce((s, i) => s + i.lineTotal, 0);
    const order = {
      // backend will generate id; include createdAt for client convenience
      items,
      total,
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = await createSale(order);
      setReceipt(saved);
      setCart([]);
      setSales((prev) => [...prev, saved]);
      setNotification('Bill saved');
    } catch (err) {
      console.error('createSale', err);
      setNotification('Failed to save bill');
    }
  };
 
   const handleCreateOrUpdate = async (payload) => {
     try {
       if (editingId) {
         await updateMenuItem(editingId, payload);
         setNotification('Item updated');
       } else {
         await createMenuItem(payload);
         setNotification('Item created');
       }
       setEditingId('');
       setFormInit({ name: '', price: '', image: '', category: '' });
       await loadMenu();
     } catch (e) {
       console.error(e);
       setNotification('Save failed');
     }
   };
 
   const handleEdit = (item) => {
     setEditingId(item.id);
     setFormInit({ name: item.name, price: item.price, image: item.image, category: item.category });
     setActiveTab('manage');
   };
 
   const handleDelete = async (id) => {
     if (!confirm('Delete item?')) return;
     try { await removeMenuItem(id); setNotification('Deleted'); await loadMenu(); } catch (e) { setNotification('Delete failed'); }
   };
 
   // QR value for current cart subtotal
   const qrValue = encodeURIComponent(`upi://pay?pn=Foody%20House&am=${cartSubtotal.toFixed(2)}&cu=INR`);
 
   const totalSold = useMemo(() => sales.reduce((s,r) => s + Number(r.total || 0), 0), [sales]);
 
   const clearSales = async () => {
     if (!confirm('Clear all sales records?')) return;
     try {
       await clearAllSales();
       setSales([]);
       setNotification('Sales cleared');
       setReportModal(false);
     } catch (err) {
       console.error('clearAllSales', err);
       setNotification('Failed to clear sales');
     }
   };
 
   return (
     <div className="container my-4">
       <Header onViewSales={() => setReportModal(true)} />
       <ul className="nav nav-tabs my-3">
         <li className="nav-item">
           <button className={`nav-link ${activeTab==='billing' ? 'active' : ''}`} onClick={()=>setActiveTab('billing')}>Billing</button>
         </li>
         <li className="nav-item">
           <button className={`nav-link ${activeTab==='manage' ? 'active' : ''}`} onClick={()=>setActiveTab('manage')}>Manage Menu</button>
         </li>
       </ul>

       {notification && <div className="alert alert-info">{notification}</div>}

       {activeTab === 'billing' && (
         <div className="row g-3">
           <div className="col-lg-8">
             <Menu menu={menu} loading={loadingMenu} onAdd={addToCart} onEdit={handleEdit} />
           </div>
           <div className="col-lg-4">
             <Cart
               cart={cart}
               subtotal={cartSubtotal}
               onInc={(id)=>changeQuantity(id,1)}
               onDec={(id)=>changeQuantity(id,-1)}
               onRemove={removeFromCart}
               onClear={clearCart}
               onCheckout={handleCheckout}
               onShowQR={() => setPayModal(true)}
              />
             {receipt && <Receipt receipt={receipt} />}
           </div>
         </div>
       )}

       {activeTab === 'manage' && (
         <ManageMenu
           menu={menu}
           loading={loadingMenu}
           initialForm={formInit}
           editingId={editingId}
           onSave={handleCreateOrUpdate}
           onEdit={handleEdit}
           onDelete={handleDelete}
         />
       )}

       {/* QR Modal */}
       {payModal && (
         <div className="modal" style={{display:'block', background:'rgba(0,0,0,0.5)'}}>
           <div className="modal-dialog modal-sm modal-dialog-centered">
             <div className="modal-content">
               <div className="modal-header">
                 <h5 className="modal-title">Scan to Pay</h5>
                 <button className="btn-close" onClick={() => setPayModal(false)} />
               </div>
               <div className="modal-body text-center">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrValue}`} alt="QR" />
                 <p className="mt-2">Amount: ₹{cartSubtotal.toFixed(2)}</p>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Sales Report Modal */}
       {reportModal && (
         <div className="modal" style={{display:'block', background:'rgba(0,0,0,0.5)'}}>
           <div className="modal-dialog modal-lg modal-dialog-centered">
             <div className="modal-content">
               <div className="modal-header">
                 <h5 className="modal-title">Sales Report</h5>
                 <button className="btn-close" onClick={() => setReportModal(false)} />
               </div>
               <div className="modal-body">
                 <div className="mb-3">
                   <strong>Total sold:</strong> ₹{Number(totalSold).toFixed(2)}
                 </div>
                 <div style={{maxHeight:300, overflow:'auto'}}>
                   {sales.length === 0 && <div className="text-muted">No sales yet</div>}
                   <ul className="list-group">
                     {sales.map(s => (
                       <li key={s.id} className="list-group-item">
                         <div className="d-flex justify-content-between">
                           <div>
                             <strong>#{String(s.id).slice(0,8)}</strong>
                             <div className="small text-muted">{new Date(s.createdAt).toLocaleString()}</div>
                           </div>
                           <div className="text-end">
                             <div>₹{Number(s.total).toFixed(2)}</div>
                           </div>
                         </div>
                       </li>
                     ))}
                   </ul>
                 </div>
               </div>
               <div className="modal-footer">
                 <button className="btn btn-danger" onClick={clearSales}>Clear Sales</button>
                 <button className="btn btn-secondary" onClick={() => setReportModal(false)}>Close</button>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }
 
 export default App;
