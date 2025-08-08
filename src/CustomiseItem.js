import React from "react";
import "./CustomiseItem.css";

function CustomiseItem({ selectedItem }) {
  return (
    <div className="customise-item">
      {selectedItem ? `Customise ${selectedItem.name}` : "Select an item"}
    </div>
  );
}

export default CustomiseItem;
