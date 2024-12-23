// import React, { useState } from 'react';
// import ItemList from './ItemList';
// import OrderSummary from './OrderSummary';
// import Keypad from './Keypad';
// import './POSController.css';

// function POSController() {
//     const [items] = useState([
//         { id: 1, name: 'Water', price: 1.5 },
//         { id: 2, name: 'Soda', price: 2.0 },
//         { id: 3, name: 'Juice', price: 2.5 },
//         { id: 4, name: 'Energy Drink', price: 3.0 }
//     ]);
//     const [order, setOrder] = useState([]);
//     const [total, setTotal] = useState(0);
//     const [quantity, setQuantity] = useState(1); // Default quantity is 1

//     const addItemToOrder = (item) => {
//         const selectedQuantity = quantity === 0 ? 1 : quantity;
//         const itemTotal = item.price * selectedQuantity;

//         setOrder([...order, { ...item, quantity: selectedQuantity, itemTotal }]);
//         setTotal(total + itemTotal);

//         setQuantity(1); // Reset quantity
//     };

//     const clearOrder = () => {
//         setOrder([]);
//         setTotal(0);
//     };

//     return (
//         <div className="pos-controller">
//             <section className="items-section">
//                 <h2>Items</h2>
//                 <ItemList items={items} addItemToOrder={addItemToOrder} />
//             </section>
//             <section className="order-summary-section">
//                 <h2>Order Summary Terminal</h2>
//                 <OrderSummary order={order} total={total} clearOrder={clearOrder} />
//                 <div className="quantity-input">
//                     <label>Quantity: </label>
//                     <input
//                         type="number"
//                         value={quantity}
//                         onChange={(e) => setQuantity(Number(e.target.value))}
//                     />
//                 </div>
//                 <Keypad quantity={quantity} setQuantity={setQuantity} />
//             </section>
//         </div>
//     );
// }

// export default POSController;
