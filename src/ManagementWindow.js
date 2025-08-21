import React, { useState, useEffect, useRef } from 'react';
import './ManagementWindow.css';
import ItemsSection from './ItemsSection';
import RefundWindow from './RefundWindow';

function ManagementWindow({ closeManagementWindow, transactions, menuItems, setMenuItems, apiBase, onLog }) {
  const [activePane, setActivePane] = React.useState(null); 

  const [selectedOption, setSelectedOption] = useState('');
  const [todaySales, setTodaySales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [salesError, setSalesError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCustomisationPopup, setShowCustomisationPopup] = useState(false);

  // Add Item
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemCategory, setNewItemCategory] = useState('Food');

  // Add Customisation / Contaminant
  const [isAddingCustomisation, setIsAddingCustomisation] = useState(false);
  const [newCustomisationName, setNewCustomisationName] = useState('');
  const [newCustomisationPrice, setNewCustomisationPrice] = useState(0);
  const [isAddingContaminant, setIsAddingContaminant] = useState(false);
  const [newContaminantName, setNewContaminantName] = useState('');
  const [editingCustomId, setEditingCustomId] = useState(null);
  const [editCustomDraft, setEditCustomDraft] = useState({ name: '', price: 0 }); 
  const [editingContamIdx, setEditingContamIdx] = useState(null);
  const [editContamDraft, setEditContamDraft] = useState('');
  const [toast, setToast] = useState(null); // { kind: 'success' | 'error', msg: string } | null

  // New state for transition
  const [isVisible, setIsVisible] = useState(false);
  const managementWindowRef = useRef(null);

  // Trigger the slide-in animation on mount
  useEffect(() => {
    setIsVisible(true);
    fetchTodaysSales();
  }, []);

  const handleClose = () => {
    setIsVisible(false); // Start the slide-out animation
    // Delay unmounting the component until the animation is complete
    setTimeout(() => {
      closeManagementWindow();
    }, 500); // Duration should match the transition-duration
  };

  const fetchTodaysSales = async () => {
    setLoading(true);
    setSalesError(null);
    try {
      const res = await fetch(`${apiBase}/api/orders/today`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTodaySales(Array.isArray(data) ? data : []);  // <= guard
      setSelectedOption('sales');
    } catch (err) {
      console.error('Error fetching today’s sales:', err);
      setSalesError('Failed to load sales data.');
      setTodaySales([]);                               // <= never store non-array
      setSelectedOption('sales');
    } finally {
      setLoading(false);
    }
  };


  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setShowCustomisationPopup(true);
  };

  const closeCustomisationPopup = () => {
    setShowCustomisationPopup(false);
    setSelectedItem(null);
  };

  const handleAddItem = async () => {
    try {
      const res = await fetch(`${apiBase}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName,
          price: Number(newItemPrice),
          categoryName: newItemCategory, // "Food" / "Drinks"
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const created = await res.json();

      setMenuItems((prev) => [...prev, created]);
      setNewItemName("");
      setNewItemPrice(0);
      setNewItemCategory("Food");
      setIsAddingItem(false);
    } catch (e) {
      console.error("Add item failed", e);
      alert("Failed to add item");
    }
  };


  const handleAddCustomisation = async () => {
    if (!selectedItem || !newCustomisationName) return;

    try {
      const res = await fetch(
        `${apiBase}/api/products/${selectedItem.id}/customisations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newCustomisationName,
            price: Number(newCustomisationPrice || 0),
          }),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const created = await res.json(); // { id, productId, name, price }

      // update menu items
      setMenuItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? {
                ...i,
                customisations: [
                  ...(i.customisations || []),
                  {
                    id: created.id,
                    name: created.name,
                    price: created.price,
                  },
                ],
              }
            : i
        )
      );

      // update selected item
      setSelectedItem((s) =>
        s && s.id === selectedItem.id
          ? {
              ...selectedItem,
              customisations: [
                ...(selectedItem.customisations || []),
                {
                  id: created.id,
                  name: created.name,
                  price: created.price,
                },
              ],
            }
          : s
      );

      setNewCustomisationName("");
      setNewCustomisationPrice(0);
      setIsAddingCustomisation(false);
    } catch (e) {
      console.error("Add customisation failed", e);
      alert("Failed to add customisation");
    }
  };


  const handleAddContaminant = () => {
    if (!selectedItem || !newContaminantName) return;
    const updatedItem = { ...selectedItem, contaminants: [...(selectedItem.contaminants || []), newContaminantName] };
    setMenuItems(menuItems.map(i => (i.id === selectedItem.id ? updatedItem : i)));
    setSelectedItem(updatedItem);
    setNewContaminantName('');
    setIsAddingContaminant(false);
  };

  // Remove a customisation by id
  const removeCustomisation = async (id) => {
    try {
      const res = await fetch(
        `${apiBase}/api/products/${selectedItem.id}/customisations/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok && res.status !== 204) {
        throw new Error(await res.text());
      }

      // update menu items
      setMenuItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? {
                ...i,
                customisations: (i.customisations || []).filter(
                  (c) => c.id !== id
                ),
              }
            : i
        )
      );

      // update selected item
      setSelectedItem((i) =>
        i && i.id === selectedItem.id
          ? {
              ...i,
              customisations: (i.customisations || []).filter(
                (c) => c.id !== id
              ),
            }
          : i
      );
    } catch (e) {
      console.error("Delete customisation failed", e);
      alert("Failed to delete customisation");
    }
  };


  // Save edit for a customisation
  const saveEditCustomisation = async () => {
    try {
      const res = await fetch(
        `${apiBase}/api/products/${selectedItem.id}/customisations/${editingCustomId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editCustomDraft.name,
            price: Number(editCustomDraft.price),
          }),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const updated = await res.json();

      // update menu items
      setMenuItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? {
                ...i,
                customisations: (i.customisations || []).map((c) =>
                  c.id === updated.id
                    ? { id: updated.id, name: updated.name, price: updated.price }
                    : c
                ),
              }
            : i
        )
      );

      // update selected item
      setSelectedItem((i) =>
        i && i.id === selectedItem.id
          ? {
              ...i,
              customisations: (i.customisations || []).map((c) =>
                c.id === updated.id ? { ...updated } : c
              ),
            }
          : i
      );

      setEditingCustomId(null);
      setEditCustomDraft({ name: "", price: 0 });
    } catch (e) {
      console.error("Update customisation failed", e);
      alert("Failed to update customisation");
    }
  };

  // replace your current handlePopupSave
  const handlePopupSave = async () => {
    try {
      // If the "Add Customisation" inline form is open and has a value, commit it
      if (isAddingCustomisation && newCustomisationName.trim()) {
        await (async () => {
          const res = await fetch(`${apiBase}/api/products/${selectedItem.id}/customisations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newCustomisationName,
              price: Number(newCustomisationPrice || 0),
            }),
          });
          if (!res.ok) throw new Error(await res.text());
        })();
      }

      // (Optional) If you also support contaminants and the add form is open:
      if (isAddingContaminant && newContaminantName.trim()) {
        await (async () => {
          const res = await fetch(`${apiBase}/api/products/${selectedItem.id}/contaminants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newContaminantName }),
          });
          if (!res.ok) throw new Error(await res.text());
        })();
      }

      // Refresh products so ItemsSection sees the latest customisations
      await refetchProducts();

      // Reset inline editors + close popup
      setIsAddingCustomisation(false);
      setNewCustomisationName('');
      setNewCustomisationPrice(0);

      setIsAddingContaminant(false);
      setNewContaminantName('');

      setEditingCustomId(null);
      setEditingContamIdx(null);

      setShowCustomisationPopup(false);
      setSelectedItem(null);
      setSelectedOption('editMenu');

      // Toast
      setToast({ kind: 'success', msg: 'Item changes saved' });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      console.error('Save popup failed', e);
      setToast({ kind: 'error', msg: 'Failed to save changes' });
      setTimeout(() => setToast(null), 3000);
    }
  };


  // Remove a contaminant by index
  const removeContaminant = (idx) => {
    const updated = {
      ...selectedItem,
      contaminants: (selectedItem.contaminants || []).filter((_, i) => i !== idx),
    };
    setMenuItems(menuItems.map(i => i.id === selectedItem.id ? updated : i));
    setSelectedItem(updated);
  };

  // Save edit for a contaminant
  const saveEditContaminant = () => {
    const updated = {
      ...selectedItem,
      contaminants: (selectedItem.contaminants || []).map((n, i) =>
        i === editingContamIdx ? editContamDraft : n
      ),
    };
    setMenuItems(menuItems.map(i => i.id === selectedItem.id ? updated : i));
    setSelectedItem(updated);
    setEditingContamIdx(null);
    setEditContamDraft('');
  };

  // inside ManagementWindow
  const refetchProducts = async () => {
    try {
      const res = await fetch(`${apiBase}/api/products`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setMenuItems(Array.isArray(json.items) ? json.items : []);
    } catch (e) {
      console.error('refresh products failed', e);
    }
  };


  const filteredItems = selectedCategory
  ? menuItems.filter(item => item.categoryName === selectedCategory)
  : menuItems;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Panel container aligned to the right, overlapping Categories and Items */}
      <div 
        ref={managementWindowRef}
        className={`absolute top-[56px] right-3 bottom-3 flex gap-3 transition-transform duration-1000 ease-out transform ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar (overlaps Categories column) */}
        <aside className="w-72 rounded-lg bg-white shadow border p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Management</h3>
            <button
              className="rounded-md border px-2 py-1 text-sm"
              onClick={handleClose}
              aria-label="Close management window"
            >
              Close
            </button>
          </div>

          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setSelectedOption('editMenu')}
                className={`w-full text-left rounded-md border px-3 py-2 ${selectedOption === 'editMenu' ? 'bg-gray-100' : ''}`}
              >
                Edit Menu
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setSelectedOption('refund');
                  setActivePane('refund');
                }}
                className={`w-full text-left rounded-md border px-3 py-2 ${selectedOption === 'refund' ? 'bg-gray-100' : ''}`}
              >
                Initiate Refund
              </button>
            </li>
            <li>
              <button
                onClick={fetchTodaysSales}
                className={`w-full text-left rounded-md border px-3 py-2 ${selectedOption === 'sales' ? 'bg-gray-100' : ''}`}
              >
                Show Sales Today
              </button>
            </li>
          </ul>

          <h4 className="mt-4 text-sm font-semibold">Administrator options</h4>
          <ul className="mt-2 space-y-2">
            <li>
              <button
                onClick={() => setSelectedOption('roster')}
                className={`w-full text-left rounded-md border px-3 py-2 ${selectedOption === 'roster' ? 'bg-gray-100' : ''}`}
              >
                Employee Roster System
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedOption('inventory')}
                className={`w-full text-left rounded-md border px-3 py-2 ${selectedOption === 'inventory' ? 'bg-gray-100' : ''}`}
              >
                Inventory System
              </button>
            </li>
          </ul>
        </aside>

        {/* Main panel (overlaps Items section) */}
        <main className="w-[min(900px,60vw)] rounded-lg border bg-sky-200 p-4 shadow flex flex-col">
          {/* Default placeholder */}
          {selectedOption === '' && (
            <div className="flex-1 grid place-items-center text-gray-700">
              <p>Select an option from the sidebar.</p>
            </div>
          )}

          {/* Sales Today */}
          {selectedOption === 'sales' && (
            <div className="flex-1 overflow-auto">
              <h3 className="text-lg font-semibold mb-3">Transactions</h3>
              {loading ? (
                <p>Loading...</p>
              ) : salesError ? (
                <p className="text-red-600">{salesError}</p>
              ) : !Array.isArray(todaySales) || todaySales.length === 0 ? (
                <p>No sales made today.</p>
              ) : (
                <div className="space-y-3">
                  {todaySales.map(txn => (
                      <div key={txn.order_id} className="rounded-md bg-white p-3 shadow border">
                      <h4 className="font-semibold">Transaction #{txn.order_id}</h4>
                      <ul className="mt-2 text-sm list-disc list-inside">
                        {txn.items?.map((item, idx) => (
                          <li key={idx}>
                            Product ID: {item.product_id}, Quantity: {item.quantity}, Price Each: ${item.price_each}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 flex items-center justify-between">
                        <span>Revenue Generated:</span>
                        <strong>${Number(txn.total).toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button className="mt-4 rounded-md border bg-white px-3 py-2">Print Sales Report Made Today</button>
            </div>
          )}

          {/* Edit Menu */}
          {selectedOption === 'editMenu' && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setIsAddingItem(true)} className="rounded-md border bg-white px-3 py-2">Add Item</button>
                <button onClick={() => setSelectedCategory('Food')} className="rounded-md border bg-white px-3 py-2">Food</button>
                <button onClick={() => setSelectedCategory('Drinks')} className="rounded-md border bg-white px-3 py-2">Drinks</button>
                <button onClick={() => setSelectedCategory('')} className="rounded-md border bg-white px-3 py-2">All</button>
              </div>

              <div className="flex-1 overflow-auto rounded-md border bg-white p-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      className={`text-left rounded-md border px-3 py-2 ${selectedItem?.id === item.id ? 'bg-gray-100' : ''}`}
                    >
                      {item.name} - ${Number(item.price).toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button className="rounded-md border bg-white px-3 py-2">Export PDF</button>
                <button className="rounded-md border bg-white px-3 py-2">Publish Menu</button>
              </div>

              {/* Add Item popup */}
              {isAddingItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setIsAddingItem(false)} />
                  <div className="relative z-[61] w-[min(520px,90vw)] rounded-lg border bg-white p-4 shadow">
                    <button className="absolute right-3 top-3 rounded-md border px-2 py-1 text-sm" onClick={() => setIsAddingItem(false)}>X</button>
                    <h3 className="text-lg font-semibold mb-3">Add New Item</h3>
                    <div className="grid gap-3">
                      <label className="text-sm">
                        Item Name:
                        <input
                          type="text"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          className="mt-1 w-full rounded-md border px-2 py-1"
                        />
                      </label>
                      <label className="text-sm">
                        Price:
                        <input
                          type="number"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(e.target.value)}
                          className="mt-1 w-full rounded-md border px-2 py-1"
                        />
                      </label>
                      <label className="text-sm">
                        Category:
                        <select
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value)}
                          className="mt-1 w-full rounded-md border px-2 py-1"
                        >
                          <option value="Food">Food</option>
                          <option value="Drinks">Drinks</option>
                        </select>
                      </label>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button className="rounded-md border px-3 py-2" onClick={() => setIsAddingItem(false)}>Cancel</button>
                      <button className="rounded-md bg-gray-900 text-white px-3 py-2" onClick={handleAddItem}>Save Item</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Customisation popup */}
              {showCustomisationPopup && selectedItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={closeCustomisationPopup} />
                  <div className="relative z-[61] w-[min(720px,95vw)] rounded-lg border bg-white p-4 shadow">
                    <button className="absolute right-3 top-3 rounded-md border px-2 py-1 text-sm" onClick={closeCustomisationPopup}>X</button>

                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {selectedItem.name} <span className="text-sm opacity-70">(Price: ${Number(selectedItem.price).toFixed(2)})</span>
                      </h3>
                    </div>

                    <div className="mt-4 grid gap-6 md:grid-cols-2">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Customisations</h4>
                          <button
                            className="rounded-md border bg-white px-3 py-1 text-sm"
                            onClick={() => setIsAddingCustomisation(true)}
                          >
                            Add
                          </button>
                        </div>

                        {isAddingCustomisation && (
                          <div className="mb-4">
                            <div className="grid gap-2 md:grid-cols-[1fr_140px]">
                              <input
                                type="text"
                                placeholder="Name"
                                value={newCustomisationName}
                                onChange={(e) => setNewCustomisationName(e.target.value)}
                                className="rounded-md border px-2 py-1"
                                autoFocus
                              />
                              <input
                                type="number"
                                placeholder="0"
                                value={newCustomisationPrice}
                                onChange={(e) => setNewCustomisationPrice(e.target.value)}
                                className="rounded-md border px-2 py-1"
                              />
                            </div>
                            {/* Buttons BELOW the fields */}
                            <div className="mt-2 flex gap-2">
                              <button
                                className="rounded-md bg-gray-900 text-white px-3 py-1"
                                onClick={handlePopupSave}
                              >
                                Save
                              </button>
                              <button
                                className="rounded-md border px-3 py-1"
                                onClick={() => {
                                  setIsAddingCustomisation(false);
                                  setNewCustomisationName('');
                                  setNewCustomisationPrice(0);
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        <ul className="rounded-md border divide-y">
                          {(selectedItem.customisations || []).map((c) => (
                            <li key={c.id} className="px-3 py-2">
                              {editingCustomId === c.id ? (
                                <>
                                  <div className="grid gap-2 md:grid-cols-[1fr_160px]">
                                    <input
                                      type="text"
                                      value={editCustomDraft.name}
                                      onChange={(e) => setEditCustomDraft(d => ({ ...d, name: e.target.value }))}
                                      className="rounded-md border px-2 py-1"
                                      autoFocus
                                    />
                                    <input
                                      type="number"
                                      value={editCustomDraft.price}
                                      onChange={(e) => setEditCustomDraft(d => ({ ...d, price: e.target.value }))}
                                      className="rounded-md border px-2 py-1"
                                    />
                                  </div>
                                  {/* Buttons BELOW fields */}
                                  <div className="mt-2 flex gap-2">
                                    <button className="rounded-md bg-gray-900 text-white px-3 py-1" onClick={saveEditCustomisation}>
                                      Save
                                    </button>
                                    <button
                                      className="rounded-md border px-3 py-1"
                                      onClick={() => { setEditingCustomId(null); setEditCustomDraft({ name: '', price: 0 }); }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <span>{c.name}</span>
                                    <span className="text-sm opacity-70">${Number(c.price).toFixed(2)}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      className="rounded-md border px-2 py-1 text-sm"
                                      onClick={() => { setEditingCustomId(c.id); setEditCustomDraft({ name: c.name, price: c.price }); }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="rounded-md border px-2 py-1 text-sm"
                                      onClick={() => removeCustomisation(c.id)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                          {(!selectedItem.customisations || selectedItem.customisations.length === 0) && (
                            <li className="px-3 py-2 text-sm text-gray-600">No customisations.</li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Contaminants</h4>
                          <button
                            className="rounded-md border bg-white px-3 py-1 text-sm"
                            onClick={() => setIsAddingContaminant(true)}
                          >
                            Add
                          </button>
                        </div>

                        {isAddingContaminant && (
                          <div className="mb-4">
                            <input
                              type="text"
                              placeholder="Contaminant Name"
                              value={newContaminantName}
                              onChange={(e) => setNewContaminantName(e.target.value)}
                              className="w-full rounded-md border px-2 py-1"
                              autoFocus
                            />
                            {/* Buttons BELOW the field */}
                            <div className="mt-2 flex gap-2">
                              <button className="rounded-md bg-gray-900 text-white px-3 py-1" onClick={handleAddContaminant}>
                                Save
                              </button>
                              <button
                                className="rounded-md border px-3 py-1"
                                onClick={() => { setIsAddingContaminant(false); setNewContaminantName(''); }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        <ul className="rounded-md border divide-y">
                          {(selectedItem.contaminants || []).map((name, idx) => (
                            <li key={idx} className="px-3 py-2">
                              {editingContamIdx === idx ? (
                                <>
                                  <input
                                    type="text"
                                    value={editContamDraft}
                                    onChange={(e) => setEditContamDraft(e.target.value)}
                                    className="w-full rounded-md border px-2 py-1"
                                    autoFocus
                                  />
                                  {/* Buttons BELOW field */}
                                  <div className="mt-2 flex gap-2">
                                    <button className="rounded-md bg-gray-900 text-white px-3 py-1" onClick={saveEditContaminant}>
                                      Save
                                    </button>
                                    <button
                                      className="rounded-md border px-3 py-1"
                                      onClick={() => { setEditingContamIdx(null); setEditContamDraft(''); }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center justify-between gap-3">
                                  <span>{name}</span>
                                  <div className="flex gap-2">
                                    <button
                                      className="rounded-md border px-2 py-1 text-sm"
                                      onClick={() => { setEditingContamIdx(idx); setEditContamDraft(name); }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="rounded-md border px-2 py-1 text-sm"
                                      onClick={() => removeContaminant(idx)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                          {(!selectedItem.contaminants || selectedItem.contaminants.length === 0) && (
                            <li className="px-3 py-2 text-sm text-gray-600">No contaminants.</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                      {/* <button className="rounded-md border px-3 py-2" onClick={closeCustomisationPopup}>Close</button> */}
                      <button className="rounded-md bg-gray-900 text-white px-3 py-2">Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Placeholders for other sections */}
          {selectedOption === 'refund' && (
            <div className="flex-1 rounded-lg bg-sky-200/60 border p-3">
              {activePane === 'refund' ? (
                <RefundWindow
                  apiBase={apiBase}      // from props you passed in App.js
                  onLog={onLog}          // from props you passed in App.js
                  transactions={todaySales}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-600">
                  Select a tool on the left
                </div>
              )}
            </div>
          )}
          {selectedOption === 'roster' && (
            <div className="flex-1 grid place-items-center text-gray-700">
              <h3>Employee Roster System</h3>
            </div>
          )}
          {selectedOption === 'inventory' && (
            <div className="flex-1 grid place-items-center text-gray-700">
              <h3>Inventory System</h3>
            </div>
          )}
        </main>
      </div>
      {toast?.kind === 'success' && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed top-16 right-4 z-[100] rounded-md bg-green-600 text-white px-4 py-3 shadow-lg"
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default ManagementWindow;