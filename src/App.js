import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import users from './Users';
import { useEffect } from 'react';
import Keypad from './Keypad';
import ItemsSection from './ItemsSection';
import OrderSummary from './OrderSummary';
import PaymentWindow from './PaymentWindow';
import RefundWindow from './RefundWindow';
import ManagementLogin from './ManagementLogin';


// CustomData is no longer needed since customisations are in Data.js
// import {customisations} from './CustomData';
import ManagementWindow from './ManagementWindow';
async function detectApiBase() {
  const guesses = [5000, 5001, 5002, 5050];
  for (const p of guesses) {
    try {
      const r = await fetch(`http://localhost:${p}/port`, { mode: 'cors' });
      if (r.ok) {
        const { port } = await r.json();
        return `http://localhost:${port}`;
      }
    } catch (_) {
      // ignore errors, try next port
    }
  }
  throw new Error('API not found on expected ports');
}

function wmoToEmoji(code) {
  if (code === 0) return '☀️';
  if (code === 1 || code === 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
  if ([61, 63, 65, 80, 81, 82].includes(code)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '🌡️';
}

function wmoToText(code) {
  const map = {
    0:  'Clear',
    1:  'Mainly clear',
    2:  'Partly cloudy',
    3:  'Overcast',
    45: 'Fog',
    48: 'Rime fog',

    51: 'Drizzle light',
    53: 'Drizzle',
    55: 'Drizzle heavy',
    56: 'Freezing drizzle light',
    57: 'Freezing drizzle heavy',

    61: 'Rain light',
    63: 'Rain',
    65: 'Rain heavy',
    66: 'Freezing rain light',
    67: 'Freezing rain heavy',

    71: 'Snow light',
    73: 'Snow',
    75: 'Snow heavy',
    77: 'Snow grains',

    80: 'Showers light',
    81: 'Showers',
    82: 'Showers heavy',

    85: 'Snow showers light',
    86: 'Snow showers heavy',

    95: 'Thunderstorm',
    96: 'Thunderstorm light hail',
    99: 'Thunderstorm heavy hail'
  };

  return map[code] ?? 'Weather';
}

function App() {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [role, setRole] = useState('');
    const [currentUser, setCurrentUser] = useState('');
    const [management] = useState(false);
    const [mLogin, setMLogin] = useState(false);
    const [displayManagementPage, setDisplayManagementPage] = useState(false);
    const [status, setStatus] = useState(false);
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [isPaymentWindowOpen, setPaymentWindowOpen] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(null);
    const [isManagementWindowOpen, setManagementWindowOpen] = useState(false);
    const [isManagementLoggedIn, setIsManagementLoggedIn] = useState(false);
    const [managerUser, setManagerUser] = useState('');
    const [managerPass, setManagerPass] = useState('');
    const [showManagementLogin, setShowManagementLogin] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [managerUserActive, setManagerUserActive] = useState(false);
    const [managerPassActive, setManagerPassActive] = useState(false);
    const [now, setNow] = useState(new Date());
    const [weather, setWeather] = useState({ temp: null, code: null, label: '' });
    // --- LIFTED STATE UP: App.js is now the single source of truth for menu items ---
    const [menuItems, setMenuItems] = useState([]);
    // ---------------------------------------------------------------------------------

    const [API_URL, setApiUrl] = useState(null);

    useEffect(() => {
    detectApiBase()
        .then(setApiUrl)
        .catch(err => {
        console.error('Could not detect API base URL', err);
        alert('Backend server not found.');
        });
    }, []);

    const handleLogin = () => {
        const authUser = users.find(
            u => u.pin === String(user) && u.pass === String(pass)
        );

        if (authUser) {
            setIsLoggedIn(true);
            setRole(authUser.role);
            setCurrentUser(authUser.name);
            setUser('');
            setPass('');
            // fetchProducts(); // <— fetch items now
            if (API_URL) fetchProducts();
        } else {
            alert('Please enter a username to log in.');
        }
    };

    useEffect(() => {
        if (isLoggedIn && API_URL) {
            fetchProducts();
        }
    }, [isLoggedIn, API_URL]);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
        }, []);

        useEffect(() => {
        // Try geolocation; fall back to Sydney CBD if blocked/denied
        const fallback = { lat: -33.8688, lon: 151.2093, label: 'Sydney' };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
            (pos) =>
                fetchWeather(pos.coords.latitude, pos.coords.longitude, ''),
            () =>
                fetchWeather(fallback.lat, fallback.lon, fallback.label),
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 5 * 60 * 1000
            }
            );
        } else {
            fetchWeather(fallback.lat, fallback.lon, fallback.label);
        }
        }, []);

    async function fetchWeather(lat, lon, label = '') {
        try {
            // Open-Meteo current weather (CORS-friendly, no API key)
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Australia%2FSydney`;
            const res = await fetch(url);
            const json = await res.json();
            const cw = json && json.current_weather ? json.current_weather : null;

            setWeather({
            temp: cw ? Math.round(cw.temperature) : null,
            code: cw ? cw.weathercode : null,
            label
            });
        } catch (e) {
            console.error('Weather fetch failed:', e);
            setWeather({ temp: null, code: null, label: '' });
        }
    }

    const dateStr = new Intl.DateTimeFormat('en-AU', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Australia/Sydney'
        }).format(now);

        const timeStr = new Intl.DateTimeFormat('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Australia/Sydney'
        }).format(now);

        const weatherStr =
        weather.temp === null
            ? '—'
            : `${weather.temp}°C ${wmoToEmoji(weather.code)}${
                weather.label ? ' • ' + weather.label : ''
            }`;
            

    const handleManagementLogin = () => {
        const authManager = users.find(u => u.pin === String(managerUser) && u.pass === String(managerPass) && u.role === 'manager');
        if (authManager) {
            setIsManagementLoggedIn(true);
            setShowManagementLogin(false);
            setRole(authManager.role);
            setCurrentUser(authManager.name);
            setManagerUser('');
            setManagerPass('');
        } else {
            alert('Invalid management credentials');
        }
    };

    const reLogin = () => {
        if (total === 0) {
            setIsLoggedIn(false);
            setTransactions([]);
        }
        else {
            alert('Order in progress');
        }
    }

    const closeManagementWindow = () => {
        setDisplayManagementPage(false);
    }

    const openPaymentWindow = () => {
        setPaymentWindowOpen(true);
    };

    const closePaymentWindow = (tick, status, meta) => {
        setPaymentWindowOpen(false);

        if (tick || status) {
            clearTerminal();
            updatePaymentDetails({ paidAmount: 0, leftAmount: 0 });

            // Show success toast if we have meta from the payment window
            if (meta && (meta.orderId || meta.method)) {
            setPaymentSuccess({
                orderId: meta.orderId ?? null,
                method: meta.method ?? 'CASH',
                change: typeof meta.change === 'number' ? meta.change : 0,
                amountTendered: typeof meta.amountTendered === 'number' ? meta.amountTendered : 0,
                total: typeof meta.total === 'number' ? meta.total : total
            });

            // Auto-hide after 3.5s
            setTimeout(() => setPaymentSuccess(null), 3500);
            }
        }
    };

    const openManagementWindow = () => {
        setShowManagementLogin(true);
        setDisplayManagementPage(true);
        setManagementWindowOpen(true);
    };

    const [paymentDetails, setPaymentDetails] = useState({
        paidAmount: 0,
        leftAmount: 0,
    });

    const updatePaymentDetails = (details) => {
        setPaymentDetails(details);
    };

    const clearTerminal = () => {
        if (order.length != 0) {
            setOrder([]);
            setTotal(0);
            setSelectedTarget(null);
        }
        else {
            alert('No items to clear');
        }
    };

    const setTick = () => {
        setStatus(true);
    };

    const logTransaction = (orderSnapshot, totalSnapshot) => {
    const currentTransaction = {
        id: Date.now(),
        items: [...orderSnapshot],
        total: totalSnapshot,
        user: currentUser
    };
    setTransactions(prev => [...prev, currentTransaction]);
    };

    const addItemToOrder = (item) => {
        const selectedQuantity = quantity === 0 ? 1 : quantity;
        const itemTotal = item.price * selectedQuantity;
        const uniqueId = `${item.id}-${Date.now()}-${Math.random()}`;

        const newLine = {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: selectedQuantity,
            itemTotal,
            uniqueId,
            appliedCustomisations: [], // start empty; do NOT copy product.customisations
        };

        setOrder([...order, newLine]);
        setTotal(total + itemTotal);
        setQuantity(1);
    };

    const removeItem = () => {
        if (!selectedItem) {
            alert('No selection');
            return;
        }

        // Remove a single customisation
        if (selectedItem.type === 'custom') {
            const { lineId, customUid } = selectedItem;
            let delta = 0;

            const updatedOrder = order.map(line => {
            if (line.uniqueId !== lineId) return line;

            const remaining = (line.appliedCustomisations || []).filter(c => {
                const uid = c.uid ?? `${c.name}-${c.price}`;
                if (uid === customUid) {
                delta = Number(c.price) || 0;
                return false; // drop this one
                }
                return true;
            });

            return {
                ...line,
                appliedCustomisations: remaining,
                itemTotal: line.itemTotal - delta,
            };
            });

            setOrder(updatedOrder);
            setTotal(prev => prev - delta);
            // After removing a custom, keep the line selected for convenience
            setSelectedItem({ type: 'line', lineId });
            return;
        }

        // Remove the whole line
        if (selectedItem.type === 'line') {
            const { lineId } = selectedItem;
            const updatedOrder = order.filter(l => l.uniqueId !== lineId);
            const updatedTotal = updatedOrder.reduce((sum, l) => sum + l.itemTotal, 0);
            setOrder(updatedOrder);
            setTotal(updatedTotal);
            setSelectedItem(null);
            return;
        }

        // Fallback (older shape)
        if (selectedItem.uniqueId) {
            const updatedOrder = order.filter((item) => item.uniqueId !== selectedItem.uniqueId);
            const updatedTotal = updatedOrder.reduce((sum, item) => sum + item.itemTotal, 0);
            setOrder(updatedOrder);
            setTotal(updatedTotal);
            setSelectedItem(null);
        }
        };


    const addCustomisationToOrder = (customisation) => {
        if (!selectedItem || selectedItem.type !== 'line') {
            alert('Please select a line in the order to add a customisation.');
            return;
        }

        const targetId = selectedItem.lineId;
        const price = Number(customisation.price || 0);

        setOrder(prev =>
            prev.map(line => {
            if (line.uniqueId !== targetId) return line;
            const withUid = { ...customisation, uid: cryptoRandom() };
            return {
                ...line,
                appliedCustomisations: [...(line.appliedCustomisations || []), withUid],
                itemTotal: line.itemTotal + price,
            };
            })
        );


        setTotal(prev => prev + price);
    };

    // tiny uid helper (top-level in App.js)
    function cryptoRandom() {
        return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    const submitOrder = async (customerId) => {
        if (!API_URL) return; // wait for backend URL

        const groupedItems = order.reduce((acc, item) => {
            const existing = acc.find(i => i.productId === item.id);
            if (existing) {
            existing.quantity += item.quantity;
            } else {
            acc.push({
                productId: item.id,
                quantity: item.quantity,
                priceEach: item.price,
                user: currentUser
            });
            }
            return acc;
        }, []);

        const orderData = {
            customerId: 1,
            items: groupedItems,
            total: total,
            status: 'PENDING'
        };

        console.log('Submitting orderData:', JSON.stringify(orderData, null, 2));

        try {
            const response = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
            });

            if (!response.ok) {
            const errorDetails = await response.text();
            console.error('Server response:', errorDetails);
            throw new Error('Failed to submit order');
            }

            const data = await response.json();
            alert(`Order submitted successfully! Order ID: ${data.orderId}`);
            setOrder([]);
            setTotal(0);
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Failed to submit the order. Please try again.');
        }
    };

    const fetchTodaysSales = async () => {
        if (!API_URL) return; // wait for backend URL
        try {
            const response = await fetch(`${API_URL}/api/orders/today`);
            const data = await response.json();
            const totalSales = data.reduce((sum, order) => sum + order.total, 0);
            alert(`Total sales today: $${totalSales.toFixed(2)}`);
        } catch (error) {
            console.error('Error fetching today’s sales:', error);
            alert('Failed to fetch today’s sales');
        }
    };

    const fetchProducts = async () => {
        if (!API_URL) return; // don’t run until we know the base URL
        try {
            const res = await fetch(`${API_URL}/api/products`);
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Failed to load products');
            setMenuItems(Array.isArray(json.items) ? json.items : []);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            alert('Failed to load products. Please try again.');
        }
    };

    if (!API_URL) {
        return <div className="App">Connecting to backend…</div>;
    }

    if (!isLoggedIn) {
        return (
            <div className="login-screen">
                <Login user={user} setUser={setUser} pass={pass} setPass={setPass}>
                    <button onClick={handleLogin} className="login-button">
                        Login
                    </button>
                </Login>
            </div>
        );
    }
    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 bg-gray-900 text-white px-4 py-2">
                <div className="relative flex items-center justify-between">
                    <h1 className="font-light tracking-tight leading-none text-2xl sm:text-=3xl md:text-3xl">Envoy</h1>

                    <div className="absolute left-1/2 -translate-x-1/2">
                    <div
                        className="hidden sm:flex items-center gap-2 text-sm opacity-90"
                        title={weather.code != null ? wmoToText(weather.code) : ''}
                    >
                        <span>{dateStr}</span>
                        <span aria-hidden>•</span>
                        <span>{timeStr}</span>
                        <span aria-hidden>•</span>
                        <span>{weatherStr}</span>
                    </div>
                    </div>

                    <button
                    onClick={reLogin}
                    className="rounded-md bg-white text-gray-900 px-3 py-1"
                    >
                    Welcome, {currentUser || 'User'}
                    </button>
                </div>
            </header>



                {/* flex-1 makes this area fill the remaining viewport height */}
                    <main className="flex-1 p-3 grid gap-3 grid-cols-1 md:grid-cols-12">
                {/* Order Summary column — let child fill full height */}

                <section className="md:col-span-3">
                    <OrderSummary
                        order={order}
                        total={total}
                        clearOrder={clearTerminal}
                        selectedItem={selectedItem}
                        setSelectedItem={setSelectedItem}
                        paidAmount={paymentDetails.paidAmount}
                        leftAmount={paymentDetails.leftAmount}
                    />
                </section>

                <section className="md:col-span-6 h-full">
                    <ItemsSection
                        items={menuItems}
                        order={order}
                        selectedCategory={selectedCategory}
                        addItemToOrder={addItemToOrder}
                        selectedItem={selectedItem}
                        setSelectedItem={setSelectedItem}
                        addCustomisationToOrder={addCustomisationToOrder}
                    />
                </section>


                <section className="md:col-span-3 h-full">
                    <div className="h-full rounded-lg border p-3 flex flex-col">
                        {/* Categories at the top */}
                        <h2 className="text-base font-semibold mb-2">Categories</h2>
                            <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`rounded-md border px-3 py-2 ${
                                !selectedCategory ? 'bg-gray-900 text-white' : ''
                                }`}
                            >
                                All
                            </button>

                            <button
                                onClick={() => setSelectedCategory('Food')}
                                className={`rounded-md border px-3 py-2 ${
                                selectedCategory === 'Food' ? 'bg-gray-900 text-white' : ''
                                }`}
                            >
                                Food
                            </button>

                            <button
                                onClick={() => setSelectedCategory('Drinks')}
                                className={`rounded-md border px-3 py-2 ${
                                selectedCategory === 'Drinks' ? 'bg-gray-900 text-white' : ''
                                }`}
                            >
                                Drinks
                            </button>
                        </div>


                        {/* Spacer to push everything else down */}
                        <div className="mt-auto" />

                        {/* Quantity + Submit Order + Total above keypad */}
                        <div className="flex items-center gap-2 mb-3">
                        <label className="text-sm">Quantity:</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-24 rounded-md border px-2 py-1"
                        />
                        </div>

                        <div className="flex items-center justify-end mb-4">
                            <h4 className="font-semibold">
                                Total: ${total.toFixed(2)}
                            </h4>
                        </div>


                        {/* Keypad + Action buttons */}
                        <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Keypad
                            quantity={quantity}
                            setQuantity={setQuantity}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                            onClick={clearTerminal}
                            className="rounded-md border px-3 py-2"
                            >
                            Clear Terminal
                            </button>
                            <button
                            onClick={removeItem}
                            className="rounded-md border px-3 py-2"
                            >
                            Remove
                            </button>
                            <button
                                onClick={openPaymentWindow}
                                disabled={order.length === 0}
                                    className="rounded-md border px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                Payment
                            </button>
                            <button
                            onClick={openManagementWindow}
                            className="rounded-md border px-3 py-2"
                            >
                            Management
                            </button>
                        </div>
                        </div>

                        {showManagementLogin && !isManagementLoggedIn && (
                            <ManagementLogin
                                user={managerUser}
                                setUser={setManagerUser}
                                pass={managerPass}
                                setPass={setManagerPass}
                                onLogin={handleManagementLogin}
                                onCancel={() => setShowManagementLogin(false)}
                            />
                        )}

                        {isManagementLoggedIn && displayManagementPage && (
                        <ManagementWindow
                            closeManagementWindow={() => {
                            closeManagementWindow();
                            setIsManagementLoggedIn(false);
                            }}
                            transactions={transactions}
                            menuItems={menuItems}
                            setMenuItems={setMenuItems}
                            apiBase={API_URL}                 // <-- add
                            onLog={(msg) => console.log(msg)} // <-- add (or wire to your own log/toast)
                        />
                        )}
                    </div>
                    </section>


                </main>

                {isPaymentWindowOpen && !isManagementLoggedIn && (
                <PaymentWindow
                    apiBase={API_URL} 
                    closePaymentWindow={closePaymentWindow}
                    total={total}
                    order={order}
                    setTick={setStatus}
                    updatePaymentDetails={updatePaymentDetails}
                    logTransaction={logTransaction}
                />
                )}
                {paymentSuccess && (
                <div
                    role="alert"
                    aria-live="polite"
                    className="fixed top-16 right-4 z-[60] rounded-md bg-green-600 text-white px-4 py-3 shadow-lg"
                >
                    <div className="font-semibold">Payment successful</div>
                    <div className="text-sm mt-0.5">
                    {paymentSuccess.orderId
                        ? `Order #${paymentSuccess.orderId}`
                        : 'Order created'}
                    • {paymentSuccess.method}
                    {paymentSuccess.method === 'CASH'
                        ? ` • Change $${paymentSuccess.change.toFixed(2)}`
                        : ''}
                    </div>
                </div>
                )}

        </div>
    );
}

export default App;