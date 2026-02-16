import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_BASE = 'http://localhost:8001';

interface User {
  email: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
}

interface Order {
  timestamp: string;
  total_price: number;
  items: any[];
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'signup' | 'menu' | 'history'>('login');
  const [menu, setMenu] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState('');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API_BASE}/menu`);
      setMenu(res.data);
    } catch (err) {
      console.error("Failed to fetch menu");
    }
  };

  const fetchOrders = async (email: string) => {
    try {
      const res = await axios.get(`${API_BASE}/orders/${email}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/login?email=${email}&passcode=${passcode}`);
      setUser({ email: res.data.email, name: res.data.name });
      setView('menu');
      fetchOrders(res.data.email);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API_BASE}/register`, { email, name, passcode });
      alert('Profile created! Please login.');
      setView('login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed');
    }
  };

  const placeOrder = async (product: Product) => {
    if (!user) return;
    try {
      await axios.post(`${API_BASE}/orders`, {
        email: user.email,
        items: [{ product_id: product.id, name: product.name, quantity: 1, price: product.price }],
        total_price: product.price
      });
      alert(`Ordered ${product.name}!`);
      fetchOrders(user.email);
    } catch (err) {
      alert('Failed to place order');
    }
  };

  const logout = () => {
    setUser(null);
    setView('login');
    setEmail('');
    setName('');
    setPasscode('');
  };

  return (
    <div className="app-container">
      <header>
        <h1 onClick={() => setView(user ? 'menu' : 'login')} style={{cursor: 'pointer'}}>EarlyBirds</h1>
        <div className="profile-section">
          {user ? (
            <>
              <span onClick={() => setView('history')} style={{cursor: 'pointer'}}>History</span>
              <div className="profile-badge">{user.name[0].toUpperCase()}</div>
              <span>{user.name}</span>
              <button onClick={logout} style={{width: 'auto', padding: '0.4rem 0.8rem'}}>Logout</button>
            </>
          ) : (
            <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} style={{width: 'auto', padding: '0.4rem 0.8rem'}}>
              {view === 'login' ? 'Join Now' : 'Sign In'}
            </button>
          )}
        </div>
      </header>

      <main>
        {view === 'login' && !user && (
          <div className="auth-card">
            <h2>Welcome Back</h2>
            {error && <p style={{color: 'var(--error)'}}>{error}</p>}
            <form onSubmit={handleLogin}>
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label>Passcode</label>
              <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} required />
              <button type="submit">Sign In</button>
            </form>
          </div>
        )}

        {view === 'signup' && !user && (
          <div className="auth-card">
            <h2>Create Profile</h2>
            {error && <p style={{color: 'var(--error)'}}>{error}</p>}
            <form onSubmit={handleSignup}>
              <label>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label>Passcode</label>
              <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} required />
              <button type="submit">Create Profile</button>
            </form>
          </div>
        )}

        {user && view === 'menu' && (
          <div className="menu-grid">
            {menu.map(item => (
              <div key={item.id} className="product-card">
                <img src={item.image_url} alt={item.name} className="product-image" />
                <div className="product-info">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span className="product-price">${item.price.toFixed(2)}</span>
                    <button onClick={() => placeOrder(item)} style={{width: 'auto'}}>Order</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {user && view === 'history' && (
          <div className="order-history">
            <h2>Your Order History</h2>
            {orders.length === 0 ? <p>No orders yet. Time for coffee?</p> : 
              orders.map((order, i) => (
                <div key={i} className="order-item">
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <strong>{new Date(order.timestamp).toLocaleString()}</strong>
                    <span className="product-price">${order.total_price.toFixed(2)}</span>
                  </div>
                  <ul>
                    {order.items.map((it: any, j: number) => (
                      <li key={j}>{it.name} x {it.quantity}</li>
                    ))}
                  </ul>
                </div>
              ))
            }
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
