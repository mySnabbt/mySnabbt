import React from 'react';
import POSController from './POSController';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="app-header">
                <h1>Snabbt POS</h1>
                <div className="username">Welcome, UserName</div>
            </header>
            <main className="main-layout">
                <section className="categories-section">
                    <h2>Categories</h2>
                    <ul>
                        <li>Drinks</li>
                        <li>Snacks</li>
                        <li>Meals</li>
                        {/* Add more categories as needed */}
                    </ul>
                    <div className="admin-options">
                        <h3>Administrator Options</h3>
                        <button>Edit Menu</button>
                        {/* <button>View Reports</button> */}
                        <button>Initiate Refund</button>
                        <button>Sales Made Today</button>
                        <button>Print Sales Report Made Today</button>
                    </div>
                </section>
                <POSController />
                {/* <section className="admin-section">
                    <h3>Administrator Options</h3>
                    <button>Edit Menu</button>
                    <button>Initiate Refund</button>
                    <button>Sales Made Today</button>
                </section> */}
                {/* <POSController /> */}
            </main>
        </div>
    );
}

export default App;
