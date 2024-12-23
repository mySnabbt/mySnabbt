import React, { useState } from 'react';
import './App.css';
import {items} from './Data';
import Keypad from './Keypad';
import ItemsSection from './ItemsSection';
import OrderSummary from './OrderSummary';

function App() {
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    const clearTerminal = () => {
        setOrder([]);
        setTotal(0);
    };

    const filteredItems = selectedCategory === 'Drinks'
            ? items.filter(item => item.id >= 1000 && item.id <= 1003)
            : selectedCategory === 'Snacks'
            ? items.filter(item => item.id >= 2000 && item.id <= 2003)
            : selectedCategory === 'Meals'
            ? items.filter(item => item.id >= 3000 && item.id <= 3003)
            : items;

    const addItemToOrder = (item) => {
        const selectedQuantity = quantity === 0 ? 1 : quantity;
        const itemTotal = item.price * selectedQuantity;

        setOrder([...order, { ...item, quantity: selectedQuantity, itemTotal }]);
        setTotal(total + itemTotal);

        setQuantity(1);
    }

    const removeItem = (item) => {
        if (selectedItem) {
            const updatedOrder = order.filter((item) => item.id !== selectedItem.id);
            const updatedTotal = updatedOrder.reduce((sum, item) => sum + item.itemTotal, 0);
            setOrder(updatedOrder);
            setTotal(updatedTotal);
            setSelectedItem(null)
        } else {
            alert('No item selected');
        }
    };

    return (
        <div className="App">
            <header className="app-header">
                <h1>Snabbt POS</h1>
                <div className="username">Welcome, UserName</div>
            </header>
            <main className="main-layout">
                <OrderSummary
                    order={order}
                    total={total}
                    clearTerminal={clearTerminal}
                ></OrderSummary>
                <ItemsSection
                    items={filteredItems}
                    addItemToOrder={addItemToOrder}
                ></ItemsSection>
                <section className="categories-section">
                    <h2>Categories</h2>
                    <ul>
                        <div className="category-buttons">
                            <button onClick={() => setSelectedCategory('Drinks')}>Drinks</button>
                            <button onClick={() => setSelectedCategory('Snacks')}>Snacks</button>
                            <button onClick={() => setSelectedCategory('Meals')}>Meals</button>
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
                    <Keypad 
                        quantity={quantity} 
                        setQuantity={setQuantity} 
                        clearTerminal={clearTerminal} 
                        removeItem={removeItem}
                    />
                </section>
                
            </main>
        </div>
    );
}

export default App;
