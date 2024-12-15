import React from 'react';
import './OrderSummary.css';

function OrderSummary({ order, total, clearOrder }) {
    return (
        <div className="order-summary">
            <h2>Order Summary</h2>
            <ul>
                {order.map((item, index) => (
                    <li key={index}>
                        {item.quantity} x {item.name}: ${item.itemTotal.toFixed(2)}
                    </li>
                ))}
            </ul>
            <h3>Total: ${total.toFixed(2)}</h3>
            <button onClick={clearOrder}>Clear Order</button>
        </div>
    );
}

export default OrderSummary;
