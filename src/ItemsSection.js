import React from 'react';
import './ItemsSection.css';
import ItemList from './ItemList';

function ItemsSection({ items, addItemToOrder, selectedItem, setSelectedItem }) {
    return (
        <section className="items-section">
            <h2>Items</h2>
            <div className = 'items-list'>
                <ItemList items={items} addItemToOrder={addItemToOrder} />
            </div>
            <div className="customise-item">
                {selectedItem ? <p>Selected: {selectedItem}</p> : <p>No item selected</p>}
            </div>
        </section>
    );
}

export default ItemsSection;