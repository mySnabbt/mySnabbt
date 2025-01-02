    import React from 'react';
    import './OrderSummary.css';

    function OrderSummary({ order, total, clearOrder, setSelectedItem, selectedItem }) {
        return (
            <div className="order-summary">
                <h2>Order Summary</h2>
                <ul>
                    {order.map((item, index) => (
                        <li
                            key={`${item.id}-${index}`}
                            onClick={() => {
                                setSelectedItem(item);
                                console.log('Clicked item:', item);
                            }}
                            style={{
                                cursor: 'pointer',
                                backgroundColor: selectedItem?.id === item.id ? 'Red' : 'transparent',
                            }}
                            className='order-item-appearance'
                        >
                            <span className="order-item-quantity">{item.quantity}x</span>
                            <span className="order-item-name">{item.name}</span>
                            <span className="order-item-total">${item.itemTotal.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="order-summary-divider">
                    <button onClick={clearOrder}>Save Sale</button>{/*implement saveOrder function */}
                    <h4>Order Total: ${total.toFixed(2)}</h4>
                </div>
                
            </div>
        );
    }

    export default OrderSummary;