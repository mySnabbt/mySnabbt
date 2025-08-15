import React, { useState } from 'react';
import './PaymentWindow.css';
import Keypad from './Keypad';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PaymentWindow({ closePaymentWindow, total, order, updatePaymentDetails, logTransaction }) {
  // UI state
  const [mode, setMode] = useState('cash');
  const [amountGiven, setAmountGiven] = useState('0');
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [isFullPayment, setIsFullPayment] = useState(false);
  const [tick, setTick] = useState(false);
  const [status, setStatus] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState('Unpaid');

  const [retry, setRetry] = useState(0);

  const numericAmountGiven = parseFloat(amountGiven || '0') || 0;
  const orderTotal = Number(total) || 0;
  const change = numericAmountGiven - orderTotal;
  const paidAmount = numericAmountGiven;
  const leftAmount = orderTotal - numericAmountGiven;

  const groupItems = (lines) => {
    return lines.reduce((acc, line) => {
      const existing = acc.find((i) => i.productId === line.id);
      if (existing) {
        existing.quantity += line.quantity;
      } else {
        acc.push({
          productId: line.id,
          quantity: line.quantity,
          priceEach: line.price
        });
      }
      return acc;
    }, []);
  };

  const handleConfirmCash = async () => {
    if (numericAmountGiven < orderTotal) {
      alert('Cash given is less than total. Please collect full amount.');
      return;
    }

    const items = groupItems(order);
    const body = {
      customerId: 1, // or null if you don't track walk-ins
      items,
      total: orderTotal,
      status: 'PAID', // mark paid when cash confirmed
      payment: {
        method: 'CASH',
        amountTendered: numericAmountGiven,
        change: Math.max(change, 0),
        amount: orderTotal // amount actually applied to the order
      }
    };

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to create order');
      }

      const data = await res.json(); // { orderId }

      updatePaymentDetails({ paidAmount: orderTotal, leftAmount: 0 });
      logTransaction(order, orderTotal);
      setPaymentStatus('Paid');
      setTick(true);
      setStatus(true);

      // Close and pass meta for the toast
      closePaymentWindow(true, true, {
        orderId: data?.orderId,
        method: 'CASH',
        change: Math.max(change, 0),
        amountTendered: numericAmountGiven,
        total: orderTotal
      });

    } catch (err) {
      console.error('Cash payment failed:', err);
      alert('Failed to finalise cash sale. Please try again.');
    }
  };

  const handleClose = () => {
    // Only clears in parent when tick/status reflect a successful payment
    closePaymentWindow(tick, status);
    setTick(false);
  };

  // Card actions
  const handleFullPaymentClick = () => {
    setIsSplitPayment(false);
    setIsFullPayment(true);
  };

  const handleSplitPaymentClick = () => {
    setIsFullPayment(false);
    setIsSplitPayment(true);
  };

  const handleProcessCard = () => {
    // Simulate success
    setPaymentStatus('Paid');
    updatePaymentDetails({ paidAmount: orderTotal, leftAmount: 0 });
    logTransaction(order, orderTotal);
    setStatus(true);
  };

  const handleCancelCard = () => {
    setPaymentStatus('Transaction Cancelled');
    setIsFullPayment(false);
    if (retry === 1) handleClose();
  };

  const handleRetry = () => {
    if (paymentStatus === 'Transaction Declined') {
      setRetry(1);
    }
  };

  const handleSimulateDecline = () => {
    setPaymentStatus('Transaction Declined');
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Two-panel container, aligned right (over Categories) + center (over Items) */}
      <div className="absolute top-[56px] right-3 bottom-3 flex gap-3">
        {/* LEFT: Payment Operations (overlaps Items section) */}
        <section className="w-[min(900px,60vw)] rounded-lg border bg-white p-4 shadow flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Payment</h2>
            <button className="rounded-md border px-2 py-1 text-sm" onClick={handleClose} aria-label="Close payment window">
              Close
            </button>
          </div>

          <div className="mt-1 text-sm text-gray-600">
            Order Total: <strong>${orderTotal.toFixed(2)}</strong>
          </div>

          {/* Mode-specific operations */}
          {mode === 'cash' ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  Cash Amount Given
                  <input
                    type="text"
                    value={amountGiven}
                    onChange={(e) => setAmountGiven(e.target.value)}
                    className="mt-1 w-full rounded-md border px-2 py-2"
                  />
                </label>
                <Keypad
                  quantity={amountGiven}
                  setQuantity={setAmountGiven}
                  decimal={true}
                />
                <button
                  onClick={handleConfirmCash}
                  className="w-full rounded-md bg-gray-900 text-white px-3 py-2"
                >
                  Confirm Cash
                </button>
              </div>

              <div className="rounded-md border p-3 bg-sky-50">
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="flex items-center justify-between py-1">
                  <span>Paid Amount</span>
                  <strong>${paidAmount.toFixed(2)}</strong>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Change</span>
                  <strong>${change >= 0 ? change.toFixed(2) : '0.00'}</strong>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Amount Left</span>
                  <strong>${Math.max(leftAmount, 0).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-md border p-3 bg-sky-50">
                <div className="text-sm">Order Total</div>
                <div className="text-2xl font-semibold">${orderTotal.toFixed(2)}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button onClick={handleFullPaymentClick} className="rounded-md border bg-white px-3 py-2">
                  Pay in full
                </button>
                <button onClick={handleSplitPaymentClick} className="rounded-md border bg-white px-3 py-2">
                  Split payment
                </button>
              </div>

              {isFullPayment && (
                <div className="rounded-md border p-3">
                  <div className="text-sm mb-2">Payment Amount</div>
                  <input
                    type="text"
                    readOnly
                    value={orderTotal.toFixed(2)}
                    className="w-full rounded-md border px-2 py-2"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button onClick={handleProcessCard} className="rounded-md bg-gray-900 text-white px-3 py-2">
                      Process
                    </button>
                    <button onClick={handleCancelCard} className="rounded-md border px-3 py-2">
                      Cancel
                    </button>
                    <button onClick={handleRetry} className="rounded-md border px-3 py-2">
                      Retry
                    </button>
                    <button onClick={handleSimulateDecline} className="rounded-md border px-3 py-2">
                      Simulate Decline
                    </button>
                    <div className="ml-auto text-sm">
                      Status: <strong>{paymentStatus}</strong>
                    </div>
                  </div>
                </div>
              )}

              {isSplitPayment && (
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-sm mb-1">Enter Partial Amount</div>
                    <Keypad
                      quantity={amountGiven}
                      setQuantity={setAmountGiven}
                      decimal={true}
                    />
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="flex items-center justify-between py-1">
                      <span>Paid So Far</span>
                      <strong>${paidAmount.toFixed(2)}</strong>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span>Remaining</span>
                      <strong>${Math.max(leftAmount, 0).toFixed(2)}</strong>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={handleProcessCard} className="rounded-md bg-gray-900 text-white px-3 py-2">
                        Process Part
                      </button>
                      <button onClick={handleCancelCard} className="rounded-md border px-3 py-2">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* RIGHT: Payment Options (overlaps Categories section) */}
        <aside className="w-72 rounded-lg border bg-white p-3 shadow flex flex-col">
          <h3 className="font-semibold mb-2">Payment Options</h3>

          <div className="grid grid-cols-2 gap-2">
            <button
              className={`rounded-md border px-3 py-2 ${mode === 'cash' ? 'bg-gray-100' : ''}`}
              onClick={() => setMode('cash')}
            >
              Cash
            </button>
            <button
              className={`rounded-md border px-3 py-2 ${mode === 'card' ? 'bg-gray-100' : ''}`}
              onClick={() => setMode('card')}
            >
              Card
            </button>
          </div>

          <div className="mt-3 grid gap-2">
            <button className="rounded-md border bg-white px-3 py-2">Voucher Entry</button>
            <button className="rounded-md border bg-white px-3 py-2">Print Receipt</button>
            <button className="rounded-md border bg-white px-3 py-2">Email Receipt</button>
          </div>

          <div className="mt-auto pt-3 border-t">
            <div className="text-sm text-gray-600">Close this window when done.</div>
            <button onClick={handleClose} className="mt-2 w-full rounded-md bg-gray-900 text-white px-3 py-2">
              Close Payment
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PaymentWindow;
