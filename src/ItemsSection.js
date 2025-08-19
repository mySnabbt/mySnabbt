import React from 'react';
import './ItemsSection.css';
import ItemList from './ItemList';

function ItemsSection({
  items,
  order, 
  selectedCategory, // <— use this
  addItemToOrder,
  selectedItem,
  setSelectedItem,
  addCustomisationToOrder,
}) {
  // Filter by category name when a category is selected
  const filteredItems = React.useMemo(() => {
    if (!selectedCategory) return items;
    return items.filter(i =>
      (i.categoryName || '').toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [items, selectedCategory]);

  const selectedProduct = selectedItem
    ? items.find(p => p.id === selectedItem.id)
    : null;

  const availableCustomisations = selectedProduct?.customisations || [];

  return (
    <section className="h-full rounded-lg border bg-emerald-200/50 p-3 flex flex-col">
      <h2 className="text-base font-semibold mb-2 text-center">Items</h2>

      <div className="flex-1 overflow-auto pr-1">
        <ItemList
          items={filteredItems}   
          addItemToOrder={addItemToOrder}
        />
      </div>

      <div className="mt-2 rounded-md bg-emerald-300/60 px-3 py-2">
        {selectedItem ? (
          <>
            <p className="font-semibold text-center">
              Selected line: {selectedItem.name}
            </p>
            {availableCustomisations.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableCustomisations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => addCustomisationToOrder(c)}
                    className="customisation-button rounded-md border px-3 py-2 text-sm bg-white/70"
                  >
                    {c.name} (+${c.price.toFixed(2)})
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700 mt-1">
                No customisations available for this product.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-700">
            Select a line in the Order Summary to add customisations.
          </p>
        )}
      </div>
    </section>
  );
}

export default ItemsSection;
