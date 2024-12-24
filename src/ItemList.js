import React from 'react';
import './ItemList.css';

function ItemList({ items, addItemToOrder }) {
    return (
        <div className="item-list">
            <div className="item-categories">
                {items.map((item) => (
                    <button key={item.id} onClick={() => addItemToOrder(item)} className="item-button">
                        {/* {item.name} - ${item.price} */}
                        {item.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default ItemList;
