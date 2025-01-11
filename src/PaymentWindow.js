import React, { useState } from 'react';
import './PaymentWindow.css';
import Keypad from './Keypad';

function PaymentWindow({ closePaymentWindow, total, updatePaymentDetails }) {
    const [Cash, setCash] = useState(true);
    const [Card, setCard] = useState(false);
    const [amountGiven, setAmountGiven] = useState(0);
    const [isSplitPayment, setIsSplitPayment] = useState(false);
    const [isFullPayment, setIsFullPayment] = useState(false);
    const [status, setStatus] = useState(false);
    const [tick, setTick] = useState(false);
    
    const orderTotal= total;
    const change = amountGiven - orderTotal ;
    const paidAmount = amountGiven;
    const leftAmount = orderTotal - amountGiven;

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

    const handleSplitPaymentClick = () => {
        setIsSplitPayment(true);
        setIsFullPayment(false);
    };

    const handleTick = () => {
        setTick(true);
        setStatus(true);
        updatePaymentDetails({ paidAmount, leftAmount: Math.max(leftAmount, 0) });
    }

    const handleClick = () => {
        if (tick===true) {
            closePaymentWindow();
        }
        setTick(false);
        setStatus(true);
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
                        <h3>${orderTotal}</h3>
                        <div class name = "card-options">
                            <button onClick={handleFullPaymentClick} className = "full-button"> Pay in full</button>
                            <button onClick={handleSplitPaymentClick} className="keypad-button"> Split Payment </button>
                        </div>
                        {isFullPayment && (
                            <div className="full-pop-up">
                                <button> Payment Status </button>
                                <div className='card-full-box'>
                                    <h3> Payment Amount:</h3>
                                    <input
                                        type = "number"
                                        value = {amountGiven}
                                        onChange={(e) => setAmountGiven(Number(e.target.value))} 
                                    />
                                </div>
                                <div className='card-full-box'>
                                    <button> Cancel </button>
                                    <button> Retry </button>
                                    <button> Payment Receipt </button>
                                </div>
                            </div>
                        )}
                        {isSplitPayment && (
                            <><h3> Amount to be paid: </h3><Keypad
                                    quantity={amountGiven}
                                    setQuantity={setAmountGiven} /></>
                        )}

                        <div className="Change">
                            <h3>Paid Amount: {amountGiven}</h3>
                        </div>
                        
                    </div>
                    <div className="frame-2">
                        <button onClick={closePaymentWindow} className='close-button'> X </button>
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