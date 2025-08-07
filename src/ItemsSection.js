import React from 'react';
import './ItemsSection.css';
import ItemList from './ItemList';
import { customisations } from './CustomData';

function ItemsSection({ items, addItemToOrder, selectedItem, setSelectedItem, addCustomisationToOrder }) {
    const getCustomisations = () => {
        if (!selectedItem) return [];

        if (selectedItem.id >= 1000 && selectedItem.id < 2000) {
            // Drinks
            return customisations.filter(c => c.id >= 20000 && c.id <= 20003);
        } else if (selectedItem.id >= 2000 && selectedItem.id < 4000) {
            // Snacks and Meals
            return customisations.filter(c => c.id >= 10000 && c.id <= 10003);
        }

        return [];
    };

    const relatedCustomisations = getCustomisations();

    return (
        <section className="items-section">
            <h2>Items</h2>
            <div className="items-list">
                <ItemList
                    items={items}
                    addItemToOrder={addItemToOrder}
                    setSelectedItem={setSelectedItem}
                />
            </div>

            <div className="customise-item">
                {selectedItem ? (
                    <>
                        <p><strong>Selected:</strong> {selectedItem.name}</p>
                        {relatedCustomisations.length > 0 ? (
                            relatedCustomisations.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => addCustomisationToOrder(c)}
                                    className="customisation-button"
                                >
                                    {c.name} (+${c.price.toFixed(2)})
                                </button>
                            ))
                        ) : (
                            <p>No customisations available</p>
                        )}
                    </>
                ) : (
                    <p>No item selected</p>
                )}
            </div>
        </section>
    );
}

export default ItemsSection;