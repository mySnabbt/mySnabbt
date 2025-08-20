// import React, { useMemo, useState, useEffect } from "react";

// // shadcn/ui imports (assumes shadcn is set up in your project)
// // import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Separator } from "@/components/ui/separator";
// import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
// import { Button } from './components/ui/button'
// import { Input } from './components/ui/input'
// import { Label } from './components/ui/label'
// import { Separator } from './components/ui/separator'

// // A tiny keypad you can reuse
// function Keypad({ onPress, onOk, disabled }) {
//   const keys = ["1","2","3","4","5","6","7","8","9","0"];
//   return (
//     <div className="flex flex-col gap-2">
//       <div className="grid grid-cols-3 gap-2">
//         {keys.slice(0,9).map(k => (
//           <Button key={k} type="button" variant="secondary" disabled={disabled}
//             onClick={() => onPress(k)} className="h-12 text-lg">
//             {k}
//           </Button>
//         ))}
//         <Button type="button" variant="secondary" disabled={disabled}
//           onClick={() => onPress("0")} className="col-span-2 h-12 text-lg">
//           0
//         </Button>
//         <Button type="button" disabled={disabled} onClick={onOk} className="h-12 text-lg">
//           ✓
//         </Button>
//       </div>
//     </div>
//   );
// }

// /**
//  * Props:
//  * - transactions: [{ id, createdAt: ISO string, items:[...], total:number, ... }]
//  * - onLog: (message: string) => void   // optional: for success logging
//  */
// export default function RefundWindow({ transactions = [], onLog }) {
//     console.log('RefundWindow received transactions:', transactions);
//   // ---- date defaults to today (yyyy-mm-dd for <input type="date">)
//   const todayStr = useMemo(() => {
//     const d = new Date();
//     const pad = (n) => String(n).padStart(2, "0");
//     return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
//   }, []);
//   const [date, setDate] = useState(todayStr);

//   // ---- selection / flow state
//   const [selectedTxn, setSelectedTxn] = useState(null);
//   const [mode, setMode] = useState(null);               // 'full' | 'partial'
//   const [amountStr, setAmountStr] = useState("");       // typed with keypad
//   const [amountOk, setAmountOk] = useState(false);      // partial confirmed
//   const [method, setMethod] = useState(null);           // 'cash' | 'card'
//   const [cardBusy, setCardBusy] = useState(false);
//   const [cardDone, setCardDone] = useState(false);
//   const [cashConfirm, setCashConfirm] = useState(false);
//   const [success, setSuccess] = useState("");

//   // Reset right side when switching transaction/date
//   useEffect(() => {
//     setSelectedTxn(null);
//     setMode(null);
//     setAmountStr("");
//     setAmountOk(false);
//     setMethod(null);
//     setCardBusy(false);
//     setCardDone(false);
//     setCashConfirm(false);
//     setSuccess("");
//   }, [date]);

//   // ---- filter transactions by chosen date (local date match)
//   const dayTxns = useMemo(() => {
//     if (!date) return [];
//     const y = Number(date.slice(0,4));
//     const m = Number(date.slice(5,7)) - 1;
//     const d = Number(date.slice(8,10));
//     const start = new Date(y, m, d, 0, 0, 0, 0).getTime();
//     const end   = new Date(y, m, d, 23, 59, 59, 999).getTime();

//     return transactions.filter(t => {
//     //   const ts = new Date(t.createdAt ?? t.id).getTime(); // fallback if needed
//         const ts = new Date(t.order_date).getTime();
//       return ts >= start && ts <= end;
//     });
//   }, [transactions, date]);

//   // ---- helpers
//   const currency = (n) => `$${Number(n ?? 0).toFixed(2)}`;

//   const handleKeypadPress = (k) => {
//     // Plain number entry for amount (no decimals management for brevity;
//     // if you want cents, swap to a cents-string pattern)
//     const next = (amountStr + k).replace(/[^\d]/g, "");
//     setAmountStr(next);
//   };

//   const parsedAmount = useMemo(() => Number(amountStr || 0), [amountStr]);

//   const confirmPartialAmount = () => {
//     if (!selectedTxn) return;
//     if (parsedAmount <= 0) return;
//     if (parsedAmount > selectedTxn.total) return;
//     setAmountOk(true);
//   };

//   const finishSuccess = (how, amt) => {
//     const msg = `Refund ${how} successful: Transaction #${selectedTxn.id} — ${currency(amt)}.`;
//     setSuccess(msg);
//     onLog?.(msg);
//   };

//   const startCardFlow = async (amt) => {
//     setCardBusy(true);
//     setCardDone(false);
//     setSuccess("");
//     // fake delay to mimic processing
//     setTimeout(() => {
//       setCardBusy(false);
//       setCardDone(true);
//       finishSuccess("by card", amt);
//     }, 1400);
//   };

//   const handleFullRefund = () => {
//     setMode("full");
//     setAmountStr(String(Math.round((selectedTxn?.total ?? 0) * 100) / 100));
//     setAmountOk(true); // full refund has known amount immediately
//     setSuccess("");
//     setMethod(null);
//     setCardBusy(false);
//     setCardDone(false);
//     setCashConfirm(false);
//   };

//   const handlePartialRefund = () => {
//     setMode("partial");
//     setAmountStr("");
//     setAmountOk(false);
//     setSuccess("");
//     setMethod(null);
//     setCardBusy(false);
//     setCardDone(false);
//     setCashConfirm(false);
//   };

//   const amountToRefund = amountOk ? parsedAmount : 0;

//   return (
//     <div className="h-full w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
//       {/* LEFT: date + transactions list */}
//       <Card className="bg-sky-200/40">
//         <CardHeader>
//           <CardTitle className="text-lg">Select Transaction to Refund</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="refund-date">Date</Label>
//             <Input
//               id="refund-date"
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               className="max-w-xs"
//             />
//           </div>

//           <Separator />

//           <div className="max-h-[60vh] overflow-auto rounded-md border bg-white">
//             {dayTxns.length === 0 ? (
//               <div className="p-4 text-sm text-gray-600">No transactions found for this date.</div>
//             ) : (
//               <ul className="divide-y">
//                 {dayTxns.map((t) => (
//                   <li key={t.id}>
//                     <button
//                       type="button"
//                       onClick={() => setSelectedTxn(t)}
//                       className={`w-full text-left px-3 py-2 hover:bg-sky-50 ${
//                         selectedTxn?.id === t.id ? "bg-sky-100" : ""
//                       }`}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="font-medium">Transaction #{t.id}</div>
//                         <div className="font-semibold">{currency(t.total)}</div>
//                       </div>
//                       <div className="text-xs text-gray-600">
//                         {new Date(t.createdAt ?? t.id).toLocaleString()}
//                       </div>
//                       {Array.isArray(t.items) && t.items.length > 0 && (
//                         <ul className="mt-1 ml-4 list-disc text-sm text-gray-700">
//                           {t.items.map((i, idx) => (
//                             <li key={idx}>
//                               {i.name ?? `Product ${i.productId}`} — Qty {i.quantity} @ {currency(i.priceEach)}
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* RIGHT: hidden until a transaction is selected */}
//       <Card className={`bg-sky-200/40 ${!selectedTxn ? "opacity-40 pointer-events-none" : ""}`}>
//         <CardHeader>
//           <CardTitle className="text-lg">Refund Actions</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {!selectedTxn ? (
//             <div className="text-sm text-gray-700">Select a transaction to continue.</div>
//           ) : (
//             <>
//               <div className="text-sm">
//                 <div className="font-medium">
//                   Selected: #{selectedTxn.id} — {currency(selectedTxn.total)}
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <Button variant={mode === "full" ? "default" : "secondary"} onClick={handleFullRefund}>
//                   Full Refund
//                 </Button>
//                 <Button variant={mode === "partial" ? "default" : "secondary"} onClick={handlePartialRefund}>
//                   Partial Refund
//                 </Button>
//               </div>

//               {/* PARTIAL controls */}
//               {mode === "partial" && (
//                 <div className="space-y-2">
//                   <Label>Enter Amount</Label>
//                   <Input
//                     inputMode="numeric"
//                     value={amountStr}
//                     onChange={(e) => setAmountStr(e.target.value.replace(/[^\d]/g, ""))}
//                     placeholder="Amount"
//                     className="max-w-xs"
//                   />
//                   <Keypad
//                     disabled={amountOk}
//                     onPress={handleKeypadPress}
//                     onOk={confirmPartialAmount}
//                   />
//                   <div className="text-xs text-gray-600">
//                     Max: {currency(selectedTxn.total)} &nbsp;|&nbsp; Current: {currency(parsedAmount)}
//                   </div>
//                   {amountOk ? (
//                     <div className="text-green-700 text-sm">Refunded : {currency(parsedAmount)}</div>
//                   ) : (
//                     <div className="text-gray-700 text-sm">Press ✓ to confirm the amount.</div>
//                   )}
//                 </div>
//               )}

//               {/* METHOD selection appears once we know the amount (full or confirmed partial) */}
//               {(mode === "full" || amountOk) && (
//                 <>
//                   <Separator />
//                   <div className="space-y-2">
//                     <div className="font-medium">Refund Method:</div>
//                     <div className="grid grid-cols-2 gap-3">
//                       <Button
//                         variant={method === "cash" ? "default" : "secondary"}
//                         onClick={() => { setMethod("cash"); setCardBusy(false); setCardDone(false); setSuccess(""); }}
//                       >
//                         Cash
//                       </Button>
//                       <Button
//                         variant={method === "card" ? "default" : "secondary"}
//                         onClick={() => { setMethod("card"); setCashConfirm(false); setSuccess(""); }}
//                       >
//                         Card
//                       </Button>
//                     </div>
//                   </div>

//                   {/* CASH branch */}
//                   {method === "cash" && (
//                     <div className="space-y-2">
//                       <Button
//                         onClick={() => {
//                           setCashConfirm(true);
//                           finishSuccess("in cash", amountToRefund);
//                         }}
//                       >
//                         Cash OK?
//                       </Button>
//                     </div>
//                   )}

//                   {/* CARD branch */}
//                   {method === "card" && (
//                     <div className="space-y-2">
//                       <Button
//                         disabled={cardBusy || cardDone}
//                         onClick={() => startCardFlow(amountToRefund)}
//                       >
//                         {cardBusy ? "Initiating refund…" : cardDone ? "Refund completed" : "Start card refund"}
//                       </Button>
//                     </div>
//                   )}
//                 </>
//               )}

//               {success && (
//                 <>
//                   <Separator />
//                   <div className="text-sm text-green-700">{success}</div>
//                 </>
//               )}
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import React, { useMemo, useState, useEffect } from "react";

// shadcn/ui imports (assumes shadcn is set up in your project)
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Separator } from './components/ui/separator'

// A tiny keypad you can reuse
function Keypad({ onPress, onOk, disabled }) {
  const keys = ["1","2","3","4","5","6","7","8","9","0"];
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {keys.slice(0,9).map(k => (
          <Button key={k} type="button" variant="secondary" disabled={disabled}
            onClick={() => onPress(k)} className="h-12 text-lg">
            {k}
          </Button>
        ))}
        <Button type="button" variant="secondary" disabled={disabled}
          onClick={() => onPress("0")} className="col-span-2 h-12 text-lg">
          0
        </Button>
        <Button type="button" disabled={disabled} onClick={onOk} className="h-12 text-lg">
          ✓
        </Button>
      </div>
    </div>
  );
}

/**
 * Props:
 * - transactions: [{ id, createdAt: ISO string, items:[...], total:number, ... }]
 * - onLog: (message: string) => void   // optional: for success logging
 */
export default function RefundWindow({ transactions = [], onLog }) {
    console.log('RefundWindow received transactions:', transactions);
  // ---- date defaults to today (yyyy-mm-dd for <input type="date">)
  const todayStr = useMemo(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }, []);
  const [date, setDate] = useState(todayStr);

  // ---- selection / flow state
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [mode, setMode] = useState(null);               // 'full' | 'partial'
  const [amountStr, setAmountStr] = useState("");       // typed with keypad
  const [amountOk, setAmountOk] = useState(false);      // partial confirmed
  const [method, setMethod] = useState(null);           // 'cash' | 'card'
  const [cardBusy, setCardBusy] = useState(false);
  const [cardDone, setCardDone] = useState(false);
  const [cashConfirm, setCashConfirm] = useState(false);
  const [success, setSuccess] = useState("");

  // Reset right side when switching transaction/date
  useEffect(() => {
    setSelectedTxn(null);
    setMode(null);
    setAmountStr("");
    setAmountOk(false);
    setMethod(null);
    setCardBusy(false);
    setCardDone(false);
    setCashConfirm(false);
    setSuccess("");
  }, [date]);

  // ---- filter transactions by chosen date (local date match)
  const dayTxns = useMemo(() => {
    if (!date) return [];
    const y = Number(date.slice(0,4));
    const m = Number(date.slice(5,7)) - 1;
    const d = Number(date.slice(8,10));
    const start = new Date(y, m, d, 0, 0, 0, 0).getTime();
    const end   = new Date(y, m, d, 23, 59, 59, 999).getTime();

    return transactions.filter(t => {
        const ts = new Date(t.order_date).getTime();
        return ts >= start && ts <= end;
    });
  }, [transactions, date]);

  // ---- helpers
  const currency = (n) => `$${Number(n ?? 0).toFixed(2)}`;

  const handleKeypadPress = (k) => {
    // Plain number entry for amount (no decimals management for brevity;
    // if you want cents, swap to a cents-string pattern)
    const next = (amountStr + k).replace(/[^\d]/g, "");
    setAmountStr(next);
  };

  const parsedAmount = useMemo(() => Number(amountStr || 0), [amountStr]);

  const confirmPartialAmount = () => {
    if (!selectedTxn) return;
    if (parsedAmount <= 0) return;
    if (parsedAmount > selectedTxn.total) return;
    setAmountOk(true);
  };

  const finishSuccess = (how, amt) => {
    const msg = `Refund ${how} successful: Txn #${selectedTxn.order_id || selectedTxn.id} — ${currency(amt)}.`;
    setSuccess(msg);
    onLog?.(msg);
  };

  const startCardFlow = async (amt) => {
    setCardBusy(true);
    setCardDone(false);
    setSuccess("");
    // fake delay to mimic processing
    setTimeout(() => {
      setCardBusy(false);
      setCardDone(true);
      finishSuccess("by card", amt);
    }, 1400);
  };

  const handleFullRefund = () => {
    setMode("full");
    setAmountStr(String(Math.round((selectedTxn?.total ?? 0) * 100) / 100));
    setAmountOk(true); // full refund has known amount immediately
    setSuccess("");
    setMethod(null);
    setCardBusy(false);
    setCardDone(false);
    setCashConfirm(false);
  };

  const handlePartialRefund = () => {
    setMode("partial");
    setAmountStr("");
    setAmountOk(false);
    setSuccess("");
    setMethod(null);
    setCardBusy(false);
    setCardDone(false);
    setCashConfirm(false);
  };

  const amountToRefund = amountOk ? parsedAmount : 0;

  return (
    <div className="h-full w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
      {/* LEFT: date + transactions list */}
      <Card className="bg-sky-200/40">
        <CardHeader>
          <CardTitle className="text-lg">Select Transaction to Refund</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="refund-date">Date</Label>
            {/* START REVISED: date input with calendar icon */}
            <div className="relative max-w-xs">
                <Input
                    id="refund-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-8"
                />
                {/* SVG for the calendar icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                  <line x1="16" x2="16" y1="2" y2="6"></line>
                  <line x1="8" x2="8" y1="2" y2="6"></line>
                  <line x1="3" x2="21" y1="10" y2="10"></line>
                </svg>
            </div>
            {/* END REVISED */}
          </div>

          <Separator />

          {/* START REVISED: transaction list width to match date field */}
          <div className="max-h-[60vh] overflow-auto rounded-md border bg-white">
            {dayTxns.length === 0 ? (
              <div className="p-4 text-sm text-gray-600">No transactions found for this date.</div>
            ) : (
              <ul className="divide-y">
                {dayTxns.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedTxn(t)}
                      className={`w-full text-left px-3 py-2 hover:bg-sky-50 ${
                        selectedTxn?.id === t.id ? "bg-sky-100" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {/* START REVISED: display transaction number */}
                        <div className="font-medium">Transaction #<span className="font-bold">{t.order_id || t.id}</span></div>
                        <div className="font-semibold">{currency(t.total)}</div>
                        {/* END REVISED */}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(t.order_date).toLocaleString()}
                      </div>
                      {Array.isArray(t.items) && t.items.length > 0 && (
                        <ul className="mt-1 ml-4 list-disc text-sm text-gray-700">
                          {t.items.map((i, idx) => (
                            <li key={idx}>
                              {i.name ?? `Product ${i.product_id}`} — Qty {i.quantity} @ {currency(i.price_each)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* END REVISED */}
        </CardContent>
      </Card>

      {/* RIGHT: hidden until a transaction is selected */}
      <Card className={`bg-sky-200/40 ${!selectedTxn ? "opacity-40 pointer-events-none" : ""}`}>
        <CardHeader>
          <CardTitle className="text-lg">Refund Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedTxn ? (
            <div className="text-sm text-gray-700">Select a transaction to continue.</div>
          ) : (
            <>
              <div className="text-sm">
                <div className="font-medium">
                  Selected: #{selectedTxn.order_id || selectedTxn.id} — {currency(selectedTxn.total)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant={mode === "full" ? "default" : "secondary"} onClick={handleFullRefund}>
                  Full Refund
                </Button>
                <Button variant={mode === "partial" ? "default" : "secondary"} onClick={handlePartialRefund}>
                  Partial Refund
                </Button>
              </div>

              {/* PARTIAL controls */}
              {mode === "partial" && (
                <div className="space-y-2">
                  <Label>Enter Amount</Label>
                  <Input
                    inputMode="numeric"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="Amount"
                    className="max-w-xs"
                  />
                  <Keypad
                    disabled={amountOk}
                    onPress={handleKeypadPress}
                    onOk={confirmPartialAmount}
                  />
                  <div className="text-xs text-gray-600">
                    Max: {currency(selectedTxn.total)} &nbsp;|&nbsp; Current: {currency(parsedAmount)}
                  </div>
                  {amountOk ? (
                    <div className="text-green-700 text-sm">Amount locked: {currency(parsedAmount)}</div>
                  ) : (
                    <div className="text-gray-700 text-sm">Press ✓ to confirm the amount.</div>
                  )}
                </div>
              )}

              {/* METHOD selection appears once we know the amount (full or confirmed partial) */}
              {(mode === "full" || amountOk) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="font-medium">Refund Method:</div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={method === "cash" ? "default" : "secondary"}
                        onClick={() => { setMethod("cash"); setCardBusy(false); setCardDone(false); setSuccess(""); }}
                      >
                        Cash
                      </Button>
                      <Button
                        variant={method === "card" ? "default" : "secondary"}
                        onClick={() => { setMethod("card"); setCashConfirm(false); setSuccess(""); }}
                      >
                        Card
                      </Button>
                    </div>
                  </div>

                  {/* CASH branch */}
                  {method === "cash" && (
                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          setCashConfirm(true);
                          finishSuccess("in cash", amountToRefund);
                        }}
                      >
                        Cash OK?
                      </Button>
                    </div>
                  )}

                  {/* CARD branch */}
                  {method === "card" && (
                    <div className="space-y-2">
                      <Button
                        disabled={cardBusy || cardDone}
                        onClick={() => startCardFlow(amountToRefund)}
                      >
                        {cardBusy ? "Initiating refund…" : cardDone ? "Refund completed" : "Start card refund"}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {success && (
                <>
                  <Separator />
                  <div className="text-sm text-green-700">{success}</div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}