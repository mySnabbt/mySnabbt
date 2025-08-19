import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import users from './Users';
import { useEffect } from 'react';
import Keypad from './Keypad';
import ItemsSection from './ItemsSection';
import OrderSummary from './OrderSummary';
import PaymentWindow from './PaymentWindow';


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
    // const [selectedItem, setSelectedItem] = useState(null);
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

    // --- LIFTED STATE UP: App.js is now the single source of truth for menu items ---
    const [menuItems, setMenuItems] = useState([]);
    // ---------------------------------------------------------------------------------

    //const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
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

    // useEffect(() => {
    //     if (isLoggedIn) {
    //         // Fetch products only when logged in
    //         fetchProducts();
    //     }
    // }, [isLoggedIn]);
    useEffect(() => {
        if (isLoggedIn && API_URL) {
            fetchProducts();
        }
    }, [isLoggedIn, API_URL]);


    

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


    const removeItem = () => { //No longer passing the item 
        // if (selectedItem) {
        //     const updatedOrder = order.filter((item) => item.uniqueId !== selectedItem.uniqueId);
        //     const updatedTotal = updatedOrder.reduce((sum, item) => sum + item.itemTotal, 0);
        //     setOrder(updatedOrder);
        //     setTotal(updatedTotal);
        //     setSelectedItem(null);
        // } else {
        //     alert('No item selected');
        // }
        if (!selectedTarget) {
            alert('No selection');
            return;
        }

        // Remove whole line
        if (selectedTarget.type === 'line') {
            const { lineId } = selectedTarget;
            const updatedOrder = order.filter(l => l.uniqueId !== lineId);
            const updatedTotal = updatedOrder.reduce((sum, l) => sum + l.itemTotal, 0);
            setOrder(updatedOrder);
            setTotal(updatedTotal);
            setSelectedTarget(null);
            return;
        }

        // Remove just a customisation from a line
        if (selectedTarget.type === 'custom') {
            const { lineId, customUid } = selectedTarget;

            let delta = 0;
            const updatedOrder = order.map(l => {
            if (l.uniqueId !== lineId) return l;
            const remaining = (l.appliedCustomisations || []).filter(c => {
                if (c.uid === customUid) {
                delta = c.price;          // amount to subtract
                return false;
                }
                return true;
            });
            return {
                ...l,
                appliedCustomisations: remaining,
                itemTotal: l.itemTotal - delta,
            };
            });

            setOrder(updatedOrder);
            setTotal(prev => prev - delta);
            setSelectedTarget(null);
            return;
        }
    };

    // const addCustomisationToOrder = (customisation) => {
    //     if (!selectedItem) {
    //         alert('Please select an item in the order to customise.');
    //         return;
    //     }

    //     const { lineId } = selectedTarget;
    //     setOrder(prev =>
    //         prev.map(line => {
    //         if (line.uniqueId !== lineId) return line;
    //         const withUid = { ...customisation, uid: cryptoRandom() }; // add uid
    //         return {
    //             ...line,
    //             appliedCustomisations: [...(line.appliedCustomisations || []), withUid],
    //             itemTotal: line.itemTotal + customisation.price,
    //         };
    //         })
    //     );

    //     setTotal(prev => prev + customisation.price);
    // };
    const addCustomisationToOrder = (customisation) => {
        // must have a selected line
        if (!selectedTarget || selectedTarget.type !== 'line') {
            alert('Select a line item in the order to add a customisation.');
            return;
        }

        const { lineId } = selectedTarget;

        setOrder(prev =>
            prev.map(line => {
            if (line.uniqueId !== lineId) return line;
            const withUid = { ...customisation, uid: cryptoRandom() };
            return {
                ...line,
                appliedCustomisations: [...(line.appliedCustomisations || []), withUid],
                itemTotal: line.itemTotal + customisation.price,
            };
            })
        );

        setTotal(prev => prev + customisation.price);
    };

    // tiny uid helper (top-level in App.js)
    function cryptoRandom() {
        return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }


    // const submitOrder = async (customerId) => {
    //     const groupedItems = order.reduce((acc, item) => {
    //         const existing = acc.find(i => i.productId === item.id);
    //         if (existing) {
    //             existing.quantity += item.quantity;
    //         } else {
    //             acc.push({
    //                 productId: item.id,
    //                 quantity: item.quantity,
    //                 priceEach: item.price,
    //                 user: currentUser
    //             });
    //         }
    //         return acc;
    //     }, []);
    
    //     const orderData = {
    //         customerId: 1,
    //         items: groupedItems,
    //         total: total,
    //         status: 'PENDING'
    //     };
    
    //     console.log('Submitting orderData:', JSON.stringify(orderData, null, 2));
    
    //     try {
    //         const response = await fetch('http://localhost:5000/api/orders', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify(orderData)
    //         });
    
    //         if (!response.ok) {
    //             const errorDetails = await response.text();
    //             console.error('Server response:', errorDetails);
    //             throw new Error('Failed to submit order');
    //         }
    
    //         const data = await response.json();
    //         alert(`Order submitted successfully! Order ID: ${data.orderId}`);
    //         setOrder([]);
    //         setTotal(0);
    //     } catch (error) {
    //         console.error('Error submitting order:', error);
    //         alert('Failed to submit the order. Please try again.');
    //     }
    // };
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


    // const fetchTodaysSales = async () => {
    //     try {
    //         const response = await fetch('http://localhost:5000/api/orders/today');
    //         const data = await response.json();
    //         const totalSales = data.reduce((sum, order) => sum + order.total, 0);
    //         alert(`Total sales today: $${totalSales.toFixed(2)}`);
    //     } catch (error) {
    //         console.error('Error fetching today’s sales:', error);
    //         alert('Failed to fetch today’s sales');
    //     }
    // };
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

    // const fetchProducts = async () => {
    //     try {
    //         const res = await fetch(`${API_URL}/api/products`);
    //         const json = await res.json();

    //         if (!res.ok) throw new Error(json.error || 'Failed to load products');

    //         // Expecting { items: [...] } from the backend mapper above
    //         setMenuItems(Array.isArray(json.items) ? json.items : []);
    //     } catch (err) {
    //         console.error('Failed to fetch products:', err);
    //         alert('Failed to load products. Please try again.');
    //     }
    // };
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

    if (!isLoggedIn || management === true) {
        return (
            <div className="login-screen">
                <Login user={user} setUser={setUser} pass={pass} setPass={setPass}/>
                <button onClick={handleLogin} className="login-button">
                    Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 flex items-center justify-between bg-gray-900 text-white px-4 py-2">
                <h1 className="text-lg font-semibold">Envoy</h1>
                    <button onClick={reLogin} className="rounded-md bg-white text-gray-900 px-3 py-1">
                        Welcome, {currentUser || "User"}
                    </button>
                </header>

                {/* flex-1 makes this area fill the remaining viewport height */}
                    <main className="flex-1 p-3 grid gap-3 grid-cols-1 md:grid-cols-12">
                {/* Order Summary column — let child fill full height */}

                <section className="md:col-span-3">
                    <OrderSummary
                        order={order}
                        total={total}
                        clearOrder={clearTerminal}
                        // selectedItem={selectedItem}
                        // setSelectedItem={setSelectedItem}
                        selectedTarget={selectedTarget}
                        setSelectedTarget={setSelectedTarget}
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
                        // selectedItem={selectedItem}
                        // setSelectedItem={setSelectedItem}
                        selectedTarget={selectedTarget}
                        setSelectedTarget={setSelectedTarget}
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
                            Remove Item
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

                        {/* Management login / window */}
                        {showManagementLogin && !isManagementLoggedIn && (
                        <div className="mt-3">
                            <Login
                            user={managerUser}
                            setUser={setManagerUser}
                            pass={managerPass}
                            setPass={setManagerPass}
                            title="Management Login"
                            >
                            <div className="mt-2 flex gap-2">
                                <button
                                onClick={handleManagementLogin}
                                className="rounded-md bg-gray-900 text-white px-3 py-1"
                                >
                                Login
                                </button>
                                <button
                                onClick={() => setShowManagementLogin(false)}
                                className="rounded-md border px-3 py-1"
                                >
                                Cancel
                                </button>
                            </div>
                            </Login>
                        </div>
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
                        />
                        )}
                    </div>
                    </section>


                </main>

                {isPaymentWindowOpen && !isManagementLoggedIn && (
                <PaymentWindow
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