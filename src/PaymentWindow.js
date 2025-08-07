import React, { useState } from 'react';
import './PaymentWindow.css';
import Keypad from './Keypad';

function PaymentWindow({ closePaymentWindow, total, order, updatePaymentDetails, logTransaction }) {
    const [Cash, setCash] = useState(true);
    const [Card, setCard] = useState(false);
    const [amountGiven, setAmountGiven] = useState(0);
    const [isSplitPayment, setIsSplitPayment] = useState(false);
    const [isFullPayment, setIsFullPayment] = useState(false);
    const [status, setStatus] = useState(false);
    const [tick, setTick] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('Unpaid');
    const [transactionStatus, setTransactionStatus] = useState(null); // New state for transaction status
    const [declineStatus, setDeclineStatus] = useState(null); //To simulate a declined transaction
    const [retry, setRetry] = useState(0);
    
    // const orderTotal= total;
    // const change = amountGiven - orderTotal ;
    // const paidAmount = amountGiven;
    // const leftAmount = orderTotal - amountGiven;
    // const numericAmountGiven = parseFloat(amountGiven) || 0;
    const numericAmountGiven = parseFloat(amountGiven) || 0; // If parsing fails (e.g., amountGiven is '.'), default to 0

    const orderTotal = total;
    const change = numericAmountGiven - orderTotal;
    const paidAmount = numericAmountGiven; // paidAmount is now guaranteed to be a number
    const leftAmount = orderTotal - numericAmountGiven;

    const openCardWindow = () => {
        setCard(true);
        setCash(false);
    }

    const openCashWindow = () => {
        setCard(false);
        setCash(true);
    }

    const handleFullPaymentClick = () => {
        setIsSplitPayment(false);
        setIsFullPayment(true);
    };

    const handlePaymentStatus = () => {
        setPaymentStatus(true);
        logTransaction(order, total)
        setAmountGiven(orderTotal);
        updatePaymentDetails({ paidAmount, leftAmount: Math.max(leftAmount, 0) });
        setTransactionStatus(null);
        setIsFullPayment(false);
        setStatus(true);
    }

    const handleCancel = () => {
        // setPaymentStatus(false);
        setPaymentStatus('Transaction Cancelled');
        setIsFullPayment(false);
        if (retry===1) {
            closePaymentWindow();
        }
    }

    const handleRetry = () => {
        if (paymentStatus === 'Transaction Declined') {
            setRetry(1);
        }
    }

    const handleSimulateDecline = () => {
        setPaymentStatus('Transaction Declined');
        setTransactionStatus(null);
    }

    const handleSplitPaymentClick = () => {
        setIsSplitPayment(true);
        setIsFullPayment(false);
    };

    const handleTick = () => {
        setTick(true);
        setStatus(true);
        updatePaymentDetails({ paidAmount, leftAmount: Math.max(leftAmount, 0) });
        logTransaction(order, total);
    }

    const handleClick = () => {
        // if (tick===true) {
        //     closePaymentWindow();
        // }
        closePaymentWindow(tick, status);
        setTick(false);
        //setStatus(true);
        // if (setTick == true) {
        //     updatePaymentDetails({ paidAmount: 0, leftAmount: 0 });
        // }
    }

    return (
        <div className="payment-window">
            {Cash ? (
                <section className="payment-section">
                    <div className="frame-1">
                        <h3>Cash Amount Given:</h3>
                        <input
                                type="number"
                                value = {amountGiven}
                                onChange={(e) => setAmountGiven(Number(e.target.value))}
                        />
                        <Keypad 
                            quantity={amountGiven}
                            setQuantity={setAmountGiven}
                            decimal={true}
                        />
                        <button onClick = {handleTick} className = "summary-status"> ✓ </button>
                        <div className="Change">
                            <h3>Change: ${change >= 0 ? change.toFixed(2) : '0.00'}</h3>
                        </div>
                    </div>
                    <div className="frame-2">
                        <button onClick={handleClick} className='close-button'> X </button>
                        <h2>Payment Options</h2>
                        <button onClick={openCashWindow} className='option'> Cash </button>
                        <button onClick={openCardWindow} className='option'> Credit/Debit Card </button>
                        <button>Voucher Entry</button>
                    </div>
                </section> 
            ) : (
                <section className="payment-section">
                    <div className="frame-11">
                        <h3>Order Total: ${orderTotal}</h3>
                        <div class name = "card-options">
                            <button onClick={handleFullPaymentClick} className = "full-button"> Pay in full</button>
                            <button onClick={handleSplitPaymentClick} className="keypad-button"> Split Payment </button>
                        </div>
                        {isFullPayment && (
                            <div className="full-pop-up">
                                <button onClick={handlePaymentStatus} className='b'> Payment Status : </button>
                                <h3> {paymentStatus}</h3>
                                <div className='card-full-box'>
                                    <h3> Payment Amount:</h3>
                                    <input
                                        // type = "number"
                                        type = "text"
                                        value = {leftAmount}
                                        onChange={(e) => setAmountGiven(Number(e.target.value))} 
                                    />
                                </div>
                                <div className='card-full-box'>
                                    <button onClick ={handleCancel}> Cancel </button>
                                    <button onClick ={handleRetry}> Retry </button>
                                    <button> Print Receipt </button>
                                    <button onClick ={handleSimulateDecline}> decline </button>
                                </div>
                            </div>
                        )}
                        {isSplitPayment && (
                            <><h3> Amount to be paid: ${paidAmount}</h3><Keypad
                                    quantity={amountGiven}
                                    setQuantity={setAmountGiven} 

                                    /></>
                        )}

                        <div className="Change">
                            <h3>Paid Amount: ${paidAmount}</h3>
                        </div>
                        
                    </div>
                    <div className="frame-2">
                        <button onClick={() => closePaymentWindow(tick, status)} className='close-button'> X </button>
                        <h2>Payment Options</h2>
                        <button onClick={openCashWindow} className='method'> Cash </button>
                        <button onClick={openCardWindow} className='method'> Credit/Debit Card </button>
                        <button>Voucher Entry</button>
                    </div>
                </section>
                
            )}
            
        </div>
    );
}

export default PaymentWindow;