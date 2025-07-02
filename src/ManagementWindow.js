import React, { useState } from 'react';
import './ManagementWindow.css';


function ManagementWindow({ closeManagementWindow, transactions }) {
    const [selectedOption, setSelectedOption] = useState('');
    const [todaySales, setTodaySales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [salesError, setSalesError] = useState(null);

    const fetchTodaysSales = async () => {
        setLoading(true);
        setSalesError(null);
        try {
            const response = await fetch('http://localhost:5000/api/orders/today');
            const data = await response.json();
            setTodaySales(data);
            setSelectedOption('sales'); // Switch to 'sales' view
        } catch (error) {
            console.error('Error fetching today’s sales:', error);
            setSalesError('Failed to load sales data.');
        } finally {
            setLoading(false);
        }
    };


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
                    <div className="management-placeholder">
                    </div>
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
                    <div className="management-placeholder">
                        <h3>Edit Menu</h3>
                    </div>
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
