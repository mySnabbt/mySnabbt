import React from 'react';
import './ItemList.css';

function ItemList({ items, addItemToOrder, setSelectedItem }) {
    return (
        <div>
            {items.map(item => (
                <button
                    key={item.id}
                    onClick={() => {
                        addItemToOrder(item);
                        setSelectedItem(item);
                    }}
                >
                    {item.name}
                </button>
            ))}
        </div>
    );
}

export default ItemList;
