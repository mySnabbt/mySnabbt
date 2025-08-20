import React, { useState } from 'react';
import './OrderSummary.css';

function OrderSummary({ order, total, clearOrder, setSelectedItem, selectedItem, paidAmount, leftAmount }) {
  const [customisationSelected, setCustomisationSelected] = useState(null);
  const isLineSelected = (line) => 
    // selectedItem?.uniqueId === line.uniqueId;
    selectedItem?.type === 'line' && selectedItem.lineId === line.uniqueId;

   const isCustomSelected = (line, cust) =>
    // customisationSelected &&
    // customisationSelected.lineId === line.uniqueId &&
    // customisationSelected.uid === (cust.uid ?? `${cust.name}-${cust.price}`);
    selectedItem?.type === 'custom' &&
    selectedItem.lineId === line.uniqueId &&
    selectedItem.customUid === (cust.uid ?? `${cust.name}-${cust.price}`);

    
  // const manageCustomisation = () => {
  //   setCustomisationSelected(true);
  //   customisationSelected = cust.name  
  // };
  const manageCustomisation = (line, cust) => {
    setCustomisationSelected({
      lineId: line.uniqueId,
      uid: cust.uid ?? `${cust.name}-${cust.price}`,
      name: cust.name,
    });
  };

  // const isLineSelected = (line) =>
  //   selectedItem?.type === 'line' && selectedItem.lineId === line.uniqueId;

  // const isCustomSelected = (line, cust) =>
  //   selectedItem?.type === 'custom' &&
  //   selectedItem.lineId === line.uniqueId &&
  //   selectedItem.customUid === cust.uid; // uid is added when customisations are applied

  return (
    <div className="h-full rounded-lg border bg-sky-200/70 p-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold">Order Summary</h2>
        <h4 className="font-semibold">Order Total: ${total.toFixed(2)}</h4>
      </div>

      <ul className="flex-1 overflow-auto pr-1 space-y-1">
        {order.map((line) => (
          <React.Fragment key={line.uniqueId}>
            <li
              // onClick={() => setSelectedItem(line)}
              // className={`order-item-appearance rounded-md px-2 py-1 ${
              //   selectedItem?.uniqueId === line.uniqueId ? 'bg-teal-300/60' : 'bg-white/60'
              // } cursor-pointer`}
              onClick={() => {
                // setSelectedItem(line);
                setSelectedItem({ type: 'line', lineId: line.uniqueId });
                setCustomisationSelected(null); // clear when switching lines
              }}
              className={`order-item-appearance rounded-md px-2 py-1 cursor-pointer ${
                isLineSelected(line) ? 'bg-teal-300/60' : 'bg-white/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="order-item-quantity font-medium">{line.quantity}x</span>
                <span className="order-item-name flex-1 px-2 truncate">{line.name}</span>
                <span className="order-item-total font-semibold">${line.itemTotal.toFixed(2)}</span>
              </div>
            </li>

            {/* {(line.appliedCustomisations || []).map((cust, idx) => {
              const selected = isCustomSelected(line, cust);
              return (
                <li key={`${line.uniqueId}-cust-${cust.uid ?? idx}`} className="ml-5">
                  <button
                    type="button"
                    onClick={() => manageCustomisation(line, cust)}   // <-- pass args, no ()
                    className={`w-full text-left text-sm italic rounded px-2 py-1 flex items-center justify-between ${
                      selected ? 'bg-teal-200' : 'bg-transparent hover:bg-teal-100'
                    }`}
                    title="Select this customisation"
                  >
                    <span className="truncate">└ {cust.name}</span>
                    <span className="shrink-0">(+${Number(cust.price).toFixed(2)})</span>
                  </button>
                </li>
              );
            })} */}
            {/* {(line.appliedCustomisations || []).map((cust) => {
              const key = cust.uid || `${line.uniqueId}-${cust.name}-${cust.price}`;
              const selected = isCustomSelected(line, cust);

              return (
                <li key={key} className="ml-5">
                  <button
                    type="button"
                    onClick={(line, cust) =>
                      setCustomisationSelected({
                        lineId: line.uniqueId,
                        uid: cust.uid ?? `${cust.name}-${cust.price}`,
                        name: cust.name,
                      })
                    }
                    aria-pressed={selected}
                    className={`w-full text-left text-sm italic rounded px-2 py-1 flex items-center justify-between ${
                      selected ? 'bg-teal-200' : 'bg-transparent hover:bg-teal-100'
                    }`}
                    title="Select this customisation"
                  >
                    <span className="truncate">└ {cust.name}</span>
                    <span className="shrink-0">(+${Number(cust.price).toFixed(2)})</span>
                  </button>
                </li>
              );
            })} */}
            {(line.appliedCustomisations || []).map((cust, idx) => {
              const key = cust.uid || `${line.uniqueId}-${cust.name}-${cust.price}-${idx}`;
              const selected = isCustomSelected(line, cust);

              return (
                <li key={key} className="ml-5">
                  <button
                    type="button"
                    // onClick={() => manageCustomisation(line, cust)}   // <-- fix: close over line & cust
                    onClick={() =>
                      setSelectedItem({
                        type: 'custom',
                        lineId: line.uniqueId,
                        customUid: cust.uid ?? `${cust.name}-${cust.price}`,
                      })
                    }
                    aria-pressed={selected}
                    className={`w-full text-left text-sm italic rounded px-2 py-1 flex items-center justify-between ${
                      selected ? 'bg-teal-200' : 'bg-transparent hover:bg-teal-100'
                    }`}
                    title="Select this customisation"
                  >
                    <span className="truncate">└ {cust.name}</span>
                    <span className="shrink-0">(+${Number(cust.price).toFixed(2)})</span>
                  </button>
                </li>
              );
            })}
          </React.Fragment>
        ))}
      </ul>

      {paidAmount > 0 && (
        <div className="mt-2 text-sm">
          <div>Paid Amount: <strong>${paidAmount.toFixed(2)}</strong></div>
          <div>Left Amount: <strong>${leftAmount.toFixed(2)}</strong></div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <button onClick={clearOrder} className="rounded-md bg-white px-3 py-2 border">
          Save Sale
        </button>
        <h4 className="font-semibold">Total: ${total.toFixed(2)}</h4>
      </div>
    </div>
  );
}

export default OrderSummary;