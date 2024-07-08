// src/components/Dropdown.tsx
import React from "react";

const Dropdown = ({ results }) => {
  return (
    <ul className="mt-2 border border-gray-300 rounded shadow-lg">
      {results.map((result, index) => (
        <li key={index} className="p-2 hover:bg-gray-100">
          {result}
        </li>
      ))}
    </ul>
  );
};

export default Dropdown;
