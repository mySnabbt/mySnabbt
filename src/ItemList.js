import React from 'react';
import './ItemList.css';

function ItemList({ items, addItemToOrder }) {
    return (
        <div className="item-list">
            <h2>Menu Items</h2>
            {items.map((item) => (
                <button key={item.id} onClick={() => addItemToOrder(item)} className="item-button">
                    {item.name} - ${item.price}
                </button>
            ))}
        </div>
    );
}

export default ItemList;
