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
        setOrder([...order, { ...item, quantity: selectedQuantity, itemTotal, uniqueId }]);
        setTotal(total + itemTotal);
        setQuantity(1);
    }

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
            prevOrder.map(item => {
                if (item.uniqueId === selectedItem.uniqueId) {
                    const updatedCustoms = [...(item.customisations || []), customisation];
                    return {
                        ...item,
                        customisations: updatedCustoms,
                        itemTotal: item.itemTotal + customisation.price,
                    };
                }
                return item;
            })
        );
        setTotal(prevTotal => prevTotal + customisation.price);
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
        <div className="App">
            <header className="app-header">
                <h1>Snabbt POS</h1>
                <button onClick={reLogin}> 
                Welcome, UserName </button>
            </header>
            <main className="main-layout">
                <OrderSummary
                    order={order}
                    total={total}
                    clearTerminal={clearTerminal}
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                    setStatus={status} 
                    status={status}
                    paidAmount={paymentDetails.paidAmount}
                    leftAmount={paymentDetails.leftAmount}
                ></OrderSummary>
                <ItemsSection
                    // --- PASS THE SHARED STATE AND CATEGORY DOWN AS PROPS ---
                    items={menuItems}
                    selectedCategory={selectedCategory}
                    // --------------------------------------------------------
                    addItemToOrder={addItemToOrder}
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                    addCustomisationToOrder={addCustomisationToOrder}
                ></ItemsSection>
                <section className="categories-section">
                    <h2>Categories</h2>
                    <ul>
                        <div className="category-buttons">
                            <button onClick={() => setSelectedCategory('Food')}>Food</button>
                            <button onClick={() => setSelectedCategory('Drinks')}>Drinks</button>
                        </div>
                    </ul>
                    <div className="quantity-input">
                        <label>Quantity: </label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                        />
                    </div>
                    <div className="order-summary-divider">
                        <button onClick={submitOrder}>Submit Order</button>
                        <h4>Order Total: ${total.toFixed(2)}</h4>
                    </div>
                    <div className="box">
                        <Keypad 
                            quantity={quantity} 
                            setQuantity={setQuantity} 
                            openPaymentWindow={openPaymentWindow}
                        />
                        <div className="box1">
                            <button onClick={clearTerminal} className='button'> Clear Terminal </button>
                            <button onClick={removeItem} className='button'> Remove Item </button>
                            <button onClick={openPaymentWindow} className='button'> Payment </button>
                            <button onClick={openManagementWindow} > Management </button>
                        </div>
                        {showManagementLogin && !isManagementLoggedIn && (
                                <Login
                                    user={managerUser}
                                    setUser={setManagerUser}
                                    pass={managerPass}
                                    setPass={setManagerPass}
                                >
                                    <button onClick={handleManagementLogin} className="login-button">
                                        Login
                                    </button>
                                    <button onClick={() => setShowManagementLogin(false)} className="login-button">
                                        Cancel
                                    </button>
                                </Login>
                        )}
                        {isManagementLoggedIn && displayManagementPage && (
                            <ManagementWindow 
                                closeManagementWindow={() => {
                                    closeManagementWindow();
                                    setIsManagementLoggedIn(false);
                                }}
                                transactions={transactions}
                                // --- PASS THE STATE AND SETTER DOWN AS PROPS ---
                                menuItems={menuItems}
                                setMenuItems={setMenuItems}
                                // ------------------------------------------------
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
                    setTick={setTick}
                    updatePaymentDetails={updatePaymentDetails}
                    logTransaction={logTransaction} 
                />
            )}
        </div>
    );
}

export default App;