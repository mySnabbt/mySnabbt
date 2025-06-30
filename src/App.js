import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import {items} from './Data';
import Keypad from './Keypad';
import ItemsSection from './ItemsSection';
import OrderSummary from './OrderSummary';
import PaymentWindow from './PaymentWindow';
import {customisations} from './CustomData';
import ManagementWindow from './ManagementWindow';

function App() {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
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


    const handleLogin = () => {
        if (String(user).trim() !== '' && String(user) === '1234' && String(pass).trim() !== '' && String(pass) === '1234') {
            setIsLoggedIn(true);
            setUser('');
            setPass('');
        } else {
            alert('Please enter a username to log in.');
        }
    };

    const handleManagementLogin = () => {
        if (String(managerUser).trim() !== '' && String(managerUser) === '1234' && String(managerPass).trim() !== '' && String(managerPass) === '1234') {
            setIsManagementLoggedIn(true);
            setShowManagementLogin(false);
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

    const closePaymentWindow = () => {
        setPaymentWindowOpen(false);
        clearTerminal();
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
    };
    setTransactions(prev => [...prev, currentTransaction]);
    };

    const filteredItems = selectedCategory === 'Drinks'
            ? items.filter(item => item.id >= 1000 && item.id <= 1003)
            : selectedCategory === 'Food'
            ? items.filter(item => item.id >= 2000 && item.id <= 3003)
            : items;
    const filteredCustomisations = selectedCategory === 'Food'
        ? customisations.filter(customisation => customisation.id >= 10000 && customisation.id <= 10003)
        : selectedCategory === 'Drinks'
        ? customisations.filter(customisation => customisation.id >= 20000 && customisation.id <= 20003)
        : customisations;

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
    
    }
    
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
                    items={filteredItems}
                    addItemToOrder={addItemToOrder}
                    customisations={filteredCustomisations}
                    addCustomisationToOrder={addCustomisationToOrder}
                ></ItemsSection>
                <section className="categories-section">
                    <h2>Categories</h2>
                    <ul>
                        <div className="category-buttons">
                            <button onClick={() => setSelectedCategory('Drinks')}>Drinks</button>
                            <button onClick={() => setSelectedCategory('Food')}>Food</button>
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
                            {/* <button onClick={managementLogin} > Management </button> */}
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
                                    setIsManagementLoggedIn(false); // log out manager
                                }}
                                transactions={transactions}
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