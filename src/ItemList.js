function ItemList({ items, addItemToOrder /*, setSelectedItem*/ }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          className="h-16 rounded-md border px-3 text-sm text-left bg-white/70"
          onClick={() => {
            addItemToOrder(item);
            // Do not call setSelectedItem(item); selection is done from OrderSummary
          }}
        >
          <div className="font-medium truncate">{item.name}</div>
          <div className="text-xs opacity-70">${item.price.toFixed(2)}</div>
        </button>
      ))}
    </div>
  );
}
export default ItemList;
