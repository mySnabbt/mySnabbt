import React, { useState } from 'react';
import './ManagementWindow.css';

// Accept menuItems and setMenuItems as props from App.js
function ManagementWindow({ closeManagementWindow, transactions, menuItems, setMenuItems }) {
    const [selectedOption, setSelectedOption] = useState('');
    const [todaySales, setTodaySales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [salesError, setSalesError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showCustomisationPopup, setShowCustomisationPopup] = useState(false);
    
    // State for adding new items
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState(0);
    const [newItemCategory, setNewItemCategory] = useState('Food');

    // State for adding customisations/contaminants
    const [isAddingCustomisation, setIsAddingCustomisation] = useState(false);
    const [newCustomisationName, setNewCustomisationName] = useState('');
    const [newCustomisationPrice, setNewCustomisationPrice] = useState(0);
    const [isAddingContaminant, setIsAddingContaminant] = useState(false);
    const [newContaminantName, setNewContaminantName] = useState('');
    
    // --- ALL FUNCTION DEFINITIONS ---
    const fetchTodaysSales = async () => {
        setLoading(true);
        setSalesError(null);
        try {
            const response = await fetch('http://localhost:5000/api/orders/today');
            const data = await response.json();
            setTodaySales(data);
            setSelectedOption('sales');
        } catch (error) {
            console.error('Error fetching today’s sales:', error);
            setSalesError('Failed to load sales data.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleItemSelect = (item) => {
        setSelectedItem(item);
        setShowCustomisationPopup(true);
    };

    const closeCustomisationPopup = () => {
        setShowCustomisationPopup(false);
        setSelectedItem(null);
    };

    const handleAddItem = () => {
        const newId = menuItems.length > 0 ? Math.max(...menuItems.map(item => item.id)) + 1 : 1;
        const newItem = {
            id: newId,
            name: newItemName,
            price: newItemPrice,
            category: newItemCategory,
            customisations: [],
            contaminants: []
        };
        setMenuItems([...menuItems, newItem]);
        setNewItemName('');
        setNewItemPrice(0);
        setNewItemCategory('Food');
        setIsAddingItem(false);
    };

    const handleAddCustomisation = () => {
        if (!newCustomisationName || newCustomisationPrice === '') return;
        const newCustomisation = { id: Date.now(), name: newCustomisationName, price: Number(newCustomisationPrice) };
        const updatedItem = { ...selectedItem, customisations: [...selectedItem.customisations, newCustomisation] };
        setMenuItems(menuItems.map(item => item.id === selectedItem.id ? updatedItem : item));
        setSelectedItem(updatedItem);
        setNewCustomisationName('');
        setNewCustomisationPrice(0);
        setIsAddingCustomisation(false);
    };

    const handleAddContaminant = () => {
        if (!newContaminantName) return;
        const updatedItem = { ...selectedItem, contaminants: [...(selectedItem.contaminants || []), newContaminantName] };
        setMenuItems(menuItems.map(item => item.id === selectedItem.id ? updatedItem : item));
        setSelectedItem(updatedItem);
        setNewContaminantName('');
        setIsAddingContaminant(false);
    };

    const filteredItems = selectedCategory
        ? menuItems.filter(item => item.category === selectedCategory)
        : menuItems;

    return (
        <div className="management-fullscreen">
            <div className="management-sidebar">
                <h3>Management Window</h3>
                <ul className="management-options">
                    <li onClick={() => setSelectedOption('editMenu')}>Edit Menu</li>
                    <li onClick={() => setSelectedOption('refund')}>Initiate Refund</li>
                    <li onClick={fetchTodaysSales}>Show Sales Today</li>
                </ul>
                <h4>Administrator options</h4>
                <ul className="admin-options">
                    <li onClick={() => setSelectedOption('roster')}>Employee Roster System</li>
                    <li onClick={() => setSelectedOption('inventory')}>Inventory System</li>
                </ul>
            </div>

            <div className="management-main">
                {selectedOption === '' && (
                    <div className="management-placeholder"></div>
                )}
                
                {selectedOption === 'sales' && (
                    <div className="transaction-card">
                        <h3 className="heading">Transactions:</h3>
                        {loading ? (
                            <p>Loading...</p>
                        ) : salesError ? (
                            <p style={{ color: 'red' }}>{salesError}</p>
                        ) : todaySales.length === 0 ? (
                            <p>No sales made today.</p>
                        ) : (
                            todaySales.map((txn) => (
                                <div key={txn.order_id} className="transaction-card">
                                    <h4>Transaction #{txn.order_id}</h4>
                                    <ul>
                                        {txn.items && txn.items.map((item, idx) => (
                                            <li key={idx}>
                                                Product ID: {item.product_id}, Quantity: {item.quantity}, Price Each: ${item.price_each}
                                            </li>
                                        ))}
                                    </ul>
                                    <hr />
                                    <div className="summary">
                                        Revenue Generated: <strong>${txn.total.toFixed(2)}</strong>
                                    </div>
                                </div>
                            ))
                        )}
                        <button className="print-btn">Print Sales Report Made Today</button>
                    </div>
                )}

                {selectedOption === 'editMenu' && (
                    <>
                        <div className="edit-menu1">
                            <div className="edit-menu01">
                                <button onClick={() => setIsAddingItem(true)}>Add Item</button>
                                <button onClick={() => setSelectedCategory('Food')}>Food</button>
                                <button onClick={() => setSelectedCategory('Drinks')}>Drinks</button>
                            </div>
                            
                            <div className="edit-menu02">
                                {selectedCategory === 'Food' ? (
                                    <h3>Food Menu</h3>
                                ) : selectedCategory === 'Drinks' ? (
                                    <h3>Drinks Menu</h3>
                                ) : (
                                    null
                                )}
                                <div className="edit-menu021">
                                    <div className="item-list">
                                        {filteredItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleItemSelect(item)}
                                                className={`item-button ${selectedItem?.id === item.id ? 'selected' : ''}`}
                                            >
                                                {item.name} - ${item.price.toFixed(2)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="edit-menu022">
                                    <button> Export PDF </button>
                                    <button> Publish Menu </button>
                                </div>
                            </div>
                        </div>

                        {isAddingItem && (
                            <div className="add-item-popup">
                                <button className="close-popup-btn" onClick={() => setIsAddingItem(false)}>X</button>
                                <h3>Add New Item</h3>
                                <div className="form-group">
                                    <label>
                                        Item Name:
                                        <input
                                            type="text"
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        Price:
                                        <input
                                            type="number"
                                            value={newItemPrice}
                                            onChange={(e) => setNewItemPrice(Number(e.target.value))}
                                        />
                                    </label>
                                    <label>
                                        Category:
                                        <select
                                            value={newItemCategory}
                                            onChange={(e) => setNewItemCategory(e.target.value)}
                                        >
                                            <option value="Food">Food</option>
                                            <option value="Drinks">Drinks</option>
                                        </select>
                                    </label>
                                </div>
                                <button onClick={handleAddItem}>Save Item</button>
                            </div>
                        )}

                        {showCustomisationPopup && selectedItem && (
                            <div className="customisation-popup-overlay">
                                <div className="customisation-popup">
                                    <button className="close-popup-btn" onClick={closeCustomisationPopup}>X</button>
                                    <div className="popup-header">
                                        <h3>{selectedItem.name} <span className="edit-icon">✏️</span></h3>
                                        <p>Price: <span>${selectedItem.price.toFixed(2)}</span></p>
                                    </div>

                                    <div className="customisations-section">
                                        <h4>Customisations:</h4>
                                        <button className="add-customisation-btn" onClick={() => setIsAddingCustomisation(true)}>
                                            Add Customisation
                                        </button>

                                        {isAddingCustomisation && (
                                            <div className="add-form">
                                                <input
                                                    type="text"
                                                    placeholder="Name"
                                                    value={newCustomisationName}
                                                    onChange={(e) => setNewCustomisationName(e.target.value)}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Price"
                                                    value={newCustomisationPrice}
                                                    onChange={(e) => setNewCustomisationPrice(Number(e.target.value))}
                                                />
                                                <button onClick={handleAddCustomisation}>Save</button>
                                                <button onClick={() => setIsAddingCustomisation(false)}>Cancel</button>
                                            </div>
                                        )}

                                        <ul className="customisation-list">
                                            {selectedItem.customisations && selectedItem.customisations.map((custom) => (
                                                <li key={custom.id} className="customisation-item">
                                                    <span className="handle">☰</span>
                                                    <span className="customisation-label">{custom.name}</span>
                                                    <button className="delete-customisation-btn">
                                                        <span>-</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                        {!selectedItem.customisations || selectedItem.customisations.length === 0 && (
                                            <p>No customisations available for this item.</p>
                                        )}
                                    </div>

                                    <div className="item-info-section">
                                        <h4>Item Info:</h4>
                                        <button className="add-contaminant-btn" onClick={() => setIsAddingContaminant(true)}>
                                            Add contaminants
                                        </button>

                                        {isAddingContaminant && (
                                            <div className="add-form">
                                                <input
                                                    type="text"
                                                    placeholder="Contaminant Name"
                                                    value={newContaminantName}
                                                    onChange={(e) => setNewContaminantName(e.target.value)}
                                                />
                                                <button onClick={handleAddContaminant}>Save</button>
                                                <button onClick={() => setIsAddingContaminant(false)}>Cancel</button>
                                            </div>
                                        )}

                                        <ul className="contaminant-list">
                                            {selectedItem.contaminants && selectedItem.contaminants.map((contaminant, index) => (
                                                <li key={index} className="contaminant-item">
                                                    <span className="contaminant-label">{contaminant}</span>
                                                    <button className="delete-contaminant-btn">
                                                        <span>-</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <button className="save-btn">Save</button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {selectedOption === 'refund' && (
                    <div className="management-placeholder">
                        <h3>Initiate Refund</h3>
                    </div>
                )}
                {selectedOption === 'roster' && (
                    <div className="management-placeholder">
                        <h3>Employee Roster System</h3>
                    </div>
                )}
                {selectedOption === 'inventory' && (
                    <div className="management-placeholder">
                        <h3>Inventory System</h3>
                    </div>
                )}
            </div>

            <button className="close-btn" onClick={closeManagementWindow}>X</button>
        </div>
    );
}

export default ManagementWindow;