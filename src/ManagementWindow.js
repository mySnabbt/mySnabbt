import React, { useState } from 'react';
import './ManagementWindow.css';

function ManagementWindow({ closeManagementWindow, transactions }) {
    const [selectedOption, setSelectedOption] = useState('');

    return (
        <div className="management-fullscreen">
            <div className="management-sidebar">
                <h3>Management Window</h3>
                <ul className="management-options">
                    <li onClick={() => setSelectedOption('editMenu')}>Edit Menu</li>
                    <li onClick={() => setSelectedOption('refund')}>Initiate Refund</li>
                    <li onClick={() => setSelectedOption('sales')}>Sales Made Today</li>
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
                        {transactions.length === 0 ? (
                            <p>No sales made today.</p>
                        ) : (
                            transactions.map((txn, index) => (
                                <div key={txn.id} className="transaction-card">
                                    <h4>Transaction {index + 1}</h4>
                                    {txn.items.map(item => (
                                        <div className="transaction-item" key={item.uniqueId}>
                                            <div>
                                                {item.name}<br />
                                                <small>{item.description || ''}</small>
                                            </div>
                                            <span>${item.itemTotal.toFixed(2)}</span>
                                        </div>
                                    ))}
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
