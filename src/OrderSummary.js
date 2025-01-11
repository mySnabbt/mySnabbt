import React from 'react';
import './OrderSummary.css';

function OrderSummary({ order, total, clearOrder, setSelectedItem, selectedItem, amountGiven, paidAmount, leftAmount }) {
    
    return (
        <div className="order-summary">
            <h2>Order Summary</h2>
            <div>
                {order.map((item) => (
                    <li
                        key={item.uniqueId}
                        onClick={() => {
                            setSelectedItem(item);
                            console.log('Clicked item:', item);
                        }}
                        style={{
                            cursor: 'pointer',
                            backgroundColor: selectedItem?.uniqueId === item.uniqueId ? 'Turquoise' : 'transparent',
                        }}
                        className='order-item-appearance'
                    >
                        <span className="order-item-quantity">{item.quantity}x</span>
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-total">${item.itemTotal.toFixed(2)}</span>
                    </li>
                ))}
            </div>
            {paidAmount > 0 && (
                <div className="status">
                    <h3>Paid Amount: ${paidAmount.toFixed(2)}</h3>
                    <h3>Left Amount: ${leftAmount.toFixed(2)}</h3>
                </div>
            )}

            <div className="order-summary-divider">
                <button onClick={clearOrder}>Save Sale</button>{/*implement saveOrder function */}
                <h4>Order Total: ${total.toFixed(2)}</h4>
            </div>
            
        </div>
    );
}

export default OrderSummary;