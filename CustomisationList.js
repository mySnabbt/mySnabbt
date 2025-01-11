import React from "react";
import "./CustomisationList.css";

function CustomisationList({ customisations, addCustomisationToOrder }) {
    return (
        <div className="customisation-list">
            <div className="customisation-categories">
                {customisations.map((customisation) => (
                    <button key={customisation.id} onClick={() => addCustomisationToOrder(customisation)} className="customisation-button">
                        {customisation.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default CustomisationList;