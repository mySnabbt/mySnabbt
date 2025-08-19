// import React from 'react';
// import './OrderSummary.css';

// function OrderSummary({ order, total, clearOrder, /*setSelectedItem, selectedItem,*/ selectedTarget, setSelectedTarget, paidAmount, leftAmount }) {
//   const isLineSelected = (line) =>
//     selectedTarget?.type === 'line' && selectedTarget.lineId === line.uniqueId;

//   const isCustomSelected = (line, cust) =>
//     selectedTarget?.type === 'custom' &&
//     selectedTarget.lineId === line.uniqueId &&
//     selectedTarget.customUid === cust.uid; // uid is added when customisations are applied

//   return (
//     <div className="h-full rounded-lg border bg-sky-200/70 p-3 flex flex-col">
//       <div className="flex items-center justify-between mb-2">
//         <h2 className="text-base font-semibold">Order Summary</h2>
//         <h4 className="font-semibold">Order Total: ${total.toFixed(2)}</h4>
//       </div>

//       <ul className="flex-1 overflow-auto pr-1 space-y-1">
//         {order.map((line) => (
//           <React.Fragment key={line.uniqueId}>
//             <li
//               onClick={() => setSelectedItem(line)}
//               className={`order-item-appearance rounded-md px-2 py-1 ${
//                 selectedItem?.uniqueId === line.uniqueId ? 'bg-teal-300/60' : 'bg-white/60'
//               } cursor-pointer`}
//             >
//               <div className="flex items-center justify-between">
//                 <span className="order-item-quantity font-medium">{line.quantity}x</span>
//                 <span className="order-item-name flex-1 px-2 truncate">{line.name}</span>
//                 <span className="order-item-total font-semibold">${line.itemTotal.toFixed(2)}</span>
//               </div>
//             </li>

//             {(line.appliedCustomisations || []).map((cust, idx) => (
//               <li
//                 key={`${line.uniqueId}-cust-${idx}`}
//                 className="ml-5 text-sm italic text-gray-700"
//               >
//                 └ {cust.name} (+${cust.price.toFixed(2)})
//               </li>
//             ))}
//           </React.Fragment>
//         ))}
//       </ul>

//       {paidAmount > 0 && (
//         <div className="mt-2 text-sm">
//           <div>Paid Amount: <strong>${paidAmount.toFixed(2)}</strong></div>
//           <div>Left Amount: <strong>${leftAmount.toFixed(2)}</strong></div>
//         </div>
//       )}

//       <div className="mt-2 flex items-center justify-between">
//         <button onClick={clearOrder} className="rounded-md bg-white px-3 py-2 border">
//           Save Sale
//         </button>
//         <h4 className="font-semibold">Total: ${total.toFixed(2)}</h4>
//       </div>
//     </div>
//   );
// }

// export default OrderSummary;
import React from 'react';
import './OrderSummary.css';

function OrderSummary({
  order,
  total,
  clearOrder,
  selectedTarget,
  setSelectedTarget,
  paidAmount,
  leftAmount,
}) {
  const isLineSelected = (line) =>
    selectedTarget?.type === 'line' && selectedTarget.lineId === line.uniqueId;

  const isCustomSelected = (line, cust) =>
    selectedTarget?.type === 'custom' &&
    selectedTarget.lineId === line.uniqueId &&
    selectedTarget.customUid === cust.uid; // uid is added when customisations are applied

  return (
    <div className="h-full rounded-lg border bg-sky-200/70 p-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold">Order Summary</h2>
        <h4 className="font-semibold">Order Total: ${total.toFixed(2)}</h4>
      </div>

      <ul className="flex-1 overflow-auto pr-1 space-y-1">
        {order.map((line) => (
          <React.Fragment key={line.uniqueId}>
            {/* LINE ITEM */}
            <li
              onClick={() =>
                setSelectedTarget({ type: 'line', lineId: line.uniqueId })
              }
              className={`order-item-appearance rounded-md px-2 py-1 cursor-pointer ${
                isLineSelected(line) ? 'bg-teal-300/60' : 'bg-white/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="order-item-quantity font-medium">
                  {line.quantity}x
                </span>
                <span className="order-item-name flex-1 px-2 truncate">
                  {line.name}
                </span>
                <span className="order-item-total font-semibold">
                  ${line.itemTotal.toFixed(2)}
                </span>
              </div>
            </li>

            {/* CUSTOMISATIONS (clickable & selectable) */}
            {(line.appliedCustomisations || []).map((cust) => (
              <li
                key={cust.uid || `${line.uniqueId}-${cust.name}-${cust.price}`}
                onClick={() =>
                  cust.uid &&
                  setSelectedTarget({
                    type: 'custom',
                    lineId: line.uniqueId,
                    customUid: cust.uid,
                  })
                }
                className={`ml-5 px-2 py-1 text-sm italic rounded cursor-pointer flex items-center justify-between ${
                  isCustomSelected(line, cust)
                    ? 'bg-teal-200'
                    : 'bg-transparent'
                } ${cust.uid ? '' : 'opacity-70 cursor-not-allowed'}`}
                title={
                  cust.uid
                    ? 'Click to select this customisation'
                    : 'This customisation was added before selection support'
                }
              >
                <span className="truncate">└ {cust.name}</span>
                <span className="shrink-0">(+${cust.price.toFixed(2)})</span>
              </li>
            ))}
          </React.Fragment>
        ))}
      </ul>

      {paidAmount > 0 && (
        <div className="mt-2 text-sm">
          <div>
            Paid Amount: <strong>${paidAmount.toFixed(2)}</strong>
          </div>
          <div>
            Left Amount: <strong>${leftAmount.toFixed(2)}</strong>
          </div>
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

