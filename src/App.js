import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import users from './Users';
import { items } from './Data';
import Keypad from './Keypad';
import ItemsSection from './ItemsSection';
import OrderSummary from './OrderSummary';
import PaymentWindow from './PaymentWindow';


// CustomData is no longer needed since customisations are in Data.js
// import {customisations} from './CustomData';
import ManagementWindow from './ManagementWindow';

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
    const [isPaymentWindowOpen, setPaymentWindowOpen] = useState(false);
    const [isManagementWindowOpen, setManagementWindowOpen] = useState(false);
    const [isManagementLoggedIn, setIsManagementLoggedIn] = useState(false);
    const [managerUser, setManagerUser] = useState('');
    const [managerPass, setManagerPass] = useState('');
    const [showManagementLogin, setShowManagementLogin] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [managerUserActive, setManagerUserActive] = useState(false);
    const [managerPassActive, setManagerPassActive] = useState(false);

    // --- LIFTED STATE UP: App.js is now the single source of truth for menu items ---
    const [menuItems, setMenuItems] = useState(items);
    // ---------------------------------------------------------------------------------

    const handleLogin = () => {
        const authUser = users.find(u => u.pin === String(user) && u.pass === String(pass));
        if (authUser) {
            setIsLoggedIn(true);
            setRole(authUser.role);
            setCurrentUser(authUser.name);
            setUser('');
            setPass('');
        } else {
            alert('Please enter a username to log in.');
        }
    };

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
    }

    const closeManagementWindow = () => {
        setDisplayManagementPage(false);
    }

    const openPaymentWindow = () => {
        setPaymentWindowOpen(true);
    };

    const closePaymentWindow = (tick, status) => {
        setPaymentWindowOpen(false);
        if (tick || status) {
            clearTerminal();
            updatePaymentDetails({ paidAmount: 0, leftAmount: 0 })
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
        setOrder([]);
        setTotal(0);
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


    const removeItem = (item) => {
        if (selectedItem) {
            const updatedOrder = order.filter((item) => item.uniqueId !== selectedItem.uniqueId);
            const updatedTotal = updatedOrder.reduce((sum, item) => sum + item.itemTotal, 0);
            setOrder(updatedOrder);
            setTotal(updatedTotal);
            setSelectedItem(null);
        } else {
            alert('No item selected');
        }
    };

    const addCustomisationToOrder = (customisation) => {
        if (!selectedItem) {
            alert('Please select an item in the order to customise.');
            return;
        }

        setOrder(prevOrder =>
            prevOrder.map(line => {
            if (line.uniqueId === selectedItem.uniqueId) {
                const updatedApplied = [...(line.appliedCustomisations || []), customisation];
                return {
                ...line,
                appliedCustomisations: updatedApplied,
                itemTotal: line.itemTotal + customisation.price,
                };
            }
            return line;
            })
        );

        setTotal(prev => prev + customisation.price);
    };


    const submitOrder = async (customerId) => {
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
            const response = await fetch('http://localhost:5000/api/orders', {
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
        try {
            const response = await fetch('http://localhost:5000/api/orders/today');
            const data = await response.json();
            const totalSales = data.reduce((sum, order) => sum + order.total, 0);
            alert(`Total sales today: $${totalSales.toFixed(2)}`);
        } catch (error) {
            console.error('Error fetching today’s sales:', error);
            alert('Failed to fetch today’s sales');
        }
    };
    
    if (!isLoggedIn || management === true) {
        return (
            <div className="App">
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
                <h1 className="text-lg font-semibold">Snabbt POS</h1>
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
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                    paidAmount={paymentDetails.paidAmount}
                    leftAmount={paymentDetails.leftAmount}
                    />
                </section>

                <section className="md:col-span-6 h-full">
                    <ItemsSection
                        items={menuItems}
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
                        <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setSelectedCategory('Food')}
                            className="rounded-md border px-3 py-2"
                        >
                            Food
                        </button>
                        <button
                            onClick={() => setSelectedCategory('Drinks')}
                            className="rounded-md border px-3 py-2"
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

                        <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={submitOrder}
                            className="rounded-md bg-gray-900 text-white px-3 py-2"
                        >
                            Submit Order
                        </button>
                        <h4 className="font-semibold">Total: ${total.toFixed(2)}</h4>
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
                            className="rounded-md border px-3 py-2"
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

        </div>
    );
}

export default App;