import React from 'react';
import ItemList from './ItemList';

function ItemsSection({ items, addItemToOrder }) {
    return (
        <section className="items-section">
            <h2>Items</h2>
            <ItemList items={items} addItemToOrder={addItemToOrder} />
        </section>
    );
}

export default ItemsSection;